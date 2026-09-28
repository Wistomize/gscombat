import { performance } from 'node:perf_hooks'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { cpus } from 'node:os'
import { evaluateScenario, evaluateScenarioAnalysis } from '../../../packages/analyzer/dist/index.js'
import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario, listCombatMetrics } from '../../../packages/content/dist/index.js'
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from '../../../packages/game-data/dist/index.js'

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const build = (characterId, weaponId, constellation = 0) => ({
  ...structuredClone(raidenNationalBuiltinBuild), buildId: `benchmark.${characterId}`, characterId,
  level: 90, ascension: 6, constellation, talents: { normal: 10, skill: 10, burst: 10 },
  weapon: { weaponId, refinement: 1, level: 90, ascension: 6 }
})
const conditions = { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: 'maximum_reachable' }
const scenarios = {
  ordinary: structuredClone(raidenNationalBuiltinScenario),
  lunar: { ...structuredClone(raidenNationalBuiltinScenario), primary: build('Flins', 'FavoniusLance'),
    teammates: [build('Xingqiu', 'FavoniusSword')], externalBuffs: [], conditions,
    targetActionId: listCombatMetrics().find(m => m.characterId === 'Flins' && m.kind === 'damage')?.actionId },
  stellar: { ...structuredClone(raidenNationalBuiltinScenario), primary: build('YumemizukiMizuki', 'FavoniusCodex', 6),
    teammates: [build('Odette', 'FavoniusSword'), build('Faruzan', 'FavoniusWarbow', 6), build('Diona', 'FavoniusWarbow', 6)],
    externalBuffs: [], conditions, targetActionId: 'yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl' }
}
const samples = {}
if (process.argv.includes('--deferred')) {
  await runDeferred()
  db.close()
} else try {
  for (const [name, scene] of Object.entries(scenarios)) {
    evaluateScenario(scene, db)
    const single = [], full = []
    let damage, candidates
    for (let i = 0; i < 5; i++) {
      let start = performance.now()
      damage = evaluateScenario(scene, db).actionExpectedDamage
      single.push(performance.now() - start)
      start = performance.now()
      candidates = evaluateScenarioAnalysis(scene, db).analysis.weapons.length
      full.push(performance.now() - start)
    }
    samples[name] = { damage, candidates, singleMs: single, fullMs: full }
  }
  console.log(JSON.stringify({ node: process.version, cpu: cpus()[0]?.model,
    snapshot: createHash('sha256').update(readFileSync(DEFAULT_GAME_DATA_PATH)).digest('hex'), samples }, null, 2))
} finally { db.close() }

