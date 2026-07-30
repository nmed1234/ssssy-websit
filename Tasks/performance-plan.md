# Site Performance Improvement Plan

## Top-Level Overview

**Goal**: Maximize response speed and perceived performance of the Soil Science Society of Syria website across backend data serving, frontend page rendering, and infrastructure delivery.

**Scope**: This plan covers 8 independent sub-tasks spanning Backend JVM tuning, database query optimization, Redis caching hardening, frontend Server-Side Rendering migration, data-fetching modernization, image/asset optimization, HTTP compression and caching headers, and async job processing.

**Approach**: Each sub-task is surgical — minimal changes to what exists, no architectural rewrites. All work builds on the already-wired Redis, React Query, and HikariCP stack that is present but under-configured.

**Key Findings** (from codebase audit):
- All public frontend pages are Client Components — no SSR/SSG, all data fetched after JS loads in browser
- HikariCP connection pool has no explicit sizing (running at JVM defaults)
- No custom `AsyncExecutor` bean — `@Async` uses Spring's default unbounded simple executor
- Redis caching must work with OR without Redis present — graceful fallback to `ConcurrentMapCacheManager` when no Redis host is configured; no Spring profile required
- Homepage (`public/page.tsx`) uses manual `useState + useEffect` instead of React Query
- Nginx gzip is enabled but `Cache-Control` headers for the Next.js static `/_next/static/` assets are not set
- `next.config.mjs` has no `compress` toggle or `experimental.optimizeCss` set
- Provider tree in `providers.tsx` is 7 levels deep with no memoization strategy

**User Decisions (confirmed)**:
- Redis: App must work gracefully with or without Redis — no profile dependency
- ISR windows: 60s for list pages, 300s for detail pages
- Sub-Task 4 scope: ALL public pages converted to Server Components

---

## Sub-Task 1 — Backend: HikariCP & Async Executor Tuning

**Status**: `[ ] pending`

**Intent**  
The application relies on JVM defaults for both the database connection pool (HikariCP, embedded in Spring Boot) and the `@Async` thread pool. Under even moderate load these defaults become bottlenecks: HikariCP defaults to 10 max connections and the default `SimpleAsyncTaskExecutor` creates a new thread per task. Explicit sizing aligned to PostgreSQL's max_connections and the server's CPU count will allow the backend to serve more concurrent requests without thread starvation.

**Expected Outcomes**
- `application.yml` gains explicit `spring.datasource.hikari.*` settings (min-idle, max-pool-size, connection-timeout, idle-timeout, max-lifetime)
- A new `AsyncConfig.java` bean provides a named `ThreadPoolTaskExecutor` for all `@Async` tasks
- `SsssyApplication.java` (or the executor config) sets `corePoolSize`, `maxPoolSize`, and `queueCapacity` derived from available CPU cores
- No change to business logic — only configuration and one new config class

**Todo List**
1. Add HikariCP tuning block to `application.yml` under `spring.datasource.hikari` with values: `minimum-idle: 5`, `maximum-pool-size: 20`, `connection-timeout: 30000`, `idle-timeout: 600000`, `max-lifetime: 1800000`, `pool-name: SsssyHikariPool`
2. Create `backend/src/main/java/org/ssssy/backend/config/AsyncConfig.java` implementing `AsyncConfigurer`, defining a `ThreadPoolTaskExecutor` with `corePoolSize: 4`, `maxPoolSize: 16`, `queueCapacity: 200`, `threadNamePrefix: ssssy-async-`, and `CallerRunsPolicy` rejection handler
3. Annotate `@Async` methods that use the new executor by name (email sending in `WorkflowService`, `PageWorkflowEmailService`, `FormNotificationListener`, `MemberSubmissionNotificationListener`)
4. Add matching `spring.datasource.hikari.*` block to `application-dev.yml` with reduced sizes (min-idle 2, max-pool-size 5) appropriate for local development

