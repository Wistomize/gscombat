import { describe, expect, it } from "vitest"

import { evaluateRotation, type AuraElement } from "./rotation.js"

const enemy = { defenseReduction: 0, level: 100, resistance: 0.1 }

describe("evaluateRotation", () => {
  it("uses expected rotation DPS as DPR divided by the declared duration", () => {
    const result = evaluateRotation({
      duration: 10,
      enemy,
      events: [
        {
          canCrit: true,
          element: "electro",
          id: "raiden.burst.initial",
          ownerId: "raiden",
          scaling: { coefficient: 2, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 1,
            critRate: 0.5,
            damageBonus: 0.5,
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 90
          },
          time: 1
        },
        {
          canCrit: true,
          element: "pyro",
          id: "hutao.burst",
          ownerId: "hutao",
          scaling: { coefficient: 0.1, stat: "hp" },
          stats: {
            attack: 1000,
            critDamage: 1,
            critRate: 0.5,
            damageBonus: 0.5,
            defense: 700,
            elementalMastery: 0,
            hp: 30_000,
            level: 90
          },
          time: 4
        }
      ]
    })

    expect(result.events).toHaveLength(2)
    expect(result.dpr).toBeCloseTo(result.events[0]!.expectedDamage + result.events[1]!.expectedDamage)
    expect(result.dps).toBeCloseTo(result.dpr / 10)
    expect(result.events[1]!.trace[0]).toMatchObject({ kind: "scaling", stat: "hp" })
  })

  it("uses a guaranteed crit policy independently of an event's crit-rate stat", () => {
    const result = evaluateRotation({
      duration: 1,
      enemy,
      events: [
        {
          canCrit: true,
          critPolicy: "guaranteed",
          element: "physical",
          id: "test.guaranteed-crit",
          ownerId: "test-owner",
          scaling: { coefficient: 1, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 1,
            critRate: 0,
            damageBonus: 0,
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 100
          },
          time: 0
        }
      ]
    })

    const event = result.events[0]!
    expect(event.expectedDamage).toBeCloseTo(event.critDamage)
    expect(event.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ critDamage: 1, critRate: 1, kind: "expected_crit", multiplier: 2 })])
    )
  })

  it("adds a hit-count trace after the single-hit resistance result for multi-hit direct damage", () => {
    const result = evaluateRotation({
      duration: 1,
      enemy: { defenseReduction: 0, level: 100, resistance: 0.1 },
      events: [
        {
          canCrit: false,
          element: "physical",
          hitCount: 3,
          id: "test.multi-hit.direct",
          ownerId: "test-owner",
          scaling: { coefficient: 1, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 0,
            critRate: 0,
            damageBonus: 0,
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 100
          },
          time: 0
        }
      ]
    })

    const event = result.events[0]!
    expect(event.expectedDamage).toBeCloseTo(1350)
    expect(event.trace.map((entry) => entry.kind)).toEqual([
      "scaling",
      "damage_bonus",
      "expected_crit",
      "defense",
      "resistance",
      "hit_count"
    ])
    expect(event.trace.at(-2)).toMatchObject({ after: 450, before: 500, kind: "resistance" })
    expect(event.trace.at(-1)).toEqual({ after: 1350, before: 450, hitCount: 3, kind: "hit_count" })
  })

  it("sums mixed scaling terms inside one hit before reaction and critical expectation", () => {
    const result = evaluateRotation({
      duration: 2,
      enemy,
      events: [
        {
          canCrit: true,
          element: "pyro",
          id: "dehya.burst.flame_manes_fist",
          ownerId: "dehya",
          reaction: { bonus: 0, kind: "vaporize_reverse" },
          resistanceReduction: 0.05,
          scaling: {
            terms: [
              { coefficient: 2, stat: "attack" },
              { coefficient: 0.1, stat: "hp" },
              { coefficient: 0.5, stat: "elementalMastery" }
            ]
          },
          stats: {
            attack: 1000,
            critDamage: 1,
            critRate: 0.5,
            damageBonus: 0.5,
            defense: 700,
            elementalMastery: 300,
            hp: 20_000,
            level: 90
          },
          time: 0
        }
      ]
    })

    const event = result.events[0]!
    expect(event.hitCount).toBe(1)
    expect(event.trace.map((entry) => entry.kind)).toEqual([
      "scaling_terms",
      "amplifying_reaction",
      "damage_bonus",
      "expected_crit",
      "defense",
      "resistance"
    ])
    expect(event.trace[0]).toEqual({
      after: 4150,
      before: 0,
      kind: "scaling_terms",
      terms: [
        { coefficient: 2, contribution: 2000, stat: "attack", value: 1000 },
        { coefficient: 0.1, contribution: 2000, stat: "hp", value: 20_000 },
        { coefficient: 0.5, contribution: 150, stat: "elementalMastery", value: 300 }
      ]
    })
    expect(event.trace.find((entry) => entry.kind === "amplifying_reaction")).toMatchObject({
      baseMultiplier: 1.5,
      bonus: 0,
      elementalMastery: 300,
      kind: "amplifying_reaction",
      reaction: "vaporize_reverse"
    })
    expect(event.trace.find((entry) => entry.kind === "defense")).toMatchObject({
      attackerLevel: 90,
      defenseIgnore: 0,
      defenseReduction: 0,
      enemyLevel: 100,
      kind: "defense"
    })
    expect(event.trace.find((entry) => entry.kind === "resistance")).toMatchObject({
      baseResistance: 0.1,
      effectiveResistance: 0.05,
      kind: "resistance",
      resistance: 0.05,
      resistanceReduction: 0.05
    })
  })

  it("adds catalyze damage before damage bonus and critical expectation", () => {
    const result = evaluateRotation({
      duration: 2,
      enemy: { ...enemy, resistance: 0 },
      events: [
        {
          canCrit: true,
          element: "dendro",
          id: "nahida.skill.tri-karma",
          ownerId: "nahida",
          reaction: { bonus: 0, kind: "spread" },
          scaling: { coefficient: 1, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 1,
            critRate: 0.5,
            damageBonus: 0.5,
            defense: 700,
            elementalMastery: 200,
            hp: 20_000,
            level: 90
          },
          time: 0
        }
      ]
    })

    const additive = result.events[0]!.trace.find((entry) => entry.kind === "additive_reaction")
    expect(additive).toMatchObject({
      elementalMastery: 200,
      kind: "additive_reaction",
      multiplier: 1.25,
      reaction: "spread"
    })
    if (additive?.kind !== "additive_reaction") throw new Error("Expected an additive reaction trace")
    expect(additive.baseDamage).toBeGreaterThan(0)
    expect(additive.reactionDamage).toBeCloseTo(
      additive.baseDamage *
        additive.multiplier *
        (1 + (5 * additive.elementalMastery) / (additive.elementalMastery + 1200) + additive.bonus)
    )
    expect(result.events[0]!.expectedDamage).toBeGreaterThan(2_000)
  })

  it("calculates transformative reactions without critical or defense multipliers", () => {
    const result = evaluateRotation({
      duration: 2,
      enemy: { ...enemy, resistance: 0 },
      events: [
        {
          canCrit: true,
          element: "dendro",
          id: "kuki.hyperbloom",
          hitCount: 2,
          ownerId: "kuki",
          reaction: { bonus: 0, kind: "hyperbloom" },
          resistanceReduction: 0.05,
          scaling: { coefficient: 0, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 4,
            critRate: 1,
            damageBonus: 4,
            defense: 700,
            elementalMastery: 1000,
            hp: 20_000,
            level: 90
          },
          time: 0
        }
      ]
    })

    const event = result.events[0]!
    expect(event.nonCritDamage).toBeCloseTo(event.critDamage)
    expect(event.trace.map((entry) => entry.kind)).toEqual(["transformative_reaction", "resistance"])
    const transformative = event.trace.find((entry) => entry.kind === "transformative_reaction")
    expect(transformative).toMatchObject({
      elementalMastery: 1000,
      hitCount: 2,
      kind: "transformative_reaction",
      multiplier: 3,
      reaction: "hyperbloom"
    })
    if (transformative?.kind !== "transformative_reaction") {
      throw new Error("Expected a transformative reaction trace")
    }
    expect(transformative.baseDamage).toBeGreaterThan(0)
    expect(transformative.after).toBeCloseTo(
      transformative.baseDamage *
        transformative.multiplier *
        (1 + (16 * transformative.elementalMastery) / (transformative.elementalMastery + 2000) + transformative.bonus) *
        transformative.hitCount
    )
    expect(event.trace.at(-1)).toMatchObject({
      baseResistance: 0,
      effectiveResistance: -0.05,
      kind: "resistance",
      resistance: -0.05,
      resistanceReduction: 0.05
    })
  })

  it.each([
    ["Bloom", "bloom", "dendro", 0.5],
    ["Hyperbloom", "hyperbloom", "dendro", 0.5],
    ["Burgeon", "burgeon", "dendro", 0.5],
    ["Burning", "burning", "pyro", 0.4],
    ["Electro-Charged", "electro_charged", "electro", 0.3],
    ["Overload", "overload", "pyro", 0.4],
    ["Shatter", "shatter", "physical", 0.1],
    ["Superconduct", "superconduct", "cryo", 0.2]
  ] as const)("uses the %s damage element for transformative reaction resistance", (_label, reaction, element, resistance) => {
    const result = evaluateRotation({
      duration: 1,
      enemy: {
        ...enemy,
        resistance: 0,
        resistances: { cryo: 0.2, dendro: 0.5, electro: 0.3, physical: 0.1, pyro: 0.4 }
      },
      events: [
        {
          canCrit: false,
          element: "electro",
          id: `test.${reaction}.resistance`,
          ownerId: "test-owner",
          reaction: { bonus: 0, kind: reaction },
          scaling: { coefficient: 0, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 0,
            critRate: 0,
            damageBonus: 0,
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 90
          },
          time: 0
        }
      ]
    })

    expect(result.events[0]!.trace.at(-1)).toMatchObject({ element, kind: "resistance", resistance })
  })

  it("rejects a conflicting explicit damage element for a derivable transformative reaction", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [
          {
            canCrit: false,
            element: "electro",
            id: "test.hyperbloom.conflicting-damage-element",
            ownerId: "test-owner",
            reaction: { bonus: 0, damageElement: "electro", kind: "hyperbloom" },
            scaling: { coefficient: 0, stat: "attack" },
            stats: {
              attack: 1000,
              critDamage: 0,
              critRate: 0,
              damageBonus: 0,
              defense: 700,
              elementalMastery: 0,
              hp: 20_000,
              level: 90
            },
            time: 0
          }
        ]
      })
    ).toThrow("Transformative reaction hyperbloom must use its inferred dendro damage element")
  })

  it("uses the explicitly declared damage element for Swirl resistance", () => {
    const result = evaluateRotation({
      duration: 1,
      enemy: { ...enemy, resistance: 0, resistances: { anemo: 0.1, pyro: 0.4 } },
      events: [
        {
          canCrit: false,
          element: "anemo",
          id: "test.swirl.resistance",
          ownerId: "test-owner",
          reaction: { bonus: 0, damageElement: "pyro", kind: "swirl" },
          scaling: { coefficient: 0, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 0,
            critRate: 0,
            damageBonus: 0,
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 90
          },
          time: 0
        }
      ]
    })

    expect(result.events[0]!.trace.at(-1)).toMatchObject({ element: "pyro", kind: "resistance", resistance: 0.4 })
  })

  it("requires an explicit damage element for Swirl", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [
          {
            canCrit: false,
            element: "anemo",
            id: "test.swirl.missing-damage-element",
            ownerId: "test-owner",
            reaction: { bonus: 0, kind: "swirl" },
            scaling: { coefficient: 0, stat: "attack" },
            stats: {
              attack: 1000,
              critDamage: 0,
              critRate: 0,
              damageBonus: 0,
              defense: 700,
              elementalMastery: 0,
              hp: 20_000,
              level: 90
            },
            time: 0
          }
        ]
      })
    ).toThrow("Transformative reaction swirl must declare an explicit damage element")
  })

  it.each(["anemo", "dendro", "geo", "physical"] as const)(
    "rejects %s as a Swirl damage element",
    (damageElement) => {
      expect(() =>
        evaluateRotation({
          duration: 1,
          enemy,
          events: [
            {
              canCrit: false,
              element: "anemo",
              id: `test.swirl.unsupported-${damageElement}`,
              ownerId: "test-owner",
              reaction: { bonus: 0, damageElement, kind: "swirl" },
              scaling: { coefficient: 0, stat: "attack" },
              stats: {
                attack: 1000,
                critDamage: 0,
                critRate: 0,
                damageBonus: 0,
                defense: 700,
                elementalMastery: 0,
                hp: 20_000,
                level: 90
              },
              time: 0
            }
          ]
        })
      ).toThrow("Swirl must declare a Cryo, Hydro, Pyro, or Electro damage element")
    }
  )

  it("applies only active timeline effect windows to matching rotation events", () => {
    const result = evaluateRotation({
      duration: 10,
      effects: [
        {
          end: 5,
          id: "bennett.burst",
          ownerId: "raiden",
          start: 1,
          stats: { attack: 1000 }
        }
      ],
      enemy: { ...enemy, resistance: 0 },
      events: [
        {
          canCrit: false,
          element: "electro",
          id: "raiden.before-buff",
          ownerId: "raiden",
          scaling: { coefficient: 1, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 0,
            critRate: 0,
            damageBonus: 0,
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 90
          },
          time: 0
        },
        {
          canCrit: false,
          element: "electro",
          id: "raiden.in-buff",
          ownerId: "raiden",
          scaling: { coefficient: 1, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 0,
            critRate: 0,
            damageBonus: 0,
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 90
          },
          time: 2
        }
      ]
    })

    expect(result.events[0]!.appliedEffectIds).toEqual([])
    expect(result.events[1]!.appliedEffectIds).toEqual(["bennett.burst"])
    expect(result.events[1]!.expectedDamage).toBeCloseTo(result.events[0]!.expectedDamage * 2)
  })

  it("uses element-specific enemy resistance when a rotation supplies it", () => {
    const stats = {
      attack: 1000,
      critDamage: 0,
      critRate: 0,
      damageBonus: 0,
      defense: 700,
      elementalMastery: 0,
      hp: 20_000,
      level: 90
    }
    const result = evaluateRotation({
      duration: 2,
      enemy: { ...enemy, resistances: { electro: 0.4 } },
      events: [
        {
          canCrit: false,
          element: "electro",
          id: "electro-hit",
          ownerId: "raiden",
          scaling: { coefficient: 1, stat: "attack" },
          stats,
          time: 0
        },
        {
          canCrit: false,
          element: "hydro",
          id: "hydro-hit",
          ownerId: "xingqiu",
          scaling: { coefficient: 1, stat: "attack" },
          stats,
          time: 1
        }
      ]
    })

    expect(result.events[0]!.trace.at(-1)).toMatchObject({ kind: "resistance", resistance: 0.4 })
    expect(result.events[1]!.trace.at(-1)).toMatchObject({ kind: "resistance", resistance: 0.1 })
    expect(result.events[0]!.expectedDamage).toBeLessThan(result.events[1]!.expectedDamage)
  })

  it("uses a declared stat snapshot time when a hit happens after a buff expires", () => {
    const result = evaluateRotation({
      duration: 10,
      effects: [{ end: 2, id: "bennett.burst", ownerId: "xiangling", start: 0, stats: { attack: 1000 } }],
      enemy: { ...enemy, resistance: 0 },
      events: [
        {
          canCrit: false,
          element: "pyro",
          id: "xiangling.pyronado.tick",
          ownerId: "xiangling",
          scaling: { coefficient: 1, stat: "attack" },
          statSnapshotTime: 1,
          stats: {
            attack: 1000,
            critDamage: 0,
            critRate: 0,
            damageBonus: 0,
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 90
          },
          time: 4
        }
      ]
    })

    expect(result.events[0]!.appliedEffectIds).toEqual(["bennett.burst"])
    expect(result.events[0]!.statSnapshotTime).toBe(1)
  })

  it("triggers reverse Vaporize on the one-zero-zero cadence of a standard ICD group", () => {
    const result = evaluateRotation({
      duration: 5,
      enemy: { ...enemy, resistance: 0 },
      events: [0, 0.25, 0.5, 0.75].map((time, index) => ({
        canCrit: false,
        elementalApplication: { icd: { groupId: "xiangling.pyronado", kind: "standard" } },
        element: "pyro",
        id: `xiangling.pyronado.${index + 1}`,
        ownerId: "xiangling",
        scaling: { coefficient: 1, stat: "attack" },
        stats: {
          attack: 1000,
          critDamage: 0,
          critRate: 0,
          damageBonus: 0,
          defense: 700,
          elementalMastery: 0,
          hp: 20_000,
          level: 90
        },
        time
      })),
      sustainedAuras: [{ element: "hydro", end: 5, id: "target.hydro", start: 0 }]
    })

    expect(
      result.events.map((event) =>
        event.trace.some(
          (entry) => entry.kind === "amplifying_reaction" && entry.reaction === "vaporize_reverse"
        )
          ? "vaporize_reverse"
          : "normal"
      )
    ).toEqual(["vaporize_reverse", "normal", "normal", "vaporize_reverse"])
    expect(result.events.map((event) => event.elementalApplication)).toEqual([
      { applied: true, auraElement: "hydro", auraId: "target.hydro", reaction: "vaporize_reverse" },
      { applied: false, auraElement: "hydro", auraId: "target.hydro" },
      { applied: false, auraElement: "hydro", auraId: "target.hydro" },
      { applied: true, auraElement: "hydro", auraId: "target.hydro", reaction: "vaporize_reverse" }
    ])
  })

  it("applies every hit when an elemental application declares no ICD", () => {
    const result = evaluateRotation({
      duration: 5,
      enemy: { ...enemy, resistance: 0 },
      events: [0, 0.25, 0.5].map((time, index) => ({
        canCrit: false,
        elementalApplication: { icd: { kind: "none" } },
        element: "pyro",
        id: `klee.normal.${index + 1}`,
        ownerId: "klee",
        scaling: { coefficient: 1, stat: "attack" },
        stats: {
          attack: 1000,
          critDamage: 0,
          critRate: 0,
          damageBonus: 0,
          defense: 700,
          elementalMastery: 0,
          hp: 20_000,
          level: 90
        },
        time
      })),
      sustainedAuras: [{ element: "hydro", end: 5, id: "target.hydro", start: 0 }]
    })

    expect(
      result.events.map((event) =>
        event.trace.some(
          (entry) => entry.kind === "amplifying_reaction" && entry.reaction === "vaporize_reverse"
        )
          ? "vaporize_reverse"
          : "normal"
      )
    ).toEqual(["vaporize_reverse", "vaporize_reverse", "vaporize_reverse"])
  })

  it("uses a nonzero reaction bonus declared on an event-level elemental application", () => {
    const result = evaluateRotation({
      duration: 1,
      enemy: { ...enemy, resistance: 0 },
      events: [
        {
          canCrit: false,
          elementalApplication: {
            icd: { kind: "none" },
            reactionBonus: 0.2
          },
          element: "pyro",
          id: "xiangling.pyronado.reaction-bonus",
          ownerId: "xiangling",
          scaling: { coefficient: 1, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 0,
            critRate: 0,
            damageBonus: 0,
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 90
          },
          time: 0
        }
      ],
      sustainedAuras: [{ element: "hydro", end: 1, id: "target.hydro", start: 0 }]
    })

    const reactionTrace = result.events[0]!.trace.find((entry) => entry.kind === "amplifying_reaction")
    expect(reactionTrace).toMatchObject({ bonus: 0.2, kind: "amplifying_reaction", reaction: "vaporize_reverse" })
    expect(reactionTrace?.kind === "amplifying_reaction" ? reactionTrace.multiplier : undefined).toBeCloseTo(1.8)
  })

  it("adds a typed reaction bonus only when an event-level aura resolves to Vaporize or Melt", () => {
    const createEvent = (element: "electro" | "pyro") => ({
      amplifyingReactionBonus: 0.15,
      canCrit: false,
      elementalApplication: { icd: { kind: "none" as const } },
      element,
      id: `test.${element}.reaction-bonus`,
      ownerId: "test-owner",
      scaling: { coefficient: 1, stat: "attack" as const },
      stats: {
        attack: 1000,
        critDamage: 0,
        critRate: 0,
        damageBonus: 0,
        defense: 700,
        elementalMastery: 0,
        hp: 20_000,
        level: 90
      },
      time: 0
    })
    const vaporize = evaluateRotation({
      duration: 1,
      enemy: { ...enemy, resistance: 0 },
      events: [createEvent("pyro")],
      sustainedAuras: [{ element: "hydro", end: 1, id: "target.hydro", start: 0 }]
    })
    const spread = evaluateRotation({
      duration: 1,
      enemy: { ...enemy, resistance: 0 },
      events: [createEvent("electro")],
      sustainedAuras: [{ element: "quicken", end: 1, id: "target.quicken", start: 0 }]
    })
    const vaporizeTrace = vaporize.events[0]!.trace.find((entry) => entry.kind === "amplifying_reaction")
    const spreadTrace = spread.events[0]!.trace.find((entry) => entry.kind === "additive_reaction")

    expect(vaporizeTrace).toMatchObject({ bonus: 0.15, reaction: "vaporize_reverse" })
    expect(vaporizeTrace?.kind === "amplifying_reaction" ? vaporizeTrace.multiplier : undefined).toBeCloseTo(1.725)
    expect(spreadTrace).toMatchObject({ bonus: 0, reaction: "aggravate" })
  })

  it("resets standard ICD at exactly 2.5 seconds", () => {
    const result = evaluateRotation({
      duration: 3,
      enemy: { ...enemy, resistance: 0 },
      events: [0, 1, 2.5].map((time, index) => ({
        canCrit: false,
        elementalApplication: { icd: { groupId: "xiangling.pyronado", kind: "standard" } },
        element: "pyro",
        id: `xiangling.pyronado.timeout.${index + 1}`,
        ownerId: "xiangling",
        scaling: { coefficient: 1, stat: "attack" },
        stats: {
          attack: 1000,
          critDamage: 0,
          critRate: 0,
          damageBonus: 0,
          defense: 700,
          elementalMastery: 0,
          hp: 20_000,
          level: 90
        },
        time
      })),
      sustainedAuras: [{ element: "hydro", end: 3, id: "target.hydro", start: 0 }]
    })

    expect(result.events.map((event) => event.elementalApplication?.applied)).toEqual([true, false, true])
    expect(result.events.map((event) => event.elementalApplication?.reaction)).toEqual([
      "vaporize_reverse",
      undefined,
      "vaporize_reverse"
    ])
  })

  it("isolates standard ICD state by both owner and group", () => {
    const result = evaluateRotation({
      duration: 1,
      enemy: { ...enemy, resistance: 0 },
      events: (
        [
          ["xiangling.pyronado.first", "xiangling", "pyronado", 0],
          ["other.pyronado.first", "other", "pyronado", 0.1],
          ["xiangling.guoba.first", "xiangling", "guoba", 0.2],
          ["xiangling.pyronado.blocked", "xiangling", "pyronado", 0.3]
        ] as const
      ).map(([id, ownerId, groupId, time]) => ({
        canCrit: false,
        elementalApplication: { icd: { groupId, kind: "standard" as const } },
        element: "pyro" as const,
        id,
        ownerId,
        scaling: { coefficient: 1, stat: "attack" as const },
        stats: {
          attack: 1000,
          critDamage: 0,
          critRate: 0,
          damageBonus: 0,
          defense: 700,
          elementalMastery: 0,
          hp: 20_000,
          level: 90
        },
        time
      })),
      sustainedAuras: [{ element: "hydro", end: 1, id: "target.hydro", start: 0 }]
    })

    expect(result.events.map((event) => event.elementalApplication?.applied)).toEqual([true, true, true, false])
  })

  it.each([
    ["Hydro on Pyro", "hydro", "pyro", "vaporize_forward", 2],
    ["Pyro on Cryo", "pyro", "cryo", "melt_forward", 2],
    ["Cryo on Pyro", "cryo", "pyro", "melt_reverse", 1.5],
    ["Dendro on Quicken", "dendro", "quicken", "spread", undefined],
    ["Electro on Quicken", "electro", "quicken", "aggravate", undefined]
  ] as const)("derives %s from a sustained aura", (_label, element, auraElement, reaction, expectedMultiplier) => {
    const result = evaluateRotation({
      duration: 1,
      enemy: { ...enemy, resistance: 0 },
      events: [
        {
          canCrit: false,
          elementalApplication: { icd: { kind: "none" } },
          element,
          id: `test.${element}.application`,
          ownerId: "test-owner",
          scaling: { coefficient: 1, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 0,
            critRate: 0,
            damageBonus: 0,
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 90
          },
          time: 0
        }
      ],
      sustainedAuras: [{ element: auraElement, end: 1, id: `target.${auraElement}`, start: 0 }]
    })

    expect(result.events[0]!.elementalApplication).toMatchObject({ applied: true, reaction })
    if (expectedMultiplier !== undefined) {
      expect(result.events[0]!.trace).toContainEqual(
        expect.objectContaining({ kind: "amplifying_reaction", multiplier: expectedMultiplier, reaction })
      )
    }
  })

  it("rejects an elemental application pairing that needs an unimplemented reaction", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [
          {
            canCrit: false,
            elementalApplication: { icd: { kind: "none" } },
            element: "electro",
            id: "fischl.skill.unsupported-electro-charged",
            ownerId: "fischl",
            scaling: { coefficient: 1, stat: "attack" },
            stats: {
              attack: 1000,
              critDamage: 0,
              critRate: 0,
              damageBonus: 0,
              defense: 700,
              elementalMastery: 0,
              hp: 20_000,
              level: 90
            },
            time: 0
          }
        ],
        sustainedAuras: [{ element: "hydro", end: 1, id: "target.hydro", start: 0 }]
      })
    ).toThrow("Elemental application electro on sustained hydro aura requires an unimplemented reaction")
  })

  it("rejects an elemental application event that combines multiple hits", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [
          {
            canCrit: false,
            elementalApplication: { icd: { kind: "none" } },
            element: "pyro",
            hitCount: 2,
            id: "xiangling.pyronado.ambiguous-multi-hit",
            ownerId: "xiangling",
            scaling: { coefficient: 1, stat: "attack" },
            stats: {
              attack: 1000,
              critDamage: 0,
              critRate: 0,
              damageBonus: 0,
              defense: 700,
              elementalMastery: 0,
              hp: 20_000,
              level: 90
            },
            time: 0
          }
        ]
      })
    ).toThrow("Elemental application events must represent exactly one hit")
  })

  it("rejects a legacy reaction alongside an event-level elemental application", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [
          {
            canCrit: false,
            elementalApplication: { icd: { kind: "none" } },
            element: "pyro",
            id: "xiangling.pyronado.ambiguous-reaction",
            ownerId: "xiangling",
            reaction: { bonus: 0, kind: "vaporize_reverse" },
            scaling: { coefficient: 1, stat: "attack" },
            stats: {
              attack: 1000,
              critDamage: 0,
              critRate: 0,
              damageBonus: 0,
              defense: 700,
              elementalMastery: 0,
              hp: 20_000,
              level: 90
            },
            time: 0
          }
        ]
      })
    ).toThrow("An elemental application event cannot declare a legacy reaction")
  })

  it("rejects a non-finite reaction bonus on an event-level elemental application", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [
          {
            canCrit: false,
            elementalApplication: { icd: { kind: "none" }, reactionBonus: Number.NaN },
            element: "pyro",
            id: "xiangling.pyronado.invalid-reaction-bonus",
            ownerId: "xiangling",
            scaling: { coefficient: 1, stat: "attack" },
            stats: {
              attack: 1000,
              critDamage: 0,
              critRate: 0,
              damageBonus: 0,
              defense: 700,
              elementalMastery: 0,
              hp: 20_000,
              level: 90
            },
            time: 0
          }
        ]
      })
    ).toThrow("An elemental application reaction bonus must be finite")
  })

  it("rejects an empty standard ICD group", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [
          {
            canCrit: false,
            elementalApplication: { icd: { groupId: "", kind: "standard" } },
            element: "pyro",
            id: "xiangling.pyronado.empty-group",
            ownerId: "xiangling",
            scaling: { coefficient: 1, stat: "attack" },
            stats: {
              attack: 1000,
              critDamage: 0,
              critRate: 0,
              damageBonus: 0,
              defense: 700,
              elementalMastery: 0,
              hp: 20_000,
              level: 90
            },
            time: 0
          }
        ]
      })
    ).toThrow("A standard elemental application must declare a non-empty ICD group")
  })

  it("rejects a sustained aura with non-finite timing", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [],
        sustainedAuras: [{ element: "hydro", end: 1, id: "target.invalid", start: Number.NaN }]
      })
    ).toThrow("Sustained aura target.invalid must have finite start and end times")
  })

  it("rejects a sustained aura outside the declared rotation duration", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [],
        sustainedAuras: [{ element: "hydro", end: 1.1, id: "target.outside", start: 0 }]
      })
    ).toThrow("Sustained aura target.outside must be a non-empty window within the declared rotation duration")
  })

  it("rejects a sustained aura whose element is outside the maintained aura model", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [],
        sustainedAuras: [
          { element: "electro" as unknown as AuraElement, end: 1, id: "target.electro", start: 0 }
        ]
      })
    ).toThrow("Sustained aura target.electro uses unsupported element electro")
  })

  it("rejects overlapping sustained aura windows", () => {
    expect(() =>
      evaluateRotation({
        duration: 2,
        enemy,
        events: [],
        sustainedAuras: [
          { element: "hydro", end: 1, id: "target.hydro", start: 0 },
          { element: "pyro", end: 1.5, id: "target.pyro", start: 0.5 }
        ]
      })
    ).toThrow("Sustained aura windows target.hydro and target.pyro cannot overlap")
  })

  it("rejects a stat snapshot that happens after its damage event", () => {
    expect(() =>
      evaluateRotation({
        duration: 2,
        enemy,
        events: [
          {
            canCrit: false,
            element: "electro",
            id: "invalid-snapshot",
            ownerId: "raiden",
            scaling: { coefficient: 1, stat: "attack" },
            statSnapshotTime: 2,
            stats: {
              attack: 1000,
              critDamage: 0,
              critRate: 0,
              damageBonus: 0,
              defense: 700,
              elementalMastery: 0,
              hp: 20_000,
              level: 90
            },
            time: 1
          }
        ]
      })
    ).toThrow("cannot snapshot stats after its damage event")
  })

  it("overrides a tagged normal attack at its hit time and selects its final element bonuses", () => {
    const result = evaluateRotation({
      duration: 1,
      elementOverrides: [
        {
          element: "pyro",
          end: 0.75,
          id: "bennett.c6",
          ownerId: "test.melee",
          start: 0.25,
          target: "normal_attack"
        }
      ],
      enemy: {
        ...enemy,
        resistance: 0,
        resistances: { physical: 0.5, pyro: 0.1 }
      },
      events: [
        {
          canCrit: false,
          element: "physical",
          elementOverrideTarget: "normal_attack",
          id: "test.melee.normal-1",
          ownerId: "test.melee",
          scaling: { coefficient: 1, stat: "attack" },
          stats: {
            attack: 1000,
            critDamage: 0,
            critRate: 0,
            damageBonus: 0,
            damageBonusByElement: { physical: 0, pyro: 0.5 },
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 90
          },
          time: 0.5
        }
      ]
    } as never)

    const event = result.events[0]!
    expect(event.element).toBe("pyro")
    expect(event.elementOverride).toEqual({
      baseElement: "physical",
      element: "pyro",
      id: "bennett.c6"
    })
    expect(event.trace.find((entry) => entry.kind === "damage_bonus")).toMatchObject({ bonus: 0.5 })
    expect(event.trace.at(-1)).toMatchObject({ element: "pyro", kind: "resistance", resistance: 0.1 })
  })

  it("applies an infused normal attack with ICD without advancing that ICD outside the override window", () => {
    const result = evaluateRotation({
      duration: 1,
      elementOverrides: [
        {
          element: "pyro",
          end: 1,
          id: "bennett.c6",
          ownerId: "test.melee",
          start: 0.2,
          target: "normal_attack"
        }
      ],
      enemy: { ...enemy, resistance: 0 },
      events: [0.1, 0.3, 0.5, 0.7, 0.9].map((time, index) => ({
        canCrit: false,
        elementalApplication: {
          activation: "while_element_overridden",
          icd: { groupId: "test.melee.normal", kind: "standard" }
        },
        element: "physical",
        elementOverrideTarget: "normal_attack",
        id: `test.melee.normal-${index + 1}`,
        ownerId: "test.melee",
        scaling: { coefficient: 1, stat: "attack" },
        stats: {
          attack: 1000,
          critDamage: 0,
          critRate: 0,
          damageBonus: 0,
          defense: 700,
          elementalMastery: 0,
          hp: 20_000,
          level: 90
        },
        time
      })),
      sustainedAuras: [{ element: "hydro", end: 1, id: "target.hydro", start: 0 }]
    } as never)

    expect(result.events.map((event) => event.element)).toEqual(["physical", "pyro", "pyro", "pyro", "pyro"])
    expect(result.events.map((event) => event.elementalApplication)).toEqual([
      { applied: false },
      { applied: true, auraElement: "hydro", auraId: "target.hydro", reaction: "vaporize_reverse" },
      { applied: false, auraElement: "hydro", auraId: "target.hydro" },
      { applied: false, auraElement: "hydro", auraId: "target.hydro" },
      { applied: true, auraElement: "hydro", auraId: "target.hydro", reaction: "vaporize_reverse" }
    ])
    expect(result.events[1]!.trace.some((entry) => entry.kind === "amplifying_reaction")).toBe(true)
  })

  it("keeps an element-specific bonus when the normal attack snapshots a stat window before its infused hit", () => {
    const result = evaluateRotation({
      duration: 1,
      effects: [
        {
          end: 0.5,
          id: "test.snapshot-damage-bonus",
          ownerId: "test.melee",
          start: 0.2,
          stats: { damageBonus: 0.2 }
        }
      ],
      elementOverrides: [
        {
          element: "pyro",
          end: 0.8,
          id: "bennett.c6",
          ownerId: "test.melee",
          start: 0.6,
          target: "normal_attack"
        }
      ],
      enemy: { ...enemy, resistance: 0 },
      events: [
        {
          canCrit: false,
          element: "physical",
          elementOverrideTarget: "normal_attack",
          id: "test.melee.snapshotted-normal",
          ownerId: "test.melee",
          scaling: { coefficient: 1, stat: "attack" },
          statSnapshotTime: 0.4,
          stats: {
            attack: 1000,
            critDamage: 0,
            critRate: 0,
            damageBonus: 0,
            damageBonusByElement: { pyro: 0.5 },
            defense: 700,
            elementalMastery: 0,
            hp: 20_000,
            level: 90
          },
          time: 0.7
        }
      ]
    })

    const event = result.events[0]!
    expect(event.element).toBe("pyro")
    expect(event.appliedEffectIds).toEqual(["test.snapshot-damage-bonus"])
    expect(event.trace.find((entry) => entry.kind === "damage_bonus")).toMatchObject({ bonus: 0.7 })
  })

  it("rejects an elemental override window with an unsupported target", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        elementOverrides: [
          {
            element: "pyro",
            end: 1,
            id: "test.invalid-target",
            start: 0,
            target: "charged_attack"
          }
        ],
        enemy,
        events: []
      } as never)
    ).toThrow("Element override test.invalid-target must target normal_attack")
  })

  it.each([
    ["non-finite", Number.NaN, 1],
    ["empty", 0.5, 0.5],
    ["outside", 0, 1.1]
  ])("rejects a %s elemental override window", (_label, start, end) => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        elementOverrides: [
          {
            element: "pyro",
            end,
            id: "test.invalid-window",
            start,
            target: "normal_attack"
          }
        ],
        enemy,
        events: []
      })
    ).toThrow("Element override test.invalid-window must be a non-empty window within the declared rotation duration")
  })

  it("rejects physical as an elemental override result", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        elementOverrides: [
          {
            element: "physical",
            end: 1,
            id: "test.physical-override",
            start: 0,
            target: "normal_attack"
          }
        ],
        enemy,
        events: []
      } as never)
    ).toThrow("Element override test.physical-override must use a non-physical element")
  })

  it("rejects an unsupported elemental override result", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        elementOverrides: [
          {
            element: "void",
            end: 1,
            id: "test.unsupported-override",
            start: 0,
            target: "normal_attack"
          }
        ],
        enemy,
        events: []
      } as never)
    ).toThrow("Element override test.unsupported-override uses unsupported element void")
  })

  it("rejects overlapping elemental override windows that can affect the same normal attack", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        elementOverrides: [
          {
            element: "pyro",
            end: 0.7,
            id: "test.pyro",
            ownerId: "test.melee",
            start: 0,
            target: "normal_attack"
          },
          {
            element: "hydro",
            end: 1,
            id: "test.hydro",
            ownerId: "test.melee",
            start: 0.5,
            target: "normal_attack"
          }
        ],
        enemy,
        events: []
      })
    ).toThrow("Element override windows test.pyro and test.hydro cannot overlap for the same target owner")
  })

  it("rejects an event with an unsupported elemental override target", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [
          {
            canCrit: false,
            element: "physical",
            elementOverrideTarget: "charged_attack",
            id: "test.invalid-event-target",
            ownerId: "test.melee",
            scaling: { coefficient: 1, stat: "attack" },
            stats: {
              attack: 1000,
              critDamage: 0,
              critRate: 0,
              damageBonus: 0,
              defense: 700,
              elementalMastery: 0,
              hp: 20_000,
              level: 90
            },
            time: 0
          }
        ]
      } as never)
    ).toThrow("Event test.invalid-event-target must target normal_attack for an elemental override")
  })

  it("rejects an unsupported elemental application activation", () => {
    expect(() =>
      evaluateRotation({
        duration: 1,
        enemy,
        events: [
          {
            canCrit: false,
            elementalApplication: { activation: "sometimes", icd: { kind: "none" } },
            element: "pyro",
            id: "test.invalid-activation",
            ownerId: "test.melee",
            scaling: { coefficient: 1, stat: "attack" },
            stats: {
              attack: 1000,
              critDamage: 0,
              critRate: 0,
              damageBonus: 0,
              defense: 700,
              elementalMastery: 0,
              hp: 20_000,
              level: 90
            },
            time: 0
          }
        ]
      } as never)
    ).toThrow("Elemental application for event test.invalid-activation must use a supported activation")
  })
})
