import { raidenNationalBuiltinScenario } from "@gscombat/content"

import { webCatalog } from "../../lib/catalog"
import { TeamCalculationWorkspace } from "../workbench"

export default function CalculatePage() {
  return <TeamCalculationWorkspace catalog={webCatalog} initialScenario={raidenNationalBuiltinScenario} />
}