async function runDeferred() {
  const { buildApp } = await import('../../../apps/api/dist/app.js')
  const { EquipmentComparisonSession } = await import('../../../packages/analyzer/dist/index.js')
  const { explainArtifactPreparations } = await import('../../../packages/analyzer/dist/index.js')
  const { serializeAnalysisResponse } = await import('../../../apps/api/dist/serializers/analysis.js')
  const { AnalysisRequestSchema, AnalysisResponseSchema } = await import('../../../packages/contracts/dist/index.js')
  const { listArtifactComparisonSets } = await import('../../../packages/content/dist/index.js')
  const app = buildApp()
  app.post('/benchmark-core', { schema: { body: AnalysisRequestSchema, response: { 200: AnalysisResponseSchema } } }, async ({ body }) => {
    const { evaluation, analysis } = evaluateScenarioAnalysis(body, db, { deferEquipmentComparisons: true })
    return { ...serializeAnalysisResponse(evaluation, analysis), artifactPreparations: explainArtifactPreparations(body, db, evaluation.appliedEffects) }
  })
  const post = async (url, body) => {
    const response = await app.inject({ method: 'POST', url, body })
    if (response.statusCode !== 200) throw new Error(`${url}: ${response.body}`)
    return response.json()
  }
  const quantiles = values => {
    const sorted = [...values].sort((a,b) => a-b)
    return { p50: sorted[Math.floor(sorted.length * .5)], p95: sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * .95))] }
  }
  const sampleCount = process.argv.includes('--core-only') ? 64 : 16
  const output = { node: process.version, cpu: cpus()[0]?.model, sampleCount, scenes: {}, load: [] }
  try {
    for (const [name, scenario] of Object.entries(scenarios)) {
      // Warm compiled paths and fixed declarations, not the scenario response cache.
      new EquipmentComparisonSession(scenario, db).core()
      for (let warm = 0; warm < 3; warm++) {
        const scene = { ...scenario, primary: { ...scenario.primary, label: `warm.${name}.${warm}` } }
        await post('/benchmark-core', scene)
        await post('/v1/analysis/core', scene)
      }
      const direct = [], core = []
      for (let i = 0; i < sampleCount; i++) {
        const scene = { ...scenario, primary: { ...scenario.primary, label: `benchmark.${name}.${i}` } }
        const jobs = [['/benchmark-core', direct], ['/v1/analysis/core', core]]
        if (i % 2) jobs.reverse()
        for (const [path, timings] of jobs) {
          const start = performance.now()
          await post(path, scene)
          timings.push(performance.now() - start)
        }
      }
      if (process.argv.includes('--core-only')) {
        output.scenes[name] = { directCore: quantiles(direct), httpCore: quantiles(core),
          ...(process.argv.includes('--raw-samples') ? { directSamples: direct, coreSamples: core } : {}) }
        console.error(`${name}: complete`)
        continue
      }
      const response = await post('/v1/analysis/core', scenario)
      let start = performance.now()
      const request = { scenario, computationId: response.computationId }
      const [weapons, artifacts] = await Promise.all([post('/v1/analysis/weapons', request), post('/v1/analysis/artifact-loadouts', request)])
      const coldMs = performance.now() - start
      start = performance.now()
      await Promise.all([post('/v1/analysis/weapons', request), post('/v1/analysis/artifact-loadouts', request)])
      output.scenes[name] = { directCore: quantiles(direct), httpCore: quantiles(core), coldComparisonMs: coldMs,
        hotComparisonMs: performance.now() - start, weapons: weapons.weapons.length, artifacts: artifacts.candidateCount,
        failures: artifacts.failures, displayed: artifacts.results.length }
      console.error(`${name}: complete`)
    }
    for (const concurrency of process.argv.includes('--core-only') ? [] : [1, 4]) {
      let active = true
      const health = []
      const heartbeat = (async () => {
        while (active) {
          const scheduled = performance.now() + 20
          await new Promise(resolve => setTimeout(resolve, 20))
          const response = await app.inject({ url: '/health' })
          if (response.statusCode !== 200) throw new Error('Health check failed')
          health.push(performance.now() - scheduled)
        }
      })()
      const start = performance.now()
      await Promise.all(Array.from({ length: concurrency }, async (_, index) => {
        const scenario = { ...scenarios.stellar, primary: { ...scenarios.stellar.primary, label: `load.${concurrency}.${index}` } }
        const core = await post('/v1/analysis/core', scenario)
        const body = { scenario, computationId: core.computationId }
        return Promise.all([post('/v1/analysis/weapons', body), post('/v1/analysis/artifact-loadouts', body)])
      }))
      active = false
      await heartbeat
      output.load.push({ concurrency, totalMs: performance.now() - start, healthDelay: quantiles(health),
        heapMiB: process.memoryUsage().heapUsed / 1024 / 1024 })
    }
    const sets = listArtifactComparisonSets().filter(set => set.twoPieceSupported && db.getArtifactSet(set.setId)?.rarities.some(r => r >= 4))
    output.unmergedCandidates = sets.filter(set => set.fourPieceSupported).length + sets.length * (sets.length - 1) / 2
    console.log(JSON.stringify(output, null, 2))
  } finally { await app.close() }
}
