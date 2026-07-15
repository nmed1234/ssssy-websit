--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-07-10 14:52:06

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'WIN1251';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 67801)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5970 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 272 (class 1259 OID 68958)
-- Name: admin_notifications; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.admin_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(500) NOT NULL,
    body text,
    type character varying(50) DEFAULT 'INFO'::character varying NOT NULL,
    related_entity_type character varying(50),
    related_entity_id uuid,
    is_read boolean DEFAULT false,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_notifications OWNER TO ssssy;

--
-- TOC entry 224 (class 1259 OID 67918)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id uuid,
    old_value jsonb,
    new_value jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO ssssy;

--
-- TOC entry 257 (class 1259 OID 68616)
-- Name: board_members; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.board_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    position_ar character varying(200) NOT NULL,
    position_en character varying(200),
    term_start date,
    term_end date,
    bio text,
    photo_url character varying(500),
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.board_members OWNER TO ssssy;

--
-- TOC entry 225 (class 1259 OID 67940)
-- Name: categories; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_ar character varying(200) NOT NULL,
    name_en character varying(200),
    slug character varying(220) NOT NULL,
    description text,
    parent_id uuid,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO ssssy;

--
-- TOC entry 271 (class 1259 OID 68934)
-- Name: comment_events; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.comment_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    comment_id uuid NOT NULL,
    event_type character varying(50) NOT NULL,
    event_data text NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    initiated_by uuid NOT NULL,
    recipients text[] DEFAULT '{}'::text[],
    is_processed boolean DEFAULT false,
    sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comment_events OWNER TO ssssy;

--
-- TOC entry 255 (class 1259 OID 68573)
-- Name: comments; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid NOT NULL,
    parent_id uuid,
    author_id uuid NOT NULL,
    body text NOT NULL,
    is_approved boolean DEFAULT false,
    approved_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comments OWNER TO ssssy;

--
-- TOC entry 268 (class 1259 OID 68853)
-- Name: component_templates; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.component_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(50) NOT NULL,
    component_type character varying(100) NOT NULL,
    thumbnail_url character varying(500),
    default_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    default_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    default_styling jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.component_templates OWNER TO ssssy;

--
-- TOC entry 238 (class 1259 OID 68221)
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    email character varying(320) NOT NULL,
    subject character varying(500) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    phone character varying(50),
    read_by uuid,
    replied_at timestamp without time zone
);


ALTER TABLE public.contact_submissions OWNER TO ssssy;

--
-- TOC entry 227 (class 1259 OID 67968)
-- Name: content_items; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.content_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_ar character varying(500) NOT NULL,
    title_en character varying(500),
    slug character varying(550) NOT NULL,
    excerpt text,
    body jsonb,
    content_type character varying(50) DEFAULT 'ARTICLE'::character varying NOT NULL,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    author_id uuid NOT NULL,
    reviewer_id uuid,
    publisher_id uuid,
    category_id uuid,
    featured_image character varying(500),
    is_featured boolean DEFAULT false,
    is_pinned boolean DEFAULT false,
    is_member_only boolean DEFAULT false,
    published_at timestamp without time zone,
    scheduled_at timestamp without time zone,
    archived_at timestamp without time zone,
    view_count bigint DEFAULT 0,
    meta_title character varying(200),
    meta_description character varying(500),
    meta_keywords character varying(255),
    og_image_url character varying(500),
    og_title character varying(200),
    og_description character varying(500),
    version integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.content_items OWNER TO ssssy;

