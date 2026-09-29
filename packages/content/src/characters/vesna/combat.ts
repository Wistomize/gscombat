import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage, CombatActionEffect, CombatActionMetadata } from "../../combat/types.js"
import { prepareWeaponSpecialReaction } from "../../combat/weapon-preparation.js"
import { vesnaDefinition } from "./definition.js"

const skillId = "vesna.skill.soaring_blade.highest_tier.stellar_swirl"
const burstId = "vesna.burst.spirit_blades.stellar_swirl"
const actions: readonly CombatActionMetadata[] = [
  {
    id: skillId, characterId: "Vesna", kind: "damage", status: "verified", fieldPresence: "on_field",
    element: "anemo", talentSlot: "skill", damageKind: "direct", evaluator: "declared_direct",
    scalingStat: "attack",
    // A single logical snapshot, not measured animation timing or a rotation DPS estimate.
    timeline: { duration: 1, damageEvents: [
      { id: "sword-1", damagePartId: "sword-1", at: 0, snapshot: "hit", specialReaction: { kind: "stellar_swirl" } },
      ...[2, 3, 4].map(index => ({ id: `sword-${index}`, damagePartId: `sword-${index}`,
        at: 0, snapshot: "hit" as const, specialReaction: { kind: "stellar_swirl" as const } })),
      { id: "ending", damagePartId: "ending", at: 0, snapshot: "hit", specialReaction: { kind: "stellar_swirl" } }
    ] },
    tracePresentation: { focusEventId: "ending", focusLabel: "三阶灵剑最终段星扩散", totalLabel: "四段灵剑＋最终段合计" },
    parameterReferences: [
      { id: "sword", groupId: "skill", parameterIndex: 6, source: "talent", talentSlot: "skill" },
      { id: "ending", groupId: "skill", parameterIndex: 8, source: "talent", talentSlot: "skill" }
    ],
    damageParts: [
      ...[1, 2, 3, 4].map(index => ({ id: `sword-${index}`, coefficientParameterId: "sword",
        snapshotChecks: [{ talentLevel: 1, expectedCoefficient: 0.448 }, { talentLevel: 10, expectedCoefficient: 0.8064 }] })),
      { id: "ending", coefficientParameterId: "ending",
        snapshotChecks: [{ talentLevel: 1, expectedCoefficient: 1.568 }, { talentLevel: 10, expectedCoefficient: 2.8224 }] }
    ]
  },
  {
    id: burstId, characterId: "Vesna", kind: "damage", status: "verified", fieldPresence: "on_field",
    element: "anemo", talentSlot: "burst", damageKind: "special_reaction", evaluator: "declared_special_reaction",
    scalingStat: "attack", specialReaction: { kind: "stellar_swirl" },
    parameterReferences: [{ id: "burst-sword", groupId: "burst", parameterIndex: 1, source: "talent", talentSlot: "burst" }],
    damageParts: [{ id: "burst-sword", coefficientParameterId: "burst-sword",
      snapshotChecks: [{ talentLevel: 1, expectedCoefficient: 2.632 }, { talentLevel: 10, expectedCoefficient: 4.7376 }] }]
  }
]
const radiance = prepareWeaponSpecialReaction(["stellar_swirl"], "party", true)