**Relevant Context**
- `backend/src/main/resources/application.yml` (lines 14–18) — datasource block to extend
- `backend/src/main/java/org/ssssy/backend/service/WorkflowService.java` — `@Async` email method line 346
- `backend/src/main/java/org/ssssy/backend/service/PageWorkflowEmailService.java` — `@Async` line 52
- `backend/src/main/java/org/ssssy/backend/SsssyApplication.java` — `@EnableAsync` entry point

---

## Sub-Task 2 — Backend: Redis Cache Hardening & Always-On Activation

**Status**: `[ ] pending`

**Intent**  
The Redis `CacheManager` bean is only active when the `redis` Spring profile is set. If the profile is absent, the app silently falls back to `ConcurrentMapCacheManager` which is in-process, unbounded, and not shared between instances. The plan is to make Redis the unconditional cache manager when a Redis host is configured, add per-cache TTL differentiation (short TTL for dynamic data, long TTL for near-static data), and enable Redis connection pooling (Lettuce pool). This ensures every environment benefits from distributed caching without profile management overhead.

**Expected Outcomes**
- `CacheConfig.java` is rewritten to use Redis unconditionally when `REDIS_HOST` is set, with a graceful fallback to `ConcurrentMapCacheManager` only in dev when no Redis is present
- Per-cache TTL map: `systemConfig/themeSettings/siteSections/contentStrings` → 4 hours; `publicContent/events/jobVacancies` → 15 minutes; `categories` → 2 hours
- Lettuce connection pool enabled in `application.yml` (`spring.data.redis.lettuce.pool.*`)
- `application.yml` gains a `spring.cache.redis.time-to-live` default as fallback
- Cache key serializer set to `StringRedisSerializer` (human-readable keys for debugging)

**Todo List**
1. Update `CacheConfig.java`: remove `@Profile` annotations, detect Redis availability via `RedisConnectionFactory` conditional, build `RedisCacheManager` with a `Map<String, RedisCacheConfiguration>` per-cache TTL configuration
2. Add Lettuce pool config to `application.yml` under `spring.data.redis.lettuce.pool`: `min-idle: 2`, `max-idle: 8`, `max-active: 16`, `max-wait: -1ms`
3. Configure `GenericJackson2JsonRedisSerializer` as value serializer on `RedisTemplate` so cached objects are JSON (not Java-serialized bytes)
4. Add a `RedisCacheManagerBuilderCustomizer` that sets `StringRedisSerializer` for keys
5. Verify all existing `@Cacheable` / `@CacheEvict` service annotations remain unchanged

**Relevant Context**
- `backend/src/main/java/org/ssssy/backend/config/CacheConfig.java` (lines 1–38) — full rewrite target
- `backend/src/main/resources/application.yml` (lines 8–12) — Redis connection block
- Services with caching: `SystemConfigService`, `ThemeSettingService`, `SiteSectionService`, `ContentStringService`, `GalleryService`

---

## Sub-Task 3 — Backend: Database Query Optimization (@EntityGraph & Projections)

**Status**: `[ ] pending`

**Intent**  
Public-facing API endpoints load content pages, events, and articles. Each entity has `@ManyToOne(LAZY)` relationships that are accessed during DTO mapping. Without `@EntityGraph`, each related entity triggers a separate SELECT (N+1 problem). Adding targeted `@EntityGraph` definitions to the repositories used by public list/detail endpoints eliminates these extra round-trips. Where full entity hydration is not needed (e.g., list pages showing title + slug + thumbnail), Spring Data Projections (interfaces) return only required columns.

**Expected Outcomes**
- `ContentItemRepository` gains named `@EntityGraph` for the public list query that eagerly joins `author` and `category` in one SQL
- `PageRepository` gains `@EntityGraph` for slug-based lookup that joins `author` in one SQL
- At least one Spring Data Projection interface for the "card" representation of ContentItem (id, titleEn, titleAr, slug, thumbnailUrl, publishedAt, category name) to power list endpoints
- No change to existing API response shape — DTO mapping already handles partial data
- SQL query count on `/api/public/content` drops by ≥ 50% for a page of 10 items