--
-- TOC entry 277 (class 1259 OID 69081)
-- Name: content_strings; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.content_strings (
    id uuid NOT NULL,
    string_key character varying(255) NOT NULL,
    value_en text DEFAULT ''::text NOT NULL,
    value_ar text DEFAULT ''::text NOT NULL,
    string_group character varying(100) DEFAULT 'general'::character varying NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.content_strings OWNER TO ssssy;

--
-- TOC entry 228 (class 1259 OID 68007)
-- Name: content_tags; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.content_tags (
    content_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


ALTER TABLE public.content_tags OWNER TO ssssy;

--
-- TOC entry 229 (class 1259 OID 68022)
-- Name: content_versions; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.content_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid NOT NULL,
    version integer NOT NULL,
    title_ar character varying(500),
    title_en character varying(500),
    excerpt text,
    body jsonb,
    status character varying(30),
    changed_by uuid NOT NULL,
    change_summary character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.content_versions OWNER TO ssssy;

--
-- TOC entry 270 (class 1259 OID 68906)
-- Name: crm_contacts; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.crm_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    first_name character varying(200) NOT NULL,
    last_name character varying(200) NOT NULL,
    email character varying(320) NOT NULL,
    phone character varying(50),
    organization character varying(500),
    "position" character varying(500),
    contact_type character varying(50) DEFAULT 'GENERAL'::character varying,
    relationship_level character varying(50) DEFAULT 'casual'::character varying,
    notes text,
    source character varying(100),
    is_primary boolean DEFAULT false,
    is_active boolean DEFAULT true,
    last_contact_at timestamp without time zone,
    next_followup_at timestamp without time zone,
    tags text[],
    preferences text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid
);


ALTER TABLE public.crm_contacts OWNER TO ssssy;

--
-- TOC entry 239 (class 1259 OID 68232)
-- Name: email_accounts; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email_address character varying(320) NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    display_name character varying(200),
    quota_bytes bigint DEFAULT 1073741824,
    used_bytes bigint DEFAULT 0,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    auto_reply_enabled boolean DEFAULT false,
    auto_reply_subject character varying(500),
    auto_reply_body text,
    auto_reply_starts_at timestamp without time zone,
    auto_reply_ends_at timestamp without time zone,
    forward_to character varying(320),
    forward_keep_copy boolean DEFAULT true,
    signature text,
    imap_subscribed boolean DEFAULT true,
    last_sync_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_accounts OWNER TO ssssy;

--
-- TOC entry 249 (class 1259 OID 68452)
-- Name: email_aliases; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_aliases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    alias_address character varying(320) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_aliases OWNER TO ssssy;

--
-- TOC entry 243 (class 1259 OID 68338)
-- Name: email_attachments; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    filename character varying(500) NOT NULL,
    mime_type character varying(200) NOT NULL,
    size_bytes integer NOT NULL,
    storage_path character varying(1000) NOT NULL,
    content_id character varying(500),
    is_inline boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_attachments OWNER TO ssssy;

--
-- TOC entry 246 (class 1259 OID 68388)
-- Name: email_contact_group_members; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_contact_group_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_contact_group_members OWNER TO ssssy;

--
-- TOC entry 245 (class 1259 OID 68372)
-- Name: email_contact_groups; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_contact_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    color character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_contact_groups OWNER TO ssssy;

--
-- TOC entry 244 (class 1259 OID 68354)
-- Name: email_contacts; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    email character varying(320) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    display_name character varying(200),
    company character varying(200),
    "position" character varying(200),
    phone character varying(50),
    mobile character varying(50),
    notes text,
    is_favorite boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_contacts OWNER TO ssssy;

--
-- TOC entry 248 (class 1259 OID 68432)
-- Name: email_distribution_list_members; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_distribution_list_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    list_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_moderator boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_distribution_list_members OWNER TO ssssy;

--
-- TOC entry 247 (class 1259 OID 68407)
-- Name: email_distribution_lists; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_distribution_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    email_address character varying(320) NOT NULL,
    description text,
    list_type character varying(50) DEFAULT 'DEPARTMENT'::character varying NOT NULL,
    is_public boolean DEFAULT true,
    allow_external boolean DEFAULT false,
    moderator_id uuid,
    requires_moderation boolean DEFAULT false,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_distribution_lists OWNER TO ssssy;

--
-- TOC entry 240 (class 1259 OID 68260)
-- Name: email_folders; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    parent_id uuid,
    name character varying(200) NOT NULL,
    folder_type character varying(50) DEFAULT 'CUSTOM'::character varying NOT NULL,
    system_folder boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    unread_count integer DEFAULT 0,
    total_count integer DEFAULT 0,
    imap_folder_name character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_folders OWNER TO ssssy;

--
-- TOC entry 241 (class 1259 OID 68286)
-- Name: email_messages; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    folder_id uuid NOT NULL,
    message_id character varying(500),
    in_reply_to character varying(500),
    references_header text,
    thread_id uuid,
    sender_address character varying(320) NOT NULL,
    sender_name character varying(200),
    reply_to_address character varying(320),
    reply_to_name character varying(200),
    subject character varying(998),
    body_text text,
    body_html text,
    preview_text character varying(500),
    size_bytes integer DEFAULT 0,
    has_attachments boolean DEFAULT false,
    attachment_count integer DEFAULT 0,
    priority character varying(20) DEFAULT 'NORMAL'::character varying,
    is_read boolean DEFAULT false,
    is_flagged boolean DEFAULT false,
    is_starred boolean DEFAULT false,
    is_draft boolean DEFAULT false,
    is_scheduled boolean DEFAULT false,
    scheduled_send_at timestamp without time zone,
    actually_sent_at timestamp without time zone,
    imap_uid bigint,
    delivery_status character varying(30) DEFAULT 'PENDING'::character varying,
    bounce_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_messages OWNER TO ssssy;

--
-- TOC entry 262 (class 1259 OID 68709)
-- Name: email_quota_logs; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_quota_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    used_bytes_before bigint NOT NULL,
    used_bytes_after bigint NOT NULL,
    change_bytes bigint NOT NULL,
    operation character varying(50) NOT NULL,
    message_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_quota_logs OWNER TO ssssy;

--
-- TOC entry 242 (class 1259 OID 68321)
-- Name: email_recipients; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_recipients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    recipient_type character varying(20) NOT NULL,
    address character varying(320) NOT NULL,
    name character varying(200),
    is_internal boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_recipients OWNER TO ssssy;

--
-- TOC entry 250 (class 1259 OID 68467)
-- Name: email_rules; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    order_index integer DEFAULT 0,
    is_enabled boolean DEFAULT true,
    stop_processing boolean DEFAULT false,
    match_all boolean DEFAULT true,
    conditions jsonb DEFAULT '[]'::jsonb NOT NULL,
    actions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_rules OWNER TO ssssy;

--
-- TOC entry 261 (class 1259 OID 68689)
-- Name: email_scheduled_sends; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.email_scheduled_sends (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    account_id uuid NOT NULL,
    scheduled_at timestamp without time zone NOT NULL,
    status character varying(30) DEFAULT 'PENDING'::character varying,
    error_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamp without time zone
);


ALTER TABLE public.email_scheduled_sends OWNER TO ssssy;

--
-- TOC entry 269 (class 1259 OID 68879)
-- Name: event_registrations; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.event_registrations (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    email character varying(320) NOT NULL,
    phone character varying(50),
    organization character varying(500),
    notes text,
    status character varying(50) DEFAULT 'CONFIRMED'::character varying,
    registered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    checked_in boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.event_registrations OWNER TO ssssy;

--
-- TOC entry 235 (class 1259 OID 68163)
-- Name: events; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_ar character varying(500) NOT NULL,
    title_en character varying(500),
    slug character varying(550) NOT NULL,
    description text,
    event_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    location character varying(500),
    location_url character varying(1000),
    event_type character varying(50),
    organizer character varying(500),
    featured_image character varying(500),
    is_published boolean DEFAULT false,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    address character varying(500),
    latitude double precision,
    longitude double precision,
    is_online boolean DEFAULT false,
    online_url character varying(1000),
    max_participants integer,
    registration_deadline timestamp without time zone,
    status character varying(50) DEFAULT 'DRAFT'::character varying,
    contact_email character varying(320)
);


ALTER TABLE public.events OWNER TO ssssy;

--
-- TOC entry 218 (class 1259 OID 67792)
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO ssssy;

--
-- TOC entry 273 (class 1259 OID 68976)
-- Name: gallery_albums; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.gallery_albums (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_ar character varying(500) NOT NULL,
    title_en character varying(500) NOT NULL,
    description_ar text,
    description_en text,
    slug character varying(500) NOT NULL,
    cover_image_id uuid,
    is_published boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    password_hash character varying(255),
    is_password_protected boolean DEFAULT false NOT NULL,
    watermark_overrides jsonb,
    settings_overrides jsonb,
    view_count integer DEFAULT 0 NOT NULL,
    download_count integer DEFAULT 0 NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.gallery_albums OWNER TO ssssy;

--
-- TOC entry 276 (class 1259 OID 69050)
-- Name: gallery_analytics_events; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.gallery_analytics_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    album_id uuid,
    image_id uuid,
    share_link_id uuid,
    event_type character varying(20) NOT NULL,
    ip_address character varying(45),
    user_agent text,
    referer character varying(500),
    session_id character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT gallery_analytics_events_event_type_check CHECK (((event_type)::text = ANY ((ARRAY['VIEW'::character varying, 'DOWNLOAD'::character varying, 'SHARE'::character varying, 'PRINT'::character varying])::text[])))
);


ALTER TABLE public.gallery_analytics_events OWNER TO ssssy;

--
-- TOC entry 274 (class 1259 OID 69003)
-- Name: gallery_images; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.gallery_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    album_id uuid NOT NULL,
    media_file_id uuid NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    title_ar character varying(500),
    title_en character varying(500),
    description_ar text,
    description_en text,
    alt_text character varying(500),
    before_media_file_id uuid,
    hotspot_data jsonb,
    exif_data jsonb,
    color_palette jsonb,
    is_cover boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.gallery_images OWNER TO ssssy;

--
-- TOC entry 275 (class 1259 OID 69029)
-- Name: gallery_share_links; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.gallery_share_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    album_id uuid NOT NULL,
    token character varying(64) NOT NULL,
    expires_at timestamp without time zone,
    max_views integer,
    current_views integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.gallery_share_links OWNER TO ssssy;

--
-- TOC entry 237 (class 1259 OID 68204)
-- Name: job_applications; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.job_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_vacancy_id uuid NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(320) NOT NULL,
    phone character varying(50),
    cover_letter text,
    cv_file_path character varying(500),
    status character varying(30) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.job_applications OWNER TO ssssy;

--
-- TOC entry 236 (class 1259 OID 68184)
-- Name: job_vacancies; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.job_vacancies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_ar character varying(500) NOT NULL,
    title_en character varying(500),
    slug character varying(550) NOT NULL,
    description text,
    requirements text,
    location character varying(500),
    job_type character varying(50),
    department character varying(200),
    deadline date,
    is_published boolean DEFAULT false,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.job_vacancies OWNER TO ssssy;

--
-- TOC entry 231 (class 1259 OID 68071)
-- Name: media_files; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.media_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    filename character varying(500) NOT NULL,
    original_filename character varying(500) NOT NULL,
    mime_type character varying(100) NOT NULL,
    size_bytes bigint NOT NULL,
    storage_path character varying(1000) NOT NULL,
    url character varying(1000),
    thumbnail_url character varying(1000),
    width integer,
    height integer,
    alt_text_ar character varying(500),
    alt_text_en character varying(500),
    folder_id uuid,
    user_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.media_files OWNER TO ssssy;

--
-- TOC entry 230 (class 1259 OID 68053)
-- Name: media_folders; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.media_folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    parent_id uuid,
    user_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.media_folders OWNER TO ssssy;

--
-- TOC entry 263 (class 1259 OID 68735)
-- Name: media_thumbnails; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.media_thumbnails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    media_file_id uuid NOT NULL,
    thumbnail_path character varying(1000) NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    mime_type character varying(100),
    size_bytes bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.media_thumbnails OWNER TO ssssy;

--
-- TOC entry 258 (class 1259 OID 68633)
-- Name: member_profiles; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.member_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    membership_type character varying(50) DEFAULT 'REGULAR'::character varying,
    membership_number character varying(50),
    specialization character varying(255),
    research_interests text,
    education text,
    publications_count integer DEFAULT 0,
    is_public boolean DEFAULT true,
    joined_at date,
    membership_expires_at date,
    orcid_id character varying(50),
    google_scholar_url character varying(500),
    linkedin_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.member_profiles OWNER TO ssssy;

--
-- TOC entry 254 (class 1259 OID 68546)
-- Name: menu_items; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    menu_id uuid NOT NULL,
    parent_id uuid,
    label_ar character varying(200) NOT NULL,
    label_en character varying(200),
    url character varying(500),
    target character varying(20) DEFAULT '_self'::character varying,
    icon character varying(100),
    page_id uuid,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menu_items OWNER TO ssssy;

--
-- TOC entry 253 (class 1259 OID 68538)
-- Name: menus; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.menus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    location character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menus OWNER TO ssssy;

--
-- TOC entry 256 (class 1259 OID 68604)
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(320) NOT NULL,
    name character varying(200),
    is_active boolean DEFAULT true,
    subscribed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at timestamp without time zone
);


