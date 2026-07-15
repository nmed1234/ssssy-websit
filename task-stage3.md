# Stage 3 Task Breakdown: Enterprise CMS – Intelligence, Analytics & Scale
## Overview
- Project: Syrian Soil Science Society (SSSSY) Website
- Stage: 3 (Enterprise Intelligence, Analytics & Scale)
- Version: 3.0.0
- Last Updated: 2026-07-10
- Prerequisite: Stage 2 fully implemented

---

## Task Groups

### Group 1: Backend – AI & Intelligent Automation
- [ ] **1.1 AI Content Assistant Backend**
  - [ ] Add `ai_tags_json`, `ai_summary`, `seo_score`, `readability_score` columns to `content_items`
  - [ ] Create `AiContentService` integrating DeepL API (translation) and NLP library (tagging)
  - [ ] `POST /api/admin/content/{id}/ai/suggest-tags` – return tag suggestions
  - [ ] `POST /api/admin/content/{id}/ai/generate-summary` – return AI-generated excerpt
  - [ ] `POST /api/admin/content/{id}/ai/seo-check` – return SEO score + suggestions
  - [ ] `POST /api/admin/content/{id}/ai/translate` – translate body AR↔EN and return draft
  - [ ] `GET /api/admin/content/ai/duplicate-check?slug=...` – semantic similarity check
- [ ] **1.2 Smart Scheduling Backend**
  - [ ] Create `TrafficAnalyticsService` – aggregate hourly view stats and compute best publish windows
  - [ ] `GET /api/admin/content/analytics/best-publish-time` – suggest optimal publish windows
  - [ ] Create `SocialShareService` – OAuth2 integration stubs for Twitter/X, LinkedIn, Facebook
  - [ ] `POST /api/admin/content/{id}/social-share` – post to configured social channels
  - [ ] `GET /api/admin/content/stale` – list articles not updated in > N days with view counts
- [ ] **1.3 AI Moderation Backend**
  - [ ] Add `spam_score FLOAT`, `moderation_status VARCHAR(20)` to `comments`
  - [ ] Create `ModerationService` – classify comment toxicity using configurable NLP endpoint
  - [ ] `POST /api/admin/comments/{id}/moderate` – apply moderation decision
  - [ ] Create `MediaSafetyService` – call Vision API on upload; block flagged images
  - [ ] Add `safety_label VARCHAR(50)`, `safety_score FLOAT` to `media_files`

---

### Group 2: Backend – Analytics Engine
- [ ] **2.1 Analytics Data Collection**
  - [ ] Create `page_views` table: `id, page_path, session_id, user_id, referrer, device_type, country_code, duration_ms, created_at`
  - [ ] Create `content_analytics` table: `content_id, date, views, unique_visitors, avg_duration_ms, bounce_count, share_count`
  - [ ] Create `search_queries` table: `id, query_text, results_count, clicked_result_id, session_id, created_at`
  - [ ] Create `AnalyticsCollectorService` – batch-write analytics events (buffered writes)
  - [ ] `POST /api/public/analytics/pageview` – collect pageview event (anonymous)
  - [ ] `POST /api/public/analytics/event` – collect custom event (scroll, click, share)
  - [ ] `POST /api/public/analytics/search` – log search query + result
- [ ] **2.2 Analytics Query API**
  - [ ] Create `AnalyticsQueryService` with aggregation queries
  - [ ] `GET /api/admin/analytics/dashboard` – KPI summary (today, 7d, 30d)
  - [ ] `GET /api/admin/analytics/content/{id}` – per-content performance over time
  - [ ] `GET /api/admin/analytics/popular?period=7d&limit=10` – top content by views
  - [ ] `GET /api/admin/analytics/audience` – device/country/browser breakdown
  - [ ] `GET /api/admin/analytics/search-terms?period=30d` – top search terms
  - [ ] `GET /api/admin/analytics/workflow-velocity` – editorial velocity metrics
  - [ ] `GET /api/admin/analytics/newsletter/{campaignId}` – newsletter campaign stats
