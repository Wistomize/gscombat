import { describe, expect, it } from "vitest"

import { amberCombatCoverage } from "./combat.js"

describe("Amber combat content", () => {
  it("declares C2 and C6 snapshots with their exact scopes", () => {
    expect(amberCombatCoverage.actionEffects).toEqual([
      {
        activation: "active",
        id: "amber.constellation.2.bunny_triggered.manual_baron_bunny_detonation.damage_bonus",
        label: "一触即发 · C2 满蓄力瞄准射击命中兔兔伯爵脚部并主动引爆（本次爆炸伤害加成200%）",
        source: { characterId: "Amber", kind: "character", minimumSourceConstellation: 2 },
        target: "damageBonus",
        targetFilter: {
          actionIds: ["amber.skill.explosive_puppet.baron_bunny.explosion"],
          recipientSourceRelation: "source"
        },
        value: { kind: "fixed", value: 2 }
      },
      {
        activation: "active",
        id: "amber.constellation.6.wildfire.party_attack_percent",
        label: "箭雨施放后 · C6 疾如野火（全队攻击力提升，10秒）",
        source: { characterId: "Amber", kind: "character", minimumSourceConstellation: 6 },
        target: "attackPercent",
        value: { kind: "fixed", value: 0.15 }
      }
    ])
  })
})