ALTER TABLE public.newsletter_subscribers OWNER TO ssssy;

--
-- TOC entry 234 (class 1259 OID 68138)
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    workflow_email boolean DEFAULT true,
    workflow_inapp boolean DEFAULT true,
    email_received_email boolean DEFAULT true,
    email_received_inapp boolean DEFAULT true,
    system_announcement_email boolean DEFAULT true,
    system_announcement_inapp boolean DEFAULT true,
    comment_email boolean DEFAULT false,
    comment_inapp boolean DEFAULT true,
    event_reminder_email boolean DEFAULT true,
    event_reminder_inapp boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notification_preferences OWNER TO ssssy;

--
-- TOC entry 233 (class 1259 OID 68120)
-- Name: notifications; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(500) NOT NULL,
    body text,
    link character varying(1000),
    reference_id uuid,
    reference_type character varying(50),
    is_read boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO ssssy;

--
-- TOC entry 252 (class 1259 OID 68514)
-- Name: page_sections; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.page_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid NOT NULL,
    component_type character varying(100) NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    styling jsonb DEFAULT '{}'::jsonb NOT NULL,
    sort_order integer DEFAULT 0,
    visibility character varying(20) DEFAULT 'ALWAYS'::character varying,
    is_animated boolean DEFAULT false,
    animation_type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.page_sections OWNER TO ssssy;

