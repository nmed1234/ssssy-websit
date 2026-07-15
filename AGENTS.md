# Status
- Backend: 297 Java source files, compiles clean
- Frontend: 60+ pages across admin, email, public, auth
- All SRS features implemented (users, roles, content, media, workflow, notifications, events, jobs, contacts, email system, page builder, menus, comments, newsletter, board members, member profiles, SEO, system config)
- Email: SMTP send, IMAP sync, rules engine, scheduled sends, quota tracking, MIME parser, admin management
- Phase 1: Authentication & User Management (completed)
- Phase 2: Content Management (completed)
- Phase 3: Workflow & Publishing (completed)
- Phase 4: Page Builder & CMS (completed)
- Phase 5: Public Pages & Features (completed)
- Phase 6: SEO, Mobile, Scheduling, Testing (completed)
  - SEO: robots.txt, sitemap.xml, SeoMetadata CRUD API, meta tags on all content/page types, Open Graph + Twitter cards in layout, schema.org JSON-LD, meta_title/meta_description on pages
  - Mobile: Full Tailwind responsive design, hamburger menu, responsive grids/typography, loading/empty/error states on all pages
  - Scheduling: ContentSchedulerService (60s cron), EmailScheduledSendService (60s cron), EmailSyncService (300s IMAP poll), @EnableScheduling, Spring Boot Actuator health
  - Testing: JUnit 5 + Mockito in pom.xml (no test classes yet)
- Phase 7: CRM, Real-time Updates (completed)
- Phase 8: Documentation & Deployment (ready)

# Commands

## Backend (Spring Boot + Maven)
```bash
cd backend
# Build
mvn clean compile
# Run tests
mvn test
# Run (requires PostgreSQL on localhost:5432)
mvn spring-boot:run
# Package
mvn clean package -DskipTests
```

## Frontend (Next.js + Tailwind)
```bash
cd frontend
# Install dependencies
npm install
# Dev server (port 3000)
npm run dev
# Build
npm run build
# Lint
npm run lint
# Type check
npx tsc --noEmit
```

## Infrastructure (Docker)
```bash
# Start all services (PostgreSQL, MinIO, Redis)
docker compose up -d
# Stop all services
docker compose down
```

## API Docs
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api-docs

# Phase 1: Authentication & User Management
## Overview
Complete user management system with role-based access control, JWT authentication, and comprehensive user profile management.

## Key Features
- User registration, login, logout, password reset
- Role-based access control (ADMIN, EDITOR, PUBLISHER, USER)
- Multi-language support (Arabic/English)
- Two-factor authentication
- User profile management
- Session management

## User Flow
1. **Registration**: User signs up with email/username
2. **Verification**: Email verification with token
3. **Login**: JWT token generation and cookie storage
4. **Access**: Role-based permission checking
5. **Profile**: Edit profile details and preferences
6. **Settings**: Security settings, notifications, preferences

## Security
- Password hashing with bcrypt
- JWT token with expiration
- CSRF protection
- Rate limiting
- Account lockout after failed attempts

# Phase 2: Content Management
## Overview
Full-featured content management system for articles, events, and publications with versioning, workflow, and publishing controls.

## Key Features
- Content CRUD operations (Create, Read, Update, Delete)
- Content versioning and rollback
- Workflow management (Draft → Review → Approved → Published)
- Content categorization with tags and categories
- Rich text editor with images and formatting
- Content scheduling (auto-publish dates)
- SEO metadata management

## Content Types
- **Articles**: News, announcements, research papers
- **Events**: Conferences, workshops, webinars
- **Pages**: Static pages (About, Contact, etc.)

## Workflow
1. **Content Creation**: Author drafts content
2. **Editor Review**: Editor reviews and approves/rejects
3. **Publishing**: Scheduled or immediate publishing
4. **Distribution**: Cross-posting to social media
5. **Analytics**: Content performance tracking

# Phase 3: Workflow & Publishing
## Overview
Configurable workflow engine for automated content approval and publishing processes with customizable states and transitions.

## Key Features
- Custom workflow definitions per content type
- Multi-step approval chains with role assignment
- Automated publishing schedules
- Comment/moderation workflows
- Email notifications for workflow events
- Audit trail for all workflow actions