**Todo List**
1. Open `ContentItemRepository.java` and identify the list-by-type query; annotate it with `@EntityGraph(attributePaths = {"author", "category", "tags"})` 
2. Open `PageRepository.java` and annotate `findBySlug` with `@EntityGraph(attributePaths = {"author", "parent"})`
3. Create `ContentItemCardProjection.java` interface in `model/dto` with getters for the fields needed in list views
4. Add an overloaded repository method `findPublishedByContentType(String type, Pageable pageable, Class<T> type)` that accepts a projection class
5. Enable Hibernate `spring.jpa.properties.hibernate.jdbc.batch_size: 25` and `order_inserts/order_updates: true` in `application.yml` for batch write efficiency
6. Add `spring.jpa.properties.hibernate.generate_statistics: false` (ensure it is off in prod) and enable in dev profile only for query count validation

**Relevant Context**
- `backend/src/main/java/org/ssssy/backend/repository/ContentItemRepository.java`
- `backend/src/main/java/org/ssssy/backend/repository/PageRepository.java`
- `backend/src/main/java/org/ssssy/backend/service/ContentService.java` — calls repository list methods
- `backend/src/main/resources/application.yml` lines 20–27 — JPA properties block

---

## Sub-Task 4 — Frontend: Convert Public Pages to Server Components with ISR

**Status**: `[ ] pending`

**Intent**  
Every public-facing page (`/news`, `/events`, `/jobs`, `/members`, `/publications`, `/[slug]`) is currently a `"use client"` component. This means the HTML returned to the browser is a blank shell; data is fetched client-side after JavaScript hydrates. Converting these pages to React Server Components (RSC) means the server returns fully-rendered HTML with data embedded. ISR (Incremental Static Regeneration) with a short `revalidate` window combines static-site speed with fresh data. This is the highest-impact single change for perceived load time and SEO.

**Expected Outcomes**
- Each public list page (`/news/page.tsx`, `/events/page.tsx`, `/jobs/page.tsx`, `/members/page.tsx`, `/publications/page.tsx`) becomes a Server Component with `export const revalidate = 60` (60-second ISR)
- Each public detail page (`/news/[slug]/page.tsx`, `/events/[slug]/page.tsx`, `/jobs/[slug]/page.tsx`, `/members/[slug]/page.tsx`) becomes a Server Component with `export const revalidate = 300` (5-minute ISR) plus `generateStaticParams` for top-N items
- Interactive sub-sections (comment forms, registration buttons, auth state) are extracted into small `"use client"` leaf components
- `generateMetadata` functions added to all detail pages for dynamic `<title>` and `<meta>` tags using the fetched content
- The public layout file gains `export const dynamic = 'force-static'` for purely static pages (About, Contact)

**Todo List**
1. Create a server-side API helper `frontend/src/lib/server-api.ts` that uses `fetch` with `{ next: { revalidate } }` options (not axios, which is client-only) for Server Component data fetching
2. Convert `/news/page.tsx`: remove `"use client"`, `useState`, `useEffect`; call `server-api` directly in the component body; add `export const revalidate = 60`
3. Convert `/events/page.tsx` same way with `revalidate = 60`
4. Convert `/jobs/page.tsx` same way with `revalidate = 60`
5. Convert `/members/page.tsx` same way with `revalidate = 120`
6. Convert `/publications/page.tsx` same way with `revalidate = 120`
7. Convert each detail page (`/news/[slug]`, `/events/[slug]`, `/jobs/[slug]`, `/members/[slug]`): add `generateStaticParams` fetching top-20 slugs, add `generateMetadata`, add `revalidate = 300`
8. Extract any interactive elements (EventRegistrationButton, CommentSection, auth-gated elements) into new `"use client"` leaf components that receive server-fetched data as props
9. For the homepage (`/page.tsx`): replace `useState + useEffect` blocks with `Promise.all([...server-api calls...])` in an async server component body

