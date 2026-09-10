import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import * as analyzer from '../../../packages/analyzer/dist/index.js'
import { raidenNationalBuiltinBuild } from '../../../packages/content/dist/index.js'
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from '../../../packages/game-data/dist/index.js'

const mode = process.argv[2] ?? 'before'
const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const build = (characterId, weaponId, constellation) => ({
  ...structuredClone(raidenNationalBuiltinBuild), buildId: `benchmark.${characterId}`, characterId,
  level: 90, ascension: 6, constellation, talents: { normal: 10, skill: 10, burst: 10 },
  weapon: { weaponId, refinement: 1, level: 90, ascension: 6 }
})
const ice = {
  ...analyzer.raidenNationalBuiltinScenario,
  primary: build('YumemizukiMizuki', 'FavoniusCodex', 6),
  teammates: [build('Odette', 'FavoniusSword', 0), build('Faruzan', 'FavoniusWarbow', 6), build('Diona', 'FavoniusWarbow', 6)],
  targetActionId: 'yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl_vortex',
  externalBuffs: [],
  conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: 'maximum_reachable', actionParameters: { vortex_level: 6 } }
}
const wind = { ...ice, targetActionId: 'yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl',
  conditions: { ...ice.conditions, actionParameters: {} } }
const scenarios = { ordinary: analyzer.raidenNationalBuiltinScenario, wind, ice }
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const snapshots = Object.fromEntries(Object.entries(scenarios).map(([key, scenario]) => {
  const evaluated = analyzer.evaluateScenario(scenario, db)
  return [key, { scenario, damage: evaluated.actionExpectedDamage, digest: digest(evaluated), evaluation: evaluated }]
}))
const report = { mode, node: process.version, commit: execFileSync('git', ['rev-parse', 'HEAD']).toString().trim(),
  snapshot: digest(readFileSync(DEFAULT_GAME_DATA_PATH)), snapshots, timings: {} }
const measure = (name, run) => {
  run()
  const samples = []
  let result
  for (let i = 0; i < 3; i++) {
    const start = performance.now()
    result = run()
    samples.push(performance.now() - start)
    console.log(`${name} ${i + 1}: ${samples.at(-1).toFixed(1)} ms`)
  }
  report.timings[name] = { samples, medianMs: [...samples].sort((a, b) => a - b)[1], digest: digest(result) }
  return result
}
measure('single', () => analyzer.evaluateScenario(ice, db))
const full = measure('full', () => analyzer.analyzeScenario(ice, db))
const overrides = { AThousandFloatingDreams: 2 }
const refinement = measure('refinement', () => mode === 'before'
  ? analyzer.analyzeScenario(ice, db, { weaponComparisonRefinements: overrides })
  : analyzer.analyzeWeaponComparison(ice, db, 'AThousandFloatingDreams', 2))
report.full = full
report.refinement = mode === 'before'
  ? { baselineExpectedDamage: refinement.baselineExpectedDamage, weapon: refinement.weapons.find(w => w.weaponId === 'AThousandFloatingDreams') }
  : refinement
writeFileSync(new URL(`./benchmark-${mode}.json`, import.meta.url), JSON.stringify(report, null, 2))
db.close()
