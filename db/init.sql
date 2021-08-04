CREATE TYPE public.access AS ENUM (
    'private',
    'protected',
    'public'
);

CREATE TYPE public.entity_type AS ENUM (
    'user',
    'club'
);

CREATE TYPE public.user_role AS ENUM (
    'user',
    'moder',
    'admin'
);

CREATE TYPE public.artifact_type AS ENUM (
    'tag',
    'number',
    'mention',
    'hashtag',
    'slashtag',
    'cashtag',
    'phone',
    'email',
    'uri',
    'emoji'
);

CREATE TYPE public.file_format AS ENUM (
    'css',
    'jpeg',
    'png',
    'gif',
    'svg',
    'webp',
    'bmp',
    'mp4',
    'webm',
    'avi',
    'mov',
    'mpeg',
    'mp3',
    'ogg',
    'wav'
);

CREATE TYPE public.audio_format AS ENUM (
    'mp3',
    'ogg',
    'wav'
);

CREATE TYPE public.image_format AS ENUM (
    'jpeg',
    'png',
    'gif',
    'svg',
    'webp',
    'bmp'
);

CREATE TYPE public.video_format AS ENUM (
    'mp4',
    'webm',
    'avi',
    'mov',
    'mpeg'
);

CREATE TYPE public.poll_type AS ENUM (
    'regular',
    'quiz'
);

