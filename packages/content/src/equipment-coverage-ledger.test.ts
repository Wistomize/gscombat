import { describe, expect, it } from "vitest"

import { listHealingEquipmentEffects } from "./artifacts/healing-bonus/effects.js"
import { listRecipientEquipmentEffects } from "./artifacts/recipient-bonus/effects.js"
import { listCombatActionEffects } from "./combat-action-effects.js"
import { supportedArtifactSets, supportedWeapons } from "./catalog.js"
import {
  equipmentCoverageLedger,
  listPublishedArtifactSets,
  listPublishedWeapons
} from "./equipment-coverage-ledger.js"
import { artifactSetInventory, weaponInventory } from "./equipment-inventory.js"

function sortedIds(entries: readonly { readonly equipmentId: string }[]): string[] {
  return entries.map((entry) => entry.equipmentId).sort()
}

describe("full equipment coverage ledger", () => {
  it("contains exactly one audited entry for every pinned inventory record", () => {
    const weaponEntries = equipmentCoverageLedger.filter((entry) => entry.kind === "weapon")
    const artifactEntries = equipmentCoverageLedger.filter((entry) => entry.kind === "artifact_set")

    expect(sortedIds(weaponEntries)).toEqual(weaponInventory.map((entry) => entry.id).sort())
    expect(sortedIds(artifactEntries)).toEqual(artifactSetInventory.map((entry) => entry.id).sort())
  })

  it("leaves no weapon or artifact passive clause awaiting maintainer review", () => {
    const unreviewedClauses = equipmentCoverageLedger.flatMap((entry) =>
      entry.clauses.filter((clause) => clause.status === "unreviewed")
    )

    expect(unreviewedClauses).toEqual([])
  })

  it("keeps every artifact-set clause aligned to one declared set-bonus piece threshold", () => {
    const artifactEntriesById = new Map(
      equipmentCoverageLedger
        .filter((entry) => entry.kind === "artifact_set")
        .map((entry) => [entry.equipmentId, entry])
    )

    for (const artifactSet of artifactSetInventory) {
      const entry = artifactEntriesById.get(artifactSet.id)
      const pieceThresholds = entry?.clauses.map((clause) =>
        clause.source.kind === "artifact_set" ? clause.source.minimumPieces : -1
      )

      expect([...new Set(pieceThresholds)].sort((left, right) => left - right)).toEqual(
        [...artifactSet.setBonuses].sort()
      )
    }
  })

  it("exposes only fully reviewed records in the current public catalog", () => {
    const publishedIds = new Set([
      ...listPublishedWeapons().map((weapon) => weapon.weaponId),
      ...listPublishedArtifactSets().map((artifactSet) => artifactSet.setId)
    ])

    for (const entry of equipmentCoverageLedger) {
      const isPublished = publishedIds.has(entry.equipmentId)
      const hasBlockingClause = entry.clauses.some(
        (clause) => clause.status === "unreviewed" || clause.status === "unsupported"
      )

      expect(isPublished && hasBlockingClause).toBe(false)
    }
    expect(supportedWeapons).toEqual(listPublishedWeapons())
    expect(supportedArtifactSets).toEqual(listPublishedArtifactSets())
    expect(listPublishedWeapons()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "讨龙英杰谭", rarity: 3, weaponId: "ThrillingTalesOfDragonSlayers" }),
        expect.objectContaining({ label: "尘世之锁", rarity: 5, weaponId: "MemoryOfDust" }),
        expect.objectContaining({ label: "斫峰之刃", rarity: 5, weaponId: "SummitShaper" }),
        expect.objectContaining({ label: "无工之剑", rarity: 5, weaponId: "TheUnforged" }),
        expect.objectContaining({ label: "贯虹之槊", rarity: 5, weaponId: "VortexVanquisher" }),
        expect.objectContaining({ label: "磐岩结绿", rarity: 5, weaponId: "PrimordialJadeCutter" })
      ])
    )
  })

  it("publishes Primordial Jade Cutter only after both final-HP clauses resolve through typed effects", () => {
    const jadeCutter = equipmentCoverageLedger.find((entry) => entry.equipmentId === "PrimordialJadeCutter")

    expect(jadeCutter?.clauses).toEqual([
      expect.objectContaining({
        effectIds: ["weapon.primordial-jade-cutter.hp-percent"],
        status: "implemented"
      }),
      expect.objectContaining({
        effectIds: ["weapon.primordial-jade-cutter.hp-sourced-flat-attack"],
        status: "implemented"
      })
    ])
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("PrimordialJadeCutter")
  })

  it("publishes Peak Patrol Song only after its two-stack source-defense team snapshot resolves", () => {
    const peakPatrolSong = equipmentCoverageLedger.find((entry) => entry.equipmentId === "PeakPatrolSong")

    expect(peakPatrolSong?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["weapon.peak-patrol-song.2-stack.source-final-defense-to-party-all-element-damage-bonus"],
          id: "weapon.peak-patrol-song.two-stack.defense-scaled-party-all-element-damage-bonus",
          status: "implemented"
        })
      ])
    )
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("PeakPatrolSong")
  })

  it("publishes Angelos Heptades after both source-attack snapshots resolve", () => {
    const angelosHeptades = equipmentCoverageLedger.find((entry) => entry.equipmentId === "AngelosHeptades")

    expect(angelosHeptades?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["weapon.angelos-heptades.after-shield.source-final-attack-to-current-on-field-damage-bonus"],
          id: "weapon.angelos-heptades.after-shield.source-attack-scaled-current-on-field-damage-bonus",
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: ["weapon.angelos-heptades.magic-secret.after-shield.source-final-attack-to-off-field-magic-recipient-damage-bonus"],
          id: "weapon.angelos-heptades.magic-secret.after-shield.source-final-attack-to-off-field-magic-recipient-damage-bonus",
          status: "implemented"
        })
      ])
    )
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("AngelosHeptades")
  })

  it("publishes the two PlayStation weapons after their named-holder fixed-attack snapshots resolve", () => {
    const predator = equipmentCoverageLedger.find((entry) => entry.equipmentId === "Predator")
    const swordOfDescension = equipmentCoverageLedger.find((entry) => entry.equipmentId === "SwordOfDescension")

    expect(predator?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["weapon.predator.playstation.aloy.flat-attack"],
          id: "weapon.predator.aloy-flat-attack",
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: [
            "weapon.predator.strong-strike.1-stack.normal-charged-damage-bonus",
            "weapon.predator.strong-strike.2-stack.normal-charged-damage-bonus",
            "weapon.predator.playstation.aloy.flat-attack"
          ],
          id: "weapon.predator.platform-restriction",
          status: "implemented"
        })
      ])
    )
    expect(swordOfDescension?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["weapon.sword-of-descension.descension.physical-hit"],
          id: "weapon.sword-of-descension.descension.physical-hit",
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: ["weapon.sword-of-descension.playstation.traveler.flat-attack"],
          id: "weapon.sword-of-descension.traveler-flat-attack",
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: [
            "weapon.sword-of-descension.descension.physical-hit",
            "weapon.sword-of-descension.playstation.traveler.flat-attack"
          ],
          id: "weapon.sword-of-descension.platform-eligibility",
          status: "implemented"
        })
      ])
    )
    const publishedWeaponIds = listPublishedWeapons().map((weapon) => weapon.weaponId)

    expect(publishedWeaponIds).toEqual(expect.arrayContaining(["Predator", "SwordOfDescension"]))
  })

  it("publishes Messenger only after its guaranteed-critical weak-point event resolves", () => {
    const messenger = equipmentCoverageLedger.find((entry) => entry.equipmentId === "Messenger")

    expect(messenger?.clauses).toEqual([
      expect.objectContaining({
        effectIds: ["weapon.messenger.weak-point-guaranteed-crit.additional-damage"],
        id: "weapon.messenger.weak-point-guaranteed-crit.additional-damage",
        status: "implemented"
      })
    ])
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("Messenger")
  })

  it("publishes Flowing Purity only after every complete-thousand Bond-of-Life snapshot resolves", () => {
    const flowingPurity = equipmentCoverageLedger.find((entry) => entry.equipmentId === "FlowingPurity")

    expect(flowingPurity?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["weapon.flowing-purity.after-skill.all-element-damage-bonus"],
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: [
            "weapon.flowing-purity.bond-of-life-cleared.1-thousand-points.all-element-damage-bonus",
            "weapon.flowing-purity.bond-of-life-cleared.2-thousand-points.all-element-damage-bonus",
            "weapon.flowing-purity.bond-of-life-cleared.3-thousand-points.all-element-damage-bonus",
            "weapon.flowing-purity.bond-of-life-cleared.4-thousand-points.all-element-damage-bonus",
            "weapon.flowing-purity.bond-of-life-cleared.5-thousand-points.all-element-damage-bonus",
            "weapon.flowing-purity.bond-of-life-cleared.6-thousand-points.all-element-damage-bonus"
          ],
          status: "implemented"
        })
      ])
    )
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("FlowingPurity")
  })

  it("publishes Echoes of an Offering once its Valley Rite same-hit snapshot resolves", () => {
    const echoes = equipmentCoverageLedger.find((entry) => entry.equipmentId === "EchoesOfAnOffering")

    expect(echoes?.clauses).toEqual([
      expect.objectContaining({
        effectIds: ["artifact.echoes-of-an-offering.2pc.attack-percent"],
        status: "implemented"
      }),
      expect.objectContaining({
        effectIds: ["artifact.echoes-of-an-offering.4pc.valley-rite.normal-attack-additive-damage"],
        id: "artifact.echoes-of-an-offering.4pc.valley-rite.additional-damage",
        status: "implemented"
      })
    ])
    expect(listPublishedArtifactSets().map((artifactSet) => artifactSet.setId)).toContain("EchoesOfAnOffering")
  })

  it("publishes Scroll of the Hero of Cinder City once every reaction-element state is explicit", () => {
    const scroll = equipmentCoverageLedger.find((entry) => entry.equipmentId === "ScrollOfTheHeroOfCinderCity")

    expect(scroll?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.scroll-of-the-hero-of-cinder-city.2pc.nightsoul-burst-energy",
          status: "not_applicable"
        }),
        expect.objectContaining({
          effectIds: expect.arrayContaining([
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.standard.damage-bonus",
            "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.nightsoul.damage-bonus"
          ]),
          id: "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element-team-damage-bonus",
          status: "implemented"
        })
      ])
    )
    expect(listPublishedArtifactSets().map((artifactSet) => artifactSet.setId)).toContain("ScrollOfTheHeroOfCinderCity")
  })

  it("publishes Celestial Gift once every elemental team-buff snapshot is explicit", () => {
    const celestialGift = equipmentCoverageLedger.find((entry) => entry.equipmentId === "CelestialGift")

    expect(celestialGift?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["artifact.celestial-gift.2pc.energy-recharge"],
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: expect.arrayContaining([
            "artifact.celestial-gift.4pc.celestial-guidance.pyro.damage-bonus",
            "artifact.celestial-gift.4pc.mortal-hymn.pyro.damage-bonus"
          ]),
          id: "artifact.celestial-gift.4pc.elemental-team-damage-bonus",
          status: "implemented"
        })
      ])
    )
    expect(listPublishedArtifactSets().map((artifactSet) => artifactSet.setId)).toContain("CelestialGift")
  })

  it("publishes Crimson Witch after all of its ordinary-reaction branches are declared", () => {
    const crimsonWitch = equipmentCoverageLedger.find((entry) => entry.equipmentId === "CrimsonWitchOfFlames")

    expect(crimsonWitch?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus"],
          id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus",
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: ["artifact.crimson-witch-of-flames.4pc.overload-burning-burgeon.reaction-damage-bonus"],
          id: "artifact.crimson-witch-of-flames.4pc.overload-burning-burgeon.reaction-damage-bonus",
          status: "implemented"
        })
      ])
    )
    expect(listPublishedArtifactSets().map((artifactSet) => artifactSet.setId)).toContain("CrimsonWitchOfFlames")
  })

  it("keeps lunar reaction branches unpublished after ordinary reaction branches resolve", () => {
    const disenchantmentInDeepShadow = equipmentCoverageLedger.find(
      (entry) => entry.equipmentId === "DisenchantmentInDeepShadow"
    )
    const thunderingFury = equipmentCoverageLedger.find((entry) => entry.equipmentId === "ThunderingFury")
    const flowerOfParadiseLost = equipmentCoverageLedger.find((entry) => entry.equipmentId === "FlowerOfParadiseLost")

    expect(disenchantmentInDeepShadow?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["artifact.disenchantment-in-deep-shadow.4pc.superconduct.reaction-damage-bonus"],
          status: "implemented"
        }),
        expect.objectContaining({
          id: "artifact.disenchantment-in-deep-shadow.4pc.stellar-superconduct.reaction-damage-bonus",
          status: "unsupported"
        })
      ])
    )
    expect(thunderingFury?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: [
            "artifact.thundering-fury.4pc.overload-electro-charged-superconduct-hyperbloom.reaction-damage-bonus"
          ],
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: ["artifact.thundering-fury.4pc.aggravate.reaction-damage-bonus"],
          status: "implemented"
        }),
        expect.objectContaining({
          id: "artifact.thundering-fury.4pc.lunar-charged-stellar-superconduct.reaction-damage-bonus",
          status: "unsupported"
        }),
        expect.objectContaining({
          id: "artifact.thundering-fury.4pc.skill-cooldown-reduction",
          status: "not_applicable"
        })
      ])
    )
    expect(flowerOfParadiseLost?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: expect.arrayContaining([
            "artifact.flower-of-paradise-lost.4pc.reaction-trigger.0-stack.reaction-damage-bonus",
            "artifact.flower-of-paradise-lost.4pc.reaction-trigger.4-stack.reaction-damage-bonus"
          ]),
          id: "artifact.flower-of-paradise-lost.4pc.bloom-hyperbloom-burgeon.reaction-damage-bonus",
          status: "implemented"
        }),
        expect.objectContaining({
          id: "artifact.flower-of-paradise-lost.4pc.lunar-bloom.reaction-damage-bonus",
          status: "unsupported"
        })
      ])
    )
    const publishedArtifactIds = listPublishedArtifactSets().map((artifactSet) => artifactSet.setId)

    expect(publishedArtifactIds).not.toContain("DisenchantmentInDeepShadow")
    expect(publishedArtifactIds).not.toContain("ThunderingFury")
    expect(publishedArtifactIds).not.toContain("FlowerOfParadiseLost")
  })

  it("keeps Night of the Sky's Unveiling unpublished while its lunar damage branch remains unsupported", () => {
    const nightOfTheSkysUnveiling = equipmentCoverageLedger.find(
      (entry) => entry.equipmentId === "NightOfTheSkysUnveiling"
    )

    expect(nightOfTheSkysUnveiling?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: [
            "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.initial-moonsign.crit-rate",
            "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.full-moonsign.crit-rate"
          ],
          id: "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.moonsign-crit-rate",
          status: "implemented"
        }),
        expect.objectContaining({
          id: "artifact.night-of-the-skys-unveiling.4pc.moongleam.lunar-reaction-damage-bonus",
          status: "unsupported"
        })
      ])
    )
    expect(listPublishedArtifactSets().map((artifactSet) => artifactSet.setId)).not.toContain("NightOfTheSkysUnveiling")
  })

  it("keeps Cinnabar Spindle unpublished while only Albedo's single-hit slice is resolved", () => {
    const cinnabarSpindle = equipmentCoverageLedger.find((entry) => entry.equipmentId === "CinnabarSpindle")

    expect(cinnabarSpindle?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["weapon.cinnabar-spindle.skill-hit-ready.albedo-transient-blossom.defense-additive-damage"],
          id: "weapon.cinnabar-spindle.albedo-transient-blossom.defense-additive-damage",
          status: "implemented"
        }),
        expect.objectContaining({
          id: "weapon.cinnabar-spindle.other-skill-hits.per-trigger-cooldown",
          status: "unsupported"
        })
      ])
    )
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).not.toContain("CinnabarSpindle")
  })

  it("records Golden Frostbound Oath's self and nearby-teammate Lunar-Crystallize branches separately", () => {
    const goldenFrostboundOath = equipmentCoverageLedger.find((entry) => entry.equipmentId === "GoldenFrostboundOath")

    expect(goldenFrostboundOath?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["weapon.golden-frostbound-oath.frost-fairys-requital.lunar-crystallize.reaction-damage-bonus"],
          id: "weapon.golden-frostbound-oath.frost-fairys-requital.lunar-crystallize-damage-bonus",
          source: { kind: "weapon", weaponId: "GoldenFrostboundOath" },
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: [
            "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-geo-damage-bonus"
          ],
          source: { holder: "party_member", kind: "weapon", weaponId: "GoldenFrostboundOath" },
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: [
            "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-lunar-crystallize.reaction-damage-bonus"
          ],
          id: "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-lunar-crystallize.reaction-damage-bonus",
          source: { holder: "party_member", kind: "weapon", weaponId: "GoldenFrostboundOath" },
          status: "implemented"
        })
      ])
    )
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("GoldenFrostboundOath")
  })

  it("publishes Sword of Narzissenkreuz after excluding its independent Arkhe impact from the core-action metric", () => {
    const swordOfNarzissenkreuz = equipmentCoverageLedger.find(
      (entry) => entry.equipmentId === "SwordOfNarzissenkreuz"
    )

    expect(swordOfNarzissenkreuz?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.sword-of-narzissenkreuz.no-arkhe.arkhe-aligned-energy-impact",
          status: "not_applicable"
        }),
        expect.objectContaining({
          id: "weapon.sword-of-narzissenkreuz.arkhe-holder-passive-ineligibility",
          status: "not_applicable"
        })
      ])
    )
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("SwordOfNarzissenkreuz")
  })

  it("keeps Silken Moon's Serenade unpublished while its lunar-reaction damage branch is unsupported", () => {
    const silkenMoonsSerenade = equipmentCoverageLedger.find((entry) => entry.equipmentId === "SilkenMoonsSerenade")

    expect(silkenMoonsSerenade?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: [
            "artifact.silken-moons-serenade.4pc.moonlit-glow.initial-moonsign.party-elemental-mastery",
            "artifact.silken-moons-serenade.4pc.moonlit-glow.full-moonsign.party-elemental-mastery"
          ],
          id: "artifact.silken-moons-serenade.4pc.moonlit-glow.moonsign-party-elemental-mastery",
          status: "implemented"
        }),
        expect.objectContaining({
          id: "artifact.silken-moons-serenade.4pc.different-moongleam.lunar-reaction-damage-bonus",
          status: "unsupported"
        })
      ])
    )
    expect(listPublishedArtifactSets().map((artifactSet) => artifactSet.setId)).not.toContain("SilkenMoonsSerenade")
  })

  it("publishes Staff of Homa only after its base and low-health final-HP attack clauses resolve", () => {
    const staffOfHoma = equipmentCoverageLedger.find((entry) => entry.equipmentId === "StaffOfHoma")

    expect(staffOfHoma?.clauses).toEqual([
      expect.objectContaining({
        effectIds: ["weapon.staff-of-homa.hp-percent"],
        status: "implemented"
      }),
      expect.objectContaining({
        effectIds: ["weapon.staff-of-homa.hp-sourced-flat-attack"],
        source: { holder: "primary", kind: "weapon", weaponId: "StaffOfHoma" },
        status: "implemented"
      }),
      expect.objectContaining({
        effectIds: ["weapon.staff-of-homa.hp-below-50.extra-hp-sourced-flat-attack"],
        source: { holder: "primary", kind: "weapon", weaponId: "StaffOfHoma" },
        status: "implemented"
      })
    ])
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("StaffOfHoma")
  })

  it("publishes Absolution only after all three selected Bond-of-Life increase snapshots resolve", () => {
    const absolution = equipmentCoverageLedger.find((entry) => entry.equipmentId === "Absolution")

    expect(absolution?.clauses).toEqual([
      expect.objectContaining({
        effectIds: ["weapon.absolution.crit-damage"],
        id: "weapon.absolution.crit-damage",
        source: { holder: "primary", kind: "weapon", weaponId: "Absolution" },
        status: "implemented"
      }),
      expect.objectContaining({
        effectIds: [
          "weapon.absolution.bond-of-life-increase.1-stack.damage-bonus",
          "weapon.absolution.bond-of-life-increase.2-stack.damage-bonus",
          "weapon.absolution.bond-of-life-increase.3-stack.damage-bonus"
        ],
        id: "weapon.absolution.bond-of-life-increase.damage-bonus",
        source: { holder: "primary", kind: "weapon", weaponId: "Absolution" },
        status: "implemented"
      })
    ])
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("Absolution")
  })

  it("publishes Everlasting Moonglow when its normal same-hit clause resolves", () => {
    const moonglow = equipmentCoverageLedger.find((entry) => entry.equipmentId === "EverlastingMoonglow")

    expect(moonglow?.clauses).toEqual([
      expect.objectContaining({
        effectIds: ["weapon.everlasting-moonglow.outgoing-healing-bonus"],
        id: "weapon.everlasting-moonglow.outgoing-healing-bonus",
        status: "implemented"
      }),
      expect.objectContaining({
        effectIds: ["weapon.everlasting-moonglow.normal-hp-additive-damage"],
        id: "weapon.everlasting-moonglow.normal-hp-additive-damage",
        status: "implemented"
      }),
      expect.objectContaining({
        id: "weapon.everlasting-moonglow.after-burst.normal-hit.energy-restoration",
        status: "not_applicable"
      })
    ])
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("EverlastingMoonglow")
  })

  it("publishes Blackcliff Agate when its defeated-enemy snapshots resolve", () => {
    const blackcliffAgate = equipmentCoverageLedger.find((entry) => entry.equipmentId === "BlackcliffAgate")

    expect(blackcliffAgate?.clauses).toEqual([
      expect.objectContaining({
        effectIds: [
          "weapon.blackcliff-agate.defeated-enemy.1-stack.attack-percent",
          "weapon.blackcliff-agate.defeated-enemy.2-stack.attack-percent",
          "weapon.blackcliff-agate.defeated-enemy.3-stack.attack-percent"
        ],
        id: "weapon.blackcliff-agate.defeated-enemy.attack-percent",
        source: { holder: "primary", kind: "weapon", weaponId: "BlackcliffAgate" },
        status: "implemented"
      })
    ])
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("BlackcliffAgate")
  })

  it("publishes Ballad of the Boundless Blue when all six Azure Skies snapshots resolve", () => {
    const ballad = equipmentCoverageLedger.find((entry) => entry.equipmentId === "BalladOfTheBoundlessBlue")

    expect(ballad?.clauses).toEqual([
      expect.objectContaining({
        effectIds: [
          "weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.normal-damage-bonus",
          "weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.charged-damage-bonus",
          "weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.normal-damage-bonus",
          "weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.charged-damage-bonus",
          "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.normal-damage-bonus",
          "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.charged-damage-bonus"
        ],
        id: "weapon.ballad-of-the-boundless-blue.azure-skies.damage-bonus",
        source: { holder: "primary", kind: "weapon", weaponId: "BalladOfTheBoundlessBlue" },
        status: "implemented"
      })
    ])
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("BalladOfTheBoundlessBlue")
  })

  it("publishes Sturdy Bone when its selected post-sprint normal-hit state resolves", () => {
    const sturdyBone = equipmentCoverageLedger.find((entry) => entry.equipmentId === "SturdyBone")

    expect(sturdyBone?.clauses).toEqual([
      expect.objectContaining({
        id: "weapon.sturdy-bone.sprint-stamina-consumption",
        status: "not_applicable"
      }),
      expect.objectContaining({
        effectIds: ["weapon.sturdy-bone.sprint-followup.normal-attack-additive-damage"],
        id: "weapon.sturdy-bone.sprint-followup.normal-attack-additive-damage",
        source: { holder: "primary", kind: "weapon", weaponId: "SturdyBone" },
        status: "implemented"
      })
    ])
    expect(listPublishedWeapons().map((weapon) => weapon.weaponId)).toContain("SturdyBone")
  })

  it("keeps every implemented clause connected to a typed action or metric effect and every unresolved clause explicit", () => {
    const effectsById = new Map(
      [
        ...listCombatActionEffects(),
        ...listHealingEquipmentEffects(),
        ...listRecipientEquipmentEffects()
      ].map((effect) => [effect.id, effect])
    )

    for (const entry of equipmentCoverageLedger) {
      for (const clause of entry.clauses) {
        if (clause.status === "implemented") {
          expect(clause.effectIds.length).toBeGreaterThan(0)
          for (const effectId of clause.effectIds) {
            const effect = effectsById.get(effectId)

            expect(effect).toBeDefined()
            expect(effect?.source).toMatchObject(clause.source)
          }
          continue
        }
        expect(clause.reason.trim()).not.toHaveLength(0)
      }
    }
  })

  it("publishes only artifact sets whose two-piece and four-piece clauses have both been reviewed", () => {
    const entriesById = new Map(equipmentCoverageLedger.map((entry) => [entry.equipmentId, entry]))

    expect(entriesById.get("ResolutionOfSojourner")?.clauses).toEqual([
      expect.objectContaining({ status: "implemented" }),
      expect.objectContaining({ status: "implemented" })
    ])
    for (const setId of ["Gambler", "Scholar", "TheExile"]) {
      expect(entriesById.get(setId)?.clauses).toEqual([
        expect.objectContaining({ status: "implemented" }),
        expect.objectContaining({ status: "not_applicable" })
      ])
    }
    expect(supportedArtifactSets.map((set) => set.setId)).toEqual(
      expect.arrayContaining([
        "Gambler",
        "GladiatorsFinale",
        "ResolutionOfSojourner",
        "Scholar",
        "TheExile",
        "WanderersTroupe"
      ])
    )
    for (const setId of ["GladiatorsFinale", "WanderersTroupe"]) {
      expect(entriesById.get(setId)?.clauses).toEqual([
        expect.objectContaining({ status: "implemented" }),
        expect.objectContaining({ status: "implemented" })
      ])
    }
    expect(entriesById.get("RetracingBolide")?.clauses).toEqual([
      expect.objectContaining({ status: "implemented" }),
      expect.objectContaining({ status: "implemented" })
    ])
    expect(entriesById.get("TravelingDoctor")?.clauses).toEqual([
      expect.objectContaining({ status: "implemented" }),
      expect.objectContaining({
        status: "not_applicable"
      })
    ])
    expect(supportedArtifactSets.map((set) => set.setId)).toContain("RetracingBolide")
    expect(supportedArtifactSets.map((set) => set.setId)).toContain("TravelingDoctor")
  })

  it("publishes reviewed automatic and explicit current-action artifact states", () => {
    const publishedArtifactIds = supportedArtifactSets.map((set) => set.setId)

    expect(publishedArtifactIds).toEqual(
      expect.arrayContaining([
        "Berserker",
        "BloodstainedChivalry",
        "BraveHeart",
        "DeepwoodMemories",
        "GoldenTroupe",
        "HeartOfDepth"
      ])
    )
  })

  it("publishes Blizzard Strayer and Viridescent Venerer after every current-action branch is modeled", () => {
    const entriesById = new Map(equipmentCoverageLedger.map((entry) => [entry.equipmentId, entry]))

    expect(entriesById.get("BlizzardStrayer")?.clauses).toEqual([
      expect.objectContaining({ status: "implemented" }),
      expect.objectContaining({ status: "implemented" })
    ])
    expect(entriesById.get("ViridescentVenerer")?.clauses).toEqual([
      expect.objectContaining({ status: "implemented" }),
      expect.objectContaining({ status: "implemented" }),
      expect.objectContaining({
        effectIds: ["artifact.viridescent-venerer.4pc.swirl.reaction-damage-bonus"],
        status: "implemented"
      })
    ])
    expect(supportedArtifactSets.map((set) => set.setId)).toContain("BlizzardStrayer")
    expect(supportedArtifactSets.map((set) => set.setId)).toContain("ViridescentVenerer")
  })

  it("publishes fully modeled current-state artifact sets when every piece threshold is covered", () => {
    const entriesById = new Map(equipmentCoverageLedger.map((entry) => [entry.equipmentId, entry]))

    expect(entriesById.get("ArchaicPetra")?.clauses).toEqual([
      expect.objectContaining({ status: "implemented" }),
      expect.objectContaining({ status: "implemented" })
    ])
    expect(supportedArtifactSets.map((set) => set.setId)).toEqual(
      expect.arrayContaining([
        "ADayCarvedFromRisingWinds",
        "ArchaicPetra",
        "FinaleOfTheDeepGalleries",
        "NighttimeWhispersInTheEchoingWoods",
        "ObsidianCodex"
      ])
    )
  })

  it("publishes weapon passives that only affect a later rotation or a later skill cast", () => {
    const entriesById = new Map(equipmentCoverageLedger.map((entry) => [entry.equipmentId, entry]))
    const reviewedWeaponIds = [
      "FavoniusLance",
      "FavoniusSword",
      "SacrificialBow",
      "SacrificialFragments",
      "SacrificialGreatsword"
    ]

    for (const weaponId of reviewedWeaponIds) {
      expect(entriesById.get(weaponId)?.clauses).toEqual([expect.objectContaining({ status: "not_applicable" })])
    }
    expect(supportedWeapons.map((weapon) => weapon.weaponId)).toEqual(expect.arrayContaining(reviewedWeaponIds))
  })

  it("keeps each reviewed weapon passive explicit even when a current-hit proc needs manual availability", () => {
    const entriesById = new Map(equipmentCoverageLedger.map((entry) => [entry.equipmentId, entry]))
    const reviewedWeaponIds = [
      "FesteringDesire",
      "KatsuragikiriNagamasa",
      "KitainCrossSpear",
      "LuxuriousSeaLord",
      "SkywardPride",
      "TheBlackSword",
      "WhiteTassel"
    ]

    for (const weaponId of reviewedWeaponIds) {
      expect(entriesById.get(weaponId)?.clauses.every((clause) => clause.status !== "unreviewed")).toBe(true)
    }
    expect(supportedWeapons.map((weapon) => weapon.weaponId)).toEqual(
      expect.arrayContaining(
        reviewedWeaponIds.filter((weaponId) => weaponId !== "WhiteTassel")
      )
    )
  })

  it("publishes reviewed weapon branches that are explicitly outside character core-action damage", () => {
    const entriesById = new Map(equipmentCoverageLedger.map((entry) => [entry.equipmentId, entry]))
    const excludedWeaponIds = [
      "EyeOfPerception",
      "OtherworldlyStory",
      "PrototypeAmber",
      "RecurveBow",
      "SerpentSpine",
      "SkywardAtlas",
      "SwordOfNarzissenkreuz",
      "TheBell",
      "TheBlackSword",
      "TheViridescentHunt",
      "TravelersHandySword",
      "WhiteIronGreatsword"
    ]

    for (const weaponId of excludedWeaponIds) {
      const clauses = entriesById.get(weaponId)?.clauses ?? []

      expect(clauses.some((clause) => clause.status === "unsupported")).toBe(false)
      expect(clauses.some((clause) => clause.status === "not_applicable")).toBe(true)
    }
    expect(supportedWeapons.map((weapon) => weapon.weaponId)).toEqual(expect.arrayContaining(excludedWeaponIds))
  })

  it("publishes Astral Vulture's Crimson Plumage only after both its selected and team tiers are modeled", () => {
    const entry = equipmentCoverageLedger.find((candidate) => candidate.equipmentId === "AstralVulturesCrimsonPlumage")

    expect(entry?.clauses).toEqual([
      expect.objectContaining({ status: "implemented" }),
      expect.objectContaining({ status: "implemented" })
    ])
    expect(supportedWeapons.map((weapon) => weapon.weaponId)).toContain("AstralVulturesCrimsonPlumage")
  })

  it("publishes fully modeled ranged weapon passives while retaining their explicit snapshot conditions", () => {
    const entriesById = new Map(equipmentCoverageLedger.map((entry) => [entry.equipmentId, entry]))
    const reviewedWeaponIds = [
      "DodocoTales",
      "EmeraldOrb",
      "MagicGuide",
      "MouunsMoon",
      "OathswornEye",
      "RavenBow",
      "Rust",
      "SolarPearl",
      "TheStringless"
    ]

    for (const weaponId of reviewedWeaponIds) {
      expect(entriesById.get(weaponId)?.clauses.every((clause) => clause.status === "implemented")).toBe(true)
    }
    expect(supportedWeapons.map((weapon) => weapon.weaponId)).toEqual(
      expect.arrayContaining(["DodocoTales", "MouunsMoon", "OathswornEye", "Rust", "SolarPearl", "TheStringless"])
    )
  })

  it("keeps Finale of the Deep unpublished until partial Bond-of-Life clears are modeled", () => {
    const entry = equipmentCoverageLedger.find((candidate) => candidate.equipmentId === "FinaleOfTheDeep")

    expect(entry?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["weapon.finale-of-the-deep.bond-of-life-cleared.at-cap.flat-attack"],
          status: "implemented"
        }),
        expect.objectContaining({
          id: "weapon.finale-of-the-deep.bond-of-life-cleared.uncapped-or-partial.flat-attack",
          status: "unsupported"
        })
      ])
    )
    expect(supportedWeapons.map((weapon) => weapon.weaponId)).not.toContain("FinaleOfTheDeep")
  })

  it("models ordinary and Moon-reaction weapon branches in separate formula stages", () => {
    const entriesById = new Map(equipmentCoverageLedger.map((entry) => [entry.equipmentId, entry]))

    expect(entriesById.get("BlackmarrowLantern")?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["weapon.blackmarrow-lantern.bloom.reaction-damage-bonus"],
          id: "weapon.blackmarrow-lantern.bloom-damage-bonus",
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: [
            "weapon.blackmarrow-lantern.lunar-bloom.reaction-damage-bonus",
            "weapon.blackmarrow-lantern.full-moonsign.lunar-bloom.reaction-damage-bonus"
          ],
          id: "weapon.blackmarrow-lantern.lunar-bloom-damage-bonus",
          status: "implemented"
        })
      ])
    )
    expect(entriesById.get("NightweaversLookingGlass")?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: [
            "weapon.nightweavers-looking-glass.both-states.party-bloom.reaction-damage-bonus",
            "weapon.nightweavers-looking-glass.both-states.party-hyperbloom-burgeon.reaction-damage-bonus"
          ],
          id: "weapon.nightweavers-looking-glass.bloom-hyperbloom-burgeon.party-damage-bonus",
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: ["weapon.nightweavers-looking-glass.both-states.party-lunar-bloom.reaction-damage-bonus"],
          id: "weapon.nightweavers-looking-glass.lunar-bloom.party-damage-bonus",
          status: "implemented"
        })
      ])
    )
    expect(entriesById.get("ProspectorsShovel")?.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectIds: ["weapon.prospectors-shovel.electro-charged.reaction-damage-bonus"],
          id: "weapon.prospectors-shovel.electro-charged-damage-bonus",
          status: "implemented"
        }),
        expect.objectContaining({
          effectIds: [
            "weapon.prospectors-shovel.lunar-charged.reaction-damage-bonus",
            "weapon.prospectors-shovel.full-moonsign.lunar-charged.reaction-damage-bonus"
          ],
          id: "weapon.prospectors-shovel.lunar-charged-damage-bonus",
          status: "implemented"
        })
      ])
    )
    for (const weaponId of ["BlackmarrowLantern", "NightweaversLookingGlass", "ProspectorsShovel"]) {
      expect(supportedWeapons.map((weapon) => weapon.weaponId)).toContain(weaponId)
    }
  })
})
