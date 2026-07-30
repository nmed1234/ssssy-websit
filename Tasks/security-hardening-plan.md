# Enterprise-Grade Security Hardening Plan

## Top-Level Overview

**Goal:** Perform a comprehensive, enterprise-grade security overhaul of the SSSSY Spring Boot + Next.js application, addressing every layer of the stack — from secrets management and authentication token storage to HTTP security headers, rate limiting, file upload safety, audit logging, and error handling.

**Scope:**
- Backend: Spring Boot security config, JWT infrastructure, rate limiting, CORS, HTTP headers, file upload validation, error responses, audit logging
- Frontend: Token storage (localStorage → httpOnly cookies), middleware hardening, API client hardening, CSP meta tags
- Infrastructure: Redis-backed token blacklist, secrets isolation

**Approach:** Each sub-task is independently implementable. Sub-tasks are ordered from most critical to least critical, so each merged increment leaves the system in a more secure state than before.

**Non-goals:**
- Vault/HSM secrets management (environment variable approach is sufficient; Vault can be wired in externally without code changes)
- Penetration testing / external vulnerability scanning
- Changing existing database schema or business logic

---

## Sub-Tasks

---

### Sub-Task 1 — Migrate Frontend Token Storage from localStorage to httpOnly Cookies

**Status:** `[ ] pending`

**Intent:**
`localStorage` is readable by any JavaScript on the page, making tokens vulnerable to XSS attacks. The fix is to have the backend set httpOnly, Secure, SameSite=Strict cookies on login/refresh, and have the frontend rely solely on those cookies. The frontend API client should be updated to drop the Authorization header injection from localStorage and instead let cookies be sent automatically (withCredentials: true).

**Expected Outcomes:**
- `storeAuth()` and `clearAuth()` in `frontend/src/lib/auth.ts` no longer read/write `localStorage` for tokens
- `frontend/src/lib/api.ts` no longer reads `localStorage.getItem("accessToken")`; uses `withCredentials: true` instead
- Backend sets `Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict; Path=/api` on login and token refresh responses
- Frontend middleware `frontend/src/middleware.ts` correctly reads the httpOnly cookie (it already reads from cookies — verify logic is complete)
- `frontend/src/lib/auth.ts` `isAuthenticated()` and `getStoredUser()` are updated to not depend on localStorage tokens
- User object (non-sensitive: userId, username, role) may remain in localStorage for UI display only; tokens must NOT

**Todo List:**
1. In `backend/src/main/java/org/ssssy/backend/controller/AuthController.java` — on login and refresh responses, add `Set-Cookie` headers for `accessToken` (httpOnly, Secure, SameSite=Strict, MaxAge=900) and `refreshToken` (httpOnly, Secure, SameSite=Strict, MaxAge=604800, Path=/api/auth/refresh)
2. In `backend/src/main/java/org/ssssy/backend/security/JwtAuthenticationFilter.java` — add logic to also extract JWT from the `accessToken` cookie (fallback after Authorization header), so the middleware token still works for SSR/middleware scenarios
3. In `frontend/src/lib/auth.ts` — remove `localStorage.setItem("accessToken/refreshToken")` and `setCookie()` calls for tokens; keep only `localStorage.setItem("user", ...)` for the non-sensitive user profile object
4. In `frontend/src/lib/api.ts` — set `withCredentials: true` on the axios instance; remove `localStorage.getItem("accessToken")` from the request interceptor; keep the 401 refresh logic but use the httpOnly cookie path (POST to `/auth/refresh` with credentials, no body needed)
5. In `frontend/src/lib/auth.ts` — update `isAuthenticated()` to check the user object in localStorage (or a lightweight "is-logged-in" flag) rather than the token
6. In `frontend/src/middleware.ts` — verify `request.cookies.get("accessToken")` is the sole gating mechanism; ensure all protected route paths are covered
7. In `backend/src/main/java/org/ssssy/backend/controller/AuthController.java` — on logout, issue `Set-Cookie` headers that clear both token cookies (MaxAge=0)

**Relevant Context:**
- `frontend/src/lib/auth.ts` — `storeAuth()`, `clearAuth()`, `isAuthenticated()`, `setCookie()`
- `frontend/src/lib/api.ts` — request interceptor at line 11, refresh logic at lines 22-42
- `frontend/src/middleware.ts` — already reads cookie at line 13
- `backend/src/main/java/org/ssssy/backend/security/JwtAuthenticationFilter.java` — token extraction
- `backend/src/main/java/org/ssssy/backend/controller/AuthController.java` — login/refresh/logout endpoints

