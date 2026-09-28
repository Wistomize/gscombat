import { Value } from "typebox/value"
import { expect, it } from "vitest"
import { ArtifactComparisonRequestSchema, ArtifactCandidateComparisonRequestSchema, ArtifactComparisonResponseSchema, ArtifactComparisonResultSchema } from "./equipment-comparison.js"

it("keeps selection optional and independent from the changed candidate", () => {
  const selection = ArtifactComparisonRequestSchema.properties.selectedCandidateId
  expect(Value.Check(selection, "four:EmblemOfSeveredFate")).toBe(true)
  for (const invalid of ["", 42, "x".repeat(181)]) expect(Value.Check(selection, invalid)).toBe(false)
  expect(ArtifactComparisonRequestSchema.required).not.toContain("selectedCandidateId")
  expect(ArtifactCandidateComparisonRequestSchema.required).toContain("candidateId")
  expect(ArtifactCandidateComparisonRequestSchema.required).not.toContain("selectedCandidateId")
  expect(ArtifactComparisonResponseSchema.required).not.toContain("selectedCandidate")
  expect(Value.Check(ArtifactComparisonResponseSchema.properties.selectableFourPieceCandidates,
    [{ id: "four:EmblemOfSeveredFate", label: "绝缘之旗印 · 四件套" }])).toBe(true)
  const slots = ArtifactComparisonResultSchema.properties.fourStarSlots
  expect(ArtifactComparisonResultSchema.required).not.toContain("fourStarSlots")
  expect(Value.Check(slots, ["flower", "plume"])).toBe(true)
  expect(Value.Check(slots, ["flower", "flower"])).toBe(false)
  expect(Value.Check(slots, ["unknown"])).toBe(false)
})
