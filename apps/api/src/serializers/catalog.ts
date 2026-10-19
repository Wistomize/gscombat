import { createCatalogResponse } from "@gscombat/content/catalog"
import type { CatalogResponse } from "@gscombat/contracts"

/** Adapts the shared Content projection to the public API without a second mapping. */
export function serializeCatalogResponse(): CatalogResponse {
  return createCatalogResponse()
}
