import type { CharacterDefinition } from "../../types.js"

export const naviaDefinition: CharacterDefinition = {
  catalog: {
    characterId: "Navia",
    label: "娜维娅",
    primaryActionLabels: {
      "navia.burst.as_the_sunlit_skys_singing_salute.initial_aoe": "如同晴天般的霰落 / 初始范围伤害",
      "navia.burst.as_the_sunlit_skys_singing_salute.support_cannonfire": "如同晴天般的霰落 / 单次支援炮击",
      "navia.skill.ceremonial_crystalshot": "典仪式晶火 / 实际命中玫瑰晶弹"
    },
    weaponType: "claymore"
  },
  catalogOrder: 65,
  element: "geo",
  id: "navia",
  name: "Navia"
}
