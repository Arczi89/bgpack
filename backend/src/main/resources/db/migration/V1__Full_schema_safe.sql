CREATE TABLE IF NOT EXISTS users (
                                     id BIGSERIAL PRIMARY KEY,
                                     username VARCHAR(50) NOT NULL UNIQUE,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                             );

CREATE TABLE IF NOT EXISTS games (
                                     id BIGSERIAL PRIMARY KEY,
                                     bgg_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    year_published INTEGER,
    min_players INTEGER,
    max_players INTEGER,
    playing_time INTEGER,
    min_age INTEGER,
    image_url VARCHAR(512),
    thumbnail_url VARCHAR(512),
    rank INTEGER,
    bgg_rating DECIMAL(4,2),
    average_rating DECIMAL(4,2),
    complexity DECIMAL(4,2),
    suggested_num_players JSONB,
    recommended_players JSONB,
    cached_at TIMESTAMP WITH TIME ZONE,
    cache_hits INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                               );

CREATE INDEX IF NOT EXISTS idx_games_rank ON games(rank);
CREATE INDEX IF NOT EXISTS idx_games_players ON games(min_players, max_players);
CREATE INDEX IF NOT EXISTS idx_games_name ON games(name);
CREATE INDEX IF NOT EXISTS idx_games_bgg_id ON games(bgg_id);
CREATE INDEX IF NOT EXISTS idx_games_cache_hits ON games(cache_hits DESC);
CREATE INDEX IF NOT EXISTS idx_games_last_updated ON games(last_updated);
CREATE INDEX IF NOT EXISTS idx_games_bgg_rating ON games(bgg_rating DESC);

CREATE TABLE IF NOT EXISTS tags (
                                    id BIGSERIAL PRIMARY KEY,
                                    name VARCHAR(100) NOT NULL UNIQUE
    );

CREATE TABLE IF NOT EXISTS game_tags (
                                         game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, tag_id)
    );

CREATE TABLE IF NOT EXISTS user_collections (
                                                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    rating INTEGER,
    status VARCHAR(50) DEFAULT 'OWNED',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, game_id)
    );

CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_game_id ON user_collections(game_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_status ON user_collections(status);

CREATE TABLE IF NOT EXISTS search_presets (
                                              id BIGSERIAL PRIMARY KEY,
                                              user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preset_name VARCHAR(100) NOT NULL,
    filter_criteria JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                                                                                               );
CREATE INDEX IF NOT EXISTS idx_search_presets_user_id ON search_presets(user_id);