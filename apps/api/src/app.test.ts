import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "./app.js"

const app = buildApp()

afterAll(async () => {
  await app.close()
})

describe("API", () => {
  it("reports health", async () => {
    const response = await app.inject({ method: "GET", url: "/health" })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: "ok" })
  })

  it("evaluates the versioned Raiden National foundation preset", async () => {
    const response = await app.inject({
      method: "POST",
      payload: { presetId: "raiden-national.initial-slash" },
      url: "/v1/evaluations"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      contentVersion: "foundation-1",
      engineVersion: "foundation-1",
      presetVersion: "foundation-1"
    })
    expect(response.json().result.expectedDamage).toBeGreaterThan(0)
  })
})
