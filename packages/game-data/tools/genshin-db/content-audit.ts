import { pathToFileURL } from "node:url"
import { join } from "node:path"
import { GameDataRepository } from "../../src/repository.js"
import { object } from "./input.js"

/** Uses built public exports, keeping Content/Analyzer out of game-data runtime dependencies. */
export async function auditContent(root: string, baselinePath: string, candidatePath: string) {
  const content = await import(pathToFileURL(join(root, "packages/content/dist/index.js")).href)
  const analyzer = await import(pathToFileURL(join(root, "packages/analyzer/dist/index.js")).href)
  using baseline = new GameDataRepository(baselinePath)
  using candidate = new GameDataRepository(candidatePath)
  const oldAudit: unknown = analyzer.validateCombatRegistryIntegrity({ gameData: baseline })
  const newAudit: unknown = analyzer.validateCombatRegistryIntegrity({ gameData: candidate })
  const registry = content.characterCombatCoverageRegistry as { characterId: string }[]
  const modeled = new Set(registry.map(c => c.characterId))
  const newUnmodeled = candidate.listCharacters().filter(c => !modeled.has(c.id)).map(c => c.id)
  const references: { location: string; status: string; reference: unknown }[] = []
  function visit(value: unknown, location: string, owner: string): void {
    if (Array.isArray(value)) { value.forEach((item, i) => visit(item, `${location}/${i}`, owner)); return }
    if (!value || typeof value !== "object") return
    const row = object(value)
    const selectedOwner = String(row.talentParameterOwnerId ?? row.characterId ?? owner)
    if (typeof row.groupId === "string" && (typeof row.parameterIndex === "number" || Array.isArray(row.path))) {
      const talentLevel = row.talentSlot === "passive" ? 1 : 10
      const result = typeof row.parameterIndex === "number"
        ? candidate.getCharacterSkillParameter(selectedOwner, row.groupId, row.parameterIndex, talentLevel)
        : candidate.getCharacterSkillParameterValue(selectedOwner, row.groupId, row.path as number[])
      references.push({ location, status: result === undefined ? "missing-or-owner-needs-review" : "present", reference: row })
    }
    for (const [key, child] of Object.entries(row)) visit(child, `${location}/${key}`, selectedOwner)
  }
  for (const coverage of registry) visit(coverage, coverage.characterId, coverage.characterId)
  const evidence = content.reviewedMultiScalingEvidenceRegistry.records as unknown[]
  const integration: unknown[] = []
  const original = content.raidenNationalBuiltinScenario
  const build = original.teammates.find((b: { characterId: string }) => b.characterId === "Xiangling")
  if (!build) throw new Error("Missing maintained Xiangling build")
  for (const targetActionId of ["xiangling.normal.auto.first_hit", "xiangling.skill.guoba.single_flame_breath"]) {
    const scenario = { ...original, id: "offline-genshindb-audit", primary: { ...build, constellation: 0,
      artifacts: [], weapon: { ...build.weapon, weaponId: "BeginnersProtector" } },
      teammates: [], externalBuffs: [], conditions: { activeEffectIds: [], actionParameters: {},
        equipmentEffectMode: "maximum_reachable", enemyCount: 1 }, targetActionId }
    try {
      const before = analyzer.evaluateScenario(scenario, baseline).actionExpectedDamage as number
      const after = analyzer.evaluateScenario({ ...scenario, gameDataVersion: candidate.getManifest().gameVersion }, candidate).actionExpectedDamage as number
      integration.push({ targetActionId, before, after, equal: Math.abs(before - after) < 1e-8 })
    } catch (error) {
      integration.push({ targetActionId, blocked: error instanceof Error ? error.message : String(error) })
    }
  }
  return { baseline: oldAudit, candidate: newAudit, references, newUnmodeled,
    evidenceRequiringSourceReview: evidence, integration }
}