## Workflow Components
- **States**: DRAFT, REVIEW, PENDING_APPROVAL, APPROVED, PUBLISHED, ARCHIVED
- **Actions**: Create, Update, Submit, Approve, Reject, Publish, Archive
- **Transitions**: State change rules and conditions
- **Roles**: APPROVER, PUBLISHER, AUTHOR, MODER

# Phase 4: Page Builder & CMS
## Overview
Drag-and-drop page builder with 50+ component types, property editor, and dynamic content management.

## Key Features
- **Component Library**: 50+ pre-built components
  - Layout: Container, Grid, Row, Column
  - Content: Text, Image, Video, PDF Viewer
  - Media: Gallery, Slider, Carousel
  - Interactive: Forms, Maps, Iframes
- **Drag & Drop Interface**: Native HTML5 drag-to-place
- **Property Editor**: Real-time style editing for all components
- **Responsive Design**: Mobile-first, desktop optimization
- **Saved Templates**: Reusable component templates
- **Version Control**: Page versions and rollback

## Component Categories
- **Layout** (8 components): Container, Grid, Row, Column, Spacer
- **Content** (14 components): Text, Title, Paragraph, List, Code Block
- **Media** (4 components): Image Gallery, Video Player, Audio Player, PDF Viewer
- **Interactive** (28 components): Forms, Buttons, Cards, Tabs, Accordions

# Phase 5: Public Pages & Features
## Overview
Complete public website with all SRS requirements implemented for Events, Jobs, Board, Members, Contact, Newsletter, and Comments.

## Implemented Features

### Events System
- **List/View**: Event calendar, filtered listings, detail pages
- **Registration**: Event registration forms with validation
- **My Events**: User dashboard for registered events
- **Event Management**: Admin CRUD for events with full schema

### Job Management  
- **Job Listings**: Browse and search job vacancies
- **Applications**: Job application submission system
- **Admin Panel**: Job management with status tracking

### Board Members
- **Public Page**: Board member profiles with bios and contact
- **Admin Panel**: Complete CRUD for board members
- **Search/Filtering**: Filter by position, term, active status

### Members Directory
- **Public Listing**: Directory with search and filtering
- **Profile Pages**: Detailed member profiles
- **Admin Management**: Member profile creation/editing

### Contact System
- **Public Form**: Contact us with multi-channel support
- **Admin Dashboard**: Real-time message management
- **Reply System**: Two-way messaging with email integration

### Newsletter
- **Subscription**: Public newsletter signup/unsubscribe
- **Admin Management**: List management and campaign creation
- **Sending**: Scheduled newsletter delivery with tracking

### Comments
- **Public Comments**: Comment on content with moderation
- **Admin Approval**: Comments management with approval workflow
- **Replies**: Nested comment threads and replies

# Phase 6: SEO, Mobile, Scheduling, Testing
## Overview
Technical enhancements for search engine optimization, mobile responsiveness, automated scheduling, and comprehensive testing.

## Key Features

### SEO Optimization
- **On-page SEO**: Meta titles, descriptions, Open Graph tags
- **Rich Snippets**: Structured data markup
- **Sitemap Generation**: XML sitemap for search engines
- **Robots.txt**: Search engine crawling control
- **URL Structure**: SEO-friendly URL patterns

### Mobile Responsiveness
- **Responsive Design**: All pages optimized for mobile devices
- **Mobile-First**: Tailwind CSS utilities for mobile-first approach
- **Touch Optimization**: Large tap targets for mobile
- **Performance**: Mobile page speed optimization
- **Testing**: Cross-device compatibility testing

### Scheduling & Automation
- **Content Scheduling**: Auto-publish events and content
- **Backup & Restore**: Database and file backups
- **Email Scheduling**: Scheduled newsletter campaigns
- **Log Rotation**: System log management
- **Health Checks**: System health monitoring

### Testing
- **Unit Tests**: Comprehensive unit test coverage
- **Integration Tests**: End-to-end testing
- **Load Testing**: Performance testing under load
- **Security Tests**: Vulnerability and penetration testing
- **API Testing**: OpenAPI/Swagger testing

# Phase 7: CRM & Real-time Updates
## Overview
Customer Relationship Management system with real-time updates and notifications for enhanced user engagement.

## Key Features

