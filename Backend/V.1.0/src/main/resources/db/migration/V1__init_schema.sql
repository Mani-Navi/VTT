-- 1. ENUMs
CREATE TYPE measurement_type AS ENUM (
    'CHESSBOARD_5E',
    'EUCLIDEAN',
    'MANHATTAN',
    'ALTERNATING_5E_35E'
);

-- 2. USERS
CREATE TABLE users (
                       id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       username            VARCHAR(50) UNIQUE NOT NULL,
                       email               VARCHAR(150) UNIQUE NOT NULL,
                       password_hash       VARCHAR(255) NOT NULL,
                       avatar_url          VARCHAR(500),
                       google_id           VARCHAR(100),
                       is_email_verified   BOOLEAN DEFAULT FALSE,
                       is_premium          BOOLEAN DEFAULT FALSE,
                       verification_code   VARCHAR(6),
                       verification_expiry TIMESTAMP,
                       created_at          TIMESTAMP DEFAULT NOW(),
                       last_seen_at        TIMESTAMP DEFAULT NOW()
);

-- 3. ROOM TEMPLATES
CREATE TABLE room_templates (
                                id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                title        VARCHAR(100),
                                description  TEXT,
                                max_players  INT DEFAULT 10,
                                expire_days  INT DEFAULT 30,
                                base_map_url VARCHAR(500),
                                music_url    VARCHAR(500)
);

-- 4. TEMPLATE JOURNALS
CREATE TABLE template_journals (
                                   id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   template_id   UUID REFERENCES room_templates(id) ON DELETE CASCADE,
                                   title         VARCHAR(100),
                                   content       TEXT,
                                   is_admin_only BOOLEAN DEFAULT TRUE
);

-- 5. ROOMS
CREATE TABLE rooms (
                       id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       code              VARCHAR(8) UNIQUE NOT NULL,
                       name              VARCHAR(100),
                       description       VARCHAR(500),
                       password          VARCHAR(255),
                       owner_id          UUID REFERENCES users(id) ON DELETE SET NULL,
                       type              VARCHAR(20) DEFAULT 'STANDARD',
                       template_id       UUID REFERENCES room_templates(id) ON DELETE SET NULL,
                       max_players       INT DEFAULT 10,
                       expire_days       INT DEFAULT 30,
                       music_url         VARCHAR(500),
                       host_role_title   VARCHAR(50) DEFAULT 'میزبان',
                       player_role_title VARCHAR(50) DEFAULT 'بازیکن',
                       created_at        TIMESTAMP DEFAULT NOW(),
                       last_active       TIMESTAMP DEFAULT NOW(),
                       gm_last_seen_at   TIMESTAMP,
                       is_active         BOOLEAN DEFAULT TRUE
);

-- تابع محاسباتی دترمینستیک برای انقضا
CREATE OR REPLACE FUNCTION calculate_expires_at(last_active TIMESTAMP, expire_days INT)
RETURNS TIMESTAMP LANGUAGE sql IMMUTABLE AS $$
SELECT last_active + (expire_days * INTERVAL '1 day');
$$;

-- ستون محاسباتی انقضا
ALTER TABLE rooms ADD COLUMN expires_at TIMESTAMP
    GENERATED ALWAYS AS (calculate_expires_at(last_active, expire_days)) STORED;

-- 6. ROOM MEMBERS
CREATE TABLE room_members (
                              id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              room_id    UUID REFERENCES rooms(id) ON DELETE CASCADE,
                              user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
                              role       VARCHAR(10) CHECK (role IN ('GM','PLAYER','ADMIN')) DEFAULT 'PLAYER',
                              role_title VARCHAR(50) DEFAULT 'بازیکن',
                              is_muted   BOOLEAN DEFAULT FALSE,
                              is_banned  BOOLEAN DEFAULT FALSE,
                              joined_at  TIMESTAMP DEFAULT NOW(),
                              UNIQUE(room_id, user_id)
);

