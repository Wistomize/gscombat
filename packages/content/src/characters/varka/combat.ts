import type {
  CharacterCombatCoverage,
  CombatActionMetadata,
  CombatDamageMetricDefinition
} from "../../combat/types.js"

import { varkaDefinition } from "./definition.js"

const varkaPhecElements = ["cryo", "electro", "hydro", "pyro"] as const
const varkaPhecPriority = ["pyro", "hydro", "electro", "cryo"] as const

type VarkaPhecElement = (typeof varkaPhecElements)[number]

const varkaElementLabels: Readonly<Record<VarkaPhecElement | "anemo", string>> = {
  anemo: "风元素",
  cryo: "冰元素",
  electro: "雷元素",
  hydro: "水元素",
  pyro: "火元素"
}

const varkaC1OriginalDamagePercentParameterId = "c1-lyrical-libation-original-damage-percent"
const varkaA1PartyStateParameterId = "derived-phec-party-state"
const varkaC4DamageBonusEffectIds: Readonly<Record<VarkaPhecElement, string>> = {
  cryo: "varka.constellation.4.song_of_freedom.cryo_swirl.anemo_and_cryo_damage_bonus",
  electro: "varka.constellation.4.song_of_freedom.electro_swirl.anemo_and_electro_damage_bonus",
  hydro: "varka.constellation.4.song_of_freedom.hydro_swirl.anemo_and_hydro_damage_bonus",
  pyro: "varka.constellation.4.song_of_freedom.swirl_triggered.anemo_damage_bonus"
}

const varkaA1PartyStateWeights: Readonly<Record<VarkaPhecElement, number>> = {
  cryo: 1,
  electro: 3,
  hydro: 9,
  pyro: 27
}
const varkaA1AnemoPairWeight = 81
const varkaA1UnlockedWeight = 162
const varkaA1PartyStateMaximum = 323

function resolveVarkaPhecCountCategory(partyState: number, element: VarkaPhecElement): number {
  return Math.floor((partyState % varkaA1UnlockedWeight) / varkaA1PartyStateWeights[element]) % 3
}

function resolveVarkaA1OriginalDamageMultiplier(
  partyState: number,
  actionElement: VarkaPhecElement | "anemo"
): number {
  const priorityElement = varkaPhecPriority.find(
    (element) => resolveVarkaPhecCountCategory(partyState, element) > 0
  )
  if (priorityElement === undefined || (actionElement !== "anemo" && actionElement !== priorityElement)) return 0
  if (partyState < varkaA1UnlockedWeight) return 1

  const formationCount =
    (partyState % varkaA1UnlockedWeight >= varkaA1AnemoPairWeight ? 1 : 0) +
    (resolveVarkaPhecCountCategory(partyState, priorityElement) >= 2 ? 1 : 0)
  if (formationCount === 2) return 2.2
  return formationCount === 1 ? 1.4 : 1
}

const varkaA1OriginalDamageMultiplierValues: Readonly<
  Record<VarkaPhecElement | "anemo", readonly { readonly multiplier: number; readonly parameterValue: number }[]>
> = {
  anemo: createVarkaA1OriginalDamageMultiplierValues("anemo"),
  cryo: createVarkaA1OriginalDamageMultiplierValues("cryo"),
  electro: createVarkaA1OriginalDamageMultiplierValues("electro"),
  hydro: createVarkaA1OriginalDamageMultiplierValues("hydro"),
  pyro: createVarkaA1OriginalDamageMultiplierValues("pyro")
}

function createVarkaA1OriginalDamageMultiplierValues(
  element: VarkaPhecElement | "anemo"
): readonly { readonly multiplier: number; readonly parameterValue: number }[] {
  return Array.from({ length: varkaA1PartyStateMaximum + 1 }, (_, parameterValue) => ({
    multiplier: resolveVarkaA1OriginalDamageMultiplier(parameterValue, element),
    parameterValue
  }))
}

