-- Global presets (no login): we do NOT store any user_id.
-- Preset "criteria" is stored fully in JSONB filter_criteria:
-- {
--   "usernames": ["inz_informatyk", "Fidosek"],
--   "filters": { "minPlayers": 2, "maxPlayers": 4, "minRating": 7.5 },
--   "excludeExpansions": true
-- }

-- Drop old index (from V1) and remove the user_id column
DROP INDEX IF EXISTS idx_search_presets_user_id;

ALTER TABLE search_presets
    DROP COLUMN IF EXISTS user_id;

-- Convenience index for listing presets
CREATE INDEX IF NOT EXISTS idx_search_presets_created_at
    ON search_presets(created_at DESC);

-- Uniqueness of preset names globally
CREATE UNIQUE INDEX IF NOT EXISTS ux_search_presets_preset_name
    ON search_presets(preset_name);

