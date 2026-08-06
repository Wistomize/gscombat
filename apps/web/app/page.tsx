import { raidenNationalBuiltinScenario } from "@gscombat/content"

import { webCatalog } from "../lib/catalog"
import { ConfigurationWorkspace } from "../features/configuration-workspace/configuration-workspace"

export default function HomePage() {
  return (
    <ConfigurationWorkspace
      catalog={webCatalog}
      cloudEnabled
      initialScenario={raidenNationalBuiltinScenario}
    />
  )
}
