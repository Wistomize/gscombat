import { evaluateExpectedDamage } from "@gscombat/calculator"
import { describe, expect, it } from "vitest"

import { createRaidenNationalFoundationInput } from "./preset.js"

describe("Raiden National foundation playstyle", () => {
  it("composes character and rule content and responds to an attack intervention", () => {
    const baseline = createRaidenNationalFoundationInput()
    const candidate = createRaidenNationalFoundationInput({ additionalAttackPercent: 0.05 })

    expect(baseline.metadata.dataStatus).toBe("illustrative")
    expect(baseline.metadata.memberIds).toEqual(["raiden", "xiangling", "xingqiu", "bennett"])
    expect(evaluateExpectedDamage(candidate.input).expectedDamage).toBeGreaterThan(
      evaluateExpectedDamage(baseline.input).expectedDamage
    )
  })
})
