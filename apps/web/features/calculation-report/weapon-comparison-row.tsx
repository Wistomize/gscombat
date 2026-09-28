"use client"

import type { AnalysisResponse } from "@gscombat/contracts"
import { useEffect, useRef, useState } from "react"
import { WeaponIcon } from "../../components/ui/visual-icons"
import { formatDamage, formatPercent, numberValue } from "../../lib/formatting/numbers"
import type { WeaponRequestState } from "../calculation-workspace/use-incremental-analysis"

type Weapon = AnalysisResponse["analysis"]["weapons"][number]

/** Keeps controls aligned and identifies the accepted result even when its rank changes. */
export function WeaponComparisonRow({ weapon, index, state, onChange }: {
  readonly weapon: Weapon
  readonly index: number
  readonly state: WeaponRequestState | undefined
  readonly onChange: (weaponId: string, refinement: number, choices?: Record<string, string>) => void
}) {
  const row = useRef<HTMLDivElement>(null)
  const previous = useRef(weapon)
  const revision = useRef(0)
  const [highlight, setHighlight] = useState(0)

  useEffect(() => {
    if (previous.current === weapon) return
    previous.current = weapon
    setHighlight(++revision.current)
    // Preserve context for the actively edited row; don't steal focus from another concurrent edit.
    if (row.current?.contains(document.activeElement)) {
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      row.current.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: reducedMotion ? "auto" : "smooth" })
    }
    const timer = window.setTimeout(() => setHighlight(0), 3200)
    return () => window.clearTimeout(timer)
  }, [weapon])

  return <div ref={row} className="weaponRow" data-updated={highlight ? "true" : undefined}
    aria-busy={state?.pending !== undefined}>
    {highlight ? <i key={highlight} className="weaponUpdateGlow" aria-hidden="true" /> : null}
    <span className="rankNumber">{String(index + 1).padStart(2, "0")}</span>
    <WeaponIcon label={weapon.label} weaponId={weapon.weaponId} />
    <div className="weaponIdentity"><strong>{weapon.label}</strong>
      <small>{weapon.rarity}★ · R{weapon.refinement}{weapon.level && weapon.level !== 90 ? ` · ${weapon.level}级` : ""}</small>
      {state?.pending !== undefined ? <small role="status">正在更新，当前显示上次结果</small> : null}
      {state?.error ? <small role="alert">{state.error} <button type="button"
        onClick={() => onChange(weapon.weaponId, state.retryRefinement ?? weapon.refinement, state.retryChoices)}>重试</button></small> : null}
      {highlight ? <small className="weaponUpdateStatus" role="status">已更新 · 第 {index + 1} 名</small> : null}
    </div>
    <div className="weaponControls">
      <div className="weaponChoices">
        {weapon.choiceGroups?.map((group) => {
          const value = state?.pendingChoices?.[group.id] ?? weapon.choices?.[group.id] ?? group.defaultVariant
          return <label key={group.id} className="weaponChoice">
            <select aria-label={`${weapon.label}：${group.label}`}
              title={`${group.label}：${group.options.find(option => option.id === value)?.label ?? value}`} value={value}
              onChange={(event) => onChange(weapon.weaponId, state?.pending ?? weapon.refinement,
                { ...weapon.choices, ...state?.pendingChoices, [group.id]: event.target.value })}>
              {group.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
        })}
      </div>
      <label className="weaponRefinement"><span>精炼</span><select aria-label={`${weapon.label}精炼等级`}
        disabled={weapon.legalRefinements?.length === 1} value={state?.pending ?? weapon.refinement}
        onChange={(event) => onChange(weapon.weaponId, numberValue(event.target.value, 1), state?.pendingChoices ?? weapon.choices)}>
        {(weapon.legalRefinements ?? [1, 2, 3, 4, 5]).map((refinement) => <option key={refinement} value={refinement}>R{refinement}</option>)}
      </select></label>
    </div>
    <span>{formatDamage(weapon.expectedDamage)}</span>
    <b className={weapon.gainRatio >= 0 ? "positive" : "negative"}>{formatPercent(weapon.gainRatio)}</b>
  </div>
}
