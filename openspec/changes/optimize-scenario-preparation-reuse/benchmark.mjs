import { strict as assert } from 'node:assert'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import { pathToFileURL } from 'node:url'
import { Session } from 'node:inspector'

// Isolated pre-optimization dirty-worktree snapshot, not the old Git HEAD.
const baselineRoot = process.argv[2]
if (!baselineRoot) throw new Error('Pass the isolated baseline root')
const currentRoot = new URL('../../../', import.meta.url).pathname.replace(/\/$/, '')
const roots = process.argv.includes('--baseline-only') ? { before: baselineRoot } : { before: baselineRoot, after: currentRoot }
const hash = value => createHash('sha256').update(value).digest('hex')
const digest = value => hash(JSON.stringify(value, (_, item) => item instanceof Map ? [...item] : item))
function sourceHash(root, directory = 'src') {
  const files = []
  function walk(path) {
    for (const entry of readdirSync(`${root}/${path}`, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = `${path}/${entry.name}`
      if (entry.isDirectory()) walk(name)
      else files.push([name, hash(readFileSync(`${root}/${name}`))])
    }
  }
  for (const pkg of ['analyzer', 'content', 'contracts', 'calculator', 'game-data']) walk(`packages/${pkg}/${directory}`)
  return digest(files)
}
const states = {}
for (const [name, root] of Object.entries(roots)) {
  const analyzer = await import(pathToFileURL(`${root}/packages/analyzer/dist/index.js`))
  const content = await import(pathToFileURL(`${root}/packages/content/dist/index.js`))
  const data = await import(pathToFileURL(`${root}/packages/game-data/dist/index.js`))
  const build = (characterId, weaponId, constellation) => ({
    ...structuredClone(content.raidenNationalBuiltinBuild), buildId: `benchmark.${characterId}`, characterId,
    level: 90, ascension: 6, constellation, talents: { normal: 10, skill: 10, burst: 10 },
    weapon: { weaponId, refinement: 1, level: 90, ascension: 6 }
  })
  const ice = {
    ...structuredClone(content.raidenNationalBuiltinScenario), primary: build('YumemizukiMizuki', 'FavoniusCodex', 6),
    teammates: [build('Odette', 'FavoniusSword', 0), build('Faruzan', 'FavoniusWarbow', 6), build('Diona', 'FavoniusWarbow', 6)],
    targetActionId: 'yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl_vortex', externalBuffs: [],
    conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: 'maximum_reachable', actionParameters: { vortex_level: 6 } }
  }
  const wind = { ...ice, targetActionId: 'yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl',
    conditions: { ...ice.conditions, actionParameters: {} } }
  const scenarios = { ordinary: structuredClone(content.raidenNationalBuiltinScenario), wind, ice }
  states[name] = { analyzer, scenarios, db: new data.GameDataRepository(data.DEFAULT_GAME_DATA_PATH), results: {},
    samples: {}, snapshot: hash(readFileSync(data.DEFAULT_GAME_DATA_PATH)), sourceHash: sourceHash(root),
    buildHash: sourceHash(root, 'dist'), effects: content.listCombatActionEffects().length, inputs: digest(scenarios) }
}
const jobs = Object.keys(states.before.scenarios).flatMap(scene => ['single', 'full', 'weapon'].map(kind => ({ scene, kind })))
function run(state, { scene, kind }) {
  const scenario = state.scenarios[scene]
  if (kind === 'full') return state.analyzer.evaluateScenarioAnalysis(scenario, state.db)
  if (kind === 'weapon') return state.analyzer.analyzeWeaponComparison(scenario, state.db,
    scene === 'ordinary' ? 'TheCatch' : 'AThousandFloatingDreams', scene === 'ordinary' ? 5 : 2)
  return state.analyzer.evaluateScenario(scenario, state.db)
}
// Separate, intentionally instrumented run: these numbers are not wall-clock benchmarks.
if (process.argv.includes('--profile')) {
  const session = new Session(); session.connect()
  const post = (method, params = {}) => new Promise((resolve, reject) =>
    session.post(method, params, (error, result) => error ? reject(error) : resolve(result)))
  await post('Profiler.enable')
  const profiles = {}
  for (const [name, state] of Object.entries(states)) {
    run(state, { scene: 'ordinary', kind: 'full' })
    await post('Profiler.startPreciseCoverage', { callCount: true, detailed: false })
    await post('Profiler.start')
    for (let i = 0; i < 3; i++) run(state, { scene: 'ordinary', kind: 'full' })
    const { profile } = await post('Profiler.stop')
    const { result } = await post('Profiler.takePreciseCoverage')
    await post('Profiler.stopPreciseCoverage')
    const wanted = new Set(['listCombatActionEffects', 'getCombatActionEffectDefinition', 'resolveBaseCombatStats',
      'resolveSelfAutomaticEquipmentEffects', 'assertSelectedActiveEffectExclusivity', 'baseStats', 'prepareSources'])
    const calls = {}
    for (const script of result.filter(item => item.url.includes('/packages/'))) {
      for (const fn of script.functions) if (wanted.has(fn.functionName))
        calls[fn.functionName] = (calls[fn.functionName] ?? 0) + fn.ranges[0].count
    }
    const samples = new Map()
    for (const node of profile.nodes) {
      const key = node.callFrame.functionName || '(anonymous)'
      samples.set(key, (samples.get(key) ?? 0) + (node.hitCount ?? 0))
    }
    profiles[name] = { fullAnalyses: 3, calls, selfSamples: [...samples].sort((a, b) => b[1] - a[1]).slice(0, 15) }
    state.db.close()
  }
  session.disconnect(); console.log(JSON.stringify(profiles, null, 2)); process.exit(0)
}
for (const state of Object.values(states)) for (const job of jobs) run(state, job)
for (let round = 0; round < 3; round++) {
  const order = Object.keys(states); if (round % 2) order.reverse()
  for (const name of order) for (const job of jobs) {
    const state = states[name]; const key = `${job.scene}.${job.kind}`; const start = performance.now()
    const result = run(state, job); const elapsed = performance.now() - start
    ;(state.samples[key] ??= []).push(elapsed); state.results[key] = result
  }
}
if (states.after) {
  assert.equal(states.before.inputs, states.after.inputs)
  assert.equal(states.before.snapshot, states.after.snapshot)
  for (const key of Object.keys(states.before.results)) assert.deepEqual(states.after.results[key], states.before.results[key], key)
}
const report = { node: process.version, baselineRoot, outputsEqual: states.after ? true : undefined, versions: {} }
for (const [name, state] of Object.entries(states)) {
  assert.equal(digest(state.scenarios), state.inputs, 'Caller inputs mutated')
  report.versions[name] = { sourceHash: state.sourceHash, buildHash: state.buildHash, effects: state.effects,
    snapshot: state.snapshot, inputs: state.inputs,
    samples: Object.fromEntries(Object.entries(state.samples).map(([key, samples]) => [key, {
      samples, medianMs: [...samples].sort((a, b) => a - b)[1], outputDigest: digest(state.results[key]),
      ...(key.endsWith('.full') ? { candidates: state.results[key].analysis.weapons.length } : {})
    }])) }
  state.db.close()
}
console.log(JSON.stringify(report, null, 2))
