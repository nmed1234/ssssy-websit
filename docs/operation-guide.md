# Operations Guide � Syrian Soil Science Society (SSSSY) Website

> **Target audience:** System administrators and operations engineers
> **Document version:** 2.0
> **Last updated:** 2026-06-28
> **RTO:** <4 hours | **RPO:** <24 hours

---

## Table of Contents

1. [System Architecture Overview (Operations View)](#1-system-architecture-overview-operations-view)
2. [Service Management](#2-service-management)
3. [Monitoring](#3-monitoring)
4. [Logging](#4-logging)
5. [Backup & Restore](#5-backup--restore)
6. [Database Maintenance](#6-database-maintenance)
7. [Email Operations](#7-email-operations)
8. [Scaling & Performance](#8-scaling--performance)
9. [Security Operations](#9-security-operations)
10. [Scheduled Task Management](#10-scheduled-task-management)
11. [Capacity Planning](#11-capacity-planning)
12. [Troubleshooting](#12-troubleshooting)
13. [Disaster Recovery Runbook](#13-disaster-recovery-runbook)

---

## 1. System Architecture Overview (Operations View)

### 1.1 Service Inventory

| Service | Container | Port(s) | Base Image | Resource Min | Resource Recommended |
|---------|-----------|---------|------------|-------------|---------------------|
| Backend | ssssy-backend | 8080 | eclipse-temurin:21-jre-alpine | 2 CPU, 2 GB RAM | 4 CPU, 4 GB RAM |
| Frontend | ssssy-frontend | 3000 | node:18-alpine | 1 CPU, 512 MB RAM | 2 CPU, 1 GB RAM |
| PostgreSQL | ssssy-postgres | 5432 | postgres:16-alpine | 2 CPU, 2 GB RAM | 4 CPU, 8 GB RAM |
| MinIO | ssssy-minio | 9000, 9001 | minio/minio:latest | 1 CPU, 1 GB RAM | 2 CPU, 4 GB RAM |
| Redis | ssssy-redis | 6379 | redis:7-alpine | 1 CPU, 256 MB RAM | 2 CPU, 1 GB RAM |
| Mailcow (optional) | mailcow-* | 25, 587, 993, 143 | mailcow/mailcow | 4 CPU, 8 GB RAM | 8 CPU, 16 GB RAM |
| Nginx (optional) | ssssy-nginx | 80, 443 | nginx:alpine | 1 CPU, 128 MB RAM | 2 CPU, 256 MB RAM |


### 1.2 Network Topology

\\\
                         Internet
                            |
                         [Firewall]
                            |
                      [Nginx Reverse Proxy]
                     /         |           \\
                    /          |            \\
           [Frontend:3000]  [Backend:8080]  [Mailcow:25,587,993]
                  |              |                   |
            [Backend:8080]  [MinIO:9000]        [Postfix]
                  |         [Redis:6379]
            [Postgres:5432]
\\\

**Internal docker network:** \ssssy-network\ (172.x.x.x/16)

### 1.3 Startup Order and Dependencies

\\\
1. PostgreSQL   ? No dependencies
2. MinIO        ? No dependencies
3. Redis        ? No dependencies
4. Backend      ? Requires postgres, minio, redis (depends_on: condition: service_healthy)
5. Frontend     ? Requires backend (depends_on: service_started)
6. Nginx        ? Requires frontend, backend
7. Mailcow      ? No dependencies (standalone mail server)
\\\

### 1.4 File System Layout

\\\
/opt/ssssy/                          # Application root (production)
??? docker-compose.yml               # Base compose
??? docker-compose.prod.yml          # Production overrides
??? .env                             # Environment variables (SECRETS)
??? backend/
?   ??? Dockerfile
?   ??? pom.xml
?   ??? src/main/
?   ?   ??? java/org/ssssy/backend/   # Source code
?   ?   ??? resources/
?   ?       ??? application.yml        # Base config
?   ?       ??? application-prod.yml   # Production overrides
?   ?       ??? db/migration/          # Flyway migrations (V1�V18)
?   ??? target/*.jar                 # Built artifact
?   ??? logs/                        # Application logs (volume: backend_logs)
?       ??? application.log          # Main log
?       ??? audit.log                # Audit trail
?       ??? error.log                # Error-only log
??? frontend/
?   ??? Dockerfile
?   ??? package.json
?   ??? src/
?   ?   ??? app/                     # Next.js App Router pages
?   ?   ??? components/              # React components
?   ?   ??? lib/                     # Utilities, API client
?   ?   ??? middleware.ts            # Auth middleware
?   ??? public/                      # Static assets
?   ??? .next/                       # Build output
??? scripts/
?   ??? backup.ps1                   # Windows backup script
?   ??? restore.ps1                  # Windows restore script
?   ??? backup-ssssy.sh              # Linux backup script
??? docs/                            # Documentation
??? data/                            # Docker volumes (Docker-managed)
?   ??? postgres/                    # postgres_data volume
?   ??? minio/                       # minio_data volume
?   ??? redis/                       # redis_data volume
??? backups/                         # Backup storage
    ??? postgres/                    # Database dumps
    ??? minio/                       # Media files mirror
    ??? config/                      # Config backups
\\\

### 1.5 Environment Variables (Production .env)

\\\ash
# Database
DB_USER=ssssy
DB_PASSWORD=<strong-random-password>

# Storage
STORAGE_TYPE=minio
MINIO_ACCESS_KEY=ssssy_admin
MINIO_SECRET_KEY=<strong-random-key>
MINIO_BUCKET=ssssy-media

# JWT
JWT_SECRET=<256-bit-random-hex>

# Application
APP_BASE_URL=https://ssssy.org.sy
API_URL=https://ssssy.org.sy/api
LOG_LEVEL=INFO

# SMTP (Spring Mail)
SMTP_HOST=mail.ssssy.org.sy
SMTP_PORT=587
SMTP_USERNAME=noreply@ssssy.org.sy
SMTP_PASSWORD=<smtp-password>

# IMAP (Email sync)
IMAP_HOST=mail.ssssy.org.sy
IMAP_PORT=143
\\\

---

## 2. Service Management

### 2.1 Docker Compose Management

#### Start All Services

\\\ash
# Development
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Start specific service
docker compose up -d postgres minio redis
docker compose up -d backend
docker compose up -d frontend
\\\

#### Stop Services

\\\ash
# Stop all
docker compose down

# Stop specific
docker compose stop backend

# Stop and remove volumes (CAUTION: destroys data)
docker compose down -v
\\\

#### Restart Services

\\\ash
docker compose restart backend
docker compose restart postgres
\\\

#### Check Status

\\\ash
docker compose ps                    # All services
docker compose ps backend            # Specific service
docker inspect ssssy-backend         # Full container details
\\\

#### View Logs

\\\ash
docker compose logs -f --tail=100 backend
docker compose logs -f --tail=50 postgres
docker compose logs -f minio
docker compose logs -f redis
docker compose logs -f frontend
\\\

### 2.2 Backend Service

#### Configuration

Primary configuration file: \ackend/src/main/resources/application.yml\

The backend uses Spring Boot with the following key configuration blocks:
- \spring.datasource.*\ � PostgreSQL connection (HikariCP pool)
- \spring.mail.*\ � SMTP settings for outbound mail
- \pp.jwt.*\ � JWT secret, token expiration
- \pp.storage.*\ � File storage (local or MinIO/S3)
- \pp.email.*\ � IMAP sync, email domain, quota defaults
- \logging.level.*\ � Per-package log level control

**Production profile** (\pplication-prod.yml\):

\\\yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc.batch_size: 20
        order_inserts: true
        order_updates: true
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

server:
  tomcat:
    threads:
      max: 200
    max-connections: 10000
\\\

#### Start/Stop

\\\ash
# Docker
docker compose up -d backend
docker compose stop backend

# Standalone (non-Docker)
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=prod       # Dev mode
java -jar target/ssssy-backend-0.0.1-SNAPSHOT.jar          # Production JAR
\\\

#### Logs

\\\ash
# Docker
docker compose logs -f --tail=200 backend

# Standalone
tail -f backend/logs/application.log
tail -f backend/logs/error.log
\\\

#### Upgrade

\\\ash
# 1. Pull latest code
git pull origin main

# 2. Rebuild backend image
docker compose -f docker-compose.yml -f docker-compose.prod.yml build backend

# 3. Apply any new database migrations
docker compose run --rm backend mvn flyway:migrate

# 4. Restart backend
docker compose up -d --no-deps backend
\\\

#### Common Failure Modes

| Symptom | Cause | Resolution |
|---------|-------|------------|
| Container exits immediately | Port 8080 in use | \
etstat -ano | findstr :8080\ and kill the process |
| Container repeatedly restarts | DB/MinIO/Redis unreachable | Check \docker compose logs backend\ for connection errors |
| Health check fails | Application not responding | \docker exec ssssy-backend wget --spider http://localhost:8080/actuator/health\ |
| Flyway migration error | Schema mismatch or corrupted migration | \docker compose run --rm backend mvn flyway:info\ then \lyway:repair\ |
| Out of memory | JVM heap too small | Add \JAVA_OPTS: "-Xmx2g -Xms1g"\ environment variable |
| Slow under load | Connection pool exhausted | Increase \maximum-pool-size\ and \server.tomcat.threads.max\ |

### 2.3 Frontend Service

#### Configuration

Environment variables (\.env.local\ or container env):
- \NEXT_PUBLIC_API_URL\ � Backend API URL
- \NEXT_PUBLIC_APP_NAME\ � Application display name
- \NEXT_PUBLIC_APP_URL\ � Public-facing URL

#### Start/Stop

\\\ash
# Docker
docker compose up -d frontend
docker compose stop frontend

# Standalone
cd frontend
npm run build          # Build for production
npm run start          # Start production server (port 3000)
\\\

#### Upgrade

\\\ash
# 1. Rebuild
docker compose build frontend

# 2. Restart
docker compose up -d --no-deps frontend
\\\

#### Common Failure Modes

| Symptom | Cause | Resolution |
|---------|-------|------------|
| Blank page on load | API unreachable or CORS | Check browser console, verify \NEXT_PUBLIC_API_URL\ |
| 404 on client-side routes | Missing fallback routes | Check \
ext.config.mjs\ output: 'standalone' |
| Build fails with OOM | Insufficient Node memory | \NODE_OPTIONS=--max_old_space_size=4096\ |
| Stale content shown | ISR cache not invalidated | Use revalidate API endpoint |

### 2.4 PostgreSQL

#### Start/Stop

\\\ash
docker compose up -d postgres
docker compose stop postgres
\\\

#### Check Status

\\\ash
docker compose exec postgres pg_isready -U ssssy -d ssssy_website
# Expected: /var/run/postgresql:5432 - accepting connections
\\\

#### Configuration

Key parameters to tune for production (inside container: \/var/lib/postgresql/data/postgresql.conf\):

\\\ini
# Connection
max_connections = 100
shared_buffers = 2GB                 # 25% of RAM
work_mem = 32MB
maintenance_work_mem = 512MB

# Write Ahead Log
wal_level = replica
max_wal_size = 4GB
min_wal_size = 1GB

# Query planning
effective_cache_size = 6GB           # 75% of RAM
random_page_cost = 1.1               # SSD-optimized
effective_io_concurrency = 200       # SSD-optimized

# Auto-vacuum
autovacuum_max_workers = 4
autovacuum_naptime = 1min
autovacuum_vacuum_scale_factor = 0.2
\\\

#### Upgrade PostgreSQL

\\\ash
# 1. Dump current database
docker compose exec postgres pg_dump -U ssssy -d ssssy_website -F c -f /tmp/pg_dump.dump

# 2. Update docker-compose.yml image version

# 3. Remove old volume and recreate
docker compose down postgres
docker volume rm ssssy-website_postgres_data
docker compose up -d postgres

# 4. Restore
docker compose exec -T postgres pg_restore -U ssssy -d ssssy_website < pg_dump.dump
\\\

### 2.5 MinIO

#### Start/Stop

\\\ash
docker compose up -d minio
docker compose stop minio
\\\

#### Access

- **API:** http://localhost:9000
- **Console:** http://localhost:9001
- **Credentials:** \MINIO_ROOT_USER\ / \MINIO_ROOT_PASSWORD\ from .env

#### Configure via mc Client

\\\ash
docker compose exec minio mc alias set local http://localhost:9000 \ \
docker compose exec minio mc ls local
docker compose exec minio mc mb local/ssssy-media
docker compose exec minio mc anonymous set download local/ssssy-media
\\\

#### Upgrade

\\\ash
docker compose pull minio
docker compose up -d --no-deps minio
\\\

### 2.6 Redis

#### Start/Stop

\\\ash
docker compose up -d redis
docker compose stop redis
\\\

#### Connect and Monitor

\\\ash
docker compose exec redis redis-cli
redis-cli -h localhost -p 6379 ping
redis-cli info stats
redis-cli info memory
redis-cli info keyspace
\\\

#### Configuration

\\\ash
docker compose exec redis redis-cli CONFIG SET maxmemory 512mb
docker compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
\\\

### 2.7 Nginx (Optional Production Reverse Proxy)

#### Configuration

\\\
ginx
server {
    listen 80;
    server_name ssssy.org.sy api.ssssy.org.sy;
    return 301 https://\\;
}

server {
    listen 443 ssl http2;
    server_name ssssy.org.sy;

    ssl_certificate /etc/letsencrypt/live/ssssy.org.sy/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ssssy.org.sy/privkey.pem;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
        proxy_set_header X-Forwarded-For \;
        proxy_set_header X-Forwarded-Proto \;
    }

    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
    }

    location /ws {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }

    location /actuator/health {
        proxy_pass http://backend:8080/actuator/health;
    }
}
\\\

#### SSL Certificate Renewal

\\\ash
# Using Certbot
docker run --rm -it -v /etc/letsencrypt:/etc/letsencrypt certbot/certbot renew
docker exec ssssy-nginx nginx -s reload

# Automate with cron: 0 3 * * * certbot renew && nginx -s reload
\\\

### 2.8 Mailcow (Optional Email Server)

#### Start

\\\ash
git clone https://github.com/mailcow/mailcow-dockerized /opt/mailcow
cd /opt/mailcow
cp mailcow.conf.sample mailcow.conf
# Edit mailcow.conf: set MAILCOW_HOSTNAME=mail.ssssy.org.sy
docker compose pull
docker compose up -d
\\\

#### Admin UI

\\\
https://mail.ssssy.org.sy
Username: admin
Password: (set during initial setup)
\\\

#### Useful Commands

\\\ash
cd /opt/mailcow
docker compose ps
docker compose logs -f postfix-mailcow
docker compose logs -f rspamd-mailcow
docker compose restart postfix-mailcow
./helper-scripts/backup_and_restore.sh backup all
\\\

---

## 3. Monitoring

### 3.1 Prometheus + Grafana Stack

#### Deploy Prometheus + Grafana + Alertmanager

\\\yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: ssssy-prometheus
    restart: unless-stopped
    ports: ["9090:9090"]
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'

  grafana:
    image: grafana/grafana:latest
    container_name: ssssy-grafana
    restart: unless-stopped
    ports: ["3001:3000"]
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=\
    volumes:
      - grafana_data:/var/lib/grafana

  alertmanager:
    image: prom/alertmanager:latest
    container_name: ssssy-alertmanager
    restart: unless-stopped
    ports: ["9093:9093"]

volumes:
  prometheus_data:
  grafana_data:
\\\

#### Prometheus Configuration

\\\yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - '/etc/prometheus/alert-rules.yml'

scrape_configs:
  - job_name: 'ssssy-backend'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['backend:8080']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
\\\

#### Alert Rules

\\\yaml
# monitoring/alert-rules.yml
groups:
  - name: ssssy-alerts
    interval: 30s
    rules:
      - alert: BackendDown
        expr: up{job="ssssy-backend"} == 0
        for: 1m
        labels: { severity: critical }
        annotations:
          summary: "Backend is down"
          description: "Backend service has been unreachable for more than 1 minute."

      - alert: DatabaseDown
        expr: pg_up == 0
        for: 1m
        labels: { severity: critical }
        annotations:
          summary: "PostgreSQL is down"

      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels: { severity: critical }
        annotations:
          summary: "High HTTP 5xx error rate"

      - alert: DiskSpaceLow
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 85
        for: 10m
        labels: { severity: warning }
        annotations:
          summary: "Disk space low"

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
        for: 5m
        labels: { severity: warning }
        annotations:
          summary: "High memory usage"

      - alert: EmailQueueDepthHigh
        expr: ssssy_email_queue_depth > 100
        for: 5m
        labels: { severity: warning }
        annotations:
          summary: "Email queue depth high"

      - alert: RedisMemoryHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes * 100 > 80
        for: 5m
        labels: { severity: warning }
        annotations:
          summary: "Redis memory usage high"

      - alert: ConnectionPoolExhausted
        expr: hikaricp_connections_active / hikaricp_connections_max > 0.8
        for: 5m
        labels: { severity: info }
        annotations:
          summary: "Database connection pool nearing capacity"

      - alert: SlowResponses
        expr: histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m])) > 0.5
        for: 5m
        labels: { severity: warning }
        annotations:
          summary: "P95 response time exceeds 500ms"

      - alert: BackupFailed
        expr: ssssy_backup_success == 0
        for: 1m
        labels: { severity: critical }
        annotations:
          summary: "Recent backup failed"
\\\

#### Pre-built Dashboard Descriptions

| Dashboard | Description | Key Panels |
|-----------|-------------|------------|
| **SSSSY Overview** | High-level system health | Uptime, request rate, error rate, response times |
| **JVM / Backend** | Backend JVM metrics | Heap usage, GC pauses, thread states |
| **Database** | PostgreSQL performance | Active connections, query rate, cache hit ratio |
| **Email Operations** | Email system health | Send rate, bounce rate, queue depth, quota usage |
| **Redis** | Cache performance | Hit/miss ratio, memory usage, evictions |
| **MinIO / Storage** | Object storage metrics | Bucket sizes, object count, request rate |
| **Docker / Node** | Host-level metrics | CPU, memory, disk, network |
| **Scheduled Tasks** | Cron job execution | Last run time, duration, success/failure |

### 3.2 Spring Boot Actuator

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| \/actuator/health\ | GET | Application health + component status | No |
| \/actuator/info\ | GET | Application info (version, name) | Yes |
| \/actuator/metrics\ | GET | List available metric names | Yes |
| \/actuator/metrics/{name}\ | GET | Specific metric value | Yes |
| \/actuator/env\ | GET | Environment properties | Yes |
| \/actuator/loggers\ | GET/POST | List/get/set logger levels at runtime | Yes |
| \/actuator/health/**\ | GET | Detailed health of components | Yes |
| \/actuator/beans\ | GET | All Spring beans | Yes |
| \/actuator/mappings\ | GET | All request mappings | Yes |
| \/actuator/threaddump\ | GET | JVM thread dump | Yes |
| \/actuator/heapdump\ | GET | JVM heap dump (download) | Yes |
| \/actuator/httptrace\ | GET | Last 100 HTTP requests | Yes |
| \/actuator/shutdown\ | POST | Graceful shutdown | Yes |

---

## 4. Logging

### 4.1 Log Aggregation: ELK Stack

#### Deploying ELK Stack

```yaml
# docker-compose.logging.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: ssssy-elasticsearch
    restart: unless-stopped
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms2g -Xmx2g
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports: ["9200:9200"]

  logstash:
    image: docker.elastic.co/logstash/logstash:8.12.0
    container_name: ssssy-logstash
    restart: unless-stopped
    volumes:
      - ./monitoring/logstash/:/usr/share/logstash/pipeline/
    ports: ["5044:5044"]
    depends_on: [elasticsearch]

  kibana:
    image: docker.elastic.co/kibana/kibana:8.12.0
    container_name: ssssy-kibana
    restart: unless-stopped
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports: ["5601:5601"]
    depends_on: [elasticsearch]

volumes:
  elasticsearch_data:
```

#### Filebeat Configuration

```yaml
# monitoring/filebeat/filebeat.yml
filebeat.inputs:
  - type: container
    enabled: true
    paths:
      - /var/lib/docker/containers/*/*.log
    processors:
      - add_docker_metadata:
          host: true

  - type: log
    enabled: true
    paths:
      - /opt/ssssy/backend/logs/*.log
    fields:
      service: ssssy-backend
    multiline:
      pattern: '^\\d{4}-\\d{2}-\\d{2}'
      negate: true
      match: after

output.logstash:
  hosts: ["logstash:5044"]
```

#### Logstash Pipeline

```
# monitoring/logstash/ssssy-pipeline.conf
input {
  beats { port => 5044 }
}

filter {
  if [fields][service] == "ssssy-backend" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{DATA:logger} %{JAVALOGMESSAGE:log_message}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "ssssy-logs-%{+YYYY.MM.dd}"
  }
}
```

#### Elasticsearch Index Management

```bash
# View indices
curl http://localhost:9200/_cat/indices?v

# Delete old indices
curl -X DELETE "http://localhost:9200/ssssy-logs-$(date -d '30 days ago' +%Y.%m.%d)"

# ILM policy
curl -X PUT "http://localhost:9200/_ilm/policy/ssssy-logs-policy" -H 'Content-Type: application/json' -d '{
  "policy": {
    "phases": {
      "hot": { "min_age": "0ms", "actions": { "rollover": { "max_size": "50GB", "max_age": "7d" } } },
      "warm": { "min_age": "7d", "actions": { "readonly": {} } },
      "delete": { "min_age": "30d", "actions": { "delete": {} } }
    }
  }
}'
```

### 4.2 Docker Logging Drivers

```yaml
# Per service in docker-compose.prod.yml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"

# Alternative: syslog
# logging:
#   driver: syslog
#   options:
#     syslog-address: "tcp://syslog-server:514"
#     tag: "ssssy-backend"

# Alternative: fluentd
# logging:
#   driver: fluentd
#   options:
#     fluentd-address: "localhost:24224"
#     tag: "ssssy.{{.Name}}"
```

### 4.3 Log Rotation

#### Application Log Rotation

```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_DIR:-logs}/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_DIR:-logs}/application.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <appender name="ERROR" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_DIR:-logs}/error.log</file>
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>ERROR</level>
        </filter>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_DIR:-logs}/error.%d{yyyy-MM-dd}.log.gz</fileNamePattern>
            <maxHistory>90</maxHistory>
        </rollingPolicy>
    </appender>

    <root level="INFO">
        <appender-ref ref="FILE"/>
        <appender-ref ref="ERROR"/>
    </root>
</configuration>
```

#### Linux System Log Rotation

```bash
# /etc/logrotate.d/ssssy
/opt/ssssy/backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

### 4.4 Centralized Audit Logs

All admin CRUD operations and workflow actions are logged to the `audit_logs` table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `actor_id` | UUID | User who performed the action |
| `action` | VARCHAR | CREATE, UPDATE, DELETE, APPROVE, REJECT, PUBLISH, LOGIN |
| `entity_type` | VARCHAR | ContentItem, User, Event, EmailAccount |
| `entity_id` | UUID | ID of affected entity |
| `details` | JSONB | Before/after values, metadata |
| `ip_address` | VARCHAR | Client IP |
| `created_at` | TIMESTAMP | When action occurred |

```sql
-- View recent audit logs
SELECT actor_id, action, entity_type, created_at
FROM audit_logs
ORDER BY created_at DESC LIMIT 20;

-- Actions by type in last 24h
SELECT action, COUNT(*) as count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY action ORDER BY count DESC;
```

### 4.5 Log Retention Policy

| Log Type | Location | Retention | Compression |
|----------|----------|-----------|-------------|
| Docker logs | /var/lib/docker/containers/ | 3 files x 10MB | None |
| Application logs | backend/logs/application.log | 30 days | GZip daily |
| Error logs | backend/logs/error.log | 90 days | GZip daily |
| Audit logs | audit_logs table | 1 year | DB storage |
| PostgreSQL logs | Docker stdout | 7 days | None |
| Nginx access logs | /var/log/nginx/access.log | 30 days | GZip daily |
| Elasticsearch indices | ELK | 30 days | ILM auto-delete |

### 4.6 Searching Logs

```bash
# Docker logs
docker compose logs backend | grep "ERROR"
docker compose logs backend --since 5m

# Application logs - count errors by hour
grep "ERROR" /opt/ssssy/backend/logs/application.log | \
  grep -oP '\d{4}-\d{2}-\d{2} \d{2}' | sort | uniq -c | sort -rn

# Endpoint usage
grep -oP 'GET|POST|PUT|DELETE \K/[^ ]+' /opt/ssssy/backend/logs/application.log | \
  sort | uniq -c | sort -rn | head -20

# Using jq for JSON logs
cat /opt/ssssy/backend/logs/application.log | \
  jq -r 'select(.level == "ERROR") | "\(.timestamp) [\(.logger)] \(.message)"'

# Find slow requests (>500ms)
cat /opt/ssssy/backend/logs/application.log | \
  jq 'select(.response_time != null and .response_time > 500)' | \
  jq -r '.method + " " + .path + " -> " + (.response_time | tostring) + "ms"'
```

---

## 5. Backup & Restore

### 5.1 Database Backup

#### pg_dump vs pg_basebackup

| Feature | pg_dump | pg_basebackup |
|---------|---------|---------------|
| Type | Logical backup | Physical backup |
| Database size | Small to medium | Any size |
| PITR support | No | Yes (with WAL archiving) |
| Restore flexibility | High (single table) | Low (entire cluster) |

**When to use each:**
- **pg_dump**: Daily logical backups, table-level restore, version upgrades
- **pg_basebackup**: PITR, large databases, disaster recovery

#### pg_dump Commands

```bash
# Custom format (compressed, parallel restore)
pg_dump -h localhost -U ssssy -d ssssy_website \
  -F c -f /backups/postgres/ssssy_db_$(date +%Y%m%d_%H%M%S).dump --no-owner --no-acl

# Directory format (parallel)
pg_dump -h localhost -U ssssy -d ssssy_website \
  -F d -j 4 -f /backups/postgres/ssssy_db_$(date +%Y%m%d)

# Exclude large tables
pg_dump -h localhost -U ssssy -d ssssy_website \
  -F c -T audit_logs -T email_messages \
  -f /backups/postgres/ssssy_db_core_$(date +%Y%m%d).dump
```

#### WAL Archiving (PITR Setup)

```ini
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backups/postgres/wal/%f'
archive_timeout = 60
max_wal_senders = 3
wal_keep_size = 1024
```

```bash
# Take base backup
pg_basebackup -h localhost -U ssssy \
  -D /backups/postgres/base_$(date +%Y%m%d) -Ft -z -P -X stream
```

#### Backup Encryption

```bash
# GPG
gpg --symmetric --cipher-algo AES256 /backups/postgres/ssssy_db_20261201.dump
gpg --decrypt /backups/postgres/ssssy_db_20261201.dump.gpg > /backups/postgres/ssssy_db_20261201.dump

# OpenSSL
openssl enc -aes-256-cbc -salt -pbkdf2 -in backup.dump -out backup.dump.enc -pass pass:<key>
```

#### Offsite Backup

```bash
rsync -avz --delete /backups/postgres/ backup-user@backup.example.com:/backups/ssssy/postgres/
aws s3 sync /backups/ s3://ssssy-backups/ --storage-class STANDARD_IA
```

#### Backup Verification

```bash
# Verify dump integrity
pg_restore -l /backups/postgres/ssssy_db_20261201.dump | head -20

# Verify by restore to temp db
createdb -U ssssy ssssy_db_verify
pg_restore -U ssssy -d ssssy_db_verify /backups/postgres/ssssy_db_20261201.dump --exit-on-error
echo $?  # Should be 0
dropdb -U ssssy ssssy_db_verify
```

### 5.2 MinIO Backup

#### Using mc mirror

```bash
# Full mirror
mc mirror ssssy/ssssy-media /backups/minio/ssssy-media

# One-time sync
mc mirror ssssy/ssssy-media /backups/minio/ssssy-media

# Restore from backup
mc mirror /backups/minio/ssssy-media ssssy/ssssy-media

# Sync to remote MinIO
mc mirror ssssy/ssssy-media remote-backup/ssssy-media
```

#### Using restic

```bash
restic init --repo s3:https://s3.amazonaws.com/ssssy-backups/minio
restic backup /backups/minio/ssssy-media --repo s3:...
restic snapshots --repo s3:...
restic restore latest --target /tmp/restore --repo s3:...
```

### 5.3 Application Config Backup

```bash
tar -czf /backups/ssssy/config/config_$(date +%Y%m%d).tar.gz \
  /opt/ssssy/.env \
  /opt/ssssy/docker-compose.yml \
  /opt/ssssy/docker-compose.prod.yml \
  /opt/ssssy/backend/src/main/resources/application*.yml \
  /opt/ssssy/frontend/.env.local \
  /etc/nginx/conf.d/ssssy.conf \
  /etc/letsencrypt/
```

### 5.4 Production-Ready Backup Script

```bash
#!/bin/bash
# backup-ssssy.sh - Full system backup
# Usage: ./backup-ssssy.sh [environment]

set -euo pipefail

ENVIRONMENT="${1:-production}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT="/backups/ssssy"
BACKUP_DIR="${BACKUP_ROOT}/${DATE}"
LOG_FILE="${BACKUP_ROOT}/backup.log"
RETENTION_DAYS=30

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-ssssy_website}"
DB_USER="${DB_USER:-ssssy}"
export PGPASSWORD="${DB_PASSWORD}"

SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

log() {
  echo "[$(date "+%Y-%m-%d %H:%M:%S")] $*" | tee -a "$LOG_FILE"
}

notify() {
  local status="$1"
  local message="$2"
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H "Content-type: application/json" \
      --data "{\"text\":\"[SSSSY Backup] ${status}: ${message}\"}" \
      "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || true
  fi
}

cleanup_old_backups() {
  log "Cleaning up backups older than ${RETENTION_DAYS} days..."
  find "${BACKUP_ROOT}" -maxdepth 1 -type d -name "2*" -mtime +${RETENTION_DAYS} -exec rm -rf {} +
  log "Cleanup complete"
}

main() {
  log "=== Starting backup [${ENVIRONMENT}] ==="
  mkdir -p "${BACKUP_DIR}"/{database,media,config}

  # Step 1: Database backup
  log "Backing up database..."
  DB_DUMP_FILE="${BACKUP_DIR}/database/${DB_NAME}.dump"
  if pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    -F c --no-owner --no-acl -f "${DB_DUMP_FILE}" 2>>"${LOG_FILE}"; then
    DB_SIZE=$(du -h "${DB_DUMP_FILE}" | cut -f1)
    log "Database backup completed (${DB_SIZE})"
    if pg_restore -l "${DB_DUMP_FILE}" > /dev/null 2>&1; then
      log "Database dump integrity verified"
    else
      log "ERROR: Database dump integrity check FAILED"
      return 1
    fi
  else
    log "ERROR: Database dump FAILED"
    return 1
  fi

  # Step 2: Media backup
  mc mirror "${MC_ALIAS}/${MC_BUCKET}" "${BACKUP_DIR}/media" 2>>"${LOG_FILE}"

  # Step 3: Config backup
  tar -czf "${BACKUP_DIR}/config/config.tar.gz" /opt/ssssy/.env /opt/ssssy/docker-compose.yml 2>/dev/null || true

  # Step 4: Create archive
  cd "${BACKUP_ROOT}"
  tar -czf "${DATE}.tar.gz" "${DATE}"
  rm -rf "${BACKUP_DIR}"

  # Step 5: Offsite sync
  if [ -n "${OFFSITE_HOST:-}" ]; then
    rsync -avz --partial "${BACKUP_ROOT}/${DATE}.tar.gz" "${OFFSITE_HOST}:${OFFSITE_PATH}/"
  fi

  # Step 6: Cleanup
  cleanup_old_backups

  log "=== Backup completed successfully ==="
  notify "SUCCESS" "Backup completed for ${ENVIRONMENT}"
}

main "$@"
```

### 5.5 Restore Drill Procedure

```bash
#!/bin/bash
# restore-ssssy.sh - Full system restore drill
# Usage: ./restore-ssssy.sh <backup-file> [target-database]

set -euo pipefail

BACKUP_FILE="$1"
TARGET_DB="${2:-ssssy_website_restore}"
RESTORE_DIR="/tmp/ssssy_restore_$(date +%s)"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file.tar.gz> [target-database]"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "=== Starting restore drill ==="
echo "Backup file: ${BACKUP_FILE}"

# Step 1: Extract archive
mkdir -p "$RESTORE_DIR"
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

# Step 2: Verify extracted files
ls -la "${RESTORE_DIR}"/*/
find "${RESTORE_DIR}" -type f -name "*.dump" -exec file {} \;

# Step 3: Check disk space
REQUIRED_SPACE=$(du -sb "${RESTORE_DIR}" | cut -f1)
AVAILABLE_SPACE=$(df --output=avail -B1 / | tail -1)
if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
  echo "ERROR: Insufficient disk space"
  exit 1
fi

# Step 4: Create temp database
docker compose exec -T postgres psql -U ssssy -c "DROP DATABASE IF EXISTS ${TARGET_DB};"
docker compose exec -T postgres psql -U ssssy -c "CREATE DATABASE ${TARGET_DB};"

# Step 5: Restore database
DB_DUMP=$(find "${RESTORE_DIR}" -name "*.dump" | head -1)
pg_restore -h localhost -U ssssy -d "${TARGET_DB}" --clean --if-exists -v "$DB_DUMP" 2>&1 | tail -20

# Step 6: Verify restored data
docker compose exec -T postgres psql -U ssssy -d "${TARGET_DB}" -c "
  SELECT users as tbl, count(*) FROM users
  UNION ALL SELECT content_items, count(*) FROM content_items;
"

# Step 7: Cleanup
docker compose exec -T postgres psql -U ssssy -c "DROP DATABASE IF EXISTS ${TARGET_DB};"
rm -rf "$RESTORE_DIR"

echo "=== Restore drill completed successfully ==="
```

### 5.6 Backup Monitoring

Export Prometheus metrics from backup script:

```bash
# Prometheus textfile collector
OUTPUT_FILE="/var/lib/node_exporter/textfile_collector/backup.prom"
echo "ssssy_backup_success 1" > "$OUTPUT_FILE"
echo "ssssy_backup_age_seconds $BACKUP_AGE" >> "$OUTPUT_FILE"
```

Alert on failure:

```yaml
- alert: BackupFailed
  expr: ssssy_backup_success == 0
  for: 1h
  labels: { severity: critical }
  annotations:
    summary: "Backup has not completed successfully"

- alert: BackupStale
  expr: ssssy_backup_age_seconds > 86400
  for: 1h
  labels: { severity: warning }
  annotations:
    summary: "Backup is stale"
```

### 5.7 Retention Policy

| Frequency | Retention | Storage | Total Snapshots |
|-----------|-----------|---------|-----------------|
| Daily | 30 days | Local + offsite | 30 |
| Weekly (Mon) | 12 weeks | Local + offsite | 12 |
| Monthly (1st) | 12 months | Offsite only | 12 |
| Yearly | Indefinite | Offsite (cold storage) | - |

---

## 6. Database Maintenance

### 6.1 PostgreSQL Vacuum

#### Auto-Vacuum Tuning

```sql
-- Current auto-vacuum workers
SELECT pid, datname, relid::regclass AS table_name,
       phase, heap_blks_total, heap_blks_scanned,
       heap_blks_vacuumed, num_dead_tuples
FROM pg_stat_progress_vacuum;

-- Tables needing vacuum (high dead tuple ratio)
SELECT relname, n_live_tup, n_dead_tup,
       ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_pct,
       last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY n_dead_tup DESC;

-- Tune per table for high-traffic tables
ALTER TABLE content_items SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE email_messages SET (autovacuum_vacuum_scale_factor = 0.02);
ALTER TABLE audit_logs SET (autovacuum_vacuum_scale_factor = 0.01);
```

#### Manual Vacuum

```sql
-- Standard vacuum (no lock, reclaims space for reuse)
VACUUM (VERBOSE, ANALYZE) content_items;

-- Full vacuum (locks table, reclaims space to OS - maintenance window only)
VACUUM FULL VERBOSE content_items;

-- Freeze (prevents transaction ID wraparound)
VACUUM (FREEZE) content_items;

-- All tables
VACUUM (VERBOSE, ANALYZE);
```

#### Bloat Monitoring

```sql
-- Approximate table bloat
SELECT schemaname, tablename,
       bloat_pct
FROM (
  SELECT schemaname, tablename,
    ROUND((100 - avg_leaf_density * 100), 2) AS bloat_pct
  FROM (
    SELECT schemaname, tablename,
      avg(COALESCE(null_frac, 0) + COALESCE(avg_width, 0) / 1000) AS avg_leaf_density
    FROM pg_stats
    WHERE schemaname NOT IN (pg_catalog, information_schema)
    GROUP BY schemaname, tablename
  ) sub
  WHERE avg_leaf_density > 0
) sub2
WHERE bloat_pct > 20
ORDER BY bloat_pct DESC;
```

### 6.2 Reindexing

```sql
-- Reindex specific table (locks table)
REINDEX TABLE VERBOSE content_items;

-- Reindex specific index (locks only that index)
REINDEX INDEX VERBOSE idx_content_status;

-- Reindex database (full lock - maintenance window)
REINDEX DATABASE VERBOSE ssssy_website;

-- Concurrent reindex (PG12+, no lock)
REINDEX TABLE CONCURRENTLY content_items;
```

**When to reindex:** After bulk loads (>10% change), degraded index performance, monthly maintenance.

### 6.3 Statistics Management

```sql
-- Check when tables were last analyzed
SELECT relname, last_analyze, last_autoanalyze,
       n_live_tup, n_dead_tup
FROM pg_stat_user_tables
ORDER BY last_analyze NULLS FIRST;

-- Manually analyze specific table
ANALYZE VERBOSE content_items;

-- Analyze all tables
ANALYZE VERBOSE;

-- Table access patterns for optimization
SELECT relname, seq_scan, seq_tup_read,
       idx_scan, idx_tup_fetch,
       n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### 6.4 Index Management

```sql
-- Unused indexes (zero scans - drop candidates)
SELECT schemaname, tablename, indexname,
       idx_scan,
       pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Low-usage indexes (minimal scans)
SELECT schemaname, tablename, indexname,
       idx_scan, pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan < 10 AND schemaname = public
ORDER BY idx_scan ASC;

-- Duplicate indexes
SELECT a.indrelid::regclass AS table_name,
       pg_get_indexdef(a.indexrelid) AS index_a,
       pg_get_indexdef(b.indexrelid) AS index_b,
       pg_relation_size(a.indexrelid) AS size_a
FROM pg_index a
JOIN pg_index b ON a.indrelid = b.indrelid
  AND a.indexrelid < b.indexrelid
  AND a.indkey = b.indkey;
```

### 6.5 Table Partitioning

Tables that should be partitioned for production:

| Table | Partition Key | Interval | Retention |
|-------|---------------|----------|-----------|
| audit_logs | created_at | Monthly | 12 months |
| email_messages | created_at | Monthly | 3 months |
| email_scheduled_sends | scheduled_at | Monthly | 6 months |

```sql
-- Partition audit_logs by month
CREATE TABLE audit_logs_partitioned (
  LIKE audit_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs_partitioned
  FOR VALUES FROM (2026-01-01) TO (2026-02-01);
CREATE TABLE audit_logs_2026_02 PARTITION OF audit_logs_partitioned
  FOR VALUES FROM (2026-02-01) TO (2026-03-01);

-- Add indexes to partitions
CREATE INDEX idx_audit_logs_2026_01_actor ON audit_logs_2026_01 (actor_id);

-- Detach old partition for archival
ALTER TABLE audit_logs_partitioned DETACH PARTITION audit_logs_2025_01;
```

### 6.6 Connection Management

```sql
-- Current connection summary
SELECT count(*) AS total_connections,
       count(*) FILTER (WHERE state = active) AS active,
       count(*) FILTER (WHERE state = idle) AS idle,
       count(*) FILTER (WHERE state = idle in transaction) AS idle_in_txn
FROM pg_stat_activity
WHERE datname = ssssy_website;

-- Long-running active queries
SELECT pid, now() - query_start AS duration,
       state, left(query, 100) AS query_preview
FROM pg_stat_activity
WHERE state = active AND datname = ssssy_website AND pid <> pg_backend_pid()
ORDER BY duration DESC;

-- Idle-in-transaction (connection leak detection)
SELECT pid, now() - state_change AS idle_duration, left(query, 100)
FROM pg_stat_activity
WHERE state = idle in transaction AND datname = ssssy_website
  AND now() - state_change > interval 5 minutes;

-- Kill a specific connection
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = 12345;

-- Kill all idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state = idle AND pid <> pg_backend_pid() AND datname = ssssy_website;
```

HikariCP pool tuning in application-prod.yml:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 5000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
      pool-name: SSSSY-HikariPool
```

### 6.7 Query Tuning

```sql
-- EXPLAIN ANALYZE a slow query
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT ci.*, u.username AS author_name
FROM content_items ci
JOIN users u ON ci.author_id = u.id
WHERE ci.status = PUBLISHED
  AND ci.category_id = abc-123-def
ORDER BY ci.published_at DESC
LIMIT 20;
```

Common problems and fixes:

| Problem | Symptom | Fix |
|---------|---------|-----|
| Missing WHERE index | Seq scan on large table | Add index on filtered columns |
| Wrong join order | High startup cost | Increase random_page_cost |
| Missing composite index | Bitmap scan with recheck | Create composite covering index |
| OR conditions | BitmapOr scan | Use UNION ALL or IN clause |
| JSONB queries | Slow with -> operator | Create GIN index on JSONB column |

Recommended indexes for the SSSSY schema:

```sql
-- Content
CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON content_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_category ON content_items(category_id);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_title_search
  ON content_items USING GIN (to_tsvector(english, title_en || COALESCE(description_en,)));

-- Events
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Email
CREATE INDEX IF NOT EXISTS idx_email_messages_account ON email_messages(account_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_delivery ON email_messages(delivery_status);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### 6.8 Database Upgrades (pg_upgrade)

```bash
#!/bin/bash
# PostgreSQL upgrade 16 -> 17

OLD_VERSION="16"
NEW_VERSION="17"
BACKUP_DIR="/backups/postgres/pre_upgrade_$(date +%Y%m%d)"

# Step 1: Full backup
pg_dumpall -U postgres -f "${BACKUP_DIR}/full_dump.sql"

# Step 2: Stop PostgreSQL
docker compose stop postgres

# Step 3: Init new data dir
docker run --rm -v pgdata_new:/var/lib/postgresql/data postgres:${NEW_VERSION}-alpine initdb

# Step 4: Run pg_upgrade
docker run --rm -v postgres_data:/old:ro -v pgdata_new:/new postgres:${NEW_VERSION}-alpine \
  pg_upgrade -b /usr/lib/postgresql/${OLD_VERSION}/bin -B /usr/lib/postgresql/${NEW_VERSION}/bin \
  -d /old -D /new -U postgres --check

# Step 5: Swap volumes and start
docker compose up -d postgres
sleep 10
docker compose exec postgres psql -U postgres -d ssssy_website -c "ANALYZE;"
```

### 6.9 PostgreSQL Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";           -- UUID v4 generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";             -- Trigram text search
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";  -- Query performance
CREATE EXTENSION IF NOT EXISTS "hstore";              -- Key-value metadata
CREATE EXTENSION IF NOT EXISTS "pgcrypto";            -- Hashing/crypto
CREATE EXTENSION IF NOT EXISTS "pgstattuple";          -- Bloat analysis

-- Verify installed extensions
SELECT * FROM pg_extension;
```

---

## 7. Email Operations

### 7.1 Daily Email Operations

#### Bounce Handling

```sql
-- Review bounced emails in last 24 hours
SELECT id, sender_address, recipient_address, subject, created_at, error_message
FROM email_messages
WHERE delivery_status = BOUNCED
  AND created_at > NOW() - INTERVAL 24 hours
ORDER BY created_at DESC;

-- Mark recipients inactive after bounce (automatic via rule engine)
UPDATE email_contacts SET is_active = false
WHERE email IN (
  SELECT recipient_address FROM email_messages
  WHERE delivery_status = BOUNCED
    AND created_at > NOW() - INTERVAL 7 days
);
```

#### Spam Report Review

```bash
# Check email headers for spam score via API
GET /api/admin/email/messages/{id}/headers
# Look for: X-Spam-Score, X-Spam-Status, Authentication-Results

# Rspamd UI (Mailcow)
open https://mail.ssssy.org.sy/rspamd/
# Navigate to: History -> Scan results
```

#### Quota Management

```bash
# View all accounts with quota usage
GET /api/admin/email/accounts
# Response includes: used_bytes, quota_bytes per account

# Set quota for an account
PUT /api/admin/email/accounts/{accountId}/quota
{"quotaBytes": 2147483648}  # 2 GB

# View quota history
GET /api/admin/email/accounts/{accountId}/quota-logs

# View quota alerts
GET /api/admin/email/quota-alerts
```

#### Scheduled Send Management

```bash
# List all pending scheduled sends for an account
GET /api/admin/email/accounts/{accountId}/scheduled-sends

# View send details
GET /api/admin/email/scheduled-sends/{id}

# Cancel a scheduled send
DELETE /api/admin/email/scheduled-sends/{id}

# Force immediate processing
POST /api/admin/email/scheduled-sends/{id}/process-now
```

### 7.2 Mailcow Management

#### Web UI Administration

```
URL:      https://mail.ssssy.org.sy
Username: admin (or mailcow admin user)
Password: (set during mailcow.conf setup)
```

Key sections:
- **Mailboxes**: Create/manage mailboxes, passwords, quotas
- **Domains**: Add/remove domains, rate limits
- **Aliases**: Email aliases and distribution lists
- **Rspamd**: Anti-spam config, whitelist/blacklist
- **DKIM**: Generate and view DKIM keys
- **Logs**: Mail logs by sender/recipient/subject
- **Configuration**: TLS, custom config overrides

#### Mailcow API Usage

```bash
# Get API token from Configuration > API in Mailcow UI

# Create mailbox
curl -X POST https://mail.ssssy.org.sy/api/v1/add/mailbox \
  -H "X-API-Key: ${MAILCOW_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{"local_part": "newuser", "domain": "ssssy.org.sy", \
       "name": "New User", "password": "temp-password", \
       "quota": "1073741824", "active": "1"}"

# List all mailboxes
curl -s -X GET https://mail.ssssy.org.sy/api/v1/get/mailbox/all \
  -H "X-API-Key: ${MAILCOW_API_KEY}" | jq .
```

#### Domain and Mailbox Management (CLI)

```bash
docker compose exec postfix-mailcow setup config add domain ssssy.org.sy
docker compose exec postfix-mailcow setup config add mailbox user@ssssy.org.sy
docker compose exec postfix-mailcow setup config set password user@ssssy.org.sy
docker compose exec postfix-mailcow setup config show domains
```

#### Alias Management

```bash
# Via API:
curl -X POST https://mail.ssssy.org.sy/api/v1/add/alias \
  -H "X-API-Key: ${MAILCOW_API_KEY}" \
  -d "{"address": "info@ssssy.org.sy", \
       "goto": "user1@ssssy.org.sy,user2@ssssy.org.sy", "active": "1"}"
```

#### Resource Limits

| Resource | Default | Recommended Max |
|----------|---------|-----------------|
| Mailbox size | 1 GB | 5 GB |
| Max mailboxes per domain | Unlimited | 500 |
| Max aliases per domain | Unlimited | 200 |
| Max recipients per message | 50 | 100 |
| Max message size | 25 MB | 50 MB |

### 7.3 Email Queue Monitoring

#### Postfix Queue Management

```bash
# Enter postfix container
docker compose exec postfix-mailcow /bin/bash

# View mail queue
postqueue -p
# -QueueID- --Size-- ----Arrival Time---- -Sender/Recipient-
# 3FDG4H5J6  1234  Tue Jun 28 10:30:00  noreply@ssssy.org.sy
#                                         user@example.com

# Count messages in queue
postqueue -p | grep -c "^[A-F0-9]"

# View deferred queue
postqueue -p | grep -A1 "^[A-F0-9]" | grep -B1 "deferred"

# View specific message details
postcat -q 3FDG4H5J6

# Flush queue (retry all deferred)
postqueue -f

# Delete specific message
postsuper -d 3FDG4H5J6

# Delete all messages in queue
postsuper -d ALL

# Delete all deferred messages
postsuper -d ALL deferred
```

#### Deferred Mail Review and Retry

```bash
# Check why mail is deferred
postqueue -p | grep deferred | awk "{print \$1}" | head -5 | while read qid; do
  echo "=== Queue ID: \$qid ==="
  postcat -q "\$qid" | grep -E "(status=|diagnostic code:)"
done

# Count deferred messages
mailq | grep -c deferred

# Force retry all deferred
postqueue -f
```

#### Queue Flush Procedures

```bash
# Normal flush (respects retry timers)
postqueue -f

# Immediate flush (use cautiously)
postsuper -r ALL && postqueue -f

# Check queue disk usage
du -sh /var/spool/postfix/deferred/
du -sh /var/spool/postfix/active/
du -sh /var/spool/postfix/maildrop/
```

### 7.4 Anti-Spam Management

#### Rspamd Web UI

```
URL: https://mail.ssssy.org.sy/rspamd/
Password: (set in mailcow.conf - RSPAMD_PASSWORD)
```

Key sections:
- **History**: Scan results with scores for all messages
- **Actions**: Reject/add-header/pass decisions
- **Symbols**: Individual spam checks triggered
- **Scan**: Test a message against rules
- **Settings**: Whitelist/blacklist, custom rules

#### Whitelist/Blacklist Management

```bash
# Add to whitelist
echo "example.org" >> /etc/rspamd/local.d/whitelist.map
docker compose exec rspamd-mailcow rspamadm control reload

# Add to blacklist
echo "spammer.com" >> /etc/rspamd/local.d/blacklist.map
docker compose exec rspamd-mailcow rspamadm control reload
```

#### Custom Spam Rules

```bash
cat > /opt/mailcow/data/conf/rspamd/custom/rules.conf << EOF
# Custom high-score rule for suspiciously long URLs
symbol "SSSSY_LONG_URLS" {
  score = 5.0;
  description = "Message contains suspiciously long URLs";
  condition {
    message = function(message) {
      local urls = message:get_urls();
      if urls then
        for _, url in ipairs(urls) do
          if #url > 100 then return true; end
        end
      end
      return false;
    };
  };
}
EOF
docker compose exec rspamd-mailcow rspamadm control reload
```

#### DKIM/DMARC/SPF Reporting

```bash
# View DKIM keys in Mailcow UI (Configuration > DKIM)

# Generate new DKIM key
docker compose exec rspamd-mailcow dkim-key gen -d ssssy.org.sy

# Check SPF record
dig txt ssssy.org.sy | grep spf
# Expected: "v=spf1 mx ~all" or "v=spf1 include:spf.mailcow.net -all"

# Check DKIM record
dig txt default._domainkey.ssssy.org.sy

# Check DMARC record
dig txt _dmarc.ssssy.org.sy
# Expected: "v=DMARC1; p=quarantine; rua=mailto:dmarc@ssssy.org.sy"
```

### 7.5 Email Security

#### TLS Configuration

```bash
# Verify TLS on port 587 (submission)
openssl s_client -connect mail.ssssy.org.sy:587 -starttls smtp < /dev/null

# Verify TLS on port 993 (IMAPS)
openssl s_client -connect mail.ssssy.org.sy:993 -servername mail.ssssy.org.sy < /dev/null

# Check certificate expiry
openssl s_client -connect mail.ssssy.org.sy:587 -starttls smtp < /dev/null 2>&1 | \
  openssl x509 -noout -dates
```

#### SMTP Auth Security

Mailcow defaults:
- Port 587 (submission): Required TLS + AUTH
- Port 25 (SMTP): TLS optional, AUTH not required (inbound)
- Authentication methods: PLAIN, LOGIN (over TLS only)

Restrict by IP via Postfix:

```bash
# /opt/mailcow/data/conf/postfix/extra.cf
smtpd_client_restrictions =
  permit_mynetworks,
  permit_sasl_authenticated,
  reject_rbl_client zen.spamhaus.org,
  reject_unauth_destination

mynetworks = 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
```

#### Rate Limiting

```bash
# Mailcow per-mailbox rate limits (mailcow.conf)
POSTFIX_RATE_LIMIT_1=60/1     # 60 emails/minute per sender
POSTFIX_RATE_LIMIT_2=500/60   # 500 emails/hour per sender

# Postfix general rate limits (extra.cf)
smtpd_client_connection_rate_limit = 100
smtpd_client_message_rate_limit = 60
```

#### Abuse Prevention

```bash
# Check for high-volume senders
docker compose exec postfix-mailcow postqueue -p | awk "{print \$NF}" | \
  sort | uniq -c | sort -rn | head -10

# Check auth failures
docker compose exec postfix-mailcow zgrep "SASL.*authentication failed" /var/log/mail.log | \
  awk "{print \$NF}" | sort | uniq -c | sort -rn | head -10

# Application-level send rate monitoring
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT account_id, count(*) as sent_last_hour
  FROM email_messages
  WHERE created_at > NOW() - INTERVAL 1 hour
  GROUP BY account_id
  HAVING count(*) > 50
  ORDER BY sent_last_hour DESC;
"


---

## 8. Scaling & Performance

### 8.1 Horizontal Scaling

#### Load Balancer Setup (HAProxy or Nginx)

```cfg
# haproxy.cfg
global
  maxconn 4096

defaults
  mode http
  timeout connect 5000ms
  timeout client 50000ms
  timeout server 50000ms

frontend ssssy_frontend
  bind *:80
  bind *:443 ssl crt /etc/ssl/ssssy.pem
  default_backend ssssy_backend

backend ssssy_backend
  balance roundrobin
  option forwardfor
  option httpchk GET /actuator/health
  server backend1 10.0.1.10:8080 check inter 5s fall 3 rise 2
  server backend2 10.0.1.11:8080 check inter 5s fall 3 rise 2
  server backend3 10.0.1.12:8080 check inter 5s fall 3 rise 2
```

#### Session Affinity

The backend uses **stateless JWT tokens**, so no session affinity is required. All instances share the same JWT_SECRET.

```yaml
# All backend instances must have identical JWT_SECRET
JWT_SECRET=the-same-256-bit-secret-on-all-instances
```

#### Database Connection Management Across Instances

```yaml
# Total connections = instances x maximum-pool-size
# Must not exceed PostgreSQL max_connections
# Example: 3 instances x 20 pool size = 60 connections
# Set max_connections to at least 100
```

#### Cache Invalidation Across Instances

Since Redis is shared, cache invalidation is automatic. Cache names used:
- publicContent, events, jobVacancies, categories, systemConfig
- TTL: 1 hour default (configurable in CacheConfig.java)

### 8.2 Vertical Scaling

#### When to Increase Resources

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU usage | >80% for 10 min | Add CPU cores or instances |
| JVM heap | >85% after GC | Increase -Xmx, tune GC |
| DB pool | >80% active | Increase pool size (check max_connections) |
| Disk I/O wait | >10% | Upgrade to NVMe storage |
| System memory | >90% | Add RAM |
| Network bandwidth | >80% of link | Upgrade link or add LB |

#### JVM Heap Tuning

```bash
# Production JVM options
JAVA_OPTS="-Xms2g -Xmx4g \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:InitiatingHeapOccupancyPercent=45 \
  -XX:+ParallelRefProcEnabled \
  -XX:+UseStringDeduplication \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/app/logs/heapdump.hprof \
  -Xlog:gc*=info:/app/logs/gc.log:time,uptime,level,tags \
  -Djava.security.egd=file:/dev/./urandom"
```

#### GC Log Analysis

```bash
# Average GC pause
grep -oP "\d+\.\d+ms" backend/logs/gc.log | awk "{sum+=\$1; count++} END {print sum/count \"ms avg pause\"}"

# Count GC events
grep -c "Pause Young" backend/logs/gc.log
grep -c "Pause Full" backend/logs/gc.log

# Use GCViewer or gceasy.io for detailed analysis
```

### 8.3 Performance Monitoring

#### Response Time Monitoring (p50, p95, p99)

```bash
# Via PromQL
# P95: histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri))
# P99: histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri))

# Via Actuator (instantaneous)
curl -s http://localhost:8080/actuator/metrics/http.server.requests \
  -H "Authorization: Bearer \$TOKEN" | jq .
```

#### Throughput Monitoring

```promql
# Requests per second
rate(http_server_requests_seconds_count[5m])

# Per-endpoint throughput
sum(rate(http_server_requests_seconds_count{uri="/api/public/events"}[5m]))
```

#### Error Budget Tracking

SLO: 99.9% uptime, p95 < 500ms. Monthly error budget: 0.1% of total requests.

```promql
# Current error rate
rate(http_server_requests_seconds_count{status=~"5.."}[5m]) / \
  rate(http_server_requests_seconds_count[5m]) * 100

# Alert if burn rate exceeds 2 (consume budget in 2 weeks)
# Alert if burn rate exceeds 10 (consume budget in 3 days)
```

### 8.4 Caching Optimization

#### Redis Memory Management

```bash
# Current memory usage
redis-cli INFO memory | grep -E "used_memory_human|maxmemory_human|mem_fragmentation_ratio"

# Set limits
redis-cli CONFIG SET maxmemory 1gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Monitor evictions
redis-cli INFO stats | grep evicted_keys
```

#### Cache Hit Ratio Improvement

```bash
# Current ratio
HITS=$(redis-cli INFO stats | grep keyspace_hits | cut -d: -f2)
MISSES=$(redis-cli INFO stats | grep keyspace_misses | cut -d: -f2)
RATIO=$(echo "scale=2; \$HITS / (\$HITS + \$MISSES) * 100" | bc)
echo "Cache hit ratio: ${RATIO}%"

# Target: >90% for API cache, >95% for static data
```

Strategies:
1. Increase TTL for stable data (categories, system config)
2. Pre-warm cache on startup for frequently accessed data
3. Use content-based cache keys (hash of data)
4. Add CDN for media and static assets

#### CDN Integration

Cloudflare or CloudFront recommended:
- Static assets (js, css, images): cache 30 days
- Media files (pdfs, videos): cache 7 days
- API responses: bypass or edge-cache with short TTL

MinIO presigned URLs for private content: GET /api/media/{id}/download?expires=3600

### 8.5 Database Optimization

#### Read Replica Setup

For read-heavy workloads, configure read replicas:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://primary-db:5432/ssssy_website
    hikari:
      maximum-pool-size: 10
# Read replica requires AbstractRoutingDataSource or external library
```

#### Query Optimization Workflow

1. **IDENTIFY**: Slow in logs, pg_stat_statements, or user reports
2. **ANALYZE**: EXPLAIN (ANALYZE, BUFFERS, TIMING) - look for Seq Scan, row misestimates
3. **OPTIMIZE**: Add index, rewrite query, update statistics, increase work_mem
4. **VERIFY**: Re-run EXPLAIN ANALYZE, check in staging, monitor production
5. **ESCALATE**: Materialized view, caching layer, denormalization if still slow

#### Connection Pooling Tuning Equation

```yaml
# Formula: ((core_count * 2) + effective_spindle_count)
# 4-core server with SSD: 4 * 2 + 1 = 9 -> round to 10 minimum
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 5000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
```

---

## 9. Security Operations

### 9.1 Incident Response Plan

#### Detection Methods

| Detection Method | Tools | Response Time |
|-----------------|-------|---------------|
| Monitoring alerts | Prometheus + Grafana | <5 min |
| Rate limit violations | RateLimitFilter logs | <15 min |
| Audit log anomalies | SIEM / Elasticsearch | <1 hour |
| User reports | Help desk | <2 hours |
| Failed login spikes | Application logs | <15 min |

#### Containment

```bash
# Block at firewall
iptables -A INPUT -s <attacker-ip> -j DROP

# Block abusive accounts
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  UPDATE users SET is_active = false, account_locked_until = NOW() + INTERVAL 24 hours
  WHERE email = compromised@example.com;
"

# Revoke sessions - change JWT_SECRET (invalidates all tokens)
docker compose up -d --no-deps backend
```

#### Eradication

```bash
# Identify root cause from audit logs
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT * FROM audit_logs
  WHERE created_at > NOW() - INTERVAL 24 hours
    AND action IN (LOGIN_FAILED, UPDATE, DELETE)
    AND actor_id IN (SELECT id FROM users WHERE is_active = false);
"

# Patch vulnerability, update dependencies, scan for persistence
```

#### Recovery

```bash
# Restore from clean backup (see Section 5)

# Validate data integrity
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT users AS tbl, count(*) FROM users
  UNION SELECT content_items, count(*) FROM content_items;
"

# Rotate ALL credentials: JWT_SECRET, DB passwords, SMTP/IMAP, API keys
```

#### Post-Mortem

Document: (1) Timeline, (2) Root cause, (3) Impact, (4) Action items, (5) Lessons learned

### 9.2 Vulnerability Management

#### Dependency Scanning

**OWASP Dependency Check (Backend):**

```bash
# Add plugin to pom.xml then run:
mvn org.owasp:dependency-check-maven:check
# Report: target/dependency-check-report.html
```

**npm audit (Frontend):**

```bash
cd frontend
npm audit --audit-level=high
npm audit --json | jq .vulnerabilities | head -50
```

#### Image Scanning (Trivy)

```bash
trivy image ssssy-backend:latest
trivy image ssssy-frontend:latest
trivy image postgres:16-alpine

# CI integration - fail on critical/high
trivy image --exit-code 1 --severity CRITICAL,HIGH ssssy-backend:latest
```

#### Periodic Penetration Testing

| Test Type | Frequency | Scope |
|-----------|-----------|-------|
| Automated vuln scan | Monthly | All endpoints (OWASP ZAP) |
| Manual pentest | Quarterly | Auth, authorization, injection |
| Dependency audit | Weekly | mvn dep check, npm audit |
| Docker image scan | Per build | Trivy |
| SSL/TLS audit | Monthly | testssl.sh |

#### Patch Management Schedule

| Component | Patch Frequency | Downtime |
|-----------|----------------|----------|
| Backend (Java) | Monthly / critical CVE | Rolling restart |
| Frontend (Node) | Monthly / critical CVE | Rolling restart |
| PostgreSQL | Per release | pg_upgrade |
| MinIO | Quarterly | Rolling restart |
| Redis | Per release | Restart |
| Docker engine | Monthly | Host reboot |
| OS packages | Weekly | Host reboot (kernel) |

### 9.3 Access Control Operations

#### User Audits (Quarterly)

```sql
-- List all active admin/editor/publisher users
SELECT id, username, email, role, last_login_at, is_active
FROM users
WHERE role IN (ADMIN, EDITOR, PUBLISHER)
ORDER BY last_login_at DESC NULLS LAST;

-- Accounts with elevated privileges inactive for 90 days
SELECT id, username, email, role, last_login_at
FROM users
WHERE role IN (ADMIN, EDITOR, PUBLISHER)
  AND (last_login_at IS NULL OR last_login_at < NOW() - INTERVAL 90 days)
ORDER BY last_login_at;

-- Accounts with multiple failed login attempts
SELECT id, username, email, failed_login_attempts, account_locked_until
FROM users WHERE failed_login_attempts > 3;
```

#### Role Review (Quarterly)

```sql
-- Verify role assignments
SELECT id, username, email, role, created_at
FROM users
WHERE role NOT IN (ADMIN, EDITOR, PUBLISHER, USER);

-- Admin role holders (should be <5)
SELECT id, username, email, last_login_at
FROM users WHERE role = ADMIN ORDER BY username;
```

#### Deactivated User Cleanup

```sql
-- Users inactive for >6 months
SELECT id, username, email, last_login_at
FROM users
WHERE is_active = true
  AND (last_login_at IS NULL OR last_login_at < NOW() - INTERVAL 6 months);

-- Reassign orphan content from deactivated users
UPDATE content_items SET author_id = (SELECT id FROM users WHERE username = admin)
WHERE author_id IN (SELECT id FROM users WHERE is_active = false);
```

#### Session Management

```bash
# Monitor login activity
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT actor_id, u.username, COUNT(*) AS login_count,
         MIN(created_at) AS first, MAX(created_at) AS last
  FROM audit_logs al
  JOIN users u ON al.actor_id = u.id
  WHERE action = LOGIN AND created_at > NOW() - INTERVAL 24 hours
  GROUP BY actor_id, u.username
  ORDER BY login_count DESC;
"

# Emergency: change JWT_SECRET and restart backend
docker compose up -d --no-deps backend
```

### 9.4 File Upload Security

#### ClamAV Integration

```yaml
# docker-compose.clamav.yml
services:
  clamav:
    image: clamav/clamav:latest
    container_name: ssssy-clamav
    restart: unless-stopped
    ports: ["3310:3310"]
    volumes:
      - clamav_data:/var/lib/clamav
volumes:
  clamav_data:
```

#### Malware Pattern Updates

```bash
# Automatic via freshclam in official image
docker compose exec clamav freshclam --version
docker compose exec clamav freshclam  # Force update
```

#### Quarantine Management

```bash
# Quarantine location: /opt/ssssy/backend/uploads/quarantine/
ls -la /opt/ssssy/backend/uploads/quarantine/

# Release from quarantine (after manual review)
mv /opt/ssssy/backend/uploads/quarantine/flagged_file.pdf /opt/ssssy/backend/uploads/files/

# Delete quarantined files older than 30 days
find /opt/ssssy/backend/uploads/quarantine/ -type f -mtime +30 -delete
```

### 9.5 Rate Limiting Management

#### Monitoring Rate Limit Hits

```bash
# From application logs
grep "Rate limit exceeded\\|TOO_MANY_REQUESTS" /opt/ssssy/backend/logs/application.log | \
  grep -oP "\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b" | \
  sort | uniq -c | sort -rn | head -10

# From audit logs
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT COUNT(*) AS hits, ip_address, MAX(created_at) AS last_hit
  FROM audit_logs
  WHERE action = RATE_LIMIT_EXCEEDED
    AND created_at > NOW() - INTERVAL 24 hours
  GROUP BY ip_address
  ORDER BY hits DESC LIMIT 20;
"
```

#### Adjusting Limits

The RateLimitFilter defaults (bucket4j):

```java
private static final int CAPACITY = 100;          // Burst capacity
private static final int REFILL_PER_MINUTE = 30;  // Sustained rate
```

Modify via application.yml or Java source. Whitelist trusted IPs in shouldNotFilter().


---

## 10. Scheduled Task Management

The SSSSY backend has three scheduled tasks managed by Spring @EnableScheduling:

### 10.1 ContentSchedulerService (60s interval)

**File:** backend/src/main/java/org/ssssy/backend/service/ContentSchedulerService.java

**Purpose:** Publishes content items that are in SCHEDULED status and whose scheduledAt time has passed.

**How it works:**
1. Every 60 seconds, queries content_items where status = SCHEDULED AND scheduledAt <= now()
2. For each item: sets status to PUBLISHED, sets publishedAt, assigns system user as publisher
3. Creates a WorkflowLog entry with action = AUTO_PUBLISH
4. Sends notification via NotificationService.notifyWorkflowPublished()
5. Logs success or failure per item

**Debugging:**

```bash
# Check task execution logs
docker compose logs backend | grep "ContentSchedulerService\\|publishing scheduled"

# Check for pending scheduled content
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT id, title_en, status, scheduled_at
  FROM content_items
  WHERE status = SCHEDULED
  ORDER BY scheduled_at;
"

# Verify published items
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT id, title_en, status, published_at,
         EXTRACT(EPOCH FROM (published_at - scheduled_at)) AS delay_seconds
  FROM content_items
  WHERE status = PUBLISHED AND published_at IS NOT NULL
  ORDER BY published_at DESC LIMIT 10;
"

# Manual trigger via debug endpoint (if available)
POST /api/admin/debug/trigger-content-publish
```

**Common issues:**

| Issue | Cause | Resolution |
|-------|-------|------------|
| Content not published | System user missing | Create user with username system or admin |
| Content not picked up | scheduledAt in future | Verify scheduledAt value |
| Task not running | @EnableScheduling missing | Check SsssyApplication.java has @EnableScheduling |
| Exception during publish | DB constraint or null field | Check error logs for details |

### 10.2 EmailScheduledSendService (60s interval)

**File:** backend/src/main/java/org/ssssy/backend/service/EmailScheduledSendService.java

**Purpose:** Processes email campaigns that are scheduled for future delivery.

**How it works:**
1. Every 60 seconds, queries email_scheduled_sends where status = PENDING AND scheduled_at <= now()
2. For each scheduled send: fetches the EmailMessage and EmailRecipients
3. Sends via EmailSendService.sendViaSmtpInternal()
4. On success: sets message status to SENT, updates processedAt
5. On failure: sets status to FAILED, stores error message

**Debugging:**

```bash
# Check task execution logs
docker compose logs backend | grep "EmailScheduledSendService\\|processPending"

# Check pending scheduled sends
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT id, status, scheduled_at, processed_at, error_message
  FROM email_scheduled_sends
  WHERE status = PENDING
  ORDER BY scheduled_at;
"

# View failed sends
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT id, status, scheduled_at, error_message
  FROM email_scheduled_sends
  WHERE status = FAILED
  ORDER BY scheduled_at DESC LIMIT 20;
"

# Manual trigger via API
POST /api/admin/email/scheduled-sends/{id}/process-now

# List all scheduled sends
GET /api/admin/email/accounts/{accountId}/scheduled-sends
```

**Common issues:**

| Issue | Cause | Resolution |
|-------|-------|------------|
| Email stuck as PENDING | scheduledAt in future | Check scheduled_at value |
| Send fails with SMTP error | SMTP credentials or connectivity | Check SMTP config in environment |
| Recipient list empty | No recipients linked to message | Check email_recipients table |
| Message account null | Account not set on message | Verify message.account_id is set |

### 10.3 EmailSyncService (300s IMAP poll)

**File:** backend/src/main/java/org/ssssy/backend/service/EmailSyncService.java

**Purpose:** Syncs emails from IMAP servers for accounts with imap_subscribed = true.

**How it works:**
1. Every 300 seconds (5 minutes), queries email_accounts where imap_subscribed = true
2. For each account: connects via IMAP, lists folders
3. For each folder: fetches new messages since last sync (by count)
4. Imports each new message into email_messages table
5. Applies email rules via EmailRuleExecutionService.applyRulesOnReceive()
6. Updates last_sync_at on the account

**Configuration:**

```yaml
# application.yml
app:
  email:
    imap:
      host: ${SSSSY_EMAIL_IMAP_HOST:localhost}
      port: ${SSSSY_EMAIL_IMAP_PORT:143}
```

**Debugging:**

```bash
# Check sync execution logs
docker compose logs backend | grep "EmailSyncService\\|syncAccount\\|Failed to sync"

# Check subscribed accounts
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT id, email_address, imap_subscribed, last_sync_at
  FROM email_accounts
  WHERE imap_subscribed = true;
"

# Force sync for an account (via debug endpoint if available)
POST /api/admin/debug/sync-email/{accountId}

# Check folder message counts
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT f.name, f.imap_folder_name, COUNT(m.id) as message_count
  FROM email_folders f
  LEFT JOIN email_messages m ON m.folder_id = f.id
  GROUP BY f.id, f.name, f.imap_folder_name
  ORDER BY f.name;
"
```

**Common issues:**

| Issue | Cause | Resolution |
|-------|-------|------------|
| Sync fails with connection error | IMAP host/port unreachable | Telnet IMAP_HOST:IMAP_PORT to verify connectivity |
| Authentication failure | IMAP credentials wrong | Verify account.username and account.password_hash |
| Timeout syncing large folders | IMAP timeout too low | Increase mail.imap.timeout in EmailSyncService.java |
| Duplicate messages | Message-ID dedup failing | Check email_messages.message_id uniqueness |
| Rules not firing | EmailRuleExecutionService error | Check error.log for rule engine exceptions |

### 10.4 Monitoring Scheduled Task Execution

```bash
# Check Spring scheduler thread pool (default: 1 thread)
# Tasks run sequentially - a long-running task can delay others

# Log task execution timing by enabling DEBUG logging for scheduler
curl -X POST http://localhost:8080/actuator/loggers/org.springframework.scheduling \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer \$TOKEN" \
  -d "{"configuredLevel": "DEBUG"}"

# Monitor via Prometheus (if scheduler metrics exposed)
# Look for: task executor metrics, task completion times
```

### 10.5 Failure Handling and Retry

Each scheduled task handles failures per-item:
- ContentSchedulerService: catches per-item exception, logs error, continues
- EmailScheduledSendService: sets FAILED status with error message, continues
- EmailSyncService: catches per-account exception, logs error, continues to next account

There is no automatic retry. Manual retry procedures:
- Failed scheduled sends: reset status to PENDING and update scheduled_at
- Failed content publish: manually set status to PUBLISHED or re-schedule
- Failed sync: accounts are retried on the next 5-minute cycle


---

## 11. Capacity Planning

### 11.1 Current Resource Usage Baselines

Run these commands to establish baselines:

```bash
# Database size
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT pg_size_pretty(pg_database_size(ssssy_website)) AS db_size;
"

# Largest tables
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT relname, n_live_tup,
         pg_size_pretty(pg_total_relation_size(relid)) AS total_size
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(relid) DESC
  LIMIT 10;
"

# Request rate
curl -s http://localhost:8080/actuator/metrics/http.server.requests \
  -H "Authorization: Bearer \$TOKEN" | jq .measurements[]

# Redis keys
redis-cli DBSIZE
redis-cli INFO memory

# Disk usage
df -h / /var/lib/docker
du -sh /backups/
```

### 11.2 Growth Projections

| Resource | Current | Monthly Growth | 6-Month Projection | 12-Month Projection |
|----------|---------|----------------|--------------------|---------------------|
| Database size | ~1 GB | ~5% | ~1.3 GB | ~1.8 GB |
| Media storage | ~10 GB | ~10% | ~15 GB | ~25 GB |
| Redis memory | ~50 MB | ~5% | ~65 MB | ~85 MB |
| Request rate | ~100 req/s | ~10% | ~160 req/s | ~250 req/s |
| Active users | ~500 | ~10% | ~800 | ~1,500 |
| Email messages/month | ~50,000 | ~15% | ~100,000 | ~200,000 |
| Audit log entries/month | ~10,000 | ~10% | ~16,000 | ~30,000 |

### 11.3 When to Scale

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Backend CPU | >60% sustained | >80% sustained | Increase instances or CPU |
| Backend heap | >70% after GC | >85% after GC | Increase -Xmx |
| DB connections | >60% of pool | >80% of pool | Increase pool size |
| DB disk | >70% | >85% | Increase volume, archive old data |
| Redis memory | >70% of max | >85% of max | Increase maxmemory |
| Media disk | >70% | >85% | Increase volume, enable lifecycle rules |
| Response time p95 | >300ms | >500ms | Profile and optimize |
| Request error rate | >1% | >5% | Investigate and fix |

### 11.4 Cost Estimation for Cloud Deployment

| Provider | Instance Type | Specs | Monthly Cost (est.) |
|----------|--------------|-------|---------------------|
| AWS | t3.large x2 | 2 vCPU, 8 GB RAM | ~$120 |
| AWS | RDS db.t3.medium | 2 vCPU, 4 GB RAM, 100 GB | ~$80 |
| AWS | Elasticache cache.t3.small | 2 vCPU, 1.3 GB | ~$30 |
| AWS | S3 (media) | 50 GB + CDN | ~$15 |
| AWS | ELB | Basic load balancer | ~$20 |
| **Total** | | | **~$265/month** |

| Provider | Alternative | Monthly Cost (est.) |
|----------|-------------|---------------------|
| Hetzner | CX51 (8 vCPU, 16 GB, 160 GB NVMe) | ~$40/month (single server) |
| DigitalOcean | Premium Droplet (4 vCPU, 8 GB, 200 GB) | ~$84/month + managed DB ~$60 |
| Scaleway | DEV-L (4 vCPU, 8 GB, 150 GB) | ~$60/month |

### 11.5 Database Size Growth Projection

```sql
-- Table growth rate by month (requires multiple data points)
-- Run monthly and compare to track growth
WITH monthly_counts AS (
  SELECT
    date_trunc(month, created_at) AS month,
    count(*) AS rows_added
  FROM content_items
  WHERE created_at > NOW() - INTERVAL 6 months
  GROUP BY 1
  ORDER BY 1
)
SELECT
  month,
  rows_added,
  SUM(rows_added) OVER (ORDER BY month) AS cumulative
FROM monthly_counts;
```

Use this data to schedule partitioning and archival before tables grow unmanageable.

---

## 12. Troubleshooting

### 12.1 Application Down (Step-by-Step)

```bash
# Step 1: Check if Docker containers are running
docker compose ps

# Step 2: Check health endpoint
curl -f http://localhost:8080/actuator/health || echo "BACKEND DOWN"

# Step 3: Check container logs
docker compose logs --tail=100 backend

# Step 4: Check if port is listening
netstat -ano | findstr :8080

# Step 5: Check resource constraints (OOM kill?)
docker inspect ssssy-backend --format "{{.State.ExitCode}}"
docker logs ssssy-backend 2>&1 | grep -i "killed\\|OutOfMemory\\|exit"

# Step 6: Check upstream dependencies
docker compose exec postgres pg_isready
docker compose exec minio curl -f http://localhost:9000/minio/health/live
docker compose exec redis redis-cli ping

# Step 7: Restart and verify
docker compose restart backend
sleep 5
curl -f http://localhost:8080/actuator/health
```

### 12.2 Slow Responses (Step-by-Step)

```bash
# Step 1: Check overall response times via Actuator
curl -s http://localhost:8080/actuator/metrics/http.server.requests \
  -H "Authorization: Bearer \$TOKEN"

# Step 2: Enable DEBUG logging for slow endpoint identification
curl -X POST http://localhost:8080/actuator/loggers/org.ssssy.backend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer \$TOKEN" \
  -d "{"configuredLevel": "DEBUG"}"

# Step 3: Check database for running queries
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT pid, now() - query_start AS duration, state, left(query, 200)
  FROM pg_stat_activity
  WHERE state = active AND datname = ssssy_website
  ORDER BY duration DESC LIMIT 10;
"

# Step 4: Check Redis latency
docker compose exec redis redis-cli --latency -h localhost -p 6379

# Step 5: Check CPU usage of the backend process
docker stats ssssy-backend --no-stream

# Step 6: Generate thread dump to identify blocked threads
curl -o threaddump.txt -H "Authorization: Bearer \$TOKEN" \
  http://localhost:8080/actuator/threaddump
grep "BLOCKED\\|WAITING" threaddump.txt | head -20
```

### 12.3 Database Connection Pool Exhausted

```bash
# Step 1: Check current pool status via Actuator
curl -s http://localhost:8080/actuator/metrics/hikaricp.connections.active \
  -H "Authorization: Bearer \$TOKEN"
curl -s http://localhost:8080/actuator/metrics/hikaricp.connections.pending \
  -H "Authorization: Bearer \$TOKEN"

# Step 2: Check database side connections
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT count(*), state
  FROM pg_stat_activity WHERE datname = ssssy_website
  GROUP BY state;
"

# Step 3: Identify long-running or idle-in-transaction connections
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT pid, now() - query_start AS duration, state,
         left(query, 150), application_name
  FROM pg_stat_activity
  WHERE datname = ssssy_website AND state != idle
  ORDER BY duration DESC;
"

# Step 4: Kill offending connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state = idle in transaction AND datname = ssssy_website
  AND now() - state_change > interval 5 minutes;

# Step 5: Check for connection leak in application (leak-detection-threshold)
# If leak-detection-threshold is set, look for WARN-level log messages about connection leaks
```

### 12.4 Out of Memory (OOM)

```bash
# Step 1: Check if container was OOM-killed
docker inspect ssssy-backend --format "{{json .State}}" | jq .
docker logs ssssy-backend 2>&1 | grep -i "kill\\|memory\\|OOM"

# Step 2: Check system memory
# Windows: Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory
# Linux: free -h

# Step 3: Analyze heap dump (if HeapDumpOnOutOfMemoryError enabled)
# Download heap dump:
curl -o /tmp/heapdump.hprof -H "Authorization: Bearer \$TOKEN" \
  http://localhost:8080/actuator/heapdump

# Analyze with Eclipse MAT or jhat:
mat /tmp/heapdump.hprof  # Eclipse Memory Analyzer

# Step 4: Check GC logs for memory pressure
grep "OutOfMemory\|allocation failure" /app/logs/gc.log

# Step 5: Increase JVM heap or reduce memory leak
# Increase -Xmx in JAVA_OPTS environment variable

# Step 6: Check for memory leaks - compare heap dumps over time
# Look for: growing collections, unclosed connections, non-static inner classes
```

### 12.5 Disk Full (Cleanup Procedure)

```bash
# Step 1: Identify what is consuming space
df -h
du -sh /* 2>/dev/null | sort -rh | head -10

# Step 2: Check Docker disk usage
docker system df

# Step 3: Clean Docker artifacts
docker system prune -af --volumes 2>/dev/null || echo "Cannot prune in-use volumes"
docker image prune -af
docker builder prune -af

# Step 4: Clean old backups
find /backups -name "*.tar.gz" -mtime +30 -delete
find /backups -name "*.dump" -mtime +7 -delete

# Step 5: Clean old application logs
find /opt/ssssy/backend/logs -name "*.log.gz" -mtime +30 -delete
find /opt/ssssy/backend/logs -name "*.log" -size +500M -delete

# Step 6: Clean old PostgreSQL WAL files
docker compose exec postgres psql -U ssssy -c "SELECT pg_wal_replay_resume();"
docker compose exec postgres psql -U ssssy -c "CHECKPOINT;"

# Step 7: Vacuum large tables to reclaim space
docker compose exec postgres psql -U ssssy -d ssssy_website -c "VACUUM FULL VERBOSE audit_logs;"

# Step 8: Archive old audit logs (move to cold storage)
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL 1 year;
"

# Step 9: Monitor disk growth and set up alerting (see Section 3.1)
```

### 12.6 Email Queue Growing

```bash
# Step 1: Check queue size
docker compose exec postfix-mailcow postqueue -p | grep -c "^[A-F0-9]"
du -sh /var/spool/postfix/deferred/

# Step 2: Check why messages are deferred
docker compose exec postfix-mailcow postqueue -p | grep "deferred" | head -20

# Step 3: Check mail logs for errors
docker compose exec postfix-mailcow tail -100 /var/log/mail.log | grep -i "error\|reject\|bounce\|timeout"

# Step 4: Check DNS and connectivity to remote MX servers
docker compose exec postfix-mailcow dig mx gmail.com
docker compose exec postfix-mailcow ping -c 2 gmail-smtp-in.l.google.com

# Step 5: Check blacklisting
docker compose exec postfix-mailcow postqueue -p | head -20 | postcat -q | grep "status="
# Common: "Service unavailable" = remote server rejecting, "Connect timeout" = network issue

# Step 6: Flush queue after resolving issue
docker compose exec postfix-mailcow postqueue -f

# Step 7: Check application email send rate
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT delivery_status, count(*)
  FROM email_messages
  WHERE created_at > NOW() - INTERVAL 1 hour
  GROUP BY delivery_status;
"
```

### 12.7 Backup Failure

```bash
# Step 1: Check backup logs
cat /backups/ssssy/backup.log | tail -50

# Step 2: Check disk space for backup destination
df -h /backups

# Step 3: Verify database connectivity
docker compose exec postgres pg_isready -U ssssy

# Step 4: Test pg_dump manually
docker compose exec postgres pg_dump -U ssssy -d ssssy_website -F c -f /tmp/test.dump
docker compose exec postgres pg_restore -l /tmp/test.dump

# Step 5: Check MinIO connectivity (if media backup fails)
docker compose exec minio mc alias set test http://localhost:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
docker compose exec minio mc ls test/ssssy-media

# Step 6: Fix and re-run backup
# Common fixes: increase disk space, fix PostgreSQL auth, update MinIO credentials
```

### 12.8 SSL Certificate Expired

```bash
# Step 1: Check expiration date
echo | openssl s_client -connect ssssy.org.sy:443 -servername ssssy.org.sy 2>/dev/null | openssl x509 -noout -dates

# Step 2: Renew with Certbot
docker run --rm -it -p 80:80 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  certbot/certbot certonly --standalone -d ssssy.org.sy -d api.ssssy.org.sy

# Step 3: Renew with DNS challenge (alternative)
docker run --rm -it \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/dns-cloudflare certonly \
  --dns-cloudflare --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d ssssy.org.sy -d *.ssssy.org.sy

# Step 4: Reload web server
docker exec ssssy-nginx nginx -s reload

# Step 5: Set up auto-renewal cron (0 3 * * * certbot renew && nginx -s reload)
```

### 12.9 Docker Issues

#### Container Crash / OOM Kill

```bash
# Step 1: Check exit code and reason
docker inspect ssssy-backend --format "{{.State.ExitCode}} - {{.State.Error}}"

# Step 2: View last logs before crash
docker logs --tail=100 ssssy-backend

# Step 3: Check container resource limits
docker inspect ssssy-backend --format "{{json .HostConfig.Memory}}"

# Step 4: Check system resources
docker stats --no-stream

# Step 5: Restart with increased resources
docker compose up -d --no-deps backend  # Increase memory limits in compose first
```

#### Volume Issues

```bash
# Step 1: List volumes
docker volume ls

# Step 2: Inspect volume mount points
docker volume inspect ssssy-website_postgres_data

# Step 3: Check volume permissions
docker run --rm -v ssssy-website_postgres_data:/data alpine ls -la /data

# Step 4: Backup volume before any operation
docker run --rm -v ssssy-website_postgres_data:/source -v /backups:/dest alpine tar -czf /dest/postgres_volume_backup.tar.gz -C /source .

# Step 5: Restore volume from backup
docker run --rm -v ssssy-website_postgres_data:/dest -v /backups:/source alpine tar -xzf /source/postgres_volume_backup.tar.gz -C /dest
```

#### Network Issues

```bash
# Step 1: Check Docker network
docker network ls
docker network inspect ssssy-network

# Step 2: Check DNS resolution between containers
docker compose exec backend ping -c 2 postgres
docker compose exec backend ping -c 2 redis

# Step 3: Check container connectivity to external services
docker compose exec backend curl -v http://minio:9000/minio/health/live
docker compose exec backend telnet smtp.gmail.com 587
```

---

## 13. Disaster Recovery Runbook

### Recovery Time Objective (RTO): <4 hours
### Recovery Point Objective (RPO): <24 hours

### Scenario A: Database Corruption

**Symptoms:** Application returns 500 errors, psql shows errors, Flyway validation fails.

**Recovery:**

```bash
#!/bin/bash
# Scenario A: Database corruption recovery

echo "Step 1: Stop application to prevent further writes"
docker compose stop backend frontend

echo "Step 2: Identify the latest good backup"
ls -lt /backups/ssssy/*.tar.gz | head -5

echo "Step 3: Verify backup integrity"
LATEST_BACKUP=$(ls -t /backups/ssssy/*.tar.gz | head -1)
tar -tzf "$LATEST_BACKUP" > /dev/null 2>&1 || { echo "Backup corrupted, trying previous"; exit 1; }

echo "Step 4: Extract backup"
RESTORE_DIR="/tmp/restore_$(date +%s)"
mkdir -p "$RESTORE_DIR"
tar -xzf "$LATEST_BACKUP" -C "$RESTORE_DIR"

echo "Step 5: Drop corrupted database and recreate"
docker compose exec -T postgres psql -U ssssy -c "DROP DATABASE IF EXISTS ssssy_website;"
docker compose exec -T postgres psql -U ssssy -c "CREATE DATABASE ssssy_website;"

echo "Step 6: Restore database from dump"
DB_DUMP=$(find "$RESTORE_DIR" -name "*.dump" | head -1)
docker compose exec -T postgres pg_restore -U ssssy -d ssssy_website --clean --if-exists < "$DB_DUMP"

echo "Step 7: Verify restoration"
docker compose exec -T postgres psql -U ssssy -d ssssy_website -c "SELECT count(*) FROM users; SELECT count(*) FROM content_items;"

echo "Step 8: Restart application"
docker compose up -d backend frontend

echo "Step 9: Verify health"
sleep 15
curl -f http://localhost:8080/actuator/health || { echo "Health check failed"; exit 1; }

echo "Step 10: Notify team and document"
echo "=== Database corruption recovery completed ==="
rm -rf "$RESTORE_DIR"
```

### Scenario B: Server Hardware Failure

**Symptoms:** Server unreachable, all services down.

**Prerequisites:** Offsite backups, infrastructure-as-code scripts.

**Recovery:**

```bash
#!/bin/bash
# Scenario B: Complete server hardware failure
# Requires: new server with OS, Docker, Docker Compose installed

NEW_SERVER_IP="x.x.x.x"
BACKUP_HOST="backup@backup-server.example.com"
DOMAIN="ssssy.org.sy"

echo "Step 1: Provision new server (manual - cloud console or PXE)"
echo "  - OS: Ubuntu 24.04 LTS or Debian 12"
echo "  - Docker 24+ and Docker Compose plugin"
echo "  - Firewall: ports 80, 443, 22 open"
echo "  - Disk: at least 200 GB"

echo "Step 2: Update DNS to new server IP"
echo "  Update A records for $DOMAIN, api.$DOMAIN, mail.$DOMAIN to $NEW_SERVER_IP"
echo "  Wait for DNS propagation (TTL-dependent, up to 1 hour)"

echo "Step 3: Copy application code and configs to new server"
git clone https://github.com/ssssy/website /opt/ssssy
cd /opt/ssssy
scp "$BACKUP_HOST:/backups/ssssy/latest_config.tar.gz" .
tar -xzf latest_config.tar.gz
cp .env /opt/ssssy/.env  # or restore from backup

echo "Step 4: Restore database from latest backup"
rsync -avz "$BACKUP_HOST:/backups/ssssy/postgres/" /backups/ssssy/postgres/
LATEST_DUMP=$(ls -t /backups/ssssy/postgres/*.dump | head -1)
docker compose up -d postgres
sleep 10
docker compose exec -T postgres pg_restore -U ssssy -d ssssy_website --clean < "$LATEST_DUMP"

echo "Step 5: Restore media files"
docker compose up -d minio
docker compose exec minio mc alias set local http://localhost:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
docker compose exec minio mc mb local/ssssy-media
docker compose exec minio mc mirror /backups/minio/ssssy-media local/ssssy-media

echo "Step 6: Start remaining services"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo "Step 7: Verify all services"
sleep 20
docker compose ps
curl -f http://localhost:8080/actuator/health || echo "Backend health check FAILED"
curl -f http://localhost:3000 || echo "Frontend check FAILED"

echo "Step 8: Restore SSL certificates"
docker run --rm -it -p 80:80 -v /etc/letsencrypt:/etc/letsencrypt certbot/certbot certonly --standalone -d $DOMAIN -d api.$DOMAIN

echo "Step 9: Start Nginx"
docker run -d --name ssssy-nginx --network ssssy-network -p 80:80 -p 443:443 \
  -v /opt/ssssy/nginx/conf.d:/etc/nginx/conf.d \
  -v /etc/letsencrypt:/etc/letsencrypt:ro --restart unless-stopped nginx:alpine

echo "=== Server recovery completed ==="
```

### Scenario C: Accidental Data Deletion

**Symptoms:** User reports missing content, admin confirms records deleted from database.

**Recovery:**

```bash
# Step 1: Isolate - take the production database offline from writes
docker compose stop backend

# Step 2: Identify the deleted data from audit logs
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT * FROM audit_logs
  WHERE action = DELETE
    AND created_at > NOW() - INTERVAL 24 hours
  ORDER BY created_at DESC;
"

# Step 3: Extract deleted records from the most recent backup
LATEST_DUMP=$(ls -t /backups/ssssy/postgres/*.dump | head -1)

# Option A: Restore single table to temp database
createdb -U ssssy temp_restore
pg_restore -U ssssy -d temp_restore -t content_items "$LATEST_DUMP"

# Step 4: Export missing records
docker compose exec postgres psql -U ssssy -d temp_restore -c "
  \\copy content_items TO /tmp/missing_content.csv CSV HEADER
"

# Step 5: Import back to production
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  \\copy content_items FROM /tmp/missing_content.csv CSV HEADER
"

# Step 6: Clean up temp database
dropdb -U ssssy temp_restore

# Step 7: Restart backend
docker compose up -d backend
```

### Scenario D: Security Breach

**Symptoms:** Unauthorized access detected, compromised admin account, data exfiltration.

**Recovery:**

```bash
#!/bin/bash
# Scenario D: Security breach response

echo "Step 1: Isolate - take ALL services offline"
docker compose down

echo "Step 2: Block incoming/outbound traffic to compromised server"
# iptables -P INPUT DROP
# iptables -P OUTPUT DROP
# iptables -A INPUT -s <trusted-admin-IP> -j ACCEPT

echo "Step 3: Preserve evidence - copy logs and database"
pg_dump -U ssssy -d ssssy_website -F c -f /evidence/db_breach_$(date +%Y%m%d).dump
cp -r /opt/ssssy/backend/logs /evidence/
cp -r /var/log /evidence/system_logs

echo "Step 4: Determine breach scope from audit logs (offline analysis)"
pg_restore -l /evidence/db_breach_*.dump | head -20

echo "Step 5: Rotate ALL credentials"
echo "  - Database passwords"
echo "  - JWT_SECRET"
echo "  - SMTP/IMAP passwords"
echo "  - MinIO access keys"
echo "  - API keys"
echo "  - SSH keys"
echo "  - Mailcow admin password"

echo "Step 6: Restore from backup TAKEN BEFORE the breach"
# Follow Scenario A restoration steps with pre-breach backup

echo "Step 7: Patch the vulnerability"
echo "  - Review code changes, dependency updates"
echo "  - Enable additional logging"
echo "  - Implement additional security controls"

echo "Step 8: Restore services with new credentials"
docker compose up -d

echo "Step 9: Notify affected users and authorities as required by law"
```

### Scenario E: Full Site Restore to New Server

**Symptoms:** Complete loss of original server. Requires full restore from offsite backups.

**Prerequisites:**
1. Offsite backup accessible from new server
2. Domain DNS control
3. Infrastructure-as-code scripts

**Recovery Procedure (detailed):**

```bash
#!/bin/bash
# Scenario E: Full site restore to new server
# RTO: <4 hours | RPO: <24 hours

NEW_IP="x.x.x.x"
BACKUP_HOST="backup@backup.example.com:/backups/ssssy"
RESTORE_DATE="${1:-latest}"  # YYYYMMDD or "latest"

echo "=================================================="
echo "  SSSSY FULL DISASTER RECOVERY"
echo "  Target: $NEW_IP"
echo "  Backup: $RESTORE_DATE"
echo "=================================================="

# ---- Phase 1: Infrastructure Setup (30 min) ----

echo "[Phase 1] Provisioning infrastructure..."

echo "1.1. Provision server (cloud console / API)"
# For AWS: aws ec2 run-instances --image-id ami-xxx --instance-type t3.large ...
# For bare metal: PXE boot or manual OS install

echo "1.2. Install prerequisites"
# apt update && apt install -y docker.io docker-compose-v2 git
# systemctl enable --now docker

echo "1.3. Configure firewall"
# ufw allow 22/tcp
# ufw allow 80/tcp
# ufw allow 443/tcp
# ufw allow 25/tcp  # if running mail server
# ufw enable

# ---- Phase 2: Data Restoration (60-90 min) ----

echo "[Phase 2] Restoring data from backup..."

echo "2.1. Create directory structure"
mkdir -p /opt/ssssy /backups/ssssy /backups/minio /backups/postgres

echo "2.2. Clone application repository"
cd /opt/ssssy
git clone https://github.com/ssssy/website .

echo "2.3. Sync backup files from offsite"
rsync -avzP "$BACKUP_HOST/postgres/" /backups/ssssy/postgres/
rsync -avzP "$BACKUP_HOST/config/" /backups/ssssy/config/

echo "2.4. Restore configuration files"
if [ -f /backups/ssssy/config/config.tar.gz ]; then
  tar -xzf /backups/ssssy/config/config.tar.gz -C /
fi

echo "2.5. Restore environment variables"
if [ -f /backups/ssssy/.env ]; then
  cp /backups/ssssy/.env /opt/ssssy/.env
  source /opt/ssssy/.env
fi

echo "2.6. Start database and restore"
docker compose up -d postgres
sleep 15

LATEST_DUMP=$(ls -t /backups/ssssy/postgres/*.dump 2>/dev/null | head -1)
if [ -n "$LATEST_DUMP" ]; then
  docker compose exec -T postgres pg_restore -U ssssy -d ssssy_website --clean --if-exists < "$LATEST_DUMP"
  echo "Database restored from: $LATEST_DUMP"
else
  echo "WARNING: No database dump found. Running Flyway migrations."
  docker compose run --rm backend mvn flyway:migrate
fi

echo "2.7. Restore media files"
rsync -avzP "$BACKUP_HOST/minio/" /backups/ssssy/minio/
docker compose up -d minio
sleep 5
docker compose exec minio mc alias set local http://localhost:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
docker compose exec minio mc mb local/ssssy-media 2>/dev/null || true
docker compose exec minio mc mirror /backups/ssssy/minio/ssssy-media local/ssssy-media

# ---- Phase 3: Application Startup (15 min) ----

echo "[Phase 3] Starting application..."

echo "3.1. Start all services"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo "3.2. Wait for services to stabilize"
sleep 30

echo "3.3. Verify health checks"
HEALTH_URL="http://localhost:8080/actuator/health"
for i in $(seq 1 10); do
  if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
    echo "Backend health check PASSED"
    break
  fi
  echo "Waiting for backend... attempt $i/10"
  sleep 5
done

# ---- Phase 4: SSL and DNS (15 min) ----

echo "[Phase 4] Configuring SSL and DNS..."

echo "4.1. Obtain SSL certificates"
docker run --rm -it -p 80:80 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d ssssy.org.sy -d api.ssssy.org.sy

echo "4.2. Start Nginx reverse proxy"
docker run -d --name ssssy-nginx \
  --network ssssy-network \
  -p 80:80 -p 443:443 \
  -v /opt/ssssy/nginx/conf.d:/etc/nginx/conf.d \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  --restart unless-stopped \
  nginx:alpine

echo "4.3. Update DNS A records to $NEW_IP"
# Via DNS provider API or manual update

echo "4.4. Verify external access"
curl -f https://ssssy.org.sy || echo "DNS may not have propagated"
curl -f https://ssssy.org.sy/actuator/health || echo "Check Nginx config"

# ---- Phase 5: Verification (15 min) ----

echo "[Phase 5] Final verification..."

echo "5.1. Service status"
docker compose ps

echo "5.2. Database row counts"
docker compose exec postgres psql -U ssssy -d ssssy_website -c "
  SELECT users, count(*) FROM users
  UNION ALL SELECT content_items, count(*) FROM content_items
  UNION ALL SELECT events, count(*) FROM events
  UNION ALL SELECT email_messages, count(*) FROM email_messages;
"

echo "5.3. Media file availability"
curl -sf http://localhost:9000/ssssy-media/ > /dev/null 2>&1 && echo "MinIO accessible" || echo "MinIO check failed"

echo "5.4. Application functionality"
# Test login, content creation, email sending via API
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{"username": "admin", "password": "$ADMIN_PASSWORD"}" | jq .

echo ""
echo "=================================================="
echo "  DISASTER RECOVERY COMPLETED SUCCESSFULLY"
echo "  Timestamp: $(date)"
echo "  Backup used: $RESTORE_DATE"
echo "  New server IP: $NEW_IP"
echo "=================================================="
```

### Recovery Checklist

| # | Task | Done | Verified |
|---|------|------|----------|
| 1 | Provision new server | | |
| 2 | Install Docker + Compose | | |
| 3 | Configure firewall | | |
| 4 | Clone repository | | |
| 5 | Restore .env and config files | | |
| 6 | Restore database from backup | | |
| 7 | Restore media files | | |
| 8 | Start backend and verify health | | |
| 9 | Start frontend and verify | | |
| 10 | Obtain SSL certificates | | |
| 11 | Start Nginx | | |
| 12 | Update DNS records | | |
| 13 | Verify external access | | |
| 14 | Verify all API endpoints | | |
| 15 | Verify email sending | | |
| 16 | Notify users of restoration | | |
| 17 | Schedule post-incident review | | |

---

*End of Operations Guide � Syrian Soil Science Society (SSSSY) Website*