---

### Sub-Task 2 — Implement Redis-Backed Access Token Blacklist / Revocation

**Status:** `[ ] pending`

**Intent:**
Currently, access tokens are valid for their full 15-minute window even after logout or suspicious activity. A Redis-backed blacklist lets the system immediately invalidate any access token. On logout or forced revocation, the token's JTI (JWT ID) is stored in Redis with TTL equal to the token's remaining lifetime.

**Expected Outcomes:**
- Every generated access token includes a `jti` (JWT ID) claim (UUID)
- `JwtTokenProvider.generateAccessToken()` adds `jti` claim
- A `TokenBlacklistService` stores revoked JTIs in Redis with TTL
- `JwtAuthenticationFilter` checks the blacklist after signature validation; rejects blacklisted tokens with 401
- On logout, the current access token's JTI is added to the blacklist
- `AuthService.logout()` adds the token to the blacklist in addition to deleting refresh tokens
- Redis connection is already configured in `application.yml` (Redis is in the docker-compose stack)

**Todo List:**
1. Add `jti` claim (UUID) to `JwtTokenProvider.generateAccessToken()`; add `getJtiFromToken(String token)` method
2. Create `backend/src/main/java/org/ssssy/backend/security/TokenBlacklistService.java` — injects `StringRedisTemplate`; provides `blacklist(String jti, long remainingTtlMs)` and `isBlacklisted(String jti)` methods
3. Update `JwtAuthenticationFilter` to call `tokenBlacklistService.isBlacklisted(jti)` after token validation; return 401 if blacklisted
4. Update `AuthService.logout()` to extract the current access token from the request, get its JTI and remaining TTL, and call `tokenBlacklistService.blacklist(jti, ttl)`
5. Update `AuthController.logout()` to pass the raw Authorization header token to `AuthService.logout()`
6. Add `spring.data.redis` config to `application.yml` if not already present (Redis host/port from env var)

**Relevant Context:**
- `backend/src/main/java/org/ssssy/backend/security/JwtTokenProvider.java`
- `backend/src/main/java/org/ssssy/backend/security/JwtAuthenticationFilter.java`
- `backend/src/main/java/org/ssssy/backend/service/AuthService.java`
- `backend/src/main/java/org/ssssy/backend/controller/AuthController.java`
- `backend/src/main/resources/application.yml`

---

### Sub-Task 3 — Add Comprehensive HTTP Security Headers + Content Security Policy

**Status:** `[ ] pending`

**Intent:**
The application is missing most OWASP-recommended HTTP response headers. This sub-task adds a Spring `OncePerRequestFilter` that injects security headers on every response, plus re-enables X-Frame-Options (disabled globally for a single PDF endpoint — fix by using a per-endpoint `@CrossOrigin`/response header approach instead).

**Expected Outcomes:**
- Every API response includes: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0` (modern browsers), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restricting camera/mic/geolocation
- A `Content-Security-Policy` header is set: `default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'` (adjusted for frontend needs)
- The PDF proxy endpoint overrides `X-Frame-Options` to `SAMEORIGIN` using a response header set directly in the controller, not globally
- `SecurityConfig.java` re-enables the Spring Security default frame options then overrides per-endpoint
- Frontend `layout.tsx` or `next.config.js` adds equivalent CSP `<meta>` tags and Next.js `headers()` config for static/SSR pages

**Todo List:**
1. Create `backend/src/main/java/org/ssssy/backend/security/SecurityHeadersFilter.java` — `OncePerRequestFilter` that adds all security headers to every response
2. In `SecurityConfig.java` — remove `.frameOptions(fo -> fo.disable())` and instead use `.frameOptions(fo -> fo.deny())` as default; register `SecurityHeadersFilter` in the filter chain
3. In the PDF proxy controller/endpoint — add `response.setHeader("X-Frame-Options", "SAMEORIGIN")` directly to override the global DENY for that single route
4. In `frontend/next.config.js` (or `next.config.ts`) — add `headers()` async function returning security headers for all routes: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, a permissive-but-safe `Content-Security-Policy` for Next.js

