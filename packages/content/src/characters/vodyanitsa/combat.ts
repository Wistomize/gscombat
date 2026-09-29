import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage, CombatActionEffect, CombatActionMetadata, CombatTalentParameterReference } from "../../combat/types.js"
import { prepareWeaponSpecialReaction } from "../../combat/weapon-preparation.js"
import { vodyanitsaDefinition } from "./definition.js"
import { songAdditions } from "./song.js"

const hornId = "vodyanitsa.skill.spring_horn.hydro"
const burstId = "vodyanitsa.burst.finale.hydro"
const healId = "vodyanitsa.skill.distant_song.heal"
const parameter = (id: string, groupId: "skill" | "burst", parameterIndex: number): CombatTalentParameterReference =>
  ({ id, groupId, parameterIndex, source: "talent", talentSlot: groupId })
const vortex = prepareWeaponSpecialReaction(["stellar_swirl"], "party")
const actions: readonly CombatActionMetadata[] = [
  {
    id: hornId, characterId: "Vodyanitsa", kind: "damage", status: "verified", fieldPresence: "off_field",
    element: "hydro", talentSlot: "skill", damageKind: "direct", evaluator: "declared_direct", scalingStat: "hp",
    parameterReferences: [parameter("horn", "skill", 3)],
    damageParts: [{ id: "horn", coefficientParameterId: "horn",
      snapshotChecks: [{ talentLevel: 1, expectedCoefficient: 0.03272 }, { talentLevel: 10, expectedCoefficient: 0.058896 }] }]
  },
  {
    id: burstId, characterId: "Vodyanitsa", kind: "damage", status: "verified", fieldPresence: "on_field",
    element: "hydro", talentSlot: "burst", damageKind: "direct", evaluator: "declared_direct", scalingStat: "hp",
    parameterReferences: [parameter("finale", "burst", 0), parameter("song-bonus", "burst", 1)],
    intrinsicEffects: [{ kind: "flat", coefficientParameterId: "song-bonus", target: "damageBonus",
      label: "终奏·伴尔沉沦 · 遥久之歌期间伤害加成",
      snapshotChecks: [{ talentLevel: 1, expectedCoefficient: 0.48 }, { talentLevel: 10, expectedCoefficient: 0.864 }] }],
    damageParts: [{ id: "finale", coefficientParameterId: "finale",
      snapshotChecks: [{ talentLevel: 1, expectedCoefficient: 0.456768 }, { talentLevel: 10, expectedCoefficient: 0.822182 }] }]
  },
  { id: healId, characterId: "Vodyanitsa", kind: "support", status: "verified", element: "hydro", talentSlot: "skill",
    parameterReferences: [parameter("healing-ratio", "skill", 5), parameter("healing-flat", "skill", 4)] }
]

