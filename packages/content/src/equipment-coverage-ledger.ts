import type { CatalogWeaponType } from "./catalog-presentation.js"
import { artifactSetInventory, weaponInventory } from "./equipment-inventory.js"

export type EquipmentCoverageStatus = "implemented" | "not_applicable" | "unsupported" | "unreviewed"

export type EquipmentCoverageEffectSource =
  | { readonly kind: "weapon"; readonly weaponId: string }
  | {
      readonly holder?: "party_member" | "primary"
      readonly kind: "artifact_set"
      readonly minimumPieces: number
      readonly setId: string
    }

interface EquipmentCoverageClauseBase {
  readonly id: string
  readonly label: string
  readonly source: EquipmentCoverageEffectSource
}

/** One manually reviewed passive clause that is represented by maintained typed action effects. */
export interface ImplementedEquipmentCoverageClause extends EquipmentCoverageClauseBase {
  readonly effectIds: readonly string[]
  readonly status: "implemented"
}

/** One reviewed clause that cannot alter the selected single-core-action metric. */
export interface NotApplicableEquipmentCoverageClause extends EquipmentCoverageClauseBase {
  readonly reason: string
  readonly status: "not_applicable"
}

/** One reviewed clause whose exact behavior needs a capability the current model does not own. */
export interface UnsupportedEquipmentCoverageClause extends EquipmentCoverageClauseBase {
  readonly reason: string
  readonly requiredCapability: string
  readonly status: "unsupported"
}

/** One inventory record whose passive wording and mechanics have not yet undergone maintainer review. */
export interface UnreviewedEquipmentCoverageClause extends EquipmentCoverageClauseBase {
  readonly reason: string
  readonly status: "unreviewed"
}

export type EquipmentCoverageClause =
  | ImplementedEquipmentCoverageClause
  | NotApplicableEquipmentCoverageClause
  | UnsupportedEquipmentCoverageClause
  | UnreviewedEquipmentCoverageClause

/** One passive clause that is complete enough to expose through the current single-core-action catalog. */
export type PublishedEquipmentCoverageClause =
  | ImplementedEquipmentCoverageClause
  | NotApplicableEquipmentCoverageClause

/** One full-inventory equipment record and its independently auditable passive clauses. */
export interface EquipmentCoverageEntry {
  readonly clauses: readonly [EquipmentCoverageClause, ...EquipmentCoverageClause[]]
  readonly equipmentId: string
  readonly kind: "artifact_set" | "weapon"
}

/** One released weapon that is fully reviewed and available for character configuration. */
export interface PublishedWeapon {
  readonly label: string
  readonly rarity: 3 | 4 | 5
  readonly weaponId: string
  readonly weaponType: CatalogWeaponType
}

/** One released artifact set that is fully reviewed for the current single-core-action analyzer. */
export interface PublishedArtifactSet {
  readonly label: string
  readonly setId: string
}

const unreviewedReason = "尚未逐条审计该装备被动；不会作为当前发布目录中的可计算装备。"

function toKebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase()
}

function weaponSource(weaponId: string, holder?: "party_member" | "primary"): EquipmentCoverageEffectSource {
  return { ...(holder === undefined ? {} : { holder }), kind: "weapon", weaponId }
}

function artifactSource(
  setId: string,
  minimumPieces: number,
  holder?: "party_member" | "primary"
): EquipmentCoverageEffectSource {
  return { ...(holder === undefined ? {} : { holder }), kind: "artifact_set", minimumPieces, setId }
}

function unreviewedWeaponEntry(weapon: (typeof weaponInventory)[number]): EquipmentCoverageEntry {
  const slug = toKebabCase(weapon.id)
  return {
    clauses: [
      {
        id: `weapon.${slug}.passive.unreviewed`,
        label: `${weapon.label} · 被动效果（待审计）`,
        reason: unreviewedReason,
        source: weaponSource(weapon.id),
        status: "unreviewed"
      }
    ],
    equipmentId: weapon.id,
    kind: "weapon"
  }
}

function unreviewedArtifactSetEntry(artifactSet: (typeof artifactSetInventory)[number]): EquipmentCoverageEntry {
  const slug = toKebabCase(artifactSet.id)
  const clauses = artifactSet.setBonuses.map((minimumPieces) => ({
    id: `artifact.${slug}.${minimumPieces}pc.unreviewed`,
    label: `${artifactSet.label} · ${minimumPieces}件套（待审计）`,
    reason: unreviewedReason,
    source: artifactSource(artifactSet.id, minimumPieces),
    status: "unreviewed" as const
  }))
  if (clauses.length === 0) throw new Error(`Artifact set ${artifactSet.id} has no set-bonus clauses to audit`)
  return {
    clauses: clauses as [EquipmentCoverageClause, ...EquipmentCoverageClause[]],
    equipmentId: artifactSet.id,
    kind: "artifact_set"
  }
}

