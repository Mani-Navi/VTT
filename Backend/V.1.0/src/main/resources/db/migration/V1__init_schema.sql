-- 1. ENUMs
CREATE TYPE measurement_type AS ENUM (
    'CHESSBOARD_5E',
    'EUCLIDEAN',
    'MANHATTAN',
    'ALTERNATING_5E_35E'
);

-- 2. USERS
CREATE TABLE users (
                       id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       username      VARCHAR(50) UNIQUE NOT NULL,
                       email         VARCHAR(150) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       created_at    TIMESTAMP DEFAULT NOW(),
                       last_seen_at  TIMESTAMP DEFAULT NOW()
);

-- 3. ROOMS
CREATE TABLE rooms (
                       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       code        VARCHAR(8) UNIQUE NOT NULL,
                       name        VARCHAR(100),
                       owner_id    UUID REFERENCES users(id) ON DELETE SET NULL,
                       expire_days INT DEFAULT 30,
                       created_at  TIMESTAMP DEFAULT NOW(),
                       last_active TIMESTAMP DEFAULT NOW(),
                       is_active   BOOLEAN DEFAULT TRUE
);

-- ستون محاسباتی برای انقضا
ALTER TABLE rooms ADD COLUMN expires_at TIMESTAMP
    GENERATED ALWAYS AS (last_active + (expire_days || ' days')::INTERVAL) STORED;

-- 4. ROOM MEMBERS
CREATE TABLE room_members (
                              id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              room_id   UUID REFERENCES rooms(id) ON DELETE CASCADE,
                              user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
                              role      VARCHAR(10) CHECK (role IN ('GM','PLAYER')) DEFAULT 'PLAYER',
                              joined_at TIMESTAMP DEFAULT NOW(),
                              UNIQUE(room_id, user_id)
);

-- 5. ROOM SETTINGS
CREATE TABLE room_settings (
                               room_id                UUID PRIMARY KEY REFERENCES rooms(id) ON DELETE CASCADE,
                               zoom_sensitivity       FLOAT DEFAULT 1.0,
                               overlay_effect         VARCHAR(15) DEFAULT 'GLASS',
                               gm_fog_blend           FLOAT DEFAULT 0.5,
                               color_theme            VARCHAR(20) DEFAULT 'DARK',
                               input_mode             VARCHAR(15) DEFAULT 'AUTO',
                               shape_snap_sensitivity FLOAT DEFAULT 0.5,
                               grid_snap_sensitivity  FLOAT DEFAULT 0.5,
                               line_width             FLOAT DEFAULT 2.0
);

-- 6. PLAYER PERMISSIONS
CREATE TABLE player_permissions (
                                    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    room_id     UUID REFERENCES rooms(id) ON DELETE CASCADE,
                                    member_id   UUID REFERENCES room_members(id) ON DELETE CASCADE,
                                    can_assets  BOOLEAN DEFAULT FALSE,
                                    can_text    BOOLEAN DEFAULT TRUE,
                                    can_fog     BOOLEAN DEFAULT FALSE,
                                    can_drawing BOOLEAN DEFAULT TRUE,
                                    can_map     BOOLEAN DEFAULT FALSE,
                                    can_ruler   BOOLEAN DEFAULT TRUE,
                                    UNIQUE(room_id, member_id)
);

-- 7. ASSETS
CREATE TABLE assets (
                        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
                        name        VARCHAR(100) NOT NULL,
                        type        VARCHAR(20) CHECK (type IN ('MAP','TOKEN','PROP','ATTACHMENT','TEXT')),
                        file_url    VARCHAR(500),
                        file_size   BIGINT,
                        mime_type   VARCHAR(100),
                        is_visible  BOOLEAN DEFAULT TRUE,
                        is_locked   BOOLEAN DEFAULT FALSE,
                        width       INT,
                        height      INT,
                        dpi         INT DEFAULT 72,
                        rotation    FLOAT DEFAULT 0,
                        created_at  TIMESTAMP DEFAULT NOW(),
                        updated_at  TIMESTAMP DEFAULT NOW()
);

-- 8. SCENES
CREATE TABLE scenes (
                        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        room_id          UUID REFERENCES rooms(id) ON DELETE CASCADE,
                        name             VARCHAR(100),
                        is_active        BOOLEAN DEFAULT FALSE,
                        asset_id         UUID REFERENCES assets(id) ON DELETE SET NULL,
                        image_url        VARCHAR(500),
                        grid_type        VARCHAR(20) DEFAULT 'SQUARE',
                        grid_size        INT DEFAULT 50,
                        grid_color       VARCHAR(7) DEFAULT '#000000',
                        grid_opacity     FLOAT DEFAULT 0.5,
                        grid_line_type   VARCHAR(10) DEFAULT 'LINE',
                        measurement      measurement_type DEFAULT 'CHESSBOARD_5E',
                        snapping         BOOLEAN DEFAULT TRUE,
                        snap_sensitivity FLOAT DEFAULT 0.5,
                        viewport_x       FLOAT DEFAULT 0,
                        viewport_y       FLOAT DEFAULT 0,
                        viewport_zoom    FLOAT DEFAULT 1.0,
                        created_at       TIMESTAMP DEFAULT NOW(),
                        updated_at       TIMESTAMP DEFAULT NOW(),
                        CONSTRAINT chk_image_source CHECK (asset_id IS NOT NULL OR image_url IS NOT NULL)
);

CREATE UNIQUE INDEX one_active_scene_per_room
    ON scenes(room_id) WHERE is_active = TRUE;

-- 9. TOKENS
CREATE TABLE tokens (
                        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        scene_id   UUID REFERENCES scenes(id) ON DELETE CASCADE,
                        asset_id   UUID REFERENCES assets(id) ON DELETE SET NULL,
                        label      VARCHAR(100),
                        x          FLOAT NOT NULL,
                        y          FLOAT NOT NULL,
                        width      FLOAT DEFAULT 50,
                        height     FLOAT DEFAULT 50,
                        rotation   FLOAT DEFAULT 0,
                        hp         INT,
                        max_hp     INT,
                        is_visible BOOLEAN DEFAULT TRUE,
                        is_locked  BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. FOG REGIONS
CREATE TABLE fog_regions (
                             id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             scene_id   UUID REFERENCES scenes(id) ON DELETE CASCADE,
                             points     JSONB NOT NULL,
                             type       VARCHAR(10) CHECK (type IN ('HIDE','REVEAL')) DEFAULT 'HIDE',
                             created_at TIMESTAMP DEFAULT NOW()
);

-- 11. DRAWINGS
CREATE TABLE drawings (
                          id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          scene_id   UUID REFERENCES scenes(id) ON DELETE CASCADE,
                          tool       VARCHAR(20),
                          points     JSONB NOT NULL,
                          color      VARCHAR(7),
                          line_width FLOAT DEFAULT 2,
                          fill       VARCHAR(7),
                          is_visible BOOLEAN DEFAULT TRUE,
                          created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR PRODUCTION PERFORMANCE (<100ms real-time target)
-- ==========================================================
CREATE INDEX idx_scenes_room_id ON scenes(room_id);
CREATE INDEX idx_tokens_scene_id ON tokens(scene_id);
CREATE INDEX idx_fog_regions_scene_id ON fog_regions(scene_id);
CREATE INDEX idx_drawings_scene_id ON drawings(scene_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);