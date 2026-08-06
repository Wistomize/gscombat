import type { Element } from "@gscombat/calculator"

export type ElementalResonanceId =
  | "resonance.anemo"
  | "resonance.cryo"
  | "resonance.dendro"
  | "resonance.electro"
  | "resonance.geo"
  | "resonance.hydro"
  | "resonance.protective"
  | "resonance.pyro"

export interface ElementalResonanceDefinition {
  readonly effectLabels: readonly string[]
  readonly element?: Exclude<Element, "physical">
  readonly id: ElementalResonanceId
  readonly label: string
  readonly requiresUniqueElements?: number
}

/** Versioned definitions for every party-composition resonance, including non-damage combat effects. */
export const elementalResonanceDefinitions: readonly ElementalResonanceDefinition[] = [
  {
    effectLabels: ["受到冰元素附着的持续时间下降40%", "攻击力提高25%"],
    element: "pyro",
    id: "resonance.pyro",
    label: "热诚之火"
  },
  {
    effectLabels: ["受到火元素附着的持续时间下降40%", "生命值上限提高25%"],
    element: "hydro",
    id: "resonance.hydro",
    label: "愈疗之水"
  },
  {
    effectLabels: ["体力消耗降低15%", "移动速度提高10%", "技能冷却时间缩短5%"],
    element: "anemo",
    id: "resonance.anemo",
    label: "迅捷之风"
  },
  {
    effectLabels: ["受到水元素附着的持续时间下降40%", "雷元素相关反应产生雷元素微粒，冷却5秒"],
    element: "electro",
    id: "resonance.electro",
    label: "强能之雷"
  },
  {
    effectLabels: ["元素精通提高50", "草元素相关反应可额外提高30与20元素精通，持续6秒且独立计算"],
    element: "dendro",
    id: "resonance.dendro",
    label: "蔓生之草"
  },
  {
    effectLabels: ["受到雷元素附着的持续时间下降40%", "攻击冰元素附着或冻结的敌人时暴击率提高15%"],
    element: "cryo",
    id: "resonance.cryo",
    label: "粉碎之冰"
  },
  {
    effectLabels: ["护盾强效提高15%", "护盾保护或附近存在月笼时伤害提高15%，并使岩元素抗性降低20%"],
    element: "geo",
    id: "resonance.geo",
    label: "坚定之岩"
  },
  {
    effectLabels: ["所有元素抗性与物理抗性提高15%"],
    id: "resonance.protective",
    label: "交织之护",
    requiresUniqueElements: 4
  }
]