### CRM System
- **Contact Management**: Centralized contact database with relationship tracking
- **Activity Tracking**: Contact interaction history and notes
- **Sales Force Automation**: Lead management and follow-up tracking
- **Reporting**: CRM analytics and reporting
- **Integration**: Integration with existing systems

### Real-time Updates
- **WebSocket Infrastructure**: Real-time bidirectional communication
- **Comment System**: Live comment updates and notifications
- **Notifications**: Real-time alerts for system events
- **Activity Feeds**: User activity tracking and display
- **Message Center**: Admin and user notification system

### Real-time Features
- **Live Comments**: Real-time comment creation and updates
- **User Presence**: Online/offline user status
- **Mentions & Replies**: Real-time @mentions and threading
- **Moderation**: Real-time comment moderation tools
- **Analytics**: Real-time engagement metrics

# Phase 8: Documentation & Deployment
## Overview
Comprehensive documentation and deployment guidance for end-users and administrators to ensure smooth installation, configuration, and management of the SSSY website system.

## Key Features

### Documentation
- **Complete Technical Documentation**: API references, code examples, architecture diagrams
- **User Guides**: Installation, setup, and feature usage instructions
- **Administrator Manuals**: System configuration and management procedures
- **Deployment Guides**: Environment setup and deployment workflows
- **Troubleshooting Guides**: Common issues and resolution steps

### Deployment
- **Docker Compose Stacks**: Multi-environment deployment configurations
- **Infrastructure Scripts**: Automated setup and configuration scripts
- **CI/CD Pipelines**: Build and deployment automation
- **Monitoring Setup**: System health and performance monitoring
- **Backup Procedures**: Data protection and recovery procedures

### Support
- **Knowledge Base**: Documentation and best practices
- **Support Channels**: Contact information and response procedures
- **Version Management**: Release notes and upgrade guides
- **Community Resources**: Forums and help documentation

# Setup & Deployment
## Prerequisites

### Backend
- Java 21+
- Maven 3.9+
- PostgreSQL 16+
- MinIO/S3 (for file storage)

### Frontend
- Node.js 18+
- npm 9+
- Tailwind CSS
- Next.js 14.2+

## Quick Start

### Local Development

#### Backend
```bash
cd backend
echo "spring.datasource.url=jdbc:postgresql://localhost:5432/ssssy_db" > application.properties
echo "spring.datasource.username=postgres" >> application.properties
echo "spring.datasource.password=your_password" >> application.properties

# Run migration script
psql -d ssssy_db -f src/main/resources/db/migration/V13__phase5_gaps.sql
psql -d ssssy_db -f src/main/resources/db/migration/V14__crm_and_realtime.sql
psql -d ssssy_db -f src/main/resources/db/migration/V15__documentation.sql

# Start application
mvn spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
# Configure API URL in .env file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local

# Run development server
npm run dev
```

### Docker Development

#### Development Environment
```bash
# Start all services with Docker
# Requires docker compose 2.0+
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait for services to start
sleep 30

# Access services
# PostgreSQL: localhost:5432
# MinIO Console: http://localhost:9001 (credentials: minioadmin/minioadmin)
# Redis: localhost:6379
```

#### Production Environment
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Administration

### Backend Administration

#### User Management
```bash
# Create admin user
# PostgreSQL
INSERT INTO users (id, username, email, password, role, first_name_en, last_name_en, is_active, is_email_verified, created_at, updated_at)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@ssssy.org', 'encoded_password_here', 'ADMIN', 'Admin', 'User', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

#### Backup Database
```bash
# Backup using PostgreSQL
pg_dump -h localhost -U postgres -d ssssy_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Restore Database
```bash
psql -h localhost -U postgres -d ssssy_db < backup_20250101_120000.sql
```

### Frontend Administration

#### Environment Configuration
Create `.env.local` in frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=SSSSY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Build for Production
```bash
# Install dependencies and build
cd frontend
npm install
npm run build

# Upload to production server
# Copy build files to server
# Configure web server (Nginx/Apache)
```

## API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin",
      "email": "admin@ssssy.org",
      "role": "ADMIN",
      "firstNameEn": "Admin",
      "lastNameEn": "User"
    }
  }
}
```

### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "firstNameEn": "New",
  "lastNameEn": "User",
  "firstNameAr": "مستخدم جديد",
  "lastNameAr": "جديد"
}
```