**Relevant Context:**
- `backend/src/main/java/org/ssssy/backend/security/SecurityConfig.java` — line 30-34 (frameOptions disable)
- `backend/src/main/java/org/ssssy/backend/security/RateLimitFilter.java` — pattern to follow for OncePerRequestFilter
- `frontend/next.config.js` or `frontend/next.config.ts` — Next.js config file

---

### Sub-Task 4 — Harden CORS and Restrict Allowed Headers

**Status:** `[ ] pending`

**Intent:**
The current CORS configuration uses `allowedHeaders("*")` which is overly permissive. Combined with `allowCredentials(true)`, this creates risk. The fix restricts allowed headers to an explicit whitelist and validates that the `allowedOrigins` value is not a wildcard when credentials are enabled.

**Expected Outcomes:**
- `WebConfig.java` replaces `allowedHeaders("*")` with an explicit list: `Authorization`, `Content-Type`, `Accept`, `X-Requested-With`, `Cache-Control`
- `exposedHeaders` is set to expose only `Content-Disposition` (for file downloads)
- `allowedOrigins` is validated at startup to not be `*` when `allowCredentials(true)` is set
- `maxAge` is set to `3600` seconds to reduce preflight requests
- WebSocket CORS in `WebSocketConfig.java` is similarly reviewed

**Todo List:**
1. Update `backend/src/main/java/org/ssssy/backend/config/WebConfig.java` — replace `allowedHeaders("*")` with explicit header list; add `exposedHeaders("Content-Disposition")` and `maxAge(3600)`
2. Check `backend/src/main/java/org/ssssy/backend/config/WebSocketConfig.java` — review `setAllowedOrigins`/`setAllowedOriginPatterns` and restrict similarly
3. Add a startup validation `@PostConstruct` check in `WebConfig` to throw if `allowedOrigins` is `*` while credentials are enabled

**Relevant Context:**
- `backend/src/main/java/org/ssssy/backend/config/WebConfig.java` — full file
- `backend/src/main/java/org/ssssy/backend/config/WebSocketConfig.java`

---

### Sub-Task 5 — WAF-Level Per-Endpoint Rate Limiting with Redis Backend

**Status:** `[ ] pending`

**Intent:**
The current rate limiter uses an in-memory `ConcurrentHashMap` (lost on restart, not scalable), applies the same liberal limits to all endpoints (100/100 req/min), and is vulnerable to `X-Forwarded-For` spoofing. This sub-task replaces it with a Redis-backed Bucket4j implementation with per-endpoint tiers.

**Tiers:**
- **Auth endpoints** (`/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`): 5 requests per 15 minutes per IP — brute-force protection
- **File upload** (`/api/media/upload`): 10 requests per minute per user
- **Public read endpoints** (`/api/public/**`): 120 requests per minute per IP
- **Authenticated API** (`/api/**` with valid JWT): 300 requests per minute per user
- **Default (unauthenticated)**: 60 requests per minute per IP

**Expected Outcomes:**
- `RateLimitFilter.java` is rewritten to use `Bucket4jBuilder` with a Redis-backed `ProxyManager` (using `bucket4j-redis` or `bucket4j-spring-boot-starter` if available, else manual Redis key with TTL)
- `X-Forwarded-For` is only trusted if the request comes from a configured list of trusted proxy IPs (`app.security.trusted-proxies` in `application.yml`)
- Rate limit headers (`X-RateLimit-Remaining`, `X-RateLimit-Reset`) are included in all responses
- Auth endpoints return `429 Too Many Requests` with `Retry-After` header on limit exceeded

**Todo List:**
1. Add `bucket4j-redis` (or Redisson) dependency to `backend/pom.xml`
2. Rewrite `RateLimitFilter.java` — use Redis `StringRedisTemplate` to store bucket state; use Lua script for atomic decrement with TTL; define per-path bucket configs as a map
3. Add trusted proxy IP validation: only trust `X-Forwarded-For` if `request.getRemoteAddr()` is in the configured trusted proxy list
4. Add rate limit response headers on every request (remaining tokens, reset timestamp)
5. Add `app.security.trusted-proxies` and per-tier rate limit config to `application.yml`
6. Add `app.security.rate-limit.*` properties for each tier so limits are configurable without code changes

