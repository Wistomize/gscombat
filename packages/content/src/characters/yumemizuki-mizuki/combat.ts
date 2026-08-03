import type { CharacterCombatCoverage } from "../../combat/types.js"

import { yumemizukiMizukiDefinition } from "./definition.js"

export const yumemizukiMizukiCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "YumemizukiMizuki",
      element: yumemizukiMizukiDefinition.element,
      id: "yumemizuki_mizuki.burst.anraku_secret_spring_therapy.mini_baku.snack_heal",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "mini-baku-snack-elemental-mastery-heal-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "mini-baku-snack-flat-heal",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "YumemizukiMizuki",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.522768, talentLevel: 1 },
            { expectedCoefficient: 0.940982, talentLevel: 10 }
          ]
        }
      ],
      element: yumemizukiMizukiDefinition.element,
      evaluator: "declared_direct",
      id: "yumemizuki_mizuki.normal.auto.first_hit",
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
      characterId: "YumemizukiMizuki",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "aisa-utamakura-pilgrimage-skill-damage",
          id: "aisa-utamakura-pilgrimage-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.44912, talentLevel: 1 },
            { expectedCoefficient: 0.808416, talentLevel: 10 }
          ]
        }
      ],
      element: yumemizukiMizukiDefinition.element,
      evaluator: "declared_direct",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "aisa-utamakura-pilgrimage-skill-damage",
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
      characterId: "YumemizukiMizuki",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "anraku-secret-spring-therapy-initial-hit-damage",
          id: "anraku-secret-spring-therapy-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.9408, talentLevel: 1 },
            { expectedCoefficient: 1.69344, talentLevel: 10 }
          ]
        }
      ],
      element: yumemizukiMizukiDefinition.element,
      evaluator: "declared_direct",
      id: "yumemizuki_mizuki.burst.anraku_secret_spring_therapy.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "anraku-secret-spring-therapy-initial-hit-damage",
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
  characterId: "YumemizukiMizuki",
  metrics: [
    {
      characterId: "YumemizukiMizuki",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "mini-baku-snack-flat-heal",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 314.57, talentLevel: 1 },
          { expectedValue: 692.10645, talentLevel: 10 }
        ]
      },
      id: "yumemizuki_mizuki.burst.anraku_secret_spring_therapy.mini_baku.snack_heal",
      includeHealingBonus: true,
      kind: "healing",
      label: "安乐秘方疗法 / 貉灵小食单次治疗",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "mini-baku-snack-elemental-mastery-heal-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1.3056, talentLevel: 1 },
          { expectedValue: 2.35008, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        {
          comparison: "at_most",
          kind: "recipient_hp_fraction",
          label: "当前场上角色拾取小食且生命值不高于70%",
          threshold: 0.7
        }
      ],
      scalingStat: "elementalMastery",
      sourceActionId: "yumemizuki_mizuki.burst.anraku_secret_spring_therapy.mini_baku.snack_heal",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One first normal-attack hit, one Aisa Utamakura initial area hit, and Anraku Secret: Spring Therapy's initial hit remain verified lower-level C0 attack-scaling Anemo actions from the pinned 6.7 Genshin Optimizer snapshot at commit 21c98eb60355160274a8c4cecfc5671e2151a073, but none is selected as Mizuki's display output. The selected support metric calculates one Mini Baku snack's healing for the current active friendly recipient as Mizuki's Elemental Mastery × burst[2] plus burst[6], then applies Mizuki's Healing Bonus and the recipient's Incoming Healing Bonus; it requires that recipient to pick up the snack at 70% HP or below. C5 adds three Burst levels. It excludes the above-70% snack damage branch, snack timing and pickup routing, Mini Baku's initial damage, Dreamdrifter damage, Swirl bonuses, pull, passives, C1/C2/C3/C4/C6, external effects, and rotation behavior.",
  label: yumemizukiMizukiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
