import type { CharacterDefinition } from "../../types.js"

export const xingqiuDefinition: CharacterDefinition = {
  catalog: {
    characterId: "Xingqiu",
    label: "行秋",
    primaryActionLabels: {
      "xingqiu.burst.raincutter.rain_sword.single_volley": "古华剑·裁雨留虹 / 一次雨帘剑齐射（手填数量）",
      "xingqiu.skill.fatal_rainscreen": "画雨笼山 / 双段伤害",
      "xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize": "画雨笼山 / 双段火底蒸发"
    },
    weaponType: "sword"
  },
  catalogOrder: 8,
  element: "hydro",
  id: "xingqiu",
  name: "Xingqiu"
}
