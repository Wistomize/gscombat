import type { CharacterCombatCoverage } from "../../combat/types.js"

import { fischlDefinition } from "./definition.js"

export const fischlCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Fischl",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.44118, talentLevel: 1 },
            { expectedCoefficient: 0.8721, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "fischl.normal.auto.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "normal-attack-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Fischl",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "nightrider-oz-level-one-attack-damage",
          id: "nightrider-oz-level-one-bolt",
          snapshotChecks: [
            { expectedCoefficient: 0.888, talentLevel: 1 },
            { expectedCoefficient: 1.5984, talentLevel: 10 }
          ]
        }
      ],
      element: fischlDefinition.element,
      evaluator: "declared_direct",
      id: "fischl.skill.nightrider.oz.level_one_bolt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "nightrider-oz-level-one-attack-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Fischl",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "midnight-phantasmagoria-initial-lightning-damage",
          id: "midnight-phantasmagoria-initial-lightning",
          snapshotChecks: [
            { expectedCoefficient: 2.08, talentLevel: 1 },
            { expectedCoefficient: 3.744, talentLevel: 10 }
          ]
        }
      ],
      element: fischlDefinition.element,
      evaluator: "declared_direct",
      id: "fischl.burst.midnight_phantasmagoria.initial_lightning",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "midnight-phantasmagoria-initial-lightning-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Fischl",
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "fischl.locked_passive.nocturnal_world_fantasia.after_overload.attack_percent",
      label: "魔女的前夜礼·宵世幻奏 · 奥兹在场且触发超载后攻击力提升",
      source: { characterId: "Fischl", kind: "character" },
      target: "attackPercent",
      value: { kind: "fixed", value: 0.225 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "fischl.locked_passive.nocturnal_world_fantasia.after_electro_charged.elemental_mastery",
      label: "魔女的前夜礼·宵世幻奏 · 奥兹在场且触发感电或月感电后元素精通提升",
      source: { characterId: "Fischl", kind: "character" },
      target: "elementalMastery",
      value: { kind: "fixed", value: 90 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "fischl.locked_passive.nocturnal_world_fantasia.c6.after_overload.extra_attack_percent",
      label: "魔女的前夜礼·宵世幻奏 · C6奥兹协同攻击后超载攻击力额外提升",
      source: { characterId: "Fischl", kind: "character", minimumSourceConstellation: 6 },
      target: "attackPercent",
      value: { kind: "fixed", value: 0.225 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "fischl.locked_passive.nocturnal_world_fantasia.c6.after_electro_charged.extra_elemental_mastery",
      label: "魔女的前夜礼·宵世幻奏 · C6奥兹协同攻击后感电元素精通额外提升",
      source: { characterId: "Fischl", kind: "character", minimumSourceConstellation: 6 },
      target: "elementalMastery",
      value: { kind: "fixed", value: 90 }
    }
  ],
  metrics: [
    {
      actionId: "fischl.skill.nightrider.oz.level_one_bolt",
      characterId: "Fischl",
      id: "fischl.skill.nightrider.oz.level_one_bolt",
      kind: "damage",
      label: "夜巡影翼 / 奥兹单次攻击（后台，C0，无反应）",
      sourceActionId: "fischl.skill.nightrider.oz.level_one_bolt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected metric is one ordinary post-deployment Oz attack. Nocturnal World Fantasia now contributes its Overloaded Attack and Electro-Charged/Lunar-Charged Elemental Mastery team snapshots under Hexerei: Secret Rite, including the C6 doubled values. Summoning damage, recurrence, target selection, timing, and other constellations remain unmodeled.",
  label: fischlDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