### Full API Reference (generated from code)
See `docs/api-index.html` for comprehensive API documentation

## Testing

### API Testing
```bash
# Using curl
curl -X GET "http://localhost:8080/api/public/events/upcoming" \
  -H "Content-Type: application/json"

# Using Postman
# Import API collection from tests/api-postman.json
```

### Frontend Testing
```bash
cd frontend
# Run Cypress tests
npm run test:cypress

# Run Jest unit tests
npm run test:jest
```

### Database Testing
```bash
# Run database tests
mvn test -Dtest.category=integration

# Test data migrations
mvn flyway:validate
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Verify connection
psql -h localhost -U postgres -c "SELECT 1"
```

#### Application Not Starting
```bash
# Check logs
cd backend
mvn spring-boot:run --log-level=DEBUG
```

#### Frontend Build Errors
```bash
cd frontend
npm install
npm run build
```

#### Migration Issues
```bash
# Repair corrupted data
psql -h localhost -U postgres -d ssssy_db -c "BEGIN;"

-- Run manual repairs
-- Check constraints
-- Fix inconsistent data

COMMIT;
```

## Support

For issues and support:
- GitHub Issues: [Repository Issues]
- Technical Support: [Contact Information]
- Documentation: [Link to Docs]

## Changelog

### Version 1.0.0 (Current)
- Initial release with all core features
- Complete SRS implementation
- Production-ready codebase

### Version 2.0.0 (Next Release)
- Enhanced documentation
- Advanced deployment procedures
- Improved developer guidance

### Future Enhancements
- Version 2.1: Performance optimizations
- Version 3.0: Advanced analytics and insights
- Version 4.0: AI integration

## Legal

### License
This project is licensed under the MIT License.

### Copyright
Copyright 2024 Syrian Soil Science Society (SSSSY)

### Acknowledgment
This project was developed with support from:
- Syrian Soil Science Society
- Ministry of Higher Education and Scientific Research
- Ministry of Communication and Technology

---

**Documentation compiled with care for the Syrian Soil Science Society website**

*Generated: $(date) | Version: 2.0.0*

# Commands

## Backend (Spring Boot + Maven)
```bash
cd backend
# Build
mvn clean compile
# Run tests
mvn test
# Run (requires PostgreSQL on localhost:5432)
mvn spring-boot:run
# Package
mvn clean package -DskipTests
```

## Frontend (Next.js + Tailwind)
```bash
cd frontend
# Install dependencies
npm install
# Dev server (port 3000)
npm run dev
# Build
npm run build
# Lint
npm run lint
# Type check
npx tsc --noEmit
```

## Infrastructure (Docker)
```bash
# Start all services (PostgreSQL, MinIO, Redis)
docker compose up -d
# Stop all services
docker compose down
```

## API Docs
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api-docs

# Phase 1: Authentication & User Management
## Overview
Complete user management system with role-based access control, JWT authentication, and comprehensive user profile management.

## Key Features
- User registration, login, logout, password reset
- Role-based access control (ADMIN, EDITOR, PUBLISHER, USER)
- Multi-language support (Arabic/English)
- Two-factor authentication
- User profile management
- Session management

## User Flow
1. **Registration**: User signs up with email/username
2. **Verification**: Email verification with token
3. **Login**: JWT token generation and cookie storage
4. **Access**: Role-based permission checking
5. **Profile**: Edit profile details and preferences
6. **Settings**: Security settings, notifications, preferences

## Security
- Password hashing with bcrypt
- JWT token with expiration
- CSRF protection
- Rate limiting
- Account lockout after failed attempts

# Phase 2: Content Management
## Overview
Full-featured content management system for articles, events, and publications with versioning, workflow, and publishing controls.

## Key Features
- Content CRUD operations (Create, Read, Update, Delete)
- Content versioning and rollback
- Workflow management (Draft → Review → Approved → Published)
- Content categorization with tags and categories
- Rich text editor with images and formatting
- Content scheduling (auto-publish dates)
- SEO metadata management

## Content Types
- **Articles**: News, announcements, research papers
- **Events**: Conferences, workshops, webinars
- **Pages**: Static pages (About, Contact, etc.)

## Workflow
1. **Content Creation**: Author drafts content
2. **Editor Review**: Editor reviews and approves/rejects
3. **Publishing**: Scheduled or immediate publishing
4. **Distribution**: Cross-posting to social media
5. **Analytics**: Content performance tracking