const varkaSpecialActionIds = {
  azureDevour: {
    anemo: "varka.skill.azure_devour.anemo_damage",
    cryo: "varka.skill.azure_devour.corresponding_cryo_damage",
    electro: "varka.skill.azure_devour.corresponding_electro_damage",
    hydro: "varka.skill.azure_devour.corresponding_hydro_damage",
    pyro: "varka.skill.azure_devour.corresponding_pyro_damage"
  },
  fourWindsAscension: {
    anemo: "varka.skill.four_winds_ascension.anemo_damage",
    cryo: "varka.skill.four_winds_ascension.corresponding_cryo_damage",
    electro: "varka.skill.four_winds_ascension.corresponding_electro_damage",
    hydro: "varka.skill.four_winds_ascension.corresponding_hydro_damage",
    pyro: "varka.skill.four_winds_ascension.corresponding_pyro_damage"
  }
} as const

const varkaSpecialActionIdList = [
  ...Object.values(varkaSpecialActionIds.fourWindsAscension),
  ...Object.values(varkaSpecialActionIds.azureDevour)
]

function createVarkaSpecialAction(input: {
  actionId: string
  attackKind?: "charged"
  coefficientParameterId: string
  element: VarkaPhecElement | "anemo"
  hitCount?: number
  parameterIndex: number
  snapshotChecks: readonly [
    { readonly expectedCoefficient: number; readonly talentLevel: number },
    { readonly expectedCoefficient: number; readonly talentLevel: number }
  ]
}): CombatActionMetadata {
  const damagePartId = input.actionId.split(".").slice(-2).join("-")
  return {
    ...(input.attackKind ? { attackKind: input.attackKind } : {}),
    characterId: "Varka",
    damageKind: "direct",
    damageParts: [
      {
        id: damagePartId,
        scalingTerms: [
          {
            coefficientMultiplierScenarioParameterId: varkaC1OriginalDamagePercentParameterId,
            coefficientMultiplierScenarioParameterScale: 0.01,
            coefficientParameterId: input.coefficientParameterId,
            snapshotChecks: input.snapshotChecks,
            stat: "attack"
          }
        ]
      }
    ],
    element: input.element,
    evaluator: "declared_direct",
    id: input.actionId,
    kind: "damage",
    parameterReferences: [
      {
        groupId: "skill",
        id: input.coefficientParameterId,
        parameterIndex: input.parameterIndex,
        source: "talent",
        talentSlot: "skill"
      }
    ],
    scenarioParameters: [
      {
        allowedValues: [100, 200],
        defaultValue: 100,
        id: varkaC1OriginalDamagePercentParameterId,
        label: "歌中的佳酿原本伤害倍率（C1 默认首击 200%，可改回 100%）",
        maximumValue: 100,
        minimumValue: 100,
        rangeBySourceConstellation: [
          { defaultValue: 200, maximumValue: 200, minimumSourceConstellation: 1, minimumValue: 100 }
        ]
      },
      {
        allowedValues: [0],
        defaultValue: 0,
        id: varkaA1PartyStateParameterId,
        label: "右手对应元素与晓风的行军队伍状态（由队伍自动推导）",
        maximumValue: varkaA1PartyStateMaximum,
        minimumValue: 0
      }
    ],
    status: "verified",
    talentSlot: input.attackKind === "charged" ? "normal" : "skill",
    timeline: {
      damageEvents: [
        {
          at: 0,
          coefficientMultiplier: {
            kind: "scenario_parameter_lookup",
            parameterId: varkaA1PartyStateParameterId,
            values: varkaA1OriginalDamageMultiplierValues[input.element]
          },
          damagePartId,
          ...(input.hitCount === undefined ? {} : { hitCount: input.hitCount }),
          id: damagePartId,
          snapshot: "hit"
        }
      ],
      duration: 1
    }
  }
}

function createVarkaDamageMetric(actionId: string, label: string): CombatDamageMetricDefinition {
  return {
    actionId,
    characterId: "Varka",
    id: actionId,
    kind: "damage",
    label,
    sourceActionId: actionId,
    status: "verified",
    target: "enemy"
  }
}

