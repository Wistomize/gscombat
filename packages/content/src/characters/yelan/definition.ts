import type { CharacterDefinition } from "../../types.js"

export const yelanDefinition: CharacterDefinition = {
  catalog: {
    characterId: "Yelan",
    label: "夜兰",
    primaryActionLabels: {
      "yelan.burst.exquisite_throw.single_wave": "渊图玲珑骰 / 玄掷玲珑一轮三箭",
      "yelan.skill.lingering_lifeline.explosion": "萦络纵命索 / 生命之线爆发"
    },
    weaponType: "bow"
  },
  catalogOrder: 3,
  element: "hydro",
  id: "yelan",
  name: "Yelan"
}
