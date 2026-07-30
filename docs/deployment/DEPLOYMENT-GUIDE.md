# SSSS Website — Complete Deployment & Hosting Guide

**Syrian Soil Science Society (SSSS)**  
Domain: `ssssyria.org`  
Stack: Spring Boot 3 · Next.js 14 · PostgreSQL 16 · Redis 7 · MinIO / Cloudflare R2  
Hosting: Netlify (frontend) · Railway (backend) · Porkbun (domain registrar)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Cost Breakdown — Every Dollar](#2-cost-breakdown--every-dollar)
3. [Phase 1 — Register the Domain](#3-phase-1--register-the-domain)
4. [Phase 2 — Prepare Railway (Backend)](#4-phase-2--prepare-railway-backend)
5. [Phase 3 — Deploy the Frontend on Netlify](#5-phase-3--deploy-the-frontend-on-netlify)
6. [Phase 4 — Connect Your Domain (DNS)](#6-phase-4--connect-your-domain-dns)
7. [Phase 5 — Environment Variables Reference](#7-phase-5--environment-variables-reference)
8. [Phase 6 — SMTP Email Setup (Brevo)](#8-phase-6--smtp-email-setup-brevo)
9. [Phase 7 — File Storage (Cloudflare R2)](#9-phase-7--file-storage-cloudflare-r2)
10. [Phase 8 — Security Hardening Checklist](#10-phase-8--security-hardening-checklist)
11. [Phase 9 — Verify the Full Stack](#11-phase-9--verify-the-full-stack)
12. [Phase 10 — CI/CD Auto-Deploy (GitHub Actions)](#12-phase-10--cicd-auto-deploy-github-actions)
13. [Phase 11 — Mailcow Member Email (Later)](#13-phase-11--mailcow-member-email-later)
14. [Renewal & Ongoing Maintenance](#14-renewal--ongoing-maintenance)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│  End User Browser                                            │
└───────────────┬──────────────────────────────────────────────┘
                │ HTTPS  ssssyria.org
                │
┌───────────────▼──────────────────────────────────────────────┐
│  Netlify CDN  (Global Edge Network)                          │
│  ── Next.js 14 (SSR + ISR via Netlify Functions)             │
│  ── Static assets cached at edge                             │
│  ── /api/*  → proxied to Railway (rewrite rule)              │
│  ── /storage/* → proxied to Cloudflare R2                    │
│  ── Free SSL/TLS via Let's Encrypt (auto-issued)             │
└───────────────┬──────────────────────────────────────────────┘
                │ Internal HTTPS proxy (Netlify → Railway)
                │
┌───────────────▼──────────────────────────────────────────────┐
│  Railway Private Network                                     │
│                                                              │
│  ┌─────────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │ Spring Boot 3   │  │ PostgreSQL │  │ Redis 7          │  │
│  │ Port 8080       │  │ Port 5432  │  │ Port 6379        │  │
│  │ (Java 21)       │  │ (internal) │  │ (rate-limit,     │  │
│  │                 │  │            │  │  token blacklist) │  │
│  └─────────────────┘  └────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────┐
│  Cloudflare R2 Object Storage                                │
│  ── Member uploads (images, PDFs, documents)                 │
│  ── Free 10 GB · Zero egress cost                            │
│  ── S3-compatible API                                        │
└──────────────────────────────────────────────────────────────┘

Later — Phase 11:
┌──────────────────────────────────────────────────────────────┐
│  Mailcow VPS (Hetzner CX22)                                  │
│  ── Postfix (SMTP :25, :587)                                 │
│  ── Dovecot (IMAP :993)                                      │
│  ── Rspamd · ClamAV · DKIM/SPF/DMARC                         │
│  ── Member mailboxes: ahmad@ssssyria.org                     │
└──────────────────────────────────────────────────────────────┘
```

### Why this stack?

| Decision | Reason |
|---|---|
| **Netlify** for frontend | Free tier covers all traffic; global CDN; zero-config HTTPS; `@netlify/plugin-nextjs` handles SSR/ISR automatically |
| **Railway** for backend | Managed PostgreSQL + Redis + Spring Boot in one place; private network; no port exposure; Dockerfile auto-detected |
| **Porkbun** for domain | Cheapest `.org` renewal; WHOIS privacy always free; clean DNS UI |
| **Cloudflare R2** for storage | 10 GB free forever; zero egress fees; S3-compatible; no MinIO persistence issues on Railway free tier |
| **Brevo** for SMTP | 300 emails/day free; reliable deliverability; no credit card required |
| **Mailcow** for member email | Self-hosted; includes DKIM/SPF/DMARC/Rspamd/ClamAV; full IMAP/SMTP; REST API for account provisioning |

---

## 2. Cost Breakdown — Every Dollar

### Monthly costs at launch (minimum)

| Service | Provider | Plan | Monthly Cost |
|---|---|---|---|
| Domain `ssssyria.org` | Porkbun | — | **$0.75/mo** ($9/yr) |
| WHOIS Privacy | Porkbun | — | **Free** |
| SSL Certificate | Let's Encrypt via Netlify | — | **Free** |
| Frontend hosting | Netlify | Free Starter | **Free** |
| Backend (Spring Boot) | Railway | Hobby trial | **Free** ($5 credit) |
| PostgreSQL | Railway | Included in backend | **Free** (within $5 credit) |
| Redis | Railway | Included | **Free** (within $5 credit) |
| File storage | Cloudflare R2 | Free 10 GB | **Free** |
| Transactional SMTP | Brevo | Free 300/day | **Free** |
| Admin email (info@ssssyria.org) | Zoho Mail | Free 5 accounts | **Free** |
| **Total at launch** | | | **~$0.75/mo** |

### Monthly costs — stable production (recommended)

| Service | Provider | Plan | Monthly Cost |
|---|---|---|---|
| Domain `ssssyria.org` | Porkbun | — | **$0.75/mo** |
| Frontend hosting | Netlify | Free Starter | **Free** |
| Backend + DB + Redis | Railway | Starter $5/mo | **$5/mo** |
| File storage (10 GB) | Cloudflare R2 | Free tier | **Free** |
| SMTP | Brevo | Free 300/day | **Free** |
| Admin email | Zoho Mail | Free 5 accounts | **Free** |
| **Total stable** | | | **~$5.75/mo** |

### Monthly costs — full production with Mailcow member email

| Service | Provider | Plan | Monthly Cost |
|---|---|---|---|
| Domain | Porkbun | — | $0.75/mo |
| Frontend | Netlify | Free | Free |
| Backend + DB + Redis | Railway | Starter | $5/mo |
| File storage | Cloudflare R2 | Free | Free |
| SMTP (transactional) | Brevo | Free | Free |
| Mailcow VPS | Hetzner CX22 | — | **$4–6/mo** |
| **Total with Mailcow** | | | **~$10–12/mo** |

### Railway usage estimate (fits within $5/mo credit)

| Resource | Estimated usage | Cost |
|---|---|---|
| Spring Boot (512 MB RAM, 0.5 vCPU, low traffic) | ~$2–3/mo |  |
| PostgreSQL (1 GB storage) | ~$1/mo |  |
| Redis (256 MB) | ~$0.50/mo |  |
| **Total Railway** | | **~$3.50–4.50/mo** |

> Railway Starter plan includes $5/mo of usage credits. A typical SSSS deployment stays within this budget.

### Free tier limits — when they matter

| Platform | Limit | Impact |
|---|---|---|
| Netlify Free | 100 GB bandwidth/mo | Sufficient for thousands of visitors |
| Netlify Free | 300 build minutes/mo (~60 deploys) | Sufficient for normal development pace |
| Netlify Free | 125,000 function invocations/mo | Sufficient for SSR pages |
| Brevo Free | 300 emails/day | Sufficient for transactional (resets, notifications) |
| Cloudflare R2 Free | 10 GB storage, 10M operations/mo | Sufficient for early operation |
| Railway Hobby | Services sleep after ~15 min inactivity | **Causes slow cold starts** — upgrade to Starter to eliminate |

---

## 3. Phase 1 — Register the Domain

### 3.1 Why Porkbun?

Porkbun is the recommended registrar because:
- Cheapest `.org` price (~$9/yr) with no renewal price hike
- WHOIS privacy protection included **free forever** (other registrars charge $10–15/yr)
- Clean, simple DNS management panel
- Supports PayPal in addition to credit cards

### 3.2 Check availability

1. Go to [porkbun.com](https://porkbun.com)
2. Search for `ssssyria.org` in the search box
3. Confirm it shows a green **"Add to cart"** button

### 3.3 Create your account

1. Click **Sign Up** at the top right
2. Enter your name, email address, and a strong password
3. **Immediately** check your inbox and click the verification link Porkbun sends
4. Enable **Two-Factor Authentication** (2FA): Account → Security → Enable 2FA
   - Use an authenticator app (Google Authenticator, Authy, or Microsoft Authenticator)
   - This prevents domain hijacking if your password is compromised

> **Why 2FA matters for domains:** A hacker with access to your registrar account can transfer your domain to themselves in minutes. This is called domain hijacking and is very difficult to recover from.

### 3.4 Purchase the domain

1. Add `ssssyria.org` to cart
2. Select **2 or 3 years** — locks in the current price and reduces renewal risk
3. At checkout, fill in the registrant contact:

| Field | Value |
|---|---|
| First / Last Name | Your name (or organisation representative) |
| Organisation | Syrian Soil Science Society (SSSS) |
| Email | Your personal email |
| Phone | +963... |
| Address | Damascus, Syria |

4. Verify that **WHOIS Privacy** is enabled (it is on by default at Porkbun)
5. Complete payment via credit card or PayPal

### 3.5 Enable all protections

After purchase, go to your domain management page:

| Setting | Where | Status |
|---|---|---|
| WHOIS Privacy | Domain → Privacy | ON |
| Registrar Lock (Transfer Lock) | Domain → Lock | ON — prevents unauthorised transfer |
| Auto-Renew | Domain → Settings | ON — prevents accidental expiry |

### 3.6 What you now own

- Exclusive right to use `ssssyria.org` for the registration period
- Ability to create any subdomain (`www.`, `api.`, `mail.`, etc.)
- Ability to create email addresses `@ssssyria.org`
- Full DNS control through Porkbun's DNS panel

> **Expiry reminder:** Set a calendar reminder 60 days before the domain expiry date (shown in your Porkbun dashboard). Always renew before expiry to avoid a redemption fee of $100–300.

---

## 4. Phase 2 — Prepare Railway (Backend)

### 4.1 What Railway hosts

- **Spring Boot 3 API** — compiled from `backend/Dockerfile`
- **PostgreSQL 16** — managed database, private network
- **Redis 7** — used for JWT blacklist and rate limiting

### 4.2 Create a Railway account

1. Go to [railway.com](https://railway.com)
2. Sign up with GitHub (recommended — enables auto-deploy from your repo)
3. Start a new **Project**

### 4.3 Deploy the backend service

1. In your Railway project → **+ New Service → GitHub Repo**
2. Select your SSSS repository
3. Railway detects the `backend/Dockerfile` automatically
4. In service settings → **Root Directory** → set to `backend`
5. **Port**: Railway reads `EXPOSE 8080` from the Dockerfile automatically
6. **Health check path**: `/actuator/health`

### 4.4 Add PostgreSQL

1. In your Railway project → **+ New Service → Database → PostgreSQL**
2. Railway creates a PostgreSQL 16 instance on the private network
3. Railway injects connection variables automatically — use them in your backend:

```yaml
# In Railway backend service → Variables:
SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}
```

> The `${{ServiceName.VAR}}` syntax is Railway's reference syntax — Railway resolves these automatically at runtime. No copy-pasting connection strings needed.

### 4.5 Add Redis

1. In your Railway project → **+ New Service → Database → Redis**
2. Add variables to the backend service:

```yaml
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}
```

### 4.6 Flyway database migrations

Your backend uses **Flyway** to manage the database schema. Migrations run automatically when the Spring Boot application starts. You do not need to run any SQL manually.

Verify migrations succeeded:
```bash
# In Railway dashboard → Backend service → Logs
# Look for:
Successfully applied 49 migration(s) to schema "public"
```

### 4.7 Create the admin user

After the first deploy, connect to PostgreSQL and create the admin account:

```bash
# In Railway dashboard → PostgreSQL service → Data tab
# Or use the Railway CLI:
railway connect postgres

-- Inside psql:
-- First, find the SUPER_ADMIN role ID:
SELECT id FROM roles WHERE name = 'SUPER_ADMIN';

-- Then update the seeded admin email to match your domain:
UPDATE users SET email = 'admin@ssssyria.org' WHERE username = 'admin';

-- The default password is: admin123
-- CHANGE THIS IMMEDIATELY after first login.
```

---

## 5. Phase 3 — Deploy the Frontend on Netlify

### 5.1 What Netlify hosts

- The **Next.js 14 frontend** compiled from `frontend/`
- SSR pages run as **Netlify Functions** (serverless)
- Static assets served from Netlify's global CDN
- API proxy: `/api/*` → Railway, `/storage/*` → Cloudflare R2

### 5.2 Create a Netlify account

1. Go to [netlify.com](https://www.netlify.com)
2. Sign up with GitHub (recommended)

### 5.3 Import the repository

1. Netlify dashboard → **Add new site → Import an existing project**
2. Choose **GitHub** → select your SSSS repository
3. Netlify reads `netlify.toml` from the root — build settings are automatic:

```toml
[build]
  base    = "frontend"        # Build runs inside frontend/ directory
  command = "npm run build"   # Runs: next build
  publish = ".next"           # Output directory

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"  # Handles SSR/ISR/API routes
```

### 5.4 Add the API proxy redirects

Add these lines to `netlify.toml` so the frontend proxies API calls to Railway without exposing the Railway URL:

```toml
[[redirects]]
  from   = "/api/*"
  to     = "https://YOUR-SERVICE.up.railway.app/api/:splat"
  status = 200
  force  = true
  headers = {X-Forwarded-Proto = "https"}

[[redirects]]
  from   = "/storage/*"
  to     = "https://YOUR-R2-BUCKET.r2.cloudflarestorage.com/:splat"
  status = 200
  force  = true
```

> Replace `YOUR-SERVICE.up.railway.app` with your Railway backend URL (found in Railway → backend service → Settings → Domains).

> **Why proxy?** When the browser calls `ssssyria.org/api/...`, Netlify forwards it to Railway. The user never sees the Railway URL. This also eliminates all CORS issues because both the frontend and API appear on the same origin.

### 5.5 Set environment variables

In Netlify → Site Configuration → Environment Variables, add:

```bash
NEXT_PUBLIC_API_URL=https://ssssyria.org/api
NEXT_PUBLIC_APP_URL=https://ssssyria.org
NEXT_PUBLIC_APP_NAME=SSSS
NEXT_PUBLIC_STORAGE_URL=https://ssssyria.org/storage
```

> **Important:** `NEXT_PUBLIC_*` variables are baked into the JavaScript bundle at build time. After changing them you must trigger a new deploy (push a commit or click "Trigger deploy" in Netlify).

### 5.6 Trigger first deploy

Click **Deploy site** or push any commit to the `main` branch. The first build takes 3–5 minutes. You will get a URL like `https://your-site-name.netlify.app` once complete.

---

## 6. Phase 4 — Connect Your Domain (DNS)

### 6.1 Add the domain in Netlify

1. Netlify → your site → **Site Configuration → Domain Management**
2. Click **Add a domain**
3. Enter `ssssyria.org` → Verify
4. Also add `www.ssssyria.org`
5. Netlify shows you the exact DNS records to add — note them

### 6.2 Add DNS records at Porkbun

1. Porkbun dashboard → **Domain Management** → click **DNS** next to `ssssyria.org`
2. Delete any existing A/CNAME records for `@` and `www`
3. Add the following records (use the exact values Netlify gives you):

| Type | Host | Value | TTL |
|---|---|---|---|
| `A` | `@` | `75.2.60.5` (Netlify's load balancer IP) | 300 |
| `CNAME` | `www` | `your-site.netlify.app` | 300 |

> **What is TTL?** Time-To-Live — how long DNS resolvers cache this record in seconds. 300 = 5 minutes. Use 300 during setup (fast propagation), then increase to 3600 (1 hour) once everything works.

### 6.3 Wait for DNS propagation

DNS changes take 5 minutes to 48 hours to propagate worldwide. Check progress at [dnschecker.org](https://dnschecker.org) — enter `ssssyria.org` and select record type `A`. Green checkmarks from multiple locations confirm propagation.

### 6.4 HTTPS certificate (automatic)

Once Netlify detects your DNS records point to it, it automatically issues a free **Let's Encrypt SSL certificate**. This typically takes 5–15 minutes after DNS propagates.

You will see in Netlify → Domain Management:
```
✓ ssssyria.org
  HTTPS certificate: Active
  Last renewed: [date]
  Next renewal: [90 days later — automatic]
```

You do **not** need to do anything. Netlify renews the certificate automatically every 90 days.

### 6.5 Set CORS in Railway

Now that your domain is live, update CORS in Railway to allow requests from it:

```bash
# In Railway → backend service → Variables:
APP_CORS_ALLOWED_ORIGINS=https://ssssyria.org,https://www.ssssyria.org
APP_BASE_URL=https://ssssyria.org
APP_COOKIE_SECURE=true
```

---

## 7. Phase 5 — Environment Variables Reference

All environment variables your backend reads, with explanations.

### Railway — Backend service variables

```bash
# ── Spring Profile ─────────────────────────────────────────────────
SPRING_PROFILES_ACTIVE=prod
# Activates application-prod.yml: disables Swagger, enforces secure cookies,
# sets log level to WARN for Spring framework (INFO for org.ssssy).

# ── Database (PostgreSQL) ──────────────────────────────────────────
SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}
# Railway resolves ${{Postgres.*}} automatically from the linked PostgreSQL service.

# ── Redis ──────────────────────────────────────────────────────────
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}
# Used for: JWT token blacklist, rate limiting (token-bucket via Lua script)

# ── JWT Authentication ─────────────────────────────────────────────
JWT_SECRET=<generate: openssl rand -hex 32>
# CRITICAL: Must be set. App refuses to start without it (no default in production).
# This 256-bit hex secret signs all JWT access and refresh tokens.
# If this is leaked, anyone can forge tokens. Keep it secret.

# ── Application URLs ───────────────────────────────────────────────
APP_BASE_URL=https://ssssyria.org
APP_CORS_ALLOWED_ORIGINS=https://ssssyria.org,https://www.ssssyria.org
# CORS: comma-separated list of allowed frontend origins.
# Wildcard (*) is blocked at startup — explicit origins required.

# ── Cookie Security ────────────────────────────────────────────────
APP_COOKIE_SECURE=true
# JWT stored in httpOnly Secure cookie. Must be true in production (HTTPS required).
# Set to false only for local HTTP development.

# ── SMTP (transactional email) ─────────────────────────────────────
SPRING_MAIL_HOST=smtp-relay.brevo.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your_brevo_smtp_login
SPRING_MAIL_PASSWORD=your_brevo_smtp_key
SPRING_MAIL_SMTP_AUTH=true
SPRING_MAIL_SMTP_STARTTLS=true
# Used for: password reset emails, email verification, notifications.

# ── File Storage (Cloudflare R2) ───────────────────────────────────
APP_STORAGE_TYPE=minio
# R2 uses the S3-compatible API, so storage type stays "minio"
APP_STORAGE_MINIO_ENDPOINT=https://YOUR-ACCOUNT-ID.r2.cloudflarestorage.com
APP_STORAGE_MINIO_ACCESS_KEY=your_r2_access_key_id
APP_STORAGE_MINIO_SECRET_KEY=your_r2_secret_access_key
APP_STORAGE_MINIO_BUCKET=ssss-media
# R2 is S3-compatible. The existing MinIO code works without changes.

# ── Email Domain (member mailboxes) ────────────────────────────────
SSSSY_EMAIL_DOMAIN=ssssyria.org
SSSSY_EMAIL_DEFAULT_QUOTA=1073741824
# 1073741824 bytes = 1 GB per member mailbox

# ── IMAP (member email sync — activate when Mailcow is ready) ──────
SSSSY_EMAIL_IMAP_HOST=mail.ssssyria.org
SSSSY_EMAIL_IMAP_PORT=993
# Leave as localhost:143 until Phase 11 (Mailcow) is deployed.

# ── Trusted Proxies ────────────────────────────────────────────────
TRUSTED_PROXIES=127.0.0.1,::1,172.18.0.0/16
# IPs whose X-Forwarded-For header is trusted for real client IP resolution.
# The Railway/Netlify internal network range should be included.

# ── Swagger (API docs) ─────────────────────────────────────────────
APP_SWAGGER_ENABLED=false
# Keep false in production. Set true only on staging/dev to access
# https://ssssyria.org/swagger-ui.html

# ── Logging ────────────────────────────────────────────────────────
LOG_LEVEL=INFO

# ── ClamAV (antivirus on uploads) ──────────────────────────────────
CLAMAV_ENABLED=false
# Set to true and configure when Mailcow VPS is ready (ClamAV runs on it).
# CLAMAV_HOST=mail.ssssyria.org
# CLAMAV_PORT=3310
```

---

## 8. Phase 6 — SMTP Email Setup (Brevo)

### 8.1 Why Brevo?

- Free plan: 300 emails/day (9,000/month) — sufficient for transactional email
- No credit card required
- Excellent deliverability (your emails land in inbox, not spam)
- Simple SMTP relay — no code changes needed

### 8.2 Create a Brevo account

1. Go to [brevo.com](https://www.brevo.com)
2. Sign up with your email (use `admin@ssssyria.org` after Zoho is set up, or Gmail for now)
3. Verify your account

### 8.3 Get SMTP credentials

1. Brevo → **SMTP & API** → **SMTP**
2. Note your SMTP credentials:
   - **Host**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: your Brevo account email
   - **Password**: the SMTP key shown (not your account password)

### 8.4 Verify your sending domain

1. Brevo → **Senders, Domains & Dedicated IPs → Domains**
2. Click **Add a domain** → enter `ssssyria.org`
3. Brevo gives you DNS records to add — add them in Porkbun:

| Type | Host | Value |
|---|---|---|
| `TXT` | `@` | `v=spf1 include:spf.brevo.com ~all` |
| `TXT` | `mail._domainkey` | (DKIM key provided by Brevo) |

4. Click **Verify** in Brevo after adding the records

> **Why domain verification matters:** Verified domains have dramatically better email deliverability. Unverified sends often land in spam.

### 8.5 Configure the SSSS system

Set these in Railway → backend → Variables:

```bash
SPRING_MAIL_HOST=smtp-relay.brevo.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your_brevo_login_email
SPRING_MAIL_PASSWORD=your_brevo_smtp_key
SPRING_MAIL_SMTP_AUTH=true
SPRING_MAIL_SMTP_STARTTLS=true
```

### 8.6 Test the configuration

After deploying, test the password reset flow:
1. Go to `https://ssssyria.org/auth/forgot-password`
2. Enter your test email
3. Verify the reset email arrives in the inbox (not spam)

---

## 9. Phase 7 — File Storage (Cloudflare R2)

### 9.1 Why Cloudflare R2?

| Feature | R2 Free | Railway Volume |
|---|---|---|
| Storage | 10 GB free | $0.25/GB/mo |
| Egress (download) | **Free always** | Charged |
| API | S3-compatible | N/A |
| Persistence on redeploy | Yes | Yes |
| CDN integration | Yes (Cloudflare) | No |

Railway free tier has **no persistent disk** — uploaded files are lost on every redeploy. R2 solves this for free.

### 9.2 Create an R2 bucket

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → sign in (or create account)
2. Left sidebar → **R2 Object Storage**
3. Click **Create bucket**
4. Name: `ssss-media`
5. Region: **Auto** (Cloudflare distributes globally)

### 9.3 Create API credentials

1. R2 → **Manage R2 API Tokens** → **Create API Token**
2. Permissions: **Object Read & Write**
3. Specify bucket: `ssss-media`
4. Note down:
   - **Access Key ID**
   - **Secret Access Key**
   - **Account ID** (shown at top of R2 page)

### 9.4 Configure the backend

The existing Spring Boot code uses the MinIO S3 client — R2 is fully S3-compatible with no code changes:

```bash
# In Railway → backend → Variables:
APP_STORAGE_TYPE=minio
APP_STORAGE_MINIO_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
APP_STORAGE_MINIO_ACCESS_KEY=<Access Key ID>
APP_STORAGE_MINIO_SECRET_KEY=<Secret Access Key>
APP_STORAGE_MINIO_BUCKET=ssss-media
```

### 9.5 Make the bucket publicly readable (for media files)

1. R2 → `ssss-media` bucket → **Settings → Public Access**
2. Enable **Allow Public Access**
3. Note the public bucket URL: `https://pub-XXXX.r2.dev/ssss-media/`
4. Update the Netlify rewrite to point to this URL:

```toml
# netlify.toml
[[redirects]]
  from   = "/storage/*"
  to     = "https://pub-XXXX.r2.dev/ssss-media/:splat"
  status = 200
  force  = true
```

---

## 10. Phase 8 — Security Hardening Checklist

### Before going live, verify every item:

#### Secrets
- [ ] `JWT_SECRET` set in Railway (generated with `openssl rand -hex 32`)
- [ ] `DB_PASSWORD` set (strong random password, not default)
- [ ] `REDIS_PASSWORD` set
- [ ] `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` set (R2 credentials)
- [ ] No secrets committed to Git (check `.gitignore` includes `.env`)

#### Authentication
- [ ] `APP_COOKIE_SECURE=true` in Railway
- [ ] `SPRING_PROFILES_ACTIVE=prod` in Railway
- [ ] Swagger disabled: `APP_SWAGGER_ENABLED=false`
- [ ] Test login → JWT in httpOnly cookie (not localStorage)
- [ ] Test logout → subsequent requests rejected with 401
- [ ] Test 5 failed logins → account locked for 15 minutes

#### CORS
- [ ] `APP_CORS_ALLOWED_ORIGINS=https://ssssyria.org,https://www.ssssyria.org`
- [ ] No wildcard `*` in CORS (blocked at startup)

#### Email
- [ ] SMTP configured and tested (password reset sends)
- [ ] Brevo SPF/DKIM DNS records added and verified
- [ ] Password reset email lands in inbox (not spam)

#### Domain
- [ ] `https://ssssyria.org` loads with padlock
- [ ] `http://ssssyria.org` redirects to HTTPS
- [ ] `https://www.ssssyria.org` redirects to `https://ssssyria.org`
- [ ] HSTS header present: `Strict-Transport-Security: max-age=31536000`
- [ ] WHOIS Privacy enabled at Porkbun
- [ ] Registrar Lock enabled at Porkbun
- [ ] Auto-Renew enabled at Porkbun

#### Backend
- [ ] `https://ssssyria.org/actuator/health` returns `{"status":"UP"}`
- [ ] `https://ssssyria.org/actuator/env` returns 403 (not exposed)
- [ ] `https://ssssyria.org/swagger-ui.html` returns 404 or 403
- [ ] Rate limiting working: 6 quick login attempts → 429 response

---

## 11. Phase 9 — Verify the Full Stack

Run these checks in order after everything is deployed:

```bash
# 1. DNS propagation
# Visit: https://dnschecker.org → enter ssssyria.org → type A
# All green = DNS propagated worldwide

# 2. HTTPS
curl -I https://ssssyria.org
# Expected headers:
#   HTTP/2 200
#   strict-transport-security: max-age=31536000; includeSubDomains; preload
#   x-frame-options: DENY
#   x-content-type-options: nosniff

# 3. Backend health
curl https://ssssyria.org/actuator/health
# Expected: {"status":"UP"}

# 4. Public API
curl https://ssssyria.org/api/public/events/upcoming
# Expected: [] or JSON array of events

# 5. Unauthenticated API rejection
curl https://ssssyria.org/api/admin/users
# Expected: 401 Unauthorized

# 6. Rate limit (run 6 times quickly)
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://ssssyria.org/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
done
# Expected: first 5 = 401, 6th = 429

# 7. Frontend
curl -I https://ssssyria.org
# Expected: HTTP/2 200, content-type: text/html
```

---

## 12. Phase 10 — CI/CD Auto-Deploy (GitHub Actions)

### 12.1 How it works

The file `.github/workflows/ci.yml` already defines a complete CI/CD pipeline:

```
Push to main branch
  │
  ├─► backend-build job
  │     Compiles Java, runs tests, packages JAR
  │
  ├─► frontend-build job
  │     npm install, lint, typecheck, next build
  │
  └─► docker job (main branch only)
        Builds Docker images → pushes to GitHub Container Registry (GHCR)
          │
          └─► deploy job
                SSH into production server
                docker compose pull → docker compose up -d
```

### 12.2 Set GitHub repository secrets

Go to: GitHub → your repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | Description |
|---|---|---|
| `DEPLOY_HOST` | `your-server-ip` | Production server IP (VPS or Railway SSH proxy) |
| `DEPLOY_USER` | `ubuntu` | SSH username |
| `DEPLOY_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | Your private SSH key (full content of `~/.ssh/id_rsa`) |
| `DEPLOY_PORT` | `22` | SSH port |
| `DEPLOY_PATH` | `/opt/ssss` | Directory on server where the project lives |

### 12.3 Set GitHub repository variables (non-secret)

Go to: Settings → Secrets and variables → Actions → **Variables** tab

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://ssssyria.org/api` |
| `NEXT_PUBLIC_APP_URL` | `https://ssssyria.org` |
| `NEXT_PUBLIC_STORAGE_URL` | `https://ssssyria.org/storage` |

### 12.4 Netlify auto-deploy

Netlify auto-deploys on every push to `main` — no configuration needed. Each deploy:
1. Installs dependencies
2. Runs `npm run build` (with Next.js ISR)
3. Publishes to the Netlify CDN globally

---

## 13. Phase 11 — Mailcow Member Email (Later)

> This phase is **not required at launch**. The system works without it. Member email addresses (`ahmad@ssssyria.org`) are reserved in the database but mailboxes become real only after Mailcow is set up.

### 13.1 What Mailcow provides

- Real IMAP/SMTP mail server for member accounts
- Admin REST API for automated account provisioning
- Rspamd (spam filter), ClamAV (antivirus), DKIM/SPF/DMARC out-of-the-box
- Webmail interface (SOGo) — members can use email in browser
- Works with Outlook, Thunderbird, iPhone Mail, Android Gmail

### 13.2 VPS requirements

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 6–8 GB (ClamAV uses 1–2 GB) |
| Disk | 20 GB SSD | 50+ GB |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| **Port 25** | Must be open | Confirm with provider before ordering |

> **Provider recommendation**: [Hetzner CX22](https://hetzner.com) — 2 vCPU, 4 GB RAM, 40 GB SSD — **~$4–6/mo**. Hetzner opens port 25 on request.

### 13.3 Install Mailcow

```bash
# On the Mailcow VPS:
ssh root@YOUR-VPS-IP

# 1. Install Docker
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# 2. Clone Mailcow
cd /opt
git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized

# 3. Generate config
./generate_config.sh
# When asked for hostname, enter: mail.ssssyria.org

# 4. Start Mailcow
docker compose pull
docker compose up -d

# 5. Access admin panel at: https://mail.ssssyria.org
# Default credentials: admin / moohoo — CHANGE IMMEDIATELY
```

### 13.4 DNS records for Mailcow

Add in Porkbun DNS panel:

| Type | Host | Value | Purpose |
|---|---|---|---|
| `A` | `mail` | Mailcow VPS IP | `mail.ssssyria.org` → Mailcow |
| `MX` | `@` | `mail.ssssyria.org` (priority 10) | Incoming email routing |
| `TXT` | `@` | `v=spf1 mx ~all` | SPF — authorise your server to send |
| `TXT` | `dkim._domainkey` | *(Generated by Mailcow admin panel)* | DKIM signing |
| `TXT` | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@ssssyria.org` | DMARC policy |

### 13.5 Connect Spring Boot to Mailcow

Update Railway variables to point at Mailcow:

```bash
# IMAP sync
SSSSY_EMAIL_IMAP_HOST=mail.ssssyria.org
SSSSY_EMAIL_IMAP_PORT=993

# SMTP (use Mailcow for outgoing member email)
SPRING_MAIL_HOST=mail.ssssyria.org
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=noreply@ssssyria.org
SPRING_MAIL_PASSWORD=<noreply mailbox password>

# Mailcow API (for auto-provisioning member mailboxes)
MAILCOW_API_URL=https://mail.ssssyria.org/api/v1
MAILCOW_API_KEY=<generated in Mailcow admin panel>

# Enable ClamAV (ClamAV daemon runs on the Mailcow VPS)
CLAMAV_ENABLED=true
CLAMAV_HOST=mail.ssssyria.org
CLAMAV_PORT=3310
```

### 13.6 How auto-provisioning works

When a member registers on the website, `AuthService.register()` calls `EmailAccountService.provisionAccount()` which:

1. Creates a DB record with `firstname.lastname@ssssyria.org`
2. Creates system folders in the DB (Inbox, Sent, Drafts, Trash, Spam, Archive)
3. **(After Mailcow)** Calls `MailcowApiService.createMailbox()` → creates the real IMAP mailbox on Mailcow

The backend is already wired for step 3 — you only need to implement `MailcowApiService` (a single REST API call to Mailcow's `/api/v1/add/mailbox` endpoint).

---

## 14. Renewal & Ongoing Maintenance

### Domain renewal (annual)

| When | Action |
|---|---|
| 60 days before expiry | Porkbun sends email reminder |
| With auto-renew enabled | Porkbun charges your card automatically |
| If auto-renew fails | You have 30 days grace period at normal price |
| After grace period | Redemption period ($100–300 to recover) |

**Set a calendar reminder** 60 days before expiry as a backup.

### Railway — keep usage low

```bash
# Monitor usage in Railway dashboard → Usage tab
# If approaching $5/mo credit limit:
# - Increase PostgreSQL connection pool max from 20 to 10
# - Enable Spring Boot lazy initialization
# - Reduce Redis memory limit in Redis service settings
```

### Database backup

```bash
# Run manually or add to a cron job:
railway connect postgres
pg_dump -U $PGUSER $PGDATABASE | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Netlify build minutes

```bash
# Check usage: Netlify → Team → Billing → Build minutes
# Free: 300 minutes/month (~60 deploys at 5 min each)
# If running low: avoid trivial commits; use branch deploys for testing
```

### Cloudflare R2 storage

```bash
# Check in Cloudflare R2 dashboard → Usage
# Free: 10 GB storage, 10M read operations/month
# If approaching limit: delete old/unused media files from admin panel
```

---

## 15. Troubleshooting

### Site shows "502 Bad Gateway" or blank page

**Cause:** Railway backend is in cold start (sleeping).  
**Fix:** Wait 15–20 seconds and refresh. Upgrade to Railway Starter ($5/mo) to disable sleep.

### "CORS error" in browser console

**Cause:** `APP_CORS_ALLOWED_ORIGINS` does not include the frontend origin.  
**Fix:** Add `https://ssssyria.org` and `https://www.ssssyria.org` to `APP_CORS_ALLOWED_ORIGINS` in Railway.

### Login works but stays logged out after refresh

**Cause:** Cookie `Secure` flag mismatch — browser drops non-Secure cookies over HTTPS.  
**Fix:** Ensure `APP_COOKIE_SECURE=true` in Railway and `SPRING_PROFILES_ACTIVE=prod`.

### Password reset email not received

**Cause 1:** SMTP not configured.  
**Fix:** Set all `SPRING_MAIL_*` variables in Railway.  
**Cause 2:** Email in spam folder.  
**Fix:** Add Brevo SPF/DKIM DNS records at Porkbun and verify the domain in Brevo dashboard.

### Flyway migration error on startup

**Cause:** A migration script has an error or a migration was run out of order.  
**Fix:** Check Railway logs for the specific Flyway error message. The most common fix:
```bash
# In Railway → PostgreSQL → Data tab (SQL console):
UPDATE flyway_schema_history SET success = true WHERE success = false;
```

### Uploaded files not appearing

**Cause:** R2 credentials wrong or bucket not found.  
**Fix:** Verify `APP_STORAGE_MINIO_ENDPOINT`, `APP_STORAGE_MINIO_ACCESS_KEY`, `APP_STORAGE_MINIO_SECRET_KEY`, `APP_STORAGE_MINIO_BUCKET` in Railway match exactly what is shown in Cloudflare R2 dashboard.

### DNS not resolving after 48 hours

**Cause:** Old records conflicting with new ones.  
**Fix:** In Porkbun DNS panel, delete **all** existing `A` and `CNAME` records for `@` and `www`, then add only the Netlify records. Run:
```bash
nslookup ssssyria.org
# Should return Netlify's IP (75.2.60.5)
```

---

## Appendix A — Complete Environment Variables Checklist

Copy this to Railway backend service → Variables:

```bash
# REQUIRED — must be set before first deploy
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=                        # openssl rand -hex 32
DB_PASSWORD=                       # strong random password
REDIS_PASSWORD=                    # strong random password
APP_CORS_ALLOWED_ORIGINS=https://ssssyria.org,https://www.ssssyria.org
APP_BASE_URL=https://ssssyria.org
APP_COOKIE_SECURE=true

# REQUIRED — SMTP
SPRING_MAIL_HOST=smtp-relay.brevo.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=              # your Brevo login email
SPRING_MAIL_PASSWORD=              # your Brevo SMTP key
SPRING_MAIL_SMTP_AUTH=true
SPRING_MAIL_SMTP_STARTTLS=true

# REQUIRED — File storage (Cloudflare R2)
APP_STORAGE_TYPE=minio
APP_STORAGE_MINIO_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
APP_STORAGE_MINIO_ACCESS_KEY=      # R2 Access Key ID
APP_STORAGE_MINIO_SECRET_KEY=      # R2 Secret Access Key
APP_STORAGE_MINIO_BUCKET=ssss-media

# OPTIONAL — defaults are fine
APP_SWAGGER_ENABLED=false
LOG_LEVEL=INFO
SSSSY_EMAIL_DOMAIN=ssssyria.org
SSSSY_EMAIL_DEFAULT_QUOTA=1073741824
CLAMAV_ENABLED=false               # set true after Mailcow VPS

# LATER — Mailcow (Phase 11)
# SSSSY_EMAIL_IMAP_HOST=mail.ssssyria.org
# SSSSY_EMAIL_IMAP_PORT=993
# MAILCOW_API_URL=https://mail.ssssyria.org/api/v1
# MAILCOW_API_KEY=
# CLAMAV_HOST=mail.ssssyria.org
# CLAMAV_PORT=3310
```

---

## Appendix B — Files in This Folder

| File | Contents |
|---|---|
| `DEPLOYMENT-GUIDE.md` | **This file** — complete deployment guide |
| `ssssy-domain-registration-full-deployment-guide.html` | Earlier draft (reference) |
| `railway-netlify-free-hosting-full-setup-guide.html` | Railway + Netlify setup guide |
| `full-deep-guide-how-to-register-ssss-org.html` | Domain registration deep-dive |
| `full-deep-guide-register-ssss-org-all-hosting-costs.html` | Costs breakdown with domain guide |
| `mailcow-integration-plan-auto-email-on-member-creation.html` | Mailcow Phase 11 plan |
| `free-hosting-guide-ssssy-website.html` | Free hosting overview |

---

*Syrian Soil Science Society (SSSS) — ssssyria.org*  
*Document version: 1.0 — Generated during project session*