const varkaSpecialActions: readonly CombatActionMetadata[] = [
  createVarkaSpecialAction({
    actionId: varkaSpecialActionIds.fourWindsAscension.anemo,
    coefficientParameterId: "four-winds-ascension-anemo-damage",
    element: "anemo",
    parameterIndex: 14,
    snapshotChecks: [
      { expectedCoefficient: 0.9464, talentLevel: 1 },
      { expectedCoefficient: 1.70352, talentLevel: 10 }
    ]
  }),
  ...varkaPhecElements.map((element) =>
    createVarkaSpecialAction({
      actionId: varkaSpecialActionIds.fourWindsAscension[element],
      coefficientParameterId: "four-winds-ascension-corresponding-element-damage",
      element,
      parameterIndex: 13,
      snapshotChecks: [
        { expectedCoefficient: 1.7576, talentLevel: 1 },
        { expectedCoefficient: 3.16368, talentLevel: 10 }
      ]
    })
  ),
  createVarkaSpecialAction({
    actionId: varkaSpecialActionIds.azureDevour.anemo,
    attackKind: "charged",
    coefficientParameterId: "azure-devour-anemo-damage",
    element: "anemo",
    hitCount: 2,
    parameterIndex: 16,
    snapshotChecks: [
      { expectedCoefficient: 0.504, talentLevel: 1 },
      { expectedCoefficient: 0.9072, talentLevel: 10 }
    ]
  }),
  ...varkaPhecElements.map((element) =>
    createVarkaSpecialAction({
      actionId: varkaSpecialActionIds.azureDevour[element],
      attackKind: "charged",
      coefficientParameterId: "azure-devour-corresponding-element-damage",
      element,
      hitCount: 2,
      parameterIndex: 15,
      snapshotChecks: [
        { expectedCoefficient: 0.936, talentLevel: 1 },
        { expectedCoefficient: 1.6848, talentLevel: 10 }
      ]
    })
  )
]

const varkaSpecialMetrics: readonly CombatDamageMetricDefinition[] = [
  createVarkaDamageMetric(
    varkaSpecialActionIds.fourWindsAscension.anemo,
    "四风将起 / 风元素段（无反应；C2 时含追加风元素攻击）"
  ),
  ...varkaPhecElements.map((element) =>
    createVarkaDamageMetric(
      varkaSpecialActionIds.fourWindsAscension[element],
      `四风将起 / ${varkaElementLabels[element]}段（无反应；按火水雷冰优先级选择）`
    )
  ),
  createVarkaDamageMetric(
    varkaSpecialActionIds.azureDevour.anemo,
    "苍噬 / 风元素两段合计（无反应；C2 时含追加风元素攻击）"
  ),
  ...varkaPhecElements.map((element) =>
    createVarkaDamageMetric(
      varkaSpecialActionIds.azureDevour[element],
      `苍噬 / ${varkaElementLabels[element]}两段合计（无反应；按火水雷冰优先级选择）`
    )
  )
]