**Relevant Context**
- `frontend/src/app/(public)/page.tsx` — homepage, manual fetch pattern lines 45–78
- `frontend/src/app/(public)/news/page.tsx`, `events/page.tsx`, `jobs/page.tsx`, `members/page.tsx`, `publications/page.tsx`
- `frontend/src/lib/api.ts` — client-side axios instance (NOT usable in server components)
- `frontend/next.config.mjs` — already has `output: 'standalone'`; ISR is fully supported

---

## Sub-Task 5 — Frontend: React Query Configuration & Homepage Data Fetching

**Status**: `[ ] pending`

**Intent**  
For pages that must remain Client Components (admin pages, authenticated views, interactive public features), the React Query `QueryClient` instance in `providers.tsx` has no explicit `defaultOptions` set — no stale time, no retry count, no garbage collection window. This means every component mount triggers a network request even if the data was fetched 2 seconds ago. Setting sensible `defaultOptions` globally and migrating the homepage's manual `useEffect` fetches to `useQuery` hooks will eliminate redundant requests and improve perceived navigation speed.

**Expected Outcomes**
- `providers.tsx` `QueryClient` is instantiated with `defaultOptions`: `staleTime: 30_000` (30 s), `gcTime: 300_000` (5 min), `retry: 1`, `refetchOnWindowFocus: false`
- Homepage Client Component (the remaining interactive shell after Sub-Task 4) uses `useQuery` for any client-fetched data instead of `useState + useEffect`
- `queryKey` factory functions created in `frontend/src/lib/query-keys.ts` for type-safe, consistent cache keys across the app
- React Query DevTools added to `providers.tsx` (dev-only, lazy-loaded with `dynamic(() => import(...))`  and `ssr: false`)

**Todo List**
1. Update `providers.tsx`: replace `new QueryClient()` with `new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, gcTime: 300_000, retry: 1, refetchOnWindowFocus: false } } })`
2. Create `frontend/src/lib/query-keys.ts` exporting a `queryKeys` object with keys for `news`, `events`, `jobs`, `members`, `publications`, `content`, `systemConfig`, `themeSettings`, `siteSections`
3. For any remaining client-side data fetches in the homepage interactive shell, replace `useState + useEffect + api.get()` with `useQuery({ queryKey: queryKeys.news.list(), queryFn: () => getPublishedContent(...) })`
4. Add React Query DevTools: `import dynamic from 'next/dynamic'` in `providers.tsx`, lazy load `@tanstack/react-query-devtools` with `{ ssr: false }`, render only when `process.env.NODE_ENV === 'development'`

**Relevant Context**
- `frontend/src/app/providers.tsx` (lines 13–34) — QueryClient instantiation
- `frontend/src/app/(public)/page.tsx` (lines 45–78) — manual useEffect fetches to migrate
- `frontend/package.json` — `@tanstack/react-query@5.40.0` and `@tanstack/react-query-devtools` already available

---

## Sub-Task 6 — Frontend: Next.js Image Optimization & Asset Pipeline

**Status**: `[ ] pending`

**Intent**  
Several key visual components (`HeroSection.tsx`, `HeroCarouselSection.tsx`) use raw `<img>` tags or CSS `background-image` instead of Next.js `<Image>` component. The `<Image>` component applies automatic WebP/AVIF conversion, lazy loading, correct `sizes` attributes, and blur placeholders. Additionally, `next.config.mjs` can enable `experimental.optimizeCss` (critters inline critical CSS) and configure image format priority. This sub-task also adds `<link rel="preconnect">` for external font origins in `layout.tsx`.

**Expected Outcomes**
- `HeroSection.tsx` replaces `<img>` / CSS background with `<Image>` component with proper `priority`, `sizes`, and `fill` or explicit `width`/`height`
- `HeroCarouselSection.tsx` same treatment, with `priority` on the first slide only
- `PublicationsCarouselSection.tsx` uses `<Image>` for publication cover thumbnails
- `next.config.mjs` gains `images.formats: ['image/avif', 'image/webp']` and `images.minimumCacheTTL: 86400`
- Root `layout.tsx` gains `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous">` in the `<head>`
- `fonts.ts` sets `preload: true` (it is currently `false`; this is safe now that font domains are in the CSP)