export const vesnaCombatCoverage: CharacterCombatCoverage = {
  characterId: "Vesna", label: "薇斯纳", status: "verified",
  detail: "7.1：辉映状态下三阶灵剑四段＋最终段、爆发灵剑；整肃按满六层。C6变移是另一次操作，不并入本次翔风剑。",
  capabilities: [
    ...declareWeaponHitCapabilities(vesnaDefinition),
    declareSkillCastCapability("vesna", 12, { castsPerUse: 6, nonDamagingInitialUses: 0 }),
    declareHitCapability("vesna.skill.hits", "翔风剑和灵剑持续命中", ["skill"], ["anemo"], true),
    declareHitCapability("vesna.burst.hit", "爆发灵剑命中", ["burst"], ["anemo"]),
    { id: "vesna.stellar-conversion", label: "星耀祝礼：冰扩散转星扩散", kind: "reaction_conversion",
      recipient: "party", sourceFieldPresence: "any", sustained: true, specialReactions: ["stellar_swirl"] },
    { id: "vesna.stellar-damage", label: "辉映灵剑星扩散伤害", kind: "special_reaction_damage",
      recipient: "self", sourceFieldPresence: "on_field", sustained: true,
      specialReactions: ["stellar_swirl"], requiredTeamReaction: "stellar_swirl" }
  ],
  actions,
  metrics: actions.map(action => ({ id: action.id, actionId: action.id, sourceActionId: action.id,
    characterId: "Vesna", kind: "damage", status: "verified", target: "enemy",
    label: action.id === skillId ? "翔风剑三阶 / 灵剑星扩散伤害（四段＋最终段）" : "致礼·献予女皇陛下 / 灵剑星扩散伤害" })),
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ],
  actionEffects: [
    {
      id: "vesna.passive.base-damage", label: "星耀祝礼·散华序饰 · 攻击力提升队伍星扩散基础伤害",
      activation: "automatic", source: { kind: "character", characterId: "Vesna" },
      target: "specialReactionBaseDamageBonus", targetFilter: { specialReactionKinds: ["stellar_swirl"] },
      value: { kind: "source_final_attack", multiplier: { kind: "fixed", value: 0.00007 }, maximumValue: { kind: "fixed", value: 0.14 } }
    },
    {
      id: "vesna.passive.six-stacks", label: "仪典·春之行列 · 六层整肃，灵剑原本伤害提升60%",
      activation: "automatic", source: { kind: "character", characterId: "Vesna", minimumSourceAscension: 1 },
      requiresSourceOnField: true, target: "specialReactionBaseDamageMultiplier",
      targetFilter: { recipientSourceRelation: "source", actionIds: [skillId, burstId] },
      value: { kind: "fixed", value: 0.6 }
    },
    ...[1, 2, 3, 4].flatMap(count => [false, true].map((other): CombatActionEffect => ({
      id: `vesna.passive.composition.${count}.${other}`, label: `理典·冬之凯风 · ${count}名${other ? "其他元素：精通" : "风／冰元素：攻击力"}`,
      activation: "automatic", source: { kind: "character", characterId: "Vesna", minimumSourceAscension: 4 },
      lifecycle: radiance, condition: { kind: "team_element_count", elements: other ? ["pyro", "hydro", "electro", "geo", "dendro"] : ["cryo", "anemo"],
        minimum: count, maximum: count },
      target: other ? "elementalMastery" : "attackPercent", targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: count * (other ? 25 : 0.06) }
    }))),
    ...[1, 2, 3, 4].flatMap(count => [false, true].map((other): CombatActionEffect => ({
      id: `vesna.constellation.4.composition.${count}.${other}`, label: "先代的荣膺 · 冬之凯风额外两倍",
      activation: "automatic", source: { kind: "character", characterId: "Vesna", minimumSourceAscension: 4, minimumSourceConstellation: 4 },
      lifecycle: radiance, condition: { kind: "team_element_count", elements: other ? ["pyro", "hydro", "electro", "geo", "dendro"] : ["cryo", "anemo"],
        minimum: count, maximum: count },
      target: other ? "elementalMastery" : "attackPercent", targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: count * (other ? 50 : 0.12) }
    }))),
    {
      id: "vesna.constellation.1.stellar", label: "送冬的华宴 · 巡风列装星扩散伤害",
      activation: "automatic", source: { kind: "character", characterId: "Vesna", minimumSourceConstellation: 1 },
      requiresSourceOnField: true, target: "specialReactionDamageBonus",
      targetFilter: { recipientSourceRelation: "source", specialReactionKinds: ["stellar_swirl"] }, value: { kind: "fixed", value: 0.2 }
    },
    {
      id: "vesna.constellation.2.attack", label: "迎春的轮舞 · 满整肃攻击力",
      activation: "automatic", source: { kind: "character", characterId: "Vesna", minimumSourceAscension: 1, minimumSourceConstellation: 2 },
      requiresSourceOnField: true, target: "attackPercent", targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      id: "vesna.constellation.6.elevation", label: "不移的赤忱 · 星扩散擢升",
      activation: "automatic", source: { kind: "character", characterId: "Vesna", minimumSourceConstellation: 6 },
      target: "specialReactionElevation", targetFilter: { recipientSourceRelation: "source", specialReactionKinds: ["stellar_swirl"] },
      value: { kind: "fixed", value: 0.2 }
    }
  ]
}
