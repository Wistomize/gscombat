import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { COMMIT, hash } from "./input.js"

// Explicit maintenance command: prints a proposed lock; it never changes the current source.
const [checkout, baseline, part = "0"] = process.argv.slice(2)
if (!checkout || !baseline) throw new Error("Usage: prepare-lock CHECKOUT BASELINE [PART]")
if (execFileSync("git", ["-C", checkout, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== COMMIT) {
  throw new Error("Checkout is not the pinned commit")
}
if (execFileSync("git", ["-C", checkout, "status", "--porcelain"], { encoding: "utf8" }).trim()) {
  throw new Error("Upstream checkout is dirty")
}
const paths = ["stats/characters", "stats/weapons", "stats/talents", "curve/characters", "curve/weapons",
  "version/characters", "version/weapons", "version/artifacts"]
for (const type of ["characters", "weapons", "artifacts", "talents", "constellations"]) {
  for (const file of readdirSync(resolve(checkout, `src/data/ChineseSimplified/${type}`)).sort()) {
    paths.push(`ChineseSimplified/${type}/${file.replace(/\.json$/, "")}`)
  }
}
const files = Object.fromEntries(paths.sort().slice(Number(part) * 200, (Number(part) + 1) * 200)
  .map(path => [`src/data/${path}.json`, hash(readFileSync(resolve(checkout, `src/data/${path}.json`)))]))
console.log(JSON.stringify({ commit: COMMIT, committedAt: "2026-09-21T20:39:46Z", version: "7.1",
  baselineSha256: hash(readFileSync(baseline)), files }))
