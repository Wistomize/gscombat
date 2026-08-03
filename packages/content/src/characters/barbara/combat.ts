import type { CharacterCombatCoverage } from "../../combat/types.js"

import { barbaraDefinition } from "./definition.js"

export const barbaraCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Barbara",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.3784, talentLevel: 1 },
            { expectedCoefficient: 0.68112, talentLevel: 10 }
          ]
        }
      ],
      element: barbaraDefinition.element,
      evaluator: "declared_direct",
      id: "barbara.normal.auto.first_hit",
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
      characterId: "Barbara",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "let-the-show-begin-water-drop-damage",
          id: "let-the-show-begin-water-drop",
          snapshotChecks: [
            { expectedCoefficient: 0.584, talentLevel: 1 },
            { expectedCoefficient: 1.0512, talentLevel: 10 }
          ]
        }
      ],
      element: barbaraDefinition.element,
      evaluator: "declared_direct",
      id: "barbara.skill.let_the_show_begin.water_drop",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "let-the-show-begin-water-drop-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Barbara",
      element: barbaraDefinition.element,
      id: "barbara.burst.shining_miracle.party_healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "shining-miracle-healing-percentage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "shining-miracle-healing-flat",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "barbara.let_the_show_begin.c2.current_character.hydro_damage_bonus",
      label: "演唱，开始♪持续期间 · C2 当前场上角色水元素伤害加成",
      source: { characterId: "Barbara", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Barbara",
  metrics: [
    {
      characterId: "Barbara",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "shining-miracle-healing-flat",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1694.2819, talentLevel: 1 },
          { expectedValue: 3727.7026, talentLevel: 10 }
        ]
      },
      id: "barbara.burst.shining_miracle.party_member_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "闪耀奇迹♪ / 单名队员治疗量（C0）",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "shining-miracle-healing-percentage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.176, talentLevel: 1 },
          { expectedValue: 0.3168, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "hp",
      sourceActionId: "barbara.burst.shining_miracle.party_healing",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One first normal-attack hit and one Let the Show Begin Water Drop are verified as baseline C0 attack-scaling Hydro hits. The selected C0 support metric verifies Shining Miracle's instant healing for one selected party member as max HP times burst[0] plus burst[1], then Barbara's Healing Bonus and the recipient's Incoming Healing Bonus. It reads the pinned 6.7 game-data snapshot: burst[0] is 0.176 at talent level one and 0.3168 at level ten, while burst[1] is 1694.2819 and 3727.7026. Shining Miracle heals each party member independently, so this metric has no range or current-HP eligibility requirement and emits no damage or reaction event. C2 can be selected as an explicit current-action snapshot while Let the Show Begin is already active: the selected on-field Hydro action gains 15% Hydro Damage Bonus. It does not infer the cast, duration, active character, or position, and leaves the C2 cooldown reduction unsupported. Let the Show Begin's on-hit and continuous healing, Water Ring, C1, C4, C6 revival, other passives and constellations, external effects, timing, and all other character states remain unmodeled.",
  label: barbaraDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