-- 7. JOURNALS
CREATE TABLE journals (
                          id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          room_id       UUID REFERENCES rooms(id) ON DELETE CASCADE,
                          title         VARCHAR(100),
                          content       TEXT,
                          is_admin_only BOOLEAN DEFAULT TRUE,
                          created_at    TIMESTAMP DEFAULT NOW()
);

-- 8. ROOM SETTINGS
CREATE TABLE room_settings (
                               room_id                UUID PRIMARY KEY REFERENCES rooms(id) ON DELETE CASCADE,
                               zoom_sensitivity       FLOAT DEFAULT 1.0,
                               overlay_effect         VARCHAR(15) DEFAULT 'GLASS',
                               gm_fog_blend           FLOAT DEFAULT 0.5,
                               color_theme            VARCHAR(20) DEFAULT 'DARK',
                               input_mode             VARCHAR(15) DEFAULT 'AUTO',
                               shape_snap_sensitivity FLOAT DEFAULT 0.5,
                               grid_snap_sensitivity  FLOAT DEFAULT 0.5,
                               grid_type              VARCHAR(20) DEFAULT 'square',
                               line_type              VARCHAR(20) DEFAULT 'solid',
                               measurement_type       VARCHAR(30) DEFAULT 'dnd5e_5105',
                               grid_size              INT DEFAULT 60,
                               grid_opacity           FLOAT DEFAULT 0.35,
                               line_width             FLOAT DEFAULT 1.5,
                               grid_color             VARCHAR(7) DEFAULT '#000000',
                               is_grid_snapping       BOOLEAN DEFAULT TRUE
);

-- 9. PLAYER PERMISSIONS
CREATE TABLE player_permissions (
                                    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    room_id        UUID REFERENCES rooms(id) ON DELETE CASCADE,
                                    member_id      UUID REFERENCES room_members(id) ON DELETE CASCADE,
                                    can_assets     BOOLEAN DEFAULT FALSE,
                                    can_text       BOOLEAN DEFAULT FALSE,
                                    can_fog        BOOLEAN DEFAULT FALSE,
                                    can_drawing    BOOLEAN DEFAULT FALSE,
                                    can_scene      BOOLEAN DEFAULT FALSE,
                                    can_ruler      BOOLEAN DEFAULT TRUE,
                                    can_edit_token BOOLEAN DEFAULT FALSE,
                                    UNIQUE(room_id, member_id)
);

-- 10. ASSETS
CREATE TABLE assets (
                        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
                        name             VARCHAR(100) NOT NULL,
                        type             VARCHAR(20) CHECK (type IN ('MAP','TOKEN','PROP','ATTACHMENT','TEXT')),
                        file_url         TEXT NOT NULL,
                        file_size        BIGINT,
                        mime_type        VARCHAR(100),
                        width            INT,
                        height           INT,
                        dpi              INT DEFAULT 150,
                        grid_columns     INT DEFAULT 1,
                        grid_rows        INT DEFAULT 1,
                        rotation         FLOAT DEFAULT 0,
                        is_visible       BOOLEAN DEFAULT TRUE,
                        is_locked        BOOLEAN DEFAULT FALSE,
                        folder_name      VARCHAR(100),
                        collection_name  VARCHAR(100),
                        collection_color VARCHAR(30),
                        default_text     TEXT,
                        text_color       VARCHAR(30),
                        font_size        INT,
                        font_family      VARCHAR(100),
                        created_at       TIMESTAMP DEFAULT NOW(),
                        updated_at       TIMESTAMP DEFAULT NOW()
);

