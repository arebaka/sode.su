--
-- PostgreSQL database dump
--

-- Dumped from database version 12.6 (Ubuntu 12.6-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 12.6 (Ubuntu 12.6-0ubuntu0.20.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: access; Type: TYPE; Schema: public; Owner: sodesu
--

CREATE TYPE public.access AS ENUM (
    'private',
    'protected',
    'public'
);


ALTER TYPE public.access OWNER TO sodesu;

--
-- Name: artifact_type; Type: TYPE; Schema: public; Owner: sodesu
--

CREATE TYPE public.artifact_type AS ENUM (
    'hashtag',
    'mention',
    'shashtag',
    'cashtag',
    'phone',
    'email',
    'link'
);


ALTER TYPE public.artifact_type OWNER TO sodesu;

--
-- Name: audio_format; Type: TYPE; Schema: public; Owner: sodesu
--

CREATE TYPE public.audio_format AS ENUM (
    'mp3',
    'ogg',
    'wav'
);


ALTER TYPE public.audio_format OWNER TO sodesu;

--
-- Name: entity_type; Type: TYPE; Schema: public; Owner: sodesu
--

CREATE TYPE public.entity_type AS ENUM (
    'user',
    'club'
);


ALTER TYPE public.entity_type OWNER TO sodesu;

--
-- Name: file_format; Type: TYPE; Schema: public; Owner: sodesu
--

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


ALTER TYPE public.file_format OWNER TO sodesu;

--
-- Name: image_format; Type: TYPE; Schema: public; Owner: sodesu
--

CREATE TYPE public.image_format AS ENUM (
    'jpeg',
    'png',
    'gif',
    'svg',
    'webp',
    'bmp'
);


ALTER TYPE public.image_format OWNER TO sodesu;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: sodesu
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'moder',
    'admin'
);


ALTER TYPE public.user_role OWNER TO sodesu;

--
-- Name: video_format; Type: TYPE; Schema: public; Owner: sodesu
--

CREATE TYPE public.video_format AS ENUM (
    'mp4',
    'webm',
    'avi',
    'mov',
    'mpeg'
);


ALTER TYPE public.video_format OWNER TO sodesu;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: albums; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.albums (
    id bigint NOT NULL,
    visibility public.access DEFAULT 'private'::public.access NOT NULL,
    name character varying(255) NOT NULL,
    descr_id bigint DEFAULT 1 NOT NULL,
    owner_id bigint NOT NULL,
    poster_image_id bigint,
    commentable public.access DEFAULT 'public'::public.access NOT NULL,
    anon_comments_only boolean DEFAULT false NOT NULL
);


ALTER TABLE public.albums OWNER TO sodesu;

--
-- Name: albums_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.albums_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.albums_id_seq OWNER TO sodesu;

--
-- Name: albums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.albums_id_seq OWNED BY public.albums.id;


--
-- Name: artifacts; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.artifacts (
    id bigint NOT NULL,
    type public.artifact_type NOT NULL,
    string character varying(1024) NOT NULL
);


ALTER TABLE public.artifacts OWNER TO sodesu;

--
-- Name: artifacts_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.artifacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.artifacts_id_seq OWNER TO sodesu;

--
-- Name: artifacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.artifacts_id_seq OWNED BY public.artifacts.id;


--
-- Name: artifacts_in_content; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.artifacts_in_content (
    id bigint NOT NULL,
    content_id bigint NOT NULL,
    artifact_id bigint NOT NULL,
    "position" integer NOT NULL,
    length integer NOT NULL
);


ALTER TABLE public.artifacts_in_content OWNER TO sodesu;

--
-- Name: artifacts_in_content_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.artifacts_in_content_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.artifacts_in_content_id_seq OWNER TO sodesu;

--
-- Name: artifacts_in_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.artifacts_in_content_id_seq OWNED BY public.artifacts_in_content.id;


--
-- Name: bans; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.bans (
    id bigint NOT NULL,
    entity_id bigint NOT NULL,
    until_dt timestamp without time zone NOT NULL,
    reason_id bigint NOT NULL,
    banned_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bans OWNER TO sodesu;

--
-- Name: bans_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.bans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bans_id_seq OWNER TO sodesu;

--
-- Name: bans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.bans_id_seq OWNED BY public.bans.id;


--
-- Name: blacklist; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.blacklist (
    id bigint NOT NULL,
    issuer_id bigint NOT NULL,
    banned_id bigint NOT NULL,
    issued_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.blacklist OWNER TO sodesu;

--
-- Name: blacklist_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.blacklist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.blacklist_id_seq OWNER TO sodesu;

--
-- Name: blacklist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.blacklist_id_seq OWNED BY public.blacklist.id;


--
-- Name: content; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.content (
    id bigint NOT NULL,
    hash bigint NOT NULL,
    text text NOT NULL
);


ALTER TABLE public.content OWNER TO sodesu;

--
-- Name: content_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.content_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.content_id_seq OWNER TO sodesu;

--
-- Name: content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.content_id_seq OWNED BY public.content.id;


--
-- Name: emoji; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.emoji (
    id bigint NOT NULL,
    string character varying(32) NOT NULL,
    title text NOT NULL
);


ALTER TABLE public.emoji OWNER TO sodesu;

--
-- Name: emoji_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.emoji_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.emoji_id_seq OWNER TO sodesu;

--
-- Name: emoji_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.emoji_id_seq OWNED BY public.emoji.id;


--
-- Name: entities; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.entities (
    id bigint NOT NULL
);


ALTER TABLE public.entities OWNER TO sodesu;

--
-- Name: entities_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.entities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.entities_id_seq OWNER TO sodesu;

--
-- Name: entities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.entities_id_seq OWNED BY public.entities.id;


--
-- Name: friends; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.friends (
    id bigint NOT NULL,
    offerer_id bigint NOT NULL,
    acceptor_id bigint NOT NULL,
    since_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.friends OWNER TO sodesu;

--
-- Name: friends_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.friends_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.friends_id_seq OWNER TO sodesu;

--
-- Name: friends_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.friends_id_seq OWNED BY public.friends.id;


--
-- Name: images; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.images (
    id bigint NOT NULL,
    album_id bigint NOT NULL,
    media_id bigint NOT NULL,
    owner_id bigint NOT NULL,
    descr_id bigint DEFAULT 1 NOT NULL,
    last_comment_index bigint DEFAULT 0 NOT NULL,
    saved_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.images OWNER TO sodesu;

--
-- Name: images_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.images_id_seq OWNER TO sodesu;

--
-- Name: images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.images_id_seq OWNED BY public.images.id;


--
-- Name: langs; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.langs (
    id bigint NOT NULL,
    code character(3) NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.langs OWNER TO sodesu;

--
-- Name: langs_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.langs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.langs_id_seq OWNER TO sodesu;

--
-- Name: langs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.langs_id_seq OWNED BY public.langs.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.media (
    id bigint NOT NULL,
    hash bigint NOT NULL,
    format public.file_format NOT NULL,
    uploader_id bigint NOT NULL
);


ALTER TABLE public.media OWNER TO sodesu;

--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.media_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.media_id_seq OWNER TO sodesu;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: music; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.music (
    id bigint NOT NULL,
    playlist_id bigint NOT NULL,
    media_id bigint NOT NULL,
    title character varying(1024) NOT NULL,
    artist character varying(1024) DEFAULT ''::character varying NOT NULL,
    poster_image_id bigint NOT NULL,
    saved_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    lyrics_id bigint DEFAULT 1 NOT NULL
);


ALTER TABLE public.music OWNER TO sodesu;

--
-- Name: music_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.music_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.music_id_seq OWNER TO sodesu;

--
-- Name: music_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.music_id_seq OWNED BY public.music.id;


--
-- Name: music_tags; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.music_tags (
    id bigint NOT NULL,
    music_id bigint NOT NULL,
    tag_id bigint NOT NULL
);


ALTER TABLE public.music_tags OWNER TO sodesu;

--
-- Name: music_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.music_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.music_tags_id_seq OWNER TO sodesu;

--
-- Name: music_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.music_tags_id_seq OWNED BY public.music_tags.id;


--
-- Name: playlists; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.playlists (
    id bigint NOT NULL,
    visibility public.access DEFAULT 'private'::public.access NOT NULL,
    name character varying(255) NOT NULL,
    descr_id bigint DEFAULT 1 NOT NULL,
    owner_id bigint NOT NULL,
    poster_image_id bigint,
    commentable public.access DEFAULT 'public'::public.access NOT NULL,
    anon_comments_only boolean DEFAULT false NOT NULL
);


ALTER TABLE public.playlists OWNER TO sodesu;

--
-- Name: playlists_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.playlists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.playlists_id_seq OWNER TO sodesu;

--
-- Name: playlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.playlists_id_seq OWNED BY public.playlists.id;


--
-- Name: poll_answers; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.poll_answers (
    id bigint NOT NULL,
    index smallint NOT NULL,
    poll_id bigint NOT NULL,
    text_id bigint NOT NULL
);


ALTER TABLE public.poll_answers OWNER TO sodesu;

--
-- Name: poll_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.poll_answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.poll_answers_id_seq OWNER TO sodesu;

--
-- Name: poll_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.poll_answers_id_seq OWNED BY public.poll_answers.id;


--
-- Name: poll_votes; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.poll_votes (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    answer_id bigint NOT NULL
);


ALTER TABLE public.poll_votes OWNER TO sodesu;

--
-- Name: poll_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.poll_votes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.poll_votes_id_seq OWNER TO sodesu;

--
-- Name: poll_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.poll_votes_id_seq OWNED BY public.poll_votes.id;


--
-- Name: polls; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.polls (
    id bigint NOT NULL,
    multiple_answers boolean DEFAULT false NOT NULL,
    quiz boolean DEFAULT false NOT NULL,
    voting_visibility public.access DEFAULT 'private'::public.access NOT NULL,
    closing_dt timestamp without time zone,
    corrent_answer_id bigint,
    hint_id bigint
);


ALTER TABLE public.polls OWNER TO sodesu;

--
-- Name: polls_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.polls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.polls_id_seq OWNER TO sodesu;

--
-- Name: polls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.polls_id_seq OWNED BY public.polls.id;


--
-- Name: profile_links; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.profile_links (
    id bigint NOT NULL,
    entity_id bigint NOT NULL,
    label character varying(32) DEFAULT ''::character varying NOT NULL,
    artifact_id bigint NOT NULL
);


ALTER TABLE public.profile_links OWNER TO sodesu;

--
-- Name: profile_links_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.profile_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.profile_links_id_seq OWNER TO sodesu;

--
-- Name: profile_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.profile_links_id_seq OWNED BY public.profile_links.id;


--
-- Name: prohibited_media; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.prohibited_media (
    id bigint NOT NULL,
    type public.file_format NOT NULL,
    hash bigint NOT NULL,
    reason text NOT NULL
);


ALTER TABLE public.prohibited_media OWNER TO sodesu;

--
-- Name: prohibited_media_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.prohibited_media_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.prohibited_media_id_seq OWNER TO sodesu;

--
-- Name: prohibited_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.prohibited_media_id_seq OWNED BY public.prohibited_media.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.sessions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    key character(36) NOT NULL,
    ip inet NOT NULL,
    auth_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    useragent character varying(255) NOT NULL
);


ALTER TABLE public.sessions OWNER TO sodesu;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sessions_id_seq OWNER TO sodesu;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.user_profiles (
    id bigint NOT NULL,
    alias character varying(32) DEFAULT NULL::character varying,
    searchable boolean DEFAULT true NOT NULL,
    cover_image_id bigint,
    avatar_image_id bigint,
    name character varying(255) DEFAULT ''::character varying NOT NULL,
    bio_id bigint NOT NULL,
    friendable public.access DEFAULT 'public'::public.access NOT NULL,
    invitable public.access DEFAULT 'protected'::public.access NOT NULL,
    commentable public.access DEFAULT 'public'::public.access NOT NULL,
    anon_comments_only boolean DEFAULT false NOT NULL,
    last_post_index bigint DEFAULT 0 NOT NULL,
    pinned_post_index bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.user_profiles OWNER TO sodesu;

--
-- Name: users; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    entity_id bigint NOT NULL,
    tg_id bigint NOT NULL,
    tg_username character varying(32) DEFAULT NULL::character varying,
    auth_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    registered_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    salt character(32) NOT NULL
);


ALTER TABLE public.users OWNER TO sodesu;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO sodesu;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: videolibs; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.videolibs (
    id bigint NOT NULL,
    visibility public.access DEFAULT 'private'::public.access NOT NULL,
    name character varying(255) NOT NULL,
    descr_id bigint DEFAULT 1 NOT NULL,
    owner_id bigint NOT NULL,
    poster_image_id bigint,
    commentable public.access DEFAULT 'public'::public.access NOT NULL,
    anon_comments_only boolean DEFAULT false NOT NULL
);


ALTER TABLE public.videolibs OWNER TO sodesu;

--
-- Name: videolibs_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.videolibs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.videolibs_id_seq OWNER TO sodesu;

--
-- Name: videolibs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.videolibs_id_seq OWNED BY public.videolibs.id;


--
-- Name: videos; Type: TABLE; Schema: public; Owner: sodesu
--

CREATE TABLE public.videos (
    id bigint NOT NULL,
    videolib_id bigint NOT NULL,
    media_id bigint NOT NULL,
    owner_id bigint NOT NULL,
    title character varying(1024) NOT NULL,
    descr_id bigint DEFAULT 1 NOT NULL,
    poster_image_id bigint,
    content_rating smallint DEFAULT 0 NOT NULL,
    "360" boolean DEFAULT false NOT NULL,
    saved_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_comment_index bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.videos OWNER TO sodesu;

--
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: sodesu
--

CREATE SEQUENCE public.videos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.videos_id_seq OWNER TO sodesu;

--
-- Name: videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sodesu
--

ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;


--
-- Name: albums id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.albums ALTER COLUMN id SET DEFAULT nextval('public.albums_id_seq'::regclass);


--
-- Name: artifacts id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.artifacts ALTER COLUMN id SET DEFAULT nextval('public.artifacts_id_seq'::regclass);


--
-- Name: artifacts_in_content id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.artifacts_in_content ALTER COLUMN id SET DEFAULT nextval('public.artifacts_in_content_id_seq'::regclass);


--
-- Name: bans id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.bans ALTER COLUMN id SET DEFAULT nextval('public.bans_id_seq'::regclass);


--
-- Name: blacklist id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.blacklist ALTER COLUMN id SET DEFAULT nextval('public.blacklist_id_seq'::regclass);


--
-- Name: content id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.content ALTER COLUMN id SET DEFAULT nextval('public.content_id_seq'::regclass);


--
-- Name: emoji id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.emoji ALTER COLUMN id SET DEFAULT nextval('public.emoji_id_seq'::regclass);


--
-- Name: entities id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.entities ALTER COLUMN id SET DEFAULT nextval('public.entities_id_seq'::regclass);


--
-- Name: friends id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.friends ALTER COLUMN id SET DEFAULT nextval('public.friends_id_seq'::regclass);


--
-- Name: images id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.images ALTER COLUMN id SET DEFAULT nextval('public.images_id_seq'::regclass);


--
-- Name: langs id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.langs ALTER COLUMN id SET DEFAULT nextval('public.langs_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: music id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.music ALTER COLUMN id SET DEFAULT nextval('public.music_id_seq'::regclass);


--
-- Name: music_tags id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.music_tags ALTER COLUMN id SET DEFAULT nextval('public.music_tags_id_seq'::regclass);


--
-- Name: playlists id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.playlists ALTER COLUMN id SET DEFAULT nextval('public.playlists_id_seq'::regclass);


--
-- Name: poll_answers id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.poll_answers ALTER COLUMN id SET DEFAULT nextval('public.poll_answers_id_seq'::regclass);


--
-- Name: poll_votes id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.poll_votes ALTER COLUMN id SET DEFAULT nextval('public.poll_votes_id_seq'::regclass);


--
-- Name: polls id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.polls ALTER COLUMN id SET DEFAULT nextval('public.polls_id_seq'::regclass);


--
-- Name: profile_links id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.profile_links ALTER COLUMN id SET DEFAULT nextval('public.profile_links_id_seq'::regclass);


--
-- Name: prohibited_media id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.prohibited_media ALTER COLUMN id SET DEFAULT nextval('public.prohibited_media_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: videolibs id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videolibs ALTER COLUMN id SET DEFAULT nextval('public.videolibs_id_seq'::regclass);


--
-- Name: videos id; Type: DEFAULT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videos ALTER COLUMN id SET DEFAULT nextval('public.videos_id_seq'::regclass);


--
-- Name: albums albums_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_pk PRIMARY KEY (id);


--
-- Name: artifacts_in_content artifacts_in_content_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.artifacts_in_content
    ADD CONSTRAINT artifacts_in_content_pk PRIMARY KEY (id);


--
-- Name: artifacts artifacts_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.artifacts
    ADD CONSTRAINT artifacts_pk PRIMARY KEY (id);


--
-- Name: bans bans_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.bans
    ADD CONSTRAINT bans_pk PRIMARY KEY (id);


--
-- Name: blacklist blacklist_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.blacklist
    ADD CONSTRAINT blacklist_pk PRIMARY KEY (id);


--
-- Name: content content_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.content
    ADD CONSTRAINT content_pk PRIMARY KEY (id);


--
-- Name: emoji emoji_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.emoji
    ADD CONSTRAINT emoji_pk PRIMARY KEY (id);


--
-- Name: entities entities_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_pk PRIMARY KEY (id);


--
-- Name: friends friends_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_pk PRIMARY KEY (id);


--
-- Name: images images_in_albums_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_in_albums_pk PRIMARY KEY (id);


--
-- Name: langs langs_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.langs
    ADD CONSTRAINT langs_pk PRIMARY KEY (id);


--
-- Name: media media_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pk PRIMARY KEY (id);


--
-- Name: music music_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.music
    ADD CONSTRAINT music_pk PRIMARY KEY (id);


--
-- Name: music_tags music_tags_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.music_tags
    ADD CONSTRAINT music_tags_pk PRIMARY KEY (id);


--
-- Name: playlists playlists_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_pk PRIMARY KEY (id);


--
-- Name: poll_answers poll_answers_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.poll_answers
    ADD CONSTRAINT poll_answers_pk PRIMARY KEY (id);


--
-- Name: poll_votes poll_votes_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_pk PRIMARY KEY (id);


--
-- Name: polls polls_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_pk PRIMARY KEY (id);


--
-- Name: profile_links profile_links_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.profile_links
    ADD CONSTRAINT profile_links_pk PRIMARY KEY (id);


--
-- Name: prohibited_media prohibited_content_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.prohibited_media
    ADD CONSTRAINT prohibited_content_pk PRIMARY KEY (id);


--
-- Name: sessions sessions_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pk PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pk PRIMARY KEY (id);


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pk PRIMARY KEY (id);


--
-- Name: videolibs videolibs_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videolibs
    ADD CONSTRAINT videolibs_pk PRIMARY KEY (id);


--
-- Name: videos videos_pk; Type: CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pk PRIMARY KEY (id);


--
-- Name: albums_anon_comments_only_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX albums_anon_comments_only_index ON public.albums USING btree (anon_comments_only);


--
-- Name: albums_commentable_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX albums_commentable_index ON public.albums USING btree (commentable);


--
-- Name: albums_visibility_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX albums_visibility_index ON public.albums USING btree (visibility);


--
-- Name: artifacts_in_content_length_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX artifacts_in_content_length_index ON public.artifacts_in_content USING btree (length);


--
-- Name: artifacts_in_content_position_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX artifacts_in_content_position_index ON public.artifacts_in_content USING btree ("position");


--
-- Name: artifacts_string_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX artifacts_string_index ON public.artifacts USING btree (string);


--
-- Name: artifacts_type_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX artifacts_type_index ON public.artifacts USING btree (type);


--
-- Name: bans_banned_dt_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX bans_banned_dt_index ON public.bans USING btree (banned_dt);


--
-- Name: bans_until_dt_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX bans_until_dt_index ON public.bans USING btree (until_dt);


--
-- Name: blacklist_issued_dt_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX blacklist_issued_dt_index ON public.blacklist USING btree (issued_dt);


--
-- Name: content_hash_uindex; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE UNIQUE INDEX content_hash_uindex ON public.content USING btree (hash);


--
-- Name: emoji_string_uindex; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE UNIQUE INDEX emoji_string_uindex ON public.emoji USING btree (string);


--
-- Name: friends_since_dt_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX friends_since_dt_index ON public.friends USING btree (since_dt);


--
-- Name: images_in_albums_last_comment_index_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX images_in_albums_last_comment_index_index ON public.images USING btree (last_comment_index);


--
-- Name: images_in_albums_saved_dt_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX images_in_albums_saved_dt_index ON public.images USING btree (saved_dt);


--
-- Name: langs_code_uindex; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE UNIQUE INDEX langs_code_uindex ON public.langs USING btree (code);


--
-- Name: langs_name_uindex; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE UNIQUE INDEX langs_name_uindex ON public.langs USING btree (name);


--
-- Name: media_format_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX media_format_index ON public.media USING btree (format);


--
-- Name: media_hash_uindex; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE UNIQUE INDEX media_hash_uindex ON public.media USING btree (hash);


--
-- Name: music_artist_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX music_artist_index ON public.music USING btree (artist);


--
-- Name: music_id_saved_dt_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX music_id_saved_dt_index ON public.music USING btree (id, saved_dt);


--
-- Name: music_title_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX music_title_index ON public.music USING btree (title);


--
-- Name: playlists_anon_comments_only_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX playlists_anon_comments_only_index ON public.playlists USING btree (anon_comments_only);


--
-- Name: playlists_commentable_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX playlists_commentable_index ON public.playlists USING btree (commentable);


--
-- Name: playlists_name_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX playlists_name_index ON public.playlists USING btree (name);


--
-- Name: playlists_visibility_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX playlists_visibility_index ON public.playlists USING btree (visibility);


--
-- Name: poll_answers_index_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX poll_answers_index_index ON public.poll_answers USING btree (index);


--
-- Name: polls_closing_dt_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX polls_closing_dt_index ON public.polls USING btree (closing_dt);


--
-- Name: polls_multiple_answers_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX polls_multiple_answers_index ON public.polls USING btree (multiple_answers);


--
-- Name: polls_quiz_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX polls_quiz_index ON public.polls USING btree (quiz);


--
-- Name: polls_voting_visibility_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX polls_voting_visibility_index ON public.polls USING btree (voting_visibility);


--
-- Name: profile_links_label_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX profile_links_label_index ON public.profile_links USING btree (label);


--
-- Name: prohibited_content_hash_uindex; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE UNIQUE INDEX prohibited_content_hash_uindex ON public.prohibited_media USING btree (hash);


--
-- Name: prohibited_content_id_uindex; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE UNIQUE INDEX prohibited_content_id_uindex ON public.prohibited_media USING btree (id);


--
-- Name: prohibited_content_type_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX prohibited_content_type_index ON public.prohibited_media USING btree (type);


--
-- Name: sessions_auth_dt_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX sessions_auth_dt_index ON public.sessions USING btree (auth_dt);


--
-- Name: sessions_ip_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX sessions_ip_index ON public.sessions USING btree (ip);


--
-- Name: sessions_key_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX sessions_key_index ON public.sessions USING btree (key);


--
-- Name: sessions_useragent_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX sessions_useragent_index ON public.sessions USING btree (useragent);


--
-- Name: user_profiles_anon_comments_only_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX user_profiles_anon_comments_only_index ON public.user_profiles USING btree (anon_comments_only);


--
-- Name: user_profiles_commentable_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX user_profiles_commentable_index ON public.user_profiles USING btree (commentable);


--
-- Name: user_profiles_friendable_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX user_profiles_friendable_index ON public.user_profiles USING btree (friendable);


--
-- Name: user_profiles_invitable_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX user_profiles_invitable_index ON public.user_profiles USING btree (invitable);


--
-- Name: user_profiles_last_post_index_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX user_profiles_last_post_index_index ON public.user_profiles USING btree (last_post_index);


--
-- Name: user_profiles_name_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX user_profiles_name_index ON public.user_profiles USING btree (name);


--
-- Name: user_profiles_pinned_post_index_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX user_profiles_pinned_post_index_index ON public.user_profiles USING btree (pinned_post_index);


--
-- Name: user_profiles_searchable_user_id_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX user_profiles_searchable_user_id_index ON public.user_profiles USING btree (searchable, id);


--
-- Name: user_profiles_username_uindex; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE UNIQUE INDEX user_profiles_username_uindex ON public.user_profiles USING btree (alias);


--
-- Name: users_auth_dt_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX users_auth_dt_index ON public.users USING btree (auth_dt);


--
-- Name: users_entity_id_uindex; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE UNIQUE INDEX users_entity_id_uindex ON public.users USING btree (entity_id);


--
-- Name: users_registered_dt_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX users_registered_dt_index ON public.users USING btree (registered_dt);


--
-- Name: users_role_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX users_role_index ON public.users USING btree (role);


--
-- Name: users_tg_id_uindex; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE UNIQUE INDEX users_tg_id_uindex ON public.users USING btree (tg_id);


--
-- Name: users_tg_username_uindex; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE UNIQUE INDEX users_tg_username_uindex ON public.users USING btree (tg_username);


--
-- Name: videolibs_anon_comments_only_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX videolibs_anon_comments_only_index ON public.videolibs USING btree (anon_comments_only);


--
-- Name: videolibs_commentable_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX videolibs_commentable_index ON public.videolibs USING btree (commentable);


--
-- Name: videolibs_name_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX videolibs_name_index ON public.videolibs USING btree (name);


--
-- Name: videolibs_visibility_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX videolibs_visibility_index ON public.videolibs USING btree (visibility);


--
-- Name: videos_360_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX videos_360_index ON public.videos USING btree ("360");


--
-- Name: videos_content_rating_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX videos_content_rating_index ON public.videos USING btree (content_rating);


--
-- Name: videos_last_comment_index_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX videos_last_comment_index_index ON public.videos USING btree (last_comment_index);


--
-- Name: videos_saved_dt_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX videos_saved_dt_index ON public.videos USING btree (saved_dt);


--
-- Name: videos_title_index; Type: INDEX; Schema: public; Owner: sodesu
--

CREATE INDEX videos_title_index ON public.videos USING btree (title);


--
-- Name: albums albums_content_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_content_id_fk FOREIGN KEY (descr_id) REFERENCES public.content(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: albums albums_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_entities_id_fk FOREIGN KEY (owner_id) REFERENCES public.entities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: albums albums_images_in_albums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_images_in_albums_id_fk FOREIGN KEY (poster_image_id) REFERENCES public.images(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: artifacts_in_content artifacts_in_content_artifacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.artifacts_in_content
    ADD CONSTRAINT artifacts_in_content_artifacts_id_fk FOREIGN KEY (artifact_id) REFERENCES public.artifacts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: artifacts_in_content artifacts_in_content_content_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.artifacts_in_content
    ADD CONSTRAINT artifacts_in_content_content_id_fk FOREIGN KEY (content_id) REFERENCES public.content(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bans bans_content_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.bans
    ADD CONSTRAINT bans_content_id_fk FOREIGN KEY (reason_id) REFERENCES public.content(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bans bans_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.bans
    ADD CONSTRAINT bans_entities_id_fk FOREIGN KEY (entity_id) REFERENCES public.entities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: blacklist blacklist_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.blacklist
    ADD CONSTRAINT blacklist_entities_id_fk FOREIGN KEY (issuer_id) REFERENCES public.entities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: blacklist blacklist_entities_id_fk_2; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.blacklist
    ADD CONSTRAINT blacklist_entities_id_fk_2 FOREIGN KEY (issuer_id) REFERENCES public.entities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: friends friends_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_users_id_fk FOREIGN KEY (offerer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: friends friends_users_id_fk_2; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_users_id_fk_2 FOREIGN KEY (acceptor_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: images images_in_albums_albums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_in_albums_albums_id_fk FOREIGN KEY (album_id) REFERENCES public.albums(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: images images_in_albums_content_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_in_albums_content_id_fk FOREIGN KEY (descr_id) REFERENCES public.content(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: images images_in_albums_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_in_albums_entities_id_fk FOREIGN KEY (owner_id) REFERENCES public.entities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: media media_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_users_id_fk FOREIGN KEY (uploader_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: music music_content_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.music
    ADD CONSTRAINT music_content_id_fk FOREIGN KEY (lyrics_id) REFERENCES public.content(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: music music_images_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.music
    ADD CONSTRAINT music_images_id_fk FOREIGN KEY (poster_image_id) REFERENCES public.images(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: music music_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.music
    ADD CONSTRAINT music_media_id_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: music music_playlists_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.music
    ADD CONSTRAINT music_playlists_id_fk FOREIGN KEY (playlist_id) REFERENCES public.playlists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: music_tags music_tags_artifacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.music_tags
    ADD CONSTRAINT music_tags_artifacts_id_fk FOREIGN KEY (tag_id) REFERENCES public.artifacts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: music_tags music_tags_music_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.music_tags
    ADD CONSTRAINT music_tags_music_id_fk FOREIGN KEY (music_id) REFERENCES public.music(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: playlists playlists_content_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_content_id_fk FOREIGN KEY (descr_id) REFERENCES public.content(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: playlists playlists_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_entities_id_fk FOREIGN KEY (owner_id) REFERENCES public.entities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: playlists playlists_images_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_images_id_fk FOREIGN KEY (poster_image_id) REFERENCES public.images(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poll_answers poll_answers_content_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.poll_answers
    ADD CONSTRAINT poll_answers_content_id_fk FOREIGN KEY (text_id) REFERENCES public.content(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poll_answers poll_answers_polls_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.poll_answers
    ADD CONSTRAINT poll_answers_polls_id_fk FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poll_votes poll_votes_poll_answers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_poll_answers_id_fk FOREIGN KEY (answer_id) REFERENCES public.poll_answers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poll_votes poll_votes_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: polls polls_content_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_content_id_fk FOREIGN KEY (hint_id) REFERENCES public.content(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: polls polls_poll_answers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_poll_answers_id_fk FOREIGN KEY (corrent_answer_id) REFERENCES public.poll_answers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: profile_links profile_links_artifacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.profile_links
    ADD CONSTRAINT profile_links_artifacts_id_fk FOREIGN KEY (artifact_id) REFERENCES public.artifacts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: profile_links profile_links_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.profile_links
    ADD CONSTRAINT profile_links_entities_id_fk FOREIGN KEY (entity_id) REFERENCES public.entities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_content_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_content_id_fk FOREIGN KEY (bio_id) REFERENCES public.content(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_images_in_albums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_images_in_albums_id_fk FOREIGN KEY (cover_image_id) REFERENCES public.images(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_images_in_albums_id_fk_2; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_images_in_albums_id_fk_2 FOREIGN KEY (avatar_image_id) REFERENCES public.images(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_users_id_fk FOREIGN KEY (id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_entities_id_fk FOREIGN KEY (entity_id) REFERENCES public.entities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: videolibs videolibs_content_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videolibs
    ADD CONSTRAINT videolibs_content_id_fk FOREIGN KEY (descr_id) REFERENCES public.content(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: videolibs videolibs_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videolibs
    ADD CONSTRAINT videolibs_entities_id_fk FOREIGN KEY (owner_id) REFERENCES public.entities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: videolibs videolibs_images_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videolibs
    ADD CONSTRAINT videolibs_images_id_fk FOREIGN KEY (poster_image_id) REFERENCES public.images(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: videos videos_content_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_content_id_fk FOREIGN KEY (descr_id) REFERENCES public.content(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: videos videos_entities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_entities_id_fk FOREIGN KEY (owner_id) REFERENCES public.entities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: videos videos_images_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_images_id_fk FOREIGN KEY (poster_image_id) REFERENCES public.images(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: videos videos_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_media_id_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: videos videos_videolibs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sodesu
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_videolibs_id_fk FOREIGN KEY (videolib_id) REFERENCES public.videolibs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

