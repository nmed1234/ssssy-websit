--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-07-30 08:15:03

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
-- TOC entry 6306 (class 0 OID 0)
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


ALTER TABLE public.admin_notifications OWNER TO neondb_owner;

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


ALTER TABLE public.audit_logs OWNER TO neondb_owner;

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


ALTER TABLE public.board_members OWNER TO neondb_owner;

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


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- TOC entry 293 (class 1259 OID 77278)
-- Name: cms_event_log; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.cms_event_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    event_type character varying(100) NOT NULL,
    actor_id uuid,
    occurred_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cms_event_log OWNER TO neondb_owner;

--
-- TOC entry 295 (class 1259 OID 77312)
-- Name: cms_form_submissions; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.cms_form_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_id uuid NOT NULL,
    user_id uuid,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    submitter_name character varying(255),
    submitter_email character varying(255),
    ip_address character varying(45),
    user_agent text,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cms_form_submissions OWNER TO neondb_owner;

--
-- TOC entry 294 (class 1259 OID 77288)
-- Name: cms_forms; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.cms_forms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    title_ar character varying(255),
    slug character varying(100) NOT NULL,
    description text,
    schema_json jsonb DEFAULT '[]'::jsonb NOT NULL,
    submit_label_en character varying(100) DEFAULT 'Submit'::character varying,
    submit_label_ar character varying(100) DEFAULT 'ط¥ط±ط³ط§ظ„'::character varying,
    success_message_en text,
    success_message_ar text,
    redirect_url character varying(500),
    notification_emails text,
    requires_auth boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cms_forms OWNER TO neondb_owner;

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


ALTER TABLE public.comment_events OWNER TO neondb_owner;

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


ALTER TABLE public.comments OWNER TO neondb_owner;

--
-- TOC entry 282 (class 1259 OID 69221)
-- Name: component_presets; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.component_presets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_ar character varying(200),
    name_en character varying(200),
    component_type character varying(100) NOT NULL,
    config_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    data_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    styling_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.component_presets OWNER TO neondb_owner;

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


ALTER TABLE public.component_templates OWNER TO neondb_owner;

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


ALTER TABLE public.contact_submissions OWNER TO neondb_owner;

--
-- TOC entry 284 (class 1259 OID 69256)
-- Name: content_approval_log; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.content_approval_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_type character varying(100) NOT NULL,
    content_id uuid NOT NULL,
    old_status character varying(50),
    new_status character varying(50) NOT NULL,
    comments text,
    action_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.content_approval_log OWNER TO neondb_owner;

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
    body text,
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
    deleted_at timestamp without time zone,
    body_ar text,
    body_en text,
    excerpt_ar text
);


ALTER TABLE public.content_items OWNER TO neondb_owner;

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


ALTER TABLE public.content_strings OWNER TO neondb_owner;

--
-- TOC entry 228 (class 1259 OID 68007)
-- Name: content_tags; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.content_tags (
    content_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


ALTER TABLE public.content_tags OWNER TO neondb_owner;

--
-- TOC entry 296 (class 1259 OID 77339)
-- Name: content_type_definitions; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.content_type_definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    label_en character varying(255) NOT NULL,
    label_ar character varying(255),
    description text,
    icon character varying(100) DEFAULT 'FileText'::character varying,
    workflow_id uuid,
    allow_comments boolean DEFAULT false NOT NULL,
    allow_member_submit boolean DEFAULT false NOT NULL,
    requires_approval boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.content_type_definitions OWNER TO neondb_owner;

--
-- TOC entry 297 (class 1259 OID 77369)
-- Name: content_type_fields; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.content_type_fields (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_type_id uuid NOT NULL,
    field_name character varying(100) NOT NULL,
    field_label_en character varying(255) NOT NULL,
    field_label_ar character varying(255),
    field_type character varying(50) NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    is_searchable boolean DEFAULT false NOT NULL,
    is_listed boolean DEFAULT true NOT NULL,
    placeholder_en character varying(255),
    placeholder_ar character varying(255),
    help_text_en text,
    help_text_ar text,
    options_json jsonb,
    validation_json jsonb,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.content_type_fields OWNER TO neondb_owner;

--
-- TOC entry 283 (class 1259 OID 69240)
-- Name: content_version_history; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.content_version_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_type character varying(100) NOT NULL,
    content_id uuid NOT NULL,
    version_number integer NOT NULL,
    data_snapshot jsonb NOT NULL,
    change_description text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.content_version_history OWNER TO neondb_owner;

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
    body text,
    status character varying(30),
    changed_by uuid NOT NULL,
    change_summary character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.content_versions OWNER TO neondb_owner;

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


ALTER TABLE public.crm_contacts OWNER TO neondb_owner;

--
-- TOC entry 298 (class 1259 OID 77389)
-- Name: dynamic_content_entries; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.dynamic_content_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_type_name character varying(100) NOT NULL,
    slug character varying(550) NOT NULL,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    author_id uuid,
    workflow_state character varying(50),
    field_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    featured_image_url character varying(500),
    meta_title character varying(255),
    meta_description text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dynamic_content_entries OWNER TO neondb_owner;

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


ALTER TABLE public.email_accounts OWNER TO neondb_owner;

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


ALTER TABLE public.email_aliases OWNER TO neondb_owner;

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


ALTER TABLE public.email_attachments OWNER TO neondb_owner;

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


ALTER TABLE public.email_contact_group_members OWNER TO neondb_owner;

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


ALTER TABLE public.email_contact_groups OWNER TO neondb_owner;

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


ALTER TABLE public.email_contacts OWNER TO neondb_owner;

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


ALTER TABLE public.email_distribution_list_members OWNER TO neondb_owner;

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


ALTER TABLE public.email_distribution_lists OWNER TO neondb_owner;

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


ALTER TABLE public.email_folders OWNER TO neondb_owner;

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


ALTER TABLE public.email_messages OWNER TO neondb_owner;

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


ALTER TABLE public.email_quota_logs OWNER TO neondb_owner;

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


ALTER TABLE public.email_recipients OWNER TO neondb_owner;

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


ALTER TABLE public.email_rules OWNER TO neondb_owner;

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


ALTER TABLE public.email_scheduled_sends OWNER TO neondb_owner;

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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    checked_in_at timestamp without time zone,
    check_in_notes text,
    waitlist_position integer
);


ALTER TABLE public.event_registrations OWNER TO neondb_owner;

--
-- TOC entry 301 (class 1259 OID 77738)
-- Name: event_reminder_rules; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.event_reminder_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    rule_type character varying(30) DEFAULT 'BEFORE_EVENT'::character varying NOT NULL,
    offset_hours integer DEFAULT 24 NOT NULL,
    fire_at timestamp without time zone NOT NULL,
    subject_template text NOT NULL,
    body_template text NOT NULL,
    send_email boolean DEFAULT true,
    send_in_app boolean DEFAULT true,
    is_fired boolean DEFAULT false,
    fired_at timestamp without time zone,
    recipients_count integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.event_reminder_rules OWNER TO neondb_owner;

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
    contact_email character varying(320),
    is_featured boolean DEFAULT false,
    display_order integer DEFAULT 0,
    og_image character varying(500),
    meta_title character varying(255),
    meta_description text,
    registration_form_schema jsonb,
    cancelled_at timestamp without time zone,
    cancellation_reason text
);


ALTER TABLE public.events OWNER TO neondb_owner;

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


ALTER TABLE public.flyway_schema_history OWNER TO neondb_owner;

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


ALTER TABLE public.gallery_albums OWNER TO neondb_owner;

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


ALTER TABLE public.gallery_analytics_events OWNER TO neondb_owner;

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


ALTER TABLE public.gallery_images OWNER TO neondb_owner;

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


ALTER TABLE public.gallery_share_links OWNER TO neondb_owner;

--
-- TOC entry 299 (class 1259 OID 77418)
-- Name: installed_plugins; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.installed_plugins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plugin_id character varying(100) NOT NULL,
    plugin_name character varying(255) NOT NULL,
    version character varying(50) NOT NULL,
    author character varying(255),
    description text,
    manifest_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    status character varying(20) DEFAULT 'INSTALLED'::character varying NOT NULL,
    config_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    source character varying(20) DEFAULT 'CLASSPATH'::character varying NOT NULL,
    jar_path character varying(500),
    error_message text,
    installed_at timestamp with time zone DEFAULT now() NOT NULL,
    activated_at timestamp with time zone,
    deactivated_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.installed_plugins OWNER TO neondb_owner;

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


ALTER TABLE public.job_applications OWNER TO neondb_owner;

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


ALTER TABLE public.job_vacancies OWNER TO neondb_owner;

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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    caption_en character varying(500),
    caption_ar character varying(500),
    tags text,
    uploader_id uuid,
    fts_index tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, (((((((((((COALESCE(alt_text_en, ''::character varying))::text || ' '::text) || (COALESCE(alt_text_ar, ''::character varying))::text) || ' '::text) || (COALESCE(caption_en, ''::character varying))::text) || ' '::text) || (COALESCE(caption_ar, ''::character varying))::text) || ' '::text) || COALESCE(tags, ''::text)) || ' '::text) || (COALESCE(original_filename, ''::character varying))::text))) STORED
);


ALTER TABLE public.media_files OWNER TO neondb_owner;

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


ALTER TABLE public.media_folders OWNER TO neondb_owner;

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


ALTER TABLE public.media_thumbnails OWNER TO neondb_owner;

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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    name_ar character varying(200),
    name_en character varying(200),
    title_ar character varying(100),
    specialization_detail character varying(255),
    birth_year integer,
    birth_city character varying(100),
    nationality character varying(100),
    marital_status character varying(50),
    career_summary text,
    memberships text,
    languages character varying(500),
    photo_url character varying(500),
    slug character varying(255)
);


ALTER TABLE public.member_profiles OWNER TO neondb_owner;

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


ALTER TABLE public.menu_items OWNER TO neondb_owner;

--
-- TOC entry 253 (class 1259 OID 68538)
-- Name: menus; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.menus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    location character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    menu_template character varying(50) DEFAULT 'classic'::character varying,
    dropdown_style character varying(50) DEFAULT 'slide'::character varying,
    is_default_style boolean DEFAULT false,
    style_config text
);


ALTER TABLE public.menus OWNER TO neondb_owner;

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


ALTER TABLE public.newsletter_subscribers OWNER TO neondb_owner;

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


ALTER TABLE public.notification_preferences OWNER TO neondb_owner;

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


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- TOC entry 286 (class 1259 OID 69292)
-- Name: page_audit_trail; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.page_audit_trail (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid NOT NULL,
    user_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    "timestamp" timestamp without time zone DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
    changed_fields jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT page_audit_trail_action_check CHECK (((action)::text = ANY ((ARRAY['CREATE'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying, 'PUBLISH'::character varying, 'UNPUBLISH'::character varying, 'WORKFLOW_TRANSITION'::character varying])::text[])))
);


ALTER TABLE public.page_audit_trail OWNER TO neondb_owner;

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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    events_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    conditions_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.page_sections OWNER TO neondb_owner;

--
-- TOC entry 291 (class 1259 OID 69406)
-- Name: page_sections_backup; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.page_sections_backup (
    id uuid,
    page_id uuid,
    component_type character varying(100),
    config jsonb,
    data jsonb,
    styling jsonb,
    sort_order integer,
    visibility character varying(20),
    is_animated boolean,
    animation_type character varying(50),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    events_json jsonb,
    conditions_json jsonb,
    version integer
);


ALTER TABLE public.page_sections_backup OWNER TO neondb_owner;

--
-- TOC entry 288 (class 1259 OID 69335)
-- Name: page_templates; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.page_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    description character varying(500),
    layout_json text NOT NULL,
    thumbnail_url character varying(1000),
    usage_count integer DEFAULT 0 NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT page_templates_category_check CHECK (((category)::text = ANY ((ARRAY['Layout'::character varying, 'Landing'::character varying, 'About'::character varying, 'Contact'::character varying, 'Blog'::character varying])::text[])))
);


ALTER TABLE public.page_templates OWNER TO neondb_owner;

--
-- TOC entry 287 (class 1259 OID 69315)
-- Name: page_workflow_transitions; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.page_workflow_transitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid NOT NULL,
    from_state character varying(50) NOT NULL,
    to_state character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    "timestamp" timestamp without time zone DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
    notes character varying(1000)
);


ALTER TABLE public.page_workflow_transitions OWNER TO neondb_owner;

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
    og_image_url character varying(500),
    layout_json text,
    workflow_status character varying(50) DEFAULT 'DRAFT'::character varying NOT NULL,
    allowed_roles text[],
    visibility character varying(50) DEFAULT 'PUBLIC'::character varying NOT NULL,
    translation_group_id uuid,
    language character varying(10) DEFAULT 'EN'::character varying NOT NULL,
    created_by uuid
);


ALTER TABLE public.pages OWNER TO neondb_owner;

--
-- TOC entry 6307 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN pages.layout_json; Type: COMMENT; Schema: public; Owner: ssssy
--

COMMENT ON COLUMN public.pages.layout_json IS 'Full page block tree as a JSON document {"version":"1","blocks":[...]}. When present, the page builder reads/writes this column. Legacy pages still served via page_sections until migrated.';


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


ALTER TABLE public.permissions OWNER TO neondb_owner;

--
-- TOC entry 289 (class 1259 OID 69368)
-- Name: preview_tokens; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.preview_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid NOT NULL,
    token character(64) NOT NULL,
    layout_json text NOT NULL,
    created_by uuid NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.preview_tokens OWNER TO neondb_owner;

--
-- TOC entry 292 (class 1259 OID 76975)
-- Name: publications; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.publications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_en character varying(500) NOT NULL,
    title_ar character varying(500),
    slug character varying(550) NOT NULL,
    abstract_en text,
    abstract_ar text,
    authors character varying(500),
    year integer,
    category character varying(100),
    cover_image_url character varying(500),
    pdf_url character varying(500),
    file_size_kb integer,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.publications OWNER TO neondb_owner;

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


ALTER TABLE public.refresh_tokens OWNER TO neondb_owner;

--
-- TOC entry 221 (class 1259 OID 67863)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role_permissions OWNER TO neondb_owner;

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


ALTER TABLE public.roles OWNER TO neondb_owner;

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


ALTER TABLE public.sensor_readings OWNER TO neondb_owner;

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


ALTER TABLE public.sensors OWNER TO neondb_owner;

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


ALTER TABLE public.seo_metadata OWNER TO neondb_owner;

--
-- TOC entry 300 (class 1259 OID 77441)
-- Name: site_section_versions; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.site_section_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    section_id uuid NOT NULL,
    version_number integer NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    styling jsonb DEFAULT '{}'::jsonb NOT NULL,
    published_by character varying(255),
    change_summary character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.site_section_versions OWNER TO neondb_owner;

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
    location character varying(50) DEFAULT 'general'::character varying,
    events_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    conditions_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    status character varying(20) DEFAULT 'PUBLISHED'::character varying NOT NULL,
    published_data jsonb,
    published_config jsonb,
    published_styling jsonb,
    published_at timestamp without time zone
);


ALTER TABLE public.site_sections OWNER TO neondb_owner;

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


ALTER TABLE public.system_config OWNER TO neondb_owner;

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


ALTER TABLE public.tags OWNER TO neondb_owner;

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


ALTER TABLE public.theme_settings OWNER TO neondb_owner;

--
-- TOC entry 285 (class 1259 OID 69273)
-- Name: themes; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.themes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_ar character varying(200),
    name_en character varying(200) NOT NULL,
    theme_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.themes OWNER TO neondb_owner;

--
-- TOC entry 290 (class 1259 OID 69390)
-- Name: url_redirects; Type: TABLE; Schema: public; Owner: ssssy
--

CREATE TABLE public.url_redirects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_path character varying(500) NOT NULL,
    to_path character varying(500) NOT NULL,
    redirect_type integer DEFAULT 301 NOT NULL,
    page_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.url_redirects OWNER TO neondb_owner;

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


ALTER TABLE public.users OWNER TO neondb_owner;

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


ALTER TABLE public.workflow_actions OWNER TO neondb_owner;

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


ALTER TABLE public.workflow_logs OWNER TO neondb_owner;

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


ALTER TABLE public.workflow_states OWNER TO neondb_owner;

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


ALTER TABLE public.workflow_transitions OWNER TO neondb_owner;

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


ALTER TABLE public.workflows OWNER TO neondb_owner;

--
-- TOC entry 6271 (class 0 OID 68958)
-- Dependencies: 272
-- Data for Name: admin_notifications; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.admin_notifications (id, title, body, type, related_entity_type, related_entity_id, is_read, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6223 (class 0 OID 67918)
-- Dependencies: 224
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent, created_at) FROM stdin;
3f832413-4ee8-44b3-b64e-9c23680bc6bb	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:01:30.655433
a121e718-611c-4583-915b-fdbad21cc279	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:05:49.129863
5ade0b98-b447-42aa-94c3-62b85fb2f9cd	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:06:23.936531
92745e35-9957-4e60-b55e-5afd9fa7ed07	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:07:05.298411
f43801c2-1b26-4c77-ab7d-ab903255c84e	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:08:40.059542
d212b438-6425-4fc4-9171-12d20fb03b52	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:09:10.817928
26927643-63f4-4e7a-8a00-03b6d7fcc67d	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:11:29.306937
378e4153-7f79-46c5-a97c-106162867a3d	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:11:49.448631
91c319af-e928-4e2e-9ec9-577ebbe1bef7	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:12:24.244606
25eca3a6-baa9-44ad-a2d0-52d611ac5e3f	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:13:17.048258
d531906c-58ab-4246-8169-83eaba20fd16	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:14:08.919659
b4b2c208-91bd-47d5-8881-8f9cd53463ea	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:14:37.820465
893b7ed6-0a02-41f8-8c69-82b551dc5fe6	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:17:33.893627
e1b0d6a2-6ee8-4e60-9c5d-490de2a3b078	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:19:21.892179
98397ce9-887b-4d32-b51d-7045873a3a22	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:19:24.070039
9d7f2528-715a-4046-9c71-f422ff4f1ca6	\N	POST /api/auth/login	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 07:28:29.1735
454eadd0-0dda-4f4a-9153-aa98d2eaeda9	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-15 11:00:53.304948
923009ba-a7d5-4cbe-aebc-cf0c92a5bf38	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-16 01:45:00.552806
f5a82162-ecb6-4082-a29b-14d2fd5e9dce	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-16 01:46:01.047595
496f10ca-6571-41ba-917f-cc56484f46a7	\N	POST /api/auth/login	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-21 15:53:08.666464
772f4f36-49a1-4713-a904-8624820d6e2f	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-21 18:30:38.495643
9d1dd3d8-25ec-4986-92ce-f6e0c376d0a1	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-21 18:30:43.199324
ddc6edb1-e1a4-4c73-a942-9b295ad95976	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-21 18:31:09.716196
d7f60ce8-e070-474b-b901-7aab49cd1391	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-21 18:31:18.431224
7e000a28-e5cc-44dc-885c-881a2605bc8d	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-21 22:24:39.240124
01138db9-9100-422c-97df-5c0e0e728339	\N	GET /api/public/pdf-proxy	SLOW_REQUEST	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-21 22:25:41.821998
b4d06c36-d41e-491b-9db1-ea022387233f	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-23 14:01:46.278821
9a8ac511-d6ad-4110-a7dc-e409228002de	6d6595c0-1835-42be-89a1-1a44b899141c	LOGOUT	USER	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-23 14:03:39.670735
d39e2cbc-d9c3-4a5c-80c2-4febcd286da8	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 14:48:00.297891
d82e17c6-f1ae-45c6-a300-6e44bdb50c8f	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 15:51:50.388905
d5171410-980d-45c5-bcc9-982959addbf0	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 16:16:02.607415
fdaeebed-3eab-4e15-befd-d8307a70f245	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 16:37:06.923291
a5051a03-4f38-4cd5-902d-d2a3616b6219	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 16:53:17.473325
30757704-e3b4-4faa-8e6e-d145357da0f2	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 17:12:46.769167
92a505e0-d24b-415e-99aa-23b296d6abea	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 18:48:52.703449
25b3f7e7-98ea-42e2-a973-d342f7851b2c	6d6595c0-1835-42be-89a1-1a44b899141c	LOGOUT	USER	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 18:52:50.248134
e8c935e7-e09c-4b72-9cec-bb0becf951b8	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 18:52:55.480982
6f225d1d-227d-4a10-bb81-f1d92332c433	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 19:14:53.033174
483aeeb6-f079-4be3-9284-6c87f550e44e	6d6595c0-1835-42be-89a1-1a44b899141c	LOGOUT	USER	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 19:18:10.185959
3353b8b4-170b-47af-ba1e-e402f4b03686	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 19:18:14.234793
293388b3-6858-4fee-98e9-0448a3b9e1b1	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 19:35:20.876431
b310c5c5-af14-4232-b74e-c541f042a90d	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 20:04:48.833267
52a4b0dc-5c62-4162-891e-e7ec293ef0ef	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-24 22:12:24.447775
a0c032d5-95f0-41a1-b1f6-50c117fcf24f	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-25 01:43:16.208138
4b71fd72-917a-496d-8b29-f5bac55411d0	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-25 02:07:53.742568
29bf8c08-905e-4dd7-8ca9-f38effb58871	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-25 02:27:07.368857
1f77fd31-98dc-4542-8db2-fc51be3aba37	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-25 03:03:23.148896
974d1193-2a4e-4624-a17f-6c9bcb1897cb	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-25 04:22:12.134586
fcd88d7d-171f-487c-8fe8-b5346dfd330c	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-25 15:35:29.568723
197c321b-109b-454f-896d-3d8c60977b69	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-25 16:51:30.905214
f38b4d15-c3bd-4037-9421-498ba028a92f	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-25 17:15:41.993628
376bbd00-3d16-401c-bb10-1e2830c12673	6d6595c0-1835-42be-89a1-1a44b899141c	LOGOUT	USER	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-25 17:17:55.693031
d092b38e-efe6-41e0-9b77-1d4a760d836c	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-25 17:18:28.533594
931c25c7-1ddf-4d08-b2a3-a6b5d58e751e	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-26 00:31:58.785963
5b3ad2a6-e44a-409b-9ae1-116357fedf63	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-26 00:54:09.586619
749cc3f1-de5a-4457-8cd2-d86e53707bab	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-26 01:16:17.506969
96375cbf-1f79-4891-93b9-157cd7ff3fcd	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-26 11:24:45.154651
22fc5433-64de-47cd-8a46-6111e396aed0	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-27 01:43:39.48257
5c03d8a7-cd69-4532-80c7-0e27a67ed4d4	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-27 02:32:29.388055
613334fc-37f2-4c46-8857-b2385c773d65	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-27 03:29:23.569457
e3056368-c40b-4a3c-ad7a-1fe0324cfa6a	6d6595c0-1835-42be-89a1-1a44b899141c	LOGOUT	USER	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-27 03:41:15.041137
70d312fc-63e7-4d72-9597-d736a23d1a08	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-27 23:31:04.209402
525946f5-c2a4-4d14-b506-2be005e40e5e	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-28 00:43:24.626982
b0b224ed-65ad-419c-b3de-786515d28a21	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-28 01:32:24.639975
d26decfe-9069-4b5a-88b9-25a107a09c18	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-28 11:53:01.152915
08c49f6d-4712-4e0c-ad52-89bb497a2be7	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-29 18:00:09.050751
677b42bf-52b5-4b5b-a3e4-441ed491fd03	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-29 18:56:39.284454
b333d218-b107-48bc-b321-a04de6631c8e	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-29 19:45:02.811451
fbba731f-ef73-410b-a5f3-c57fdc0e016f	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-29 20:48:32.19317
8eba5209-75d8-4b0d-83a4-a8babbfd508d	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-29 21:12:05.275187
36353f57-29b6-4050-ba9b-2ec21db1c567	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-29 21:51:32.620329
0c3708b4-2554-49b2-9299-5a4e188eed4c	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 00:13:58.158713
f8a24e89-a970-4ce4-8b7b-fe72cc1725a9	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:04:36.95754
ec0641aa-5860-4c57-9030-a9bc36aaa88c	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:04:45.604086
45f334a5-fedd-4774-9d4a-b7b4af394fe5	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:07:41.388793
2c8b113e-ba61-4e3d-9b03-9b056c43303a	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:07:43.632418
6c148d00-ea5c-46e0-86aa-5a9efe49dfcf	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:15:03.829194
1202eb6b-25fe-4186-8056-717fb864ce20	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:15:34.934715
5fb4fdcb-8a9b-4b22-90c9-003499649d11	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:15:41.180632
6219e226-c695-49ec-a9c9-a5d2325ae61a	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:15:43.508173
500026d0-6226-4a55-93e9-d130bc4805a1	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:18:50.232087
ce067bc7-cd86-4f5a-b3b4-91c351dd1b8c	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:18:58.783288
aa85e74f-60e8-4273-82de-a904cb251709	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:19:00.361473
ac0fe03d-ebd4-455e-8209-d04e75fcd094	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:19:04.980956
67cfebaf-d88e-40f4-9fdf-681efe4bbd3d	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:19:06.640686
953e2111-8880-4fde-8dd7-42dbbe5a1f7b	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:19:08.860644
67245703-941d-4b4e-9f3b-6d57440d3601	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:21:20.873871
fb562cb7-25b8-4b88-b1cc-77d541aa9e2e	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:21:33.686398
865bdf54-6664-4786-98ef-dda2ef2f8b30	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:22:01.707668
a2313180-0348-43aa-97b2-b265fe65b041	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:24:01.345655
7318746d-1593-4e6c-8763-c3c39442d552	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:24:13.707887
dca10f84-f2d2-422e-8bfc-6f36fd84424f	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:24:25.155606
d03d2a05-3572-46bf-b4e1-34a66cb82cfc	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:24:28.014045
2f567a0b-f333-4524-9e6e-e7ae54e45e5d	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:27:25.287963
8dbd2db7-acae-458d-b65d-c763bc74ee2f	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:33:01.972365
ad35751e-12a9-4ed4-9854-f8f0c5c685b7	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:33:05.701048
21f9dc34-48a7-4092-90d4-f099946bd198	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:33:09.164625
6d3f2fc1-08d0-4a0d-8d83-308fc8005e21	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:33:33.141279
99260a11-f787-4434-b9f1-bd086578fc3d	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:50:57.734763
1b748698-efee-45d7-8abc-defc419cd17e	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:51:09.569041
9c2f1e38-38dd-49c3-871f-334e35f6d396	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:51:33.353654
d7b95960-5373-4f58-b56b-ebed132c1813	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:52:53.086842
2ae955ab-1393-42d1-aac3-cb804e6897c1	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:53:07.513553
1dcb92d6-642e-45c6-a326-193071e4fc00	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:53:10.127936
96b1ec0c-9c07-408e-9df7-cf752e725a36	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:53:16.843579
f3d41b95-ab58-4ead-87cd-0571820779c7	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:54:45.887985
c3f7bf05-36cf-4665-853e-f3b771b70244	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:54:49.485821
fdc48cd6-06cd-4ff6-9528-98186a8decfd	\N	LOGIN	USER	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 01:55:42.856531
2c3ee0e0-34c9-49c6-bd45-31495a71c10f	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 01:55:46.269317
d47e2395-7eda-4aa2-b69d-b3a4687d6c67	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:56:44.748686
5e722e1d-9553-44ba-9e15-46f2cf39afc7	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:56:53.145718
7c87fce7-45b0-43b6-9668-2c9b19dcf235	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:56:57.019753
2ea9f355-7e41-4297-a032-3b2d6048a65c	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:56:58.035527
2e43193e-1af9-4bfc-9db1-d50f7a739f85	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:56:58.923699
5c6a2669-82da-4f18-8506-0407a53c93cf	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:56:59.797535
3dade660-2b8a-4762-93f4-3acb49187d90	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:57:00.663589
bd34580f-3d2f-4e14-a445-6c8787a1191e	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:57:04.603438
4b34558c-8a8a-4d21-8b9a-d27a2e1e7f0d	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:57:05.769592
d9898646-d6a0-427f-aec5-f632110cc4d6	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 01:57:20.137411
ba03f329-f35b-406c-b015-d5ae89cff29d	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:07:36.990113
15982818-bd0d-4ca1-8771-0cfba1188239	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:14:17.432157
a0815dd2-afca-4f7e-aefe-6b2e71d199d3	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:14:20.10559
ae4bed61-15c5-4fdf-82eb-9f8191d682b8	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:14:20.972167
c12fcecd-c580-4ed7-8217-592d5ea78bc8	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:14:21.595945
4da76341-b316-4270-b1f1-23e5b37732d7	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:14:21.910593
8f327dc8-0aaa-44d2-9126-cc8d2f9d21a5	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:14:22.24059
3476a641-a53d-4d21-a6a9-4732cb057b8c	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:14:22.449564
a150fb53-02e1-45ba-9b52-871134d7b6f6	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:14:22.81216
3f6bafae-bd62-48df-a21d-65c313923f99	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:17:08.453335
9bc13a93-df4e-4a15-9688-565cd2d3040d	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:17:19.070518
1e4627c6-b7f4-479b-b0e1-20ca743e1693	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:17:20.897068
5c96ff1f-4d42-4c8a-aae7-b5a3758b59f5	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:43:57.600701
5ffed4d5-1743-4b02-9470-5a6fd7974697	6d6595c0-1835-42be-89a1-1a44b899141c	LOGOUT	USER	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:58:45.944111
f36d2fe4-45d9-47ea-97b6-f7fe47039cba	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 02:59:27.631503
0aea1222-d647-46a6-b83d-3b442e3c39bf	6d6595c0-1835-42be-89a1-1a44b899141c	LOGOUT	USER	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 03:05:42.850875
cca9a447-deea-487f-aa1d-ac47cfb9d358	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 03:05:45.071313
88603b44-b97b-473f-b3a4-07b5c1225e48	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 03:45:58.969825
349b1d5b-4582-49ef-9a16-efac94ddfc5f	6d6595c0-1835-42be-89a1-1a44b899141c	LOGOUT	USER	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 03:51:30.536248
47cda408-194e-4548-90cc-833db4ccac41	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 03:51:33.805899
f8691fff-e909-40b7-b751-62b4cc7788a7	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 04:11:51.697318
31bb86a5-e986-4c66-be07-e8b7d16e569d	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 04:11:59.695635
6b539919-4d99-4c12-baff-a44d0006afdb	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 04:12:16.73226
168bf589-b785-48a9-91d1-89c28ea81b9c	\N	LOGIN	USER	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 04:38:25.435998
bd036a7a-50e1-495f-b3de-69aaa14f79ad	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 04:38:31.324171
9a68fb5c-7032-48de-8597-300ff91aa89e	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 04:38:35.10351
b4a0118e-d41a-4f9e-aa03-c9ba7ddc5dc0	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	0:0:0:0:0:0:0:1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 04:38:50.133225
96fa8645-f558-4d51-a223-ed97c2f0f825	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 05:01:11.903126
74fde865-f73b-49a0-8b78-e795ab21e9e7	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 06:35:51.865303
aaf3af3b-bb58-40eb-981d-1e2bc77ddd4d	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 07:02:00.650427
aebe243c-b18a-4db5-8a13-7c554c05e115	6d6595c0-1835-42be-89a1-1a44b899141c	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 07:02:02.65776
3900fc75-6e87-4c45-930e-f78c07b35d01	\N	LOGIN	USER	\N	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0	2026-07-30 08:09:36.142377
\.


--
-- TOC entry 6256 (class 0 OID 68616)
-- Dependencies: 257
-- Data for Name: board_members; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.board_members (id, user_id, position_ar, position_en, term_start, term_end, bio, photo_url, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6224 (class 0 OID 67940)
-- Dependencies: 225
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.categories (id, name_ar, name_en, slug, description, parent_id, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6292 (class 0 OID 77278)
-- Dependencies: 293
-- Data for Name: cms_event_log; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.cms_event_log (id, event_id, event_type, actor_id, occurred_at, created_at) FROM stdin;
f11b8ef0-c4ac-4832-adc6-18cc05f98ae9	aeb3872c-c509-42f6-8ac7-53c2b4292fa2	CONTENT_UPDATED	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-29 21:12:41.366581+03	2026-07-29 21:12:41.366581+03
\.


--
-- TOC entry 6294 (class 0 OID 77312)
-- Dependencies: 295
-- Data for Name: cms_form_submissions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.cms_form_submissions (id, form_id, user_id, data, submitter_name, submitter_email, ip_address, user_agent, status, admin_notes, created_at) FROM stdin;
\.


--
-- TOC entry 6293 (class 0 OID 77288)
-- Dependencies: 294
-- Data for Name: cms_forms; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.cms_forms (id, title, title_ar, slug, description, schema_json, submit_label_en, submit_label_ar, success_message_en, success_message_ar, redirect_url, notification_emails, requires_auth, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6270 (class 0 OID 68934)
-- Dependencies: 271
-- Data for Name: comment_events; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.comment_events (id, comment_id, event_type, event_data, entity_type, entity_id, initiated_by, recipients, is_processed, sent_at, created_at) FROM stdin;
\.


--
-- TOC entry 6254 (class 0 OID 68573)
-- Dependencies: 255
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.comments (id, content_id, parent_id, author_id, body, is_approved, approved_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6281 (class 0 OID 69221)
-- Dependencies: 282
-- Data for Name: component_presets; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.component_presets (id, name_ar, name_en, component_type, config_json, data_json, styling_json, is_system, created_by, created_at, updated_at) FROM stdin;
3ceac63d-a3c2-445b-bdf4-03b851d527e1	ط¨ط§ظ†ط± ط±ط¦ظٹط³ظٹ â€“ ط¯ط§ظƒظ†	Hero Banner â€“ Dark	hero-banner	{"layout": "centered", "overlay": true}	{"btnUrl": "/about", "titleAr": "ظ…ط±ط­ط¨ط§ظ‹ ط¨ظƒظ… ظپظٹ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©", "titleEn": "Welcome to SSSSY", "btnLabel": "Learn More", "subtitle": "Building tomorrow's soil science"}	{"color": "#ffffff", "bgType": "image", "minHeight": "600px", "textAlign": "center", "paddingTop": "120px", "overlayColor": "#00000060", "paddingBottom": "120px"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
f8517dda-bdae-48d1-b8e0-bfc7d0d24f58	ط¨ط§ظ†ط± ط±ط¦ظٹط³ظٹ â€“ ظ…ظ†ظ‚ط³ظ…	Hero Banner â€“ Split	hero-split	{"layout": "split", "imageRight": true}	{"btnUrl": "/register", "titleAr": "طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©", "titleEn": "Advancing Soil Science", "btnLabel": "Join Us", "subtitle": "Research â€¢ Education â€¢ Innovation"}	{"color": "#3E2723", "bgType": "solid", "padding": "py-20", "backgroundColor": "#FFF8E1"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
15ec7fc3-8f79-4f18-86ea-6a2c41a469ff	ط¨ط§ظ†ط± ط¨ط®ظ„ظپظٹط© ظپظٹط¯ظٹظˆ	Hero â€“ Video Background	video-hero	{"muted": true, "autoplay": true}	{"btnUrl": "/news", "titleEn": "The Future of Soil", "btnLabel": "Explore Research"}	{"color": "#ffffff", "bgType": "video", "minHeight": "500px", "textAlign": "center", "overlayColor": "#00000070"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
b6bc8bf0-3b7d-4a3a-8e43-04b7846f4ddc	ظ…ظٹط²ط§طھ ط´ط¨ظƒظٹط© ظ…ط¹ ط£ظٹظ‚ظˆظ†ط§طھ	Features Grid â€“ Icons	features-grid	{"columns": 3}	{"items": [{"icon": "Microscope", "descEn": "Access peer-reviewed research", "titleEn": "Research"}, {"icon": "Users", "descEn": "Connect with 500+ members", "titleEn": "Network"}, {"icon": "Award", "descEn": "Annual awards program", "titleEn": "Recognition"}], "titleEn": "Why Join SSSSY?"}	{"bgType": "solid", "padding": "py-16", "textAlign": "center", "backgroundColor": "#f7f8fa"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
42a585d4-52e0-4c56-b59d-0d94e847cbf0	ظ‚ط§ط¦ظ…ط© ظ…ظٹط²ط§طھ â€“ ظٹط³ط§ط±	Features List â€“ Left	features-list	{"showNumbers": true}	{"items": [{"descEn": "The premier soil science event in Syria", "titleEn": "Annual Conference"}, {"descEn": "Funding for innovative projects", "titleEn": "Research Grants"}, {"descEn": "Skills for the modern agronomist", "titleEn": "Training Workshops"}], "titleEn": "Our Key Programs"}	{"bgType": "solid", "padding": "py-16", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
b60199a9-ed08-4688-8a4a-0a61fdf2e5f4	ط¯ط¹ظˆط© ظ„ظ„ط¹ظ…ظ„ â€“ ظˆط³ط·	CTA â€“ Centered	cta	{"layout": "centered"}	{"btnUrl": "/register", "titleEn": "Ready to Contribute?", "btnLabel": "Become a Member", "subtitle": "Join thousands of soil scientists shaping the future.", "btnSecondaryUrl": "/about", "btnSecondaryLabel": "Learn More"}	{"color": "#FFF8E1", "bgType": "solid", "textAlign": "center", "paddingTop": "80px", "paddingBottom": "80px", "backgroundColor": "#3E2723"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
4c807c8e-bbe2-4c20-b2ea-eb53c6f491b4	ط´ط±ظٹط· ط¯ط¹ظˆط© ظ„ظ„ط¹ظ…ظ„	CTA â€“ Banner Strip	cta-split	{"layout": "split"}	{"btnUrl": "/newsletter", "titleEn": "Subscribe to Our Newsletter", "btnLabel": "Subscribe Now"}	{"color": "#ffffff", "bgType": "gradient", "paddingTop": "40px", "paddingBottom": "40px", "backgroundImage": "linear-gradient(90deg,#3E2723,#558B2F)"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
259e6ac6-2986-47a9-a970-ff24fae5b16a	ط¹ط¯ط§ط¯ ط§ظ„ط¥ط­طµط§ط¦ظٹط§طھ	Stats Counter	stats	{"animated": true}	{"items": [{"label": "Members", "value": "500+"}, {"label": "Years", "value": "25"}, {"label": "Publications", "value": "120"}, {"label": "Events", "value": "48"}], "titleEn": "SSSSY in Numbers"}	{"color": "#FFF8E1", "bgType": "solid", "padding": "py-16", "textAlign": "center", "backgroundColor": "#3E2723"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
bf046dde-2723-4384-9a49-a11217efb9c6	ط´ط¨ظƒط© ط¥ط­طµط§ط¦ظٹط§طھ ظپط§طھط­ط©	Stats Grid Light	stats-grid	{"columns": 4}	{"items": [{"label": "Hectares Studied", "value": "1000"}, {"label": "Members Active", "value": "80%"}, {"label": "Partner Universities", "value": "30"}, {"label": "Countries", "value": "15"}]}	{"bgType": "solid", "padding": "py-12", "textAlign": "center", "backgroundColor": "#f7f8fa"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
3718f0ea-fdd7-4126-bbb9-043b2320ec24	ظ…ط¹ط±ط¶ طµظˆط± â€“ ط­ط¬ط±ظٹ	Gallery â€“ Masonry	gallery-masonry	{"columns": 3, "lightbox": true}	{"titleEn": "Our Events Gallery"}	{"bgType": "solid", "padding": "py-12", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
05aea872-526e-493e-8090-56e08fae0f6f	ظ…ط¹ط±ط¶ طµظˆط± â€“ ط´ط±ظٹط­ط©	Gallery â€“ Slider	gallery-slider	{"autoplay": true, "interval": 4000}	{"titleEn": "Featured Photos"}	{"color": "#ffffff", "bgType": "solid", "padding": "py-8", "backgroundColor": "#1a1a1a"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
0e3d7951-9861-43a1-adf5-12eadd0105bc	ط´ط¨ظƒط© ط§ظ„ظپط±ظٹظ‚	Team Grid	team	{"columns": 4, "showSocial": true}	{"titleEn": "Meet the Board", "subtitle": "Leading soil science professionals"}	{"bgType": "solid", "padding": "py-16", "textAlign": "center", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
2c97156c-03f6-43f0-96eb-31fbc7086afb	ط¨ط·ط§ظ‚ط§طھ ط§ظ„ظپط±ظٹظ‚	Team Cards	team-grid	{"style": "cards"}	{"titleEn": "Our Executive Committee"}	{"bgType": "solid", "padding": "py-16", "backgroundColor": "#f7f8fa"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
759b974a-c071-4076-b18c-e44cc2222c3b	ط´ظ‡ط§ط¯ط§طھ ط§ظ„ط£ط¹ط¶ط§ط،	Testimonials	testimonials	{"style": "cards", "columns": 3}	{"items": [{"role": "Researcher", "text": "SSSSY changed my career trajectory.", "author": "Dr. Ahmad"}, {"role": "Agronomist", "text": "Invaluable networking opportunities.", "author": "Eng. Sara"}], "titleEn": "What Our Members Say"}	{"bgType": "solid", "padding": "py-16", "backgroundColor": "#FFF8E1"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
fe61e80a-2b2c-448a-8acb-71b91bfce8e1	ط´ظ‡ط§ط¯ط§طھ â€“ ط´ط±ظٹط­ط©	Testimonials Slider	testimonials-slider	{"autoplay": true}	{"titleEn": "Member Testimonials"}	{"color": "#FFF8E1", "bgType": "gradient", "padding": "py-20", "backgroundImage": "linear-gradient(135deg,#3E2723,#6D4C41)"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
a844333b-5e35-4412-af41-b5b1101c4ea3	ط£ط³ط¦ظ„ط© ط´ط§ط¦ط¹ط© â€“ ط£ظƒظˆط±ط¯ظٹظˆظ†	FAQ Accordion	faq	{"openFirst": true}	{"items": [{"a": "Visit our membership page and complete the online application.", "q": "How do I join SSSSY?"}, {"a": "Annual fees vary by member category. Check the membership page for current rates.", "q": "What are the membership fees?"}], "titleEn": "Frequently Asked Questions"}	{"bgType": "solid", "padding": "py-16", "maxWidth": "800px", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
4fb261ac-5b86-495b-926f-fe6cd9bf05bf	ط¬ط¯ظˆظ„ ط§ظ„ط£ط³ط¹ط§ط±	Pricing Table	pricing-table	{"columns": 3, "showToggle": true}	{"items": [{"name": "Student", "price": "Free", "features": ["Journal access", "Event discounts"]}, {"name": "Regular", "price": "$50/yr", "features": ["Full access", "Voting rights", "Certificate"]}, {"name": "Institutional", "price": "$200/yr", "features": ["10 accounts", "API access", "Priority support"]}], "titleEn": "Membership Plans"}	{"bgType": "solid", "padding": "py-16", "textAlign": "center", "backgroundColor": "#f7f8fa"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
86475d7a-80c7-4ee5-9438-030dede962b5	ط¬ط¯ظˆظ„ ط²ظ…ظ†ظٹ â€“ ط±ط£ط³ظٹ	Timeline â€“ Vertical	timeline	{"layout": "vertical"}	{"items": [{"year": "1999", "descEn": "SSSSY established in Damascus", "titleEn": "Founded"}, {"year": "2005", "descEn": "100+ attendees", "titleEn": "First Conference"}, {"year": "2015", "descEn": "Online membership portal", "titleEn": "Digital Launch"}, {"year": "2024", "descEn": "Modernised platform", "titleEn": "New Website"}], "titleEn": "Our History"}	{"bgType": "solid", "padding": "py-16", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
83d76e28-dd00-441e-bfc1-bac84d87e094	ط£ط­ط¯ط« ط§ظ„ظ…ظ‚ط§ظ„ط§طھ â€“ ط´ط¨ظƒط©	Blog Feed â€“ Grid	blog-grid	{"columns": 3, "dataSource": "latest-articles", "showExcerpt": true}	{"btnUrl": "/news", "titleEn": "Latest News & Research", "btnLabel": "View All"}	{"bgType": "solid", "padding": "py-16", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
60d18111-5710-4b39-9368-068b7e40098a	ط´ط±ظٹط· ط§ظ„ط£ط®ط¨ط§ط±	News Ticker	blog-feed	{"speed": "medium", "style": "ticker"}	{"titleEn": "Recent Updates", "dataSource": "latest-articles"}	{"color": "#FFF8E1", "bgType": "solid", "paddingTop": "12px", "paddingBottom": "12px", "backgroundColor": "#3E2723"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
b0fb79bf-2a41-4f0e-a149-153bf49bac62	ط´ط¨ظƒط© ط§ظ„ظپط¹ط§ظ„ظٹط§طھ	Events Grid	events-grid	{"columns": 3, "maxItems": 6, "dataSource": "upcoming-events"}	{"btnUrl": "/events", "titleEn": "Upcoming Events", "btnLabel": "See All Events"}	{"bgType": "solid", "padding": "py-16", "backgroundColor": "#f7f8fa"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
d655c191-2d04-4669-9b65-1e332d4b0e48	ط´ط±ظٹط· طھظ‚ظˆظٹظ… ط§ظ„ظپط¹ط§ظ„ظٹط§طھ	Events Calendar Strip	events-calendar	{"style": "list", "maxItems": 4, "dataSource": "upcoming-events"}	{"titleEn": "Next Events"}	{"bgType": "solid", "padding": "py-12", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
1c52b54e-f351-44ce-aa95-3981d6195b77	ظ†ظ…ظˆط°ط¬ ط§ظ„طھظˆط§طµظ„	Contact Form	contact-form	{"showPhone": true, "showSubject": true}	{"titleEn": "Get in Touch", "subtitle": "We respond within 24 hours."}	{"bgType": "solid", "padding": "py-16", "backgroundColor": "#f7f8fa"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
3674e884-a106-4753-8250-59792c3ec933	ظƒطھظ„ط© ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„طھظˆط§طµظ„	Contact Info Block	contact-info	{}	{"email": "info@ssssy.org.sy", "phone": "+963 11 XXX XXXX", "address": "Damascus, Syria", "titleEn": "Contact Information"}	{"color": "#FFF8E1", "bgType": "solid", "padding": "py-16", "backgroundColor": "#3E2723"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
55a10ea9-f2d4-4cc4-8935-35501519f26c	ط§ظ„ط§ط´طھط±ط§ظƒ ظپظٹ ط§ظ„ظ†ط´ط±ط©	Newsletter Signup	newsletter-signup	{"showNameField": true}	{"titleEn": "Stay Updated", "btnLabel": "Subscribe", "subtitle": "Get the latest soil science news in your inbox."}	{"color": "#ffffff", "bgType": "gradient", "padding": "py-16", "textAlign": "center", "backgroundImage": "linear-gradient(135deg,#558B2F,#2E7D32)"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
47ed23cb-4d28-42e1-be60-45ac05815dfe	ظƒطھظ„ط© ظ†طµ ظ…ظ†ط³ظ‚	Rich Text Block	rich-text	{}	{"body": "<p>The Syrian Soil Science Society (SSSSY) is dedicated to advancing soil science research, education, and professional development.</p>", "titleEn": "About Our Mission"}	{"bgType": "solid", "padding": "py-12", "maxWidth": "820px", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
3a554f0c-e6a7-47c3-86e5-be5ef3bb3719	ظ†طµ ط¨ط¹ظ…ظˆط¯ظٹظ†	Two-Column Text	image-text	{"imageRatio": "50-50", "imageRight": false}	{"body": "<p>We envision a Syria with sustainable and productive soils.</p>", "titleEn": "Our Vision", "imageUrl": "/images/soil.jpg"}	{"bgType": "solid", "padding": "py-16", "backgroundColor": "#FFF8E1"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
8b5651d2-aee8-43e9-aa34-0ffcf1395f4e	ظ„ط§ظپطھط© طµظˆط±ط©	Image Banner	image	{"contain": false}	{"altText": "SSSSY Banner", "imageUrl": "/images/banner.jpg"}	{"bgType": "none", "minHeight": "300px"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
3a89c06e-a9f9-48b2-a2f5-f486f459e0ab	ط®ط· ظپط§طµظ„	Divider Line	divider	{"style": "solid"}	{}	{"marginTop": "32px", "borderColor": "#e5e7eb", "borderWidth": "1px", "marginBottom": "32px"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
98d45496-2046-45ee-9deb-94669fd46e28	ظ…ط³ط§ظپط© â€“ طµط؛ظٹط±ط©	Spacer â€“ Small	spacer	{"height": "40px"}	{}	{"minHeight": "40px"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
add32679-8ed5-472b-9dd0-9ffb9d2b34d8	ظ…ط³ط§ظپط© â€“ ظƒط¨ظٹط±ط©	Spacer â€“ Large	spacer	{"height": "80px"}	{}	{"minHeight": "80px"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
33bdd409-87ad-4bb6-ac9f-5a5401d726cb	ط®ط±ظٹط·ط© ط§ظ„ظ…ظˆظ‚ط¹	Location Map	map	{"zoom": 13, "provider": "osm"}	{"lat": "33.5138", "lng": "36.2765", "address": "Damascus, Syria", "titleEn": "Find Us"}	{"bgType": "solid", "padding": "py-12", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
fee557c1-85da-4fa6-ad6e-3f2407359ed7	ط£ظƒظˆط±ط¯ظٹظˆظ†	Accordion	accordion	{"multiple": false}	{"items": [{"body": "Content for section one", "titleEn": "Section One"}, {"body": "Content for section two", "titleEn": "Section Two"}], "titleEn": "Expandable Content"}	{"bgType": "solid", "padding": "py-12", "maxWidth": "860px", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
33904e74-d2a5-4116-a556-d1b0897d29fe	ط¹ظ„ط§ظ…ط§طھ ط§ظ„طھط¨ظˆظٹط¨	Tabs Panel	tabs	{"style": "underline"}	{"items": [{"body": "Overview content here", "titleEn": "Overview"}, {"body": "Details content here", "titleEn": "Details"}]}	{"bgType": "solid", "padding": "py-12", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
e9f199bf-8c8b-43fe-9eb2-e266fa754bab	ظ…ط¬ظ…ظˆط¹ط© ط¨ط·ط§ظ‚ط§طھ â€“ 3 ط£ط¹ظ…ط¯ط©	Card Group â€“ 3 Cols	card-group	{"columns": 3}	{"items": [{"icon": "Microscope", "descEn": "Cutting-edge soil studies", "titleEn": "Research"}, {"icon": "BookOpen", "descEn": "Workshops and courses", "titleEn": "Education"}, {"icon": "Users", "descEn": "Connect with peers", "titleEn": "Networking"}], "titleEn": "Our Services"}	{"bgType": "solid", "padding": "py-16", "textAlign": "center", "backgroundColor": "#f7f8fa"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
6a42f1be-7644-40ab-b8ea-954cb950e3f2	ط¨ط·ط§ظ‚ط© ظ…ظٹط²ط© ظپط±ط¯ظٹط©	Card â€“ Single Feature	card	{"elevated": true}	{"btnUrl": "/jobs", "descEn": "Apply for funding for your soil science research project.", "titleEn": "Research Grant Program", "btnLabel": "Apply Now", "imageUrl": "/images/research.jpg"}	{"bgType": "solid", "padding": "py-8", "boxShadow": "0 4px 20px rgba(0,0,0,0.08)", "borderRadius": "12px", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
20f86654-f412-4037-b63e-a960426d553f	ط±ظˆط§ط¨ط· ط§ظ„طھظˆط§طµظ„ ط§ظ„ط§ط¬طھظ…ط§ط¹ظٹ	Social Media Links	social-share	{"size": "md", "style": "icons"}	{"twitter": "https://twitter.com/ssssy", "facebook": "https://facebook.com/ssssy", "linkedin": "https://linkedin.com/company/ssssy"}	{"bgType": "solid", "textAlign": "center", "paddingTop": "24px", "paddingBottom": "24px", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
1657192a-4ad9-49ab-9fa3-d1458b3b35fe	ط´ط±ظٹط· ط§ظ„ط¨ط­ط«	Search Bar	search	{"placeholder": "Search articles, events, publications..."}	{"titleEn": "Find What You Need"}	{"bgType": "solid", "maxWidth": "700px", "textAlign": "center", "paddingTop": "40px", "paddingBottom": "40px", "backgroundColor": "#f7f8fa"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
54164de2-8d9c-4866-bde5-81eeb70ca8e3	ط¯ظ„ظٹظ„ ط§ظ„ط£ط¹ط¶ط§ط،	Members Directory	members-directory	{"columns": 4, "maxItems": 8, "dataSource": "board-members"}	{"btnUrl": "/members", "titleEn": "Board of Directors", "btnLabel": "View All Members"}	{"bgType": "solid", "padding": "py-16", "backgroundColor": "#ffffff"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
2756e4cd-b7fb-4cf3-9576-49902b9844ce	ظ‚ط§ط¦ظ…ط© ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ	Publications List	publications-list	{"style": "list", "maxItems": 5, "dataSource": "latest-articles"}	{"btnUrl": "/publications", "titleEn": "Recent Publications", "btnLabel": "Browse All"}	{"bgType": "solid", "padding": "py-16", "backgroundColor": "#f7f8fa"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
1ee63f47-d45c-453d-8f55-aeddb0a18015	ظ„ط§ظپطھط© ط¥ط¹ظ„ط§ظ†	Announcement Banner	banner	{"closeable": true}	{"btnUrl": "/events", "message": "Annual conference registration is now open!", "btnLabel": "Register"}	{"color": "#ffffff", "bgType": "solid", "textAlign": "center", "paddingTop": "12px", "paddingBottom": "12px", "backgroundColor": "#558B2F"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
0c757119-cfb1-4c78-b92b-921920c387e9	طھط¶ظ…ظٹظ† ظپظٹط¯ظٹظˆ	Video Embed	video-embed	{"provider": "youtube", "responsive": true}	{"titleEn": "Introduction to SSSSY", "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"}	{"bgType": "solid", "padding": "py-8", "textAlign": "center", "backgroundColor": "#000000"}	f	\N	2026-07-11 03:44:17.06516	2026-07-11 03:44:17.06516
\.


--
-- TOC entry 6267 (class 0 OID 68853)
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
-- TOC entry 6237 (class 0 OID 68221)
-- Dependencies: 238
-- Data for Name: contact_submissions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.contact_submissions (id, name, email, subject, message, is_read, created_at, phone, read_by, replied_at) FROM stdin;
\.


--
-- TOC entry 6283 (class 0 OID 69256)
-- Dependencies: 284
-- Data for Name: content_approval_log; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_approval_log (id, content_type, content_id, old_status, new_status, comments, action_by, created_at) FROM stdin;
\.


--
-- TOC entry 6226 (class 0 OID 67968)
-- Dependencies: 227
-- Data for Name: content_items; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_items (id, title_ar, title_en, slug, excerpt, body, content_type, status, author_id, reviewer_id, publisher_id, category_id, featured_image, is_featured, is_pinned, is_member_only, published_at, scheduled_at, archived_at, view_count, meta_title, meta_description, meta_keywords, og_image_url, og_title, og_description, version, created_at, updated_at, deleted_at, body_ar, body_en, excerpt_ar) FROM stdin;
5b0ccf68-7388-4f24-882b-22693958e8d4	ط¨ط­ط« ط¬ط¯ظٹط¯ ظٹظƒط´ظپ طھط£ط«ظٹط± ط§ظ„ط¬ظپط§ظپ ط¹ظ„ظ‰ طھط±ط¨ط© ظˆط§ط¯ظٹ ط§ظ„ظپط±ط§طھ	New Research Reveals Drought Impact on Euphrates Valley Soils	new-research-drought-impact-euphrates-valley-soils	A recent study published by SSSY researchers documents significant changes in soil organic matter and microbial diversity in the Euphrates Valley region over the past decade, highlighting urgent conservation needs.	\N	NEWS	PUBLISHED	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	\N	\N	f	f	f	2026-07-08 06:10:22.751245	\N	\N	0	\N	\N	\N	\N	\N	\N	1	2026-07-08 06:10:22.751245	2026-07-15 06:10:22.751245	\N	\N	\N	A recent study published by SSSY researchers documents significant changes in soil organic matter and microbial diversity in the Euphrates Valley region over the past decade, highlighting urgent conservation needs.
ca0704cb-3abb-4677-82e4-9f707d414e9e	ط§طھظپط§ظ‚ظٹط© طھط¹ط§ظˆظ† ظ…ط¹ ظ…ظ†ط¸ظ…ط© ط§ظ„ط£ط؛ط°ظٹط© ظˆط§ظ„ط²ط±ط§ط¹ط© ظ„ظ„ط£ظ…ظ… ط§ظ„ظ…طھط­ط¯ط©	SSSY Signs Cooperation Agreement with FAO	sssy-signs-cooperation-agreement-fao	The Soil Science Society of Syria has signed a memorandum of understanding with the Food and Agriculture Organization of the United Nations to collaborate on soil mapping and sustainable land management programmes.	\N	NEWS	PUBLISHED	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	\N	\N	t	f	f	2026-07-01 06:10:22.751245	\N	\N	0	\N	\N	\N	\N	\N	\N	1	2026-07-01 06:10:22.751245	2026-07-15 06:10:22.751245	\N	\N	\N	The Soil Science Society of Syria has signed a memorandum of understanding with the Food and Agriculture Organization of the United Nations to collaborate on soil mapping and sustainable land management programmes.
d3b718ca-8e9b-4f7d-81c2-ed1556892260	طھظƒط±ظٹظ… ط£ط¹ط¶ط§ط، ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ظ…طھظ…ظٹط²ظٹظ† ظپظٹ ظ…ط¬ط§ظ„ ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط©	SSSY Recognises Outstanding Members in Soil Research	sssy-recognises-outstanding-members-soil-research	At the annual general assembly, three SSSY members received recognition awards for their exceptional contributions to soil science research, education, and field practice over the past year.	\N	NEWS	PUBLISHED	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	\N	\N	f	f	f	2026-06-24 06:10:22.751245	\N	\N	0	\N	\N	\N	\N	\N	\N	1	2026-06-24 06:10:22.751245	2026-07-15 06:10:22.751245	\N	\N	\N	At the annual general assembly, three SSSY members received recognition awards for their exceptional contributions to soil science research, education, and field practice over the past year.
814c0183-4bd1-4351-868a-b1d7991e2c40	ط§ظ„ط¬ظ…ط¹ظٹط© طھط·ظ„ظ‚ ظ…ط´ط±ظˆط¹ طھظ‚ظٹظٹظ… ط§ظ„طھط±ط¨ط© ط§ظ„ظˆط·ظ†ظٹ	Society Launches National Soil Assessment Project	society-launches-national-soil-assessment-project	The Soil Science Society of Syria has launched a comprehensive national project to assess soil health across all agricultural governorates, aiming to establish a baseline database for future research.		NEWS	PUBLISHED	6d6595c0-1835-42be-89a1-1a44b899141c	\N	\N	\N		t	f	f	2026-07-15 06:10:22.751245	\N	\N	0				\N	\N	\N	2	2026-07-15 06:10:22.751245	2026-07-29 21:12:41.37104	\N			ط£ط·ظ„ظ‚طھ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§ ظ…ط´ط±ظˆط¹ط§ظ‹ ظˆط·ظ†ظٹط§ظ‹ ط´ط§ظ…ظ„ط§ظ‹ ظ„طھظ‚ظٹظٹظ… طµط­ط© ط§ظ„طھط±ط¨ط© ظپظٹ ط¬ظ…ظٹط¹ ط§ظ„ظ…ط­ط§ظپط¸ط§طھ ط§ظ„ط²ط±ط§ط¹ظٹط©طŒ ط¨ظ‡ط¯ظپ ط¥ظ†ط´ط§ط، ظ‚ط§ط¹ط¯ط© ط¨ظٹط§ظ†ط§طھ ط£ط³ط§ط³ظٹط© ظ„ظ„ط¨ط­ظˆط« ط§ظ„ظ…ط³طھظ‚ط¨ظ„ظٹط©.\n
\.


--
-- TOC entry 6276 (class 0 OID 69081)
-- Dependencies: 277
-- Data for Name: content_strings; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_strings (id, string_key, value_en, value_ar, string_group, description, created_at, updated_at) FROM stdin;
e29726bf-252b-4290-8bfa-411416d1599b	nav.home	Home	ط§ظ„ط±ط¦ظٹط³ظٹط©	navigation	Navigation: Home link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
bc04e700-0b68-443f-877a-ab4c58ec3e1c	nav.about	About	ظ…ظ† ظ†ط­ظ†	navigation	Navigation: About link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
856758f7-c2a2-4bb8-8fbc-7c261029160b	nav.news	News	ط§ظ„ط£ط®ط¨ط§ط±	navigation	Navigation: News link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
a80078f5-0b97-4f84-b5d2-dfc13446aa35	nav.events	Events	ط§ظ„ظپط¹ط§ظ„ظٹط§طھ	navigation	Navigation: Events link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
4419994f-400b-468e-a307-33811201ebd7	nav.jobs	Jobs	ط§ظ„ظˆط¸ط§ط¦ظپ	navigation	Navigation: Jobs link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
e114b3e3-0eba-4cd6-8394-95e02744ddb4	nav.contact	Contact	ط§طھطµظ„ ط¨ظ†ط§	navigation	Navigation: Contact link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
8ec35fca-7890-478d-8543-0db16968230e	nav.publications	Publications	ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ	navigation	Navigation: Publications link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
86c95b4b-7dc9-4a58-8c64-b4b89e1e6685	nav.membership	Membership	ط§ظ„ط¹ط¶ظˆظٹط©	navigation	Navigation: Membership link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
9f45e994-213c-4af4-862d-0ea96e817172	nav.login	Login	طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„	navigation	Navigation: Login link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
e993a31d-16d2-42aa-a3da-b3c4a1b3284e	footer.quick_links	Quick Links	ط±ظˆط§ط¨ط· ط³ط±ظٹط¹ط©	footer	Footer: Quick Links heading	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
60df72c9-f37c-4212-8b7e-11bef39bcd74	footer.contact_info	Contact Info	ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط§طھطµط§ظ„	footer	Footer: Contact Info heading	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
522d479f-4853-4b59-985f-077aaecf5fdc	footer.address	Damascus, Syria	ط¯ظ…ط´ظ‚طŒ ط³ظˆط±ظٹط§	footer	Footer: Address	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
1ad04518-ecfe-4968-8797-6b1dc5f7f9d8	footer.phone	+963 11 234 5678	+963 11 234 5678	footer	Footer: Phone	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
f9fdb20c-4c0e-4023-8b91-ea70b8ba847d	site.description	Advancing soil science research, education, and sustainable land management in Syria.	طھط¹ط²ظٹط² ط£ط¨ط­ط§ط« ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ ظپظٹ ط³ظˆط±ظٹط§.	site	Site description for SEO / JSON-LD	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
7019a59d-5bb4-4342-a905-be00da7b4735	general.read_more	Read More	ط§ظ‚ط±ط£ ط§ظ„ظ…ط²ظٹط¯	general	General: Read more link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
82afa9e4-b82d-418c-8df5-cbf087320638	general.view_all	View All	ط¹ط±ط¶ ط§ظ„ظƒظ„	general	General: View all link	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
0cb82a88-b329-4a25-8163-1cc01b93d299	general.loading	Loading...	ط¬ط§ط± ط§ظ„طھط­ظ…ظٹظ„...	general	General: Loading text	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
d7c10169-3183-41ab-bdb6-984447690cfa	general.error	Something went wrong	ط­ط¯ط« ط®ط·ط£ ظ…ط§	general	General: Error message	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
69f1cbc8-954a-4cab-a68e-2e023c86a449	general.search	Search	ط¨ط­ط«	general	General: Search label	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
faaa3fcc-f5c7-4e7e-bb15-b8160d348de1	general.no_results	No results found	ظ„ط§ طھظˆط¬ط¯ ظ†طھط§ط¦ط¬	general	General: No results	2026-07-09 10:39:19.105637	2026-07-09 10:39:19.105637
2cd4f795-21fb-4aaa-a55b-d86106d8fb57	footer.about_heading	About SSSS	ط¹ظ† ط§ظ„ط¬ظ…ط¹ظٹط©	footer	Footer: About heading	2026-07-09 10:39:19.105637	2026-07-14 13:25:16.488875
beaa83e9-8adf-4002-bbec-b570cbc4dd06	footer.about_text	The Syrian Soil Science Society (SSSS) is dedicated to advancing soil science and sustainable land management in Syria.	طھظƒط±ط³ ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط¬ظ‡ظˆط¯ظ‡ط§ ظ„طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ ظپظٹ ط³ظˆط±ظٹط§.	footer	Footer: About description	2026-07-09 10:39:19.105637	2026-07-14 13:25:16.488875
dbdcfb37-82ed-4d82-8807-1833d229383a	footer.copyright	Syrian Soil Science Society (SSSS). All rights reserved.	ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©. ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ‚ ظ…ط­ظپظˆط¸ط©.	footer	Footer: Copyright text	2026-07-09 10:39:19.105637	2026-07-14 13:25:16.488875
e6d3d1ed-b9d3-4ded-bc7b-9e6d50bd864b	site.name	SSSS	ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©	site	Site name	2026-07-09 10:39:19.105637	2026-07-14 13:25:16.488875
5056c17e-ace4-4518-b31a-465f08b519b4	site.short_name	SSSS	ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©	site	Site short name / brand	2026-07-09 10:39:19.105637	2026-07-14 13:25:16.488875
f5201838-4d6a-40b2-9eed-9d6cd6694722	footer.email	info@ssssy.org	info@ssssy.org	footer	Footer: Email	2026-07-09 10:39:19.105637	2026-07-14 13:43:28.257423
fba4f16c-cb15-4e9a-9a67-d192108fae5d	about.overview.text	The Syrian Soil Science Society (SSSS) is a non-profit professional organization dedicated to advancing soil science research, education, and sustainable land management in Syria.	ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© (ط¬.ط³.ط¹.طھ) ظ‡ظٹ ظ…ظ†ط¸ظ…ط© ظ…ظ‡ظ†ظٹط© ط؛ظٹط± ط±ط¨ط­ظٹط© ظ…ظƒط±ط³ط© ظ„طھط¹ط²ظٹط² ط£ط¨ط­ط§ط« ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ ظپظٹ ط³ظˆط±ظٹط§.	about	About page overview text	2026-07-09 16:57:53.899677	2026-07-14 13:25:16.488875
f7d71caf-6465-45c6-8e5c-677ac4d9b2b4	about.hero.title	About the Syrian Soil Science Society	ط¹ظ† ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©	about	About page hero title	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
03786047-08ee-47ca-ba6b-a67cf394e6e4	about.overview.title	Overview	ظ†ط¸ط±ط© ط¹ط§ظ…ط©	about	About page overview heading	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
3da31491-7bdc-42f0-83ac-1a15733d33e9	publications.title	Publications	ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ	publications	Publications page main title	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
e48af096-143e-43b7-84a5-3b1056d4c744	contact.info.address	Address	ط§ظ„ط¹ظ†ظˆط§ظ†	contact	Contact page address heading	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
cbc801bd-eedc-48cf-a17c-3b9434915413	contact.info.email	Email	ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ	contact	Contact page email heading	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
d9eb8e4e-9dbe-4ce7-bd0e-fe8dedf1d0cc	contact.info.phone	Phone	ط§ظ„ظ‡ط§طھظپ	contact	Contact page phone heading	2026-07-09 16:57:53.899677	2026-07-09 16:57:53.899677
98d7a8e5-01c2-430f-8b0a-d0f05772fff9	contact.form.namePlaceholder	Your name	ط§ط³ظ…ظƒ	contact	Name input placeholder	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
68c4b339-d5ab-4638-a5e1-dcf57dd529bd	contact.form.emailPlaceholder	Your email	ط¨ط±ظٹط¯ظƒ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ	contact	Email input placeholder	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
293e5e8a-270a-41f4-af4f-c04a952056e0	contact.form.subjectPlaceholder	Subject	ط§ظ„ظ…ظˆط¶ظˆط¹	contact	Subject input placeholder	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
b4fe1bb5-af59-428f-8f1d-39ad8b0b3f24	contact.form.messagePlaceholder	Write your message here...	ط§ظƒطھط¨ ط±ط³ط§ظ„طھظƒ ظ‡ظ†ط§...	contact	Message textarea placeholder	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
e93010f5-eda3-49fa-aa3d-233f18e9a5dd	contact.success.title	Message Sent!	طھظ… ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط©!	contact	Success message title	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
f0d1f783-b2c6-4310-a2f5-b1409e326361	contact.success.text	Thank you for reaching out. We will get back to you as soon as possible.	ط´ظƒط±ظ‹ط§ ظ„طھظˆط§طµظ„ظƒ ظ…ط¹ظ†ط§. ط³ظ†ط¹ظˆط¯ ط¥ظ„ظٹظƒ ظپظٹ ط£ظ‚ط±ط¨ ظˆظ‚طھ ظ…ظ…ظƒظ†.	contact	Success message text	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
0a7f6096-378d-42e8-8670-e1c21d9138e0	contact.success.another	Send Another Message	ط¥ط±ط³ط§ظ„ ط±ط³ط§ظ„ط© ط£ط®ط±ظ‰	contact	Send another message button	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
6e6bbbd6-a56a-41d2-a7e7-873ee9204358	contact.info.title	Contact Information	ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط§طھطµط§ظ„	contact	Contact info section heading	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
383db01a-3528-40dd-8580-15c5c269f474	contact.info.description	Get in touch with us through any of the channels below.	طھظˆط§طµظ„ ظ…ط¹ظ†ط§ ظ…ظ† ط®ظ„ط§ظ„ ط£ظٹ ظ…ظ† ط§ظ„ظ‚ظ†ظˆط§طھ ط£ط¯ظ†ط§ظ‡.	contact	Contact info description	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
ed00cb99-9cc0-4e4d-b90f-14a5c092a0c4	contact.info.addressLabel	Address	ط§ظ„ط¹ظ†ظˆط§ظ†	contact	Address label	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
37a18b6d-f64f-4232-8eba-f88163d23127	contact.info.phoneLabel	Phone	ط§ظ„ظ‡ط§طھظپ	contact	Phone label	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
a74712d0-475f-4692-bfc5-46f8fe938a8b	contact.info.emailLabel	Email	ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ	contact	Email label	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
50bc8a57-b307-4703-941a-e44019c4fc6d	contact.email	info@ssssy.org	info@ssssy.org	contact	Email address	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
beda272a-6e14-404c-b5a8-91ab15fe2b60	social.facebookUrl	https://facebook.com/ssssy	https://facebook.com/ssssy	social	Facebook profile URL	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
a17a24b2-9b53-4ee7-9ae1-83b5395468d9	social.twitterUrl	https://twitter.com/ssssy	https://twitter.com/ssssy	social	Twitter/X profile URL	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
59cf9d1c-9460-4725-8dd2-819bf8998839	social.linkedinUrl	https://linkedin.com/company/ssssy	https://linkedin.com/company/ssssy	social	LinkedIn company URL	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
8cf074c4-6202-4dd2-89a9-93f44a5b3e6f	social.youtubeUrl	https://youtube.com/@ssssy	https://youtube.com/@ssssy	social	YouTube channel URL	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
62518e65-8b0c-47d2-b6b5-2a10f9a8f751	contact.info.workingHoursLabel	Working Hours	ط³ط§ط¹ط§طھ ط§ظ„ط¹ظ…ظ„	contact	Working hours label	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
4e53755c-4828-41d9-a087-66ab20576608	contact.address	Damascus, Syria	ط¯ظ…ط´ظ‚طŒ ط³ظˆط±ظٹط§	contact	Address value	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
dc57c753-74fe-4021-86e5-62dcb0dc18c8	contact.phone	+963 11 234 5678	+963 11 234 5678	contact	Phone number	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
28eca782-af5b-4522-bde6-97986757ff73	contact.workingHours	Sunday - Thursday, 9:00 AM - 5:00 PM	ط§ظ„ط£ط­ط¯ - ط§ظ„ط®ظ…ظٹط³طŒ 9:00 طµط¨ط§ط­ظ‹ط§ - 5:00 ظ…ط³ط§ط،ظ‹	contact	Working hours	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
cade67c1-d7dd-4dcb-a3f1-6552b5febbcf	contact.map.placeholder	Google Maps Placeholder	ظ…ظƒط§ظ† ط®ط±ظٹط·ط© ط¬ظˆط¬ظ„	contact	Map placeholder text	2026-07-09 18:07:24.037676	2026-07-09 18:49:23.383008
3e7e8ac7-d76b-4f97-ba76-e8945a934a19	social.title	Follow Us	طھط§ط¨ط¹ظ†ط§	social	Social media section title	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
8e453f5d-f56c-4f6d-a42c-3e7e5d1e4af7	about.overview.paragraph3	The society is committed to building capacity among young scientists, fostering interdisciplinary research, and raising public awareness about the critical role of soil in food security, environmental sustainability, and climate resilience. Over the past decade, SSSS has grown into a respected institution both nationally and regionally, with a network of over 500 members across Syria and the Middle East.	طھظ„طھط²ظ… ط§ظ„ط¬ظ…ط¹ظٹط© ط¨ط¨ظ†ط§ط، ط§ظ„ظ‚ط¯ط±ط§طھ ط¨ظٹظ† ط§ظ„ط¹ظ„ظ…ط§ط، ط§ظ„ط´ط¨ط§ط¨ ظˆطھط¹ط²ظٹط² ط§ظ„ط¨ط­ط« ظ…طھط¹ط¯ط¯ ط§ظ„طھط®طµطµط§طھ ظˆط²ظٹط§ط¯ط© ط§ظ„ظˆط¹ظٹ ط§ظ„ط¹ط§ظ… ط¨ط§ظ„ط¯ظˆط± ط§ظ„ط­ط§ط³ظ… ظ„ظ„طھط±ط¨ط© ظپظٹ ط§ظ„ط£ظ…ظ† ط§ظ„ط؛ط°ط§ط¦ظٹ ظˆط§ظ„ط§ط³طھط¯ط§ظ…ط© ط§ظ„ط¨ظٹط¦ظٹط© ظˆظ…ظ‚ط§ظˆظ…ط© ط§ظ„ظ…ظ†ط§ط®. ط¹ظ„ظ‰ ظ…ط¯ط§ط± ط§ظ„ط¹ظ‚ط¯ ط§ظ„ظ…ط§ط¶ظٹطŒ ظ†ظ…طھ ط§ظ„ط¬ظ…ط¹ظٹط© ظ„طھطµط¨ط­ ظ…ط¤ط³ط³ط© ظ…ط­طھط±ظ…ط© ط¹ظ„ظ‰ ط§ظ„ظ…ط³طھظˆظ‰ ط§ظ„ظˆط·ظ†ظٹ ظˆط§ظ„ط§ظ‚ظ„ظٹظ…ظٹطŒ ظ…ط¹ ط´ط¨ظƒط© طھط¶ظ… ط£ظƒط«ط± ظ…ظ† 500 ط¹ط¶ظˆ ظپظٹ ط³ظˆط±ظٹط§ ظˆط§ظ„ط´ط±ظ‚ ط§ظ„ط£ظˆط³ط·.	about	About overview third paragraph	2026-07-10 13:46:36.93599	2026-07-14 13:25:16.488875
b8238052-8627-4e14-8ac3-1dbab8d02702	about.hero.arabicHeading	ظ…ظ† ظ†ط­ظ†	ظ…ظ† ظ†ط­ظ†	about	About page hero arabic heading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
f8ec222d-5ad0-4e28-b1b7-bfc78cc2ae8c	about.visionMission.heading	Vision, Mission & Objectives	ط§ظ„ط±ط¤ظٹط© ظˆط§ظ„ط±ط³ط§ظ„ط© ظˆط§ظ„ط£ظ‡ط¯ط§ظپ	about	Vision mission section heading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
18a1c95e-912e-4e2e-916e-70f02cdb2658	about.visionMission.subheading	Our guiding principles that shape every initiative and program we undertake.	ظ…ط¨ط§ط¯ط¦ظ†ط§ ط§ظ„ط¥ط±ط´ط§ط¯ظٹط© ط§ظ„طھظٹ طھط´ظƒظ„ ظƒظ„ ظ…ط¨ط§ط¯ط±ط© ظˆط¨ط±ظ†ط§ظ…ط¬ ظ†ظ†ظپط°ظ‡.	about	Vision mission section subheading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
dd8a6f78-bcb4-4f67-a045-e0a62631b497	about.visionMission.visionTitle	Our Vision	ط±ط¤ظٹطھظ†ط§	about	Vision card title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
e770cc00-26f6-42d9-af2d-3555066dc98c	about.visionMission.visionDescription	To be the leading scientific authority on soil science in Syria and the region, fostering a future where soils are managed sustainably for the benefit of people and the environment.	ط£ظ† ظ†ظƒظˆظ† ط§ظ„ظ…ط±ط¬ط¹ ط§ظ„ط¹ظ„ظ…ظٹ ط§ظ„ط±ط§ط¦ط¯ ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§ ظˆط§ظ„ظ…ظ†ط·ظ‚ط©طŒ ظ„ط®ظ„ظ‚ ظ…ط³طھظ‚ط¨ظ„ طھظڈط¯ط§ط± ظپظٹظ‡ ط§ظ„طھط±ط¨ط© ط¨ط´ظƒظ„ ظ…ط³طھط¯ط§ظ… ظ„ظپط§ط¦ط¯ط© ط§ظ„ط¨ط´ط± ظˆط§ظ„ط¨ظٹط¦ط©.	about	Vision card description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
3993296d-1a41-4f7d-8aa7-2814eccdebdf	about.visionMission.missionTitle	Our Mission	ط±ط³ط§ظ„طھظ†ط§	about	Mission card title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
8f02b22b-603b-4b7f-ab97-2ad746ec80d4	about.visionMission.missionDescription	To advance soil science through research, education, and advocacy, promoting sustainable land use practices that enhance agricultural productivity, environmental quality, and human well-being.	طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ط¨ط­ط« ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„ط¯ط¹ظˆط©طŒ ظˆطھط¹ط²ظٹط² ظ…ظ…ط§ط±ط³ط§طھ ط§ظ„ط§ط³طھط®ط¯ط§ظ… ط§ظ„ظ…ط³طھط¯ط§ظ… ظ„ظ„ط£ط±ط§ط¶ظٹ ط§ظ„طھظٹ طھط¹ط²ط² ط§ظ„ط¥ظ†طھط§ط¬ظٹط© ط§ظ„ط²ط±ط§ط¹ظٹط© ظˆط§ظ„ط¬ظˆط¯ط© ط§ظ„ط¨ظٹط¦ظٹط© ظˆط±ظپط§ظ‡ظٹط© ط§ظ„ط¨ط´ط±.	about	Mission card description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
59b23383-6628-4bd6-ad43-ce5c74e704ea	about.visionMission.objectivesTitle	Our Objectives	ط£ظ‡ط¯ط§ظپظ†ط§	about	Objectives card title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
140c3311-968e-4f0b-9871-edc6f1c0ad0a	about.visionMission.objectivesDescription	1) Promote soil research and innovation. 2) Facilitate knowledge exchange. 3) Support education and training. 4) Advocate for soil-friendly policies. 5) Build partnerships with national and international organizations.	1) طھط¹ط²ظٹط² ط§ظ„ط¨ط­ط« ظˆط§ظ„ط§ط¨طھظƒط§ط± ظپظٹ ط§ظ„طھط±ط¨ط©. 2) طھط³ظ‡ظٹظ„ طھط¨ط§ط¯ظ„ ط§ظ„ظ…ط¹ط±ظپط©. 3) ط¯ط¹ظ… ط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„طھط¯ط±ظٹط¨. 4) ط§ظ„ط¯ط¹ظˆط© ط¥ظ„ظ‰ ط³ظٹط§ط³ط§طھ طµط¯ظٹظ‚ط© ظ„ظ„طھط±ط¨ط©. 5) ط¨ظ†ط§ط، ط´ط±ط§ظƒط§طھ ظ…ط¹ ظ…ظ†ط¸ظ…ط§طھ ظˆط·ظ†ظٹط© ظˆط¯ظˆظ„ظٹط©.	about	Objectives card description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
d432fec3-e963-4205-b002-bdc7ef35cc1a	about.orgChart.heading	Organizational Structure	ط§ظ„ظ‡ظٹظƒظ„ ط§ظ„طھظ†ط¸ظٹظ…ظٹ	about	Organizational chart section heading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
61751ee1-3411-4209-ab04-49bb9ecbda52	about.orgChart.paragraph1	The society is governed by a General Assembly comprising all active members, which elects a Board of Directors for a four-year term. The Board is responsible for setting strategic direction, overseeing operations, and managing the society's finances and programs.	طھظڈط¯ط§ط± ط§ظ„ط¬ظ…ط¹ظٹط© ظ…ظ† ظ‚ط¨ظ„ ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط¹ط§ظ…ط© ط§ظ„طھظٹ طھط´ظ…ظ„ ط¬ظ…ظٹط¹ ط§ظ„ط£ط¹ط¶ط§ط، ط§ظ„ظ†ط´ط·ظٹظ†طŒ ظˆط§ظ„طھظٹ طھط®طھط§ط± ظ…ط¬ظ„ط³ ط¥ط¯ط§ط±ط© ظ„ظ…ط¯ط© ط£ط±ط¨ط¹ ط³ظ†ظˆط§طھ. ظٹطھط­ظ…ظ„ ط§ظ„ظ…ط¬ظ„ط³ ط§ظ„ظ…ط³ط¤ظˆظ„ظٹط© ط¹ظ† ظˆط¶ط¹ ط§ظ„طھظˆط¬ظ‡ ط§ظ„ط§ط³طھط±ط§طھظٹط¬ظٹ ظˆط§ظ„ظ…ط±ط§ظ‚ط¨ط© ظ„ظ„ط¹ظ…ظ„ظٹط§طھ ظˆط¥ط¯ط§ط±ط© ط´ط¤ظˆظ† ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ظ…ط§ظ„ظٹط© ظˆط§ظ„ط¨ط±ط§ظ…ط¬.	about	Organizational chart section first paragraph	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
9c223975-09ed-48f1-87f3-497e6cefc5f1	about.hero.heading	About Us	ط¹ظ† ط§ظ„ط¬ظ…ط¹ظٹط©	about	About hero main heading	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
ccead667-4b3c-4352-ae83-f7d113814145	about.overview.heading	Society Overview	ظ†ط¸ط±ط© ط¹ط§ظ…ط© ط¹ظ„ظ‰ ط§ظ„ط¬ظ…ط¹ظٹط©	about	About overview heading	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
08a3969f-3196-4337-900e-d7b362266961	about.orgChart.paragraph2	The Board consists of a President, Vice President, Secretary, Treasurer, and several committee chairs representing key areas: Research & Publications, Education & Training, Events & Conferences, Membership & Outreach, and International Relations.	ظٹطھظƒظˆظ† ط§ظ„ظ…ط¬ظ„ط³ ظ…ظ† ط±ط¦ظٹط³ ظˆظ†ط§ط¦ط¨ ط±ط¦ظٹط³ ظˆط£ظ…ظٹظ† ظˆط£ظ…ظٹظ† ط§ظ„طµظ†ط¯ظˆظ‚ ظˆط±ط¤ط³ط§ط، ظ„ط¬ط§ظ† ط¹ط¯ظٹط¯ط© طھظ…ط«ظگظ‘ظ„ ط§ظ„ظ…ط¬ط§ظ„ط§طھ ط§ظ„ط±ط¦ظٹط³ظٹط©: ط§ظ„ط¨ط­ط« ظˆط§ظ„ظ…ظ†ط´ظˆط±ط§طھ ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„طھط¯ط±ظٹط¨ ظˆط§ظ„ظ…ظ†ط§ط³ط¨ط§طھ ظˆط§ظ„ظ…ط¤طھظ…ط±ط§طھ ظˆط§ظ„ط¹ط¶ظˆظٹط© ظˆط§ظ„طھظˆط¹ظٹط© ظˆط§ظ„ط¹ظ„ط§ظ‚ط§طھ ط§ظ„ط¯ظˆظ„ظٹط©.	about	Organizational chart section second paragraph	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
fdce00bd-8c01-40ff-bc32-a8bc30ebabc7	about.orgChart.paragraph3	Standing committees and working groups are formed as needed to address specific topics such as soil conservation, soil fertility, soil contamination, and remote sensing applications in soil science.	ظٹطھظ… طھط´ظƒظٹظ„ ط§ظ„ظ„ط¬ط§ظ† ط§ظ„ط¯ط§ط¦ظ…ط© ظˆظ…ط¬ظ…ظˆط¹ط§طھ ط§ظ„ط¹ظ…ظ„ ط­ط³ط¨ ط§ظ„ط­ط§ط¬ط© ظ„ظ…ط¹ط§ظ„ط¬ط© ظ…ظˆط§ط¶ظٹط¹ ظ…ط­ط¯ط¯ط© ظ…ط«ظ„ ط§ظ„ط­ظپط¸ ط¹ظ„ظ‰ ط§ظ„طھط±ط¨ط© ظˆطھظƒظˆظٹط± ط§ظ„طھط±ط¨ط© ظˆطھظ„ظˆط« ط§ظ„طھط±ط¨ط© ظˆطھط·ط¨ظٹظ‚ط§طھ ط§ظ„ط§ط³طھط´ط¹ط§ط± ط¹ظ† ط¨ط¹ط¯ ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©.	about	Organizational chart section third paragraph	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
cfc14d5b-db94-4194-9ba0-3878b325fb92	about.timeline.desc2008	SSSS was established by a group of soil scientists and researchers.	طھط£ط³ط³طھ ط§ظ„ط¬ظ…ط¹ظٹط© ظ…ظ† ظ‚ط¨ظ„ ظ…ط¬ظ…ظˆط¹ط© ظ…ظ† ط¹ظ„ظ…ط§ط، ظˆط¨ط§ط­ط«ظٹ ط§ظ„طھط±ط¨ط©.	about	Timeline 2008 description	2026-07-10 13:46:36.93599	2026-07-14 13:25:16.488875
f863c468-cb9a-49fa-814d-9bd8ede7ef04	about.timeline.subheading	Key milestones in the history of the Syrian Soil Science Society.	ط§ظ„ظ…ط±ط§ط­ظ„ ط§ظ„ط£ط³ط§ط³ظٹط© ظپظٹ طھط§ط±ظٹط® ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©.	about	Timeline section subheading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
6671aa29-0323-436c-acfe-1b7c4030859c	about.timeline.year2008	2008	2008	about	Timeline year 2008	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
b802b004-e37e-47e7-ba22-79bb5901aabd	about.timeline.title2008	Society Founded	طھط£ط³ظٹط³ ط§ظ„ط¬ظ…ط¹ظٹط©	about	Timeline 2008 title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
fec9b575-e10f-41c4-b7b3-b5f57fa03d00	about.timeline.year2012	2012	2012	about	Timeline year 2012	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
d1feb1ff-e8de-4360-b7b1-4c4b27b1460f	about.timeline.title2012	First Conference	ط§ظ„ظ…ط¤طھظ…ط± ط§ظ„ط£ظˆظ„	about	Timeline 2012 title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
ef36198b-1135-44a2-9131-993f00b60d2c	about.timeline.desc2012	The first national soil science conference was held in Damascus.	ط¹ظ‚ط¯ ط§ظ„ظ…ط¤طھظ…ط± ط§ظ„ظˆط·ظ†ظٹ ط§ظ„ط£ظˆظ„ ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط¯ظ…ط´ظ‚.	about	Timeline 2012 description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
00af6abc-6412-4dc2-a69d-cf8bab757f2d	about.timeline.year2018	2018	2018	about	Timeline year 2018	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
5ef7b0cb-8470-4389-9030-d87df06ed1a8	about.timeline.title2018	Research Journal	ظ…ط¬ظ„ط© ط§ظ„ط¨ط­ط«	about	Timeline 2018 title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
898d0e54-87a4-4689-8643-11bb09aa5a57	about.timeline.desc2018	Launched the Syrian Journal of Soil Science, a peer-reviewed publication.	ط¥طµط¯ط§ط± ط§ظ„ظ…ط¬ظ„ط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©طŒ ظˆظ‡ظٹ ظ…ظ†ط´ظˆط± ظ…ط­ظƒظ…ط©.	about	Timeline 2018 description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
fc2b7907-5cfc-4715-afec-eca386f2cbe0	about.timeline.year2024	2024	2024	about	Timeline year 2024	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
a4f5879b-e8c5-4019-9cb5-66d47e640b65	about.timeline.title2024	Digital Transformation	ط§ظ„طھط­ظˆظ„ ط§ظ„ط±ظ‚ظ…ظٹ	about	Timeline 2024 title	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
153f3a42-efe3-4355-8777-0318b39e3e81	about.timeline.desc2024	Migrated to a digital platform for publications, events, and member services.	ط§ظ„ط§ظ†طھظ‚ط§ظ„ ط¥ظ„ظ‰ ظ…ظ†طµط© ط±ظ‚ظ…ظٹط© ظ„ظ„ظ…ظ†ط´ظˆط±ط§طھ ظˆط§ظ„ظ…ظ†ط§ط³ط¨ط§طھ ظˆط®ط¯ظ…ط§طھ ط§ظ„ط£ط¹ط¶ط§ط،.	about	Timeline 2024 description	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
1bcb1912-899e-4c72-8a35-c37344d0cbac	about.documents.bylaws	SSSS Bylaws (PDF)	ظ„ظˆط§ط¦ط­ ط§ظ„ط¬ظ…ط¹ظٹط© (PDF)	about	Bylaws document	2026-07-10 13:46:36.93599	2026-07-14 13:25:16.488875
5a7704d3-d261-4081-bbda-f26276fbcff1	about.documents.annualReport	Annual Report 2024 (PDF)	ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ط³ظ†ظˆظٹ 2024 (PDF)	about	Annual report document	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
6dbc9d11-8f40-4169-8d8c-cccba7acb564	about.documents.membershipForm	Membership Form (PDF)	ظ†ظ…ظˆط°ط¬ ط§ظ„ط¹ط¶ظˆظٹط© (PDF)	about	Membership form document	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
74cdc40a-55df-4a13-a629-7dca65e60604	about.documents.strategicPlan	Strategic Plan 2024-2028 (PDF)	ط§ظ„ط®ط·ط© ط§ظ„ط§ط³طھط±ط§طھظٹط¬ظٹط© 2024-2028 (PDF)	about	Strategic plan document	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
b20b4407-6640-4c20-a036-7d6ef69abd26	about.documents.download	Download	طھظ†ط²ظٹظ„	about	Download button text	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
9eb3904c-c8f6-44ff-8e57-9446086fac10	about.gallery.subheading	A glimpse into our events, conferences, and field activities.	ظ†ط¸ط±ط© ط®ط§ط·ظپط© ط¹ظ„ظ‰ ظ…ظ†ط§ط³ط¨ط§طھظ†ط§ ظˆظ…ط¤طھظ…ط±ط§طھظ†ط§ ظˆط£ظ†ط´ط·طھظ†ط§ ط§ظ„ظ…ظٹط¯ط§ظ†ظٹط©.	about	Gallery section subheading	2026-07-10 13:46:36.93599	2026-07-10 13:46:36.93599
4b6ae3de-d192-4a02-8ba2-dbb26eb52328	about.hero.arabic_heading	ظ…ظ† ظ†ط­ظ†	ظ…ظ† ظ†ط­ظ†	about	About hero Arabic heading	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
f197ba54-a4d0-4e8a-9d6c-e08259d225fd	about.hero.description	Learn about our society, history, and commitment to soil science in Syria.	طھط¹ط±ظپ ط¹ظ„ظ‰ ط¬ظ…ط¹ظٹطھظ†ط§ ظˆطھط§ط±ظٹط®ظ†ط§ ظˆط§ظ„طھط²ط§ظ…ظ†ط§ ط¨ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§.	about	About hero description	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
a7beb9ba-97c2-4a0e-a0b3-9a4285baf1b5	about.overview.paragraph1	The Syrian Soil Science Society is a professional non-profit scientific organization dedicated to advancing soil science in Syria.	ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظ‡ظٹ ظ…ظ†ط¸ظ…ط© ط¹ظ„ظ…ظٹط© ظ…ظ‡ظ†ظٹط© ط؛ظٹط± ط±ط¨ط­ظٹط© ظ…ظƒط±ط³ط© ظ„طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§.	about	About overview paragraph 1	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
7aab3455-03bf-45bc-bf71-4ddcb62e4653	about.overview.paragraph2	The society brings together researchers, educators, students, and practitioners to exchange knowledge and promote sustainable soil management.	طھط¬ظ…ط¹ ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط¨ط§ط­ط«ظٹظ† ظˆط§ظ„ظ…ط¹ظ„ظ…ظٹظ† ظˆط§ظ„ط·ظ„ط§ط¨ ظˆط§ظ„ظ…ظ…ط§ط±ط³ظٹظ† ظ„طھط¨ط§ط¯ظ„ ط§ظ„ظ…ط¹ط±ظپط© ظˆطھط¹ط²ظٹط² ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„طھط±ط¨ط©.	about	About overview paragraph 2	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
a3054b57-e315-445b-bf51-9771bb48d859	about.vision_mission.heading	Vision, Mission & Objectives	ط§ظ„ط±ط¤ظٹط© ظˆط§ظ„ط±ط³ط§ظ„ط© ظˆط§ظ„ط£ظ‡ط¯ط§ظپ	about	About vision and mission heading	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
a2a8f561-e8a5-4df8-85e5-2fa4438813f9	about.org_chart.heading	Organizational Structure	ط§ظ„ظ‡ظٹظƒظ„ ط§ظ„طھظ†ط¸ظٹظ…ظٹ	about	About organizational chart heading	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
e8bfbc4e-69a4-4245-89e0-acfefaa2c1bc	about.timeline.heading	Our Journey	ط±ط­ظ„طھظ†ط§	about	About timeline heading	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
7b72f9f4-a7e1-4666-a803-1aec9bc4bbd1	about.documents.heading	Downloadable Documents	ط§ظ„ظ…ط³طھظ†ط¯ط§طھ ط§ظ„ظ‚ط§ط¨ظ„ط© ظ„ظ„طھظ†ط²ظٹظ„	about	About documents heading	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
08f4b745-8f3d-4687-a6ea-b7bf68bbea25	about.gallery.heading	Photo Gallery	ظ…ط¹ط±ط¶ ط§ظ„طµظˆط±	about	About gallery heading	2026-07-10 13:46:36.93599	2026-07-10 16:38:23.795489
559e98fe-c876-4e59-aeb7-32f78fee9da4	contact.hero.title	Contact Us	ط§طھطµظ„ ط¨ظ†ط§	contact	Contact hero title	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
190693cb-45ed-48c1-9cac-605f707569d7	contact.form.title	Send us a message	ط£ط±ط³ظ„ ظ„ظ†ط§ ط±ط³ط§ظ„ط©	contact	Contact form title	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
fc679ef5-9af0-427d-96d5-d67fed142a50	contact.form.name_placeholder	Your Name	ط§ط³ظ…ظƒ	contact	Contact form name placeholder	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
3c742c74-e5ec-4385-8d41-e9cdda4e3d46	contact.form.email_placeholder	Your Email	ط¨ط±ظٹط¯ظƒ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ	contact	Contact form email placeholder	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
6434feaa-0489-46c9-bd98-d3010b4b633d	contact.form.subject_placeholder	Subject	ط§ظ„ظ…ظˆط¶ظˆط¹	contact	Contact form subject placeholder	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
e7fc6116-21f8-466f-88d7-d6b80af9c4a4	contact.form.message_placeholder	Your Message	ط±ط³ط§ظ„طھظƒ	contact	Contact form message placeholder	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
c91bfde8-f024-47d8-b098-7695ccdbb086	contact.form.submit	Send Message	ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط©	contact	Contact form submit button	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
7c3d4736-80a9-4be6-a6b1-17e891ca722d	board.hero.title	Board Members	ط£ط¹ط¶ط§ط، ط§ظ„ظ…ط¬ظ„ط³	board	Board hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
1eef1efc-6b4f-477e-8f61-670f84008c19	board.hero.subtitle	Meet the leadership of the Syrian Soil Science Society.	طھط¹ط±ظپ ط¹ظ„ظ‰ ظ‚ظٹط§ط¯ط© ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©.	board	Board hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
275dd2ae-53fb-43dd-9b3b-ba2c2f0571b4	events.hero.title	Events	ط§ظ„ظپط¹ط§ظ„ظٹط§طھ	events	Events hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
96965014-e165-4c0c-813c-883e1c7ab2d4	events.hero.subtitle	Explore conferences, workshops, seminars, and training opportunities.	ط§ط³طھظƒط´ظپ ط§ظ„ظ…ط¤طھظ…ط±ط§طھ ظˆظˆط±ط´ ط§ظ„ط¹ظ…ظ„ ظˆط§ظ„ظ†ط¯ظˆط§طھ ظˆط§ظ„ط¨ط±ط§ظ…ط¬ ط§ظ„طھط¯ط±ظٹط¨ظٹط©.	events	Events hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
d53f675c-358f-4279-a21a-37967fed288b	jobs.hero.title	Jobs	ط§ظ„ظˆط¸ط§ط¦ظپ	jobs	Jobs hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
04cbe221-c2d2-470a-b59c-31565e7858dc	members.hero.title	Members	ط§ظ„ط£ط¹ط¶ط§ط،	members	Members hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
63ab7c91-86aa-415e-a40b-0d2683d9fe9b	members.hero.subtitle	Browse the society member directory and public profiles.	طھطµظپط­ ط¯ظ„ظٹظ„ ط§ظ„ط£ط¹ط¶ط§ط، ظˆط§ظ„ظ…ظ„ظپط§طھ ط§ظ„ط¹ط§ظ…ط©.	members	Members hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
9df9b2d4-511b-4ac1-b043-d837693b44dd	news.hero.title	News & Announcements	ط§ظ„ط£ط®ط¨ط§ط± ظˆط§ظ„ط¥ط¹ظ„ط§ظ†ط§طھ	news	News hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
cbbadb69-c536-434a-98f3-060d6beb2612	news.hero.subtitle	Read the latest news, articles, and announcements from the society.	ط§ظ‚ط±ط£ ط¢ط®ط± ط§ظ„ط£ط®ط¨ط§ط± ظˆط§ظ„ظ…ظ‚ط§ظ„ط§طھ ظˆط§ظ„ط¥ط¹ظ„ط§ظ†ط§طھ ظ…ظ† ط§ظ„ط¬ظ…ط¹ظٹط©.	news	News hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
6cab16ce-5b02-4e4c-8678-d41a01024e74	newsletter.hero.title	Stay Connected	ط§ط¨ظ‚ ط¹ظ„ظ‰ طھظˆط§طµظ„	newsletter	Newsletter hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
3725e1e8-ce9f-41b4-928c-2b00b1f2e843	newsletter.hero.subtitle	Subscribe to receive news, events, and updates from the society.	ط§ط´طھط±ظƒ ظ„طھطµظ„ظƒ ط¢ط®ط± ط§ظ„ط£ط®ط¨ط§ط± ظˆط§ظ„ظپط¹ط§ظ„ظٹط§طھ ظˆط§ظ„طھط­ط¯ظٹط«ط§طھ ظ…ظ† ط§ظ„ط¬ظ…ط¹ظٹط©.	newsletter	Newsletter hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
648e7f4d-2000-48bc-b3ec-951461c8fe6b	president.hero.title	Message from the President	ط±ط³ط§ظ„ط© ط§ظ„ط±ط¦ظٹط³	president	President hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
d7b8668c-d8c3-4f74-949c-39dffcf8fc78	president.hero.subtitle	A word from the society president about our mission and future direction.	ظƒظ„ظ…ط© ظ…ظ† ط±ط¦ظٹط³ ط§ظ„ط¬ظ…ط¹ظٹط© ط­ظˆظ„ ط±ط³ط§ظ„طھظ†ط§ ظˆطھظˆط¬ظ‡ط§طھظ†ط§ ط§ظ„ظ…ط³طھظ‚ط¨ظ„ظٹط©.	president	President hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
db791b1c-6729-4feb-a912-8e9124cab0de	publications.hero.title	Publications	ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ	publications	Publications hero title	2026-07-09 16:57:53.899677	2026-07-10 16:38:23.795489
cbe4580c-afd9-4c92-a907-f52ec1ed4bad	publications.hero.subtitle	Explore research papers, reports, and knowledge resources published by the society.	ط§ط³طھظƒط´ظپ ط§ظ„ط£ط¨ط­ط§ط« ظˆط§ظ„طھظ‚ط§ط±ظٹط± ظˆط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ظ…ط¹ط±ظپظٹط© ط§ظ„ظ…ظ†ط´ظˆط±ط© ظ…ظ† ط§ظ„ط¬ظ…ط¹ظٹط©.	publications	Publications hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
ab72b36c-0cfb-432a-a3ed-c6cffafc841e	search.hero.title	Search	ط§ظ„ط¨ط­ط«	search	Search hero title	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
f514dc67-4045-4023-894e-685aa1955187	search.hero.subtitle	Search across articles, publications, and events.	ط§ط¨ط­ط« ظپظٹ ط§ظ„ظ…ظ‚ط§ظ„ط§طھ ظˆط§ظ„ظ…ظ†ط´ظˆط±ط§طھ ظˆط§ظ„ظپط¹ط§ظ„ظٹط§طھ.	search	Search hero subtitle	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489
5f68b639-7b24-452f-a6c6-0ac9d1e6c6e8	jobs.hero.subtitle	Explore career opportunities at SSSS and partner organizations.	ط§ط³طھظƒط´ظپ ط§ظ„ظپط±طµ ط§ظ„ظˆط¸ظٹظپظٹط© ظپظٹ ط§ظ„ط¬ظ…ط¹ظٹط© ظˆط§ظ„ط¬ظ‡ط§طھ ط§ظ„ط´ط±ظٹظƒط©.	jobs	Jobs hero subtitle	2026-07-10 16:10:40.721161	2026-07-14 13:25:16.488875
b0fa00ac-a8ed-4670-9959-f104d1567c04	social.facebook_url	https://facebook.com/ssssy	https://facebook.com/ssssy	social	Social: Facebook URL	2026-07-09 10:39:19.15402	2026-07-14 13:43:28.257423
75664524-4c07-41b0-a01e-ec883688365d	social.twitter_url	https://twitter.com/ssssy	https://twitter.com/ssssy	social	Social: Twitter/X URL	2026-07-09 10:39:19.15402	2026-07-14 13:43:28.257423
0aecfa58-339b-4026-9b52-5882fab5ef8a	social.linkedin_url	https://linkedin.com/company/ssssy	https://linkedin.com/company/ssssy	social	Social: LinkedIn URL	2026-07-09 10:39:19.15402	2026-07-14 13:43:28.257423
4a3648ab-dbf8-48e1-9c13-7689ca7a31da	social.youtube_url	https://youtube.com/@ssssy	https://youtube.com/@ssssy	social	Social: YouTube URL	2026-07-09 10:39:19.15402	2026-07-14 13:43:28.257423
\.


--
-- TOC entry 6227 (class 0 OID 68007)
-- Dependencies: 228
-- Data for Name: content_tags; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_tags (content_id, tag_id) FROM stdin;
\.


--
-- TOC entry 6295 (class 0 OID 77339)
-- Dependencies: 296
-- Data for Name: content_type_definitions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_type_definitions (id, name, label_en, label_ar, description, icon, workflow_id, allow_comments, allow_member_submit, requires_approval, is_active, sort_order, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6296 (class 0 OID 77369)
-- Dependencies: 297
-- Data for Name: content_type_fields; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_type_fields (id, content_type_id, field_name, field_label_en, field_label_ar, field_type, is_required, is_searchable, is_listed, placeholder_en, placeholder_ar, help_text_en, help_text_ar, options_json, validation_json, sort_order, created_at) FROM stdin;
\.


--
-- TOC entry 6282 (class 0 OID 69240)
-- Dependencies: 283
-- Data for Name: content_version_history; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_version_history (id, content_type, content_id, version_number, data_snapshot, change_description, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 6228 (class 0 OID 68022)
-- Dependencies: 229
-- Data for Name: content_versions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.content_versions (id, content_id, version, title_ar, title_en, excerpt, body, status, changed_by, change_summary, created_at) FROM stdin;
70a62a33-dc89-477e-be1b-8881b4c5c5f2	814c0183-4bd1-4351-868a-b1d7991e2c40	2	ط§ظ„ط¬ظ…ط¹ظٹط© طھط·ظ„ظ‚ ظ…ط´ط±ظˆط¹ طھظ‚ظٹظٹظ… ط§ظ„طھط±ط¨ط© ط§ظ„ظˆط·ظ†ظٹ	Society Launches National Soil Assessment Project	The Soil Science Society of Syria has launched a comprehensive national project to assess soil health across all agricultural governorates, aiming to establish a baseline database for future research.		PUBLISHED	6d6595c0-1835-42be-89a1-1a44b899141c	Updated	2026-07-29 21:12:41.366581
\.


--
-- TOC entry 6269 (class 0 OID 68906)
-- Dependencies: 270
-- Data for Name: crm_contacts; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.crm_contacts (id, user_id, first_name, last_name, email, phone, organization, "position", contact_type, relationship_level, notes, source, is_primary, is_active, last_contact_at, next_followup_at, tags, preferences, created_at, updated_at, created_by) FROM stdin;
\.


--
-- TOC entry 6297 (class 0 OID 77389)
-- Dependencies: 298
-- Data for Name: dynamic_content_entries; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.dynamic_content_entries (id, content_type_name, slug, status, author_id, workflow_state, field_data, featured_image_url, meta_title, meta_description, published_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6238 (class 0 OID 68232)
-- Dependencies: 239
-- Data for Name: email_accounts; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_accounts (id, user_id, email_address, username, password_hash, display_name, quota_bytes, used_bytes, is_active, is_verified, auto_reply_enabled, auto_reply_subject, auto_reply_body, auto_reply_starts_at, auto_reply_ends_at, forward_to, forward_keep_copy, signature, imap_subscribed, last_sync_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6248 (class 0 OID 68452)
-- Dependencies: 249
-- Data for Name: email_aliases; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_aliases (id, account_id, alias_address, is_active, created_at) FROM stdin;
\.


--
-- TOC entry 6242 (class 0 OID 68338)
-- Dependencies: 243
-- Data for Name: email_attachments; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_attachments (id, message_id, filename, mime_type, size_bytes, storage_path, content_id, is_inline, created_at) FROM stdin;
\.


--
-- TOC entry 6245 (class 0 OID 68388)
-- Dependencies: 246
-- Data for Name: email_contact_group_members; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_contact_group_members (id, group_id, contact_id, created_at) FROM stdin;
\.


--
-- TOC entry 6244 (class 0 OID 68372)
-- Dependencies: 245
-- Data for Name: email_contact_groups; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_contact_groups (id, owner_id, name, description, color, created_at) FROM stdin;
\.


--
-- TOC entry 6243 (class 0 OID 68354)
-- Dependencies: 244
-- Data for Name: email_contacts; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_contacts (id, owner_id, email, first_name, last_name, display_name, company, "position", phone, mobile, notes, is_favorite, created_at) FROM stdin;
\.


--
-- TOC entry 6247 (class 0 OID 68432)
-- Dependencies: 248
-- Data for Name: email_distribution_list_members; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_distribution_list_members (id, list_id, user_id, is_moderator, created_at) FROM stdin;
\.


--
-- TOC entry 6246 (class 0 OID 68407)
-- Dependencies: 247
-- Data for Name: email_distribution_lists; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_distribution_lists (id, name, email_address, description, list_type, is_public, allow_external, moderator_id, requires_moderation, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 6239 (class 0 OID 68260)
-- Dependencies: 240
-- Data for Name: email_folders; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_folders (id, account_id, parent_id, name, folder_type, system_folder, sort_order, unread_count, total_count, imap_folder_name, created_at) FROM stdin;
\.


--
-- TOC entry 6240 (class 0 OID 68286)
-- Dependencies: 241
-- Data for Name: email_messages; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_messages (id, account_id, folder_id, message_id, in_reply_to, references_header, thread_id, sender_address, sender_name, reply_to_address, reply_to_name, subject, body_text, body_html, preview_text, size_bytes, has_attachments, attachment_count, priority, is_read, is_flagged, is_starred, is_draft, is_scheduled, scheduled_send_at, actually_sent_at, imap_uid, delivery_status, bounce_message, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6261 (class 0 OID 68709)
-- Dependencies: 262
-- Data for Name: email_quota_logs; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_quota_logs (id, account_id, used_bytes_before, used_bytes_after, change_bytes, operation, message_id, created_at) FROM stdin;
\.


--
-- TOC entry 6241 (class 0 OID 68321)
-- Dependencies: 242
-- Data for Name: email_recipients; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_recipients (id, message_id, recipient_type, address, name, is_internal, created_at) FROM stdin;
\.


--
-- TOC entry 6249 (class 0 OID 68467)
-- Dependencies: 250
-- Data for Name: email_rules; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_rules (id, account_id, name, order_index, is_enabled, stop_processing, match_all, conditions, actions, created_at) FROM stdin;
\.


--
-- TOC entry 6260 (class 0 OID 68689)
-- Dependencies: 261
-- Data for Name: email_scheduled_sends; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.email_scheduled_sends (id, message_id, account_id, scheduled_at, status, error_message, created_at, processed_at) FROM stdin;
\.


--
-- TOC entry 6268 (class 0 OID 68879)
-- Dependencies: 269
-- Data for Name: event_registrations; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.event_registrations (id, event_id, user_id, name, email, phone, organization, notes, status, registered_at, checked_in, created_at, updated_at, checked_in_at, check_in_notes, waitlist_position) FROM stdin;
\.


--
-- TOC entry 6300 (class 0 OID 77738)
-- Dependencies: 301
-- Data for Name: event_reminder_rules; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.event_reminder_rules (id, event_id, rule_type, offset_hours, fire_at, subject_template, body_template, send_email, send_in_app, is_fired, fired_at, recipients_count, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6234 (class 0 OID 68163)
-- Dependencies: 235
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.events (id, title_ar, title_en, slug, description, event_date, end_date, location, location_url, event_type, organizer, featured_image, is_published, created_by, created_at, updated_at, address, latitude, longitude, is_online, online_url, max_participants, registration_deadline, status, contact_email, is_featured, display_order, og_image, meta_title, meta_description, registration_form_schema, cancelled_at, cancellation_reason) FROM stdin;
41942840-4945-4fd1-90dd-cd8153713637	ظˆط±ط´ط© ط¹ظ…ظ„: طھظ‚ظ†ظٹط§طھ طھط­ط³ظٹظ† ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط© ظپظٹ ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط¬ط§ظپط©	Workshop: Soil Fertility Improvement Techniques in Dryland Areas	workshop-soil-fertility-dryland-2025	A practical hands-on workshop covering modern techniques for improving soil fertility in dryland agricultural zones, including cover cropping, biochar application, and micro-irrigation scheduling.	2026-08-14 06:10:22.751245	2026-08-15 06:10:22.751245	Damascus Agricultural Research Centre, Damascus	\N	Workshop	Soil Science Society of Syria	\N	t	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-15 06:10:22.751245	2026-07-15 06:10:22.751245	\N	\N	\N	f	\N	\N	\N	PUBLISHED	events@sssy.org	f	0	\N	\N	\N	\N	\N	\N
338635c3-9f56-465e-a1f3-2c7a90ba771b	ط§ظ„ظ…ط¤طھظ…ط± ط§ظ„ط³ظ†ظˆظٹ ط§ظ„ط«ط§ظ…ظ† ط¹ط´ط± ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§	18th Annual Syrian Soil Science Conference	annual-syrian-soil-science-conference-18th-2025	The flagship annual conference of the Soil Science Society of Syria brings together researchers, academics, and practitioners from across the country to present latest findings.	2026-09-13 06:10:22.751245	2026-09-15 06:10:22.751245	University of Aleppo, Faculty of Agriculture, Aleppo	\N	Conference	University of Aleppo & SSSY	\N	t	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-15 06:10:22.751245	2026-07-15 06:10:22.751245	\N	\N	\N	f	\N	\N	\N	PUBLISHED	conference@sssy.org	f	0	\N	\N	\N	\N	\N	\N
4d59cbb1-9867-435e-860c-c607539ea6a2	ط¯ظˆط±ط© طھط¯ط±ظٹط¨ظٹط©: طھط­ظ„ظٹظ„ ط§ظ„طھط±ط¨ط© ظˆطھظپط³ظٹط± ط§ظ„ظ†طھط§ط¦ط¬ ط§ظ„ظ…ط®طھط¨ط±ظٹط©	Training Course: Soil Analysis and Laboratory Results Interpretation	training-soil-analysis-laboratory-interpretation-2025	A five-day intensive training course for agronomists and soil scientists covering soil sampling methodologies, laboratory analysis procedures, and practical interpretation of soil test results.	2026-10-13 06:10:22.751245	2026-10-18 06:10:22.751245	SSSY Training Centre, Homs	\N	Training	Soil Science Society of Syria	\N	t	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-15 06:10:22.751245	2026-07-15 06:10:22.751245	\N	\N	\N	f	\N	\N	\N	PUBLISHED	training@sssy.org	f	0	\N	\N	\N	\N	\N	\N
7986d880-db1f-478c-bd68-9cf4aa7e0249	ظ†ط¯ظˆط© ط¥ظ„ظƒطھط±ظˆظ†ظٹط©: ط§ط³طھط®ط¯ط§ظ… ط§ظ„ط§ط³طھط´ط¹ط§ط± ط¹ظ† ط¨ط¹ط¯ ظپظٹ ط±طµط¯ ط§ظ„طھط±ط¨ط©	Webinar: Remote Sensing Applications for Soil Monitoring	webinar-remote-sensing-soil-monitoring-2025	An online seminar exploring the latest applications of satellite imagery and UAV-based remote sensing for soil health monitoring, erosion mapping, and precision agriculture in Syrian agricultural landscapes.	2026-11-12 06:10:22.751245	2026-11-12 06:10:22.751245	Online (Zoom)	\N	Seminar	Soil Science Society of Syria	\N	t	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-15 06:10:22.751245	2026-07-15 06:10:22.751245	\N	\N	\N	f	\N	\N	\N	PUBLISHED	events@sssy.org	f	0	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 6217 (class 0 OID 67792)
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
22	22	site sections	SQL	V22__site_sections.sql	-1155198257	ssssy	2026-07-09 10:39:19.174567	35	t
23	23	site sections location	SQL	V23__site_sections_location.sql	1649311233	ssssy	2026-07-09 10:39:19.227546	17	t
24	24	theme settings	SQL	V24__theme_settings.sql	-1356011359	ssssy	2026-07-09 10:39:19.256955	24	t
25	25	fix admin password	SQL	V25__fix_admin_password.sql	-1280083977	ssssy	2026-07-09 10:39:19.293722	10	t
32	32	phase7 iot sensors	SQL	V32__phase7_iot_sensors.sql	667867780	ssssy	2026-07-09 10:39:19.454809	81	t
33	33	performance indexes	SQL	V33__performance_indexes.sql	738113001	ssssy	2026-07-09 10:39:19.550459	142	t
34	34	add stage2 columns	SQL	V34__add_stage2_columns.sql	1419139638	ssssy	2026-07-10 23:19:35.013935	1054	t
35	35	themes table	SQL	V35__themes_table.sql	121684228	ssssy	2026-07-11 03:39:35.244704	415	t
36	36	seed component presets	SQL	V36__seed_component_presets.sql	-1752645875	ssssy	2026-07-11 03:44:16.932405	26	t
37	37	seed border shadow tokens	SQL	V37__seed_border_shadow_tokens.sql	-71010129	ssssy	2026-07-11 03:44:17.104514	90	t
38	38	add layout json to pages	SQL	V38__add_layout_json_to_pages.sql	-1332600094	ssssy	2026-07-11 15:54:10.811928	123	t
39	39	cms foundation stage1	SQL	V39__cms_foundation_stage1.sql	1319562557	ssssy	2026-07-12 22:36:36.305496	1871	t
40	32	phase7 iot sensors	DELETE	V32__phase7_iot_sensors.sql	667867780	ssssy	2026-07-13 22:42:14.490239	0	t
41	33	performance indexes	DELETE	V33__performance_indexes.sql	738113001	ssssy	2026-07-13 22:42:14.490239	0	t
21	21	seed header menu and social	SQL	V21__seed_header_menu_and_social.sql	-311523333	ssssy	2026-07-09 10:39:19.144673	15	t
26	26	seed global site settings and footer	SQL	V26__theme_settings_advanced.sql	-1349550558	ssssy	2026-07-09 10:39:19.316194	17	t
27	27	clean up duplicate menu data	SQL	V27__phase1_feature_settings.sql	1628802228	ssssy	2026-07-09 10:39:19.349247	11	t
28	28	add unique constraint menu location	SQL	V28__phase3_component_flags.sql	278746425	ssssy	2026-07-09 10:39:19.373766	7	t
29	29	seed page sections for public pages	SQL	V29__phase4_sensory_flags.sql	-1679906092	ssssy	2026-07-09 10:39:19.396707	4	t
30	30	stage2 schema updates	SQL	V30__phase5_performance_flags.sql	1516847656	ssssy	2026-07-09 10:39:19.416328	7	t
31	31	fix stage2 missing columns	SQL	V31__phase6_admin_ux_flags.sql	656299203	ssssy	2026-07-09 10:39:19.436181	6	t
42	40	fix page sections seed data	SQL	V40__fix_page_sections_seed_data.sql	830330626	ssssy	2026-07-14 00:58:12.290626	248	t
43	41	rebrand ssss and add logo setting	SQL	V41__rebrand_ssss_and_add_logo_setting.sql	700047301	ssssy	2026-07-14 13:43:28.105017	19	t
44	42	menu style config	SQL	V42__menu_style_config.sql	1224211084	ssssy	2026-07-14 21:58:18.366508	408	t
45	43	convert style config to text	SQL	V43__convert_style_config_to_text.sql	342663544	ssssy	2026-07-14 22:34:25.580263	463	t
46	44	add site name bilingual	SQL	V44__add_site_name_bilingual.sql	775297047	ssssy	2026-07-15 00:02:06.010484	50	t
47	45	add footer copyright bilingual	SQL	V45__add_footer_copyright_bilingual.sql	-1151127473	ssssy	2026-07-15 00:17:01.338503	8	t
48	46	seed homepage sections bilingual	SQL	V46__seed_homepage_sections_bilingual.sql	-2008828844	ssssy	2026-07-15 04:38:52.513026	529	t
49	47	remove legacy homepage section duplicates	SQL	V47__remove_legacy_homepage_section_duplicates.sql	-823977758	ssssy	2026-07-15 04:53:57.860636	21	t
50	48	update hero banner to carousel	SQL	V48__update_hero_banner_to_carousel.sql	52154469	ssssy	2026-07-15 06:07:16.660715	66	t
51	49	publications table	SQL	V49__publications_table.sql	-1902447106	ssssy	2026-07-15 06:07:17.256897	482	t
52	50	seed publications carousel section	SQL	V50__seed_publications_carousel_section.sql	-1084453629	ssssy	2026-07-15 06:07:17.755186	34	t
53	51	seed homepage demo data	SQL	V51__seed_homepage_demo_data.sql	15517085	ssssy	2026-07-15 06:10:22.602351	332	t
54	52	add original gradient slide to hero carousel	SQL	V52__add_original_gradient_slide_to_hero_carousel.sql	1449175611	ssssy	2026-07-15 06:19:00.042268	40	t
55	53	seed ssss founders and content	SQL	V53__seed_ssss_founders_and_content.sql	-636069292	ssssy	2026-07-15 07:32:54.496522	98	t
56	54	seed founders fix	SQL	V54__seed_founders_fix.sql	1230943596	ssssy	2026-07-15 07:51:14.612771	167	t
57	55	fix localhost logo url	SQL	V55__fix_localhost_logo_url.sql	-1439351202	ssssy	2026-07-21 15:38:55.092228	191	t
58	56	cms event bus and forms	SQL	V56__cms_event_bus_and_forms.sql	-1213138103	ssssy	2026-07-21 19:24:02.165791	1105	t
59	57	dynamic content types	SQL	V57__dynamic_content_types.sql	-969713511	ssssy	2026-07-21 23:03:25.012091	593	t
60	58	plugin registry	SQL	V58__plugin_registry.sql	-563022988	ssssy	2026-07-21 23:31:46.692305	488	t
61	59	fix dead publication image	SQL	V59__fix_dead_publication_image.sql	19036709	ssssy	2026-07-23 03:27:41.040282	55	t
62	60	fix publication pdf urls	SQL	V60__fix_publication_pdf_urls.sql	445417433	ssssy	2026-07-23 23:55:44.517272	361	t
63	61	revert publication pdf urls to fao	SQL	V61__revert_publication_pdf_urls_to_fao.sql	-1339647659	ssssy	2026-07-24 02:11:45.420221	210	t
64	62	site sections versioning	SQL	V62__site_sections_versioning.sql	1701446518	ssssy	2026-07-24 15:50:26.678078	1229	t
65	63	content bilingual body	SQL	V63__content_bilingual_body.sql	-2073983195	ssssy	2026-07-29 19:43:13.866723	158	t
66	64	body jsonb to text	SQL	V64__body_jsonb_to_text.sql	-389310628	ssssy	2026-07-29 21:08:53.025183	663	t
67	65	event enhancements	SQL	V65__event_enhancements.sql	-262994045	ssssy	2026-07-30 01:03:45.132903	367	t
68	66	event reminder rules	SQL	V66__event_reminder_rules.sql	235216264	ssssy	2026-07-30 01:03:46.216295	183	t
69	67	event reminder defaults	SQL	V67__event_reminder_defaults.sql	1422641884	ssssy	2026-07-30 01:03:46.407797	79	t
70	68	about us real content	SQL	V68__about_us_real_content.sql	365492010	ssssy	2026-07-30 03:43:57.264799	343	t
71	69	restore vision mission section	SQL	V69__restore_vision_mission_section.sql	331938957	ssssy	2026-07-30 04:23:49.026874	281	t
72	70	about documents section	SQL	V70__about_documents_section.sql	-1786731680	ssssy	2026-07-30 04:37:08.809413	31	t
73	71	about gallery section	SQL	V71__about_gallery_section.sql	184161007	ssssy	2026-07-30 04:43:47.905526	29	t
74	72	member profiles rich fields	SQL	V72__member_profiles_rich_fields.sql	692117310	ssssy	2026-07-30 06:09:10.193399	1429	t
75	73	seed real members	SQL	V73__seed_real_members.sql	1298861622	ssssy	2026-07-30 06:09:14.401528	4121	t
76	74	member photos	SQL	V74__member_photos.sql	-2124520516	ssssy	2026-07-30 06:09:18.541722	59	t
77	75	president message page	SQL	V75__president_message_page.sql	-34885775	ssssy	2026-07-30 06:49:27.826988	277	t
78	76	fix president message page	SQL	V76__fix_president_message_page.sql	-777201402	ssssy	2026-07-30 07:24:17.942112	344	t
79	77	update hero carousel slides	SQL	V77__update_hero_carousel_slides.sql	1884831664	ssssy	2026-07-30 07:55:57.7677	77	t
\.


--
-- TOC entry 6272 (class 0 OID 68976)
-- Dependencies: 273
-- Data for Name: gallery_albums; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.gallery_albums (id, title_ar, title_en, description_ar, description_en, slug, cover_image_id, is_published, sort_order, password_hash, is_password_protected, watermark_overrides, settings_overrides, view_count, download_count, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6275 (class 0 OID 69050)
-- Dependencies: 276
-- Data for Name: gallery_analytics_events; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.gallery_analytics_events (id, album_id, image_id, share_link_id, event_type, ip_address, user_agent, referer, session_id, created_at) FROM stdin;
\.


--
-- TOC entry 6273 (class 0 OID 69003)
-- Dependencies: 274
-- Data for Name: gallery_images; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.gallery_images (id, album_id, media_file_id, sort_order, title_ar, title_en, description_ar, description_en, alt_text, before_media_file_id, hotspot_data, exif_data, color_palette, is_cover, created_at) FROM stdin;
\.


--
-- TOC entry 6274 (class 0 OID 69029)
-- Dependencies: 275
-- Data for Name: gallery_share_links; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.gallery_share_links (id, album_id, token, expires_at, max_views, current_views, is_active, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 6298 (class 0 OID 77418)
-- Dependencies: 299
-- Data for Name: installed_plugins; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.installed_plugins (id, plugin_id, plugin_name, version, author, description, manifest_json, status, config_json, source, jar_path, error_message, installed_at, activated_at, deactivated_at, updated_at) FROM stdin;
8f9df20f-b018-4cec-81ab-90d3c24220b3	sssy-example-plugin	SSSSY Example Plugin	1.0.0	SSSSY Dev Team	Reference implementation â€” logs published research-paper entries.	{"id": "sssy-example-plugin", "name": "SSSSY Example Plugin", "author": "SSSSY Dev Team", "version": "1.0.0", "entryClass": "org.ssssy.backend.plugin.example.ExamplePlugin", "description": "Reference implementation â€” logs published research-paper entries.", "permissions": ["CONTENT_READ"], "autoActivate": true, "dbMigrations": []}	INSTALLED	{}	CLASSPATH	\N	\N	2026-07-21 23:32:03.654228+03	\N	\N	2026-07-21 23:32:03.654228+03
\.


--
-- TOC entry 6236 (class 0 OID 68204)
-- Dependencies: 237
-- Data for Name: job_applications; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.job_applications (id, job_vacancy_id, first_name, last_name, email, phone, cover_letter, cv_file_path, status, created_at) FROM stdin;
\.


--
-- TOC entry 6235 (class 0 OID 68184)
-- Dependencies: 236
-- Data for Name: job_vacancies; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.job_vacancies (id, title_ar, title_en, slug, description, requirements, location, job_type, department, deadline, is_published, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6230 (class 0 OID 68071)
-- Dependencies: 231
-- Data for Name: media_files; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.media_files (id, filename, original_filename, mime_type, size_bytes, storage_path, url, thumbnail_url, width, height, alt_text_ar, alt_text_en, folder_id, user_id, created_at, updated_at, caption_en, caption_ar, tags, uploader_id) FROM stdin;
\.


--
-- TOC entry 6229 (class 0 OID 68053)
-- Dependencies: 230
-- Data for Name: media_folders; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.media_folders (id, name, parent_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6262 (class 0 OID 68735)
-- Dependencies: 263
-- Data for Name: media_thumbnails; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.media_thumbnails (id, media_file_id, thumbnail_path, width, height, mime_type, size_bytes, created_at) FROM stdin;
\.


--
-- TOC entry 6257 (class 0 OID 68633)
-- Dependencies: 258
-- Data for Name: member_profiles; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.member_profiles (id, user_id, membership_type, membership_number, specialization, research_interests, education, publications_count, is_public, joined_at, membership_expires_at, orcid_id, google_scholar_url, linkedin_url, created_at, updated_at, name_ar, name_en, title_ar, specialization_detail, birth_year, birth_city, nationality, marital_status, career_summary, memberships, languages, photo_url, slug) FROM stdin;
8580ec1b-ecd8-4363-a051-ea1a9b666c5d	a2000001-0000-0000-0000-000000000002	FOUNDER	SSSS-002	طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ	ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط©طŒ طھط؛ط°ظٹط© ط§ظ„ظ†ط¨ط§طھطŒ ط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ	ط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© â€” ط¬ط§ظ…ط¹ط© ط­ظ…طµ (ط§ظ„ط¨ط¹ط« ط³ط§ط¨ظ‚ط§ظ‹) 2013	\N	t	2024-01-01	\N	\N	\N	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:14.414509	ط§ظ„ط¯ظƒطھظˆط± ط­ظٹط¯ط± ظ‡ط§ط´ظ… ط§ظ„ط­ط³ظ†	Dr. Haidar Hashem Al-Hassan	ط¯ظƒطھظˆط±	ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط© ظˆطھط؛ط°ظٹط© ط§ظ„ظ†ط¨ط§طھ	\N	\N	ط³ظˆط±ظٹ	\N	ط±ط¦ظٹط³ ظ‚ط³ظ… ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط© ط§ظ„ظ…طھط¬ط¯ظ‘ط¯ط© ظپظٹ ظƒظ„ظٹط© ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط©طŒ ط¬ط§ظ…ط¹ط© ط­ظ…ط§ظ‡ ظ…ظ†ط° 1/10/2025.	\N	ط§ظ„ط¹ط±ط¨ظٹط© (ط§ظ„ط£ظ…)	\N	haidar-hashem-al-hassan
b86f4f5d-f966-4c2b-962b-23c2cb507925	a2000001-0000-0000-0000-000000000003	FOUNDER	SSSS-003	ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©	ط¥ط¯ط§ط±ط© ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©طŒ ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط©طŒ ط§ظ„طھط؛ظٹط± ط§ظ„ظ…ظ†ط§ط®ظٹطŒ ظ…ظƒط§ظپط­ط© ط§ظ„طھطµط­ط±طŒ ظ†ط¸ظ… ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط¬ط؛ط±ط§ظپظٹط©	ط¥ط¬ط§ط²ط© ظپظٹ ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© طھط®طµطµ ط¹ظ„ظˆظ… طھط±ط¨ط© â€” ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 1995\nط¯ط¨ظ„ظˆظ… ط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ط¹ظ„ظٹط§ طھط®طµطµ ط¹ظ„ظˆظ… طھط±ط¨ط© â€” ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 1997\nظ…ط§ط¬ط³طھظٹط± ظپظٹ ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© طھط®طµطµ ط¹ظ„ظˆظ… طھط±ط¨ط© â€” ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 2002\nط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© طھط®طµطµ ط¹ظ„ظˆظ… طھط±ط¨ط© â€” ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 2006\nط´ظ‡ط§ط¯ط© ط§ظ„طھط¯ظ‚ظٹظ‚ ط§ظ„ط¯ط§ط®ظ„ظٹ ظپظٹ ظ†ط¸ط§ظ… ط§ظ„ط¬ظˆط¯ط© (ط§ظ„ط£ظٹط²ظˆ)\nط¯ظˆط±ط© ظ…ط¯ط±ط¨ظٹظ† ظپظٹ ط§ظ„ط²ط±ط§ط¹ط© ط§ظ„ط¹ط¶ظˆظٹط© ظ…ظ† ظ…ط¹ظ‡ط¯ ط¨ط§ط±ظٹطŒ ط¥ظٹط·ط§ظ„ظٹط§	72	t	2024-01-01	\N	\N	\N	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:18.54696	ط§ظ„ط¯ظƒطھظˆط± ظ…ط­ظ…ط¯ ظ…ظ†ظ‡ظ„ ط¹ظˆط¶ ط§ظ„ط­ط³ظٹظ† ط§ظ„ط²ط¹ط¨ظٹ	Dr. Mohammed Manhal Al-Zoubi	ط¯ظƒطھظˆط±	ط¥ط¯ط§ط±ط© ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©	1971	ط¯ط±ط¹ط§	ط³ظˆط±ظٹ	ظ…طھط²ظˆط¬	ظ…ط¯ظٹط± ط¨ط­ظˆط« â€” ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ظ„ظ„ط¨ط­ظˆط« ط§ظ„ط¹ظ„ظ…ظٹط© ط§ظ„ط²ط±ط§ط¹ظٹط© (30 ط³ظ†ط© ط®ط¨ط±ط©).\nظ…ط¯ظٹط± ط¥ط¯ط§ط±ط© ط¨ط­ظˆط« ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط© â€” ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ظ„ظ„ط¨ط­ظˆط« ط§ظ„ط¹ظ„ظ…ظٹط© ط§ظ„ط²ط±ط§ط¹ظٹط©.\nظ…ط­ط§ط¶ط± ظپظٹ ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ ظ…ظ† ط§ظ„ط¹ط§ظ… 2002 ط­طھظ‰ طھط§ط±ظٹط®ظ‡.\nظ†ظ‚ط·ط© ط§ظ„ط§طھطµط§ظ„ ظ…ط¹ ط§ظ„ط´ط±ط§ظƒط© ط§ظ„ط¹ط§ظ„ظ…ظٹط© ظ„ظ„طھط±ط¨ط© GSP â€” ظ…ظ†ط¸ظ…ط© FAO.\nط¹ط¶ظˆ ط§ظ„ظ„ط¬ظ†ط© ط§ظ„طھظˆط¬ظٹظ‡ظٹط© ط¹ظ† ط¯ظˆظ„ ط§ظ„ط´ط±ظ‚ ط§ظ„ط£ظˆط³ط· ظپظٹ ظ…ط¬ظ…ظˆط¹ط© NENA.\nط®ط¨ظٹط± ظ…ط¹ UNDP (2023â€“2024)طŒ FAOطŒ ICBAطŒ ICARDAطŒ ACSAD.\nط±ط¦ظٹط³ ط§ظ„ظپط±ظٹظ‚ ط§ظ„ظˆط·ظ†ظٹ ظ„طھظ‚ظٹظٹظ… ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©.\nظ…ط¯ط±ط¨ ظپظٹ ط¯ظˆط±ط§طھ FAOطŒ UNDPطŒ ICARDAطŒ ACSADطŒ ZOAطŒ ADRA.	ط¹ط¶ظˆ ظپظٹ ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© SSSS\nط¹ط¶ظˆ ط´ط¨ظƒط© ط®ط¨ط±ط§ط، ط§ظ„ظپط§ظˆ ظپظٹ ط³ظˆط±ظٹط©\nط¹ط¶ظˆ ظ‡ظٹط¦ط© طھط­ط±ظٹط± ظ…ط¬ظ„ط© ط§ظ„ط¹ظ„ظ… ظˆط§ظ„ط§ط¨طھظƒط§ط± ط§ظ„ط³ظˆط±ظٹط©\nط¹ط¶ظˆ ط±ط§ط¨ط·ط© ط£ط¨ط­ط§ط« ط§ظ„طھطµط­ط± ظپظٹ ط§ظ„ظˆط·ظ† ط§ظ„ط¹ط±ط¨ظٹ\nط¹ط¶ظˆ ظ…ط¬ظ„ط³ ط£ظ…ظ†ط§ط، ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ظƒظٹظ…ظٹط§ط¦ظٹط© ط§ظ„ط³ظˆط±ظٹط©\nط¹ط¶ظˆ ط§ظ„ظ„ط¬ظ†ط© ط§ظ„ط¹ظ„ظٹط§ ظ„ظ„ظ…ظٹط§ظ‡ â€” ط£ظ…ط§ظ†ط© ط±ط¦ط§ط³ط© ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹط©	ط§ظ„ط¹ط±ط¨ظٹط© (ط§ظ„ط£ظ…)طŒ ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©	/members/mohammed-manhal-al-zoubi.jpg	mohammed-manhal-al-zoubi
2cfd9a23-8a58-4ff4-a33b-00f41c827b3a	a2000001-0000-0000-0000-000000000001	FOUNDER	SSSS-001	ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©	ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط©طŒ طھط­ط³ظٹظ† ط§ظ„ط£ط±ط§ط¶ظٹطŒ ط¥ط¯ط§ط±ط© ط§ظ„طھط±ط¨ط© ط§ظ„ط²ط±ط§ط¹ظٹط©	ط¥ط¬ط§ط²ط© ظپظٹ ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط© â€” ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 1976\nط¯ط¨ظ„ظˆظ… ط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ظ…ط¹ظ…ظ‚ط© â€” ط§ظ„ظ…ط¯ط±ط³ط© ط§ظ„ظˆط·ظ†ظٹط© ط§ظ„ط¹ظ„ظٹط§ ظ„ظ„ط²ط±ط§ط¹ط© ظˆط¹ظ„ظˆظ… ط§ظ„ط£ط؛ط°ظٹط©طŒ ظ†ط§ظ†ط³ظٹطŒ ظپط±ظ†ط³ط§ 1983\nط¯ط¨ظ„ظˆظ… ط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ظ…ط¹ظ…ظ‚ط© â€” ط¬ط§ظ…ط¹ط© ظ†ط§ظ†ط³ظٹ ط§ظ„ط£ظˆظ„ظ‰طŒ ظپط±ظ†ط³ط§ 1984\nط¯ظƒطھظˆط±ط§ظ‡ (ظ†ط¸ط§ظ… ط­ط¯ظٹط«) â€” ط§ظ„ظ…ط¹ظ‡ط¯ ط§ظ„ظˆط·ظ†ظٹ ظ…طھط¹ط¯ط¯ ط§ظ„طھظ‚ط§ظ†ط§طھ ظپظٹ ط§ظ„ظ„ظˆط±ظٹظ†طŒ ظپط±ظ†ط³ط§ 1987	\N	t	2024-01-01	\N	\N	\N	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:18.54696	ط§ظ„ط¯ظƒطھظˆط± ظ…ط­ظ…ط¯ ط³ط¹ظٹط¯ ط§ظ„ط´ط§ط·ط±	Dr. Mohammed Said Al-Shater	ط¯ظƒطھظˆط±	ط®طµظˆط¨ط© ظˆطھط­ط³ظٹظ† ط§ظ„ط£ط±ط§ط¶ظٹ	1950	ط¯ظ…ط´ظ‚	ط³ظˆط±ظٹ	ظ…طھط²ظˆط¬	ط£ط³طھط§ط° ظپظٹ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©طŒ ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ (ط§ظ„ظˆط¸ظٹظپط© ط§ظ„ط­ط§ظ„ظٹط©).\nط±ط¦ظٹط³ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©: ظپطھط±طھط§ظ† (2004â€“2008) ظˆ(2012â€“2016).\nظˆظƒظٹظ„ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© ظ„ظ„ط´ط¤ظˆظ† ط§ظ„ط¥ط¯ط§ط±ظٹط© ظˆط§ظ„ط·ظ„ط§ط¨ (1991â€“1992).\nظ…ط¯ظٹط± ط§ظ„ظ…ط¹ظ‡ط¯ ط§ظ„ط²ط±ط§ط¹ظٹ ط¨ط¯ظ…ط´ظ‚ (2002â€“2004).\nط±ط¦ظٹط³ طھط­ط±ظٹط± ظ…ط¬ظ„ط© ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ ظ„ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط© (2016â€“2018).\nط£ط³طھط§ط° ظ…ظڈط¹ط§ط± ط¥ظ„ظ‰ ط¬ط§ظ…ط¹ط© ط§ظ„ظ…ظ„ظƒ ظپظٹطµظ„طŒ ط§ظ„ظ…ظ…ظ„ظƒط© ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ط³ط¹ظˆط¯ظٹط© (1992â€“1997).\nط®ط¨ظٹط± ظپظٹ ط§ظ„ظ…ط±ظƒط² ط§ظ„ط¹ط±ط¨ظٹ ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط¬ط§ظپط© ظˆط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ظ‚ط§ط­ظ„ط© (ط£ظƒط³ط§ط¯).	ط¹ط¶ظˆ ظپظٹ ظ…ط¬ظ…ط¹ ط§ظ„ظ„ط؛ط© ط§ظ„ط¹ط±ط¨ظٹط© ط¨ط¯ظ…ط´ظ‚ â€” ظ„ط¬ظ†ط© ظ…طµط·ظ„ط­ط§طھ ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط©\nط¹ط¶ظˆ ظپظٹ ط§ظ„ظ„ط¬ظ†ط© ط§ظ„ط³ظˆط±ظٹط© ظ„ظ„ط¥ظ†طھط§ط¬ ط§ظ„ط¹ط¶ظˆظٹ	ط§ظ„ط¹ط±ط¨ظٹط© (ط§ظ„ط£ظ…)طŒ ط§ظ„ظپط±ظ†ط³ظٹط©طŒ ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©	/members/mohammed-said-al-shater.jpg	mohammed-said-al-shater
d3473eb3-3d45-4997-adfc-8a2d2d175e90	a2000001-0000-0000-0000-000000000004	FOUNDER	SSSS-004	ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ	ط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ظ…طھط¯ظ‡ظˆط±ط© ظˆط§ظ„ظ…طھظ…ظ„ط­ط©طŒ ط±ط³ظ… ط§ظ„ط®ط±ط§ط¦ط· ط§ظ„ط±ظ‚ظ…ظٹط© ظ„ظ„طھط±ط¨ط©طŒ GISطŒ ط§ظ„ط§ط³طھط´ط¹ط§ط± ط¹ظ† ط¨ظڈط¹ط¯طŒ ط§ظ„طھط¹ظ„ظ… ط§ظ„ط¢ظ„ظٹ	ط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ	\N	t	2024-01-01	\N	\N	\N	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:18.54696	ط§ظ„ط¯ظƒطھظˆط± ط¹ظ„ط§ط، ط­ط³ظ† ط®ظ„ظˆظپ	Dr. Alaa Hassan Khalouf	ط¯ظƒطھظˆط±	ظ†ط¸ظ… ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط¬ط؛ط±ط§ظپظٹط© ظˆط§ظ„ط§ط³طھط´ط¹ط§ط± ط¹ظ† ط¨ظڈط¹ط¯	\N	\N	ط³ظˆط±ظٹ	\N	ط±ط¦ظٹط³ ظ‚ط³ظ… ط¨ط­ظˆط« طµظٹط§ظ†ط© ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ â€” ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ظ„ظ„ط¨ط­ظˆط« ط§ظ„ط¹ظ„ظ…ظٹط© ط§ظ„ط²ط±ط§ط¹ظٹط©.\nط®ط¨ظٹط± GIS ظپظٹ ط¨ط±ظ†ط§ظ…ط¬ UNDP â€” ط¯ط±ط§ط³ط§طھ طھط¯ظ‡ظˆط± ط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ط³ط§ط­ظ„ظٹط©.\nظ…ط´ط§ط±ظƒ ظپظٹ ط¥ط¹ط¯ط§ط¯ طھظ‚ط§ط±ظٹط± FAO ط§ظ„ط¯ظˆظ„ظٹط©: ط§ظ„ط£ط·ظ„ط³ ط§ظ„ط¢ط³ظٹظˆظٹ ظ„ظ„طھط±ط¨ط© ظˆط§ظ„طھظ‚ط±ظٹط± ط§ظ„ط¹ط§ظ„ظ…ظٹ ظ„ط­ط§ظ„ط© ط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ظ…طھط£ط«ط±ط© ط¨ط§ظ„ظ…ظ„ظˆط­ط©.\nط£ط¨ط­ط§ط« طھط·ط¨ظٹظ‚ظٹط© ظپظٹ ظ…ط¹ط§ظ„ط¬ط© ط§ظ„طھط±ط¨ط© ط§ظ„ظ…ظ„ظˆط«ط© ط¨ط§ظ„ظ†ظپط· ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ.	\N	ط§ظ„ط¹ط±ط¨ظٹط© (ط§ظ„ط£ظ…)	/members/alaa-hassan-khalouf.jpg	alaa-hassan-khalouf
0edc8632-3d5b-486a-b4e5-7628ed191dbd	a2000001-0000-0000-0000-000000000005	FOUNDER	SSSS-005	طµظٹط§ظ†ط© ط§ظ„طھط±ط¨ط©	طµظٹط§ظ†ط© ط§ظ„طھط±ط¨ط©طŒ ط§ظ†ط¬ط±ط§ظپ ط§ظ„طھط±ط¨ط©طŒ ظ…ظƒط§ظپط­ط© ط§ظ„طھطµط­ط±طŒ ط§ط³طھط¹ظ…ط§ظ„ط§طھ ط§ظ„ظ…ظٹط§ظ‡طŒ طھط£ط«ظٹط± ط§ظ„ظ…ط§ط¯ط© ط§ظ„ط¹ط¶ظˆظٹط©	ط¨ظƒط§ظ„ظˆط±ظٹظˆط³ ظپظٹ ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط© â€” ط¬ط§ظ…ط¹ط© ط­ظ„ط¨طŒ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© ط§ظ„ط«ط§ظ†ظٹط© ط¨ط¯ظٹط± ط§ظ„ط²ظˆط± 1983\nط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط© طھط®طµطµ طµظٹط§ظ†ط© ط§ظ„طھط±ط¨ط© â€” ط¬ط§ظ…ط¹ط© ط§ظ„ظ‡ظ…ط¨ظˆظ„طھطŒ ط¨ط±ظ„ظٹظ†/ط£ظ„ظ…ط§ظ†ظٹط§ 1989 (ط¬ظٹط¯ ط¬ط¯ط§ظ‹)	70	t	2024-01-01	\N	\N	\N	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:18.54696	ط§ظ„ط£ط³طھط§ط° ط§ظ„ط¯ظƒطھظˆط± ط¹ظ…ط± ط¹ط¨ط¯ ط§ظ„ظ„ظ‡ ط¹ط¨ط¯ ط§ظ„ط±ط²ط§ظ‚	Prof. Dr. Omar Abdullah Abdul-Razzaq	ط£ط³طھط§ط° ط¯ظƒطھظˆط±	ظ…ظƒط§ظپط­ط© ط§ظ„طھطµط­ط± ظˆط¥ط¯ط§ط±ط© ط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ط¬ط§ظپط©	1961	ط§ظ„ظ…ظٹط§ط¯ظٹظ†	ط³ظˆط±ظٹ	\N	ط£ظ…ظٹظ† ط¬ط§ظ…ط¹ط© ط§ظ„ظپط±ط§طھ ظ…ظ†ط° 2/1/2025.\nط¹ظ…ظٹط¯ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© ط¨ط¯ظٹط± ط§ظ„ط²ظˆط± (2019â€“2023).\nظ†ط§ط¦ط¨ ط±ط¦ظٹط³ ط¬ط§ظ…ط¹ط© ط§ظ„ظپط±ط§طھ ظ„ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ ظˆط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ط¹ظ„ظٹط§ (2010â€“2014).\nط±ط¦ظٹط³ ظ‚ط³ظ… ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ ظپظٹ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© (2007â€“2009).\nظ†ط§ط¦ط¨ ط¹ظ…ظٹط¯ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© (2009).\nط£ط³طھط§ط° ظپظٹ ط§ظ„ظ‡ظٹط¦ط© ط§ظ„طھط¯ط±ظٹط³ظٹط© ظ…ظ†ط° 1991.\nظ…ظ†ط­ط© DAAD ظ„ظ„ط¨ط­ط« ظپظٹ ط£ظ„ظ…ط§ظ†ظٹط§ ظ…ط±طھظٹظ† (1995 ظˆ2005).\nط¥ط¹ط§ط±ط© ظ„ظ„طھط¯ط±ظٹط³ ظپظٹ ط§ظ„ط¬ط§ظ…ط¹ط§طھ ط§ظ„ظ„ظٹط¨ظٹط© (1997â€“1999).\nط®ط¨ظٹط± ظ…طھط¹ط§ظˆظ† ظپظٹ ط£ظƒط³ط§ط¯ ظ„ظ…ظƒط§ظپط­ط© ط§ظ„طھطµط­ط± ظˆط§ط³طھط®ط¯ط§ظ…ط§طھ ط§ظ„ظ…ظٹط§ظ‡.	ط¹ط¶ظˆ ظ„ط¬ظ†ط© ط­ظ…ط§ظٹط© ط§ظ„ط¨ظٹط¦ط© ظپظٹ ظ…ط­ط§ظپط¸ط© ط¯ظٹط± ط§ظ„ط²ظˆط±\nط¹ط¶ظˆ ط§ظ„ظ„ط¬ظ†ط© ط§ظ„طھظˆط¬ظٹظ‡ظٹط© ط§ظ„ظˆط·ظ†ظٹط© ظ„ط¨ط±ظ†ط§ظ…ط¬ ط§ظ„ظ…ظ†ط­ ط§ظ„طµط؛ظٹط±ط© GEF/SGP\nط®ط¨ظٹط± طµظٹط§ظ†ط© ط§ظ„طھط±ط¨ط© ظپظٹ ط§ظ„ط¨ط±ظ†ط§ظ…ط¬ ط§ظ„ظˆط·ظ†ظٹ ظ„ظ…ظƒط§ظپط­ط© ط§ظ„طھطµط­ط±\nط®ط¨ظٹط± ظپظٹ طھظ‚ظٹظٹظ… ط§ظ„ط£ط«ط± ط§ظ„ط¨ظٹط¦ظٹ ظ„ط¯ظ‰ ظ…ظ†ط¸ظ…ط© FAO	ط§ظ„ط¹ط±ط¨ظٹط© (ط§ظ„ط£ظ…)طŒ ط§ظ„ط£ظ„ظ…ط§ظ†ظٹط©طŒ ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©	/members/omar-abdullah-abdul-razzaq.jpg	omar-abdullah-abdul-razzaq
26b9c7ff-8cf9-410b-9bab-7e3057476044	a2000001-0000-0000-0000-000000000006	FOUNDER	SSSS-006	ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©	ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط©طŒ ظƒظٹظ…ظٹط§ط، ط§ظ„طھط±ط¨ط©طŒ ط§ظ„ط£ط­ظٹط§ط، ط§ظ„ط¯ظ‚ظٹظ‚ط©طŒ طھط³ظ…ظٹط¯ ط§ظ„طھط±ط¨ط©طŒ ط§ظ„ط²ط±ط§ط¹ط© ط§ظ„ط¹ط¶ظˆظٹط©طŒ طھظ„ظˆط« ط§ظ„طھط±ط¨ط©	ط¥ط¬ط§ط²ط© ظپظٹ ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© طھط®طµطµ ط¹ظ„ظˆظ… طھط±ط¨ط© â€” ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 1995\nط¯ط¨ظ„ظˆظ… ط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ط¹ظ„ظٹط§ طھط®طµطµ ط¹ظ„ظˆظ… طھط±ط¨ط© â€” ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 1996\nظ…ط§ط¬ط³طھظٹط± ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© â€” ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 2001\nط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© (ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط³ظ…ظٹط¯) â€” ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 2006	\N	t	2024-01-01	\N	\N	\N	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:18.54696	ط§ظ„ط¯ظƒطھظˆط± ط£ظƒط±ظ… ظ…ط­ظ…ط¯ ط§ظ„ط¨ظ„ط®ظٹ	Dr. Akram Mohammed Al-Balkhi	ط¯ظƒطھظˆط±	ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط³ظ…ظٹط¯	1971	ظ…ط­ط¬ط©	ط³ظˆط±ظٹ	ظ…طھط²ظˆط¬	ط£ط³طھط§ط° ظپظٹ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©طŒ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط©طŒ ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ (2021 ط­طھظ‰ طھط§ط±ظٹط®ظ‡).\nظ†ط§ط¦ط¨ ظ…ط¯ظٹط± ط¥ط¯ط§ط±ط© ط§ظ„ط£ط±ط§ط¶ظٹ ظˆط§ط³طھط¹ظ…ط§ظ„ط§طھ ط§ظ„ظ…ظٹط§ظ‡ â€” ط£ظƒط³ط§ط¯ (2026 ط­طھظ‰ طھط§ط±ظٹط®ظ‡).\nظ…ط¯ظٹط± ط¥ط¯ط§ط±ط© ط§ظ„ط£ط±ط§ط¶ظٹ ظˆط§ط³طھط¹ظ…ط§ظ„ط§طھ ط§ظ„ظ…ظٹط§ظ‡ â€” ط£ظƒط³ط§ط¯ (2024â€“2025).\nط®ط¨ظٹط± ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط³ظ…ظٹط¯ â€” ط£ظƒط³ط§ط¯ (2020â€“2024).\nط±ط¦ظٹط³ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© â€” ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط©طŒ ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ (2016â€“2020).\nظ…ط´ط§ط±ظƒ ظپظٹ ظ…ط¤طھظ…ط± COP16 ظ„ط§طھظپط§ظ‚ظٹط© ظ…ظƒط§ظپط­ط© ط§ظ„طھطµط­ط± ظپظٹ ط§ظ„ط±ظٹط§ط¶ 2024.	ط¹ط¶ظˆ ظ†ظ‚ط§ط¨ط© ط§ظ„ظ…ظ‡ظ†ط¯ط³ظٹظ† ط§ظ„ط²ط±ط§ط¹ظٹظٹظ† â€” ط¯ظ…ط´ظ‚ ظ…ظ†ط° 1995\nط¹ط¶ظˆ ظ…ط¬ظ„ط³ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©طŒ ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ ظ…ظ†ط° 2011	ط§ظ„ط¹ط±ط¨ظٹط© (ط§ظ„ط£ظ…)طŒ ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©	/members/akram-mohammed-al-balkhi.jpg	akram-mohammed-al-balkhi
05928724-e393-4cca-b334-4f8e1a7c6ec3	a2000001-0000-0000-0000-000000000007	FOUNDER	SSSS-007	ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©	ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط©طŒ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„طھط·ط¨ظٹظ‚ظٹط©	ط¥ط¬ط§ط²ط© ظپظٹ ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط© â€” ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚طŒ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© 1977\nظ…ط§ط¬ط³طھظٹط± ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© â€” ط¬ط§ظ…ط¹ط© ط§ظ„ط¨ط³طھظ†ط©طŒ ط¨ظˆط¯ط§ط¨ط³طھ 1984\nط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط© â€” ط£ظƒط§ط¯ظٹظ…ظٹط© ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ظ…ط¬ط±ظٹط©طŒ ط¨ظˆط¯ط§ط¨ط³طھ 1988	\N	t	2024-01-01	\N	\N	\N	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:18.54696	ط§ظ„ط¯ظƒطھظˆط± ظ…ط­ظ…ظˆط¯ ط¹ظˆط¯ظ‡	Dr. Mahmoud Oudeh	ط¯ظƒطھظˆط±	ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط©	\N	\N	ط³ظˆط±ظٹ	\N	ط£ط³طھط§ط° ظپظٹ ظ‚ط³ظ… ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹطŒ ظƒظ„ظٹط© ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط©طŒ ط¬ط§ظ…ط¹ط© ط­ظ…طµ.	\N	ط§ظ„ط¹ط±ط¨ظٹط© (ط§ظ„ط£ظ…)	/members/mahmoud-oudeh.jpg	mahmoud-oudeh
1c32da68-7379-4d5d-b832-23801a4580bb	a2000001-0000-0000-0000-000000000008	FOUNDER	SSSS-008	ط¥ط¯ط§ط±ط© ط§ظ„طھط±ط¨ ظˆط§ظ„ظ…ظٹط§ظ‡	ط¬ظٹظˆظƒظٹظ…ظٹط§ط، ط§ظ„طھط±ط¨ط©طŒ ط¥ط¯ط§ط±ط© ط§ظ„طھط±ط¨ ظˆط§ظ„ظ…ظٹط§ظ‡ ظپظٹ ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط¬ط§ظپط©طŒ طھظ‚ظٹظٹظ… ط§ظ„ط£ط±ط§ط¶ظٹ	ط¨ظƒط§ظ„ظˆط±ظٹظˆط³ ظپظٹ ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط© طھط®طµطµ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© â€” ط¬ط§ظ…ط¹ط© ط­ظ„ط¨ 1990\nظ…ط§ط¬ط³طھظٹط± ظپظٹ ط¹ظ„ظˆظ… ط§ظ„ط£ط±ط§ط¶ظٹ â€” ط¬ط§ظ…ط¹ط© ط¹ظٹظ† ط´ظ…ط³ 1997\nط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط¹ظ„ظˆظ… ط§ظ„ط£ط±ط§ط¶ظٹ â€” ط¬ط§ظ…ط¹ط© ط¹ظٹظ† ط´ظ…ط³ 2000	\N	t	2024-01-01	\N	\N	\N	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:18.54696	ط§ظ„ط£ط³طھط§ط° ط§ظ„ط¯ظƒطھظˆط± ظ…ط­ظ…ط¯ ط­ط³ط§ظ… ط¨ظ‡ظ„ظˆط§ظ†	Prof. Dr. Mohammed Hussam Bahlawan	ط£ط³طھط§ط° ط¯ظƒطھظˆط±	ط¬ظٹظˆظƒظٹظ…ظٹط§ط، ط§ظ„طھط±ط¨ط©	1964	ط­ظ„ط¨	ط³ظˆط±ظٹ	ظ…طھط²ظˆط¬	ط£ط³طھط§ط° ظپظٹ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©طŒ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط©طŒ ط¬ط§ظ…ط¹ط© ط­ظ„ط¨ (ظ…ظ†ط° 2014).\nظ…ط¯ظٹط± ظ…ط±ظƒط² ط§ظ„ط£ط¨ط­ط§ط« ط§ظ„ط²ط±ط§ط¹ظٹط© ط¨ط¬ط§ظ…ط¹ط© ط­ظ„ط¨ (2011).\nط£ط³طھط§ط° ظ…ط³ط§ط¹ط¯ ظپظٹ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© (2008).\nط¹ظ…ظ„ ظپظٹ ظ…ط¤ط³ط³ط© ط§ظ„ط§ط³طھطµظ„ط§ط­ â€” ط­ظˆط¶ ط§ظ„ظپط±ط§طھ ط§ظ„ط£ط¯ظ†ظ‰ (1990â€“1992).\nط®ط¨ظٹط± ظپظٹ ط£ظƒط³ط§ط¯ ظ„ط¥ط¯ط§ط±ط© ط§ظ„ط£ط±ط§ط¶ظٹ (2020â€“2021).	ط¹ط¶ظˆ ظپظٹ ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© SSSS	ط§ظ„ط¹ط±ط¨ظٹط© (ط§ظ„ط£ظ…)طŒ ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©	/members/mohammed-hussam-bahlawan.jpg	mohammed-hussam-bahlawan
\.


--
-- TOC entry 6253 (class 0 OID 68546)
-- Dependencies: 254
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.menu_items (id, menu_id, parent_id, label_ar, label_en, url, target, icon, page_id, sort_order, is_active, created_at) FROM stdin;
a6b64fc9-2476-4ffc-afea-f414e9b95bdd	00000000-0000-0000-0000-000000000001	\N	ط§ظ„ط±ط¦ظٹط³ظٹط©	Home	/	_self	\N	\N	0	t	2026-07-10 16:38:23.795489
67198997-3ef2-43de-88a2-24f63e2363c7	00000000-0000-0000-0000-000000000001	\N	ط¹ظ† ط§ظ„ط¬ظ…ط¹ظٹط©	About	/about	_self	\N	\N	1	t	2026-07-10 16:38:23.795489
6a49c796-fff7-4f44-be47-0856fb681303	00000000-0000-0000-0000-000000000001	\N	ط§ظ„ط£ط®ط¨ط§ط±	News	/news	_self	\N	\N	4	t	2026-07-10 16:38:23.795489
c1360794-a5e8-4c78-af63-1ee8fad39f2b	00000000-0000-0000-0000-000000000001	\N	ط§طھطµظ„ ط¨ظ†ط§	Contact	/contact	_self	\N	\N	10	t	2026-07-10 16:38:23.795489
6800a9dd-b542-4b92-b770-26d63180eda8	00000000-0000-0000-0000-000000000001	4306de09-f35f-46b4-b033-ba280d410126	ط§ظ„ط£ط¹ط¶ط§ط،	Members	/members	_self	\N	\N	\N	t	2026-07-10 16:38:23.795489
7eb0cf26-18b9-4ccc-8a42-6d8cbb6f78bc	00000000-0000-0000-0000-000000000001	4306de09-f35f-46b4-b033-ba280d410126	ط§ظ„ظپط¹ط§ظ„ظٹط§طھ	Events	/events	_self	\N	\N	\N	t	2026-07-10 16:38:23.795489
a9ba2d6f-6e07-415f-a993-7e21d496eda8	00000000-0000-0000-0000-000000000001	4306de09-f35f-46b4-b033-ba280d410126	ط±ط³ط§ظ„ط© ط§ظ„ط±ط¦ظٹط³	President Message	/president-message	_self	\N	\N	\N	t	2026-07-10 16:38:23.795489
f123301a-bc7e-443f-b415-29c4ff12c567	00000000-0000-0000-0000-000000000001	4306de09-f35f-46b4-b033-ba280d410126	ط£ط¹ط¶ط§ط، ط§ظ„ظ…ط¬ظ„ط³	Board	/board	_self	\N	\N	\N	t	2026-07-10 16:38:23.795489
6feaa2b3-3e70-43ff-971f-b9bdbb8fc2f2	00000000-0000-0000-0000-000000000001	4306de09-f35f-46b4-b033-ba280d410126	ط§ظ„ظˆط¸ط§ط¦ظپ	Jobs	/jobs	_self	\N	\N	\N	t	2026-07-10 16:38:23.795489
336f028e-5cda-4b72-a9e9-86c513a872c7	00000000-0000-0000-0000-000000000001	4306de09-f35f-46b4-b033-ba280d410126	ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ	Publications	/publications	_self	\N	\N	\N	t	2026-07-10 16:38:23.795489
33c5df76-5d52-41b4-a9ba-9148da307dc8	00000000-0000-0000-0000-000000000001	4306de09-f35f-46b4-b033-ba280d410126	ط§ظ„ظ†ط´ط±ط© ط§ظ„ط¥ط®ط¨ط§ط±ظٹط©	Newsletter	/newsletter	_self	\N	\N	\N	t	2026-07-10 16:38:23.795489
4306de09-f35f-46b4-b033-ba280d410126	00000000-0000-0000-0000-000000000001	\N	ط§ظ‚ط³ط§ظ… ط§ظ„ظ…ظˆظ‚ط¹	Site sections	#	_self	\N	\N	0	t	2026-07-14 22:12:07.593625
\.


--
-- TOC entry 6252 (class 0 OID 68538)
-- Dependencies: 253
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.menus (id, name, location, is_active, created_at, menu_template, dropdown_style, is_default_style, style_config) FROM stdin;
00000000-0000-0000-0000-000000000001	Main Navigation	header	t	2026-07-09 10:39:19.15402	classic	slide	f	\N
\.


--
-- TOC entry 6255 (class 0 OID 68604)
-- Dependencies: 256
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.newsletter_subscribers (id, email, name, is_active, subscribed_at, unsubscribed_at) FROM stdin;
\.


--
-- TOC entry 6233 (class 0 OID 68138)
-- Dependencies: 234
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.notification_preferences (id, user_id, workflow_email, workflow_inapp, email_received_email, email_received_inapp, system_announcement_email, system_announcement_inapp, comment_email, comment_inapp, event_reminder_email, event_reminder_inapp, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6232 (class 0 OID 68120)
-- Dependencies: 233
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.notifications (id, user_id, type, title, body, link, reference_id, reference_type, is_read, is_archived, created_at) FROM stdin;
\.


--
-- TOC entry 6285 (class 0 OID 69292)
-- Dependencies: 286
-- Data for Name: page_audit_trail; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.page_audit_trail (id, page_id, user_id, action, "timestamp", changed_fields) FROM stdin;
0d8d4499-8ff6-4d3c-940a-bef860239cf9	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:06:15.044139	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
fc72ad13-a6cb-48e4-ac8a-354e447ccabc	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:07:05.682233	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
c2bb7c8c-8ba9-4d2c-bc3d-c27a290a3aee	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:07:35.537009	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
b7896411-ed5d-4e46-b05d-9a81ea51e411	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:07:59.966061	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
e893c6d2-0257-4894-a66e-3ab7985c1ff9	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:08:29.871535	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
6537e471-0fc9-4421-ada7-cbb3f12d27e9	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:16:52.5365	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
ffab9fe6-dd57-4295-9290-8b767b01f6c6	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:17:07.93913	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
50a12159-ff91-432e-bf2b-18776775f08e	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:17:26.879542	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
42792038-54a0-478f-ab7d-ef6cc6df79a1	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:18:14.398529	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
04c3e14a-ea6b-44f4-95e8-1f0c15cf7783	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:18:45.22219	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
7de5816a-ba78-4354-92f9-ac93038f99b7	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:47:03.814631	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
2a146300-188c-4c60-9831-a2e09a293946	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:51:10.060462	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
958d6ed2-e63e-4cc4-a711-1a1edfcd4fd6	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:55:49.274149	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
ff2a5d54-26ad-474e-b094-e55f4d462fde	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 03:56:27.409921	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
dcdd5bbe-3fbc-48fe-b6d4-6576f6750662	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 04:13:15.540572	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
dec120ce-7e1a-4682-8ef1-d90f67657e4e	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 04:14:22.853478	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
f45da962-9161-49ac-b068-e1b24761fad8	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 04:14:52.782406	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
60a0b82f-0400-4f31-8324-2accedc53b80	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 04:15:59.323491	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
cb04cd7f-9027-4d35-8920-218054051303	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 04:16:30.134233	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
6fb7aa31-1fa8-4122-9a00-f63b4b018877	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 04:26:16.405342	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
d4c0a399-4c56-4fb7-b629-5d89b74edc97	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 04:47:07.364334	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
26cbca4c-a2c4-474c-ae6f-755428a88acf	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 04:47:32.41003	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
26c4ffa1-38bd-4393-acd1-ea6dbb60f3e0	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 05:02:04.48802	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
dcbed1cc-0958-43ea-847f-c7ede0c6d315	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 05:02:05.849205	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
9cd29906-1661-409e-bd02-59c7a9c1adf5	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 05:02:07.321472	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
914c9edb-87f1-400d-a201-89cd5e5d58a6	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 05:02:35.968001	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
4637e763-8734-47ca-b534-c4bef6003f85	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 05:04:45.522268	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
2a8d1ffe-09c9-4b8f-911e-b7c16aa93b4c	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 05:05:32.535021	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
5350ba3b-02fc-485b-ad94-dc77f38b9cac	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 05:05:42.304949	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
875e07cc-e67b-43ac-940b-50c7428024e8	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 05:05:44.486404	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
df7de888-c9cf-4036-918e-e0ce9ba28d47	f34da8af-5f1c-4cd1-be78-f32962d31e2d	6d6595c0-1835-42be-89a1-1a44b899141c	UPDATE	2026-07-30 05:06:12.433113	{"layoutJson": {"after": "<updated>", "before": "<previous>"}}
\.


--
-- TOC entry 6251 (class 0 OID 68514)
-- Dependencies: 252
-- Data for Name: page_sections; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.page_sections (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at, events_json, conditions_json, version) FROM stdin;
2f1fbf6e-a330-4843-9f87-93dc3eccc262	ea5cd0a4-5d99-4d34-be1d-4ca2511a8138	hero	{"maxWidth": "max-w-5xl"}	{"body": "", "title": "Publications", "titleAr": "ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ", "subtitle": "Explore research papers, reports, and knowledge resources published by the society."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-11 05:17:58.699255	"{}"	"{}"	2
b442b30b-ebb4-416a-a156-d38e5401fce0	7582f946-a41d-4460-a535-bb545f8288e3	hero	{"maxWidth": "max-w-5xl"}	{"title": "News & Announcements", "subtitle": "Read the latest news, articles, and announcements from the society."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
696ef279-3435-4344-a16b-645dc029beaf	582cf8f7-f53d-4fcb-9f78-85f45a39f7dc	hero	{"maxWidth": "max-w-5xl"}	{"title": "Search", "subtitle": "Search across articles, publications, and events."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
adebc2a3-7821-4f11-876e-c0c254a3c61d	fff8b2ef-f7e9-4d96-b545-291807f6da33	hero	{"maxWidth": "max-w-5xl"}	{"title": "Events", "subtitle": "Explore conferences, workshops, seminars, and training opportunities."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
dda04aa1-107b-473d-b59c-1f4568a93941	259bcff7-a75b-44a6-bdce-fa2911c5fed5	hero	{"maxWidth": "max-w-5xl"}	{"title": "Members", "subtitle": "Browse the society member directory and public profiles."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
53d43d87-f839-46e3-b64c-28ffdf97f6a1	7582f946-a41d-4460-a535-bb545f8288e3	news-list-section	{}	{}	{}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
c0b0d4e5-dfe4-4c98-8178-61a680bdcb56	84930958-20f9-4a24-b7e5-01e12fde7b46	newsletter	{}	{"title": "Stay Connected", "content": "Subscribe to our newsletter to receive the latest news, event announcements, and updates from SSSSY."}	{"padding": "py-16", "textColor": "text-gray-900", "backgroundColor": "bg-white"}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
1faa495b-2e05-402a-a05a-5a007fc3aa53	9758e378-5e79-4238-8524-b75491c5b031	board-list-section	{}	{}	{}	20	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
3154212e-b523-482d-a6a1-6e387afff663	9758e378-5e79-4238-8524-b75491c5b031	board-members-grid	{}	{"heading": "Board Leadership", "headingAr": "ظ‚ظٹط§ط¯ط© ط§ظ„ظ…ط¬ظ„ط³", "subheading": "Our leadership team", "subheadingAr": "ظپط±ظٹظ‚ ط§ظ„ظ‚ظٹط§ط¯ط© ظ„ط¯ظٹظ†ط§", "showAllMembers": true}	{"padding": "py-0", "backgroundColor": "bg-white"}	30	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-09 13:04:44.628517	{}	{}	1
bff6f98d-1c78-4bd6-af02-d3fc8efa9ba7	9758e378-5e79-4238-8524-b75491c5b031	board-term-information-section	{}	{"heading": "Our Current Term", "headingAr": "ط¯ظˆط±طھظ†ط§ ط§ظ„ط­ط§ظ„ظٹط©", "paragraphs": [{"textAr": "ظٹط®ط¯ظ… ط§ظ„ظ…ط¬ظ„ط³ ط§ظ„ط­ط§ظ„ظٹ ظ„ظپطھط±ط© 3 ط³ظ†ظˆط§طھ ظ…ظ† 2024 ط¥ظ„ظ‰ 2027طŒ ظ…ظƒط±ط³ط§ظ‹ ظ„طھط·ظˆظٹط± ظ…ظ‡ظ…ط© ط§ظ„ط¬ظ…ط¹ظٹط©.", "textEn": "The current board serves a 3-year term from 2024 to 2027, dedicated to advancing the society's mission."}, {"textAr": "ط³طھظڈط¹ظ‚ط¯ ط§ظ†طھط®ط§ط¨ط§طھ ط§ظ„ظ…ط¬ظ„ط³ ط§ظ„ظ‚ط§ط¯ظ…ط© ظپظٹ ظ…ط·ظ„ط¹ ط¹ط§ظ… 2027. ظٹط­ظ‚ ظ„ط¬ظ…ظٹط¹ ط§ظ„ط£ط¹ط¶ط§ط، ط§ظ„ظپط§ط¹ظ„ظٹظ† ط§ظ„طھطµظˆظٹطھ.", "textEn": "The next board election will be held in early 2027. All active members are eligible to vote."}]}	{}	30	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489	{}	{}	1
7221ee31-ace5-4c94-8ce0-f316d6a3e1cf	84930958-20f9-4a24-b7e5-01e12fde7b46	newsletter-subscribe-form-section	{}	{"titleEn": "Subscribe to Our Newsletter", "descriptionEn": "Receive the latest news, event announcements, research updates, and exclusive content directly to your inbox."}	{"padding": "py-16 md:py-20", "backgroundColor": "bg-white"}	20	ALWAYS	t	fade-in	2026-07-09 13:04:44.628517	2026-07-09 13:04:44.628517	{}	{}	1
f5172e6c-5f4d-44d2-ba72-4726c2dfd5ca	2a295b54-aa30-496c-8ccd-f4f7295b5fdc	contact-hero-banner	{}	{"title": "Contact Us", "titleAr": "ط§طھطµظ„ ط¨ظ†ط§", "subtitle": "Have a question or want to collaborate? We'd love to hear from you.", "subtitleAr": "ظ‡ظ„ ظ„ط¯ظٹظƒ ط³ط¤ط§ظ„ ط£ظˆ طھط±ظٹط¯ ط§ظ„طھط¹ط§ظˆظ†طں ظٹط³ط¹ط¯ظ†ط§ ط§ظ„طھظˆط§طµظ„ ظ…ط¹ظƒ."}	{}	0	ALWAYS	f	\N	2026-07-09 18:49:23.383008	2026-07-10 16:38:23.795489	{}	{}	1
020ff53d-1cf6-450c-823e-9fb1b74d17e4	84930958-20f9-4a24-b7e5-01e12fde7b46	newsletter-hero-banner	{}	{"title": "Stay Connected", "titleAr": "ط§ط¨ظ‚ظژ ط¹ظ„ظ‰ طھظˆط§طµظ„", "subtitle": "Subscribe to receive the latest news and updates from our society.", "subtitleAr": "ط§ط´طھط±ظƒ ظ„طھظ„ظ‚ظ‘ظٹ ط¢ط®ط± ط§ظ„ط£ط®ط¨ط§ط± ظˆط§ظ„طھط­ط¯ظٹط«ط§طھ ظ…ظ† ط¬ظ…ط¹ظٹطھظ†ط§."}	{}	0	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489	{}	{}	1
20647c81-735f-47bb-8c36-0144a3c37ac2	2a295b54-aa30-496c-8ccd-f4f7295b5fdc	contact-info-display-section	{}	{"email": "info@ssssy.org", "phone": "+963 11 234 5678", "address": "Damascus, Syria", "addressAr": "ط¯ظ…ط´ظ‚طŒ ط³ظˆط±ظٹط§"}	{}	20	ALWAYS	f	\N	2026-07-09 18:49:23.383008	2026-07-09 18:49:23.383008	{}	{}	1
1f6064d1-c9e9-4223-9e14-de2647b2c20e	9758e378-5e79-4238-8524-b75491c5b031	board-hero-banner	{}	{"title": "Board of Directors", "titleAr": "ظ…ط¬ظ„ط³ ط§ظ„ط¥ط¯ط§ط±ط©", "subtitle": "Meet the dedicated leaders guiding our society.", "subtitleAr": "طھط¹ط±ظ‘ظپ ط¹ظ„ظ‰ ط§ظ„ظ‚ط§ط¯ط© ط§ظ„ظ…طھظپط§ظ†ظٹظ† ط§ظ„ط°ظٹظ† ظٹظ‚ظˆط¯ظˆظ† ط¬ظ…ط¹ظٹطھظ†ط§."}	{}	0	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489	{}	{}	1
a3a8ec6d-5003-454b-898d-03bd60e9f4d5	9758e378-5e79-4238-8524-b75491c5b031	board-members-intro-grid	{}	{}	{}	10	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-10 16:38:23.795489	{}	{}	1
52c81973-5219-475c-8b95-88738e5c85a1	9758e378-5e79-4238-8524-b75491c5b031	hero	{"maxWidth": "max-w-5xl"}	{"title": "Board Members", "subtitle": "Meet the leadership of the Syrian Soil Science Society."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:10:40.721161	{}	{}	1
f66ac02f-c63d-4c33-a86b-b0267f4d91c2	ea5cd0a4-5d99-4d34-be1d-4ca2511a8138	publications-list-section	{}	{}	{}	2	ALWAYS	f	\N	2026-07-09 13:04:44.628517	2026-07-11 05:17:59.191441	"{}"	"{}"	2
7708b4fd-9b40-4ee4-8ea8-ef5ba25f6eb4	274da4e8-50cf-4aa7-9b95-68619f14ef92	president-message-hero-banner	{}	{"titleAr": "ظƒظ„ظ…ط© ط±ط¦ظٹط³ ط§ظ„ط¬ظ…ط¹ظٹط©", "titleEn": "Message from the President", "minHeight": "420px", "subtitleAr": "ط§ظ„ط¯ظƒطھظˆط± ط¹ط¨ط¯ ط§ظ„ظƒط±ظٹظ… ط¬ط¹ظپط± â€” ظ…ط¤ط³ط³ ظˆط±ط¦ظٹط³ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "subtitleEn": "Dr. Abd Al Karim Jaafar â€” Founder & President, Soil Science Society of Syria"}	{}	10	ALWAYS	t	fade-in	2026-07-30 07:24:18.016546	2026-07-30 07:24:18.016546	{}	{}	1
be8eefa6-d696-47be-8475-e2b0a676ec52	84930958-20f9-4a24-b7e5-01e12fde7b46	hero	{"maxWidth": "max-w-5xl"}	{"title": "Stay Connected", "subtitle": "Subscribe to receive news, events, and updates from the society."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:10:40.721161	{}	{}	1
e87b6bed-58d9-40a2-a6ea-a75d776c7afe	274da4e8-50cf-4aa7-9b95-68619f14ef92	president-message-content-section	{}	{"photo": "/images/president/president-main.jpg", "photo2": "/images/president/president-real.jpg", "quoteAr": "ط¥ظ† ظ‚ظˆط© ط§ظ„ط¬ظ…ط¹ظٹط© طھظƒظ…ظ† ظپظٹ ط£ط¹ط¶ط§ط¦ظ‡ط§ ظˆط´ط±ظƒط§ط¦ظ‡ط§طŒ ظˆظپظٹ ط±ظˆط­ ط§ظ„طھط¹ط§ظˆظ† ط§ظ„طھظٹ طھط¬ظ…ط¹ ط§ظ„ط¹ظ„ظ…ط§ط، ظˆط§ظ„ط¨ط§ط­ط«ظٹظ† ط­ظˆظ„ ظ‡ط¯ظپ ظ…ط´طھط±ظƒ: ظپظ‡ظ… ط§ظ„طھط±ط¨ط© ظˆط­ظ…ط§ظٹطھظ‡ط§ ظˆط¥ط¯ط§ط±طھظ‡ط§ ظ…ظ† ط£ط¬ظ„ ظ…ط³طھظ‚ط¨ظ„ ط£ظپط¶ظ„ ظ„ظ„ط¥ظ†ط³ط§ظ† ظˆط§ظ„ط¨ظٹط¦ط©.", "quoteEn": "The strength of the Society lies in its members, partners, and the spirit of cooperation that brings scientists and researchers together around a common goal: to understand, protect, and sustainably manage soils for a better future for humanity and the environment.", "headingAr": "ظƒظ„ظ…ط© ط±ط¦ظٹط³ ط§ظ„ط¬ظ…ط¹ظٹط©", "headingEn": "Message from the President", "paragraphs": [{"textAr": "طھط£ط³ط³طھ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ط§ظ†ط·ظ„ط§ظ‚ط§ظ‹ ظ…ظ† ط§ظ„ط­ط§ط¬ط© ط¥ظ„ظ‰ ظˆط¬ظˆط¯ ط¥ط·ط§ط± ط¹ظ„ظ…ظٹ ظٹط¬ظ…ط¹ ط§ظ„ظ…ط®طھطµظٹظ† ظˆط§ظ„ط¨ط§ط­ط«ظٹظ† ظˆط§ظ„ظ…ظ‡طھظ…ظٹظ† ط¨ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©طŒ ظˆظٹط¹ظ…ظ„ ط¹ظ„ظ‰ طھط¹ط²ظٹط² ط¯ظˆط± ظ‡ط°ط§ ط§ظ„ط¹ظ„ظ… ط§ظ„ط­ظٹظˆظٹ ظپظٹ ط®ط¯ظ…ط© ط§ظ„ط¥ظ†ط³ط§ظ† ظˆط§ظ„ط¨ظٹط¦ط© ظˆطھط­ظ‚ظٹظ‚ ط§ظ„طھظ†ظ…ظٹط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط©.", "textEn": "The Soil Science Society of Syria (SSSS) was established in response to the need for a scientific framework that brings together specialists, researchers, and those interested in soil science, while enhancing the role of this vital discipline in serving humanity, protecting the environment, and achieving sustainable development."}, {"textAr": "ط¥ظ† ط§ظ„طھط±ط¨ط© ظ„ظٹط³طھ ظ…ط¬ط±ط¯ ظˆط³ط· ظ„ظ†ظ…ظˆ ط§ظ„ظ†ط¨ط§طھط§طھطŒ ط¨ظ„ ظ‡ظٹ ظ†ط¸ط§ظ… ط¨ظٹط¦ظٹ ظ…طھظƒط§ظ…ظ„ ظٹط­ظ…ظ„ ط£ظ‡ظ…ظٹط© ط¨ط§ظ„ط؛ط© ظپظٹ ط¯ط¹ظ… ط§ظ„ط­ظٹط§ط©طŒ ظˆط§ظ„ظ…ط­ط§ظپط¸ط© ط¹ظ„ظ‰ ط§ظ„طھظ†ظˆط¹ ط§ظ„ط­ظٹظˆظٹطŒ ظˆطھظ†ط¸ظٹظ… ط¯ظˆط±ط© ط§ظ„ظ…ظٹط§ظ‡طŒ ظˆط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ طھط­ظ‚ظٹظ‚ ط§ظ„ط£ظ…ظ† ط§ظ„ط؛ط°ط§ط¦ظٹ ظˆظ…ظˆط§ط¬ظ‡ط© ط§ظ„طھط­ط¯ظٹط§طھ ط§ظ„ط¨ظٹط¦ظٹط© ط§ظ„ظ…طھط²ط§ظٹط¯ط©. ظˆظ…ظ† ظ‡ظ†ط§ طھط£طھظٹ ط£ظ‡ظ…ظٹط© طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆطھط¹ط²ظٹط² ظ…ظƒط§ظ†طھظ‡ط§ ط¶ظ…ظ† ظ…ظ†ط¸ظˆظ…ط© ط§ظ„ط¹ظ„ظˆظ… ط§ظ„طھط·ط¨ظٹظ‚ظٹط©.", "textEn": "Soil is not merely a medium for plant growth; it is an integrated ecosystem of great importance for sustaining life, conserving biodiversity, regulating the water cycle, contributing to food security, and addressing the increasing environmental challenges facing our world. Therefore, advancing soil science and strengthening its position among the applied sciences are essential priorities."}, {"textAr": "طھط³ط¹ظ‰ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ط¥ظ„ظ‰ ط£ظ† طھظƒظˆظ† ظ…ظ†طµط© ط¹ظ„ظ…ظٹط© طھط¬ظ…ط¹ ط§ظ„ط®ط¨ط±ط§طھ ظˆط§ظ„ظƒظپط§ط،ط§طھطŒ ظˆطھط´ط¬ط¹ ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ ظˆط§ظ„ط§ط¨طھظƒط§ط±طŒ ظˆطھط¯ط¹ظ… طھط¨ط§ط¯ظ„ ط§ظ„ظ…ط¹ط±ظپط© ط¨ظٹظ† ط§ظ„ط¹ظ„ظ…ط§ط، ظˆط§ظ„ط¨ط§ط­ط«ظٹظ† ظˆط§ظ„ط·ظ„ط§ط¨ ظˆط§ظ„ط¬ظ‡ط§طھ ط§ظ„ظ…ط¹ظ†ظٹط©. ظƒظ…ط§ طھط¹ظ…ظ„ ط¹ظ„ظ‰ ظ†ط´ط± ط«ظ‚ط§ظپط© ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„طھط±ط¨ط©طŒ ظˆطھط¹ط²ظٹط² ط§ظ„طھط¹ط§ظˆظ† ط¨ظٹظ† ط§ظ„ط¬ط§ظ…ط¹ط§طھ ظˆظ…ط±ط§ظƒط² ط§ظ„ط¨ط­ط« ظˆط§ظ„ظ…ط¤ط³ط³ط§طھ ط§ظ„ظˆط·ظ†ظٹط© ظˆط§ظ„ط¯ظˆظ„ظٹط©.", "textEn": "Soil Science Society of Syria seeks to serve as a scientific platform that brings together expertise and competencies, promotes scientific research and innovation, and supports knowledge exchange among scientists, researchers, students, and relevant stakeholders. It also works to promote awareness of sustainable soil management and strengthen cooperation among universities, research centers, and national and international institutions."}, {"textAr": "ظˆطھطھظ…ط«ظ„ ط±ط¤ظٹطھظ†ط§ ظپظٹ ط¨ظ†ط§ط، ظ…ط¬طھظ…ط¹ ط¹ظ„ظ…ظٹ ظ…طھط®طµطµ ظٹط³ظ‡ظ… ظپظٹ طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©طŒ ظˆط¥ظٹط¬ط§ط¯ ط­ظ„ظˆظ„ ط¹ظ„ظ…ظٹط© ظ„ظ„طھط­ط¯ظٹط§طھ ط§ظ„ظ…ط±طھط¨ط·ط© ط¨طھط¯ظ‡ظˆط± ط§ظ„ط£ط±ط§ط¶ظٹطŒ ظˆطھط؛ظٹط± ط§ظ„ظ…ظ†ط§ط®طŒ ظˆط¥ط¯ط§ط±ط© ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©طŒ ط¨ظ…ط§ ظٹط­ظ‚ظ‚ ظ…ط³طھظ‚ط¨ظ„ط§ظ‹ ط£ظƒط«ط± ط§ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط¬ظٹط§ظ„ ط§ظ„ظ‚ط§ط¯ظ…ط©.", "textEn": "Our vision is to build a specialized scientific community that contributes to the advancement of soil science, develops scientific solutions to challenges related to land degradation, climate change, and natural resource management, and supports a more sustainable future for generations to come."}, {"textAr": "ظˆط³طھظˆط§طµظ„ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ط¬ظ‡ظˆط¯ظ‡ط§ ظ…ظ† ط®ظ„ط§ظ„ طھظ†ط¸ظٹظ… ط§ظ„ظ…ط¤طھظ…ط±ط§طھ ظˆط§ظ„ظ†ط¯ظˆط§طھ ط§ظ„ط¹ظ„ظ…ظٹط©طŒ ظˆط¯ط¹ظ… ط§ظ„ط¯ط±ط§ط³ط§طھ ظˆط§ظ„ط£ط¨ط­ط§ط«طŒ ظˆطھط´ط¬ظٹط¹ طھط¯ط±ظٹط¨ ظˆطھط£ظ‡ظٹظ„ ط§ظ„ظƒظˆط§ط¯ط± ط§ظ„ط´ط§ط¨ط©طŒ ظˆط±ط¨ط· ط§ظ„ظ…ط¹ط±ظپط© ط§ظ„ط£ظƒط§ط¯ظٹظ…ظٹط© ط¨ط§ظ„طھط·ط¨ظٹظ‚ط§طھ ط§ظ„ط¹ظ…ظ„ظٹط© ط§ظ„طھظٹ طھط®ط¯ظ… ط§ظ„ظ…ط¬طھظ…ط¹.", "textEn": "Soil Science Society of Syria will continue its efforts through organizing scientific conferences, seminars, and workshops, supporting scientific studies and research, encouraging the training and qualification of young scientific talents, and linking academic knowledge with practical applications that serve society."}], "signatureAr": "ظ…ط¤ط³ط³ ظˆط±ط¦ظٹط³ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "signatureEn": "Founder & President, Soil Science Society of Syria", "presidentName": "Dr. Abd Al Karim Jaafar", "presidentTitle": "Founder & President, Soil Science Society of Syria", "presidentNameAr": "ط§ظ„ط¯ظƒطھظˆط± ط¹ط¨ط¯ ط§ظ„ظƒط±ظٹظ… ط¬ط¹ظپط±", "presidentTitleAr": "ظ…ط¤ط³ط³ ظˆط±ط¦ظٹط³ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©"}	{}	20	ALWAYS	t	fade-in	2026-07-30 07:24:18.016546	2026-07-30 07:24:18.016546	{}	{}	1
9ff5b0e4-ada5-496f-9f45-2d64228e430c	2a295b54-aa30-496c-8ccd-f4f7295b5fdc	contact-form-section	{}	{"heading": "Send Us a Message", "headingAr": "ط£ط±ط³ظ„ ظ„ظ†ط§ ط±ط³ط§ظ„ط©", "showPhone": true, "showSubject": true}	{}	10	ALWAYS	f	\N	2026-07-09 18:49:23.383008	2026-07-10 16:38:23.795489	{}	{}	1
34febba0-d8a0-489e-9e93-88cc8b5ed559	2a295b54-aa30-496c-8ccd-f4f7295b5fdc	social-media-links-section	{}	{"twitterUrl": "https://twitter.com/ssssy", "youtubeUrl": "https://youtube.com/@ssssy", "facebookUrl": "https://facebook.com/ssssy", "linkedinUrl": "https://linkedin.com/company/ssssy"}	{}	20	ALWAYS	f	\N	2026-07-09 18:49:23.383008	2026-07-10 16:38:23.795489	{}	{}	1
12310b8d-afd6-494f-a205-265b2c87d4fa	ea5cd0a4-5d99-4d34-be1d-4ca2511a8138	publications-hero-banner	{}	{"title": "Our Publications", "titleAr": "ظ…ظ†ط´ظˆط±ط§طھظ†ط§", "subtitle": "Explore our research papers, reports, and knowledge resources.", "subtitleAr": "ط§ط³طھط¹ط±ط¶ ط£ظˆط±ط§ظ‚ظ†ط§ ط§ظ„ط¨ط­ط«ظٹط© ظˆطھظ‚ط§ط±ظٹط±ظ†ط§ ظˆظ…طµط§ط¯ط± ط§ظ„ظ…ط¹ط±ظپط©."}	{}	1	ALWAYS	f	\N	2026-07-09 16:57:53.899677	2026-07-11 05:17:59.191441	"{}"	"{}"	2
df347c12-4b14-4e88-aea5-9f0b16dcae69	582cf8f7-f53d-4fcb-9f78-85f45a39f7dc	search	{"placeholder": "Search articles, publications, events..."}	{"title": "Search the Website"}	{"padding": "py-12", "textColor": "text-gray-900", "backgroundColor": "bg-white"}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
e57b1302-cd6b-449a-950a-e6ec46041bc5	1061a09f-975d-427a-92fa-c09f4dc98368	hero	{"maxWidth": "max-w-5xl"}	{"title": "Jobs", "subtitle": "Explore career opportunities at SSSSY and partner organizations."}	{"padding": "py-16", "textColor": "text-white", "backgroundColor": "bg-soil-dark"}	0	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
f97442a5-e230-492e-9d94-2b59c1f55f85	1061a09f-975d-427a-92fa-c09f4dc98368	jobs-list-section	{}	{}	{}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
e8842885-b6d9-4bde-9bc1-371018b1ff2b	259bcff7-a75b-44a6-bdce-fa2911c5fed5	members-list-section	{}	{}	{}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
ba0285da-3392-429e-8bb5-af6eae548dfe	fff8b2ef-f7e9-4d96-b545-291807f6da33	events-list-section	{}	{}	{}	10	ALWAYS	f	\N	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	{}	{}	1
94dfd8bc-297b-4dbf-9795-c533218c4c53	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-hero-banner	{}	{"badgeAr": "ظ…ظڈط±ط®ظژظ‘طµط© ط¨ظ…ظˆط¬ط¨ ط§ظ„ظ‚ط±ط§ط± ط±ظ‚ظ… 1054.7", "badgeEn": "Licensed under Decree No. 1054.7", "titleAr": "ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "titleEn": "Soil Science Society of Syria", "subtitleAr": "ظ…ط¤ط³ط³ط© ط¹ظ„ظ…ظٹط© ط؛ظٹط± ط±ط¨ط­ظٹط© â€” ط¯ظ…ط´ظ‚طŒ ط³ظˆط±ظٹط§", "subtitleEn": "A Non-Profit Scientific Institution â€” Damascus, Syria", "descriptionAr": "طھط£ط³ط³طھ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ط¨ظ…ظˆط¬ط¨ ط§ظ„ظ‚ط±ط§ط± ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹ ظˆط§ظ„طھط´ط±ظٹط¹ط§طھ ط§ظ„ظ†ط§ظپط°ط©طŒ ظˆطھطھط®ط° ظ…ظ† ظƒظ„ظٹط© ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© ظپظٹ ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ ظ…ظ‚ط±ط§ظ‹ ظ„ظ‡ط§طŒ ظˆطھط´ظ…ظ„ ط£ظ†ط´ط·طھظ‡ط§ ظƒط§ظپط© ط£ط±ط§ط¶ظٹ ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹط© ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ط³ظˆط±ظٹط©.", "descriptionEn": "The Soil Science Society of Syria was established under official decree and applicable legislation, headquartered at the Faculty of Agricultural Engineering, University of Damascus, covering the entire territory of the Syrian Arab Republic."}	{"padding": "py-20 md:py-28", "textAlign": "text-center", "backgroundColor": "bg-gradient-to-br from-green-900 via-green-800 to-green-700"}	10	ALWAYS	t	fade-in	2026-07-30 03:43:57.356189	2026-07-30 03:43:57.356189	{}	{}	1
f713d517-dadc-4a3c-83d9-04a9a4d7793c	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-overview-section	{}	{"headingAr": "ظ†ط¸ط±ط© ط¹ط§ظ…ط© ط¹ظ† ط§ظ„ط¬ظ…ط¹ظٹط©", "headingEn": "Society Overview", "paragraphsAr": ["طھظڈط´ظ‡ظژظ‘ط± ط§ظ„ط¬ظ…ط¹ظٹط© ظپظٹ ظ…ط­ط§ظپط¸ط© ط¯ظ…ط´ظ‚ ط¨ط§ط³ظ… آ«ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©آ»طŒ ظˆطھطھظ†ط§ظˆظ„ ظ†ط´ط§ط·ظ‡ط§ ظƒط§ظپط© ط£ط±ط§ط¶ظٹ ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹط© ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظˆظپظ‚ ط£ط­ظƒط§ظ… ظ‚ط§ظ†ظˆظ† ط§ظ„ط¬ظ…ط¹ظٹط§طھ ظˆط§ظ„ظ…ط¤ط³ط³ط§طھ ط§ظ„ط®ط§طµط© ط±ظ‚ظ… 93 ظ„ط¹ط§ظ… 1958 ظˆط§ظ„ظ‚ط±ط§ط± ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹ ط±ظ‚ظ… 9/9 ظ„ط¹ط§ظ… 2025.", "ظٹظ‚ط¹ ظ…ظ‚ط± ط§ظ„ط¬ظ…ط¹ظٹط© ظپظٹ ظ…ط¯ظٹظ†ط© ط¯ظ…ط´ظ‚ â€” ظƒظ„ظٹط© ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© ظپظٹ ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚. ط§ظ„ط¹ظ†ظˆط§ظ† ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ: a.karimjaafar@gmail.com", "طھظڈطµظ†ظژظ‘ظپ ط§ظ„ط¬ظ…ط¹ظٹط© ط¶ظ…ظ† ط£ط±ط¨ط¹ط© ظ…ط¬ط§ظ„ط§طھ ط±ط¦ظٹط³ظٹط©: ط§ظ„ط¨ظٹط¦ط© â€” ط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„طھظ…ظƒظٹظ† â€” ط§ظ„طھظ†ظ…ظٹط© ظˆط§ظ„ط¥ط³ظƒط§ظ† â€” ط§ظ„ط«ظ‚ط§ظپط© ظˆط§ظ„ط±ظٹط§ط¶ط© ظˆط§ظ„طھط³ظ„ظٹط© ظˆط§ظ„ظپظ†ظˆظ†."], "paragraphsEn": ["The Society is registered in Damascus governorate under the name آ«Soil Science Society of Syriaآ», and its activities cover the entire territory of the Syrian Arab Republic in accordance with Law No. 93 of 1958 on Associations and Private Institutions, and Presidential Decree No. 9/9 of 2025.", "The Society's headquarters is located in Damascus â€” Faculty of Agricultural Engineering, University of Damascus. Email: a.karimjaafar@gmail.com", "The Society is classified under four main fields: Environment â€” Education & Empowerment â€” Development & Housing â€” Culture, Sports, Recreation & Arts."], "classificationsAr": ["ط§ظ„ط¨ظٹط¦ط©", "ط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„طھظ…ظƒظٹظ†", "ط§ظ„طھظ†ظ…ظٹط© ظˆط§ظ„ط¥ط³ظƒط§ظ†", "ط§ظ„ط«ظ‚ط§ظپط© ظˆط§ظ„ط±ظٹط§ط¶ط© ظˆط§ظ„ظپظ†ظˆظ†"], "classificationsEn": ["Environment", "Education & Empowerment", "Development & Housing", "Culture, Sports & Arts"]}	{"padding": "py-16 md:py-20", "backgroundColor": "bg-white"}	20	ALWAYS	t	fade-in	2026-07-30 03:43:57.356189	2026-07-30 03:43:57.356189	{}	{}	1
62496758-163c-4918-a44e-05fcfdda616e	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-decree-section	{}	{"imageAlt": "Official founding decree of the Soil Science Society of Syria", "imageUrl": "/images/founding-decree.jpg", "captionAr": "ط§ظ„ظ‚ط±ط§ط± ط±ظ‚ظ… 1054.7 ط§ظ„طµط§ط¯ط± ط¹ظ† ظˆط²ط§ط±ط© ط§ظ„ط´ط¤ظˆظ† ط§ظ„ط§ط¬طھظ…ط§ط¹ظٹط© ظˆط§ظ„ط¹ظ…ظ„ â€” ط¯ظ…ط´ظ‚طŒ 2025", "captionEn": "Decree No. 1054.7 issued by the Ministry of Social Affairs and Labour â€” Damascus, 2025", "headingAr": "ظˆط«ظٹظ‚ط© ط§ظ„طھط£ط³ظٹط³ ط§ظ„ط±ط³ظ…ظٹط©", "headingEn": "Official Founding Decree"}	{"padding": "py-14 md:py-18", "backgroundColor": "bg-gray-50"}	30	ALWAYS	t	fade-in	2026-07-30 03:43:57.356189	2026-07-30 03:43:57.356189	{}	{}	1
7cf59bc1-5fcc-428e-bb30-a9ce2d5ad429	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-objectives-section	{}	{"headingAr": "ط§ظ„ط£ظ‡ط¯ط§ظپ ظˆط§ظ„ظ†ط´ط§ط· ط§ظ„ط±ط¦ظٹط³ظٹ", "headingEn": "Objectives & Core Activities", "objectives": [{"icon": "ًںŒ±", "bodyAr": "ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط­ظ…ط§ظٹط© ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط© ظˆط¯ط¹ظ… ط§ظ„طھظ†ظ…ظٹط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط©.", "bodyEn": "Contributing to the protection of natural resources and supporting sustainable development.", "titleAr": "ط­ظ…ط§ظٹط© ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©", "titleEn": "Protecting Natural Resources", "numberAr": "ظ،", "numberEn": "1"}, {"icon": "ًںŒچ", "bodyAr": "ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط­ظ…ط§ظٹط© ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظˆط§ظ„ط­ط¯ ظ…ظ† طھط¯ظ‡ظˆط±ظ‡ط§.", "bodyEn": "Contributing to the protection of Syrian soil and combating its degradation.", "titleAr": "ط­ظ…ط§ظٹط© ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "titleEn": "Protecting Syrian Soil", "numberAr": "ظ¢", "numberEn": "2"}, {"icon": "ًں”¬", "bodyAr": "ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ طھط¹ط²ظٹط² ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ ظپظٹ ظ…ط¬ط§ظ„ط§طھ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„ط¨ظٹط¦ط© ظˆط§ظ„طھظ†ظ…ظٹط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط©طŒ ظˆط¯ط¹ظ… ط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ط£ظƒط§ط¯ظٹظ…ظٹط© ظˆط§ظ„طھط·ط¨ظٹظ‚ظٹط© ط§ظ„طھظٹ طھط³ظ‡ظ… ظپظٹ ظ…ظˆط§ط¬ظ‡ط© ط§ظ„طھط؛ظٹط± ط§ظ„ظ…ظ†ط§ط®ظٹ ظˆط­ظ…ط§ظٹط© ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©.", "bodyEn": "Promoting scientific research in soil science, environment, and sustainable development, supporting academic and applied studies addressing climate change and natural resource protection.", "titleAr": "طھط¹ط²ظٹط² ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ", "titleEn": "Promoting Scientific Research", "numberAr": "ظ£", "numberEn": "3"}, {"icon": "ًں“ڑ", "bodyAr": "ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط¥طµط¯ط§ط± ظˆظ†ط´ط± ط§ظ„ظƒطھط¨ ظˆط§ظ„ط¯ظˆط±ظٹط§طھ ط§ظ„ط¹ظ„ظ…ظٹط© ط¨ط§ظ„ظ„ط؛طھظٹظ† ط§ظ„ط¹ط±ط¨ظٹط© ظˆط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط© ظˆطھظˆط«ظٹظ‚ ظˆظ†ط´ط± ط§ظ„ظ…ط¹ط±ظپط© ط§ظ„ط¹ظ„ظ…ظٹط© ظˆط¥ط¨ط±ط§ط² ط§ظ„ط¥ظ†ط¬ط§ط²ط§طھ ط§ظ„ظ…ط­ظ„ظٹط© ط¨ط¹ط¯ ط£ط®ط° ط§ظ„ظ…ظˆط§ظپظ‚ط§طھ ط§ظ„ظ„ط§ط²ظ…ط©.", "bodyEn": "Publishing books and scientific journals in Arabic and English, documenting and disseminating scientific knowledge, and highlighting local achievements after obtaining necessary approvals.", "titleAr": "ط§ظ„ظ†ط´ط± ط§ظ„ط¹ظ„ظ…ظٹ", "titleEn": "Scientific Publishing", "numberAr": "ظ¤", "numberEn": "4"}, {"icon": "ًںژ“", "bodyAr": "ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط¨ظ†ط§ط، ظ‚ط¯ط±ط§طھ ط§ظ„ظƒظˆط§ط¯ط± ط§ظ„ظˆط·ظ†ظٹط© ظ…ظ† ط¨ط§ط­ط«ظٹظ† ظˆط·ظ„ط§ط¨ ظˆظ…ط²ط§ط±ط¹ظٹظ† ظˆظ…ط¬طھظ…ط¹ط§طھ ظ…ط­ظ„ظٹط© ط¹ط¨ط± ط§ظ„طھط¯ط±ظٹط¨ ط§ظ„ظ…ط³طھظ…ط± ظˆط§ظ„ط¯ظˆط±ط§طھ ط§ظ„طھط¹ظ„ظٹظ…ظٹط© ط§ظ„ظ…طھط®طµطµط©.", "bodyEn": "Building the capacity of national cadres â€” researchers, students, farmers, and local communities â€” through continuous training and specialized educational courses.", "titleAr": "ط¨ظ†ط§ط، ط§ظ„ظ‚ط¯ط±ط§طھ ط§ظ„ظˆط·ظ†ظٹط©", "titleEn": "Building National Capacity", "numberAr": "ظ¥", "numberEn": "5"}, {"icon": "ًںڈ«", "bodyAr": "ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ طھط·ظˆظٹط± ط§ظ„ط¹ظ…ظ„ظٹط© ط§ظ„طھط¹ظ„ظٹظ…ظٹط© ظپظٹ ط¬ظ…ظٹط¹ ظ…ط³طھظˆظٹط§طھظ‡ط§ â€” ط§ظ„طھط¹ظ„ظٹظ… ط§ظ„ط£ط³ط§ط³ظٹ ظˆط§ظ„ط«ط§ظ†ظˆظٹ ظˆطھط¹ظ„ظٹظ… ط§ظ„ظƒط¨ط§ط± ظˆط§ظ„طھط¹ظ„ظٹظ… ط§ظ„ط¹ط§ظ„ظٹ ظˆط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ط¹ظ„ظٹط§ â€” ظ…ظ† ط®ظ„ط§ظ„ ط¥ط¹ط¯ط§ط¯ ط¨ط±ط§ظ…ط¬ ظ…ط³ط§ط¹ط¯ط© ظˆظ…ظ†ط§ظ‡ط¬ طھط¹ظ„ظٹظ…ظٹط© ظ…ط¹ ط§ظ„ط¬ط§ظ…ط¹ط§طھ ظˆط§ظ„ظ…ط¹ط§ظ‡ط¯.", "bodyEn": "Developing education at all levels â€” basic, secondary, adult education, higher education, and postgraduate studies â€” through supportive programs and curricula developed with universities and institutes.", "titleAr": "طھط·ظˆظٹط± ط§ظ„ط¹ظ…ظ„ظٹط© ط§ظ„طھط¹ظ„ظٹظ…ظٹط©", "titleEn": "Developing Education", "numberAr": "ظ¦", "numberEn": "6"}, {"icon": "ًں’¼", "bodyAr": "ط§ظ„ط¥ط³ظ‡ط§ظ… ظپظٹ طھظ…ظƒظٹظ† ط§ظ„ظ…ط¬طھظ…ط¹ط§طھ ط§ظ‚طھطµط§ط¯ظٹط§ظ‹ ظˆط§ط¬طھظ…ط§ط¹ظٹط§ظ‹ ط¹ط¨ط± ط¯ط¹ظ… ط§ظ„ظ…ط´ط§ط±ظٹط¹ ط§ظ„طµط؛ظٹط±ط© ظˆط§ظ„ظ…طھظˆط³ط·ط©طŒ ظˆطھظ†ظ…ظٹط© ط§ظ„ظ…ظ‡ط§ط±ط§طھ ط§ظ„ظ…ظ‡ظ†ظٹط©طŒ ظˆط®ظ„ظ‚ ظپط±طµ ط¹ظ…ظ„ ط¬ط¯ظٹط¯ط© ط®ط§طµط© ظ„ظ„ط´ط¨ط§ط¨ ظˆط§ظ„ظ†ط³ط§ط، ظˆط§ظ„ظپط¦ط§طھ ط§ظ„ظ‡ط´ط©.", "bodyEn": "Empowering communities economically and socially through supporting small and medium enterprises, developing professional skills, and creating new employment opportunities especially for youth, women, and vulnerable groups.", "titleAr": "ط§ظ„طھظ…ظƒظٹظ† ط§ظ„ط§ظ‚طھطµط§ط¯ظٹ ظˆط§ظ„ط§ط¬طھظ…ط§ط¹ظٹ", "titleEn": "Economic & Social Empowerment", "numberAr": "ظ§", "numberEn": "7"}, {"icon": "ًںڈکï¸ڈ", "bodyAr": "ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط¯ط¹ظ… ظ…ط´ط§ط±ظٹط¹ ط§ظ„طھظ†ظ…ظٹط© ظˆط§ظ„ط¥ط³ظƒط§ظ† ظˆطھط­ط³ظٹظ† ط§ظ„ط¨ظٹط¦ط© ط§ظ„ط¹ظ…ط±ط§ظ†ظٹط© ظˆط§ظ„ط³ظƒظ†ظٹط© ظˆطھط´ط¬ظٹط¹ ط§ظ„ط­ظ„ظˆظ„ ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظپظٹ ط§ظ„طھط®ط·ظٹط· ط§ظ„ط­ط¶ط±ظٹ ظˆط¥ط¹ط§ط¯ط© ط§ظ„ط¥ط¹ظ…ط§ط±.", "bodyEn": "Supporting development and housing projects, improving the urban and residential environment, and encouraging sustainable solutions in urban planning and reconstruction.", "titleAr": "ط§ظ„طھظ†ظ…ظٹط© ظˆط§ظ„ط¥ط³ظƒط§ظ†", "titleEn": "Development & Housing", "numberAr": "ظ¨", "numberEn": "8"}, {"icon": "ًںŒ؟", "bodyAr": "ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ظ†ط´ط± ط§ظ„طھظˆط¹ظٹط© ط§ظ„ط¨ظٹط¦ظٹط© ظˆط§ظ„ظ…ط¬طھظ…ط¹ظٹط© ط¨ط£ظ‡ظ…ظٹط© ط§ظ„طھط±ط¨ط© ظˆط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط© ظƒط±ظƒظٹط²ط© ظ„طھط­ظ‚ظٹظ‚ ط§ظ„ط£ظ…ظ† ط§ظ„ط؛ط°ط§ط¦ظٹ ظˆط¶ظ…ط§ظ† ط§ظ„طھظˆط§ط²ظ† ط§ظ„ط¨ظٹط¦ظٹ.", "bodyEn": "Promoting environmental and community awareness of the importance of soil and natural resources as a cornerstone for achieving food security and environmental balance.", "titleAr": "ط§ظ„طھظˆط¹ظٹط© ط§ظ„ط¨ظٹط¦ظٹط©", "titleEn": "Environmental Awareness", "numberAr": "ظ©", "numberEn": "9"}, {"icon": "ًں¤‌", "bodyAr": "ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط¥ظ‚ط§ظ…ط© ظ…ط±ط§ظƒط² ط£ط¨ط­ط§ط« ظˆطھط¹ط§ظˆظ† ظ…ط¹ ط§ظ„ط¬ط§ظ…ط¹ط§طھ ظˆط§ظ„ظ…ظ†ط¸ظ…ط§طھ ط§ظ„ظ…ط­ظ„ظٹط© ظˆط§ظ„ط¯ظˆظ„ظٹط© ظˆطھط¨ط§ط¯ظ„ ط§ظ„ط®ط¨ط±ط§طھ ط¨ط¹ط¯ ط£ط®ط° ط§ظ„ظ…ظˆط§ظپظ‚ط§طھ ط§ظ„ظ„ط§ط²ظ…ط©.", "bodyEn": "Establishing research centers and cooperation with local and international universities and organizations, exchanging expertise after obtaining necessary approvals.", "titleAr": "ط§ظ„ط´ط±ط§ظƒط© ظˆط§ظ„طھط¹ط§ظˆظ† ط§ظ„ط¯ظˆظ„ظٹ", "titleEn": "Partnerships & International Cooperation", "numberAr": "ظ،ظ ", "numberEn": "10"}], "subheadingAr": "ط§ظ„ظ…ط§ط¯ط© 3 ظ…ظ† ط§ظ„ظ†ط¸ط§ظ… ط§ظ„ط¯ط§ط®ظ„ظٹ â€” ط£ظ‡ط¯ط§ظپ ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط¹ط´ط±ط©", "subheadingEn": "Article 3 of the Internal Bylaws â€” Ten Society Objectives"}	{"padding": "py-16 md:py-20", "backgroundColor": "bg-green-50"}	40	ALWAYS	t	fade-in	2026-07-30 03:43:57.356189	2026-07-30 03:43:57.356189	{}	{}	1
7248993a-571a-4f61-b7fc-26f5c7ef44af	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-membership-section	{}	{"feesAr": "ط±ط³ظ… ط§ظ„ط§ظ†طھط³ط§ط¨: 300,000 ظ„.ط³ â€” ط±ط³ظ… ط§ظ„ط§ط´طھط±ط§ظƒ ط§ظ„ط³ظ†ظˆظٹ: 100,000 ظ„.ط³", "feesEn": "Registration fee: SYP 300,000 â€” Annual subscription fee: SYP 100,000", "headingAr": "ط§ظ„ط¹ط¶ظˆظٹط©", "headingEn": "Membership", "conditionsAr": ["ط£ظ„ط§ ظٹظƒظˆظ† ظ…ط­ظƒظˆظ…ط§ظ‹ ط¨ط¬ظ†ط§ظٹط© ط£ظˆ ط¨ط¬ظ†ط­ط© ط´ط§ط¦ظ†ط©", "ط£ظ† ظٹظƒظˆظ† ط­ط³ظ† ط§ظ„ط³ظ„ظˆظƒ ظˆط§ظ„ط³ظٹط±ط©", "ط£ظ† ظٹظƒظˆظ† ظ…ظ‚ظٹظ…ط§ظ‹ ط¯ط§ط®ظ„ ط£ط±ط§ط¶ظٹ ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹط© ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ط³ظˆط±ظٹط©", "ط£ظ† ظٹطھط¬ط§ظˆط² ط§ظ„ط«ط§ظ…ظ†ط© ط¹ط´ط± ظ…ظ† ط§ظ„ط¹ظ…ط±", "ط£ظ† ظٹظ‚ط¨ظ„ ظƒطھط§ط¨ط©ظ‹ ظ†ط¸ط§ظ… ط§ظ„ط¬ظ…ط¹ظٹط©", "ط£ظ† ظٹطھظ‚ط¯ظ… ط¨ط·ظ„ط¨ ظ„ظ„ط§ظ†طھط³ط§ط¨ ظ…ط±ظپظ‚ط§ظ‹ ط¨ط±ط³ظ… ط§ظ„ط§ظ†طھط³ط§ط¨", "ط£ظ† ظٹظƒظˆظ† ط­ط§ظ…ظ„ط§ظ‹ ظ„ط´ظ‡ط§ط¯ط© ط§ظ„ظ…ط¹ظ‡ط¯ ط§ظ„ط²ط±ط§ط¹ظٹ ظƒط­ط¯ ط£ط¯ظ†ظ‰"], "conditionsEn": ["Not convicted of a felony or a disgraceful misdemeanor", "Must be of good conduct and character", "Must be a resident within the Syrian Arab Republic", "Must be over eighteen years of age", "Must have accepted the Society's bylaws in writing", "Must submit a membership application with the registration fee", "Must hold at minimum an agricultural institute certificate"], "subheadingAr": "ط§ظ„ظ…ط§ط¯ط© 4 â€” ط£ظ†ظˆط§ط¹ ط§ظ„ط¹ط¶ظˆظٹط© ظˆط­ظ‚ظˆظ‚ظ‡ط§", "subheadingEn": "Article 4 â€” Membership Types and Rights", "membershipTypes": [{"icon": "ًں‘¤", "descAr": "ظٹظ‚ط¨ظ„ ظƒطھط§ط¨ط©ظ‹ ط§ظ„ظ†ط¸ط§ظ… ط§ظ„ط¯ط§ط®ظ„ظٹ ظ„ظ„ط¬ظ…ط¹ظٹط© ظˆظٹظ„طھط²ظ… ط¨طھط³ط¯ظٹط¯ ط±ط³ظˆظ… ط§ظ„ط§ظ†طھط³ط§ط¨ ظˆط§ظ„ط§ط´طھط±ط§ظƒطŒ ظˆظٹط­ظ‚ ظ„ظ‡ ط­ط¶ظˆط± ط§ط¬طھظ…ط§ط¹ط§طھ ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ظˆط§ظ„طھطµظˆظٹطھ.", "descEn": "Accepts the bylaws in writing, pays registration and subscription fees, and is entitled to attend and vote in General Assembly meetings.", "titleAr": "ط§ظ„ط¹ط¶ظˆ ط§ظ„ط¹ط§ظ…ظ„", "titleEn": "Working Member"}, {"icon": "ًں¤²", "descAr": "ظٹط±ط؛ط¨ ط¨طھظ‚ط¯ظٹظ… ط§ظ„ط¯ط¹ظ… ط§ظ„ظ…ط§ط¯ظٹ ط£ظˆ ط§ظ„ظ…ط¹ظ†ظˆظٹ ط£ظˆ ظƒظ„ظٹظ‡ظ…ط§طŒ ظˆظ„ظٹط³ ظ„ظ‡ ط­ظ‚ ط­ط¶ظˆط± ط§ط¬طھظ…ط§ط¹ط§طھ ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط©.", "descEn": "Wishes to provide financial or moral support (or both), without the right to attend General Assembly meetings.", "titleAr": "ط§ظ„ط¹ط¶ظˆ ط§ظ„ظ…ط¤ط§ط²ط±", "titleEn": "Supporting Member"}, {"icon": "ًںڈ…", "descAr": "طھظ…ظ†ط­ظ‡ ط§ظ„ط¬ظ…ط¹ظٹط© ظ‡ط°ظ‡ ط§ظ„طµظپط© طھظ‚ط¯ظٹط±ط§ظ‹ ظ„ظ„ط®ط¯ظ…ط§طھ ط§ظ„ط¬ظ„ظٹظ„ط© ط§ظ„طھظٹ ط£ط³ط¯ط§ظ‡ط§ ظ„ظ‡ط§.", "descEn": "Granted by the Society in recognition of outstanding services rendered to it.", "titleAr": "ط¹ط¶ظˆ ط§ظ„ط´ط±ظپ", "titleEn": "Honorary Member"}], "conditionsHeadingAr": "ط´ط±ظˆط· ط§ظ„ط¹ط¶ظˆظٹط©", "conditionsHeadingEn": "Membership Conditions"}	{"padding": "py-16 md:py-20", "backgroundColor": "bg-white"}	50	ALWAYS	t	fade-in	2026-07-30 03:43:57.356189	2026-07-30 03:43:57.356189	{}	{}	1
daae2cd6-276f-420d-90d8-fb3736ede65f	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-governance-section	{}	{"roles": [{"icon": "ًں‘‘", "descAr": "ظٹظ…ط«ظ„ ط§ظ„ط¬ظ…ط¹ظٹط© ط£ظ…ط§ظ… ط§ظ„ظ‚ط¶ط§ط، ظˆظپظٹ ط¹ظ„ط§ظ‚ط§طھظ‡ط§ ظ…ط¹ ط§ظ„ط¬ظ…ظ‡ظˆط± ظˆط§ظ„ط¯ظˆط§ط¦ط± ط§ظ„ط±ط³ظ…ظٹط©طŒ ظˆظ‡ظˆ ط¢ظ…ط± ط§ظ„طµط±ظپ ظپظٹ ط¬ظ…ظٹط¹ ظ†ظپظ‚ط§طھ ط§ظ„ط¬ظ…ط¹ظٹط©.", "descEn": "Represents the Society before courts and in its relations with the public and official bodies; is the payment authorizing officer.", "titleAr": "ط§ظ„ط±ط¦ظٹط³", "titleEn": "President"}, {"icon": "ًں¤‌", "descAr": "ظٹظ‚ظˆظ… ط¨ظ…ظ‡ط§ظ… ط§ظ„ط±ط¦ظٹط³ ط£ط«ظ†ط§ط، ط؛ظٹط§ط¨ظ‡ ظˆط¨ظƒظ„ ط¹ظ…ظ„ ظٹط³ظ†ط¯ظ‡ ط¥ظ„ظٹظ‡.", "descEn": "Performs the President's duties during absence and any other duties assigned.", "titleAr": "ظ†ط§ط¦ط¨ ط§ظ„ط±ط¦ظٹط³", "titleEn": "Vice President"}, {"icon": "ًں“‌", "descAr": "ظٹط¯ظˆظ‘ظ† ظ…ط­ط§ط¶ط± ط§ظ„ط§ط¬طھظ…ط§ط¹ط§طھطŒ ظˆظٹط­ط±ط± ط§ظ„ط¯ط¹ظˆط§طھطŒ ظˆظٹط³طھظ„ظ… ط§ظ„ظ…ط±ط§ط³ظ„ط§طھطŒ ظˆظٹط­ظپط¸ ط§ظ„ط³ط¬ظ„ط§طھ ظˆط§ظ„ط£ط®طھط§ظ….", "descEn": "Records meeting minutes, drafts invitations, manages correspondence, and safeguards records and seals.", "titleAr": "ط£ظ…ظٹظ† ط§ظ„ط³ط±", "titleEn": "Secretary General"}, {"icon": "ًں’°", "descAr": "ظٹط´ط±ظپ ط¹ظ„ظ‰ ط§ظ„ط±ط³ظˆظ… ظˆط§ظ„ظ…ط¨ط§ظ„ط؛ ط§ظ„ظˆط§ط±ط¯ط©طŒ ظٹط¤ط¯ظٹ ط§ظ„ظ†ظپظ‚ط§طھطŒ ظˆظٹظ‚ط¯ظ… طھظ‚ط±ظٹط±ط§ظ‹ ظ…ط§ظ„ظٹط§ظ‹ ط´ظ‡ط±ظٹط§ظ‹ ظ„ظ…ط¬ظ„ط³ ط§ظ„ط¥ط¯ط§ط±ط©.", "descEn": "Oversees fees and incoming funds, authorizes expenditures, and presents a monthly financial report to the Board.", "titleAr": "ط£ظ…ظٹظ† ط§ظ„طµظ†ط¯ظˆظ‚", "titleEn": "Treasurer"}, {"icon": "ًں§‘â€چâڑ–ï¸ڈ", "descAr": "ط«ظ„ط§ط«ط© ط£ط¹ط¶ط§ط، ط¥ط¶ط§ظپظٹظˆظ† طھظ†طھط®ط¨ظ‡ظ… ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ظ„ظ„ظ…ط´ط§ط±ظƒط© ظپظٹ ظ‚ط±ط§ط±ط§طھ ط¥ط¯ط§ط±ط© ط§ظ„ط¬ظ…ط¹ظٹط© ظˆطھط´ظƒظٹظ„ ط§ظ„ظ„ط¬ط§ظ† ط§ظ„ظ„ط§ط²ظ…ط©.", "descEn": "Three additional elected members participating in governance decisions and forming required committees.", "titleAr": "ط£ط¹ط¶ط§ط، ط§ظ„ظ…ط¬ظ„ط³", "titleEn": "Board Members"}], "termAr": "ظ…ط¯ط© ط§ظ„ظˆظ„ط§ظٹط©: ط³ظ†طھط§ظ† ظ‚ط§ط¨ظ„ط© ظ„ظ„طھط¬ط¯ظٹط¯", "termEn": "Term: 2 years, renewable", "introAr": "طھظڈط¯ط§ط± ط§ظ„ط¬ظ…ط¹ظٹط© ظ…ظ† ط®ظ„ط§ظ„ ظ‡ظٹط¦ط© ط¹ط§ظ…ط© طھط¶ظ… ط¬ظ…ظٹط¹ ط§ظ„ط£ط¹ط¶ط§ط، ط§ظ„ط¹ط§ظ…ظ„ظٹظ† ط§ظ„ظ…ظ„طھط²ظ…ظٹظ†طŒ ظˆطھظ†طھط®ط¨ ظ…ط¬ظ„ط³ ط¥ط¯ط§ط±ط© ظ…ط¤ظ„ظپ ظ…ظ† 7 ط£ط¹ط¶ط§ط، ظ„ظ…ط¯ط© ط³ظ†طھظٹظ† ظ‚ط§ط¨ظ„ط© ظ„ظ„طھط¬ط¯ظٹط¯.", "introEn": "The Society is governed by a General Assembly of all compliant active members, which elects a Board of Directors of 7 members for a renewable two-year term.", "headingAr": "ط§ظ„ظ‡ظٹظƒظ„ ط§ظ„طھظ†ط¸ظٹظ…ظٹ", "headingEn": "Governance Structure", "boardSizeAr": "ط¹ط¯ط¯ ط£ط¹ط¶ط§ط، ظ…ط¬ظ„ط³ ط§ظ„ط¥ط¯ط§ط±ط©: 7 ط£ط¹ط¶ط§ط، (ط¹ط¯ط¯ ظپط±ط¯ظٹطŒ ط§ظ„ط­ط¯ ط§ظ„ط£ط¯ظ†ظ‰ 5)", "boardSizeEn": "Board size: 7 members (odd number, minimum 5)", "electionsAr": "ط§ظ„ط§ظ†طھط®ط§ط¨ط§طھ: ط³ط±ظٹط© ظˆظ…ط¨ط§ط´ط±ط© ظپظٹ ط§ط¬طھظ…ط§ط¹ ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ط§ظ„ط³ظ†ظˆظٹ", "electionsEn": "Elections: Secret and direct during the annual General Assembly meeting"}	{"padding": "py-16 md:py-20", "backgroundColor": "bg-green-50"}	60	ALWAYS	t	fade-in	2026-07-30 03:43:57.356189	2026-07-30 03:43:57.356189	{}	{}	1
c882b00c-ea0c-42e4-9886-6306fe31b6b3	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-founders-section	{}	{"introAr": "طھط£ط³ط³طھ ط§ظ„ط¬ظ…ط¹ظٹط© ط¨ط¬ظ‡ظˆط¯ ط£ط­ط¯ ط¹ط´ط± ط¹ط¶ظˆط§ظ‹ ظ…ط¤ط³ط³ط§ظ‹طŒ ط¬ظ…ظٹط¹ظ‡ظ… ط­ط§ظ…ظ„ظˆظ† ظ„ط´ظ‡ط§ط¯ط© ط§ظ„ط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© ظ…ظ† ط¬ط§ظ…ط¹ط§طھ ط³ظˆط±ظٹط©.", "introEn": "The Society was founded by eleven founding members, all holding PhDs in Agricultural Engineering from Syrian universities.", "founders": [{"phone": "0993170794", "nameAr": "ط¹ط¨ط¯ ط§ظ„ظƒط±ظٹظ… ط£ط­ظ…ط¯ ط¬ط¹ظپط±", "nameEn": "Abdulkarim Ahmad Jaafar", "roleAr": "ط±ط¦ظٹط³ ط§ظ„ط¬ظ…ط¹ظٹط© â€” ظ…ط¤ط³ط³", "roleEn": "President â€” Founding Member", "birthdate": "30/06/1981", "residenceAr": "ط¯ظ…ط´ظ‚طŒ ظ…ط³ط§ظƒظ† ط¨ط±ط²ط©طŒ ط¬ط§ظ†ط¨ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط©", "residenceEn": "Damascus, Barzeh, near Faculty of Agriculture", "birthplaceAr": "ط§ظ„ط±ظ‚ط©", "birthplaceEn": "Al-Raqqa", "qualificationAr": "ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©", "qualificationEn": "PhD in Agricultural Engineering"}, {"phone": "0952425381", "nameAr": "ط³ظ„ظٹظ…ط§ظ† ظ…ط­ظ…ظˆط¯ ط³ظ„ظٹظ…", "nameEn": "Suleiman Mahmoud Salim", "roleAr": "ظ†ط§ط¦ط¨ ط±ط¦ظٹط³ ط§ظ„ط¬ظ…ط¹ظٹط© â€” ظ…ط¤ط³ط³", "roleEn": "Vice President â€” Founding Member", "birthdate": "01/10/1966", "residenceAr": "ط±ظٹظپ ط¯ظ…ط´ظ‚ â€” طµط­ظ†ط§ظٹط§", "residenceEn": "Rural Damascus â€” Sahnaya", "birthplaceAr": "ط§ظ„ظٹط±ظ…ظˆظƒ", "birthplaceEn": "Al-Yarmouk", "qualificationAr": "ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©", "qualificationEn": "PhD in Agricultural Engineering"}, {"phone": "0966296815", "nameAr": "ط£ظƒط±ظ… ظ…ط­ظ…ط¯ ط§ظ„ط¨ظ„ط®ظٹ", "nameEn": "Akram Mohammad Al-Balkhi", "roleAr": "ط¹ط¶ظˆ ظ…ط¬ظ„ط³ â€” ظ…ط¤ط³ط³", "roleEn": "Board Member â€” Founding Member", "birthdate": "06/10/1971", "residenceAr": "ط¯ظ…ط´ظ‚طŒ ظ…ط³ط§ظƒظ† ط¨ط±ط²ط©طŒ ط¬ط§ظ†ط¨ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط©", "residenceEn": "Damascus, Barzeh, near Faculty of Agriculture", "birthplaceAr": "ظ…ط­ط¬ط©", "birthplaceEn": "Mahajjeh", "qualificationAr": "ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©", "qualificationEn": "PhD in Agricultural Engineering"}, {"phone": "0944893467", "nameAr": "ظ…ط­ظ…ظˆط¯ ط£ظ†ظٹط³ ط¹ظˆط¯ط©", "nameEn": "Mahmoud Anis Oudeh", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³", "roleEn": "Founding Member", "birthdate": "06/12/1956", "residenceAr": "ط­ظ…طµ â€” ط³ظƒط±ط© ط§ظ„ط؛ط±ط¨ظٹط©", "residenceEn": "Homs â€” West Sukkarah", "birthplaceAr": "ط³ظƒط±ط©", "birthplaceEn": "Sukkarah", "qualificationAr": "ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©", "qualificationEn": "PhD in Agricultural Engineering"}, {"phone": "0932448989", "nameAr": "ط­ظٹط¯ط± ظ‡ط§ط´ظ… ط§ظ„ط­ط³ظ†", "nameEn": "Haidar Hashem Al-Hassan", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³", "roleEn": "Founding Member", "birthdate": "01/01/1976", "residenceAr": "ط­ظ…طµ â€” ظƒط±ظ… ط§ظ„ظ„ظˆط²", "residenceEn": "Homs â€” Karm Al-Loz", "birthplaceAr": "ظƒظپط±ط¹ط¨ط¯ظ‡", "birthplaceEn": "Kfar-Abda", "qualificationAr": "ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©", "qualificationEn": "PhD in Agricultural Engineering"}, {"phone": "0994513509", "nameAr": "ظ„ط¤ظٹ ظ…ط­ظ…ظˆط¯ ط§ظ„ط±ظپط§ط¹ظٹ", "nameEn": "Luay Mahmoud Al-Rifai", "roleAr": "ط£ظ…ظٹظ† ط§ظ„طµظ†ط¯ظˆظ‚ â€” ظ…ط¤ط³ط³", "roleEn": "Treasurer â€” Founding Member", "birthdate": "10/08/1986", "residenceAr": "ط±ظٹظپ ط¯ظ…ط´ظ‚ â€” طµط­ظ†ط§ظٹط§", "residenceEn": "Rural Damascus â€” Sahnaya", "birthplaceAr": "ظٹط¨ط±ظˆط¯", "birthplaceEn": "Yabroud", "qualificationAr": "ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©", "qualificationEn": "PhD in Agricultural Engineering"}, {"phone": "0933334783", "nameAr": "ظ…ط­ظ…ط¯ ظ…ظ†ظ‡ظ„ ط¹ظˆط¶ ط§ظ„ط­ط³ظٹظ† ط§ظ„ط²ط¹ط¨ظٹ", "nameEn": "Mohammad Manhal Awad Al-Zoubi", "roleAr": "ط¹ط¶ظˆ ظ…ط¬ظ„ط³ â€” ظ…ط¤ط³ط³", "roleEn": "Board Member â€” Founding Member", "birthdate": "19/11/1971", "residenceAr": "ط±ظٹظپ ط¯ظ…ط´ظ‚ â€” ط¯ط§ط±ظٹط§", "residenceEn": "Rural Damascus â€” Darayya", "birthplaceAr": "ط¯ط±ط¹ط§ ط§ظ„ظ…ط­ط·ط©", "birthplaceEn": "Daraa Al-Mahatta", "qualificationAr": "ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©", "qualificationEn": "PhD in Agricultural Engineering"}, {"phone": "0934451168", "nameAr": "ط¹ظ„ط§ط، ط­ط³ظ† ط®ظ„ظˆظپ", "nameEn": "Alaa Hassan Khalouf", "roleAr": "ط£ظ…ظٹظ† ط§ظ„ط³ط± â€” ظ…ط¤ط³ط³", "roleEn": "Secretary General â€” Founding Member", "birthdate": "07/12/1983", "residenceAr": "ط¯ظ…ط´ظ‚ â€” ط§ظ„ظ…ط¯ظٹظ†ط© ط§ظ„ظ‚ط¯ظٹظ…ط©", "residenceEn": "Damascus â€” Old City", "birthplaceAr": "ط­ظ…طµ", "birthplaceEn": "Homs", "qualificationAr": "ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©", "qualificationEn": "PhD in Agricultural Engineering"}, {"phone": "", "nameAr": "ظ…ط­ظ…ط¯ ط³ط¹ظٹط¯ ظ…ط­ظ…ط¯ ط¯ظٹط¨ ط§ظ„ط´ط§ط·ط±", "nameEn": "Mohammad Saeed Al-Shater", "roleAr": "ط¹ط¶ظˆ ظ…ط¬ظ„ط³ â€” ظ…ط¤ط³ط³", "roleEn": "Board Member â€” Founding Member", "birthdate": "06/06/1950", "residenceAr": "ط¯ظ…ط´ظ‚ â€” ط¨ط±ط§ظ…ظƒط©", "residenceEn": "Damascus â€” Barmakeh", "birthplaceAr": "ط¯ظ…ط´ظ‚", "birthplaceEn": "Damascus", "qualificationAr": "ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©", "qualificationEn": "PhD in Agricultural Engineering"}, {"phone": "0944984574", "nameAr": "ط¹ظ…ط± ط¹ط¨ط¯ ط§ظ„ظ„ظ‡ ط¹ط¨ط¯ ط§ظ„ط±ط²ط§ظ‚", "nameEn": "Omar Abdullah Abd Al-Razzaq", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³", "roleEn": "Founding Member", "birthdate": "23/04/1962", "residenceAr": "ط¯ظٹط± ط§ظ„ط²ظˆط± â€” ظپظٹظ„ط§طھ ط§ظ„ط¨ظ„ط¯ظٹط©", "residenceEn": "Deir ez-Zor â€” Municipal Villas", "birthplaceAr": "ط§ظ„ظ…ظٹط§ط¯ظٹظ†", "birthplaceEn": "Mayadin", "qualificationAr": "ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©", "qualificationEn": "PhD in Agricultural Engineering"}, {"phone": "0944984574", "nameAr": "ظ…ط­ظ…ط¯ ط­ط³ط§ظ… ط¨ظ‡ظ„ظˆط§ظ†", "nameEn": "Mohammad Hussam Bahlawan", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³", "roleEn": "Founding Member", "birthdate": "03/02/1964", "residenceAr": "ط­ظ„ط¨ â€” ط§ظ„ط´ظ‡ط¨ط§ط، ط§ظ„ط¬ط¯ظٹط¯ط©طŒ ط´ط§ط±ط¹ ط§ظ„ط؛ط²ط§ظ„ظٹ", "residenceEn": "Aleppo â€” New Shahba, Al-Ghazali Street", "birthplaceAr": "ط­ظ„ط¨", "birthplaceEn": "Aleppo", "qualificationAr": "ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©", "qualificationEn": "PhD in Agricultural Engineering"}], "headingAr": "ط§ظ„ط£ط¹ط¶ط§ط، ط§ظ„ظ…ط¤ط³ط³ظˆظ†", "headingEn": "Founding Members", "subheadingAr": "ط§ظ„ظ…ط§ط¯ط© 56 â€” ط£ط¹ط¶ط§ط، ظ…ط¬ظ„ط³ ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط¤ط³ط³ظˆظ†", "subheadingEn": "Article 56 â€” Founding Board Members"}	{"padding": "py-16 md:py-20", "backgroundColor": "bg-white"}	70	ALWAYS	t	fade-in	2026-07-30 03:43:57.356189	2026-07-30 03:43:57.356189	{}	{}	1
a0000071-0000-0000-0000-000000000001	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-gallery-section	{"layout": {"gap": 16, "type": "masonry", "columns": {"wide": 4, "mobile": 1, "tablet": 2, "desktop": 3}, "aspectRatio": "auto", "borderRadius": 8}, "hoverEffects": {"effect": "zoom", "overlayColor": "dark", "overlayOpacity": 60, "showTitleOnHover": true, "showDescriptionOnHover": false}}	{"images": [], "heading": "Photo Gallery", "headingAr": "ظ…ط¹ط±ط¶ ط§ظ„طµظˆط±", "subheading": "A glimpse into our events, conferences, and field activities.", "subheadingAr": "ظ„ظ…ط­ط© ط¹ظ† ظپط¹ط§ظ„ظٹط§طھظ†ط§ ظˆظ…ط¤طھظ…ط±ط§طھظ†ط§ ظˆط£ظ†ط´ط·طھظ†ط§ ط§ظ„ظ…ظٹط¯ط§ظ†ظٹط©."}	{"padding": "py-16 md:py-20", "backgroundColor": "bg-soil-sand/30"}	70	ALWAYS	t	fade-in	2026-07-30 04:43:47.989319	2026-07-30 04:43:47.989319	{}	{}	1
a0000069-0000-0000-0000-000000000001	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-vision-mission-section	{}	{"panels": [{"icon": "Target", "titleAr": "ط±ط¤ظٹطھظ†ط§", "titleEn": "Our Vision", "contentAr": "ط£ظ† ظ†ظƒظˆظ† ط§ظ„ط³ظ„ط·ط© ط§ظ„ط¹ظ„ظ…ظٹط© ط§ظ„ط±ط§ط¦ط¯ط© ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§ ظˆط§ظ„ظ…ظ†ط·ظ‚ط©طŒ ظˆظ†ظڈط¹ط²ط² ظ…ط³طھظ‚ط¨ظ„ط§ظ‹ طھظڈط¯ط§ط± ظپظٹظ‡ ط§ظ„طھط±ط¨ط© ط¨ط§ط³طھط¯ط§ظ…ط©.", "contentEn": "To be the leading scientific authority on soil science in Syria and the region, fostering a future where soils are managed sustainably.", "gradientClass": "from-forest to-forest-light"}, {"icon": "Eye", "titleAr": "ط±ط³ط§ظ„طھظ†ط§", "titleEn": "Our Mission", "contentAr": "طھط¹ط²ظٹط² ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ط¨ط­ط« ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„ظ…ظ†ط§طµط±ط©طŒ ظˆطھط¹ط²ظٹط² ظ…ظ…ط§ط±ط³ط§طھ ط§ظ„ط§ط³طھط®ط¯ط§ظ… ط§ظ„ظ…ط³طھط¯ط§ظ… ظ„ظ„ط£ط±ط§ط¶ظٹ.", "contentEn": "To advance soil science through research, education, and advocacy, promoting sustainable land use practices.", "gradientClass": "from-soil-clay to-soil-dark"}, {"icon": "List", "titleAr": "ط£ظ‡ط¯ط§ظپظ†ط§", "titleEn": "Our Objectives", "contentAr": "طھط¹ط²ظٹط² ط§ظ„ط¨ط­ط« ظˆطھط³ظ‡ظٹظ„ طھط¨ط§ط¯ظ„ ط§ظ„ظ…ط¹ط±ظپط© ظˆط¯ط¹ظ… ط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„طھط¯ط±ظٹط¨ ظˆط§ظ„ظ…ظ†ط§طµط±ط© ظ…ظ† ط£ط¬ظ„ ط³ظٹط§ط³ط§طھ طµط¯ظٹظ‚ط© ظ„ظ„طھط±ط¨ط©.", "contentEn": "Promote research, facilitate knowledge exchange, support education and training, advocate for soil-friendly policies.", "gradientClass": "from-forest-light to-forest"}], "heading": "Vision, Mission & Objectives", "headingAr": "ط§ظ„ط±ط¤ظٹط© ظˆط§ظ„ط±ط³ط§ظ„ط© ظˆط§ظ„ط£ظ‡ط¯ط§ظپ", "subheading": "Our guiding principles that shape every initiative and program we undertake.", "subheadingAr": "ظ…ط¨ط§ط¯ط¦ظ†ط§ ط§ظ„طھظˆط¬ظٹظ‡ظٹط© ط§ظ„طھظٹ طھط´ظƒظ‘ظ„ ظƒظ„ ظ…ط¨ط§ط¯ط±ط© ظˆط¨ط±ظ†ط§ظ…ط¬ ظ†ط¶ط·ظ„ط¹ ط¨ظ‡."}	{"padding": "py-16 md:py-20", "backgroundColor": "bg-soil-sand/30"}	25	ALWAYS	t	fade-in	2026-07-30 04:23:49.118507	2026-07-30 04:23:49.118507	{}	{}	1
a0000070-0000-0000-0000-000000000001	f34da8af-5f1c-4cd1-be78-f32962d31e2d	about-documents-section	{}	{"heading": "Downloadable Documents", "documents": [{"url": "/documents/bylaws.pdf", "labelAr": "ط§ظ„ظ†ط¸ط§ظ… ط§ظ„ط¯ط§ط®ظ„ظٹ ظ„ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "labelEn": "SSSS Bylaws (Internal Regulations)", "fileType": "PDF"}, {"url": "/documents/founding-decree.jpg", "labelAr": "ظˆط«ظٹظ‚ط© ط§ظ„طھط£ط³ظٹط³ ط§ظ„ط±ط³ظ…ظٹط© â€” ط§ظ„ظ‚ط±ط§ط± ط±ظ‚ظ… 1054.7", "labelEn": "Founding Decree â€” No. 1054.7", "fileType": "JPG"}, {"url": "/documents/society-seal.jpg", "labelAr": "ط§ظ„ط®طھظ… ط§ظ„ط±ط³ظ…ظٹ ظ„ظ„ط¬ظ…ط¹ظٹط©", "labelEn": "Official Society Seal", "fileType": "JPG"}, {"url": "/documents/society-logo-display.jpg", "labelAr": "ط´ط¹ط§ط± ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط±ط³ظ…ظٹ", "labelEn": "Society Logo (Official Display)", "fileType": "JPG"}], "headingAr": "ط§ظ„ظˆط«ط§ط¦ظ‚ ط§ظ„ظ‚ط§ط¨ظ„ط© ظ„ظ„طھظ†ط²ظٹظ„"}	{"padding": "py-16 md:py-20", "backgroundColor": "bg-white"}	60	ALWAYS	t	fade-in	2026-07-30 04:37:08.903408	2026-07-30 04:43:47.989319	{}	{}	1
\.


--
-- TOC entry 6290 (class 0 OID 69406)
-- Dependencies: 291
-- Data for Name: page_sections_backup; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.page_sections_backup (id, page_id, component_type, config, data, styling, sort_order, visibility, is_animated, animation_type, created_at, updated_at, events_json, conditions_json, version) FROM stdin;
\.


--
-- TOC entry 6287 (class 0 OID 69335)
-- Dependencies: 288
-- Data for Name: page_templates; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.page_templates (id, name, category, description, layout_json, thumbnail_url, usage_count, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6286 (class 0 OID 69315)
-- Dependencies: 287
-- Data for Name: page_workflow_transitions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.page_workflow_transitions (id, page_id, from_state, to_state, user_id, "timestamp", notes) FROM stdin;
\.


--
-- TOC entry 6250 (class 0 OID 68488)
-- Dependencies: 251
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.pages (id, title_ar, title_en, slug, layout_type, is_published, is_homepage, parent_id, sort_order, author_id, created_at, updated_at, deleted_at, meta_title, meta_description, og_title, og_description, og_image_url, layout_json, workflow_status, allowed_roles, visibility, translation_group_id, language, created_by) FROM stdin;
f34da8af-5f1c-4cd1-be78-f32962d31e2d	ط¹ظ† ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©	About the Soil Science Society of Syria	about	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-30 05:05:42.309425	\N	ط¹ظ† ط§ظ„ط¬ظ…ط¹ظٹط© | ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©	طھط¹ط±ظپ ط¹ظ„ظ‰ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©طŒ طھط£ط³ظٹط³ظ‡ط§ ط§ظ„ظ‚ط§ظ†ظˆظ†ظٹطŒ ط£ظ‡ط¯ط§ظپظ‡ط§طŒ ظ‡ظٹظƒظ„ظ‡ط§ ط§ظ„طھظ†ط¸ظٹظ…ظٹطŒ ظˆط£ط¹ط¶ط§ط¤ظ‡ط§ ط§ظ„ظ…ط¤ط³ط³ظˆظ†.	ط¹ظ† ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©	ط¬ظ…ط¹ظٹط© ط¹ظ„ظ…ظٹط© ط؛ظٹط± ط±ط¨ط­ظٹط© ظ…ظƒط±ط³ط© ظ„ط­ظ…ط§ظٹط© ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظˆطھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھظ†ظ…ظٹط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط©.	http://localhost:3000/images/og-about.jpg	{"version":"1","blocks":[{"id":"94dfd8bc-297b-4dbf-9795-c533218c4c53","type":"about-hero-banner","props":{"title":"About the Syrian Soil Science Society","titleAr":"ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©","subtitle":"Learn about our society, our history, and our commitment to advancing soil science in Syria.","subtitleAr":"ظ…ط¤ط³ط³ط© ط¹ظ„ظ…ظٹط© ط؛ظٹط± ط±ط¨ط­ظٹط© â€” ط¯ظ…ط´ظ‚طŒ ط³ظˆط±ظٹط§","primaryButtonLabel":"","primaryButtonLabelAr":"","primaryButtonUrl":"","secondaryButtonLabel":"","secondaryButtonLabelAr":"","secondaryButtonUrl":"","visibility":"ALWAYS","padding":"py-20 md:py-28","textAlign":"text-center","backgroundColor":"bg-gradient-to-br from-green-900 via-green-800 to-green-700","badgeAr":"ظ…ظڈط±ط®ظژظ‘طµط© ط¨ظ…ظˆط¬ط¨ ط§ظ„ظ‚ط±ط§ط± ط±ظ‚ظ… 1054.7","badgeEn":"Licensed under Decree No. 1054.7","titleEn":"Soil Science Society of Syria","subtitleEn":"A Non-Profit Scientific Institution â€” Damascus, Syria","descriptionAr":"طھط£ط³ط³طھ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ط¨ظ…ظˆط¬ط¨ ط§ظ„ظ‚ط±ط§ط± ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹ ظˆط§ظ„طھط´ط±ظٹط¹ط§طھ ط§ظ„ظ†ط§ظپط°ط©طŒ ظˆطھطھط®ط° ظ…ظ† ظƒظ„ظٹط© ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© ظپظٹ ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ ظ…ظ‚ط±ط§ظ‹ ظ„ظ‡ط§طŒ ظˆطھط´ظ…ظ„ ط£ظ†ط´ط·طھظ‡ط§ ظƒط§ظپط© ط£ط±ط§ط¶ظٹ ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹط© ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ط³ظˆط±ظٹط©.","descriptionEn":"The Soil Science Society of Syria was established under official decree and applicable legislation, headquartered at the Faculty of Agricultural Engineering, University of Damascus, covering the entire territory of the Syrian Arab Republic.","visibilityRules":[]},"children":[]},{"id":"f713d517-dadc-4a3c-83d9-04a9a4d7793c","type":"about-overview-section","props":{"heading":"Society Overview","headingAr":"ظ†ط¸ط±ط© ط¹ط§ظ…ط© ط¹ظ† ط§ظ„ط¬ظ…ط¹ظٹط©","paragraphs":[{"0":"طھ","1":"ظڈ","2":"ط´","3":"ظ‡","4":"ظژ","5":"ظ‘","6":"ط±","7":" ","8":"ط§","9":"ظ„","10":"ط¬","11":"ظ…","12":"ط¹","13":"ظٹ","14":"ط©","15":" ","16":"ظپ","17":"ظٹ","18":" ","19":"ظ…","20":"ط­","21":"ط§","22":"ظپ","23":"ط¸","24":"ط©","25":" ","26":"ط¯","27":"ظ…","28":"ط´","29":"ظ‚","30":" ","31":"ط¨","32":"ط§","33":"ط³","34":"ظ…","35":" ","36":"آ«","37":"ط¬","38":"ظ…","39":"ط¹","40":"ظٹ","41":"ط©","42":" ","43":"ط¹","44":"ظ„","45":"ظˆ","46":"ظ…","47":" ","48":"ط§","49":"ظ„","50":"طھ","51":"ط±","52":"ط¨","53":"ط©","54":" ","55":"ط§","56":"ظ„","57":"ط³","58":"ظˆ","59":"ط±","60":"ظٹ","61":"ط©","62":"آ»","63":"طŒ","64":" ","65":"ظˆ","66":"طھ","67":"طھ","68":"ظ†","69":"ط§","70":"ظˆ","71":"ظ„","72":" ","73":"ظ†","74":"ط´","75":"ط§","76":"ط·","77":"ظ‡","78":"ط§","79":" ","80":"ظƒ","81":"ط§","82":"ظپ","83":"ط©","84":" ","85":"ط£","86":"ط±","87":"ط§","88":"ط¶","89":"ظٹ","90":" ","91":"ط§","92":"ظ„","93":"ط¬","94":"ظ…","95":"ظ‡","96":"ظˆ","97":"ط±","98":"ظٹ","99":"ط©","100":" ","101":"ط§","102":"ظ„","103":"ط¹","104":"ط±","105":"ط¨","106":"ظٹ","107":"ط©","108":" ","109":"ط§","110":"ظ„","111":"ط³","112":"ظˆ","113":"ط±","114":"ظٹ","115":"ط©","116":" ","117":"ظˆ","118":"ظپ","119":"ظ‚","120":" ","121":"ط£","122":"ط­","123":"ظƒ","124":"ط§","125":"ظ…","126":" ","127":"ظ‚","128":"ط§","129":"ظ†","130":"ظˆ","131":"ظ†","132":" ","133":"ط§","134":"ظ„","135":"ط¬","136":"ظ…","137":"ط¹","138":"ظٹ","139":"ط§","140":"طھ","141":" ","142":"ظˆ","143":"ط§","144":"ظ„","145":"ظ…","146":"ط¤","147":"ط³","148":"ط³","149":"ط§","150":"طھ","151":" ","152":"ط§","153":"ظ„","154":"ط®","155":"ط§","156":"طµ","157":"ط©","158":" ","159":"ط±","160":"ظ‚","161":"ظ…","162":" ","163":"9","164":"3","165":" ","166":"ظ„","167":"ط¹","168":"ط§","169":"ظ…","170":" ","171":"1","172":"9","173":"5","174":"8","175":" ","176":"ظˆ","177":"ط§","178":"ظ„","179":"ظ‚","180":"ط±","181":"ط§","182":"ط±","183":" ","184":"ط§","185":"ظ„","186":"ط¬","187":"ظ…","188":"ظ‡","189":"ظˆ","190":"ط±","191":"ظٹ","192":" ","193":"ط±","194":"ظ‚","195":"ظ…","196":" ","197":"9","198":"/","199":"9","200":" ","201":"ظ„","202":"ط¹","203":"ط§","204":"ظ…","205":" ","206":"2","207":"0","208":"2","209":"5","210":".","textEn":"The Syrian Soil Science Society (SSSS) is a professional, non-profit scientific organization dedicated to the advancement of soil science in Syria. Founded in 2025, the society brings together researchers, educators, students, and practitioners working in soil science and related environmental fields.SSSSY serves as a platform for knowledge exchange, scientific collaboration, and professional development. Through conferences, workshops, publications, and outreach programs, the society promotes sustainable soil management practices.","textAr":"ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© (ط¬.ط³.ط¹.طھ) ظ‡ظٹ ظ…ظ†ط¸ظ…ط© ظ…ظ‡ظ†ظٹط© ط؛ظٹط± ط±ط¨ط­ظٹط© ظ…ظƒط±ط³ط© ظ„طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§. طھط£ط³ط³طھ ط¹ط§ظ… 2025طŒ ظˆطھط¬ظ…ط¹ ط§ظ„ط¨ط§ط­ط«ظٹظ† ظˆط§ظ„ظ…ط¹ظ„ظ…ظٹظ† ظˆط§ظ„ط·ظ„ط§ط¨ ظˆط§ظ„ظ…ظ…ط§ط±ط³ظٹظ† ط§ظ„ط¹ط§ظ…ظ„ظٹظ† ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„ظ…ط¬ط§ظ„ط§طھ ط§ظ„ط¨ظٹط¦ظٹط© ط°ط§طھ ط§ظ„طµظ„ط©.طھط¹ظ…ظ„ ط§ظ„ط¬ظ…ط¹ظٹط© ظƒظ…ظ†طµط© ظ„طھط¨ط§ط¯ظ„ ط§ظ„ظ…ط¹ط±ظپط© ظˆط§ظ„طھط¹ط§ظˆظ† ط§ظ„ط¹ظ„ظ…ظٹ ظˆط§ظ„طھط·ظˆظٹط± ط§ظ„ظ…ظ‡ظ†ظٹطŒ ظˆطھط¹ط²ط² ظ…ظ…ط§ط±ط³ط§طھ ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„طھط±ط¨ط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ظ…ط¤طھظ…ط±ط§طھ ظˆط§ظ„ظˆط±ط´ ظˆط§ظ„ظ…ظ†ط´ظˆط±ط§طھ."},"ظٹظ‚ط¹ ظ…ظ‚ط± ط§ظ„ط¬ظ…ط¹ظٹط© ظپظٹ ظ…ط¯ظٹظ†ط© ط¯ظ…ط´ظ‚ â€” ظƒظ„ظٹط© ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© ظپظٹ ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚. ط§ظ„ط¹ظ†ظˆط§ظ† ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ: a.karimjaafar@gmail.com","طھظڈطµظ†ظژظ‘ظپ ط§ظ„ط¬ظ…ط¹ظٹط© ط¶ظ…ظ† ط£ط±ط¨ط¹ط© ظ…ط¬ط§ظ„ط§طھ ط±ط¦ظٹط³ظٹط©: ط§ظ„ط¨ظٹط¦ط© â€” ط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„طھظ…ظƒظٹظ† â€” ط§ظ„طھظ†ظ…ظٹط© ظˆط§ظ„ط¥ط³ظƒط§ظ† â€” ط§ظ„ط«ظ‚ط§ظپط© ظˆط§ظ„ط±ظٹط§ط¶ط© ظˆط§ظ„طھط³ظ„ظٹط© ظˆط§ظ„ظپظ†ظˆظ†."],"visibility":"ALWAYS","padding":"py-16 md:py-20","backgroundColor":"bg-white","headingEn":"Society Overview","paragraphsAr":["طھظڈط´ظ‡ظژظ‘ط± ط§ظ„ط¬ظ…ط¹ظٹط© ظپظٹ ظ…ط­ط§ظپط¸ط© ط¯ظ…ط´ظ‚ ط¨ط§ط³ظ… آ«ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©آ»طŒ ظˆطھطھظ†ط§ظˆظ„ ظ†ط´ط§ط·ظ‡ط§ ظƒط§ظپط© ط£ط±ط§ط¶ظٹ ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹط© ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظˆظپظ‚ ط£ط­ظƒط§ظ… ظ‚ط§ظ†ظˆظ† ط§ظ„ط¬ظ…ط¹ظٹط§طھ ظˆط§ظ„ظ…ط¤ط³ط³ط§طھ ط§ظ„ط®ط§طµط© ط±ظ‚ظ… 93 ظ„ط¹ط§ظ… 1958 ظˆط§ظ„ظ‚ط±ط§ط± ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹ ط±ظ‚ظ… 9/9 ظ„ط¹ط§ظ… 2025.","ظٹظ‚ط¹ ظ…ظ‚ط± ط§ظ„ط¬ظ…ط¹ظٹط© ظپظٹ ظ…ط¯ظٹظ†ط© ط¯ظ…ط´ظ‚ â€” ظƒظ„ظٹط© ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© ظپظٹ ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚. ط§ظ„ط¹ظ†ظˆط§ظ† ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ: a.karimjaafar@gmail.com","طھظڈطµظ†ظژظ‘ظپ ط§ظ„ط¬ظ…ط¹ظٹط© ط¶ظ…ظ† ط£ط±ط¨ط¹ط© ظ…ط¬ط§ظ„ط§طھ ط±ط¦ظٹط³ظٹط©: ط§ظ„ط¨ظٹط¦ط© â€” ط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„طھظ…ظƒظٹظ† â€” ط§ظ„طھظ†ظ…ظٹط© ظˆط§ظ„ط¥ط³ظƒط§ظ† â€” ط§ظ„ط«ظ‚ط§ظپط© ظˆط§ظ„ط±ظٹط§ط¶ط© ظˆط§ظ„طھط³ظ„ظٹط© ظˆط§ظ„ظپظ†ظˆظ†."],"paragraphsEn":["The Society is registered in Damascus governorate under the name آ«Soil Science Society of Syriaآ», and its activities cover the entire territory of the Syrian Arab Republic in accordance with Law No. 93 of 1958 on Associations and Private Institutions, and Presidential Decree No. 9/9 of 2025.","The Society's headquarters is located in Damascus â€” Faculty of Agricultural Engineering, University of Damascus. Email: a.karimjaafar@gmail.com","The Society is classified under four main fields: Environment â€” Education & Empowerment â€” Development & Housing â€” Culture, Sports, Recreation & Arts."],"classificationsAr":["ط§ظ„ط¨ظٹط¦ط©","ط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„طھظ…ظƒظٹظ†","ط§ظ„طھظ†ظ…ظٹط© ظˆط§ظ„ط¥ط³ظƒط§ظ†","ط§ظ„ط«ظ‚ط§ظپط© ظˆط§ظ„ط±ظٹط§ط¶ط© ظˆط§ظ„ظپظ†ظˆظ†"],"classificationsEn":["Environment","Education & Empowerment","Development & Housing","Culture, Sports & Arts"],"subtitle":"The Syrian Soil Science Society (SSSS) is a professional, non-profit scientific organization dedicated to the advancement of soil science in Syria. Founded in 2025, the society brings together researchers, educators, students, and practitioners working in soil science and related environmental fields.SSSSY serves as a platform for knowledge exchange, scientific collaboration, and professional development. Through conferences, workshops, publications, and outreach programs, the society promotes sustainable soil management practices.","subtitleAr":"ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© (ط¬.ط³.ط¹.طھ) ظ‡ظٹ ظ…ظ†ط¸ظ…ط© ظ…ظ‡ظ†ظٹط© ط؛ظٹط± ط±ط¨ط­ظٹط© ظ…ظƒط±ط³ط© ظ„طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§. طھط£ط³ط³طھ ط¹ط§ظ… 2025طŒ ظˆطھط¬ظ…ط¹ ط§ظ„ط¨ط§ط­ط«ظٹظ† ظˆط§ظ„ظ…ط¹ظ„ظ…ظٹظ† ظˆط§ظ„ط·ظ„ط§ط¨ ظˆط§ظ„ظ…ظ…ط§ط±ط³ظٹظ† ط§ظ„ط¹ط§ظ…ظ„ظٹظ† ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„ظ…ط¬ط§ظ„ط§طھ ط§ظ„ط¨ظٹط¦ظٹط© ط°ط§طھ ط§ظ„طµظ„ط©.طھط¹ظ…ظ„ ط§ظ„ط¬ظ…ط¹ظٹط© ظƒظ…ظ†طµط© ظ„طھط¨ط§ط¯ظ„ ط§ظ„ظ…ط¹ط±ظپط© ظˆط§ظ„طھط¹ط§ظˆظ† ط§ظ„ط¹ظ„ظ…ظٹ ظˆط§ظ„طھط·ظˆظٹط± ط§ظ„ظ…ظ‡ظ†ظٹطŒ ظˆطھط¹ط²ط² ظ…ظ…ط§ط±ط³ط§طھ ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„طھط±ط¨ط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ظ…ط¤طھظ…ط±ط§طھ ظˆط§ظ„ظˆط±ط´ ظˆط§ظ„ظ…ظ†ط´ظˆط±ط§طھ."},"children":[]},{"id":"a0000069-0000-0000-0000-000000000001","type":"about-vision-mission-section","props":{"heading":"Vision, Mission & Objectives","headingAr":"ط§ظ„ط±ط¤ظٹط© ظˆط§ظ„ط±ط³ط§ظ„ط© ظˆط§ظ„ط£ظ‡ط¯ط§ظپ","subheading":"Our guiding principles that shape every initiative and program we undertake.","subheadingAr":"ظ…ط¨ط§ط¯ط¦ظ†ط§ ط§ظ„طھظˆط¬ظٹظ‡ظٹط© ط§ظ„طھظٹ طھط´ظƒظ‘ظ„ ظƒظ„ ظ…ط¨ط§ط¯ط±ط© ظˆط¨ط±ظ†ط§ظ…ط¬ ظ†ط¶ط·ظ„ط¹ ط¨ظ‡.","items":[{"icon":"Target","title":"Our Vision","titleAr":"ط±ط¤ظٹطھظ†ط§","content":"To be the leading scientific authority on soil science in Syria and the region, fostering a future where soils are managed sustainably.","contentAr":"ط£ظ† ظ†ظƒظˆظ† ط§ظ„ط³ظ„ط·ط© ط§ظ„ط¹ظ„ظ…ظٹط© ط§ظ„ط±ط§ط¦ط¯ط© ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§ ظˆط§ظ„ظ…ظ†ط·ظ‚ط©.","color":"from-forest to-forest-light"},{"icon":"Eye","title":"Our Mission","titleAr":"ط±ط³ط§ظ„طھظ†ط§","content":"To advance soil science through research, education, and advocacy, promoting sustainable land use practices.","contentAr":"طھط¹ط²ظٹط² ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ط¨ط­ط« ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„ظ…ظ†ط§طµط±ط©.","color":"from-soil-clay to-soil-dark"},{"icon":"List","title":"Our Objectives","titleAr":"ط£ظ‡ط¯ط§ظپظ†ط§","content":"1) Promote soil research. 2) Facilitate knowledge exchange. 3) Support education and training. 4) Advocate for soil-friendly policies.","contentAr":"ظ،) طھط¹ط²ظٹط² ط¨ط­ظˆط« ط§ظ„طھط±ط¨ط©. ظ¢) طھط³ظ‡ظٹظ„ طھط¨ط§ط¯ظ„ ط§ظ„ظ…ط¹ط±ظپط©. ظ£) ط¯ط¹ظ… ط§ظ„طھط¹ظ„ظٹظ….","color":"from-forest-light to-forest"}],"paddingTop":"4rem","paddingBottom":"4rem","bgType":"solid","backgroundColor":"bg-soil-sand/30","visibility":"ALWAYS","padding":"py-16 md:py-20","panels":[{"icon":"Target","titleAr":"ط±ط¤ظٹطھظ†ط§","titleEn":"Our Vision","contentAr":"ط£ظ† ظ†ظƒظˆظ† ط§ظ„ط³ظ„ط·ط© ط§ظ„ط¹ظ„ظ…ظٹط© ط§ظ„ط±ط§ط¦ط¯ط© ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§ ظˆط§ظ„ظ…ظ†ط·ظ‚ط©طŒ ظˆظ†ظڈط¹ط²ط² ظ…ط³طھظ‚ط¨ظ„ط§ظ‹ طھظڈط¯ط§ط± ظپظٹظ‡ ط§ظ„طھط±ط¨ط© ط¨ط§ط³طھط¯ط§ظ…ط©.","contentEn":"To be the leading scientific authority on soil science in Syria and the region, fostering a future where soils are managed sustainably.","gradientClass":"from-forest to-forest-light"},{"icon":"Eye","titleAr":"ط±ط³ط§ظ„طھظ†ط§","titleEn":"Our Mission","contentAr":"طھط¹ط²ظٹط² ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ط¨ط­ط« ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„ظ…ظ†ط§طµط±ط©طŒ ظˆطھط¹ط²ظٹط² ظ…ظ…ط§ط±ط³ط§طھ ط§ظ„ط§ط³طھط®ط¯ط§ظ… ط§ظ„ظ…ط³طھط¯ط§ظ… ظ„ظ„ط£ط±ط§ط¶ظٹ.","contentEn":"To advance soil science through research, education, and advocacy, promoting sustainable land use practices.","gradientClass":"from-soil-clay to-soil-dark"},{"icon":"List","titleAr":"ط£ظ‡ط¯ط§ظپظ†ط§","titleEn":"Our Objectives","contentAr":"طھط¹ط²ظٹط² ط§ظ„ط¨ط­ط« ظˆطھط³ظ‡ظٹظ„ طھط¨ط§ط¯ظ„ ط§ظ„ظ…ط¹ط±ظپط© ظˆط¯ط¹ظ… ط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„طھط¯ط±ظٹط¨ ظˆط§ظ„ظ…ظ†ط§طµط±ط© ظ…ظ† ط£ط¬ظ„ ط³ظٹط§ط³ط§طھ طµط¯ظٹظ‚ط© ظ„ظ„طھط±ط¨ط©.","contentEn":"Promote research, facilitate knowledge exchange, support education and training, advocate for soil-friendly policies.","gradientClass":"from-forest-light to-forest"}]},"children":[]},{"id":"62496758-163c-4918-a44e-05fcfdda616e","type":"about-decree-section","props":{"title":"","visibility":"ALWAYS","padding":"py-14 md:py-18","backgroundColor":"bg-gray-50","imageAlt":"Official founding decree of the Soil Science Society of Syria","imageUrl":"/images/founding-decree.jpg","captionAr":"ط§ظ„ظ‚ط±ط§ط± ط±ظ‚ظ… 1054.7 ط§ظ„طµط§ط¯ط± ط¹ظ† ظˆط²ط§ط±ط© ط§ظ„ط´ط¤ظˆظ† ط§ظ„ط§ط¬طھظ…ط§ط¹ظٹط© ظˆط§ظ„ط¹ظ…ظ„ â€” ط¯ظ…ط´ظ‚طŒ 2025","captionEn":"Decree No. 1054.7 issued by the Ministry of Social Affairs and Labour â€” Damascus, 2025","headingAr":"ظˆط«ظٹظ‚ط© ط§ظ„طھط£ط³ظٹط³ ط§ظ„ط±ط³ظ…ظٹط©","headingEn":"Official Founding Decree","visibilityRules":[]}},{"id":"7cf59bc1-5fcc-428e-bb30-a9ce2d5ad429","type":"about-objectives-section","props":{"title":"","visibility":"ALWAYS","padding":"py-16 md:py-20","backgroundColor":"bg-green-50","headingAr":"ط§ظ„ط£ظ‡ط¯ط§ظپ ظˆط§ظ„ظ†ط´ط§ط· ط§ظ„ط±ط¦ظٹط³ظٹ","headingEn":"Objectives & Core Activities","objectives":[{"icon":"ًںŒ±","bodyAr":"ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط­ظ…ط§ظٹط© ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط© ظˆط¯ط¹ظ… ط§ظ„طھظ†ظ…ظٹط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط©.","bodyEn":"Contributing to the protection of natural resources and supporting sustainable development.","titleAr":"ط­ظ…ط§ظٹط© ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©","titleEn":"Protecting Natural Resources","numberAr":"ظ،","numberEn":"1"},{"icon":"ًںŒچ","bodyAr":"ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط­ظ…ط§ظٹط© ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظˆط§ظ„ط­ط¯ ظ…ظ† طھط¯ظ‡ظˆط±ظ‡ط§.","bodyEn":"Contributing to the protection of Syrian soil and combating its degradation.","titleAr":"ط­ظ…ط§ظٹط© ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©","titleEn":"Protecting Syrian Soil","numberAr":"ظ¢","numberEn":"2"},{"icon":"ًں”¬","bodyAr":"ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ طھط¹ط²ظٹط² ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ ظپظٹ ظ…ط¬ط§ظ„ط§طھ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„ط¨ظٹط¦ط© ظˆط§ظ„طھظ†ظ…ظٹط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط©طŒ ظˆط¯ط¹ظ… ط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ط£ظƒط§ط¯ظٹظ…ظٹط© ظˆط§ظ„طھط·ط¨ظٹظ‚ظٹط© ط§ظ„طھظٹ طھط³ظ‡ظ… ظپظٹ ظ…ظˆط§ط¬ظ‡ط© ط§ظ„طھط؛ظٹط± ط§ظ„ظ…ظ†ط§ط®ظٹ ظˆط­ظ…ط§ظٹط© ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©.","bodyEn":"Promoting scientific research in soil science, environment, and sustainable development, supporting academic and applied studies addressing climate change and natural resource protection.","titleAr":"طھط¹ط²ظٹط² ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ","titleEn":"Promoting Scientific Research","numberAr":"ظ£","numberEn":"3"},{"icon":"ًں“ڑ","bodyAr":"ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط¥طµط¯ط§ط± ظˆظ†ط´ط± ط§ظ„ظƒطھط¨ ظˆط§ظ„ط¯ظˆط±ظٹط§طھ ط§ظ„ط¹ظ„ظ…ظٹط© ط¨ط§ظ„ظ„ط؛طھظٹظ† ط§ظ„ط¹ط±ط¨ظٹط© ظˆط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط© ظˆطھظˆط«ظٹظ‚ ظˆظ†ط´ط± ط§ظ„ظ…ط¹ط±ظپط© ط§ظ„ط¹ظ„ظ…ظٹط© ظˆط¥ط¨ط±ط§ط² ط§ظ„ط¥ظ†ط¬ط§ط²ط§طھ ط§ظ„ظ…ط­ظ„ظٹط© ط¨ط¹ط¯ ط£ط®ط° ط§ظ„ظ…ظˆط§ظپظ‚ط§طھ ط§ظ„ظ„ط§ط²ظ…ط©.","bodyEn":"Publishing books and scientific journals in Arabic and English, documenting and disseminating scientific knowledge, and highlighting local achievements after obtaining necessary approvals.","titleAr":"ط§ظ„ظ†ط´ط± ط§ظ„ط¹ظ„ظ…ظٹ","titleEn":"Scientific Publishing","numberAr":"ظ¤","numberEn":"4"},{"icon":"ًںژ“","bodyAr":"ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط¨ظ†ط§ط، ظ‚ط¯ط±ط§طھ ط§ظ„ظƒظˆط§ط¯ط± ط§ظ„ظˆط·ظ†ظٹط© ظ…ظ† ط¨ط§ط­ط«ظٹظ† ظˆط·ظ„ط§ط¨ ظˆظ…ط²ط§ط±ط¹ظٹظ† ظˆظ…ط¬طھظ…ط¹ط§طھ ظ…ط­ظ„ظٹط© ط¹ط¨ط± ط§ظ„طھط¯ط±ظٹط¨ ط§ظ„ظ…ط³طھظ…ط± ظˆط§ظ„ط¯ظˆط±ط§طھ ط§ظ„طھط¹ظ„ظٹظ…ظٹط© ط§ظ„ظ…طھط®طµطµط©.","bodyEn":"Building the capacity of national cadres â€” researchers, students, farmers, and local communities â€” through continuous training and specialized educational courses.","titleAr":"ط¨ظ†ط§ط، ط§ظ„ظ‚ط¯ط±ط§طھ ط§ظ„ظˆط·ظ†ظٹط©","titleEn":"Building National Capacity","numberAr":"ظ¥","numberEn":"5"},{"icon":"ًںڈ«","bodyAr":"ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ طھط·ظˆظٹط± ط§ظ„ط¹ظ…ظ„ظٹط© ط§ظ„طھط¹ظ„ظٹظ…ظٹط© ظپظٹ ط¬ظ…ظٹط¹ ظ…ط³طھظˆظٹط§طھظ‡ط§ â€” ط§ظ„طھط¹ظ„ظٹظ… ط§ظ„ط£ط³ط§ط³ظٹ ظˆط§ظ„ط«ط§ظ†ظˆظٹ ظˆطھط¹ظ„ظٹظ… ط§ظ„ظƒط¨ط§ط± ظˆط§ظ„طھط¹ظ„ظٹظ… ط§ظ„ط¹ط§ظ„ظٹ ظˆط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ط¹ظ„ظٹط§ â€” ظ…ظ† ط®ظ„ط§ظ„ ط¥ط¹ط¯ط§ط¯ ط¨ط±ط§ظ…ط¬ ظ…ط³ط§ط¹ط¯ط© ظˆظ…ظ†ط§ظ‡ط¬ طھط¹ظ„ظٹظ…ظٹط© ظ…ط¹ ط§ظ„ط¬ط§ظ…ط¹ط§طھ ظˆط§ظ„ظ…ط¹ط§ظ‡ط¯.","bodyEn":"Developing education at all levels â€” basic, secondary, adult education, higher education, and postgraduate studies â€” through supportive programs and curricula developed with universities and institutes.","titleAr":"طھط·ظˆظٹط± ط§ظ„ط¹ظ…ظ„ظٹط© ط§ظ„طھط¹ظ„ظٹظ…ظٹط©","titleEn":"Developing Education","numberAr":"ظ¦","numberEn":"6"},{"icon":"ًں’¼","bodyAr":"ط§ظ„ط¥ط³ظ‡ط§ظ… ظپظٹ طھظ…ظƒظٹظ† ط§ظ„ظ…ط¬طھظ…ط¹ط§طھ ط§ظ‚طھطµط§ط¯ظٹط§ظ‹ ظˆط§ط¬طھظ…ط§ط¹ظٹط§ظ‹ ط¹ط¨ط± ط¯ط¹ظ… ط§ظ„ظ…ط´ط§ط±ظٹط¹ ط§ظ„طµط؛ظٹط±ط© ظˆط§ظ„ظ…طھظˆط³ط·ط©طŒ ظˆطھظ†ظ…ظٹط© ط§ظ„ظ…ظ‡ط§ط±ط§طھ ط§ظ„ظ…ظ‡ظ†ظٹط©طŒ ظˆط®ظ„ظ‚ ظپط±طµ ط¹ظ…ظ„ ط¬ط¯ظٹط¯ط© ط®ط§طµط© ظ„ظ„ط´ط¨ط§ط¨ ظˆط§ظ„ظ†ط³ط§ط، ظˆط§ظ„ظپط¦ط§طھ ط§ظ„ظ‡ط´ط©.","bodyEn":"Empowering communities economically and socially through supporting small and medium enterprises, developing professional skills, and creating new employment opportunities especially for youth, women, and vulnerable groups.","titleAr":"ط§ظ„طھظ…ظƒظٹظ† ط§ظ„ط§ظ‚طھطµط§ط¯ظٹ ظˆط§ظ„ط§ط¬طھظ…ط§ط¹ظٹ","titleEn":"Economic & Social Empowerment","numberAr":"ظ§","numberEn":"7"},{"icon":"ًںڈکï¸ڈ","bodyAr":"ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط¯ط¹ظ… ظ…ط´ط§ط±ظٹط¹ ط§ظ„طھظ†ظ…ظٹط© ظˆط§ظ„ط¥ط³ظƒط§ظ† ظˆطھط­ط³ظٹظ† ط§ظ„ط¨ظٹط¦ط© ط§ظ„ط¹ظ…ط±ط§ظ†ظٹط© ظˆط§ظ„ط³ظƒظ†ظٹط© ظˆطھط´ط¬ظٹط¹ ط§ظ„ط­ظ„ظˆظ„ ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظپظٹ ط§ظ„طھط®ط·ظٹط· ط§ظ„ط­ط¶ط±ظٹ ظˆط¥ط¹ط§ط¯ط© ط§ظ„ط¥ط¹ظ…ط§ط±.","bodyEn":"Supporting development and housing projects, improving the urban and residential environment, and encouraging sustainable solutions in urban planning and reconstruction.","titleAr":"ط§ظ„طھظ†ظ…ظٹط© ظˆط§ظ„ط¥ط³ظƒط§ظ†","titleEn":"Development & Housing","numberAr":"ظ¨","numberEn":"8"},{"icon":"ًںŒ؟","bodyAr":"ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ظ†ط´ط± ط§ظ„طھظˆط¹ظٹط© ط§ظ„ط¨ظٹط¦ظٹط© ظˆط§ظ„ظ…ط¬طھظ…ط¹ظٹط© ط¨ط£ظ‡ظ…ظٹط© ط§ظ„طھط±ط¨ط© ظˆط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط© ظƒط±ظƒظٹط²ط© ظ„طھط­ظ‚ظٹظ‚ ط§ظ„ط£ظ…ظ† ط§ظ„ط؛ط°ط§ط¦ظٹ ظˆط¶ظ…ط§ظ† ط§ظ„طھظˆط§ط²ظ† ط§ظ„ط¨ظٹط¦ظٹ.","bodyEn":"Promoting environmental and community awareness of the importance of soil and natural resources as a cornerstone for achieving food security and environmental balance.","titleAr":"ط§ظ„طھظˆط¹ظٹط© ط§ظ„ط¨ظٹط¦ظٹط©","titleEn":"Environmental Awareness","numberAr":"ظ©","numberEn":"9"},{"icon":"ًں¤‌","bodyAr":"ط§ظ„ظ…ط³ط§ظ‡ظ…ط© ظپظٹ ط¥ظ‚ط§ظ…ط© ظ…ط±ط§ظƒط² ط£ط¨ط­ط§ط« ظˆطھط¹ط§ظˆظ† ظ…ط¹ ط§ظ„ط¬ط§ظ…ط¹ط§طھ ظˆط§ظ„ظ…ظ†ط¸ظ…ط§طھ ط§ظ„ظ…ط­ظ„ظٹط© ظˆط§ظ„ط¯ظˆظ„ظٹط© ظˆطھط¨ط§ط¯ظ„ ط§ظ„ط®ط¨ط±ط§طھ ط¨ط¹ط¯ ط£ط®ط° ط§ظ„ظ…ظˆط§ظپظ‚ط§طھ ط§ظ„ظ„ط§ط²ظ…ط©.","bodyEn":"Establishing research centers and cooperation with local and international universities and organizations, exchanging expertise after obtaining necessary approvals.","titleAr":"ط§ظ„ط´ط±ط§ظƒط© ظˆط§ظ„طھط¹ط§ظˆظ† ط§ظ„ط¯ظˆظ„ظٹ","titleEn":"Partnerships & International Cooperation","numberAr":"ظ،ظ ","numberEn":"10"}],"subheadingAr":"ط§ظ„ظ…ط§ط¯ط© 3 ظ…ظ† ط§ظ„ظ†ط¸ط§ظ… ط§ظ„ط¯ط§ط®ظ„ظٹ â€” ط£ظ‡ط¯ط§ظپ ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط¹ط´ط±ط©","subheadingEn":"Article 3 of the Internal Bylaws â€” Ten Society Objectives"}},{"id":"7248993a-571a-4f61-b7fc-26f5c7ef44af","type":"about-membership-section","props":{"title":"","visibility":"ALWAYS","padding":"py-16 md:py-20","backgroundColor":"bg-white","feesAr":"ط±ط³ظ… ط§ظ„ط§ظ†طھط³ط§ط¨: 300,000 ظ„.ط³ â€” ط±ط³ظ… ط§ظ„ط§ط´طھط±ط§ظƒ ط§ظ„ط³ظ†ظˆظٹ: 100,000 ظ„.ط³","feesEn":"Registration fee: SYP 300,000 â€” Annual subscription fee: SYP 100,000","headingAr":"ط§ظ„ط¹ط¶ظˆظٹط©","headingEn":"Membership","conditionsAr":["ط£ظ„ط§ ظٹظƒظˆظ† ظ…ط­ظƒظˆظ…ط§ظ‹ ط¨ط¬ظ†ط§ظٹط© ط£ظˆ ط¨ط¬ظ†ط­ط© ط´ط§ط¦ظ†ط©","ط£ظ† ظٹظƒظˆظ† ط­ط³ظ† ط§ظ„ط³ظ„ظˆظƒ ظˆط§ظ„ط³ظٹط±ط©","ط£ظ† ظٹظƒظˆظ† ظ…ظ‚ظٹظ…ط§ظ‹ ط¯ط§ط®ظ„ ط£ط±ط§ط¶ظٹ ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹط© ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ط³ظˆط±ظٹط©","ط£ظ† ظٹطھط¬ط§ظˆط² ط§ظ„ط«ط§ظ…ظ†ط© ط¹ط´ط± ظ…ظ† ط§ظ„ط¹ظ…ط±","ط£ظ† ظٹظ‚ط¨ظ„ ظƒطھط§ط¨ط©ظ‹ ظ†ط¸ط§ظ… ط§ظ„ط¬ظ…ط¹ظٹط©","ط£ظ† ظٹطھظ‚ط¯ظ… ط¨ط·ظ„ط¨ ظ„ظ„ط§ظ†طھط³ط§ط¨ ظ…ط±ظپظ‚ط§ظ‹ ط¨ط±ط³ظ… ط§ظ„ط§ظ†طھط³ط§ط¨","ط£ظ† ظٹظƒظˆظ† ط­ط§ظ…ظ„ط§ظ‹ ظ„ط´ظ‡ط§ط¯ط© ط§ظ„ظ…ط¹ظ‡ط¯ ط§ظ„ط²ط±ط§ط¹ظٹ ظƒط­ط¯ ط£ط¯ظ†ظ‰"],"conditionsEn":["Not convicted of a felony or a disgraceful misdemeanor","Must be of good conduct and character","Must be a resident within the Syrian Arab Republic","Must be over eighteen years of age","Must have accepted the Society's bylaws in writing","Must submit a membership application with the registration fee","Must hold at minimum an agricultural institute certificate"],"subheadingAr":"ط§ظ„ظ…ط§ط¯ط© 4 â€” ط£ظ†ظˆط§ط¹ ط§ظ„ط¹ط¶ظˆظٹط© ظˆط­ظ‚ظˆظ‚ظ‡ط§","subheadingEn":"Article 4 â€” Membership Types and Rights","membershipTypes":[{"icon":"ًں‘¤","descAr":"ظٹظ‚ط¨ظ„ ظƒطھط§ط¨ط©ظ‹ ط§ظ„ظ†ط¸ط§ظ… ط§ظ„ط¯ط§ط®ظ„ظٹ ظ„ظ„ط¬ظ…ط¹ظٹط© ظˆظٹظ„طھط²ظ… ط¨طھط³ط¯ظٹط¯ ط±ط³ظˆظ… ط§ظ„ط§ظ†طھط³ط§ط¨ ظˆط§ظ„ط§ط´طھط±ط§ظƒطŒ ظˆظٹط­ظ‚ ظ„ظ‡ ط­ط¶ظˆط± ط§ط¬طھظ…ط§ط¹ط§طھ ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ظˆط§ظ„طھطµظˆظٹطھ.","descEn":"Accepts the bylaws in writing, pays registration and subscription fees, and is entitled to attend and vote in General Assembly meetings.","titleAr":"ط§ظ„ط¹ط¶ظˆ ط§ظ„ط¹ط§ظ…ظ„","titleEn":"Working Member"},{"icon":"ًں¤²","descAr":"ظٹط±ط؛ط¨ ط¨طھظ‚ط¯ظٹظ… ط§ظ„ط¯ط¹ظ… ط§ظ„ظ…ط§ط¯ظٹ ط£ظˆ ط§ظ„ظ…ط¹ظ†ظˆظٹ ط£ظˆ ظƒظ„ظٹظ‡ظ…ط§طŒ ظˆظ„ظٹط³ ظ„ظ‡ ط­ظ‚ ط­ط¶ظˆط± ط§ط¬طھظ…ط§ط¹ط§طھ ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط©.","descEn":"Wishes to provide financial or moral support (or both), without the right to attend General Assembly meetings.","titleAr":"ط§ظ„ط¹ط¶ظˆ ط§ظ„ظ…ط¤ط§ط²ط±","titleEn":"Supporting Member"},{"icon":"ًںڈ…","descAr":"طھظ…ظ†ط­ظ‡ ط§ظ„ط¬ظ…ط¹ظٹط© ظ‡ط°ظ‡ ط§ظ„طµظپط© طھظ‚ط¯ظٹط±ط§ظ‹ ظ„ظ„ط®ط¯ظ…ط§طھ ط§ظ„ط¬ظ„ظٹظ„ط© ط§ظ„طھظٹ ط£ط³ط¯ط§ظ‡ط§ ظ„ظ‡ط§.","descEn":"Granted by the Society in recognition of outstanding services rendered to it.","titleAr":"ط¹ط¶ظˆ ط§ظ„ط´ط±ظپ","titleEn":"Honorary Member"}],"conditionsHeadingAr":"ط´ط±ظˆط· ط§ظ„ط¹ط¶ظˆظٹط©","conditionsHeadingEn":"Membership Conditions"}},{"id":"daae2cd6-276f-420d-90d8-fb3736ede65f","type":"about-governance-section","props":{"title":"","visibility":"ALWAYS","padding":"py-16 md:py-20","backgroundColor":"bg-green-50","roles":[{"icon":"ًں‘‘","descAr":"ظٹظ…ط«ظ„ ط§ظ„ط¬ظ…ط¹ظٹط© ط£ظ…ط§ظ… ط§ظ„ظ‚ط¶ط§ط، ظˆظپظٹ ط¹ظ„ط§ظ‚ط§طھظ‡ط§ ظ…ط¹ ط§ظ„ط¬ظ…ظ‡ظˆط± ظˆط§ظ„ط¯ظˆط§ط¦ط± ط§ظ„ط±ط³ظ…ظٹط©طŒ ظˆظ‡ظˆ ط¢ظ…ط± ط§ظ„طµط±ظپ ظپظٹ ط¬ظ…ظٹط¹ ظ†ظپظ‚ط§طھ ط§ظ„ط¬ظ…ط¹ظٹط©.","descEn":"Represents the Society before courts and in its relations with the public and official bodies; is the payment authorizing officer.","titleAr":"ط§ظ„ط±ط¦ظٹط³","titleEn":"President"},{"icon":"ًں¤‌","descAr":"ظٹظ‚ظˆظ… ط¨ظ…ظ‡ط§ظ… ط§ظ„ط±ط¦ظٹط³ ط£ط«ظ†ط§ط، ط؛ظٹط§ط¨ظ‡ ظˆط¨ظƒظ„ ط¹ظ…ظ„ ظٹط³ظ†ط¯ظ‡ ط¥ظ„ظٹظ‡.","descEn":"Performs the President's duties during absence and any other duties assigned.","titleAr":"ظ†ط§ط¦ط¨ ط§ظ„ط±ط¦ظٹط³","titleEn":"Vice President"},{"icon":"ًں“‌","descAr":"ظٹط¯ظˆظ‘ظ† ظ…ط­ط§ط¶ط± ط§ظ„ط§ط¬طھظ…ط§ط¹ط§طھطŒ ظˆظٹط­ط±ط± ط§ظ„ط¯ط¹ظˆط§طھطŒ ظˆظٹط³طھظ„ظ… ط§ظ„ظ…ط±ط§ط³ظ„ط§طھطŒ ظˆظٹط­ظپط¸ ط§ظ„ط³ط¬ظ„ط§طھ ظˆط§ظ„ط£ط®طھط§ظ….","descEn":"Records meeting minutes, drafts invitations, manages correspondence, and safeguards records and seals.","titleAr":"ط£ظ…ظٹظ† ط§ظ„ط³ط±","titleEn":"Secretary General"},{"icon":"ًں’°","descAr":"ظٹط´ط±ظپ ط¹ظ„ظ‰ ط§ظ„ط±ط³ظˆظ… ظˆط§ظ„ظ…ط¨ط§ظ„ط؛ ط§ظ„ظˆط§ط±ط¯ط©طŒ ظٹط¤ط¯ظٹ ط§ظ„ظ†ظپظ‚ط§طھطŒ ظˆظٹظ‚ط¯ظ… طھظ‚ط±ظٹط±ط§ظ‹ ظ…ط§ظ„ظٹط§ظ‹ ط´ظ‡ط±ظٹط§ظ‹ ظ„ظ…ط¬ظ„ط³ ط§ظ„ط¥ط¯ط§ط±ط©.","descEn":"Oversees fees and incoming funds, authorizes expenditures, and presents a monthly financial report to the Board.","titleAr":"ط£ظ…ظٹظ† ط§ظ„طµظ†ط¯ظˆظ‚","titleEn":"Treasurer"},{"icon":"ًں§‘â€چâڑ–ï¸ڈ","descAr":"ط«ظ„ط§ط«ط© ط£ط¹ط¶ط§ط، ط¥ط¶ط§ظپظٹظˆظ† طھظ†طھط®ط¨ظ‡ظ… ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ظ„ظ„ظ…ط´ط§ط±ظƒط© ظپظٹ ظ‚ط±ط§ط±ط§طھ ط¥ط¯ط§ط±ط© ط§ظ„ط¬ظ…ط¹ظٹط© ظˆطھط´ظƒظٹظ„ ط§ظ„ظ„ط¬ط§ظ† ط§ظ„ظ„ط§ط²ظ…ط©.","descEn":"Three additional elected members participating in governance decisions and forming required committees.","titleAr":"ط£ط¹ط¶ط§ط، ط§ظ„ظ…ط¬ظ„ط³","titleEn":"Board Members"}],"termAr":"ظ…ط¯ط© ط§ظ„ظˆظ„ط§ظٹط©: ط³ظ†طھط§ظ† ظ‚ط§ط¨ظ„ط© ظ„ظ„طھط¬ط¯ظٹط¯","termEn":"Term: 2 years, renewable","introAr":"طھظڈط¯ط§ط± ط§ظ„ط¬ظ…ط¹ظٹط© ظ…ظ† ط®ظ„ط§ظ„ ظ‡ظٹط¦ط© ط¹ط§ظ…ط© طھط¶ظ… ط¬ظ…ظٹط¹ ط§ظ„ط£ط¹ط¶ط§ط، ط§ظ„ط¹ط§ظ…ظ„ظٹظ† ط§ظ„ظ…ظ„طھط²ظ…ظٹظ†طŒ ظˆطھظ†طھط®ط¨ ظ…ط¬ظ„ط³ ط¥ط¯ط§ط±ط© ظ…ط¤ظ„ظپ ظ…ظ† 7 ط£ط¹ط¶ط§ط، ظ„ظ…ط¯ط© ط³ظ†طھظٹظ† ظ‚ط§ط¨ظ„ط© ظ„ظ„طھط¬ط¯ظٹط¯.","introEn":"The Society is governed by a General Assembly of all compliant active members, which elects a Board of Directors of 7 members for a renewable two-year term.","headingAr":"ط§ظ„ظ‡ظٹظƒظ„ ط§ظ„طھظ†ط¸ظٹظ…ظٹ","headingEn":"Governance Structure","boardSizeAr":"ط¹ط¯ط¯ ط£ط¹ط¶ط§ط، ظ…ط¬ظ„ط³ ط§ظ„ط¥ط¯ط§ط±ط©: 7 ط£ط¹ط¶ط§ط، (ط¹ط¯ط¯ ظپط±ط¯ظٹطŒ ط§ظ„ط­ط¯ ط§ظ„ط£ط¯ظ†ظ‰ 5)","boardSizeEn":"Board size: 7 members (odd number, minimum 5)","electionsAr":"ط§ظ„ط§ظ†طھط®ط§ط¨ط§طھ: ط³ط±ظٹط© ظˆظ…ط¨ط§ط´ط±ط© ظپظٹ ط§ط¬طھظ…ط§ط¹ ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ط§ظ„ط³ظ†ظˆظٹ","electionsEn":"Elections: Secret and direct during the annual General Assembly meeting"}},{"id":"c882b00c-ea0c-42e4-9886-6306fe31b6b3","type":"about-founders-section","props":{"title":"","visibility":"ALWAYS","padding":"py-16 md:py-20","backgroundColor":"bg-white","introAr":"طھط£ط³ط³طھ ط§ظ„ط¬ظ…ط¹ظٹط© ط¨ط¬ظ‡ظˆط¯ ط£ط­ط¯ ط¹ط´ط± ط¹ط¶ظˆط§ظ‹ ظ…ط¤ط³ط³ط§ظ‹طŒ ط¬ظ…ظٹط¹ظ‡ظ… ط­ط§ظ…ظ„ظˆظ† ظ„ط´ظ‡ط§ط¯ط© ط§ظ„ط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© ظ…ظ† ط¬ط§ظ…ط¹ط§طھ ط³ظˆط±ظٹط©.","introEn":"The Society was founded by eleven founding members, all holding PhDs in Agricultural Engineering from Syrian universities.","founders":[{"phone":"0993170794","nameAr":"ط¹ط¨ط¯ ط§ظ„ظƒط±ظٹظ… ط£ط­ظ…ط¯ ط¬ط¹ظپط±","nameEn":"Abdulkarim Ahmad Jaafar","roleAr":"ط±ط¦ظٹط³ ط§ظ„ط¬ظ…ط¹ظٹط© â€” ظ…ط¤ط³ط³","roleEn":"President â€” Founding Member","birthdate":"30/06/1981","residenceAr":"ط¯ظ…ط´ظ‚طŒ ظ…ط³ط§ظƒظ† ط¨ط±ط²ط©طŒ ط¬ط§ظ†ط¨ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط©","residenceEn":"Damascus, Barzeh, near Faculty of Agriculture","birthplaceAr":"ط§ظ„ط±ظ‚ط©","birthplaceEn":"Al-Raqqa","qualificationAr":"ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©","qualificationEn":"PhD in Agricultural Engineering"},{"phone":"0952425381","nameAr":"ط³ظ„ظٹظ…ط§ظ† ظ…ط­ظ…ظˆط¯ ط³ظ„ظٹظ…","nameEn":"Suleiman Mahmoud Salim","roleAr":"ظ†ط§ط¦ط¨ ط±ط¦ظٹط³ ط§ظ„ط¬ظ…ط¹ظٹط© â€” ظ…ط¤ط³ط³","roleEn":"Vice President â€” Founding Member","birthdate":"01/10/1966","residenceAr":"ط±ظٹظپ ط¯ظ…ط´ظ‚ â€” طµط­ظ†ط§ظٹط§","residenceEn":"Rural Damascus â€” Sahnaya","birthplaceAr":"ط§ظ„ظٹط±ظ…ظˆظƒ","birthplaceEn":"Al-Yarmouk","qualificationAr":"ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©","qualificationEn":"PhD in Agricultural Engineering"},{"phone":"0966296815","nameAr":"ط£ظƒط±ظ… ظ…ط­ظ…ط¯ ط§ظ„ط¨ظ„ط®ظٹ","nameEn":"Akram Mohammad Al-Balkhi","roleAr":"ط¹ط¶ظˆ ظ…ط¬ظ„ط³ â€” ظ…ط¤ط³ط³","roleEn":"Board Member â€” Founding Member","birthdate":"06/10/1971","residenceAr":"ط¯ظ…ط´ظ‚طŒ ظ…ط³ط§ظƒظ† ط¨ط±ط²ط©طŒ ط¬ط§ظ†ط¨ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط©","residenceEn":"Damascus, Barzeh, near Faculty of Agriculture","birthplaceAr":"ظ…ط­ط¬ط©","birthplaceEn":"Mahajjeh","qualificationAr":"ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©","qualificationEn":"PhD in Agricultural Engineering"},{"phone":"0944893467","nameAr":"ظ…ط­ظ…ظˆط¯ ط£ظ†ظٹط³ ط¹ظˆط¯ط©","nameEn":"Mahmoud Anis Oudeh","roleAr":"ط¹ط¶ظˆ ظ…ط¤ط³ط³","roleEn":"Founding Member","birthdate":"06/12/1956","residenceAr":"ط­ظ…طµ â€” ط³ظƒط±ط© ط§ظ„ط؛ط±ط¨ظٹط©","residenceEn":"Homs â€” West Sukkarah","birthplaceAr":"ط³ظƒط±ط©","birthplaceEn":"Sukkarah","qualificationAr":"ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©","qualificationEn":"PhD in Agricultural Engineering"},{"phone":"0932448989","nameAr":"ط­ظٹط¯ط± ظ‡ط§ط´ظ… ط§ظ„ط­ط³ظ†","nameEn":"Haidar Hashem Al-Hassan","roleAr":"ط¹ط¶ظˆ ظ…ط¤ط³ط³","roleEn":"Founding Member","birthdate":"01/01/1976","residenceAr":"ط­ظ…طµ â€” ظƒط±ظ… ط§ظ„ظ„ظˆط²","residenceEn":"Homs â€” Karm Al-Loz","birthplaceAr":"ظƒظپط±ط¹ط¨ط¯ظ‡","birthplaceEn":"Kfar-Abda","qualificationAr":"ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©","qualificationEn":"PhD in Agricultural Engineering"},{"phone":"0994513509","nameAr":"ظ„ط¤ظٹ ظ…ط­ظ…ظˆط¯ ط§ظ„ط±ظپط§ط¹ظٹ","nameEn":"Luay Mahmoud Al-Rifai","roleAr":"ط£ظ…ظٹظ† ط§ظ„طµظ†ط¯ظˆظ‚ â€” ظ…ط¤ط³ط³","roleEn":"Treasurer â€” Founding Member","birthdate":"10/08/1986","residenceAr":"ط±ظٹظپ ط¯ظ…ط´ظ‚ â€” طµط­ظ†ط§ظٹط§","residenceEn":"Rural Damascus â€” Sahnaya","birthplaceAr":"ظٹط¨ط±ظˆط¯","birthplaceEn":"Yabroud","qualificationAr":"ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©","qualificationEn":"PhD in Agricultural Engineering"},{"phone":"0933334783","nameAr":"ظ…ط­ظ…ط¯ ظ…ظ†ظ‡ظ„ ط¹ظˆط¶ ط§ظ„ط­ط³ظٹظ† ط§ظ„ط²ط¹ط¨ظٹ","nameEn":"Mohammad Manhal Awad Al-Zoubi","roleAr":"ط¹ط¶ظˆ ظ…ط¬ظ„ط³ â€” ظ…ط¤ط³ط³","roleEn":"Board Member â€” Founding Member","birthdate":"19/11/1971","residenceAr":"ط±ظٹظپ ط¯ظ…ط´ظ‚ â€” ط¯ط§ط±ظٹط§","residenceEn":"Rural Damascus â€” Darayya","birthplaceAr":"ط¯ط±ط¹ط§ ط§ظ„ظ…ط­ط·ط©","birthplaceEn":"Daraa Al-Mahatta","qualificationAr":"ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©","qualificationEn":"PhD in Agricultural Engineering"},{"phone":"0934451168","nameAr":"ط¹ظ„ط§ط، ط­ط³ظ† ط®ظ„ظˆظپ","nameEn":"Alaa Hassan Khalouf","roleAr":"ط£ظ…ظٹظ† ط§ظ„ط³ط± â€” ظ…ط¤ط³ط³","roleEn":"Secretary General â€” Founding Member","birthdate":"07/12/1983","residenceAr":"ط¯ظ…ط´ظ‚ â€” ط§ظ„ظ…ط¯ظٹظ†ط© ط§ظ„ظ‚ط¯ظٹظ…ط©","residenceEn":"Damascus â€” Old City","birthplaceAr":"ط­ظ…طµ","birthplaceEn":"Homs","qualificationAr":"ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©","qualificationEn":"PhD in Agricultural Engineering"},{"phone":"","nameAr":"ظ…ط­ظ…ط¯ ط³ط¹ظٹط¯ ظ…ط­ظ…ط¯ ط¯ظٹط¨ ط§ظ„ط´ط§ط·ط±","nameEn":"Mohammad Saeed Al-Shater","roleAr":"ط¹ط¶ظˆ ظ…ط¬ظ„ط³ â€” ظ…ط¤ط³ط³","roleEn":"Board Member â€” Founding Member","birthdate":"06/06/1950","residenceAr":"ط¯ظ…ط´ظ‚ â€” ط¨ط±ط§ظ…ظƒط©","residenceEn":"Damascus â€” Barmakeh","birthplaceAr":"ط¯ظ…ط´ظ‚","birthplaceEn":"Damascus","qualificationAr":"ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©","qualificationEn":"PhD in Agricultural Engineering"},{"phone":"0944984574","nameAr":"ط¹ظ…ط± ط¹ط¨ط¯ ط§ظ„ظ„ظ‡ ط¹ط¨ط¯ ط§ظ„ط±ط²ط§ظ‚","nameEn":"Omar Abdullah Abd Al-Razzaq","roleAr":"ط¹ط¶ظˆ ظ…ط¤ط³ط³","roleEn":"Founding Member","birthdate":"23/04/1962","residenceAr":"ط¯ظٹط± ط§ظ„ط²ظˆط± â€” ظپظٹظ„ط§طھ ط§ظ„ط¨ظ„ط¯ظٹط©","residenceEn":"Deir ez-Zor â€” Municipal Villas","birthplaceAr":"ط§ظ„ظ…ظٹط§ط¯ظٹظ†","birthplaceEn":"Mayadin","qualificationAr":"ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©","qualificationEn":"PhD in Agricultural Engineering"},{"phone":"0944984574","nameAr":"ظ…ط­ظ…ط¯ ط­ط³ط§ظ… ط¨ظ‡ظ„ظˆط§ظ†","nameEn":"Mohammad Hussam Bahlawan","roleAr":"ط¹ط¶ظˆ ظ…ط¤ط³ط³","roleEn":"Founding Member","birthdate":"03/02/1964","residenceAr":"ط­ظ„ط¨ â€” ط§ظ„ط´ظ‡ط¨ط§ط، ط§ظ„ط¬ط¯ظٹط¯ط©طŒ ط´ط§ط±ط¹ ط§ظ„ط؛ط²ط§ظ„ظٹ","residenceEn":"Aleppo â€” New Shahba, Al-Ghazali Street","birthplaceAr":"ط­ظ„ط¨","birthplaceEn":"Aleppo","qualificationAr":"ط¯ظƒطھظˆط±ط§ظ‡ ظ‡ظ†ط¯ط³ط© ط²ط±ط§ط¹ظٹط©","qualificationEn":"PhD in Agricultural Engineering"}],"headingAr":"ط§ظ„ط£ط¹ط¶ط§ط، ط§ظ„ظ…ط¤ط³ط³ظˆظ†","headingEn":"Founding Members","subheadingAr":"ط§ظ„ظ…ط§ط¯ط© 56 â€” ط£ط¹ط¶ط§ط، ظ…ط¬ظ„ط³ ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط¤ط³ط³ظˆظ†","subheadingEn":"Article 56 â€” Founding Board Members"}},{"id":"a0000070-0000-0000-0000-000000000001","type":"about-documents-section","props":{"title":"","visibility":"ALWAYS","padding":"py-16 md:py-20","backgroundColor":"bg-white","heading":"Downloadable Documents","documents":[{"url":"/documents/bylaws.pdf","labelAr":"ط§ظ„ظ†ط¸ط§ظ… ط§ظ„ط¯ط§ط®ظ„ظٹ ظ„ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©","labelEn":"SSSS Bylaws (Internal Regulations)","fileType":"PDF"},{"url":"/documents/founding-decree.jpg","labelAr":"ظˆط«ظٹظ‚ط© ط§ظ„طھط£ط³ظٹط³ ط§ظ„ط±ط³ظ…ظٹط© â€” ط§ظ„ظ‚ط±ط§ط± ط±ظ‚ظ… 1054.7","labelEn":"Founding Decree â€” No. 1054.7","fileType":"JPG"},{"url":"/documents/society-seal.jpg","labelAr":"ط§ظ„ط®طھظ… ط§ظ„ط±ط³ظ…ظٹ ظ„ظ„ط¬ظ…ط¹ظٹط©","labelEn":"Official Society Seal","fileType":"JPG"},{"url":"/documents/society-logo-display.jpg","labelAr":"ط´ط¹ط§ط± ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط±ط³ظ…ظٹ","labelEn":"Society Logo (Official Display)","fileType":"JPG"}],"headingAr":"ط§ظ„ظˆط«ط§ط¦ظ‚ ط§ظ„ظ‚ط§ط¨ظ„ط© ظ„ظ„طھظ†ط²ظٹظ„"},"children":[]},{"id":"a0000071-0000-0000-0000-000000000001","type":"about-gallery-section","props":{"title":"","visibility":"ALWAYS","padding":"py-16 md:py-20","backgroundColor":"bg-soil-sand/30","layout":{"gap":16,"type":"masonry","columns":{"wide":4,"mobile":1,"tablet":2,"desktop":3},"aspectRatio":"auto","borderRadius":8},"hoverEffects":{"effect":"zoom","overlayColor":"dark","overlayOpacity":60,"showTitleOnHover":true,"showDescriptionOnHover":false},"images":[],"heading":"Photo Gallery","headingAr":"ظ…ط¹ط±ط¶ ط§ظ„طµظˆط±","subheading":"A glimpse into our events, conferences, and field activities.","subheadingAr":"ظ„ظ…ط­ط© ط¹ظ† ظپط¹ط§ظ„ظٹط§طھظ†ط§ ظˆظ…ط¤طھظ…ط±ط§طھظ†ط§ ظˆط£ظ†ط´ط·طھظ†ط§ ط§ظ„ظ…ظٹط¯ط§ظ†ظٹط©."},"children":[]}]}	PUBLISHED	\N	PUBLIC	\N	EN	\N
84930958-20f9-4a24-b7e5-01e12fde7b46	ط§ظ„ظ†ط´ط±ط© ط§ظ„ط¥ط®ط¨ط§ط±ظٹط©	Newsletter	newsletter	FLEXIBLE	t	f	\N	30	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-13 19:43:03.370633	\N	Newsletter	Subscribe for the latest updates from the society.	Newsletter - SSSSY	Stay updated with the latest news, events, and publications from SSSSY.	http://localhost:3000/images/og-newsletter.jpg	\N	PUBLISHED	\N	PUBLIC	\N	EN	\N
9758e378-5e79-4238-8524-b75491c5b031	ط£ط¹ط¶ط§ط، ط§ظ„ظ…ط¬ظ„ط³	Board	board	FLEXIBLE	t	f	\N	10	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-13 19:43:03.370633	\N	Board Members	Meet the leadership of the Syrian Soil Science Society.	Board of Directors - SSSSY	Discover the leadership and vision of the Syrian Soil Science Society.	http://localhost:3000/images/og-board.jpg	\N	PUBLISHED	\N	PUBLIC	\N	EN	\N
1061a09f-975d-427a-92fa-c09f4dc98368	ط§ظ„ظˆط¸ط§ط¦ظپ	Jobs	jobs	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-13 19:43:03.370633	\N	Jobs	Explore career and collaboration opportunities.	\N	\N	\N	{"version":"1","blocks":[{"id":"e57b1302-cd6b-449a-950a-e6ec46041bc5","type":"hero","props":{"title": "Jobs", "subtitle": "Explore career opportunities at SSSSY and partner organizations."}},{"id":"f97442a5-e230-492e-9d94-2b59c1f55f85","type":"jobs-list-section","props":{}}]}	PUBLISHED	\N	PUBLIC	\N	EN	\N
259bcff7-a75b-44a6-bdce-fa2911c5fed5	ط§ظ„ط£ط¹ط¶ط§ط،	Members	members	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-13 19:43:03.370633	\N	Members	Discover the members of the Syrian Soil Science Society.	\N	\N	\N	{"version":"1","blocks":[{"id":"dda04aa1-107b-473d-b59c-1f4568a93941","type":"hero","props":{"title": "Members", "subtitle": "Browse the society member directory and public profiles."}},{"id":"e8842885-b6d9-4bde-9bc1-371018b1ff2b","type":"members-list-section","props":{}}]}	PUBLISHED	\N	PUBLIC	\N	EN	\N
274da4e8-50cf-4aa7-9b95-68619f14ef92	ظƒظ„ظ…ط© ط±ط¦ظٹط³ ط§ظ„ط¬ظ…ط¹ظٹط©	Message from the President	president-message	FLEXIBLE	t	f	\N	40	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-30 07:24:18.016546	\N	ظƒظ„ظ…ط© ط±ط¦ظٹط³ ط§ظ„ط¬ظ…ط¹ظٹط© | ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©	ظƒظ„ظ…ط© ط§ظ„ط¯ظƒطھظˆط± ط¹ط¨ط¯ ط§ظ„ظƒط±ظٹظ… ط¬ط¹ظپط±طŒ ظ…ط¤ط³ط³ ظˆط±ط¦ظٹط³ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©طŒ ط­ظˆظ„ ط±ط¤ظٹط© ط§ظ„ط¬ظ…ط¹ظٹط© ظˆط£ظ‡ط¯ط§ظپظ‡ط§.	ظƒظ„ظ…ط© ط±ط¦ظٹط³ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© â€” ط§ظ„ط¯ظƒطھظˆط± ط¹ط¨ط¯ ط§ظ„ظƒط±ظٹظ… ط¬ط¹ظپط±	ط±ط³ط§ظ„ط© ط¹ظ„ظ…ظٹط© طھط¯ط¹ظˆ ط¥ظ„ظ‰ ط­ظ…ط§ظٹط© ط§ظ„طھط±ط¨ط© ظˆطھط¹ط²ظٹط² ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ ظ„ظ…ط³طھظ‚ط¨ظ„ ظ…ط³طھط¯ط§ظ….	http://localhost:3000/images/og-president.jpg	\N	PUBLISHED	\N	PUBLIC	\N	EN	\N
fff8b2ef-f7e9-4d96-b545-291807f6da33	ط§ظ„ظپط¹ط§ظ„ظٹط§طھ	Events	events	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-13 19:43:03.370633	\N	Events	Browse conferences, workshops, and scientific events.	\N	\N	\N	{"version":"1","blocks":[{"id":"adebc2a3-7821-4f11-876e-c0c254a3c61d","type":"hero","props":{"title": "Events", "subtitle": "Explore conferences, workshops, seminars, and training opportunities."}},{"id":"ba0285da-3392-429e-8bb5-af6eae548dfe","type":"events-list-section","props":{}}]}	PUBLISHED	\N	PUBLIC	\N	EN	\N
2a295b54-aa30-496c-8ccd-f4f7295b5fdc	ط§طھطµظ„ ط¨ظ†ط§	Contact	contact	FLEXIBLE	t	f	\N	\N	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-13 19:43:03.370633	\N	Contact Us	Get in touch with the Syrian Soil Science Society.	Contact Us - SSSSY	Have a question, suggestion, or want to collaborate? We'd love to hear from you.	http://localhost:3000/images/og-contact.jpg	\N	PUBLISHED	\N	PUBLIC	\N	EN	\N
ea5cd0a4-5d99-4d34-be1d-4ca2511a8138	ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ	Publications	publications	FLEXIBLE	t	f	\N	50	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 13:04:44.628517	2026-07-13 19:43:03.370633	\N	Publications	Explore society publications and research output.	Publications - SSSSY	Access the latest scientific publications and contribute to soil science knowledge.	http://localhost:3000/images/og-publications.jpg	\N	PUBLISHED	\N	PUBLIC	\N	EN	\N
9707179c-7cb8-4ac5-8284-cbfe005ca91b	ط§ظ„ط±ط¦ظٹط³ظٹط©	Home		FLEXIBLE	t	t	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	\N	Syrian Soil Science Society	Advancing soil science research, education, and sustainable land management in Syria.	\N	\N	\N	\N	PUBLISHED	\N	PUBLIC	\N	EN	\N
b708f50d-0a5c-4964-95cb-70ac63b7e0cd	ط§ظ„ط£ظ‚ط³ط§ظ…	Sections	sections	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	\N	Sections Library	Browse reusable public site sections.	\N	\N	\N	\N	PUBLISHED	\N	PUBLIC	\N	EN	\N
582cf8f7-f53d-4fcb-9f78-85f45a39f7dc	ط§ظ„ط¨ط­ط«	Search	search	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-13 19:43:03.370633	\N	Search	Search across news, publications, and events.	\N	\N	\N	{"version":"1","blocks":[{"id":"696ef279-3435-4344-a16b-645dc029beaf","type":"hero","props":{"title": "Search", "subtitle": "Search across articles, publications, and events."}},{"id":"df347c12-4b14-4e88-aea5-9f0b16dcae69","type":"search","props":{"title": "Search the Website"}}]}	PUBLISHED	\N	PUBLIC	\N	EN	\N
7582f946-a41d-4460-a535-bb545f8288e3	ط§ظ„ط£ط®ط¨ط§ط±	News	news	FLEXIBLE	t	f	\N	0	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-10 16:10:40.721161	2026-07-13 19:43:03.370633	\N	News	Read the latest society news and announcements.	\N	\N	\N	{"version":"1","blocks":[{"id":"b442b30b-ebb4-416a-a156-d38e5401fce0","type":"hero","props":{"title": "News & Announcements", "subtitle": "Read the latest news, articles, and announcements from the society."}},{"id":"53d43d87-f839-46e3-b64c-28ffdf97f6a1","type":"news-list-section","props":{}}]}	PUBLISHED	\N	PUBLIC	\N	EN	\N
\.


--
-- TOC entry 6219 (class 0 OID 67852)
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
-- TOC entry 6288 (class 0 OID 69368)
-- Dependencies: 289
-- Data for Name: preview_tokens; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.preview_tokens (id, page_id, token, layout_json, created_by, expires_at, created_at) FROM stdin;
b32aa35f-f513-439c-937a-93e19ca6c31a	84930958-20f9-4a24-b7e5-01e12fde7b46	34055e02644ccde9cbac7bc692b0df8e7f10a3a9792328fafcdad21420952ed0	{"version":"1","blocks":[{"id":"020ff53d-1cf6-450c-823e-9fb1b74d17e4","type":"newsletter-hero-banner","props":{"title":"Stay Connected","titleAr":"ط§ط¨ظ‚ظژ ط¹ظ„ظ‰ طھظˆط§طµظ„","subtitle":"Subscribe to receive the latest news and updates from our society.","subtitleAr":"ط§ط´طھط±ظƒ ظ„طھظ„ظ‚ظ‘ظٹ ط¢ط®ط± ط§ظ„ط£ط®ط¨ط§ط± ظˆط§ظ„طھط­ط¯ظٹط«ط§طھ ظ…ظ† ط¬ظ…ط¹ظٹطھظ†ط§.","visibility":"ALWAYS","visibilityRules":[]},"children":[]},{"id":"be8eefa6-d696-47be-8475-e2b0a676ec52","type":"hero","props":{"title":"Stay Connected","titleAr":"","subtitle":"Subscribe to receive news, events, and updates from the society.","subtitleAr":"","buttonLabel":"Get Started","buttonLabelAr":"ط§ط¨ط¯ط£ ط§ظ„ط¢ظ†","buttonUrl":"#","minHeight":"480px","textAlign":"center","overlayColor":"rgba(0,0,0,0.4)","paddingTop":"6rem","paddingBottom":"6rem","visibility":"ALWAYS","padding":"py-16","textColor":"text-white","backgroundColor":"bg-soil-dark","maxWidth":"max-w-5xl","visibilityRules":[]}},{"id":"c0b0d4e5-dfe4-4c98-8178-61a680bdcb56","type":"newsletter","props":{"title":"Stay Connected","visibility":"ALWAYS","padding":"py-16","textColor":"text-gray-900","backgroundColor":"bg-white","content":"Subscribe to our newsletter to receive the latest news, event announcements, and updates from SSSSY.","visibilityRules":[]}},{"id":"7221ee31-ace5-4c94-8ce0-f316d6a3e1cf","type":"newsletter-subscribe-form-section","props":{"title":"","visibility":"ALWAYS","padding":"py-16 md:py-20","backgroundColor":"bg-white","titleEn":"Subscribe to Our Newsletter","descriptionEn":"Receive the latest news, event announcements, research updates, and exclusive content directly to your inbox.","visibilityRules":[]}}]}	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-14 13:32:28.134548	2026-07-14 12:32:28.134548
\.


--
-- TOC entry 6291 (class 0 OID 76975)
-- Dependencies: 292
-- Data for Name: publications; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.publications (id, title_en, title_ar, slug, abstract_en, abstract_ar, authors, year, category, cover_image_url, pdf_url, file_size_kb, is_active, sort_order, created_at, updated_at) FROM stdin;
1ec44081-3265-4cdb-bad6-bf0f098ac69b	The State of the World's Land and Water Resources for Food and Agriculture	ط­ط§ظ„ط© ط§ظ„ط£ط±ط§ط¶ظٹ ظˆط§ظ„ظ…ظٹط§ظ‡ ظپظٹ ط§ظ„ط¹ط§ظ„ظ… ظ„ظ„ط؛ط°ط§ط، ظˆط§ظ„ط²ط±ط§ط¹ط©	solaw-state-worlds-land-water-resources	A comprehensive assessment of the current state and trends of the world's land and water resources, examining threats to food security and pathways to sustainable management.	طھظ‚ظٹظٹظ… ط´ط§ظ…ظ„ ظ„ظ„ط­ط§ظ„ط© ط§ظ„ط±ط§ظ‡ظ†ط© ظˆط§ظ„ط§طھط¬ط§ظ‡ط§طھ ط§ظ„ط®ط§طµط© ط¨ط§ظ„ط£ط±ط§ط¶ظٹ ظˆط§ظ„ظ…ظٹط§ظ‡ ظپظٹ ط§ظ„ط¹ط§ظ„ظ…طŒ ظٹط¯ط±ط³ ط§ظ„طھظ‡ط¯ظٹط¯ط§طھ ط§ظ„طھظٹ طھظˆط§ط¬ظ‡ ط§ظ„ط£ظ…ظ† ط§ظ„ط؛ط°ط§ط¦ظٹ ظˆط³ط¨ظ„ ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط©.	FAO	2021	Technical Report	https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=400&auto=format&fit=crop	https://www.fao.org/3/cb7654en/cb7654en.pdf	8500	t	1	2026-07-15 06:07:17.269448	2026-07-24 02:11:45.68119
35756b11-0a56-491a-ad24-43a15c5e5b9f	Soil Organic Carbon: The Hidden Potential	ط§ظ„ظƒط±ط¨ظˆظ† ط§ظ„ط¹ط¶ظˆظٹ ظپظٹ ط§ظ„طھط±ط¨ط©: ط§ظ„ط¥ظ…ظƒط§ظ†ط§طھ ط§ظ„ط®ظپظٹط©	soil-organic-carbon-hidden-potential	This report explores the role of soil organic carbon in mitigating climate change and improving soil health, with case studies from arid and semi-arid regions including the Middle East.	ظٹط³طھظƒط´ظپ ظ‡ط°ط§ ط§ظ„طھظ‚ط±ظٹط± ط¯ظˆط± ط§ظ„ظƒط±ط¨ظˆظ† ط§ظ„ط¹ط¶ظˆظٹ ظپظٹ ط§ظ„طھط±ط¨ط© ظپظٹ ط§ظ„طھط®ظپظٹظپ ظ…ظ† طھط؛ظٹط± ط§ظ„ظ…ظ†ط§ط® ظˆطھط­ط³ظٹظ† طµط­ط© ط§ظ„طھط±ط¨ط©طŒ ظ…ط¹ ط¯ط±ط§ط³ط§طھ ط­ط§ظ„ط© ظ…ظ† ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط¬ط§ظپط© ظˆط´ط¨ظ‡ ط§ظ„ط¬ط§ظپط© ط¨ظ…ط§ ظپظٹظ‡ط§ ط§ظ„ط´ط±ظ‚ ط§ظ„ط£ظˆط³ط·.	FAO / ITPS	2017	Research Paper	https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=400&auto=format&fit=crop	https://www.fao.org/3/i6937en/I6937EN.pdf	4200	t	2	2026-07-15 06:07:17.269448	2026-07-24 02:11:45.68119
d6fa709a-32b6-4f54-801c-0110c56485ce	Voluntary Guidelines for Sustainable Soil Management	ط§ظ„ظ…ط¨ط§ط¯ط¦ ط§ظ„طھظˆط¬ظٹظ‡ظٹط© ط§ظ„ط·ظˆط¹ظٹط© ظ„ط¥ط¯ط§ط±ط© ط§ظ„طھط±ط¨ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط©	voluntary-guidelines-sustainable-soil-management	Guidelines developed by the Global Soil Partnership to provide practical guidance for farmers, land users, and policy makers on sustainable soil management practices.	ظ…ط¨ط§ط¯ط¦ طھظˆط¬ظٹظ‡ظٹط© ط·ظˆط±طھظ‡ط§ ط§ظ„ط´ط±ط§ظƒط© ط§ظ„ط¹ط§ظ„ظ…ظٹط© ظ„ظ„طھط±ط¨ط© ظ„طھظˆظپظٹط± ط¥ط±ط´ط§ط¯ط§طھ ط¹ظ…ظ„ظٹط© ظ„ظ„ظ…ط²ط§ط±ط¹ظٹظ† ظˆظ…ط³طھط®ط¯ظ…ظٹ ط§ظ„ط£ط±ط§ط¶ظٹ ظˆطµط§ظ†ط¹ظٹ ط§ظ„ط³ظٹط§ط³ط§طھ ط­ظˆظ„ ظ…ظ…ط§ط±ط³ط§طھ ط¥ط¯ط§ط±ط© ط§ظ„طھط±ط¨ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط©.	FAO / Global Soil Partnership	2017	Guidelines	https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=400&auto=format&fit=crop	https://www.fao.org/3/bl813e/bl813e.pdf	1800	t	3	2026-07-15 06:07:17.269448	2026-07-24 02:11:45.68119
9b30fde3-e841-4c39-9910-45a13711b2fb	Soil Degradation and Restoration in the Mediterranean Region	طھط¯ظ‡ظˆط± ط§ظ„طھط±ط¨ط© ظˆط§ط³طھط¹ط§ط¯طھظ‡ط§ ظپظٹ ظ…ظ†ط·ظ‚ط© ط§ظ„ط¨ط­ط± ط§ظ„ط£ط¨ظٹط¶ ط§ظ„ظ…طھظˆط³ط·	soil-degradation-restoration-mediterranean	An assessment of soil degradation processes affecting Syria and neighboring Mediterranean countries, with recommendations for restoration techniques adapted to local conditions.	طھظ‚ظٹظٹظ… ظ„ط¹ظ…ظ„ظٹط§طھ طھط¯ظ‡ظˆط± ط§ظ„طھط±ط¨ط© ط§ظ„طھظٹ طھط¤ط«ط± ط¹ظ„ظ‰ ط³ظˆط±ظٹط§ ظˆط§ظ„ط¯ظˆظ„ ط§ظ„ظ…ط¬ط§ظˆط±ط© ظپظٹ ظ…ظ†ط·ظ‚ط© ط§ظ„ط¨ط­ط± ط§ظ„ط£ط¨ظٹط¶ ط§ظ„ظ…طھظˆط³ط·طŒ ظ…ط¹ طھظˆطµظٹط§طھ ظ„طھظ‚ظ†ظٹط§طھ ط§ظ„ط§ط³طھطµظ„ط§ط­ ط§ظ„ظ…ظƒظٹظپط© ظ…ط¹ ط§ظ„ط¸ط±ظˆظپ ط§ظ„ظ…ط­ظ„ظٹط©.	Dr. Ahmad Al-Rashid, Prof. Layla Hassan	2022	Research Paper	https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=400&auto=format&fit=crop	https://www.fao.org/3/cb4675en/cb4675en.pdf	3100	t	4	2026-07-15 06:07:17.269448	2026-07-24 02:11:45.68119
35aed6fd-9c4a-4ba6-bf1d-0309d8d71289	Dryland Soil Management for Food Security	ط¥ط¯ط§ط±ط© طھط±ط¨ط© ط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ط¬ط§ظپط© ظ„طھط­ظ‚ظٹظ‚ ط§ظ„ط£ظ…ظ† ط§ظ„ط؛ط°ط§ط¦ظٹ	dryland-soil-management-food-security	Strategies and best practices for managing soils in dryland environments to maximise agricultural productivity while maintaining long-term soil health and preventing desertification.	ط§ط³طھط±ط§طھظٹط¬ظٹط§طھ ظˆط£ظپط¶ظ„ ط§ظ„ظ…ظ…ط§ط±ط³ط§طھ ظ„ط¥ط¯ط§ط±ط© ط§ظ„طھط±ط¨ط© ظپظٹ ط§ظ„ط¨ظٹط¦ط§طھ ط§ظ„ط¬ط§ظپط© ظ„طھط¹ط¸ظٹظ… ط§ظ„ط¥ظ†طھط§ط¬ظٹط© ط§ظ„ط²ط±ط§ط¹ظٹط© ظ…ط¹ ط§ظ„ط­ظپط§ط¸ ط¹ظ„ظ‰ طµط­ط© ط§ظ„طھط±ط¨ط© ط¹ظ„ظ‰ ط§ظ„ظ…ط¯ظ‰ ط§ظ„ط·ظˆظٹظ„ ظˆظ…ظ†ط¹ ط§ظ„طھطµط­ط±.	SSSY Research Team	2023	Technical Report	https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop	https://www.fao.org/3/i3144e/i3144e.pdf	5600	t	5	2026-07-15 06:07:17.269448	2026-07-24 02:11:45.68119
32d79bba-7f2a-4875-b595-50dba3c38c3a	Conference Proceedings: Annual Soil Science Symposium Syria 2023	ظˆظ‚ط§ط¦ط¹ ط§ظ„ظ…ط¤طھظ…ط±: ط§ظ„ظ†ط¯ظˆط© ط§ظ„ط³ظ†ظˆظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§ 2023	conference-proceedings-soil-science-syria-2023	Collected papers and presentations from the 2023 Annual Soil Science Symposium, covering research on soil fertility, irrigation management, salinity control, and precision agriculture in Syrian conditions.	ط§ظ„ط£ظˆط±ط§ظ‚ ط§ظ„ط¨ط­ط«ظٹط© ظˆط§ظ„ط¹ط±ظˆط¶ ط§ظ„طھظ‚ط¯ظٹظ…ظٹط© ط§ظ„ظ…ط¬ظ…ط¹ط© ظ…ظ† ط§ظ„ظ†ط¯ظˆط© ط§ظ„ط³ظ†ظˆظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© 2023طŒ طھط؛ط·ظٹ ط§ظ„ط£ط¨ط­ط§ط« ط§ظ„ظ…طھط¹ظ„ظ‚ط© ط¨ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط© ظˆط¥ط¯ط§ط±ط© ط§ظ„ط±ظٹ ظˆط§ظ„ط³ظٹط·ط±ط© ط¹ظ„ظ‰ ط§ظ„ظ…ظ„ظˆط­ط© ظˆط§ظ„ط²ط±ط§ط¹ط© ط§ظ„ط¯ظ‚ظٹظ‚ط© ظپظٹ ط§ظ„ط¸ط±ظˆظپ ط§ظ„ط³ظˆط±ظٹط©.	SSSY Editorial Board	2023	Conference Proceedings	https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop	https://www.fao.org/3/ca7124en/ca7124en.pdf	9200	t	6	2026-07-15 06:07:17.269448	2026-07-24 02:11:45.68119
\.


--
-- TOC entry 6222 (class 0 OID 67901)
-- Dependencies: 223
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.refresh_tokens (id, user_id, token, expires_at, is_revoked, created_at) FROM stdin;
4005658c-dfb4-4fdf-b8f7-cb0294b4db5c	6d6595c0-1835-42be-89a1-1a44b899141c	eyJhbGciOiJIUzM4NCJ9.eyJqdGkiOiI2NWZmZGJiZS00NTM4LTRiOGEtYmY0MS1mOTNmMmI3ZDMzMTQiLCJzdWIiOiI2ZDY1OTVjMC0xODM1LTQyYmUtODlhMS0xYTQ0Yjg5OTE0MWMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4NTM4ODE3NiwiZXhwIjoxNzg1OTkyOTc2fQ.yf-PhimRAzbn9M2vyXK80rNG2efKPxsSO5G-pqIDtyHCtwQAGUGp4iiqjDPm0cBh	2026-08-06 08:09:36.133063	f	2026-07-30 08:09:36.137259
\.


--
-- TOC entry 6220 (class 0 OID 67863)
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
-- TOC entry 6218 (class 0 OID 67838)
-- Dependencies: 219
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.roles (id, name, display_name_ar, display_name_en, description, hierarchy_level, is_system, created_at, updated_at) FROM stdin;
fd53cd22-8396-4700-af29-8906643e0758	SUPER_ADMIN	ظ…ط¯ظٹط± ط§ظ„ظ†ط¸ط§ظ…	Super Admin	\N	100	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
7476843a-b780-4bf1-bb82-7774764f41ab	ADMIN	ظ…ط¯ظٹط±	Admin	\N	80	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
8b3c78e0-a2ed-45be-a19b-eba908283c4e	PUBLISHER	ظ†ط§ط´ط±	Publisher	\N	60	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
471253f8-83f2-403a-8f6c-0c37e4c86205	REVIEWER	ظ…ط±ط§ط¬ط¹	Reviewer	\N	40	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
aa18b906-73fe-474a-98b7-ae27c1932c9b	EDITOR	ظ…ط­ط±ط±	Editor	\N	30	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
fd19e351-c8f7-44e2-b258-d1df8d15bb5c	MEMBER	ط¹ط¶ظˆ	Member	\N	10	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
db5bac1c-57aa-4f24-aada-66b6c2db85b1	VISITOR	ط²ط§ط¦ط±	Visitor	\N	0	t	2026-07-09 10:39:16.907665	2026-07-09 10:39:16.907665
\.


--
-- TOC entry 6280 (class 0 OID 69149)
-- Dependencies: 281
-- Data for Name: sensor_readings; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.sensor_readings (id, sensor_id, value, recorded_at, created_at) FROM stdin;
\.


--
-- TOC entry 6279 (class 0 OID 69134)
-- Dependencies: 280
-- Data for Name: sensors; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.sensors (id, name, location, sensor_type, unit, latitude, longitude, is_active, farm_boundary_geojson, alert_threshold_min, alert_threshold_max, alert_enabled, created_at, updated_at) FROM stdin;
717fb5f2-204c-44ad-b5f6-5659c9130e24	Field A - Moisture	North Field	moisture	%	36.2	37.5	t	\N	\N	60	t	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
437bff1c-1ca9-466a-8a3c-522332eb3609	Field A - Temperature	North Field	temperature	آ°C	36.2	37.5	t	\N	\N	40	t	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
1c3f3037-4e0e-41fd-951d-86e3fba107cb	Field B - pH	South Field	ph	pH	35.8	37.2	t	\N	\N	8.5	f	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
43a87463-5326-4823-95d5-d47fc52db328	Field C - NPK	East Field	npk	mg/kg	36	38	t	\N	\N	200	f	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
c7db6984-8592-4942-94ea-2299a058702d	Greenhouse - Humidity	Greenhouse A	humidity	%	36.3	37.1	t	\N	\N	85	t	2026-07-09 10:39:19.461149	2026-07-09 10:39:19.461149
\.


--
-- TOC entry 6258 (class 0 OID 68655)
-- Dependencies: 259
-- Data for Name: seo_metadata; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.seo_metadata (id, entity_type, entity_id, meta_title, meta_description, og_title, og_description, og_image_url, canonical_url, robots, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6299 (class 0 OID 77441)
-- Dependencies: 300
-- Data for Name: site_section_versions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.site_section_versions (id, section_id, version_number, data, config, styling, published_by, change_summary, created_at) FROM stdin;
9c7575bc-dbea-4cd3-8e00-4fd1039cdafe	62d93016-0298-42c8-a911-b07c248435c1	1	{}	{"titleAr": "طھظˆط§طµظ„ ظ…ط¹ظ†ط§", "titleEn": "Get In Touch", "submitLabelAr": "ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط©", "submitLabelEn": "Send Message"}	{}	system	Initial version â€” migrated from V62	2026-07-15 06:07:17.75888
d7c2b20a-4ebc-4da8-9726-7a09717f1b4b	c5c7431f-c200-43cd-a5d4-f9d3dbf84bdb	1	{}	{}	{}	system	Initial version â€” migrated from V62	2026-07-10 16:38:23.795489
8cf14be9-247a-4411-8cc1-40eb26b94849	3c9200cc-1de7-41ce-b164-6a557ae996a4	1	{}	{}	{}	system	Initial version â€” migrated from V62	2026-07-10 16:38:23.795489
cb811e9d-d3fe-470e-9518-6cc6cdf6ee9e	fc01df08-ef76-4f59-92b3-4d60cd3f95db	1	{}	{"columns": 4}	{}	system	Initial version â€” migrated from V62	2026-07-10 16:38:23.795489
9dbf7aa2-8111-4dda-a714-846292e4b328	c97b1a3f-9ae2-4193-a617-f5cd2d3bae49	1	{"items": [{"titleAr": "ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ", "titleEn": "Research", "descriptionAr": "طھط¹ط²ظٹط² ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ط£ط¨ط­ط§ط« ط§ظ„ظ…طھط·ظˆط±ط© ظˆط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ظ…ظٹط¯ط§ظ†ظٹط© ط¹ط¨ط± ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط²ط±ط§ط¹ظٹط© ط§ظ„ظ…طھظ†ظˆط¹ط© ظپظٹ ط³ظˆط±ظٹط§.", "descriptionEn": "Advancing soil science through cutting-edge research and field studies across Syria's diverse agricultural regions."}, {"titleAr": "ط§ظ„طھط¹ظ„ظٹظ…", "titleEn": "Education", "descriptionAr": "طھظˆظپظٹط± ط§ظ„طھط¯ط±ظٹط¨ ظˆظˆط±ط´ ط§ظ„ط¹ظ…ظ„ ظˆط§ظ„ط¨ط±ط§ظ…ط¬ ط§ظ„طھط¹ظ„ظٹظ…ظٹط© ظ„ط¹ظ„ظ…ط§ط، ط§ظ„طھط±ط¨ط© ظˆط§ظ„ط·ظ„ط§ط¨ ظˆط§ظ„ظ…ط²ط§ط±ط¹ظٹظ†.", "descriptionEn": "Providing training, workshops, and educational programs for soil scientists, students, and farmers."}, {"titleAr": "ط§ظ„ط§ط³طھط¯ط§ظ…ط©", "titleEn": "Sustainability", "descriptionAr": "طھط¹ط²ظٹط² ظ…ظ…ط§ط±ط³ط§طھ ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ ظ„ط­ظ…ط§ظٹط© ظ…ظˆط§ط±ط¯ ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظˆطھط·ظˆظٹط±ظ‡ط§ ظ„ظ„ط£ط¬ظٹط§ظ„ ط§ظ„ظ‚ط§ط¯ظ…ط©.", "descriptionEn": "Promoting sustainable land management practices to protect and enhance Syria's soil resources for future generations."}]}	{"titleAr": "ظ…ط¬ط§ظ„ط§طھ ط§ظ‡طھظ…ط§ظ…ظ†ط§", "titleEn": "Our Focus Areas"}	{}	system	Initial version â€” migrated from V62	2026-07-15 04:38:52.572915
7ea44c18-48af-4232-a76d-7b9072f01eca	31e505c2-db5f-4cf1-8196-3080dee14e98	1	{}	{"titleAr": "ط§ظ†ط¶ظ… ط¥ظ„ظ‰ ظ…ط¬طھظ…ط¹ظ†ط§", "titleEn": "Join Our Community", "buttonUrl": "/members", "subtitleAr": "ظƒظ† ط¹ط¶ظˆظ‹ط§ ظپظٹ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظˆط³ط§ظ‡ظ… ظپظٹ ظ…ط³طھظ‚ط¨ظ„ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§ ظˆظ…ط§ ظˆط±ط§ط،ظ‡ط§.", "subtitleEn": "Become a member of the Soil Science Society of Syria and contribute to the future of soil science in Syria and beyond.", "buttonLabelAr": "ظƒظ† ط¹ط¶ظˆظ‹ط§", "buttonLabelEn": "Become a Member"}	{}	system	Initial version â€” migrated from V62	2026-07-15 04:38:52.572915
52c6a7a0-dd34-4080-af50-a2c0b45eecf3	28c3ec05-d603-4123-8e34-3e7b3b075b37	1	{}	{"titleAr": "ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ", "titleEn": "Publications", "viewMoreUrl": "/publications", "viewMoreLabelAr": "ط¬ظ…ظٹط¹ ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ", "viewMoreLabelEn": "View All Publications"}	{}	system	Initial version â€” migrated from V62	2026-07-15 06:07:17.75888
8e74b5a0-782d-4585-91c7-ad59d61f3c26	c7c43d45-024b-4131-af2e-815a818928de	1	{}	{"slides": [{"titleAr": "طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§", "titleEn": "Advancing Soil Science in Syria", "subtitleAr": "ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "descriptionAr": "طھط¹ط²ظٹط² ط£ط¨ط­ط§ط« ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ ظپظٹ ط³ظˆط±ظٹط§", "descriptionEn": "Advancing soil science research, education, and sustainable land management in Syria.", "backgroundImage": "", "primaryButtonUrl": "/members", "secondaryButtonUrl": "/about", "primaryButtonLabelAr": "ط§ظ†ط¶ظ… ط¥ظ„ظٹظ†ط§", "primaryButtonLabelEn": "Join Us", "secondaryButtonLabelAr": "ط§ط¹ط±ظپ ط§ظ„ظ…ط²ظٹط¯", "secondaryButtonLabelEn": "Learn More"}, {"titleAr": "طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§", "titleEn": "Advancing Soil Science in Syria", "subtitleAr": "ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "descriptionAr": "طھط¹ط²ظٹط² ط£ط¨ط­ط§ط« ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ ظپظٹ ط³ظˆط±ظٹط§", "descriptionEn": "Advancing soil science research, education, and sustainable land management in Syria.", "backgroundImage": "", "primaryButtonUrl": "/members", "secondaryButtonUrl": "/about", "primaryButtonLabelAr": "ط§ظ†ط¶ظ… ط¥ظ„ظٹظ†ط§", "primaryButtonLabelEn": "Join Us", "secondaryButtonLabelAr": "ط§ط¹ط±ظپ ط§ظ„ظ…ط²ظٹط¯", "secondaryButtonLabelEn": "Learn More"}, {"titleAr": "طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§", "titleEn": "Advancing Soil Science in Syria", "subtitleAr": "ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "descriptionAr": "ظ‚ظٹط§ط¯ط© ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط¥ط¯ط§ط±ط© ط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ط¹ط¨ط± ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط²ط±ط§ط¹ظٹط© ط§ظ„ظ…طھظ†ظˆط¹ط© ظپظٹ ط³ظˆط±ظٹط§", "descriptionEn": "Leading research, education, and sustainable land management across Syriaâ€™s diverse agricultural regions.", "backgroundImage": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1920&auto=format&fit=crop", "primaryButtonUrl": "/members", "secondaryButtonUrl": "/about", "primaryButtonLabelAr": "ط§ظ†ط¶ظ… ط¥ظ„ظٹظ†ط§", "primaryButtonLabelEn": "Join Us", "secondaryButtonLabelAr": "ط§ط¹ط±ظپ ط§ظ„ظ…ط²ظٹط¯", "secondaryButtonLabelEn": "Learn More"}, {"titleAr": "ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ", "titleEn": "Sustainable Land Management", "subtitleAr": "طµظˆظ† ط§ظ„طھط±ط¨ط© ظ„ظ„ط£ط¬ظٹط§ظ„ ط§ظ„ظ‚ط§ط¯ظ…ط©", "descriptionAr": "طھط¹ط²ظٹط² ط£ظپط¶ظ„ ط§ظ„ظ…ظ…ط§ط±ط³ط§طھ ظپظٹ طµظˆظ† ط§ظ„طھط±ط¨ط© ظˆط§ظ„ط²ط±ط§ط¹ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ…ظ† ط£ط¬ظ„ ط§ظ„ط£ظ…ظ† ط§ظ„ط؛ط°ط§ط¦ظٹ ظˆط§ظ„طµط­ط© ط§ظ„ط¨ظٹط¦ظٹط©", "descriptionEn": "Promoting best practices in soil conservation and sustainable agriculture for food security and environmental health.", "backgroundImage": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1920&auto=format&fit=crop", "primaryButtonUrl": "/publications", "secondaryButtonUrl": "/events", "primaryButtonLabelAr": "ط£ط¨ط­ط§ط«ظ†ط§", "primaryButtonLabelEn": "Our Research", "secondaryButtonLabelAr": "ط§ظ„ظپط¹ط§ظ„ظٹط§طھ", "secondaryButtonLabelEn": "Events"}, {"titleAr": "طھظˆط§طµظ„ ظ…ط¹ ط¹ظ„ظ…ط§ط، ط§ظ„طھط±ط¨ط©", "titleEn": "Connect with Soil Scientists", "subtitleAr": "ط´ط¨ظƒط© ط¹ظ„ظ…ظٹط© ظ…طھط®طµطµط©", "descriptionAr": "ط§ظ†ط¶ظ… ط¥ظ„ظ‰ ط´ط¨ظƒطھظ†ط§ ظ…ظ† ط§ظ„ط¨ط§ط­ط«ظٹظ† ظˆط§ظ„ظ…ط¹ظ„ظ…ظٹظ† ظˆط§ظ„ظ…ظ…ط§ط±ط³ظٹظ† ط§ظ„ظ…ظƒط±ط³ظٹظ† ظ„طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط§ظ„ظ…ظ†ط·ظ‚ط©", "descriptionEn": "Join our network of researchers, educators, and practitioners dedicated to advancing soil science across the region.", "backgroundImage": "https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=1920&auto=format&fit=crop", "primaryButtonUrl": "/members", "secondaryButtonUrl": "/contact", "primaryButtonLabelAr": "ظƒظ† ط¹ط¶ظˆظ‹ط§", "primaryButtonLabelEn": "Become a Member", "secondaryButtonLabelAr": "ط§طھطµظ„ ط¨ظ†ط§", "secondaryButtonLabelEn": "Contact Us"}], "autoplay": true, "showDots": true, "showArrows": true, "transitionStyle": "slide", "autoplayInterval": 5000}	{}	system	Initial version â€” migrated from V62	2026-07-15 07:48:36.283057
e0d1751f-0de1-4e7e-b17f-f4157b9a1625	778f8aad-a0af-4d8a-afa2-75c0bdbcdb04	1	{}	{"titleAr": "ط§ط¨ظ‚ ط¹ظ„ظ‰ ط§ط·ظ„ط§ط¹", "titleEn": "Stay Connected", "subtitleAr": "ط§ط´طھط±ظƒ ظپظٹ ظ†ط´ط±طھظ†ط§ ط§ظ„ط¥ط®ط¨ط§ط±ظٹط© ظ„ط¢ط®ط± ط§ظ„ط£ط®ط¨ط§ط± ظˆط§ظ„ظپط¹ط§ظ„ظٹط§طھ ظˆط§ظ„ط£ط¨ط­ط§ط«.", "subtitleEn": "Subscribe to our newsletter to receive the latest news, event announcements, and updates.", "buttonLabelAr": "ط§ط´طھط±ظƒ", "buttonLabelEn": "Subscribe", "placeholderTextAr": "ط£ط¯ط®ظ„ ط¨ط±ظٹط¯ظƒ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ", "placeholderTextEn": "Enter your email address"}	{}	system	Initial version â€” migrated from V62	2026-07-15 06:07:17.75888
77ab0721-fc6e-443e-a899-b4cbbf6b1142	13928128-f724-43e7-8636-7f68207b2811	1	{"items": [{"value": "11", "titleAr": "ط§ظ„ط£ط¹ط¶ط§ط، ط§ظ„ظ…ط¤ط³ط³ظˆظ†", "titleEn": "Founding Members"}, {"value": "11", "titleAr": "ط­ط§ظ…ظ„ظˆ ط´ظ‡ط§ط¯ط© ط§ظ„ط¯ظƒطھظˆط±ط§ظ‡", "titleEn": "PhD Holders"}, {"value": "5+", "titleAr": "ط§ظ„ظ…ط­ط§ظپط¸ط§طھ ط§ظ„ظ…ط´ظ…ظˆظ„ط©", "titleEn": "Governorates Covered"}, {"value": "3", "titleAr": "ظ…ط¬ط§ظ„ط§طھ ط§ظ„طھط±ظƒظٹط²", "titleEn": "Focus Areas"}]}	{"titleAr": "ط§ظ„ط¬ظ…ط¹ظٹط© ط¨ط§ظ„ط£ط±ظ‚ط§ظ…", "titleEn": "SSSY by the Numbers"}	{}	system	Initial version â€” migrated from V62	2026-07-15 07:51:14.767242
318262d9-dc17-4059-ae85-519149cf1afe	0770e0fe-e5dd-4255-bf4d-3e81a46baae2	1	{"items": [{"nameAr": "ط£.ط¯. ظ…ط­ظ…ظˆط¯ ط£ظ†ظٹط³ ط¹ظˆط¯ط©", "nameEn": "Prof. Mahmoud Anis Oudeh", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³ â€” ط£ط³طھط§ط° ط¬ط§ظ…ط¹ظٹطŒ ط­ظ…طµ", "roleEn": "Founding Member â€” University Professor, Homs", "quoteAr": "طھط£ط³ط³طھ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظ„طھظˆط­ظٹط¯ ط§ظ„ط¨ط§ط­ط«ظٹظ† ظˆط§ظ„ط£ظƒط§ط¯ظٹظ…ظٹظٹظ† ظˆط§ظ„ظ…ظ…ط§ط±ط³ظٹظ† طھط­طھ ط³ظ‚ظپ ط¹ظ„ظ…ظٹ ظˆط§ط­ط¯ â€” ظ„طھط·ظˆظٹط± ط§ظ„ظ…ط¹ط±ظپط© ظˆط­ظ…ط§ظٹط© ط£ط±ط¶ظ†ط§ ظ„ظ„ط£ط¬ظٹط§ظ„ ط§ظ„ظ‚ط§ط¯ظ…ط©.", "quoteEn": "The Soil Science Society of Syria was founded to unite researchers, academics, and practitioners under one scientific home â€” advancing knowledge and protecting our land for future generations."}, {"nameAr": "ط¯. ظ„ظٹظ†ط§ ظ…ظ…ط¯ظˆط­ ط§ظ„ظ†ط¯ط§ظپ", "nameEn": "Dr. Lina Mamdouh Al-Naddaf", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³ â€” ط¯ظƒطھظˆط± ط¬ط§ظ…ط¹ظٹطŒ ط­ظ…طµ", "roleEn": "Founding Member â€” University Lecturer, Homs", "quoteAr": "ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„طھط±ط¨ط© ظ„ظٹط³طھ ظ‡ط¯ظپط§ظ‹ ط¹ظ„ظ…ظٹط§ظ‹ ظپط­ط³ط¨طŒ ط¨ظ„ ظ‡ظٹ ظ…ط³ط¤ظˆظ„ظٹط© ظˆط·ظ†ظٹط©. ط§ظ„ط¬ظ…ط¹ظٹط© طھظ…ظ†ط­ظ†ط§ ط§ظ„ظ…ظ†طµط© ظ„طھط­ظˆظٹظ„ ط§ظ„ط£ط¨ط­ط§ط« ط¥ظ„ظ‰ ط£ط«ط± ط­ظ‚ظٹظ‚ظٹ ظپظٹ ط§ظ„ط³ظٹط§ط³ط§طھ.", "quoteEn": "Sustainable soil management is not just a scientific goal â€” it is a national responsibility. The society gives us the platform to translate research into real policy impact."}, {"nameAr": "ط£.ط¯. ط£ظƒط±ظ… ظ…ط­ظ…ط¯ ط§ظ„ط¨ظ„ط®ظٹ", "nameEn": "Prof. Akram Mohammad Al-Balkhi", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³ â€” ط£ط³طھط§ط° ط¬ط§ظ…ط¹ظٹطŒ ط¯ظ…ط´ظ‚", "roleEn": "Founding Member â€” University Professor, Damascus", "quoteAr": "ظ…ط³طھظ‚ط¨ظ„ ط§ظ„ط²ط±ط§ط¹ط© ظپظٹ ط³ظˆط±ظٹط§ ظٹط¹طھظ…ط¯ ط¹ظ„ظ‰ طµط­ط© ط§ظ„طھط±ط¨ط©. ظ…ظ† ط®ظ„ط§ظ„ ظ…ط¤طھظ…ط±ط§طھ ط§ظ„ط¬ظ…ط¹ظٹط© ظˆظˆط±ط´ ط¹ظ…ظ„ظ‡ط§ ظˆظ…ظ†ط´ظˆط±ط§طھظ‡ط§ ط§ظ„ظ…ط­ظƒظ…ط©طŒ ظ†ط¨ظ†ظٹ ط§ظ„ط£ط³ط§ط³ ط§ظ„ط¹ظ„ظ…ظٹ ط§ظ„ط°ظٹ طھط­طھط§ط¬ظ‡ ظ‡ط°ظ‡ ط§ظ„ط¨ظ„ط§ط¯.", "quoteEn": "Syria's agricultural future depends on healthy soils. Through the society's conferences, workshops, and peer-reviewed publications, we are building the scientific foundation this country needs."}]}	{"titleAr": "ظ…ط§ط°ط§ ظٹظ‚ظˆظ„ ط£ط¹ط¶ط§ط¤ظ†ط§", "titleEn": "What Our Members Say"}	{}	system	Initial version â€” migrated from V62	2026-07-15 07:51:14.767242
dca66bec-2ed9-451a-b2fc-1f836a9b0c27	c5c7431f-c200-43cd-a5d4-f9d3dbf84bdb	2	{"items": [{"slug": "society-launches-national-soil-assessment-project", "excerpt": "The Soil Science Society of Syria has launched a comprehensive national project to assess soil health across all agricultural governorates, aiming to establish a baseline database for future research.", "titleAr": "ط§ظ„ط¬ظ…ط¹ظٹط© طھط·ظ„ظ‚ ظ…ط´ط±ظˆط¹ طھظ‚ظٹظٹظ… ط§ظ„طھط±ط¨ط© ط§ظ„ظˆط·ظ†ظٹ", "titleEn": "Society Launches National Soil Assessment Project", "category": "", "publishedAt": "2026-07-15T06:10:22.751245", "featuredImage": ""}, {"slug": "new-research-drought-impact-euphrates-valley-soils", "excerpt": "A recent study published by SSSY researchers documents significant changes in soil organic matter and microbial diversity in the Euphrates Valley region over the past decade, highlighting urgent conservation needs.", "titleAr": "ط¨ط­ط« ط¬ط¯ظٹط¯ ظٹظƒط´ظپ طھط£ط«ظٹط± ط§ظ„ط¬ظپط§ظپ ط¹ظ„ظ‰ طھط±ط¨ط© ظˆط§ط¯ظٹ ط§ظ„ظپط±ط§طھ", "titleEn": "New Research Reveals Drought Impact on Euphrates Valley Soils", "category": "", "publishedAt": "2026-07-08T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-signs-cooperation-agreement-fao", "excerpt": "The Soil Science Society of Syria has signed a memorandum of understanding with the Food and Agriculture Organization of the United Nations to collaborate on soil mapping and sustainable land management programmes.", "titleAr": "ط§طھظپط§ظ‚ظٹط© طھط¹ط§ظˆظ† ظ…ط¹ ظ…ظ†ط¸ظ…ط© ط§ظ„ط£ط؛ط°ظٹط© ظˆط§ظ„ط²ط±ط§ط¹ط© ظ„ظ„ط£ظ…ظ… ط§ظ„ظ…طھط­ط¯ط©", "titleEn": "SSSY Signs Cooperation Agreement with FAO", "category": "", "publishedAt": "2026-07-01T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-recognises-outstanding-members-soil-research", "excerpt": "At the annual general assembly, three SSSY members received recognition awards for their exceptional contributions to soil science research, education, and field practice over the past year.", "titleAr": "طھظƒط±ظٹظ… ط£ط¹ط¶ط§ط، ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ظ…طھظ…ظٹط²ظٹظ† ظپظٹ ظ…ط¬ط§ظ„ ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط©", "titleEn": "SSSY Recognises Outstanding Members in Soil Research", "category": "", "publishedAt": "2026-06-24T06:10:22.751245", "featuredImage": ""}]}	{"count": 3, "titleAr": "ط£ط­ط¯ط« ط§ظ„ط£ط®ط¨ط§ط±1", "titleEn": "Latest News", "dataSource": "api", "viewAllUrl": "/news", "viewAllLabelAr": "ط¬ظ…ظٹط¹ ط§ظ„ط£ط®ط¨ط§ط±", "viewAllLabelEn": "View All News"}	{}	6d6595c0-1835-42be-89a1-1a44b899141c	Published version 2	2026-07-25 03:04:33.990152
781a3f26-b42a-4939-a7cf-610c5cabd1dd	c5c7431f-c200-43cd-a5d4-f9d3dbf84bdb	3	{"items": [{"slug": "society-launches-national-soil-assessment-project", "excerpt": "The Soil Science Society of Syria has launched a comprehensive national project to assess soil health across all agricultural governorates, aiming to establish a baseline database for future research.", "titleAr": "ط§ظ„ط¬ظ…ط¹ظٹط© طھط·ظ„ظ‚ ظ…ط´ط±ظˆط¹ طھظ‚ظٹظٹظ… ط§ظ„طھط±ط¨ط© ط§ظ„ظˆط·ظ†ظٹ", "titleEn": "Society Launches National Soil Assessment Project", "category": "", "publishedAt": "2026-07-15T06:10:22.751245", "featuredImage": ""}, {"slug": "new-research-drought-impact-euphrates-valley-soils", "excerpt": "A recent study published by SSSY researchers documents significant changes in soil organic matter and microbial diversity in the Euphrates Valley region over the past decade, highlighting urgent conservation needs.", "titleAr": "ط¨ط­ط« ط¬ط¯ظٹط¯ ظٹظƒط´ظپ طھط£ط«ظٹط± ط§ظ„ط¬ظپط§ظپ ط¹ظ„ظ‰ طھط±ط¨ط© ظˆط§ط¯ظٹ ط§ظ„ظپط±ط§طھ", "titleEn": "New Research Reveals Drought Impact on Euphrates Valley Soils", "category": "", "publishedAt": "2026-07-08T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-signs-cooperation-agreement-fao", "excerpt": "The Soil Science Society of Syria has signed a memorandum of understanding with the Food and Agriculture Organization of the United Nations to collaborate on soil mapping and sustainable land management programmes.", "titleAr": "ط§طھظپط§ظ‚ظٹط© طھط¹ط§ظˆظ† ظ…ط¹ ظ…ظ†ط¸ظ…ط© ط§ظ„ط£ط؛ط°ظٹط© ظˆط§ظ„ط²ط±ط§ط¹ط© ظ„ظ„ط£ظ…ظ… ط§ظ„ظ…طھط­ط¯ط©", "titleEn": "SSSY Signs Cooperation Agreement with FAO", "category": "", "publishedAt": "2026-07-01T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-recognises-outstanding-members-soil-research", "excerpt": "At the annual general assembly, three SSSY members received recognition awards for their exceptional contributions to soil science research, education, and field practice over the past year.", "titleAr": "طھظƒط±ظٹظ… ط£ط¹ط¶ط§ط، ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ظ…طھظ…ظٹط²ظٹظ† ظپظٹ ظ…ط¬ط§ظ„ ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط©", "titleEn": "SSSY Recognises Outstanding Members in Soil Research", "category": "", "publishedAt": "2026-06-24T06:10:22.751245", "featuredImage": ""}]}	{"count": 3, "titleAr": "ط£ط­ط¯ط« ط§ظ„ط£ط®ط¨ط§ط±1", "titleEn": "Latest News", "dataSource": "api", "viewAllUrl": "/news", "viewAllLabelAr": "ط¬ظ…ظٹط¹ ط§ظ„ط£ط®ط¨ط§ط± 1", "viewAllLabelEn": "View All News"}	{}	6d6595c0-1835-42be-89a1-1a44b899141c	Published version 3	2026-07-25 03:05:19.732873
b8d03721-8003-486c-859e-1ae754597356	c5c7431f-c200-43cd-a5d4-f9d3dbf84bdb	4	{"items": [{"slug": "society-launches-national-soil-assessment-project", "excerpt": "The Soil Science Society of Syria has launched a comprehensive national project to assess soil health across all agricultural governorates, aiming to establish a baseline database for future research.", "titleAr": "ط§ظ„ط¬ظ…ط¹ظٹط© طھط·ظ„ظ‚ ظ…ط´ط±ظˆط¹ طھظ‚ظٹظٹظ… ط§ظ„طھط±ط¨ط© ط§ظ„ظˆط·ظ†ظٹ", "titleEn": "Society Launches National Soil Assessment Project", "category": "", "publishedAt": "2026-07-15T06:10:22.751245", "featuredImage": ""}, {"slug": "new-research-drought-impact-euphrates-valley-soils", "excerpt": "A recent study published by SSSY researchers documents significant changes in soil organic matter and microbial diversity in the Euphrates Valley region over the past decade, highlighting urgent conservation needs.", "titleAr": "ط¨ط­ط« ط¬ط¯ظٹط¯ ظٹظƒط´ظپ طھط£ط«ظٹط± ط§ظ„ط¬ظپط§ظپ ط¹ظ„ظ‰ طھط±ط¨ط© ظˆط§ط¯ظٹ ط§ظ„ظپط±ط§طھ", "titleEn": "New Research Reveals Drought Impact on Euphrates Valley Soils", "category": "", "publishedAt": "2026-07-08T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-signs-cooperation-agreement-fao", "excerpt": "The Soil Science Society of Syria has signed a memorandum of understanding with the Food and Agriculture Organization of the United Nations to collaborate on soil mapping and sustainable land management programmes.", "titleAr": "ط§طھظپط§ظ‚ظٹط© طھط¹ط§ظˆظ† ظ…ط¹ ظ…ظ†ط¸ظ…ط© ط§ظ„ط£ط؛ط°ظٹط© ظˆط§ظ„ط²ط±ط§ط¹ط© ظ„ظ„ط£ظ…ظ… ط§ظ„ظ…طھط­ط¯ط©", "titleEn": "SSSY Signs Cooperation Agreement with FAO", "category": "", "publishedAt": "2026-07-01T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-recognises-outstanding-members-soil-research", "excerpt": "At the annual general assembly, three SSSY members received recognition awards for their exceptional contributions to soil science research, education, and field practice over the past year.", "titleAr": "طھظƒط±ظٹظ… ط£ط¹ط¶ط§ط، ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ظ…طھظ…ظٹط²ظٹظ† ظپظٹ ظ…ط¬ط§ظ„ ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط©", "titleEn": "SSSY Recognises Outstanding Members in Soil Research", "category": "", "publishedAt": "2026-06-24T06:10:22.751245", "featuredImage": ""}]}	{"count": 3, "titleAr": "ط£ط­ط¯ط« ط§ظ„ط£ط®ط¨ط§ط±1", "titleEn": "Latest News", "dataSource": "api", "viewAllUrl": "/news", "viewAllLabelAr": "ط¬ظ…ظٹط¹ ط§ظ„ط£ط®ط¨ط§ط± 1", "viewAllLabelEn": "View All News"}	{}	6d6595c0-1835-42be-89a1-1a44b899141c	Published version 4	2026-07-25 03:06:08.583685
2286ee86-ae31-4929-bdeb-569abe90a2c5	c5c7431f-c200-43cd-a5d4-f9d3dbf84bdb	5	{"items": [{"slug": "society-launches-national-soil-assessment-project", "excerpt": "The Soil Science Society of Syria has launched a comprehensive national project to assess soil health across all agricultural governorates, aiming to establish a baseline database for future research.", "titleAr": "ط§ظ„ط¬ظ…ط¹ظٹط© طھط·ظ„ظ‚ ظ…ط´ط±ظˆط¹ طھظ‚ظٹظٹظ… ط§ظ„طھط±ط¨ط© ط§ظ„ظˆط·ظ†ظٹ", "titleEn": "Society Launches National Soil Assessment Project", "category": "", "publishedAt": "2026-07-15T06:10:22.751245", "featuredImage": ""}, {"slug": "new-research-drought-impact-euphrates-valley-soils", "excerpt": "A recent study published by SSSY researchers documents significant changes in soil organic matter and microbial diversity in the Euphrates Valley region over the past decade, highlighting urgent conservation needs.", "titleAr": "ط¨ط­ط« ط¬ط¯ظٹط¯ ظٹظƒط´ظپ طھط£ط«ظٹط± ط§ظ„ط¬ظپط§ظپ ط¹ظ„ظ‰ طھط±ط¨ط© ظˆط§ط¯ظٹ ط§ظ„ظپط±ط§طھ", "titleEn": "New Research Reveals Drought Impact on Euphrates Valley Soils", "category": "", "publishedAt": "2026-07-08T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-signs-cooperation-agreement-fao", "excerpt": "The Soil Science Society of Syria has signed a memorandum of understanding with the Food and Agriculture Organization of the United Nations to collaborate on soil mapping and sustainable land management programmes.", "titleAr": "ط§طھظپط§ظ‚ظٹط© طھط¹ط§ظˆظ† ظ…ط¹ ظ…ظ†ط¸ظ…ط© ط§ظ„ط£ط؛ط°ظٹط© ظˆط§ظ„ط²ط±ط§ط¹ط© ظ„ظ„ط£ظ…ظ… ط§ظ„ظ…طھط­ط¯ط©", "titleEn": "SSSY Signs Cooperation Agreement with FAO", "category": "", "publishedAt": "2026-07-01T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-recognises-outstanding-members-soil-research", "excerpt": "At the annual general assembly, three SSSY members received recognition awards for their exceptional contributions to soil science research, education, and field practice over the past year.", "titleAr": "طھظƒط±ظٹظ… ط£ط¹ط¶ط§ط، ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ظ…طھظ…ظٹط²ظٹظ† ظپظٹ ظ…ط¬ط§ظ„ ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط©", "titleEn": "SSSY Recognises Outstanding Members in Soil Research", "category": "", "publishedAt": "2026-06-24T06:10:22.751245", "featuredImage": ""}]}	{"count": 3, "titleAr": "ط£ط­ط¯ط« ط§ظ„ط£ط®ط¨ط§ط±", "titleEn": "Latest News", "dataSource": "api", "viewAllUrl": "/news", "viewAllLabelAr": "ط¬ظ…ظٹط¹ ط§ظ„ط£ط®ط¨ط§ط± ", "viewAllLabelEn": "View All News"}	{}	6d6595c0-1835-42be-89a1-1a44b899141c	Published version 5	2026-07-25 03:08:35.560308
9dd43488-3e68-4043-a2c8-86ce3f81139e	c5c7431f-c200-43cd-a5d4-f9d3dbf84bdb	6	{"items": [{"slug": "society-launches-national-soil-assessment-project", "excerpt": "The Soil Science Society of Syria has launched a comprehensive national project to assess soil health across all agricultural governorates, aiming to establish a baseline database for future research.", "titleAr": "ط§ظ„ط¬ظ…ط¹ظٹط© طھط·ظ„ظ‚ ظ…ط´ط±ظˆط¹ طھظ‚ظٹظٹظ… ط§ظ„طھط±ط¨ط© ط§ظ„ظˆط·ظ†ظٹ", "titleEn": "Society Launches National Soil Assessment Project", "category": "", "publishedAt": "2026-07-15T06:10:22.751245", "featuredImage": ""}, {"slug": "new-research-drought-impact-euphrates-valley-soils", "excerpt": "A recent study published by SSSY researchers documents significant changes in soil organic matter and microbial diversity in the Euphrates Valley region over the past decade, highlighting urgent conservation needs.", "titleAr": "ط¨ط­ط« ط¬ط¯ظٹط¯ ظٹظƒط´ظپ طھط£ط«ظٹط± ط§ظ„ط¬ظپط§ظپ ط¹ظ„ظ‰ طھط±ط¨ط© ظˆط§ط¯ظٹ ط§ظ„ظپط±ط§طھ", "titleEn": "New Research Reveals Drought Impact on Euphrates Valley Soils", "category": "", "publishedAt": "2026-07-08T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-signs-cooperation-agreement-fao", "excerpt": "The Soil Science Society of Syria has signed a memorandum of understanding with the Food and Agriculture Organization of the United Nations to collaborate on soil mapping and sustainable land management programmes.", "titleAr": "ط§طھظپط§ظ‚ظٹط© طھط¹ط§ظˆظ† ظ…ط¹ ظ…ظ†ط¸ظ…ط© ط§ظ„ط£ط؛ط°ظٹط© ظˆط§ظ„ط²ط±ط§ط¹ط© ظ„ظ„ط£ظ…ظ… ط§ظ„ظ…طھط­ط¯ط©", "titleEn": "SSSY Signs Cooperation Agreement with FAO", "category": "", "publishedAt": "2026-07-01T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-recognises-outstanding-members-soil-research", "excerpt": "At the annual general assembly, three SSSY members received recognition awards for their exceptional contributions to soil science research, education, and field practice over the past year.", "titleAr": "طھظƒط±ظٹظ… ط£ط¹ط¶ط§ط، ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ظ…طھظ…ظٹط²ظٹظ† ظپظٹ ظ…ط¬ط§ظ„ ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط©", "titleEn": "SSSY Recognises Outstanding Members in Soil Research", "category": "", "publishedAt": "2026-06-24T06:10:22.751245", "featuredImage": ""}]}	{"count": 3, "titleAr": "ط£ط­ط¯ط« ط§ظ„ط£ط®ط¨ط§ط±", "titleEn": "Latest News", "dataSource": "api", "viewAllUrl": "/news", "viewAllLabelAr": "ط¬ظ…ظٹط¹ ط§ظ„ط£ط®ط¨ط§ط±  2", "viewAllLabelEn": "View All News"}	{}	6d6595c0-1835-42be-89a1-1a44b899141c	Published version 6	2026-07-25 03:15:31.814776
2e9f6016-800d-4cc6-97e2-2811ef0b4322	c5c7431f-c200-43cd-a5d4-f9d3dbf84bdb	7	{"items": [{"slug": "society-launches-national-soil-assessment-project", "excerpt": "The Soil Science Society of Syria has launched a comprehensive national project to assess soil health across all agricultural governorates, aiming to establish a baseline database for future research.", "titleAr": "ط§ظ„ط¬ظ…ط¹ظٹط© طھط·ظ„ظ‚ ظ…ط´ط±ظˆط¹ طھظ‚ظٹظٹظ… ط§ظ„طھط±ط¨ط© ط§ظ„ظˆط·ظ†ظٹ", "titleEn": "Society Launches National Soil Assessment Project", "category": "", "publishedAt": "2026-07-15T06:10:22.751245", "featuredImage": ""}, {"slug": "new-research-drought-impact-euphrates-valley-soils", "excerpt": "A recent study published by SSSY researchers documents significant changes in soil organic matter and microbial diversity in the Euphrates Valley region over the past decade, highlighting urgent conservation needs.", "titleAr": "ط¨ط­ط« ط¬ط¯ظٹط¯ ظٹظƒط´ظپ طھط£ط«ظٹط± ط§ظ„ط¬ظپط§ظپ ط¹ظ„ظ‰ طھط±ط¨ط© ظˆط§ط¯ظٹ ط§ظ„ظپط±ط§طھ", "titleEn": "New Research Reveals Drought Impact on Euphrates Valley Soils", "category": "", "publishedAt": "2026-07-08T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-signs-cooperation-agreement-fao", "excerpt": "The Soil Science Society of Syria has signed a memorandum of understanding with the Food and Agriculture Organization of the United Nations to collaborate on soil mapping and sustainable land management programmes.", "titleAr": "ط§طھظپط§ظ‚ظٹط© طھط¹ط§ظˆظ† ظ…ط¹ ظ…ظ†ط¸ظ…ط© ط§ظ„ط£ط؛ط°ظٹط© ظˆط§ظ„ط²ط±ط§ط¹ط© ظ„ظ„ط£ظ…ظ… ط§ظ„ظ…طھط­ط¯ط©", "titleEn": "SSSY Signs Cooperation Agreement with FAO", "category": "", "publishedAt": "2026-07-01T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-recognises-outstanding-members-soil-research", "excerpt": "At the annual general assembly, three SSSY members received recognition awards for their exceptional contributions to soil science research, education, and field practice over the past year.", "titleAr": "طھظƒط±ظٹظ… ط£ط¹ط¶ط§ط، ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ظ…طھظ…ظٹط²ظٹظ† ظپظٹ ظ…ط¬ط§ظ„ ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط©", "titleEn": "SSSY Recognises Outstanding Members in Soil Research", "category": "", "publishedAt": "2026-06-24T06:10:22.751245", "featuredImage": ""}]}	{"count": 3, "titleAr": "ط£ط­ط¯ط« ط§ظ„ط£ط®ط¨ط§ط±", "titleEn": "Latest News", "dataSource": "api", "viewAllUrl": "/news", "viewAllLabelAr": "ط¬ظ…ظٹط¹ ط§ظ„ط£ط®ط¨ط§ط±", "viewAllLabelEn": "View All News"}	{}	6d6595c0-1835-42be-89a1-1a44b899141c	Published version 7	2026-07-25 03:16:05.19061
\.


--
-- TOC entry 6277 (class 0 OID 69097)
-- Dependencies: 278
-- Data for Name: site_sections; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.site_sections (id, name, slug, component_type, config, data, styling, is_active, sort_order, created_at, updated_at, location, events_json, conditions_json, version, status, published_data, published_config, published_styling, published_at) FROM stdin;
62d93016-0298-42c8-a911-b07c248435c1	Contact Form	contact-form	contact-form	{"titleAr": "طھظˆط§طµظ„ ظ…ط¹ظ†ط§", "titleEn": "Get In Touch", "submitLabelAr": "ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط©", "submitLabelEn": "Send Message"}	{}	{}	t	8	2026-07-09 10:39:19.187363	2026-07-15 06:07:17.75888	homepage	{}	{}	1	PUBLISHED	{}	{"titleAr": "طھظˆط§طµظ„ ظ…ط¹ظ†ط§", "titleEn": "Get In Touch", "submitLabelAr": "ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط©", "submitLabelEn": "Send Message"}	{}	2026-07-15 06:07:17.75888
3c9200cc-1de7-41ce-b164-6a557ae996a4	Homepage Upcoming Events	upcoming-events-feed	upcoming-events-feed	{}	{}	{}	t	40	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	homepage	{}	{}	1	PUBLISHED	{}	{}	{}	2026-07-10 16:38:23.795489
c5c7431f-c200-43cd-a5d4-f9d3dbf84bdb	Homepage Latest News	latest-news-feed	latest-news-feed	{"count": 3, "titleAr": "ط£ط­ط¯ط« ط§ظ„ط£ط®ط¨ط§ط±", "titleEn": "Latest News", "dataSource": "api", "viewAllUrl": "/news", "viewAllLabelAr": "ط¬ظ…ظٹط¹ ط§ظ„ط£ط®ط¨ط§ط±", "viewAllLabelEn": "View All News"}	{"items": [{"slug": "society-launches-national-soil-assessment-project", "excerpt": "The Soil Science Society of Syria has launched a comprehensive national project to assess soil health across all agricultural governorates, aiming to establish a baseline database for future research.", "titleAr": "ط§ظ„ط¬ظ…ط¹ظٹط© طھط·ظ„ظ‚ ظ…ط´ط±ظˆط¹ طھظ‚ظٹظٹظ… ط§ظ„طھط±ط¨ط© ط§ظ„ظˆط·ظ†ظٹ", "titleEn": "Society Launches National Soil Assessment Project", "category": "", "publishedAt": "2026-07-15T06:10:22.751245", "featuredImage": ""}, {"slug": "new-research-drought-impact-euphrates-valley-soils", "excerpt": "A recent study published by SSSY researchers documents significant changes in soil organic matter and microbial diversity in the Euphrates Valley region over the past decade, highlighting urgent conservation needs.", "titleAr": "ط¨ط­ط« ط¬ط¯ظٹط¯ ظٹظƒط´ظپ طھط£ط«ظٹط± ط§ظ„ط¬ظپط§ظپ ط¹ظ„ظ‰ طھط±ط¨ط© ظˆط§ط¯ظٹ ط§ظ„ظپط±ط§طھ", "titleEn": "New Research Reveals Drought Impact on Euphrates Valley Soils", "category": "", "publishedAt": "2026-07-08T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-signs-cooperation-agreement-fao", "excerpt": "The Soil Science Society of Syria has signed a memorandum of understanding with the Food and Agriculture Organization of the United Nations to collaborate on soil mapping and sustainable land management programmes.", "titleAr": "ط§طھظپط§ظ‚ظٹط© طھط¹ط§ظˆظ† ظ…ط¹ ظ…ظ†ط¸ظ…ط© ط§ظ„ط£ط؛ط°ظٹط© ظˆط§ظ„ط²ط±ط§ط¹ط© ظ„ظ„ط£ظ…ظ… ط§ظ„ظ…طھط­ط¯ط©", "titleEn": "SSSY Signs Cooperation Agreement with FAO", "category": "", "publishedAt": "2026-07-01T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-recognises-outstanding-members-soil-research", "excerpt": "At the annual general assembly, three SSSY members received recognition awards for their exceptional contributions to soil science research, education, and field practice over the past year.", "titleAr": "طھظƒط±ظٹظ… ط£ط¹ط¶ط§ط، ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ظ…طھظ…ظٹط²ظٹظ† ظپظٹ ظ…ط¬ط§ظ„ ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط©", "titleEn": "SSSY Recognises Outstanding Members in Soil Research", "category": "", "publishedAt": "2026-06-24T06:10:22.751245", "featuredImage": ""}]}	{}	t	30	2026-07-10 16:10:40.721161	2026-07-25 03:16:05.19061	homepage	{}	{}	7	PUBLISHED	{"items": [{"slug": "society-launches-national-soil-assessment-project", "excerpt": "The Soil Science Society of Syria has launched a comprehensive national project to assess soil health across all agricultural governorates, aiming to establish a baseline database for future research.", "titleAr": "ط§ظ„ط¬ظ…ط¹ظٹط© طھط·ظ„ظ‚ ظ…ط´ط±ظˆط¹ طھظ‚ظٹظٹظ… ط§ظ„طھط±ط¨ط© ط§ظ„ظˆط·ظ†ظٹ", "titleEn": "Society Launches National Soil Assessment Project", "category": "", "publishedAt": "2026-07-15T06:10:22.751245", "featuredImage": ""}, {"slug": "new-research-drought-impact-euphrates-valley-soils", "excerpt": "A recent study published by SSSY researchers documents significant changes in soil organic matter and microbial diversity in the Euphrates Valley region over the past decade, highlighting urgent conservation needs.", "titleAr": "ط¨ط­ط« ط¬ط¯ظٹط¯ ظٹظƒط´ظپ طھط£ط«ظٹط± ط§ظ„ط¬ظپط§ظپ ط¹ظ„ظ‰ طھط±ط¨ط© ظˆط§ط¯ظٹ ط§ظ„ظپط±ط§طھ", "titleEn": "New Research Reveals Drought Impact on Euphrates Valley Soils", "category": "", "publishedAt": "2026-07-08T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-signs-cooperation-agreement-fao", "excerpt": "The Soil Science Society of Syria has signed a memorandum of understanding with the Food and Agriculture Organization of the United Nations to collaborate on soil mapping and sustainable land management programmes.", "titleAr": "ط§طھظپط§ظ‚ظٹط© طھط¹ط§ظˆظ† ظ…ط¹ ظ…ظ†ط¸ظ…ط© ط§ظ„ط£ط؛ط°ظٹط© ظˆط§ظ„ط²ط±ط§ط¹ط© ظ„ظ„ط£ظ…ظ… ط§ظ„ظ…طھط­ط¯ط©", "titleEn": "SSSY Signs Cooperation Agreement with FAO", "category": "", "publishedAt": "2026-07-01T06:10:22.751245", "featuredImage": ""}, {"slug": "sssy-recognises-outstanding-members-soil-research", "excerpt": "At the annual general assembly, three SSSY members received recognition awards for their exceptional contributions to soil science research, education, and field practice over the past year.", "titleAr": "طھظƒط±ظٹظ… ط£ط¹ط¶ط§ط، ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ظ…طھظ…ظٹط²ظٹظ† ظپظٹ ظ…ط¬ط§ظ„ ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط©", "titleEn": "SSSY Recognises Outstanding Members in Soil Research", "category": "", "publishedAt": "2026-06-24T06:10:22.751245", "featuredImage": ""}]}	{"count": 3, "titleAr": "ط£ط­ط¯ط« ط§ظ„ط£ط®ط¨ط§ط±", "titleEn": "Latest News", "dataSource": "api", "viewAllUrl": "/news", "viewAllLabelAr": "ط¬ظ…ظٹط¹ ط§ظ„ط£ط®ط¨ط§ط±", "viewAllLabelEn": "View All News"}	{}	2026-07-25 03:16:05.183491
fc01df08-ef76-4f59-92b3-4d60cd3f95db	Footer Layout	footer-layout	footer-layout	{"columns": 4}	{}	{}	t	0	2026-07-10 16:10:40.721161	2026-07-10 16:38:23.795489	footer	{}	{}	1	PUBLISHED	{}	{"columns": 4}	{}	2026-07-10 16:38:23.795489
c97b1a3f-9ae2-4193-a617-f5cd2d3bae49	Our Focus Areas	our-focus-areas	card-group	{"titleAr": "ظ…ط¬ط§ظ„ط§طھ ط§ظ‡طھظ…ط§ظ…ظ†ط§", "titleEn": "Our Focus Areas"}	{"items": [{"titleAr": "ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ", "titleEn": "Research", "descriptionAr": "طھط¹ط²ظٹط² ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ط£ط¨ط­ط§ط« ط§ظ„ظ…طھط·ظˆط±ط© ظˆط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ظ…ظٹط¯ط§ظ†ظٹط© ط¹ط¨ط± ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط²ط±ط§ط¹ظٹط© ط§ظ„ظ…طھظ†ظˆط¹ط© ظپظٹ ط³ظˆط±ظٹط§.", "descriptionEn": "Advancing soil science through cutting-edge research and field studies across Syria's diverse agricultural regions."}, {"titleAr": "ط§ظ„طھط¹ظ„ظٹظ…", "titleEn": "Education", "descriptionAr": "طھظˆظپظٹط± ط§ظ„طھط¯ط±ظٹط¨ ظˆظˆط±ط´ ط§ظ„ط¹ظ…ظ„ ظˆط§ظ„ط¨ط±ط§ظ…ط¬ ط§ظ„طھط¹ظ„ظٹظ…ظٹط© ظ„ط¹ظ„ظ…ط§ط، ط§ظ„طھط±ط¨ط© ظˆط§ظ„ط·ظ„ط§ط¨ ظˆط§ظ„ظ…ط²ط§ط±ط¹ظٹظ†.", "descriptionEn": "Providing training, workshops, and educational programs for soil scientists, students, and farmers."}, {"titleAr": "ط§ظ„ط§ط³طھط¯ط§ظ…ط©", "titleEn": "Sustainability", "descriptionAr": "طھط¹ط²ظٹط² ظ…ظ…ط§ط±ط³ط§طھ ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ ظ„ط­ظ…ط§ظٹط© ظ…ظˆط§ط±ط¯ ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظˆطھط·ظˆظٹط±ظ‡ط§ ظ„ظ„ط£ط¬ظٹط§ظ„ ط§ظ„ظ‚ط§ط¯ظ…ط©.", "descriptionEn": "Promoting sustainable land management practices to protect and enhance Syria's soil resources for future generations."}]}	{}	t	2	2026-07-10 16:10:40.721161	2026-07-15 04:38:52.572915	homepage	{}	{}	1	PUBLISHED	{"items": [{"titleAr": "ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ", "titleEn": "Research", "descriptionAr": "طھط¹ط²ظٹط² ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ط£ط¨ط­ط§ط« ط§ظ„ظ…طھط·ظˆط±ط© ظˆط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ظ…ظٹط¯ط§ظ†ظٹط© ط¹ط¨ط± ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط²ط±ط§ط¹ظٹط© ط§ظ„ظ…طھظ†ظˆط¹ط© ظپظٹ ط³ظˆط±ظٹط§.", "descriptionEn": "Advancing soil science through cutting-edge research and field studies across Syria's diverse agricultural regions."}, {"titleAr": "ط§ظ„طھط¹ظ„ظٹظ…", "titleEn": "Education", "descriptionAr": "طھظˆظپظٹط± ط§ظ„طھط¯ط±ظٹط¨ ظˆظˆط±ط´ ط§ظ„ط¹ظ…ظ„ ظˆط§ظ„ط¨ط±ط§ظ…ط¬ ط§ظ„طھط¹ظ„ظٹظ…ظٹط© ظ„ط¹ظ„ظ…ط§ط، ط§ظ„طھط±ط¨ط© ظˆط§ظ„ط·ظ„ط§ط¨ ظˆط§ظ„ظ…ط²ط§ط±ط¹ظٹظ†.", "descriptionEn": "Providing training, workshops, and educational programs for soil scientists, students, and farmers."}, {"titleAr": "ط§ظ„ط§ط³طھط¯ط§ظ…ط©", "titleEn": "Sustainability", "descriptionAr": "طھط¹ط²ظٹط² ظ…ظ…ط§ط±ط³ط§طھ ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ ظ„ط­ظ…ط§ظٹط© ظ…ظˆط§ط±ط¯ ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظˆطھط·ظˆظٹط±ظ‡ط§ ظ„ظ„ط£ط¬ظٹط§ظ„ ط§ظ„ظ‚ط§ط¯ظ…ط©.", "descriptionEn": "Promoting sustainable land management practices to protect and enhance Syria's soil resources for future generations."}]}	{"titleAr": "ظ…ط¬ط§ظ„ط§طھ ط§ظ‡طھظ…ط§ظ…ظ†ط§", "titleEn": "Our Focus Areas"}	{}	2026-07-15 04:38:52.572915
31e505c2-db5f-4cf1-8196-3080dee14e98	Join Our Community	join-our-community	cta	{"titleAr": "ط§ظ†ط¶ظ… ط¥ظ„ظ‰ ظ…ط¬طھظ…ط¹ظ†ط§", "titleEn": "Join Our Community", "buttonUrl": "/members", "subtitleAr": "ظƒظ† ط¹ط¶ظˆظ‹ط§ ظپظٹ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظˆط³ط§ظ‡ظ… ظپظٹ ظ…ط³طھظ‚ط¨ظ„ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§ ظˆظ…ط§ ظˆط±ط§ط،ظ‡ط§.", "subtitleEn": "Become a member of the Soil Science Society of Syria and contribute to the future of soil science in Syria and beyond.", "buttonLabelAr": "ظƒظ† ط¹ط¶ظˆظ‹ط§", "buttonLabelEn": "Become a Member"}	{}	{}	t	3	2026-07-10 16:10:40.721161	2026-07-15 04:38:52.572915	homepage	{}	{}	1	PUBLISHED	{}	{"titleAr": "ط§ظ†ط¶ظ… ط¥ظ„ظ‰ ظ…ط¬طھظ…ط¹ظ†ط§", "titleEn": "Join Our Community", "buttonUrl": "/members", "subtitleAr": "ظƒظ† ط¹ط¶ظˆظ‹ط§ ظپظٹ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظˆط³ط§ظ‡ظ… ظپظٹ ظ…ط³طھظ‚ط¨ظ„ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§ ظˆظ…ط§ ظˆط±ط§ط،ظ‡ط§.", "subtitleEn": "Become a member of the Soil Science Society of Syria and contribute to the future of soil science in Syria and beyond.", "buttonLabelAr": "ظƒظ† ط¹ط¶ظˆظ‹ط§", "buttonLabelEn": "Become a Member"}	{}	2026-07-15 04:38:52.572915
28c3ec05-d603-4123-8e34-3e7b3b075b37	Publications Carousel	publications-carousel	publications-carousel	{"titleAr": "ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ", "titleEn": "Publications", "viewMoreUrl": "/publications", "viewMoreLabelAr": "ط¬ظ…ظٹط¹ ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ", "viewMoreLabelEn": "View All Publications"}	{}	{}	t	6	2026-07-15 06:07:17.75888	2026-07-15 06:07:17.75888	homepage	{}	{}	1	PUBLISHED	{}	{"titleAr": "ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ", "titleEn": "Publications", "viewMoreUrl": "/publications", "viewMoreLabelAr": "ط¬ظ…ظٹط¹ ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ", "viewMoreLabelEn": "View All Publications"}	{}	2026-07-15 06:07:17.75888
778f8aad-a0af-4d8a-afa2-75c0bdbcdb04	Newsletter Signup	newsletter-signup	newsletter	{"titleAr": "ط§ط¨ظ‚ ط¹ظ„ظ‰ ط§ط·ظ„ط§ط¹", "titleEn": "Stay Connected", "subtitleAr": "ط§ط´طھط±ظƒ ظپظٹ ظ†ط´ط±طھظ†ط§ ط§ظ„ط¥ط®ط¨ط§ط±ظٹط© ظ„ط¢ط®ط± ط§ظ„ط£ط®ط¨ط§ط± ظˆط§ظ„ظپط¹ط§ظ„ظٹط§طھ ظˆط§ظ„ط£ط¨ط­ط§ط«.", "subtitleEn": "Subscribe to our newsletter to receive the latest news, event announcements, and updates.", "buttonLabelAr": "ط§ط´طھط±ظƒ", "buttonLabelEn": "Subscribe", "placeholderTextAr": "ط£ط¯ط®ظ„ ط¨ط±ظٹط¯ظƒ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ", "placeholderTextEn": "Enter your email address"}	{}	{}	t	7	2026-07-09 10:39:19.187363	2026-07-15 06:07:17.75888	homepage	{}	{}	1	PUBLISHED	{}	{"titleAr": "ط§ط¨ظ‚ ط¹ظ„ظ‰ ط§ط·ظ„ط§ط¹", "titleEn": "Stay Connected", "subtitleAr": "ط§ط´طھط±ظƒ ظپظٹ ظ†ط´ط±طھظ†ط§ ط§ظ„ط¥ط®ط¨ط§ط±ظٹط© ظ„ط¢ط®ط± ط§ظ„ط£ط®ط¨ط§ط± ظˆط§ظ„ظپط¹ط§ظ„ظٹط§طھ ظˆط§ظ„ط£ط¨ط­ط§ط«.", "subtitleEn": "Subscribe to our newsletter to receive the latest news, event announcements, and updates.", "buttonLabelAr": "ط§ط´طھط±ظƒ", "buttonLabelEn": "Subscribe", "placeholderTextAr": "ط£ط¯ط®ظ„ ط¨ط±ظٹط¯ظƒ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ", "placeholderTextEn": "Enter your email address"}	{}	2026-07-15 06:07:17.75888
13928128-f724-43e7-8636-7f68207b2811	Statistics	statistics	stats	{"titleAr": "ط§ظ„ط¬ظ…ط¹ظٹط© ط¨ط§ظ„ط£ط±ظ‚ط§ظ…", "titleEn": "SSSY by the Numbers"}	{"items": [{"value": "11", "titleAr": "ط§ظ„ط£ط¹ط¶ط§ط، ط§ظ„ظ…ط¤ط³ط³ظˆظ†", "titleEn": "Founding Members"}, {"value": "11", "titleAr": "ط­ط§ظ…ظ„ظˆ ط´ظ‡ط§ط¯ط© ط§ظ„ط¯ظƒطھظˆط±ط§ظ‡", "titleEn": "PhD Holders"}, {"value": "5+", "titleAr": "ط§ظ„ظ…ط­ط§ظپط¸ط§طھ ط§ظ„ظ…ط´ظ…ظˆظ„ط©", "titleEn": "Governorates Covered"}, {"value": "3", "titleAr": "ظ…ط¬ط§ظ„ط§طھ ط§ظ„طھط±ظƒظٹط²", "titleEn": "Focus Areas"}]}	{}	t	4	2026-07-15 04:38:52.572915	2026-07-15 07:51:14.767242	homepage	{}	{}	1	PUBLISHED	{"items": [{"value": "11", "titleAr": "ط§ظ„ط£ط¹ط¶ط§ط، ط§ظ„ظ…ط¤ط³ط³ظˆظ†", "titleEn": "Founding Members"}, {"value": "11", "titleAr": "ط­ط§ظ…ظ„ظˆ ط´ظ‡ط§ط¯ط© ط§ظ„ط¯ظƒطھظˆط±ط§ظ‡", "titleEn": "PhD Holders"}, {"value": "5+", "titleAr": "ط§ظ„ظ…ط­ط§ظپط¸ط§طھ ط§ظ„ظ…ط´ظ…ظˆظ„ط©", "titleEn": "Governorates Covered"}, {"value": "3", "titleAr": "ظ…ط¬ط§ظ„ط§طھ ط§ظ„طھط±ظƒظٹط²", "titleEn": "Focus Areas"}]}	{"titleAr": "ط§ظ„ط¬ظ…ط¹ظٹط© ط¨ط§ظ„ط£ط±ظ‚ط§ظ…", "titleEn": "SSSY by the Numbers"}	{}	2026-07-15 07:51:14.767242
0770e0fe-e5dd-4255-bf4d-3e81a46baae2	Testimonials	testimonials	testimonial	{"titleAr": "ظ…ط§ط°ط§ ظٹظ‚ظˆظ„ ط£ط¹ط¶ط§ط¤ظ†ط§", "titleEn": "What Our Members Say"}	{"items": [{"nameAr": "ط£.ط¯. ظ…ط­ظ…ظˆط¯ ط£ظ†ظٹط³ ط¹ظˆط¯ط©", "nameEn": "Prof. Mahmoud Anis Oudeh", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³ â€” ط£ط³طھط§ط° ط¬ط§ظ…ط¹ظٹطŒ ط­ظ…طµ", "roleEn": "Founding Member â€” University Professor, Homs", "quoteAr": "طھط£ط³ط³طھ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظ„طھظˆط­ظٹط¯ ط§ظ„ط¨ط§ط­ط«ظٹظ† ظˆط§ظ„ط£ظƒط§ط¯ظٹظ…ظٹظٹظ† ظˆط§ظ„ظ…ظ…ط§ط±ط³ظٹظ† طھط­طھ ط³ظ‚ظپ ط¹ظ„ظ…ظٹ ظˆط§ط­ط¯ â€” ظ„طھط·ظˆظٹط± ط§ظ„ظ…ط¹ط±ظپط© ظˆط­ظ…ط§ظٹط© ط£ط±ط¶ظ†ط§ ظ„ظ„ط£ط¬ظٹط§ظ„ ط§ظ„ظ‚ط§ط¯ظ…ط©.", "quoteEn": "The Soil Science Society of Syria was founded to unite researchers, academics, and practitioners under one scientific home â€” advancing knowledge and protecting our land for future generations."}, {"nameAr": "ط¯. ظ„ظٹظ†ط§ ظ…ظ…ط¯ظˆط­ ط§ظ„ظ†ط¯ط§ظپ", "nameEn": "Dr. Lina Mamdouh Al-Naddaf", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³ â€” ط¯ظƒطھظˆط± ط¬ط§ظ…ط¹ظٹطŒ ط­ظ…طµ", "roleEn": "Founding Member â€” University Lecturer, Homs", "quoteAr": "ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„طھط±ط¨ط© ظ„ظٹط³طھ ظ‡ط¯ظپط§ظ‹ ط¹ظ„ظ…ظٹط§ظ‹ ظپط­ط³ط¨طŒ ط¨ظ„ ظ‡ظٹ ظ…ط³ط¤ظˆظ„ظٹط© ظˆط·ظ†ظٹط©. ط§ظ„ط¬ظ…ط¹ظٹط© طھظ…ظ†ط­ظ†ط§ ط§ظ„ظ…ظ†طµط© ظ„طھط­ظˆظٹظ„ ط§ظ„ط£ط¨ط­ط§ط« ط¥ظ„ظ‰ ط£ط«ط± ط­ظ‚ظٹظ‚ظٹ ظپظٹ ط§ظ„ط³ظٹط§ط³ط§طھ.", "quoteEn": "Sustainable soil management is not just a scientific goal â€” it is a national responsibility. The society gives us the platform to translate research into real policy impact."}, {"nameAr": "ط£.ط¯. ط£ظƒط±ظ… ظ…ط­ظ…ط¯ ط§ظ„ط¨ظ„ط®ظٹ", "nameEn": "Prof. Akram Mohammad Al-Balkhi", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³ â€” ط£ط³طھط§ط° ط¬ط§ظ…ط¹ظٹطŒ ط¯ظ…ط´ظ‚", "roleEn": "Founding Member â€” University Professor, Damascus", "quoteAr": "ظ…ط³طھظ‚ط¨ظ„ ط§ظ„ط²ط±ط§ط¹ط© ظپظٹ ط³ظˆط±ظٹط§ ظٹط¹طھظ…ط¯ ط¹ظ„ظ‰ طµط­ط© ط§ظ„طھط±ط¨ط©. ظ…ظ† ط®ظ„ط§ظ„ ظ…ط¤طھظ…ط±ط§طھ ط§ظ„ط¬ظ…ط¹ظٹط© ظˆظˆط±ط´ ط¹ظ…ظ„ظ‡ط§ ظˆظ…ظ†ط´ظˆط±ط§طھظ‡ط§ ط§ظ„ظ…ط­ظƒظ…ط©طŒ ظ†ط¨ظ†ظٹ ط§ظ„ط£ط³ط§ط³ ط§ظ„ط¹ظ„ظ…ظٹ ط§ظ„ط°ظٹ طھط­طھط§ط¬ظ‡ ظ‡ط°ظ‡ ط§ظ„ط¨ظ„ط§ط¯.", "quoteEn": "Syria's agricultural future depends on healthy soils. Through the society's conferences, workshops, and peer-reviewed publications, we are building the scientific foundation this country needs."}]}	{}	t	5	2026-07-09 10:39:19.187363	2026-07-15 07:51:14.767242	homepage	{}	{}	1	PUBLISHED	{"items": [{"nameAr": "ط£.ط¯. ظ…ط­ظ…ظˆط¯ ط£ظ†ظٹط³ ط¹ظˆط¯ط©", "nameEn": "Prof. Mahmoud Anis Oudeh", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³ â€” ط£ط³طھط§ط° ط¬ط§ظ…ط¹ظٹطŒ ط­ظ…طµ", "roleEn": "Founding Member â€” University Professor, Homs", "quoteAr": "طھط£ط³ط³طھ ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© ظ„طھظˆط­ظٹط¯ ط§ظ„ط¨ط§ط­ط«ظٹظ† ظˆط§ظ„ط£ظƒط§ط¯ظٹظ…ظٹظٹظ† ظˆط§ظ„ظ…ظ…ط§ط±ط³ظٹظ† طھط­طھ ط³ظ‚ظپ ط¹ظ„ظ…ظٹ ظˆط§ط­ط¯ â€” ظ„طھط·ظˆظٹط± ط§ظ„ظ…ط¹ط±ظپط© ظˆط­ظ…ط§ظٹط© ط£ط±ط¶ظ†ط§ ظ„ظ„ط£ط¬ظٹط§ظ„ ط§ظ„ظ‚ط§ط¯ظ…ط©.", "quoteEn": "The Soil Science Society of Syria was founded to unite researchers, academics, and practitioners under one scientific home â€” advancing knowledge and protecting our land for future generations."}, {"nameAr": "ط¯. ظ„ظٹظ†ط§ ظ…ظ…ط¯ظˆط­ ط§ظ„ظ†ط¯ط§ظپ", "nameEn": "Dr. Lina Mamdouh Al-Naddaf", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³ â€” ط¯ظƒطھظˆط± ط¬ط§ظ…ط¹ظٹطŒ ط­ظ…طµ", "roleEn": "Founding Member â€” University Lecturer, Homs", "quoteAr": "ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„طھط±ط¨ط© ظ„ظٹط³طھ ظ‡ط¯ظپط§ظ‹ ط¹ظ„ظ…ظٹط§ظ‹ ظپط­ط³ط¨طŒ ط¨ظ„ ظ‡ظٹ ظ…ط³ط¤ظˆظ„ظٹط© ظˆط·ظ†ظٹط©. ط§ظ„ط¬ظ…ط¹ظٹط© طھظ…ظ†ط­ظ†ط§ ط§ظ„ظ…ظ†طµط© ظ„طھط­ظˆظٹظ„ ط§ظ„ط£ط¨ط­ط§ط« ط¥ظ„ظ‰ ط£ط«ط± ط­ظ‚ظٹظ‚ظٹ ظپظٹ ط§ظ„ط³ظٹط§ط³ط§طھ.", "quoteEn": "Sustainable soil management is not just a scientific goal â€” it is a national responsibility. The society gives us the platform to translate research into real policy impact."}, {"nameAr": "ط£.ط¯. ط£ظƒط±ظ… ظ…ط­ظ…ط¯ ط§ظ„ط¨ظ„ط®ظٹ", "nameEn": "Prof. Akram Mohammad Al-Balkhi", "roleAr": "ط¹ط¶ظˆ ظ…ط¤ط³ط³ â€” ط£ط³طھط§ط° ط¬ط§ظ…ط¹ظٹطŒ ط¯ظ…ط´ظ‚", "roleEn": "Founding Member â€” University Professor, Damascus", "quoteAr": "ظ…ط³طھظ‚ط¨ظ„ ط§ظ„ط²ط±ط§ط¹ط© ظپظٹ ط³ظˆط±ظٹط§ ظٹط¹طھظ…ط¯ ط¹ظ„ظ‰ طµط­ط© ط§ظ„طھط±ط¨ط©. ظ…ظ† ط®ظ„ط§ظ„ ظ…ط¤طھظ…ط±ط§طھ ط§ظ„ط¬ظ…ط¹ظٹط© ظˆظˆط±ط´ ط¹ظ…ظ„ظ‡ط§ ظˆظ…ظ†ط´ظˆط±ط§طھظ‡ط§ ط§ظ„ظ…ط­ظƒظ…ط©طŒ ظ†ط¨ظ†ظٹ ط§ظ„ط£ط³ط§ط³ ط§ظ„ط¹ظ„ظ…ظٹ ط§ظ„ط°ظٹ طھط­طھط§ط¬ظ‡ ظ‡ط°ظ‡ ط§ظ„ط¨ظ„ط§ط¯.", "quoteEn": "Syria's agricultural future depends on healthy soils. Through the society's conferences, workshops, and peer-reviewed publications, we are building the scientific foundation this country needs."}]}	{"titleAr": "ظ…ط§ط°ط§ ظٹظ‚ظˆظ„ ط£ط¹ط¶ط§ط¤ظ†ط§", "titleEn": "What Our Members Say"}	{}	2026-07-15 07:51:14.767242
c7c43d45-024b-4131-af2e-815a818928de	Homepage Hero	hero-banner	hero-carousel	{"slides": [{"titleAr": "ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "titleEn": "Syrian Soil Science Society", "subtitleAr": "طھط·ظˆظٹط± ط§ظ„ظ…ط¹ط±ظپط© - ط­ظ…ط§ظٹط© ط§ظ„ط£ط±ط¶", "subtitleEn": "Advancing Knowledge - Protecting Land", "badgeLabelAr": "ط£ظ‡ظ„ط§ظ‹ ظˆط³ظ‡ظ„ط§ظ‹", "badgeLabelEn": "Welcome", "overlayColor": "rgba(18,42,18,0.70)", "descriptionAr": "ظ…ط¬طھظ…ط¹ ط¹ظ„ظ…ظٹ ط±ط§ط¦ط¯ ظ…ظƒط±ظ‘ط³ ظ„ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط© ظˆط¥ط¯ط§ط±ط© ط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظˆطھط·ظˆظٹط± ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط© ظپظٹ ط³ظˆط±ظٹط§ ظˆط§ظ„ط¹ط§ظ„ظ… ط§ظ„ط¹ط±ط¨ظٹ.", "descriptionEn": "A leading scientific community dedicated to soil research, sustainable land management, and advancing agricultural science across Syria and the Arab world.", "backgroundImage": "/images/slider/WhatsApp Image 2026-07-26 at 12.16.43 PM.jpeg", "primaryButtonUrl": "/members", "secondaryButtonUrl": "/publications", "primaryButtonLabelAr": "ط§ظ†ط¶ظ… ظ„ظ„ط¬ظ…ط¹ظٹط©", "primaryButtonLabelEn": "Join the Society", "secondaryButtonLabelAr": "ط§ط³طھظƒط´ظپ ط§ظ„ط£ط¨ط­ط§ط«", "secondaryButtonLabelEn": "Explore Research"}, {"titleAr": "ط§ظ„ط¨ط­ط« ط§ظ„ظ…ط®طھط¨ط±ظٹ", "titleEn": "Laboratory Research", "subtitleAr": "طھط­ظ„ظٹظ„ ط¯ظ‚ظٹظ‚ ظ„ظ„طھط±ط¨ط©", "subtitleEn": "Precision Soil Analysis", "badgeLabelAr": "ط¨ط­ط« ط¹ظ„ظ…ظٹ", "badgeLabelEn": "Research", "overlayColor": "rgba(10,28,48,0.68)", "descriptionAr": "ظٹط±طھط§ط¯ ط¨ط§ط­ط«ظˆظ†ط§ ط£ط³ط§ظ„ظٹط¨ ظ…ط¨طھظƒط±ط© ظپظٹ طھط­ظ„ظٹظ„ ط§ظ„طھط±ط¨ط© ظˆطھطµظ†ظٹظپظ‡ط§ ظˆطµظˆظ†ظ‡ط§.", "descriptionEn": "Our researchers pioneer innovative approaches to soil analysis, classification, and conservation - building a sustainable future for Syrian agriculture.", "backgroundImage": "/images/slider/Gemini_Generated_Image_hnvytbhnvytbhnvy.png", "primaryButtonUrl": "/publications", "secondaryButtonUrl": "/members", "primaryButtonLabelAr": "ط¹ط±ط¶ ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ", "primaryButtonLabelEn": "View Publications", "secondaryButtonLabelAr": "ط£ط¹ط¶ط§ط¤ظ†ط§", "secondaryButtonLabelEn": "Our Members"}, {"titleAr": "ط±ط³ظ… ط®ط±ط§ط¦ط· ط§ظ„طھط±ط¨ط© ط§ظ„ظ…طھظ‚ط¯ظ…", "titleEn": "Advanced Soil Mapping", "subtitleAr": "ط¥ط¯ط§ط±ط© ط§ظ„ط£ط±ط§ط¶ظٹ ط¨ط§ظ„ط¨ظٹط§ظ†ط§طھ", "subtitleEn": "Data-Driven Land Management", "badgeLabelAr": "ط§ط¨طھظƒط§ط±", "badgeLabelEn": "Innovation", "overlayColor": "rgba(15,30,50,0.72)", "descriptionAr": "طھظ‚ظ†ظٹط§طھ ظ†ط¸ظ… ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط¬ط؛ط±ط§ظپظٹط© ظˆط§ظ„ط§ط³طھط´ط¹ط§ط± ط¹ظ† ط¨ط¹ط¯ طھط±ط³ظ… ط§ظ„ظ…ط´ظ‡ط¯ ط§ظ„ط²ط±ط§ط¹ظٹ ظپظٹ ط³ظˆط±ظٹط§.", "descriptionEn": "Cutting-edge GIS and remote sensing technologies map Syria's agricultural landscape for informed land-use decisions.", "backgroundImage": "/images/slider/WhatsApp Image 2026-03-24 at 1.32.59 PM.jpeg", "primaryButtonUrl": "/events", "secondaryButtonUrl": "/publications", "primaryButtonLabelAr": "ط§ظ„ظپط¹ط§ظ„ظٹط§طھ ط§ظ„ظ‚ط§ط¯ظ…ط©", "primaryButtonLabelEn": "Upcoming Events", "secondaryButtonLabelAr": "ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ", "secondaryButtonLabelEn": "Publications"}, {"titleAr": "ظ…ط®طھط¨ط± طھط±ط¨ط© ط­ط¯ظٹط«", "titleEn": "Modern Soil Laboratory", "subtitleAr": "ظ…ط¹ط¯ط§طھ ط¹ظ„ظ‰ ط£ط­ط¯ط« ظ…ط³طھظˆظ‰", "subtitleEn": "State-of-the-Art Facilities", "badgeLabelAr": "ظ…ط®طھط¨ط±", "badgeLabelEn": "Laboratory", "overlayColor": "rgba(8,25,50,0.65)", "descriptionAr": "ظ…ط®طھط¨ط±ط§طھظ†ط§ ط§ظ„ط­ط¯ظٹط«ط© ط§ظ„ظ…ط¬ظ‡ط²ط© ط¨ط§ظ„ظƒط§ظ…ظ„ طھطھظٹط­ طھط­ظ„ظٹظ„ط§ظ‹ ظƒظٹظ…ظٹط§ط¦ظٹط§ظ‹ ظˆظپظٹط²ظٹط§ط¦ظٹط§ظ‹ ط¯ظ‚ظٹظ‚ط§ظ‹ ظ„ط¹ظٹظ†ط§طھ ط§ظ„طھط±ط¨ط©.", "descriptionEn": "Our fully equipped modern laboratories enable precise chemical and physical analysis of soil samples from across Syria.", "backgroundImage": "/images/slider/WhatsApp Image 2026-03-26 at 10.18.58 PM.jpeg", "primaryButtonUrl": "/news", "secondaryButtonUrl": "/contact", "primaryButtonLabelAr": "ط§ظ‚ط±ط£ ط§ظ„ظ…ط²ظٹط¯", "primaryButtonLabelEn": "Learn More", "secondaryButtonLabelAr": "طھظˆط§طµظ„ ظ…ط¹ظ†ط§", "secondaryButtonLabelEn": "Contact Us"}, {"titleAr": "ظ…ط®طھط¨ط± ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط©", "titleEn": "Soil Research Laboratory", "subtitleAr": "طھط­ظ„ظٹظ„ - طھطµظ†ظٹظپ - طµظˆظ†", "subtitleEn": "Analysis - Classification - Conservation", "badgeLabelAr": "ط­ظ‚ظ„ ظˆظ…ط®طھط¨ط±", "badgeLabelEn": "Field & Lab", "overlayColor": "rgba(20,35,10,0.65)", "descriptionAr": "ط¨ط¯ظ…ط¬ ط£ط®ط° ط§ظ„ط¹ظٹظ†ط§طھ ط§ظ„ط­ظ‚ظ„ظٹط© ظ…ط¹ ط§ظ„طھط­ظ„ظٹظ„ ط§ظ„ظ…ط®طھط¨ط±ظٹطŒ ظٹط·ظˆط± ط¹ظ„ظ…ط§ط¤ظ†ط§ ظ‚ظˆط§ط¹ط¯ ط¨ظٹط§ظ†ط§طھ ط´ط§ظ…ظ„ط© ظ„ظ„طھط±ط¨ط©.", "descriptionEn": "Integrating field sampling with laboratory analysis, our scientists develop comprehensive soil databases for Syria's diverse regions.", "backgroundImage": "/images/slider/WhatsApp Image 2026-03-26 at 10.39.05 PM.jpeg", "primaryButtonUrl": "/publications", "secondaryButtonUrl": "/members", "primaryButtonLabelAr": "ط¹ط±ط¶ ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ", "primaryButtonLabelEn": "View Publications", "secondaryButtonLabelAr": "ط§ظ†ط¶ظ… ط¥ظ„ظٹظ†ط§", "secondaryButtonLabelEn": "Join Us"}, {"titleAr": "طھط­ظ„ظٹظ„ ط§ظ„طھط±ط¨ط© ط¨ط§ظ„ظ…ط¬ظ‡ط±", "titleEn": "Microscopic Soil Analysis", "subtitleAr": "ظ…ظ† ط§ظ„ظ…ط¬ظ‡ط±ظٹ ط¥ظ„ظ‰ ط§ظ„ظƒظ„ظٹ", "subtitleEn": "From Micro to Macro", "badgeLabelAr": "ظ…ط¬ظ‡ط±ظٹط©", "badgeLabelEn": "Microscopy", "overlayColor": "rgba(10,10,30,0.65)", "descriptionAr": "ط§ظ„ظپط­طµ ط§ظ„ظ…ط¬ظ‡ط±ظٹ ظ„ط¨ظ†ظٹط© ط§ظ„طھط±ط¨ط© ظٹظƒط´ظپ ط§ظ„طھظپط§ط¹ظ„ط§طھ ط§ظ„ط­ظٹظˆظٹط© ظˆط§ظ„ظ…ط¹ط¯ظ†ظٹط© ط§ظ„ط®ظپظٹط© ط§ظ„طھظٹ طھط­ظƒظ… ط§ظ„ط®طµظˆط¨ط©.", "descriptionEn": "Microscopic examination of soil microstructure reveals hidden biological and mineral interactions that govern fertility and crop yield.", "backgroundImage": "/images/slider/WhatsApp Image 2026-02-10 at 1.28.37 PM.jpeg", "primaryButtonUrl": "/publications", "secondaryButtonUrl": "/contact", "primaryButtonLabelAr": "ط£ط¨ط­ط§ط«ظ†ط§", "primaryButtonLabelEn": "Our Research", "secondaryButtonLabelAr": "طھظˆط§طµظ„ ظ…ط¹ظ†ط§", "secondaryButtonLabelEn": "Contact Us"}, {"titleAr": "ظ…ظ„ظپ ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھطµظ†ظٹظپ", "titleEn": "Soil Profile & Classification", "subtitleAr": "ظپظ‡ظ… ط·ط¨ظ‚ط§طھ ط§ظ„طھط±ط¨ط©", "subtitleEn": "Understanding Soil Horizons", "badgeLabelAr": "طھط¹ظ„ظٹظ…", "badgeLabelEn": "Education", "overlayColor": "rgba(25,55,15,0.55)", "descriptionAr": "ظ…ظ† ط·ط¨ظ‚ط© O ط§ظ„ط¹ط¶ظˆظٹط© ط­طھظ‰ ط§ظ„طµط®ط± ط§ظ„ط£ط³ط§ط³ظٹ - ظپظ‡ظ… ظ…ظ„ظپط§طھ ط§ظ„طھط±ط¨ط© ط£ط³ط§ط³ ط§ظ„ط²ط±ط§ط¹ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط©.", "descriptionEn": "From the organic O-horizon to bedrock - understanding soil profiles is fundamental to sustainable agriculture and land planning.", "backgroundImage": "/images/slider/WhatsApp Image 2026-07-26 at 12.19.25 PM.jpeg", "primaryButtonUrl": "/news", "secondaryButtonUrl": "/contact", "primaryButtonLabelAr": "ط§ظ‚ط±ط£ ط§ظ„ظ…ط²ظٹط¯", "primaryButtonLabelEn": "Learn More", "secondaryButtonLabelAr": "طھظˆط§طµظ„ ظ…ط¹ظ†ط§", "secondaryButtonLabelEn": "Contact Us"}, {"titleAr": "ط·ط¨ظ‚ط§طھ ط§ظ„طھط±ط¨ط© ظˆط¨ظ†ظٹطھظ‡ط§", "titleEn": "Soil Layers & Structure", "subtitleAr": "ظ…ظ† ط§ظ„ط¯ط¨ط§ظ„ ط¥ظ„ظ‰ ط§ظ„طµط®ط± ط§ظ„ط£ط³ط§ط³ظٹ", "subtitleEn": "From Humus to Bedrock", "badgeLabelAr": "ط¹ظ„ظ…", "badgeLabelEn": "Science", "overlayColor": "rgba(30,55,10,0.55)", "descriptionAr": "ط¯ط±ط§ط³ط§طھ ط´ط§ظ…ظ„ط© ظ„ط·ط¨ظ‚ط§طھ ط§ظ„طھط±ط¨ط© - ظ…ظ† ط·ط¨ظ‚ط© ط§ظ„ط¯ط¨ط§ظ„ ط§ظ„ط¹ط¶ظˆظٹط© ط­طھظ‰ ط·ط¨ظ‚ط© ط§ظ„طµط®ط± ط§ظ„ط£ط³ط§ط³ظٹ.", "descriptionEn": "Comprehensive soil horizon studies - from organic humus layers to bedrock - informing land-use planning across Syrian territories.", "backgroundImage": "/images/slider/WhatsApp Image 2026-07-26 at 12.20.10 PM.jpeg", "primaryButtonUrl": "/news", "secondaryButtonUrl": "/contact", "primaryButtonLabelAr": "ط§ظ‚ط±ط£ ط§ظ„ظ…ط²ظٹط¯", "primaryButtonLabelEn": "Learn More", "secondaryButtonLabelAr": "طھظˆط§طµظ„ ظ…ط¹ظ†ط§", "secondaryButtonLabelEn": "Contact Us"}, {"titleAr": "ط£ظ†ظˆط§ط¹ ط§ظ„طھط±ط¨ط© ظˆطھظ†ظˆط¹ظ‡ط§", "titleEn": "Soil Types & Diversity", "subtitleAr": "ط±ط³ظ… ط®ط±ظٹط·ط© طھط±ط¨ ط³ظˆط±ظٹط§", "subtitleEn": "Mapping Syria's Soils", "badgeLabelAr": "ط¯ط±ط§ط³ط© ظ…ظٹط¯ط§ظ†ظٹط©", "badgeLabelEn": "Field Study", "overlayColor": "rgba(42,30,10,0.60)", "descriptionAr": "ظ…ظ† ط§ظ„طھط±ط¨ ط§ظ„ط؛ظ†ظٹط© ط¨ط§ظ„ط¯ط¨ط§ظ„ ط§ظ„ط¯ط§ظƒظ†ط© ط¥ظ„ظ‰ ط§ظ„ط±ظ…ط§ظ„ ط§ظ„ط·ظٹظ†ظٹط© - طھط¯ط¹ظ… طھط±ط¨ ط³ظˆط±ظٹط§ ط§ظ„ظ…طھظ†ظˆط¹ط© ظ…ط¬ظ…ظˆط¹ط© ظˆط§ط³ط¹ط© ظ…ظ† ط§ظ„ظ…ط­ط§طµظٹظ„.", "descriptionEn": "From dark humus-rich soils to sandy loam - Syria's diverse soil types support a wide range of crops and require specialised management.", "backgroundImage": "/images/slider/WhatsApp Image 2026-07-26 at 12.20.39 PM.jpeg", "primaryButtonUrl": "/publications", "secondaryButtonUrl": "/members", "primaryButtonLabelAr": "ط£ط¨ط­ط§ط« ط§ظ„طھط±ط¨ط©", "primaryButtonLabelEn": "Soil Research", "secondaryButtonLabelAr": "ط§ظ†ط¶ظ… ط¥ظ„ظٹظ†ط§", "secondaryButtonLabelEn": "Join Us"}], "autoplay": true, "showDots": true, "showArrows": true, "transitionStyle": "slide", "autoplayInterval": 5000}	{}	{}	t	1	2026-07-09 10:39:19.187363	2026-07-30 07:55:57.896501	homepage	{}	{}	1	PUBLISHED	{}	{"slides": [{"titleAr": "طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§", "titleEn": "Advancing Soil Science in Syria", "subtitleAr": "ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "descriptionAr": "طھط¹ط²ظٹط² ط£ط¨ط­ط§ط« ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ ظپظٹ ط³ظˆط±ظٹط§", "descriptionEn": "Advancing soil science research, education, and sustainable land management in Syria.", "backgroundImage": "", "primaryButtonUrl": "/members", "secondaryButtonUrl": "/about", "primaryButtonLabelAr": "ط§ظ†ط¶ظ… ط¥ظ„ظٹظ†ط§", "primaryButtonLabelEn": "Join Us", "secondaryButtonLabelAr": "ط§ط¹ط±ظپ ط§ظ„ظ…ط²ظٹط¯", "secondaryButtonLabelEn": "Learn More"}, {"titleAr": "طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§", "titleEn": "Advancing Soil Science in Syria", "subtitleAr": "ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "descriptionAr": "طھط¹ط²ظٹط² ط£ط¨ط­ط§ط« ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ ظپظٹ ط³ظˆط±ظٹط§", "descriptionEn": "Advancing soil science research, education, and sustainable land management in Syria.", "backgroundImage": "", "primaryButtonUrl": "/members", "secondaryButtonUrl": "/about", "primaryButtonLabelAr": "ط§ظ†ط¶ظ… ط¥ظ„ظٹظ†ط§", "primaryButtonLabelEn": "Join Us", "secondaryButtonLabelAr": "ط§ط¹ط±ظپ ط§ظ„ظ…ط²ظٹط¯", "secondaryButtonLabelEn": "Learn More"}, {"titleAr": "طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط³ظˆط±ظٹط§", "titleEn": "Advancing Soil Science in Syria", "subtitleAr": "ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط©", "descriptionAr": "ظ‚ظٹط§ط¯ط© ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ ظˆط§ظ„طھط¹ظ„ظٹظ… ظˆط¥ط¯ط§ط±ط© ط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ط¹ط¨ط± ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط²ط±ط§ط¹ظٹط© ط§ظ„ظ…طھظ†ظˆط¹ط© ظپظٹ ط³ظˆط±ظٹط§", "descriptionEn": "Leading research, education, and sustainable land management across Syriaâ€™s diverse agricultural regions.", "backgroundImage": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1920&auto=format&fit=crop", "primaryButtonUrl": "/members", "secondaryButtonUrl": "/about", "primaryButtonLabelAr": "ط§ظ†ط¶ظ… ط¥ظ„ظٹظ†ط§", "primaryButtonLabelEn": "Join Us", "secondaryButtonLabelAr": "ط§ط¹ط±ظپ ط§ظ„ظ…ط²ظٹط¯", "secondaryButtonLabelEn": "Learn More"}, {"titleAr": "ط§ظ„ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ„ظ„ط£ط±ط§ط¶ظٹ", "titleEn": "Sustainable Land Management", "subtitleAr": "طµظˆظ† ط§ظ„طھط±ط¨ط© ظ„ظ„ط£ط¬ظٹط§ظ„ ط§ظ„ظ‚ط§ط¯ظ…ط©", "descriptionAr": "طھط¹ط²ظٹط² ط£ظپط¶ظ„ ط§ظ„ظ…ظ…ط§ط±ط³ط§طھ ظپظٹ طµظˆظ† ط§ظ„طھط±ط¨ط© ظˆط§ظ„ط²ط±ط§ط¹ط© ط§ظ„ظ…ط³طھط¯ط§ظ…ط© ظ…ظ† ط£ط¬ظ„ ط§ظ„ط£ظ…ظ† ط§ظ„ط؛ط°ط§ط¦ظٹ ظˆط§ظ„طµط­ط© ط§ظ„ط¨ظٹط¦ظٹط©", "descriptionEn": "Promoting best practices in soil conservation and sustainable agriculture for food security and environmental health.", "backgroundImage": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1920&auto=format&fit=crop", "primaryButtonUrl": "/publications", "secondaryButtonUrl": "/events", "primaryButtonLabelAr": "ط£ط¨ط­ط§ط«ظ†ط§", "primaryButtonLabelEn": "Our Research", "secondaryButtonLabelAr": "ط§ظ„ظپط¹ط§ظ„ظٹط§طھ", "secondaryButtonLabelEn": "Events"}, {"titleAr": "طھظˆط§طµظ„ ظ…ط¹ ط¹ظ„ظ…ط§ط، ط§ظ„طھط±ط¨ط©", "titleEn": "Connect with Soil Scientists", "subtitleAr": "ط´ط¨ظƒط© ط¹ظ„ظ…ظٹط© ظ…طھط®طµطµط©", "descriptionAr": "ط§ظ†ط¶ظ… ط¥ظ„ظ‰ ط´ط¨ظƒطھظ†ط§ ظ…ظ† ط§ظ„ط¨ط§ط­ط«ظٹظ† ظˆط§ظ„ظ…ط¹ظ„ظ…ظٹظ† ظˆط§ظ„ظ…ظ…ط§ط±ط³ظٹظ† ط§ظ„ظ…ظƒط±ط³ظٹظ† ظ„طھط·ظˆظٹط± ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظپظٹ ط§ظ„ظ…ظ†ط·ظ‚ط©", "descriptionEn": "Join our network of researchers, educators, and practitioners dedicated to advancing soil science across the region.", "backgroundImage": "https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=1920&auto=format&fit=crop", "primaryButtonUrl": "/members", "secondaryButtonUrl": "/contact", "primaryButtonLabelAr": "ظƒظ† ط¹ط¶ظˆظ‹ط§", "primaryButtonLabelEn": "Become a Member", "secondaryButtonLabelAr": "ط§طھطµظ„ ط¨ظ†ط§", "secondaryButtonLabelEn": "Contact Us"}], "autoplay": true, "showDots": true, "showArrows": true, "transitionStyle": "slide", "autoplayInterval": 5000}	{}	2026-07-15 07:48:36.283057
\.


--
-- TOC entry 6259 (class 0 OID 68668)
-- Dependencies: 260
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.system_config (id, config_key, config_value, config_group, config_type, is_encrypted, is_public, description, updated_by, created_at, updated_at) FROM stdin;
7d67b99f-0150-40fb-b175-6365bb9e1e99	site_name_en	Soil Science Society of Syria	GENERAL	STRING	f	t	English site name	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
def33c84-6c3b-4ee0-9200-1815ff31e473	site_description	Official website of the Soil Science Society of Syria	GENERAL	STRING	f	t	Site description	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
8900afc1-e405-4ea0-82d6-965fa1051690	contact_phone	+963-11-XXX-XXXX	GENERAL	STRING	f	t	Primary contact phone	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
45260e12-64ed-413d-981a-188ca349ba86	address_en	Damascus, Syria	GENERAL	STRING	f	t	English address	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
f3270166-828e-48bf-9cfc-e575ba4311ab	address_ar	ط¯ظ…ط´ظ‚طŒ ط³ظˆط±ظٹط§	GENERAL	STRING	f	t	Arabic address	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
8c632fa1-806d-4978-b81a-512a6e53ed00	maintenance_mode	false	GENERAL	STRING	f	f	Enable maintenance mode	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
ad3114a0-9e4d-4b64-9719-3660f0b124fc	allow_registration	true	GENERAL	STRING	f	f	Allow user registration	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
6c222c6c-9aec-47e5-baba-c61fdd21aaf4	newsletter_enabled	true	GENERAL	STRING	f	f	Enable newsletter subscription	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
8575d227-35b7-4adf-8fff-f70010893e43	comments_moderation	pre	GENERAL	STRING	f	f	Comment moderation: pre, post, or none	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
75e77a3c-085b-49c9-9191-ba2289be7173	default_language	en	GENERAL	STRING	f	t	Default site language	\N	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
24dbf2e1-ff76-4648-9049-54d42226e7df	site.logo_url		site	STRING	f	t	URL for the site logo image shown in the public header. Upload to Media Library and paste the URL here.	\N	2026-07-14 13:25:16.488875	2026-07-14 13:43:28.257423
e858bda2-fcd9-49e3-858e-193e2a04ab59	site.short_name	SSSS	site	STRING	f	t	Short name / acronym shown in the header and footer. E.g. SSSS	\N	2026-07-14 13:25:16.488875	2026-07-14 13:43:28.257423
7d7e8207-cdd3-4154-9d15-3d5aa85093ac	site.name	Syrian Soil Science Society	site	STRING	f	t	Full name of the organisation shown in the header.	\N	2026-07-14 13:25:16.488875	2026-07-14 13:43:28.257423
44c71661-d6ef-4840-b653-f70ea6756da0	contact.phone	+963 11 234 5678	contact	STRING	f	t	Organisation contact phone	\N	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
8b91d5e4-34a1-4aac-b2d3-c317cab29d88	contact.address	Damascus, Syria	contact	STRING	f	t	Organisation contact address	\N	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
d50650bd-7363-43ad-b6ad-7689a62766b2	contact_email	info@ssssy.org	GENERAL	STRING	f	t	Primary contact email	\N	2026-07-09 10:39:18.868583	2026-07-14 13:43:28.257423
07c20f5a-f43d-4302-90ff-13754d79d785	social_facebook	https://facebook.com/ssssy	GENERAL	STRING	f	t	Facebook page URL	\N	2026-07-09 10:39:18.868583	2026-07-14 13:43:28.257423
315fc0a1-a669-4eae-a716-6aedeed7a542	social_twitter	https://twitter.com/ssssy	GENERAL	STRING	f	t	Twitter/X profile URL	\N	2026-07-09 10:39:18.868583	2026-07-14 13:43:28.257423
ab30f253-481f-436b-8b7c-5615217c3088	social_linkedin	https://linkedin.com/company/ssssy	GENERAL	STRING	f	t	LinkedIn page URL	\N	2026-07-09 10:39:18.868583	2026-07-14 13:43:28.257423
4cbc31fe-b80c-4012-a401-5ffbb1387afb	social.facebookUrl	https://facebook.com/ssssy	GENERAL	STRING	f	t	Facebook URL	\N	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
5dd37019-a61d-44b3-9032-159899c31860	social.youtubeUrl	https://youtube.com/@ssssy	GENERAL	STRING	f	t	YouTube URL	\N	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
955443ad-4e2b-4b46-ba5b-8163bc18b2b6	social.twitterUrl	https://twitter.com/ssssy	GENERAL	STRING	f	t	Twitter/X URL	\N	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
3d055877-998d-4322-9f94-9e51ff93dba5	footer.copyright	Syrian Soil Science Society (SSSS). All rights reserved.	footer	STRING	f	t	Footer copyright text	\N	2026-07-14 13:25:16.488875	2026-07-14 13:43:28.257423
8bef50d7-f91b-4dee-a3e4-b968e4007aa5	site_name_ar	ط§ظ„ط¬ظ…ط¹ظٹط© ط§ظ„ط³ظˆط±ظٹط© ظ„ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©	GENERAL	STRING	f	t	\N	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-09 10:39:18.868583	2026-07-14 23:44:16.734466
b15e57f2-c305-4bab-8acb-7a0e0b93f197	staging_mode_enabled	false	staging	text	f	t	Whether staging mode is active	\N	2026-07-11 16:48:55.213322	2026-07-24 22:22:36.061964
80d31567-1494-4e14-853d-421c71554924	social.linkedinUrl	https://linkedin.com/company/ssssy	GENERAL	STRING	f	t	LinkedIn URL	\N	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
d580c8e7-1455-44fa-9b65-9a72a85c3fa8	contact.email	info@ssssy.org	contact	STRING	f	t	Organisation contact email	\N	2026-07-09 18:07:24.037676	2026-07-14 13:43:28.257423
1d24bfcf-6ba2-4de7-93f3-567c1721d48b	site.name_en	Soil Science Society of Syria (SSSS)	site	STRING	f	t	Site name displayed in the header when the UI language is English.	\N	2026-07-15 00:02:06.111313	2026-07-15 00:02:06.111313
b5ffa73c-7f91-4c6e-aa3d-db1a0e6205d5	site.name_ar	ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© (SSSS)	site	STRING	f	t	ط§ط³ظ… ط§ظ„ظ…ظˆظ‚ط¹ ط§ظ„ط¸ط§ظ‡ط± ظپظٹ ط§ظ„طھط±ظˆظٹط³ط© ط¹ظ†ط¯ طھط­ط¯ظٹط¯ ط§ظ„ظ„ط؛ط© ط§ظ„ط¹ط±ط¨ظٹط©.	\N	2026-07-15 00:02:06.111313	2026-07-15 00:02:06.111313
d56969d3-0f90-456e-a0e5-63936f180429	footer.copyright_en	Soil Science Society of Syria (SSSS). All rights reserved.	footer	STRING	f	t	Footer copyright text shown when the UI language is English.	\N	2026-07-15 00:17:01.407598	2026-07-15 00:17:01.407598
5cf29c12-67bc-42dd-8b36-dade25bbc964	footer.copyright_ar	ط¬ظ…ط¹ظٹط© ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط§ظ„ط³ظˆط±ظٹط© (SSSS). ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ‚ ظ…ط­ظپظˆط¸ط©.	footer	STRING	f	t	ظ†طµ ط­ظ‚ظˆظ‚ ط§ظ„ظ†ط´ط± ظپظٹ طھط°ظٹظٹظ„ ط§ظ„طµظپط­ط© ط¹ظ†ط¯ طھط­ط¯ظٹط¯ ط§ظ„ظ„ط؛ط© ط§ظ„ط¹ط±ط¨ظٹط©.	\N	2026-07-15 00:17:01.407598	2026-07-15 00:17:01.407598
c4565023-c345-4a73-84ea-bb8f914b40b2	style_theme_preset	academic-serif	\N	\N	f	t	\N	6d6595c0-1835-42be-89a1-1a44b899141c	2026-07-15 01:39:12.613617	2026-07-15 03:10:29.348015
1518e8f1-848c-48ed-aa63-2c119780f08a	event.reminder.default_offsets	24,1	events	STRING	f	t	Comma-separated hours-before-event to auto-create reminders (e.g. 24,1)	\N	2026-07-30 01:03:46.411321	2026-07-30 01:03:46.411321
100d5bb1-593c-4c76-b627-be9e8c293d3a	event.reminder.post_event_hours	2	events	STRING	f	t	Hours after event end to send post-event follow-up	\N	2026-07-30 01:03:46.411321	2026-07-30 01:03:46.411321
c3e1a8d1-75e3-4fcf-88db-800c4a5aee49	event.reminder.email_subject_template	Reminder: {{eventTitle}}	events	STRING	f	t	Default email subject template for event reminders	\N	2026-07-30 01:03:46.411321	2026-07-30 01:03:46.411321
cba071bf-225c-4ffb-8881-91cc8a64b433	event.reminder.email_body_template	Dear {{name}},\\n\\nThis is a reminder for the event "{{eventTitle}}" on {{eventDate}} at {{location}}.\\n\\nView details: {{link}}\\n\\nBest regards,\\nSSSSY Team	events	TEXT	f	t	Default email body template	\N	2026-07-30 01:03:46.411321	2026-07-30 01:03:46.411321
b4ce18bb-d54a-4188-8ca4-417ba10b08d6	event.registration.confirmation_email_enabled	true	events	BOOLEAN	f	t	Send confirmation email when a user registers for an event	\N	2026-07-30 01:03:46.411321	2026-07-30 01:03:46.411321
181ba85e-be84-483d-8e87-bfd9f51a9fc4	event.registration.waitlist_enabled	true	events	BOOLEAN	f	t	Allow waitlist registrations when an event is fully booked	\N	2026-07-30 01:03:46.411321	2026-07-30 01:03:46.411321
3934becb-c2f1-4591-b6f4-b281fa756b82	event.reminder.auto_create_on_publish	true	events	BOOLEAN	f	t	Automatically create default reminder rules when an event is published	\N	2026-07-30 01:03:46.411321	2026-07-30 01:03:46.411321
\.


--
-- TOC entry 6225 (class 0 OID 67959)
-- Dependencies: 226
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.tags (id, name_ar, name_en, slug, created_at) FROM stdin;
\.


--
-- TOC entry 6278 (class 0 OID 69119)
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
ae873c04-0fcc-4ee8-a161-27b015e1a637	feature_command_palette	true	boolean	features	Global Command Palette (âŒکK)	2026-07-09 10:39:19.325399	2026-07-09 10:39:19.325399
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
c842fe2b-44b6-44b6-a14b-0003830a3233	border_radius_sm	0.25rem	text	borders	Small Border Radius	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
5da6dd01-f21a-4d88-bb03-e77822218607	border_radius_base	0.5rem	text	borders	Base Border Radius	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
bbcf73d5-2706-4180-8a59-26988c26ed0d	border_radius_md	0.75rem	text	borders	Medium Border Radius	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
c62ff056-7a59-4c4f-8d6c-1c885464e070	border_radius_lg	1rem	text	borders	Large Border Radius	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
0f417938-eb0f-4af8-a2fd-6f02602ae281	border_radius_xl	1.5rem	text	borders	X-Large Border Radius	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
77cfb656-b602-486c-bff5-eec9ebb34ac2	border_radius_full	9999px	text	borders	Full/Pill Border Radius	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
94215182-cead-4adc-bb3f-560e172cb195	border_width_base	1px	text	borders	Default Border Width	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
deb7fe5e-5140-428d-857a-062953fee41d	shadow_sm	0 1px 3px rgba(0,0,0,0.12)	text	shadows	Small Shadow	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
b8c9d90c-157d-4821-a122-778ea1ecac85	shadow_md	0 4px 16px rgba(0,0,0,0.15)	text	shadows	Medium Shadow	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
d121d732-8b81-416a-bf84-13450527b2ea	shadow_lg	0 8px 32px rgba(0,0,0,0.18)	text	shadows	Large Shadow	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
d9e74638-1b2c-4f39-bd80-bbc1b7f8e35f	shadow_xl	0 20px 60px rgba(0,0,0,0.22)	text	shadows	X-Large Shadow	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
4c560ebb-a0c2-406b-af33-af5c1f5bec6e	shadow_card	0 2px 8px rgba(0,0,0,0.08)	text	shadows	Card Shadow	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
7631e983-ac96-4cfc-a93c-4c197de0b1fe	shadow_none	none	text	shadows	No Shadow	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
47ba1373-ee0f-4f62-8fd9-98b7427e7cd3	spacing_xs	0.25rem	text	spacing	XS Spacing	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
73c92dcd-c25b-4e54-a525-9dfd8e243f41	spacing_sm	0.5rem	text	spacing	SM Spacing	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
ddbe083b-f306-432c-88cd-f9ab815f8054	spacing_md	1rem	text	spacing	MD Spacing	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
d0549c30-99bb-4481-9731-9a879ea7959e	spacing_lg	1.5rem	text	spacing	LG Spacing	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
7e2215d0-7770-487e-8859-6a8843d709d2	spacing_xl	2rem	text	spacing	XL Spacing	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
b456c0b4-925b-43f2-9937-5bc062281694	spacing_2xl	3rem	text	spacing	2XL Spacing	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
f05be517-3d2a-4463-8790-cb723c4d5edb	spacing_3xl	4rem	text	spacing	3XL Spacing	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
fa22815d-8e54-43eb-acad-afe56f99c86d	container_max_width	1280px	text	layout	Container Max Width	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
fa888185-8705-42e4-a756-a7ea58c58d23	container_padding	1.5rem	text	layout	Container Padding	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
d01ef69a-c60a-4756-a326-1563b09ff5d0	grid_columns	12	text	layout	Grid Columns	2026-07-11 03:44:17.11249	2026-07-11 03:44:17.11249
0a70e1dc-23a4-4c70-a455-238ab5a0d7ab	style_theme_preset	classic-soil	text	style	\N	2026-07-15 03:15:30.905432	2026-07-15 03:16:35.864422
\.


--
-- TOC entry 6284 (class 0 OID 69273)
-- Dependencies: 285
-- Data for Name: themes; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.themes (id, name_ar, name_en, theme_json, is_active, is_system, created_by, created_at, updated_at) FROM stdin;
c16a6bbd-ee7c-443a-ab31-fa0fa241be9f	ط§ظ„ظ†ط³ظ‚ ط§ظ„ط§ظپطھط±ط§ط¶ظٹ	SSSSY Default	{"fonts": {"body": "Merriweather", "heading": "Inter"}, "colors": {"text": "#1f2328", "accent": "#D7CCC8", "primary": "#3E2723", "secondary": "#558B2F", "background": "#FFF8E1"}, "layout": {"borderRadius": "0.5rem", "containerMaxWidth": "1280px"}}	t	t	\N	2026-07-11 03:39:35.916629	2026-07-11 03:39:35.916629
\.


--
-- TOC entry 6289 (class 0 OID 69390)
-- Dependencies: 290
-- Data for Name: url_redirects; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.url_redirects (id, from_path, to_path, redirect_type, page_id, created_at) FROM stdin;
\.


--
-- TOC entry 6221 (class 0 OID 67879)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.users (id, username, email, password_hash, first_name_ar, last_name_ar, first_name_en, last_name_en, phone, avatar_url, role_id, is_active, is_email_verified, email_verified_at, last_login_at, failed_login_attempts, account_locked_until, created_at, updated_at, institution, department, "position", specialization, biography, address, city, country, two_factor_enabled, deleted_at, two_factor_secret, preferred_language) FROM stdin;
6d6595c0-1835-42be-89a1-1a44b899141c	admin	admin@ssssy.org.sy	$2a$10$yV7UTAfe5DuI/Wu4SL0Lc.R9gdC53X1jT38idZjrvjGzxxnC0H2Bq	\N	\N	Super	Admin	\N	\N	fd53cd22-8396-4700-af29-8906643e0758	t	t	\N	2026-07-30 08:09:35.929883	0	\N	2026-07-09 10:39:16.907665	2026-07-30 08:09:36.060529	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	en
a2000001-0000-0000-0000-000000000001	mohammed.shater	ssaidshater@gmail.com	$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX	ظ…ط­ظ…ط¯ ط³ط¹ظٹط¯	ط§ظ„ط´ط§ط·ط±	Mohammed Said	Al-Shater	\N	\N	fd19e351-c8f7-44e2-b258-d1df8d15bb5c	t	t	\N	\N	0	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:14.414509	ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚	ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© â€” ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط©	ط£ط³طھط§ط° ظپظٹ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©	ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©	ط£ط³طھط§ط° ظپظٹ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط¨ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط©/ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© ط¨ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚. ط±ط¦ظٹط³ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظ„ظپطھط±طھظٹظ† (2004â€“2008 ظˆ2012â€“2016). ط®ط¨ظٹط± ظپظٹ ط§ظ„ظ…ط±ظƒط² ط§ظ„ط¹ط±ط¨ظٹ ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط¬ط§ظپط© ظˆط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ظ‚ط§ط­ظ„ط© (ط£ظƒط³ط§ط¯). ط¹ط¶ظˆ ظپظٹ ظ…ط¬ظ…ط¹ ط§ظ„ظ„ط؛ط© ط§ظ„ط¹ط±ط¨ظٹط© ط¨ط¯ظ…ط´ظ‚ ط¶ظ…ظ† ظ„ط¬ظ†ط© ظ…طµط·ظ„ط­ط§طھ ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط©.	\N	\N	\N	f	\N	\N	en
a2000001-0000-0000-0000-000000000002	haidar.alhasan	dr.haidar.alhasan@gmail.com	$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX	ط­ظٹط¯ط± ظ‡ط§ط´ظ…	ط§ظ„ط­ط³ظ†	Haidar Hashem	Al-Hassan	\N	\N	fd19e351-c8f7-44e2-b258-d1df8d15bb5c	t	t	\N	\N	0	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:14.414509	ط¬ط§ظ…ط¹ط© ط­ظ…ط§ظ‡	ظ‚ط³ظ… ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط© ط§ظ„ظ…طھط¬ط¯ظ‘ط¯ط© â€” ظƒظ„ظٹط© ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط©	ط±ط¦ظٹط³ ظ‚ط³ظ… ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط© ط§ظ„ظ…طھط¬ط¯ظ‘ط¯ط©	طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ	ط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© ظ…ظ† ط¬ط§ظ…ط¹ط© ط­ظ…طµ (ط§ظ„ط¨ط¹ط« ط³ط§ط¨ظ‚ط§ظ‹) 2013. ط±ط¦ظٹط³ ظ‚ط³ظ… ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط© ط§ظ„ظ…طھط¬ط¯ظ‘ط¯ط© ظپظٹ ظƒظ„ظٹط© ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© ط¨ط¬ط§ظ…ط¹ط© ط­ظ…ط§ظ‡ ظ…ظ†ط° 1/10/2025. ظ…طھط®طµطµ ظپظٹ ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط© ظˆطھط؛ط°ظٹط© ط§ظ„ظ†ط¨ط§طھ.	\N	\N	\N	f	\N	\N	en
a2000001-0000-0000-0000-000000000003	manhal.zoubi	manhalzo@yahoo.com	$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX	ظ…ط­ظ…ط¯ ظ…ظ†ظ‡ظ„	ط§ظ„ط²ط¹ط¨ظٹ	Mohammed Manhal	Al-Zoubi	0933334783	\N	fd19e351-c8f7-44e2-b258-d1df8d15bb5c	t	t	\N	\N	0	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:14.414509	ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ظ„ظ„ط¨ط­ظˆط« ط§ظ„ط¹ظ„ظ…ظٹط© ط§ظ„ط²ط±ط§ط¹ظٹط©	ط¥ط¯ط§ط±ط© ط¨ط­ظˆط« ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©	ظ…ط¯ظٹط± ط¨ط­ظˆط« ظˆط¥ط¯ط§ط±ط© ط¨ط­ظˆط« ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©	ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط¥ط¯ط§ط±ط© ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©	ط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط© طھط®طµطµ ط¹ظ„ظˆظ… طھط±ط¨ط© ظ…ظ† ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 2006. ظ…ط¯ظٹط± ط¥ط¯ط§ط±ط© ط¨ط­ظˆط« ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط© ظپظٹ ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ظ„ظ„ط¨ط­ظˆط« ط§ظ„ط¹ظ„ظ…ظٹط© ط§ظ„ط²ط±ط§ط¹ظٹط©. ظ†ظ‚ط·ط© ط§ظ„ط§طھطµط§ظ„ ظ…ط¹ ط§ظ„ط´ط±ط§ظƒط© ط§ظ„ط¹ط§ظ„ظ…ظٹط© ظ„ظ„طھط±ط¨ط© GSP-FAO. ط®ط¨ط±ط© 30 ط³ظ†ط© ظپظٹ ط¥ط¯ط§ط±ط© ط§ظ„ظ…ظˆط§ط±ط¯ ط§ظ„ط·ط¨ظٹط¹ظٹط©. ط£ط´ط±ظپ ط¹ظ„ظ‰ 26 ط£ط·ط±ظˆط­ط© ظ…ط§ط¬ط³طھظٹط± ظˆط¯ظƒطھظˆط±ط§ظ‡. 72 ط¨ط­ط«ط§ظ‹ ط¹ظ„ظ…ظٹط§ظ‹ ظ…ظ†ط´ظˆط±ط§ظ‹ ظپظٹ ظ…ط¬ظ„ط§طھ ظ…ط­ظƒظ…ط©.	\N	\N	\N	f	\N	\N	en
a2000001-0000-0000-0000-000000000004	alaa.khalouf	alaa.khalouf@ssss.sy	$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX	ط¹ظ„ط§ط، ط­ط³ظ†	ط®ظ„ظˆظپ	Alaa Hassan	Khalouf	\N	\N	fd19e351-c8f7-44e2-b258-d1df8d15bb5c	t	t	\N	\N	0	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:14.414509	ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ط¹ط§ظ…ط© ظ„ظ„ط¨ط­ظˆط« ط§ظ„ط¹ظ„ظ…ظٹط© ط§ظ„ط²ط±ط§ط¹ظٹط©	ظ‚ط³ظ… ط¨ط­ظˆط« طµظٹط§ظ†ط© ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ	ط±ط¦ظٹط³ ظ‚ط³ظ… ط¨ط­ظˆط« طµظٹط§ظ†ط© ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ	ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ	ط¨ط§ط­ط« ظ…طھط®طµطµ ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ ظˆط®ط¨ظٹط± ظپظٹ ظ†ط¸ظ… ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط¬ط؛ط±ط§ظپظٹط© (GIS) ظˆط§ظ„ط§ط³طھط´ط¹ط§ط± ط¹ظ† ط¨ظڈط¹ط¯. ط®ط¨ط±ط© طھطھط¬ط§ظˆط² 15 ط¹ط§ظ…ط§ظ‹ ظپظٹ ط¥ط¯ط§ط±ط© ط§ظ„ط£ط±ط§ط¶ظٹ ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ظ…طھط¯ظ‡ظˆط±ط© ظˆط§ظ„ظ…طھظ…ظ„ط­ط©. ط´ط؛ظ„ ظ…ظ†طµط¨ ط®ط¨ظٹط± GIS ظپظٹ UNDP. ط£ط³ظ‡ظ… ظپظٹ ط¥ط¹ط¯ط§ط¯ طھظ‚ط§ط±ظٹط± FAO ط§ظ„ط¯ظˆظ„ظٹط© ظ…ظ† ط¨ظٹظ†ظ‡ط§ ط§ظ„ط£ط·ظ„ط³ ط§ظ„ط¢ط³ظٹظˆظٹ ظ„ظ„طھط±ط¨ط© ظˆط§ظ„طھظ‚ط±ظٹط± ط§ظ„ط¹ط§ظ„ظ…ظٹ ظ„ط­ط§ظ„ط© ط§ظ„ط£ط±ط§ط¶ظٹ ط§ظ„ظ…طھط£ط«ط±ط© ط¨ط§ظ„ظ…ظ„ظˆط­ط©.	\N	\N	\N	f	\N	\N	en
a2000001-0000-0000-0000-000000000005	omar.abdelrazzaq	omar354691@gmail.com	$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX	ط¹ظ…ط± ط¹ط¨ط¯ ط§ظ„ظ„ظ‡	ط¹ط¨ط¯ ط§ظ„ط±ط²ط§ظ‚	Omar Abdullah	Abdul-Razzaq	+963944984574	\N	fd19e351-c8f7-44e2-b258-d1df8d15bb5c	t	t	\N	\N	0	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:14.414509	ط¬ط§ظ…ط¹ط© ط§ظ„ظپط±ط§طھ	ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© ط¨ط¯ظٹط± ط§ظ„ط²ظˆط±	ط£ط³طھط§ط° â€” ط£ظ…ظٹظ† ط¬ط§ظ…ط¹ط© ط§ظ„ظپط±ط§طھ	طµظٹط§ظ†ط© ط§ظ„طھط±ط¨ط©	ط£ط³طھط§ط° ظپظٹ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© ط¨ط¯ظٹط± ط§ظ„ط²ظˆط±طŒ ط¬ط§ظ…ط¹ط© ط§ظ„ظپط±ط§طھ. ط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط© طھط®طµطµ طµظٹط§ظ†ط© ط§ظ„طھط±ط¨ط© ظ…ظ† ط¬ط§ظ…ط¹ط© ط§ظ„ظ‡ظ…ط¨ظˆظ„طھ ظپظٹ ط¨ط±ظ„ظٹظ†/ط£ظ„ظ…ط§ظ†ظٹط§ 1989. ط¹ظ…ظٹط¯ ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© (2019â€“2023). ظ†ط§ط¦ط¨ ط±ط¦ظٹط³ ط¬ط§ظ…ط¹ط© ط§ظ„ظپط±ط§طھ ظ„ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ ظˆط§ظ„ط¯ط±ط§ط³ط§طھ ط§ظ„ط¹ظ„ظٹط§ (2010â€“2014). ط®ط¨ظٹط± ط£ظƒط³ط§ط¯ ظپظٹ ظ…ظƒط§ظپط­ط© ط§ظ„طھطµط­ط±. ط£ظƒط«ط± ظ…ظ† 70 ط¨ط­ط« ط¹ظ„ظ…ظٹ ظ…ظ†ط´ظˆط±. ط£ط´ط±ظپ ط¹ظ„ظ‰ ط£ظƒط«ط± ظ…ظ† 60 ط±ط³ط§ظ„ط© ظ…ط§ط¬ط³طھظٹط± ظˆط¯ظƒطھظˆط±ط§ظ‡.	\N	\N	\N	f	\N	\N	en
a2000001-0000-0000-0000-000000000006	akram.balkhi	Balkhiakram@yahoo.com	$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX	ط£ظƒط±ظ… ظ…ط­ظ…ط¯	ط§ظ„ط¨ظ„ط®ظٹ	Akram Mohammed	Al-Balkhi	+963966296815	\N	fd19e351-c8f7-44e2-b258-d1df8d15bb5c	t	t	\N	\N	0	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:14.414509	ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ / ط£ظƒط³ط§ط¯	ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© â€” ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© / ط£ظƒط³ط§ط¯	ط£ط³طھط§ط° â€” ظ†ط§ط¦ط¨ ظ…ط¯ظٹط± ط¥ط¯ط§ط±ط© ط§ظ„ط£ط±ط§ط¶ظٹ ظˆط§ط³طھط¹ظ…ط§ظ„ط§طھ ط§ظ„ظ…ظٹط§ظ‡	ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© â€” ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط³ظ…ظٹط¯	ط£ط³طھط§ط° ظپظٹ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط¨ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚. ط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© (ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط³ظ…ظٹط¯) ظ…ظ† ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 2006. ط±ط¦ظٹط³ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© (2016â€“2020). ظ…ط¯ظٹط± ط¥ط¯ط§ط±ط© ط§ظ„ط£ط±ط§ط¶ظٹ ظˆط§ط³طھط¹ظ…ط§ظ„ط§طھ ط§ظ„ظ…ظٹط§ظ‡ ظپظٹ ط£ظƒط³ط§ط¯ (2024â€“2025). ORCID: 0000-0002-4302-4032. 75 ط§ظ‚طھط¨ط§ط³ط§ظ‹ ط¹ظ„ظ…ظٹط§ظ‹. ظ„ظ‡ ظƒطھط¨ طھط¯ط±ظٹط³ظٹط© ظپظٹ ط®طµظˆط¨ط© ط§ظ„طھط±ط¨ط© ظˆط§ظ„طھط³ظ…ظٹط¯ ظˆط§ظ„ط²ط±ط§ط¹ط© ط§ظ„ط¹ط¶ظˆظٹط©.	\N	\N	\N	f	\N	\N	en
a2000001-0000-0000-0000-000000000007	mahmoud.oudeh	oudehmahmoud44@gmail.com	$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX	ظ…ط­ظ…ظˆط¯	ط¹ظˆط¯ط©	Mahmoud	Oudeh	\N	\N	fd19e351-c8f7-44e2-b258-d1df8d15bb5c	t	t	\N	\N	0	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:14.414509	ط¬ط§ظ…ط¹ط© ط­ظ…طµ	ظ‚ط³ظ… ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ â€” ظƒظ„ظٹط© ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط©	ط£ط³طھط§ط° ظپظٹ ظ‚ط³ظ… ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ	ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط©	ط£ط³طھط§ط° ظپظٹ ظ‚ط³ظ… ط§ظ„طھط±ط¨ط© ظˆط§ط³طھطµظ„ط§ط­ ط§ظ„ط£ط±ط§ط¶ظٹ ط¨ظƒظ„ظٹط© ط§ظ„ظ‡ظ†ط¯ط³ط© ط§ظ„ط²ط±ط§ط¹ظٹط©طŒ ط¬ط§ظ…ط¹ط© ط­ظ…طµ. ط¥ط¬ط§ط²ط© ظپظٹ ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط© ظ…ظ† ط¬ط§ظ…ط¹ط© ط¯ظ…ط´ظ‚ 1977. ظ…ط§ط¬ط³طھظٹط± ظپظٹ ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظ…ظ† ط¬ط§ظ…ط¹ط© ط§ظ„ط¨ط³طھظ†ط© ط¨ط¨ظˆط¯ط§ط¨ط³طھ 1984. ط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ط²ط±ط§ط¹ظٹط© ظ…ظ† ط£ظƒط§ط¯ظٹظ…ظٹط© ط§ظ„ط¹ظ„ظˆظ… ط§ظ„ظ…ط¬ط±ظٹط© ط¨ط¨ظˆط¯ط§ط¨ط³طھ 1988.	\N	\N	\N	f	\N	\N	en
a2000001-0000-0000-0000-000000000008	hussam.bahlawan	aaobahlawan@gmail.com	$2a$10$disabled.placeholder.hash.not.usable.for.loginXXXXXX	ظ…ط­ظ…ط¯ ط­ط³ط§ظ…	ط¨ظ‡ظ„ظˆط§ظ†	Mohammed Hussam	Bahlawan	+963955269733	\N	fd19e351-c8f7-44e2-b258-d1df8d15bb5c	t	t	\N	\N	0	\N	2026-07-30 06:09:14.414509	2026-07-30 06:09:14.414509	ط¬ط§ظ…ط¹ط© ط­ظ„ط¨	ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© â€” ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط©	ط£ط³طھط§ط° ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ظˆط§ظ„ظ…ظٹط§ظ‡	ط¥ط¯ط§ط±ط© ط§ظ„طھط±ط¨ ظˆط§ظ„ظ…ظٹط§ظ‡ ظپظٹ ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط¬ط§ظپط© ظˆظ†طµظپ ط§ظ„ط¬ط§ظپط©	ط£ط³طھط§ط° ظپظٹ ظ‚ط³ظ… ط¹ظ„ظˆظ… ط§ظ„طھط±ط¨ط© ط¨ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط©طŒ ط¬ط§ظ…ط¹ط© ط­ظ„ط¨. ط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط¹ظ„ظˆظ… ط§ظ„ط£ط±ط§ط¶ظٹ ظ…ظ† ظƒظ„ظٹط© ط§ظ„ط²ط±ط§ط¹ط© ط¬ط§ظ…ط¹ط© ط¹ظٹظ† ط´ظ…ط³ 2000. طھط®طµطµ ظپظٹ ط¬ظٹظˆظƒظٹظ…ظٹط§ط، ط§ظ„طھط±ط¨ط© ظˆط¥ط¯ط§ط±ط© ط§ظ„طھط±ط¨ ظˆط§ظ„ظ…ظٹط§ظ‡ ظپظٹ ط§ظ„ظ…ظ†ط§ط·ظ‚ ط§ظ„ط¬ط§ظپط©. ظ…ط¯ظٹط± ظ…ط±ظƒط² ط§ظ„ط£ط¨ط­ط§ط« ط§ظ„ط²ط±ط§ط¹ظٹط© ط¨ط¬ط§ظ…ط¹ط© ط­ظ„ط¨ (2011). ط®ط¨ظٹط± ظپظٹ ط£ظƒط³ط§ط¯ (2020â€“2021). ظˆظ„ط¯ ظپظٹ ط­ظ„ط¨ 1964.	\N	\N	\N	f	\N	\N	en
\.


--
-- TOC entry 6266 (class 0 OID 68813)
-- Dependencies: 267
-- Data for Name: workflow_actions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.workflow_actions (id, content_id, workflow_id, from_state_id, to_state_id, action, actor_id, comments, metadata, created_at) FROM stdin;
\.


--
-- TOC entry 6231 (class 0 OID 68094)
-- Dependencies: 232
-- Data for Name: workflow_logs; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.workflow_logs (id, content_id, from_status, to_status, action, actor_id, assignee_id, comments, created_at) FROM stdin;
\.


--
-- TOC entry 6264 (class 0 OID 68763)
-- Dependencies: 265
-- Data for Name: workflow_states; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.workflow_states (id, workflow_id, name, label_ar, label_en, color, is_initial, is_final, sort_order, created_at) FROM stdin;
4bb16cd9-d2b0-46d4-8d94-9e903440976b	a1b2c3d4-e5f6-7890-abcd-ef1234567890	DRAFT	ظ…ط³ظˆط¯ط©	Draft	#6B7280	t	f	0	2026-07-09 10:39:18.868583
7ccd2446-b26d-4128-b019-d9c77c2f0a1d	a1b2c3d4-e5f6-7890-abcd-ef1234567890	REVIEW	ظ‚ظٹط¯ ط§ظ„ظ…ط±ط§ط¬ط¹ط©	In Review	#F59E0B	f	f	1	2026-07-09 10:39:18.868583
1fdc8f4f-c12c-4a97-b004-3719d9de4b99	a1b2c3d4-e5f6-7890-abcd-ef1234567890	APPROVED	ظ…ظˆط§ظپظ‚ ط¹ظ„ظٹظ‡	Approved	#10B981	f	f	2	2026-07-09 10:39:18.868583
05094154-9906-4292-9a09-a0838e2d742a	a1b2c3d4-e5f6-7890-abcd-ef1234567890	PUBLISHED	ظ…ظ†ط´ظˆط±	Published	#059669	f	t	3	2026-07-09 10:39:18.868583
359e0d7b-ed68-433a-aa38-df3175f7b3c8	a1b2c3d4-e5f6-7890-abcd-ef1234567890	ARCHIVED	ظ…ط¤ط±ط´ظپ	Archived	#9CA3AF	f	t	4	2026-07-09 10:39:18.868583
f2df7c96-0788-4370-a502-771134db97f0	b2c3d4e5-f6a7-8901-bcde-f12345678901	DRAFT	ظ…ط³ظˆط¯ط©	Draft	#6B7280	t	f	0	2026-07-09 10:39:18.868583
29b5e6b0-f29c-45b2-9893-06826d2a2ec3	b2c3d4e5-f6a7-8901-bcde-f12345678901	REVIEW	ظ‚ظٹط¯ ط§ظ„ظ…ط±ط§ط¬ط¹ط©	In Review	#F59E0B	f	f	1	2026-07-09 10:39:18.868583
4a61ea63-5a0b-483f-98ba-f3e961852ccb	b2c3d4e5-f6a7-8901-bcde-f12345678901	APPROVED	ظ…ظˆط§ظپظ‚ ط¹ظ„ظٹظ‡	Approved	#10B981	f	f	2	2026-07-09 10:39:18.868583
461b9521-c06e-47d5-aaef-2bd39044376d	b2c3d4e5-f6a7-8901-bcde-f12345678901	PUBLISHED	ظ…ظ†ط´ظˆط±	Published	#059669	f	t	3	2026-07-09 10:39:18.868583
00d86c23-36b6-4ed7-9c2f-13f5d154ecfe	b2c3d4e5-f6a7-8901-bcde-f12345678901	ARCHIVED	ظ…ط¤ط±ط´ظپ	Archived	#9CA3AF	f	t	4	2026-07-09 10:39:18.868583
e5e1a054-b651-434b-9176-62f497607e96	c3d4e5f6-a7b8-9012-cdef-123456789012	DRAFT	ظ…ط³ظˆط¯ط©	Draft	#6B7280	t	f	0	2026-07-09 10:39:18.868583
c097e7b0-2609-40bb-b09a-8835006ac2d4	c3d4e5f6-a7b8-9012-cdef-123456789012	REVIEW	ظ‚ظٹط¯ ط§ظ„ظ…ط±ط§ط¬ط¹ط©	In Review	#F59E0B	f	f	1	2026-07-09 10:39:18.868583
86810773-937b-46fa-986a-8b0620874abe	c3d4e5f6-a7b8-9012-cdef-123456789012	APPROVED	ظ…ظˆط§ظپظ‚ ط¹ظ„ظٹظ‡	Approved	#10B981	f	f	2	2026-07-09 10:39:18.868583
f7907e63-6098-4a88-b89d-2b8e5452ec53	c3d4e5f6-a7b8-9012-cdef-123456789012	PUBLISHED	ظ…ظ†ط´ظˆط±	Published	#059669	f	t	3	2026-07-09 10:39:18.868583
6c471b90-332b-421d-861a-0f17ffecc70f	c3d4e5f6-a7b8-9012-cdef-123456789012	ARCHIVED	ظ…ط¤ط±ط´ظپ	Archived	#9CA3AF	f	t	4	2026-07-09 10:39:18.868583
\.


--
-- TOC entry 6265 (class 0 OID 68783)
-- Dependencies: 266
-- Data for Name: workflow_transitions; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.workflow_transitions (id, workflow_id, from_state_id, to_state_id, name, roles_allowed, require_comment, conditions, sort_order, created_at) FROM stdin;
0ef11164-ff9b-4ef9-b4b9-2b5a66cd95f2	a1b2c3d4-e5f6-7890-abcd-ef1234567890	4bb16cd9-d2b0-46d4-8d94-9e903440976b	7ccd2446-b26d-4128-b019-d9c77c2f0a1d	طھظ‚ط¯ظٹظ… ظ„ظ„ظ…ط±ط§ط¬ط¹ط©	["EDITOR", "PUBLISHER"]	f	{}	0	2026-07-09 10:39:18.868583
ba2e7c94-2494-4624-88c8-e5f4bf5d3a5d	a1b2c3d4-e5f6-7890-abcd-ef1234567890	7ccd2446-b26d-4128-b019-d9c77c2f0a1d	1fdc8f4f-c12c-4a97-b004-3719d9de4b99	ظ…ظˆط§ظپظ‚ط©	["ADMIN", "PUBLISHER"]	f	{}	1	2026-07-09 10:39:18.868583
599cb07b-d5c9-43f6-9595-24155b5eae7a	a1b2c3d4-e5f6-7890-abcd-ef1234567890	7ccd2446-b26d-4128-b019-d9c77c2f0a1d	4bb16cd9-d2b0-46d4-8d94-9e903440976b	ط·ظ„ط¨ طھط¹ط¯ظٹظ„	["ADMIN", "EDITOR", "PUBLISHER"]	t	{}	2	2026-07-09 10:39:18.868583
713497e7-9e0f-43a1-8067-ecea3f9dd303	a1b2c3d4-e5f6-7890-abcd-ef1234567890	1fdc8f4f-c12c-4a97-b004-3719d9de4b99	05094154-9906-4292-9a09-a0838e2d742a	ظ†ط´ط±	["ADMIN", "PUBLISHER"]	f	{}	3	2026-07-09 10:39:18.868583
819eb55e-77b0-47b7-8ab4-d8aed0c9e108	a1b2c3d4-e5f6-7890-abcd-ef1234567890	05094154-9906-4292-9a09-a0838e2d742a	359e0d7b-ed68-433a-aa38-df3175f7b3c8	ط£ط±ط´ظپط©	["ADMIN"]	t	{}	4	2026-07-09 10:39:18.868583
8ef23b2d-b55a-450a-b321-5b051732a249	b2c3d4e5-f6a7-8901-bcde-f12345678901	f2df7c96-0788-4370-a502-771134db97f0	29b5e6b0-f29c-45b2-9893-06826d2a2ec3	طھظ‚ط¯ظٹظ… ظ„ظ„ظ…ط±ط§ط¬ط¹ط©	["EDITOR", "PUBLISHER"]	f	{}	0	2026-07-09 10:39:18.868583
10e62c97-4874-4bbf-ba48-9fea452654e6	b2c3d4e5-f6a7-8901-bcde-f12345678901	29b5e6b0-f29c-45b2-9893-06826d2a2ec3	4a61ea63-5a0b-483f-98ba-f3e961852ccb	ظ…ظˆط§ظپظ‚ط©	["ADMIN", "PUBLISHER"]	f	{}	1	2026-07-09 10:39:18.868583
a85faaf1-31a3-4bbd-9f5f-ce2cc9e5f711	b2c3d4e5-f6a7-8901-bcde-f12345678901	4a61ea63-5a0b-483f-98ba-f3e961852ccb	461b9521-c06e-47d5-aaef-2bd39044376d	ظ†ط´ط±	["ADMIN", "PUBLISHER"]	f	{}	2	2026-07-09 10:39:18.868583
00062c29-0e15-48bb-aa8d-bc6cbbd5ee73	c3d4e5f6-a7b8-9012-cdef-123456789012	e5e1a054-b651-434b-9176-62f497607e96	c097e7b0-2609-40bb-b09a-8835006ac2d4	طھظ‚ط¯ظٹظ… ظ„ظ„ظ…ط±ط§ط¬ط¹ط©	["EDITOR", "PUBLISHER"]	f	{}	0	2026-07-09 10:39:18.868583
5d26ed55-ed0b-4e93-8b75-a662a2ff87ce	c3d4e5f6-a7b8-9012-cdef-123456789012	c097e7b0-2609-40bb-b09a-8835006ac2d4	86810773-937b-46fa-986a-8b0620874abe	ظ…ظˆط§ظپظ‚ط©	["ADMIN", "PUBLISHER"]	f	{}	1	2026-07-09 10:39:18.868583
cba4d072-41d4-47f9-b44b-e03ad739d8bd	c3d4e5f6-a7b8-9012-cdef-123456789012	86810773-937b-46fa-986a-8b0620874abe	f7907e63-6098-4a88-b89d-2b8e5452ec53	ظ†ط´ط±	["ADMIN", "PUBLISHER"]	f	{}	2	2026-07-09 10:39:18.868583
\.


--
-- TOC entry 6263 (class 0 OID 68750)
-- Dependencies: 264
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: ssssy
--

COPY public.workflows (id, content_type, name_ar, name_en, description, is_active, created_at, updated_at) FROM stdin;
a1b2c3d4-e5f6-7890-abcd-ef1234567890	ARTICLE	ط³ظٹط± ط§ظ„ط¹ظ…ظ„ ط§ظ„ط§ظپطھط±ط§ط¶ظٹ ظ„ظ„ظ…ظ‚ط§ظ„ط§طھ	Default Article Workflow	ط³ظٹط± ط¹ظ…ظ„ ظ‚ظٹط§ط³ظٹ ظ„ظ„ظ…ظ‚ط§ظ„ط§طھ: ظ…ط³ظˆط¯ط© â†’ ظ…ط±ط§ط¬ط¹ط© â†’ ظ…ظˆط§ظپظ‚ط© â†’ ظ†ط´ط±	t	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
b2c3d4e5-f6a7-8901-bcde-f12345678901	EVENT	ط³ظٹط± ط§ظ„ط¹ظ…ظ„ ط§ظ„ط§ظپطھط±ط§ط¶ظٹ ظ„ظ„ظپط¹ط§ظ„ظٹط§طھ	Default Event Workflow	ط³ظٹط± ط¹ظ…ظ„ ظ‚ظٹط§ط³ظٹ ظ„ظ„ظپط¹ط§ظ„ظٹط§طھ: ظ…ط³ظˆط¯ط© â†’ ظ…ط±ط§ط¬ط¹ط© â†’ ظ…ظˆط§ظپظ‚ط© â†’ ظ†ط´ط±	t	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
c3d4e5f6-a7b8-9012-cdef-123456789012	PAGE	ط³ظٹط± ط§ظ„ط¹ظ…ظ„ ط§ظ„ط§ظپطھط±ط§ط¶ظٹ ظ„ظ„طµظپط­ط§طھ	Default Page Workflow	ط³ظٹط± ط¹ظ…ظ„ ظ‚ظٹط§ط³ظٹ ظ„ظ„طµظپط­ط§طھ: ظ…ط³ظˆط¯ط© â†’ ظ…ط±ط§ط¬ط¹ط© â†’ ظ…ظˆط§ظپظ‚ط© â†’ ظ†ط´ط±	t	2026-07-09 10:39:18.868583	2026-07-09 10:39:18.868583
\.


--
-- TOC entry 5809 (class 2606 OID 68969)
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5548 (class 2606 OID 67926)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5723 (class 2606 OID 68627)
-- Name: board_members board_members_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.board_members
    ADD CONSTRAINT board_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5553 (class 2606 OID 67951)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5555 (class 2606 OID 67953)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 5905 (class 2606 OID 77284)
-- Name: cms_event_log cms_event_log_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.cms_event_log
    ADD CONSTRAINT cms_event_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5916 (class 2606 OID 77322)
-- Name: cms_form_submissions cms_form_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.cms_form_submissions
    ADD CONSTRAINT cms_form_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5910 (class 2606 OID 77302)
-- Name: cms_forms cms_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.cms_forms
    ADD CONSTRAINT cms_forms_pkey PRIMARY KEY (id);


--
-- TOC entry 5912 (class 2606 OID 77304)
-- Name: cms_forms cms_forms_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.cms_forms
    ADD CONSTRAINT cms_forms_slug_key UNIQUE (slug);


--
-- TOC entry 5802 (class 2606 OID 68944)
-- Name: comment_events comment_events_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comment_events
    ADD CONSTRAINT comment_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5713 (class 2606 OID 68583)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 5866 (class 2606 OID 69234)
-- Name: component_presets component_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.component_presets
    ADD CONSTRAINT component_presets_pkey PRIMARY KEY (id);


--
-- TOC entry 5782 (class 2606 OID 68869)
-- Name: component_templates component_templates_component_type_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.component_templates
    ADD CONSTRAINT component_templates_component_type_key UNIQUE (component_type);


--
-- TOC entry 5784 (class 2606 OID 68867)
-- Name: component_templates component_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.component_templates
    ADD CONSTRAINT component_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5626 (class 2606 OID 68230)
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5874 (class 2606 OID 69264)
-- Name: content_approval_log content_approval_log_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_approval_log
    ADD CONSTRAINT content_approval_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5563 (class 2606 OID 67984)
-- Name: content_items content_items_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5565 (class 2606 OID 67986)
-- Name: content_items content_items_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_slug_key UNIQUE (slug);


--
-- TOC entry 5835 (class 2606 OID 69092)
-- Name: content_strings content_strings_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_strings
    ADD CONSTRAINT content_strings_pkey PRIMARY KEY (id);


--
-- TOC entry 5837 (class 2606 OID 69094)
-- Name: content_strings content_strings_string_key_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_strings
    ADD CONSTRAINT content_strings_string_key_key UNIQUE (string_key);


--
-- TOC entry 5574 (class 2606 OID 68011)
-- Name: content_tags content_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_tags
    ADD CONSTRAINT content_tags_pkey PRIMARY KEY (content_id, tag_id);


--
-- TOC entry 5923 (class 2606 OID 77356)
-- Name: content_type_definitions content_type_definitions_name_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_type_definitions
    ADD CONSTRAINT content_type_definitions_name_key UNIQUE (name);


--
-- TOC entry 5925 (class 2606 OID 77354)
-- Name: content_type_definitions content_type_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_type_definitions
    ADD CONSTRAINT content_type_definitions_pkey PRIMARY KEY (id);


--
-- TOC entry 5929 (class 2606 OID 77381)
-- Name: content_type_fields content_type_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_type_fields
    ADD CONSTRAINT content_type_fields_pkey PRIMARY KEY (id);


--
-- TOC entry 5869 (class 2606 OID 69250)
-- Name: content_version_history content_version_history_content_type_content_id_version_num_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_version_history
    ADD CONSTRAINT content_version_history_content_type_content_id_version_num_key UNIQUE (content_type, content_id, version_number);


--
-- TOC entry 5871 (class 2606 OID 69248)
-- Name: content_version_history content_version_history_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_version_history
    ADD CONSTRAINT content_version_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5578 (class 2606 OID 68032)
-- Name: content_versions content_versions_content_id_version_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_content_id_version_key UNIQUE (content_id, version);


--
-- TOC entry 5580 (class 2606 OID 68030)
-- Name: content_versions content_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 5795 (class 2606 OID 68919)
-- Name: crm_contacts crm_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.crm_contacts
    ADD CONSTRAINT crm_contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 5933 (class 2606 OID 77400)
-- Name: dynamic_content_entries dynamic_content_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.dynamic_content_entries
    ADD CONSTRAINT dynamic_content_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5935 (class 2606 OID 77402)
-- Name: dynamic_content_entries dynamic_content_entries_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.dynamic_content_entries
    ADD CONSTRAINT dynamic_content_entries_slug_key UNIQUE (slug);


--
-- TOC entry 5630 (class 2606 OID 68252)
-- Name: email_accounts email_accounts_email_address_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_email_address_key UNIQUE (email_address);


--
-- TOC entry 5632 (class 2606 OID 68248)
-- Name: email_accounts email_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 5634 (class 2606 OID 68250)
-- Name: email_accounts email_accounts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_user_id_key UNIQUE (user_id);


--
-- TOC entry 5636 (class 2606 OID 68254)
-- Name: email_accounts email_accounts_username_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_username_key UNIQUE (username);


--
-- TOC entry 5685 (class 2606 OID 68461)
-- Name: email_aliases email_aliases_alias_address_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_aliases
    ADD CONSTRAINT email_aliases_alias_address_key UNIQUE (alias_address);


--
-- TOC entry 5687 (class 2606 OID 68459)
-- Name: email_aliases email_aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_aliases
    ADD CONSTRAINT email_aliases_pkey PRIMARY KEY (id);


--
-- TOC entry 5655 (class 2606 OID 68347)
-- Name: email_attachments email_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_attachments
    ADD CONSTRAINT email_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5667 (class 2606 OID 68396)
-- Name: email_contact_group_members email_contact_group_members_group_id_contact_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_group_members
    ADD CONSTRAINT email_contact_group_members_group_id_contact_id_key UNIQUE (group_id, contact_id);


--
-- TOC entry 5669 (class 2606 OID 68394)
-- Name: email_contact_group_members email_contact_group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_group_members
    ADD CONSTRAINT email_contact_group_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5663 (class 2606 OID 68382)
-- Name: email_contact_groups email_contact_groups_owner_id_name_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_groups
    ADD CONSTRAINT email_contact_groups_owner_id_name_key UNIQUE (owner_id, name);


--
-- TOC entry 5665 (class 2606 OID 68380)
-- Name: email_contact_groups email_contact_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_groups
    ADD CONSTRAINT email_contact_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5658 (class 2606 OID 68365)
-- Name: email_contacts email_contacts_owner_id_email_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contacts
    ADD CONSTRAINT email_contacts_owner_id_email_key UNIQUE (owner_id, email);


--
-- TOC entry 5660 (class 2606 OID 68363)
-- Name: email_contacts email_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contacts
    ADD CONSTRAINT email_contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 5679 (class 2606 OID 68441)
-- Name: email_distribution_list_members email_distribution_list_members_list_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_list_members
    ADD CONSTRAINT email_distribution_list_members_list_id_user_id_key UNIQUE (list_id, user_id);


--
-- TOC entry 5681 (class 2606 OID 68439)
-- Name: email_distribution_list_members email_distribution_list_members_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_list_members
    ADD CONSTRAINT email_distribution_list_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5673 (class 2606 OID 68421)
-- Name: email_distribution_lists email_distribution_lists_email_address_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_lists
    ADD CONSTRAINT email_distribution_lists_email_address_key UNIQUE (email_address);


--
-- TOC entry 5675 (class 2606 OID 68419)
-- Name: email_distribution_lists email_distribution_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_lists
    ADD CONSTRAINT email_distribution_lists_pkey PRIMARY KEY (id);


--
-- TOC entry 5638 (class 2606 OID 68275)
-- Name: email_folders email_folders_account_id_name_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_folders
    ADD CONSTRAINT email_folders_account_id_name_key UNIQUE (account_id, name);


--
-- TOC entry 5640 (class 2606 OID 68273)
-- Name: email_folders email_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_folders
    ADD CONSTRAINT email_folders_pkey PRIMARY KEY (id);


--
-- TOC entry 5644 (class 2606 OID 68305)
-- Name: email_messages email_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_messages
    ADD CONSTRAINT email_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5752 (class 2606 OID 68715)
-- Name: email_quota_logs email_quota_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_quota_logs
    ADD CONSTRAINT email_quota_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5651 (class 2606 OID 68330)
-- Name: email_recipients email_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT email_recipients_pkey PRIMARY KEY (id);


--
-- TOC entry 5689 (class 2606 OID 68481)
-- Name: email_rules email_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_rules
    ADD CONSTRAINT email_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 5747 (class 2606 OID 68698)
-- Name: email_scheduled_sends email_scheduled_sends_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_scheduled_sends
    ADD CONSTRAINT email_scheduled_sends_pkey PRIMARY KEY (id);


--
-- TOC entry 5788 (class 2606 OID 68892)
-- Name: event_registrations event_registrations_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- TOC entry 5790 (class 2606 OID 68890)
-- Name: event_registrations event_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5954 (class 2606 OID 77752)
-- Name: event_reminder_rules event_reminder_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.event_reminder_rules
    ADD CONSTRAINT event_reminder_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 5605 (class 2606 OID 68173)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 5607 (class 2606 OID 68175)
-- Name: events events_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_slug_key UNIQUE (slug);


--
-- TOC entry 5518 (class 2606 OID 67799)
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- TOC entry 5811 (class 2606 OID 68990)
-- Name: gallery_albums gallery_albums_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_pkey PRIMARY KEY (id);


--
-- TOC entry 5813 (class 2606 OID 68992)
-- Name: gallery_albums gallery_albums_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_slug_key UNIQUE (slug);


--
-- TOC entry 5831 (class 2606 OID 69059)
-- Name: gallery_analytics_events gallery_analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_analytics_events
    ADD CONSTRAINT gallery_analytics_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5819 (class 2606 OID 69013)
-- Name: gallery_images gallery_images_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5824 (class 2606 OID 69037)
-- Name: gallery_share_links gallery_share_links_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_share_links
    ADD CONSTRAINT gallery_share_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5826 (class 2606 OID 69039)
-- Name: gallery_share_links gallery_share_links_token_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_share_links
    ADD CONSTRAINT gallery_share_links_token_key UNIQUE (token);


--
-- TOC entry 5944 (class 2606 OID 77431)
-- Name: installed_plugins installed_plugins_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.installed_plugins
    ADD CONSTRAINT installed_plugins_pkey PRIMARY KEY (id);


--
-- TOC entry 5946 (class 2606 OID 77433)
-- Name: installed_plugins installed_plugins_plugin_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.installed_plugins
    ADD CONSTRAINT installed_plugins_plugin_id_key UNIQUE (plugin_id);


--
-- TOC entry 5624 (class 2606 OID 68213)
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- TOC entry 5618 (class 2606 OID 68194)
-- Name: job_vacancies job_vacancies_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.job_vacancies
    ADD CONSTRAINT job_vacancies_pkey PRIMARY KEY (id);


--
-- TOC entry 5620 (class 2606 OID 68196)
-- Name: job_vacancies job_vacancies_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.job_vacancies
    ADD CONSTRAINT job_vacancies_slug_key UNIQUE (slug);


--
-- TOC entry 5590 (class 2606 OID 68080)
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- TOC entry 5584 (class 2606 OID 68060)
-- Name: media_folders media_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_pkey PRIMARY KEY (id);


--
-- TOC entry 5757 (class 2606 OID 68743)
-- Name: media_thumbnails media_thumbnails_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_thumbnails
    ADD CONSTRAINT media_thumbnails_pkey PRIMARY KEY (id);


--
-- TOC entry 5731 (class 2606 OID 68649)
-- Name: member_profiles member_profiles_membership_number_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_membership_number_key UNIQUE (membership_number);


--
-- TOC entry 5733 (class 2606 OID 68645)
-- Name: member_profiles member_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 5735 (class 2606 OID 68647)
-- Name: member_profiles member_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_user_id_key UNIQUE (user_id);


--
-- TOC entry 5711 (class 2606 OID 68557)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5706 (class 2606 OID 68545)
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- TOC entry 5719 (class 2606 OID 68615)
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- TOC entry 5721 (class 2606 OID 68613)
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- TOC entry 5601 (class 2606 OID 68155)
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- TOC entry 5603 (class 2606 OID 68157)
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- TOC entry 5599 (class 2606 OID 68130)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5882 (class 2606 OID 69302)
-- Name: page_audit_trail page_audit_trail_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_audit_trail
    ADD CONSTRAINT page_audit_trail_pkey PRIMARY KEY (id);


--
-- TOC entry 5704 (class 2606 OID 68529)
-- Name: page_sections page_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5887 (class 2606 OID 69346)
-- Name: page_templates page_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_templates
    ADD CONSTRAINT page_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5885 (class 2606 OID 69323)
-- Name: page_workflow_transitions page_workflow_transitions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_workflow_transitions
    ADD CONSTRAINT page_workflow_transitions_pkey PRIMARY KEY (id);


--
-- TOC entry 5699 (class 2606 OID 68501)
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- TOC entry 5701 (class 2606 OID 68503)
-- Name: pages pages_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_slug_key UNIQUE (slug);


--
-- TOC entry 5525 (class 2606 OID 67862)
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- TOC entry 5527 (class 2606 OID 67860)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5890 (class 2606 OID 69376)
-- Name: preview_tokens preview_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.preview_tokens
    ADD CONSTRAINT preview_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5892 (class 2606 OID 69378)
-- Name: preview_tokens preview_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.preview_tokens
    ADD CONSTRAINT preview_tokens_token_key UNIQUE (token);


--
-- TOC entry 5901 (class 2606 OID 76986)
-- Name: publications publications_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.publications
    ADD CONSTRAINT publications_pkey PRIMARY KEY (id);


--
-- TOC entry 5903 (class 2606 OID 76988)
-- Name: publications publications_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.publications
    ADD CONSTRAINT publications_slug_key UNIQUE (slug);


--
-- TOC entry 5544 (class 2606 OID 67910)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5546 (class 2606 OID 67912)
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- TOC entry 5531 (class 2606 OID 67868)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- TOC entry 5521 (class 2606 OID 67851)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 5523 (class 2606 OID 67849)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5864 (class 2606 OID 69156)
-- Name: sensor_readings sensor_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.sensor_readings
    ADD CONSTRAINT sensor_readings_pkey PRIMARY KEY (id);


--
-- TOC entry 5859 (class 2606 OID 69145)
-- Name: sensors sensors_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.sensors
    ADD CONSTRAINT sensors_pkey PRIMARY KEY (id);


--
-- TOC entry 5738 (class 2606 OID 68667)
-- Name: seo_metadata seo_metadata_entity_type_entity_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.seo_metadata
    ADD CONSTRAINT seo_metadata_entity_type_entity_id_key UNIQUE (entity_type, entity_id);


--
-- TOC entry 5740 (class 2606 OID 68665)
-- Name: seo_metadata seo_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.seo_metadata
    ADD CONSTRAINT seo_metadata_pkey PRIMARY KEY (id);


--
-- TOC entry 5950 (class 2606 OID 77452)
-- Name: site_section_versions site_section_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.site_section_versions
    ADD CONSTRAINT site_section_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 5847 (class 2606 OID 69111)
-- Name: site_sections site_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.site_sections
    ADD CONSTRAINT site_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5849 (class 2606 OID 69113)
-- Name: site_sections site_sections_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.site_sections
    ADD CONSTRAINT site_sections_slug_key UNIQUE (slug);


--
-- TOC entry 5743 (class 2606 OID 68683)
-- Name: system_config system_config_config_key_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_config_key_key UNIQUE (config_key);


--
-- TOC entry 5745 (class 2606 OID 68681)
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- TOC entry 5559 (class 2606 OID 67965)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 5561 (class 2606 OID 67967)
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- TOC entry 5852 (class 2606 OID 69130)
-- Name: theme_settings theme_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.theme_settings
    ADD CONSTRAINT theme_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5854 (class 2606 OID 69132)
-- Name: theme_settings theme_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.theme_settings
    ADD CONSTRAINT theme_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 5878 (class 2606 OID 69285)
-- Name: themes themes_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_pkey PRIMARY KEY (id);


--
-- TOC entry 5952 (class 2606 OID 77454)
-- Name: site_section_versions uq_ssv_section_version; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.site_section_versions
    ADD CONSTRAINT uq_ssv_section_version UNIQUE (section_id, version_number);


--
-- TOC entry 5895 (class 2606 OID 69399)
-- Name: url_redirects url_redirects_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.url_redirects
    ADD CONSTRAINT url_redirects_pkey PRIMARY KEY (id);


--
-- TOC entry 5536 (class 2606 OID 67895)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5538 (class 2606 OID 67891)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5540 (class 2606 OID 67893)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5780 (class 2606 OID 68822)
-- Name: workflow_actions workflow_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_pkey PRIMARY KEY (id);


--
-- TOC entry 5595 (class 2606 OID 68102)
-- Name: workflow_logs workflow_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_logs
    ADD CONSTRAINT workflow_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5764 (class 2606 OID 68775)
-- Name: workflow_states workflow_states_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_states
    ADD CONSTRAINT workflow_states_pkey PRIMARY KEY (id);


--
-- TOC entry 5766 (class 2606 OID 68777)
-- Name: workflow_states workflow_states_workflow_id_name_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_states
    ADD CONSTRAINT workflow_states_workflow_id_name_key UNIQUE (workflow_id, name);


--
-- TOC entry 5771 (class 2606 OID 68795)
-- Name: workflow_transitions workflow_transitions_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_pkey PRIMARY KEY (id);


--
-- TOC entry 5773 (class 2606 OID 68797)
-- Name: workflow_transitions workflow_transitions_workflow_id_from_state_id_to_state_id_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_workflow_id_from_state_id_to_state_id_key UNIQUE (workflow_id, from_state_id, to_state_id);


--
-- TOC entry 5759 (class 2606 OID 68762)
-- Name: workflows workflows_content_type_key; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_content_type_key UNIQUE (content_type);


--
-- TOC entry 5761 (class 2606 OID 68760)
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- TOC entry 5519 (class 1259 OID 67800)
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- TOC entry 5549 (class 1259 OID 67937)
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- TOC entry 5550 (class 1259 OID 67936)
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- TOC entry 5551 (class 1259 OID 67935)
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- TOC entry 5724 (class 1259 OID 68729)
-- Name: idx_board_members_is_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_board_members_is_active ON public.board_members USING btree (is_active);


--
-- TOC entry 5725 (class 1259 OID 69178)
-- Name: idx_board_members_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_board_members_user_id ON public.board_members USING btree (user_id);


--
-- TOC entry 5556 (class 1259 OID 68051)
-- Name: idx_categories_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);


--
-- TOC entry 5906 (class 1259 OID 77286)
-- Name: idx_cms_event_log_actor_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_cms_event_log_actor_id ON public.cms_event_log USING btree (actor_id);


--
-- TOC entry 5907 (class 1259 OID 77285)
-- Name: idx_cms_event_log_event_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_cms_event_log_event_type ON public.cms_event_log USING btree (event_type);


--
-- TOC entry 5908 (class 1259 OID 77287)
-- Name: idx_cms_event_log_occurred_at; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_cms_event_log_occurred_at ON public.cms_event_log USING btree (occurred_at DESC);


--
-- TOC entry 5917 (class 1259 OID 77336)
-- Name: idx_cms_form_submissions_created; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_cms_form_submissions_created ON public.cms_form_submissions USING btree (created_at DESC);


--
-- TOC entry 5918 (class 1259 OID 77337)
-- Name: idx_cms_form_submissions_data_gin; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_cms_form_submissions_data_gin ON public.cms_form_submissions USING gin (data);


--
-- TOC entry 5919 (class 1259 OID 77333)
-- Name: idx_cms_form_submissions_form_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_cms_form_submissions_form_id ON public.cms_form_submissions USING btree (form_id);


--
-- TOC entry 5920 (class 1259 OID 77335)
-- Name: idx_cms_form_submissions_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_cms_form_submissions_status ON public.cms_form_submissions USING btree (status);


--
-- TOC entry 5921 (class 1259 OID 77334)
-- Name: idx_cms_form_submissions_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_cms_form_submissions_user_id ON public.cms_form_submissions USING btree (user_id);


--
-- TOC entry 5913 (class 1259 OID 77311)
-- Name: idx_cms_forms_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_cms_forms_active ON public.cms_forms USING btree (is_active);


--
-- TOC entry 5914 (class 1259 OID 77310)
-- Name: idx_cms_forms_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_cms_forms_slug ON public.cms_forms USING btree (slug);


--
-- TOC entry 5803 (class 1259 OID 69199)
-- Name: idx_comment_events_comment_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comment_events_comment_id ON public.comment_events USING btree (comment_id);


--
-- TOC entry 5804 (class 1259 OID 68956)
-- Name: idx_comment_events_created_at; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comment_events_created_at ON public.comment_events USING btree (created_at);


--
-- TOC entry 5805 (class 1259 OID 69200)
-- Name: idx_comment_events_initiated_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comment_events_initiated_by ON public.comment_events USING btree (initiated_by);


--
-- TOC entry 5806 (class 1259 OID 68955)
-- Name: idx_comment_events_processed; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comment_events_processed ON public.comment_events USING btree (is_processed);


--
-- TOC entry 5807 (class 1259 OID 68957)
-- Name: idx_comment_events_recipients; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comment_events_recipients ON public.comment_events USING gin (recipients);


--
-- TOC entry 5714 (class 1259 OID 69177)
-- Name: idx_comments_approved_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comments_approved_by ON public.comments USING btree (approved_by);


--
-- TOC entry 5715 (class 1259 OID 69176)
-- Name: idx_comments_author_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comments_author_id ON public.comments USING btree (author_id);


--
-- TOC entry 5716 (class 1259 OID 68726)
-- Name: idx_comments_content_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comments_content_id ON public.comments USING btree (content_id);


--
-- TOC entry 5717 (class 1259 OID 68727)
-- Name: idx_comments_parent_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_comments_parent_id ON public.comments USING btree (parent_id);


--
-- TOC entry 5867 (class 1259 OID 69272)
-- Name: idx_component_presets_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_component_presets_type ON public.component_presets USING btree (component_type, is_system);


--
-- TOC entry 5785 (class 1259 OID 68870)
-- Name: idx_component_templates_category; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_component_templates_category ON public.component_templates USING btree (category);


--
-- TOC entry 5786 (class 1259 OID 68871)
-- Name: idx_component_templates_system; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_component_templates_system ON public.component_templates USING btree (is_system);


--
-- TOC entry 5627 (class 1259 OID 68231)
-- Name: idx_contact_submissions_read; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_contact_submissions_read ON public.contact_submissions USING btree (is_read);


--
-- TOC entry 5628 (class 1259 OID 69183)
-- Name: idx_contact_submissions_read_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_contact_submissions_read_by ON public.contact_submissions USING btree (read_by);


--
-- TOC entry 5875 (class 1259 OID 69271)
-- Name: idx_content_approval_log_lookup; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_approval_log_lookup ON public.content_approval_log USING btree (content_type, content_id, created_at DESC);


--
-- TOC entry 5566 (class 1259 OID 68046)
-- Name: idx_content_author; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_author ON public.content_items USING btree (author_id);


--
-- TOC entry 5567 (class 1259 OID 68047)
-- Name: idx_content_category; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_category ON public.content_items USING btree (category_id);


--
-- TOC entry 5568 (class 1259 OID 68049)
-- Name: idx_content_fts; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_fts ON public.content_items USING gin (to_tsvector('simple'::regconfig, (((((COALESCE(title_ar, ''::character varying))::text || ' '::text) || (COALESCE(title_en, ''::character varying))::text) || ' '::text) || COALESCE(excerpt, ''::text))));


--
-- TOC entry 5569 (class 1259 OID 68048)
-- Name: idx_content_published; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_published ON public.content_items USING btree (published_at);


--
-- TOC entry 5570 (class 1259 OID 68043)
-- Name: idx_content_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_slug ON public.content_items USING btree (slug);


--
-- TOC entry 5571 (class 1259 OID 68044)
-- Name: idx_content_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_status ON public.content_items USING btree (status);


--
-- TOC entry 5838 (class 1259 OID 69095)
-- Name: idx_content_strings_group; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_strings_group ON public.content_strings USING btree (string_group);


--
-- TOC entry 5839 (class 1259 OID 69096)
-- Name: idx_content_strings_key; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_strings_key ON public.content_strings USING btree (string_key);


--
-- TOC entry 5575 (class 1259 OID 69167)
-- Name: idx_content_tags_content_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_tags_content_id ON public.content_tags USING btree (content_id);


--
-- TOC entry 5576 (class 1259 OID 69168)
-- Name: idx_content_tags_tag_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_tags_tag_id ON public.content_tags USING btree (tag_id);


--
-- TOC entry 5572 (class 1259 OID 68045)
-- Name: idx_content_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_type ON public.content_items USING btree (content_type);


--
-- TOC entry 5872 (class 1259 OID 69270)
-- Name: idx_content_version_history_lookup; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_version_history_lookup ON public.content_version_history USING btree (content_type, content_id, version_number DESC);


--
-- TOC entry 5581 (class 1259 OID 69169)
-- Name: idx_content_versions_changed_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_versions_changed_by ON public.content_versions USING btree (changed_by);


--
-- TOC entry 5582 (class 1259 OID 68050)
-- Name: idx_content_versions_content; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_content_versions_content ON public.content_versions USING btree (content_id);


--
-- TOC entry 5796 (class 1259 OID 68932)
-- Name: idx_crm_contacts_contact_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_crm_contacts_contact_type ON public.crm_contacts USING btree (contact_type);


--
-- TOC entry 5797 (class 1259 OID 69198)
-- Name: idx_crm_contacts_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_crm_contacts_created_by ON public.crm_contacts USING btree (created_by);


--
-- TOC entry 5798 (class 1259 OID 68930)
-- Name: idx_crm_contacts_email; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_crm_contacts_email ON public.crm_contacts USING btree (email);


--
-- TOC entry 5799 (class 1259 OID 68933)
-- Name: idx_crm_contacts_is_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_crm_contacts_is_active ON public.crm_contacts USING btree (is_active);


--
-- TOC entry 5800 (class 1259 OID 68931)
-- Name: idx_crm_contacts_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_crm_contacts_user_id ON public.crm_contacts USING btree (user_id);


--
-- TOC entry 5926 (class 1259 OID 77368)
-- Name: idx_ctd_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_ctd_active ON public.content_type_definitions USING btree (is_active);


--
-- TOC entry 5927 (class 1259 OID 77367)
-- Name: idx_ctd_name; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_ctd_name ON public.content_type_definitions USING btree (name);


--
-- TOC entry 5930 (class 1259 OID 77387)
-- Name: idx_ctf_type_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_ctf_type_id ON public.content_type_fields USING btree (content_type_id);


--
-- TOC entry 5931 (class 1259 OID 77388)
-- Name: idx_ctf_unique_name; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE UNIQUE INDEX idx_ctf_unique_name ON public.content_type_fields USING btree (content_type_id, field_name);


--
-- TOC entry 5936 (class 1259 OID 77415)
-- Name: idx_dce_author_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_dce_author_id ON public.dynamic_content_entries USING btree (author_id);


--
-- TOC entry 5937 (class 1259 OID 77417)
-- Name: idx_dce_field_data_gin; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_dce_field_data_gin ON public.dynamic_content_entries USING gin (field_data);


--
-- TOC entry 5938 (class 1259 OID 77416)
-- Name: idx_dce_published_at; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_dce_published_at ON public.dynamic_content_entries USING btree (published_at DESC);


--
-- TOC entry 5939 (class 1259 OID 77414)
-- Name: idx_dce_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_dce_status ON public.dynamic_content_entries USING btree (status);


--
-- TOC entry 5940 (class 1259 OID 77413)
-- Name: idx_dce_type_name; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_dce_type_name ON public.dynamic_content_entries USING btree (content_type_name);


--
-- TOC entry 5656 (class 1259 OID 68353)
-- Name: idx_email_attachments_message; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_attachments_message ON public.email_attachments USING btree (message_id);


--
-- TOC entry 5670 (class 1259 OID 69202)
-- Name: idx_email_contact_group_members_contact_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_contact_group_members_contact_id ON public.email_contact_group_members USING btree (contact_id);


--
-- TOC entry 5671 (class 1259 OID 69201)
-- Name: idx_email_contact_group_members_group_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_contact_group_members_group_id ON public.email_contact_group_members USING btree (group_id);


--
-- TOC entry 5661 (class 1259 OID 68371)
-- Name: idx_email_contacts_owner; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_contacts_owner ON public.email_contacts USING btree (owner_id);


--
-- TOC entry 5682 (class 1259 OID 69205)
-- Name: idx_email_distribution_list_members_list_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_distribution_list_members_list_id ON public.email_distribution_list_members USING btree (list_id);


--
-- TOC entry 5683 (class 1259 OID 69206)
-- Name: idx_email_distribution_list_members_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_distribution_list_members_user_id ON public.email_distribution_list_members USING btree (user_id);


--
-- TOC entry 5676 (class 1259 OID 69204)
-- Name: idx_email_distribution_lists_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_distribution_lists_created_by ON public.email_distribution_lists USING btree (created_by);


--
-- TOC entry 5677 (class 1259 OID 69203)
-- Name: idx_email_distribution_lists_moderator_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_distribution_lists_moderator_id ON public.email_distribution_lists USING btree (moderator_id);


--
-- TOC entry 5641 (class 1259 OID 69172)
-- Name: idx_email_folders_account_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_folders_account_id ON public.email_folders USING btree (account_id);


--
-- TOC entry 5642 (class 1259 OID 69173)
-- Name: idx_email_folders_parent_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_folders_parent_id ON public.email_folders USING btree (parent_id);


--
-- TOC entry 5645 (class 1259 OID 68316)
-- Name: idx_email_messages_account_folder; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_messages_account_folder ON public.email_messages USING btree (account_id, folder_id);


--
-- TOC entry 5646 (class 1259 OID 68319)
-- Name: idx_email_messages_drafts; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_messages_drafts ON public.email_messages USING btree (account_id) WHERE (is_draft = true);


--
-- TOC entry 5647 (class 1259 OID 68320)
-- Name: idx_email_messages_fts; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_messages_fts ON public.email_messages USING gin (to_tsvector('english'::regconfig, (((COALESCE(subject, ''::character varying))::text || ' '::text) || COALESCE(body_text, ''::text))));


--
-- TOC entry 5648 (class 1259 OID 68317)
-- Name: idx_email_messages_thread; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_messages_thread ON public.email_messages USING btree (thread_id);


--
-- TOC entry 5649 (class 1259 OID 68318)
-- Name: idx_email_messages_unread; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_messages_unread ON public.email_messages USING btree (account_id, folder_id) WHERE (is_read = false);


--
-- TOC entry 5753 (class 1259 OID 68733)
-- Name: idx_email_quota_logs_account_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_quota_logs_account_id ON public.email_quota_logs USING btree (account_id);


--
-- TOC entry 5754 (class 1259 OID 69186)
-- Name: idx_email_quota_logs_message_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_quota_logs_message_id ON public.email_quota_logs USING btree (message_id);


--
-- TOC entry 5652 (class 1259 OID 68337)
-- Name: idx_email_recipients_address; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_recipients_address ON public.email_recipients USING btree (address);


--
-- TOC entry 5653 (class 1259 OID 68336)
-- Name: idx_email_recipients_message; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_recipients_message ON public.email_recipients USING btree (message_id);


--
-- TOC entry 5690 (class 1259 OID 68487)
-- Name: idx_email_rules_account; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_rules_account ON public.email_rules USING btree (account_id);


--
-- TOC entry 5748 (class 1259 OID 69185)
-- Name: idx_email_scheduled_sends_account_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_scheduled_sends_account_id ON public.email_scheduled_sends USING btree (account_id);


--
-- TOC entry 5749 (class 1259 OID 69184)
-- Name: idx_email_scheduled_sends_message_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_scheduled_sends_message_id ON public.email_scheduled_sends USING btree (message_id);


--
-- TOC entry 5750 (class 1259 OID 68732)
-- Name: idx_email_scheduled_sends_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_email_scheduled_sends_status ON public.email_scheduled_sends USING btree (status, scheduled_at);


--
-- TOC entry 5791 (class 1259 OID 68903)
-- Name: idx_event_registrations_event_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_event_registrations_event_id ON public.event_registrations USING btree (event_id);


--
-- TOC entry 5792 (class 1259 OID 68905)
-- Name: idx_event_registrations_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_event_registrations_status ON public.event_registrations USING btree (status);


--
-- TOC entry 5793 (class 1259 OID 68904)
-- Name: idx_event_registrations_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_event_registrations_user_id ON public.event_registrations USING btree (user_id);


--
-- TOC entry 5608 (class 1259 OID 69181)
-- Name: idx_events_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_events_created_by ON public.events USING btree (created_by);


--
-- TOC entry 5609 (class 1259 OID 68181)
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_events_date ON public.events USING btree (event_date);


--
-- TOC entry 5610 (class 1259 OID 77736)
-- Name: idx_events_featured; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_events_featured ON public.events USING btree (is_featured);


--
-- TOC entry 5611 (class 1259 OID 68182)
-- Name: idx_events_published; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_events_published ON public.events USING btree (is_published);


--
-- TOC entry 5612 (class 1259 OID 77737)
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_events_status ON public.events USING btree (status);


--
-- TOC entry 5613 (class 1259 OID 68183)
-- Name: idx_events_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_events_type ON public.events USING btree (event_type);


--
-- TOC entry 5814 (class 1259 OID 69192)
-- Name: idx_gallery_albums_cover_image_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_albums_cover_image_id ON public.gallery_albums USING btree (cover_image_id);


--
-- TOC entry 5815 (class 1259 OID 69193)
-- Name: idx_gallery_albums_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_albums_created_by ON public.gallery_albums USING btree (created_by);


--
-- TOC entry 5816 (class 1259 OID 69076)
-- Name: idx_gallery_albums_published; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_albums_published ON public.gallery_albums USING btree (is_published, sort_order);


--
-- TOC entry 5817 (class 1259 OID 69075)
-- Name: idx_gallery_albums_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_albums_slug ON public.gallery_albums USING btree (slug);


--
-- TOC entry 5832 (class 1259 OID 69079)
-- Name: idx_gallery_analytics_album; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_analytics_album ON public.gallery_analytics_events USING btree (album_id, event_type);


--
-- TOC entry 5833 (class 1259 OID 69080)
-- Name: idx_gallery_analytics_created; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_analytics_created ON public.gallery_analytics_events USING btree (created_at);


--
-- TOC entry 5820 (class 1259 OID 69077)
-- Name: idx_gallery_images_album; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_images_album ON public.gallery_images USING btree (album_id, sort_order);


--
-- TOC entry 5821 (class 1259 OID 69195)
-- Name: idx_gallery_images_before_media_file_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_images_before_media_file_id ON public.gallery_images USING btree (before_media_file_id);


--
-- TOC entry 5822 (class 1259 OID 69194)
-- Name: idx_gallery_images_media_file_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_images_media_file_id ON public.gallery_images USING btree (media_file_id);


--
-- TOC entry 5827 (class 1259 OID 69196)
-- Name: idx_gallery_share_links_album_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_share_links_album_id ON public.gallery_share_links USING btree (album_id);


--
-- TOC entry 5828 (class 1259 OID 69197)
-- Name: idx_gallery_share_links_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_share_links_created_by ON public.gallery_share_links USING btree (created_by);


--
-- TOC entry 5829 (class 1259 OID 69078)
-- Name: idx_gallery_share_links_token; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_gallery_share_links_token ON public.gallery_share_links USING btree (token);


--
-- TOC entry 5941 (class 1259 OID 77435)
-- Name: idx_installed_plugins_plugin_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_installed_plugins_plugin_id ON public.installed_plugins USING btree (plugin_id);


--
-- TOC entry 5942 (class 1259 OID 77434)
-- Name: idx_installed_plugins_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_installed_plugins_status ON public.installed_plugins USING btree (status);


--
-- TOC entry 5621 (class 1259 OID 68220)
-- Name: idx_job_applications_email; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_job_applications_email ON public.job_applications USING btree (email);


--
-- TOC entry 5622 (class 1259 OID 68219)
-- Name: idx_job_applications_vacancy; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_job_applications_vacancy ON public.job_applications USING btree (job_vacancy_id);


--
-- TOC entry 5614 (class 1259 OID 69182)
-- Name: idx_job_vacancies_created_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_job_vacancies_created_by ON public.job_vacancies USING btree (created_by);


--
-- TOC entry 5615 (class 1259 OID 68203)
-- Name: idx_job_vacancies_deadline; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_job_vacancies_deadline ON public.job_vacancies USING btree (deadline);


--
-- TOC entry 5616 (class 1259 OID 68202)
-- Name: idx_job_vacancies_published; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_job_vacancies_published ON public.job_vacancies USING btree (is_published);


--
-- TOC entry 5585 (class 1259 OID 68091)
-- Name: idx_media_files_folder; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_media_files_folder ON public.media_files USING btree (folder_id);


--
-- TOC entry 5586 (class 1259 OID 69367)
-- Name: idx_media_files_fts; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_media_files_fts ON public.media_files USING gin (fts_index);


--
-- TOC entry 5587 (class 1259 OID 68093)
-- Name: idx_media_files_mime; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_media_files_mime ON public.media_files USING btree (mime_type);


--
-- TOC entry 5588 (class 1259 OID 68092)
-- Name: idx_media_files_user; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_media_files_user ON public.media_files USING btree (user_id);


--
-- TOC entry 5755 (class 1259 OID 68749)
-- Name: idx_media_thumbnails_file; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_media_thumbnails_file ON public.media_thumbnails USING btree (media_file_id);


--
-- TOC entry 5726 (class 1259 OID 68730)
-- Name: idx_member_profiles_is_public; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_member_profiles_is_public ON public.member_profiles USING btree (is_public);


--
-- TOC entry 5727 (class 1259 OID 85481)
-- Name: idx_member_profiles_name_ar; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_member_profiles_name_ar ON public.member_profiles USING btree (name_ar);


--
-- TOC entry 5728 (class 1259 OID 85480)
-- Name: idx_member_profiles_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE UNIQUE INDEX idx_member_profiles_slug ON public.member_profiles USING btree (slug) WHERE (slug IS NOT NULL);


--
-- TOC entry 5729 (class 1259 OID 69179)
-- Name: idx_member_profiles_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_member_profiles_user_id ON public.member_profiles USING btree (user_id);


--
-- TOC entry 5707 (class 1259 OID 68728)
-- Name: idx_menu_items_menu_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_menu_items_menu_id ON public.menu_items USING btree (menu_id);


--
-- TOC entry 5708 (class 1259 OID 69175)
-- Name: idx_menu_items_page_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_menu_items_page_id ON public.menu_items USING btree (page_id);


--
-- TOC entry 5709 (class 1259 OID 69174)
-- Name: idx_menu_items_parent_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_menu_items_parent_id ON public.menu_items USING btree (parent_id);


--
-- TOC entry 5596 (class 1259 OID 68137)
-- Name: idx_notifications_created; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_notifications_created ON public.notifications USING btree (created_at);


--
-- TOC entry 5597 (class 1259 OID 68136)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id, is_read);


--
-- TOC entry 5879 (class 1259 OID 69313)
-- Name: idx_page_audit_page_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_page_audit_page_id ON public.page_audit_trail USING btree (page_id, "timestamp" DESC);


--
-- TOC entry 5880 (class 1259 OID 69314)
-- Name: idx_page_audit_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_page_audit_user_id ON public.page_audit_trail USING btree (user_id);


--
-- TOC entry 5702 (class 1259 OID 68535)
-- Name: idx_page_sections_page_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_page_sections_page_id ON public.page_sections USING btree (page_id);


--
-- TOC entry 5691 (class 1259 OID 69171)
-- Name: idx_pages_author_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_pages_author_id ON public.pages USING btree (author_id);


--
-- TOC entry 5692 (class 1259 OID 69421)
-- Name: idx_pages_deleted_at; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_pages_deleted_at ON public.pages USING btree (deleted_at);


--
-- TOC entry 5693 (class 1259 OID 69170)
-- Name: idx_pages_parent_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_pages_parent_id ON public.pages USING btree (parent_id);


--
-- TOC entry 5694 (class 1259 OID 68537)
-- Name: idx_pages_published_homepage; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_pages_published_homepage ON public.pages USING btree (is_published, is_homepage);


--
-- TOC entry 5695 (class 1259 OID 68536)
-- Name: idx_pages_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_pages_slug ON public.pages USING btree (slug);


--
-- TOC entry 5696 (class 1259 OID 69420)
-- Name: idx_pages_translation_group; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_pages_translation_group ON public.pages USING btree (translation_group_id);


--
-- TOC entry 5697 (class 1259 OID 69419)
-- Name: idx_pages_workflow_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_pages_workflow_status ON public.pages USING btree (workflow_status);


--
-- TOC entry 5888 (class 1259 OID 69389)
-- Name: idx_preview_tokens_token; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_preview_tokens_token ON public.preview_tokens USING btree (token);


--
-- TOC entry 5896 (class 1259 OID 76992)
-- Name: idx_publications_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_publications_active ON public.publications USING btree (is_active);


--
-- TOC entry 5897 (class 1259 OID 76991)
-- Name: idx_publications_category; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_publications_category ON public.publications USING btree (category);


--
-- TOC entry 5898 (class 1259 OID 76989)
-- Name: idx_publications_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_publications_slug ON public.publications USING btree (slug);


--
-- TOC entry 5899 (class 1259 OID 76990)
-- Name: idx_publications_year; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_publications_year ON public.publications USING btree (year);


--
-- TOC entry 5860 (class 1259 OID 69163)
-- Name: idx_readings_recorded_at; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_readings_recorded_at ON public.sensor_readings USING btree (recorded_at);


--
-- TOC entry 5861 (class 1259 OID 69162)
-- Name: idx_readings_sensor_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_readings_sensor_id ON public.sensor_readings USING btree (sensor_id);


--
-- TOC entry 5862 (class 1259 OID 69164)
-- Name: idx_readings_sensor_time; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_readings_sensor_time ON public.sensor_readings USING btree (sensor_id, recorded_at);


--
-- TOC entry 5541 (class 1259 OID 67938)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 5542 (class 1259 OID 67939)
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 5955 (class 1259 OID 77758)
-- Name: idx_reminder_rules_event; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_reminder_rules_event ON public.event_reminder_rules USING btree (event_id);


--
-- TOC entry 5956 (class 1259 OID 77759)
-- Name: idx_reminder_rules_fire_at; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_reminder_rules_fire_at ON public.event_reminder_rules USING btree (fire_at);


--
-- TOC entry 5957 (class 1259 OID 77760)
-- Name: idx_reminder_rules_is_fired; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_reminder_rules_is_fired ON public.event_reminder_rules USING btree (is_fired);


--
-- TOC entry 5958 (class 1259 OID 77761)
-- Name: idx_reminder_rules_pending; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_reminder_rules_pending ON public.event_reminder_rules USING btree (fire_at) WHERE (is_fired = false);


--
-- TOC entry 5528 (class 1259 OID 69166)
-- Name: idx_role_permissions_permission_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);


--
-- TOC entry 5529 (class 1259 OID 69165)
-- Name: idx_role_permissions_role_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);


--
-- TOC entry 5855 (class 1259 OID 69147)
-- Name: idx_sensors_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_sensors_active ON public.sensors USING btree (is_active);


--
-- TOC entry 5856 (class 1259 OID 69148)
-- Name: idx_sensors_alert; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_sensors_alert ON public.sensors USING btree (alert_enabled) WHERE (alert_enabled = true);


--
-- TOC entry 5857 (class 1259 OID 69146)
-- Name: idx_sensors_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_sensors_type ON public.sensors USING btree (sensor_type);


--
-- TOC entry 5736 (class 1259 OID 68731)
-- Name: idx_seo_metadata_entity; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_seo_metadata_entity ON public.seo_metadata USING btree (entity_type, entity_id);


--
-- TOC entry 5840 (class 1259 OID 69114)
-- Name: idx_site_sections_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_site_sections_active ON public.site_sections USING btree (is_active);


--
-- TOC entry 5841 (class 1259 OID 69115)
-- Name: idx_site_sections_component_type; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_site_sections_component_type ON public.site_sections USING btree (component_type);


--
-- TOC entry 5842 (class 1259 OID 69118)
-- Name: idx_site_sections_location; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_site_sections_location ON public.site_sections USING btree (location);


--
-- TOC entry 5843 (class 1259 OID 77440)
-- Name: idx_site_sections_location_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_site_sections_location_status ON public.site_sections USING btree (location, status, is_active, sort_order);


--
-- TOC entry 5844 (class 1259 OID 69116)
-- Name: idx_site_sections_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_site_sections_slug ON public.site_sections USING btree (slug);


--
-- TOC entry 5845 (class 1259 OID 77439)
-- Name: idx_site_sections_status; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_site_sections_status ON public.site_sections USING btree (status);


--
-- TOC entry 5947 (class 1259 OID 77461)
-- Name: idx_ssv_section_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_ssv_section_id ON public.site_section_versions USING btree (section_id);


--
-- TOC entry 5948 (class 1259 OID 77460)
-- Name: idx_ssv_section_version; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_ssv_section_version ON public.site_section_versions USING btree (section_id, version_number DESC);


--
-- TOC entry 5741 (class 1259 OID 69180)
-- Name: idx_system_config_updated_by; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_system_config_updated_by ON public.system_config USING btree (updated_by);


--
-- TOC entry 5557 (class 1259 OID 68052)
-- Name: idx_tags_slug; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_tags_slug ON public.tags USING btree (slug);


--
-- TOC entry 5850 (class 1259 OID 69133)
-- Name: idx_theme_settings_group; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_theme_settings_group ON public.theme_settings USING btree (group_name);


--
-- TOC entry 5876 (class 1259 OID 69291)
-- Name: idx_themes_active; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_themes_active ON public.themes USING btree (is_active);


--
-- TOC entry 5893 (class 1259 OID 69405)
-- Name: idx_url_redirects_from; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_url_redirects_from ON public.url_redirects USING btree (from_path);


--
-- TOC entry 5532 (class 1259 OID 67932)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5533 (class 1259 OID 67934)
-- Name: idx_users_role_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_users_role_id ON public.users USING btree (role_id);


--
-- TOC entry 5534 (class 1259 OID 67933)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 5883 (class 1259 OID 69334)
-- Name: idx_wf_transitions_page; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_wf_transitions_page ON public.page_workflow_transitions USING btree (page_id, "timestamp" DESC);


--
-- TOC entry 5774 (class 1259 OID 69190)
-- Name: idx_workflow_actions_actor_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_actions_actor_id ON public.workflow_actions USING btree (actor_id);


--
-- TOC entry 5775 (class 1259 OID 68851)
-- Name: idx_workflow_actions_content; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_actions_content ON public.workflow_actions USING btree (content_id);


--
-- TOC entry 5776 (class 1259 OID 69188)
-- Name: idx_workflow_actions_from_state_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_actions_from_state_id ON public.workflow_actions USING btree (from_state_id);


--
-- TOC entry 5777 (class 1259 OID 69189)
-- Name: idx_workflow_actions_to_state_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_actions_to_state_id ON public.workflow_actions USING btree (to_state_id);


--
-- TOC entry 5778 (class 1259 OID 68852)
-- Name: idx_workflow_actions_workflow; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_actions_workflow ON public.workflow_actions USING btree (workflow_id);


--
-- TOC entry 5591 (class 1259 OID 68119)
-- Name: idx_workflow_logs_actor; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_logs_actor ON public.workflow_logs USING btree (actor_id);


--
-- TOC entry 5592 (class 1259 OID 69187)
-- Name: idx_workflow_logs_assignee_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_logs_assignee_id ON public.workflow_logs USING btree (assignee_id);


--
-- TOC entry 5593 (class 1259 OID 68118)
-- Name: idx_workflow_logs_content; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_logs_content ON public.workflow_logs USING btree (content_id);


--
-- TOC entry 5762 (class 1259 OID 68848)
-- Name: idx_workflow_states_workflow; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_states_workflow ON public.workflow_states USING btree (workflow_id);


--
-- TOC entry 5767 (class 1259 OID 68850)
-- Name: idx_workflow_transitions_from_state; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_transitions_from_state ON public.workflow_transitions USING btree (from_state_id);


--
-- TOC entry 5768 (class 1259 OID 69191)
-- Name: idx_workflow_transitions_to_state_id; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_transitions_to_state_id ON public.workflow_transitions USING btree (to_state_id);


--
-- TOC entry 5769 (class 1259 OID 68849)
-- Name: idx_workflow_transitions_workflow; Type: INDEX; Schema: public; Owner: ssssy
--

CREATE INDEX idx_workflow_transitions_workflow ON public.workflow_transitions USING btree (workflow_id);


--
-- TOC entry 6038 (class 2606 OID 68970)
-- Name: admin_notifications admin_notifications_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5963 (class 2606 OID 67927)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 6015 (class 2606 OID 68628)
-- Name: board_members board_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.board_members
    ADD CONSTRAINT board_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5964 (class 2606 OID 67954)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 6063 (class 2606 OID 77323)
-- Name: cms_form_submissions cms_form_submissions_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.cms_form_submissions
    ADD CONSTRAINT cms_form_submissions_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.cms_forms(id) ON DELETE CASCADE;


--
-- TOC entry 6064 (class 2606 OID 77328)
-- Name: cms_form_submissions cms_form_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.cms_form_submissions
    ADD CONSTRAINT cms_form_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6062 (class 2606 OID 77305)
-- Name: cms_forms cms_forms_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.cms_forms
    ADD CONSTRAINT cms_forms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6036 (class 2606 OID 68945)
-- Name: comment_events comment_events_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comment_events
    ADD CONSTRAINT comment_events_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- TOC entry 6037 (class 2606 OID 68950)
-- Name: comment_events comment_events_initiated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comment_events
    ADD CONSTRAINT comment_events_initiated_by_fkey FOREIGN KEY (initiated_by) REFERENCES public.users(id);


--
-- TOC entry 6011 (class 2606 OID 68599)
-- Name: comments comments_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- TOC entry 6012 (class 2606 OID 68594)
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- TOC entry 6013 (class 2606 OID 68584)
-- Name: comments comments_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- TOC entry 6014 (class 2606 OID 68589)
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- TOC entry 6050 (class 2606 OID 69235)
-- Name: component_presets component_presets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.component_presets
    ADD CONSTRAINT component_presets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5986 (class 2606 OID 68874)
-- Name: contact_submissions contact_submissions_read_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_read_by_fkey FOREIGN KEY (read_by) REFERENCES public.users(id);


--
-- TOC entry 6052 (class 2606 OID 69265)
-- Name: content_approval_log content_approval_log_action_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_approval_log
    ADD CONSTRAINT content_approval_log_action_by_fkey FOREIGN KEY (action_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5965 (class 2606 OID 67987)
-- Name: content_items content_items_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- TOC entry 5966 (class 2606 OID 68002)
-- Name: content_items content_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 5967 (class 2606 OID 67997)
-- Name: content_items content_items_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.users(id);


--
-- TOC entry 5968 (class 2606 OID 67992)
-- Name: content_items content_items_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- TOC entry 5969 (class 2606 OID 68012)
-- Name: content_tags content_tags_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_tags
    ADD CONSTRAINT content_tags_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- TOC entry 5970 (class 2606 OID 68017)
-- Name: content_tags content_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_tags
    ADD CONSTRAINT content_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- TOC entry 6065 (class 2606 OID 77362)
-- Name: content_type_definitions content_type_definitions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_type_definitions
    ADD CONSTRAINT content_type_definitions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6066 (class 2606 OID 77357)
-- Name: content_type_definitions content_type_definitions_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_type_definitions
    ADD CONSTRAINT content_type_definitions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE SET NULL;


--
-- TOC entry 6067 (class 2606 OID 77382)
-- Name: content_type_fields content_type_fields_content_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_type_fields
    ADD CONSTRAINT content_type_fields_content_type_id_fkey FOREIGN KEY (content_type_id) REFERENCES public.content_type_definitions(id) ON DELETE CASCADE;


--
-- TOC entry 6051 (class 2606 OID 69251)
-- Name: content_version_history content_version_history_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_version_history
    ADD CONSTRAINT content_version_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5971 (class 2606 OID 68038)
-- Name: content_versions content_versions_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- TOC entry 5972 (class 2606 OID 68033)
-- Name: content_versions content_versions_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- TOC entry 6034 (class 2606 OID 68925)
-- Name: crm_contacts crm_contacts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.crm_contacts
    ADD CONSTRAINT crm_contacts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 6035 (class 2606 OID 68920)
-- Name: crm_contacts crm_contacts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.crm_contacts
    ADD CONSTRAINT crm_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6068 (class 2606 OID 77408)
-- Name: dynamic_content_entries dynamic_content_entries_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.dynamic_content_entries
    ADD CONSTRAINT dynamic_content_entries_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6069 (class 2606 OID 77403)
-- Name: dynamic_content_entries dynamic_content_entries_content_type_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.dynamic_content_entries
    ADD CONSTRAINT dynamic_content_entries_content_type_name_fkey FOREIGN KEY (content_type_name) REFERENCES public.content_type_definitions(name) ON DELETE RESTRICT;


--
-- TOC entry 5987 (class 2606 OID 68255)
-- Name: email_accounts email_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_accounts
    ADD CONSTRAINT email_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6002 (class 2606 OID 68462)
-- Name: email_aliases email_aliases_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_aliases
    ADD CONSTRAINT email_aliases_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5993 (class 2606 OID 68348)
-- Name: email_attachments email_attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_attachments
    ADD CONSTRAINT email_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.email_messages(id) ON DELETE CASCADE;


--
-- TOC entry 5996 (class 2606 OID 68402)
-- Name: email_contact_group_members email_contact_group_members_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_group_members
    ADD CONSTRAINT email_contact_group_members_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.email_contacts(id) ON DELETE CASCADE;


--
-- TOC entry 5997 (class 2606 OID 68397)
-- Name: email_contact_group_members email_contact_group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_group_members
    ADD CONSTRAINT email_contact_group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.email_contact_groups(id) ON DELETE CASCADE;


--
-- TOC entry 5995 (class 2606 OID 68383)
-- Name: email_contact_groups email_contact_groups_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contact_groups
    ADD CONSTRAINT email_contact_groups_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5994 (class 2606 OID 68366)
-- Name: email_contacts email_contacts_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_contacts
    ADD CONSTRAINT email_contacts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6000 (class 2606 OID 68442)
-- Name: email_distribution_list_members email_distribution_list_members_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_list_members
    ADD CONSTRAINT email_distribution_list_members_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.email_distribution_lists(id) ON DELETE CASCADE;


--
-- TOC entry 6001 (class 2606 OID 68447)
-- Name: email_distribution_list_members email_distribution_list_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_list_members
    ADD CONSTRAINT email_distribution_list_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5998 (class 2606 OID 68427)
-- Name: email_distribution_lists email_distribution_lists_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_lists
    ADD CONSTRAINT email_distribution_lists_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5999 (class 2606 OID 68422)
-- Name: email_distribution_lists email_distribution_lists_moderator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_distribution_lists
    ADD CONSTRAINT email_distribution_lists_moderator_id_fkey FOREIGN KEY (moderator_id) REFERENCES public.users(id);


--
-- TOC entry 5988 (class 2606 OID 68276)
-- Name: email_folders email_folders_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_folders
    ADD CONSTRAINT email_folders_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5989 (class 2606 OID 68281)
-- Name: email_folders email_folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_folders
    ADD CONSTRAINT email_folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.email_folders(id) ON DELETE CASCADE;


--
-- TOC entry 5990 (class 2606 OID 68306)
-- Name: email_messages email_messages_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_messages
    ADD CONSTRAINT email_messages_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5991 (class 2606 OID 68311)
-- Name: email_messages email_messages_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_messages
    ADD CONSTRAINT email_messages_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.email_folders(id);


--
-- TOC entry 6020 (class 2606 OID 68716)
-- Name: email_quota_logs email_quota_logs_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_quota_logs
    ADD CONSTRAINT email_quota_logs_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 6021 (class 2606 OID 68721)
-- Name: email_quota_logs email_quota_logs_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_quota_logs
    ADD CONSTRAINT email_quota_logs_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.email_messages(id);


--
-- TOC entry 5992 (class 2606 OID 68331)
-- Name: email_recipients email_recipients_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT email_recipients_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.email_messages(id) ON DELETE CASCADE;


--
-- TOC entry 6003 (class 2606 OID 68482)
-- Name: email_rules email_rules_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_rules
    ADD CONSTRAINT email_rules_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 6018 (class 2606 OID 68704)
-- Name: email_scheduled_sends email_scheduled_sends_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_scheduled_sends
    ADD CONSTRAINT email_scheduled_sends_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.email_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 6019 (class 2606 OID 68699)
-- Name: email_scheduled_sends email_scheduled_sends_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.email_scheduled_sends
    ADD CONSTRAINT email_scheduled_sends_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.email_messages(id) ON DELETE CASCADE;


--
-- TOC entry 6032 (class 2606 OID 68893)
-- Name: event_registrations event_registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 6033 (class 2606 OID 68898)
-- Name: event_registrations event_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6071 (class 2606 OID 77753)
-- Name: event_reminder_rules event_reminder_rules_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.event_reminder_rules
    ADD CONSTRAINT event_reminder_rules_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 5983 (class 2606 OID 68176)
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 6070 (class 2606 OID 77455)
-- Name: site_section_versions fk_ssv_section; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.site_section_versions
    ADD CONSTRAINT fk_ssv_section FOREIGN KEY (section_id) REFERENCES public.site_sections(id) ON DELETE CASCADE;


--
-- TOC entry 6039 (class 2606 OID 68993)
-- Name: gallery_albums gallery_albums_cover_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_cover_image_id_fkey FOREIGN KEY (cover_image_id) REFERENCES public.media_files(id) ON DELETE SET NULL;


--
-- TOC entry 6040 (class 2606 OID 68998)
-- Name: gallery_albums gallery_albums_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 6046 (class 2606 OID 69060)
-- Name: gallery_analytics_events gallery_analytics_events_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_analytics_events
    ADD CONSTRAINT gallery_analytics_events_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.gallery_albums(id) ON DELETE CASCADE;


--
-- TOC entry 6047 (class 2606 OID 69065)
-- Name: gallery_analytics_events gallery_analytics_events_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_analytics_events
    ADD CONSTRAINT gallery_analytics_events_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.gallery_images(id) ON DELETE SET NULL;


--
-- TOC entry 6048 (class 2606 OID 69070)
-- Name: gallery_analytics_events gallery_analytics_events_share_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_analytics_events
    ADD CONSTRAINT gallery_analytics_events_share_link_id_fkey FOREIGN KEY (share_link_id) REFERENCES public.gallery_share_links(id) ON DELETE SET NULL;


--
-- TOC entry 6041 (class 2606 OID 69014)
-- Name: gallery_images gallery_images_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.gallery_albums(id) ON DELETE CASCADE;


--
-- TOC entry 6042 (class 2606 OID 69024)
-- Name: gallery_images gallery_images_before_media_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_before_media_file_id_fkey FOREIGN KEY (before_media_file_id) REFERENCES public.media_files(id) ON DELETE SET NULL;


--
-- TOC entry 6043 (class 2606 OID 69019)
-- Name: gallery_images gallery_images_media_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_media_file_id_fkey FOREIGN KEY (media_file_id) REFERENCES public.media_files(id) ON DELETE CASCADE;


--
-- TOC entry 6044 (class 2606 OID 69040)
-- Name: gallery_share_links gallery_share_links_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_share_links
    ADD CONSTRAINT gallery_share_links_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.gallery_albums(id) ON DELETE CASCADE;


--
-- TOC entry 6045 (class 2606 OID 69045)
-- Name: gallery_share_links gallery_share_links_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.gallery_share_links
    ADD CONSTRAINT gallery_share_links_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5985 (class 2606 OID 68214)
-- Name: job_applications job_applications_job_vacancy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_vacancy_id_fkey FOREIGN KEY (job_vacancy_id) REFERENCES public.job_vacancies(id) ON DELETE CASCADE;


--
-- TOC entry 5984 (class 2606 OID 68197)
-- Name: job_vacancies job_vacancies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.job_vacancies
    ADD CONSTRAINT job_vacancies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5975 (class 2606 OID 68081)
-- Name: media_files media_files_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.media_folders(id) ON DELETE SET NULL;


--
-- TOC entry 5976 (class 2606 OID 69352)
-- Name: media_files media_files_uploader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES public.users(id);


--
-- TOC entry 5977 (class 2606 OID 68086)
-- Name: media_files media_files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5973 (class 2606 OID 68061)
-- Name: media_folders media_folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.media_folders(id) ON DELETE SET NULL;


--
-- TOC entry 5974 (class 2606 OID 68066)
-- Name: media_folders media_folders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6022 (class 2606 OID 68744)
-- Name: media_thumbnails media_thumbnails_media_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.media_thumbnails
    ADD CONSTRAINT media_thumbnails_media_file_id_fkey FOREIGN KEY (media_file_id) REFERENCES public.media_files(id) ON DELETE CASCADE;


--
-- TOC entry 6016 (class 2606 OID 68650)
-- Name: member_profiles member_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6008 (class 2606 OID 68558)
-- Name: menu_items menu_items_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- TOC entry 6009 (class 2606 OID 68568)
-- Name: menu_items menu_items_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE SET NULL;


--
-- TOC entry 6010 (class 2606 OID 68563)
-- Name: menu_items menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- TOC entry 5982 (class 2606 OID 68158)
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5981 (class 2606 OID 68131)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 6054 (class 2606 OID 69303)
-- Name: page_audit_trail page_audit_trail_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_audit_trail
    ADD CONSTRAINT page_audit_trail_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id);


--
-- TOC entry 6055 (class 2606 OID 69308)
-- Name: page_audit_trail page_audit_trail_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_audit_trail
    ADD CONSTRAINT page_audit_trail_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 6007 (class 2606 OID 68530)
-- Name: page_sections page_sections_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- TOC entry 6058 (class 2606 OID 69347)
-- Name: page_templates page_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_templates
    ADD CONSTRAINT page_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 6056 (class 2606 OID 69324)
-- Name: page_workflow_transitions page_workflow_transitions_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_workflow_transitions
    ADD CONSTRAINT page_workflow_transitions_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id);


--
-- TOC entry 6057 (class 2606 OID 69329)
-- Name: page_workflow_transitions page_workflow_transitions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.page_workflow_transitions
    ADD CONSTRAINT page_workflow_transitions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 6004 (class 2606 OID 68509)
-- Name: pages pages_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- TOC entry 6005 (class 2606 OID 69414)
-- Name: pages pages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 6006 (class 2606 OID 68504)
-- Name: pages pages_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.pages(id) ON DELETE SET NULL;


--
-- TOC entry 6059 (class 2606 OID 69384)
-- Name: preview_tokens preview_tokens_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.preview_tokens
    ADD CONSTRAINT preview_tokens_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 6060 (class 2606 OID 69379)
-- Name: preview_tokens preview_tokens_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.preview_tokens
    ADD CONSTRAINT preview_tokens_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id);


--
-- TOC entry 5962 (class 2606 OID 67913)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5959 (class 2606 OID 67874)
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- TOC entry 5960 (class 2606 OID 67869)
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 6049 (class 2606 OID 69157)
-- Name: sensor_readings sensor_readings_sensor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.sensor_readings
    ADD CONSTRAINT sensor_readings_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES public.sensors(id) ON DELETE CASCADE;


--
-- TOC entry 6017 (class 2606 OID 68684)
-- Name: system_config system_config_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 6053 (class 2606 OID 69286)
-- Name: themes themes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 6061 (class 2606 OID 69400)
-- Name: url_redirects url_redirects_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.url_redirects
    ADD CONSTRAINT url_redirects_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id);


--
-- TOC entry 5961 (class 2606 OID 67896)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 6027 (class 2606 OID 68843)
-- Name: workflow_actions workflow_actions_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- TOC entry 6028 (class 2606 OID 68823)
-- Name: workflow_actions workflow_actions_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- TOC entry 6029 (class 2606 OID 68833)
-- Name: workflow_actions workflow_actions_from_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_from_state_id_fkey FOREIGN KEY (from_state_id) REFERENCES public.workflow_states(id);


--
-- TOC entry 6030 (class 2606 OID 68838)
-- Name: workflow_actions workflow_actions_to_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_to_state_id_fkey FOREIGN KEY (to_state_id) REFERENCES public.workflow_states(id);


--
-- TOC entry 6031 (class 2606 OID 68828)
-- Name: workflow_actions workflow_actions_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_actions
    ADD CONSTRAINT workflow_actions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- TOC entry 5978 (class 2606 OID 68108)
-- Name: workflow_logs workflow_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_logs
    ADD CONSTRAINT workflow_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- TOC entry 5979 (class 2606 OID 68113)
-- Name: workflow_logs workflow_logs_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_logs
    ADD CONSTRAINT workflow_logs_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- TOC entry 5980 (class 2606 OID 68103)
-- Name: workflow_logs workflow_logs_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_logs
    ADD CONSTRAINT workflow_logs_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;


--
-- TOC entry 6023 (class 2606 OID 68778)
-- Name: workflow_states workflow_states_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_states
    ADD CONSTRAINT workflow_states_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- TOC entry 6024 (class 2606 OID 68803)
-- Name: workflow_transitions workflow_transitions_from_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_from_state_id_fkey FOREIGN KEY (from_state_id) REFERENCES public.workflow_states(id) ON DELETE CASCADE;


--
-- TOC entry 6025 (class 2606 OID 68808)
-- Name: workflow_transitions workflow_transitions_to_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_to_state_id_fkey FOREIGN KEY (to_state_id) REFERENCES public.workflow_states(id) ON DELETE CASCADE;


--
-- TOC entry 6026 (class 2606 OID 68798)
-- Name: workflow_transitions workflow_transitions_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ssssy
--

ALTER TABLE ONLY public.workflow_transitions
    ADD CONSTRAINT workflow_transitions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


-- Completed on 2026-07-30 08:15:06

--
-- PostgreSQL database dump complete
--


