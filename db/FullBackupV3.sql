--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-07-10 18:23:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
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
e29726bf-252b-4290-8bfa-411416d1599b	nav.home	Home	الرئيسية	navigation	Navigation: Home link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
bc04e700-0b68-443f-877a-ab4c58ec3e1c	nav.about	About	من نحن	navigation	Navigation: About link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
856758f7-c2a2-4bb8-8fbc-7c261029160b	nav.news	News	الأخبار	navigation	Navigation: News link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
a80078f5-0b97-4f84-b5d2-dfc13446aa35	nav.events	Events	الفعاليات	navigation	Navigation: Events link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
4419994f-400b-468e-a307-33811201ebd7	nav.jobs	Jobs	الوظائف	navigation	Navigation: Jobs link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
e114b3e3-0eba-4cd6-8394-95e02744ddb4	nav.contact	Contact	اتصل بنا	navigation	Navigation: Contact link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
8ec35fca-7890-478d-8543-0db16968230e	nav.publications	Publications	المنشورات	navigation	Navigation: Publications link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
86c95b4b-7dc9-4a58-8c64-b4b89e1e6685	nav.membership	Membership	العضوية	navigation	Navigation: Membership link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
9f45e994-213c-4af4-862d-0ea96e817172	nav.login	Login	تسجيل الدخول	navigation	Navigation: Login link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
e993a31d-16d2-42aa-a3da-b3c4a1b3284e	footer.quick_links	Quick Links	روابط سريعة	footer	Footer: Quick Links heading	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
60df72c9-f37c-4212-8b7e-11bef39bcd74	footer.contact_info	Contact Info	معلومات الاتصال	footer	Footer: Contact Info heading	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
2cd4f795-21fb-4aaa-a55b-d86106d8fb57	footer.about_heading	About SSSSY	عن الجمعية	footer	Footer: About heading	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
beaa83e9-8adf-4002-bbec-b570cbc4dd06	footer.about_text	The Syrian Soil Science Society (SSSSY) is dedicated to advancing soil science and sustainable land management in Syria.	تكرس الجمعية السورية لعلوم التربة جهودها لتطوير علوم التربة والإدارة المستدامة للأراضي في سوريا.	footer	Footer: About description	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
522d479f-4853-4b59-985f-077aaecf5fdc	footer.address	Damascus, Syria	دمشق، سوريا	footer	Footer: Address	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
f5201838-4d6a-40b2-9eed-9d6cd6694722	footer.email	info@ssssy.org	info@ssssy.org	footer	Footer: Email	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
1ad04518-ecfe-4968-8797-6b1dc5f7f9d8	footer.phone	+963 11 234 5678	+963 11 234 5678	footer	Footer: Phone	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
dbdcfb37-82ed-4d82-8807-1833d229383a	footer.copyright	Syrian Soil Science Society (SSSSY). All rights reserved.	الجمعية السورية لعلوم التربة. جميع الحقوق محفوظة.	footer	Footer: Copyright text	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
e6d3d1ed-b9d3-4ded-bc7b-9e6d50bd864b	site.name	SSSSY	الجمعية السورية لعلوم التربة	site	Site name	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
5056c17e-ace4-4518-b31a-465f08b519b4	site.short_name	SSSSY	جمعية علوم التربة	site	Site short name / brand	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
f9fdb20c-4c0e-4023-8b91-ea70b8ba847d	site.description	Advancing soil science research, education, and sustainable land management in Syria.	تعزيز أبحاث علوم التربة والتعليم والإدارة المستدامة للأراضي في سوريا.	site	Site description for SEO / JSON-LD	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
7019a59d-5bb4-4342-a905-be00da7b4735	general.read_more	Read More	اقرأ المزيد	general	General: Read more link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
82afa9e4-b82d-418c-8df5-cbf087320638	general.view_all	View All	عرض الكل	general	General: View all link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
0cb82a88-b329-4a25-8163-1cc01b93d299	general.loading	Loading...	جار التحميل...	general	General: Loading text	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
d7c10169-3183-41ab-bdb6-984447690cfa	general.error	Something went wrong	حدث خطأ ما	general	General: Error message	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
69f1cbc8-954a-4cab-a68e-2e023c86a449	general.search	Search	بحث	general	General: Search label	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
faaa3fcc-f5c7-4e7e-bb15-b8160d348de1	general.no_results	No results found	لا توجد نتائج	general	General: No results	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
f7d71caf-6465-45c6-8e5c-677ac4d9b2b4	about.hero.title	About the Syrian Soil Science Society	عن الجمعية السورية لعلوم التربة	about	About page hero title	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
03786047-08ee-47ca-ba6b-a67cf394e6e4	about.overview.title	Overview	نظرة عامة	about	About page overview heading	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
fba4f16c-cb15-4e9a-9a67-d192108fae5d	about.overview.text	The Syrian Soil Science Society (SSSSY) is a non-profit professional organization dedicated to advancing soil science research, education, and sustainable land management in Syria.	الجمعية السورية لعلوم التربة (ج.س.ع.ت) هي منظمة مهنية غير ربحية مكرسة لتعزيز أبحاث علوم التربة والتعليم والإدارة المستدامة للأراضي في سوريا.	about	About page overview text	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
3da31491-7bdc-42f0-83ac-1a15733d33e9	publications.title	Publications	المنشورات	publications	Publications page main title	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
e48af096-143e-43b7-84a5-3b1056d4c744	contact.info.address	Address	العنوان	contact	Contact page address heading	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
cbc801bd-eedc-48cf-a17c-3b9434915413	contact.info.email	Email	البريد الإلكتروني	contact	Contact page email heading	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
d9eb8e4e-9dbe-4ce7-bd0e-fe8dedf1d0cc	contact.info.phone	Phone	الهاتف	contact	Contact page phone heading	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
98d7a8e5-01c2-430f-8b0a-d0f05772fff9	contact.form.namePlaceholder	Your name	اسمك	contact	Name input placeholder	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
68c4b339-d5ab-4638-a5e1-dcf57dd529bd	contact.form.emailPlaceholder	Your email	بريدك الإلكتروني	contact	Email input placeholder	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
293e5e8a-270a-41f4-af4f-c04a952056e0	contact.form.subjectPlaceholder	Subject	الموضوع	contact	Subject input placeholder	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
b4fe1bb5-af59-428f-8f1d-39ad8b0b3f24	contact.form.messagePlaceholder	Write your message here...	اكتب رسالتك هنا...	contact	Message textarea placeholder	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
e93010f5-eda3-49fa-aa3d-233f18e9a5dd	contact.success.title	Message Sent!	تم إرسال الرسالة!	contact	Success message title	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
f0d1f783-b2c6-4310-a2f5-b1409e326361	contact.success.text	Thank you for reaching out. We will get back to you as soon as possible.	شكرًا لتواصلك معنا. سنعود إليك في أقرب وقت ممكن.	contact	Success message text	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
0a7f6096-378d-42e8-8670-e1c21d9138e0	contact.success.another	Send Another Message	إرسال رسالة أخرى	contact	Send another message button	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
6e6bbbd6-a56a-41d2-a7e7-873ee9204358	contact.info.title	Contact Information	معلومات الاتصال	contact	Contact info section heading	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
383db01a-3528-40dd-8580-15c5c269f474	contact.info.description	Get in touch with us through any of the channels below.	تواصل معنا من خلال أي من القنوات أدناه.	contact	Contact info description	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
ed00cb99-9cc0-4e4d-b90f-14a5c092a0c4	contact.info.addressLabel	Address	العنوان	contact	Address label	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
37a18b6d-f64f-4232-8eba-f88163d23127	contact.info.phoneLabel	Phone	الهاتف	contact	Phone label	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
a74712d0-475f-4692-bfc5-46f8fe938a8b	contact.info.emailLabel	Email	البريد الإلكتروني	contact	Email label	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
62518e65-8b0c-47d2-b6b5-2a10f9a8f751	contact.info.workingHoursLabel	Working Hours	ساعات العمل	contact	Working hours label	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
4e53755c-4828-41d9-a087-66ab20576608	contact.address	Damascus, Syria	دمشق، سوريا	contact	Address value	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
dc57c753-74fe-4021-86e5-62dcb0dc18c8	contact.phone	+963 11 234 5678	+963 11 234 5678	contact	Phone number	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
50bc8a57-b307-4703-941a-e44019c4fc6d	contact.email	info@ssssy.org	info@ssssy.org	contact	Email address	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
28eca782-af5b-4522-bde6-97986757ff73	contact.workingHours	Sunday - Thursday, 9:00 AM - 5:00 PM	الأحد - الخميس، 9:00 صباحًا - 5:00 مساءً	contact	Working hours	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
cade67c1-d7dd-4dcb-a3f1-6552b5febbcf	contact.map.placeholder	Google Maps Placeholder	مكان خريطة جوجل	contact	Map placeholder text	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
3e7e8ac7-d76b-4f97-ba76-e8945a934a19	social.title	Follow Us	تابعنا	social	Social media section title	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
beda272a-6e14-404c-b5a8-91ab15fe2b60	social.facebookUrl	https://facebook.com/ssssy	https://facebook.com/ssssy	social	Facebook profile URL	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
a17a24b2-9b53-4ee7-9ae1-83b5395468d9	social.twitterUrl	https://twitter.com/ssssy	https://twitter.com/ssssy	social	Twitter/X profile URL	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
59cf9d1c-9460-4725-8dd2-819bf8998839	social.linkedinUrl	https://linkedin.com/company/ssssy	https://linkedin.com/company/ssssy	social	LinkedIn company URL	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
8cf074c4-6202-4dd2-89a9-93f44a5b3e6f	social.youtubeUrl	https://youtube.com/@ssssy	https://youtube.com/@ssssy	social	YouTube channel URL	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
b8238052-8627-4e14-8ac3-1dbab8d02702	about.hero.arabicHeading	من نحن	من نحن	about	About page hero arabic heading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
8e453f5d-f56c-4f6d-a42c-3e7e5d1e4af7	about.overview.paragraph3	The society is committed to building capacity among young scientists, fostering interdisciplinary research, and raising public awareness about the critical role of soil in food security, environmental sustainability, and climate resilience. Over the past decade, SSSSY has grown into a respected institution both nationally and regionally, with a network of over 500 members across Syria and the Middle East.	تلتزم الجمعية ببناء القدرات بين العلماء الشباب وتعزيز البحث متعدد التخصصات وزيادة الوعي العام بالدور الحاسم للتربة في الأمن الغذائي والاستدامة البيئية ومقاومة المناخ. على مدار العقد الماضي، نمت الجمعية لتصبح مؤسسة محترمة على المستوى الوطني والاقليمي، مع شبكة تضم أكثر من 500 عضو في سوريا والشرق الأوسط.	about	About overview third paragraph	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
f8ec222d-5ad0-4e28-b1b7-bfc78cc2ae8c	about.visionMission.heading	Vision, Mission & Objectives	الرؤية والرسالة والأهداف	about	Vision mission section heading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
18a1c95e-912e-4e2e-916e-70f02cdb2658	about.visionMission.subheading	Our guiding principles that shape every initiative and program we undertake.	مبادئنا الإرشادية التي تشكل كل مبادرة وبرنامج ننفذه.	about	Vision mission section subheading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
dd8a6f78-bcb4-4f67-a045-e0a62631b497	about.visionMission.visionTitle	Our Vision	رؤيتنا	about	Vision card title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
e770cc00-26f6-42d9-af2d-3555066dc98c	about.visionMission.visionDescription	To be the leading scientific authority on soil science in Syria and the region, fostering a future where soils are managed sustainably for the benefit of people and the environment.	أن نكون المرجع العلمي الرائد في علوم التربة في سوريا والمنطقة، لخلق مستقبل تُدار فيه التربة بشكل مستدام لفائدة البشر والبيئة.	about	Vision card description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
3993296d-1a41-4f7d-8aa7-2814eccdebdf	about.visionMission.missionTitle	Our Mission	رسالتنا	about	Mission card title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
8f02b22b-603b-4b7f-ab97-2ad746ec80d4	about.visionMission.missionDescription	To advance soil science through research, education, and advocacy, promoting sustainable land use practices that enhance agricultural productivity, environmental quality, and human well-being.	تطوير علوم التربة من خلال البحث والتعليم والدعوة، وتعزيز ممارسات الاستخدام المستدام للأراضي التي تعزز الإنتاجية الزراعية والجودة البيئية ورفاهية البشر.	about	Mission card description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
59b23383-6628-4bd6-ad43-ce5c74e704ea	about.visionMission.objectivesTitle	Our Objectives	أهدافنا	about	Objectives card title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
140c3311-968e-4f0b-9871-edc6f1c0ad0a	about.visionMission.objectivesDescription	1) Promote soil research and innovation. 2) Facilitate knowledge exchange. 3) Support education and training. 4) Advocate for soil-friendly policies. 5) Build partnerships with national and international organizations.	1) تعزيز البحث والابتكار في التربة. 2) تسهيل تبادل المعرفة. 3) دعم التعليم والتدريب. 4) الدعوة إلى سياسات صديقة للتربة. 5) بناء شراكات مع منظمات وطنية ودولية.	about	Objectives card description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
d432fec3-e963-4205-b002-bdc7ef35cc1a	about.orgChart.heading	Organizational Structure	الهيكل التنظيمي	about	Organizational chart section heading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
61751ee1-3411-4209-ab04-49bb9ecbda52	about.orgChart.paragraph1	The society is governed by a General Assembly comprising all active members, which elects a Board of Directors for a four-year term. The Board is responsible for setting strategic direction, overseeing operations, and managing the society's finances and programs.	تُدار الجمعية من قبل الجمعية العامة التي تشمل جميع الأعضاء النشطين، والتي تختار مجلس إدارة لمدة أربع سنوات. يتحمل المجلس المسؤولية عن وضع التوجه الاستراتيجي والمراقبة للعمليات وإدارة شؤون الجمعية المالية والبرامج.	about	Organizational chart section first paragraph	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
9c223975-09ed-48f1-87f3-497e6cefc5f1	about.hero.heading	About Us	عن الجمعية	about	About hero main heading	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
ccead667-4b3c-4352-ae83-f7d113814145	about.overview.heading	Society Overview	نظرة عامة على الجمعية	about	About overview heading	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
08a3969f-3196-4337-900e-d7b362266961	about.orgChart.paragraph2	The Board consists of a President, Vice President, Secretary, Treasurer, and several committee chairs representing key areas: Research & Publications, Education & Training, Events & Conferences, Membership & Outreach, and International Relations.	يتكون المجلس من رئيس ونائب رئيس وأمين وأمين الصندوق ورؤساء لجان عديدة تمثِّل المجالات الرئيسية: البحث والمنشورات والتعليم والتدريب والمناسبات والمؤتمرات والعضوية والتوعية والعلاقات الدولية.	about	Organizational chart section second paragraph	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
fdce00bd-8c01-40ff-bc32-a8bc30ebabc7	about.orgChart.paragraph3	Standing committees and working groups are formed as needed to address specific topics such as soil conservation, soil fertility, soil contamination, and remote sensing applications in soil science.	يتم تشكيل اللجان الدائمة ومجموعات العمل حسب الحاجة لمعالجة مواضيع محددة مثل الحفظ على التربة وتكوير التربة وتلوث التربة وتطبيقات الاستشعار عن بعد في علوم التربة.	about	Organizational chart section third paragraph	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
f863c468-cb9a-49fa-814d-9bd8ede7ef04	about.timeline.subheading	Key milestones in the history of the Syrian Soil Science Society.	المراحل الأساسية في تاريخ الجمعية السورية لعلوم التربة.	about	Timeline section subheading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
6671aa29-0323-436c-acfe-1b7c4030859c	about.timeline.year2008	2008	2008	about	Timeline year 2008	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
b802b004-e37e-47e7-ba22-79bb5901aabd	about.timeline.title2008	Society Founded	تأسيس الجمعية	about	Timeline 2008 title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
cfc14d5b-db94-4194-9ba0-3878b325fb92	about.timeline.desc2008	SSSSY was established by a group of soil scientists and researchers.	تأسست الجمعية من قبل مجموعة من علماء وباحثي التربة.	about	Timeline 2008 description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
fec9b575-e10f-41c4-b7b3-b5f57fa03d00	about.timeline.year2012	2012	2012	about	Timeline year 2012	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
d1feb1ff-e8de-4360-b7b1-4c4b27b1460f	about.timeline.title2012	First Conference	المؤتمر الأول	about	Timeline 2012 title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
ef36198b-1135-44a2-9131-993f00b60d2c	about.timeline.desc2012	The first national soil science conference was held in Damascus.	عقد المؤتمر الوطني الأول لعلوم التربة في دمشق.	about	Timeline 2012 description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
00af6abc-6412-4dc2-a69d-cf8bab757f2d	about.timeline.year2018	2018	2018	about	Timeline year 2018	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
5ef7b0cb-8470-4389-9030-d87df06ed1a8	about.timeline.title2018	Research Journal	مجلة البحث	about	Timeline 2018 title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
898d0e54-87a4-4689-8643-11bb09aa5a57	about.timeline.desc2018	Launched the Syrian Journal of Soil Science, a peer-reviewed publication.	إصدار المجلة السورية لعلوم التربة، وهي منشور محكمة.	about	Timeline 2018 description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
fc2b7907-5cfc-4715-afec-eca386f2cbe0	about.timeline.year2024	2024	2024	about	Timeline year 2024	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
a4f5879b-e8c5-4019-9cb5-66d47e640b65	about.timeline.title2024	Digital Transformation	التحول الرقمي	about	Timeline 2024 title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
153f3a42-efe3-4355-8777-0318b39e3e81	about.timeline.desc2024	Migrated to a digital platform for publications, events, and member services.	الانتقال إلى منصة رقمية للمنشورات والمناسبات وخدمات الأعضاء.	about	Timeline 2024 description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
1bcb1912-899e-4c72-8a35-c37344d0cbac	about.documents.bylaws	SSSSY Bylaws (PDF)	لوائح الجمعية (PDF)	about	Bylaws document	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
5a7704d3-d261-4081-bbda-f26276fbcff1	about.documents.annualReport	Annual Report 2024 (PDF)	التقرير السنوي 2024 (PDF)	about	Annual report document	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
6dbc9d11-8f40-4169-8d8c-cccba7acb564	about.documents.membershipForm	Membership Form (PDF)	نموذج العضوية (PDF)	about	Membership form document	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
74cdc40a-55df-4a13-a629-7dca65e60604	about.documents.strategicPlan	Strategic Plan 2024-2028 (PDF)	الخطة الاستراتيجية 2024-2028 (PDF)	about	Strategic plan document	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
b20b4407-6640-4c20-a036-7d6ef69abd26	about.documents.download	Download	تنزيل	about	Download button text	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
9eb3904c-c8f6-44ff-8e57-9446086fac10	about.gallery.subheading	A glimpse into our events, conferences, and field activities.	نظرة خاطفة على مناسباتنا ومؤتمراتنا وأنشطتنا الميدانية.	about	Gallery section subheading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
4b6ae3de-d192-4a02-8ba2-dbb26eb52328	about.hero.arabic_heading	من نحن	من نحن	about	About hero Arabic heading	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
f197ba54-a4d0-4e8a-9d6c-e08259d225fd	about.hero.description	Learn about our society, history, and commitment to soil science in Syria.	تعرف على جمعيتنا وتاريخنا والتزامنا بعلوم التربة في سوريا.	about	About hero description	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
a7beb9ba-97c2-4a0e-a0b3-9a4285baf1b5	about.overview.paragraph1	The Syrian Soil Science Society is a professional non-profit scientific organization dedicated to advancing soil science in Syria.	الجمعية السورية لعلوم التربة هي منظمة علمية مهنية غير ربحية مكرسة لتطوير علوم التربة في سوريا.	about	About overview paragraph 1	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
7aab3455-03bf-45bc-bf71-4ddcb62e4653	about.overview.paragraph2	The society brings together researchers, educators, students, and practitioners to exchange knowledge and promote sustainable soil management.	تجمع الجمعية الباحثين والمعلمين والطلاب والممارسين لتبادل المعرفة وتعزيز الإدارة المستدامة للتربة.	about	About overview paragraph 2	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
a3054b57-e315-445b-bf51-9771bb48d859	about.vision_mission.heading	Vision, Mission & Objectives	الرؤية والرسالة والأهداف	about	About vision and mission heading	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
a2a8f561-e8a5-4df8-85e5-2fa4438813f9	about.org_chart.heading	Organizational Structure	الهيكل التنظيمي	about	About organizational chart heading	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
e8bfbc4e-69a4-4245-89e0-acfefaa2c1bc	about.timeline.heading	Our Journey	رحلتنا	about	About timeline heading	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
7b72f9f4-a7e1-4666-a803-1aec9bc4bbd1	about.documents.heading	Downloadable Documents	المستندات القابلة للتنزيل	about	About documents heading	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
08f4b745-8f3d-4687-a6ea-b7bf68bbea25	about.gallery.heading	Photo Gallery	معرض الصور	about	About gallery heading	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
559e98fe-c876-4e59-aeb7-32f78fee9da4	contact.hero.title	Contact Us	اتصل بنا	contact	Contact hero title	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
190693cb-45ed-48c1-9cac-605f707569d7	contact.form.title	Send us a message	أرسل لنا رسالة	contact	Contact form title	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
fc679ef5-9af0-427d-96d5-d67fed142a50	contact.form.name_placeholder	Your Name	اسمك	contact	Contact form name placeholder	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
3c742c74-e5ec-4385-8d41-e9cdda4e3d46	contact.form.email_placeholder	Your Email	بريدك الإلكتروني	contact	Contact form email placeholder	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
6434feaa-0489-46c9-bd98-d3010b4b633d	contact.form.subject_placeholder	Subject	الموضوع	contact	Contact form subject placeholder	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
e7fc6116-21f8-466f-88d7-d6b80af9c4a4	contact.form.message_placeholder	Your Message	رسالتك	contact	Contact form message placeholder	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
c91bfde8-f024-47d8-b098-7695ccdbb086	contact.form.submit	Send Message	إرسال الرسالة	contact	Contact form submit button	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
b0fa00ac-a8ed-4670-9959-f104d1567c04	social.facebook_url	https://facebook.com/ssssy	https://facebook.com/ssssy	social	Social: Facebook URL	2026-07-09 10:39:19.15402	2026-07-10 16:38:23.795489
75664524-4c07-41b0-a01e-ec883688365d	social.twitter_url	https://twitter.com/ssssy	https://twitter.com/ssssy	social	Social: Twitter/X URL	2026-07-09 10:39:19.15402	2026-07-10 16:38:23.795489
0aecfa58-339b-4026-9b52-5882fab5ef8a	social.linkedin_url	https://linkedin.com/company/ssssy	https://linkedin.com/company/ssssy	social	Social: LinkedIn URL	2026-07-09 10:39:19.15402	2026-07-10 16:38:23.795489
4a3648ab-dbf8-48e1-9c13-7689ca7a31da	social.youtube_url	https://youtube.com/@ssssy	https://youtube.com/@ssssy	social	Social: YouTube URL	2026-07-09 10:39:19.15402	2026-07-10 16:38:23.795489
7c3d4736-80a9-4be6-a6b1-17e891ca722d	board.hero.title	Board Members	أعضاء المجلس	board	Board hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
1eef1efc-6b4f-477e-8f61-670f84008c19	board.hero.subtitle	Meet the leadership of the Syrian Soil Science Society.	تعرف على قيادة الجمعية السورية لعلوم التربة.	board	Board hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
275dd2ae-53fb-43dd-9b3b-ba2c2f0571b4	events.hero.title	Events	الفعاليات	events	Events hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
96965014-e165-4c0c-813c-883e1c7ab2d4	events.hero.subtitle	Explore conferences, workshops, seminars, and training opportunities.	استكشف المؤتمرات وورش العمل والندوات والبرامج التدريبية.	events	Events hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
d53f675c-358f-4279-a21a-37967fed288b	jobs.hero.title	Jobs	الوظائف	jobs	Jobs hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
5f68b639-7b24-452f-a6c6-0ac9d1e6c6e8	jobs.hero.subtitle	Explore career opportunities at SSSSY and partner organizations.	استكشف الفرص الوظيفية في الجمعية والجهات الشريكة.	jobs	Jobs hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
04cbe221-c2d2-470a-b59c-31565e7858dc	members.hero.title	Members	الأعضاء	members	Members hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
63ab7c91-86aa-415e-a40b-0d2683d9fe9b	members.hero.subtitle	Browse the society member directory and public profiles.	تصفح دليل الأعضاء والملفات العامة.	members	Members hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
9df9b2d4-511b-4ac1-b043-d837693b44dd	news.hero.title	News & Announcements	الأخبار والإعلانات	news	News hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
cbbadb69-c536-434a-98f3-060d6beb2612	news.hero.subtitle	Read the latest news, articles, and announcements from the society.	اقرأ آخر الأخبار والمقالات والإعلانات من الجمعية.	news	News hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
6cab16ce-5b02-4e4c-8678-d41a01024e74	newsletter.hero.title	Stay Connected	ابق على تواصل	newsletter	Newsletter hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
3725e1e8-ce9f-41b4-928c-2b00b1f2e843	newsletter.hero.subtitle	Subscribe to receive news, events, and updates from the society.	اشترك لتصلك آخر الأخبار والفعاليات والتحديثات من الجمعية.	newsletter	Newsletter hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
648e7f4d-2000-48bc-b3ec-951461c8fe6b	president.hero.title	Message from the President	رسالة الرئيس	president	President hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
d7b8668c-d8c3-4f74-949c-39dffcf8fc78	president.hero.subtitle	A word from the society president about our mission and future direction.	كلمة من رئيس الجمعية حول رسالتنا وتوجهاتنا المستقبلية.	president	President hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
db791b1c-6729-4feb-a912-8e9124cab0de	publications.hero.title	Publications	المنشورات	publications	Publications hero title	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
cbe4580c-afd9-4c92-a907-f52ec1ed4bad	publications.hero.subtitle	Explore research papers, reports, and knowledge resources published by the society.	استكشف الأبحاث والتقارير والموارد المعرفية المنشورة من الجمعية.	publications	Publications hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
ab72b36c-0cfb-432a-a3ed-c6cffafc841e	search.hero.title	Search	البحث	search	Search hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
f514dc67-4045-4023-894e-685aa1955187	search.hero.subtitle	Search across articles, publications, and events.	ابحث في المقالات والمنشورات والفعاليات.	search	Search hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
\.