--
-- TOC entry 251 (class 1259 OID 68488)
-- Name: pages; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_ar character varying(500) NOT NULL,
    title_en character varying(500),
    slug character varying(550) NOT NULL,
    layout_type character varying(50) DEFAULT 'FLEXIBLE'::character varying,
    is_published boolean DEFAULT false,
    is_homepage boolean DEFAULT false,
    parent_id uuid,
    sort_order integer DEFAULT 0,
    author_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone,
    meta_title character varying(200),
    meta_description character varying(500),
    og_title character varying(200),
    og_description character varying(500),
    og_image_url character varying(500)
);


ALTER TABLE public.pages OWNER TO ssssy;

--
-- TOC entry 220 (class 1259 OID 67852)
-- Name: permissions; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(200),
    category character varying(50),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.permissions OWNER TO ssssy;

--
-- TOC entry 223 (class 1259 OID 67901)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token character varying(500) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    is_revoked boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.refresh_tokens OWNER TO ssssy;

--
-- TOC entry 221 (class 1259 OID 67863)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role_permissions OWNER TO ssssy;

--
-- TOC entry 219 (class 1259 OID 67838)
-- Name: roles; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    display_name_ar character varying(100),
    display_name_en character varying(100),
    description text,
    hierarchy_level integer DEFAULT 0 NOT NULL,
    is_system boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO ssssy;