- [ ] **2.3 Real-time Analytics**
  - [ ] SSE endpoint `GET /api/admin/analytics/live` – push active visitor count every 10s
  - [ ] Redis counter for live page visitor tracking
- [ ] **2.4 Reports & Export**
  - [ ] Create `ReportService` with PDF generation (iText/JasperReports)
  - [ ] `POST /api/admin/analytics/reports/generate` – generate PDF report
  - [ ] `GET /api/admin/analytics/reports/export?format=csv&entity=content&period=30d` – CSV/Excel export
  - [ ] Create `ScheduledReportService` – cron-driven report generation + email delivery

---

### Group 3: Backend – Headless CMS & Developer Platform
- [ ] **3.1 GraphQL API**
  - [ ] Add `spring-graphql` dependency to `pom.xml`
  - [ ] Define GraphQL schema for `ContentItem`, `Event`, `Page`, `BoardMember`, `MemberProfile`, `GalleryAlbum`
  - [ ] Create `ContentGraphQLResolver`, `EventGraphQLResolver`, `PageGraphQLResolver`
  - [ ] Add depth-limiting and complexity analysis to prevent expensive queries
  - [ ] `POST /graphql` – public GraphQL endpoint with introspection disabled in prod
- [ ] **3.2 Webhooks**
  - [ ] Create `webhooks` table: `id, name, url, secret, events_json, is_active, created_at`
  - [ ] Create `webhook_deliveries` table: `id, webhook_id, event_type, payload_json, response_code, response_body, created_at`
  - [ ] Create `WebhookService` – dispatch webhook calls asynchronously via @Async
  - [ ] CRUD `GET/POST/PUT/DELETE /api/admin/webhooks`
  - [ ] `GET /api/admin/webhooks/{id}/deliveries` – delivery history with retry
  - [ ] `POST /api/admin/webhooks/{id}/test` – send test payload
- [ ] **3.3 API Keys**
  - [ ] Create `api_keys` table: `id, key_hash, name, scopes_json, rate_limit, last_used_at, expires_at, created_by, created_at`
  - [ ] Create `ApiKeyService` + `ApiKeyAuthFilter` (alongside JWT filter)
  - [ ] CRUD `GET/POST/PUT/DELETE /api/admin/api-keys`
  - [ ] `POST /api/admin/api-keys/{id}/rotate` – rotate key and return new value once

---

### Group 4: Backend – Advanced Security & Compliance
- [ ] **4.1 Field-Level Encryption**
  - [ ] Create `EncryptionService` (AES-256-GCM) for encrypting sensitive field values
  - [ ] Apply to `users.phone`, `users.address`, `crm_contacts.phone`
  - [ ] Add transparent encrypt/decrypt via `@Convert` JPA attribute converter
- [ ] **4.2 GDPR Module**
  - [ ] `GET /api/admin/users/{id}/data-export` – generate ZIP with all user data (JSON)
  - [ ] `DELETE /api/admin/users/{id}/erasure` – GDPR erasure (anonymise PII, keep statistical records)
  - [ ] Create `data_retention_rules` table: `entity_type, max_age_days, action (delete/anonymise)`
  - [ ] Create `DataRetentionService` – nightly cron applying retention rules
- [ ] **4.3 IP Access Control**
  - [ ] Create `ip_access_rules` table: `id, ip_cidr, rule_type (allow/block), path_pattern, created_at`
  - [ ] Create `IpAccessFilter` – check request IP against rules on admin paths
  - [ ] CRUD `GET/POST/PUT/DELETE /api/admin/security/ip-rules`
- [ ] **4.4 Audit Log Improvements**
  - [ ] Add `client_ip`, `user_agent`, `request_id` columns to `audit_logs`
  - [ ] Syslog/HTTP export for SIEM: `POST /api/admin/audit-logs/export?format=syslog&period=24h`