--
-- TOC entry 5911 (class 0 OID 68007)
-- Dependencies: 228
-- Data for Name: content_tags; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_tags (content_id, tag_id) FROM stdin;
\.


--
-- TOC entry 5912 (class 0 OID 68022)
-- Dependencies: 229
-- Data for Name: content_versions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_versions (id, content_id, version, title_ar, title_en, excerpt, body, status, changed_by, change_summary, created_at) FROM stdin;
\.


--
-- TOC entry 5953 (class 0 OID 68906)
-- Dependencies: 270
-- Data for Name: crm_contacts; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.crm_contacts (id, user_id, first_name, last_name, email, phone, organization, "position", contact_type, relationship_level, notes, source, is_primary, is_active, last_contact_at, next_followup_at, tags, preferences, created_at, updated_at, created_by) FROM stdin;
\.


--
-- TOC entry 5922 (class 0 OID 68232)
-- Dependencies: 239
-- Data for Name: email_accounts; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_accounts (id, user_id, email_address, username, password_hash, display_name, quota_bytes, used_bytes, is_active, is_verified, auto_reply_enabled, auto_reply_subject, auto_reply_body, auto_reply_starts_at, auto_reply_ends_at, forward_to, forward_keep_copy, signature, imap_subscribed, last_sync_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5932 (class 0 OID 68452)
-- Dependencies: 249
-- Data for Name: email_aliases; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_aliases (id, account_id, alias_address, is_active, created_at) FROM stdin;
\.


--
-- TOC entry 5926 (class 0 OID 68338)
-- Dependencies: 243
-- Data for Name: email_attachments; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_attachments (id, message_id, filename, mime_type, size_bytes, storage_path, content_id, is_inline, created_at) FROM stdin;
\.


--
-- TOC entry 5929 (class 0 OID 68388)
-- Dependencies: 246
-- Data for Name: email_contact_group_members; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_contact_group_members (id, group_id, contact_id, created_at) FROM stdin;
\.


--
-- TOC entry 5928 (class 0 OID 68372)
-- Dependencies: 245
-- Data for Name: email_contact_groups; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_contact_groups (id, owner_id, name, description, color, created_at) FROM stdin;
\.


--
-- TOC entry 5927 (class 0 OID 68354)
-- Dependencies: 244
-- Data for Name: email_contacts; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_contacts (id, owner_id, email, first_name, last_name, display_name, company, "position", phone, mobile, notes, is_favorite, created_at) FROM stdin;
\.


--
-- TOC entry 5931 (class 0 OID 68432)
-- Dependencies: 248
-- Data for Name: email_distribution_list_members; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_distribution_list_members (id, list_id, user_id, is_moderator, created_at) FROM stdin;
\.


--
-- TOC entry 5930 (class 0 OID 68407)
-- Dependencies: 247
-- Data for Name: email_distribution_lists; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_distribution_lists (id, name, email_address, description, list_type, is_public, allow_external, moderator_id, requires_moderation, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 5923 (class 0 OID 68260)
-- Dependencies: 240
-- Data for Name: email_folders; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_folders (id, account_id, parent_id, name, folder_type, system_folder, sort_order, unread_count, total_count, imap_folder_name, created_at) FROM stdin;
\.


--
-- TOC entry 5924 (class 0 OID 68286)
-- Dependencies: 241
-- Data for Name: email_messages; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_messages (id, account_id, folder_id, message_id, in_reply_to, references_header, thread_id, sender_address, sender_name, reply_to_address, reply_to_name, subject, body_text, body_html, preview_text, size_bytes, has_attachments, attachment_count, priority, is_read, is_flagged, is_starred, is_draft, is_scheduled, scheduled_send_at, actually_sent_at, imap_uid, delivery_status, bounce_message, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5945 (class 0 OID 68709)
-- Dependencies: 262
-- Data for Name: email_quota_logs; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_quota_logs (id, account_id, used_bytes_before, used_bytes_after, change_bytes, operation, message_id, created_at) FROM stdin;
\.


--
-- TOC entry 5925 (class 0 OID 68321)
-- Dependencies: 242
-- Data for Name: email_recipients; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_recipients (id, message_id, recipient_type, address, name, is_internal, created_at) FROM stdin;
\.


--
-- TOC entry 5933 (class 0 OID 68467)
-- Dependencies: 250
-- Data for Name: email_rules; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_rules (id, account_id, name, order_index, is_enabled, stop_processing, match_all, conditions, actions, created_at) FROM stdin;
\.


--
-- TOC entry 5944 (class 0 OID 68689)
-- Dependencies: 261
-- Data for Name: email_scheduled_sends; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_scheduled_sends (id, message_id, account_id, scheduled_at, status, error_message, created_at, processed_at) FROM stdin;
\.


--
-- TOC entry 5952 (class 0 OID 68879)
-- Dependencies: 269
-- Data for Name: event_registrations; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.event_registrations (id, event_id, user_id, name, email, phone, organization, notes, status, registered_at, checked_in, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5918 (class 0 OID 68163)
-- Dependencies: 235
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.events (id, title_ar, title_en, slug, description, event_date, end_date, location, location_url, event_type, organizer, featured_image, is_published, created_by, created_at, updated_at, address, latitude, longitude, is_online, online_url, max_participants, registration_deadline, status, contact_email) FROM stdin;
\.


--
-- TOC entry 5901 (class 0 OID 67792)
-- Dependencies: 218
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	users roles	SQL	V1__users_roles.sql	1786600340	ssssy	2026-07-09 10:39:16.795566	661	t
2	2	content tables	SQL	V2__content_tables.sql	-12473953	ssssy	2026-07-09 10:39:17.583439	158	t
3	3	media tables	SQL	V3__media_tables.sql	1259397807	ssssy	2026-07-09 10:39:17.788525	44	t
4	4	workflow and notifications	SQL	V4__workflow_and_notifications.sql	1327582038	ssssy	2026-07-09 10:39:17.861335	51	t
5	5	events jobs contacts	SQL	V5__events_jobs_contacts.sql	737040145	ssssy	2026-07-09 10:39:17.944187	86	t
6	6	email system	SQL	V6__email_system.sql	-2016227730	ssssy	2026-07-09 10:39:18.055948	176	t
7	7	page builder	SQL	V7__page_builder.sql	1477453206	ssssy	2026-07-09 10:39:18.273145	49	t
8	8	features tables	SQL	V8__features_tables.sql	827489624	ssssy	2026-07-09 10:39:18.34118	158	t
9	9	add user profile fields	SQL	V9__add_user_profile_fields.sql	2072051177	ssssy	2026-07-09 10:39:18.528672	6	t
10	10	media thumbnails	SQL	V10__media_thumbnails.sql	289704573	ssssy	2026-07-09 10:39:18.551489	16	t
11	11	workflow definitions	SQL	V11__workflow_definitions.sql	2099952407	ssssy	2026-07-09 10:39:18.581959	77	t
12	12	component templates	SQL	V12__component_templates.sql	411082420	ssssy	2026-07-09 10:39:18.680395	21	t
13	13	phase5 gaps	SQL	V13__phase5_gaps.sql	-532702467	ssssy	2026-07-09 10:39:18.714858	42	t
14	14	crm and realtime	SQL	V14__crm_and_realtime.sql	358727818	ssssy	2026-07-09 10:39:18.775103	47	t
15	15	seed default data	SQL	V15__seed_default_data.sql	-2116287264	ssssy	2026-07-09 10:39:18.83828	70	t
16	16	page seo fields	SQL	V16__page_seo_fields.sql	15444967	ssssy	2026-07-09 10:39:18.944976	4	t
17	17	page og fields	SQL	V17__page_og_fields.sql	190237526	ssssy	2026-07-09 10:39:18.966959	4	t
18	18	add two factor secret	SQL	V18__add_two_factor_secret.sql	218268765	ssssy	2026-07-09 10:39:18.989714	7	t
19	19	gallery system	SQL	V19__gallery_system.sql	533693463	ssssy	2026-07-09 10:39:19.012916	62	t
20	20	content strings	SQL	V20__content_strings.sql	2142318698	ssssy	2026-07-09 10:39:19.09377	33	t
21	21	seed header menu and social	SQL	V21__seed_header_menu_and_social.sql	1716209283	ssssy	2026-07-09 10:39:19.144673	15	t
22	22	site sections	SQL	V22__site_sections.sql	-1155198257	ssssy	2026-07-09 10:39:19.174567	35	t
23	23	site sections location	SQL	V23__site_sections_location.sql	1649311233	ssssy	2026-07-09 10:39:19.227546	17	t
24	24	theme settings	SQL	V24__theme_settings.sql	-1356011359	ssssy	2026-07-09 10:39:19.256955	24	t
25	25	fix admin password	SQL	V25__fix_admin_password.sql	-1280083977	ssssy	2026-07-09 10:39:19.293722	10	t
26	26	theme settings advanced	SQL	V26__theme_settings_advanced.sql	1324300547	ssssy	2026-07-09 10:39:19.316194	17	t
27	27	phase1 feature settings	SQL	V27__phase1_feature_settings.sql	-2015597901	ssssy	2026-07-09 10:39:19.349247	11	t
28	28	phase3 component flags	SQL	V28__phase3_component_flags.sql	2103785062	ssssy	2026-07-09 10:39:19.373766	7	t
29	29	phase4 sensory flags	SQL	V29__phase4_sensory_flags.sql	1469332628	ssssy	2026-07-09 10:39:19.396707	4	t
30	30	phase5 performance flags	SQL	V30__phase5_performance_flags.sql	-1026599650	ssssy	2026-07-09 10:39:19.416328	7	t
31	31	phase6 admin ux flags	SQL	V31__phase6_admin_ux_flags.sql	1401286300	ssssy	2026-07-09 10:39:19.436181	6	t
32	32	phase7 iot sensors	SQL	V32__phase7_iot_sensors.sql	667867780	ssssy	2026-07-09 10:39:19.454809	81	t
33	33	performance indexes	SQL	V33__performance_indexes.sql	738113001	ssssy	2026-07-09 10:39:19.550459	142	t
\.


--
-- TOC entry 5956 (class 0 OID 68976)
-- Dependencies: 273
-- Data for Name: gallery_albums; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.gallery_albums (id, title_ar, title_en, description_ar, description_en, slug, cover_image_id, is_published, sort_order, password_hash, is_password_protected, watermark_overrides, settings_overrides, view_count, download_count, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5959 (class 0 OID 69050)
-- Dependencies: 276
-- Data for Name: gallery_analytics_events; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.gallery_analytics_events (id, album_id, image_id, share_link_id, event_type, ip_address, user_agent, referer, session_id, created_at) FROM stdin;
\.


--
-- TOC entry 5957 (class 0 OID 69003)
-- Dependencies: 274
-- Data for Name: gallery_images; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.gallery_images (id, album_id, media_file_id, sort_order, title_ar, title_en, description_ar, description_en, alt_text, before_media_file_id, hotspot_data, exif_data, color_palette, is_cover, created_at) FROM stdin;
\.


--
-- TOC entry 5958 (class 0 OID 69029)
-- Dependencies: 275
-- Data for Name: gallery_share_links; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.gallery_share_links (id, album_id, token, expires_at, max_views, current_views, is_active, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 5920 (class 0 OID 68204)
-- Dependencies: 237
-- Data for Name: job_applications; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.job_applications (id, job_vacancy_id, first_name, last_name, email, phone, cover_letter, cv_file_path, status, created_at) FROM stdin;
\.


--
-- TOC entry 5919 (class 0 OID 68184)
-- Dependencies: 236
-- Data for Name: job_vacancies; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.job_vacancies (id, title_ar, title_en, slug, description, requirements, location, job_type, department, deadline, is_published, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5914 (class 0 OID 68071)
-- Dependencies: 231
-- Data for Name: media_files; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.media_files (id, filename, original_filename, mime_type, size_bytes, storage_path, url, thumbnail_url, width, height, alt_text_ar, alt_text_en, folder_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5913 (class 0 OID 68053)
-- Dependencies: 230
-- Data for Name: media_folders; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.media_folders (id, name, parent_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5946 (class 0 OID 68735)
-- Dependencies: 263
-- Data for Name: media_thumbnails; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.media_thumbnails (id, media_file_id, thumbnail_path, width, height, mime_type, size_bytes, created_at) FROM stdin;
\.


--
-- TOC entry 5941 (class 0 OID 68633)
-- Dependencies: 258
-- Data for Name: member_profiles; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.member_profiles (id, user_id, membership_type, membership_number, specialization, research_interests, education, publications_count, is_public, joined_at, membership_expires_at, orcid_id, google_scholar_url, linkedin_url, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5937 (class 0 OID 68546)
-- Dependencies: 254
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.menu_items (id, menu_id, parent_id, label_ar, label_en, url, target, icon, page_id, sort_order, is_active, created_at) FROM stdin;
a6b64fc9-2476-4ffc-afea-f414e9b95bdd	00000000-0000-0000-0000-000000000001	\N	الرئيسية	Home	/	_self	\N	\N	0	t	2026-07-10 16:38:23.795489
67198997-3ef2-43de-88a2-24f63e2363c7	00000000-0000-0000-0000-000000000001	\N	عن الجمعية	About	/about	_self	\N	\N	1	t	2026-07-10 16:38:23.795489
a9ba2d6f-6e07-415f-a993-7e21d496eda8	00000000-0000-0000-0000-000000000001	\N	رسالة الرئيس	President Message	/president-message	_self	\N	\N	2	t	2026-07-10 16:38:23.795489
f123301a-bc7e-443f-b415-29c4ff12c567	00000000-0000-0000-0000-000000000001	\N	أعضاء المجلس	Board	/board	_self	\N	\N	3	t	2026-07-10 16:38:23.795489
6a49c796-fff7-4f44-be47-0856fb681303	00000000-0000-0000-0000-000000000001	\N	الأخبار	News	/news	_self	\N	\N	4	t	2026-07-10 16:38:23.795489
336f028e-5cda-4b72-a9e9-86c513a872c7	00000000-0000-0000-0000-000000000001	\N	المنشورات	Publications	/publications	_self	\N	\N	5	t	2026-07-10 16:38:23.795489
7eb0cf26-18b9-4ccc-8a42-6d8cbb6f78bc	00000000-0000-0000-0000-000000000001	\N	الفعاليات	Events	/events	_self	\N	\N	6	t	2026-07-10 16:38:23.795489
6feaa2b3-3e70-43ff-971f-b9bdbb8fc2f2	00000000-0000-0000-0000-000000000001	\N	الوظائف	Jobs	/jobs	_self	\N	\N	7	t	2026-07-10 16:38:23.795489
6800a9dd-b542-4b92-b770-26d63180eda8	00000000-0000-0000-0000-000000000001	\N	الأعضاء	Members	/members	_self	\N	\N	8	t	2026-07-10 16:38:23.795489
33c5df76-5d52-41b4-a9ba-9148da307dc8	00000000-0000-0000-0000-000000000001	\N	النشرة الإخبارية	Newsletter	/newsletter	_self	\N	\N	9	t	2026-07-10 16:38:23.795489
c1360794-a5e8-4c78-af63-1ee8fad39f2b	00000000-0000-0000-0000-000000000001	\N	اتصل بنا	Contact	/contact	_self	\N	\N	10	t	2026-07-10 16:38:23.795489
\.


--
-- TOC entry 5936 (class 0 OID 68538)
-- Dependencies: 253
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.menus (id, name, location, is_active, created_at) FROM stdin;
00000000-0000-0000-0000-000000000001	Main Navigation	header	t	2026-07-09 10:39:19.15402
\.


--
-- TOC entry 5939 (class 0 OID 68604)
-- Dependencies: 256
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.newsletter_subscribers (id, email, name, is_active, subscribed_at, unsubscribed_at) FROM stdin;
\.


--
-- TOC entry 5917 (class 0 OID 68138)
-- Dependencies: 234
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.notification_preferences (id, user_id, workflow_email, workflow_inapp, email_received_email, email_received_inapp, system_announcement_email, system_announcement_inapp, comment_email, comment_inapp, event_reminder_email, event_reminder_inapp, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5916 (class 0 OID 68120)
-- Dependencies: 233
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.notifications (id, user_id, type, title, body, link, reference_id, reference_type, is_read, is_archived, created_at) FROM stdin;
\.


--
-- TOC entry 5935 (class 0 OID 68514)
-- Dependencies: 252
-- Data for Name: page_sections; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at) FROM stdin;
83c0f964-1c29-41ca-98be-fb5d8795595c	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-vision-mission-section	{}	{}	{}	20	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489
a17bd93e-3027-4379-8528-292f34f68f55	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-timeline-section	{}	{}	{}	40	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489
425ac808-bb65-4c10-be24-849c8df26bee	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-documents-section	{}	{}	{}	50	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489
b442b30b-ebb4-416a-a156-d38e5401fce0	7582f946-a41d-4460-a535-bb545f8288e3	hero	{"maxWidth": "max-w-5xl"}	{"title": "News & Announcements", "subtitle": "Read the latest news, articles, and announcements from the society."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
696ef279-3435-4344-a16b-645dc029beaf	582cf8f7-f53d-4fcb-9f78-85f45a39f7dc	hero	{"maxWidth": "max-w-5xl"}	{"title": "Search", "subtitle": "Search across articles, publications, and events."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
2f1fbf6e-a330-4843-9f87-93dc3eccc262	ea5cd0a4-5d99-4d34-be1d-4ca2511a8138	hero	{"maxWidth": "max-w-5xl"}	{"title": "Publications", "subtitle": "Explore research papers, reports, and knowledge resources published by the society."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
ce48c01a-b955-46db-96e2-93a47058c58c	274da4e8-50cf-4aa7-9b95-68619f14ef92	hero	{"maxWidth": "max-w-5xl"}	{"title": "Message from the President", "subtitle": "A word from the society president about our mission and future direction."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
adebc2a3-7821-4f11-876e-c0c254a3c61d	fff8b2ef-f7e9-4d96-b545-291807f6da33	hero	{"maxWidth": "max-w-5xl"}	{"title": "Events", "subtitle": "Explore conferences, workshops, seminars, and training opportunities."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
dda04aa1-107b-473d-b59c-1f4568a93941	259bcff7-a75b-44a6-bdce-fa2911c5fed5	hero	{"maxWidth": "max-w-5xl"}	{"title": "Members", "subtitle": "Browse the society member directory and public profiles."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
53d43d87-f839-46e3-b64c-28ffdf97f6a1	7582f946-a41d-4460-a535-bb545f8288e3	news-list-section	{}	{}	{}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
347b0c20-9c50-4007-8399-058b5adff698	274da4e8-50cf-4aa7-9b95-68619f14ef92	text	{}	{"title": "Message from the President", "content": "<p>The Syrian Soil Science Society remains committed to strengthening research, education, and professional collaboration in service of sustainable land management across Syria.</p><p>We welcome researchers, students, institutions, and practitioners to work with us in protecting soil resources and building a stronger scientific community.</p>"}	{"padding": "py-16", "textColor": "text-gray-900", "backgroundColor": "bg-white"}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
c0b0d4e5-dfe4-4c98-8178-61a680bdcb56	84930958-20f9-4a24-b7e5-01e12fde7b46	newsletter	{}	{"title": "Stay Connected", "content": "Subscribe to our newsletter to receive the latest news, event announcements, and updates from SSSSY."}	{"padding": "py-16", "textColor": "text-gray-900", "backgroundColor": "bg-white"}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
1faa495b-2e05-402a-a05a-5a007fc3aa53	9758e378-5e79-4238-8524-b75491c5b031	board-list-section	{}	{}	{}	20	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
3154212e-b523-482d-a6a1-6e387afff663	9758e378-5e79-4238-8524-b75491c5b031	board-members-grid	{}	{}	{"padding": "py-0", "backgroundColor": "bg-white"}	30	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-09 13:04:44.628517
7221ee31-ace5-4c94-8ce0-f316d6a3e1cf	84930958-20f9-4a24-b7e5-01e12fde7b46	newsletter-subscribe-form-section	{}	{"titleEn": "Subscribe to Our Newsletter", "descriptionEn": "Receive the latest news, event announcements, research updates, and exclusive content directly to your inbox."}	{"padding": "py-16 md:py-20", "backgroundColor": "bg-white"}	20	ALWAYS	t	fade-in	2026-07-09 13:04:44.628517	2026-07-09 13:04:44.628517
fc9c5e4e-478a-48ff-a58b-004b1ddefd37	274da4e8-50cf-4aa7-9b95-68619f14ef92	president-message-hero-banner	{}	{"titleEn": "President's Message", "descriptionEn": "Insights and Vision"}	{"padding": "py-16 md:py-20", "overflow": "hidden", "backgroundColor": "bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay"}	10	ALWAYS	t	fade-in	2026-07-09 13:04:44.628517	2026-07-09 13:04:44.628517
373a95e5-3e8e-4e54-b2ff-d51c36f60c2d	274da4e8-50cf-4aa7-9b95-68619f14ef92	president-message-content-section	{}	{"quoteEn": "The nation that destroys its soil destroys itself.", "imageUrl": "https://placehold.co/400x400/D7CCC8/3E2723?text=President", "imageAltEn": "President of Syrian Soil Science Society", "socialLinks": [{"url": "https://facebook.com/jamal-al-shami", "platform": "facebook"}, {"url": "https://twitter.com/jamal-al-shami", "platform": "twitter"}, {"url": "https://linkedin.com/in/jamal-al-shami", "platform": "linkedin"}], "paragraph1En": "It is with great honor and humility that I address you as the President of the Syrian Soil Science Society (SSSSY). Our society stands at a pivotal moment, facing both significant challenges and unparalleled opportunities in the field of soil science. The vital role of soil in sustaining life, ensuring food security, and mitigating climate change has never been more evident.", "paragraph2En": "In Syria, we are particularly aware of the pressures on our natural resources. Decades of drought, conflict, and unsustainable practices have taken a heavy toll on our precious soil ecosystems. It is our collective responsibility, as scientists and citizens, to work towards restoring and preserving this fundamental resource for future generations.", "paragraph3En": "SSSSY is committed to fostering a vibrant community of soil scientists, promoting cutting-edge research, and translating scientific knowledge into practical solutions. We aim to strengthen collaborations with national and international partners, enhance educational programs, and advocate for policies that prioritize sustainable soil management. Together, we can cultivate a healthier future for Syria.", "quoteAuthorEn": "Franklin D. Roosevelt", "presidentNameEn": "Prof. Dr. Jamal Al-Shami", "signatureTextEn": "Sincerely,", "presidentTitleEn": "President, Syrian Soil Science Society", "welcomeMessageEn": "Dear members, colleagues, and friends,"}	{"padding": "py-16 md:py-20", "backgroundColor": "bg-white"}	20	ALWAYS	t	fade-in	2026-07-09 13:04:44.628517	2026-07-09 13:04:44.628517
12310b8d-afd6-494f-a205-265b2c87d4fa	ea5cd0a4-5d99-4d34-be1d-4ca2511a8138	publications-hero-banner	{}	{"titleKey": "publications.hero.title"}	{}	0	ALWAYS	f	\N	2026-07-09 16:57:53.899677	2026-07-09 17:56:15.166265
1f6064d1-c9e9-4223-9e14-de2647b2c20e	9758e378-5e79-4238-8524-b75491c5b031	board-hero-banner	{}	{}	{}	0	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489
20647c81-735f-47bb-8c36-0144a3c37ac2	2a295b54-aa30-496c-8ccd-f4f7295b5fdc	contact-info-display-section	{}	{"emailKey": "contact.email", "phoneKey": "contact.phone", "addressKey": "contact.address"}	{}	20	ALWAYS	f	\N	2026-07-09 18:49:23.383008	2026-07-09 18:49:23.383008
a3a8ec6d-5003-454b-898d-03bd60e9f4d5	9758e378-5e79-4238-8524-b75491c5b031	board-members-intro-grid	{}	{}	{}	10	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489
bff6f98d-1c78-4bd6-af02-d3fc8efa9ba7	9758e378-5e79-4238-8524-b75491c5b031	board-term-information-section	{}	{}	{}	30	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489
020ff53d-1cf6-450c-823e-9fb1b74d17e4	84930958-20f9-4a24-b7e5-01e12fde7b46	newsletter-hero-banner	{}	{}	{}	0	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489
f5172e6c-5f4d-44d2-ba72-4726c2dfd5ca	2a295b54-aa30-496c-8ccd-f4f7295b5fdc	contact-hero-banner	{}	{"titleKey": "contact.hero.title"}	{}	0	ALWAYS	f	\N	2026-07-09 18:49:23.383008	2026-07-10 16:38:23.795489
52c81973-5219-475c-8b95-88738e5c85a1	9758e378-5e79-4238-8524-b75491c5b031	hero	{"maxWidth": "max-w-5xl"}	{"title": "Board Members", "subtitle": "Meet the leadership of the Syrian Soil Science Society."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:10:40.721161
be8eefa6-d696-47be-8475-e2b0a676ec52	84930958-20f9-4a24-b7e5-01e12fde7b46	hero	{"maxWidth": "max-w-5xl"}	{"title": "Stay Connected", "subtitle": "Subscribe to receive news, events, and updates from the society."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:10:40.721161
f66ac02f-c63d-4c33-a86b-b0267f4d91c2	ea5cd0a4-5d99-4d34-be1d-4ca2511a8138	publications-list-section	{}	{}	{}	10	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489
9ff5b0e4-ada5-496f-9f45-2d64228e430c	2a295b54-aa30-496c-8ccd-f4f7295b5fdc	contact-form-section	{}	{}	{}	10	ALWAYS	f	\N	2026-07-09 18:49:23.383008	2026-07-10 16:38:23.795489
34febba0-d8a0-489e-9e93-88cc8b5ed559	2a295b54-aa30-496c-8ccd-f4f7295b5fdc	social-media-links-section	{}	{"twitterKey": "social.twitter_url", "youtubeKey": "social.youtube_url", "facebookKey": "social.facebook_url", "linkedinKey": "social.linkedin_url"}	{}	20	ALWAYS	f	\N	2026-07-09 18:49:23.383008	2026-07-10 16:38:23.795489
15b76c78-4172-421c-8023-757d9e93b299	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-hero-banner	{}	{}	{}	0	ALWAYS	f	\N	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
77654d7c-ec21-416f-98c1-ae54d7112011	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-overview-section	{}	{}	{}	10	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489
7f80cabf-fff9-4b08-b231-4dd16b842a75	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-organizational-chart-section	{}	{}	{}	30	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489
41ed6f4e-d91e-4ab5-a7e8-84b361649d98	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-gallery-section	{}	{}	{}	60	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489
df347c12-4b14-4e88-aea5-9f0b16dcae69	582cf8f7-f53d-4fcb-9f78-85f45a39f7dc	search	{"placeholder": "Search articles, publications, events..."}	{"title": "Search the Website"}	{"padding": "py-12", "textColor": "text-gray-900", "backgroundColor": "bg-white"}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
e57b1302-cd6b-449a-950a-e6ec46041bc5	1061a09f-975d-427a-92fa-c09f4dc98368	hero	{"maxWidth": "max-w-5xl"}	{"title": "Jobs", "subtitle": "Explore career opportunities at SSSSY and partner organizations."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
f97442a5-e230-492e-9d94-2b59c1f55f85	1061a09f-975d-427a-92fa-c09f4dc98368	jobs-list-section	{}	{}	{}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
e8842885-b6d9-4bde-9bc1-371018b1ff2b	259bcff7-a75b-44a6-bdce-fa2911c5fed5	members-list-section	{}	{}	{}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
ba0285da-3392-429e-8bb5-af6eae548dfe	fff8b2ef-f7e9-4d96-b545-291807f6da33	events-list-section	{}	{}	{}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
\.


--
-- TOC entry 5934 (class 0 OID 68488)
-- Dependencies: 251
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.pages (id, title_ar, title_en, slug, layout_type, is_published, is_homepage, parent_id, sort_order, author_id, created_at, updated_at, deleted_at, meta_title, meta_description, og_title, og_description, og_image_url) FROM stdin;
f34da8af-5f1c-4cd1-be78-f32962d31e2d	عن الجمعية	About	about	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489	\N	About the Society	Learn about the mission, vision, and history of the Syrian Soil Science Society.	About Us - SSSSY	Discover the Syrian Soil Science Society: our history, mission, and commitment to sustainable soil management in Syria.	http://localhost:3000/images/og-about.jpg
9758e378-5e79-4238-8524-b75491c5b031	أعضاء المجلس	Board	board	FLEXIBLE	t	f	\N	10	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489	\N	Board Members	Meet the leadership of the Syrian Soil Science Society.	Board of Directors - SSSSY	Discover the leadership and vision of the Syrian Soil Science Society.	http://localhost:3000/images/og-board.jpg
84930958-20f9-4a24-b7e5-01e12fde7b46	النشرة الإخبارية	Newsletter	newsletter	FLEXIBLE	t	f	\N	30	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489	\N	Newsletter	Subscribe for the latest updates from the society.	Newsletter - SSSSY	Stay updated with the latest news, events, and publications from SSSSY.	http://localhost:3000/images/og-newsletter.jpg
274da4e8-50cf-4aa7-9b95-68619f14ef92	رسالة الرئيس	President Message	president-message	FLEXIBLE	t	f	\N	40	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489	\N	President Message	A message from the president of the Syrian Soil Science Society.	President's Message - SSSSY	Insights and vision from the President of the Syrian Soil Science Society.	http://localhost:3000/images/og-president.jpg
9707179c-7cb8-4ac5-8284-cbfe005ca91b	الرئيسية	Home		FLEXIBLE	t	t	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	\N	Syrian Soil Science Society	Advancing soil science research, education, and sustainable land management in Syria.	\N	\N	\N
2a295b54-aa30-496c-8ccd-f4f7295b5fdc	اتصل بنا	Contact	contact	FLEXIBLE	t	f	\N	\N	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489	\N	Contact Us	Get in touch with the Syrian Soil Science Society.	Contact Us - SSSSY	Have a question, suggestion, or want to collaborate? We'd love to hear from you.	http://localhost:3000/images/og-contact.jpg
fff8b2ef-f7e9-4d96-b545-291807f6da33	الفعاليات	Events	events	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	\N	Events	Browse conferences, workshops, and scientific events.	\N	\N	\N
1061a09f-975d-427a-92fa-c09f4dc98368	الوظائف	Jobs	jobs	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	\N	Jobs	Explore career and collaboration opportunities.	\N	\N	\N
259bcff7-a75b-44a6-bdce-fa2911c5fed5	الأعضاء	Members	members	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	\N	Members	Discover the members of the Syrian Soil Science Society.	\N	\N	\N
7582f946-a41d-4460-a535-bb545f8288e3	الأخبار	News	news	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	\N	News	Read the latest society news and announcements.	\N	\N	\N
ea5cd0a4-5d99-4d34-be1d-4ca2511a8138	المنشورات	Publications	publications	FLEXIBLE	t	f	\N	50	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489	\N	Publications	Explore society publications and research output.	Publications - SSSSY	Access the latest scientific publications and contribute to soil science knowledge.	http://localhost:3000/images/og-publications.jpg
582cf8f7-f53d-4fcb-9f78-85f45a39f7dc	البحث	Search	search	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	\N	Search	Search across news, publications, and events.	\N	\N	\N
b708f50d-0a5c-4964-95cb-70ac63b7e0cd	الأقسام	Sections	sections	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	\N	Sections Library	Browse reusable public site sections.	\N	\N	\N
\.


--
-- TOC entry 5903 (class 0 OID 67852)
-- Dependencies: 220
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.permissions (id, name, display_name, category, description, created_at) FROM stdin;
a859d1f7-11a6-4c40-8775-f01c7b4b5a87	users:read	Read Users	Users	View user list and profiles	2026-07-09 10:39:16.907665
f14949b8-3890-47f3-b015-266b819819a9	users:create	Create Users	Users	Create new users	2026-07-09 10:39:16.907665
231eee95-1985-46dd-adfe-3b38fdfff6b9	users:update	Update Users	Users	Update existing users	2026-07-09 10:39:16.907665
8ef47b01-b24b-47db-bd6a-4f1180f76560	users:delete	Delete Users	Users	Delete users	2026-07-09 10:39:16.907665
58cf2eab-e423-4927-836f-58334d78e5df	roles:read	Read Roles	Roles	View roles and permissions	2026-07-09 10:39:16.907665
d37ffc96-d866-42d7-bd26-8c46b441afe0	roles:create	Create Roles	Roles	Create new roles	2026-07-09 10:39:16.907665
c2d17631-c248-4bf4-bea8-cf0054eb6955	roles:update	Update Roles	Roles	Update existing roles	2026-07-09 10:39:16.907665
939bdeda-2589-42c7-bc59-55d9d168cfe1	roles:delete	Delete Roles	Roles	Delete roles	2026-07-09 10:39:16.907665
d6e8c21a-0676-4e8f-93c2-214363b7eff0	content:read	Read Content	Content	View content items	2026-07-09 10:39:16.907665
bcb812ba-57ea-4041-9b4d-c80939cdd117	content:create	Create Content	Content	Create new content	2026-07-09 10:39:16.907665
e578ae70-b508-4217-8dfb-6376257c0240	content:update	Update Content	Content	Update existing content	2026-07-09 10:39:16.907665
4286a310-f4ac-4578-bb97-4d2874693a0e	content:delete	Delete Content	Content	Delete content	2026-07-09 10:39:16.907665
e06dc87e-3b71-4e70-b67e-68c5bacf5d39	content:publish	Publish Content	Content	Publish content items	2026-07-09 10:39:16.907665
fd20ea39-5cce-4c8e-96e1-ebb8e6843eb0	content:review	Review Content	Content	Review and approve content	2026-07-09 10:39:16.907665
740413a2-2cd6-4a70-a8cb-43961a43758e	media:read	Read Media	Media	View media library	2026-07-09 10:39:16.907665
e0862520-b3eb-40e8-a4be-077bdf32657f	media:upload	Upload Media	Media	Upload files	2026-07-09 10:39:16.907665
0aaac05e-70c2-4467-a768-2bcd9ec94e9b	media:delete	Delete Media	Media	Delete files	2026-07-09 10:39:16.907665
67526de4-a0c4-40bf-91e5-8ec7b3b44784	pages:read	Read Pages	Pages	View pages	2026-07-09 10:39:16.907665
0713235d-af40-4c9f-9fc6-5e93a52ae771	pages:create	Create Pages	Pages	Create new pages	2026-07-09 10:39:16.907665
cc7be5f7-bf62-47ce-a4bd-a9b6b3239269	pages:update	Update Pages	Pages	Update existing pages	2026-07-09 10:39:16.907665
b3d53833-f2d5-4b68-ae53-03017164c21c	pages:delete	Delete Pages	Pages	Delete pages	2026-07-09 10:39:16.907665
5fe68f9c-7be8-4551-ac74-357fe6af90b1	settings:read	Read Settings	Settings	View system settings	2026-07-09 10:39:16.907665
efea2695-ae03-4038-bfe4-381255e369c9	settings:update	Update Settings	Settings	Update system settings	2026-07-09 10:39:16.907665
1ea5cd41-605a-4096-999d-b0c420315fc4	audit:read	Read Audit Logs	Audit	View audit logs	2026-07-09 10:39:16.907665
0d23fb10-8dde-46ce-ab6f-b3be1ab0e654	users:manage-roles	Manage User Roles	Users	Assign roles to users	2026-07-09 10:39:16.907665
\.


--
-- TOC entry 5906 (class 0 OID 67901)
-- Dependencies: 223
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.refresh_tokens (id, user_id, token, expires_at, is_revoked, created_at) FROM stdin;
\.


--
-- TOC entry 5904 (class 0 OID 67863)
-- Dependencies: 221
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.role_permissions (role_id, permission_id, created_at) FROM stdin;
fd53cd22-8396-4700-af29-8906643e0758	a859d1f7-11a6-4c40-8775-f01c7b4b5a87	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	f14949b8-3890-47f3-b015-266b819819a9	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	231eee95-1985-46dd-adfe-3b38fdfff6b9	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	8ef47b01-b24b-47db-bd6a-4f1180f76560	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	58cf2eab-e423-4927-836f-58334d78e5df	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	d37ffc96-d866-42d7-bd26-8c46b441afe0	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	c2d17631-c248-4bf4-bea8-cf0054eb6955	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	939bdeda-2589-42c7-bc59-55d9d168cfe1	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	d6e8c21a-0676-4e8f-93c2-214363b7eff0	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	bcb812ba-57ea-4041-9b4d-c80939cdd117	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	e578ae70-b508-4217-8dfb-6376257c0240	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	4286a310-f4ac-4578-bb97-4d2874693a0e	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	e06dc87e-3b71-4e70-b67e-68c5bacf5d39	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	fd20ea39-5cce-4c8e-96e1-ebb8e6843eb0	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	740413a2-2cd6-4a70-a8cb-43961a43758e	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	e0862520-b3eb-40e8-a4be-077bdf32657f	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	0aaac05e-70c2-4467-a768-2bcd9ec94e9b	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	67526de4-a0c4-40bf-91e5-8ec7b3b44784	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	0713235d-af40-4c9f-9fc6-5e93a52ae771	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	cc7be5f7-bf62-47ce-a4bd-a9b6b3239269	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	b3d53833-f2d5-4b68-ae53-03017164c21c	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	5fe68f9c-7be8-4551-ac74-357fe6af90b1	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	efea2695-ae03-4038-bfe4-381255e369c9	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	1ea5cd41-605a-4096-999d-b0c420315fc4	2026-07-09 10:39:16.907665
fd53cd22-8396-4700-af29-8906643e0758	0d23fb10-8dde-46ce-ab6f-b3be1ab0e654	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	a859d1f7-11a6-4c40-8775-f01c7b4b5a87	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	f14949b8-3890-47f3-b015-266b819819a9	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	231eee95-1985-46dd-adfe-3b38fdfff6b9	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	8ef47b01-b24b-47db-bd6a-4f1180f76560	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	58cf2eab-e423-4927-836f-58334d78e5df	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	d37ffc96-d866-42d7-bd26-8c46b441afe0	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	c2d17631-c248-4bf4-bea8-cf0054eb6955	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	d6e8c21a-0676-4e8f-93c2-214363b7eff0	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	bcb812ba-57ea-4041-9b4d-c80939cdd117	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	e578ae70-b508-4217-8dfb-6376257c0240	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	4286a310-f4ac-4578-bb97-4d2874693a0e	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	e06dc87e-3b71-4e70-b67e-68c5bacf5d39	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	fd20ea39-5cce-4c8e-96e1-ebb8e6843eb0	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	740413a2-2cd6-4a70-a8cb-43961a43758e	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	e0862520-b3eb-40e8-a4be-077bdf32657f	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	0aaac05e-70c2-4467-a768-2bcd9ec94e9b	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	67526de4-a0c4-40bf-91e5-8ec7b3b44784	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	0713235d-af40-4c9f-9fc6-5e93a52ae771	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	cc7be5f7-bf62-47ce-a4bd-a9b6b3239269	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	b3d53833-f2d5-4b68-ae53-03017164c21c	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	5fe68f9c-7be8-4551-ac74-357fe6af90b1	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	efea2695-ae03-4038-bfe4-381255e369c9	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	0d23fb10-8dde-46ce-ab6f-b3be1ab0e654	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	d6e8c21a-0676-4e8f-93c2-214363b7eff0	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	bcb812ba-57ea-4041-9b4d-c80939cdd117	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	e578ae70-b508-4217-8dfb-6376257c0240	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	4286a310-f4ac-4578-bb97-4d2874693a0e	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	e06dc87e-3b71-4e70-b67e-68c5bacf5d39	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	fd20ea39-5cce-4c8e-96e1-ebb8e6843eb0	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	740413a2-2cd6-4a70-a8cb-43961a43758e	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	e0862520-b3eb-40e8-a4be-077bdf32657f	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	67526de4-a0c4-40bf-91e5-8ec7b3b44784	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	0713235d-af40-4c9f-9fc6-5e93a52ae771	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	cc7be5f7-bf62-47ce-a4bd-a9b6b3239269	2026-07-09 10:39:16.907665
471253f8-83f2-403a-8f6c-0c37e4c86205	d6e8c21a-0676-4e8f-93c2-214363b7eff0	2026-07-09 10:39:16.907665
471253f8-83f2-403a-8f6c-0c37e4c86205	fd20ea39-5cce-4c8e-96e1-ebb8e6843eb0	2026-07-09 10:39:16.907665
471253f8-83f2-403a-8f6c-0c37e4c86205	740413a2-2cd6-4a70-a8cb-43961a43758e	2026-07-09 10:39:16.907665
aa18b906-73fe-474a-98b7-ae27c1932c9b	d6e8c21a-0676-4e8f-93c2-214363b7eff0	2026-07-09 10:39:16.907665
aa18b906-73fe-474a-98b7-ae27c1932c9b	bcb812ba-57ea-4041-9b4d-c80939cdd117	2026-07-09 10:39:16.907665
aa18b906-73fe-474a-98b7-ae27c1932c9b	e578ae70-b508-4217-8dfb-6376257c0240	2026-07-09 10:39:16.907665
aa18b906-73fe-474a-98b7-ae27c1932c9b	740413a2-2cd6-4a70-a8cb-43961a43758e	2026-07-09 10:39:16.907665
aa18b906-73fe-474a-98b7-ae27c1932c9b	e0862520-b3eb-40e8-a4be-077bdf32657f	2026-07-09 10:39:16.907665
fd19e351-c8f7-44e2-b258-d1df8d15bb5c	d6e8c21a-0676-4e8f-93c2-214363b7eff0	2026-07-09 10:39:16.907665
fd19e351-c8f7-44e2-b258-d1df8d15bb5c	740413a2-2cd6-4a70-a8cb-43961a43758e	2026-07-09 10:39:16.907665
db5bac1c-57aa-4f24-aada-66b6c2db85b1	d6e8c21a-0676-4e8f-93c2-214363b7eff0	2026-07-09 10:39:16.907665
\.


--
-- TOC entry 5902 (class 0 OID 67838)
-- Dependencies: 219
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.roles (id, name, display_name_ar, display_name_en, description, hierarchy_level, is_system, created_at, updated_at) FROM stdin;
fd53cd22-8396-4700-af29-8906643e0758	SUPER_ADMIN	مدير النظام	Super Admin	\N	100	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	ADMIN	مدير	Admin	\N	80	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	PUBLISHER	ناشر	Publisher	\N	60	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
471253f8-83f2-403a-8f6c-0c37e4c86205	REVIEWER	مراجع	Reviewer	\N	40	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
aa18b906-73fe-474a-98b7-ae27c1932c9b	EDITOR	محرر	Editor	\N	30	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
fd19e351-c8f7-44e2-b258-d1df8d15bb5c	MEMBER	عضو	Member	\N	10	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
db5bac1c-57aa-4f24-aada-66b6c2db85b1	VISITOR	زائر	Visitor	\N	0	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
\.


--
-- TOC entry 5964 (class 0 OID 69149)
-- Dependencies: 281
-- Data for Name: sensor_readings; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.sensor_readings (id, sensor_id, value, recorded_at, created_at) FROM stdin;
\.


--
-- TOC entry 5963 (class 0 OID 69134)
-- Dependencies: 280
-- Data for Name: sensors; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.sensors (id, name, location, sensor_type, unit, latitude, longitude, is_active, farm_boundary_geojson, alert_threshold_min, alert_threshold_max, alert_enabled, created_at, updated_at) FROM stdin;
717fb5f2-204c-44ad-b5f6-5659c9130e24	Field A - Moisture	North Field	moisture	%	36.2	37.5	t	\N	\N	60	t	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
437bff1c-1ca9-466a-8a3c-522332eb3609	Field A - Temperature	North Field	temperature	°C	36.2	37.5	t	\N	\N	40	t	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
1c3f3037-4e0e-41fd-951d-86e3fba107cb	Field B - pH	South Field	ph	pH	35.8	37.2	t	\N	\N	8.5	f	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
43a87463-5326-4823-95d5-d47fc52db328	Field C - NPK	East Field	npk	mg/kg	36	38	t	\N	\N	200	f	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
c7db6984-8592-4942-94ea-2299a058702d	Greenhouse - Humidity	Greenhouse A	humidity	%	36.3	37.1	t	\N	\N	85	t	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
\.


--
-- TOC entry 5942 (class 0 OID 68655)
-- Dependencies: 259
-- Data for Name: seo_metadata; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.seo_metadata (id, entity_type, entity_id, meta_title, meta_description, og_title, og_description, og_image_url, canonical_url, robots, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5961 (class 0 OID 69097)
-- Dependencies: 278
-- Data for Name: site_sections; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.site_sections (id, name, slug, component_type, config, data, styling, is_active, sort_order, created_at, updated_at, location) FROM stdin;
c7c43d45-024b-4131-af2e-815a818928de	Homepage Hero	hero-banner	hero	{"maxWidth": "max-w-4xl"}	{"title": "Syrian Soil Science Society", "subtitle": "Advancing soil science research, education, and sustainable land management in Syria.", "buttonUrl": "/about", "buttonLabel": "Learn More"}	{"padding": "py-16 md:py-32", "textColor": "text-white", "backgroundColor": "bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay"}	t	0	2026-07-09 10:39:19.187363	2026-07-10 16:38:23.795489	homepage
c97b1a3f-9ae2-4193-a617-f5cd2d3bae49	Our Focus Areas	our-focus-areas	card-group	{"columns": 3}	{"cards": [{"title": "Research", "content": "Advancing soil science through cutting-edge research and field studies across Syria's diverse agricultural regions."}, {"title": "Education", "content": "Providing training, workshops, and educational programs for soil scientists, students, and farmers."}, {"title": "Sustainability", "content": "Promoting sustainable land management practices to protect and enhance Syria's soil resources for future generations."}], "title": "Our Focus Areas"}	{"padding": "py-16 md:py-20", "textColor": "text-gray-900", "backgroundColor": "bg-white"}	t	10	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	homepage
31e505c2-db5f-4cf1-8196-3080dee14e98	Join Our Community	join-our-community	cta	{}	{"title": "Join Our Community", "content": "Become a member of the Syrian Soil Science Society and contribute to the future of soil science in Syria and beyond.", "buttonUrl": "/members", "buttonLabel": "Become a Member"}	{"padding": "py-16 md:py-20", "textColor": "text-white", "backgroundColor": "bg-soil-clay"}	t	20	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	homepage
c5c7431f-c200-43cd-a5d4-f9d3dbf84bdb	Homepage Latest News	latest-news-feed	latest-news-feed	{}	{}	{}	t	30	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	homepage
3c9200cc-1de7-41ce-b164-6a557ae996a4	Homepage Upcoming Events	upcoming-events-feed	upcoming-events-feed	{}	{}	{}	t	40	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	homepage
2218dd2b-6007-4565-875b-370f3e71294a	Homepage Stats	stats-counter	stats	{"maxWidth": "max-w-5xl"}	{"items": [{"title": "Years Established", "value": "15+"}, {"title": "Members", "value": "500+"}, {"title": "Publications", "value": "200+"}, {"title": "Events", "value": "50+"}], "title": "SSSSY by the Numbers"}	{"padding": "py-16 md:py-20", "textColor": "text-white", "backgroundColor": "bg-gradient-to-r from-soil-dark to-soil-clay"}	t	50	2026-07-09 10:39:19.187363	2026-07-10 16:38:23.795489	homepage
0770e0fe-e5dd-4255-bf4d-3e81a46baae2	Testimonials	testimonials	testimonial	{}	{"title": "What Our Members Say", "testimonials": [{"name": "Dr. Ahmad K.", "role": "Soil Scientist", "quote": "SSSSY has been instrumental in connecting soil scientists across Syria and advancing research in sustainable agriculture."}, {"name": "Fatima M.", "role": "Student Member", "quote": "The workshops and educational programs provided by SSSSY have been invaluable to my academic and professional development."}, {"name": "Prof. Omar S.", "role": "Board Member", "quote": "Working with SSSSY has allowed me to contribute to meaningful projects that make a real difference in our communities."}]}	{"padding": "py-16 md:py-20", "textColor": "text-gray-900", "backgroundColor": "bg-soil-cream/30"}	t	60	2026-07-09 10:39:19.187363	2026-07-10 16:38:23.795489	homepage
62d93016-0298-42c8-a911-b07c248435c1	Contact Form	contact-form	contact-form	{}	{"title": "Get In Touch"}	{"padding": "py-16 md:py-20", "textColor": "text-gray-900", "backgroundColor": "bg-white"}	t	80	2026-07-09 10:39:19.187363	2026-07-10 16:38:23.795489	homepage
778f8aad-a0af-4d8a-afa2-75c0bdbcdb04	Homepage Newsletter	newsletter-signup	newsletter	{"maxWidth": "max-w-3xl"}	{"title": "Stay Connected", "content": "Subscribe to our newsletter to receive the latest news, event announcements, and updates from SSSSY."}	{"padding": "py-16 md:py-20", "textColor": "text-gray-900", "backgroundColor": "bg-white"}	t	70	2026-07-09 10:39:19.187363	2026-07-10 16:38:23.795489	homepage
fc01df08-ef76-4f59-92b3-4d60cd3f95db	Footer Layout	footer-layout	footer-layout	{"columns": 4}	{}	{}	t	0	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	footer
\.


--
-- TOC entry 5943 (class 0 OID 68668)
-- Dependencies: 260
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.system_config (id, config_key, config_value, config_group, config_type, is_encrypted, is_public, description, updated_by, created_at, updated_at) FROM stdin;
7d67b99f-0150-40fb-b175-6365bb9e1e99	site_name_en	Soil Science Society of Syria	GENERAL	STRING	f	t	English site name	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
8bef50d7-f91b-4dee-a3e4-b968e4007aa5	site_name_ar	الجمعية السورية لعلم التربة	GENERAL	STRING	f	t	Arabic site name	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
def33c84-6c3b-4ee0-9200-1815ff31e473	site_description	Official website of the Soil Science Society of Syria	GENERAL	STRING	f	t	Site description	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
d50650bd-7363-43ad-b6ad-7689a62766b2	contact_email	info@ssssy.org	GENERAL	STRING	f	t	Primary contact email	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
8900afc1-e405-4ea0-82d6-965fa1051690	contact_phone	+963-11-XXX-XXXX	GENERAL	STRING	f	t	Primary contact phone	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
45260e12-64ed-413d-981a-188ca349ba86	address_en	Damascus, Syria	GENERAL	STRING	f	t	English address	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
f3270166-828e-48bf-9cfc-e575ba4311ab	address_ar	دمشق، سوريا	GENERAL	STRING	f	t	Arabic address	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
07c20f5a-f43d-4302-90ff-13754d79d785	social_facebook	https://facebook.com/ssssy	GENERAL	STRING	f	t	Facebook page URL	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
315fc0a1-a669-4eae-a716-6aedeed7a542	social_twitter	https://twitter.com/ssssy	GENERAL	STRING	f	t	Twitter/X profile URL	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
ab30f253-481f-436b-8b7c-5615217c3088	social_linkedin	https://linkedin.com/company/ssssy	GENERAL	STRING	f	t	LinkedIn page URL	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
8c632fa1-806d-4978-b81a-512a6e53ed00	maintenance_mode	false	GENERAL	STRING	f	f	Enable maintenance mode	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
ad3114a0-9e4d-4b64-9719-3660f0b124fc	allow_registration	true	GENERAL	STRING	f	f	Allow user registration	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
6c222c6c-9aec-47e5-baba-c61fdd21aaf4	newsletter_enabled	true	GENERAL	STRING	f	f	Enable newsletter subscription	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
8575d227-35b7-4adf-8fff-f70010893e43	comments_moderation	pre	GENERAL	STRING	f	f	Comment moderation: pre, post, or none	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
75e77a3c-085b-49c9-9191-ba2289be7173	default_language	en	GENERAL	STRING	f	t	Default site language	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
4cbc31fe-b80c-4012-a401-5ffbb1387afb	social.facebookUrl	https://facebook.com/ssssy	GENERAL	STRING	f	t	Facebook URL	\N	2026-07-09 18:07:24.037676	2026-07-09 18:07:24.037676
5dd37019-a61d-44b3-9032-159899c31860	social.youtubeUrl	https://youtube.com/@ssssy	GENERAL	STRING	f	t	YouTube URL	\N	2026-07-09 18:07:24.037676	2026-07-09 18:07:24.037676
44c71661-d6ef-4840-b653-f70ea6756da0	contact.phone	+963 11 234 5678	GENERAL	STRING	f	t	Phone number	\N	2026-07-09 18:07:24.037676	2026-07-09 18:07:24.037676
955443ad-4e2b-4b46-ba5b-8163bc18b2b6	social.twitterUrl	https://twitter.com/ssssy	GENERAL	STRING	f	t	Twitter/X URL	\N	2026-07-09 18:07:24.037676	2026-07-09 18:07:24.037676
d580c8e7-1455-44fa-9b65-9a72a85c3fa8	contact.email	info@ssssy.org	GENERAL	STRING	f	t	Email address	\N	2026-07-09 18:07:24.037676	2026-07-09 18:07:24.037676
8b91d5e4-34a1-4aac-b2d3-c317cab29d88	contact.address	Damascus, Syria	GENERAL	STRING	f	t	Physical address	\N	2026-07-09 18:07:24.037676	2026-07-09 18:07:24.037676
80d31567-1494-4e14-853d-421c71554924	social.linkedinUrl	https://linkedin.com/company/ssssy	GENERAL	STRING	f	t	LinkedIn URL	\N	2026-07-09 18:07:24.037676	2026-07-09 18:07:24.037676
\.


--
-- TOC entry 5909 (class 0 OID 67959)
-- Dependencies: 226
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.tags (id, name_ar, name_en, slug, created_at) FROM stdin;
\.


--
-- TOC entry 5962 (class 0 OID 69119)
-- Dependencies: 279
-- Data for Name: theme_settings; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.theme_settings (id, setting_key, setting_value, setting_type, group_name, label, created_at, updated_at) FROM stdin;
7fdb9be4-75d6-4a65-b8ed-1ece868c9840	shad_primary	15 30% 35%	color	colors	Primary Color (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
35c3af83-dd6d-4171-ae56-9f09c1fa449c	shad_primary_foreground	40 30% 96%	color	colors	Primary Foreground (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
b966755a-a1da-42a7-bdad-bfc2bad256cf	shad_secondary	120 30% 35%	color	colors	Secondary Color (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
e4344936-a302-45e2-9ccc-c05b7de98be3	shad_secondary_foreground	0 0% 100%	color	colors	Secondary Foreground (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
1e9ba4db-4232-46bb-9145-62af52b2a1bf	shad_accent	30 25% 70%	color	colors	Accent Color (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
c8fe9d6b-5b59-49ab-9b3a-c87df50af94f	shad_accent_foreground	20 30% 15%	color	colors	Accent Foreground (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
e29e7d52-e08a-4882-8aec-4b9fcae8e35d	shad_muted	40 15% 85%	color	colors	Muted Background (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
44743a0f-0476-4fba-86a0-c0228a75d84d	shad_muted_foreground	20 10% 40%	color	colors	Muted Foreground (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
f72968ce-e8bf-4dc5-b52a-59980a6d71e0	shad_background	40 30% 96%	color	colors	Page Background (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
ae5edb55-fa71-4b1e-8f07-127fd1c931f3	shad_foreground	20 30% 15%	color	colors	Page Foreground (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
497513ba-4e93-4c24-9e3e-d8f9ffc45857	shad_border	30 15% 80%	color	colors	Border Color (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
0c07187c-c444-4033-8c2f-a5c6e3c1ca35	shad_ring	15 30% 35%	color	colors	Focus Ring (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
bb60f4fe-0367-4f3a-b00c-cc8494949533	shad_destructive	0 84% 60%	color	colors	Destructive Color (HSL)	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
91d0093c-3d9e-47ee-998e-05c69944cb61	color_soil_dark	#3E2723	color	brand_colors	Soil Dark	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
089a0008-faaa-407a-879b-8e43a35f9b62	color_soil_clay	#6D4C41	color	brand_colors	Soil Clay	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
88e93dc4-e65e-4ca9-9568-ac2f35ee1544	color_soil_rich	#8D6E63	color	brand_colors	Soil Rich	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
76946db1-794f-494a-99bb-866ddfe43ba1	color_soil_taupe	#BCAAA4	color	brand_colors	Soil Taupe	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
01e79e4c-b204-4540-ad9d-694819e03c9a	color_soil_sand	#D7CCC8	color	brand_colors	Soil Sand	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
b93ed63d-b4b9-4843-a4ad-5073a1e92b55	color_soil_cream	#FFF8E1	color	brand_colors	Soil Cream	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
903ff566-51ba-4509-b326-823f82b8b5bf	color_forest	#2E7D32	color	brand_colors	Forest Green	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
3e4c90e7-53b7-4641-b75b-62aef02ba3d8	color_forest_light	#558B2F	color	brand_colors	Forest Light Green	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
85c5a8df-7236-4fb5-af73-0288ecc43096	color_earth_gray	#616161	color	brand_colors	Earth Gray	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
1e76856d-bab9-442d-8320-497d7188263f	color_deep_soil	#4E342E	color	brand_colors	Deep Soil	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
09cc89a8-086d-47a6-bb09-573cba25f766	font_heading	Inter	font	fonts	Heading Font	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
86404a29-4257-4457-8eac-856b73012d3e	font_body	Merriweather	font	fonts	Body Font	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
88fe8dea-3f62-499f-b62e-1121fd48bc4f	layout_radius	0.5rem	text	layout	Base Border Radius	2026-07-09 10:39:19.264221	2026-07-09 10:39:19.264221
a437f282-db84-4012-b51a-345f10afa6db	animation_page_transition	fade	select	animations	Page Transition Style	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
6bf9ba78-8d69-4766-9c05-ddc6e9c53c71	animation_scroll_reveal	true	boolean	animations	Scroll Reveal Animations	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
25ce674f-5756-4f41-84ea-3134c64b64c1	animation_hover_effects	true	boolean	animations	Hover Scale Effects	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
7a1272ad-b531-45d8-8334-cfeec4eb68a2	animation_magnetic_hover	true	boolean	animations	Magnetic Hover Effect	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
c9fdeb43-3cfc-435b-9cea-02531f24bdea	animation_particle_background	true	boolean	animations	Particle Background	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
c1b8f102-7cd4-4992-9806-874c6505f638	animation_stagger_delay	0.1	text	animations	Stagger Animation Delay (s)	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
09c79c1a-dbf1-48f3-8e6f-aea218d5d254	animation_duration	0.5	text	animations	Animation Duration (s)	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
2bf003ce-98ad-48db-a1f0-3be58cf90f49	style_card_style	elevated	select	effects	Default Card Style	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
c6bd14c5-e80a-417d-a2ba-d858fdec8fe3	style_button_style	default	select	effects	Default Button Style	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
a9bd278b-eeeb-4866-9b11-593121090a46	style_glass_intensity	medium	select	effects	Glassmorphism Intensity	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
1b5c943e-0686-4de8-b255-4b59c08312bb	style_gradient_text	false	boolean	effects	Gradient Text on Headings	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
3110636e-29a7-4360-9772-3fd7350ca4db	style_glow_effects	true	boolean	effects	Glow Effects on Interactive Elements	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
70abc41b-6d31-469b-8d2a-84219d706412	style_noise_overlay	true	boolean	effects	Subtle Noise Texture	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
502f91ca-6b92-4618-8913-765453dcd007	style_border_animation	false	boolean	effects	Animated Borders on Focus	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
3b366f95-0953-425a-ac0f-898db21b2855	layout_container_width	default	select	layout	Container Max Width	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
51518fbf-e6d8-4af1-9f95-36cbd067c274	layout_header_style	sticky	select	layout	Header Style	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
69c629c6-3a46-46da-9249-a3e2ba55c51e	layout_content_spacing	comfortable	select	layout	Content Spacing	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
771c4c08-afd2-4c61-a502-d7182d4ed66c	skin_preset	default	select	skins	Theme Skin Preset	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
ae873c04-0fcc-4ee8-a161-27b015e1a637	feature_command_palette	true	boolean	features	Global Command Palette (⌘K)	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
d56f9beb-21f4-4c47-837b-c39ead683f0d	feature_gesture_nav	false	boolean	features	Gesture Navigation (mobile)	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
b9b4f633-9be6-414b-b65e-c78a02011848	feature_smart_cards	true	boolean	features	Smart Content Cards	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
c3b9d040-d425-43af-b94b-e4a7781b35b5	feature_adaptive_cursor	false	boolean	features	Interactive Dynamic Cursor	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
c2b76377-7c79-4254-abf5-29786298901c	particle_connection_distance	120	text	particles	Particle Connection Distance (px)	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
e9162de8-1e78-43fd-9e6c-698aea994d37	particle_mouse_influence	3	text	particles	Mouse Influence Strength (0-10)	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
c2972abc-b5aa-4c73-81a6-6579e35880b1	particle_organic_shapes	true	boolean	particles	Organic Particle Shapes	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
dd744880-1d43-4920-b4de-072740ab022f	particle_count	30	text	particles	Particle Count	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
326f8df2-0885-42b9-842d-98fa5aff9cad	ai_theme_adaptation	false	boolean	ai	Time-of-Day Adaptive Theme	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
bb97d2f3-2106-4a33-9e64-c43e5b82a242	ai_adaptation_strength	0.5	text	ai	Adaptation Strength (0-1)	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
872a212a-af50-4c53-9fe5-45cf18beb8e2	feature_3d_hero	true	boolean	features	3D Interactive Soil Cross-Section Hero	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
99056306-68a4-4d7c-af31-7135a2be8215	effect_soil_texture	true	boolean	features	Procedural Soil Texture Background	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
86f8d304-d275-45d7-b1c6-189ed9d529d7	effect_soil_type	loam	select	effects	Soil Texture Type	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
80f82bfe-2d9b-44b6-a8f9-ad21ea58447c	effect_texture_intensity	0.15	text	effects	Soil Texture Intensity (0-1)	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
5fca3108-af90-4df4-b38c-aa74549be066	style_transition_duration	0.35	text	effects	Cinematic Transition Duration (s)	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
d2597628-e48b-474d-acc4-95e799f186b8	feature_3d_charts	true	boolean	features	3D Interactive Data Charts	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
78e20714-b048-41a4-834d-cafa37ce5a01	nav_predictive	false	boolean	features	Predictive Navigation Prefetch	2026-07-09 10:39:19.357524	2026-07-09 10:39:19.357524
7df8708e-a2c6-4118-bd48-f0c8e9db7eed	nav_adaptive_ordering	false	boolean	features	Adaptive Navigation Ordering	2026-07-09 10:39:19.357524	2026-07-09 10:39:19.357524
2736df21-9ac6-446c-9aee-a5e6c2f7e3bf	nav_prefetch_depth	2	text	features	Navigation Prefetch Depth	2026-07-09 10:39:19.357524	2026-07-09 10:39:19.357524
68c50844-f460-408f-bbd4-01942c92d14b	card_living_preview	true	boolean	features	Smart Content Cards with Preview	2026-07-09 10:39:19.357524	2026-07-09 10:39:19.357524
c1e32f70-63f6-4492-a512-0dcc2099267b	card_particle_gather	false	boolean	features	Particle Gather on Card Hover	2026-07-09 10:39:19.357524	2026-07-09 10:39:19.357524
ecfd5d63-86b8-4d36-bef2-7c3c65ad2560	card_interest_learning	false	boolean	features	Interest-Based Content Learning	2026-07-09 10:39:19.357524	2026-07-09 10:39:19.357524
44d8bf5b-b845-44c4-ac68-556204002548	gesture_swipe_nav	false	boolean	features	Swipe Navigation on Mobile	2026-07-09 10:39:19.357524	2026-07-09 10:39:19.357524
61b6ddd6-b0cc-4f6f-a0d0-9130695febbf	gesture_pinch_zoom	false	boolean	features	Pinch-to-Zoom on Images	2026-07-09 10:39:19.357524	2026-07-09 10:39:19.357524
5bfce040-3e94-4540-9462-96a0e0c16212	gesture_shake_random	false	boolean	features	Shake for Random Content	2026-07-09 10:39:19.357524	2026-07-09 10:39:19.357524
be2572a7-6223-4ce6-8ab5-6d1cf4b3b7ce	feature_chart_components	true	boolean	features	Chart Components (Bar/Line/Pie)	2026-07-09 10:39:19.38286	2026-07-09 10:39:19.38286
000fb6fc-bcd2-43ec-880c-42d83e49dcfd	feature_color_picker	true	boolean	features	Color Picker Component	2026-07-09 10:39:19.38286	2026-07-09 10:39:19.38286
74276380-ce6b-4ca2-9545-5d4a44393ba4	feature_dropzone	true	boolean	features	File Dropzone Component	2026-07-09 10:39:19.38286	2026-07-09 10:39:19.38286
24c78dbe-79f3-4a68-b0d8-47333feb7382	feature_icon_picker	true	boolean	features	Icon Picker Component	2026-07-09 10:39:19.38286	2026-07-09 10:39:19.38286
f4d8d870-fea6-4789-a483-233d46902d44	feature_tour	true	boolean	features	Onboarding Tour Component	2026-07-09 10:39:19.38286	2026-07-09 10:39:19.38286
4eff5b53-222f-4142-a66d-3321800d46f2	feature_tree_view	true	boolean	features	Tree View Component	2026-07-09 10:39:19.38286	2026-07-09 10:39:19.38286
8e47424a-5759-4470-891e-458e651b2391	animation_spring_mass	1	text	animations	Spring Mass (physics weight)	2026-07-09 10:39:19.38286	2026-07-09 10:39:19.38286
b06c33d4-ae86-4c69-b3eb-7d177db16b01	animation_spring_tension	170	text	animations	Spring Tension (stiffness)	2026-07-09 10:39:19.38286	2026-07-09 10:39:19.38286
d9fa1acd-c5e4-43da-be3f-8163f93779d1	animation_spring_friction	26	text	animations	Spring Friction (damping)	2026-07-09 10:39:19.38286	2026-07-09 10:39:19.38286
f875a39e-7c29-41ee-8c37-04cb3ccb49fa	feature_theme_playground	true	boolean	features	Live Theme Playground	2026-07-09 10:39:19.38286	2026-07-09 10:39:19.38286
876d90e3-5627-49cc-a926-fa6462e15ad4	sound_ambient	false	boolean	features	Ambient Background Sounds	2026-07-09 10:39:19.403652	2026-07-09 10:39:19.403652
f8d15263-4c3e-4640-a62f-73cc9a04956d	sound_volume	0.3	text	features	Ambient Sound Volume (0-1)	2026-07-09 10:39:19.403652	2026-07-09 10:39:19.403652
bf2aadc6-3bb8-4084-af20-70023f04c7b8	sound_profile	academic	select	features	Sound Profile	2026-07-09 10:39:19.403652	2026-07-09 10:39:19.403652
db888d8c-b27e-4039-b759-9d2356ecb968	haptic_enabled	false	boolean	features	Haptic Feedback (Mobile Vibration)	2026-07-09 10:39:19.403652	2026-07-09 10:39:19.403652
8cce9666-9f1b-4223-81fd-c7ad9c59668e	haptic_intensity	0.5	text	features	Haptic Intensity (0-1)	2026-07-09 10:39:19.403652	2026-07-09 10:39:19.403652
e33779c6-4ee6-4dae-bd7f-da9782f740eb	cursor_custom	false	boolean	features	Custom Dynamic Cursor	2026-07-09 10:39:19.403652	2026-07-09 10:39:19.403652
a9c30fc1-c0ed-4053-afaf-a0f0ae8cc797	cursor_style	minimal	select	effects	Cursor Style	2026-07-09 10:39:19.403652	2026-07-09 10:39:19.403652
5e56435b-f13e-49e5-81af-447bedf70310	voice_metaphorical	true	boolean	features	Metaphorical Soil-Themed Voice	2026-07-09 10:39:19.403652	2026-07-09 10:39:19.403652
f23666bc-8c84-4bb8-b465-e644c96067eb	voice_formality	0.3	text	features	Voice Formality (0=casual, 1=academic)	2026-07-09 10:39:19.403652	2026-07-09 10:39:19.403652
1db9660b-db9c-479f-b0d0-8e7e963258c4	feature_viewport_prefetch	true	boolean	features	Viewport-Based Link Prefetching	2026-07-09 10:39:19.423492	2026-07-09 10:39:19.423492
9b5885e7-7ed1-415b-b110-ce2a099246d3	feature_optimistic_ui	true	boolean	features	Optimistic UI Updates	2026-07-09 10:39:19.423492	2026-07-09 10:39:19.423492
88cf0108-975f-404d-9b13-c6c35c33e289	animation_soil_shimmer	true	boolean	features	Soil Particle Shimmer Loading	2026-07-09 10:39:19.423492	2026-07-09 10:39:19.423492
946d32d2-db2d-414d-98af-779d28a9ef07	feature_offline_page	true	boolean	features	Offline Fallback Page	2026-07-09 10:39:19.423492	2026-07-09 10:39:19.423492
9de28980-b0e1-4daf-82f1-c3469b815917	feature_push_notifications	false	boolean	features	Push Notifications	2026-07-09 10:39:19.423492	2026-07-09 10:39:19.423492
b2807750-92f0-42b3-86ee-9893095e4efd	feature_background_sync	false	boolean	features	Background Sync for Forms	2026-07-09 10:39:19.423492	2026-07-09 10:39:19.423492
793308f0-81db-446d-879f-a300998cdc67	feature_soil_blur	true	boolean	features	Soil Texture Blur Placeholders	2026-07-09 10:39:19.423492	2026-07-09 10:39:19.423492
c2b89ef0-61cc-4bf7-9029-77de6cd1d22e	feature_responsive_images	true	boolean	features	Responsive Image srcset/sizes	2026-07-09 10:39:19.423492	2026-07-09 10:39:19.423492
b59a47c6-10ef-4e45-b914-5f997c195c69	feature_page_builder	true	boolean	features	Visual Page Builder 2.0	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
fb66b5b7-2dc7-4642-b6dc-b5b57918b778	feature_page_builder_undo	true	boolean	features	Page Builder Undo/Redo	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
a3635afa-69fc-42be-83e7-683ef4a5a56d	feature_page_builder_templates	true	boolean	features	Page Builder Template Library	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
2eb4de5c-6fdf-43a7-9ff5-12da98c6c7e9	feature_content_intelligence	true	boolean	features	Content Intelligence Dashboard	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
2dec6ca5-7472-4e6c-8140-8843f03dd087	feature_seo_analyzer	true	boolean	features	SEO Score Analysis	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
6108b467-46df-49c0-be7c-c4815bf20262	feature_readability_check	true	boolean	features	Readability Score Check	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
10c4f33d-94e7-4b7c-8149-23a8a320ef85	feature_content_gap_analysis	true	boolean	features	Content Gap Analysis	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
2890e876-1750-4645-ab54-fa754f849336	feature_best_time_publish	true	boolean	features	Best Time to Publish Suggestion	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
0b475695-bb7c-4621-8396-856ec01098b3	feature_collaborative_editing	true	boolean	features	Collaborative Editing Tools	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
254a7f07-2154-4fb5-accd-6f2fc0177669	feature_live_cursors	true	boolean	features	Real-time Cursor Presence	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
0c54695c-4b60-4406-acfc-9674c65ade46	feature_comment_threads	true	boolean	features	Inline Comment Threads	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
8078708f-ac8b-469e-97cf-bf32185452fe	feature_version_comparison	true	boolean	features	Side-by-Side Version Comparison	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
276af137-6110-4c5c-8bcd-88331a9fe2e0	feature_approval_workflow	true	boolean	features	Content Approval Workflows	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
286bf1b4-2222-4428-a714-f77702026d74	feature_activity_feed	true	boolean	features	Team Activity Feed	2026-07-09 10:39:19.444389	2026-07-09 10:39:19.444389
98f95c27-3767-49b2-9c83-61babf93a7bd	feature_iot_sensors	true	boolean	features	IoT Sensor Data Platform	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
f8e52d85-7036-4eba-bd12-fc03103958b0	feature_sensor_realtime	true	boolean	features	Real-Time Sensor Updates via WebSocket	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
3562664a-33cf-4927-8ba7-2d62bba952b5	feature_sensor_alerts	true	boolean	features	Sensor Alert Thresholds	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
a99a1192-27a1-4a48-b21d-22b2f119724d	feature_sensor_geojson	true	boolean	features	GeoJSON Farm Boundary Mapping	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
5f3fca81-edf0-498a-a4d8-beb1df5fb256	feature_sensor_reports	true	boolean	features	CSV/PDF Sensor Reports	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
\.


--
-- TOC entry 5905 (class 0 OID 67879)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.users (id, username, email, password_hash, first_name_ar, last_name_ar, first_name_en, last_name_en, phone, avatar_url, role_id, is_active, is_email_verified, email_verified_at, last_login_at, failed_login_attempts, account_locked_until, created_at, updated_at, institution, department, "position", specialization, biography, address, city, country, two_factor_enabled, deleted_at, two_factor_secret, preferred_language) FROM stdin;
6d6595c0-1835-42be-89a1-1a44b899141c	admin	admin@ssssy.org.sy	$2a$10$yV7UTAfe5DuI/Wu4SL0Lc.R9gdC53X1jT38idZjrvjGzxxnC0H2Bq	\N	\N	Super	Admin	\N	\N	fd53cd22-8396-4700-af29-8906643e0758	t	t	\N	2026-07-10 16:43:29.665195	0	\N	2026-07-09 10:39:16.907665	2026-07-10 16:43:29.695478	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	en
\.


--
-- TOC entry 5950 (class 0 OID 68813)
-- Dependencies: 267
-- Data for Name: workflow_actions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.workflow_actions (id, content_id, workflow_id, from_state_id, to_state_id, action, actor_id, comments, metadata, created_at) FROM stdin;
\.


--
-- TOC entry 5915 (class 0 OID 68094)
-- Dependencies: 232
-- Data for Name: workflow_logs; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.workflow_logs (id, content_id, from_status, to_status, action, actor_id, assignee_id, comments, created_at) FROM stdin;
\.


--
-- TOC entry 5948 (class 0 OID 68763)
-- Dependencies: 265
-- Data for Name: workflow_states; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.workflow_states (id, workflow_id, name, label_ar, label_en, color, is_initial, is_final, sort_order, created_at) FROM stdin;
4bb16cd9-d2b0-46d4-8d94-9e903440976b	a1b2c3d4-e5f6-7890-abcd-ef1234567890	DRAFT	مسودة	Draft	#6B7280	t	f	0	2026-07-09 10:39:18.868583
7ccd2446-b26d-4128-b019-d9c77c2f0a1d	a1b2c3d4-e5f6-7890-abcd-ef1234567890	REVIEW	قيد المراجعة	In Review	#F59E0B	f	f	1	2026-07-09 10:39:18.868583
1fdc8f4f-c12c-4a97-b004-3719d9de4b99	a1b2c3d4-e5f6-7890-abcd-ef1234567890	APPROVED	موافق عليه	Approved	#10B981	f	f	2	2026-07-09 10:39:18.868583
05094154-9906-4292-9a09-a0838e2d742a	a1b2c3d4-e5f6-7890-abcd-ef1234567890	PUBLISHED	منشور	Published	#059669	f	t	3	2026-07-09 10:39:18.868583
359e0d7b-ed68-433a-aa38-df3175f7b3c8	a1b2c3d4-e5f6-7890-abcd-ef1234567890	ARCHIVED	مؤرشف	Archived	#9CA3AF	f	t	4	2026-07-09 10:39:18.868583
f2df7c96-0788-4370-a502-771134db97f0	b2c3d4e5-f6a7-8901-bcde-f12345678901	DRAFT	مسودة	Draft	#6B7280	t	f	0	2026-07-09 10:39:18.868583
29b5e6b0-f29c-45b2-9893-06826d2a2ec3	b2c3d4e5-f6a7-8901-bcde-f12345678901	REVIEW	قيد المراجعة	In Review	#F59E0B	f	f	1	2026-07-09 10:39:18.868583
4a61ea63-5a0b-483f-98ba-f3e961852ccb	b2c3d4e5-f6a7-8901-bcde-f12345678901	APPROVED	موافق عليه	Approved	#10B981	f	f	2	2026-07-09 10:39:18.868583
461b9521-c06e-47d5-aaef-2bd39044376d	b2c3d4e5-f6a7-8901-bcde-f12345678901	PUBLISHED	منشور	Published	#059669	f	t	3	2026-07-09 10:39:18.868583
00d86c23-36b6-4ed7-9c2f-13f5d154ecfe	b2c3d4e5-f6a7-8901-bcde-f12345678901	ARCHIVED	مؤرشف	Archived	#9CA3AF	f	t	4	2026-07-09 10:39:18.868583
e5e1a054-b651-434b-9176-62f497607e96	c3d4e5f6-a7b8-9012-cdef-123456789012	DRAFT	مسودة	Draft	#6B7280	t	f	0	2026-07-09 10:39:18.868583
c097e7b0-2609-40bb-b09a-8835006ac2d4	c3d4e5f6-a7b8-9012-cdef-123456789012	REVIEW	قيد المراجعة	In Review	#F59E0B	f	f	1	2026-07-09 10:39:18.868583
86810773-937b-46fa-986a-8b0620874abe	c3d4e5f6-a7b8-9012-cdef-123456789012	APPROVED	موافق عليه	Approved	#10B981	f	f	2	2026-07-09 10:39:18.868583
f7907e63-6098-4a88-b89d-2b8e5452ec53	c3d4e5f6-a7b8-9012-cdef-123456789012	PUBLISHED	منشور	Published	#059669	f	t	3	2026-07-09 10:39:18.868583
6c471b90-332b-421d-861a-0f17ffecc70f	c3d4e5f6-a7b8-9012-cdef-123456789012	ARCHIVED	مؤرشف	Archived	#9CA3AF	f	t	4	2026-07-09 10:39:18.868583
\.


--
-- TOC entry 5949 (class 0 OID 68783)
-- Dependencies: 266
-- Data for Name: workflow_transitions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.workflow_transitions (id, workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, conditions, sort_order, created_at) FROM stdin;
0ef11164-ff9b-4ef9-b4b9-2b5a66cd95f2	a1b2c3d4-e5f6-7890-abcd-ef1234567890	4bb16cd9-d2b0-46d4-8d94-9e903440976b	7ccd2446-b26d-4128-b019-d9c77c2f0a1d	تقديم للمراجعة	["EDITOR", "PUBLISHER"]	f	{}	0	2026-07-09 10:39:18.868583
ba2e7c94-2494-4624-88c8-e5f4bf5d3a5d	a1b2c3d4-e5f6-7890-abcd-ef1234567890	7ccd2446-b26d-4128-b019-d9c77c2f0a1d	1fdc8f4f-c12c-4a97-b004-3719d9de4b99	موافقة	["ADMIN", "PUBLISHER"]	f	{}	1	2026-07-09 10:39:18.868583
599cb07b-d5c9-43f6-9595-24155b5eae7a	a1b2c3d4-e5f6-7890-abcd-ef1234567890	7ccd2446-b26d-4128-b019-d9c77c2f0a1d	4bb16cd9-d2b0-46d4-8d94-9e903440976b	طلب تعديل	["ADMIN", "EDITOR", "PUBLISHER"]	t	{}	2	2026-07-09 10:39:18.868583
713497e7-9e0f-43a1-8067-ecea3f9dd303	a1b2c3d4-e5f6-7890-abcd-ef1234567890	1fdc8f4f-c12c-4a97-b004-3719d9de4b99	05094154-9906-4292-9a09-a0838e2d742a	نشر	["ADMIN", "PUBLISHER"]	f	{}	3	2026-07-09 10:39:18.868583
819eb55e-77b0-47b7-8ab4-d8aed0c9e108	a1b2c3d4-e5f6-7890-abcd-ef1234567890	05094154-9906-4292-9a09-a0838e2d742a	359e0d7b-ed68-433a-aa38-df3175f7b3c8	أرشفة	["ADMIN"]	t	{}	4	2026-07-09 10:39:18.868583
8ef23b2d-b55a-450a-b321-5b051732a249	b2c3d4e5-f6a7-8901-bcde-f12345678901	f2df7c96-0788-4370-a502-771134db97f0	29b5e6b0-f29c-45b2-9893-06826d2a2ec3	تقديم للمراجعة	["EDITOR", "PUBLISHER"]	f	{}	0	2026-07-09 10:39:18.868583
10e62c97-4874-4bbf-ba48-9fea452654e6	b2c3d4e5-f6a7-8901-bcde-f12345678901	29b5e6b0-f29c-45b2-9893-06826d2a2ec3	4a61ea63-5a0b-483f-98ba-f3e961852ccb	موافقة	["ADMIN", "PUBLISHER"]	f	{}	1	2026-07-09 10:39:18.868583
a85faaf1-31a3-4bbd-9f5f-ce2cc9e5f711	b2c3d4e5-f6a7-8901-bcde-f12345678901	4a61ea63-5a0b-483f-98ba-f3e961852ccb	461b9521-c06e-47d5-aaef-2bd39044376d	نشر	["ADMIN", "PUBLISHER"]	f	{}	2	2026-07-09 10:39:18.868583
00062c29-0e15-48bb-aa8d-bc6cbbd5ee73	c3d4e5f6-a7b8-9012-cdef-123456789012	e5e1a054-b651-434b-9176-62f497607e96	c097e7b0-2609-40bb-b09a-8835006ac2d4	تقديم للمراجعة	["EDITOR", "PUBLISHER"]	f	{}	0	2026-07-09 10:39:18.868583
5d26ed55-ed0b-4e93-8b75-a662a2ff87ce	c3d4e5f6-a7b8-9012-cdef-123456789012	c097e7b0-2609-40bb-b09a-8835006ac2d4	86810773-937b-46fa-986a-8b0620874abe	موافقة	["ADMIN", "PUBLISHER"]	f	{}	1	2026-07-09 10:39:18.868583
cba4d072-41d4-47f9-b44b-e03ad739d8bd	c3d4e5f6-a7b8-9012-cdef-123456789012	86810773-937b-46fa-986a-8b0620874abe	f7907e63-6098-4a88-b89d-2b8e5452ec53	نشر	["ADMIN", "PUBLISHER"]	f	{}	2	2026-07-09 10:39:18.868583
\.


--
-- TOC entry 5947 (class 0 OID 68750)
-- Dependencies: 264
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.workflows (id, content_type, name_ar, name_en, description, is_active, created_at, updated_at) FROM stdin;
a1b2c3d4-e5f6-7890-abcd-ef1234567890	ARTICLE	سير العمل الافتراضي للمقالات	Default Article Workflow	سير عمل قياسي للمقالات: مسودة → مراجعة → موافقة → نشر	t	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
b2c3d4e5-f6a7-8901-bcde-f12345678901	EVENT	سير العمل الافتراضي للفعاليات	Default Event Workflow	سير عمل قياسي للفعاليات: مسودة → مراجعة → موافقة → نشر	t	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
c3d4e5f6-a7b8-9012-cdef-123456789012	PAGE	سير العمل الافتراضي للصفحات	Default Page Workflow	سير عمل قياسي للصفحات: مسودة → مراجعة → موافقة → نشر	t	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
\.


--
-- TOC entry 5613 (class 2606 OID 68969)
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5360 (class 2606 OID 67926)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5529 (class 2606 OID 68627)
-- Name: board_members board_members_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.board_members
    ADD CONSTRAINT board_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5365 (class 2606 OID 67951)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5367 (class 2606 OID 67953)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 5606 (class 2606 OID 68944)
-- Name: comment_events comment_events_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comment_events
    ADD CONSTRAINT comment_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5519 (class 2606 OID 68583)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 5586 (class 2606 OID 68869)
-- Name: component_templates component_templates_component_type_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.component_templates
    ADD CONSTRAINT component_templates_component_type_key UNIQUE (component_type);


--
-- TOC entry 5588 (class 2606 OID 68867)
-- Name: component_templates component_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.component_templates
    ADD CONSTRAINT component_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5435 (class 2606 OID 68230)
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5375 (class 2606 OID 67984)
-- Name: content_items content_items_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5377 (class 2606 OID 67986)
-- Name: content_items content_items_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_slug_key UNIQUE (slug);


--
-- TOC entry 5639 (class 2606 OID 69092)
-- Name: content_strings content_strings_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_strings
    ADD CONSTRAINT content_strings_pkey PRIMARY KEY (id);


--
-- TOC entry 5641 (class 2606 OID 69094)
-- Name: content_strings content_strings_string_key_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_strings
    ADD CONSTRAINT content_strings_string_key_key UNIQUE (string_key);


--
-- TOC entry 5386 (class 2606 OID 68011)
-- Name: content_tags content_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_tags
    ADD CONSTRAINT content_tags_pkey PRIMARY KEY (content_id, tag_id);


--
-- TOC entry 5390 (class 2606 OID 68032)
-- Name: content_versions content_versions_content_id_version_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_content_id_version_key UNIQUE (content_id, version);


--
-- TOC entry 5392 (class 2606 OID 68030)
-- Name: content_versions content_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 5599 (class 2606 OID 68919)
-- Name: crm_contacts crm_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.crm_contacts
    ADD CONSTRAINT crm_contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 5439 (class 2606 OID 68252)
-- Name: email_accounts email_accounts_email_address_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_email_address_key UNIQUE (email_address);


--
-- TOC entry 5441 (class 2606 OID 68248)
-- Name: email_accounts email_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 5443 (class 2606 OID 68250)
-- Name: email_accounts email_accounts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_user_id_key UNIQUE (user_id);


--
-- TOC entry 5445 (class 2606 OID 68254)
-- Name: email_accounts email_accounts_username_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_username_key UNIQUE (username);


--
-- TOC entry 5494 (class 2606 OID 68461)
-- Name: email_aliases email_aliases_alias_address_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_aliases
    ADD CONSTRAINT email_aliases_alias_address_key UNIQUE (alias_address);


--
-- TOC entry 5496 (class 2606 OID 68459)
-- Name: email_aliases email_aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_aliases
    ADD CONSTRAINT email_aliases_pkey PRIMARY KEY (id);


--
-- TOC entry 5464 (class 2606 OID 68347)
-- Name: email_attachments email_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_attachments
    ADD CONSTRAINT email_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5476 (class 2606 OID 68396)
-- Name: email_contact_group_members email_contact_group_members_group_id_contact_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_group_members
    ADD CONSTRAINT email_contact_group_members_group_id_contact_id_key UNIQUE (group_id, contact_id);


--
-- TOC entry 5478 (class 2606 OID 68394)
-- Name: email_contact_group_members email_contact_group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_group_members
    ADD CONSTRAINT email_contact_group_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5472 (class 2606 OID 68382)
-- Name: email_contact_groups email_contact_groups_owner_id_name_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_groups
    ADD CONSTRAINT email_contact_groups_owner_id_name_key UNIQUE (owner_id, name);


--
-- TOC entry 5474 (class 2606 OID 68380)
-- Name: email_contact_groups email_contact_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_groups
    ADD CONSTRAINT email_contact_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5467 (class 2606 OID 68365)
-- Name: email_contacts email_contacts_owner_id_email_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contacts
    ADD CONSTRAINT email_contacts_owner_id_email_key UNIQUE (owner_id, email);


--
-- TOC entry 5469 (class 2606 OID 68363)
-- Name: email_contacts email_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contacts
    ADD CONSTRAINT email_contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 5488 (class 2606 OID 68441)
-- Name: email_distribution_list_members email_distribution_list_members_list_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_list_members
    ADD CONSTRAINT email_distribution_list_members_list_id_user_id_key UNIQUE (list_id, user_id);


--
-- TOC entry 5490 (class 2606 OID 68439)
-- Name: email_distribution_list_members email_distribution_list_members_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_list_members
    ADD CONSTRAINT email_distribution_list_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5482 (class 2606 OID 68421)
-- Name: email_distribution_lists email_distribution_lists_email_address_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_lists
    ADD CONSTRAINT email_distribution_lists_email_address_key UNIQUE (email_address);


--
-- TOC entry 5484 (class 2606 OID 68419)
-- Name: email_distribution_lists email_distribution_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_lists
    ADD CONSTRAINT email_distribution_lists_pkey PRIMARY KEY (id);


--
-- TOC entry 5447 (class 2606 OID 68275)
-- Name: email_folders email_folders_account_id_name_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_folders
    ADD CONSTRAINT email_folders_account_id_name_key UNIQUE (account_id, name);


--
-- TOC entry 5449 (class 2606 OID 68273)
-- Name: email_folders email_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_folders
    ADD CONSTRAINT email_folders_pkey PRIMARY KEY (id);


--
-- TOC entry 5453 (class 2606 OID 68305)
-- Name: email_messages email_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_messages
    ADD CONSTRAINT email_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5556 (class 2606 OID 68715)
-- Name: email_quota_logs email_quota_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_quota_logs
    ADD CONSTRAINT email_quota_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5460 (class 2606 OID 68330)
-- Name: email_recipients email_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT email_recipients_pkey PRIMARY KEY (id);


--
-- TOC entry 5498 (class 2606 OID 68481)
-- Name: email_rules email_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_rules
    ADD CONSTRAINT email_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 5551 (class 2606 OID 68698)
-- Name: email_scheduled_sends email_scheduled_sends_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_scheduled_sends
    ADD CONSTRAINT email_scheduled_sends_pkey PRIMARY KEY (id);


--
-- TOC entry 5592 (class 2606 OID 68892)
-- Name: event_registrations event_registrations_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- TOC entry 5594 (class 2606 OID 68890)
-- Name: event_registrations event_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5416 (class 2606 OID 68173)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 5418 (class 2606 OID 68175)
-- Name: events events_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_slug_key UNIQUE (slug);


--
-- TOC entry 5330 (class 2606 OID 67799)
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- TOC entry 5615 (class 2606 OID 68990)
-- Name: gallery_albums gallery_albums_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_pkey PRIMARY KEY (id);


--
-- TOC entry 5617 (class 2606 OID 68992)
-- Name: gallery_albums gallery_albums_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_slug_key UNIQUE (slug);


--
-- TOC entry 5635 (class 2606 OID 69059)
-- Name: gallery_analytics_events gallery_analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_analytics_events
    ADD CONSTRAINT gallery_analytics_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5623 (class 2606 OID 69013)
-- Name: gallery_images gallery_images_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5628 (class 2606 OID 69037)
-- Name: gallery_share_links gallery_share_links_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_share_links
    ADD CONSTRAINT gallery_share_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5630 (class 2606 OID 69039)
-- Name: gallery_share_links gallery_share_links_token_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_share_links
    ADD CONSTRAINT gallery_share_links_token_key UNIQUE (token);


--
-- TOC entry 5433 (class 2606 OID 68213)
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- TOC entry 5427 (class 2606 OID 68194)
-- Name: job_vacancies job_vacancies_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.job_vacancies
    ADD CONSTRAINT job_vacancies_pkey PRIMARY KEY (id);


--
-- TOC entry 5429 (class 2606 OID 68196)
-- Name: job_vacancies job_vacancies_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.job_vacancies
    ADD CONSTRAINT job_vacancies_slug_key UNIQUE (slug);


--
-- TOC entry 5401 (class 2606 OID 68080)
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- TOC entry 5396 (class 2606 OID 68060)
-- Name: media_folders media_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_pkey PRIMARY KEY (id);


--
-- TOC entry 5561 (class 2606 OID 68743)
-- Name: media_thumbnails media_thumbnails_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_thumbnails
    ADD CONSTRAINT media_thumbnails_pkey PRIMARY KEY (id);


--
-- TOC entry 5535 (class 2606 OID 68649)
-- Name: member_profiles member_profiles_membership_number_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_membership_number_key UNIQUE (membership_number);


--
-- TOC entry 5537 (class 2606 OID 68645)
-- Name: member_profiles member_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 5539 (class 2606 OID 68647)
-- Name: member_profiles member_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_user_id_key UNIQUE (user_id);


--
-- TOC entry 5517 (class 2606 OID 68557)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5512 (class 2606 OID 68545)
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- TOC entry 5525 (class 2606 OID 68615)
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- TOC entry 5527 (class 2606 OID 68613)
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- TOC entry 5412 (class 2606 OID 68155)
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- TOC entry 5414 (class 2606 OID 68157)
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- TOC entry 5410 (class 2606 OID 68130)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5510 (class 2606 OID 68529)
-- Name: page_sections page_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5505 (class 2606 OID 68501)
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- TOC entry 5507 (class 2606 OID 68503)
-- Name: pages pages_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_slug_key UNIQUE (slug);


--
-- TOC entry 5337 (class 2606 OID 67862)
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- TOC entry 5339 (class 2606 OID 67860)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5356 (class 2606 OID 67910)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5358 (class 2606 OID 67912)
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- TOC entry 5343 (class 2606 OID 67868)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- TOC entry 5333 (class 2606 OID 67851)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 5335 (class 2606 OID 67849)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5666 (class 2606 OID 69156)
-- Name: sensor_readings sensor_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.sensor_readings
    ADD CONSTRAINT sensor_readings_pkey PRIMARY KEY (id);


--
-- TOC entry 5661 (class 2606 OID 69145)
-- Name: sensors sensors_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.sensors
    ADD CONSTRAINT sensors_pkey PRIMARY KEY (id);


--
-- TOC entry 5542 (class 2606 OID 68667)
-- Name: seo_metadata seo_metadata_entity_type_entity_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.seo_metadata
    ADD CONSTRAINT seo_metadata_entity_type_entity_id_key UNIQUE (entity_type, entity_id);


--
-- TOC entry 5544 (class 2606 OID 68665)
-- Name: seo_metadata seo_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.seo_metadata
    ADD CONSTRAINT seo_metadata_pkey PRIMARY KEY (id);


--
-- TOC entry 5649 (class 2606 OID 69111)
-- Name: site_sections site_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.site_sections
    ADD CONSTRAINT site_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5651 (class 2606 OID 69113)
-- Name: site_sections site_sections_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.site_sections
    ADD CONSTRAINT site_sections_slug_key UNIQUE (slug);


--
-- TOC entry 5547 (class 2606 OID 68683)
-- Name: system_config system_config_config_key_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_config_key_key UNIQUE (config_key);


--
-- TOC entry 5549 (class 2606 OID 68681)
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- TOC entry 5371 (class 2606 OID 67965)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 5373 (class 2606 OID 67967)
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- TOC entry 5654 (class 2606 OID 69130)
-- Name: theme_settings theme_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.theme_settings
    ADD CONSTRAINT theme_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5656 (class 2606 OID 69132)
-- Name: theme_settings theme_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.theme_settings
    ADD CONSTRAINT theme_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 5348 (class 2606 OID 67895)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5350 (class 2606 OID 67891)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5352 (class 2606 OID 67893)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5584 (class 2606 OID 68822)
-- Name: workflow_actions workflow_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_pkey PRIMARY KEY (id);


--
-- TOC entry 5406 (class 2606 OID 68102)
-- Name: workflow_logs workflow_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_logs
    ADD CONSTRAINT workflow_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5568 (class 2606 OID 68775)
-- Name: workflow_states workflow_states_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_states
    ADD CONSTRAINT workflow_states_pkey PRIMARY KEY (id);


--
-- TOC entry 5570 (class 2606 OID 68777)
-- Name: workflow_states workflow_states_workflow_id_name_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_states
    ADD CONSTRAINT workflow_states_workflow_id_name_key UNIQUE (workflow_id, name);


--
-- TOC entry 5575 (class 2606 OID 68795)
-- Name: workflow_transitions workflow_transitions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_pkey PRIMARY KEY (id);


--
-- TOC entry 5577 (class 2606 OID 68797)
-- Name: workflow_transitions workflow_transitions_workflow_id_from_state_id_to_state_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_workflow_id_from_state_id_to_state_id_key UNIQUE (workflow_id, from_state_id, to_state_id);


--
-- TOC entry 5563 (class 2606 OID 68762)
-- Name: workflows workflows_content_type_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_content_type_key UNIQUE (content_type);


--
-- TOC entry 5565 (class 2606 OID 68760)
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- TOC entry 5331 (class 1259 OID 67800)
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- TOC entry 5361 (class 1259 OID 67937)
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- TOC entry 5362 (class 1259 OID 67936)
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- TOC entry 5363 (class 1259 OID 67935)
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- TOC entry 5530 (class 1259 OID 68729)
-- Name: idx_board_members_is_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_board_members_is_active ON public.board_members USING btree (is_active);


--
-- TOC entry 5531 (class 1259 OID 69178)
-- Name: idx_board_members_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_board_members_user_id ON public.board_members USING btree (user_id);


--
-- TOC entry 5368 (class 1259 OID 68051)
-- Name: idx_categories_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);


--
-- TOC entry 5607 (class 1259 OID 69199)
-- Name: idx_comment_events_comment_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comment_events_comment_id ON public.comment_events USING btree (comment_id);


--
-- TOC entry 5608 (class 1259 OID 68956)
-- Name: idx_comment_events_created_at; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comment_events_created_at ON public.comment_events USING btree (created_at);


--
-- TOC entry 5609 (class 1259 OID 69200)
-- Name: idx_comment_events_initiated_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comment_events_initiated_by ON public.comment_events USING btree (initiated_by);


--
-- TOC entry 5610 (class 1259 OID 68955)
-- Name: idx_comment_events_processed; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comment_events_processed ON public.comment_events USING btree (is_processed);


--
-- TOC entry 5611 (class 1259 OID 68957)
-- Name: idx_comment_events_recipients; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comment_events_recipients ON public.comment_events USING gin (recipients);


--
-- TOC entry 5520 (class 1259 OID 69177)
-- Name: idx_comments_approved_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comments_approved_by ON public.comments USING btree (approved_by);


--
-- TOC entry 5521 (class 1259 OID 69176)
-- Name: idx_comments_author_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comments_author_id ON public.comments USING btree (author_id);


--
-- TOC entry 5522 (class 1259 OID 68726)
-- Name: idx_comments_content_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comments_content_id ON public.comments USING btree (content_id);


--
-- TOC entry 5523 (class 1259 OID 68727)
-- Name: idx_comments_parent_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comments_parent_id ON public.comments USING btree (parent_id);


--
-- TOC entry 5589 (class 1259 OID 68870)
-- Name: idx_component_templates_category; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_component_templates_category ON public.component_templates USING btree (category);


--
-- TOC entry 5590 (class 1259 OID 68871)
-- Name: idx_component_templates_system; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_component_templates_system ON public.component_templates USING btree (is_system);


--
-- TOC entry 5436 (class 1259 OID 68231)
-- Name: idx_contact_submissions_read; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_contact_submissions_read ON public.contact_submissions USING btree (is_read);


--
-- TOC entry 5437 (class 1259 OID 69183)
-- Name: idx_contact_submissions_read_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_contact_submissions_read_by ON public.contact_submissions USING btree (read_by);


--
-- TOC entry 5378 (class 1259 OID 68046)
-- Name: idx_content_author; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_author ON public.content_items USING btree (author_id);


--
-- TOC entry 5379 (class 1259 OID 68047)
-- Name: idx_content_category; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_category ON public.content_items USING btree (category_id);


--
-- TOC entry 5380 (class 1259 OID 68049)
-- Name: idx_content_fts; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_fts ON public.content_items USING gin (to_tsvector('simple'::regconfig, (((((COALESCE(title_ar, ''::character varying))::text || ' '::text) || (COALESCE(title_en, ''::character varying))::text) || ' '::text) || COALESCE(excerpt, ''::text))));


--
-- TOC entry 5381 (class 1259 OID 68048)
-- Name: idx_content_published; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_published ON public.content_items USING btree (published_at);


--
-- TOC entry 5382 (class 1259 OID 68043)
-- Name: idx_content_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_slug ON public.content_items USING btree (slug);


--
-- TOC entry 5383 (class 1259 OID 68044)
-- Name: idx_content_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_status ON public.content_items USING btree (status);


--
-- TOC entry 5642 (class 1259 OID 69095)
-- Name: idx_content_strings_group; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_strings_group ON public.content_strings USING btree (string_group);


--
-- TOC entry 5643 (class 1259 OID 69096)
-- Name: idx_content_strings_key; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_strings_key ON public.content_strings USING btree (string_key);


--
-- TOC entry 5387 (class 1259 OID 69167)
-- Name: idx_content_tags_content_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_tags_content_id ON public.content_tags USING btree (content_id);


--
-- TOC entry 5388 (class 1259 OID 69168)
-- Name: idx_content_tags_tag_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_tags_tag_id ON public.content_tags USING btree (tag_id);


--
-- TOC entry 5384 (class 1259 OID 68045)
-- Name: idx_content_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_type ON public.content_items USING btree (content_type);


--
-- TOC entry 5393 (class 1259 OID 69169)
-- Name: idx_content_versions_changed_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_versions_changed_by ON public.content_versions USING btree (changed_by);


--
-- TOC entry 5394 (class 1259 OID 68050)
-- Name: idx_content_versions_content; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_versions_content ON public.content_versions USING btree (content_id);


--
-- TOC entry 5600 (class 1259 OID 68932)
-- Name: idx_crm_contacts_contact_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_crm_contacts_contact_type ON public.crm_contacts USING btree (contact_type);


--
-- TOC entry 5601 (class 1259 OID 69198)
-- Name: idx_crm_contacts_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_crm_contacts_created_by ON public.crm_contacts USING btree (created_by);


--
-- TOC entry 5602 (class 1259 OID 68930)
-- Name: idx_crm_contacts_email; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_crm_contacts_email ON public.crm_contacts USING btree (email);


--
-- TOC entry 5603 (class 1259 OID 68933)
-- Name: idx_crm_contacts_is_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_crm_contacts_is_active ON public.crm_contacts USING btree (is_active);


--
-- TOC entry 5604 (class 1259 OID 68931)
-- Name: idx_crm_contacts_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_crm_contacts_user_id ON public.crm_contacts USING btree (user_id);


--
-- TOC entry 5465 (class 1259 OID 68353)
-- Name: idx_email_attachments_message; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_attachments_message ON public.email_attachments USING btree (message_id);


--
-- TOC entry 5479 (class 1259 OID 69202)
-- Name: idx_email_contact_group_members_contact_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_contact_group_members_contact_id ON public.email_contact_group_members USING btree (contact_id);


--
-- TOC entry 5480 (class 1259 OID 69201)
-- Name: idx_email_contact_group_members_group_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_contact_group_members_group_id ON public.email_contact_group_members USING btree (group_id);


--
-- TOC entry 5470 (class 1259 OID 68371)
-- Name: idx_email_contacts_owner; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_contacts_owner ON public.email_contacts USING btree (owner_id);


--
-- TOC entry 5491 (class 1259 OID 69205)
-- Name: idx_email_distribution_list_members_list_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_distribution_list_members_list_id ON public.email_distribution_list_members USING btree (list_id);


--
-- TOC entry 5492 (class 1259 OID 69206)
-- Name: idx_email_distribution_list_members_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_distribution_list_members_user_id ON public.email_distribution_list_members USING btree (user_id);


--
-- TOC entry 5485 (class 1259 OID 69204)
-- Name: idx_email_distribution_lists_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_distribution_lists_created_by ON public.email_distribution_lists USING btree (created_by);


--
-- TOC entry 5486 (class 1259 OID 69203)
-- Name: idx_email_distribution_lists_moderator_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_distribution_lists_moderator_id ON public.email_distribution_lists USING btree (moderator_id);


--
-- TOC entry 5450 (class 1259 OID 69172)
-- Name: idx_email_folders_account_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_folders_account_id ON public.email_folders USING btree (account_id);


--
-- TOC entry 5451 (class 1259 OID 69173)
-- Name: idx_email_folders_parent_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_folders_parent_id ON public.email_folders USING btree (parent_id);


--
-- TOC entry 5454 (class 1259 OID 68316)
-- Name: idx_email_messages_account_folder; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_messages_account_folder ON public.email_messages USING btree (account_id, folder_id);


--
-- TOC entry 5455 (class 1259 OID 68319)
-- Name: idx_email_messages_drafts; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_messages_drafts ON public.email_messages USING btree (account_id) WHERE (is_draft = true);


--
-- TOC entry 5456 (class 1259 OID 68320)
-- Name: idx_email_messages_fts; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_messages_fts ON public.email_messages USING gin (to_tsvector('english'::regconfig, (((COALESCE(subject, ''::character varying))::text || ' '::text) || COALESCE(body_text, ''::text))));


--
-- TOC entry 5457 (class 1259 OID 68317)
-- Name: idx_email_messages_thread; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_messages_thread ON public.email_messages USING btree (thread_id);


--
-- TOC entry 5458 (class 1259 OID 68318)
-- Name: idx_email_messages_unread; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_messages_unread ON public.email_messages USING btree (account_id, folder_id) WHERE (is_read = false);


--
-- TOC entry 5557 (class 1259 OID 68733)
-- Name: idx_email_quota_logs_account_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_quota_logs_account_id ON public.email_quota_logs USING btree (account_id);


--
-- TOC entry 5558 (class 1259 OID 69186)
-- Name: idx_email_quota_logs_message_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_quota_logs_message_id ON public.email_quota_logs USING btree (message_id);


--
-- TOC entry 5461 (class 1259 OID 68337)
-- Name: idx_email_recipients_address; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_recipients_address ON public.email_recipients USING btree (address);


--
-- TOC entry 5462 (class 1259 OID 68336)
-- Name: idx_email_recipients_message; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_recipients_message ON public.email_recipients USING btree (message_id);


--
-- TOC entry 5499 (class 1259 OID 68487)
-- Name: idx_email_rules_account; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_rules_account ON public.email_rules USING btree (account_id);


--
-- TOC entry 5552 (class 1259 OID 69185)
-- Name: idx_email_scheduled_sends_account_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_scheduled_sends_account_id ON public.email_scheduled_sends USING btree (account_id);


--
-- TOC entry 5553 (class 1259 OID 69184)
-- Name: idx_email_scheduled_sends_message_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_scheduled_sends_message_id ON public.email_scheduled_sends USING btree (message_id);


--
-- TOC entry 5554 (class 1259 OID 68732)
-- Name: idx_email_scheduled_sends_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_scheduled_sends_status ON public.email_scheduled_sends USING btree (status, scheduled_at);


--
-- TOC entry 5595 (class 1259 OID 68903)
-- Name: idx_event_registrations_event_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_event_registrations_event_id ON public.event_registrations USING btree (event_id);


--
-- TOC entry 5596 (class 1259 OID 68905)
-- Name: idx_event_registrations_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_event_registrations_status ON public.event_registrations USING btree (status);


--
-- TOC entry 5597 (class 1259 OID 68904)
-- Name: idx_event_registrations_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_event_registrations_user_id ON public.event_registrations USING btree (user_id);


--
-- TOC entry 5419 (class 1259 OID 69181)
-- Name: idx_events_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_events_created_by ON public.events USING btree (created_by);


--
-- TOC entry 5420 (class 1259 OID 68181)
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_events_date ON public.events USING btree (event_date);


--
-- TOC entry 5421 (class 1259 OID 68182)
-- Name: idx_events_published; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_events_published ON public.events USING btree (is_published);


--
-- TOC entry 5422 (class 1259 OID 68183)
-- Name: idx_events_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_events_type ON public.events USING btree (event_type);


--
-- TOC entry 5618 (class 1259 OID 69192)
-- Name: idx_gallery_albums_cover_image_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_albums_cover_image_id ON public.gallery_albums USING btree (cover_image_id);


--
-- TOC entry 5619 (class 1259 OID 69193)
-- Name: idx_gallery_albums_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_albums_created_by ON public.gallery_albums USING btree (created_by);


--
-- TOC entry 5620 (class 1259 OID 69076)
-- Name: idx_gallery_albums_published; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_albums_published ON public.gallery_albums USING btree (is_published, sort_order);


--
-- TOC entry 5621 (class 1259 OID 69075)
-- Name: idx_gallery_albums_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_albums_slug ON public.gallery_albums USING btree (slug);


--
-- TOC entry 5636 (class 1259 OID 69079)
-- Name: idx_gallery_analytics_album; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_analytics_album ON public.gallery_analytics_events USING btree (album_id, event_type);


--
-- TOC entry 5637 (class 1259 OID 69080)
-- Name: idx_gallery_analytics_created; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_analytics_created ON public.gallery_analytics_events USING btree (created_at);


--
-- TOC entry 5624 (class 1259 OID 69077)
-- Name: idx_gallery_images_album; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_images_album ON public.gallery_images USING btree (album_id, sort_order);


--
-- TOC entry 5625 (class 1259 OID 69195)
-- Name: idx_gallery_images_before_media_file_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_images_before_media_file_id ON public.gallery_images USING btree (before_media_file_id);


--
-- TOC entry 5626 (class 1259 OID 69194)
-- Name: idx_gallery_images_media_file_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_images_media_file_id ON public.gallery_images USING btree (media_file_id);


--
-- TOC entry 5631 (class 1259 OID 69196)
-- Name: idx_gallery_share_links_album_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_share_links_album_id ON public.gallery_share_links USING btree (album_id);


--
-- TOC entry 5632 (class 1259 OID 69197)
-- Name: idx_gallery_share_links_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_share_links_created_by ON public.gallery_share_links USING btree (created_by);


--
-- TOC entry 5633 (class 1259 OID 69078)
-- Name: idx_gallery_share_links_token; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_share_links_token ON public.gallery_share_links USING btree (token);


--
-- TOC entry 5430 (class 1259 OID 68220)
-- Name: idx_job_applications_email; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_job_applications_email ON public.job_applications USING btree (email);


--
-- TOC entry 5431 (class 1259 OID 68219)
-- Name: idx_job_applications_vacancy; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_job_applications_vacancy ON public.job_applications USING btree (job_vacancy_id);


--
-- TOC entry 5423 (class 1259 OID 69182)
-- Name: idx_job_vacancies_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_job_vacancies_created_by ON public.job_vacancies USING btree (created_by);


--
-- TOC entry 5424 (class 1259 OID 68203)
-- Name: idx_job_vacancies_deadline; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_job_vacancies_deadline ON public.job_vacancies USING btree (deadline);


--
-- TOC entry 5425 (class 1259 OID 68202)
-- Name: idx_job_vacancies_published; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_job_vacancies_published ON public.job_vacancies USING btree (is_published);


--
-- TOC entry 5397 (class 1259 OID 68091)
-- Name: idx_media_files_folder; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_media_files_folder ON public.media_files USING btree (folder_id);


--
-- TOC entry 5398 (class 1259 OID 68093)
-- Name: idx_media_files_mime; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_media_files_mime ON public.media_files USING btree (mime_type);


--
-- TOC entry 5399 (class 1259 OID 68092)
-- Name: idx_media_files_user; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_media_files_user ON public.media_files USING btree (user_id);


--
-- TOC entry 5559 (class 1259 OID 68749)
-- Name: idx_media_thumbnails_file; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_media_thumbnails_file ON public.media_thumbnails USING btree (media_file_id);


--
-- TOC entry 5532 (class 1259 OID 68730)
-- Name: idx_member_profiles_is_public; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_member_profiles_is_public ON public.member_profiles USING btree (is_public);


--
-- TOC entry 5533 (class 1259 OID 69179)
-- Name: idx_member_profiles_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_member_profiles_user_id ON public.member_profiles USING btree (user_id);


--
-- TOC entry 5513 (class 1259 OID 68728)
-- Name: idx_menu_items_menu_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_menu_items_menu_id ON public.menu_items USING btree (menu_id);


--
-- TOC entry 5514 (class 1259 OID 69175)
-- Name: idx_menu_items_page_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_menu_items_page_id ON public.menu_items USING btree (page_id);


--
-- TOC entry 5515 (class 1259 OID 69174)
-- Name: idx_menu_items_parent_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_menu_items_parent_id ON public.menu_items USING btree (parent_id);


--
-- TOC entry 5407 (class 1259 OID 68137)
-- Name: idx_notifications_created; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_notifications_created ON public.notifications USING btree (created_at);


--
-- TOC entry 5408 (class 1259 OID 68136)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id, is_read);


--
-- TOC entry 5508 (class 1259 OID 68535)
-- Name: idx_page_sections_page_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_page_sections_page_id ON public.page_sections USING btree (page_id);


--
-- TOC entry 5500 (class 1259 OID 69171)
-- Name: idx_pages_author_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_pages_author_id ON public.pages USING btree (author_id);


--
-- TOC entry 5501 (class 1259 OID 69170)
-- Name: idx_pages_parent_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_pages_parent_id ON public.pages USING btree (parent_id);


--
-- TOC entry 5502 (class 1259 OID 68537)
-- Name: idx_pages_published_homepage; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_pages_published_homepage ON public.pages USING btree (is_published, is_homepage);


--
-- TOC entry 5503 (class 1259 OID 68536)
-- Name: idx_pages_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_pages_slug ON public.pages USING btree (slug);


--
-- TOC entry 5662 (class 1259 OID 69163)
-- Name: idx_readings_recorded_at; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_readings_recorded_at ON public.sensor_readings USING btree (recorded_at);


--
-- TOC entry 5663 (class 1259 OID 69162)
-- Name: idx_readings_sensor_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_readings_sensor_id ON public.sensor_readings USING btree (sensor_id);


--
-- TOC entry 5664 (class 1259 OID 69164)
-- Name: idx_readings_sensor_time; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_readings_sensor_time ON public.sensor_readings USING btree (sensor_id, recorded_at);


--
-- TOC entry 5353 (class 1259 OID 67938)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 5354 (class 1259 OID 67939)
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 5340 (class 1259 OID 69166)
-- Name: idx_role_permissions_permission_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);


--
-- TOC entry 5341 (class 1259 OID 69165)
-- Name: idx_role_permissions_role_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);


--
-- TOC entry 5657 (class 1259 OID 69147)
-- Name: idx_sensors_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_sensors_active ON public.sensors USING btree (is_active);


--
-- TOC entry 5658 (class 1259 OID 69148)
-- Name: idx_sensors_alert; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_sensors_alert ON public.sensors USING btree (alert_enabled) WHERE (alert_enabled = true);


--
-- TOC entry 5659 (class 1259 OID 69146)
-- Name: idx_sensors_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_sensors_type ON public.sensors USING btree (sensor_type);


--
-- TOC entry 5540 (class 1259 OID 68731)
-- Name: idx_seo_metadata_entity; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_seo_metadata_entity ON public.seo_metadata USING btree (entity_type, entity_id);


--
-- TOC entry 5644 (class 1259 OID 69114)
-- Name: idx_site_sections_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_site_sections_active ON public.site_sections USING btree (is_active);


--
-- TOC entry 5645 (class 1259 OID 69115)
-- Name: idx_site_sections_component_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_site_sections_component_type ON public.site_sections USING btree (component_type);


--
-- TOC entry 5646 (class 1259 OID 69118)
-- Name: idx_site_sections_location; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_site_sections_location ON public.site_sections USING btree (location);


--
-- TOC entry 5647 (class 1259 OID 69116)
-- Name: idx_site_sections_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_site_sections_slug ON public.site_sections USING btree (slug);


--
-- TOC entry 5545 (class 1259 OID 69180)
-- Name: idx_system_config_updated_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_system_config_updated_by ON public.system_config USING btree (updated_by);


--
-- TOC entry 5369 (class 1259 OID 68052)
-- Name: idx_tags_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_tags_slug ON public.tags USING btree (slug);


--
-- TOC entry 5652 (class 1259 OID 69133)
-- Name: idx_theme_settings_group; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_theme_settings_group ON public.theme_settings USING btree (group_name);


--
-- TOC entry 5344 (class 1259 OID 67932)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5345 (class 1259 OID 67934)
-- Name: idx_users_role_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_users_role_id ON public.users USING btree (role_id);


--
-- TOC entry 5346 (class 1259 OID 67933)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 5578 (class 1259 OID 69190)
-- Name: idx_workflow_actions_actor_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_actions_actor_id ON public.workflow_actions USING btree (actor_id);


--
-- TOC entry 5579 (class 1259 OID 68851)
-- Name: idx_workflow_actions_content; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_actions_content ON public.workflow_actions USING btree (content_id);


--
-- TOC entry 5580 (class 1259 OID 69188)
-- Name: idx_workflow_actions_from_state_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_actions_from_state_id ON public.workflow_actions USING btree (from_state_id);


--
-- TOC entry 5581 (class 1259 OID 69189)
-- Name: idx_workflow_actions_to_state_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_actions_to_state_id ON public.workflow_actions USING btree (to_state_id);


--
-- TOC entry 5582 (class 1259 OID 68852)
-- Name: idx_workflow_actions_workflow; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_actions_workflow ON public.workflow_actions USING btree (workflow_id);


--
-- TOC entry 5402 (class 1259 OID 68119)
-- Name: idx_workflow_logs_actor; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_logs_actor ON public.workflow_logs USING btree (actor_id);


--
-- TOC entry 5403 (class 1259 OID 69187)
-- Name: idx_workflow_logs_assignee_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_logs_assignee_id ON public.workflow_logs USING btree (assignee_id);


--
-- TOC entry 5404 (class 1259 OID 68118)
-- Name: idx_workflow_logs_content; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_logs_content ON public.workflow_logs USING btree (content_id);


--
-- TOC entry 5566 (class 1259 OID 68848)
-- Name: idx_workflow_states_workflow; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_states_workflow ON public.workflow_states USING btree (workflow_id);


--
-- TOC entry 5571 (class 1259 OID 68850)
-- Name: idx_workflow_transitions_from_state; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_transitions_from_state ON public.workflow_transitions USING btree (from_state_id);


--
-- TOC entry 5572 (class 1259 OID 69191)
-- Name: idx_workflow_transitions_to_state_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_transitions_to_state_id ON public.workflow_transitions USING btree (to_state_id);


--
-- TOC entry 5573 (class 1259 OID 68849)
-- Name: idx_workflow_transitions_workflow; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_transitions_workflow ON public.workflow_transitions USING btree (workflow_id);


--
-- TOC entry 5744 (class 2606 OID 68970)
-- Name: admin_notifications admin_notifications_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5671 (class 2606 OID 67927)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5721 (class 2606 OID 68628)
-- Name: board_members board_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.board_members
    ADD CONSTRAINT board_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5672 (class 2606 OID 67954)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 5742 (class 2606 OID 68945)
-- Name: comment_events comment_events_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comment_events
    ADD CONSTRAINT comment_events_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- TOC entry 5743 (class 2606 OID 68950)
-- Name: comment_events comment_events_initiated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comment_events
    ADD CONSTRAINT comment_events_initiated_by_fkey FOREIGN KEY (initiated_by) REFERENCES public.users(id);


--
-- TOC entry 5717 (class 2606 OID 68599)
-- Name: comments comments_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- TOC entry 5718 (class 2606 OID 68594)
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- TOC entry 5719 (class 2606 OID 68584)
-- Name: comments comments_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- TOC entry 5720 (class 2606 OID 68589)
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- TOC entry 5693 (class 2606 OID 68874)
-- Name: contact_submissions contact_submissions_read_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_read_by_fkey FOREIGN KEY (read_by) REFERENCES public.users(id);


--
-- TOC entry 5673 (class 2606 OID 67987)
-- Name: content_items content_items_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- TOC entry 5674 (class 2606 OID 68002)
-- Name: content_items content_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 5675 (class 2606 OID 67997)
-- Name: content_items content_items_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.users(id);


--
-- TOC entry 5676 (class 2606 OID 67992)
-- Name: content_items content_items_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- TOC entry 5677 (class 2606 OID 68012)
-- Name: content_tags content_tags_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_tags
    ADD CONSTRAINT content_tags_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- TOC entry 5678 (class 2606 OID 68017)
-- Name: content_tags content_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_tags
    ADD CONSTRAINT content_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- TOC entry 5679 (class 2606 OID 68038)
-- Name: content_versions content_versions_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- TOC entry 5680 (class 2606 OID 68033)
-- Name: content_versions content_versions_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- TOC entry 5740 (class 2606 OID 68925)
-- Name: crm_contacts crm_contacts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.crm_contacts
    ADD CONSTRAINT crm_contacts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5741 (class 2606 OID 68920)
-- Name: crm_contacts crm_contacts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.crm_contacts
    ADD CONSTRAINT crm_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5694 (class 2606 OID 68255)
-- Name: email_accounts email_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5709 (class 2606 OID 68462)
-- Name: email_aliases email_aliases_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_aliases
    ADD CONSTRAINT email_aliases_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5700 (class 2606 OID 68348)
-- Name: email_attachments email_attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_attachments
    ADD CONSTRAINT email_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.email_messages(id) ON DELETE CASCADE;


--
-- TOC entry 5703 (class 2606 OID 68402)
-- Name: email_contact_group_members email_contact_group_members_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_group_members
    ADD CONSTRAINT email_contact_group_members_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.email_contacts(id) ON DELETE CASCADE;


--
-- TOC entry 5704 (class 2606 OID 68397)
-- Name: email_contact_group_members email_contact_group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_group_members
    ADD CONSTRAINT email_contact_group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.email_contact_groups(id) ON DELETE CASCADE;


--
-- TOC entry 5702 (class 2606 OID 68383)
-- Name: email_contact_groups email_contact_groups_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_groups
    ADD CONSTRAINT email_contact_groups_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5701 (class 2606 OID 68366)
-- Name: email_contacts email_contacts_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contacts
    ADD CONSTRAINT email_contacts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5707 (class 2606 OID 68442)
-- Name: email_distribution_list_members email_distribution_list_members_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_list_members
    ADD CONSTRAINT email_distribution_list_members_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.email_distribution_lists(id) ON DELETE CASCADE;


--
-- TOC entry 5708 (class 2606 OID 68447)
-- Name: email_distribution_list_members email_distribution_list_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_list_members
    ADD CONSTRAINT email_distribution_list_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5705 (class 2606 OID 68427)
-- Name: email_distribution_lists email_distribution_lists_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_lists
    ADD CONSTRAINT email_distribution_lists_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5706 (class 2606 OID 68422)
-- Name: email_distribution_lists email_distribution_lists_moderator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_lists
    ADD CONSTRAINT email_distribution_lists_moderator_id_fkey FOREIGN KEY (moderator_id) REFERENCES public.users(id);


--
-- TOC entry 5695 (class 2606 OID 68276)
-- Name: email_folders email_folders_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_folders
    ADD CONSTRAINT email_folders_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5696 (class 2606 OID 68281)
-- Name: email_folders email_folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_folders
    ADD CONSTRAINT email_folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.email_folders(id) ON DELETE CASCADE;


--
-- TOC entry 5697 (class 2606 OID 68306)
-- Name: email_messages email_messages_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_messages
    ADD CONSTRAINT email_messages_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5698 (class 2606 OID 68311)
-- Name: email_messages email_messages_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_messages
    ADD CONSTRAINT email_messages_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.email_folders(id);


--
-- TOC entry 5726 (class 2606 OID 68716)
-- Name: email_quota_logs email_quota_logs_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_quota_logs
    ADD CONSTRAINT email_quota_logs_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5727 (class 2606 OID 68721)
-- Name: email_quota_logs email_quota_logs_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_quota_logs
    ADD CONSTRAINT email_quota_logs_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.email_messages(id);


--
-- TOC entry 5699 (class 2606 OID 68331)
-- Name: email_recipients email_recipients_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT email_recipients_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.email_messages(id) ON DELETE CASCADE;


--
-- TOC entry 5710 (class 2606 OID 68482)
-- Name: email_rules email_rules_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_rules
    ADD CONSTRAINT email_rules_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5724 (class 2606 OID 68704)
-- Name: email_scheduled_sends email_scheduled_sends_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_scheduled_sends
    ADD CONSTRAINT email_scheduled_sends_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5725 (class 2606 OID 68699)
-- Name: email_scheduled_sends email_scheduled_sends_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_scheduled_sends
    ADD CONSTRAINT email_scheduled_sends_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.email_messages(id) ON DELETE CASCADE;


--
-- TOC entry 5738 (class 2606 OID 68893)
-- Name: event_registrations event_registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 5739 (class 2606 OID 68898)
-- Name: event_registrations event_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5690 (class 2606 OID 68176)
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5745 (class 2606 OID 68993)
-- Name: gallery_albums gallery_albums_cover_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_cover_image_id_fkey FOREIGN KEY (cover_image_id) REFERENCES public.media_files(id) ON DELETE SET NULL;


--
-- TOC entry 5746 (class 2606 OID 68998)
-- Name: gallery_albums gallery_albums_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5752 (class 2606 OID 69060)
-- Name: gallery_analytics_events gallery_analytics_events_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_analytics_events
    ADD CONSTRAINT gallery_analytics_events_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.gallery_albums(id) ON DELETE CASCADE;


--
-- TOC entry 5753 (class 2606 OID 69065)
-- Name: gallery_analytics_events gallery_analytics_events_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_analytics_events
    ADD CONSTRAINT gallery_analytics_events_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.gallery_images(id) ON DELETE SET NULL;


--
-- TOC entry 5754 (class 2606 OID 69070)
-- Name: gallery_analytics_events gallery_analytics_events_share_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_analytics_events
    ADD CONSTRAINT gallery_analytics_events_share_link_id_fkey FOREIGN KEY (share_link_id) REFERENCES public.gallery_share_links(id) ON DELETE SET NULL;


--
-- TOC entry 5747 (class 2606 OID 69014)
-- Name: gallery_images gallery_images_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.gallery_albums(id) ON DELETE CASCADE;


--
-- TOC entry 5748 (class 2606 OID 69024)
-- Name: gallery_images gallery_images_before_media_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_before_media_file_id_fkey FOREIGN KEY (before_media_file_id) REFERENCES public.media_files(id) ON DELETE SET NULL;


--
-- TOC entry 5749 (class 2606 OID 69019)
-- Name: gallery_images gallery_images_media_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_media_file_id_fkey FOREIGN KEY (media_file_id) REFERENCES public.media_files(id) ON DELETE CASCADE;


--
-- TOC entry 5750 (class 2606 OID 69040)
-- Name: gallery_share_links gallery_share_links_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_share_links
    ADD CONSTRAINT gallery_share_links_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.gallery_albums(id) ON DELETE CASCADE;


--
-- TOC entry 5751 (class 2606 OID 69045)
-- Name: gallery_share_links gallery_share_links_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_share_links
    ADD CONSTRAINT gallery_share_links_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5692 (class 2606 OID 68214)
-- Name: job_applications job_applications_job_vacancy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_vacancy_id_fkey FOREIGN KEY (job_vacancy_id) REFERENCES public.job_vacancies(id) ON DELETE CASCADE;


--
-- TOC entry 5691 (class 2606 OID 68197)
-- Name: job_vacancies job_vacancies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.job_vacancies
    ADD CONSTRAINT job_vacancies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5683 (class 2606 OID 68081)
-- Name: media_files media_files_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.media_folders(id) ON DELETE SET NULL;


--
-- TOC entry 5684 (class 2606 OID 68086)
-- Name: media_files media_files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5681 (class 2606 OID 68061)
-- Name: media_folders media_folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.media_folders(id) ON DELETE SET NULL;


--
-- TOC entry 5682 (class 2606 OID 68066)
-- Name: media_folders media_folders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5728 (class 2606 OID 68744)
-- Name: media_thumbnails media_thumbnails_media_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_thumbnails
    ADD CONSTRAINT media_thumbnails_media_file_id_fkey FOREIGN KEY (media_file_id) REFERENCES public.media_files(id) ON DELETE CASCADE;


--
-- TOC entry 5722 (class 2606 OID 68650)
-- Name: member_profiles member_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5714 (class 2606 OID 68558)
-- Name: menu_items menu_items_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- TOC entry 5715 (class 2606 OID 68568)
-- Name: menu_items menu_items_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE SET NULL;


--
-- TOC entry 5716 (class 2606 OID 68563)
-- Name: menu_items menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- TOC entry 5689 (class 2606 OID 68158)
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5688 (class 2606 OID 68131)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5713 (class 2606 OID 68530)
-- Name: page_sections page_sections_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- TOC entry 5711 (class 2606 OID 68509)
-- Name: pages pages_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- TOC entry 5712 (class 2606 OID 68504)
-- Name: pages pages_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.pages(id) ON DELETE SET NULL;


--
-- TOC entry 5670 (class 2606 OID 67913)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5667 (class 2606 OID 67874)
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- TOC entry 5668 (class 2606 OID 67869)
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 5755 (class 2606 OID 69157)
-- Name: sensor_readings sensor_readings_sensor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.sensor_readings
    ADD CONSTRAINT sensor_readings_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES public.sensors(id) ON DELETE CASCADE;


--
-- TOC entry 5723 (class 2606 OID 68684)
-- Name: system_config system_config_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5669 (class 2606 OID 67896)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 5733 (class 2606 OID 68843)
-- Name: workflow_actions workflow_actions_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- TOC entry 5734 (class 2606 OID 68823)
-- Name: workflow_actions workflow_actions_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- TOC entry 5735 (class 2606 OID 68833)
-- Name: workflow_actions workflow_actions_from_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_from_state_id_fkey FOREIGN KEY (from_state_id) REFERENCES public.workflow_states(id);


--
-- TOC entry 5736 (class 2606 OID 68838)
-- Name: workflow_actions workflow_actions_to_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_to_state_id_fkey FOREIGN KEY (to_state_id) REFERENCES public.workflow_states(id);


--
-- TOC entry 5737 (class 2606 OID 68828)
-- Name: workflow_actions workflow_actions_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- TOC entry 5685 (class 2606 OID 68108)
-- Name: workflow_logs workflow_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_logs
    ADD CONSTRAINT workflow_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- TOC entry 5686 (class 2606 OID 68113)
-- Name: workflow_logs workflow_logs_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_logs
    ADD CONSTRAINT workflow_logs_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- TOC entry 5687 (class 2606 OID 68103)
-- Name: workflow_logs workflow_logs_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_logs
    ADD CONSTRAINT workflow_logs_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- TOC entry 5729 (class 2606 OID 68778)
-- Name: workflow_states workflow_states_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_states
    ADD CONSTRAINT workflow_states_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- TOC entry 5730 (class 2606 OID 68803)
-- Name: workflow_transitions workflow_transitions_from_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_from_state_id_fkey FOREIGN KEY (from_state_id) REFERENCES public.workflow_states(id) ON DELETE CASCADE;


--
-- TOC entry 5731 (class 2606 OID 68808)
-- Name: workflow_transitions workflow_transitions_to_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_to_state_id_fkey FOREIGN KEY (to_state_id) REFERENCES public.workflow_states(id) ON DELETE CASCADE;


--
-- TOC entry 5732 (class 2606 OID 68798)
-- Name: workflow_transitions workflow_transitions_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


-- Completed on 2026-07-10 18:23:37

--
-- PostgreSQL database dump complete
--

