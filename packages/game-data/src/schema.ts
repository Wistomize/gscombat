export const GAME_DATA_SCHEMA_VERSION = 2

export const GAME_DATA_SCHEMA = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  ) STRICT;

  CREATE TABLE characters (
    id TEXT PRIMARY KEY,
    element TEXT,
    region TEXT,
    weapon_type TEXT NOT NULL,
    rarity INTEGER NOT NULL,
    birthday_month INTEGER,
    birthday_day INTEGER,
    raw_json TEXT NOT NULL
  ) STRICT;

  CREATE TABLE character_stat_curves (
    character_id TEXT NOT NULL REFERENCES characters(id),
    stat TEXT NOT NULL,
    base_value REAL NOT NULL,
    curve_id TEXT NOT NULL,
    PRIMARY KEY (character_id, stat)
  ) STRICT, WITHOUT ROWID;

  CREATE TABLE character_ascension_bonuses (
    character_id TEXT NOT NULL REFERENCES characters(id),
    stat TEXT NOT NULL,
    ascension INTEGER NOT NULL,
    value REAL NOT NULL,
    PRIMARY KEY (character_id, stat, ascension)
  ) STRICT, WITHOUT ROWID;

  CREATE TABLE character_skill_parameters (
    character_id TEXT NOT NULL,
    skill TEXT NOT NULL,
    parameter_index INTEGER NOT NULL,
    talent_level INTEGER NOT NULL,
    value REAL NOT NULL,
    PRIMARY KEY (character_id, skill, parameter_index, talent_level)
  ) STRICT, WITHOUT ROWID;

  CREATE INDEX character_skill_parameters_lookup
    ON character_skill_parameters(character_id, skill, talent_level);

  CREATE TABLE character_skill_parameter_groups (
    character_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    values_json TEXT NOT NULL,
    PRIMARY KEY (character_id, group_id)
  ) STRICT, WITHOUT ROWID;

  CREATE TABLE character_level_curves (
    curve_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    multiplier REAL NOT NULL,
    PRIMARY KEY (curve_id, level)
  ) STRICT, WITHOUT ROWID;

  CREATE TABLE weapons (
    id TEXT PRIMARY KEY,
    weapon_type TEXT NOT NULL,
    rarity INTEGER NOT NULL,
    raw_json TEXT NOT NULL
  ) STRICT;

  CREATE TABLE weapon_stat_curves (
    weapon_id TEXT NOT NULL REFERENCES weapons(id),
    stat TEXT NOT NULL,
    base_value REAL NOT NULL,
    curve_id TEXT NOT NULL,
    PRIMARY KEY (weapon_id, stat)
  ) STRICT, WITHOUT ROWID;

  CREATE TABLE weapon_ascension_bonuses (
    weapon_id TEXT NOT NULL REFERENCES weapons(id),
    stat TEXT NOT NULL,
    ascension INTEGER NOT NULL,
    value REAL NOT NULL,
    PRIMARY KEY (weapon_id, stat, ascension)
  ) STRICT, WITHOUT ROWID;

  CREATE TABLE weapon_refinement_parameters (
    weapon_id TEXT NOT NULL REFERENCES weapons(id),
    parameter TEXT NOT NULL,
    refinement INTEGER NOT NULL,
    value REAL NOT NULL,
    PRIMARY KEY (weapon_id, parameter, refinement)
  ) STRICT, WITHOUT ROWID;

  CREATE TABLE weapon_level_curves (
    curve_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    multiplier REAL NOT NULL,
    PRIMARY KEY (curve_id, level)
  ) STRICT, WITHOUT ROWID;

  CREATE TABLE artifact_sets (
    id TEXT PRIMARY KEY,
    set_bonuses_json TEXT NOT NULL,
    rarities_json TEXT NOT NULL,
    slots_json TEXT NOT NULL,
    raw_json TEXT NOT NULL
  ) STRICT;

  CREATE TABLE artifact_main_stats (
    rarity INTEGER NOT NULL,
    stat TEXT NOT NULL,
    level INTEGER NOT NULL,
    value REAL NOT NULL,
    PRIMARY KEY (rarity, stat, level)
  ) STRICT, WITHOUT ROWID;

  CREATE TABLE artifact_substat_rolls (
    rarity INTEGER NOT NULL,
    stat TEXT NOT NULL,
    tier INTEGER NOT NULL,
    value REAL NOT NULL,
    PRIMARY KEY (rarity, stat, tier)
  ) STRICT, WITHOUT ROWID;

  CREATE TABLE artifact_roll_metadata (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL
  ) STRICT;
`
