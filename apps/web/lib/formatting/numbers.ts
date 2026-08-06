/** Parses a numeric form value and falls back when the input is not finite. */
export function numberValue(value: string, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

/** Formats a combat value with one decimal place for the Chinese UI. */
export function formatNumber(value: number): string {
  return value.toLocaleString("zh-CN", { maximumFractionDigits: 1, minimumFractionDigits: 1 })
}

/** Formats an expected-damage value. */
export function formatDamage(value: number): string {
  return formatNumber(value)
}

/** Formats a signed ratio with one decimal percentage place. */
export function formatPercent(value: number): string {
  const prefix = value > 0 ? "+" : ""
  return `${prefix}${(value * 100).toFixed(1)}%`
}

/** Formats a signed marginal-gain ratio with two decimal percentage places. */
export function formatMarginalPercent(value: number): string {
  const prefix = value > 0 ? "+" : ""
  return `${prefix}${(value * 100).toFixed(2)}%`
}

/** Formats a number used inside a formula trace. */
export function formatFormulaNumber(value: number): string {
  return formatNumber(value)
}

/** Formats a ratio used inside a formula trace. */
export function formatFormulaPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
