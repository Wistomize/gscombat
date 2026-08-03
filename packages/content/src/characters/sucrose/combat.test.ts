import { describe, expect, it } from "vitest"

import { sucroseCombatCoverage } from "./combat.js"

describe("Sucrose combat content", () => {
  it("declares C6 absorbed-element bonuses as four exclusive party snapshots", () => {
    const constellationEffects = sucroseCombatCoverage.actionEffects?.filter(
      (effect) => effect.source.kind === "character" && effect.source.minimumSourceConstellation === 6
    )
    expect(constellationEffects).toEqual([
      {
        activation: "active",
        exclusivity: { group: "sucrose-chaotic-entropy-c6-absorbed-element", variant: "pyro" },
        id: "sucrose.constellation.6.chaotic_entropy.pyro_damage_bonus",
        label: "禁·风灵作成·柒伍同构贰型发生火元素转化后 · C6 混元熵增论（火元素伤害加成，8秒）",
        source: { characterId: "Sucrose", kind: "character", minimumSourceConstellation: 6 },
        target: "damageBonus",
        targetFilter: { elements: ["pyro"] },
        value: { kind: "fixed", value: 0.2 }
      },
      {
        activation: "active",
        exclusivity: { group: "sucrose-chaotic-entropy-c6-absorbed-element", variant: "hydro" },
        id: "sucrose.constellation.6.chaotic_entropy.hydro_damage_bonus",
        label: "禁·风灵作成·柒伍同构贰型发生水元素转化后 · C6 混元熵增论（水元素伤害加成，8秒）",
        source: { characterId: "Sucrose", kind: "character", minimumSourceConstellation: 6 },
        target: "damageBonus",
        targetFilter: { elements: ["hydro"] },
        value: { kind: "fixed", value: 0.2 }
      },
      {
        activation: "active",
        exclusivity: { group: "sucrose-chaotic-entropy-c6-absorbed-element", variant: "electro" },
        id: "sucrose.constellation.6.chaotic_entropy.electro_damage_bonus",
        label: "禁·风灵作成·柒伍同构贰型发生雷元素转化后 · C6 混元熵增论（雷元素伤害加成，8秒）",
        source: { characterId: "Sucrose", kind: "character", minimumSourceConstellation: 6 },
        target: "damageBonus",
        targetFilter: { elements: ["electro"] },
        value: { kind: "fixed", value: 0.2 }
      },
      {
        activation: "active",
        exclusivity: { group: "sucrose-chaotic-entropy-c6-absorbed-element", variant: "cryo" },
        id: "sucrose.constellation.6.chaotic_entropy.cryo_damage_bonus",
        label: "禁·风灵作成·柒伍同构贰型发生冰元素转化后 · C6 混元熵增论（冰元素伤害加成，8秒）",
        source: { characterId: "Sucrose", kind: "character", minimumSourceConstellation: 6 },
        target: "damageBonus",
        targetFilter: { elements: ["cryo"] },
        value: { kind: "fixed", value: 0.2 }
      }
    ])
  })
})
