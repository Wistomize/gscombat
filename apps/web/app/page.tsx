import { raidenNationalBuiltinScenario } from "@gscombat/content"

import { ConfigurationWorkspace } from "./configuration-workspace"
import { webCatalog } from "../lib/catalog"

export default function HomePage() {
  return (
    <ConfigurationWorkspace
      catalog={webCatalog}
      cloudEnabled
      initialScenario={raidenNationalBuiltinScenario}
    />
  )
}
