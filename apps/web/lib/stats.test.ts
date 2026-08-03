import { describe, expect, it } from "vitest"

import { fromDisplayStatValue, toDisplayStatValue } from "./stats.js"

describe("artifact stat display values", () => {
  it("shows ratio stats as user-facing percentages", () => {
    expect(toDisplayStatValue("crit_rate", 0.311)).toBeCloseTo(31.1)
    expect(toDisplayStatValue("crit_damage", 0.4660000000001)).toBe(46.6)
  })

  it("stores user-facing percentages as ratios", () => {
    expect(fromDisplayStatValue("energy_recharge", 51.8)).toBeCloseTo(0.518)
  })

  it("leaves flat stats unchanged", () => {
    expect(toDisplayStatValue("atk", 311)).toBe(311)
    expect(fromDisplayStatValue("elemental_mastery", 23)).toBe(23)
  })
})
