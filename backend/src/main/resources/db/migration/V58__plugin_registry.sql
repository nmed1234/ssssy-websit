-- Phase 5: Plugin SPI — installed plugins registry
CREATE TABLE IF NOT EXISTS installed_plugins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core identity
    plugin_id       VARCHAR(100) NOT NULL UNIQUE,  -- "sssy-doi-resolver"
    plugin_name     VARCHAR(255) NOT NULL,
    version         VARCHAR(50)  NOT NULL,
    author          VARCHAR(255),
    description     TEXT,

    -- Full manifest as JSON (parsed from @CmsPluginMeta or plugin.json)
    manifest_json   JSONB        NOT NULL DEFAULT '{}'::jsonb,

    -- Lifecycle status: INSTALLED | ACTIVE | INACTIVE | ERROR | UNINSTALLED
    status          VARCHAR(20)  NOT NULL DEFAULT 'INSTALLED',

    -- Per-plugin configuration (admin-editable JSON)
    config_json     JSONB        NOT NULL DEFAULT '{}'::jsonb,

    -- Source: CLASSPATH (Spring @Component) | JAR (dropped into plugins dir)
    source          VARCHAR(20)  NOT NULL DEFAULT 'CLASSPATH',

    -- JAR file path relative to plugins directory (null for classpath plugins)
    jar_path        VARCHAR(500),

    -- Error message if last activation failed
    error_message   TEXT,

    -- Timestamps
    installed_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    activated_at    TIMESTAMPTZ,
    deactivated_at  TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_installed_plugins_status    ON installed_plugins(status);
CREATE INDEX IF NOT EXISTS idx_installed_plugins_plugin_id ON installed_plugins(plugin_id);