export const varkaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Varka",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.654598, talentLevel: 1 },
            { expectedCoefficient: 1.293972, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "varka.normal.auto.first_hit",
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
      characterId: "Varka",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "windbound-execution-press-damage",
          id: "windbound-execution-press",
          snapshotChecks: [
            { expectedCoefficient: 2.784, talentLevel: 1 },
            { expectedCoefficient: 5.0112, talentLevel: 10 }
          ]
        }
      ],
      element: varkaDefinition.element,
      evaluator: "declared_direct",
      id: "varka.skill.windbound_execution.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "windbound-execution-press-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    ...varkaSpecialActions
  ],
  actionEffects: [
    {
      activation: "automatic",
      condition: { elements: ["pyro", "hydro", "electro", "cryo"], kind: "team_element_count", minimum: 1 },
      id: "varka.passive.dawn_winds_march.anemo_damage_bonus",
      label: "晓风的行军 · 基于最终攻击力提升风元素伤害（最高25%）",
      source: { characterId: "Varka", kind: "character", minimumSourceAscension: 1 },
      target: "sourceFinalAttackToDamageBonus",
      targetFilter: { elements: ["anemo"], recipientSourceRelation: "source" },
      value: {
        kind: "source_final_attack",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive1",
            id: "dawn-winds-march-maximum-damage-bonus",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "passive"
          }
        },
        multiplier: {
          kind: "talent_parameter",
          multiplier: 0.001,
          parameter: {
            groupId: "passive1",
            id: "dawn-winds-march-damage-bonus-per-1000-attack",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        }
      }
    },
    ...varkaPhecElements.map((element) => ({
      activation: "automatic" as const,
      condition: { elements: [element], kind: "team_element_count" as const, minimum: 1 },
      id: `varka.passive.dawn_winds_march.${element}_damage_bonus`,
      label: `晓风的行军 · 基于最终攻击力提升${varkaElementLabels[element]}伤害（最高25%）`,
      source: { characterId: "Varka", kind: "character" as const, minimumSourceAscension: 1 },
      target: "sourceFinalAttackToDamageBonus" as const,
      targetFilter: { elements: [element], recipientSourceRelation: "source" as const },
      value: {
        kind: "source_final_attack" as const,
        maximumValue: {
          kind: "talent_parameter" as const,
          parameter: {
            groupId: "passive1" as const,
            id: "dawn-winds-march-maximum-damage-bonus",
            parameterIndex: 1,
            source: "talent" as const,
            talentSlot: "passive" as const
          }
        },
        multiplier: {
          kind: "talent_parameter" as const,
          multiplier: 0.001,
          parameter: {
            groupId: "passive1" as const,
            id: "dawn-winds-march-damage-bonus-per-1000-attack",
            parameterIndex: 0,
            source: "talent" as const,
            talentSlot: "passive" as const
          }
        }
      }
    })),
    {
      actionParameterId: varkaA1PartyStateParameterId,
      activation: "automatic",
      id: "varka.internal.phec_party_state.a1_unlocked",
      label: "晓风的行军 · 固有天赋已解锁（内部队伍状态）",
      source: { characterId: "Varka", kind: "character", minimumSourceAscension: 1 },
      target: "actionParameter",
      targetFilter: { actionIds: varkaSpecialActionIdList, recipientSourceRelation: "source" },
      value: { kind: "fixed", value: varkaA1UnlockedWeight }
    },
    {
      actionParameterId: varkaA1PartyStateParameterId,
      activation: "automatic",
      condition: { elements: ["anemo"], kind: "team_element_count", minimum: 2 },
      id: "varka.internal.phec_party_state.two_anemo",
      label: "队伍中至少2名风元素角色（内部队伍状态）",
      source: { characterId: "Varka", kind: "character" },
      target: "actionParameter",
      targetFilter: { actionIds: varkaSpecialActionIdList, recipientSourceRelation: "source" },
      value: { kind: "fixed", value: varkaA1AnemoPairWeight }
    },
    ...varkaPhecElements.map((element) => ({
      actionParameterId: varkaA1PartyStateParameterId,
      activation: "automatic" as const,
      condition: { elements: [element], kind: "team_element_count" as const, minimum: 1 },
      id: `varka.internal.phec_party_state.has_${element}`,
      label: `队伍中有${varkaElementLabels[element]}角色（内部队伍状态）`,
      source: { characterId: "Varka", kind: "character" as const },
      target: "actionParameter" as const,
      targetFilter: { actionIds: varkaSpecialActionIdList, recipientSourceRelation: "source" as const },
      value: { kind: "fixed" as const, value: varkaA1PartyStateWeights[element] }
    })),
    ...varkaPhecElements.map((element) => ({
      actionParameterId: varkaA1PartyStateParameterId,
      activation: "automatic" as const,
      condition: { elements: [element], kind: "team_element_count" as const, minimum: 2 },
      id: `varka.internal.phec_party_state.two_${element}`,
      label: `队伍中至少2名${varkaElementLabels[element]}角色（内部队伍状态）`,
      source: { characterId: "Varka", kind: "character" as const },
      target: "actionParameter" as const,
      targetFilter: { actionIds: varkaSpecialActionIdList, recipientSourceRelation: "source" as const },
      value: { kind: "fixed" as const, value: varkaA1PartyStateWeights[element] }
    })),
    {
      activation: "maximum_reachable",
      id: "varka.passive.winds_vanguard.four_stacks.damage_bonus",
      label: "风帜的先引 · 苍牙之誓4层（普通攻击、重击、苍噬与四风将起伤害提升30%）",
      source: { characterId: "Varka", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: { actionIds: varkaSpecialActionIdList, recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.3 }
    },
    ...varkaPhecElements.map((element) => ({
      activation: "active" as const,
      exclusivity: { group: "varka-c4-current-reaction-element", variant: element },
      id: varkaC4DamageBonusEffectIds[element],
      label: `因为无人能夺去我们歌唱的自由 · C4 触发${varkaElementLabels[element]}扩散或星扩散（风元素与${varkaElementLabels[element]}伤害加成20%）`,
      source: { characterId: "Varka", kind: "character" as const, minimumSourceConstellation: 4 },
      target: "damageBonus" as const,
      targetFilter: { elements: ["anemo" as const, element] },
      value: { kind: "fixed" as const, value: 0.2 }
    })),
    {
      activation: "automatic",
      condition: { elements: ["pyro", "hydro", "electro", "cryo"], kind: "team_element_count", minimum: 1 },
      id: "varka.constellation.2.journey_at_dawn.additional_anemo_strike.damage",
      label: "待天光破晓，我们便要踏上征途 · C2 追加攻击（800%攻击力风元素伤害）",
      source: { characterId: "Varka", kind: "character", minimumSourceConstellation: 2 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: [varkaSpecialActionIds.fourWindsAscension.anemo, varkaSpecialActionIds.azureDevour.anemo],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 8 },
        element: "anemo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack"
      }
    },
    {
      activation: "maximum_reachable",
      id: "varka.constellation.6.mondstadt_steadfast.four_azure_fang_stacks.crit_damage",
      label: "我心爱的蒙德呀，依然屹立如初 · C6 苍牙之誓4层（暴击伤害提高80%）",
      source: {
        characterId: "Varka",
        kind: "character",
        minimumSourceAscension: 4,
        minimumSourceConstellation: 6
      },
      target: "critDamage",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.8 }
    }
  ],
  characterId: "Varka",
  metrics: [
    ...varkaSpecialMetrics,
    {
      actionId: "varka.skill.windbound_execution.press",
      characterId: "Varka",
      id: "varka.skill.windbound_execution.press",
      kind: "damage",
      label: "烈风终坠 / 点按单次命中（无反应）",
      sourceActionId: "varka.skill.windbound_execution.press",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "法尔伽的四风将起与苍噬按7.0固定数据拆分为对应元素段与风元素段：四风将起分别读取 skill[13] 与 skill[14]，苍噬分别读取 skill[15]×2 与 skill[16]×2。对应元素段由队伍按火、水、雷、冰优先级自动判定，不可能出现的低优先级元素段按0结算；由于当前单个动作只能拥有一种最终元素，双元素总伤害暂以两个独立指标展示，避免把不同元素增伤与抗性错误合并。晓风的行军会依据实际右手元素人数与双风条件自动应用原本伤害100%/140%/220%档位，并按最终攻击力提供最高25%的风元素与对应元素伤害加成；风帜的先引默认按4层加入30%伤害加成。C1默认计算歌中的佳酿首击的200%原本伤害；C2的800%攻击力风元素追加攻击只随两个动作的风元素段各结算一次，且不继承C1原本伤害倍率、风帜的先引或战技/重击限定增伤；C3提高战技等级，C4按所选反应元素同时提供20%风元素与对应元素伤害加成，C5提高爆发等级，C6在4层苍牙之誓下自动提供80%暴击伤害。C1增加一次四风将起可用次数、C6交替免费施放四风将起与苍噬均改变动作次数而非单次公式；在完整循环与跨动作合计建立前，不重复计入单次指标。",
  label: varkaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