**Todo List**
1. Add `images.formats: ['image/avif', 'image/webp']` and `images.minimumCacheTTL: 86400` to `next.config.mjs` images block
2. In `HeroSection.tsx`: replace raw `<img>` with `next/image` `<Image>`, add `priority={true}`, `sizes="100vw"`, `fill` with `object-fit: cover` via className
3. In `HeroCarouselSection.tsx`: wrap each slide image in `<Image>`, `priority={index === 0}` (only first preloaded), `sizes="100vw"`
4. In `PublicationsCarouselSection.tsx`: replace thumbnail `<img>` with `<Image>`, `width={200} height={280}`, `loading="lazy"`
5. Update `frontend/src/app/layout.tsx` to add preconnect links for Google Fonts in metadata or directly in the `<head>` section
6. Set `preload: true` in `frontend/src/lib/fonts.ts` Almarai config
7. Audit `BlockRenderer.tsx` (page-builder) for any raw `<img>` tags that could be replaced with `<Image>` where dimensions are known

**Relevant Context**
- `frontend/src/components/sections/HeroSection.tsx`
- `frontend/src/components/sections/HeroCarouselSection.tsx`
- `frontend/src/components/sections/PublicationsCarouselSection.tsx`
- `frontend/src/components/page-builder/BlockRenderer.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/lib/fonts.ts` (line 18 — `preload: false`)
- `frontend/next.config.mjs` (lines 24–62 — images block)

---

## Sub-Task 7 — Infrastructure: Nginx Caching Headers & HTTP/2 Push

**Status**: `[ ] pending`

**Intent**  
Nginx in production proxies both the Next.js frontend and the Spring Boot API. Currently, static Next.js assets (`/_next/static/`) have no explicit `Cache-Control` header set at the Nginx level — the browser decides. Next.js filenames include content hashes, so these assets are immutable and should be cached for 1 year. API responses also lack cache hints. This sub-task adds proper `Cache-Control` headers per location block, ensures gzip is on for JSON/JS, and upgrades the upstream connections to `keepalive` with HTTP/1.1 (already started but not complete for frontend).

**Expected Outcomes**
- `/_next/static/` location block: `Cache-Control: public, max-age=31536000, immutable`
- `/` (Next.js HTML pages): `Cache-Control: no-cache` (forces revalidation, respects ISR ETags)
- `/api/public/` responses: `Cache-Control: public, max-age=30, stale-while-revalidate=60` via proxy header
- All `/_next/image` responses forwarded with original Cache-Control from Next.js image optimizer
- Upstream `keepalive` for frontend confirmed at 16, for backend at 32
- Nginx worker_processes set to `auto` (already) and `worker_rlimit_nofile: 65535` added
- Gzip `vary: Accept-Encoding` header present (prevents cache poisoning on CDN)

**Todo List**
1. Open `docker-compose.prod.yml` Nginx inline config block and add a `location /_next/static/` block with `add_header Cache-Control "public, max-age=31536000, immutable"` and `add_header Vary Accept-Encoding`
2. Add `location = /` and `location ~* \.html$` block: `add_header Cache-Control "no-cache"`
3. Add `add_header Vary Accept-Encoding` to the gzip section
4. Verify `keepalive_requests` and `keepalive_timeout` are set on upstreams
5. Add `worker_rlimit_nofile 65535;` to the top-level nginx.conf block and `worker_connections 4096;`
6. Add `gzip_static on;` so pre-compressed `.gz` files are served directly when present
7. For the Spring Boot API location block, add `proxy_cache_valid 200 30s;` with a small cache zone for public GET endpoints (define `proxy_cache_path` and `proxy_cache_key` using `$request_uri`)

**Relevant Context**
- `docker-compose.prod.yml` — Nginx configuration inline (lines 10–171)
- `nginx/nginx.conf` (lines 18–33) — performance and gzip settings already present

---

## Sub-Task 8 — Backend: Response Compression & HTTP Cache Headers on API

**Status**: `[ ] pending`

