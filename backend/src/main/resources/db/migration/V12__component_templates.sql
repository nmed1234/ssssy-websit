CREATE TABLE component_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    component_type VARCHAR(100) NOT NULL UNIQUE,
    thumbnail_url VARCHAR(500),
    default_config JSONB NOT NULL DEFAULT '{}',
    default_data JSONB NOT NULL DEFAULT '{}',
    default_styling JSONB NOT NULL DEFAULT '{}',
    is_system BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_component_templates_category ON component_templates(category);
CREATE INDEX idx_component_templates_system ON component_templates(is_system);
