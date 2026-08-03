import type { CharacterCombatCoverage } from "../../combat/types.js"

export const travelerCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Traveler",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "palm-vortex-initial-gust-damage",
          id: "palm-vortex-initial-gust",
          snapshotChecks: [
            { expectedCoefficient: 1.76, talentLevel: 1 },
            { expectedCoefficient: 3.168, talentLevel: 10 }
          ]
        }
      ],
      element: "anemo",
      evaluator: "declared_direct",
      id: "traveler.anemo.skill.palm_vortex.initial_gust",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "palm-vortex-initial-gust-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill",
      travelerElement: "anemo"
    },
    {
      characterId: "Traveler",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "starfell-sword-explosion-damage",
          id: "starfell-sword-explosion",
          snapshotChecks: [
            { expectedCoefficient: 2.48, talentLevel: 1 },
            { expectedCoefficient: 4.464, talentLevel: 10 }
          ]
        }
      ],
      element: "geo",
      evaluator: "declared_direct",
      id: "traveler.geo.skill.starfell_sword.explosion",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "starfell-sword-explosion-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill",
      travelerElement: "geo"
    },
    {
      characterId: "Traveler",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "bellowing-thunder-cast-hit-damage",
          id: "bellowing-thunder-cast-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.144, talentLevel: 1 },
            { expectedCoefficient: 2.0592, talentLevel: 10 }
          ]
        }
      ],
      element: "electro",
      evaluator: "declared_direct",
      id: "traveler.electro.burst.bellowing_thunder.cast_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "bellowing-thunder-cast-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst",
      travelerElement: "electro"
    },
    {
      characterId: "Traveler",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "razorgrass-blade-damage",
          id: "razorgrass-blade",
          snapshotChecks: [
            { expectedCoefficient: 2.304, talentLevel: 1 },
            { expectedCoefficient: 4.1472, talentLevel: 10 }
          ]
        }
      ],
      element: "dendro",
      evaluator: "declared_direct",
      id: "traveler.dendro.skill.razorgrass_blade",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-razorgrass-blade-damage-bonus-per-elemental-mastery",
          kind: "source_stat",
          label: "固有天赋 · 繁庑的丛草",
          maximumValue: 0.15,
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.0015, talentLevel: 1 }],
          sourceStat: "elementalMastery",
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "razorgrass-blade-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-razorgrass-blade-damage-bonus-per-elemental-mastery",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill",
      travelerElement: "dendro"
    },
    {
      characterId: "Traveler",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "aquacrest-saber-press-torrential-surge-damage",
          id: "aquacrest-saber-press-torrential-surge",
          snapshotChecks: [
            { expectedCoefficient: 1.8928, talentLevel: 1 },
            { expectedCoefficient: 3.40704, talentLevel: 10 }
          ]
        }
      ],
      element: "hydro",
      evaluator: "declared_direct",
      id: "traveler.hydro.skill.aquacrest_saber.press.torrential_surge",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "aquacrest-saber-press-torrential-surge-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill",
      travelerElement: "hydro"
    },
    {
      characterId: "Traveler",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "scorching-firestrike-hit-damage",
          id: "scorching-firestrike-hit",
          snapshotChecks: [
            { expectedCoefficient: 4.272, talentLevel: 1 },
            { expectedCoefficient: 7.6896, talentLevel: 10 }
          ]
        }
      ],
      element: "pyro",
      evaluator: "declared_direct",
      id: "traveler.pyro.burst.scorching_firestrike.hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "scorching-firestrike-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst",
      travelerElement: "pyro"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" },
      characterId: "Traveler",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "scorching-firestrike-hit-damage",
          id: "scorching-firestrike-hit",
          snapshotChecks: [
            { expectedCoefficient: 4.272, talentLevel: 1 },
            { expectedCoefficient: 7.6896, talentLevel: 10 }
          ]
        }
      ],
      element: "pyro",
      evaluator: "declared_direct",
      id: "traveler.pyro.burst.scorching_firestrike.hit.hydro_aura_vaporize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "scorching-firestrike-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst",
      travelerElement: "pyro"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "melt_forward" },
      characterId: "Traveler",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "scorching-firestrike-hit-damage",
          id: "scorching-firestrike-hit",
          snapshotChecks: [
            { expectedCoefficient: 4.272, talentLevel: 1 },
            { expectedCoefficient: 7.6896, talentLevel: 10 }
          ]
        }
      ],
      element: "pyro",
      evaluator: "declared_direct",
      id: "traveler.pyro.burst.scorching_firestrike.hit.cryo_aura_melt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "scorching-firestrike-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst",
      travelerElement: "pyro"
    }
  ],
  characterId: "Traveler",
  metrics: [
    {
      actionId: "traveler.anemo.skill.palm_vortex.initial_gust",
      characterId: "Traveler",
      id: "traveler.anemo.skill.palm_vortex.initial_gust",
      kind: "damage",
      label: "风涡剑 / 初始爆风",
      sourceActionId: "traveler.anemo.skill.palm_vortex.initial_gust",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "traveler.geo.skill.starfell_sword.explosion",
      characterId: "Traveler",
      id: "traveler.geo.skill.starfell_sword.explosion",
      kind: "damage",
      label: "星陨剑 / 爆炸",
      sourceActionId: "traveler.geo.skill.starfell_sword.explosion",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "traveler.electro.burst.bellowing_thunder.cast_hit",
      characterId: "Traveler",
      id: "traveler.electro.burst.bellowing_thunder.cast_hit",
      kind: "damage",
      label: "雷轰电转 / 施放命中",
      sourceActionId: "traveler.electro.burst.bellowing_thunder.cast_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "traveler.dendro.skill.razorgrass_blade",
      characterId: "Traveler",
      id: "traveler.dendro.skill.razorgrass_blade",
      kind: "damage",
      label: "草缘剑",
      sourceActionId: "traveler.dendro.skill.razorgrass_blade",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "traveler.hydro.skill.aquacrest_saber.press.torrential_surge",
      characterId: "Traveler",
      id: "traveler.hydro.skill.aquacrest_saber.press.torrential_surge",
      kind: "damage",
      label: "水纹剑 / 点按喷发激流",
      sourceActionId: "traveler.hydro.skill.aquacrest_saber.press.torrential_surge",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "traveler.pyro.burst.scorching_firestrike.hit.hydro_aura_vaporize",
      characterId: "Traveler",
      id: "traveler.pyro.burst.scorching_firestrike.hit.hydro_aura_vaporize",
      kind: "damage",
      label: "灼火燎原 / 水底蒸发",
      sourceActionId: "traveler.pyro.burst.scorching_firestrike.hit.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "traveler.pyro.burst.scorching_firestrike.hit.cryo_aura_melt",
      characterId: "Traveler",
      id: "traveler.pyro.burst.scorching_firestrike.hit.cryo_aura_melt",
      kind: "damage",
      label: "灼火燎原 / 冰底融化",
      sourceActionId: "traveler.pyro.burst.scorching_firestrike.hit.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "旅行者的六种元素形态互斥；每个动作均由当前构筑的元素变体筛选，并从该变体的性别专属天赋表动态解析参数，不固定 F/M owner。此处只维护 C0 的单次、单段命中：风涡剑初始爆风（skill[2]）、星陨剑爆炸（skill[0]）、雷轰电转施放命中（burst[0]）、草缘剑（skill[0]）、水纹剑点按喷发激流（skill[1]）与灼火燎原一次命中（burst[0]）。草缘剑在突破四后按当前配置的元素精通结算 A4 增伤 min(元素精通 × 0.15%, 15%)。水纹剑的 raw index 1 是 pinned sheet 映射；不含充盈、露滴或生命值消耗。灼火燎原的水底蒸发与冰底融化是同一单次命中的互斥替代项，基础无反应动作仅保留为底层声明、不展示为指标。未模拟循环、状态、元素吸收、层数、随机性、持续命中、天赋外效果、命座、外部增益或时序。",
  label: "旅行者",
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", travelerElement: "anemo", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", travelerElement: "anemo", value: 3 },
    { minimumSourceConstellation: 3, talentSlot: "burst", travelerElement: "geo", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", travelerElement: "geo", value: 3 },
    { minimumSourceConstellation: 3, talentSlot: "burst", travelerElement: "electro", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", travelerElement: "electro", value: 3 },
    { minimumSourceConstellation: 3, talentSlot: "skill", travelerElement: "dendro", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", travelerElement: "dendro", value: 3 },
    { minimumSourceConstellation: 3, talentSlot: "skill", travelerElement: "hydro", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", travelerElement: "hydro", value: 3 },
    { minimumSourceConstellation: 3, talentSlot: "skill", travelerElement: "pyro", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", travelerElement: "pyro", value: 3 }
  ]
}