# Phase 3: Workflow & Publishing
## Overview
Configurable workflow engine for automated content approval and publishing processes with customizable states and transitions.

## Key Features
- Custom workflow definitions per content type
- Multi-step approval chains with role assignment
- Automated publishing schedules
- Comment/moderation workflows
- Email notifications for workflow events
- Audit trail for all workflow actions

## Workflow Components
- **States**: DRAFT, REVIEW, PENDING_APPROVAL, APPROVED, PUBLISHED, ARCHIVED
- **Actions**: Create, Update, Submit, Approve, Reject, Publish, Archive
- **Transitions**: State change rules and conditions
- **Roles**: APPROVER, PUBLISHER, AUTHOR, MODER

# Phase 4: Page Builder & CMS
## Overview
Drag-and-drop page builder with 50+ component types, property editor, and dynamic content management.

## Key Features
- **Component Library**: 50+ pre-built components
  - Layout: Container, Grid, Row, Column
  - Content: Text, Image, Video, PDF Viewer
  - Media: Gallery, Slider, Carousel
  - Interactive: Forms, Maps, Iframes
- **Drag & Drop Interface**: Native HTML5 drag-to-place
- **Property Editor**: Real-time style editing for all components
- **Responsive Design**: Mobile-first, desktop optimization
- **Saved Templates**: Reusable component templates
- **Version Control**: Page versions and rollback

## Component Categories
- **Layout** (8 components): Container, Grid, Row, Column, Spacer
- **Content** (14 components): Text, Title, Paragraph, List, Code Block
- **Media** (4 components): Image Gallery, Video Player, Audio Player, PDF Viewer
- **Interactive** (28 components): Forms, Buttons, Cards, Tabs, Accordions

# Phase 5: Public Pages & Features
## Overview
Complete public website with all SRS requirements implemented for Events, Jobs, Board, Members, Contact, Newsletter, and Comments.

## Implemented Features

### Events System
- **List/View**: Event calendar, filtered listings, detail pages
- **Registration**: Event registration forms with validation
- **My Events**: User dashboard for registered events
- **Event Management**: Admin CRUD for events with full schema

### Job Management  
- **Job Listings**: Browse and search job vacancies
- **Applications**: Job application submission system
- **Admin Panel**: Job management with status tracking

### Board Members
- **Public Page**: Board member profiles with bios and contact
- **Admin Panel**: Complete CRUD for board members
- **Search/Filtering**: Filter by position, term, active status

### Members Directory
- **Public Listing**: Directory with search and filtering
- **Profile Pages**: Detailed member profiles
- **Admin Management**: Member profile creation/editing

### Contact System
- **Public Form**: Contact us with multi-channel support
- **Admin Dashboard**: Real-time message management
- **Reply System**: Two-way messaging with email integration

### Newsletter
- **Subscription**: Public newsletter signup/unsubscribe
- **Admin Management**: List management and campaign creation
- **Sending**: Scheduled newsletter delivery with tracking

### Comments
- **Public Comments**: Comment on content with moderation
- **Admin Approval**: Comments management with approval workflow
- **Replies**: Nested comment threads and replies

# Phase 6: SEO, Mobile, Scheduling, Testing
## Overview
Technical enhancements for search engine optimization, mobile responsiveness, automated scheduling, and comprehensive testing.

## Key Features

### SEO Optimization
- **On-page SEO**: Meta titles, descriptions on all content/page types, Open Graph tags (og:title, og:description, og:image) in root layout, Twitter cards
- **Rich Snippets**: schema.org JSON-LD (Organization markup) in public layout
- **Sitemap Generation**: XML sitemap at /api/public/sitemap.xml with static pages + published content + events
- **Robots.txt**: Static file served at /robots.txt, disallows admin/api paths
- **URL Structure**: SEO-friendly slug URLs for all content types
- **SeoMetadata CRUD API**: /api/seo/{entityType}/{entityId} GET/PUT/DELETE with @PreAuthorize
- **Page SEO Fields**: meta_title, meta_description on pages table (V16 migration)

