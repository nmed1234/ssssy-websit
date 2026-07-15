# Installation Guide — SSSSY (Soil Science Society of Syria) Website

Comprehensive step-by-step deployment guide covering local development, Docker production deployment, mail server setup, SSL/TLS, CI/CD, and full-stack verification.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Production Deployment (Docker)](#3-production-deployment-docker)
4. [Mail Server Setup (Mailcow)](#4-mail-server-setup-mailcow)
5. [Nginx Reverse Proxy Configuration](#5-nginx-reverse-proxy-configuration)
6. [SSL/TLS Setup with Let's Encrypt](#6-ssltls-setup-with-lets-encrypt)
7. [CI/CD Pipeline](#7-cicd-pipeline)
8. [Environment Configuration Reference](#8-environment-configuration-reference)
9. [Database Setup (Deep Dive)](#9-database-setup-deep-dive)
10. [Security Checklist](#10-security-checklist)
11. [Verification Checklist](#11-verification-checklist)

---

## 1. Prerequisites

### 1.1 Hardware Requirements

| Environment | vCPU | RAM | Disk | Network | Rationale |
|-------------|------|-----|------|---------|-----------|
| **Development** | 2 cores | 4 GB | 10 GB SSD | Any | Single developer running backend + frontend + Docker services. No mail server. Adequate for compilation (Maven needs ~1 GB for build). |
| **Staging** | 4 cores | 8 GB | 50 GB SSD | 100 Mbps | Mirrors production with all services including Mailcow. Runs CI/CD pipeline tests. Multiple concurrent sessions. |
| **Production** | 8 cores | 16 GB | 200 GB SSD | 1 Gbps | Full load with real traffic. Mailcow needs dedicated resources. Backups stored on disk. Log rotation requires headroom. Horizontal scaling possible with additional 4-core nodes. |

**Disk breakdown for production (200 GB):**
- OS + Docker images: 30 GB
- PostgreSQL data: 40 GB (grows with content, events, users)
- MinIO object storage: 60 GB (media files, uploads, thumbnails)
- Mailcow (maildir): 40 GB (emails, attachments)
- Backups: 20 GB (daily + weekly rotation)
- Logs: 5 GB (rotated weekly)
- Swap + overhead: 5 GB

### 1.2 Software Installation Guides

#### Java 21 (Temurin/Adoptium recommended)

**Windows (with Chocolatey):**
```powershell
# Install Chocolatey first (if not installed):
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Java 21:
choco install temurin21 -y

# Verify:
java -version
# Expected output: openjdk version "21.0.x" 2024-xx-xx LTS

# Set JAVA_HOME (if not set automatically):
[Environment]::SetEnvironmentVariable("JAVA_HOME", "$env:ProgramFiles\Eclipse Adoptium\jdk-21.0.x-hotspot", "Machine")
```

**Troubleshooting (Windows):**
- If `java -version` fails, ensure the JDK `bin` directory is in your PATH.
- Restart your terminal after setting environment variables.
- Try `refreshenv` if using Chocolatey.

**Linux (with SDKMAN):**
```bash
# Install SDKMAN:
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# List available Java 21 versions:
sdk list java | grep 21

# Install Temurin JDK 21:
sdk install java 21.0.2-tem

# Set as default:
sdk default java 21.0.2-tem

# Verify:
java -version
# Expected output: openjdk version "21.0.2" 2024-01-16 LTS
```

**Troubleshooting (Linux):**
- If SDKMAN fails, ensure `curl`, `zip`, and `unzip` are installed (`sudo apt install -y curl zip unzip`).
- Try a different distribution like `21.0.2-ms` (Microsoft) or `21.0.2-amzn` (Corretto).

**macOS (with Homebrew):**
```bash
# Install Homebrew first (if not installed):
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Java 21:
brew install openjdk@21

# Symlink for macOS system (if needed):
sudo ln -sfn /usr/local/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk

# Verify:
java -version

# Set JAVA_HOME:
export JAVA_HOME=$(/usr/libexec/java_home -v21)
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v21)' >> ~/.zshrc
```

#### Maven 3.9+

**Windows (with Chocolatey):**
```powershell
choco install maven -y
mvn --version
# Expected: Apache Maven 3.9.x, Java version: 21.0.x
```

**Linux:**
```bash
wget https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz
sudo tar xzf apache-maven-3.9.6-bin.tar.gz -C /opt
sudo ln -s /opt/apache-maven-3.9.6 /opt/maven
echo 'export M2_HOME=/opt/maven' >> ~/.bashrc
echo 'export PATH=$M2_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
mvn --version
```

**macOS:**
```bash
brew install maven
mvn --version
```

**Troubleshooting (all platforms):**
- If `mvn` command not found, verify the installation path is in your PATH.
- First Maven run downloads many dependencies from Maven Central (may take several minutes).

#### Node.js 18+ (with nvm)

**Windows (with nvm-windows):**
```powershell
# Download nvm-windows from https://github.com/coreybutler/nvm-windows/releases
nvm install 18.20.2
nvm use 18.20.2
node --version  # Expected: v18.20.2
npm --version   # Expected: 10.5.0
```

**Linux/macOS (with nvm):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18
node --version
npm --version
```

**Troubleshooting:**
- If `nvm` command not found, close and reopen your terminal.
- If `npm install` fails with permission errors, use nvm (never use `sudo npm`).

#### Docker 24+ and Docker Compose v2

**Windows:** Install Docker Desktop from https://www.docker.com/products/docker-desktop/ with WSL 2 backend.

**Linux (Ubuntu/Debian):**
```bash
sudo apt remove docker docker-engine docker.io containerd runc
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

**macOS:**
```bash
# Docker Desktop for Mac: https://www.docker.com/products/docker-desktop/
# Or using Homebrew + Colima:
brew install docker docker-compose colima
colima start --cpu 4 --memory 8 --disk 60
```

**Troubleshooting (all platforms):**
- If Docker fails to start, ensure virtualization is enabled in BIOS/UEFI.
- On Windows, ensure WSL 2 is properly installed: `wsl --set-default-version 2`.
- For "permission denied" on Linux Docker socket, ensure your user is in the `docker` group.

#### PostgreSQL 16 (Native Installation)

**Windows:**
```powershell
choco install postgresql16 --params "/Password:postgres" -y
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
psql --version
```

**Linux (Ubuntu/Debian):**
```bash
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16 postgresql-client-16
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
psql -U postgres -h localhost -c "SELECT version();"
```

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**PostgreSQL configuration tuning (production):**
Edit `postgresql.conf`:
```ini
shared_buffers = 4GB          # 25% of RAM for production (16 GB - 4 GB)
effective_cache_size = 12GB    # 75% of RAM
work_mem = 64MB                # Per-operation sort memory
maintenance_work_mem = 1GB     # For VACUUM, CREATE INDEX
max_connections = 100          # Adjust based on expected concurrent users
wal_level = replica
max_wal_size = 4GB
min_wal_size = 1GB
checkpoint_completion_target = 0.9
random_page_cost = 1.1         # For SSD storage
effective_io_concurrency = 200 # For SSD storage
```

### 1.3 Git Setup

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input  # On Windows: true
git config --global pull.rebase true
git config --global fetch.prune true

# Generate SSH key:
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to SSH agent:
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# On Windows PowerShell:
Start-Service ssh-agent
ssh-add $env:USERPROFILE\.ssh\id_ed25519

# Display public key:
cat ~/.ssh/id_ed25519.pub
# Windows: Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub

# Test connection:
ssh -T git@github.com
# Expected: "Hi username! You've successfully authenticated..."
```

### 1.4 DNS Setup for Production

| Record Type | Name | Value | TTL | Purpose |
|-------------|------|-------|-----|---------|
| **A** | `ssssy.org.sy` | `203.0.113.10` | 3600 | Resolves main domain to server IP for the frontend. |
| **A** | `api.ssssy.org.sy` | `203.0.113.10` | 3600 | API subdomain for backend REST endpoints and WebSocket. |
| **A** | `mail.ssssy.org.sy` | `203.0.113.10` | 3600 | Mail server subdomain for Mailcow. |
| **MX** | `ssssy.org.sy` | `mail.ssssy.org.sy` | 3600 | Mail exchanger record -- tells senders where to deliver email. Priority 10. |
| **TXT** | `ssssy.org.sy` | `v=spf1 mx include:mail.ssssy.org.sy ~all` | 3600 | SPF record -- authorizes the mail server to send email for the domain. |
| **TXT** | `_dmarc.ssssy.org.sy` | `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@ssssy.org.sy` | 3600 | DMARC policy -- tells receivers what to do with unauthenticated email. |
| **TXT** | `default._domainkey.ssssy.org.sy` | (DKIM public key) | 3600 | DKIM record -- cryptographic signature verification for outgoing email. |
| **CNAME** | `www.ssssy.org.sy` | `ssssy.org.sy` | 3600 | Redirects www to the bare domain. |

**DNS verification commands:**
```bash
# Linux:
dig A ssssy.org.sy +short
dig MX ssssy.org.sy +short
dig TXT _dmarc.ssssy.org.sy +short
dig TXT default._domainkey.ssssy.org.sy +short

# Windows PowerShell:
Resolve-DnsName ssssy.org.sy -Type A
Resolve-DnsName ssssy.org.sy -Type MX
Resolve-DnsName _dmarc.ssssy.org.sy -Type TXT

# Online tools: dnschecker.org, mxtoolbox.com, ssllabs.com
```

**Important DNS notes:**
- Set TTL to 300 during initial setup, increase to 3600+ after stabilization.
- SPF `~all` is recommended initially; change to `-all` after testing.
- DMARC `p=quarantine` is a good starting policy; upgrade to `p=reject` after monitoring for 2 weeks.
- Wait up to 48 hours for DNS propagation.

---

## 2. Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/ssssy-website.git
cd ssssy-website
```

**Expected output:**
```
Cloning into 'ssssy-website'...
Receiving objects: 100% (XXXX/XXXX), done.
```

**Troubleshooting:**
- `Permission denied (publickey)`: Add your SSH key to GitHub Settings -> SSH and GPG keys.
- `repository not found`: Verify repository access with your team lead.
- `Failed to connect to github.com port 443`: Check internet connection and firewall. Try HTTPS instead of SSH.

### Step 2: Start Infrastructure Services

```bash
docker compose up -d postgres minio redis

# Expected:
# [+] Running 4/4
#  - Container ssssy-postgres  Started
#  - Container ssssy-minio     Started
#  - Container ssssy-redis     Started

# Verify:
docker compose ps
# All three containers should show "Up" status
```

**What this does:**
- Downloads Docker images for PostgreSQL 16-alpine, MinIO latest, Redis 7-alpine
- Creates a bridge network for inter-container communication
- Maps ports: 5432 (PostgreSQL), 9000/9001 (MinIO API/Console), 6379 (Redis)
- The database `ssssy_website` is auto-created by `POSTGRES_DB` environment variable

**Troubleshooting:**
- `port is already allocated`: Find and stop the process using the port, or change the host port mapping.
- `Cannot connect to the Docker daemon`: Ensure Docker Desktop is running.
- Container exits immediately: Check logs with `docker compose logs <service>`. Common issues: data directory permissions, environment variable typos.
- Docker not found: Docker not installed or not in PATH. Restart terminal or reinstall Docker.

### Step 3: Wait for Database Initialization

PostgreSQL needs a few seconds to initialize its data directory on first run.

```powershell
# PowerShell:
Write-Host "Waiting for PostgreSQL to be ready..."
do {
  Start-Sleep -Seconds 2
  $ready = docker compose exec postgres pg_isready -U postgres 2>$null
} while (-not $ready)
Write-Host "PostgreSQL is ready!"

# Linux/macOS:
# until docker compose exec postgres pg_isready -U postgres; do sleep 2; done
# echo "PostgreSQL is ready!"
```

**Expected output:**
```
/var/run/postgresql:5432 - accepting connections
```

### Step 4: Run Flyway Migrations

```bash
cd backend

mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/ssssy_website -Dflyway.user=postgres -Dflyway.password=postgres

# Expected output:
# [INFO] --- flyway-maven-plugin:10.11.0:migrate (default-cli) @ ssssy-backend ---
# [INFO] Database: jdbc:postgresql://localhost:5432/ssssy_website (PostgreSQL 16.x)
# [INFO] Successfully applied 18 migrations to schema "public" (execution time 00:03.456s)

# Verify status:
mvn flyway:info -Dflyway.url=jdbc:postgresql://localhost:5432/ssssy_website -Dflyway.user=postgres -Dflyway.password=postgres

# Expected:
# +-----------+---------+-------------------+------+---------------------+---------+
# | Category  | Version | Description       | Type | Installed On        | State   |
# +-----------+---------+-------------------+------+---------------------+---------+
# | Versioned | 1       | users roles       | SQL  | 2024-06-28 12:00:00 | Success |
# | Versioned | 2       | content tables    | SQL  | ...                 | Success |
# | ...       | ...     | ...               | ...  | ...                 | ...     |
# | Versioned | 18      | add two factor    | SQL  | ...                 | Success |
# +-----------+---------+-------------------+------+---------------------+---------+

# List all tables:
docker compose exec postgres psql -U postgres -d ssssy_website -c "\dt"
# Expected: ~40+ tables (users, articles, events, pages, comments, etc.)
```

**Troubleshooting:**
- `ERROR: relation "flyway_schema_history" already exists`: Run `mvn flyway:repair` to fix the schema history table.
- `ERROR: connection refused`: Ensure PostgreSQL is running on localhost:5432. Check with `docker compose ps`.
- Migration fails with SQL error: Check the specific migration file -- error message shows the file and line number.
- `Validate failed: Detected applied migration not resolved locally`: Pull the latest code and re-run.

### Step 5: Create Application Profile Configuration

Create `backend/src/main/resources/application-dev.yml`:

```yaml
# SSSSY Development Profile Configuration
# Overrides application.yml for local development

server:
  port: 8080

spring:
  # Database
  datasource:
    url: jdbc:postgresql://localhost:5432/ssssy_website
    username: postgres
    password: postgres
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

  # JPA
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect

  # Flyway
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

  # File uploads
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 100MB
      enabled: true

  # Jackson
  jackson:
    serialization:
      write-dates-as-timestamps: false
    default-property-inclusion: non_null

  # SMTP (MailHog for dev)
  mail:
    host: localhost
    port: 1025
    username: ""
    password: ""
    properties:
      mail:
        smtp:
          auth: false
          starttls:
            enable: false

# MinIO
minio:
  url: http://localhost:9000
  access-key: ssssy_admin
  secret-key: minio_dev_password
  bucket: ssssy-media

# Redis
redis:
  host: localhost
  port: 6379
  timeout: 2000

# Application
app:
  base-url: http://localhost:3000
  jwt:
    secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
    expiration-ms: 900000
    refresh-expiration-ms: 604800000
  upload:
    max-file-size: 50MB
    allowed-types: image/jpeg,image/png,image/webp,image/gif,application/pdf,application/zip

# Swagger
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html

# Logging
logging:
  level:
    org.ssssy: DEBUG
    org.springframework.security: DEBUG
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG
```

**Property reference summary:**

| Section | Purpose |
|---------|---------|
| `server.port` | HTTP port for the Spring Boot application |
| `spring.datasource.*` | Connection to PostgreSQL database |
| `spring.jpa.hibernate.ddl-auto` | Schema strategy (validate checks existing schema matches entities) |
| `spring.flyway.*` | Database version control via Flyway |
| `spring.servlet.multipart.*` | File upload size limits |
| `minio.*` | MinIO/S3-compatible object storage for media files |
| `redis.*` | Redis for caching, rate limiting, and session data |
| `app.jwt.*` | JWT token authentication configuration |
| `app.upload.*` | File upload restrictions |
| `springdoc.*` | Swagger/OpenAPI documentation paths |
| `logging.level.*` | Log verbosity per package |

### Step 6: Start the Backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Expected output (last lines):
# [INFO] Started SSSSYBackendApplication in X.XXX seconds (process running for X.XXX)
# [INFO] Tomcat started on port 8080 (http) with context path '/'
```

**For verbose logging (debugging):**
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.arguments="--debug"
```

**Troubleshooting:**
- `Port 8080 is already in use`:
  - Windows: `netstat -ano | findstr :8080` then `taskkill /PID <PID> /F`
  - Linux: `sudo lsof -i :8080` then `kill -9 <PID>`
  - Or start on a different port: `mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"`
- `Cannot determine embedded database driver class for NONE`: Your datasource URL is incorrect or PostgreSQL is not accessible.
- `ERROR: relation "flyway_schema_history" does not exist`: Run `mvn flyway:migrate` first.
- Compilation errors: Run `mvn clean compile` first to see detailed errors.

### Step 7: Verify the Backend

```powershell
# 1. Health check:
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP","components":{"db":{"status":"UP"},"diskSpace":{"status":"UP"},"ping":{"status":"UP"}}}

# 2. Swagger UI:
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/swagger-ui.html
# Expected: 200

# 3. OpenAPI docs:
curl http://localhost:8080/api-docs | head -20
# Expected: JSON starting with {"openapi":"3.0.1","info":{...}}

# 4. Public API:
curl http://localhost:8080/api/public/events/upcoming
# Expected: [] (empty array)
```

Open http://localhost:8080/swagger-ui.html in a browser to see all available API endpoints.

### Step 8: Install Frontend Dependencies

```bash
cd frontend
npm install

# Expected:
# added 850 packages in 15s

# Verify key packages:
npm ls next react react-dom tailwindcss @tanstack/react-query @stomp/stompjs axios
```

**Troubleshooting:**
- `npm ERR! code EINTEGRITY`: Delete `package-lock.json` and `node_modules/`, re-run `npm install`.
- `npm ERR! network`: Corporate networks may block npm registry. Use a mirror: `npm config set registry https://registry.npmmirror.com`
- `npm ERR! gyp ERR!`: Native module compilation errors. Install build tools: `npm install -g windows-build-tools` (Windows) or `build-essential` (Linux).

### Step 9: Create Frontend Environment File

```bash
cd frontend

# Create .env.local (PowerShell):
@"
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=SSSSY
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@ | Out-File -FilePath .env.local -Encoding UTF8

# Linux/macOS:
# cat > .env.local << 'EOF'
# NEXT_PUBLIC_API_URL=http://localhost:8080/api
# NEXT_PUBLIC_APP_NAME=SSSSY
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# EOF
```

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Base URL for all API requests (REST endpoints) |
| `NEXT_PUBLIC_APP_NAME` | `SSSSY` | Application display name (browser title, header, meta tags) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public URL (SEO, OG tags, redirects) |

### Step 10: Start the Frontend

```bash
cd frontend
npm run dev

# Expected:
# - Next.js 14.2.3
# - Local: http://localhost:3000
# - Ready in 2.4s
```

**Troubleshooting:**
- `Port 3000 is already in use`: Use `npm run dev -- -p 3001`.
- `Module not found: Can't resolve '...'`: Run `npm install` again.
- Tailwind CSS not applying: Ensure `tailwind.config.js` properly configured.
- Blank page at localhost:3000: Open browser console -- common issue: API URL is wrong in `.env.local`.

### Step 11: Create Admin User

**Method A: Via API (recommended -- password is properly hashed):**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@ssssy.org","password":"Admin123!","firstNameEn":"Admin","lastNameEn":"User"}'

# Expected:
# {"success":true,"data":{"id":"uuid","username":"admin","email":"admin@ssssy.org","role":"ADMIN","firstNameEn":"Admin","lastNameEn":"User"}}
```

Note: The API may register with USER role by default. Check the response and promote to ADMIN via SQL if needed.

**Method B: Via SQL (more control over role):**
```bash
# Generate bcrypt hash online at https://bcrypt-generator.com (hash "Admin123!" with 10 rounds)

# Linux/macOS:
docker compose exec -T postgres psql -U postgres -d ssssy_website <<'EOF'
INSERT INTO users (id, username, email, password, first_name_en, last_name_en, role, is_active, is_email_verified, created_at, updated_at)
VALUES (gen_random_uuid(), 'admin', 'admin@ssssy.org',
'$2a$10$8Un1R40N6TnRMEh4y8nX9eYv1mXe5WqX3z9y8v7u6b5n4m3l2k1j0h9g8f7d',
'Admin', 'User', 'ADMIN', true, true, NOW(), NOW());
EOF

# Windows PowerShell (escaped dollar signs):
docker compose exec postgres psql -U postgres -d ssssy_website -c "INSERT INTO users (id, username, email, password, first_name_en, last_name_en, role, is_active, is_email_verified, created_at, updated_at) VALUES (gen_random_uuid(), 'admin', 'admin@ssssy.org', '\$2a\$10\$8Un1R40N6TnRMEh4y8nX9eYv1mXe5WqX3z9y8v7u6b5n4m3l2k1j0h9g8f7d', 'Admin', 'User', 'ADMIN', true, true, NOW(), NOW());"
```

**Verify admin user:**
```bash
docker compose exec postgres psql -U postgres -d ssssy_website -c "SELECT id, username, email, role, is_active FROM users;"
```

**Default admin credentials:** Username: `admin`, Password: `Admin123!`

**Troubleshooting:**
- `duplicate key value violates unique constraint "users_username_key"`: Admin user already exists. Skip this step.
- `ERROR: syntax error at end of input`: Check quoting of special characters ($$ in bcrypt hash).

### Step 12: Verify Full Stack Integration

```powershell
# 1. Login via API:
$loginResponse = curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"Admin123!"}'

# 2. Extract token:
$token = ($loginResponse | ConvertFrom-Json).data.token

# 3. Test authenticated endpoint:
curl -X GET http://localhost:8080/api/content/articles `
  -H "Authorization: Bearer $token"
# Expected: {"success":true,"data":{"content":[],"page":0,...}}

# 4. Test file upload:
curl -X POST http://localhost:8080/api/media/upload `
  -H "Authorization: Bearer $token" `
  -F "file=@README.md"
# Expected: {"success":true,"data":{"id":"...","fileName":"README.md",...}}

# 5. Test WebSocket:
# Install wscat: npm install -g wscat
wscat -c ws://localhost:8080/ws
# Expected: Connected

# 6. Check scheduled tasks:
docker compose logs backend | Select-String -Pattern "ContentScheduler|EmailScheduledSend"
```

**Verification checklist for local setup:**
- [ ] Backend health endpoint returns UP
- [ ] Swagger UI loads at http://localhost:8080/swagger-ui.html
- [ ] Frontend loads at http://localhost:3000
- [ ] Login works (admin / Admin123!)
- [ ] Admin panel accessible (navigate to /admin)
- [ ] Content CRUD works (try creating an article)
- [ ] File upload works (try uploading an image)
- [ ] WebSocket connects (console shows "WebSocket connected")
- [ ] Database has ~40+ tables

---

## 3. Production Deployment (Docker)

### 3.1 Docker Compose Architecture

The production deployment uses `docker-compose.prod.yml` with 5 services:

| Service | Image | Role | Ports |
|---------|-------|------|-------|
| **postgres** | `postgres:16-alpine` | Database | 5432 (internal) |
| **minio** | `minio/minio:latest` | S3-compatible object storage | 9000 (API), 9001 (Console) |
| **redis** | `redis:7-alpine` | Caching, rate limiting, WebSocket pub/sub | 6379 (internal) |
| **backend** | Custom build | Spring Boot API | 8080 (internal) |
| **frontend** | Custom build | Next.js application | 3000 (internal) |

All services are connected via a dedicated bridge network `ssssy-network`.

### 3.2 Environment File (.env)

Create a `.env` file in the project root. **Never commit this file to version control.**

```bash
# =============================================================================
# SSSSY Production Environment Variables
# All values shown are examples -- generate secure random values for production
# =============================================================================

# Database
DB_USER=ssssy
DB_PASSWORD=CHANGE_ME_TO_A_RANDOM_32_CHAR_PASSWORD
# Generate: openssl rand -base64 32

# JWT
JWT_SECRET=CHANGE_ME_TO_A_256_BIT_HEX_SECRET
# Generate: openssl rand -hex 32 (64 hex characters)
# This is critical for security -- if compromised, all tokens can be forged

# Storage
STORAGE_TYPE=minio
MINIO_ACCESS_KEY=ssssy_admin
MINIO_SECRET_KEY=CHANGE_ME_TO_A_RANDOM_PASSWORD
# Generate: openssl rand -base64 24
MINIO_BUCKET=ssssy-media

# Application
APP_BASE_URL=https://ssssy.org.sy
LOG_LEVEL=INFO

# SMTP (required for registration, notifications, newsletters)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=noreply@ssssy.org.sy
SMTP_PASSWORD=CHANGE_ME_TO_SMTP_PASSWORD

# IMAP (required for email sync)
IMAP_HOST=imap.example.com
IMAP_PORT=143

# Backup
BACKUP_DIR=/opt/ssssy/backups
BACKUP_RETENTION_DAYS=30
```

**Generate secure values:**
```bash
openssl rand -base64 32   # DB_PASSWORD (32 chars, base64)
openssl rand -hex 32      # JWT_SECRET (64 hex chars = 256 bits)
openssl rand -base64 24   # MINIO_SECRET_KEY
openssl rand -base64 12   # SMTP_PASSWORD
```

### 3.3 Dockerfile Analysis

#### Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
# Build stage: Uses Maven 3.9 with Temurin JDK 21

WORKDIR /app
COPY pom.xml .
# Copy pom.xml first for layer caching

RUN mvn dependency:go-offline -B
# Download all dependencies (cached until pom.xml changes)

COPY src ./src
RUN mvn clean package -DskipTests -B
# Build the application JAR

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
# Runtime stage: JRE 21 on Alpine Linux (~200MB vs ~700MB for JDK)

WORKDIR /app
RUN addgroup -S ssssy && adduser -S ssssy -G ssssy
# Create non-root user for security

COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
USER ssssy
# Run as non-root (reduces attack surface)

ENTRYPOINT ["java", "-jar", "app.jar"]
# Startup command. Override JVM options via entrypoint in docker-compose.
```
**Key takeaways:**
- Multi-stage build: Build (~700MB) -> runtime (~200MB) = ~85% smaller
- Layer caching: `dependency:go-offline` cached until `pom.xml` changes
- Runs as non-root `ssssy` user for security

#### Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
# Clean install from lock file (deterministic builds)

COPY . .
RUN npm run build
# Next.js build with "output: standalone" in next.config.mjs
# Creates .next/standalone/ with bundled server

# Stage 2: Runtime
FROM node:18-alpine AS runtime
WORKDIR /app
RUN addgroup -S ssssy && adduser -S ssssy -G ssssy
# Non-root user

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
USER ssssy
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENTRYPOINT ["node", "server.js"]
```
**Key takeaways:**
- Standalone output (next.config.mjs: `output: "standalone"`) creates self-contained deployment
- No node_modules at runtime -- all bundled in standalone
- Non-root security, minimal attack surface

### 3.4 Docker Volume Strategy

The production compose file defines 5 named volumes for persistent data:

```yaml
volumes:
  postgres_data:     # PostgreSQL data (backup daily)
  minio_data:        # MinIO object storage (backup daily)
  redis_data:        # Redis persistence (can rebuild from data)
  backend_uploads:   # Local uploads (when STORAGE_TYPE=local)
  backend_logs:      # Application logs (rotated by Logback)
```

**Backup script** (save as `/opt/ssssy/backup.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/opt/ssssy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p ${BACKUP_DIR}

# PostgreSQL dump:
docker exec ssssy-postgres pg_dump -U ${DB_USER:-ssssy} -d ssssy_website | gzip > ${BACKUP_DIR}/postgres_${DATE}.sql.gz

# Docker volume backup:
docker run --rm -v ssssy_postgres_data:/source -v ${BACKUP_DIR}:/dest alpine tar czf /dest/postgres_data_${DATE}.tar.gz -C /source .
docker run --rm -v ssssy_minio_data:/source -v ${BACKUP_DIR}:/dest alpine tar czf /dest/minio_data_${DATE}.tar.gz -C /source .

# Clean backups older than 30 days:
find ${BACKUP_DIR} -name "*.gz" -mtime +30 -delete

# Restore database:
# gunzip -c postgres_20240101_120000.sql.gz | docker exec -i ssssy-postgres psql -U ssssy -d ssssy_website
```

### 3.5 Network Configuration

```yaml
networks:
  default:
    name: ssssy-network
    driver: bridge
```

Services communicate using service names as hostnames:
- Backend connects to `postgres:5432`, `redis:6379`, `minio:9000`
- Frontend connects to `backend:8080`
- External access only through explicitly mapped ports

### 3.6 Health Check Configuration

```yaml
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-ssssy} -d ssssy_website"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      postgres:
        condition: service_healthy    # Wait for PostgreSQL to be healthy
      minio:
        condition: service_started
      redis:
        condition: service_started

  minio:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
```

### 3.7 Resource Limits and Reservations

```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G

  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  frontend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  minio:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G

  redis:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 3.8 Logging Configuration

**Docker json-file driver with rotation:**
```yaml
services:
  backend:
    logging:
      driver: json-file
      options:
        max-size: "10m"       # Rotate log file at 10MB
        max-file: "3"          # Keep 3 rotated files
        compress: "true"       # Compress rotated logs with gzip

  postgres:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  minio:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    logging:
      driver: json-file
      options:
        max-size: "5m"
        max-file: "2"
```

**Centralized logging (optional -- Loki + Grafana):**
```yaml
services:
  loki:
    image: grafana/loki:2.9.0
    ports: ["3100:3100"]
    volumes: [loki_data:/loki]

  promtail:
    image: grafana/promtail:2.9.0
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./promtail-config.yml:/etc/promtail/config.yml

  grafana:
    image: grafana/grafana:10.4.0
    ports: ["3001:3000"]
    volumes: [grafana_data:/var/lib/grafana]
```

### 3.9 Secrets Management

**Option A: Docker secrets (Swarm mode):**
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
services:
  backend:
    secrets:
      - db_password
    environment:
      SPRING_DATASOURCE_PASSWORD_FILE: /run/secrets/db_password
```

**Option B: Environment file (.env) -- simplest, recommended for most setups:**
```bash
chmod 600 .env
# Owner can read/write, nobody else can access
```

### 3.10 Deploying Production

```bash
# 1. Create .env file with all production values
nano .env
chmod 600 .env

# 2. Create Docker volumes (if they do not exist):
docker volume create ssssy_postgres_data
docker volume create ssssy_minio_data
docker volume create ssssy_redis_data
docker volume create ssssy_backend_uploads
docker volume create ssssy_backend_logs

# 3. Pull base images:
docker compose -f docker-compose.prod.yml pull

# 4. Build custom images:
docker compose -f docker-compose.prod.yml build --no-cache

# 5. Start all services:
docker compose -f docker-compose.prod.yml up -d

# Expected:
# [+] Running 6/6
#  - Container ssssy-postgres  Started
#  - Container ssssy-minio     Started
#  - Container ssssy-redis     Started
#  - Container ssssy-backend   Started
#  - Container ssssy-frontend  Started

# 6. Check logs:
docker compose -f docker-compose.prod.yml logs -f backend

# 7. Verify backend health:
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP",...}

# 8. Verify frontend:
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Expected: 200

# 9. Scale backend horizontally (requires load balancer):
docker compose -f docker-compose.prod.yml up -d --scale backend=3

# 10. Shutdown:
docker compose -f docker-compose.prod.yml down
# Add -v to remove volumes (WARNING: deletes all data)
```

**Troubleshooting production deployment:**

| Symptom | Cause | Solution |
|---------|-------|----------|
| Backend connection refused to postgres | PostgreSQL not ready | Add `restart: unless-stopped` or increase health check retries |
| Frontend blank page | API URL misconfigured | Check `NEXT_PUBLIC_API_URL` in compose environment |
| File upload fails | MinIO bucket not created | Create bucket: `docker exec ssssy-minio mc mb data/ssssy-media` |
| 413 Request Entity Too Large | Nginx limit | Increase `client_max_body_size` in nginx config |
| 429 Too Many Requests | Rate limiting | Check Bucket4j configuration, increase limits if needed |
| OOMKilled | Container exceeds memory | Increase memory limit in deploy.resources.limits |

---

## 4. Mail Server Setup (Mailcow)

### 4.1 Prerequisites

**Hardware requirements (for Mailcow alone):**
| CPU | RAM | Disk | Network |
|-----|-----|------|---------|
| 2 cores | 4 GB minimum (8 GB recommended) | 40 GB+ SSD | Clean IP, not on any blacklist |

**DNS prerequisite records (must be propagated before installation):**
```bash
dig A mail.ssssy.org.sy +short       # Must return server IP
dig MX ssssy.org.sy +short           # Must show mail.ssssy.org.sy
dig TXT ssssy.org.sy +short          # SPF record showing mail server
```

**Port requirements:**
| Port | Protocol | Service | Purpose |
|------|----------|---------|---------|
| 25 | TCP | SMTP | Incoming mail from other servers (often blocked by ISPs) |
| 465 | TCP | SMTPS | SMTP with SSL/TLS |
| 587 | TCP | Submission | SMTP with STARTTLS (recommended for backend) |
| 143 | TCP | IMAP | IMAP with STARTTLS |
| 993 | TCP | IMAPS | IMAP with SSL/TLS |
| 80 | TCP | HTTP | Let's Encrypt HTTP-01 challenge |
| 443 | TCP | HTTPS | Mailcow web UI |

**Firewall configuration (UFW on Ubuntu):**
```bash
sudo ufw allow 25/tcp    # SMTP
sudo ufw allow 465/tcp   # SMTPS
sudo ufw allow 587/tcp   # Submission
sudo ufw allow 143/tcp   # IMAP
sudo ufw allow 993/tcp   # IMAPS
sudo ufw allow 80/tcp    # HTTP (Let's Encrypt)
sudo ufw allow 443/tcp   # HTTPS (web UI)
sudo ufw reload
```

**Reverse DNS (PTR record):**
Contact your hosting provider to set the PTR record for your server IP to `mail.ssssy.org.sy`.
This is critical for email deliverability -- many mail servers reject emails from IPs without matching PTR records.

### 4.2 Mailcow Installation

```bash
# 1. Install prerequisites:
sudo apt update
sudo apt install -y git curl wget docker.io docker-compose-plugin

# 2. Clone Mailcow:
cd /opt
sudo git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized

# 3. Generate configuration:
sudo ./generate_config.sh
# Prompts:
# - Mail server hostname (FQDN): mail.ssssy.org.sy
# - Timezone: Asia/Damascus (or your timezone)

# 4. Edit mailcow.conf:
sudo nano mailcow.conf
```

**Key Mailcow configuration options:**
```bash
MAILCOW_HOSTNAME=mail.ssssy.org.sy       # REQUIRED - FQDN of mail server
MAILCOW_DOMAIN=ssssy.org.sy              # REQUIRED - Primary email domain
HTTP_PORT=8081                           # Avoid conflict with backend (8080)
HTTPS_PORT=8443                          # Avoid conflict with nginx (443)
SKIP_LETS_ENCRYPT=n                      # We will use certbot manually
SKIP_CLAMAV=y                            # Disable ClamAV if low on RAM
SKIP_RSPAMD=y                            # Disable Rspamd if spam filtering not needed
ADDITIONAL_SAN=autodiscover.ssssy.org.sy,autoconfig.ssssy.org.sy
```

```bash
# 5. Start Mailcow:
sudo docker compose pull
sudo docker compose up -d
# First startup takes several minutes (24 containers)

# 6. Check all services:
sudo docker compose ps
# Expected: 23+ services running

# 7. Check for errors:
sudo docker compose logs | grep "ERROR"
```

### 4.3 DKIM Key Generation and DNS Setup

DKIM (DomainKeys Identified Mail) cryptographically signs outgoing emails so receiving servers verify authenticity.

```bash
# Generate DKIM key via Mailcow UI:
# Login to https://mail.ssssy.org.sy (default: admin / moo -- CHANGE IMMEDIATELY)
# Configuration -> ARC/DKIM/DMARC/SPF -> DKIM Keys tab
# Add domain: ssssy.org.sy, key length: 2048 bits
# Copy the generated DNS record

# Or generate via command line:
sudo docker exec -it $(sudo docker ps -qf name=postfix-mailcow) bash
cd /tmp
openssl genrsa -out dkim_private.pem 2048
openssl rsa -in dkim_private.pem -pubout -out dkim_public.pem
cat dkim_public.pem

# Add DKIM DNS record:
# Name:  default._domainkey.ssssy.org.sy
# Type:  TXT
# Value: v=DKIM1; h=sha256; k=rsa; p=<your public key>

# Verify DKIM record:
dig TXT default._domainkey.ssssy.org.sy +short
# Expected: "v=DKIM1; h=sha256; k=rsa; p=..."
```

### 4.4 SPF and DMARC Configuration

**SPF (Sender Policy Framework):** Authorizes which servers can send email for your domain.
```
Name:  ssssy.org.sy
Type:  TXT
Value: v=spf1 mx a:mail.ssssy.org.sy include:mail.ssssy.org.sy ~all
```
- `mx`: All servers listed in MX records can send
- `a:mail.xxx`: The A record of mail.ssssy.org.sy can send
- `~all`: Softfail for unauthorized senders (use `-all` after testing)

**DMARC (Domain-based Message Authentication, Reporting & Conformance):**
```
Name:  _dmarc.ssssy.org.sy
Type:  TXT
Value: v=DMARC1; p=quarantine; sp=quarantine; adkim=r; aspf=r;
       rua=mailto:dmarc-reports@ssssy.org.sy; pct=100; ri=86400
```
- `p=none` initially to monitor
- After 2 weeks: change to `p=quarantine`
- After 1 month: change to `p=reject` (if no issues)

### 4.5 Integration with SSSSY Backend

**Environment variables for production (.env):**
```bash
SPRING_MAIL_HOST=mail.ssssy.org.sy
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=noreply@ssssy.org.sy
SPRING_MAIL_PASSWORD=your_mailcow_password
SPRING_MAIL_SMTP_AUTH=true
SPRING_MAIL_SMTP_STARTTLS=true
SSSSY_EMAIL_IMAP_HOST=mail.ssssy.org.sy
SSSSY_EMAIL_IMAP_PORT=993
```

**Application config (application-prod.yml):**
```yaml
ssssy:
  email:
    smtp:
      host: mail.ssssy.org.sy
      port: 587
      username: noreply@ssssy.org.sy
      password: ${MAILCOW_RELAY_PASSWORD}
    imap:
      host: mail.ssssy.org.sy
      port: 993
    domain: ssssy.org.sy
    default-quota: 1073741824
```

### 4.6 Testing Email Flow

```bash
# 1. Create a mailbox in Mailcow admin:
# Login to https://mail.ssssy.org.sy
# Mailboxes -> Add mailbox
# Email: test@ssssy.org.sy, Password: Test123!

# 2. Send test email via backend API:
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}' | jq -r '.data.token')

curl -X POST http://localhost:8080/api/admin/email/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@ssssy.org.sy",
    "to": ["test@ssssy.org.sy"],
    "subject": "Test Email from SSSSY",
    "bodyText": "This is a test email.",
    "bodyHtml": "<h1>Test Email</h1><p>This is a test email.</p>"
  }'

# 3. Check logs:
sudo docker compose -f /opt/mailcow-dockerized/docker-compose.yml logs postfix-mailcow

# 4. Check delivery:
# Login to webmail at https://mail.ssssy.org.sy/SOGo with test@ssssy.org.sy

# 5. Check email headers for DKIM-Signature, Authentication-Results

# 6. Test deliverability score at https://www.mail-tester.com (aim for 10/10)
```

### 4.7 Troubleshooting Common Email Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not delivered | Server IP blacklisted | Check mxtoolbox.com, request delisting |
| Goes to spam folder | Missing SPF/DKIM/DMARC | Verify DNS records and propagation |
| DKIM signature missing | Key not generated or DNS not propagated | Regenerate DKIM key, verify DNS |
| SMTP connection refused | Port blocked by firewall | Check firewall, ensure ports 25/587/465 open |
| "Relay access denied" | Mailcow not configured | Configuration -> Mail -> Relay recipients |
| "Sender address rejected" | SMTP username/mismatch | Ensure From address domain matches SMTP user |
| IMAP sync fails | SSL certificate issue | Verify SSL, check IMAP port connectivity |
| High spam score | No reverse DNS (PTR) | Set PTR to mail.ssssy.org.sy with hosting provider |

**Testing tools:**
```bash
# SMTP test:
openssl s_client -starttls smtp -connect mail.ssssy.org.sy:587 -crlf
EHLO test.com
MAIL FROM:<test@ssssy.org.sy>
RCPT TO:<recipient@example.com>
DATA
Subject: Test
Test message
.
QUIT

# IMAP test:
openssl s_client -connect mail.ssssy.org.sy:993 -crlf
A1 LOGIN noreply@ssssy.org.sy yourpassword
A2 LIST "" "*"
A3 LOGOUT

# Check mail queue:
sudo docker exec -it $(docker ps -qf name=postfix-mailcow) postqueue -p
```

---

## 5. Nginx Reverse Proxy Configuration

### 5.1 Complete Nginx Configuration

Create `/etc/nginx/sites-available/ssssy.org.sy`:

```nginx
# =============================================================================
# SSSSY Production Nginx Configuration
# Architecture:
#   Browser -> Nginx (443) -> Frontend (localhost:3000) for /
#   Browser -> Nginx (443) -> Backend (localhost:8080) for /api/
#   Browser -> Nginx (443) -> MinIO (localhost:9000) for /media/
#   Browser -> Nginx (443) -> Backend (localhost:8080) for /ws/
# =============================================================================

# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name ssssy.org.sy api.ssssy.org.sy mail.ssssy.org.sy;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# Main domain
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ssssy.org.sy www.ssssy.org.sy;

    # SSL
    ssl_certificate /etc/letsencrypt/live/ssssy.org.sy/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ssssy.org.sy/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/ssssy.org.sy/chain.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 1.1.1.1 8.8.8.8 valid=300s;
    resolver_timeout 5s;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' ws: wss: https://api.ssssy.org.sy; object-src 'none'; base-uri 'self'; form-action 'self'" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types text/plain text/css text/javascript application/javascript application/json application/xml image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/s;

    # Logging
    access_log /var/log/nginx/ssssy_access.log combined buffer=512k flush=1m;
    error_log /var/log/nginx/ssssy_error.log warn;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        limit_req zone=api_limit burst=50 nodelay;
        client_max_body_size 100M;
    }

    # Auth (stricter rate limiting)
    location /api/auth/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        limit_req zone=auth_limit burst=10 nodelay;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_buffering off;
    }

    # Actuator (restricted)
    location /actuator/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        allow 172.16.0.0/12;
        deny all;
    }

    # Media files via MinIO
    location /media/ {
        proxy_pass http://localhost:9000/ssssy-media/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        expires 30d;
        add_header Cache-Control "public, immutable, max-age=2592000";
        add_header Access-Control-Allow-Origin "*";
    }

    # Deny hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}

# API subdomain (optional)
server {
    listen 443 ssl http2;
    server_name api.ssssy.org.sy;

    ssl_certificate /etc/letsencrypt/live/api.ssssy.org.sy/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ssssy.org.sy/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_stapling on;
    ssl_stapling_verify on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Mailcow subdomain
server {
    listen 443 ssl http2;
    server_name mail.ssssy.org.sy;

    ssl_certificate /etc/letsencrypt/live/mail.ssssy.org.sy/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mail.ssssy.org.sy/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_stapling on;
    ssl_stapling_verify on;

    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 300s;
    }
}
```

### 5.2 Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/ssssy.org.sy /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default   # Remove default site
sudo nginx -t                              # Test configuration
# Expected: syntax is ok, test is successful
sudo systemctl reload nginx                # Reload
```

### 5.3 fail2ban Integration

```bash
# Install fail2ban:
sudo apt install -y fail2ban

# Create Nginx filter:
sudo tee /etc/fail2ban/filter.d/nginx-ssssy.conf << 'EOF'
[Definition]
failregex = ^<HOST> -.*"(GET|POST).*" (401|403|404|429).*$
ignoreregex =
EOF

# Create jail:
sudo tee /etc/fail2ban/jail.local << 'EOF'
[nginx-ssssy-auth]
enabled = true
filter = nginx-ssssy
logpath = /var/log/nginx/ssssy_access.log
maxretry = 10
findtime = 300
bantime = 3600
action = iptables-multiport[name=ssssy-auth, port="80,443", protocol=tcp]

[nginx-ssssy-badbots]
enabled = true
filter = nginx-badbots
logpath = /var/log/nginx/ssssy_access.log
maxretry = 1
findtime = 86400
bantime = 86400
EOF

# Restart and verify:
sudo systemctl restart fail2ban
sudo fail2ban-client status nginx-ssssy-auth
```

### 5.4 Admin Panel IP Restriction (Optional)

```nginx
location /admin/ {
    allow 203.0.113.0/24;  # Office network
    allow 198.51.100.0/24; # VPN network
    deny all;

    proxy_pass http://localhost:3000;
    # ... other proxy settings
}
```

---

## 6. SSL/TLS Setup with Let's Encrypt

### 6.1 Install Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
certbot --version
# Expected: certbot 2.x.x
```

### 6.2 Obtain SSL Certificates

**Method 1: Nginx plugin (automated):**
```bash
sudo certbot --nginx -d ssssy.org.sy -d www.ssssy.org.sy --non-interactive --agree-tos -m admin@ssssy.org.sy
sudo certbot --nginx -d api.ssssy.org.sy --non-interactive --agree-tos -m admin@ssssy.org.sy
sudo certbot --nginx -d mail.ssssy.org.sy --non-interactive --agree-tos -m admin@ssssy.org.sy

# Certbot modifies Nginx config and handles HTTP -> HTTPS redirect
```

**Method 2: Standalone (for non-Nginx setups):**
```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone -d ssssy.org.sy -d *.ssssy.org.sy --non-interactive --agree-tos -m admin@ssssy.org.sy
sudo systemctl start nginx
```

**Method 3: DNS challenge (wildcard certificate):**
```bash
# For Cloudflare DNS:
sudo apt install -y python3-certbot-dns-cloudflare
sudo tee /etc/letsencrypt/cloudflare.ini << 'EOF'
dns_cloudflare_api_token = your_cloudflare_api_token
EOF
sudo chmod 600 /etc/letsencrypt/cloudflare.ini

sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d ssssy.org.sy -d *.ssssy.org.sy \
  --non-interactive --agree-tos -m admin@ssssy.org.sy
```

### 6.3 Certificate Auto-Renewal

**Option A: Systemd timer (default, recommended):**
```bash
sudo systemctl status certbot.timer
# Expected: active (waiting), triggers twice daily

# If not enabled:
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal:
sudo certbot renew --dry-run
# Expected: Congratulations, all renewals succeeded.
```

**Option B: Cron job:**
```bash
sudo crontab -e
# Add:
0 3,15 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
```

### 6.4 SSL Verification

```bash
# Check certificate details:
sudo openssl x509 -in /etc/letsencrypt/live/ssssy.org.sy/cert.pem -text -noout | head -20

# Check expiry:
sudo certbot certificates

# SSL Labs test: https://www.ssllabs.com/ssltest/analyze.html?d=ssssy.org.sy
# Aim for grade A or A+

# Protocol check:
nmap --script ssl-enum-ciphers -p 443 ssssy.org.sy

# Monitoring: Use https://certificate.new or UptimeRobot
```

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: SSSSY CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME_BACKEND: ${{ github.repository }}/backend
  IMAGE_NAME_FRONTEND: ${{ github.repository }}/frontend

jobs:
  # Job 1: Backend Build & Test
  backend-build:
    name: Backend Build & Test
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: ssssy_website_test
          POSTGRES_USER: ssssy
          POSTGRES_PASSWORD: test_password
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: 'maven'
      - name: Cache Maven dependencies
        uses: actions/cache@v3
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('backend/pom.xml') }}
      - name: Run Flyway migrations
        run: cd backend && mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/ssssy_website_test -Dflyway.user=ssssy -Dflyway.password=test_password
      - name: Build & Test
        run: cd backend && mvn clean verify -B
        env:
          SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/ssssy_website_test
          SPRING_DATASOURCE_USERNAME: ssssy
          SPRING_DATASOURCE_PASSWORD: test_password
      - name: Upload JAR
        uses: actions/upload-artifact@v4
        with:
          name: backend-jar
          path: backend/target/*.jar

  # Job 2: Frontend Build & Lint
  frontend-build:
    name: Frontend Build & Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node.js 18
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Lint
        run: cd frontend && npm run lint
      - name: Type check
        run: cd frontend && npx tsc --noEmit
      - name: Build
        run: cd frontend && npm run build
        env:
          NEXT_PUBLIC_API_URL: https://api.ssssy.org.sy

  # Job 3: Docker Build & Push
  docker-build:
    name: Docker Image Build & Push
    needs: [backend-build, frontend-build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build & Push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_BACKEND }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - name: Build & Push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_FRONTEND }}:${{ github.sha }}

  # Job 4: Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    needs: docker-build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: SSH Deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/ssssy
            docker compose pull
            docker compose up -d --force-recreate backend frontend
            docker image prune -f

  # Job 5: Deploy to Production
  deploy-production:
    name: Deploy to Production
    needs: docker-build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://ssssy.org.sy
    steps:
      - name: SSH Deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            set -e
            cd /opt/ssssy
            # Backup database before deployment
            docker compose exec -T postgres pg_dump -U ssssy -d ssssy_website | gzip > backups/pre-deploy-$(date +%Y%m%d_%H%M%S).sql.gz
            # Pull latest images
            docker compose pull
            # Gracefully restart services
            docker compose up -d --no-deps --force-recreate postgres minio redis
            sleep 10
            docker compose up -d --no-deps --force-recreate backend
            sleep 15
            docker compose up -d --no-deps --force-recreate frontend
            # Clean up old images
            docker image prune -af --filter "until=48h"
```

### 7.2 GitLab CI Alternative

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - docker
  - deploy

variables:
  DOCKER_IMAGE_BACKEND: $CI_REGISTRY_IMAGE/backend
  DOCKER_IMAGE_FRONTEND: $CI_REGISTRY_IMAGE/frontend

backend-test:
  stage: test
  image: maven:3.9-eclipse-temurin-21
  services:
    - name: postgres:16-alpine
      alias: postgres
      variables:
        POSTGRES_DB: ssssy_website_test
        POSTGRES_USER: ssssy
        POSTGRES_PASSWORD: test_password
  script:
    - cd backend
    - mvn flyway:migrate -Dflyway.url=jdbc:postgresql://postgres:5432/ssssy_website_test
    - mvn clean verify -B

frontend-build:
  stage: build
  image: node:18-alpine
  script:
    - cd frontend
    - npm ci
    - npm run lint
    - npx tsc --noEmit
    - npm run build

docker-build:
  stage: docker
  image: docker:24
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE_BACKEND:$CI_COMMIT_SHORT_SHA ./backend
    - docker build -t $DOCKER_IMAGE_FRONTEND:$CI_COMMIT_SHORT_SHA ./frontend
    - docker push $DOCKER_IMAGE_BACKEND:$CI_COMMIT_SHORT_SHA
    - docker push $DOCKER_IMAGE_FRONTEND:$CI_COMMIT_SHORT_SHA

deploy-production:
  stage: deploy
  only:
    - main
  script:
    - apt-get update && apt-get install -y openssh-client
    - eval $(ssh-agent -s)
    - echo "$PROD_SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - ssh -o StrictHostKeyChecking=no $PROD_USER@$PROD_HOST "cd /opt/ssssy && docker compose pull && docker compose up -d --force-recreate backend frontend"
```

### 7.3 Rollback Procedure

Create `/opt/ssssy/rollback.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/opt/ssssy/backups"

if [ -z "$1" ]; then
    echo "Usage: $0 <previous_image_tag>"
    echo "Example: $0 v1.2.3"
    exit 1
fi

LATEST_DB=$(ls -t ${BACKUP_DIR}/postgres_*.sql.gz 2>/dev/null | head -1)
if [ -z "$LATEST_DB" ]; then
    echo "ERROR: No database backups found in ${BACKUP_DIR}"
    exit 1
fi

echo "=== Rollback to $1 ==="
echo "Restoring database from $LATEST_DB..."
gunzip -c "$LATEST_DB" | docker exec -i ssssy-postgres psql -U ssssy -d ssssy_website

echo "Rolling back Docker images to $1..."
export BACKEND_IMAGE_TAG=$1
export FRONTEND_IMAGE_TAG=$1
docker compose -f docker-compose.prod.yml up -d --force-recreate backend frontend

echo "Verifying..."
sleep 30
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health)
if [ "$HEALTH" = "200" ]; then
    echo "SUCCESS: Backend is healthy"
else
    echo "WARNING: Backend returned HTTP $HEALTH"
fi

echo "Rollback completed at $(date)"
```

---

## 8. Environment Configuration Reference

### 8.1 Backend application.yml -- Complete Property Reference

#### Server Configuration

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `server.port` | `8080` | No | HTTP port for the Spring Boot application |
| `server.compression.enabled` | `false` | No | Enable response compression (gzip) |
| `server.compression.mime-types` | `text/html,text/xml,...` | No | MIME types to compress |
| `server.error.include-stacktrace` | `never` | No | Include stacktrace: `always`, `on-param`, `never` |
| `server.tomcat.max-connections` | `8192` | No | Maximum connections Tomcat accepts |
| `server.tomcat.threads.max` | `200` | No | Maximum worker threads |
| `server.tomcat.threads.min-spare` | `10` | No | Minimum spare threads |
| `server.tomcat.accept-count` | `100` | No | Maximum queue length for incoming requests |
| `server.tomcat.connection-timeout` | `20000` | No | Connection timeout in milliseconds |

#### Spring Datasource (PostgreSQL)

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/ssssy_website` | Yes | PostgreSQL JDBC connection URL |
| `spring.datasource.username` | `ssssy` | Yes | Database user with read/write access |
| `spring.datasource.password` | `ssssy_dev_password` | **Yes** | Database user password. Override in production. |
| `spring.datasource.driver-class-name` | `org.postgresql.Driver` | No | JDBC driver class (auto-detected) |
| `spring.datasource.hikari.maximum-pool-size` | `10` | No | Max connections in pool |
| `spring.datasource.hikari.minimum-idle` | `5` | No | Min idle connections |
| `spring.datasource.hikari.connection-timeout` | `30000` | No | Max wait time (ms) for connection |
| `spring.datasource.hikari.idle-timeout` | `600000` | No | Max idle time (ms) before closing |
| `spring.datasource.hikari.max-lifetime` | `1800000` | No | Max connection lifetime (ms) |

#### JPA / Hibernate

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `spring.jpa.hibernate.ddl-auto` | `validate` | No | Schema strategy: `none`, `validate`, `update`, `create`. Never `create` in production. |
| `spring.jpa.show-sql` | `false` | No | Log SQL statements (dev only) |
| `spring.jpa.properties.hibernate.format_sql` | `true` | No | Pretty-print SQL |
| `spring.jpa.properties.hibernate.dialect` | `PostgreSQLDialect` | No | Hibernate dialect for PostgreSQL |
| `spring.jpa.open-in-view` | `true` | No | OSIV. Set `false` in production. |

#### Flyway

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `spring.flyway.enabled` | `true` | No | Enable auto-migration on startup |
| `spring.flyway.locations` | `classpath:db/migration` | No | Migration SQL files location |
| `spring.flyway.baseline-on-migrate` | `true` | No | Auto-baseline if history table missing |
| `spring.flyway.validate-on-migrate` | `true` | No | Validate migrations before running |

#### Jackson (JSON)

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `spring.jackson.serialization.write-dates-as-timestamps` | `false` | No | Use ISO-8601 strings for dates |
| `spring.jackson.default-property-inclusion` | `non_null` | No | `always`, `non_null`, `non_empty` |
| `spring.jackson.time-zone` | `null` | No | Default timezone (e.g., `Asia/Damascus`) |

#### Spring Mail (SMTP)

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `spring.mail.host` | `localhost` | Yes | SMTP server hostname |
| `spring.mail.port` | `1025` | Yes | SMTP port (25, 587, 465) |
| `spring.mail.username` | `` | No | SMTP authentication username |
| `spring.mail.password` | `` | No | SMTP authentication password |
| `spring.mail.properties.mail.smtp.auth` | `false` | No | Enable SMTP authentication |
| `spring.mail.properties.mail.smtp.starttls.enable` | `false` | No | Enable STARTTLS encryption |
| `spring.mail.properties.mail.smtp.connectiontimeout` | `5000` | No | SMTP connection timeout (ms) |

#### MinIO / S3 Storage

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `app.storage.type` | `local` | No | Storage: `local` (filesystem) or `minio` (S3-compatible) |
| `app.storage.local.path` | `uploads` | No | Local filesystem path for uploads |
| `app.storage.minio.endpoint` | `http://localhost:9000` | Yes (minio) | MinIO server endpoint URL |
| `app.storage.minio.access-key` | `minioadmin` | Yes (minio) | MinIO access key (root user) |
| `app.storage.minio.secret-key` | `minioadmin` | Yes (minio) | MinIO secret key (root password) |
| `app.storage.minio.bucket` | `ssssy-media` | No | Storage bucket name (auto-created) |

#### JWT (Authentication)

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `app.jwt.secret` | `404E635266556A586E...` | **Yes** | 256-bit hex-encoded secret for signing JWTs. **Must change in production.** |
| `app.jwt.expiration-ms` | `900000` | No | Access token validity (ms). Default: 15 min |
| `app.jwt.refresh-expiration-ms` | `604800000` | No | Refresh token validity (ms). Default: 7 days |

#### Upload Constraints

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `app.upload.max-file-size` | `50MB` | No | Maximum file upload size |
| `app.upload.allowed-types` | `image/jpeg,image/png,...` | Yes | Whitelist of allowed MIME types (security) |

#### App

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `app.base-url` | `https://ssssy.org.sy` | No | Frontend base URL for CORS, email links, redirects |

#### SSSSY Email System

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `ssssy.email.domain` | `ssssy.org.sy` | No | Email domain managed by Mailcow |
| `ssssy.email.default-quota` | `1073741824` | No | Default mailbox quota (bytes, 1 GB) |
| `ssssy.email.imap.host` | `localhost` | Yes | IMAP server host for email sync |
| `ssssy.email.imap.port` | `143` | Yes | IMAP port (143 STARTTLS, 993 SSL) |

#### SpringDoc / Swagger

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `springdoc.api-docs.path` | `/api-docs` | No | OpenAPI JSON endpoint path |
| `springdoc.swagger-ui.path` | `/swagger-ui.html` | No | Swagger UI HTML page path |

#### Logging

| Property | Default | Required | Description |
|----------|---------|----------|-------------|
| `logging.file.path` | `logs` | No | Log file directory |
| `logging.level.org.ssssy` | `DEBUG` | No | Application log level |
| `logging.level.org.springframework.security` | `INFO` | No | Security log level |

### 8.2 Frontend .env.local Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Yes | Backend API base URL |
| `NEXT_PUBLIC_APP_NAME` | `SSSSY` | No | Application display name |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | No | Public app URL (SEO, OG tags) |

### 8.3 Docker Compose Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DB_USER` | `ssssy` | No | PostgreSQL database user |
| `DB_PASSWORD` | - | **Yes** | PostgreSQL database password |
| `JWT_SECRET` | - | **Yes** | JWT signing key (256-bit hex) |
| `STORAGE_TYPE` | `minio` | No | Storage backend type |
| `MINIO_ACCESS_KEY` | `ssssy_admin` | Yes | MinIO root user |
| `MINIO_SECRET_KEY` | - | **Yes** | MinIO root password |
| `MINIO_BUCKET` | `ssssy-media` | No | MinIO bucket name |
| `APP_BASE_URL` | `https://ssssy.org.sy` | No | Frontend base URL |
| `LOG_LEVEL` | `INFO` | No | Backend log level |
| `SMTP_HOST` | - | Yes (if email) | SMTP server hostname |
| `SMTP_PORT` | `587` | No | SMTP port |
| `SMTP_USERNAME` | - | Yes (if email) | SMTP username |
| `SMTP_PASSWORD` | - | **Yes** (if email) | SMTP password |
| `IMAP_HOST` | - | Yes (if email) | IMAP server hostname |
| `IMAP_PORT` | `143` | No | IMAP port |
| `API_URL` | `https://ssssy.org.sy/api` | No | Frontend API URL (used in frontend container) |

---

## 9. Database Setup (Deep Dive)

### 9.1 PostgreSQL Installation and Configuration

The project uses PostgreSQL 16 with Flyway for schema management.

**Connection string format:**
```
jdbc:postgresql://HOST:PORT/DATABASE_NAME
```

**Initial setup via Docker Compose:**
```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_DB: ssssy_website  # Auto-created on first start
    POSTGRES_USER: ssssy         # Superuser
    POSTGRES_PASSWORD: ssssy_dev_password  # Change in production
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

### 9.2 Connection Pooling Tuning (HikariCP)

HikariCP is configured via `spring.datasource.hikari.*` properties:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      # Formula: T * (C - 1), where T = threads, C = connections per thread
      # For typical web app with 10 threads: 10 * 1 = 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

**Pool sizing guidelines:**
- Start with `maximum-pool-size = 10` for a standard web application
- Increase to 20-30 if you have background workers or batch processing
- Ensure PostgreSQL `max_connections` is at least 20 + pool size
- Monitor with `SELECT * FROM pg_stat_activity`

### 9.3 PostgreSQL Performance Settings

Edit `postgresql.conf`:

```ini
# Memory (for 16 GB RAM server)
shared_buffers = 4GB              # 25% of RAM
effective_cache_size = 12GB        # 75% of RAM
work_mem = 64MB                    # Per-operation sort memory
maintenance_work_mem = 1GB         # For VACUUM, CREATE INDEX
wal_buffers = 16MB                 # WAL write buffer

# Connections
max_connections = 200              # Must exceed Hikari pool + admin
superuser_reserved_connections = 5

# WAL
wal_level = replica                # Required for replication
max_wal_size = 4GB
min_wal_size = 1GB
checkpoint_completion_target = 0.9

# Planner (SSD optimization)
random_page_cost = 1.1             # SSD (default 4.0 for HDD)
effective_io_concurrency = 200     # SSD (default 1 for HDD)

# Autovacuum
autovacuum = on
autovacuum_naptime = 1min
autovacuum_vacuum_scale_factor = 0.01
autovacuum_analyze_scale_factor = 0.005
```

### 9.4 Flyway Migration Management

**Migration file naming convention:**
```
V<version>__<description>.sql
V1__users_roles.sql
V2__content_tables.sql
```
- Version numbers must be sequential but can skip (e.g., V1, V2, V5)
- Descriptions are single or multi-word with underscores
- Never modify an applied migration (create a new one instead)

**Commands:**
```bash
# Run pending migrations:
mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/ssssy_website -Dflyway.user=postgres -Dflyway.password=postgres

# Check status (shows all migrations and their state):
mvn flyway:info

# Repair failed migration (fixes checksums, removes failed entries):
mvn flyway:repair

# Baseline an existing database (if Flyway was not used from start):
mvn flyway:baseline -Dflyway.baseline-version=1

# Create new migration:
touch src/main/resources/db/migration/V19__my_feature.sql
# Add SQL, then run: mvn flyway:migrate
```

**Current migrations (V1-V18):**

| File | Purpose |
|------|---------|
| V1 | Users, roles, permissions, tokens, audit logs |
| V2 | Categories, tags, content items, versions |
| V3 | Media folders, files |
| V4 | Workflow logs, notifications, notification preferences |
| V5 | Events, jobs, contacts |
| V6 | Complete email system (12 tables) |
| V7 | Pages, page sections |
| V8 | Menus, comments, newsletter, board, members, SEO, config, scheduled sends, quota logs |
| V9 | User profile fields (institution, dept, etc.) |
| V10 | Media thumbnails |
| V11 | Configurable workflow definitions |
| V12 | Component templates |
| V13 | Event fields (lat/lng, online, etc.) + registration |
| V14 | CRM, comment events |
| V15 | Seed data (default workflows, templates, config) |
| V16 | Page SEO fields (meta_title, meta_description) |
| V17 | Page OG fields (og_title, og_description, og_image) |
| V18 | Two-factor secret, preferred language |

### 9.5 Database User Permissions

```sql
-- Read/write user (used by application):
CREATE USER ssssy WITH PASSWORD 'your_password';
GRANT CONNECT ON DATABASE ssssy_website TO ssssy;
GRANT USAGE ON SCHEMA public TO ssssy;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ssssy;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO ssssy;

-- Read-only user (for monitoring/reports):
CREATE USER ssssy_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE ssssy_website TO ssssy_readonly;
GRANT USAGE ON SCHEMA public TO ssssy_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ssssy_readonly;
```

### 9.6 Initial Seed Data

The V15 migration seeds:
- **Default workflow definitions** for ARTICLE, EVENT, and PAGE content types
- **Workflow states**: DRAFT, REVIEW, APPROVED, PUBLISHED, ARCHIVED (Arabic + English labels)
- **Workflow transitions**: Role-based state transitions (e.g., EDITOR can submit for review, ADMIN can approve)
- **Default component templates** for the page builder (10 templates: container, grid, title, paragraph, image, gallery, button, card, carousel, video)
- **System configuration**: Site name (En/Ar), contact info, social media URLs, feature flags
- **admin_notifications table** created

---

## 10. Security Checklist

### Pre-Deployment Hardening

- [ ] Change all default passwords (DB, MinIO, JWT, SMTP, Mailcow admin)
- [ ] Generate secure JWT secret: `openssl rand -hex 32` (64 hex chars)
- [ ] Generate all passwords: `openssl rand -base64 32`
- [ ] Set `.env` file permissions to 600 (`chmod 600 .env`)
- [ ] Add `.env` to `.gitignore` (verify it is present)
- [ ] Review CORS configuration -- restrict to specific origins in production
- [ ] Disable Spring Boot devtools in production
- [ ] Set `spring.jpa.show-sql: false` in production profile
- [ ] Set `spring.jpa.open-in-view: false` in production

### Security Headers

- [ ] HSTS enabled: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [ ] CSP configured (see Nginx section for recommended policy)
- [ ] X-Frame-Options: `SAMEORIGIN` or `DENY`
- [ ] X-Content-Type-Options: `nosniff`
- [ ] Referrer-Policy: `strict-origin-when-cross-origin`
- [ ] Permissions-Policy restricts camera, microphone, geolocation

### WAF Rules (Optional -- ModSecurity)

```bash
# Install ModSecurity for Nginx:
sudo apt install -y libnginx-mod-http-modsecurity
sudo mkdir /etc/nginx/modsec
sudo wget https://raw.githubusercontent.com/SpiderLabs/owasp-modsecurity-crs/v3.3.5/crs-setup.conf.example -O /etc/nginx/modsec/crs-setup.conf
```

### DDoS Protection

- [ ] Rate limiting configured in Nginx (30 r/s API, 5 r/s auth)
- [ ] Bucket4j rate limiting in backend (configurable per endpoint)
- [ ] fail2ban installed and configured
- [ ] Consider Cloudflare or similar CDN for production DDoS protection

### Backup Encryption

```bash
# Encrypt backups with GPG:
gpg --symmetric --cipher-algo AES256 postgres_backup.sql.gz
# Decrypt:
gpg --decrypt postgres_backup.sql.gz.gpg | gunzip > postgres_backup.sql
```

### File Upload Security

- [ ] MIME type whitelist configured: `image/jpeg,image/png,image/webp,image/gif,application/pdf`
- [ ] Max file size: 50MB (configurable)
- [ ] Files stored outside the web root (MinIO or local uploads directory)
- [ ] No direct file execution from upload directory
- [ ] Virus scanning recommended for production (ClamAV integration)

### Additional Security Checks

- [ ] **Account lockout**: 5 failed attempts, 15-min lockout
- [ ] **SMTP rate limiting**: 50 emails/min per user
- [ ] **HTML sanitization**: Jsoup library in pom.xml sanitizes all HTML input
- [ ] **WebSocket authentication**: Connections require valid JWT
- [ ] **Audit logging**: All CRUD operations logged (verify in database)
- [ ] **Authorization**: All admin endpoints use `@PreAuthorize` annotations
- [ ] **Management ports**: Actuator accessible only from internal network
- [ ] **Database isolation**: PostgreSQL not exposed to the internet
- [ ] **Redis secured**: Configure `requirepass` in production
- [ ] **MinIO access policy**: Bucket policies restrict public access
- [ ] **SQL injection prevention**: JPA/Hibernate parameterized queries
- [ ] **XSS prevention**: Jsoup HTML sanitization + CSP headers

---

## 11. Verification Checklist

After completing the installation, verify every component:

### Core Services
- [ ] **Backend health**: `curl https://ssssy.org.sy/actuator/health` returns `{"status":"UP"}`
- [ ] **Swagger UI**: `https://ssssy.org.sy/swagger-ui.html` loads API documentation
- [ ] **Frontend loads**: `https://ssssy.org.sy` returns HTTP 200 with complete HTML
- [ ] **ApiDocs JSON**: `https://ssssy.org.sy/api-docs` returns valid OpenAPI JSON
- [ ] **Login works**: POST `/api/auth/login` with admin credentials returns JWT token
- [ ] **Admin panel**: Navigate to admin page, all CRUD tables load

### Content Management
- [ ] **Article CRUD**: Create, read, update, delete an article
- [ ] **Category CRUD**: Create and assign categories
- [ ] **Tag management**: Create and assign tags
- [ ] **Content versioning**: Edit an article, verify version history
- [ ] **Content scheduling**: Set future publish date, verify scheduler runs

### Media & Uploads
- [ ] **File upload**: Upload JPEG, PNG, PDF via admin panel
- [ ] **File type validation**: Blocked .exe, .js uploads
- [ ] **MinIO console**: Login to MinIO console at port 9001
- [ ] **File access**: Uploaded files accessible via `/media/` URL
- [ ] **Image thumbnails**: Images generate thumbnails automatically

### Email System
- [ ] **SMTP send**: Send test email via API, verify delivery
- [ ] **IMAP sync**: IMAP sync service connects and fetches emails
- [ ] **Email rules**: Create a rule (e.g., auto-tag by sender) and verify it triggers
- [ ] **Email quotas**: Verify quota tracking works
- [ ] **Scheduled send**: Schedule email, verify it sends at the scheduled time

### Events
- [ ] **Event CRUD**: Create event with date/time/location
- [ ] **Event listing**: Public `/events` page shows upcoming events
- [ ] **Event registration**: Register for event, verify confirmation
- [ ] **My Events**: User dashboard shows registered events

### Jobs
- [ ] **Job CRUD**: Create job listing with description and requirements
- [ ] **Job listing**: Public `/jobs` page shows openings
- [ ] **Job application**: Submit application, verify admin notification

### Board Members
- [ ] **Board member CRUD**: Create with bio, photo, position
- [ ] **Public board page**: `/board` displays members correctly
- [ ] **Filtering**: Filter by position or active status

### Members Directory
- [ ] **Member CRUD**: Admin creates member profile
- [ ] **Public directory**: `/members` page with search functionality
- [ ] **Profile page**: Individual member detail page loads

### Contact System
- [ ] **Contact form**: Submit via `/contact`, verify admin message dashboard
- [ ] **Reply**: Admin can reply to contact messages
- [ ] **Email notification**: Admin receives email on new contact submission

### Newsletter
- [ ] **Subscribe**: Public newsletter signup works
- [ ] **Unsubscribe**: Unsubscribe link works in emails
- [ ] **Campaign**: Create and send newsletter campaign
- [ ] **Analytics**: Open/click tracking (if configured)

### Comments
- [ ] **Comment creation**: Create comment on article
- [ ] **Moderation**: Comment appears in moderation queue
- [ ] **Approve/reject**: Moderator can approve or reject
- [ ] **Nested replies**: Reply to existing comment

### SEO & Meta
- [ ] **Meta tags**: Page title and description set correctly in `<head>`
- [ ] **Open Graph**: `og:title`, `og:description`, `og:image` present in HTML
- [ ] **Twitter cards**: `twitter:card` meta tag present
- [ ] **Schema.org**: JSON-LD structured data on public pages
- [ ] **Sitemap**: `/api/public/sitemap.xml` returns valid XML
- [ ] **Robots.txt**: `/robots.txt` accessible and correct

### WebSocket & Real-time
- [ ] **WebSocket connects**: Browser console shows WebSocket connected
- [ ] **Real-time comments**: New comment appears without page refresh
- [ ] **Notifications**: Notification badge updates in real-time

### Scheduled Tasks
- [ ] **Content scheduler**: Scheduled articles publish on time (60s cron)
- [ ] **Email scheduler**: Scheduled emails send on time (60s cron)
- [ ] **Email sync**: IMAP sync runs (300s cron)

### Security & Infrastructure
- [ ] **SSL certificate**: Valid, not expired, trusted by browsers
- [ ] **HSTS header**: Present in response headers (check with curl -I)
- [ ] **CSP header**: Present, blocks inline scripts
- [ ] **Rate limiting**: 429 returned after excessive requests
- [ ] **CORS**: API rejects requests from unknown origins
- [ ] **HTTPS redirect**: HTTP -> HTTPS redirects work (301)
- [ ] **Backup**: Backup script runs successfully
- [ ] **Health check**: `/actuator/health` restricted to internal IPs
- [ ] **Database backup**: `pg_dump` creates valid SQL file
- [ ] **Docker**: All containers running and healthy (`docker compose ps`)
- [ ] **All API endpoints respond**: Test key endpoints from Swagger UI

---

## Appendix A: Quick Reference

### Common Commands

```bash
# Backend
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev
cd backend && mvn clean compile
cd backend && mvn test
cd backend && mvn clean package -DskipTests

# Frontend
cd frontend && npm run dev
cd frontend && npm run build
cd frontend && npm run lint
cd frontend && npx tsc --noEmit

# Docker
docker compose up -d                     # Start all services
docker compose down                      # Stop all services
docker compose logs -f backend           # Follow backend logs
docker compose exec postgres psql -U postgres -d ssssy_website  # Database shell

# Flyway
mvn flyway:migrate                       # Run pending migrations
mvn flyway:info                          # Check migration status
mvn flyway:repair                        # Fix failed migration

# SSL
sudo certbot renew                       # Renew certificates
sudo certbot certificates                # List certificates

# System
docker stats                             # View resource usage
docker system df                         # Check Docker disk usage
docker image prune -af                   # Clean unused images
```

### Directory Structure

```
ssssy-website/
  backend/                  # Spring Boot backend
    src/
      main/
        java/org/ssssy/     # Java source code (297 files)
        resources/
          application.yml   # Main configuration
          db/migration/     # Flyway SQL migrations (V1-V18)
    pom.xml                 # Maven build file
    Dockerfile              # Multi-stage Docker build
  frontend/                 # Next.js frontend
    src/                    # React/TypeScript source code
    public/                 # Static assets
    next.config.mjs         # Next.js configuration (standalone output)
    package.json            # npm dependencies
    Dockerfile              # Multi-stage Docker build
    .env.local              # Local development config
  docker-compose.yml        # Dev infrastructure (postgres, minio, redis)
  docker-compose.dev.yml    # Full dev stack (+ backend, frontend, mailhog)
  docker-compose.prod.yml   # Production stack with health checks
  docs/                     # Documentation
    installation-guide.md   # This file
```

### Port Mapping Summary

| Port | Service | Environment | Notes |
|------|---------|-------------|-------|
| 3000 | Frontend (Next.js) | All | Public web app |
| 8080 | Backend (Spring Boot) | All | REST API + WebSocket |
| 5432 | PostgreSQL | Internal only | Database |
| 6379 | Redis | Internal only | Caching |
| 9000 | MinIO API | Internal only | Object storage API |
| 9001 | MinIO Console | Admin | Web UI for MinIO management |
| 1025 | MailHog SMTP | Dev only | Fake SMTP server |
| 8025 | MailHog UI | Dev only | Email preview web UI |
| 8081 | Mailcow HTTP | Production | Internal mail server HTTP |
| 8443 | Mailcow HTTPS | Production | Internal mail server HTTPS |
| 25/587/465 | Mailcow SMTP | Production | External email sending/receiving |
| 143/993 | Mailcow IMAP | Production | Email retrieval |

### Useful SQL Queries

```sql
-- Count users by role:
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Check migration status:
SELECT version, description, installed_on, success FROM flyway_schema_history ORDER BY version;

-- Find recent audit log entries:
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;

-- Check content by status:
SELECT status, COUNT(*) FROM content_items GROUP BY status;

-- Find orphaned media (not referenced by any content):
SELECT * FROM media_files WHERE id NOT IN (SELECT DISTINCT media_id FROM content_media);

-- Database size:
SELECT pg_database_size('ssssy_website')/1024/1024 AS size_mb;

-- Table sizes:
SELECT relname AS table, pg_total_relation_size(relid)/1024/1024 AS size_mb
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```
