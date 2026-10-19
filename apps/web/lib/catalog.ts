import { createCatalogResponse } from "@gscombat/content/catalog"
import type { CatalogResponse } from "@gscombat/contracts"

/** Constructed by server routes at build/render time; clients receive only serializable props. */
export const webCatalog: CatalogResponse = createCatalogResponse()