---

### Group 5: Backend – Performance & Scaling
- [ ] **5.1 Full Redis Cache Integration**
  - [ ] Replace `@Cacheable` in-memory with Redis `RedisCacheManager`
  - [ ] Configure TTL per cache: `themeSettings=1h`, `menus=30m`, `siteSections=15m`, `contentList=5m`
  - [ ] Add cache-key versioning to allow instant global cache invalidation
- [ ] **5.2 Database Optimisation**
  - [ ] Create V31+ migration adding composite indexes on high-query columns
  - [ ] Add `EXPLAIN ANALYZE` logging for queries > 100ms via Hibernate interceptor
  - [ ] Implement cursor-based pagination for large datasets (events, content)
- [ ] **5.3 Kubernetes & Infrastructure**
  - [ ] Create `k8s/` directory with `deployment.yaml`, `service.yaml`, `ingress.yaml`, `hpa.yaml`
  - [ ] Add `/actuator/health/readiness` and `/actuator/health/liveness` probes
  - [ ] Create `Dockerfile.prod` with multi-stage build + non-root user
  - [ ] Add `k8s/configmap.yaml` for environment configuration

---

### Group 6: Frontend – Analytics Dashboard
- [ ] **6.1 Analytics Dashboard UI**
  - [ ] Create `admin/analytics/page.tsx` – top-level analytics dashboard
  - [ ] Create `admin/analytics/content/[id]/page.tsx` – per-content analytics detail
  - [ ] Build `components/analytics/KPICard.tsx` – KPI summary cards
  - [ ] Build `components/analytics/LineChart.tsx` – time-series chart (using Recharts or Victory)
  - [ ] Build `components/analytics/HeatmapCalendar.tsx` – content publish heatmap
  - [ ] Build `components/analytics/TopContentTable.tsx` – ranked content table
  - [ ] Build `components/analytics/AudienceBreakdown.tsx` – pie/donut charts for device/country
  - [ ] Build `components/analytics/LiveVisitorWidget.tsx` – SSE-connected live counter
- [ ] **6.2 Newsletter Analytics**
  - [ ] Extend `admin/newsletter/page.tsx` with campaign analytics tab
  - [ ] Build `components/analytics/NewsletterFunnelChart.tsx`
- [ ] **6.3 Report Builder UI**
  - [ ] Create `admin/analytics/reports/page.tsx` – report builder + saved reports list
  - [ ] Build drag-and-drop column/filter selector
  - [ ] Download PDF/CSV buttons

---

### Group 7: Frontend – AI Assistant Integration
- [ ] **7.1 AI Content Panel**
  - [ ] Add "AI Assistant" collapsible panel to content edit page (`admin/content/[id]/page.tsx`)
  - [ ] Build `components/editor/AiAssistantPanel.tsx` with tabs:
    - Suggest Tags (one-click add to tag list)
    - Generate Summary (one-click apply to excerpt)
    - SEO Check (score + list of suggestions)
    - Translate (show AR→EN or EN→AR translation preview)
- [ ] **7.2 AI Moderation Panel**
  - [ ] Add spam/toxicity score badge to `admin/comments/page.tsx` comment list
  - [ ] Add bulk "Auto-moderate" button that approves/rejects based on score threshold
  - [ ] Show moderation history per comment

---

### Group 8: Frontend – Developer Platform UI
- [ ] **8.1 Webhook Manager**
  - [ ] Create `admin/developer/webhooks/page.tsx` – list, create, edit, delete webhooks
  - [ ] Create `admin/developer/webhooks/[id]/page.tsx` – delivery history with retry button
- [ ] **8.2 API Key Manager**
  - [ ] Create `admin/developer/api-keys/page.tsx` – list keys, create with scope selection, rotate, delete
  - [ ] Show masked key value (visible only once on creation)
- [ ] **8.3 Developer Portal**
  - [ ] Create `admin/developer/page.tsx` – landing hub with links to webhooks, API keys, GraphQL playground, OpenAPI docs