-- 11. SCENES
CREATE TABLE scenes (
                        id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        room_id              UUID REFERENCES rooms(id) ON DELETE CASCADE,
                        name                 VARCHAR(100) NOT NULL,
                        is_active            BOOLEAN DEFAULT TRUE,
                        map_url              VARCHAR(1000),
                        asset_id             UUID REFERENCES assets(id) ON DELETE SET NULL,
                        map_width            INT DEFAULT 2000,
                        map_height           INT DEFAULT 1500,
                        grid_size            INT DEFAULT 60,
                        grid_color           VARCHAR(7) DEFAULT '#000000',
                        grid_opacity         FLOAT DEFAULT 0.35,
                        available_conditions JSONB DEFAULT '[]'::jsonb,
                        is_fog_revealed      BOOLEAN DEFAULT FALSE,
                        fog_filled           BOOLEAN DEFAULT FALSE,
                        created_at           TIMESTAMP DEFAULT NOW(),
                        updated_at           TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX one_active_scene_per_room
    ON scenes(room_id) WHERE is_active = TRUE;

-- 12. TOKENS
CREATE TABLE tokens (
                        id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        scene_id                UUID REFERENCES scenes(id) ON DELETE CASCADE,
                        asset_id                UUID REFERENCES assets(id) ON DELETE SET NULL,
                        label                   VARCHAR(100),
                        avatar_url              TEXT,
                        x                       FLOAT NOT NULL,
                        y                       FLOAT NOT NULL,
                        rotation                FLOAT DEFAULT 0,
                        size                    FLOAT DEFAULT 1.0,
                        hp                      INT,
                        max_hp                  INT,
                        ac                      INT,
                        elevation               INT,
                        is_hidden               BOOLEAN DEFAULT FALSE,
                        is_locked               BOOLEAN DEFAULT FALSE,
                        controlled_by           VARCHAR(100),
                        gm_notes                TEXT,
                        is_prop                 BOOLEAN DEFAULT FALSE,
                        gold_value              INT DEFAULT 0,
                        xp_value                INT DEFAULT 0,
                        is_looted               BOOLEAN DEFAULT FALSE,
                        show_hp                 BOOLEAN DEFAULT TRUE,
                        show_name               BOOLEAN DEFAULT TRUE,
                        show_ac                 BOOLEAN DEFAULT TRUE,
                        show_conditions         BOOLEAN DEFAULT TRUE,
                        show_notes              BOOLEAN DEFAULT FALSE,
                        allow_player_hp         BOOLEAN DEFAULT TRUE,
                        allow_player_conditions BOOLEAN DEFAULT TRUE,
                        allow_player_ac         BOOLEAN DEFAULT TRUE,
                        allow_player_size       BOOLEAN DEFAULT TRUE,
                        conditions              JSONB DEFAULT '[]'::jsonb
);

-- 13. FOG REGIONS
CREATE TABLE fog_regions (
                             id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             scene_id   UUID REFERENCES scenes(id) ON DELETE CASCADE,
                             points     JSONB NOT NULL,
                             type       VARCHAR(10) CHECK (type IN ('HIDE','REVEAL')) DEFAULT 'HIDE',
                             created_at TIMESTAMP DEFAULT NOW()
);

-- 14. DRAWINGS
CREATE TABLE drawings (
                          id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          client_drawing_id VARCHAR(255),
                          scene_id          UUID REFERENCES scenes(id) ON DELETE CASCADE,
                          type              VARCHAR(20),
                          tool              VARCHAR(20),
                          stroke            VARCHAR(30),
                          color             VARCHAR(30),
                          stroke_width      FLOAT,
                          line_width        FLOAT DEFAULT 2,
                          fill              VARCHAR(30),
                          x                 FLOAT DEFAULT 0,
                          y                 FLOAT DEFAULT 0,
                          width             FLOAT,
                          height            FLOAT,
                          radius            FLOAT,
                          text              TEXT,
                          font_family       VARCHAR(100),
                          font_style        VARCHAR(50),
                          font_size         FLOAT,
                          scale_x           FLOAT DEFAULT 1.0,
                          scale_y           FLOAT DEFAULT 1.0,
                          rotation          FLOAT DEFAULT 0,
                          points            JSONB,
                          is_gm_layer       BOOLEAN DEFAULT FALSE,
                          is_visible        BOOLEAN DEFAULT TRUE
);

-- INDEXES
CREATE INDEX idx_scenes_room_id ON scenes(room_id);
CREATE INDEX idx_tokens_scene_id ON tokens(scene_id);
CREATE INDEX idx_fog_regions_scene_id ON fog_regions(scene_id);
CREATE INDEX idx_drawings_scene_id ON drawings(scene_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);