**Relevant Context:**
- `backend/src/main/java/org/ssssy/backend/security/RateLimitFilter.java` — full rewrite
- `backend/src/main/resources/application.yml` — add rate limit properties
- `backend/pom.xml` — add dependency

---

### Sub-Task 6 — File Upload Security: Magic Byte Validation + Antivirus Integration

**Status:** `[ ] pending`

**Intent:**
`MediaService.java` currently validates only the client-declared MIME type (`multipart.getContentType()`), which is trivially spoofable. A malicious user can upload an executable or web shell renamed as `.jpg`. This sub-task adds server-side magic byte (file signature) validation using Apache Tika, and prepares a ClamAV integration hook.

**Expected Outcomes:**
- `MediaService.uploadFile()` validates the actual file content using Apache Tika's `MimeTypes.detect()` against the raw byte stream — not the declared content type
- If the detected MIME type does not match the declared type or is not in the allowed list, the upload is rejected with a 400
- File extension is validated against the detected MIME type (no `.exe`, `.php`, `.js` disguised as images)
- A `FileValidationService` is created to centralize all upload validation logic
- Path traversal in filenames is explicitly sanitized (strip `..`, `/`, `\`)
- File size limit in `application.yml` is reconciled with the service-level limit (currently mismatched: 50MB vs 10MB)
- ClamAV scan hook: if `app.security.clamav.enabled=true`, scan bytes before storing (with graceful fallback if ClamAV unavailable)

**Todo List:**
1. Add `apache-tika-core` dependency to `backend/pom.xml`
2. Create `backend/src/main/java/org/ssssy/backend/security/FileValidationService.java` — methods: `validateMimeType(byte[] bytes, String declaredContentType)`, `sanitizeFilename(String filename)`, `validateExtension(String filename, String detectedMime)`
3. Update `MediaService.uploadFile()` to call `FileValidationService` after reading file bytes; reject if validation fails
4. Fix the file size limit mismatch: set `spring.servlet.multipart.max-file-size=10MB` in `application.yml` to match the service-level `MAX_FILE_SIZE = 10_485_760L`
5. Add filename sanitization in the upload pipeline (strip path traversal characters, limit length to 255 chars)
6. Add `app.security.clamav.enabled`, `app.security.clamav.host`, `app.security.clamav.port` properties; add conditional ClamAV scan in `FileValidationService`

**Relevant Context:**
- `backend/src/main/java/org/ssssy/backend/service/MediaService.java` — lines 121-160 (upload pipeline)
- `backend/src/main/resources/application.yml` — multipart config
- `backend/pom.xml`

---

### Sub-Task 7 — Comprehensive Audit Logging for All Sensitive Operations

**Status:** `[ ] pending`

**Intent:**
The current `AuditAspect` only logs slow requests (>1000ms), which is useless for security forensics. A proper audit log must capture authentication events, authorization failures, data mutations on sensitive entities, and admin actions — regardless of request speed.

**Expected Outcomes:**
- A `@SecurityAudit` custom annotation marks methods that should always be audit-logged
- `AuditAspect` is updated to intercept `@SecurityAudit`-annotated methods, log: actor (userId), action, entity, IP, user-agent, timestamp, success/failure
- The following events are explicitly logged: login success, login failure, logout, password change, role change, user creation/deletion, content publish/unpublish, media upload/delete, admin configuration changes
- `AuditService.log()` is called from `AuthService` for auth events with the proper action strings
- Slow-request logging remains but is demoted to a DEBUG log level, not an audit entry
- Audit logs are NOT returned with sensitive field values (passwords, tokens never logged)
- IP address extraction respects the trusted-proxy list from Sub-Task 5

**Todo List:**
1. Create `backend/src/main/java/org/ssssy/backend/audit/SecurityAudit.java` — `@interface` annotation with `action` and `entityType` string attributes
2. Rewrite `AuditAspect.java` — replace the slow-request pointcut with `@annotation(SecurityAudit)` pointcut; extract userId from `SecurityContextHolder`; extract IP from request using trusted-proxy-aware extraction
3. Add `@SecurityAudit(action = "LOGIN_SUCCESS", entityType = "USER")` to `AuthService.login()` (success path) and a corresponding failure path log
4. Add `@SecurityAudit` to `AuthService.changePassword()`, role assignment methods, user deletion
5. Add `@SecurityAudit` to content publish/unpublish, media upload/delete controller methods
6. Update `AuditAspect` to capture method return value for `entityId` where possible (e.g., newly created entity ID)
7. Add `@SecurityAudit` to admin configuration endpoints

**Relevant Context:**
- `backend/src/main/java/org/ssssy/backend/aspect/AuditAspect.java`
- `backend/src/main/java/org/ssssy/backend/audit/AuditService.java`
- `backend/src/main/java/org/ssssy/backend/service/AuthService.java`

---

### Sub-Task 8 — Sanitize Error Responses (Stop Leaking Internal Details)

**Status:** `[ ] pending`

**Intent:**
`GlobalExceptionHandler.handleGeneral()` currently returns `"Internal error: " + ex.getCause().getMessage()` to the HTTP client — this leaks stack trace details, class names, and implementation internals. All production errors must return a generic message; details go only to the server log.

**Expected Outcomes:**
- `GlobalExceptionHandler.handleGeneral()` returns `"An unexpected error occurred. Please try again."` to the client (no detail string)
- All exception handlers return messages that do not reveal internal class names, SQL details, or stack traces
- A correlation ID (`X-Correlation-ID` header) is generated per request and included in both the response and the server log entry, so support teams can correlate client-reported errors with log lines without exposing details
- If a `X-Request-ID` or `X-Correlation-ID` is sent by the client (or reverse proxy), it is echoed back and used in log context

**Todo List:**
1. Update `GlobalExceptionHandler.handleGeneral()` — replace `"Internal error: " + detail` with `"An unexpected error occurred."` in the response body; keep the full log with `ex.getMessage()` and `ex` stack trace on the server
2. Create `backend/src/main/java/org/ssssy/backend/security/CorrelationIdFilter.java` — `OncePerRequestFilter` that reads or generates a UUID correlation ID; stores it in MDC (`MDC.put("correlationId", id)`); adds `X-Correlation-ID` response header
3. Register `CorrelationIdFilter` in `SecurityConfig.java` (before the JWT filter)
4. Update `logback-spring.xml` (or create it if not present) to include `%X{correlationId}` in the log pattern
5. Review all other `@ExceptionHandler` methods for any that include raw exception messages in the response body; sanitize them similarly

**Relevant Context:**
- `backend/src/main/java/org/ssssy/backend/exception/GlobalExceptionHandler.java` — last 20 lines
- `backend/src/main/resources/` — check for `logback-spring.xml`

---

### Sub-Task 9 — Password Policy Enforcement + BCrypt Strength Increase

**Status:** `[ ] pending`

**Intent:**
The current minimum password length is 6 characters with no complexity requirements. BCrypt is used at the default strength (10). This sub-task raises the bar: minimum 8 characters, at least one uppercase, one lowercase, one digit, one special character. BCrypt strength is raised to 12 for better resistance to offline attacks.

**Expected Outcomes:**
- `RegisterRequest.java` and `ChangePasswordRequest.java` have `@Pattern` validation for password complexity
- `SecurityConfig.passwordEncoder()` uses `BCryptPasswordEncoder(12)` instead of default (10)
- A shared `PasswordValidator` utility is used for the regex to keep it consistent
- The password complexity error message is user-friendly (explains requirements), not just "pattern mismatch"
- Reset password endpoint also enforces the same policy

**Todo List:**
1. Create `backend/src/main/java/org/ssssy/backend/security/PasswordPolicyValidator.java` — `ConstraintValidator` implementing `@ValidPassword` annotation; validates: min 8 chars, max 100, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
2. Create `backend/src/main/java/org/ssssy/backend/security/ValidPassword.java` — custom `@interface` constraint annotation
3. Replace `@Size(min = 6)` in `RegisterRequest.java` and `ChangePasswordRequest.java` with `@ValidPassword`
4. Update `SecurityConfig.passwordEncoder()` to `new BCryptPasswordEncoder(12)`
5. Apply `@ValidPassword` to the reset-password DTO if one exists

**Relevant Context:**
- `backend/src/main/java/org/ssssy/backend/model/dto/` — RegisterRequest, ChangePasswordRequest, reset password DTOs
- `backend/src/main/java/org/ssssy/backend/security/SecurityConfig.java` — `passwordEncoder()` bean

---

### Sub-Task 10 — Disable Swagger in Production + Protect Actuator Endpoints

**Status:** `[ ] pending`

**Intent:**
Swagger UI (`/swagger-ui/**`) and OpenAPI spec (`/api-docs/**`) are publicly accessible in all environments, revealing the full API surface. Spring Boot Actuator is configured but only `/actuator/health` is public — confirm other actuator endpoints are locked down. In production, Swagger should be disabled entirely.

**Expected Outcomes:**
- Swagger and OpenAPI endpoints are gated by an `app.swagger.enabled` flag; when `false` (production default), a 404 is returned
- `SpringDoc` configuration is conditioned on `@ConditionalOnProperty(name = "app.swagger.enabled", havingValue = "true")`
- `SecurityConfig.java` only permits `/swagger-ui/**` and `/api-docs/**` when the property is true
- Actuator: only `health` and `info` endpoints exposed; all others (env, beans, heapdump, threaddump) are disabled via `management.endpoints.web.exposure.include`
- `application.yml` sets `app.swagger.enabled=false` as the default, with a dev profile override to `true`

**Todo List:**
1. In `backend/src/main/resources/application.yml` — add `app.swagger.enabled: false` and `management.endpoints.web.exposure.include: health,info`
2. Create `backend/src/main/resources/application-dev.yml` (if not existing) — set `app.swagger.enabled: true`
3. In `SecurityConfig.java` — inject `@Value("${app.swagger.enabled:false}") boolean swaggerEnabled`; conditionally add the swagger `permitAll()` matcher only when enabled
4. In `OpenApiConfig.java` — add `@ConditionalOnProperty(name = "app.swagger.enabled", havingValue = "true")` to the configuration class
5. Verify `management.endpoint.health.show-details=when-authorized` is set so health details are not public

**Relevant Context:**
- `backend/src/main/java/org/ssssy/backend/config/OpenApiConfig.java`
- `backend/src/main/java/org/ssssy/backend/security/SecurityConfig.java` — lines 41-42
- `backend/src/main/resources/application.yml`

---

## Implementation Order

```
Sub-Task 1  → httpOnly cookies (eliminates XSS token theft — most critical frontend fix)
Sub-Task 2  → Redis token blacklist (enables immediate token revocation)
Sub-Task 3  → Security headers + CSP (browser-level protection)
Sub-Task 4  → CORS hardening (cross-origin attack surface reduction)
Sub-Task 5  → Per-endpoint rate limiting with Redis (brute-force + DDoS mitigation)
Sub-Task 6  → File upload magic byte validation (prevents RCE via file upload)
Sub-Task 7  → Audit logging (forensics and compliance)
Sub-Task 8  → Error response sanitization (stop leaking internals)
Sub-Task 9  → Password policy + BCrypt strength (credential hardening)
Sub-Task 10 → Swagger/Actuator lockdown (attack surface reduction)
```

## Files Modified Per Sub-Task (Summary)

| Sub-Task | Backend Files | Frontend Files |
|----------|--------------|----------------|
| 1 — httpOnly Cookies | AuthController.java, JwtAuthenticationFilter.java | auth.ts, api.ts, middleware.ts |
| 2 — Token Blacklist | JwtTokenProvider.java, JwtAuthenticationFilter.java, AuthService.java, AuthController.java, new TokenBlacklistService.java | — |
| 3 — Security Headers | SecurityConfig.java, new SecurityHeadersFilter.java | next.config.js |
| 4 — CORS Hardening | WebConfig.java, WebSocketConfig.java | — |
| 5 — Rate Limiting | RateLimitFilter.java (rewrite), pom.xml, application.yml | — |
| 6 — File Upload | MediaService.java, new FileValidationService.java, pom.xml, application.yml | — |
| 7 — Audit Logging | AuditAspect.java (rewrite), new SecurityAudit.java, AuthService.java, controllers | — |
| 8 — Error Sanitization | GlobalExceptionHandler.java, new CorrelationIdFilter.java, logback-spring.xml | — |
| 9 — Password Policy | new ValidPassword.java, new PasswordPolicyValidator.java, RegisterRequest.java, ChangePasswordRequest.java, SecurityConfig.java | — |
| 10 — Swagger/Actuator | OpenApiConfig.java, SecurityConfig.java, application.yml | — |
