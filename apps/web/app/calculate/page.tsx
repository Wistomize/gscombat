import { raidenNationalBuiltinScenario } from "@gscombat/content"

import { TeamCalculationWorkspace } from "../../features/calculation-workspace/calculation-workspace"
import { webCatalog } from "../../lib/catalog"

export default function CalculatePage() {
  return <TeamCalculationWorkspace catalog={webCatalog} initialScenario={raidenNationalBuiltinScenario} />
}