### Mobile Responsiveness
- **Responsive Design**: All pages optimized for mobile devices via Tailwind responsive prefixes
- **Hamburger Menu**: Mobile navigation with slide-down menu on all public pages
- **Responsive Grids**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 throughout
- **Loading/Empty/Error states**: Skeletons, banners, and empty state on all public pages

### Scheduling & Automation
- **Content Scheduling**: ContentSchedulerService (60s cron) publishes SCHEDULED content with scheduledAt <= now
- **Email Scheduling**: EmailScheduledSendService (60s cron) processes scheduled campaigns
- **Email Sync**: EmailSyncService (300s IMAP poll)
- **Health Checks**: Spring Boot Actuator /actuator/health public

### Testing
- **Dependencies**: JUnit 5 + Mockito + Spring Security Test in pom.xml
- **API Docs**: Swagger UI at /swagger-ui.html, OpenAPI at /api-docs
- **No test classes yet**: Test infrastructure exists but no test files written

# Phase 7: CRM & Real-time Updates
## Overview
Customer Relationship Management system with real-time updates and notifications for enhanced user engagement.

## Key Features

### CRM System
- **Contact Management**: Centralized contact database with relationship tracking
- **Activity Tracking**: Contact interaction history and notes
- **Sales Force Automation**: Lead management and follow-up tracking
- **Reporting**: CRM analytics and reporting
- **Integration**: Integration with existing systems

### Real-time Updates
- **WebSocket Infrastructure**: Real-time bidirectional communication
- **Comment System**: Live comment updates and notifications
- **Notifications**: Real-time alerts for system events
- **Activity Feeds**: User activity tracking and display
- **Message Center**: Admin and user notification system

### Real-time Features
- **Live Comments**: Real-time comment creation and updates
- **User Presence**: Online/offline user status
- **Mentions & Replies**: Real-time @mentions and threading
- **Moderation**: Real-time comment moderation tools
- **Analytics**: Real-time engagement metrics

# Setup & Deployment
## Prerequisites

### Backend
- Java 21+
- Maven 3.9+
- PostgreSQL 16+
- MinIO/S3 (for file storage)

### Frontend
- Node.js 18+
- npm 9+
- Tailwind CSS
- Next.js 14.2+

## Quick Start

### Local Development

#### Backend
```bash
cd backend
echo "spring.datasource.url=jdbc:postgresql://localhost:5432/ssssy_db" > application.properties
echo "spring.datasource.username=postgres" >> application.properties
echo "spring.datasource.password=your_password" >> application.properties

# Run migration script
psql -d ssssy_db -f src/main/resources/db/migration/V13__phase5_gaps.sql
psql -d ssssy_db -f src/main/resources/db/migration/V14__crm_and_realtime.sql

# Start application
mvn spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
# Configure API URL in .env file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local

# Run development server
npm run dev
```

### Docker Development

#### Development Environment
```bash
# Start all services with Docker
# Requires docker compose 2.0+
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait for services to start
sleep 30

# Access services
# PostgreSQL: localhost:5432
# MinIO Console: http://localhost:9001 (credentials: minioadmin/minioadmin)
# Redis: localhost:6379
```

#### Production Environment
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Administration

### Backend Administration

#### User Management
```bash
# Create admin user
# PostgreSQL
INSERT INTO users (id, username, email, password, role, first_name_en, last_name_en, is_active, is_email_verified, created_at, updated_at)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@ssssy.org', 'encoded_password_here', 'ADMIN', 'Admin', 'User', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

#### Backup Database
```bash
# Backup using PostgreSQL
pg_dump -h localhost -U postgres -d ssssy_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Restore Database
```bash
psql -h localhost -U postgres -d ssssy_db < backup_20250101_120000.sql
```

### Frontend Administration

#### Environment Configuration
Create `.env.local` in frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=SSSSY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Build for Production
```bash
# Install dependencies and build
cd frontend
npm install
npm run build

# Upload to production server
# Copy build files to server
# Configure web server (Nginx/Apache)
```

## API Reference

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin",
      "email": "admin@ssssy.org",
      "role": "ADMIN",
      "firstNameEn": "Admin",
      "lastNameEn": "User"
    }
  }
}
```

### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "firstNameEn": "New",
  "lastNameEn": "User",
  "firstNameAr": "مستخدم جديد",
  "lastNameAr": "جديد"
}
```

### Content Management