export const vodyanitsaCombatCoverage: CharacterCombatCoverage = {
  characterId: "Vodyanitsa", label: "沃雅妮莎", status: "verified",
  detail: "7.1核心指标与队伍增益；默认此前已叠满可保留的C4生命值，当前单跳低血治疗按受益者生命比例单独判定。",
  capabilities: [
    ...declareWeaponHitCapabilities(vodyanitsaDefinition),
    declareSkillCastCapability("vodyanitsa", 9),
    { id: "vodyanitsa.healing", label: "遥久之歌持续治疗", kind: "healing", recipient: "on_field",
      sourceFieldPresence: "any", sustained: true },
    { ...declareHitCapability("vodyanitsa.horn.hits", "唤春角笛后台持续命中", ["skill"], ["hydro"], true),
      skillHitOpportunities: { withinSeconds: 12, count: 4, minimumSeparationSeconds: 3 } },
    declareHitCapability("vodyanitsa.burst.hit", "终奏水伤", ["burst"], ["hydro"])
  ],
  actions,
  metrics: [
    ...([false, true] as const).map(stellar => {
      const addition = stellar ? songAdditions.stellarSwirl : songAdditions.hydroCryo
      return {
        id: `vodyanitsa.passive.song.${stellar ? "stellar" : "hydro-cryo"}.addition`,
        sourceActionId: healId, characterId: "Vodyanitsa", kind: "scalar" as const, status: "verified" as const,
        label: `十二弦的泪歌 / ${stellar ? "星扩散固定伤害加值" : "水／冰基础伤害加值"}（单次）`,
        target: "friendly_recipient" as const, recipientRequirements: [], minimumSourceAscension: 4,
        scalingStat: "hp" as const, minimumScalingValue: songAdditions.minimumHp,
        ratio: addition.ratio, maximumValue: addition.maximum, unit: "damage" as const,
        semantic: stellar ? "stellar_swirl_flat_damage_bonus" as const : "hydro_cryo_flat_damage_bonus" as const
      }
    }),
    ...actions.filter(action => action.kind === "damage").map(action => ({
      id: action.id, actionId: action.id, sourceActionId: action.id, characterId: "Vodyanitsa", kind: "damage" as const,
      status: "verified" as const, target: "enemy" as const,
      label: action.id === hornId ? "宣叙·晨声纷流 / 唤春角笛单次水伤（后台）" : "终奏·伴尔沉沦 / 遥久之歌期间水伤"
    })),
    {
      id: healId, sourceActionId: healId, characterId: "Vodyanitsa", kind: "healing", status: "verified",
      label: "宣叙·晨声纷流 / 遥久之歌单跳治疗", target: "friendly_recipient", recipientRequirements: [],
      includeHealingBonus: true, scalingStat: "hp",
      conditionalHealingMultipliers: [{
        label: "柔波摇漾的低诉 · 本次治疗提升50%", minimumSourceConstellation: 4, value: 0.5,
        recipientRequirement: { kind: "recipient_hp_fraction", comparison: "less_than", threshold: 0.4,
          label: "受治疗角色生命值低于40%" }
      }],
      percentageParameter: { reference: parameter("healing-ratio", "skill", 5),
        snapshotChecks: [{ talentLevel: 1, expectedValue: 0.028 }, { talentLevel: 10, expectedValue: 0.0504 }] },
      flatParameter: { reference: parameter("healing-flat", "skill", 4),
        snapshotChecks: [{ talentLevel: 1, expectedValue: 269.62854 }, { talentLevel: 10, expectedValue: 593.2278 }] }
    }
  ],
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ],
  actionEffects: [
    {
      id: "vodyanitsa.skill.resistance", label: "宣叙·晨声纷流 · 水／冰减抗", activation: "maximum_reachable",
      source: { kind: "character", characterId: "Vodyanitsa" }, target: "enemyResistanceReduction",
      targetFilter: { elements: ["hydro", "cryo"] },
      value: { kind: "talent_parameter", parameter: parameter("resistance", "skill", 7) }
    },
    {
      id: "vodyanitsa.passive.vortex-resistance", label: "最后的塑诗者 · 流荡风旋降低风抗35%",
      activation: "automatic", lifecycle: vortex, source: { kind: "character", characterId: "Vodyanitsa", minimumSourceAscension: 1 },
      target: "enemyResistanceReduction", targetFilter: { elements: ["anemo"] }, value: { kind: "fixed", value: 0.35 }
    },
    ...[false, true].flatMap((stellar): CombatActionEffect[] => [
      {
        id: `vodyanitsa.passive.song.${stellar}.hydro-cryo`, label: "十二弦的泪歌 · 领唱／重唱水冰基础伤害",
        activation: "automatic", ...(stellar ? { lifecycle: vortex } : {}),
        exclusivity: { group: "vodyanitsa-song", variant: stellar ? "vortex" : "ordinary", automaticPriority: stellar ? 2 : 1 },
        source: { kind: "character", characterId: "Vodyanitsa", minimumSourceAscension: 4 },
        target: "baseDamageFlat", targetFilter: { elements: ["hydro", "cryo"], talentSlots: ["normal", "skill", "burst"] },
        value: stellar ? { kind: "fixed", value: 0 } : { kind: "final_hp", offset: -songAdditions.minimumHp,
          multiplier: { kind: "fixed", value: songAdditions.hydroCryo.ratio },
          maximumValue: { kind: "fixed", value: songAdditions.hydroCryo.maximum } }
      },
      {
        id: `vodyanitsa.passive.song.${stellar}.stellar`, label: "十二弦的泪歌 · 领唱／重唱星扩散固定伤害",
        activation: "automatic", ...(stellar ? { lifecycle: vortex } : {}),
        exclusivity: { group: "vodyanitsa-song", variant: stellar ? "vortex" : "ordinary", automaticPriority: stellar ? 2 : 1 },
        source: { kind: "character", characterId: "Vodyanitsa", minimumSourceAscension: 4 },
        target: "specialReactionFlatDamageAddition", targetFilter: { specialReactionKinds: ["stellar_swirl"] },
        value: stellar ? { kind: "final_hp", offset: -songAdditions.minimumHp,
          multiplier: { kind: "fixed", value: songAdditions.stellarSwirl.ratio },
          maximumValue: { kind: "fixed", value: songAdditions.stellarSwirl.maximum } } : { kind: "fixed", value: 0 }
      }
    ]),
    {
      id: "vodyanitsa.constellation.1.attack", label: "聚光灯下的水华 · 0.8%来源生命转全队固定攻击力",
      activation: "maximum_reachable", source: { kind: "character", characterId: "Vodyanitsa", minimumSourceConstellation: 1 },
      target: "flatAttack", value: { kind: "final_hp", multiplier: { kind: "fixed", value: 0.008 } }
    },
    ...[false, true].flatMap(party => [false, true].flatMap((stellar): CombatActionEffect[] => [
      {
        id: `vodyanitsa.constellation.2.${party}.${stellar}.hydro-cryo`, label: "穿彻风雪的余响 · 水冰暴击伤害",
        activation: "automatic", requiresRecipientOnField: !party,
        source: { kind: "character", characterId: "Vodyanitsa", minimumSourceConstellation: party ? 6 : 2 },
        lifecycle: { kind: "all_of", alternatives: [
          ...(stellar ? [vortex] : []),
          ...(party ? [{ kind: "conditional" as const, preparation: "qualified" as const, retention: "while_applicable" as const,
            trigger: { event: "none" as const, sourceFieldPresence: "any" as const },
            applicability: { recipientFieldPresence: "off_field" as const }, explanation: "C6仅补后台；前台已由C2计入" }] : [])
        ] },
        exclusivity: { group: `vodyanitsa-c2-${party}`, variant: stellar ? "vortex" : "ordinary", automaticPriority: stellar ? 2 : 1 },
        target: "critDamage", targetFilter: { elements: ["hydro", "cryo"] }, value: { kind: "fixed", value: stellar ? 0 : 0.5 }
      },
      {
        id: `vodyanitsa.constellation.2.${party}.${stellar}.stellar`, label: "穿彻风雪的余响 · 流荡风旋星扩散暴击伤害",
        activation: "automatic", requiresRecipientOnField: !party,
        source: { kind: "character", characterId: "Vodyanitsa", minimumSourceConstellation: party ? 6 : 2 },
        lifecycle: { kind: "all_of", alternatives: [
          ...(stellar ? [vortex] : []),
          ...(party ? [{ kind: "conditional" as const, preparation: "qualified" as const, retention: "while_applicable" as const,
            trigger: { event: "none" as const, sourceFieldPresence: "any" as const },
            applicability: { recipientFieldPresence: "off_field" as const }, explanation: "C6仅补后台" }] : [])
        ] },
        exclusivity: { group: `vodyanitsa-c2-${party}`, variant: stellar ? "vortex" : "ordinary", automaticPriority: stellar ? 2 : 1 },
        target: "critDamage", targetFilter: { specialReactionKinds: ["stellar_swirl"] }, value: { kind: "fixed", value: stellar ? 0.6 : 0 }
      }
    ])),
    {
      id: "vodyanitsa.constellation.4.hp", label: "柔波摇漾的低诉 · 受疗目标不低于40%时，三层生命上限",
      activation: "maximum_reachable", source: { kind: "character", characterId: "Vodyanitsa", minimumSourceConstellation: 4 },
      target: "hpPercent", targetFilter: { recipientSourceRelation: "source" }, value: { kind: "fixed", value: 0.6 }
    },
    {
      id: "vodyanitsa.constellation.6.stellar", label: "永不落幕的盛歌 · 全队星扩散擢升",
      activation: "maximum_reachable", source: { kind: "character", characterId: "Vodyanitsa", minimumSourceConstellation: 6 },
      target: "specialReactionElevation", targetFilter: { specialReactionKinds: ["stellar_swirl"] }, value: { kind: "fixed", value: 0.25 }
    },
    {
      id: "vodyanitsa.constellation.6.hydro-cryo", label: "永不落幕的盛歌 · 水冰元素伤害加成",
      activation: "maximum_reachable", source: { kind: "character", characterId: "Vodyanitsa", minimumSourceConstellation: 6 },
      target: "damageBonus", targetFilter: { elements: ["hydro", "cryo"] }, value: { kind: "fixed", value: 0.6 }
    }
  ]
}