--
-- TOC entry 281 (class 1259 OID 69149)
-- Name: sensor_readings; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.sensor_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sensor_id uuid NOT NULL,
    value double precision NOT NULL,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sensor_readings OWNER TO ssssy;

--
-- TOC entry 280 (class 1259 OID 69134)
-- Name: sensors; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.sensors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    location character varying(255),
    sensor_type character varying(50) NOT NULL,
    unit character varying(20),
    latitude double precision,
    longitude double precision,
    is_active boolean DEFAULT true,
    farm_boundary_geojson text,
    alert_threshold_min double precision,
    alert_threshold_max double precision,
    alert_enabled boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sensors OWNER TO ssssy;

--
-- TOC entry 259 (class 1259 OID 68655)
-- Name: seo_metadata; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.seo_metadata (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    meta_title character varying(200),
    meta_description character varying(500),
    og_title character varying(200),
    og_description character varying(500),
    og_image_url character varying(500),
    canonical_url character varying(500),
    robots character varying(100) DEFAULT 'index, follow'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.seo_metadata OWNER TO ssssy;

--
-- TOC entry 278 (class 1259 OID 69097)
-- Name: site_sections; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.site_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    slug character varying(250),
    component_type character varying(100) NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    styling jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    location character varying(50) DEFAULT 'general'::character varying
);