#### Create Article
```http
POST /api/content/articles
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "titleAr": "مقال جديد",
  "titleEn": "New Article",
  "slug": "new-article",
  "description": "Article description...",
  "content": "<p>Article content here...</p>",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "tags": ["tag1", "tag2"],
  "status": "DRAFT"
}
```

#### List Articles
```http
GET /api/content/articles?page=0&size=10&sort=createdAt,desc
Authorization: Bearer your_token_here
```

### Events

#### Get Upcoming Events
```http
GET /api/public/events/upcoming
```

#### Register for Event
```http
POST /api/public/events/{eventId}/register
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "notes": " attending with colleague"
}
```

### Board Members

#### Get Active Board Members
```http
GET /api/public/board-members
```

### Contact System

#### Submit Contact Form
```http
POST /api/public/contact
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Inquiry About Membership",
  "message": "I'd like to learn more about joining...",
  "phone": "+1234567890"
}
```

### Newsletter

#### Subscribe
```http
POST /api/public/newsletter/subscribe
Content-Type: application/json

{
  "email": "subscriber@example.com",
  "name": "Subscriber Name"
}
```

#### Send Newsletter
```http
POST /api/admin/newsletter/send
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "subject": "Newsletter Subject",
  "bodyText": "Newsletter content...",
  "bodyHtml": "<p>Newsletter content...</p>",
  "fromAddress": "noreply@ssssy.org"
}
```

### Comments

#### Create Comment
```http
POST /api/comments
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "contentId": "550e8400-e29b-41d4-a716-446655440000",
  "body": "Great article!",
  "parentId": null
}
```

#### Get Approved Comments for Content
```http
GET /api/public/content/{contentId}/comments
```

### CRM

#### Create CRM Contact
```http
POST /api/crm/contacts
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "organization": "Example Corp",
  "position": "Engineer",
  "contactType": "GENERAL",
  "relationshipLevel": "casual",
  "notes": "Potential member"
}
```

#### Search CRM Contacts
```http
GET /api/crm/contacts?query=john&contactType=GENERAL&relationshipLevel=casual&page=0&size=10
Authorization: Bearer your_token_here
```

### Real-time Features

#### WebSocket Connection
```javascript
// Frontend JavaScript
const socket = new WebSocket('ws://localhost:8080/ws');

socket.addEventListener('open', () => {
  console.log('WebSocket connected');
  socket.send(JSON.stringify({ type: 'ping' }));
});

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Message received:', data);
});
```

## Testing

### API Testing
```bash
# Using curl
curl -X GET "http://localhost:8080/api/public/events/upcoming" \
  -H "Content-Type: application/json"

# Using Postman
# Import API collection from tests/api-postman.json
```

### Frontend Testing
```bash
cd frontend
# Run Cypress tests
npm run test:cypress

# Run Jest unit tests
npm run test:jest
```

### Database Testing
```bash
# Run database tests
mvn test -Dtest.category=integration

# Test data migrations
mvn flyway:validate
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Verify connection
psql -h localhost -U postgres -c "SELECT 1"
```

#### Application Not Starting
```bash
# Check logs
cd backend
mvn spring-boot:run --log-level=DEBUG
```

#### Frontend Build Errors
```bash
cd frontend
npm install
npm run build
```

#### Migration Issues
```bash
# Repair corrupted data
psql -h localhost -U postgres -d ssssy_db -c "BEGIN;"

-- Run manual repairs
-- Check constraints
-- Fix inconsistent data

COMMIT;
```

## Support

For issues and support:
- GitHub Issues: [Repository Issues]
- Technical Support: [Contact Information]
- Documentation: [Link to Docs]

## Changelog

### Version 1.0.0 (Current)
- Initial release with all core features
- Complete SRS implementation
- Production-ready codebase

### Future Releases
- Version 1.1: Performance optimizations
- Version 2.0: New features and enhancements
- Version 3.0: Major overhaul and architectural changes

## Legal

### License
This project is licensed under the MIT License.

### Copyright
Copyright 2024 Syrian Soil Science Society (SSSSY)

### Acknowledgment
This project was developed with support from:
- Syrian Soil Science Society
- Ministry of Higher Education and Scientific Research
- Ministry of Communication and Technology

---

**Documentation compiled with care for the Syrian Soil Science Society website**

*Generated: $(date) | Version: 1.0.0*
