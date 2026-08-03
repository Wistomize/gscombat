import { fileURLToPath } from "node:url"

export const DEFAULT_GAME_DATA_VERSION = "6.7"

export const DEFAULT_GAME_DATA_PATH = fileURLToPath(
  new URL(`../snapshots/${DEFAULT_GAME_DATA_VERSION}/game-data.sqlite`, import.meta.url)
)