CREATE TABLE IF NOT EXISTS public.entities (
    id bigserial NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.content (
    id bigserial NOT NULL PRIMARY KEY,
    hash bigint NOT NULL,
    uploader_id bigint DEFAULT 0 NOT NULL,
    uploaded_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    text text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.artifacts (
    id bigserial NOT NULL PRIMARY KEY,
    type public.artifact_type NOT NULL,
    string_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS public.artifacts_in_content (
    id bigserial NOT NULL PRIMARY KEY,
    content_id bigint NOT NULL,
    artifact_id bigint NOT NULL,
    "offset" integer NOT NULL,
    length integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bans (
    id bigserial NOT NULL PRIMARY KEY,
    entity_id bigint NOT NULL,
    banned_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    until_dt timestamp without time zone NOT NULL,
    reason_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS public.blacklist (
    id bigserial NOT NULL PRIMARY KEY,
    issuer_id bigint NOT NULL,
    issued_id bigint NOT NULL,
    issued_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS public.langs (
    id bigserial NOT NULL PRIMARY KEY,
    code character(3) NOT NULL,
    name character varying(255) NOT NULL,
    native character varying(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.emoji (
    id bigserial NOT NULL PRIMARY KEY,
    category character varying(255) NOT NULL,
    subcategory character varying(255) NOT NULL,
    symbol character varying(32) NOT NULL,
    title character varying(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.prohibited_media (
    id bigserial NOT NULL PRIMARY KEY,
    type public.file_format NOT NULL,
    hash bigint NOT NULL,
    reason_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS public.media (
    id bigserial NOT NULL PRIMARY KEY,
    hash bigint NOT NULL,
    format public.file_format NOT NULL,
    uploader_id bigint NOT NULL,
    uploaded_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    size integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.albums (
    id bigserial NOT NULL PRIMARY KEY,
    visibility public.access DEFAULT 'private'::public.access NOT NULL,
    owner_id bigint NOT NULL,
    index bigint NOT NULL,
    descr_id bigint DEFAULT 1 NOT NULL,
    poster_image_id bigint,
    commentable public.access DEFAULT 'public'::public.access NOT NULL,
    anon_comments_only boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS public.images (
    id bigserial NOT NULL PRIMARY KEY,
    album_id bigint NOT NULL,
    media_id bigint NOT NULL,
    owner_id bigint NOT NULL,
    descr_id bigint DEFAULT 1 NOT NULL,
    saved_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_comment_index bigint DEFAULT 0 NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.playlists (
    id bigserial NOT NULL PRIMARY KEY,
    visibility public.access DEFAULT 'private'::public.access NOT NULL,
    owner_id bigint NOT NULL,
    index bigint NOT NULL,
    descr_id bigint DEFAULT 1 NOT NULL,
    poster_image_id bigint,
    commentable public.access DEFAULT 'public'::public.access NOT NULL,
    anon_comments_only boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS public.audios (
    id bigserial NOT NULL PRIMARY KEY,
    playlist_id bigint NOT NULL,
    media_id bigint NOT NULL,
    owner_id bigint NOT NULL,
    title_id bigint NOT NULL,
    artist_id bigint,
    poster_image_id bigint,
    lyrics_id bigint DEFAULT 1 NOT NULL,
    saved_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_comment_index bigint DEFAULT 0 NOT NULL,
    duration integer NOT NULL,
    bitrate int NOT NULL
);

CREATE TABLE IF NOT EXISTS public.audio_tags (
    id bigserial NOT NULL PRIMARY KEY,
    audio_id bigint NOT NULL,
    tag_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS public.videolibs (
    id bigserial NOT NULL PRIMARY KEY,
    visibility public.access DEFAULT 'private'::public.access NOT NULL,
    owner_id bigint NOT NULL,
    index bigint NOT NULL,
    descr_id bigint DEFAULT 1 NOT NULL,
    poster_image_id bigint,
    commentable public.access DEFAULT 'public'::public.access NOT NULL,
    anon_comments_only boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS public.videos (
    id bigserial NOT NULL PRIMARY KEY,
    videolib_id bigint NOT NULL,
    media_id bigint NOT NULL,
    owner_id bigint NOT NULL,
    title_id bigint NOT NULL,
    descr_id bigint DEFAULT 1 NOT NULL,
    poster_image_id bigint,
    content_rating smallint DEFAULT 0 NOT NULL,
    saved_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_comment_index bigint DEFAULT 0 NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    duration integer NOT NULL,
    panoramic boolean DEFAULT false NOT NULL,
    frame_rate int NOT NULL,
    audio_bitrate int NOT NULL
);

CREATE TABLE IF NOT EXISTS public.video_tags (
    id bigserial NOT NULL PRIMARY KEY,
    video_id bigint NOT NULL,
    tag_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS public.users (
    id bigserial NOT NULL PRIMARY KEY,
    entity_id bigint NOT NULL,
    tg_id bigint NOT NULL,
    tg_username character varying(32) DEFAULT NULL::character varying,
    auth_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    registered_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    salt character(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.sessions (
    id bigserial NOT NULL PRIMARY KEY,
    user_id bigint NOT NULL,
    key character(36) NOT NULL,
    ip inet NOT NULL,
    auth_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    useragent_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS public.friends (
    id bigserial NOT NULL PRIMARY KEY,
    offerer_id bigint NOT NULL,
    acceptor_id bigint NOT NULL,
    since_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id bigint NOT NULL PRIMARY KEY,
    alias character varying(32) DEFAULT NULL::character varying,
    cover_image_id bigint,
    avatar_image_id bigint,
    name_id bigint DEFAULT 1 NOT NULL,
    bio_id bigint DEFAULT 1 NOT NULL,
    searchable boolean DEFAULT true NOT NULL,
    friendable public.access DEFAULT 'public'::public.access NOT NULL,
    invitable public.access DEFAULT 'protected'::public.access NOT NULL,
    commentable public.access DEFAULT 'public'::public.access NOT NULL,
    anon_comments_only boolean DEFAULT false NOT NULL,
    last_post_index bigint DEFAULT 0 NOT NULL,
    pinned_post_index bigint DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profile_links (
    id bigserial NOT NULL PRIMARY KEY,
    entity_id bigint NOT NULL,
    label_id bigint DEFAULT 1 NOT NULL,
    artifact_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS public.polls (
    id bigserial NOT NULL PRIMARY KEY,
    creator_id bigint NOT NULL,
    type public.poll_type DEFAULT 'regular'::public.poll_type NOT NULL,
    answer_visibility public.access DEFAULT 'private'::public.access NOT NULL,
    closing_dt timestamp without time zone,
    question_id bigint,
    multiple_answers boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS public.poll_options (
    id bigserial NOT NULL PRIMARY KEY,
    index smallint NOT NULL,
    poll_id bigint NOT NULL,
    text_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quizzes (
    id bigint NOT NULL PRIMARY KEY,
    correct_option_id bigint NOT NULL,
    explanation_id bigint
);

CREATE TABLE IF NOT EXISTS public.poll_answers (
    id bigserial NOT NULL PRIMARY KEY,
    user_id bigint NOT NULL,
    option_id bigint NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS content_hash_uindex          ON public.content              USING btree (hash);
CREATE UNIQUE INDEX IF NOT EXISTS artifacts_uindex             ON public.artifacts            USING btree (type, string_id);
CREATE UNIQUE INDEX IF NOT EXISTS artifacts_in_content_uindex  ON public.artifacts_in_content USING btree (content_id, artifact_id, "offset", length);
CREATE UNIQUE INDEX IF NOT EXISTS langs_code_uindex            ON public.langs                USING btree (code);
CREATE UNIQUE INDEX IF NOT EXISTS langs_name_uindex            ON public.langs                USING btree (name);
CREATE UNIQUE INDEX IF NOT EXISTS emoji_symbol_uindex          ON public.emoji                USING btree (symbol);
CREATE UNIQUE INDEX IF NOT EXISTS emoji_title_uindex           ON public.emoji                USING btree (title);
CREATE UNIQUE INDEX IF NOT EXISTS prohibited_media_hash_uindex ON public.prohibited_media     USING btree (hash);
CREATE UNIQUE INDEX IF NOT EXISTS media_hash_uindex            ON public.media                USING btree (hash);
CREATE UNIQUE INDEX IF NOT EXISTS users_entity_id_uindex       ON public.users                USING btree (entity_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_tg_id_uindex           ON public.users                USING btree (tg_id);
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_alias_uindex   ON public.user_profiles        USING btree (lower((alias)::text));

CREATE INDEX IF NOT EXISTS content_uploaded_dt_index              ON public.content              USING btree (uploaded_dt);
CREATE INDEX IF NOT EXISTS artifacts_type_index                   ON public.artifacts            USING btree (type);
CREATE INDEX IF NOT EXISTS artifacts_in_content_offset_index      ON public.artifacts_in_content USING btree ("offset");
CREATE INDEX IF NOT EXISTS artifacts_in_content_length_index      ON public.artifacts_in_content USING btree (length);
CREATE INDEX IF NOT EXISTS bans_banned_dt_index                   ON public.bans                 USING btree (banned_dt);
CREATE INDEX IF NOT EXISTS bans_until_dt_index                    ON public.bans                 USING btree (until_dt);
CREATE INDEX IF NOT EXISTS blacklist_issued_dt_index              ON public.blacklist            USING btree (issued_dt);
CREATE INDEX IF NOT EXISTS langs_native_index                     ON public.langs                USING btree (native);
CREATE INDEX IF NOT EXISTS emoji_category_index                   ON public.emoji                USING btree (category);
CREATE INDEX IF NOT EXISTS emoji_subcategory_index                ON public.emoji                USING btree (subcategory);
CREATE INDEX IF NOT EXISTS prohibited_media_type_index            ON public.prohibited_media     USING btree (type);
CREATE INDEX IF NOT EXISTS media_format_index                     ON public.media                USING btree (format);
CREATE INDEX IF NOT EXISTS media_size_index                       ON public.media                USING btree (size);
CREATE INDEX IF NOT EXISTS albums_visibility_index                ON public.albums               USING btree (visibility);
CREATE INDEX IF NOT EXISTS albums_index_index                     ON public.albums               USING btree (index);
CREATE INDEX IF NOT EXISTS albums_commentable_index               ON public.albums               USING btree (commentable);
CREATE INDEX IF NOT EXISTS albums_anon_comments_only_index        ON public.albums               USING btree (anon_comments_only);
CREATE INDEX IF NOT EXISTS images_saved_dt_index                  ON public.images               USING btree (saved_dt);
CREATE INDEX IF NOT EXISTS images_last_comment_index_index        ON public.images               USING btree (last_comment_index);
CREATE INDEX IF NOT EXISTS images_width_index                     ON public.images               USING btree (width);
CREATE INDEX IF NOT EXISTS images_heigth_index                    ON public.images               USING btree (height);
CREATE INDEX IF NOT EXISTS playlists_visibility_index             ON public.playlists            USING btree (visibility);
CREATE INDEX IF NOT EXISTS playlists_index_index                  ON public.playlists            USING btree (index);
CREATE INDEX IF NOT EXISTS playlists_commentable_index            ON public.playlists            USING btree (commentable);
CREATE INDEX IF NOT EXISTS playlists_anon_comments_only_index     ON public.playlists            USING btree (anon_comments_only);
CREATE INDEX IF NOT EXISTS audios_saved_dt_index                  ON public.audios               USING btree (saved_dt);
CREATE INDEX IF NOT EXISTS audios_duration_index                  ON public.audios               USING btree (duration);
CREATE INDEX IF NOT EXISTS audios_bitrate_index                   ON public.audios               USING btree (bitrate);
CREATE INDEX IF NOT EXISTS videolibs_visibility_index             ON public.videolibs            USING btree (visibility);
CREATE INDEX IF NOT EXISTS videolibs_index_index                  ON public.videolibs            USING btree (index);
CREATE INDEX IF NOT EXISTS videolibs_commentable_index            ON public.videolibs            USING btree (commentable);
CREATE INDEX IF NOT EXISTS videolibs_anon_comments_only_index     ON public.videolibs            USING btree (anon_comments_only);
CREATE INDEX IF NOT EXISTS videos_content_rating_index            ON public.videos               USING btree (content_rating);
CREATE INDEX IF NOT EXISTS videos_saved_dt_index                  ON public.videos               USING btree (saved_dt);
CREATE INDEX IF NOT EXISTS videos_last_comment_index_index        ON public.videos               USING btree (last_comment_index);
CREATE INDEX IF NOT EXISTS videos_width_index                     ON public.videos               USING btree (width);
CREATE INDEX IF NOT EXISTS videos_height_index                    ON public.videos               USING btree (height);
CREATE INDEX IF NOT EXISTS videos_duration_index                  ON public.videos               USING btree (duration);
CREATE INDEX IF NOT EXISTS videos_panoramic_index                 ON public.videos               USING btree (panoramic);
CREATE INDEX IF NOT EXISTS videos_frame_rate_index                ON public.videos               USING btree (frame_rate);
CREATE INDEX IF NOT EXISTS videos_audio_bitrate_index             ON public.videos               USING btree (audio_bitrate);
CREATE INDEX IF NOT EXISTS users_tg_username_index                ON public.users                USING btree (tg_username);
CREATE INDEX IF NOT EXISTS users_auth_dt_index                    ON public.users                USING btree (auth_dt);
CREATE INDEX IF NOT EXISTS users_role_index                       ON public.users                USING btree (role);
CREATE INDEX IF NOT EXISTS users_registered_dt_index              ON public.users                USING btree (registered_dt);
CREATE INDEX IF NOT EXISTS sessions_key_index                     ON public.sessions             USING btree (key);
CREATE INDEX IF NOT EXISTS sessions_ip_index                      ON public.sessions             USING btree (ip);
CREATE INDEX IF NOT EXISTS sessions_auth_dt_index                 ON public.sessions             USING btree (auth_dt);
CREATE INDEX IF NOT EXISTS friends_since_dt_index                 ON public.friends              USING btree (since_dt);
CREATE INDEX IF NOT EXISTS user_profiles_searchable_index         ON public.user_profiles        USING btree (searchable);
CREATE INDEX IF NOT EXISTS user_profiles_friendable_index         ON public.user_profiles        USING btree (friendable);
CREATE INDEX IF NOT EXISTS user_profiles_invitable_index          ON public.user_profiles        USING btree (invitable);
CREATE INDEX IF NOT EXISTS user_profiles_commentable_index        ON public.user_profiles        USING btree (commentable);
CREATE INDEX IF NOT EXISTS user_profiles_anon_comments_only_index ON public.user_profiles        USING btree (anon_comments_only);
CREATE INDEX IF NOT EXISTS user_profiles_last_post_index_index    ON public.user_profiles        USING btree (last_post_index);
CREATE INDEX IF NOT EXISTS user_profiles_pinned_post_index_index  ON public.user_profiles        USING btree (pinned_post_index);
CREATE INDEX IF NOT EXISTS polls_answer_visibility_index          ON public.polls                USING btree (answer_visibility);
CREATE INDEX IF NOT EXISTS polls_closing_dt_index                 ON public.polls                USING btree (closing_dt);
CREATE INDEX IF NOT EXISTS polls_multiple_answers_index           ON public.polls                USING btree (multiple_answers);
CREATE INDEX IF NOT EXISTS poll_options_index_index               ON public.poll_options         USING btree (index);

ALTER TABLE public.content              ADD CONSTRAINT content_uploader_id_fk              FOREIGN KEY (uploader_id)       REFERENCES public.users(id)        ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.artifacts            ADD CONSTRAINT artifacts_string_id_fk              FOREIGN KEY (string_id)         REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.artifacts_in_content ADD CONSTRAINT artifacts_in_content_content_id_fk  FOREIGN KEY (content_id)        REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.artifacts_in_content ADD CONSTRAINT artifacts_in_content_artifact_id_fk FOREIGN KEY (artifact_id)       REFERENCES public.artifacts(id)    ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.bans                 ADD CONSTRAINT bans_entity_id_fk                   FOREIGN KEY (entity_id)         REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.bans                 ADD CONSTRAINT bans_reason_id_fk                   FOREIGN KEY (reason_id)         REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.blacklist            ADD CONSTRAINT blacklist_issuer_id_fk              FOREIGN KEY (issuer_id)         REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.blacklist            ADD CONSTRAINT blacklist_issued_id_fk              FOREIGN KEY (issued_id)         REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.prohibited_media     ADD CONSTRAINT prohibited_media_reason_id_fk       FOREIGN KEY (reason_id)         REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.media                ADD CONSTRAINT media_uploader_id_fk                FOREIGN KEY (uploader_id)       REFERENCES public.users(id)        ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.albums               ADD CONSTRAINT albums_owner_id_fk                  FOREIGN KEY (owner_id)          REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.albums               ADD CONSTRAINT albums_descr_id_fk                  FOREIGN KEY (descr_id)          REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.albums               ADD CONSTRAINT albums_poster_image_id_fk           FOREIGN KEY (poster_image_id)   REFERENCES public.images(id)       ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.images               ADD CONSTRAINT images_album_id_fk                  FOREIGN KEY (album_id)          REFERENCES public.albums(id)       ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.images               ADD CONSTRAINT images_media_id_fk                  FOREIGN KEY (media_id)          REFERENCES public.media(id)        ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.images               ADD CONSTRAINT images_owner_id_fk                  FOREIGN KEY (owner_id)          REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.images               ADD CONSTRAINT images_descr_id_fk                  FOREIGN KEY (descr_id)          REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.playlists            ADD CONSTRAINT playlists_owner_id_fk               FOREIGN KEY (owner_id)          REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.playlists            ADD CONSTRAINT playlists_descr_id_fk               FOREIGN KEY (descr_id)          REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.playlists            ADD CONSTRAINT playlists_poster_image_id_fk        FOREIGN KEY (poster_image_id)   REFERENCES public.images(id)       ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.audios               ADD CONSTRAINT audios_playlist_id_fk               FOREIGN KEY (playlist_id)       REFERENCES public.playlists(id)    ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.audios               ADD CONSTRAINT audios_media_id_fk                  FOREIGN KEY (media_id)          REFERENCES public.media(id)        ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.audios               ADD CONSTRAINT audios_owner_id_fk                  FOREIGN KEY (owner_id)          REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.audios               ADD CONSTRAINT audios_title_id_fk                  FOREIGN KEY (title_id)          REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.audios               ADD CONSTRAINT audios_artist_id_fk                 FOREIGN KEY (artist_id)         REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.audios               ADD CONSTRAINT audios_poster_image_id_fk           FOREIGN KEY (poster_image_id)   REFERENCES public.images(id)       ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.audios               ADD CONSTRAINT audios_lyrics_id_fk                 FOREIGN KEY (lyrics_id)         REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.audio_tags           ADD CONSTRAINT audio_tags_audio_id_fk              FOREIGN KEY (audio_id)          REFERENCES public.audios(id)       ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.audio_tags           ADD CONSTRAINT audio_tags_tag_id_fk                FOREIGN KEY (tag_id)            REFERENCES public.artifacts(id)    ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.videolibs            ADD CONSTRAINT videolibs_owner_id_fk               FOREIGN KEY (owner_id)          REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.videolibs            ADD CONSTRAINT videolibs_descr_id_fk               FOREIGN KEY (descr_id)          REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.videolibs            ADD CONSTRAINT videolibs_poster_image_id_fk        FOREIGN KEY (poster_image_id)   REFERENCES public.images(id)       ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.videos               ADD CONSTRAINT videos_videolib_id_fk               FOREIGN KEY (videolib_id)       REFERENCES public.videolibs(id)    ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.videos               ADD CONSTRAINT videos_media_id_fk                  FOREIGN KEY (media_id)          REFERENCES public.media(id)        ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.videos               ADD CONSTRAINT videos_owner_id_fk                  FOREIGN KEY (owner_id)          REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.videos               ADD CONSTRAINT videos_descr_id_fk                  FOREIGN KEY (descr_id)          REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.videos               ADD CONSTRAINT videos_poster_image_id_fk           FOREIGN KEY (poster_image_id)   REFERENCES public.images(id)       ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.video_tags           ADD CONSTRAINT video_tags_audio_id_fk              FOREIGN KEY (video_id)          REFERENCES public.videos(id)       ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.video_tags           ADD CONSTRAINT video_tags_tag_id_fk                FOREIGN KEY (tag_id)            REFERENCES public.artifacts(id)    ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.users                ADD CONSTRAINT users_entity_id_fk                  FOREIGN KEY (entity_id)         REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.sessions             ADD CONSTRAINT sessions_user_id_fk                 FOREIGN KEY (user_id)           REFERENCES public.users(id)        ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.sessions             ADD CONSTRAINT sessions_useragent_id_fk            FOREIGN KEY (useragent_id)      REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.friends              ADD CONSTRAINT friends_offerer_id_fk               FOREIGN KEY (offerer_id)        REFERENCES public.users(id)        ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.friends              ADD CONSTRAINT friends_acceptor_id_fk              FOREIGN KEY (acceptor_id)       REFERENCES public.users(id)        ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.user_profiles        ADD CONSTRAINT user_profiles_cover_image_id_fk     FOREIGN KEY (cover_image_id)    REFERENCES public.images(id)       ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.user_profiles        ADD CONSTRAINT user_profiles_avatar_image_id_fk    FOREIGN KEY (avatar_image_id)   REFERENCES public.images(id)       ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.user_profiles        ADD CONSTRAINT user_profiles_name_id_fk            FOREIGN KEY (name_id)           REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.user_profiles        ADD CONSTRAINT user_profiles_bio_id_fk             FOREIGN KEY (bio_id)            REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE public.profile_links        ADD CONSTRAINT profile_links_entity_id_fk          FOREIGN KEY (entity_id)         REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.profile_links        ADD CONSTRAINT profile_links_label_id_fk           FOREIGN KEY (label_id)          REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.profile_links        ADD CONSTRAINT profile_links_artifact_id_fk        FOREIGN KEY (artifact_id)       REFERENCES public.artifacts(id)    ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.polls                ADD CONSTRAINT polls_creator_id_fk                 FOREIGN KEY (creator_id)        REFERENCES public.entities(id)     ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.polls                ADD CONSTRAINT polls_question_id_fk                FOREIGN KEY (question_id)       REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.poll_options         ADD CONSTRAINT poll_options_poll_id_fk             FOREIGN KEY (poll_id)           REFERENCES public.polls(id)        ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.poll_options         ADD CONSTRAINT poll_options_text_id_fk             FOREIGN KEY (text_id)           REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.quizzes              ADD CONSTRAINT quizzes_id_fk                       FOREIGN KEY (id)                REFERENCES public.polls(id)        ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.quizzes              ADD CONSTRAINT quizzes_correct_option_id_fk        FOREIGN KEY (correct_option_id) REFERENCES public.poll_options(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.quizzes              ADD CONSTRAINT quizzes_explanation_id_fk           FOREIGN KEY (explanation_id)    REFERENCES public.content(id)      ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE public.poll_answers         ADD CONSTRAINT poll_answers_user_id_fk             FOREIGN KEY (user_id)           REFERENCES public.users(id)        ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.poll_answers         ADD CONSTRAINT poll_answers_option_id_fk           FOREIGN KEY (option_id)         REFERENCES public.poll_options(id) ON UPDATE CASCADE ON DELETE CASCADE;