const reviewedCoverageByEquipmentId = new Map<string, EquipmentCoverageEntry>([
  [
    "AquaSimulacra",
    {
      clauses: [
        {
          effectIds: ["weapon.aqua-simulacra.hp-percent", "weapon.aqua-simulacra.nearby-enemy-damage-bonus"],
          id: "weapon.aqua-simulacra.passive",
          label: "若水 · 洗濯诸类之形",
          source: weaponSource("AquaSimulacra"),
          status: "implemented"
        }
      ],
      equipmentId: "AquaSimulacra",
      kind: "weapon"
    }
  ],
  [
    "AquilaFavonia",
    {
      clauses: [
        {
          effectIds: ["weapon.aquila-favonia.attack"],
          id: "weapon.aquila-favonia.attack",
          label: "风鹰剑 · 西风之鹰的抗争",
          source: weaponSource("AquilaFavonia"),
          status: "implemented"
        },
        {
          id: "weapon.aquila-favonia.retaliation",
          label: "风鹰剑 · 西风之鹰的抗争（受击反击）",
          reason: "需要受击事件、冷却和独立物理伤害段；不属于当前角色核心动作的一次命中。",
          source: weaponSource("AquilaFavonia"),
          status: "not_applicable"
        }
      ],
      equipmentId: "AquilaFavonia",
      kind: "weapon"
    }
  ],
  [
    "Deathmatch",
    {
      clauses: [
        {
          effectIds: [
            "weapon.deathmatch.single-target.attack",
            "weapon.deathmatch.multi-target.attack",
            "weapon.deathmatch.multi-target.defense"
          ],
          id: "weapon.deathmatch.attack",
          label: "决斗之枪 · 角斗士",
          source: weaponSource("Deathmatch"),
          status: "implemented"
        }
      ],
      equipmentId: "Deathmatch",
      kind: "weapon"
    }
  ],
  [
    "EngulfingLightning",
    {
      clauses: [
        {
          effectIds: [
            "weapon.engulfing-lightning.energy-recharge-to-attack",
            "weapon.engulfing-lightning.post-burst-energy-recharge"
          ],
          id: "weapon.engulfing-lightning.passive",
          label: "薙草之稻光 · 非时之梦·常世灶食",
          source: weaponSource("EngulfingLightning"),
          status: "implemented"
        }
      ],
      equipmentId: "EngulfingLightning",
      kind: "weapon"
    }
  ],
  [
    "FavoniusWarbow",
    {
      clauses: [
        {
          id: "weapon.favonius-warbow.particles",
          label: "西风猎弓 · 顺风而行",
          reason: "暴击产球影响循环充能，需要暴击事件、冷却、前后台和接球者模型。",
          source: weaponSource("FavoniusWarbow"),
          status: "not_applicable"
        }
      ],
      equipmentId: "FavoniusWarbow",
      kind: "weapon"
    }
  ],
  [
    "FavoniusGreatsword",
    {
      clauses: [
        {
          id: "weapon.favonius-greatsword.particles",
          label: "西风大剑 · 顺风而行",
          reason: "暴击产球影响循环充能，需要暴击事件、冷却、前后台和接球者模型。",
          source: weaponSource("FavoniusGreatsword"),
          status: "not_applicable"
        }
      ],
      equipmentId: "FavoniusGreatsword",
      kind: "weapon"
    }
  ],
  [
    "FavoniusCodex",
    {
      clauses: [
        {
          id: "weapon.favonius-codex.particles",
          label: "西风秘典 · 顺风而行",
          reason: "暴击产球影响循环充能，需要暴击事件、冷却、前后台和接球者模型。",
          source: weaponSource("FavoniusCodex"),
          status: "not_applicable"
        }
      ],
      equipmentId: "FavoniusCodex",
      kind: "weapon"
    }
  ],
  [
    "FavoniusLance",
    {
      clauses: [
        {
          id: "weapon.favonius-lance.particles",
          label: "西风长枪 · 顺风而行",
          reason: "暴击产球影响循环充能，需要暴击事件、冷却、前后台和接球者模型。",
          source: weaponSource("FavoniusLance"),
          status: "not_applicable"
        }
      ],
      equipmentId: "FavoniusLance",
      kind: "weapon"
    }
  ],
  [
    "FavoniusSword",
    {
      clauses: [
        {
          id: "weapon.favonius-sword.particles",
          label: "西风剑 · 顺风而行",
          reason: "暴击产球影响循环充能，需要暴击事件、冷却、前后台和接球者模型。",
          source: weaponSource("FavoniusSword"),
          status: "not_applicable"
        }
      ],
      equipmentId: "FavoniusSword",
      kind: "weapon"
    }
  ],
  [
    "SacrificialSword",
    {
      clauses: [
        {
          id: "weapon.sacrificial-sword.cooldown-reset",
          label: "祭礼剑 · 气定神闲",
          reason: "元素战技冷却重置不改变本次命中伤害，价值属于额外施放与循环。",
          source: weaponSource("SacrificialSword"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SacrificialSword",
      kind: "weapon"
    }
  ],
  [
    "SacrificialBow",
    {
      clauses: [
        {
          id: "weapon.sacrificial-bow.cooldown-reset",
          label: "祭礼弓 · 气定神闲",
          reason: "元素战技冷却重置不改变本次命中伤害，价值属于额外施放与循环。",
          source: weaponSource("SacrificialBow"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SacrificialBow",
      kind: "weapon"
    }
  ],
  [
    "SacrificialFragments",
    {
      clauses: [
        {
          id: "weapon.sacrificial-fragments.cooldown-reset",
          label: "祭礼残章 · 气定神闲",
          reason: "元素战技冷却重置不改变本次命中伤害，价值属于额外施放与循环。",
          source: weaponSource("SacrificialFragments"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SacrificialFragments",
      kind: "weapon"
    }
  ],
  [
    "SacrificialGreatsword",
    {
      clauses: [
        {
          id: "weapon.sacrificial-greatsword.cooldown-reset",
          label: "祭礼大剑 · 气定神闲",
          reason: "元素战技冷却重置不改变本次命中伤害，价值属于额外施放与循环。",
          source: weaponSource("SacrificialGreatsword"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SacrificialGreatsword",
      kind: "weapon"
    }
  ],
  [
    "SkywardSpine",
    {
      clauses: [
        {
          effectIds: ["weapon.skyward-spine.crit-rate", "weapon.skyward-spine.vacuum-blade"],
          id: "weapon.skyward-spine.passive",
          label: "天空之脊 · 黑翼",
          source: weaponSource("SkywardSpine"),
          status: "implemented"
        },
        {
          id: "weapon.skyward-spine.attack-speed",
          label: "天空之脊 · 黑翼（普通攻击速度）",
          reason: "攻击速度不改变当前核心动作的单次期望伤害，需循环时间模型。",
          source: weaponSource("SkywardSpine"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SkywardSpine",
      kind: "weapon"
    }
  ],
  [
    "TheCatch",
    {
      clauses: [
        {
          effectIds: ["weapon.the-catch.burst-crit-rate", "weapon.the-catch.burst-damage-bonus"],
          id: "weapon.the-catch.burst",
          label: "「渔获」· 船歌",
          source: weaponSource("TheCatch"),
          status: "implemented"
        }
      ],
      equipmentId: "TheCatch",
      kind: "weapon"
    }
  ],
  [
    "WavebreakersFin",
    {
      clauses: [
        {
          effectIds: ["weapon.wavebreakers-fin.burst-damage-bonus"],
          id: "weapon.wavebreakers-fin.burst",
          label: "断浪长鳍 · 驭浪的海祇民",
          source: weaponSource("WavebreakersFin"),
          status: "implemented"
        }
      ],
      equipmentId: "WavebreakersFin",
      kind: "weapon"
    }
  ],
  [
    "FesteringDesire",
    {
      clauses: [
        {
          effectIds: ["weapon.festering-desire.skill-damage-bonus"],
          id: "weapon.festering-desire.skill-damage-bonus",
          label: "腐殖之剑 · 元素战技伤害",
          source: weaponSource("FesteringDesire"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.festering-desire.skill-crit-rate"],
          id: "weapon.festering-desire.skill-crit-rate",
          label: "腐殖之剑 · 元素战技暴击率",
          source: weaponSource("FesteringDesire"),
          status: "implemented"
        }
      ],
      equipmentId: "FesteringDesire",
      kind: "weapon"
    }
  ],
  [
    "TheBlackSword",
    {
      clauses: [
        {
          effectIds: ["weapon.the-black-sword.normal-charged-damage-bonus"],
          id: "weapon.the-black-sword.normal-charged-damage-bonus",
          label: "黑剑 · 普通攻击与重击伤害",
          source: weaponSource("TheBlackSword"),
          status: "implemented"
        },
        {
          id: "weapon.the-black-sword.normal-charged-crit-healing",
          label: "黑剑 · 普通攻击与重击暴击治疗",
          reason: "普通攻击与重击暴击后的治疗不进入当前角色核心动作伤害。",
          source: weaponSource("TheBlackSword"),
          status: "not_applicable"
        }
      ],
      equipmentId: "TheBlackSword",
      kind: "weapon"
    }
  ],
  [
    "KatsuragikiriNagamasa",
    {
      clauses: [
        {
          effectIds: ["weapon.katsuragikiri-nagamasa.skill-damage-bonus"],
          id: "weapon.katsuragikiri-nagamasa.skill-damage-bonus",
          label: "桂木斩长正 · 元素战技伤害",
          source: weaponSource("KatsuragikiriNagamasa"),
          status: "implemented"
        },
        {
          id: "weapon.katsuragikiri-nagamasa.skill-energy-cycle",
          label: "桂木斩长正 · 元素战技后元素能量流转",
          reason: "元素能量消耗与分段恢复改变后续循环资源，不改变当前核心动作的一次期望伤害。",
          source: weaponSource("KatsuragikiriNagamasa"),
          status: "not_applicable"
        }
      ],
      equipmentId: "KatsuragikiriNagamasa",
      kind: "weapon"
    }
  ],
  [
    "KitainCrossSpear",
    {
      clauses: [
        {
          effectIds: ["weapon.kitain-cross-spear.skill-damage-bonus"],
          id: "weapon.kitain-cross-spear.skill-damage-bonus",
          label: "喜多院十文字 · 元素战技伤害",
          source: weaponSource("KitainCrossSpear"),
          status: "implemented"
        },
        {
          id: "weapon.kitain-cross-spear.skill-energy-cycle",
          label: "喜多院十文字 · 元素战技后元素能量流转",
          reason: "元素能量消耗与分段恢复改变后续循环资源，不改变当前核心动作的一次期望伤害。",
          source: weaponSource("KitainCrossSpear"),
          status: "not_applicable"
        }
      ],
      equipmentId: "KitainCrossSpear",
      kind: "weapon"
    }
  ],
  [
    "LuxuriousSeaLord",
    {
      clauses: [
        {
          effectIds: ["weapon.luxurious-sea-lord.burst-damage-bonus"],
          id: "weapon.luxurious-sea-lord.burst-damage-bonus",
          label: "衔珠海皇 · 元素爆发伤害",
          source: weaponSource("LuxuriousSeaLord"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.luxurious-sea-lord.tuna-impact"],
          id: "weapon.luxurious-sea-lord.tuna-impact",
          label: "衔珠海皇 · 大鲔冲击（本次元素爆发命中且15秒冷却已就绪）",
          source: weaponSource("LuxuriousSeaLord"),
          status: "implemented"
        }
      ],
      equipmentId: "LuxuriousSeaLord",
      kind: "weapon"
    }
  ],
  [
    "SkywardPride",
    {
      clauses: [
        {
          effectIds: ["weapon.skyward-pride.damage-bonus"],
          id: "weapon.skyward-pride.damage-bonus",
          label: "天空之傲 · 造成的伤害",
          source: weaponSource("SkywardPride"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.skyward-pride.vacuum-blade"],
          id: "weapon.skyward-pride.vacuum-blade",
          label: "天空之傲 · 真空刃（元素爆发后，本次命中可触发）",
          source: weaponSource("SkywardPride"),
          status: "implemented"
        }
      ],
      equipmentId: "SkywardPride",
      kind: "weapon"
    }
  ],
  [
    "WhiteTassel",
    {
      clauses: [
        {
          effectIds: ["weapon.white-tassel.normal-damage-bonus"],
          id: "weapon.white-tassel.normal-damage-bonus",
          label: "白缨枪 · 普通攻击伤害",
          source: weaponSource("WhiteTassel"),
          status: "implemented"
        }
      ],
      equipmentId: "WhiteTassel",
      kind: "weapon"
    }
  ],
  [
    "TheStringless",
    {
      clauses: [
        {
          effectIds: ["weapon.the-stringless.skill-burst-damage-bonus"],
          id: "weapon.the-stringless.skill-burst-damage-bonus",
          label: "绝弦 · 元素战技与元素爆发伤害",
          source: weaponSource("TheStringless"),
          status: "implemented"
        }
      ],
      equipmentId: "TheStringless",
      kind: "weapon"
    }
  ],
  [
    "Rust",
    {
      clauses: [
        {
          effectIds: ["weapon.rust.normal-damage-bonus"],
          id: "weapon.rust.normal-damage-bonus",
          label: "弓藏 · 普通攻击伤害",
          source: weaponSource("Rust"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.rust.charged-damage-penalty"],
          id: "weapon.rust.charged-damage-penalty",
          label: "弓藏 · 重击伤害降低",
          source: weaponSource("Rust"),
          status: "implemented"
        }
      ],
      equipmentId: "Rust",
      kind: "weapon"
    }
  ],
  [
    "MouunsMoon",
    {
      clauses: [
        {
          effectIds: ["weapon.mouuns-moon.burst-damage-bonus"],
          id: "weapon.mouuns-moon.burst-damage-bonus",
          label: "曚云之月 · 全队元素能量上限",
          source: weaponSource("MouunsMoon"),
          status: "implemented"
        }
      ],
      equipmentId: "MouunsMoon",
      kind: "weapon"
    }
  ],
  [
    "RavenBow",
    {
      clauses: [
        {
          effectIds: ["weapon.raven-bow.hydro-or-pyro-aura.damage-bonus"],
          id: "weapon.raven-bow.hydro-or-pyro-aura.damage-bonus",
          label: "鸦羽弓 · 当前目标受水元素或火元素影响",
          source: weaponSource("RavenBow"),
          status: "implemented"
        }
      ],
      equipmentId: "RavenBow",
      kind: "weapon"
    }
  ],
  [
    "MagicGuide",
    {
      clauses: [
        {
          effectIds: ["weapon.magic-guide.hydro-or-electro-aura.damage-bonus"],
          id: "weapon.magic-guide.hydro-or-electro-aura.damage-bonus",
          label: "魔导绪论 · 当前目标受水元素或雷元素影响",
          source: weaponSource("MagicGuide"),
          status: "implemented"
        }
      ],
      equipmentId: "MagicGuide",
      kind: "weapon"
    }
  ],
  [
    "EmeraldOrb",
    {
      clauses: [
        {
          effectIds: ["weapon.emerald-orb.after-hydro-reaction.attack-percent"],
          id: "weapon.emerald-orb.after-hydro-reaction.attack-percent",
          label: "翡玉法球 · 触发指定水元素相关反应后",
          source: weaponSource("EmeraldOrb"),
          status: "implemented"
        }
      ],
      equipmentId: "EmeraldOrb",
      kind: "weapon"
    }
  ],
  [
    "SolarPearl",
    {
      clauses: [
        {
          effectIds: ["weapon.solar-pearl.after-normal-hit.skill-burst-damage-bonus"],
          id: "weapon.solar-pearl.after-normal-hit.skill-burst-damage-bonus",
          label: "匣里日月 · 普通攻击命中后（元素战技与元素爆发伤害）",
          source: weaponSource("SolarPearl"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.solar-pearl.after-skill-or-burst-hit.normal-damage-bonus"],
          id: "weapon.solar-pearl.after-skill-or-burst-hit.normal-damage-bonus",
          label: "匣里日月 · 元素战技或元素爆发命中后（普通攻击伤害）",
          source: weaponSource("SolarPearl"),
          status: "implemented"
        }
      ],
      equipmentId: "SolarPearl",
      kind: "weapon"
    }
  ],
  [
    "DodocoTales",
    {
      clauses: [
        {
          effectIds: ["weapon.dodoco-tales.after-normal-hit.charged-damage-bonus"],
          id: "weapon.dodoco-tales.after-normal-hit.charged-damage-bonus",
          label: "嘟嘟可故事集 · 普通攻击命中后（重击伤害）",
          source: weaponSource("DodocoTales"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.dodoco-tales.after-charged-hit.attack-percent"],
          id: "weapon.dodoco-tales.after-charged-hit.attack-percent",
          label: "嘟嘟可故事集 · 重击命中后（攻击力）",
          source: weaponSource("DodocoTales"),
          status: "implemented"
        }
      ],
      equipmentId: "DodocoTales",
      kind: "weapon"
    }
  ],
  [
    "OathswornEye",
    {
      clauses: [
        {
          effectIds: ["weapon.oathsworn-eye.after-skill.energy-recharge"],
          id: "weapon.oathsworn-eye.after-skill.energy-recharge",
          label: "证誓之明瞳 · 施放元素战技后",
          source: weaponSource("OathswornEye"),
          status: "implemented"
        }
      ],
      equipmentId: "OathswornEye",
      kind: "weapon"
    }
  ],
  [
    "DawningFrost",
    {
      clauses: [
        {
          effectIds: [
            "weapon.dawning-frost.after-charged-hit.elemental-mastery",
            "weapon.dawning-frost.after-skill-hit.elemental-mastery"
          ],
          id: "weapon.dawning-frost.elemental-mastery-windows",
          label: "霜辰 · 不凋之约",
          source: weaponSource("DawningFrost"),
          status: "implemented"
        }
      ],
      equipmentId: "DawningFrost",
      kind: "weapon"
    }
  ],
  [
    "ElegyForTheEnd",
    {
      clauses: [
        {
          effectIds: ["weapon.elegy-for-the-end.self-elemental-mastery"],
          id: "weapon.elegy-for-the-end.self-elemental-mastery",
          label: "终末嗟叹之诗 · 不羁的千风（自身元素精通）",
          source: weaponSource("ElegyForTheEnd"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.elegy-for-the-end.full-sigil.party-attack-percent",
            "weapon.elegy-for-the-end.full-sigil.party-elemental-mastery"
          ],
          id: "weapon.elegy-for-the-end.four-sigil-team-buff",
          label: "终末嗟叹之诗 · 千年的大乐章·别离之歌",
          source: weaponSource("ElegyForTheEnd"),
          status: "implemented"
        }
      ],
      equipmentId: "ElegyForTheEnd",
      kind: "weapon"
    }
  ],
  [
    "EtherlightSpindlelute",
    {
      clauses: [
        {
          effectIds: ["weapon.etherlight-spindlelute.after-skill.elemental-mastery"],
          id: "weapon.etherlight-spindlelute.after-skill.elemental-mastery",
          label: "天光的纺琴 · 施放元素战技后",
          source: weaponSource("EtherlightSpindlelute"),
          status: "implemented"
        }
      ],
      equipmentId: "EtherlightSpindlelute",
      kind: "weapon"
    }
  ],
  [
    "FlameForgedInsight",
    {
      clauses: [
        {
          effectIds: ["weapon.flame-forged-insight.after-listed-reaction.elemental-mastery"],
          id: "weapon.flame-forged-insight.after-listed-reaction.elemental-mastery",
          label: "拾慧铸熔 · 触发指定元素反应后",
          source: weaponSource("FlameForgedInsight"),
          status: "implemented"
        },
        {
          id: "weapon.flame-forged-insight.energy-restoration",
          label: "拾慧铸熔 · 元素能量恢复",
          reason: "元素能量恢复影响循环资源，不改变当前已选核心动作的一次期望伤害。",
          source: weaponSource("FlameForgedInsight"),
          status: "not_applicable"
        }
      ],
      equipmentId: "FlameForgedInsight",
      kind: "weapon"
    }
  ],
  [
    "KingsSquire",
    {
      clauses: [
        {
          effectIds: ["weapon.kings-squire.after-skill-or-burst.elemental-mastery"],
          id: "weapon.kings-squire.after-skill-or-burst.elemental-mastery",
          label: "王下近侍 · 施放元素战技或元素爆发后",
          source: weaponSource("KingsSquire"),
          status: "implemented"
        },
        {
          id: "weapon.kings-squire.leaf-expiration-damage",
          label: "王下近侍 · 伽陀般度叶消失后的攻击力伤害",
          reason: "延迟伤害发生在效果结束或切换角色后，不属于当前选定核心动作的一次命中。",
          source: weaponSource("KingsSquire"),
          status: "not_applicable"
        }
      ],
      equipmentId: "KingsSquire",
      kind: "weapon"
    }
  ],
  [
    "StarcallersWatch",
    {
      clauses: [
        {
          effectIds: ["weapon.starcallers-watch.elemental-mastery", "weapon.starcallers-watch.shielded.damage-bonus"],
          id: "weapon.starcallers-watch.passive",
          label: "祭星者之望 · 星芒的显迹",
          source: weaponSource("StarcallersWatch"),
          status: "implemented"
        }
      ],
      equipmentId: "StarcallersWatch",
      kind: "weapon"
    }
  ],
  [
    "SunnyMorningSleepIn",
    {
      clauses: [
        {
          effectIds: [
            "weapon.sunny-morning-sleep-in.after-swirl.elemental-mastery",
            "weapon.sunny-morning-sleep-in.after-skill-hit.elemental-mastery",
            "weapon.sunny-morning-sleep-in.after-burst-hit.elemental-mastery"
          ],
          id: "weapon.sunny-morning-sleep-in.elemental-mastery-windows",
          label: "寝正月初晴 · 三种元素精通窗口",
          source: weaponSource("SunnyMorningSleepIn"),
          status: "implemented"
        }
      ],
      equipmentId: "SunnyMorningSleepIn",
      kind: "weapon"
    }
  ],
  [
    "CalamityOfEshu",
    {
      clauses: [
        {
          effectIds: [
            "weapon.calamity-of-eshu.shielded.normal-charged-damage-bonus",
            "weapon.calamity-of-eshu.shielded.normal-charged-crit-rate"
          ],
          id: "weapon.calamity-of-eshu.shielded.normal-charged",
          label: "厄水之祸 · 当前角色处于护盾庇护下（普通攻击与重击）",
          source: weaponSource("CalamityOfEshu"),
          status: "implemented"
        }
      ],
      equipmentId: "CalamityOfEshu",
      kind: "weapon"
    }
  ],
  [
    "EarthShaker",
    {
      clauses: [
        {
          effectIds: ["weapon.earth-shaker.after-pyro-related-reaction.skill-damage-bonus"],
          id: "weapon.earth-shaker.after-pyro-related-reaction.skill-damage-bonus",
          label: "撼地者 · 队伍触发火元素相关反应后（元素战技伤害）",
          source: weaponSource("EarthShaker"),
          status: "implemented"
        }
      ],
      equipmentId: "EarthShaker",
      kind: "weapon"
    }
  ],
  [
    "FleuveCendreFerryman",
    {
      clauses: [
        {
          effectIds: ["weapon.fleuve-cendre-ferryman.skill-crit-rate"],
          id: "weapon.fleuve-cendre-ferryman.skill-crit-rate",
          label: "灰河渡手 · 元素战技暴击率",
          source: weaponSource("FleuveCendreFerryman"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.fleuve-cendre-ferryman.after-skill.energy-recharge"],
          id: "weapon.fleuve-cendre-ferryman.after-skill.energy-recharge",
          label: "灰河渡手 · 施放元素战技后",
          source: weaponSource("FleuveCendreFerryman"),
          status: "implemented"
        }
      ],
      equipmentId: "FleuveCendreFerryman",
      kind: "weapon"
    }
  ],
  [
    "FluteOfEzpitzal",
    {
      clauses: [
        {
          effectIds: ["weapon.flute-of-ezpitzal.after-skill.defense-percent"],
          id: "weapon.flute-of-ezpitzal.after-skill.defense-percent",
          label: "息燧之笛 · 施放元素战技后",
          source: weaponSource("FluteOfEzpitzal"),
          status: "implemented"
        }
      ],
      equipmentId: "FluteOfEzpitzal",
      kind: "weapon"
    }
  ],
  [
    "FootprintOfTheRainbow",
    {
      clauses: [
        {
          effectIds: ["weapon.footprint-of-the-rainbow.after-skill.defense-percent"],
          id: "weapon.footprint-of-the-rainbow.after-skill.defense-percent",
          label: "虹的行迹 · 施放元素战技后",
          source: weaponSource("FootprintOfTheRainbow"),
          status: "implemented"
        }
      ],
      equipmentId: "FootprintOfTheRainbow",
      kind: "weapon"
    }
  ],
  [
    "HarbingerOfDawn",
    {
      clauses: [
        {
          effectIds: ["weapon.harbinger-of-dawn.hp-above-90.crit-rate"],
          id: "weapon.harbinger-of-dawn.hp-above-90.crit-rate",
          label: "黎明神剑 · 当前生命值高于90%",
          source: weaponSource("HarbingerOfDawn"),
          status: "implemented"
        }
      ],
      equipmentId: "HarbingerOfDawn",
      kind: "weapon"
    }
  ],
  [
    "SkyriderSword",
    {
      clauses: [
        {
          effectIds: ["weapon.skyrider-sword.after-burst.attack-percent"],
          id: "weapon.skyrider-sword.after-burst.attack-percent",
          label: "飞天御剑 · 施放元素爆发后（攻击力）",
          source: weaponSource("SkyriderSword"),
          status: "implemented"
        },
        {
          id: "weapon.skyrider-sword.after-burst.movement-speed",
          label: "飞天御剑 · 施放元素爆发后（移动速度）",
          reason: "移动速度不改变当前核心动作的单次期望伤害，需循环时间模型。",
          source: weaponSource("SkyriderSword"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SkyriderSword",
      kind: "weapon"
    }
  ],
  [
    "TamayurateiNoOhanashi",
    {
      clauses: [
        {
          effectIds: ["weapon.tamayuratei-no-ohanashi.after-skill.attack-percent"],
          id: "weapon.tamayuratei-no-ohanashi.after-skill.attack-percent",
          label: "且住亭御咄 · 施放元素战技后（攻击力）",
          source: weaponSource("TamayurateiNoOhanashi"),
          status: "implemented"
        },
        {
          id: "weapon.tamayuratei-no-ohanashi.after-skill.movement-speed",
          label: "且住亭御咄 · 施放元素战技后（移动速度）",
          reason: "移动速度不改变当前核心动作的单次期望伤害，需循环时间模型。",
          source: weaponSource("TamayurateiNoOhanashi"),
          status: "not_applicable"
        }
      ],
      equipmentId: "TamayurateiNoOhanashi",
      kind: "weapon"
    }
  ],
  [
    "TidalShadow",
    {
      clauses: [
        {
          effectIds: ["weapon.tidal-shadow.after-heal.attack-percent"],
          id: "weapon.tidal-shadow.after-heal.attack-percent",
          label: "浪影阔剑 · 受到治疗后",
          source: weaponSource("TidalShadow"),
          status: "implemented"
        }
      ],
      equipmentId: "TidalShadow",
      kind: "weapon"
    }
  ],
  [
    "Akuoumaru",
    {
      clauses: [
        {
          effectIds: ["weapon.akuoumaru.burst-damage-bonus"],
          id: "weapon.akuoumaru.burst-damage-bonus",
          label: "恶王丸 · 全队元素爆发能量上限（元素爆发伤害）",
          source: weaponSource("Akuoumaru"),
          status: "implemented"
        }
      ],
      equipmentId: "Akuoumaru",
      kind: "weapon"
    }
  ],
  [
    "BeaconOfTheReedSea",
    {
      clauses: [
        {
          effectIds: [
            "weapon.beacon-of-the-reed-sea.after-skill-hit.attack-percent",
            "weapon.beacon-of-the-reed-sea.after-taking-damage.attack-percent",
            "weapon.beacon-of-the-reed-sea.unshielded.hp-percent"
          ],
          id: "weapon.beacon-of-the-reed-sea.passive",
          label: "苇海信标 · 不屈的沙海",
          source: weaponSource("BeaconOfTheReedSea"),
          status: "implemented"
        }
      ],
      equipmentId: "BeaconOfTheReedSea",
      kind: "weapon"
    }
  ],
  [
    "DragonsBane",
    {
      clauses: [
        {
          effectIds: ["weapon.dragons-bane.hydro-or-pyro-aura.damage-bonus"],
          id: "weapon.dragons-bane.hydro-or-pyro-aura.damage-bonus",
          label: "匣里灭辰 · 当前目标受水元素或火元素影响",
          source: weaponSource("DragonsBane"),
          status: "implemented"
        }
      ],
      equipmentId: "DragonsBane",
      kind: "weapon"
    }
  ],
  [
    "ForestRegalia",
    {
      clauses: [
        {
          effectIds: ["weapon.forest-regalia.after-dendro-reaction.leaf-picked.elemental-mastery"],
          id: "weapon.forest-regalia.after-dendro-reaction.leaf-picked.elemental-mastery",
          label: "森林王器 · 拾取种识之叶后",
          source: weaponSource("ForestRegalia"),
          status: "implemented"
        }
      ],
      equipmentId: "ForestRegalia",
      kind: "weapon"
    }
  ],
  [
    "LionsRoar",
    {
      clauses: [
        {
          effectIds: ["weapon.lions-roar.pyro-or-electro-aura.damage-bonus"],
          id: "weapon.lions-roar.pyro-or-electro-aura.damage-bonus",
          label: "匣里龙吟 · 当前目标受火元素或雷元素影响",
          source: weaponSource("LionsRoar"),
          status: "implemented"
        }
      ],
      equipmentId: "LionsRoar",
      kind: "weapon"
    }
  ],
  [
    "MissiveWindspear",
    {
      clauses: [
        {
          effectIds: [
            "weapon.missive-windspear.after-reaction.attack-percent",
            "weapon.missive-windspear.after-reaction.elemental-mastery"
          ],
          id: "weapon.missive-windspear.after-reaction.stats",
          label: "风信之锋 · 触发元素反应后",
          source: weaponSource("MissiveWindspear"),
          status: "implemented"
        }
      ],
      equipmentId: "MissiveWindspear",
      kind: "weapon"
    }
  ],
  [
    "Moonpiercer",
    {
      clauses: [
        {
          effectIds: ["weapon.moonpiercer.after-dendro-reaction.leaf-picked.attack-percent"],
          id: "weapon.moonpiercer.after-dendro-reaction.leaf-picked.attack-percent",
          label: "贯月矢 · 拾取苏生之叶后",
          source: weaponSource("Moonpiercer"),
          status: "implemented"
        }
      ],
      equipmentId: "Moonpiercer",
      kind: "weapon"
    }
  ],
  [
    "Rainslasher",
    {
      clauses: [
        {
          effectIds: ["weapon.rainslasher.hydro-or-electro-aura.damage-bonus"],
          id: "weapon.rainslasher.hydro-or-electro-aura.damage-bonus",
          label: "雨裁 · 当前目标受水元素或雷元素影响",
          source: weaponSource("Rainslasher"),
          status: "implemented"
        }
      ],
      equipmentId: "Rainslasher",
      kind: "weapon"
    }
  ],
  [
    "SongOfStillness",
    {
      clauses: [
        {
          effectIds: ["weapon.song-of-stillness.after-heal.damage-bonus"],
          id: "weapon.song-of-stillness.after-heal.damage-bonus",
          label: "静谧之曲 · 受到治疗后",
          source: weaponSource("SongOfStillness"),
          status: "implemented"
        }
      ],
      equipmentId: "SongOfStillness",
      kind: "weapon"
    }
  ],
  [
    "TheAlleyFlash",
    {
      clauses: [
        {
          effectIds: ["weapon.the-alley-flash.damage-bonus-ready"],
          id: "weapon.the-alley-flash.damage-bonus-ready",
          label: "暗巷闪光 · 当前未处于受伤后失效窗口",
          source: weaponSource("TheAlleyFlash"),
          status: "implemented"
        }
      ],
      equipmentId: "TheAlleyFlash",
      kind: "weapon"
    }
  ],
  [
    "ToukabouShigure",
    {
      clauses: [
        {
          effectIds: ["weapon.toukabou-shigure.cursed-parasol-target.damage-bonus"],
          id: "weapon.toukabou-shigure.cursed-parasol-target.damage-bonus",
          label: "东花坊时雨 · 当前目标处于纸伞作祟状态",
          source: weaponSource("ToukabouShigure"),
          status: "implemented"
        }
      ],
      equipmentId: "ToukabouShigure",
      kind: "weapon"
    }
  ],
  [
    "WolfsGravestone",
    {
      clauses: [
        {
          effectIds: ["weapon.wolfs-gravestone.attack-percent"],
          id: "weapon.wolfs-gravestone.attack-percent",
          label: "狼的末路 · 攻击力",
          source: weaponSource("WolfsGravestone"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent"],
          id: "weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent",
          label: "狼的末路 · 命中低生命值敌人后的队伍攻击力",
          source: weaponSource("WolfsGravestone"),
          status: "implemented"
        }
      ],
      equipmentId: "WolfsGravestone",
      kind: "weapon"
    }
  ],
  [
    "FreedomSworn",
    {
      clauses: [
        {
          effectIds: [
            "weapon.freedom-sworn.damage-bonus",
            "weapon.freedom-sworn.full-sigil.party-attack-percent",
            "weapon.freedom-sworn.full-sigil.party-normal-charged-plunge-damage-bonus"
          ],
          id: "weapon.freedom-sworn.passive",
          label: "苍古自由之誓 · 抗争的践行之歌",
          source: weaponSource("FreedomSworn"),
          status: "implemented"
        }
      ],
      equipmentId: "FreedomSworn",
      kind: "weapon"
    }
  ],
  [
    "CranesEchoingCall",
    {
      clauses: [
        {
          effectIds: ["weapon.cranes-echoing-call.after-plunge-hit.party-plunge-damage-bonus"],
          id: "weapon.cranes-echoing-call.after-plunge-hit.party-plunge-damage-bonus",
          label: "鹤鸣余音 · 装备者下落攻击命中后的队伍下落攻击伤害",
          source: weaponSource("CranesEchoingCall"),
          status: "implemented"
        },
        {
          id: "weapon.cranes-echoing-call.party-plunge-hit.energy-restoration",
          label: "鹤鸣余音 · 队伍下落攻击命中的元素能量恢复",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("CranesEchoingCall"),
          status: "not_applicable"
        }
      ],
      equipmentId: "CranesEchoingCall",
      kind: "weapon"
    }
  ],
  [
    "CrescentPike",
    {
      clauses: [
        {
          effectIds: ["weapon.crescent-pike.after-particle.additional-physical-damage"],
          id: "weapon.crescent-pike.after-particle.additional-physical-damage",
          label: "流月针 · 获得元素微粒或晶球后的普通攻击、重击额外物理伤害",
          source: weaponSource("CrescentPike"),
          status: "implemented"
        }
      ],
      equipmentId: "CrescentPike",
      kind: "weapon"
    }
  ],
  [
    "Hamayumi",
    {
      clauses: [
        {
          effectIds: [
            "weapon.hamayumi.normal-damage-bonus",
            "weapon.hamayumi.charged-damage-bonus",
            "weapon.hamayumi.full-energy.normal-damage-bonus",
            "weapon.hamayumi.full-energy.charged-damage-bonus"
          ],
          id: "weapon.hamayumi.passive",
          label: "破魔之弓 · 浅水玉",
          source: weaponSource("Hamayumi"),
          status: "implemented"
        }
      ],
      equipmentId: "Hamayumi",
      kind: "weapon"
    }
  ],
  [
    "MitternachtsWaltz",
    {
      clauses: [
        {
          effectIds: [
            "weapon.mitternachts-waltz.after-normal-hit.skill-damage-bonus",
            "weapon.mitternachts-waltz.after-skill-hit.normal-damage-bonus"
          ],
          id: "weapon.mitternachts-waltz.passive",
          label: "幽夜华尔兹 · 极夜二重奏",
          source: weaponSource("MitternachtsWaltz"),
          status: "implemented"
        }
      ],
      equipmentId: "MitternachtsWaltz",
      kind: "weapon"
    }
  ],
  [
    "PrototypeCrescent",
    {
      clauses: [
        {
          effectIds: ["weapon.prototype-crescent.after-weak-point-hit.attack-percent"],
          id: "weapon.prototype-crescent.after-weak-point-hit.attack-percent",
          label: "试作澹月 · 重击命中要害后的攻击力",
          source: weaponSource("PrototypeCrescent"),
          status: "implemented"
        },
        {
          id: "weapon.prototype-crescent.after-weak-point-hit.movement-speed",
          label: "试作澹月 · 重击命中要害后的移动速度",
          reason: "移动速度不会改变一个已选核心动作单次命中的伤害数值。",
          source: weaponSource("PrototypeCrescent"),
          status: "not_applicable"
        }
      ],
      equipmentId: "PrototypeCrescent",
      kind: "weapon"
    }
  ],
  [
    "KagotsurubeIsshin",
    {
      clauses: [
        {
          effectIds: [
            "weapon.kagotsurube-isshin.physical-hit",
            "weapon.kagotsurube-isshin.after-hit.attack-percent"
          ],
          id: "weapon.kagotsurube-isshin.passive",
          label: "笼钓瓶一心 · 横云断雨",
          source: weaponSource("KagotsurubeIsshin"),
          status: "implemented"
        }
      ],
      equipmentId: "KagotsurubeIsshin",
      kind: "weapon"
    }
  ],
  [
    "MailedFlower",
    {
      clauses: [
        {
          effectIds: [
            "weapon.mailed-flower.after-skill-hit-or-reaction.attack-percent",
            "weapon.mailed-flower.after-skill-hit-or-reaction.elemental-mastery"
          ],
          id: "weapon.mailed-flower.after-skill-hit-or-reaction.stats",
          label: "饰铁之花 · 风与花的密语",
          source: weaponSource("MailedFlower"),
          status: "implemented"
        }
      ],
      equipmentId: "MailedFlower",
      kind: "weapon"
    }
  ],
  [
    "PrototypeArchaic",
    {
      clauses: [
        {
          effectIds: ["weapon.prototype-archaic.physical-hit"],
          id: "weapon.prototype-archaic.physical-hit",
          label: "试作古华 · 普通攻击或重击命中的额外物理伤害",
          source: weaponSource("PrototypeArchaic"),
          status: "implemented"
        }
      ],
      equipmentId: "PrototypeArchaic",
      kind: "weapon"
    }
  ],
  [
    "SapwoodBlade",
    {
      clauses: [
        {
          effectIds: ["weapon.sapwood-blade.after-dendro-reaction.leaf-picked.elemental-mastery"],
          id: "weapon.sapwood-blade.after-dendro-reaction.leaf-picked.elemental-mastery",
          label: "原木刀 · 拾取种识之叶后的元素精通",
          source: weaponSource("SapwoodBlade"),
          status: "implemented"
        }
      ],
      equipmentId: "SapwoodBlade",
      kind: "weapon"
    }
  ],
  [
    "SongOfBrokenPines",
    {
      clauses: [
        {
          effectIds: [
            "weapon.song-of-broken-pines.attack-percent",
            "weapon.song-of-broken-pines.full-sigil.party-attack-percent"
          ],
          id: "weapon.song-of-broken-pines.attack-percent",
          label: "松籁响起之时 · 揭旗的叛逆之歌（攻击力）",
          source: weaponSource("SongOfBrokenPines"),
          status: "implemented"
        },
        {
          id: "weapon.song-of-broken-pines.full-sigil.party-attack-speed",
          label: "松籁响起之时 · 揭旗的叛逆之歌（攻击速度）",
          reason: "攻击速度不会改变一个已选核心动作单次命中的伤害数值。",
          source: weaponSource("SongOfBrokenPines"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SongOfBrokenPines",
      kind: "weapon"
    }
  ],
  [
    "WineAndSong",
    {
      clauses: [
        {
          effectIds: ["weapon.wine-and-song.after-sprint.attack-percent"],
          id: "weapon.wine-and-song.after-sprint.attack-percent",
          label: "暗巷的酒与诗 · 使用冲刺或替代冲刺后的攻击力",
          source: weaponSource("WineAndSong"),
          status: "implemented"
        },
        {
          id: "weapon.wine-and-song.sprint-stamina-consumption",
          label: "暗巷的酒与诗 · 冲刺或替代冲刺的体力消耗降低",
          reason: "体力消耗只影响移动与循环，不改变一个已选核心动作单次命中的伤害数值。",
          source: weaponSource("WineAndSong"),
          status: "not_applicable"
        }
      ],
      equipmentId: "WineAndSong",
      kind: "weapon"
    }
  ],
  [
    "SkywardHarp",
    {
      clauses: [
        {
          effectIds: ["weapon.skyward-harp.crit-damage", "weapon.skyward-harp.physical-hit"],
          id: "weapon.skyward-harp.passive",
          label: "天空之翼 · 回响长天的诗歌",
          source: weaponSource("SkywardHarp"),
          status: "implemented"
        }
      ],
      equipmentId: "SkywardHarp",
      kind: "weapon"
    }
  ],
  [
    "SkywardBlade",
    {
      clauses: [
        {
          effectIds: ["weapon.skyward-blade.crit-rate", "weapon.skyward-blade.after-burst.additional-physical-damage"],
          id: "weapon.skyward-blade.crit-rate-and-physical-hit",
          label: "天空之刃 · 暴击率与施放元素爆发后的额外物理伤害",
          source: weaponSource("SkywardBlade"),
          status: "implemented"
        },
        {
          id: "weapon.skyward-blade.after-burst.movement-and-attack-speed",
          label: "天空之刃 · 施放元素爆发后的移动速度与攻击速度",
          reason: "移动速度和攻击速度不会改变一个已选核心动作单次命中的伤害数值。",
          source: weaponSource("SkywardBlade"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SkywardBlade",
      kind: "weapon"
    }
  ],
  [
    "SacrificialJade",
    {
      clauses: [
        {
          effectIds: [
            "weapon.sacrificial-jade.after-off-field.hp-percent",
            "weapon.sacrificial-jade.after-off-field.elemental-mastery"
          ],
          id: "weapon.sacrificial-jade.after-off-field.stats",
          label: "遗祀玉珑 · 后台超过5秒后登场的生命值与元素精通",
          source: weaponSource("SacrificialJade"),
          status: "implemented"
        }
      ],
      equipmentId: "SacrificialJade",
      kind: "weapon"
    }
  ],
  [
    "TalkingStick",
    {
      clauses: [
        {
          effectIds: [
            "weapon.talking-stick.pyro-attachment.attack-percent",
            "weapon.talking-stick.hydro-cryo-electro-dendro-attachment.elemental-damage-bonus"
          ],
          id: "weapon.talking-stick.elemental-attachment.stats",
          label: "聊聊棒 · 承受元素附着后的攻击力或所有元素伤害",
          source: weaponSource("TalkingStick"),
          status: "implemented"
        }
      ],
      equipmentId: "TalkingStick",
      kind: "weapon"
    }
  ],
  [
    "UrakuMisugiri",
    {
      clauses: [
        {
          effectIds: [
            "weapon.uraku-misugiri.normal-damage-bonus",
            "weapon.uraku-misugiri.skill-damage-bonus",
            "weapon.uraku-misugiri.defense-percent",
            "weapon.uraku-misugiri.after-geo-hit.extra-normal-damage-bonus",
            "weapon.uraku-misugiri.after-geo-hit.extra-skill-damage-bonus"
          ],
          id: "weapon.uraku-misugiri.passive",
          label: "有乐御簾切 · 锦之花与龛中剑",
          source: weaponSource("UrakuMisugiri"),
          status: "implemented"
        }
      ],
      equipmentId: "UrakuMisugiri",
      kind: "weapon"
    }
  ],
  [
    "AThousandBlazingSuns",
    {
      clauses: [
        {
          effectIds: [
            "weapon.a-thousand-blazing-suns.after-skill-or-burst.crit-damage",
            "weapon.a-thousand-blazing-suns.after-skill-or-burst.attack-percent",
            "weapon.a-thousand-blazing-suns.nightsoul.extra-crit-damage",
            "weapon.a-thousand-blazing-suns.nightsoul.extra-attack-percent"
          ],
          id: "weapon.a-thousand-blazing-suns.blazing-light.stats",
          label: "焚曜千阳 · 焚光与夜魂加持下的额外数值",
          source: weaponSource("AThousandBlazingSuns"),
          status: "implemented"
        },
        {
          id: "weapon.a-thousand-blazing-suns.blazing-light.duration-extension",
          label: "焚曜千阳 · 普通攻击或重击造成元素伤害后的焚光持续时间延长",
          reason: "持续时间延长只影响状态可用时段；当前模型显式选择已生效的当前动作快照。",
          source: weaponSource("AThousandBlazingSuns"),
          status: "not_applicable"
        }
      ],
      equipmentId: "AThousandBlazingSuns",
      kind: "weapon"
    }
  ],
  [
    "MountainBracingBolt",
    {
      clauses: [
        {
          effectIds: [
            "weapon.mountain-bracing-bolt.skill-damage-bonus",
            "weapon.mountain-bracing-bolt.after-teammate-skill.extra-skill-damage-bonus"
          ],
          id: "weapon.mountain-bracing-bolt.skill-damage-bonus",
          label: "镇山之钉 · 元素战技伤害与队友施放元素战技后的额外伤害",
          source: weaponSource("MountainBracingBolt"),
          status: "implemented"
        },
        {
          id: "weapon.mountain-bracing-bolt.climbing-stamina",
          label: "镇山之钉 · 攀爬体力消耗降低",
          reason: "体力消耗只影响移动与循环，不改变一个已选核心动作单次命中的伤害数值。",
          source: weaponSource("MountainBracingBolt"),
          status: "not_applicable"
        }
      ],
      equipmentId: "MountainBracingBolt",
      kind: "weapon"
    }
  ],
  [
    "FruitfulHook",
    {
      clauses: [
        {
          effectIds: [
            "weapon.fruitful-hook.plunge-crit-rate",
            "weapon.fruitful-hook.after-plunge.normal-charged-plunge-damage-bonus"
          ],
          id: "weapon.fruitful-hook.passive",
          label: "硕果钩 · 坠枝之重",
          source: weaponSource("FruitfulHook"),
          status: "implemented"
        }
      ],
      equipmentId: "FruitfulHook",
      kind: "weapon"
    }
  ],
  [
    "Azurelight",
    {
      clauses: [
        {
          effectIds: [
            "weapon.azurelight.after-skill.attack-percent",
            "weapon.azurelight.after-skill.zero-energy.extra-attack-percent",
            "weapon.azurelight.after-skill.zero-energy.crit-damage"
          ],
          id: "weapon.azurelight.after-skill.stats",
          label: "苍耀 · 施放元素战技后与元素能量为0时的数值",
          source: weaponSource("Azurelight"),
          status: "implemented"
        }
      ],
      equipmentId: "Azurelight",
      kind: "weapon"
    }
  ],
  [
    "DisasterAndRemorse",
    {
      clauses: [
        {
          effectIds: [
            "weapon.disaster-and-remorse.after-skill.normal-charged-damage-bonus",
            "weapon.disaster-and-remorse.after-skill.skill-burst-damage-bonus",
            "weapon.disaster-and-remorse.magic-secret.extra-normal-charged-damage-bonus",
            "weapon.disaster-and-remorse.magic-secret.extra-skill-burst-damage-bonus"
          ],
          id: "weapon.disaster-and-remorse.current-state-damage-bonus",
          label: "灾悔 · 无赦、无愈及魔导·秘仪下的伤害提升",
          source: weaponSource("DisasterAndRemorse"),
          status: "implemented"
        },
        {
          id: "weapon.disaster-and-remorse.duration-extension",
          label: "灾悔 · 命中后延长无赦或无愈持续时间",
          reason: "持续时间延长只影响状态可用时段；当前模型显式选择已生效的当前动作快照。",
          source: weaponSource("DisasterAndRemorse"),
          status: "not_applicable"
        }
      ],
      equipmentId: "DisasterAndRemorse",
      kind: "weapon"
    }
  ],
  [
    "CrimsonMoonsSemblance",
    {
      clauses: [
        {
          effectIds: [
            "weapon.crimson-moons-semblance.bond-of-life.below-thirty-percent.damage-bonus",
            "weapon.crimson-moons-semblance.bond-of-life.at-least-thirty-percent.damage-bonus"
          ],
          id: "weapon.crimson-moons-semblance.bond-of-life.damage-bonus",
          label: "赤月之形 · 低于或不低于生命值上限30%的生命之契下造成的伤害",
          source: weaponSource("CrimsonMoonsSemblance"),
          status: "implemented"
        },
        {
          id: "weapon.crimson-moons-semblance.charged-hit.bond-generation",
          label: "赤月之形 · 重击命中后赋予生命之契",
          reason: "生命之契在触发重击后才产生；当前模型只结算一个已选核心动作的既有快照。",
          source: weaponSource("CrimsonMoonsSemblance"),
          status: "not_applicable"
        }
      ],
      equipmentId: "CrimsonMoonsSemblance",
      kind: "weapon"
    }
  ],
  [
    "AthameArtis",
    {
      clauses: [
        {
          effectIds: [
            "weapon.athame-artis.burst-crit-damage",
            "weapon.athame-artis.after-burst-hit.self-attack-percent",
            "weapon.athame-artis.magic-secret.after-burst-hit.self-extra-attack-percent"
          ],
          id: "weapon.athame-artis.self-stats",
          label: "黑蚀 · 装备者的元素爆发暴击伤害与白昼之刃攻击力",
          source: weaponSource("AthameArtis"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.athame-artis.daylight-blade.other-current-character.attack-percent",
            "weapon.athame-artis.magic-secret.daylight-blade.other-current-character.extra-attack-percent"
          ],
          id: "weapon.athame-artis.daylight-blade.other-current-character.attack-percent",
          label: "黑蚀 · 元素爆发命中后队伍其他当前场上角色的攻击力",
          source: weaponSource("AthameArtis"),
          status: "implemented"
        }
      ],
      equipmentId: "AthameArtis",
      kind: "weapon"
    }
  ],
  [
    "ATeaspoonOfTranscendence",
    {
      clauses: [
        {
          effectIds: ["weapon.a-teaspoon-of-transcendence.attack-percent"],
          id: "weapon.a-teaspoon-of-transcendence.attack-percent",
          label: "超越之匙 · 攻击力",
          source: weaponSource("ATeaspoonOfTranscendence"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.a-teaspoon-of-transcendence.charged-hit.1-stack.star-superconduct-damage-bonus",
            "weapon.a-teaspoon-of-transcendence.charged-hit.2-stack.star-superconduct-damage-bonus",
            "weapon.a-teaspoon-of-transcendence.charged-hit.3-stack.star-superconduct-damage-bonus"
          ],
          id: "weapon.a-teaspoon-of-transcendence.charged-hit.star-superconduct-damage-bonus",
          label: "超越之匙 · 重击命中后的星超导反应伤害提升",
          source: weaponSource("ATeaspoonOfTranscendence"),
          status: "implemented"
        }
      ],
      equipmentId: "ATeaspoonOfTranscendence",
      kind: "weapon"
    }
  ],
  [
    "AThousandFloatingDreams",
    {
      clauses: [
        {
          effectIds: [
            "weapon.a-thousand-floating-dreams.1-same-element-teammate.elemental-mastery",
            "weapon.a-thousand-floating-dreams.2-same-element-teammates.elemental-mastery",
            "weapon.a-thousand-floating-dreams.3-same-element-teammates.elemental-mastery",
            "weapon.a-thousand-floating-dreams.1-different-element-teammate.damage-bonus",
            "weapon.a-thousand-floating-dreams.2-different-element-teammates.damage-bonus",
            "weapon.a-thousand-floating-dreams.3-different-element-teammates.damage-bonus"
          ],
          id: "weapon.a-thousand-floating-dreams.holder.team-composition",
          label: "千夜浮梦 · 按队伍元素构成的持有者元素精通与元素伤害",
          source: weaponSource("AThousandFloatingDreams"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.a-thousand-floating-dreams.other-party.elemental-mastery"],
          id: "weapon.a-thousand-floating-dreams.other-party.elemental-mastery",
          label: "千夜浮梦 · 其他队友的元素精通与多把同名武器叠加",
          source: weaponSource("AThousandFloatingDreams", "party_member"),
          status: "implemented"
        }
      ],
      equipmentId: "AThousandFloatingDreams",
      kind: "weapon"
    }
  ],
  [
    "Absolution",
    {
      clauses: [
        {
          effectIds: ["weapon.absolution.crit-damage"],
          id: "weapon.absolution.crit-damage",
          label: "赦罪 · 暴击伤害",
          source: weaponSource("Absolution", "primary"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.absolution.bond-of-life-increase.1-stack.damage-bonus",
            "weapon.absolution.bond-of-life-increase.2-stack.damage-bonus",
            "weapon.absolution.bond-of-life-increase.3-stack.damage-bonus"
          ],
          id: "weapon.absolution.bond-of-life-increase.damage-bonus",
          label: "赦罪 · 生命之契数值增加后的伤害提升",
          source: weaponSource("Absolution", "primary"),
          status: "implemented"
        }
      ],
      equipmentId: "Absolution",
      kind: "weapon"
    }
  ],
  [
    "AlleyHunter",
    {
      clauses: [
        {
          effectIds: [
            "weapon.alley-hunter.off-field.1-stack.damage-bonus",
            "weapon.alley-hunter.off-field.2-stack.damage-bonus",
            "weapon.alley-hunter.off-field.3-stack.damage-bonus",
            "weapon.alley-hunter.off-field.4-stack.damage-bonus",
            "weapon.alley-hunter.off-field.5-stack.damage-bonus",
            "weapon.alley-hunter.off-field.6-stack.damage-bonus",
            "weapon.alley-hunter.off-field.7-stack.damage-bonus",
            "weapon.alley-hunter.off-field.8-stack.damage-bonus",
            "weapon.alley-hunter.off-field.9-stack.damage-bonus",
            "weapon.alley-hunter.off-field.10-stack.damage-bonus"
          ],
          id: "weapon.alley-hunter.off-field-damage-bonus",
          label: "暗巷猎手 · 后台累积伤害提升与登场后衰减",
          source: weaponSource("AlleyHunter"),
          status: "implemented"
        }
      ],
      equipmentId: "AlleyHunter",
      kind: "weapon"
    }
  ],
  [
    "AmenomaKageuchi",
    {
      clauses: [
        {
          id: "weapon.amenoma-kageuchi.inheritance-seed.energy-restoration",
          label: "天目影打刀 · 胤种清除后的元素能量恢复",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("AmenomaKageuchi"),
          status: "not_applicable"
        }
      ],
      equipmentId: "AmenomaKageuchi",
      kind: "weapon"
    }
  ],
  [
    "AmosBow",
    {
      clauses: [
        {
          effectIds: ["weapon.amos-bow.normal-charged-damage-bonus"],
          id: "weapon.amos-bow.normal-charged-damage-bonus",
          label: "阿莫斯之弓 · 普通攻击与重击伤害",
          source: weaponSource("AmosBow"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.amos-bow.projectile-flight-time.1-stack.damage-bonus",
            "weapon.amos-bow.projectile-flight-time.2-stack.damage-bonus",
            "weapon.amos-bow.projectile-flight-time.3-stack.damage-bonus",
            "weapon.amos-bow.projectile-flight-time.4-stack.damage-bonus",
            "weapon.amos-bow.projectile-flight-time.5-stack.damage-bonus"
          ],
          id: "weapon.amos-bow.projectile-flight-time.extra-damage-bonus",
          label: "阿莫斯之弓 · 箭矢发射后的飞行时间伤害提升",
          source: weaponSource("AmosBow"),
          status: "implemented"
        }
      ],
      equipmentId: "AmosBow",
      kind: "weapon"
    }
  ],
  [
    "AngelosHeptades",
    {
      clauses: [
        {
          effectIds: ["weapon.angelos-heptades.attack-percent"],
          id: "weapon.angelos-heptades.attack-percent",
          label: "尘光七谕 · 攻击力",
          source: weaponSource("AngelosHeptades"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.angelos-heptades.after-shield.source-final-attack-to-current-on-field-damage-bonus"],
          id: "weapon.angelos-heptades.after-shield.source-attack-scaled-current-on-field-damage-bonus",
          label: "尘光七谕 · 创造护盾后按装备者攻击力提供的当前场上角色伤害提升",
          source: weaponSource("AngelosHeptades"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.angelos-heptades.magic-secret.after-shield.source-final-attack-to-off-field-magic-recipient-damage-bonus"],
          id: "weapon.angelos-heptades.magic-secret.after-shield.source-final-attack-to-off-field-magic-recipient-damage-bonus",
          label: "尘光七谕 · 魔导·秘仪下后台角色的先导之光半额伤害提升",
          source: weaponSource("AngelosHeptades"),
          status: "implemented"
        },
        {
          id: "weapon.angelos-heptades.after-shield.energy-restoration",
          label: "尘光七谕 · 创造护盾后的元素能量恢复",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("AngelosHeptades"),
          status: "not_applicable"
        }
      ],
      equipmentId: "AngelosHeptades",
      kind: "weapon"
    }
  ],
  [
    "AshGravenDrinkingHorn",
    {
      clauses: [
        {
          effectIds: ["weapon.ash-graven-drinking-horn.hp-physical-hit"],
          id: "weapon.ash-graven-drinking-horn.hp-physical-hit",
          label: "苍纹角杯 · 攻击命中的基于生命值上限的额外物理伤害",
          source: weaponSource("AshGravenDrinkingHorn"),
          status: "implemented"
        }
      ],
      equipmentId: "AshGravenDrinkingHorn",
      kind: "weapon"
    }
  ],
  [
    "AstralVulturesCrimsonPlumage",
    {
      clauses: [
        {
          effectIds: ["weapon.astral-vultures-crimson-plumage.after-swirl.attack-percent"],
          id: "weapon.astral-vultures-crimson-plumage.after-swirl.attack-percent",
          label: "星鹫赤羽 · 触发扩散反应后的攻击力",
          source: weaponSource("AstralVulturesCrimsonPlumage"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.astral-vultures-crimson-plumage.team-different-element.1-character.charged-damage-bonus",
            "weapon.astral-vultures-crimson-plumage.team-different-element.1-character.burst-damage-bonus",
            "weapon.astral-vultures-crimson-plumage.team-different-element.2-character.charged-damage-bonus",
            "weapon.astral-vultures-crimson-plumage.team-different-element.2-character.burst-damage-bonus"
          ],
          id: "weapon.astral-vultures-crimson-plumage.team-different-element.charged-burst-damage-bonus",
          label: "星鹫赤羽 · 队伍不同元素角色数量对应的重击与元素爆发伤害",
          source: weaponSource("AstralVulturesCrimsonPlumage"),
          status: "implemented"
        }
      ],
      equipmentId: "AstralVulturesCrimsonPlumage",
      kind: "weapon"
    }
  ],
  [
    "BalladOfTheBoundlessBlue",
    {
      clauses: [
        {
          effectIds: [
            "weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.normal-damage-bonus",
            "weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.charged-damage-bonus",
            "weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.normal-damage-bonus",
            "weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.charged-damage-bonus",
            "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.normal-damage-bonus",
            "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.charged-damage-bonus"
          ],
          id: "weapon.ballad-of-the-boundless-blue.azure-skies.damage-bonus",
          label: "无垠蔚蓝之歌 · 命中前已持有的1至3层普通攻击或重击伤害提升（6秒内）",
          source: weaponSource("BalladOfTheBoundlessBlue", "primary"),
          status: "implemented"
        }
      ],
      equipmentId: "BalladOfTheBoundlessBlue",
      kind: "weapon"
    }
  ],
  [
    "BalladOfTheFjords",
    {
      clauses: [
        {
          effectIds: ["weapon.ballad-of-the-fjords.team-elemental-mastery"],
          id: "weapon.ballad-of-the-fjords.team-elemental-mastery",
          label: "峡湾长歌 · 队伍至少三种元素类型时的元素精通",
          source: weaponSource("BalladOfTheFjords"),
          status: "implemented"
        }
      ],
      equipmentId: "BalladOfTheFjords",
      kind: "weapon"
    }
  ],
  [
    "BlackcliffAgate",
    {
      clauses: [
        {
          effectIds: [
            "weapon.blackcliff-agate.defeated-enemy.1-stack.attack-percent",
            "weapon.blackcliff-agate.defeated-enemy.2-stack.attack-percent",
            "weapon.blackcliff-agate.defeated-enemy.3-stack.attack-percent"
          ],
          id: "weapon.blackcliff-agate.defeated-enemy.attack-percent",
          label: "黑岩绯玉 · 击败敌人后的攻击力层数",
          source: weaponSource("BlackcliffAgate", "primary"),
          status: "implemented"
        }
      ],
      equipmentId: "BlackcliffAgate",
      kind: "weapon"
    }
  ],
  [
    "BlackcliffLongsword",
    {
      clauses: [
        {
          effectIds: [
            "weapon.blackcliff-longsword.defeated-enemy.1-stack.attack-percent",
            "weapon.blackcliff-longsword.defeated-enemy.2-stack.attack-percent",
            "weapon.blackcliff-longsword.defeated-enemy.3-stack.attack-percent"
          ],
          id: "weapon.blackcliff-longsword.defeated-enemy.attack-percent",
          label: "黑岩长剑 · 击败敌人后的攻击力层数",
          source: weaponSource("BlackcliffLongsword"),
          status: "implemented"
        }
      ],
      equipmentId: "BlackcliffLongsword",
      kind: "weapon"
    }
  ],
  [
    "BlackcliffPole",
    {
      clauses: [
        {
          effectIds: [
            "weapon.blackcliff-pole.defeated-enemy.1-stack.attack-percent",
            "weapon.blackcliff-pole.defeated-enemy.2-stack.attack-percent",
            "weapon.blackcliff-pole.defeated-enemy.3-stack.attack-percent"
          ],
          id: "weapon.blackcliff-pole.defeated-enemy.attack-percent",
          label: "黑岩刺枪 · 击败敌人后的攻击力层数",
          source: weaponSource("BlackcliffPole"),
          status: "implemented"
        }
      ],
      equipmentId: "BlackcliffPole",
      kind: "weapon"
    }
  ],
  [
    "BlackcliffSlasher",
    {
      clauses: [
        {
          effectIds: [
            "weapon.blackcliff-slasher.defeated-enemy.1-stack.attack-percent",
            "weapon.blackcliff-slasher.defeated-enemy.2-stack.attack-percent",
            "weapon.blackcliff-slasher.defeated-enemy.3-stack.attack-percent"
          ],
          id: "weapon.blackcliff-slasher.defeated-enemy.attack-percent",
          label: "黑岩斩刀 · 击败敌人后的攻击力层数",
          source: weaponSource("BlackcliffSlasher"),
          status: "implemented"
        }
      ],
      equipmentId: "BlackcliffSlasher",
      kind: "weapon"
    }
  ],
  [
    "BlackcliffWarbow",
    {
      clauses: [
        {
          effectIds: [
            "weapon.blackcliff-warbow.defeated-enemy.1-stack.attack-percent",
            "weapon.blackcliff-warbow.defeated-enemy.2-stack.attack-percent",
            "weapon.blackcliff-warbow.defeated-enemy.3-stack.attack-percent"
          ],
          id: "weapon.blackcliff-warbow.defeated-enemy.attack-percent",
          label: "黑岩战弓 · 击败敌人后的攻击力层数",
          source: weaponSource("BlackcliffWarbow"),
          status: "implemented"
        }
      ],
      equipmentId: "BlackcliffWarbow",
      kind: "weapon"
    }
  ],
  [
    "BlackmarrowLantern",
    {
      clauses: [
        {
          effectIds: ["weapon.blackmarrow-lantern.bloom.reaction-damage-bonus"],
          id: "weapon.blackmarrow-lantern.bloom-damage-bonus",
          label: "乌髓孑灯 · 绽放反应伤害",
          source: weaponSource("BlackmarrowLantern"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.blackmarrow-lantern.lunar-bloom.reaction-damage-bonus",
            "weapon.blackmarrow-lantern.full-moonsign.lunar-bloom.reaction-damage-bonus"
          ],
          id: "weapon.blackmarrow-lantern.lunar-bloom-damage-bonus",
          label: "乌髓孑灯 · 月绽放反应伤害与满辉额外提升",
          source: weaponSource("BlackmarrowLantern"),
          status: "implemented"
        }
      ],
      equipmentId: "BlackmarrowLantern",
      kind: "weapon"
    }
  ],
  [
    "BloodsoakedRuins",
    {
      clauses: [
        {
          effectIds: ["weapon.bloodsoaked-ruins.after-burst.lunar-charged.reaction-damage-bonus"],
          id: "weapon.bloodsoaked-ruins.after-burst.lunar-charged-damage-bonus",
          label: "血染荒城 · 施放元素爆发后的月感电伤害",
          source: weaponSource("BloodsoakedRuins"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.bloodsoaked-ruins.after-lunar-charged.crit-damage"],
          id: "weapon.bloodsoaked-ruins.after-lunar-charged.crit-damage",
          label: "血染荒城 · 触发月感电后的暴击伤害",
          source: weaponSource("BloodsoakedRuins"),
          status: "implemented"
        },
        {
          id: "weapon.bloodsoaked-ruins.after-lunar-charged.energy-restoration",
          label: "血染荒城 · 触发月感电后的元素能量恢复",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("BloodsoakedRuins"),
          status: "not_applicable"
        }
      ],
      equipmentId: "BloodsoakedRuins",
      kind: "weapon"
    }
  ],
  [
    "CalamityQueller",
    {
      clauses: [
        {
          effectIds: [
            "weapon.calamity-queller.all-element-damage-bonus",
            "weapon.calamity-queller.consumption.on-field.1-stack.attack-percent",
            "weapon.calamity-queller.consumption.on-field.2-stack.attack-percent",
            "weapon.calamity-queller.consumption.on-field.3-stack.attack-percent",
            "weapon.calamity-queller.consumption.on-field.4-stack.attack-percent",
            "weapon.calamity-queller.consumption.on-field.5-stack.attack-percent",
            "weapon.calamity-queller.consumption.on-field.6-stack.attack-percent",
            "weapon.calamity-queller.consumption.off-field.1-stack.attack-percent",
            "weapon.calamity-queller.consumption.off-field.2-stack.attack-percent",
            "weapon.calamity-queller.consumption.off-field.3-stack.attack-percent",
            "weapon.calamity-queller.consumption.off-field.4-stack.attack-percent",
            "weapon.calamity-queller.consumption.off-field.5-stack.attack-percent",
            "weapon.calamity-queller.consumption.off-field.6-stack.attack-percent"
          ],
          id: "weapon.calamity-queller.passive",
          label: "息灾 · 灭却之戒法",
          source: weaponSource("CalamityQueller"),
          status: "implemented"
        }
      ],
      equipmentId: "CalamityQueller",
      kind: "weapon"
    }
  ],
  [
    "CashflowSupervision",
    {
      clauses: [
        {
          effectIds: ["weapon.cashflow-supervision.attack-percent"],
          id: "weapon.cashflow-supervision.attack-percent",
          label: "金流监督 · 攻击力",
          source: weaponSource("CashflowSupervision"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.cashflow-supervision.hp-change.1-stack.normal-damage-bonus",
            "weapon.cashflow-supervision.hp-change.2-stack.normal-damage-bonus",
            "weapon.cashflow-supervision.hp-change.3-stack.normal-damage-bonus",
            "weapon.cashflow-supervision.hp-change.1-stack.charged-damage-bonus",
            "weapon.cashflow-supervision.hp-change.2-stack.charged-damage-bonus",
            "weapon.cashflow-supervision.hp-change.3-stack.charged-damage-bonus"
          ],
          id: "weapon.cashflow-supervision.hp-change.normal-charged-damage-bonus",
          label: "金流监督 · 生命值变化后的普通攻击与重击伤害",
          source: weaponSource("CashflowSupervision"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.cashflow-supervision.hp-change.1-stack.star-superconduct-damage-bonus",
            "weapon.cashflow-supervision.hp-change.2-stack.star-superconduct-damage-bonus",
            "weapon.cashflow-supervision.hp-change.3-stack.star-superconduct-damage-bonus"
          ],
          id: "weapon.cashflow-supervision.hp-change.star-superconduct-damage-bonus",
          label: "金流监督 · 生命值变化后的星超导反应伤害",
          source: weaponSource("CashflowSupervision"),
          status: "implemented"
        },
        {
          id: "weapon.cashflow-supervision.hp-change.three-stack.attack-speed",
          label: "金流监督 · 三层生命值变化后的攻击速度",
          reason: "攻击速度不改变一个已选核心动作的单次伤害。",
          source: weaponSource("CashflowSupervision"),
          status: "not_applicable"
        }
      ],
      equipmentId: "CashflowSupervision",
      kind: "weapon"
    }
  ],
  [
    "ChainBreaker",
    {
      clauses: [
        {
          effectIds: [
            "weapon.chain-breaker.qualifying-party.1-character.attack-percent",
            "weapon.chain-breaker.qualifying-party.2-character.attack-percent",
            "weapon.chain-breaker.qualifying-party.3-character.attack-percent",
            "weapon.chain-breaker.qualifying-party.3-character.elemental-mastery",
            "weapon.chain-breaker.qualifying-party.4-character.attack-percent",
            "weapon.chain-breaker.qualifying-party.4-character.elemental-mastery"
          ],
          id: "weapon.chain-breaker.qualifying-party.stats",
          label: "碎链 · 符合条件的队伍角色数量对应的攻击力与元素精通",
          source: weaponSource("ChainBreaker"),
          status: "implemented"
        }
      ],
      equipmentId: "ChainBreaker",
      kind: "weapon"
    }
  ],
  [
    "CinnabarSpindle",
    {
      clauses: [
        {
          effectIds: ["weapon.cinnabar-spindle.skill-hit-ready.albedo-transient-blossom.defense-additive-damage"],
          id: "weapon.cinnabar-spindle.albedo-transient-blossom.defense-additive-damage",
          label: "辰砂之纺锤 · 阿贝多单次刹那之花（武器冷却就绪）的防御力伤害加算",
          source: weaponSource("CinnabarSpindle"),
          status: "implemented"
        },
        {
          id: "weapon.cinnabar-spindle.other-skill-hits.per-trigger-cooldown",
          label: "辰砂之纺锤 · 其它元素战技命中的1.5秒触发上限",
          reason: "当前同一命中加算会作用于一个元素战技的每一段，无法表示该被动每1.5秒至多触发一次；不能错误地让多段战技全段加算。",
          requiredCapability: "matched_action_additive_damage_term_with_per_trigger_cooldown_across_multi_hit_actions",
          source: weaponSource("CinnabarSpindle"),
          status: "unsupported"
        }
      ],
      equipmentId: "CinnabarSpindle",
      kind: "weapon"
    }
  ],
  [
    "Cloudforged",
    {
      clauses: [
        {
          effectIds: [
            "weapon.cloudforged.energy-reduced.1-stack.elemental-mastery",
            "weapon.cloudforged.energy-reduced.2-stack.elemental-mastery"
          ],
          id: "weapon.cloudforged.energy-reduced.elemental-mastery",
          label: "筑云 · 元素能量减少后的元素精通层数",
          source: weaponSource("Cloudforged"),
          status: "implemented"
        }
      ],
      equipmentId: "Cloudforged",
      kind: "weapon"
    }
  ],
  [
    "CompoundBow",
    {
      clauses: [
        {
          effectIds: [
            "weapon.compound-bow.normal-or-charged-hit.1-stack.attack-percent",
            "weapon.compound-bow.normal-or-charged-hit.2-stack.attack-percent",
            "weapon.compound-bow.normal-or-charged-hit.3-stack.attack-percent",
            "weapon.compound-bow.normal-or-charged-hit.4-stack.attack-percent"
          ],
          id: "weapon.compound-bow.normal-or-charged-hit.attack-percent",
          label: "钢轮弓 · 普通攻击或重击命中后的攻击力层数",
          source: weaponSource("CompoundBow"),
          status: "implemented"
        },
        {
          id: "weapon.compound-bow.normal-or-charged-hit.attack-speed",
          label: "钢轮弓 · 普通攻击或重击命中后的攻击速度",
          reason: "攻击速度不改变一个已选核心动作的单次伤害。",
          source: weaponSource("CompoundBow"),
          status: "not_applicable"
        }
      ],
      equipmentId: "CompoundBow",
      kind: "weapon"
    }
  ],
  [
    "DialoguesOfTheDesertSages",
    {
      clauses: [
        {
          id: "weapon.dialogues-of-the-desert-sages.after-healing.energy-restoration",
          label: "沙中伟贤的对答 · 治疗后恢复元素能量",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("DialoguesOfTheDesertSages"),
          status: "not_applicable"
        }
      ],
      equipmentId: "DialoguesOfTheDesertSages",
      kind: "weapon"
    }
  ],
  [
    "DragonspineSpear",
    {
      clauses: [
        {
          effectIds: [
            "weapon.dragonspine-spear.frost-icicle.without-cryo-aura.physical-hit",
            "weapon.dragonspine-spear.frost-icicle.with-cryo-aura.physical-hit"
          ],
          id: "weapon.dragonspine-spear.frost-icicle.physical-hit",
          label: "龙脊长枪 · 冷却就绪的霜葬物理伤害",
          source: weaponSource("DragonspineSpear"),
          status: "implemented"
        }
      ],
      equipmentId: "DragonspineSpear",
      kind: "weapon"
    }
  ],
  [
    "EndOfTheLine",
    {
      clauses: [
        {
          effectIds: ["weapon.end-of-the-line.flowrider.physical-hit"],
          id: "weapon.end-of-the-line.flowrider.physical-hit",
          label: "竭泽 · 沿洄状态下可触发的物理伤害",
          source: weaponSource("EndOfTheLine"),
          status: "implemented"
        }
      ],
      equipmentId: "EndOfTheLine",
      kind: "weapon"
    }
  ],
  [
    "EverlastingMoonglow",
    {
      clauses: [
        {
          effectIds: ["weapon.everlasting-moonglow.outgoing-healing-bonus"],
          id: "weapon.everlasting-moonglow.outgoing-healing-bonus",
          label: "不灭月华 · 治疗加成",
          source: weaponSource("EverlastingMoonglow"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.everlasting-moonglow.normal-hp-additive-damage"],
          id: "weapon.everlasting-moonglow.normal-hp-additive-damage",
          label: "不灭月华 · 普通攻击基于生命值上限的附加伤害",
          source: weaponSource("EverlastingMoonglow"),
          status: "implemented"
        },
        {
          id: "weapon.everlasting-moonglow.after-burst.normal-hit.energy-restoration",
          label: "不灭月华 · 元素爆发后普通攻击命中的元素能量恢复",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("EverlastingMoonglow"),
          status: "not_applicable"
        }
      ],
      equipmentId: "EverlastingMoonglow",
      kind: "weapon"
    }
  ],
  [
    "EyeOfPerception",
    {
      clauses: [
        {
          effectIds: ["weapon.eye-of-perception.initial-projectile.physical-hit"],
          id: "weapon.eye-of-perception.initial-projectile.physical-hit",
          label: "昭心 · 冷却就绪的首发法球物理伤害",
          source: weaponSource("EyeOfPerception"),
          status: "implemented"
        },
        {
          id: "weapon.eye-of-perception.projectile-bounces",
          label: "昭心 · 法球在敌人间弹射的后续命中",
          reason: "后续法球弹射属于武器自主伤害，不计入角色当前核心动作伤害。",
          source: weaponSource("EyeOfPerception"),
          status: "not_applicable"
        }
      ],
      equipmentId: "EyeOfPerception",
      kind: "weapon"
    }
  ],
  [
    "FadingTwilight",
    {
      clauses: [
        {
          effectIds: [
            "weapon.fading-twilight.evening-glow.damage-bonus",
            "weapon.fading-twilight.azure-glow.damage-bonus",
            "weapon.fading-twilight.dawn-glow.damage-bonus"
          ],
          id: "weapon.fading-twilight.glow.damage-bonus",
          label: "落霞 · 当前夕暮、流霞或朝晖状态的伤害",
          source: weaponSource("FadingTwilight"),
          status: "implemented"
        }
      ],
      equipmentId: "FadingTwilight",
      kind: "weapon"
    }
  ],
  [
    "FangOfTheMountainKing",
    {
      clauses: [
        {
          effectIds: [
            "weapon.fang-of-the-mountain-king.verdant-ember.1-stack.skill-burst-damage-bonus",
            "weapon.fang-of-the-mountain-king.verdant-ember.2-stack.skill-burst-damage-bonus",
            "weapon.fang-of-the-mountain-king.verdant-ember.3-stack.skill-burst-damage-bonus",
            "weapon.fang-of-the-mountain-king.verdant-ember.4-stack.skill-burst-damage-bonus",
            "weapon.fang-of-the-mountain-king.verdant-ember.5-stack.skill-burst-damage-bonus",
            "weapon.fang-of-the-mountain-king.verdant-ember.6-stack.skill-burst-damage-bonus"
          ],
          id: "weapon.fang-of-the-mountain-king.verdant-ember.skill-burst-damage-bonus",
          label: "山王长牙 · 悬木祝赐层数对应的元素战技与元素爆发伤害",
          source: weaponSource("FangOfTheMountainKing"),
          status: "implemented"
        }
      ],
      equipmentId: "FangOfTheMountainKing",
      kind: "weapon"
    }
  ],
  [
    "FinaleOfTheDeep",
    {
      clauses: [
        {
          effectIds: ["weapon.finale-of-the-deep.after-skill.attack-percent"],
          id: "weapon.finale-of-the-deep.after-skill.attack-percent",
          label: "海渊终曲 · 施放元素战技后的攻击力",
          source: weaponSource("FinaleOfTheDeep"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.finale-of-the-deep.bond-of-life-cleared.at-cap.flat-attack"],
          id: "weapon.finale-of-the-deep.bond-of-life-cleared.at-cap.flat-attack",
          label: "海渊终曲 · 清除生命之契后攻击力达到上限",
          source: weaponSource("FinaleOfTheDeep"),
          status: "implemented"
        },
        {
          id: "weapon.finale-of-the-deep.bond-of-life-cleared.uncapped-or-partial.flat-attack",
          label: "海渊终曲 · 清除未达上限或部分生命之契后的攻击力",
          reason: "该分支仍依赖实际清除的生命之契数值，并按数值、精炼系数与每效果上限计算平面攻击力。",
          requiredCapability: "bond_of_life_cleared_scalar_and_hp_sourced_capped_flat_attack",
          source: weaponSource("FinaleOfTheDeep"),
          status: "unsupported"
        }
      ],
      equipmentId: "FinaleOfTheDeep",
      kind: "weapon"
    }
  ],
  [
    "FlowerWreathedFeathers",
    {
      clauses: [
        {
          effectIds: [
            "weapon.flower-wreathed-feathers.aimed-shot.1-stack.charged-damage-bonus",
            "weapon.flower-wreathed-feathers.aimed-shot.2-stack.charged-damage-bonus",
            "weapon.flower-wreathed-feathers.aimed-shot.3-stack.charged-damage-bonus",
            "weapon.flower-wreathed-feathers.aimed-shot.4-stack.charged-damage-bonus",
            "weapon.flower-wreathed-feathers.aimed-shot.5-stack.charged-damage-bonus",
            "weapon.flower-wreathed-feathers.aimed-shot.6-stack.charged-damage-bonus"
          ],
          id: "weapon.flower-wreathed-feathers.aimed-shot.charged-damage-bonus",
          label: "缀花之翎 · 瞄准蓄力层数对应的重击伤害",
          source: weaponSource("FlowerWreathedFeathers"),
          status: "implemented"
        },
        {
          id: "weapon.flower-wreathed-feathers.glide-stamina-consumption",
          label: "缀花之翎 · 滑翔体力消耗降低",
          reason: "滑翔体力消耗不改变一个已选核心动作的单次伤害。",
          source: weaponSource("FlowerWreathedFeathers"),
          status: "not_applicable"
        }
      ],
      equipmentId: "FlowerWreathedFeathers",
      kind: "weapon"
    }
  ],
  [
    "FlowingPurity",
    {
      clauses: [
        {
          effectIds: ["weapon.flowing-purity.after-skill.all-element-damage-bonus"],
          id: "weapon.flowing-purity.after-skill.all-element-damage-bonus",
          label: "纯水流华 · 施放元素战技后的所有元素伤害",
          source: weaponSource("FlowingPurity"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.flowing-purity.bond-of-life-cleared.1-thousand-points.all-element-damage-bonus",
            "weapon.flowing-purity.bond-of-life-cleared.2-thousand-points.all-element-damage-bonus",
            "weapon.flowing-purity.bond-of-life-cleared.3-thousand-points.all-element-damage-bonus",
            "weapon.flowing-purity.bond-of-life-cleared.4-thousand-points.all-element-damage-bonus",
            "weapon.flowing-purity.bond-of-life-cleared.5-thousand-points.all-element-damage-bonus",
            "weapon.flowing-purity.bond-of-life-cleared.6-thousand-points.all-element-damage-bonus"
          ],
          id: "weapon.flowing-purity.bond-of-life-cleared.extra-elemental-damage-bonus",
          label: "纯水流华 · 清除生命之契后按完整千点获得的额外所有元素伤害",
          source: weaponSource("FlowingPurity"),
          status: "implemented"
        }
      ],
      equipmentId: "FlowingPurity",
      kind: "weapon"
    }
  ],
  [
    "FracturedHalo",
    {
      clauses: [
        {
          effectIds: ["weapon.fractured-halo.after-skill-or-burst.self-attack-percent"],
          id: "weapon.fractured-halo.after-skill-or-burst.self-attack-percent",
          label: "支离轮光 · 施放元素战技或元素爆发后的攻击力",
          source: weaponSource("FracturedHalo"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.fractured-halo.after-shield.party-lunar-charged.reaction-damage-bonus"],
          id: "weapon.fractured-halo.after-shield.party-lunar-charged-damage-bonus",
          label: "支离轮光 · 创造护盾后附近队伍角色的月感电伤害",
          source: weaponSource("FracturedHalo"),
          status: "implemented"
        }
      ],
      equipmentId: "FracturedHalo",
      kind: "weapon"
    }
  ],
  [
    "Frostbearer",
    {
      clauses: [
        {
          effectIds: [
            "weapon.frostbearer.frost-icicle.without-cryo-aura.physical-hit",
            "weapon.frostbearer.frost-icicle.with-cryo-aura.physical-hit"
          ],
          id: "weapon.frostbearer.frost-icicle.physical-hit",
          label: "忍冬之果 · 冷却就绪的霜葬物理伤害",
          source: weaponSource("Frostbearer"),
          status: "implemented"
        }
      ],
      equipmentId: "Frostbearer",
      kind: "weapon"
    }
  ],
  [
    "FruitOfFulfillment",
    {
      clauses: [
        {
          effectIds: [
            "weapon.fruit-of-fulfillment.wax-and-wane.1-stack.elemental-mastery",
            "weapon.fruit-of-fulfillment.wax-and-wane.1-stack.attack-percent",
            "weapon.fruit-of-fulfillment.wax-and-wane.2-stack.elemental-mastery",
            "weapon.fruit-of-fulfillment.wax-and-wane.2-stack.attack-percent",
            "weapon.fruit-of-fulfillment.wax-and-wane.3-stack.elemental-mastery",
            "weapon.fruit-of-fulfillment.wax-and-wane.3-stack.attack-percent",
            "weapon.fruit-of-fulfillment.wax-and-wane.4-stack.elemental-mastery",
            "weapon.fruit-of-fulfillment.wax-and-wane.4-stack.attack-percent",
            "weapon.fruit-of-fulfillment.wax-and-wane.5-stack.elemental-mastery",
            "weapon.fruit-of-fulfillment.wax-and-wane.5-stack.attack-percent"
          ],
          id: "weapon.fruit-of-fulfillment.wax-and-wane.stats",
          label: "盈满之实 · 盈亏层数对应的元素精通与攻击力",
          source: weaponSource("FruitOfFulfillment"),
          status: "implemented"
        }
      ],
      equipmentId: "FruitOfFulfillment",
      kind: "weapon"
    }
  ],
  [
    "GestOfTheMightyWolf",
    {
      clauses: [
        {
          effectIds: [
            "weapon.gest-of-the-mighty-wolf.howl.1-stack.damage-bonus",
            "weapon.gest-of-the-mighty-wolf.howl.2-stack.damage-bonus",
            "weapon.gest-of-the-mighty-wolf.howl.3-stack.damage-bonus",
            "weapon.gest-of-the-mighty-wolf.howl.4-stack.damage-bonus",
            "weapon.gest-of-the-mighty-wolf.magic-secret.1-stack.crit-damage",
            "weapon.gest-of-the-mighty-wolf.magic-secret.2-stack.crit-damage",
            "weapon.gest-of-the-mighty-wolf.magic-secret.3-stack.crit-damage",
            "weapon.gest-of-the-mighty-wolf.magic-secret.4-stack.crit-damage"
          ],
          id: "weapon.gest-of-the-mighty-wolf.howl.damage-or-crit-damage",
          label: "狼的武功歌 · 狼嚎层数对应的全伤害或魔导·秘仪暴击伤害",
          source: weaponSource("GestOfTheMightyWolf"),
          status: "implemented"
        },
        {
          id: "weapon.gest-of-the-mighty-wolf.attack-speed",
          label: "狼的武功歌 · 攻击速度",
          reason: "攻击速度不改变一个已选核心动作的单次伤害。",
          source: weaponSource("GestOfTheMightyWolf"),
          status: "not_applicable"
        }
      ],
      equipmentId: "GestOfTheMightyWolf",
      kind: "weapon"
    }
  ],
  [
    "GoldenFrostboundOath",
    {
      clauses: [
        {
          effectIds: [
            "weapon.golden-frostbound-oath.defense-percent",
            "weapon.golden-frostbound-oath.frost-fairys-requital.geo-damage-bonus"
          ],
          id: "weapon.golden-frostbound-oath.self-defense-and-geo-damage-bonus",
          label: "霜结的誓金枝 · 防御力与霜妖精的报恩岩元素伤害",
          source: weaponSource("GoldenFrostboundOath"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.golden-frostbound-oath.frost-fairys-requital.lunar-crystallize.reaction-damage-bonus"],
          id: "weapon.golden-frostbound-oath.frost-fairys-requital.lunar-crystallize-damage-bonus",
          label: "霜结的誓金枝 · 霜妖精的报恩月结晶伤害",
          source: weaponSource("GoldenFrostboundOath"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-geo-damage-bonus"
          ],
          id: "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-geo-damage-bonus",
          label: "霜结的誓金枝 · 月笼附近其他队友的岩元素伤害",
          source: weaponSource("GoldenFrostboundOath", "party_member"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-lunar-crystallize.reaction-damage-bonus"
          ],
          id: "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-lunar-crystallize.reaction-damage-bonus",
          label: "霜结的誓金枝 · 月笼附近其他队友的月结晶反应伤害",
          source: weaponSource("GoldenFrostboundOath", "party_member"),
          status: "implemented"
        }
      ],
      equipmentId: "GoldenFrostboundOath",
      kind: "weapon"
    }
  ],
  [
    "HakushinRing",
    {
      clauses: [
        {
          effectIds: [
            "weapon.hakushin-ring.overloaded-related-element-damage-bonus",
            "weapon.hakushin-ring.superconduct-related-element-damage-bonus",
            "weapon.hakushin-ring.electro-charged-related-element-damage-bonus",
            "weapon.hakushin-ring.swirl-related-element-damage-bonus",
            "weapon.hakushin-ring.crystallize-related-element-damage-bonus",
            "weapon.hakushin-ring.aggravate-related-element-damage-bonus"
          ],
          id: "weapon.hakushin-ring.electro-reaction.related-element-damage-bonus",
          label: "白辰之环 · 触发雷元素相关反应后的关联元素伤害",
          source: weaponSource("HakushinRing"),
          status: "implemented"
        }
      ],
      equipmentId: "HakushinRing",
      kind: "weapon"
    }
  ],
  [
    "HaranGeppakuFutsu",
    {
      clauses: [
        {
          effectIds: [
            "weapon.haran-geppaku-futsu.all-element-damage-bonus",
            "weapon.haran-geppaku-futsu.wavespike.1-stack.normal-damage-bonus",
            "weapon.haran-geppaku-futsu.wavespike.2-stack.normal-damage-bonus"
          ],
          id: "weapon.haran-geppaku-futsu.passive",
          label: "波乱月白经津 · 所有元素伤害与波穗普通攻击伤害",
          source: weaponSource("HaranGeppakuFutsu"),
          status: "implemented"
        }
      ],
      equipmentId: "HaranGeppakuFutsu",
      kind: "weapon"
    }
  ],
  [
    "HuntersPath",
    {
      clauses: [
        {
          effectIds: ["weapon.hunters-path.all-element-damage-bonus"],
          id: "weapon.hunters-path.all-element-damage-bonus",
          label: "猎人之径 · 所有元素伤害",
          source: weaponSource("HuntersPath"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.hunters-path.tireless-hunt.charged-em-additive-damage"],
          id: "weapon.hunters-path.tireless-hunt.charged-em-additive-damage",
          label: "猎人之径 · 无休止的狩猎重击元素精通附加伤害",
          source: weaponSource("HuntersPath"),
          status: "implemented"
        }
      ],
      equipmentId: "HuntersPath",
      kind: "weapon"
    }
  ],
  [
    "IbisPiercer",
    {
      clauses: [
        {
          effectIds: [
            "weapon.ibis-piercer.precision.1-stack.elemental-mastery",
            "weapon.ibis-piercer.precision.2-stack.elemental-mastery"
          ],
          id: "weapon.ibis-piercer.precision.elemental-mastery",
          label: "鹮穿之喙 · 重击命中后的元素精通层数",
          source: weaponSource("IbisPiercer"),
          status: "implemented"
        }
      ],
      equipmentId: "IbisPiercer",
      kind: "weapon"
    }
  ],
  [
    "IronSting",
    {
      clauses: [
        {
          effectIds: [
            "weapon.iron-sting.infusion-stinger.1-stack.damage-bonus",
            "weapon.iron-sting.infusion-stinger.2-stack.damage-bonus"
          ],
          id: "weapon.iron-sting.infusion-stinger.damage-bonus",
          label: "铁蜂刺 · 造成元素伤害后的全伤害层数",
          source: weaponSource("IronSting"),
          status: "implemented"
        }
      ],
      equipmentId: "IronSting",
      kind: "weapon"
    }
  ],
  [
    "JadefallsSplendor",
    {
      clauses: [
        {
          effectIds: ["weapon.jadefalls-splendor.after-burst-or-shield.final-hp-to-own-element-damage-bonus"],
          id: "weapon.jadefalls-splendor.hp-scaled-elemental-damage-bonus",
          label: "碧落之珑 · 按生命值上限的元素伤害",
          source: weaponSource("JadefallsSplendor"),
          status: "implemented"
        },
        {
          id: "weapon.jadefalls-splendor.after-burst.energy-restoration",
          label: "碧落之珑 · 元素爆发后元素能量恢复",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("JadefallsSplendor"),
          status: "not_applicable"
        }
      ],
      equipmentId: "JadefallsSplendor",
      kind: "weapon"
    }
  ],
  [
    "KagurasVerity",
    {
      clauses: [
        {
          effectIds: [
            "weapon.kaguras-verity.kagura-dance.1-stack.skill-damage-bonus",
            "weapon.kaguras-verity.kagura-dance.2-stack.skill-damage-bonus",
            "weapon.kaguras-verity.kagura-dance.3-stack.skill-damage-bonus",
            "weapon.kaguras-verity.kagura-dance.3-stack.all-element-damage-bonus"
          ],
          id: "weapon.kaguras-verity.kagura-dance.damage-bonuses",
          label: "神乐之真意 · 神乐舞层数对应的元素战技与所有元素伤害",
          source: weaponSource("KagurasVerity"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.kaguras-verity.kagura-dance.1-stack.star-superconduct-damage-bonus",
            "weapon.kaguras-verity.kagura-dance.2-stack.star-superconduct-damage-bonus",
            "weapon.kaguras-verity.kagura-dance.3-stack.star-superconduct-damage-bonus"
          ],
          id: "weapon.kaguras-verity.kagura-dance.star-superconduct-damage-bonus",
          label: "神乐之真意 · 神乐舞层数对应的星超导伤害",
          source: weaponSource("KagurasVerity"),
          status: "implemented"
        }
      ],
      equipmentId: "KagurasVerity",
      kind: "weapon"
    }
  ],
  [
    "KeyOfKhajNisut",
    {
      clauses: [
        {
          effectIds: ["weapon.key-of-khaj-nisut.hp-percent"],
          id: "weapon.key-of-khaj-nisut.hp-percent",
          label: "圣显之钥 · 生命值",
          source: weaponSource("KeyOfKhajNisut"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.key-of-khaj-nisut.grand-hymn.1-stack.final-hp-to-elemental-mastery",
            "weapon.key-of-khaj-nisut.grand-hymn.2-stack.final-hp-to-elemental-mastery",
            "weapon.key-of-khaj-nisut.grand-hymn.3-stack.final-hp-to-elemental-mastery"
          ],
          id: "weapon.key-of-khaj-nisut.grand-hymn.self-hp-scaled-elemental-mastery",
          label: "圣显之钥 · 圣咏层数对应的持有者生命值元素精通",
          source: weaponSource("KeyOfKhajNisut"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.key-of-khaj-nisut.grand-hymn.3-stack.party-source-final-hp-to-elemental-mastery"],
          id: "weapon.key-of-khaj-nisut.grand-hymn.party-hp-scaled-elemental-mastery",
          label: "圣显之钥 · 三层圣咏后的队伍生命值元素精通",
          source: weaponSource("KeyOfKhajNisut"),
          status: "implemented"
        }
      ],
      equipmentId: "KeyOfKhajNisut",
      kind: "weapon"
    }
  ],
  [
    "LightOfFoliarIncision",
    {
      clauses: [
        {
          effectIds: ["weapon.light-of-foliar-incision.crit-rate"],
          id: "weapon.light-of-foliar-incision.crit-rate",
          label: "裁叶萃光 · 暴击率",
          source: weaponSource("LightOfFoliarIncision"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.light-of-foliar-incision.foliar-incisiveness.normal-em-additive-damage",
            "weapon.light-of-foliar-incision.foliar-incisiveness.skill-em-additive-damage"
          ],
          id: "weapon.light-of-foliar-incision.foliar-incisiveness.em-additive-damage",
          label: "裁叶萃光 · 白月枝芒普通攻击与元素战技元素精通附加伤害",
          source: weaponSource("LightOfFoliarIncision"),
          status: "implemented"
        }
      ],
      equipmentId: "LightOfFoliarIncision",
      kind: "weapon"
    }
  ],
  [
    "LightbearingMoonshard",
    {
      clauses: [
        {
          effectIds: ["weapon.lightbearing-moonshard.defense-percent"],
          id: "weapon.lightbearing-moonshard.defense-percent",
          label: "朏魄含光 · 防御力",
          source: weaponSource("LightbearingMoonshard"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.lightbearing-moonshard.after-skill.lunar-crystallize.reaction-damage-bonus"],
          id: "weapon.lightbearing-moonshard.after-skill.lunar-crystallize-damage-bonus",
          label: "朏魄含光 · 元素战技后月结晶伤害",
          source: weaponSource("LightbearingMoonshard"),
          status: "implemented"
        }
      ],
      equipmentId: "LightbearingMoonshard",
      kind: "weapon"
    }
  ],
  [
    "LithicBlade",
    {
      clauses: [
        {
          effectIds: [
            "weapon.lithic-blade.liyue-party.1-character.attack-percent",
            "weapon.lithic-blade.liyue-party.1-character.crit-rate",
            "weapon.lithic-blade.liyue-party.2-character.attack-percent",
            "weapon.lithic-blade.liyue-party.2-character.crit-rate",
            "weapon.lithic-blade.liyue-party.3-character.attack-percent",
            "weapon.lithic-blade.liyue-party.3-character.crit-rate",
            "weapon.lithic-blade.liyue-party.4-character.attack-percent",
            "weapon.lithic-blade.liyue-party.4-character.crit-rate"
          ],
          id: "weapon.lithic-blade.liyue-party.stats",
          label: "千岩古剑 · 队伍璃月角色数对应的攻击力与暴击率",
          source: weaponSource("LithicBlade"),
          status: "implemented"
        }
      ],
      equipmentId: "LithicBlade",
      kind: "weapon"
    }
  ],
  [
    "LithicSpear",
    {
      clauses: [
        {
          effectIds: [
            "weapon.lithic-spear.liyue-party.1-character.attack-percent",
            "weapon.lithic-spear.liyue-party.1-character.crit-rate",
            "weapon.lithic-spear.liyue-party.2-character.attack-percent",
            "weapon.lithic-spear.liyue-party.2-character.crit-rate",
            "weapon.lithic-spear.liyue-party.3-character.attack-percent",
            "weapon.lithic-spear.liyue-party.3-character.crit-rate",
            "weapon.lithic-spear.liyue-party.4-character.attack-percent",
            "weapon.lithic-spear.liyue-party.4-character.crit-rate"
          ],
          id: "weapon.lithic-spear.liyue-party.stats",
          label: "千岩长枪 · 队伍璃月角色数对应的攻击力与暴击率",
          source: weaponSource("LithicSpear"),
          status: "implemented"
        }
      ],
      equipmentId: "LithicSpear",
      kind: "weapon"
    }
  ],
  [
    "LostPrayerToTheSacredWinds",
    {
      clauses: [
        {
          effectIds: [
            "weapon.lost-prayer-to-the-sacred-winds.movement.1-stack.all-element-damage-bonus",
            "weapon.lost-prayer-to-the-sacred-winds.movement.2-stack.all-element-damage-bonus",
            "weapon.lost-prayer-to-the-sacred-winds.movement.3-stack.all-element-damage-bonus",
            "weapon.lost-prayer-to-the-sacred-winds.movement.4-stack.all-element-damage-bonus"
          ],
          id: "weapon.lost-prayer-to-the-sacred-winds.movement.all-element-damage-bonus",
          label: "四风原典 · 登场后层数对应的所有元素伤害",
          source: weaponSource("LostPrayerToTheSacredWinds"),
          status: "implemented"
        },
        {
          id: "weapon.lost-prayer-to-the-sacred-winds.movement-speed",
          label: "四风原典 · 移动速度",
          reason: "移动速度不改变一个已选核心动作的单次伤害。",
          source: weaponSource("LostPrayerToTheSacredWinds"),
          status: "not_applicable"
        }
      ],
      equipmentId: "LostPrayerToTheSacredWinds",
      kind: "weapon"
    }
  ],
  [
    "LumidouceElegy",
    {
      clauses: [
        {
          effectIds: ["weapon.lumidouce-elegy.attack-percent"],
          id: "weapon.lumidouce-elegy.attack-percent",
          label: "柔灯挽歌 · 攻击力",
          source: weaponSource("LumidouceElegy"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.lumidouce-elegy.burning.1-stack.damage-bonus",
            "weapon.lumidouce-elegy.burning.2-stack.damage-bonus"
          ],
          id: "weapon.lumidouce-elegy.burning.damage-bonus",
          label: "柔灯挽歌 · 燃烧触发后的全伤害层数",
          source: weaponSource("LumidouceElegy"),
          status: "implemented"
        },
        {
          id: "weapon.lumidouce-elegy.burning.energy-restoration",
          label: "柔灯挽歌 · 燃烧状态刷新或满层后的元素能量恢复",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("LumidouceElegy"),
          status: "not_applicable"
        }
      ],
      equipmentId: "LumidouceElegy",
      kind: "weapon"
    }
  ],
  [
    "MakhairaAquamarine",
    {
      clauses: [
        {
          effectIds: [
            "weapon.makhaira-aquamarine.after-10s.self.source-em-to-flat-attack",
            "weapon.makhaira-aquamarine.after-10s.other-party.source-em-to-flat-attack"
          ],
          id: "weapon.makhaira-aquamarine.elemental-mastery-sourced-flat-attack",
          label: "玛海菈的水色 · 按持有者元素精通提供自身与其他队友平面攻击力",
          source: weaponSource("MakhairaAquamarine"),
          status: "implemented"
        }
      ],
      equipmentId: "MakhairaAquamarine",
      kind: "weapon"
    }
  ],
  [
    "MappaMare",
    {
      clauses: [
        {
          effectIds: [
            "weapon.mappa-mare.infusion-scroll.1-stack.all-element-damage-bonus",
            "weapon.mappa-mare.infusion-scroll.2-stack.all-element-damage-bonus"
          ],
          id: "weapon.mappa-mare.infusion-scroll.all-element-damage-bonus",
          label: "万国诸海图谱 · 触发元素反应后的所有元素伤害层数",
          source: weaponSource("MappaMare"),
          status: "implemented"
        }
      ],
      equipmentId: "MappaMare",
      kind: "weapon"
    }
  ],
  [
    "MasterKey",
    {
      clauses: [
        {
          effectIds: [
            "weapon.master-key.after-reaction.elemental-mastery",
            "weapon.master-key.after-reaction.full-moon.elemental-mastery"
          ],
          id: "weapon.master-key.after-reaction.elemental-mastery",
          label: "万能钥匙 · 触发元素反应后的元素精通与月兆·满辉分支",
          source: weaponSource("MasterKey"),
          status: "implemented"
        }
      ],
      equipmentId: "MasterKey",
      kind: "weapon"
    }
  ],
  [
    "MemoryOfDust",
    {
      clauses: [
        {
          effectIds: ["weapon.memory-of-dust.shield-strength"],
          id: "weapon.memory-of-dust.shield-strength",
          label: "尘世之锁 · 护盾强效",
          source: weaponSource("MemoryOfDust"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.memory-of-dust.golden-majesty.unshielded.1-stack.attack-percent",
            "weapon.memory-of-dust.golden-majesty.unshielded.2-stack.attack-percent",
            "weapon.memory-of-dust.golden-majesty.unshielded.3-stack.attack-percent",
            "weapon.memory-of-dust.golden-majesty.unshielded.4-stack.attack-percent",
            "weapon.memory-of-dust.golden-majesty.unshielded.5-stack.attack-percent",
            "weapon.memory-of-dust.golden-majesty.shielded.1-stack.attack-percent",
            "weapon.memory-of-dust.golden-majesty.shielded.2-stack.attack-percent",
            "weapon.memory-of-dust.golden-majesty.shielded.3-stack.attack-percent",
            "weapon.memory-of-dust.golden-majesty.shielded.4-stack.attack-percent",
            "weapon.memory-of-dust.golden-majesty.shielded.5-stack.attack-percent"
          ],
          id: "weapon.memory-of-dust.golden-majesty.attack-percent",
          label: "尘世之锁 · 护盾状态与层数对应的攻击力",
          source: weaponSource("MemoryOfDust"),
          status: "implemented"
        }
      ],
      equipmentId: "MemoryOfDust",
      kind: "weapon"
    }
  ],
  [
    "MistsplitterReforged",
    {
      clauses: [
        {
          effectIds: [
            "weapon.mistsplitter-reforged.all-element-damage-bonus",
            "weapon.mistsplitter-reforged.emblem.anemo.1-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.anemo.2-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.anemo.3-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.cryo.1-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.cryo.2-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.cryo.3-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.dendro.1-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.dendro.2-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.dendro.3-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.electro.1-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.electro.2-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.electro.3-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.geo.1-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.geo.2-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.geo.3-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.hydro.1-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.hydro.2-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.hydro.3-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.pyro.1-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.pyro.2-stack.damage-bonus",
            "weapon.mistsplitter-reforged.emblem.pyro.3-stack.damage-bonus"
          ],
          id: "weapon.mistsplitter-reforged.passive",
          label: "雾切之回光 · 所有元素伤害与元素类型对应的雾切之巴层数",
          source: weaponSource("MistsplitterReforged"),
          status: "implemented"
        }
      ],
      equipmentId: "MistsplitterReforged",
      kind: "weapon"
    }
  ],
  [
    "MoonweaversDawn",
    {
      clauses: [
        {
          effectIds: [
            "weapon.moonweavers-dawn.burst-damage-bonus",
            "weapon.moonweavers-dawn.at-most-sixty-energy.extra-burst-damage-bonus",
            "weapon.moonweavers-dawn.at-most-forty-energy.extra-burst-damage-bonus"
          ],
          id: "weapon.moonweavers-dawn.burst-damage-bonus",
          label: "织月者的曙色 · 元素爆发伤害与元素能量上限分支",
          source: weaponSource("MoonweaversDawn"),
          status: "implemented"
        }
      ],
      equipmentId: "MoonweaversDawn",
      kind: "weapon"
    }
  ],
  [
    "NightweaversLookingGlass",
    {
      clauses: [
        {
          effectIds: [
            "weapon.nightweavers-looking-glass.after-hydro-or-dendro-skill.elemental-mastery",
            "weapon.nightweavers-looking-glass.after-lunar-bloom.elemental-mastery"
          ],
          id: "weapon.nightweavers-looking-glass.self.elemental-mastery",
          label: "纺夜天镜 · 水草战技命中与月绽放后的自身元素精通",
          source: weaponSource("NightweaversLookingGlass"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.nightweavers-looking-glass.both-states.party-bloom.reaction-damage-bonus",
            "weapon.nightweavers-looking-glass.both-states.party-hyperbloom-burgeon.reaction-damage-bonus"
          ],
          id: "weapon.nightweavers-looking-glass.bloom-hyperbloom-burgeon.party-damage-bonus",
          label: "纺夜天镜 · 两种状态共存时队伍的绽放、超绽放与烈绽放伤害",
          source: weaponSource("NightweaversLookingGlass"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.nightweavers-looking-glass.both-states.party-lunar-bloom.reaction-damage-bonus"],
          id: "weapon.nightweavers-looking-glass.lunar-bloom.party-damage-bonus",
          label: "纺夜天镜 · 两种状态共存时队伍的月绽放伤害",
          source: weaponSource("NightweaversLookingGlass"),
          status: "implemented"
        }
      ],
      equipmentId: "NightweaversLookingGlass",
      kind: "weapon"
    }
  ],
  [
    "NocturnesCurtainCall",
    {
      clauses: [
        {
          effectIds: ["weapon.nocturnes-curtain-call.hp-percent"],
          id: "weapon.nocturnes-curtain-call.hp-percent",
          label: "帷间夜曲 · 生命值",
          source: weaponSource("NocturnesCurtainCall"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.nocturnes-curtain-call.after-lunar-reaction.extra-hp-percent"],
          id: "weapon.nocturnes-curtain-call.after-lunar-reaction.extra-hp-percent",
          label: "帷间夜曲 · 丰饶海的神酒状态下的额外生命值",
          source: weaponSource("NocturnesCurtainCall"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.nocturnes-curtain-call.after-lunar-reaction.lunar-crit-damage"],
          id: "weapon.nocturnes-curtain-call.after-lunar-reaction.lunar-crit-damage",
          label: "帷间夜曲 · 丰饶海的神酒状态下的月曜暴击伤害",
          source: weaponSource("NocturnesCurtainCall"),
          status: "implemented"
        },
        {
          id: "weapon.nocturnes-curtain-call.after-lunar-reaction.energy-restoration",
          label: "帷间夜曲 · 触发月曜反应后的元素能量恢复",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("NocturnesCurtainCall"),
          status: "not_applicable"
        }
      ],
      equipmentId: "NocturnesCurtainCall",
      kind: "weapon"
    }
  ],
  [
    "PeakPatrolSong",
    {
      clauses: [
        {
          effectIds: [
            "weapon.peak-patrol-song.ode-to-flowers.1-stack.defense-percent",
            "weapon.peak-patrol-song.ode-to-flowers.1-stack.all-element-damage-bonus",
            "weapon.peak-patrol-song.ode-to-flowers.2-stack.defense-percent",
            "weapon.peak-patrol-song.ode-to-flowers.2-stack.all-element-damage-bonus"
          ],
          id: "weapon.peak-patrol-song.ode-to-flowers.self-stats",
          label: "岩峰巡歌 · 花之颂层数对应的自身防御力与所有元素伤害",
          source: weaponSource("PeakPatrolSong"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.peak-patrol-song.2-stack.source-final-defense-to-party-all-element-damage-bonus"],
          id: "weapon.peak-patrol-song.two-stack.defense-scaled-party-all-element-damage-bonus",
          label: "岩峰巡歌 · 满层后按持有者防御力提供的队伍所有元素伤害",
          source: weaponSource("PeakPatrolSong"),
          status: "implemented"
        }
      ],
      equipmentId: "PeakPatrolSong",
      kind: "weapon"
    }
  ],
  [
    "PolarStar",
    {
      clauses: [
        {
          effectIds: [
            "weapon.polar-star.skill-burst-damage-bonus",
            "weapon.polar-star.ashen-nightstar.1-stack.attack-percent",
            "weapon.polar-star.ashen-nightstar.2-stack.attack-percent",
            "weapon.polar-star.ashen-nightstar.3-stack.attack-percent",
            "weapon.polar-star.ashen-nightstar.4-stack.attack-percent"
          ],
          id: "weapon.polar-star.passive",
          label: "冬极白星 · 元素战技与元素爆发伤害、白夜极星层数攻击力",
          source: weaponSource("PolarStar"),
          status: "implemented"
        }
      ],
      equipmentId: "PolarStar",
      kind: "weapon"
    }
  ],
  [
    "PortablePowerSaw",
    {
      clauses: [
        {
          effectIds: [
            "weapon.portable-power-saw.mariners-resolve.1-mark.elemental-mastery",
            "weapon.portable-power-saw.mariners-resolve.2-mark.elemental-mastery",
            "weapon.portable-power-saw.mariners-resolve.3-mark.elemental-mastery"
          ],
          id: "weapon.portable-power-saw.mariners-resolve.elemental-mastery",
          label: "便携动力锯 · 消耗坚忍标记后的元素精通",
          source: weaponSource("PortablePowerSaw"),
          status: "implemented"
        },
        {
          id: "weapon.portable-power-saw.mariners-resolve.delayed-energy-restoration",
          label: "便携动力锯 · 消耗坚忍标记后的延迟元素能量恢复",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("PortablePowerSaw"),
          status: "not_applicable"
        }
      ],
      equipmentId: "PortablePowerSaw",
      kind: "weapon"
    }
  ],
  [
    "Predator",
    {
      clauses: [
        {
          effectIds: [
            "weapon.predator.strong-strike.1-stack.normal-charged-damage-bonus",
            "weapon.predator.strong-strike.2-stack.normal-charged-damage-bonus"
          ],
          id: "weapon.predator.strong-strike.normal-charged-damage-bonus",
          label: "掠食者 · 造成冰元素伤害后的普通攻击与重击伤害层数",
          source: weaponSource("Predator"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.predator.strong-strike.1-stack.normal-charged-damage-bonus",
            "weapon.predator.strong-strike.2-stack.normal-charged-damage-bonus",
            "weapon.predator.playstation.aloy.flat-attack"
          ],
          id: "weapon.predator.platform-restriction",
          label: "掠食者 · PlayStation Network 被动已生效快照",
          source: weaponSource("Predator"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.predator.playstation.aloy.flat-attack"],
          id: "weapon.predator.aloy-flat-attack",
          label: "掠食者 · 埃洛伊装备时的固定攻击力",
          source: weaponSource("Predator"),
          status: "implemented"
        }
      ],
      equipmentId: "Predator",
      kind: "weapon"
    }
  ],
  [
    "PrimordialJadeCutter",
    {
      clauses: [
        {
          effectIds: ["weapon.primordial-jade-cutter.hp-percent"],
          id: "weapon.primordial-jade-cutter.hp-percent",
          label: "磐岩结绿 · 生命值",
          source: weaponSource("PrimordialJadeCutter"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.primordial-jade-cutter.hp-sourced-flat-attack"],
          id: "weapon.primordial-jade-cutter.hp-sourced-flat-attack",
          label: "磐岩结绿 · 基于生命值上限的平面攻击力",
          source: weaponSource("PrimordialJadeCutter"),
          status: "implemented"
        }
      ],
      equipmentId: "PrimordialJadeCutter",
      kind: "weapon"
    }
  ],
  [
    "PrimordialJadeWingedSpear",
    {
      clauses: [
        {
          effectIds: [
            "weapon.primordial-jade-winged-spear.eagle-spear.1-stack.attack-percent",
            "weapon.primordial-jade-winged-spear.eagle-spear.2-stack.attack-percent",
            "weapon.primordial-jade-winged-spear.eagle-spear.3-stack.attack-percent",
            "weapon.primordial-jade-winged-spear.eagle-spear.4-stack.attack-percent",
            "weapon.primordial-jade-winged-spear.eagle-spear.5-stack.attack-percent",
            "weapon.primordial-jade-winged-spear.eagle-spear.6-stack.attack-percent",
            "weapon.primordial-jade-winged-spear.eagle-spear.7-stack.attack-percent",
            "weapon.primordial-jade-winged-spear.eagle-spear.7-stack.damage-bonus"
          ],
          id: "weapon.primordial-jade-winged-spear.eagle-spear.stats",
          label: "和璞鸢 · 鹰之傲层数对应的攻击力与七层全伤害",
          source: weaponSource("PrimordialJadeWingedSpear"),
          status: "implemented"
        }
      ],
      equipmentId: "PrimordialJadeWingedSpear",
      kind: "weapon"
    }
  ],
  [
    "ProspectorsDrill",
    {
      clauses: [
        {
          effectIds: [
            "weapon.prospectors-drill.unity.1-mark.attack-percent",
            "weapon.prospectors-drill.unity.1-mark.all-element-damage-bonus",
            "weapon.prospectors-drill.unity.2-mark.attack-percent",
            "weapon.prospectors-drill.unity.2-mark.all-element-damage-bonus",
            "weapon.prospectors-drill.unity.3-mark.attack-percent",
            "weapon.prospectors-drill.unity.3-mark.all-element-damage-bonus"
          ],
          id: "weapon.prospectors-drill.unity.stats",
          label: "勘探钻机 · 消耗团结标记后的攻击力与所有元素伤害",
          source: weaponSource("ProspectorsDrill"),
          status: "implemented"
        }
      ],
      equipmentId: "ProspectorsDrill",
      kind: "weapon"
    }
  ],
  [
    "ProspectorsShovel",
    {
      clauses: [
        {
          effectIds: ["weapon.prospectors-shovel.electro-charged.reaction-damage-bonus"],
          id: "weapon.prospectors-shovel.electro-charged-damage-bonus",
          label: "掘金之锹 · 感电反应伤害",
          source: weaponSource("ProspectorsShovel"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.prospectors-shovel.lunar-charged.reaction-damage-bonus",
            "weapon.prospectors-shovel.full-moonsign.lunar-charged.reaction-damage-bonus"
          ],
          id: "weapon.prospectors-shovel.lunar-charged-damage-bonus",
          label: "掘金之锹 · 月感电反应伤害与满辉额外提升",
          source: weaponSource("ProspectorsShovel"),
          status: "implemented"
        }
      ],
      equipmentId: "ProspectorsShovel",
      kind: "weapon"
    }
  ],
  [
    "PrototypeAmber",
    {
      clauses: [
        {
          id: "weapon.prototype-amber.after-burst.energy-restoration",
          label: "试作金珀 · 元素爆发后的元素能量恢复",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("PrototypeAmber"),
          status: "not_applicable"
        },
        {
          id: "weapon.prototype-amber.after-burst.party-healing",
          label: "试作金珀 · 元素爆发后的队伍持续治疗",
          reason: "元素爆发后的队伍治疗不进入当前角色核心动作伤害。",
          source: weaponSource("PrototypeAmber"),
          status: "not_applicable"
        }
      ],
      equipmentId: "PrototypeAmber",
      kind: "weapon"
    }
  ],
  [
    "PrototypeRancour",
    {
      clauses: [
        {
          effectIds: [
            "weapon.prototype-rancour.shattered-stone.1-stack.attack-percent",
            "weapon.prototype-rancour.shattered-stone.1-stack.defense-percent",
            "weapon.prototype-rancour.shattered-stone.2-stack.attack-percent",
            "weapon.prototype-rancour.shattered-stone.2-stack.defense-percent",
            "weapon.prototype-rancour.shattered-stone.3-stack.attack-percent",
            "weapon.prototype-rancour.shattered-stone.3-stack.defense-percent",
            "weapon.prototype-rancour.shattered-stone.4-stack.attack-percent",
            "weapon.prototype-rancour.shattered-stone.4-stack.defense-percent"
          ],
          id: "weapon.prototype-rancour.shattered-stone.stats",
          label: "试作斩岩 · 普通攻击或重击命中后的攻击力与防御力层数",
          source: weaponSource("PrototypeRancour"),
          status: "implemented"
        }
      ],
      equipmentId: "PrototypeRancour",
      kind: "weapon"
    }
  ],
  [
    "PrototypeStarglitter",
    {
      clauses: [
        {
          effectIds: [
            "weapon.prototype-starglitter.magic-affinity.1-stack.normal-charged-damage-bonus",
            "weapon.prototype-starglitter.magic-affinity.2-stack.normal-charged-damage-bonus"
          ],
          id: "weapon.prototype-starglitter.magic-affinity.normal-charged-damage-bonus",
          label: "试作星镰 · 施放元素战技后的普通攻击与重击伤害层数",
          source: weaponSource("PrototypeStarglitter"),
          status: "implemented"
        }
      ],
      equipmentId: "PrototypeStarglitter",
      kind: "weapon"
    }
  ],
  [
    "RainbowSerpentsRainBow",
    {
      clauses: [
        {
          effectIds: ["weapon.rainbow-serpents-rain-bow.after-off-field-hit.attack-percent"],
          id: "weapon.rainbow-serpents-rain-bow.after-off-field-hit.attack-percent",
          label: "虹蛇的雨弦 · 后台攻击命中后的攻击力",
          source: weaponSource("RainbowSerpentsRainBow"),
          status: "implemented"
        }
      ],
      equipmentId: "RainbowSerpentsRainBow",
      kind: "weapon"
    }
  ],
  [
    "RangeGauge",
    {
      clauses: [
        {
          effectIds: [
            "weapon.range-gauge.unity.1-mark.attack-percent",
            "weapon.range-gauge.unity.1-mark.all-element-damage-bonus",
            "weapon.range-gauge.unity.2-mark.attack-percent",
            "weapon.range-gauge.unity.2-mark.all-element-damage-bonus",
            "weapon.range-gauge.unity.3-mark.attack-percent",
            "weapon.range-gauge.unity.3-mark.all-element-damage-bonus"
          ],
          id: "weapon.range-gauge.unity.stats",
          label: "测距规 · 消耗团结标记后的攻击力与所有元素伤害",
          source: weaponSource("RangeGauge"),
          status: "implemented"
        }
      ],
      equipmentId: "RangeGauge",
      kind: "weapon"
    }
  ],
  [
    "RedhornStonethresher",
    {
      clauses: [
        {
          effectIds: ["weapon.redhorn-stonethresher.defense-percent"],
          id: "weapon.redhorn-stonethresher.defense-percent",
          label: "赤角石溃杵 · 防御力",
          source: weaponSource("RedhornStonethresher"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.redhorn-stonethresher.normal-charged-defense-additive-damage"],
          id: "weapon.redhorn-stonethresher.normal-charged-defense-additive-damage",
          label: "赤角石溃杵 · 普通攻击与重击基于防御力的附加伤害",
          source: weaponSource("RedhornStonethresher"),
          status: "implemented"
        }
      ],
      equipmentId: "RedhornStonethresher",
      kind: "weapon"
    }
  ],
  [
    "ReliquaryOfTruth",
    {
      clauses: [
        {
          effectIds: [
            "weapon.reliquary-of-truth.crit-rate",
            "weapon.reliquary-of-truth.after-skill.elemental-mastery",
            "weapon.reliquary-of-truth.after-lunar-bloom.crit-damage",
            "weapon.reliquary-of-truth.both-states.elemental-mastery",
            "weapon.reliquary-of-truth.both-states.crit-damage"
          ],
          id: "weapon.reliquary-of-truth.passive",
          label: "真语秘匣 · 暴击率、元素战技与月绽放状态的元素精通和暴击伤害",
          source: weaponSource("ReliquaryOfTruth"),
          status: "implemented"
        }
      ],
      equipmentId: "ReliquaryOfTruth",
      kind: "weapon"
    }
  ],
  [
    "RightfulReward",
    {
      clauses: [
        {
          id: "weapon.rightful-reward.after-healing.energy-restoration",
          label: "公义的酬报 · 受治疗后的元素能量恢复",
          reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
          source: weaponSource("RightfulReward"),
          status: "not_applicable"
        }
      ],
      equipmentId: "RightfulReward",
      kind: "weapon"
    }
  ],
  [
    "RingOfYaxche",
    {
      clauses: [
        {
          effectIds: ["weapon.ring-of-yaxche.after-skill.final-hp-to-normal-damage-bonus"],
          id: "weapon.ring-of-yaxche.after-skill.hp-scaled-normal-damage-bonus",
          label: "木棉之环 · 元素战技后按生命值上限的普通攻击伤害",
          source: weaponSource("RingOfYaxche"),
          status: "implemented"
        }
      ],
      equipmentId: "RingOfYaxche",
      kind: "weapon"
    }
  ],
  [
    "RoyalBow",
    {
      clauses: [
        {
          effectIds: [
            "weapon.royal-bow.focus.1-stack.crit-rate",
            "weapon.royal-bow.focus.2-stack.crit-rate",
            "weapon.royal-bow.focus.3-stack.crit-rate",
            "weapon.royal-bow.focus.4-stack.crit-rate",
            "weapon.royal-bow.focus.5-stack.crit-rate"
          ],
          id: "weapon.royal-bow.focus.crit-rate",
          label: "宗室长弓 · 本次命中前的专注暴击率层数",
          source: weaponSource("RoyalBow"),
          status: "implemented"
        }
      ],
      equipmentId: "RoyalBow",
      kind: "weapon"
    }
  ],
  [
    "RoyalGreatsword",
    {
      clauses: [
        {
          effectIds: [
            "weapon.royal-greatsword.focus.1-stack.crit-rate",
            "weapon.royal-greatsword.focus.2-stack.crit-rate",
            "weapon.royal-greatsword.focus.3-stack.crit-rate",
            "weapon.royal-greatsword.focus.4-stack.crit-rate",
            "weapon.royal-greatsword.focus.5-stack.crit-rate"
          ],
          id: "weapon.royal-greatsword.focus.crit-rate",
          label: "宗室大剑 · 本次命中前的专注暴击率层数",
          source: weaponSource("RoyalGreatsword"),
          status: "implemented"
        }
      ],
      equipmentId: "RoyalGreatsword",
      kind: "weapon"
    }
  ],
  [
    "RoyalGrimoire",
    {
      clauses: [
        {
          effectIds: [
            "weapon.royal-grimoire.focus.1-stack.crit-rate",
            "weapon.royal-grimoire.focus.2-stack.crit-rate",
            "weapon.royal-grimoire.focus.3-stack.crit-rate",
            "weapon.royal-grimoire.focus.4-stack.crit-rate",
            "weapon.royal-grimoire.focus.5-stack.crit-rate"
          ],
          id: "weapon.royal-grimoire.focus.crit-rate",
          label: "宗室秘法录 · 本次命中前的专注暴击率层数",
          source: weaponSource("RoyalGrimoire"),
          status: "implemented"
        }
      ],
      equipmentId: "RoyalGrimoire",
      kind: "weapon"
    }
  ],
  [
    "RoyalLongsword",
    {
      clauses: [
        {
          effectIds: [
            "weapon.royal-longsword.focus.1-stack.crit-rate",
            "weapon.royal-longsword.focus.2-stack.crit-rate",
            "weapon.royal-longsword.focus.3-stack.crit-rate",
            "weapon.royal-longsword.focus.4-stack.crit-rate",
            "weapon.royal-longsword.focus.5-stack.crit-rate"
          ],
          id: "weapon.royal-longsword.focus.crit-rate",
          label: "宗室长剑 · 本次命中前的专注暴击率层数",
          source: weaponSource("RoyalLongsword"),
          status: "implemented"
        }
      ],
      equipmentId: "RoyalLongsword",
      kind: "weapon"
    }
  ],
  [
    "RoyalSpear",
    {
      clauses: [
        {
          effectIds: [
            "weapon.royal-spear.focus.1-stack.crit-rate",
            "weapon.royal-spear.focus.2-stack.crit-rate",
            "weapon.royal-spear.focus.3-stack.crit-rate",
            "weapon.royal-spear.focus.4-stack.crit-rate",
            "weapon.royal-spear.focus.5-stack.crit-rate"
          ],
          id: "weapon.royal-spear.focus.crit-rate",
          label: "宗室猎枪 · 本次命中前的专注暴击率层数",
          source: weaponSource("RoyalSpear"),
          status: "implemented"
        }
      ],
      equipmentId: "RoyalSpear",
      kind: "weapon"
    }
  ],
  [
    "SacrificersStaff",
    {
      clauses: [
        {
          effectIds: [
            "weapon.sacrificers-staff.sacrificial-rite.1-stack.attack-percent",
            "weapon.sacrificers-staff.sacrificial-rite.1-stack.energy-recharge",
            "weapon.sacrificers-staff.sacrificial-rite.2-stack.attack-percent",
            "weapon.sacrificers-staff.sacrificial-rite.2-stack.energy-recharge",
            "weapon.sacrificers-staff.sacrificial-rite.3-stack.attack-percent",
            "weapon.sacrificers-staff.sacrificial-rite.3-stack.energy-recharge"
          ],
          id: "weapon.sacrificers-staff.sacrificial-rite.stats",
          label: "圣祭者的辉杖 · 元素战技命中后层数对应的攻击力与元素充能效率",
          source: weaponSource("SacrificersStaff"),
          status: "implemented"
        }
      ],
      equipmentId: "SacrificersStaff",
      kind: "weapon"
    }
  ],
  [
    "ScionOfTheBlazingSun",
    {
      clauses: [
        {
          effectIds: [
            "weapon.scion-of-the-blazing-sun.sunfire-arrow.physical-hit",
            "weapon.scion-of-the-blazing-sun.heartsearer-target.charged-damage-bonus"
          ],
          id: "weapon.scion-of-the-blazing-sun.passive",
          label: "烈阳之嗣 · 冷却就绪的阳炎矢与灼心目标重击伤害",
          source: weaponSource("ScionOfTheBlazingSun"),
          status: "implemented"
        }
      ],
      equipmentId: "ScionOfTheBlazingSun",
      kind: "weapon"
    }
  ],
  [
    "SequenceOfSolitude",
    {
      clauses: [
        {
          effectIds: ["weapon.sequence-of-solitude.hp-physical-hit"],
          id: "weapon.sequence-of-solitude.hp-physical-hit",
          label: "冷寂迸音 · 冷却就绪的基于生命值上限的物理伤害",
          source: weaponSource("SequenceOfSolitude"),
          status: "implemented"
        }
      ],
      equipmentId: "SequenceOfSolitude",
      kind: "weapon"
    }
  ],
  [
    "SerenitysCall",
    {
      clauses: [
        {
          effectIds: [
            "weapon.serenitys-call.after-reaction.hp-percent",
            "weapon.serenitys-call.after-reaction.full-moon.hp-percent"
          ],
          id: "weapon.serenitys-call.after-reaction.hp-percent",
          label: "谧音吹哨 · 触发元素反应后的生命值与月兆·满辉分支",
          source: weaponSource("SerenitysCall"),
          status: "implemented"
        }
      ],
      equipmentId: "SerenitysCall",
      kind: "weapon"
    }
  ],
  [
    "SerpentSpine",
    {
      clauses: [
        {
          effectIds: [
            "weapon.serpent-spine.wavesplitter.1-stack.damage-bonus",
            "weapon.serpent-spine.wavesplitter.2-stack.damage-bonus",
            "weapon.serpent-spine.wavesplitter.3-stack.damage-bonus",
            "weapon.serpent-spine.wavesplitter.4-stack.damage-bonus",
            "weapon.serpent-spine.wavesplitter.5-stack.damage-bonus"
          ],
          id: "weapon.serpent-spine.wavesplitter.damage-bonus",
          label: "螭骨剑 · 破浪层数对应的全伤害",
          source: weaponSource("SerpentSpine"),
          status: "implemented"
        },
        {
          id: "weapon.serpent-spine.wavesplitter.incoming-damage-increase",
          label: "螭骨剑 · 破浪层数对应的承伤增加",
          reason: "承伤增加不进入角色对敌核心动作伤害公式。",
          source: weaponSource("SerpentSpine"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SerpentSpine",
      kind: "weapon"
    }
  ],
  [
    "SilvershowerHeartstrings",
    {
      clauses: [
        {
          effectIds: [
            "weapon.silvershower-heartstrings.bond.1-stack.hp-percent",
            "weapon.silvershower-heartstrings.bond.2-stack.hp-percent",
            "weapon.silvershower-heartstrings.bond.3-stack.hp-percent",
            "weapon.silvershower-heartstrings.bond.3-stack.burst-crit-rate"
          ],
          id: "weapon.silvershower-heartstrings.bond.stats",
          label: "白雨心弦 · 生命之契层数对应的生命值与三层元素爆发暴击率",
          source: weaponSource("SilvershowerHeartstrings"),
          status: "implemented"
        }
      ],
      equipmentId: "SilvershowerHeartstrings",
      kind: "weapon"
    }
  ],
  [
    "SkywardAtlas",
    {
      clauses: [
        {
          effectIds: ["weapon.skyward-atlas.all-element-damage-bonus"],
          id: "weapon.skyward-atlas.all-element-damage-bonus",
          label: "天空之卷 · 所有元素伤害",
          source: weaponSource("SkywardAtlas"),
          status: "implemented"
        },
        {
          id: "weapon.skyward-atlas.favonius-cloud-autonomous-damage",
          label: "天空之卷 · 高天流云自主追敌攻击",
          reason: "高天流云属于武器自主伤害，不计入角色当前核心动作伤害。",
          source: weaponSource("SkywardAtlas"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SkywardAtlas",
      kind: "weapon"
    }
  ],
  [
    "SnareHook",
    {
      clauses: [
        {
          effectIds: [
            "weapon.snare-hook.after-reaction.elemental-mastery",
            "weapon.snare-hook.after-reaction.full-moon.elemental-mastery"
          ],
          id: "weapon.snare-hook.after-reaction.elemental-mastery",
          label: "罗网勾针 · 触发元素反应后的元素精通与月兆·满辉分支",
          source: weaponSource("SnareHook"),
          status: "implemented"
        }
      ],
      equipmentId: "SnareHook",
      kind: "weapon"
    }
  ],
  [
    "SnowTombedStarsilver",
    {
      clauses: [
        {
          effectIds: [
            "weapon.snow-tombed-starsilver.frost-icicle.without-cryo-aura.physical-hit",
            "weapon.snow-tombed-starsilver.frost-icicle.with-cryo-aura.physical-hit"
          ],
          id: "weapon.snow-tombed-starsilver.frost-icicle.physical-hit",
          label: "雪葬的星银 · 冷却就绪的霜葬物理伤害",
          source: weaponSource("SnowTombedStarsilver"),
          status: "implemented"
        }
      ],
      equipmentId: "SnowTombedStarsilver",
      kind: "weapon"
    }
  ],
  [
    "SplendorOfTranquilWaters",
    {
      clauses: [
        {
          effectIds: [
            "weapon.splendor-of-tranquil-waters.self-hp-change.1-stack.skill-damage-bonus",
            "weapon.splendor-of-tranquil-waters.self-hp-change.2-stack.skill-damage-bonus",
            "weapon.splendor-of-tranquil-waters.self-hp-change.3-stack.skill-damage-bonus"
          ],
          id: "weapon.splendor-of-tranquil-waters.self-hp-change.skill-damage-bonus",
          label: "静水流涌之辉 · 自身生命值变动后的元素战技伤害层数",
          source: weaponSource("SplendorOfTranquilWaters"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.splendor-of-tranquil-waters.teammate-hp-change.1-stack.hp-percent",
            "weapon.splendor-of-tranquil-waters.teammate-hp-change.2-stack.hp-percent"
          ],
          id: "weapon.splendor-of-tranquil-waters.teammate-hp-change.hp-percent",
          label: "静水流涌之辉 · 其他队友生命值变动后的生命值层数",
          source: weaponSource("SplendorOfTranquilWaters"),
          status: "implemented"
        }
      ],
      equipmentId: "SplendorOfTranquilWaters",
      kind: "weapon"
    }
  ],
  [
    "StaffOfHoma",
    {
      clauses: [
        {
          effectIds: ["weapon.staff-of-homa.hp-percent"],
          id: "weapon.staff-of-homa.hp-percent",
          label: "护摩之杖 · 生命值",
          source: weaponSource("StaffOfHoma", "primary"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.staff-of-homa.hp-sourced-flat-attack"],
          id: "weapon.staff-of-homa.hp-sourced-flat-attack",
          label: "护摩之杖 · 基于生命值上限的攻击力",
          source: weaponSource("StaffOfHoma", "primary"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.staff-of-homa.hp-below-50.extra-hp-sourced-flat-attack"],
          id: "weapon.staff-of-homa.hp-below-50.extra-hp-sourced-flat-attack",
          label: "护摩之杖 · 当前生命值低于50%时的额外攻击力",
          source: weaponSource("StaffOfHoma", "primary"),
          status: "implemented"
        }
      ],
      equipmentId: "StaffOfHoma",
      kind: "weapon"
    }
  ],
  [
    "StaffOfTheScarletSands",
    {
      clauses: [
        {
          effectIds: [
            "weapon.staff-of-the-scarlet-sands.elemental-mastery-to-flat-attack",
            "weapon.staff-of-the-scarlet-sands.red-sands-dream.1-stack.elemental-mastery-to-flat-attack",
            "weapon.staff-of-the-scarlet-sands.red-sands-dream.2-stack.elemental-mastery-to-flat-attack",
            "weapon.staff-of-the-scarlet-sands.red-sands-dream.3-stack.elemental-mastery-to-flat-attack"
          ],
          id: "weapon.staff-of-the-scarlet-sands.elemental-mastery-sourced-flat-attack",
          label: "赤沙之杖 · 元素精通转平面攻击力与元素战技命中后的赤沙之梦层数",
          source: weaponSource("StaffOfTheScarletSands"),
          status: "implemented"
        }
      ],
      equipmentId: "StaffOfTheScarletSands",
      kind: "weapon"
    }
  ],
  [
    "SturdyBone",
    {
      clauses: [
        {
          id: "weapon.sturdy-bone.sprint-stamina-consumption",
          label: "弥坚骨 · 冲刺时体力消耗降低",
          reason: "体力消耗只影响位移与循环，不改变当前核心动作的一次期望数值。",
          source: weaponSource("SturdyBone"),
          status: "not_applicable"
        },
        {
          effectIds: ["weapon.sturdy-bone.sprint-followup.normal-attack-additive-damage"],
          id: "weapon.sturdy-bone.sprint-followup.normal-attack-additive-damage",
          label: "弥坚骨 · 冲刺后的18次普通攻击（7秒内）基于攻击力的附加伤害",
          source: weaponSource("SturdyBone", "primary"),
          status: "implemented"
        }
      ],
      equipmentId: "SturdyBone",
      kind: "weapon"
    }
  ],
  [
    "SummitShaper",
    {
      clauses: [
        {
          effectIds: ["weapon.summit-shaper.shield-strength"],
          id: "weapon.summit-shaper.shield-strength",
          label: "斫峰之刃 · 护盾强效",
          source: weaponSource("SummitShaper"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.summit-shaper.golden-majesty.unshielded.1-stack.attack-percent",
            "weapon.summit-shaper.golden-majesty.unshielded.2-stack.attack-percent",
            "weapon.summit-shaper.golden-majesty.unshielded.3-stack.attack-percent",
            "weapon.summit-shaper.golden-majesty.unshielded.4-stack.attack-percent",
            "weapon.summit-shaper.golden-majesty.unshielded.5-stack.attack-percent",
            "weapon.summit-shaper.golden-majesty.shielded.1-stack.attack-percent",
            "weapon.summit-shaper.golden-majesty.shielded.2-stack.attack-percent",
            "weapon.summit-shaper.golden-majesty.shielded.3-stack.attack-percent",
            "weapon.summit-shaper.golden-majesty.shielded.4-stack.attack-percent",
            "weapon.summit-shaper.golden-majesty.shielded.5-stack.attack-percent"
          ],
          id: "weapon.summit-shaper.golden-majesty.attack-percent",
          label: "斫峰之刃 · 金璋皇极的护盾状态与攻击命中层数",
          source: weaponSource("SummitShaper"),
          status: "implemented"
        }
      ],
      equipmentId: "SummitShaper",
      kind: "weapon"
    }
  ],
  [
    "SurfsUp",
    {
      clauses: [
        {
          effectIds: ["weapon.surfs-up.hp-percent"],
          id: "weapon.surfs-up.hp-percent",
          label: "冲浪时光 · 生命值",
          source: weaponSource("SurfsUp"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.surfs-up.scorching-summer.1-stack.normal-damage-bonus",
            "weapon.surfs-up.scorching-summer.2-stack.normal-damage-bonus",
            "weapon.surfs-up.scorching-summer.3-stack.normal-damage-bonus",
            "weapon.surfs-up.scorching-summer.4-stack.normal-damage-bonus"
          ],
          id: "weapon.surfs-up.scorching-summer.normal-damage-bonus",
          label: "冲浪时光 · 炽夏层数对应的普通攻击伤害",
          source: weaponSource("SurfsUp"),
          status: "implemented"
        }
      ],
      equipmentId: "SurfsUp",
      kind: "weapon"
    }
  ],
  [
    "SwordOfDescension",
    {
      clauses: [
        {
          effectIds: ["weapon.sword-of-descension.descension.physical-hit"],
          id: "weapon.sword-of-descension.descension.physical-hit",
          label: "降临之剑 · 冷却就绪时的降临物理伤害",
          source: weaponSource("SwordOfDescension"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.sword-of-descension.descension.physical-hit",
            "weapon.sword-of-descension.playstation.traveler.flat-attack"
          ],
          id: "weapon.sword-of-descension.platform-eligibility",
          label: "降临之剑 · PlayStation Network 被动已生效快照",
          source: weaponSource("SwordOfDescension"),
          status: "implemented"
        },
        {
          effectIds: ["weapon.sword-of-descension.playstation.traveler.flat-attack"],
          id: "weapon.sword-of-descension.traveler-flat-attack",
          label: "降临之剑 · 旅行者装备时的固定攻击力",
          source: weaponSource("SwordOfDescension"),
          status: "implemented"
        }
      ],
      equipmentId: "SwordOfDescension",
      kind: "weapon"
    }
  ],
  [
    "SwordOfNarzissenkreuz",
    {
      clauses: [
        {
          id: "weapon.sword-of-narzissenkreuz.no-arkhe.arkhe-aligned-energy-impact",
          label: "水仙十字之剑 · 无始基力角色的冷却就绪芒性或荒性能量冲击",
          reason: "始基力能量冲击是武器独立事件，不计入角色当前核心动作伤害。",
          source: weaponSource("SwordOfNarzissenkreuz"),
          status: "not_applicable"
        },
        {
          id: "weapon.sword-of-narzissenkreuz.arkhe-holder-passive-ineligibility",
          label: "水仙十字之剑 · 始基力角色不会触发能量冲击",
          reason: "武器被动仅在装备者不具备始基力时触发，因此该分支不参与所选核心动作伤害结算。",
          source: weaponSource("SwordOfNarzissenkreuz"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SwordOfNarzissenkreuz",
      kind: "weapon"
    }
  ],
  [
    "SymphonistOfScents",
    {
      clauses: [
        {
          effectIds: [
            "weapon.symphonist-of-scents.attack-percent",
            "weapon.symphonist-of-scents.off-field.extra-attack-percent"
          ],
          id: "weapon.symphonist-of-scents.attack-percent",
          label: "香韵奏者 · 攻击力与后台时的额外攻击力",
          source: weaponSource("SymphonistOfScents"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.symphonist-of-scents.sweet-echoes.self.attack-percent",
            "weapon.symphonist-of-scents.sweet-echoes.healed-recipient.attack-percent"
          ],
          id: "weapon.symphonist-of-scents.healing-recipient-buff",
          label: "香韵奏者 · 治疗后持有者与受治疗角色的攻击力",
          source: weaponSource("SymphonistOfScents"),
          status: "implemented"
        }
      ],
      equipmentId: "SymphonistOfScents",
      kind: "weapon"
    }
  ],
  [
    "TheBell",
    {
      clauses: [
        {
          effectIds: ["weapon.the-bell.shielded.damage-bonus"],
          id: "weapon.the-bell.shielded.damage-bonus",
          label: "钟剑 · 处于护盾庇护下的全伤害",
          source: weaponSource("TheBell"),
          status: "implemented"
        },
        {
          id: "weapon.the-bell.rebellious-guardian-shield",
          label: "钟剑 · 叛逆的守护者护盾与护盾强效",
          reason: "护盾生成与护盾强效不进入角色对敌核心动作伤害；护盾状态下的全伤害效果仍单独维护。",
          source: weaponSource("TheBell"),
          status: "not_applicable"
        }
      ],
      equipmentId: "TheBell",
      kind: "weapon"
    }
  ],
  [
    "TheDaybreakChronicles",
    {
      clauses: [
        {
          effectIds: [
            "weapon.the-daybreak-chronicles.radiance.normal.1-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.normal.2-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.normal.3-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.normal.4-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.normal.5-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.normal.6-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.skill.1-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.skill.2-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.skill.3-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.skill.4-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.skill.5-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.skill.6-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.burst.1-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.burst.2-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.burst.3-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.burst.4-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.burst.5-stack.damage-bonus",
            "weapon.the-daybreak-chronicles.radiance.burst.6-stack.damage-bonus"
          ],
          id: "weapon.the-daybreak-chronicles.radiance.damage-bonus",
          label: "黎明破晓之史 · 当前攻击类别的光辉层数",
          source: weaponSource("TheDaybreakChronicles"),
          status: "implemented"
        }
      ],
      equipmentId: "TheDaybreakChronicles",
      kind: "weapon"
    }
  ],
  [
    "TheDockhandsAssistant",
    {
      clauses: [
        {
          effectIds: [
            "weapon.the-dockhands-assistant.mariners-resolve.1-mark.elemental-mastery",
            "weapon.the-dockhands-assistant.mariners-resolve.2-mark.elemental-mastery",
            "weapon.the-dockhands-assistant.mariners-resolve.3-mark.elemental-mastery"
          ],
          id: "weapon.the-dockhands-assistant.mariners-resolve.elemental-mastery",
          label: "船坞长剑 · 消耗坚忍标记后的元素精通",
          source: weaponSource("TheDockhandsAssistant"),
          status: "implemented"
        },
        {
          id: "weapon.the-dockhands-assistant.mariners-resolve.energy-restoration",
          label: "船坞长剑 · 消耗坚忍标记后的能量恢复",
          reason: "能量恢复只改变后续循环资源，不改变当前核心动作的一次期望数值。",
          source: weaponSource("TheDockhandsAssistant"),
          status: "not_applicable"
        }
      ],
      equipmentId: "TheDockhandsAssistant",
      kind: "weapon"
    }
  ],
  [
    "TheFirstGreatMagic",
    {
      clauses: [
        {
          effectIds: ["weapon.the-first-great-magic.charged-damage-bonus"],
          id: "weapon.the-first-great-magic.charged-damage-bonus",
          label: "最初的大魔术 · 重击伤害",
          source: weaponSource("TheFirstGreatMagic"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.the-first-great-magic.same-element-party.1-character.attack-percent",
            "weapon.the-first-great-magic.same-element-party.2-character.attack-percent",
            "weapon.the-first-great-magic.same-element-party.3-character.attack-percent"
          ],
          id: "weapon.the-first-great-magic.same-element-party.attack-percent",
          label: "最初的大魔术 · 同元素队友数量对应的攻击力",
          source: weaponSource("TheFirstGreatMagic"),
          status: "implemented"
        },
        {
          id: "weapon.the-first-great-magic.different-element-party-movement-speed",
          label: "最初的大魔术 · 异元素队友数量对应的移动速度",
          reason: "移动速度只影响位移与循环，不改变当前核心动作的一次期望数值。",
          source: weaponSource("TheFirstGreatMagic"),
          status: "not_applicable"
        }
      ],
      equipmentId: "TheFirstGreatMagic",
      kind: "weapon"
    }
  ],
  [
    "TheFlute",
    {
      clauses: [
        {
          effectIds: ["weapon.the-flute.five-harmonic.physical-hit"],
          id: "weapon.the-flute.five-harmonic.physical-hit",
          label: "笛剑 · 五个和音后的冷却就绪物理伤害",
          source: weaponSource("TheFlute"),
          status: "implemented"
        }
      ],
      equipmentId: "TheFlute",
      kind: "weapon"
    }
  ],
  [
    "TheUnforged",
    {
      clauses: [
        {
          effectIds: ["weapon.the-unforged.shield-strength"],
          id: "weapon.the-unforged.shield-strength",
          label: "无工之剑 · 护盾强效",
          source: weaponSource("TheUnforged"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.the-unforged.golden-majesty.unshielded.1-stack.attack-percent",
            "weapon.the-unforged.golden-majesty.unshielded.2-stack.attack-percent",
            "weapon.the-unforged.golden-majesty.unshielded.3-stack.attack-percent",
            "weapon.the-unforged.golden-majesty.unshielded.4-stack.attack-percent",
            "weapon.the-unforged.golden-majesty.unshielded.5-stack.attack-percent",
            "weapon.the-unforged.golden-majesty.shielded.1-stack.attack-percent",
            "weapon.the-unforged.golden-majesty.shielded.2-stack.attack-percent",
            "weapon.the-unforged.golden-majesty.shielded.3-stack.attack-percent",
            "weapon.the-unforged.golden-majesty.shielded.4-stack.attack-percent",
            "weapon.the-unforged.golden-majesty.shielded.5-stack.attack-percent"
          ],
          id: "weapon.the-unforged.golden-majesty.attack-percent",
          label: "无工之剑 · 金璋皇极的护盾状态与攻击命中层数",
          source: weaponSource("TheUnforged"),
          status: "implemented"
        }
      ],
      equipmentId: "TheUnforged",
      kind: "weapon"
    }
  ],
  [
    "TheViridescentHunt",
    {
      clauses: [
        {
          id: "weapon.the-viridescent-hunt.verdant-wind.autonomous-periodic-damage",
          label: "苍翠猎弓 · 苍翠之风的持续吸附物理伤害",
          reason: "苍翠之风属于武器周期自主伤害，不计入角色当前核心动作伤害。",
          source: weaponSource("TheViridescentHunt"),
          status: "not_applicable"
        }
      ],
      equipmentId: "TheViridescentHunt",
      kind: "weapon"
    }
  ],
  [
    "TheWidsith",
    {
      clauses: [
        {
          effectIds: [
            "weapon.the-widsith.recitative.attack-percent",
            "weapon.the-widsith.aria.all-element-damage-bonus",
            "weapon.the-widsith.interlude.elemental-mastery"
          ],
          id: "weapon.the-widsith.theme",
          label: "流浪乐章 · 登场主题随机分支",
          source: weaponSource("TheWidsith"),
          status: "implemented"
        }
      ],
      equipmentId: "TheWidsith",
      kind: "weapon"
    }
  ],
  [
    "ThunderingPulse",
    {
      clauses: [
        {
          effectIds: ["weapon.thundering-pulse.attack-percent"],
          id: "weapon.thundering-pulse.attack-percent",
          label: "飞雷之弦振 · 攻击力",
          source: weaponSource("ThunderingPulse"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.thundering-pulse.thunder-emblem.1-stack.normal-damage-bonus",
            "weapon.thundering-pulse.thunder-emblem.2-stack.normal-damage-bonus",
            "weapon.thundering-pulse.thunder-emblem.3-stack.normal-damage-bonus"
          ],
          id: "weapon.thundering-pulse.thunder-emblem.normal-damage-bonus",
          label: "飞雷之弦振 · 飞雷之巴印层数对应的普通攻击伤害",
          source: weaponSource("ThunderingPulse"),
          status: "implemented"
        }
      ],
      equipmentId: "ThunderingPulse",
      kind: "weapon"
    }
  ],
  [
    "TomeOfTheEternalFlow",
    {
      clauses: [
        {
          effectIds: ["weapon.tome-of-the-eternal-flow.hp-percent"],
          id: "weapon.tome-of-the-eternal-flow.hp-percent",
          label: "万世流涌大典 · 生命值",
          source: weaponSource("TomeOfTheEternalFlow"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.tome-of-the-eternal-flow.raging-tides.1-stack.charged-damage-bonus",
            "weapon.tome-of-the-eternal-flow.raging-tides.2-stack.charged-damage-bonus",
            "weapon.tome-of-the-eternal-flow.raging-tides.3-stack.charged-damage-bonus"
          ],
          id: "weapon.tome-of-the-eternal-flow.raging-tides.charged-damage-bonus",
          label: "万世流涌大典 · 荡尽层数对应的重击伤害",
          source: weaponSource("TomeOfTheEternalFlow"),
          status: "implemented"
        },
        {
          id: "weapon.tome-of-the-eternal-flow.raging-tides.energy-restoration",
          label: "万世流涌大典 · 荡尽三层后的能量恢复",
          reason: "能量恢复只改变后续循环资源，不改变当前核心动作的一次期望数值。",
          source: weaponSource("TomeOfTheEternalFlow"),
          status: "not_applicable"
        }
      ],
      equipmentId: "TomeOfTheEternalFlow",
      kind: "weapon"
    }
  ],
  [
    "TulaytullahsRemembrance",
    {
      clauses: [
        {
          id: "weapon.tulaytullahs-remembrance.normal-attack-speed",
          label: "图莱杜拉的回忆 · 普通攻击速度",
          reason: "攻击速度会影响动作时长与循环，不改变选定普通攻击单段的期望数值。",
          source: weaponSource("TulaytullahsRemembrance"),
          status: "not_applicable"
        },
        {
          effectIds: [
            "weapon.tulaytullahs-remembrance.aeons-flow.1-unit.normal-damage-bonus",
            "weapon.tulaytullahs-remembrance.aeons-flow.2-unit.normal-damage-bonus",
            "weapon.tulaytullahs-remembrance.aeons-flow.3-unit.normal-damage-bonus",
            "weapon.tulaytullahs-remembrance.aeons-flow.4-unit.normal-damage-bonus",
            "weapon.tulaytullahs-remembrance.aeons-flow.5-unit.normal-damage-bonus",
            "weapon.tulaytullahs-remembrance.aeons-flow.6-unit.normal-damage-bonus",
            "weapon.tulaytullahs-remembrance.aeons-flow.7-unit.normal-damage-bonus",
            "weapon.tulaytullahs-remembrance.aeons-flow.8-unit.normal-damage-bonus",
            "weapon.tulaytullahs-remembrance.aeons-flow.9-unit.normal-damage-bonus",
            "weapon.tulaytullahs-remembrance.aeons-flow.10-unit.normal-damage-bonus"
          ],
          id: "weapon.tulaytullahs-remembrance.aeons-flow.normal-damage-bonus",
          label: "图莱杜拉的回忆 · 流转的微风当前累计量对应的普通攻击伤害",
          source: weaponSource("TulaytullahsRemembrance"),
          status: "implemented"
        }
      ],
      equipmentId: "TulaytullahsRemembrance",
      kind: "weapon"
    }
  ],
  [
    "UltimateOverlordsMegaMagicSword",
    {
      clauses: [
        {
          effectIds: ["weapon.ultimate-overlords-mega-magic-sword.attack-percent"],
          id: "weapon.ultimate-overlords-mega-magic-sword.attack-percent",
          label: "「究极霸王超级魔剑」· 攻击力",
          source: weaponSource("UltimateOverlordsMegaMagicSword"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.ultimate-overlords-mega-magic-sword.melusine.1-stack.attack-percent",
            "weapon.ultimate-overlords-mega-magic-sword.melusine.2-stack.attack-percent",
            "weapon.ultimate-overlords-mega-magic-sword.melusine.3-stack.attack-percent",
            "weapon.ultimate-overlords-mega-magic-sword.melusine.4-stack.attack-percent",
            "weapon.ultimate-overlords-mega-magic-sword.melusine.5-stack.attack-percent",
            "weapon.ultimate-overlords-mega-magic-sword.melusine.6-stack.attack-percent",
            "weapon.ultimate-overlords-mega-magic-sword.melusine.7-stack.attack-percent",
            "weapon.ultimate-overlords-mega-magic-sword.melusine.8-stack.attack-percent",
            "weapon.ultimate-overlords-mega-magic-sword.melusine.9-stack.attack-percent",
            "weapon.ultimate-overlords-mega-magic-sword.melusine.10-stack.attack-percent",
            "weapon.ultimate-overlords-mega-magic-sword.melusine.11-stack.attack-percent",
            "weapon.ultimate-overlords-mega-magic-sword.melusine.12-stack.attack-percent"
          ],
          id: "weapon.ultimate-overlords-mega-magic-sword.melusine.attack-percent",
          label: "「究极霸王超级魔剑」· 梅露辛数量对应的额外攻击力",
          source: weaponSource("UltimateOverlordsMegaMagicSword"),
          status: "implemented"
        }
      ],
      equipmentId: "UltimateOverlordsMegaMagicSword",
      kind: "weapon"
    }
  ],
  [
    "Verdict",
    {
      clauses: [
        {
          effectIds: ["weapon.verdict.attack-percent"],
          id: "weapon.verdict.attack-percent",
          label: "裁断 · 攻击力",
          source: weaponSource("Verdict"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.verdict.rift-ripple.1-stack.skill-damage-bonus",
            "weapon.verdict.rift-ripple.2-stack.skill-damage-bonus"
          ],
          id: "weapon.verdict.rift-ripple.skill-damage-bonus",
          label: "裁断 · 本次元素战技命中前持有的约印数量",
          source: weaponSource("Verdict"),
          status: "implemented"
        }
      ],
      equipmentId: "Verdict",
      kind: "weapon"
    }
  ],
  [
    "VividNotions",
    {
      clauses: [
        {
          effectIds: ["weapon.vivid-notions.attack-percent"],
          id: "weapon.vivid-notions.attack-percent",
          label: "溢彩心念 · 攻击力",
          source: weaponSource("VividNotions"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.vivid-notions.dawn.plunge-crit-damage",
            "weapon.vivid-notions.dusk.plunge-crit-damage"
          ],
          id: "weapon.vivid-notions.dawn-and-dusk.plunge-crit-damage",
          label: "溢彩心念 · 晨曦与暮色状态下的下落攻击暴击伤害",
          source: weaponSource("VividNotions"),
          status: "implemented"
        }
      ],
      equipmentId: "VividNotions",
      kind: "weapon"
    }
  ],
  [
    "VortexVanquisher",
    {
      clauses: [
        {
          effectIds: ["weapon.vortex-vanquisher.shield-strength"],
          id: "weapon.vortex-vanquisher.shield-strength",
          label: "贯虹之槊 · 护盾强效",
          source: weaponSource("VortexVanquisher"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.vortex-vanquisher.golden-majesty.unshielded.1-stack.attack-percent",
            "weapon.vortex-vanquisher.golden-majesty.unshielded.2-stack.attack-percent",
            "weapon.vortex-vanquisher.golden-majesty.unshielded.3-stack.attack-percent",
            "weapon.vortex-vanquisher.golden-majesty.unshielded.4-stack.attack-percent",
            "weapon.vortex-vanquisher.golden-majesty.unshielded.5-stack.attack-percent",
            "weapon.vortex-vanquisher.golden-majesty.shielded.1-stack.attack-percent",
            "weapon.vortex-vanquisher.golden-majesty.shielded.2-stack.attack-percent",
            "weapon.vortex-vanquisher.golden-majesty.shielded.3-stack.attack-percent",
            "weapon.vortex-vanquisher.golden-majesty.shielded.4-stack.attack-percent",
            "weapon.vortex-vanquisher.golden-majesty.shielded.5-stack.attack-percent"
          ],
          id: "weapon.vortex-vanquisher.golden-majesty.attack-percent",
          label: "贯虹之槊 · 金璋皇极的护盾状态与攻击命中层数",
          source: weaponSource("VortexVanquisher"),
          status: "implemented"
        }
      ],
      equipmentId: "VortexVanquisher",
      kind: "weapon"
    }
  ],
  [
    "WanderingEvenstar",
    {
      clauses: [
        {
          effectIds: [
            "weapon.wandering-evenstar.after-10s.self.source-em-to-flat-attack",
            "weapon.wandering-evenstar.after-10s.other-party.source-em-to-flat-attack"
          ],
          id: "weapon.wandering-evenstar.elemental-mastery-sourced-flat-attack",
          label: "流浪的晚星 · 元素精通转平面攻击力与其他队友分支",
          source: weaponSource("WanderingEvenstar"),
          status: "implemented"
        }
      ],
      equipmentId: "WanderingEvenstar",
      kind: "weapon"
    }
  ],
  [
    "WaveridingWhirl",
    {
      clauses: [
        {
          effectIds: [
            "weapon.waveriding-whirl.hydro-character-count.0.hp-percent",
            "weapon.waveriding-whirl.hydro-character-count.1.hp-percent",
            "weapon.waveriding-whirl.hydro-character-count.2.hp-percent"
          ],
          id: "weapon.waveriding-whirl.hydro-character-count.hp-percent",
          label: "乘浪的回旋 · 施放元素战技后的水元素角色数量对应生命值",
          source: weaponSource("WaveridingWhirl"),
          status: "implemented"
        },
        {
          id: "weapon.waveriding-whirl.swimming-stamina-consumption",
          label: "乘浪的回旋 · 游泳体力消耗降低",
          reason: "体力消耗只影响位移与循环，不改变当前核心动作的一次期望数值。",
          source: weaponSource("WaveridingWhirl"),
          status: "not_applicable"
        }
      ],
      equipmentId: "WaveridingWhirl",
      kind: "weapon"
    }
  ],
  [
    "Whiteblind",
    {
      clauses: [
        {
          effectIds: [
            "weapon.whiteblind.infusion-blade.1-stack.attack-percent",
            "weapon.whiteblind.infusion-blade.1-stack.defense-percent",
            "weapon.whiteblind.infusion-blade.2-stack.attack-percent",
            "weapon.whiteblind.infusion-blade.2-stack.defense-percent",
            "weapon.whiteblind.infusion-blade.3-stack.attack-percent",
            "weapon.whiteblind.infusion-blade.3-stack.defense-percent",
            "weapon.whiteblind.infusion-blade.4-stack.attack-percent",
            "weapon.whiteblind.infusion-blade.4-stack.defense-percent"
          ],
          id: "weapon.whiteblind.infusion-blade.attack-and-defense-percent",
          label: "白影剑 · 注能之锋层数对应的攻击力与防御力",
          source: weaponSource("Whiteblind"),
          status: "implemented"
        }
      ],
      equipmentId: "Whiteblind",
      kind: "weapon"
    }
  ],
  [
    "WindblumeOde",
    {
      clauses: [
        {
          effectIds: ["weapon.windblume-ode.after-skill.attack-percent"],
          id: "weapon.windblume-ode.after-skill.attack-percent",
          label: "风花之颂 · 此前施放元素战技后的攻击力",
          source: weaponSource("WindblumeOde"),
          status: "implemented"
        }
      ],
      equipmentId: "WindblumeOde",
      kind: "weapon"
    }
  ],
  [
    "WolfFang",
    {
      clauses: [
        {
          effectIds: ["weapon.wolf-fang.skill-burst.damage-bonus"],
          id: "weapon.wolf-fang.skill-burst.damage-bonus",
          label: "狼牙 · 元素战技与元素爆发伤害",
          source: weaponSource("WolfFang"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.wolf-fang.skill-hit.1-stack.crit-rate",
            "weapon.wolf-fang.skill-hit.2-stack.crit-rate",
            "weapon.wolf-fang.skill-hit.3-stack.crit-rate",
            "weapon.wolf-fang.skill-hit.4-stack.crit-rate"
          ],
          id: "weapon.wolf-fang.skill-hit.crit-rate",
          label: "狼牙 · 此前元素战技命中的暴击率层数",
          source: weaponSource("WolfFang"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.wolf-fang.burst-hit.1-stack.crit-rate",
            "weapon.wolf-fang.burst-hit.2-stack.crit-rate",
            "weapon.wolf-fang.burst-hit.3-stack.crit-rate",
            "weapon.wolf-fang.burst-hit.4-stack.crit-rate"
          ],
          id: "weapon.wolf-fang.burst-hit.crit-rate",
          label: "狼牙 · 此前元素爆发命中的暴击率层数",
          source: weaponSource("WolfFang"),
          status: "implemented"
        }
      ],
      equipmentId: "WolfFang",
      kind: "weapon"
    }
  ],
  [
    "XiphosMoonlight",
    {
      clauses: [
        {
          effectIds: ["weapon.xiphos-moonlight.after-10s.self.source-em-to-energy-recharge"],
          id: "weapon.xiphos-moonlight.holder.em-sourced-energy-recharge",
          label: "西福斯的月光 · 持有者元素精通转元素充能效率",
          source: weaponSource("XiphosMoonlight"),
          status: "implemented"
        },
        {
          effectIds: [
            "weapon.xiphos-moonlight.after-10s.other-party.source-em-to-energy-recharge"
          ],
          id: "weapon.xiphos-moonlight.other-party.em-sourced-energy-recharge",
          label: "西福斯的月光 · 其他队友的元素精通转元素充能效率",
          source: weaponSource("XiphosMoonlight"),
          status: "implemented"
        }
      ],
      equipmentId: "XiphosMoonlight",
      kind: "weapon"
    }
  ],
  [
    "ApprenticesNotes",
    {
      clauses: [
        {
          id: "weapon.apprentices-notes.passive.none",
          label: "学徒笔记 · 无武器技能",
          reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
          source: weaponSource("ApprenticesNotes"),
          status: "not_applicable"
        }
      ],
      equipmentId: "ApprenticesNotes",
      kind: "weapon"
    }
  ],
  [
    "BeginnersProtector",
    {
      clauses: [
        {
          id: "weapon.beginners-protector.passive.none",
          label: "新手长枪 · 无武器技能",
          reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
          source: weaponSource("BeginnersProtector"),
          status: "not_applicable"
        }
      ],
      equipmentId: "BeginnersProtector",
      kind: "weapon"
    }
  ],
  [
    "BlackTassel",
    {
      clauses: [
        {
          effectIds: ["weapon.black-tassel.slime-target.damage-bonus"],
          id: "weapon.black-tassel.slime-target.damage-bonus",
          label: "黑缨枪 · 当前目标为史莱姆类敌人时的伤害",
          source: weaponSource("BlackTassel"),
          status: "implemented"
        }
      ],
      equipmentId: "BlackTassel",
      kind: "weapon"
    }
  ],
  [
    "BloodtaintedGreatsword",
    {
      clauses: [
        {
          effectIds: ["weapon.bloodtainted-greatsword.pyro-or-electro-aura.damage-bonus"],
          id: "weapon.bloodtainted-greatsword.pyro-or-electro-aura.damage-bonus",
          label: "沐浴龙血的剑 · 当前目标受火元素或雷元素影响时的伤害",
          source: weaponSource("BloodtaintedGreatsword"),
          status: "implemented"
        }
      ],
      equipmentId: "BloodtaintedGreatsword",
      kind: "weapon"
    }
  ],
  [
    "CoolSteel",
    {
      clauses: [
        {
          effectIds: ["weapon.cool-steel.hydro-or-cryo-aura.damage-bonus"],
          id: "weapon.cool-steel.hydro-or-cryo-aura.damage-bonus",
          label: "冷刃 · 当前目标受水元素或冰元素影响时的伤害",
          source: weaponSource("CoolSteel"),
          status: "implemented"
        }
      ],
      equipmentId: "CoolSteel",
      kind: "weapon"
    }
  ],
  [
    "DarkIronSword",
    {
      clauses: [
        {
          effectIds: ["weapon.dark-iron-sword.electro-reaction-window.attack-percent"],
          id: "weapon.dark-iron-sword.electro-reaction-window.attack-percent",
          label: "暗铁剑 · 此前触发雷元素相关反应后的12秒内攻击力",
          source: weaponSource("DarkIronSword"),
          status: "implemented"
        }
      ],
      equipmentId: "DarkIronSword",
      kind: "weapon"
    }
  ],
  [
    "DebateClub",
    {
      clauses: [
        {
          effectIds: ["weapon.debate-club.after-skill.physical-hit"],
          id: "weapon.debate-club.after-skill.physical-hit",
          label: "以理服人 · 元素战技后冷却就绪的普攻或重击物理伤害",
          source: weaponSource("DebateClub"),
          status: "implemented"
        }
      ],
      equipmentId: "DebateClub",
      kind: "weapon"
    }
  ],
  [
    "DullBlade",
    {
      clauses: [
        {
          id: "weapon.dull-blade.passive.none",
          label: "无锋剑 · 无武器技能",
          reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
          source: weaponSource("DullBlade"),
          status: "not_applicable"
        }
      ],
      equipmentId: "DullBlade",
      kind: "weapon"
    }
  ],
  [
    "FerrousShadow",
    {
      clauses: [
        {
          effectIds: ["weapon.ferrous-shadow.low-hp.charged-damage-bonus"],
          id: "weapon.ferrous-shadow.low-hp.charged-damage-bonus",
          label: "铁影阔剑 · 当前生命值低于精炼阈值时的重击伤害",
          source: weaponSource("FerrousShadow"),
          status: "implemented"
        },
        {
          id: "weapon.ferrous-shadow.low-hp.interruption-resistance",
          label: "铁影阔剑 · 低生命值时抗打断能力提升",
          reason: "抗打断只影响动作是否被中断，不改变当前核心动作的一次期望数值。",
          source: weaponSource("FerrousShadow"),
          status: "not_applicable"
        }
      ],
      equipmentId: "FerrousShadow",
      kind: "weapon"
    }
  ],
  [
    "SkyriderGreatsword",
    {
      clauses: [
        {
          effectIds: [
            "weapon.skyrider-greatsword.courage.1-stack.attack-percent",
            "weapon.skyrider-greatsword.courage.2-stack.attack-percent",
            "weapon.skyrider-greatsword.courage.3-stack.attack-percent",
            "weapon.skyrider-greatsword.courage.4-stack.attack-percent"
          ],
          id: "weapon.skyrider-greatsword.courage.attack-percent",
          label: "飞天大御剑 · 此前普攻或重击命中后的勇气层数",
          source: weaponSource("SkyriderGreatsword"),
          status: "implemented"
        }
      ],
      equipmentId: "SkyriderGreatsword",
      kind: "weapon"
    }
  ],
  [
    "Slingshot",
    {
      clauses: [
        {
          effectIds: [
            "weapon.slingshot.flight-time.within-0.3-seconds.damage-bonus",
            "weapon.slingshot.flight-time.after-0.3-seconds.damage-penalty"
          ],
          id: "weapon.slingshot.flight-time.damage-bonus",
          label: "弹弓 · 本次普攻或重击箭矢飞行时间对应的伤害",
          source: weaponSource("Slingshot"),
          status: "implemented"
        }
      ],
      equipmentId: "Slingshot",
      kind: "weapon"
    }
  ],
  [
    "ThrillingTalesOfDragonSlayers",
    {
      clauses: [
        {
          effectIds: ["weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent"],
          id: "weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent",
          label: "讨龙英杰谭 · 从队友切换至当前角色后的攻击力",
          source: weaponSource("ThrillingTalesOfDragonSlayers", "party_member"),
          status: "implemented"
        }
      ],
      equipmentId: "ThrillingTalesOfDragonSlayers",
      kind: "weapon"
    }
  ],
  [
    "TwinNephrite",
    {
      clauses: [
        {
          effectIds: ["weapon.twin-nephrite.after-defeat.attack-percent"],
          id: "weapon.twin-nephrite.after-defeat.attack-percent",
          label: "甲级宝珏 · 击败敌人后的攻击力",
          source: weaponSource("TwinNephrite"),
          status: "implemented"
        },
        {
          id: "weapon.twin-nephrite.after-defeat.movement-speed",
          label: "甲级宝珏 · 击败敌人后的移动速度",
          reason: "移动速度只影响位移与循环，不改变当前核心动作的一次期望数值。",
          source: weaponSource("TwinNephrite"),
          status: "not_applicable"
        }
      ],
      equipmentId: "TwinNephrite",
      kind: "weapon"
    }
  ],
  [
    "TravelersHandySword",
    {
      clauses: [
        {
          id: "weapon.travelers-handy-sword.particle-or-orb-collection.self-healing",
          label: "旅行剑 · 拾取元素微粒或晶球后的自身治疗",
          reason: "拾取元素微粒或晶球后的自身治疗不进入当前角色核心动作伤害。",
          source: weaponSource("TravelersHandySword"),
          status: "not_applicable"
        }
      ],
      equipmentId: "TravelersHandySword",
      kind: "weapon"
    }
  ],
  [
    "WhiteIronGreatsword",
    {
      clauses: [
        {
          id: "weapon.white-iron-greatsword.enemy-defeat.self-healing",
          label: "白铁大剑 · 击败敌人后的自身治疗",
          reason: "击败敌人后的自身治疗不进入当前角色核心动作伤害。",
          source: weaponSource("WhiteIronGreatsword"),
          status: "not_applicable"
        }
      ],
      equipmentId: "WhiteIronGreatsword",
      kind: "weapon"
    }
  ],
  [
    "WasterGreatsword",
    {
      clauses: [
        {
          id: "weapon.waster-greatsword.no-passive",
          label: "训练大剑 · 无武器技能",
          reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
          source: weaponSource("WasterGreatsword"),
          status: "not_applicable"
        }
      ],
      equipmentId: "WasterGreatsword",
      kind: "weapon"
    }
  ],
  [
    "OtherworldlyStory",
    {
      clauses: [
        {
          id: "weapon.otherworldly-story.particle-or-orb-collection.self-healing",
          label: "异世界行记 · 拾取元素微粒或晶球后的自身治疗",
          reason: "拾取元素微粒或晶球后的自身治疗不进入当前角色核心动作伤害。",
          source: weaponSource("OtherworldlyStory"),
          status: "not_applicable"
        }
      ],
      equipmentId: "OtherworldlyStory",
      kind: "weapon"
    }
  ],
  [
    "PocketGrimoire",
    {
      clauses: [
        {
          id: "weapon.pocket-grimoire.no-passive",
          label: "口袋魔导书 · 无武器技能",
          reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
          source: weaponSource("PocketGrimoire"),
          status: "not_applicable"
        }
      ],
      equipmentId: "PocketGrimoire",
      kind: "weapon"
    }
  ],
  [
    "RecurveBow",
    {
      clauses: [
        {
          id: "weapon.recurve-bow.enemy-defeat.self-healing",
          label: "反曲弓 · 击败敌人后的自身治疗",
          reason: "击败敌人后的自身治疗不进入当前角色核心动作伤害。",
          source: weaponSource("RecurveBow"),
          status: "not_applicable"
        }
      ],
      equipmentId: "RecurveBow",
      kind: "weapon"
    }
  ],
  [
    "SeasonedHuntersBow",
    {
      clauses: [
        {
          id: "weapon.seasoned-hunters-bow.no-passive",
          label: "历练的猎弓 · 无武器技能",
          reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
          source: weaponSource("SeasonedHuntersBow"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SeasonedHuntersBow",
      kind: "weapon"
    }
  ],
  [
    "SharpshootersOath",
    {
      clauses: [
        {
          effectIds: ["weapon.sharpshooters-oath.current-weak-point-hit.damage-bonus"],
          id: "weapon.sharpshooters-oath.current-weak-point-hit.damage-bonus",
          label: "神射手之誓 · 本次命中敌人要害时的伤害",
          source: weaponSource("SharpshootersOath"),
          status: "implemented"
        }
      ],
      equipmentId: "SharpshootersOath",
      kind: "weapon"
    }
  ],
  [
    "SilverSword",
    {
      clauses: [
        {
          id: "weapon.silver-sword.no-passive",
          label: "银剑 · 无武器技能",
          reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
          source: weaponSource("SilverSword"),
          status: "not_applicable"
        }
      ],
      equipmentId: "SilverSword",
      kind: "weapon"
    }
  ],
  [
    "FilletBlade",
    {
      clauses: [
        {
          effectIds: ["weapon.fillet-blade.cooldown-ready.expected-physical-hit"],
          id: "weapon.fillet-blade.cooldown-ready.expected-physical-hit",
          label: "吃虎鱼刀 · 当前攻击命中且冷却就绪时的决物理伤害期望",
          source: weaponSource("FilletBlade"),
          status: "implemented"
        }
      ],
      equipmentId: "FilletBlade",
      kind: "weapon"
    }
  ],
  [
    "Halberd",
    {
      clauses: [
        {
          effectIds: ["weapon.halberd.cooldown-ready.physical-hit"],
          id: "weapon.halberd.cooldown-ready.physical-hit",
          label: "钺矛 · 冷却就绪时本次普攻触发沉重物理伤害",
          source: weaponSource("Halberd"),
          status: "implemented"
        }
      ],
      equipmentId: "Halberd",
      kind: "weapon"
    }
  ],
  [
    "HuntersBow",
    {
      clauses: [
        {
          id: "weapon.hunters-bow.no-passive",
          label: "猎弓 · 无武器技能",
          reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
          source: weaponSource("HuntersBow"),
          status: "not_applicable"
        }
      ],
      equipmentId: "HuntersBow",
      kind: "weapon"
    }
  ],
  [
    "IronPoint",
    {
      clauses: [
        {
          id: "weapon.iron-point.no-passive",
          label: "铁尖枪 · 无武器技能",
          reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
          source: weaponSource("IronPoint"),
          status: "not_applicable"
        }
      ],
      equipmentId: "IronPoint",
      kind: "weapon"
    }
  ],
  [
    "Messenger",
    {
      clauses: [
        {
          effectIds: ["weapon.messenger.weak-point-guaranteed-crit.additional-damage"],
          id: "weapon.messenger.weak-point-guaranteed-crit.additional-damage",
          label: "信使 · 瞄准射击命中要害且冷却就绪时的必定暴击物理附加伤害",
          source: weaponSource("Messenger"),
          status: "implemented"
        }
      ],
      equipmentId: "Messenger",
      kind: "weapon"
    }
  ],
  [
    "OldMercsPal",
    {
      clauses: [
        {
          id: "weapon.old-mercs-pal.no-passive",
          label: "佣兵重剑 · 无武器技能",
          reason: "该武器没有被动效果；基础面板仍由装备数据处理。",
          source: weaponSource("OldMercsPal"),
          status: "not_applicable"
        }
      ],
      equipmentId: "OldMercsPal",
      kind: "weapon"
    }
  ],
  [
    "ADayCarvedFromRisingWinds",
    {
      clauses: [
        {
          effectIds: ["artifact.a-day-carved-from-rising-winds.2pc.attack-percent"],
          id: "artifact.a-day-carved-from-rising-winds.2pc.attack-percent",
          label: "风起之日 · 二件套",
          source: artifactSource("ADayCarvedFromRisingWinds", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.a-day-carved-from-rising-winds.4pc.after-hit.attack-percent",
            "artifact.a-day-carved-from-rising-winds.4pc.completed-magical-trial.crit-rate"
          ],
          id: "artifact.a-day-carved-from-rising-winds.4pc.current-state-bonuses",
          label: "风起之日 · 四件套（攻击命中与完成魔女的课业后的状态）",
          source: artifactSource("ADayCarvedFromRisingWinds", 4),
          status: "implemented"
        }
      ],
      equipmentId: "ADayCarvedFromRisingWinds",
      kind: "artifact_set"
    }
  ],
  [
    "FinaleOfTheDeepGalleries",
    {
      clauses: [
        {
          effectIds: ["artifact.finale-of-the-deep-galleries.2pc.cryo-damage-bonus"],
          id: "artifact.finale-of-the-deep-galleries.2pc.cryo-damage-bonus",
          label: "深廊终曲 · 二件套",
          source: artifactSource("FinaleOfTheDeepGalleries", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.finale-of-the-deep-galleries.4pc.zero-energy.normal-damage-bonus",
            "artifact.finale-of-the-deep-galleries.4pc.zero-energy.burst-damage-bonus"
          ],
          id: "artifact.finale-of-the-deep-galleries.4pc.zero-energy-damage-bonus",
          label: "深廊终曲 · 四件套（元素能量为0的普通攻击或元素爆发）",
          source: artifactSource("FinaleOfTheDeepGalleries", 4),
          status: "implemented"
        }
      ],
      equipmentId: "FinaleOfTheDeepGalleries",
      kind: "artifact_set"
    }
  ],
  [
    "NighttimeWhispersInTheEchoingWoods",
    {
      clauses: [
        {
          effectIds: ["artifact.nighttime-whispers-in-the-echoing-woods.2pc.attack-percent"],
          id: "artifact.nighttime-whispers-in-the-echoing-woods.2pc.attack-percent",
          label: "回声之林夜话 · 二件套",
          source: artifactSource("NighttimeWhispersInTheEchoingWoods", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.nighttime-whispers-in-the-echoing-woods.4pc.after-skill.geo-damage-bonus",
            "artifact.nighttime-whispers-in-the-echoing-woods.4pc.crystallize-shield.extra-geo-damage-bonus"
          ],
          id: "artifact.nighttime-whispers-in-the-echoing-woods.4pc.geo-damage-bonus",
          label: "回声之林夜话 · 四件套（战技后与结晶护盾或月笼状态）",
          source: artifactSource("NighttimeWhispersInTheEchoingWoods", 4),
          status: "implemented"
        }
      ],
      equipmentId: "NighttimeWhispersInTheEchoingWoods",
      kind: "artifact_set"
    }
  ],
  [
    "ObsidianCodex",
    {
      clauses: [
        {
          effectIds: ["artifact.obsidian-codex.2pc.nightsoul-blessing.damage-bonus"],
          id: "artifact.obsidian-codex.2pc.nightsoul-blessing.damage-bonus",
          label: "黑曜秘典 · 二件套（前台且处于夜魂加持状态）",
          source: artifactSource("ObsidianCodex", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.obsidian-codex.4pc.after-nightsoul-consumption.crit-rate"],
          id: "artifact.obsidian-codex.4pc.after-nightsoul-consumption.crit-rate",
          label: "黑曜秘典 · 四件套（消耗夜魂值后）",
          source: artifactSource("ObsidianCodex", 4),
          status: "implemented"
        }
      ],
      equipmentId: "ObsidianCodex",
      kind: "artifact_set"
    }
  ],
  [
    "DisenchantmentInDeepShadow",
    {
      clauses: [
        {
          effectIds: ["artifact.disenchantment-in-deep-shadow.2pc.attack-percent"],
          id: "artifact.disenchantment-in-deep-shadow.2pc.attack-percent",
          label: "影中沉凝的幻灭 · 二件套",
          source: artifactSource("DisenchantmentInDeepShadow", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.disenchantment-in-deep-shadow.4pc.superconduct-affected-target.crit-rate"],
          id: "artifact.disenchantment-in-deep-shadow.4pc.superconduct-affected-target.crit-rate",
          label: "影中沉凝的幻灭 · 四件套（当前攻击目标受超导或星超导影响）",
          source: artifactSource("DisenchantmentInDeepShadow", 4),
          status: "implemented"
        },
        {
          effectIds: ["artifact.disenchantment-in-deep-shadow.4pc.superconduct.reaction-damage-bonus"],
          id: "artifact.disenchantment-in-deep-shadow.4pc.superconduct.reaction-damage-bonus",
          label: "影中沉凝的幻灭 · 四件套（超导反应伤害）",
          source: artifactSource("DisenchantmentInDeepShadow", 4),
          status: "implemented"
        },
        {
          id: "artifact.disenchantment-in-deep-shadow.4pc.stellar-superconduct.reaction-damage-bonus",
          label: "影中沉凝的幻灭 · 四件套（星超导反应伤害）",
          reason: "星超导使用独立的月曜反应伤害公式，当前单核心动作流水线尚未建模。",
          requiredCapability: "stellar_superconduct_reaction_damage_bonus",
          source: artifactSource("DisenchantmentInDeepShadow", 4),
          status: "unsupported"
        }
      ],
      equipmentId: "DisenchantmentInDeepShadow",
      kind: "artifact_set"
    }
  ],
  [
    "HuskOfOpulentDreams",
    {
      clauses: [
        {
          effectIds: ["artifact.husk-of-opulent-dreams.2pc.defense-percent"],
          id: "artifact.husk-of-opulent-dreams.2pc.defense-percent",
          label: "华馆梦醒形骸记 · 二件套",
          source: artifactSource("HuskOfOpulentDreams", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.husk-of-opulent-dreams.4pc.curiosity.1-stack.defense-percent",
            "artifact.husk-of-opulent-dreams.4pc.curiosity.1-stack.geo-damage-bonus",
            "artifact.husk-of-opulent-dreams.4pc.curiosity.2-stack.defense-percent",
            "artifact.husk-of-opulent-dreams.4pc.curiosity.2-stack.geo-damage-bonus",
            "artifact.husk-of-opulent-dreams.4pc.curiosity.3-stack.defense-percent",
            "artifact.husk-of-opulent-dreams.4pc.curiosity.3-stack.geo-damage-bonus",
            "artifact.husk-of-opulent-dreams.4pc.curiosity.4-stack.defense-percent",
            "artifact.husk-of-opulent-dreams.4pc.curiosity.4-stack.geo-damage-bonus"
          ],
          id: "artifact.husk-of-opulent-dreams.4pc.curiosity-stacks",
          label: "华馆梦醒形骸记 · 四件套（问答层数）",
          source: artifactSource("HuskOfOpulentDreams", 4),
          status: "implemented"
        }
      ],
      equipmentId: "HuskOfOpulentDreams",
      kind: "artifact_set"
    }
  ],
  [
    "MarechausseeHunter",
    {
      clauses: [
        {
          effectIds: ["artifact.marechaussee-hunter.2pc.normal-charged-damage-bonus"],
          id: "artifact.marechaussee-hunter.2pc.normal-charged-damage-bonus",
          label: "逐影猎人 · 二件套",
          source: artifactSource("MarechausseeHunter", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.marechaussee-hunter.4pc.hp-change.1-stack.crit-rate",
            "artifact.marechaussee-hunter.4pc.hp-change.2-stack.crit-rate",
            "artifact.marechaussee-hunter.4pc.hp-change.3-stack.crit-rate"
          ],
          id: "artifact.marechaussee-hunter.4pc.hp-change-crit-rate-stacks",
          label: "逐影猎人 · 四件套（生命值变化后的暴击率层数）",
          source: artifactSource("MarechausseeHunter", 4),
          status: "implemented"
        }
      ],
      equipmentId: "MarechausseeHunter",
      kind: "artifact_set"
    }
  ],
  [
    "PaleFlame",
    {
      clauses: [
        {
          effectIds: ["artifact.pale-flame.2pc.physical-damage-bonus"],
          id: "artifact.pale-flame.2pc.physical-damage-bonus",
          label: "苍白之火 · 二件套",
          source: artifactSource("PaleFlame", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.pale-flame.4pc.skill-hit.1-stack.attack-percent",
            "artifact.pale-flame.4pc.skill-hit.2-stack.attack-percent",
            "artifact.pale-flame.4pc.skill-hit.2-stack.extra-physical-damage-bonus"
          ],
          id: "artifact.pale-flame.4pc.skill-hit-stacks",
          label: "苍白之火 · 四件套（元素战技命中后的层数与满层物理伤害翻倍）",
          source: artifactSource("PaleFlame", 4),
          status: "implemented"
        }
      ],
      equipmentId: "PaleFlame",
      kind: "artifact_set"
    }
  ],
  [
    "VermillionHereafter",
    {
      clauses: [
        {
          effectIds: ["artifact.vermillion-hereafter.2pc.attack-percent"],
          id: "artifact.vermillion-hereafter.2pc.attack-percent",
          label: "辰砂往生录 · 二件套",
          source: artifactSource("VermillionHereafter", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.vermillion-hereafter.4pc.after-burst.attack-percent",
            "artifact.vermillion-hereafter.4pc.after-burst.1-stack.attack-percent",
            "artifact.vermillion-hereafter.4pc.after-burst.2-stack.attack-percent",
            "artifact.vermillion-hereafter.4pc.after-burst.3-stack.attack-percent",
            "artifact.vermillion-hereafter.4pc.after-burst.4-stack.attack-percent"
          ],
          id: "artifact.vermillion-hereafter.4pc.after-burst.attack-percent",
          label: "辰砂往生录 · 四件套（爆发后生命值降低层数对应的攻击力）",
          source: artifactSource("VermillionHereafter", 4),
          status: "implemented"
        }
      ],
      equipmentId: "VermillionHereafter",
      kind: "artifact_set"
    }
  ],
  [
    "VourukashasGlow",
    {
      clauses: [
        {
          effectIds: ["artifact.vourukashas-glow.2pc.hp-percent"],
          id: "artifact.vourukashas-glow.2pc.hp-percent",
          label: "花海甘露之光 · 二件套",
          source: artifactSource("VourukashasGlow", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.vourukashas-glow.4pc.skill-burst-damage-bonus",
            "artifact.vourukashas-glow.4pc.taking-damage.1-stack.skill-burst-damage-bonus",
            "artifact.vourukashas-glow.4pc.taking-damage.2-stack.skill-burst-damage-bonus",
            "artifact.vourukashas-glow.4pc.taking-damage.3-stack.skill-burst-damage-bonus",
            "artifact.vourukashas-glow.4pc.taking-damage.4-stack.skill-burst-damage-bonus",
            "artifact.vourukashas-glow.4pc.taking-damage.5-stack.skill-burst-damage-bonus"
          ],
          id: "artifact.vourukashas-glow.4pc.skill-burst-damage-bonus",
          label: "花海甘露之光 · 四件套（受伤层数对应的元素战技与元素爆发伤害）",
          source: artifactSource("VourukashasGlow", 4),
          status: "implemented"
        }
      ],
      equipmentId: "VourukashasGlow",
      kind: "artifact_set"
    }
  ],
  [
    "CelestialGift",
    {
      clauses: [
        {
          effectIds: ["artifact.celestial-gift.2pc.energy-recharge"],
          id: "artifact.celestial-gift.2pc.energy-recharge",
          label: "天之美赐 · 二件套",
          source: artifactSource("CelestialGift", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.celestial-gift.4pc.celestial-guidance.anemo.damage-bonus",
            "artifact.celestial-gift.4pc.celestial-guidance.cryo.damage-bonus",
            "artifact.celestial-gift.4pc.celestial-guidance.dendro.damage-bonus",
            "artifact.celestial-gift.4pc.celestial-guidance.electro.damage-bonus",
            "artifact.celestial-gift.4pc.celestial-guidance.geo.damage-bonus",
            "artifact.celestial-gift.4pc.celestial-guidance.hydro.damage-bonus",
            "artifact.celestial-gift.4pc.celestial-guidance.pyro.damage-bonus",
            "artifact.celestial-gift.4pc.mortal-hymn.anemo.damage-bonus",
            "artifact.celestial-gift.4pc.mortal-hymn.cryo.damage-bonus",
            "artifact.celestial-gift.4pc.mortal-hymn.dendro.damage-bonus",
            "artifact.celestial-gift.4pc.mortal-hymn.electro.damage-bonus",
            "artifact.celestial-gift.4pc.mortal-hymn.geo.damage-bonus",
            "artifact.celestial-gift.4pc.mortal-hymn.hydro.damage-bonus",
            "artifact.celestial-gift.4pc.mortal-hymn.pyro.damage-bonus"
          ],
          id: "artifact.celestial-gift.4pc.elemental-team-damage-bonus",
          label: "天之美赐 · 四件套（天光之引与凡世颂歌的显式元素队伍增益快照）",
          source: artifactSource("CelestialGift", 4, "party_member"),
          status: "implemented"
        }
      ],
      equipmentId: "CelestialGift",
      kind: "artifact_set"
    }
  ],
  [
    "CrimsonWitchOfFlames",
    {
      clauses: [
        {
          effectIds: ["artifact.crimson-witch-of-flames.2pc.pyro-damage-bonus"],
          id: "artifact.crimson-witch-of-flames.2pc.pyro-damage-bonus",
          label: "炽烈的炎之魔女 · 二件套",
          source: artifactSource("CrimsonWitchOfFlames", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.crimson-witch-of-flames.4pc.skill-cast.1-stack.extra-pyro-damage-bonus",
            "artifact.crimson-witch-of-flames.4pc.skill-cast.2-stack.extra-pyro-damage-bonus",
            "artifact.crimson-witch-of-flames.4pc.skill-cast.3-stack.extra-pyro-damage-bonus"
          ],
          id: "artifact.crimson-witch-of-flames.4pc.skill-cast-extra-pyro-damage-bonus",
          label: "炽烈的炎之魔女 · 四件套（元素战技施放后的二件套额外火元素伤害）",
          source: artifactSource("CrimsonWitchOfFlames", 4),
          status: "implemented"
        },
        {
          effectIds: ["artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus"],
          id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus",
          label: "炽烈的炎之魔女 · 四件套（蒸发与融化反应加成）",
          source: artifactSource("CrimsonWitchOfFlames", 4),
          status: "implemented"
        },
        {
          effectIds: ["artifact.crimson-witch-of-flames.4pc.overload-burning-burgeon.reaction-damage-bonus"],
          id: "artifact.crimson-witch-of-flames.4pc.overload-burning-burgeon.reaction-damage-bonus",
          label: "炽烈的炎之魔女 · 四件套（超载、燃烧、烈绽放反应加成）",
          source: artifactSource("CrimsonWitchOfFlames", 4),
          status: "implemented"
        }
      ],
      equipmentId: "CrimsonWitchOfFlames",
      kind: "artifact_set"
    }
  ],
  [
    "FragmentOfHarmonicWhimsy",
    {
      clauses: [
        {
          effectIds: ["artifact.fragment-of-harmonic-whimsy.2pc.attack-percent"],
          id: "artifact.fragment-of-harmonic-whimsy.2pc.attack-percent",
          label: "谐律异想断章 · 二件套",
          source: artifactSource("FragmentOfHarmonicWhimsy", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-change.1-stack.damage-bonus",
            "artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-change.2-stack.damage-bonus",
            "artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-change.3-stack.damage-bonus"
          ],
          id: "artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-stacks",
          label: "谐律异想断章 · 四件套（生命之契增减后的全伤层数）",
          source: artifactSource("FragmentOfHarmonicWhimsy", 4),
          status: "implemented"
        }
      ],
      equipmentId: "FragmentOfHarmonicWhimsy",
      kind: "artifact_set"
    }
  ],
  [
    "LongNightsOath",
    {
      clauses: [
        {
          effectIds: ["artifact.long-nights-oath.2pc.plunge-damage-bonus"],
          id: "artifact.long-nights-oath.2pc.plunge-damage-bonus",
          label: "长夜之誓 · 二件套",
          source: artifactSource("LongNightsOath", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.long-nights-oath.4pc.radiance-everlasting.1-stack.plunge-damage-bonus",
            "artifact.long-nights-oath.4pc.radiance-everlasting.2-stack.plunge-damage-bonus",
            "artifact.long-nights-oath.4pc.radiance-everlasting.3-stack.plunge-damage-bonus",
            "artifact.long-nights-oath.4pc.radiance-everlasting.4-stack.plunge-damage-bonus",
            "artifact.long-nights-oath.4pc.radiance-everlasting.5-stack.plunge-damage-bonus"
          ],
          id: "artifact.long-nights-oath.4pc.plunge-stack-bonus",
          label: "长夜之誓 · 四件套（下落、重击与元素战技命中的下落攻击层数）",
          source: artifactSource("LongNightsOath", 4),
          status: "implemented"
        }
      ],
      equipmentId: "LongNightsOath",
      kind: "artifact_set"
    }
  ],
  [
    "NymphsDream",
    {
      clauses: [
        {
          effectIds: ["artifact.nymphs-dream.2pc.hydro-damage-bonus"],
          id: "artifact.nymphs-dream.2pc.hydro-damage-bonus",
          label: "水仙之梦 · 二件套",
          source: artifactSource("NymphsDream", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.nymphs-dream.4pc.mirrored-nymph.1-stack.attack-percent",
            "artifact.nymphs-dream.4pc.mirrored-nymph.1-stack.hydro-damage-bonus",
            "artifact.nymphs-dream.4pc.mirrored-nymph.2-stack.attack-percent",
            "artifact.nymphs-dream.4pc.mirrored-nymph.2-stack.hydro-damage-bonus",
            "artifact.nymphs-dream.4pc.mirrored-nymph.3-stack.attack-percent",
            "artifact.nymphs-dream.4pc.mirrored-nymph.3-stack.hydro-damage-bonus"
          ],
          id: "artifact.nymphs-dream.4pc.mirrored-nymph-stacks",
          label: "水仙之梦 · 四件套（镜中水仙层数）",
          source: artifactSource("NymphsDream", 4),
          status: "implemented"
        }
      ],
      equipmentId: "NymphsDream",
      kind: "artifact_set"
    }
  ],
  [
    "SilkenMoonsSerenade",
    {
      clauses: [
        {
          effectIds: ["artifact.silken-moons-serenade.2pc.energy-recharge"],
          id: "artifact.silken-moons-serenade.2pc.energy-recharge",
          label: "纺月的夜歌 · 二件套",
          source: artifactSource("SilkenMoonsSerenade", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.silken-moons-serenade.4pc.moonlit-glow.initial-moonsign.party-elemental-mastery",
            "artifact.silken-moons-serenade.4pc.moonlit-glow.full-moonsign.party-elemental-mastery"
          ],
          id: "artifact.silken-moons-serenade.4pc.moonlit-glow.moonsign-party-elemental-mastery",
          label: "纺月的夜歌 · 四件套（月辉明光·崇信的队伍元素精通）",
          source: artifactSource("SilkenMoonsSerenade", 4, "party_member"),
          status: "implemented"
        },
        {
          id: "artifact.silken-moons-serenade.4pc.different-moongleam.lunar-reaction-damage-bonus",
          label: "纺月的夜歌 · 四件套（不同月辉明光的月曜反应伤害）",
          reason: "需要团队不同月辉明光效果计数与月曜反应专属伤害加成。",
          requiredCapability: "different_moongleam_count_and_lunar_reaction_damage_bonus",
          source: artifactSource("SilkenMoonsSerenade", 4, "party_member"),
          status: "unsupported"
        }
      ],
      equipmentId: "SilkenMoonsSerenade",
      kind: "artifact_set"
    }
  ],
  [
    "UnfinishedReverie",
    {
      clauses: [
        {
          effectIds: ["artifact.unfinished-reverie.2pc.attack-percent"],
          id: "artifact.unfinished-reverie.2pc.attack-percent",
          label: "未竟的遐思 · 二件套",
          source: artifactSource("UnfinishedReverie", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.unfinished-reverie.4pc.post-burning.grace-expired.1-second.damage-bonus",
            "artifact.unfinished-reverie.4pc.post-burning.grace-expired.2-second.damage-bonus",
            "artifact.unfinished-reverie.4pc.post-burning.grace-expired.3-second.damage-bonus",
            "artifact.unfinished-reverie.4pc.post-burning.grace-expired.4-second.damage-bonus",
            "artifact.unfinished-reverie.4pc.out-of-combat-nearby-burning-or-post-burning-grace.damage-bonus"
          ],
          id: "artifact.unfinished-reverie.4pc.combat-and-burning-state-damage-bonus",
          label: "未竟的遐思 · 四件套（脱战、附近燃烧与6秒宽限期后的逐秒全伤档位）",
          source: artifactSource("UnfinishedReverie", 4),
          status: "implemented"
        }
      ],
      equipmentId: "UnfinishedReverie",
      kind: "artifact_set"
    }
  ],
  [
    "Adventurer",
    {
      clauses: [
        {
          effectIds: ["artifact.adventurer.2pc.flat-hp"],
          id: "artifact.adventurer.2pc.flat-hp",
          label: "冒险家 · 二件套（生命值上限）",
          source: artifactSource("Adventurer", 2),
          status: "implemented"
        },
        {
          id: "artifact.adventurer.4pc.chest-healing",
          label: "冒险家 · 四件套（开启宝箱后恢复生命值）",
          reason: "开放世界开启宝箱事件不属于当前选定核心动作。",
          source: artifactSource("Adventurer", 4),
          status: "not_applicable"
        }
      ],
      equipmentId: "Adventurer",
      kind: "artifact_set"
    }
  ],
  [
    "LuckyDog",
    {
      clauses: [
        {
          effectIds: ["artifact.lucky-dog.2pc.flat-defense"],
          id: "artifact.lucky-dog.2pc.flat-defense",
          label: "幸运儿 · 二件套（防御力）",
          source: artifactSource("LuckyDog", 2),
          status: "implemented"
        },
        {
          id: "artifact.lucky-dog.4pc.mora-healing",
          label: "幸运儿 · 四件套（拾取摩拉后恢复生命值）",
          reason: "开放世界拾取事件不属于当前选定核心动作。",
          source: artifactSource("LuckyDog", 4),
          status: "not_applicable"
        }
      ],
      equipmentId: "LuckyDog",
      kind: "artifact_set"
    }
  ],
  [
    "PrayersForDestiny",
    {
      clauses: [
        {
          id: "artifact.prayers-for-destiny.1pc.hydro-aura-duration",
          label: "祭水之人 · 一件套（水元素附着持续时间）",
          reason: "当前模型将元素状态作为已选快照，不追踪元素附着时长或循环时间线。",
          source: artifactSource("PrayersForDestiny", 1),
          status: "not_applicable"
        }
      ],
      equipmentId: "PrayersForDestiny",
      kind: "artifact_set"
    }
  ],
  [
    "PrayersForIllumination",
    {
      clauses: [
        {
          id: "artifact.prayers-for-illumination.1pc.pyro-aura-duration",
          label: "祭火之人 · 一件套（火元素附着持续时间）",
          reason: "当前模型将元素状态作为已选快照，不追踪元素附着时长或循环时间线。",
          source: artifactSource("PrayersForIllumination", 1),
          status: "not_applicable"
        }
      ],
      equipmentId: "PrayersForIllumination",
      kind: "artifact_set"
    }
  ],
  [
    "PrayersForWisdom",
    {
      clauses: [
        {
          id: "artifact.prayers-for-wisdom.1pc.electro-aura-duration",
          label: "祭雷之人 · 一件套（雷元素附着持续时间）",
          reason: "当前模型将元素状态作为已选快照，不追踪元素附着时长或循环时间线。",
          source: artifactSource("PrayersForWisdom", 1),
          status: "not_applicable"
        }
      ],
      equipmentId: "PrayersForWisdom",
      kind: "artifact_set"
    }
  ],
  [
    "PrayersToSpringtime",
    {
      clauses: [
        {
          id: "artifact.prayers-to-springtime.1pc.cryo-aura-duration",
          label: "祭冰之人 · 一件套（冰元素附着持续时间）",
          reason: "当前模型将元素状态作为已选快照，不追踪元素附着时长或循环时间线。",
          source: artifactSource("PrayersToSpringtime", 1),
          status: "not_applicable"
        }
      ],
      equipmentId: "PrayersToSpringtime",
      kind: "artifact_set"
    }
  ],
  [
    "ScrollOfTheHeroOfCinderCity",
    {
      clauses: [
        {
          id: "artifact.scroll-of-the-hero-of-cinder-city.2pc.nightsoul-burst-energy",
          label: "烬城勇者绘卷 · 二件套（夜魂迸发后的元素能量恢复）",
          reason: "元素能量恢复只改变后续循环资源，不改变当前核心动作的一次期望伤害。",
          source: artifactSource("ScrollOfTheHeroOfCinderCity", 2, "party_member"),
          status: "not_applicable"
        },
        {
          effectIds: [
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.anemo.standard.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.anemo.nightsoul.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.cryo.standard.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.cryo.nightsoul.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.dendro.standard.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.dendro.nightsoul.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.electro.standard.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.electro.nightsoul.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.geo.standard.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.geo.nightsoul.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.hydro.standard.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.hydro.nightsoul.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.standard.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.nightsoul.damage-bonus"
          ],
          id: "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element-team-damage-bonus",
          label: "烬城勇者绘卷 · 四件套（反应相关元素与夜魂状态的队伍伤害加成快照）",
          source: artifactSource("ScrollOfTheHeroOfCinderCity", 4, "party_member"),
          status: "implemented"
        }
      ],
      equipmentId: "ScrollOfTheHeroOfCinderCity",
      kind: "artifact_set"
    }
  ],
  [
    "TinyMiracle",
    {
      clauses: [
        {
          id: "artifact.tiny-miracle.2pc.all-element-resistance",
          label: "奇迹 · 二件套（所有元素抗性）",
          reason: "当前指标流水线未建模承伤元素抗性或防御指标。",
          requiredCapability: "incoming_elemental_resistance_metric",
          source: artifactSource("TinyMiracle", 2),
          status: "unsupported"
        },
        {
          id: "artifact.tiny-miracle.4pc.after-elemental-damage-resistance",
          label: "奇迹 · 四件套（受到对应元素伤害后的元素抗性）",
          reason: "需要承伤元素抗性指标、受击元素和冷却窗口状态。",
          requiredCapability: "incoming_elemental_resistance_metric_and_damage_event",
          source: artifactSource("TinyMiracle", 4),
          status: "unsupported"
        }
      ],
      equipmentId: "TinyMiracle",
      kind: "artifact_set"
    }
  ],
  [
    "TravelingDoctor",
    {
      clauses: [
        {
          effectIds: ["artifact.traveling-doctor.2pc.incoming-healing-bonus"],
          id: "artifact.traveling-doctor.2pc.incoming-healing-bonus",
          label: "游医 · 二件套（受到的治疗效果）",
          source: artifactSource("TravelingDoctor", 2),
          status: "implemented"
        },
        {
          id: "artifact.traveling-doctor.4pc.burst-self-healing",
          label: "游医 · 四件套（施放元素爆发后的生命值恢复）",
          reason: "游医最高稀有度为3星，按当前范围不维护其四件套独立辅助指标。",
          source: artifactSource("TravelingDoctor", 4),
          status: "not_applicable"
        }
      ],
      equipmentId: "TravelingDoctor",
      kind: "artifact_set"
    }
  ],
  [
    "BlizzardStrayer",
    {
      clauses: [
        {
          effectIds: ["artifact.blizzard-strayer.2pc.cryo-damage-bonus"],
          id: "artifact.blizzard-strayer.2pc.cryo-damage-bonus",
          label: "冰风迷途的勇士 · 二件套",
          source: artifactSource("BlizzardStrayer", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.blizzard-strayer.4pc.cryo-aura.crit-rate",
            "artifact.blizzard-strayer.4pc.frozen.crit-rate"
          ],
          id: "artifact.blizzard-strayer.4pc.enemy-state-crit-rate",
          label: "冰风迷途的勇士 · 四件套（冰元素影响与冻结状态）",
          source: artifactSource("BlizzardStrayer", 4),
          status: "implemented"
        }
      ],
      equipmentId: "BlizzardStrayer",
      kind: "artifact_set"
    }
  ],
  [
    "ViridescentVenerer",
    {
      clauses: [
        {
          effectIds: ["artifact.viridescent-venerer.2pc.anemo-damage-bonus"],
          id: "artifact.viridescent-venerer.2pc.anemo-damage-bonus",
          label: "翠绿之影 · 二件套",
          source: artifactSource("ViridescentVenerer", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.viridescent-venerer.4pc.after-pyro-swirl.pyro-resistance-shred",
            "artifact.viridescent-venerer.4pc.after-hydro-swirl.hydro-resistance-shred",
            "artifact.viridescent-venerer.4pc.after-electro-swirl.electro-resistance-shred",
            "artifact.viridescent-venerer.4pc.after-cryo-swirl.cryo-resistance-shred"
          ],
          id: "artifact.viridescent-venerer.4pc.swirled-element-resistance-shred",
          label: "翠绿之影 · 四件套（装备者扩散对应元素后）",
          source: artifactSource("ViridescentVenerer", 4, "party_member"),
          status: "implemented"
        },
        {
          effectIds: ["artifact.viridescent-venerer.4pc.swirl.reaction-damage-bonus"],
          id: "artifact.viridescent-venerer.4pc.swirl.reaction-damage-bonus",
          label: "翠绿之影 · 四件套（扩散反应伤害）",
          source: artifactSource("ViridescentVenerer", 4),
          status: "implemented"
        }
      ],
      equipmentId: "ViridescentVenerer",
      kind: "artifact_set"
    }
  ],
  [
    "ArchaicPetra",
    {
      clauses: [
        {
          effectIds: ["artifact.archaic-petra.2pc.geo-damage-bonus"],
          id: "artifact.archaic-petra.2pc.geo-damage-bonus",
          label: "悠古的磐岩 · 二件套",
          source: artifactSource("ArchaicPetra", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.archaic-petra.4pc.crystallize.pyro-damage-bonus",
            "artifact.archaic-petra.4pc.crystallize.hydro-damage-bonus",
            "artifact.archaic-petra.4pc.crystallize.electro-damage-bonus",
            "artifact.archaic-petra.4pc.crystallize.cryo-damage-bonus"
          ],
          id: "artifact.archaic-petra.4pc.crystallize-element-damage-bonus",
          label: "悠古的磐岩 · 四件套（拾取对应元素结晶反应的晶片后）",
          source: artifactSource("ArchaicPetra", 4, "party_member"),
          status: "implemented"
        }
      ],
      equipmentId: "ArchaicPetra",
      kind: "artifact_set"
    }
  ],
  [
    "EchoesOfAnOffering",
    {
      clauses: [
        {
          effectIds: ["artifact.echoes-of-an-offering.2pc.attack-percent"],
          id: "artifact.echoes-of-an-offering.2pc.attack-percent",
          label: "来歆余响 · 二件套",
          source: artifactSource("EchoesOfAnOffering", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.echoes-of-an-offering.4pc.valley-rite.normal-attack-additive-damage"],
          id: "artifact.echoes-of-an-offering.4pc.valley-rite.additional-damage",
          label: "来歆余响 · 四件套（本次普通攻击触发幽谷祝祀的同一命中加算）",
          source: artifactSource("EchoesOfAnOffering", 4),
          status: "implemented"
        }
      ],
      equipmentId: "EchoesOfAnOffering",
      kind: "artifact_set"
    }
  ],
  [
    "GladiatorsFinale",
    {
      clauses: [
        {
          effectIds: ["artifact.gladiators-finale.2pc.attack-percent"],
          id: "artifact.gladiators-finale.2pc.attack-percent",
          label: "角斗士的终幕礼 · 二件套",
          source: artifactSource("GladiatorsFinale", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.gladiators-finale.4pc.weapon-restricted-normal-damage-bonus"],
          id: "artifact.gladiators-finale.4pc.weapon-restricted-normal-damage-bonus",
          label: "角斗士的终幕礼 · 四件套（单手剑、双手剑或长柄武器角色的普通攻击）",
          source: artifactSource("GladiatorsFinale", 4),
          status: "implemented"
        }
      ],
      equipmentId: "GladiatorsFinale",
      kind: "artifact_set"
    }
  ],
  [
    "SongOfDaysPast",
    {
      clauses: [
        {
          effectIds: ["artifact.song-of-days-past.2pc.healing-bonus"],
          id: "artifact.song-of-days-past.2pc.healing-bonus",
          label: "昔时之歌 · 二件套（治疗加成）",
          source: artifactSource("SongOfDaysPast", 2),
          status: "implemented"
        },
        {
          id: "artifact.song-of-days-past.4pc.yearning.healing-recorded-damage",
          label: "昔时之歌 · 四件套（昔时之歌之咏的治疗记录伤害加成）",
          reason: "需要全队治疗记录、溢出治疗、上限、命中次数消耗与受益角色状态。",
          requiredCapability: "team_healing_accumulation_and_consumable_damage_bonus",
          source: artifactSource("SongOfDaysPast", 4, "party_member"),
          status: "unsupported"
        }
      ],
      equipmentId: "SongOfDaysPast",
      kind: "artifact_set"
    }
  ],
  [
    "MaidenBeloved",
    {
      clauses: [
        {
          effectIds: ["artifact.maiden-beloved.2pc.healing-bonus"],
          id: "artifact.maiden-beloved.2pc.healing-bonus",
          label: "被怜爱的少女 · 二件套（治疗加成）",
          source: artifactSource("MaidenBeloved", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.maiden-beloved.4pc.after-skill-or-burst.party-incoming-healing-bonus"],
          id: "artifact.maiden-beloved.4pc.after-skill-or-burst.party-incoming-healing-bonus",
          label: "被怜爱的少女 · 四件套（施放元素战技或元素爆发后的队伍受治疗效果）",
          source: artifactSource("MaidenBeloved", 4, "party_member"),
          status: "implemented"
        }
      ],
      equipmentId: "MaidenBeloved",
      kind: "artifact_set"
    }
  ],
  [
    "OceanHuedClam",
    {
      clauses: [
        {
          effectIds: ["artifact.ocean-hued-clam.2pc.healing-bonus"],
          id: "artifact.ocean-hued-clam.2pc.healing-bonus",
          label: "海染砗磲 · 二件套（治疗加成）",
          source: artifactSource("OceanHuedClam", 2),
          status: "implemented"
        },
        {
          id: "artifact.ocean-hued-clam.4pc.sea-dyed-foam-damage",
          label: "海染砗磲 · 四件套（海染泡沫的治疗记录伤害）",
          reason: "需要治疗累计、溢出治疗、延迟独立伤害事件、上限与专属结算规则。",
          requiredCapability: "healing_accumulation_delayed_independent_damage_event",
          source: artifactSource("OceanHuedClam", 4),
          status: "unsupported"
        }
      ],
      equipmentId: "OceanHuedClam",
      kind: "artifact_set"
    }
  ],
  [
    "ThunderingFury",
    {
      clauses: [
        {
          effectIds: ["artifact.thundering-fury.2pc.electro-damage-bonus"],
          id: "artifact.thundering-fury.2pc.electro-damage-bonus",
          label: "如雷的盛怒 · 二件套",
          source: artifactSource("ThunderingFury", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.thundering-fury.4pc.overload-electro-charged-superconduct-hyperbloom.reaction-damage-bonus"
          ],
          id: "artifact.thundering-fury.4pc.overload-electro-charged-superconduct-hyperbloom.reaction-damage-bonus",
          label: "如雷的盛怒 · 四件套（超载、感电、超导、超绽放反应伤害）",
          source: artifactSource("ThunderingFury", 4),
          status: "implemented"
        },
        {
          effectIds: ["artifact.thundering-fury.4pc.aggravate.reaction-damage-bonus"],
          id: "artifact.thundering-fury.4pc.aggravate.reaction-damage-bonus",
          label: "如雷的盛怒 · 四件套（超激化附加伤害）",
          source: artifactSource("ThunderingFury", 4),
          status: "implemented"
        },
        {
          id: "artifact.thundering-fury.4pc.lunar-charged-stellar-superconduct.reaction-damage-bonus",
          label: "如雷的盛怒 · 四件套（月感电、星超导反应伤害）",
          reason: "月曜反应使用独立伤害公式，当前单核心动作流水线尚未建模。",
          requiredCapability: "lunar_reaction_damage_bonus",
          source: artifactSource("ThunderingFury", 4),
          status: "unsupported"
        },
        {
          id: "artifact.thundering-fury.4pc.skill-cooldown-reduction",
          label: "如雷的盛怒 · 四件套（元素战技冷却时间降低）",
          reason: "元素战技冷却缩减只影响后续循环可施放次数，不改变当前核心动作的一次期望伤害。",
          source: artifactSource("ThunderingFury", 4),
          status: "not_applicable"
        }
      ],
      equipmentId: "ThunderingFury",
      kind: "artifact_set"
    }
  ],
  [
    "EmblemOfSeveredFate",
    {
      clauses: [
        {
          effectIds: ["artifact.emblem-of-severed-fate.2pc.energy-recharge"],
          id: "artifact.emblem-of-severed-fate.2pc",
          label: "绝缘之旗印 · 二件套",
          source: artifactSource("EmblemOfSeveredFate", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.emblem-of-severed-fate.4pc.burst-damage-bonus"],
          id: "artifact.emblem-of-severed-fate.4pc",
          label: "绝缘之旗印 · 四件套",
          source: artifactSource("EmblemOfSeveredFate", 4),
          status: "implemented"
        }
      ],
      equipmentId: "EmblemOfSeveredFate",
      kind: "artifact_set"
    }
  ],
  [
    "NoblesseOblige",
    {
      clauses: [
        {
          effectIds: ["artifact.noblesse-oblige.2pc.burst-damage-bonus"],
          id: "artifact.noblesse-oblige.2pc",
          label: "昔日宗室之仪 · 二件套",
          source: artifactSource("NoblesseOblige", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.noblesse-oblige.4pc-attack"],
          id: "artifact.noblesse-oblige.4pc-attack",
          label: "昔日宗室之仪 · 四件套",
          source: artifactSource("NoblesseOblige", 4, "party_member"),
          status: "implemented"
        }
      ],
      equipmentId: "NoblesseOblige",
      kind: "artifact_set"
    }
  ],
  [
    "Berserker",
    {
      clauses: [
        {
          effectIds: ["artifact.berserker.2pc.crit-rate"],
          id: "artifact.berserker.2pc.crit-rate",
          label: "战狂 · 二件套",
          source: artifactSource("Berserker", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.berserker.4pc.low-hp-crit-rate"],
          id: "artifact.berserker.4pc.low-hp-crit-rate",
          label: "战狂 · 四件套（当前生命值低于70%）",
          source: artifactSource("Berserker", 4),
          status: "implemented"
        }
      ],
      equipmentId: "Berserker",
      kind: "artifact_set"
    }
  ],
  [
    "BloodstainedChivalry",
    {
      clauses: [
        {
          effectIds: ["artifact.bloodstained-chivalry.2pc.physical-damage-bonus"],
          id: "artifact.bloodstained-chivalry.2pc.physical-damage-bonus",
          label: "染血的骑士道 · 二件套",
          source: artifactSource("BloodstainedChivalry", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.bloodstained-chivalry.4pc.after-defeat.charged-damage-bonus"],
          id: "artifact.bloodstained-chivalry.4pc.after-defeat.charged-damage-bonus",
          label: "染血的骑士道 · 四件套（击败敌人后）",
          source: artifactSource("BloodstainedChivalry", 4),
          status: "implemented"
        },
        {
          id: "artifact.bloodstained-chivalry.4pc.after-defeat.charged-stamina",
          label: "染血的骑士道 · 四件套（重击体力消耗）",
          reason: "重击不消耗体力改变后续连续施放能力，不改变当前这一击的期望伤害。",
          source: artifactSource("BloodstainedChivalry", 4),
          status: "not_applicable"
        }
      ],
      equipmentId: "BloodstainedChivalry",
      kind: "artifact_set"
    }
  ],
  [
    "BraveHeart",
    {
      clauses: [
        {
          effectIds: ["artifact.brave-heart.2pc.attack-percent"],
          id: "artifact.brave-heart.2pc.attack-percent",
          label: "勇士之心 · 二件套",
          source: artifactSource("BraveHeart", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.brave-heart.4pc.enemy-above-half-health.damage-bonus"],
          id: "artifact.brave-heart.4pc.enemy-above-half-health.damage-bonus",
          label: "勇士之心 · 四件套（当前目标生命值高于50%）",
          source: artifactSource("BraveHeart", 4),
          status: "implemented"
        }
      ],
      equipmentId: "BraveHeart",
      kind: "artifact_set"
    }
  ],
  [
    "DeepwoodMemories",
    {
      clauses: [
        {
          effectIds: ["artifact.deepwood-memories.2pc.dendro-damage-bonus"],
          id: "artifact.deepwood-memories.2pc.dendro-damage-bonus",
          label: "深林的记忆 · 二件套",
          source: artifactSource("DeepwoodMemories", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.deepwood-memories.4pc.dendro-resistance-shred"],
          id: "artifact.deepwood-memories.4pc.dendro-resistance-shred",
          label: "深林的记忆 · 四件套（元素战技或元素爆发命中后）",
          source: artifactSource("DeepwoodMemories", 4, "party_member"),
          status: "implemented"
        }
      ],
      equipmentId: "DeepwoodMemories",
      kind: "artifact_set"
    }
  ],
  [
    "GoldenTroupe",
    {
      clauses: [
        {
          effectIds: ["artifact.golden-troupe.2pc.skill-damage-bonus"],
          id: "artifact.golden-troupe.2pc.skill-damage-bonus",
          label: "黄金剧团 · 二件套",
          source: artifactSource("GoldenTroupe", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.golden-troupe.4pc.on-field.skill-damage-bonus"],
          id: "artifact.golden-troupe.4pc.on-field.skill-damage-bonus",
          label: "黄金剧团 · 四件套（前台元素战技）",
          source: artifactSource("GoldenTroupe", 4),
          status: "implemented"
        },
        {
          id: "artifact.golden-troupe.4pc.off-field.additional-skill-damage-bonus",
          label: "黄金剧团 · 四件套（后台额外元素战技伤害）",
          reason: "当前核心动作由 primary 配置在前台结算；后台额外加成不可能同时作用于该次命中。",
          source: artifactSource("GoldenTroupe", 4),
          status: "not_applicable"
        }
      ],
      equipmentId: "GoldenTroupe",
      kind: "artifact_set"
    }
  ],
  [
    "HeartOfDepth",
    {
      clauses: [
        {
          effectIds: ["artifact.heart-of-depth.2pc.hydro-damage-bonus"],
          id: "artifact.heart-of-depth.2pc.hydro-damage-bonus",
          label: "沉沦之心 · 二件套",
          source: artifactSource("HeartOfDepth", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.heart-of-depth.4pc.after-skill.normal-charged-damage-bonus"],
          id: "artifact.heart-of-depth.4pc.after-skill.normal-charged-damage-bonus",
          label: "沉沦之心 · 四件套（元素战技后）",
          source: artifactSource("HeartOfDepth", 4),
          status: "implemented"
        }
      ],
      equipmentId: "HeartOfDepth",
      kind: "artifact_set"
    }
  ],
  [
    "AubadeOfMorningstarAndMoon",
    {
      clauses: [
        {
          effectIds: ["artifact.aubade-of-morningstar-and-moon.2pc.elemental-mastery"],
          id: "artifact.aubade-of-morningstar-and-moon.2pc.elemental-mastery",
          label: "晨星与月的晓歌 · 二件套",
          source: artifactSource("AubadeOfMorningstarAndMoon", 2),
          status: "implemented"
        },
        {
          id: "artifact.aubade-of-morningstar-and-moon.4pc.lunar-reaction",
          label: "晨星与月的晓歌 · 四件套",
          reason: "需要月曜反应、月兆满辉和装备者前后台状态的组合快照。",
          requiredCapability: "lunar_reaction_moonsign_and_field_state",
          source: artifactSource("AubadeOfMorningstarAndMoon", 4),
          status: "unsupported"
        }
      ],
      equipmentId: "AubadeOfMorningstarAndMoon",
      kind: "artifact_set"
    }
  ],
  [
    "FlowerOfParadiseLost",
    {
      clauses: [
        {
          effectIds: ["artifact.flower-of-paradise-lost.2pc.elemental-mastery"],
          id: "artifact.flower-of-paradise-lost.2pc.elemental-mastery",
          label: "乐园遗落之花 · 二件套",
          source: artifactSource("FlowerOfParadiseLost", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.flower-of-paradise-lost.4pc.reaction-trigger.0-stack.reaction-damage-bonus",
            "artifact.flower-of-paradise-lost.4pc.reaction-trigger.1-stack.reaction-damage-bonus",
            "artifact.flower-of-paradise-lost.4pc.reaction-trigger.2-stack.reaction-damage-bonus",
            "artifact.flower-of-paradise-lost.4pc.reaction-trigger.3-stack.reaction-damage-bonus",
            "artifact.flower-of-paradise-lost.4pc.reaction-trigger.4-stack.reaction-damage-bonus"
          ],
          id: "artifact.flower-of-paradise-lost.4pc.bloom-hyperbloom-burgeon.reaction-damage-bonus",
          label: "乐园遗落之花 · 四件套（绽放、超绽放、烈绽放反应伤害）",
          source: artifactSource("FlowerOfParadiseLost", 4),
          status: "implemented"
        },
        {
          id: "artifact.flower-of-paradise-lost.4pc.lunar-bloom.reaction-damage-bonus",
          label: "乐园遗落之花 · 四件套（月绽放反应伤害）",
          reason: "月绽放使用独立伤害公式，当前单核心动作流水线尚未建模。",
          requiredCapability: "lunar_bloom_reaction_damage_bonus",
          source: artifactSource("FlowerOfParadiseLost", 4),
          status: "unsupported"
        }
      ],
      equipmentId: "FlowerOfParadiseLost",
      kind: "artifact_set"
    }
  ],
  [
    "GildedDreams",
    {
      clauses: [
        {
          effectIds: ["artifact.gilded-dreams.2pc.elemental-mastery"],
          id: "artifact.gilded-dreams.2pc.elemental-mastery",
          label: "饰金之梦 · 二件套",
          source: artifactSource("GildedDreams", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.gilded-dreams.4pc.after-reaction.1-same-element-teammate.attack-percent",
            "artifact.gilded-dreams.4pc.after-reaction.2-same-element-teammates.attack-percent",
            "artifact.gilded-dreams.4pc.after-reaction.3-same-element-teammates.attack-percent",
            "artifact.gilded-dreams.4pc.after-reaction.1-different-element-teammate.elemental-mastery",
            "artifact.gilded-dreams.4pc.after-reaction.2-different-element-teammates.elemental-mastery",
            "artifact.gilded-dreams.4pc.after-reaction.3-different-element-teammates.elemental-mastery"
          ],
          id: "artifact.gilded-dreams.4pc.party-element-composition",
          label: "饰金之梦 · 四件套（触发元素反应后的同元素攻击力与异元素元素精通）",
          source: artifactSource("GildedDreams", 4),
          status: "implemented"
        }
      ],
      equipmentId: "GildedDreams",
      kind: "artifact_set"
    }
  ],
  [
    "Instructor",
    {
      clauses: [
        {
          effectIds: ["artifact.instructor.2pc.elemental-mastery"],
          id: "artifact.instructor.2pc.elemental-mastery",
          label: "教官 · 二件套",
          source: artifactSource("Instructor", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.instructor.4pc.after-reaction.party-elemental-mastery"],
          id: "artifact.instructor.4pc.after-reaction.party-elemental-mastery",
          label: "教官 · 四件套（装备者触发元素反应后）",
          source: artifactSource("Instructor", 4, "party_member"),
          status: "implemented"
        }
      ],
      equipmentId: "Instructor",
      kind: "artifact_set"
    }
  ],
  [
    "NightOfTheSkysUnveiling",
    {
      clauses: [
        {
          effectIds: ["artifact.night-of-the-skys-unveiling.2pc.elemental-mastery"],
          id: "artifact.night-of-the-skys-unveiling.2pc.elemental-mastery",
          label: "穹境示现之夜 · 二件套",
          source: artifactSource("NightOfTheSkysUnveiling", 2),
          status: "implemented"
        },
        {
          effectIds: [
            "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.initial-moonsign.crit-rate",
            "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.full-moonsign.crit-rate"
          ],
          id: "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.moonsign-crit-rate",
          label: "穹境示现之夜 · 四件套（附近队伍触发月曜反应后的装备者暴击率）",
          source: artifactSource("NightOfTheSkysUnveiling", 4),
          status: "implemented"
        },
        {
          id: "artifact.night-of-the-skys-unveiling.4pc.moongleam.lunar-reaction-damage-bonus",
          label: "穹境示现之夜 · 四件套（不同月辉明光的月曜反应伤害加成）",
          reason: "需要月曜反应伤害与队伍不同月辉明光效果计数模型。",
          requiredCapability: "lunar_reaction_damage_bonus_and_moongleam_count",
          source: artifactSource("NightOfTheSkysUnveiling", 4),
          status: "unsupported"
        }
      ],
      equipmentId: "NightOfTheSkysUnveiling",
      kind: "artifact_set"
    }
  ],
  [
    "WanderersTroupe",
    {
      clauses: [
        {
          effectIds: ["artifact.wanderers-troupe.2pc.elemental-mastery"],
          id: "artifact.wanderers-troupe.2pc.elemental-mastery",
          label: "流浪大地的乐团 · 二件套",
          source: artifactSource("WanderersTroupe", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.wanderers-troupe.4pc.bow-catalyst-charged-damage-bonus"],
          id: "artifact.wanderers-troupe.4pc.bow-catalyst-charged-damage-bonus",
          label: "流浪大地的乐团 · 四件套",
          source: artifactSource("WanderersTroupe", 4),
          status: "implemented"
        }
      ],
      equipmentId: "WanderersTroupe",
      kind: "artifact_set"
    }
  ],
  [
    "DefendersWill",
    {
      clauses: [
        {
          effectIds: ["artifact.defenders-will.2pc.defense-percent"],
          id: "artifact.defenders-will.2pc.defense-percent",
          label: "守护之心 · 二件套",
          source: artifactSource("DefendersWill", 2),
          status: "implemented"
        },
        {
          id: "artifact.defenders-will.4pc.party-element-resistance",
          label: "守护之心 · 四件套",
          reason: "需要队伍元素构成统计与承伤元素抗性指标。",
          requiredCapability: "team_element_composition_and_incoming_resistance_metric",
          source: artifactSource("DefendersWill", 4),
          status: "unsupported"
        }
      ],
      equipmentId: "DefendersWill",
      kind: "artifact_set"
    }
  ],
  [
    "DesertPavilionChronicle",
    {
      clauses: [
        {
          effectIds: ["artifact.desert-pavilion-chronicle.2pc.anemo-damage-bonus"],
          id: "artifact.desert-pavilion-chronicle.2pc.anemo-damage-bonus",
          label: "沙上楼阁史话 · 二件套",
          source: artifactSource("DesertPavilionChronicle", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.desert-pavilion-chronicle.4pc.after-charged-hit.weapon-damage-bonus"],
          id: "artifact.desert-pavilion-chronicle.4pc.after-charged-hit.weapon-damage-bonus",
          label: "沙上楼阁史话 · 四件套（重击命中后15秒内）",
          source: artifactSource("DesertPavilionChronicle", 4),
          status: "implemented"
        },
        {
          id: "artifact.desert-pavilion-chronicle.4pc.after-charged-hit.attack-speed",
          label: "沙上楼阁史话 · 四件套（普通攻击速度）",
          reason: "普通攻击速度改变连续攻击次数，不改变当前单次核心命中的期望伤害。",
          source: artifactSource("DesertPavilionChronicle", 4),
          status: "not_applicable"
        }
      ],
      equipmentId: "DesertPavilionChronicle",
      kind: "artifact_set"
    }
  ],
  [
    "Lavawalker",
    {
      clauses: [
        {
          id: "artifact.lavawalker.2pc.pyro-resistance",
          label: "渡过烈火的贤人 · 二件套",
          reason: "需要承伤元素抗性指标。",
          requiredCapability: "incoming_elemental_resistance_metric",
          source: artifactSource("Lavawalker", 2),
          status: "unsupported"
        },
        {
          effectIds: ["artifact.lavawalker.4pc.pyro-aura.damage-bonus"],
          id: "artifact.lavawalker.4pc.pyro-aura.damage-bonus",
          label: "渡过烈火的贤人 · 四件套（当前目标受火元素影响）",
          source: artifactSource("Lavawalker", 4),
          status: "implemented"
        }
      ],
      equipmentId: "Lavawalker",
      kind: "artifact_set"
    }
  ],
  [
    "MartialArtist",
    {
      clauses: [
        {
          effectIds: ["artifact.martial-artist.2pc.normal-charged-damage-bonus"],
          id: "artifact.martial-artist.2pc.normal-charged-damage-bonus",
          label: "武人 · 二件套",
          source: artifactSource("MartialArtist", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.martial-artist.4pc.after-skill.normal-charged-damage-bonus"],
          id: "artifact.martial-artist.4pc.after-skill.normal-charged-damage-bonus",
          label: "武人 · 四件套（元素战技后8秒内）",
          source: artifactSource("MartialArtist", 4),
          status: "implemented"
        }
      ],
      equipmentId: "MartialArtist",
      kind: "artifact_set"
    }
  ],
  [
    "RetracingBolide",
    {
      clauses: [
        {
          effectIds: ["artifact.retracing-bolide.2pc.shield-strength"],
          id: "artifact.retracing-bolide.2pc.shield-strength",
          label: "逆飞的流星 · 二件套",
          source: artifactSource("RetracingBolide", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.retracing-bolide.4pc.shielded.normal-charged-damage-bonus"],
          id: "artifact.retracing-bolide.4pc.shielded.normal-charged-damage-bonus",
          label: "逆飞的流星 · 四件套（当前角色处于护盾庇护下）",
          source: artifactSource("RetracingBolide", 4),
          status: "implemented"
        }
      ],
      equipmentId: "RetracingBolide",
      kind: "artifact_set"
    }
  ],
  [
    "ShimenawasReminiscence",
    {
      clauses: [
        {
          effectIds: ["artifact.shimenawas-reminiscence.2pc.attack-percent"],
          id: "artifact.shimenawas-reminiscence.2pc.attack-percent",
          label: "追忆之注连 · 二件套",
          source: artifactSource("ShimenawasReminiscence", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.shimenawas-reminiscence.4pc.after-skill.normal-charged-plunge-damage-bonus"],
          id: "artifact.shimenawas-reminiscence.4pc.after-skill.normal-charged-plunge-damage-bonus",
          label: "追忆之注连 · 四件套（施放元素战技并已消耗15点元素能量后）",
          source: artifactSource("ShimenawasReminiscence", 4),
          status: "implemented"
        },
        {
          id: "artifact.shimenawas-reminiscence.4pc.energy-consumption",
          label: "追忆之注连 · 四件套（元素能量消耗）",
          reason: "消耗元素能量影响后续元素爆发可用性，不改变当前已选核心动作的一次期望伤害。",
          source: artifactSource("ShimenawasReminiscence", 4),
          status: "not_applicable"
        }
      ],
      equipmentId: "ShimenawasReminiscence",
      kind: "artifact_set"
    }
  ],
  [
    "TenacityOfTheMillelith",
    {
      clauses: [
        {
          effectIds: ["artifact.tenacity-of-the-millelith.2pc.hp-percent"],
          id: "artifact.tenacity-of-the-millelith.2pc.hp-percent",
          label: "千岩牢固 · 二件套",
          source: artifactSource("TenacityOfTheMillelith", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-attack-percent"],
          id: "artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-attack-percent",
          label: "千岩牢固 · 四件套（队伍中装备者元素战技命中后3秒内）",
          source: artifactSource("TenacityOfTheMillelith", 4, "party_member"),
          status: "implemented"
        },
        {
          effectIds: ["artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-shield-strength"],
          id: "artifact.tenacity-of-the-millelith.4pc.party-shield-strength",
          label: "千岩牢固 · 四件套（护盾强效）",
          source: artifactSource("TenacityOfTheMillelith", 4, "party_member"),
          status: "implemented"
        }
      ],
      equipmentId: "TenacityOfTheMillelith",
      kind: "artifact_set"
    }
  ],
  [
    "Thundersoother",
    {
      clauses: [
        {
          id: "artifact.thundersoother.2pc.electro-resistance",
          label: "平息鸣雷的尊者 · 二件套",
          reason: "需要承伤元素抗性指标。",
          requiredCapability: "incoming_elemental_resistance_metric",
          source: artifactSource("Thundersoother", 2),
          status: "unsupported"
        },
        {
          effectIds: ["artifact.thundersoother.4pc.electro-aura.damage-bonus"],
          id: "artifact.thundersoother.4pc.electro-aura.damage-bonus",
          label: "平息鸣雷的尊者 · 四件套（当前目标受雷元素影响）",
          source: artifactSource("Thundersoother", 4),
          status: "implemented"
        }
      ],
      equipmentId: "Thundersoother",
      kind: "artifact_set"
    }
  ],
  [
    "Gambler",
    {
      clauses: [
        {
          effectIds: ["artifact.gambler.2pc.skill-damage-bonus"],
          id: "artifact.gambler.2pc.skill-damage-bonus",
          label: "赌徒 · 二件套",
          source: artifactSource("Gambler", 2),
          status: "implemented"
        },
        {
          id: "artifact.gambler.4pc.skill-cooldown-reset",
          label: "赌徒 · 四件套",
          reason: "击败敌人后清除元素战技冷却仅改变后续施放机会，需要循环、击杀和冷却状态模型。",
          source: artifactSource("Gambler", 4),
          status: "not_applicable"
        }
      ],
      equipmentId: "Gambler",
      kind: "artifact_set"
    }
  ],
  [
    "ResolutionOfSojourner",
    {
      clauses: [
        {
          effectIds: ["artifact.resolution-of-sojourner.2pc.attack-percent"],
          id: "artifact.resolution-of-sojourner.2pc.attack-percent",
          label: "行者之心 · 二件套",
          source: artifactSource("ResolutionOfSojourner", 2),
          status: "implemented"
        },
        {
          effectIds: ["artifact.resolution-of-sojourner.4pc.charged-crit-rate"],
          id: "artifact.resolution-of-sojourner.4pc.charged-crit-rate",
          label: "行者之心 · 四件套",
          source: artifactSource("ResolutionOfSojourner", 4),
          status: "implemented"
        }
      ],
      equipmentId: "ResolutionOfSojourner",
      kind: "artifact_set"
    }
  ],
  [
    "Scholar",
    {
      clauses: [
        {
          effectIds: ["artifact.scholar.2pc.energy-recharge"],
          id: "artifact.scholar.2pc.energy-recharge",
          label: "学士 · 二件套",
          source: artifactSource("Scholar", 2),
          status: "implemented"
        },
        {
          id: "artifact.scholar.4pc.particle-energy-restoration",
          label: "学士 · 四件套",
          reason: "获得元素微粒或晶球后的队伍能量恢复属于后续循环资源，不改变当前核心动作的一次期望伤害。",
          source: artifactSource("Scholar", 4),
          status: "not_applicable"
        }
      ],
      equipmentId: "Scholar",
      kind: "artifact_set"
    }
  ],
  [
    "TheExile",
    {
      clauses: [
        {
          effectIds: ["artifact.the-exile.2pc.energy-recharge"],
          id: "artifact.the-exile.2pc.energy-recharge",
          label: "流放者 · 二件套",
          source: artifactSource("TheExile", 2),
          status: "implemented"
        },
        {
          id: "artifact.the-exile.4pc.burst-energy-restoration",
          label: "流放者 · 四件套",
          reason: "施放元素爆发后的队伍能量恢复属于后续循环资源，不改变当前核心动作的一次期望伤害。",
          source: artifactSource("TheExile", 4),
          status: "not_applicable"
        }
      ],
      equipmentId: "TheExile",
      kind: "artifact_set"
    }
  ]
])

function resolveCoverageEntry(entry: EquipmentCoverageEntry): EquipmentCoverageEntry {
  return reviewedCoverageByEquipmentId.get(entry.equipmentId) ?? entry
}

/** Full 6.7 equipment inventory with explicit implemented, not-applicable, unsupported, or unreviewed coverage. */
export const equipmentCoverageLedger: readonly EquipmentCoverageEntry[] = [
  ...weaponInventory.map(unreviewedWeaponEntry).map(resolveCoverageEntry),
  ...artifactSetInventory.map(unreviewedArtifactSetEntry).map(resolveCoverageEntry)
]

function isPublishedClause(clause: EquipmentCoverageClause): clause is PublishedEquipmentCoverageClause {
  return clause.status === "implemented" || clause.status === "not_applicable"
}

function isPublished(entry: EquipmentCoverageEntry): boolean {
  return entry.clauses.every(isPublishedClause)
}

/** Lists only current-catalog passive clauses that have no unresolved modeling gaps. */
export function listPublishedEquipmentCoverageClauses(): readonly PublishedEquipmentCoverageClause[] {
  return equipmentCoverageLedger
    .filter(isPublished)
    .flatMap((entry) => entry.clauses.filter(isPublishedClause))
}

/** Lists every fully reviewed weapon record that can be equipped in a character configuration. */
export function listPublishedWeapons(): readonly PublishedWeapon[] {
  const inventoryById = new Map(weaponInventory.map((weapon) => [weapon.id, weapon]))
  return equipmentCoverageLedger.flatMap((entry) => {
    if (entry.kind !== "weapon" || !isPublished(entry)) return []
    const weapon = inventoryById.get(entry.equipmentId)
    if (!weapon || (weapon.rarity !== 3 && weapon.rarity !== 4 && weapon.rarity !== 5)) return []
    return [
      {
        label: weapon.label,
        rarity: weapon.rarity,
        weaponId: weapon.id,
        weaponType: weapon.weaponType
      }
    ]
  })
}

/** Lists fully reviewed artifact sets that may be exposed by the current analysis catalog. */
export function listPublishedArtifactSets(): readonly PublishedArtifactSet[] {
  const inventoryById = new Map(artifactSetInventory.map((artifactSet) => [artifactSet.id, artifactSet]))
  return equipmentCoverageLedger.flatMap((entry) => {
    if (entry.kind !== "artifact_set" || !isPublished(entry)) return []
    const artifactSet = inventoryById.get(entry.equipmentId)
    return artifactSet ? [{ label: artifactSet.label, setId: artifactSet.id }] : []
  })
}