ALTER TABLE public.site_sections OWNER TO ssssy;

--
-- TOC entry 260 (class 1259 OID 68668)
-- Name: system_config; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.system_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    config_key character varying(200) NOT NULL,
    config_value text NOT NULL,
    config_group character varying(100) DEFAULT 'GENERAL'::character varying,
    config_type character varying(50) DEFAULT 'STRING'::character varying,
    is_encrypted boolean DEFAULT false,
    is_public boolean DEFAULT true,
    description character varying(500),
    updated_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_config OWNER TO ssssy;

--
-- TOC entry 226 (class 1259 OID 67959)
-- Name: tags; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_ar character varying(100) NOT NULL,
    name_en character varying(100),
    slug character varying(120) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tags OWNER TO ssssy;

--
-- TOC entry 279 (class 1259 OID 69119)
-- Name: theme_settings; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.theme_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    setting_type character varying(50) DEFAULT 'text'::character varying NOT NULL,
    group_name character varying(50) DEFAULT 'general'::character varying NOT NULL,
    label character varying(200),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.theme_settings OWNER TO ssssy;

--
-- TOC entry 222 (class 1259 OID 67879)
-- Name: users; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name_ar character varying(100),
    last_name_ar character varying(100),
    first_name_en character varying(100),
    last_name_en character varying(100),
    phone character varying(50),
    avatar_url character varying(500),
    role_id uuid NOT NULL,
    is_active boolean DEFAULT true,
    is_email_verified boolean DEFAULT false,
    email_verified_at timestamp without time zone,
    last_login_at timestamp without time zone,
    failed_login_attempts integer DEFAULT 0,
    account_locked_until timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    institution character varying(200),
    department character varying(200),
    "position" character varying(200),
    specialization character varying(200),
    biography text,
    address character varying(500),
    city character varying(100),
    country character varying(100),
    two_factor_enabled boolean DEFAULT false,
    deleted_at timestamp without time zone,
    two_factor_secret character varying(255),
    preferred_language character varying(10) DEFAULT 'en'::character varying
);


ALTER TABLE public.users OWNER TO ssssy;

--
-- TOC entry 267 (class 1259 OID 68813)
-- Name: workflow_actions; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.workflow_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid NOT NULL,
    workflow_id uuid NOT NULL,
    from_state_id uuid,
    to_state_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    actor_id uuid NOT NULL,
    comments text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflow_actions OWNER TO ssssy;

--
-- TOC entry 232 (class 1259 OID 68094)
-- Name: workflow_logs; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.workflow_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_id uuid NOT NULL,
    from_status character varying(30),
    to_status character varying(30) NOT NULL,
    action character varying(50) NOT NULL,
    actor_id uuid NOT NULL,
    assignee_id uuid,
    comments text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflow_logs OWNER TO ssssy;

