import { describe, expect, it } from "vitest"

import { kiraraCombatCoverage } from "./combat.js"

describe("Kirara combat content", () => {
  it("declares C6's seven-element party damage bonus as an explicit snapshot", () => {
    expect(kiraraCombatCoverage.actionEffects).toEqual([
      {
        activation: "active",
        id: "kirara.constellation.6.countless_sights_to_see.party_elemental_damage_bonus",
        label: "元素战技或元素爆发施放后 · C6 沿途百景会心（全队所有元素伤害加成，15秒）",
        source: { characterId: "Kirara", kind: "character", minimumSourceConstellation: 6 },
        target: "damageBonus",
        targetFilter: { elements: ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] },
        value: { kind: "fixed", value: 0.12 }
      }
    ])
  })
})