---

### Group 9: Frontend – Community Features
- [ ] **9.1 Member Networking**
  - [ ] Create `(public)/members/[slug]/connect` – send connection request
  - [ ] Create `admin/member-connections/page.tsx` – manage connection requests
- [ ] **9.2 Polls & Surveys**
  - [ ] Create `admin/polls/page.tsx` – CRUD for polls with multiple question types
  - [ ] Create public poll rendering component for embedding in page builder
  - [ ] Create `POST /api/public/polls/{id}/vote` backend endpoint
- [ ] **9.3 Forums (MVP)**
  - [ ] Create `forums` + `forum_posts` + `forum_replies` tables (V32 migration)
  - [ ] Create `admin/forums/page.tsx` – moderate forums + categories
  - [ ] Create `(public)/forums/page.tsx` – public forum listing
  - [ ] Create `(public)/forums/[slug]/page.tsx` – topic listing + reply UI

---

### Group 10: Internationalisation Enhancements
- [ ] **10.1 Multi-language Content Model**
  - [ ] Create `content_translations` table: `content_id, language_code, title, excerpt, body, status, translated_by, created_at`
  - [ ] Extend Content API to serve language-specific translations
  - [ ] `GET /api/public/content/{slug}?lang=fr` – return translation if available, fallback to AR/EN
- [ ] **10.2 i18n Admin UI**
  - [ ] Extend content-strings system to cover all admin UI labels
  - [ ] Create `admin/i18n/page.tsx` – export/import translations (JSON/XLIFF format)
  - [ ] Add language switcher to admin header

---

### Group 11: Testing & Quality
- [ ] **11.1 Backend Unit Tests**
  - [ ] `AiContentServiceTest` – mock AI API calls, test suggestion logic
  - [ ] `AnalyticsQueryServiceTest` – verify aggregation queries with in-memory H2
  - [ ] `WebhookServiceTest` – verify dispatch, retry logic, and failure handling
  - [ ] `DataRetentionServiceTest` – verify correct records are cleaned up
  - [ ] `ApiKeyAuthFilterTest` – verify key validation, scope checking, rate limiting
- [ ] **11.2 Integration Tests**
  - [ ] GraphQL API integration test – query all resolvers with test data
  - [ ] Analytics pipeline integration test – simulate pageview events and verify aggregates
  - [ ] GDPR erasure integration test – verify all PII is removed and audit record retained
- [ ] **11.3 Frontend Tests**
  - [ ] Cypress E2E: AI assistant flow (edit content → get tag suggestions → apply)
  - [ ] Cypress E2E: Analytics dashboard loads with correct KPIs
  - [ ] Cypress E2E: Webhook create → deliver → view delivery history
  - [ ] Jest: AnalyticsChart component snapshot tests
- [ ] **11.4 Performance Tests**
  - [ ] k6 load test: 500 concurrent users on public pages
  - [ ] k6 load test: Analytics dashboard under 50 concurrent admin users
  - [ ] Database benchmark: verify all query paths use indexes (no seq-scan on large tables)

---

## Timeline Estimates
| Group | Effort | Priority |
|-------|--------|----------|
| Group 1 (AI) | 3–4 weeks | High |
| Group 2 (Analytics) | 3–4 weeks | High |
| Group 3 (Developer Platform) | 2–3 weeks | Medium |
| Group 4 (Security) | 1–2 weeks | High |
| Group 5 (Performance) | 1–2 weeks | Medium |
| Group 6 (Analytics UI) | 2–3 weeks | High |
| Group 7 (AI UI) | 1–2 weeks | Medium |
| Group 8 (Dev Platform UI) | 1–2 weeks | Low |
| Group 9 (Community) | 3–4 weeks | Low |
| Group 10 (i18n) | 2–3 weeks | Medium |
| Group 11 (Testing) | 2–3 weeks | High |
| **Total** | **~21–32 weeks** | |