--
-- TOC entry 265 (class 1259 OID 68763)
-- Name: workflow_states; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.workflow_states (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    name character varying(50) NOT NULL,
    label_ar character varying(255) NOT NULL,
    label_en character varying(255) NOT NULL,
    color character varying(7) DEFAULT '#6B7280'::character varying,
    is_initial boolean DEFAULT false NOT NULL,
    is_final boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflow_states OWNER TO ssssy;

--
-- TOC entry 266 (class 1259 OID 68783)
-- Name: workflow_transitions; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.workflow_transitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    from_state_id uuid NOT NULL,
    to_state_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    roles_allowed jsonb DEFAULT '[]'::jsonb NOT NULL,
    require_comment boolean DEFAULT false NOT NULL,
    conditions jsonb DEFAULT '{}'::jsonb,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflow_transitions OWNER TO ssssy;

--
-- TOC entry 264 (class 1259 OID 68750)
-- Name: workflows; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_type character varying(50) NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflows OWNER TO ssssy;

--
-- TOC entry 5955 (class 0 OID 68958)
-- Dependencies: 272
-- Data for Name: admin_notifications; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.admin_notifications (id, title, body, type, related_entity_type, related_entity_id, is_read, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5907 (class 0 OID 67918)
-- Dependencies: 224
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- TOC entry 5940 (class 0 OID 68616)
-- Dependencies: 257
-- Data for Name: board_members; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.board_members (id, user_id, position_ar, position_en, term_start, term_end, bio, photo_url, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5908 (class 0 OID 67940)
-- Dependencies: 225
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.categories (id, name_ar, name_en, slug, description, parent_id, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5954 (class 0 OID 68934)
-- Dependencies: 271
-- Data for Name: comment_events; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.comment_events (id, comment_id, event_type, event_data, entity_type, entity_id, initiated_by, recipients, is_processed, sent_at, created_at) FROM stdin;
\.


--
-- TOC entry 5938 (class 0 OID 68573)
-- Dependencies: 255
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.comments (id, content_id, parent_id, author_id, body, is_approved, approved_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5951 (class 0 OID 68853)
-- Dependencies: 268
-- Data for Name: component_templates; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.component_templates (id, name, category, component_type, thumbnail_url, default_config, default_data, default_styling, is_system, sort_order, created_at, updated_at) FROM stdin;
d4e5f6a7-b8c9-0123-defa-123456789abc	Basic Container	layout	container	\N	{"tag": "div", "styles": {"maxWidth": "1200px"}, "className": "container mx-auto px-4"}	{}	{}	t	0	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
e5f6a7b8-c9d0-1234-efab-234567890bcd	Two Column Grid	layout	grid	\N	{"gap": "1rem", "columns": 2, "breakpoint": "md"}	{}	{}	t	1	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
f6a7b8c9-d0e1-2345-fabc-3456789012cd	Hero Title	content	title	\N	{"align": "center", "level": "h1", "className": "text-4xl font-bold"}	{}	{}	t	2	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
a7b8c9d0-e1f2-3456-abcd-4567890123de	Text Paragraph	content	paragraph	\N	{"className": "text-base leading-relaxed"}	{}	{}	t	3	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
b8c9d0e1-f2a3-4567-bcde-5678901234ef	Image	content	image	\N	{"objectFit": "cover", "borderRadius": "0.5rem"}	{}	{}	t	4	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
c9d0e1f2-a3b4-5678-cdef-6789012345f0	Image Gallery	media	gallery	\N	{"gap": "1rem", "columns": 3, "aspectRatio": "4/3"}	{}	{}	t	5	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
d0e1f2a3-b4c5-6789-defa-7890123456a1	Button	interactive	button	\N	{"size": "md", "variant": "primary", "className": "bg-soil-clay text-white px-6 py-2 rounded-lg"}	{}	{}	t	6	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
e1f2a3b4-c5d6-7890-efab-8901234567b2	Card	interactive	card	\N	{"shadow": "md", "padding": "1.5rem", "rounded": "lg"}	{}	{}	t	7	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
f2a3b4c5-d6e7-8901-fabc-9012345678c3	Carousel	media	carousel	\N	{"autoplay": true, "interval": 5000, "showDots": true}	{}	{}	t	8	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
a3b4c5d6-e7f8-9012-abcd-0123456789d4	Video	media	video	\N	{"loop": false, "autoplay": false, "controls": true}	{}	{}	t	9	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
\.


--
-- TOC entry 5921 (class 0 OID 68221)
-- Dependencies: 238
-- Data for Name: contact_submissions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.contact_submissions (id, name, email, subject, message, is_read, created_at, phone, read_by, replied_at) FROM stdin;
\.


--
-- TOC entry 5910 (class 0 OID 67968)
-- Dependencies: 227
-- Data for Name: content_items; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_items (id, title_ar, title_en, slug, excerpt, body, content_type, status, author_id, reviewer_id, publisher_id, category_id, featured_image, is_featured, is_pinned, is_member_only, published_at, scheduled_at, archived_at, view_count, meta_title, meta_description, meta_keywords, og_image_url, og_title, og_description, version, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5960 (class 0 OID 69081)
-- Dependencies: 277
-- Data for Name: content_strings; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_strings (id, string_key, value_en, value_ar, string_group, description, created_at, updated_at) FROM stdin;
\.


