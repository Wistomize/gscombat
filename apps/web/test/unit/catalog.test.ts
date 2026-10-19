import { describe, expect, it } from "vitest"
import { createCatalogResponse } from "@gscombat/content/catalog"

import { webCatalog } from "../../lib/catalog"

describe("startup catalog", () => {
  it("stays within the server-rendered page budget and excludes lazy action effects", () => {
    expect(webCatalog).toEqual(createCatalogResponse())
    expect(Buffer.byteLength(JSON.stringify(webCatalog), "utf8")).toBeLessThan(300_000)
    expect(
      webCatalog.characters.every((character) =>
        character.primaryActions.every((action) => !("scenarioEffects" in action))
      )
    ).toBe(true)
  })
})
