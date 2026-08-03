import type { CharacterCombatCoverage } from "../../combat/types.js"

import { yanfeiDefinition } from "./definition.js"

export const yanfeiCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Yanfei",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "signed-edict-damage",
          id: "signed-edict",
          snapshotChecks: [
            { expectedCoefficient: 1.696, talentLevel: 1 },
            { expectedCoefficient: 3.0528, talentLevel: 10 }
          ]
        }
      ],
      element: yanfeiDefinition.element,
      evaluator: "declared_direct",
      id: "yanfei.skill.signed_edict",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "signed-edict-damage",
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
      amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" },
      attackKind: "charged",
      characterId: "Yanfei",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-three-scarlet-seals-damage",
          id: "charged-attack-three-scarlet-seals",
          snapshotChecks: [
            { expectedCoefficient: 1.502332, talentLevel: 1 },
            { expectedCoefficient: 2.446912, talentLevel: 10 }
          ]
        }
      ],
      element: yanfeiDefinition.element,
      evaluator: "declared_direct",
      id: "yanfei.normal.charged_attack.three_scarlet_seals.hydro_aura_vaporize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-three-scarlet-seals-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "melt_forward" },
      attackKind: "charged",
      characterId: "Yanfei",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-three-scarlet-seals-damage",
          id: "charged-attack-three-scarlet-seals",
          snapshotChecks: [
            { expectedCoefficient: 1.502332, talentLevel: 1 },
            { expectedCoefficient: 2.446912, talentLevel: 10 }
          ]
        }
      ],
      element: yanfeiDefinition.element,
      evaluator: "declared_direct",
      id: "yanfei.normal.charged_attack.three_scarlet_seals.cryo_aura_melt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-three-scarlet-seals-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Yanfei",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "done-deal-skill-damage",
          id: "done-deal-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 1.824, talentLevel: 1 },
            { expectedCoefficient: 3.2832, talentLevel: 10 }
          ]
        }
      ],
      element: yanfeiDefinition.element,
      evaluator: "declared_direct",
      id: "yanfei.burst.done_deal.initial_aoe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "done-deal-skill-damage",
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
  actionEffects: [
    {
      activation: "active",
      id: "yanfei.constellation.2.final_interpretation.low_hp_target.charged_attack.crit_rate",
      label: "最终解释权 · C2 敌人生命值低于50%（重击暴击率提高20%）",
      source: { characterId: "Yanfei", kind: "character", minimumSourceConstellation: 2 },
      target: "critRate",
      targetFilter: { attackKinds: ["charged"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Yanfei",
  metrics: [
    {
      actionId: "yanfei.normal.charged_attack.three_scarlet_seals.hydro_aura_vaporize",
      characterId: "Yanfei",
      id: "yanfei.normal.charged_attack.three_scarlet_seals.hydro_aura_vaporize",
      kind: "damage",
      label: "火漆制印 / 三枚丹火印重击·水底蒸发",
      sourceActionId: "yanfei.normal.charged_attack.three_scarlet_seals.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yanfei.normal.charged_attack.three_scarlet_seals.cryo_aura_melt",
      characterId: "Yanfei",
      id: "yanfei.normal.charged_attack.three_scarlet_seals.cryo_aura_melt",
      kind: "damage",
      label: "火漆制印 / 三枚丹火印重击·冰底融化",
      sourceActionId: "yanfei.normal.charged_attack.three_scarlet_seals.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Signed Edict hit and Done Deal's initial AoE remain verified lower-level C0 Pyro actions. The selected core action is one charged attack with exactly three Scarlet Seals, the C0 maximum: Attack × auto[6]. The pinned 6.7 snapshot gives auto[6] as 1.502332 at Normal Attack Level 1 and 2.446912 at Level 10; the fixed Genshin Optimizer sheet maps auto[3] through auto[7] to charged attacks with zero through four seals, so auto[6] is the three-seal result. Two mutually exclusive target-aura alternatives reuse this exact hit: Hydro aura uses the existing Pyro-on-Hydro Vaporize type and Cryo aura uses the existing Pyro-on-Cryo Melt type. They do not form a sequence or rotation. At C2, a separately selected current-action snapshot means the target is already below 50% HP: only Yanfei's charged attacks gain 20% Crit Rate. It does not infer the target's HP, apply to a non-charged hit, or establish a rotation. Brilliance, zero-to-two-seal variants, C6's fourth seal, A1/A4, remaining passive and constellation effects, external buffs, timing, and all other character states remain excluded.",
  label: yanfeiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
