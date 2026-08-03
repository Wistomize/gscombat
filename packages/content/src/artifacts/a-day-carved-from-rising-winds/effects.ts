import type { CombatActionEffect } from "../../combat/types.js"

export const A_DAY_CARVED_FROM_RISING_WINDS_ATTACK_PERCENT = 0.18
export const A_DAY_CARVED_FROM_RISING_WINDS_AFTER_HIT_ATTACK_PERCENT = 0.25
export const A_DAY_CARVED_FROM_RISING_WINDS_COMPLETED_TRIAL_CRIT_RATE = 0.2

/** Typed selected current-state contributions of A Day Carved from Rising Winds. */
export const aDayCarvedFromRisingWindsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.a-day-carved-from-rising-winds.2pc.attack-percent",
    label: "风起之日 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "ADayCarvedFromRisingWinds" },
    target: "attackPercent",
    value: { kind: "fixed", value: A_DAY_CARVED_FROM_RISING_WINDS_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "artifact.a-day-carved-from-rising-winds.4pc.after-hit.attack-percent",
    label: "风起之日 · 四件套（攻击命中后6秒内；当前动作前已生效）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ADayCarvedFromRisingWinds" },
    target: "attackPercent",
    value: { kind: "fixed", value: A_DAY_CARVED_FROM_RISING_WINDS_AFTER_HIT_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "artifact.a-day-carved-from-rising-winds.4pc.completed-magical-trial.crit-rate",
    label: "风起之日 · 四件套（已完成魔女的课业且通过考验）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ADayCarvedFromRisingWinds" },
    target: "critRate",
    value: { kind: "fixed", value: A_DAY_CARVED_FROM_RISING_WINDS_COMPLETED_TRIAL_CRIT_RATE }
  }
]
