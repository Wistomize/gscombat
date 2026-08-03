import { Value } from "typebox/value"
import { describe, expect, it } from "vitest"

import { CatalogResponseSchema } from "./catalog.js"

describe("CatalogResponseSchema", () => {
  it("accepts active snapshot sources owned by characters, weapons, and artifact sets", () => {
    const catalog = {
      artifactSets: [],
      buffPresets: [],
      characters: [
        {
          characterId: "Xiangling",
          label: "香菱",
          primaryActionIds: ["character", "weapon", "artifact"],
          primaryActions: [
            {
              id: "character",
              label: "角色来源",
              scenarioEffects: [
                {
                  id: "xiangling.guoba.c1.pyro_resistance_shred",
                  label: "锅巴命中 · C1 火元素抗性降低",
                  requiredActiveEffectIds: ["xiangling.skill.guoba"],
                  source: { characterId: "Xiangling", kind: "character", minimumSourceConstellation: 1 }
                }
              ]
            },
            {
              id: "weapon",
              label: "武器来源",
              scenarioEffects: [
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
                }
              ]
            },
            {
              id: "artifact",
              label: "圣遗物来源",
              scenarioEffects: [
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
          ],
          supportMetrics: [
            {
              id: "bennett.burst.field.heal_tick",
              kind: "healing",
              label: "美妙旅程 / 单跳治疗量",
              recipientRequirements: [
                { kind: "recipient_in_source_area", label: "受治疗角色位于美妙旅程领域内" },
                {
                  comparison: "at_most",
                  kind: "recipient_hp_fraction",
                  label: "受治疗角色当前生命值不高于 70%",
                  threshold: 0.7
                }
              ],
              sourceActionId: "bennett.burst.field",
              target: "friendly_recipient"
            }
          ],
          weaponType: "polearm"
        }
      ],
      weapons: []
    }

    expect(Value.Check(CatalogResponseSchema, catalog)).toBe(true)
  })

  it("rejects the removed character-only source fields", () => {
    const catalog = {
      artifactSets: [],
      buffPresets: [],
      characters: [
        {
          characterId: "Xiangling",
          label: "香菱",
          primaryActionIds: ["character"],
          primaryActions: [
            {
              id: "character",
              label: "角色来源",
              scenarioEffects: [
                {
                  id: "xiangling.guoba.chili.attack",
                  label: "绝云朝天椒（已拾取）",
                  sourceCharacterId: "Xiangling"
                }
              ]
            }
          ],
          supportMetrics: [],
          weaponType: "polearm"
        }
      ],
      weapons: []
    }

    expect(Value.Check(CatalogResponseSchema, catalog)).toBe(false)
  })
})