**Intent**  
The Spring Boot API returns JSON responses with no compression and no cache-control headers. Enabling Spring's built-in GZIP compression for API responses reduces payload size by 60–80% for list endpoints. Adding `Cache-Control` headers to public read-only endpoints (events list, content list, board members) enables both Nginx proxy caching (Sub-Task 7) and browser caching, reducing redundant requests. `ETag` support (already available in Spring via `ShallowEtagHeaderFilter`) enables conditional requests so unchanged responses return 304 Not Modified with no body.

**Expected Outcomes**
- `application.yml` gains `server.compression.*` block: `enabled: true`, `mime-types: application/json,application/xml,text/html,text/plain`, `min-response-size: 1024`
- A new `HttpCacheFilter.java` (or `@ControllerAdvice` method) adds `Cache-Control: public, max-age=30, stale-while-revalidate=60` to all `GET /api/public/**` responses
- A `ShallowEtagHeaderFilter` bean is registered in `WebConfig.java` so all responses get ETag headers and conditional `If-None-Match` requests return 304
- Private/authenticated endpoints (`/api/admin/**`, `/api/auth/**`) get `Cache-Control: no-store` to prevent caching of sensitive data
- Response size for a 10-item content list drops by ≥ 50% in bytes

**Todo List**
1. Add to `application.yml` under `server`:
   ```yaml
   compression:
     enabled: true
     mime-types: application/json,application/xml,text/html,text/plain,text/css,application/javascript
     min-response-size: 1024
   ```
2. Register `ShallowEtagHeaderFilter` bean in `WebConfig.java` (one `@Bean` method returning `new ShallowEtagHeaderFilter()`)
3. Create `backend/src/main/java/org/ssssy/backend/filter/CacheControlFilter.java` implementing `OncePerRequestFilter`:
   - For `GET /api/public/**`: add `Cache-Control: public, max-age=30, stale-while-revalidate=60`
   - For `GET /api/admin/**` and `/api/auth/**`: add `Cache-Control: no-store, no-cache`
   - Register it in `SecurityConfig.java` before the JWT filter
4. Verify `ShallowEtagHeaderFilter` + `Cache-Control` headers work together (ETag takes precedence for conditional requests)
5. Test with `curl -I http://localhost:8080/api/public/events/upcoming` to confirm `Content-Encoding: gzip`, `ETag`, and `Cache-Control` are present

**Relevant Context**
- `backend/src/main/resources/application.yml` (lines 1–3) — server block
- `backend/src/main/java/org/ssssy/backend/config/WebConfig.java` — CORS and config bean location
- `backend/src/main/java/org/ssssy/backend/security/SecurityConfig.java` (lines 65–68) — filter chain order
- `backend/src/main/java/org/ssssy/backend/security/RateLimitFilter.java` — reference for `OncePerRequestFilter` pattern

---

## Implementation Order

The sub-tasks should be implemented in this sequence to minimize integration risk:

```
1 → 2 → 3    (Backend: config → cache → queries)
      ↓
4 → 5 → 6    (Frontend: SSR → React Query → Images)
      ↓
7 → 8        (Infrastructure: Nginx headers → API compression)
```

Sub-tasks 1–3 are independent of 4–6. Sub-tasks 7 and 8 should be last as they depend on the API and frontend producing the right headers.

## Validation Checklist

After all sub-tasks are complete, validate with:
- [ ] `cd backend && mvn clean compile` — no compilation errors
- [ ] `cd frontend && npm run build` — no build errors or TypeScript errors
- [ ] `cd frontend && npm run lint` — no new lint warnings
- [ ] `curl -I http://localhost:8080/api/public/events/upcoming` — verify `Content-Encoding: gzip`, `ETag`, `Cache-Control` headers
- [ ] Chrome DevTools Network tab on homepage — verify first meaningful paint uses server-rendered HTML (no blank shell)
- [ ] Redis CLI `keys *` — verify cache keys are populated after first request
- [ ] Verify no N+1 queries in backend logs on `GET /api/public/content?contentType=NEWS&size=10`
