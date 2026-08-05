import { Value } from "typebox/value"
import { describe, expect, it } from "vitest"

import { ActionEffectOptionsResponseSchema, CatalogResponseSchema } from "./catalog.js"

describe("catalog contracts", () => {
  it("keeps active snapshots outside the lightweight startup catalog", () => {
    const catalog = {
      artifactSets: [],
      buffPresets: [],
      characters: [
        {
          characterId: "Xiangling",
          label: "香菱",
          primaryActionIds: ["character"],
          primaryActions: [{ id: "character", label: "角色来源" }],
          supportMetrics: [],
          weaponType: "polearm"
        }
      ],
      weapons: []
    }

    expect(Value.Check(CatalogResponseSchema, catalog)).toBe(true)
  })

  it("accepts on-demand snapshot sources owned by characters, weapons, and artifact sets", () => {
    const response = {
      options: [
        {
          id: "xiangling.guoba.c1.pyro_resistance_shred",
          label: "锅巴命中 · C1 火元素抗性降低",
          requiredActiveEffectIds: ["xiangling.skill.guoba"],
          source: { characterId: "Xiangling", kind: "character", minimumSourceConstellation: 1 }
        },
        {
          id: "weapon.engulfing-lightning.post-burst-energy-recharge",
          label: "薙草之稻光 · 元素爆发后元素充能效率",
          source: { kind: "weapon", weaponId: "EngulfingLightning" }
        },
        {
          id: "weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent",
          label: "狼的末路 · 低生命值目标命中后的队伍攻击力",
          source: { holder: "party_member", kind: "weapon", weaponId: "WolfsGravestone" }
        },
        {
          id: "weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent",
          label: "讨龙英杰谭 · 切换至当前角色后的10秒内攻击力",
          recipientSourceRelation: "not_source",
          source: { holder: "party_member", kind: "weapon", weaponId: "ThrillingTalesOfDragonSlayers" }
        },
        {
          id: "artifact.noblesse-oblige.4pc-attack",
          label: "昔日宗室之仪 · 四件套攻击力",
          source: {
            holder: "party_member",
            kind: "artifact_set",
            minimumPieces: 4,
            setId: "NoblesseOblige"
          }
        }
      ]
    }

    expect(Value.Check(ActionEffectOptionsResponseSchema, response)).toBe(true)
  })

  it("rejects the removed character-only source fields in an action effect response", () => {
    const response = {
      options: [
        {
          id: "xiangling.guoba.chili.attack",
          label: "绝云朝天椒（已拾取）",
          sourceCharacterId: "Xiangling"
        }
      ]
    }

    expect(Value.Check(ActionEffectOptionsResponseSchema, response)).toBe(false)
  })
})
