import { describe, expect, it } from "vitest"

import { jeanCombatCoverage } from "./combat.js"

describe("Jean combat content", () => {
  it("declares C4 Dandelion Field's Anemo resistance reduction as an explicit snapshot", () => {
    expect(jeanCombatCoverage.actionEffects).toEqual([
      {
        activation: "active",
        id: "jean.constellation.4.lands_of_dandelion.anemo_resistance_shred",
        label: "蒲公英之风领域内 · C4 蒲公英的国土（风元素抗性降低，40%）",
        source: { characterId: "Jean", kind: "character", minimumSourceConstellation: 4 },
        target: "enemyResistanceReduction",
        targetFilter: { elements: ["anemo"] },
        value: { kind: "fixed", value: 0.4 }
      }
    ])
  })
})
