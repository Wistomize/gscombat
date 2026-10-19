export type AnalysisInputErrorCode =
  | "invalid_build"
  | "invalid_metric"
  | "invalid_metric_context"
  | "invalid_field_presence"
  | "invalid_action_parameters"
  | "invalid_effect_selection"
  | "invalid_weapon_choice"
  | "invalid_artifact_choice"
  | "game_data_version_mismatch"

/** Identifies caller-correctable analysis input without coupling the domain library to HTTP. */
export class AnalysisInputError extends Error {
  public readonly code: AnalysisInputErrorCode

  public constructor(code: AnalysisInputErrorCode, message: string) {
    super(message)
    this.name = "AnalysisInputError"
    this.code = code
  }
}
