# ARCHITECTURE.md — Task Manager API

## System Overview

FAROS is a task management REST API that lets users create, organize, and share tasks with file attachments, comments, activity logging, and email notifications. It supports multi-user collaboration with role-based permissions (owner/edit/view) and provides a complete CRUD API consumed by a separate React frontend. The API is deployed on AWS (EC2, RDS, ElastiCache, S3) with a free-tier alternative on Render using PostgreSQL schema isolation.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | FastAPI (Python 3.12+) | Auto-docs, Pydantic validation, dependency injection |
| Database | PostgreSQL 16 | Relational, ARRAY type for tags, schema isolation |
| ORM | SQLAlchemy 2.0 (sync, 1.x-style Column/query patterns) | Mature, well-documented |
| DB Driver | psycopg2-binary | Sync PostgreSQL adapter |
| Schemas | Pydantic v2 | Request/response validation, serialization |
| Auth | JWT via python-jose + passlib/bcrypt | Stateless, standard |
| Caching | Redis 7 (redis-py) | Stats endpoint caching, rate limit backend |
| File Storage | AWS S3 (boto3) / local filesystem | Pluggable storage abstraction |
| Email | Resend / AWS SES | Pluggable email abstraction |
| Rate Limiting | slowapi | Redis-backed, per-user/IP |
| Deployment (primary) | AWS EC2 + RDS + ElastiCache + S3 | Full infrastructure |
| Deployment (alt) | Render free tier | Schema-isolated shared PostgreSQL |
| CI/CD | GitHub Actions | Automated testing and deployment |
| Containerization | Docker + docker-compose | Local dev environment |

---

## System Diagram

```
[React SPA (Vite)]          [CloudFront + S3]
  (localhost:5173)           (faros.odysian.dev)
        |                          |
        v                          v
   ┌─────────────────────────────────────┐
   │        FastAPI Backend              │
   │   (EC2 / Render / localhost:8000)   │
   │                                     │
   │  ┌─────────┐  ┌──────────────────┐  │
   │  │ Routers │→ │ Services         │  │
   │  │ (thin)  │  │ (business logic) │  │
   │  └─────────┘  └──────────────────┘  │
   │       │              │              │
   │       v              v              │
   │  ┌─────────┐  ┌──────────────────┐  │
   │  │ Deps    │  │ Background Tasks │  │
   │  │ (auth)  │  │ (notifications)  │  │
   │  └─────────┘  └──────────────────┘  │
   └──────┬──────────┬──────────┬────────┘
          │          │          │
          v          v          v
   [PostgreSQL]  [Redis]   [AWS S3]
   (RDS/Render)  (ElastiCache) (file storage)
                                │
                          [Resend / SES]
                          (email delivery)
```

---

## Database Schema

All tables live in the `faros` PostgreSQL schema (shared DB with other portfolio projects).

### users

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment, indexed |
| username | VARCHAR(50) | UNIQUE, NOT NULL, indexed |
| email | VARCHAR(100) | UNIQUE, NOT NULL, indexed |
| hashed_password | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMPTZ | server_default=now() |
| avatar_url | VARCHAR | nullable |
| email_verified | BOOLEAN | default=False |
| verification_code | VARCHAR | nullable |
| verification_expires | TIMESTAMPTZ | nullable |
| password_reset_token | VARCHAR | nullable |
| password_reset_token_expires | TIMESTAMPTZ | nullable |

### tasks

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment, indexed |
| title | VARCHAR(200) | NOT NULL |
| description | VARCHAR(1000) | nullable |
| completed | BOOLEAN | default=False, NOT NULL |
| priority | VARCHAR(20) | NOT NULL ("low", "medium", "high") |
| created_at | TIMESTAMPTZ | server_default=now(), NOT NULL |
| due_date | DATE | nullable |
| tags | ARRAY(VARCHAR) | default=[], NOT NULL (PostgreSQL-specific) |
| notes | VARCHAR(500) | nullable |
| user_id | INTEGER | FK → users.id, NOT NULL |

### task_files

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment, indexed |
| task_id | INTEGER | FK → tasks.id ON DELETE CASCADE, NOT NULL |
| original_filename | VARCHAR(255) | NOT NULL |
| stored_filename | VARCHAR(255) | UNIQUE, NOT NULL |
| file_size | INTEGER | NOT NULL |
| content_type | VARCHAR(100) | nullable |
| uploaded_at | TIMESTAMPTZ | default=datetime.now(timezone.utc) |

### task_comments

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK |
| task_id | INTEGER | FK → tasks.id, NOT NULL |
| user_id | INTEGER | FK → users.id, NOT NULL |
| content | VARCHAR(1000) | NOT NULL |
| created_at | TIMESTAMPTZ | server_default=now() |
| updated_at | TIMESTAMPTZ | onupdate=now() |

### task_shares

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, indexed |
| task_id | INTEGER | FK → tasks.id ON DELETE CASCADE, NOT NULL |
| shared_with_user_id | INTEGER | FK → users.id, NOT NULL |
| permission | VARCHAR(20) | NOT NULL ("view" or "edit") |
| shared_at | TIMESTAMPTZ | server_default=now() |
| shared_by_user_id | INTEGER | FK → users.id, NOT NULL |

**Constraints:** UNIQUE(task_id, shared_with_user_id)

### notification_preferences

| Column | Type | Constraints |
|--------|------|-------------|
| user_id | INTEGER | PK, FK → users.id (one-to-one) |
| email_verified | BOOLEAN | default=False |
| email_enabled | BOOLEAN | default=True |
| task_shared_with_me | BOOLEAN | default=True |
| task_completed | BOOLEAN | default=False |
| comment_on_my_task | BOOLEAN | default=True |
| task_due_soon | BOOLEAN | default=True |
| created_at | TIMESTAMPTZ | server_default=now() |
| updated_at | TIMESTAMPTZ | onupdate=now() |

### activity_logs

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK |
| user_id | INTEGER | FK → users.id, NOT NULL |
| action | VARCHAR(50) | NOT NULL |
| resource_type | VARCHAR(50) | NOT NULL |
| resource_id | INTEGER | NOT NULL |
| details | JSON | nullable |
| created_at | TIMESTAMPTZ | server_default=now(), NOT NULL |

### Indexes

| Table | Column(s) | Type | Why |
|-------|-----------|------|-----|
| users | username | UNIQUE | Login lookup |
| users | email | UNIQUE | Registration check |
| tasks | id | BTREE | PK lookup |
| task_shares | (task_id, shared_with_user_id) | UNIQUE | Prevent duplicate shares |
| activity_logs | user_id | BTREE | User activity queries |
| activity_logs | created_at | BTREE | Chronological queries |
| activity_logs | (resource_type, resource_id) | BTREE | Resource-specific timeline |
| activity_logs | action | BTREE | Action-type filtering |

### Relationships

- users → tasks: one-to-many (user owns tasks)
- users → task_comments: one-to-many (user writes comments)
- users → notification_preferences: one-to-one
- users → activity_logs: one-to-many
- tasks → task_files: one-to-many (cascade delete)
- tasks → task_comments: one-to-many (cascade delete)
- tasks → task_shares: one-to-many (cascade delete)
- task_shares → users: many-to-one (shared_with_user_id, shared_by_user_id)

---

## API Contracts

### Authentication

#### POST /auth/register
- **Auth:** None (public)
- **Rate Limit:** 10/hour
- **Request:** `{ "username": "str (3-50)", "email": "str (max 100)", "password": "str (8-100)" }`
- **201:** `{ "id", "username", "email", "created_at" }`
- **409:** Duplicate username or email
- **422:** Validation error

#### POST /auth/login
- **Auth:** None (public)
- **Rate Limit:** 5/minute
- **Request:** `{ "username": "str", "password": "str" }`
- **200:** `{ "access_token": "jwt", "token_type": "bearer" }`
- **401:** Invalid credentials

#### POST /auth/password-reset/request
- **Auth:** None (public)
- **Rate Limit:** 1/minute
- **Request:** `{ "email": "str" }`
- **200:** Generic "if email exists" message (prevents enumeration)

#### POST /auth/password-reset/verify
- **Auth:** None (public)
- **Request:** `{ "token": "str", "new_password": "str (8-100)" }`
- **200:** Success message
- **400:** Invalid/expired token

### Tasks

#### GET /tasks
- **Auth:** Required
- **Query Params:** `completed`, `priority`, `tags`, `overdue`, `search`, `created_after`, `created_before`, `due_after`, `due_before`, `sort_by`, `sort_order`, `skip`, `limit`
- **200:** `{ "tasks": [...], "total": int, "page": int, "pages": int }`

#### POST /tasks
- **Auth:** Required
- **Rate Limit:** 100/hour
- **Request:** `{ "title": "str (1-200)", "description?": "str (max 1000)", "priority?": "low|medium|high", "due_date?": "date", "tags?": ["str"], "completed?": bool }`
- **201:** Task object

#### GET /tasks/stats
- **Auth:** Required
- **200:** `{ "total", "completed", "incomplete", "by_priority", "by_tag", "overdue", "tasks_shared", "comments_posted" }`
- **Note:** Cached in Redis (5 min TTL)

#### PATCH /tasks/bulk
- **Auth:** Required
- **Request:** `{ "task_ids": [int], "updates": TaskUpdate }`
- **200:** Updated task array

#### GET /tasks/{task_id}
- **Auth:** Required (owner or shared)
- **200:** Task object
- **404:** Not found
- **403:** No permission

#### PATCH /tasks/{task_id}
- **Auth:** Required (owner or edit permission)
- **Request:** Partial TaskUpdate fields
- **200:** Updated task

#### DELETE /tasks/{task_id}
- **Auth:** Required (owner only)
- **204:** No content

#### POST /tasks/{task_id}/tags
- **Auth:** Required (owner or edit)
- **Request:** Tag list
- **200:** Updated task

#### DELETE /tasks/{task_id}/tags/{tag}
- **Auth:** Required (owner or edit)
- **200:** Updated task
- **404:** Tag not found

### Sharing

#### GET /tasks/shared-with-me
- **Auth:** Required
- **200:** Array of `{ "task": Task, "permission": str, "is_owner": bool, "owner_username": str }`

#### GET /tasks/{task_id}/shares
- **Auth:** Required (owner only)
- **200:** Array of TaskShareResponse

#### POST /tasks/{task_id}/share
- **Auth:** Required (owner only)
- **Request:** `{ "shared_with_username": "str", "permission": "view|edit" }`
- **201:** TaskShareResponse
- **400:** Cannot share with self
- **404:** User not found
- **409:** Already shared

#### PUT /tasks/{task_id}/share/{username}
- **Auth:** Required (owner only)
- **Request:** `{ "permission": "view|edit" }`
- **200:** Updated TaskShareResponse

#### DELETE /tasks/{task_id}/share/{username}
- **Auth:** Required (owner only)
- **204:** No content

### Comments

#### POST /tasks/{task_id}/comments
- **Auth:** Required (view permission or above)
- **Request:** `{ "content": "str (1-1000)" }`
- **201:** Comment object

#### GET /tasks/{task_id}/comments
- **Auth:** Required (view permission or above)
- **200:** Comment array

#### PATCH /comments/{comment_id}
- **Auth:** Required (comment author only)
- **Request:** `{ "content": "str (1-1000)" }`
- **200:** Updated comment

#### DELETE /comments/{comment_id}
- **Auth:** Required (comment author or task owner)
- **204:** No content

### Files

#### POST /tasks/{task_id}/files
- **Auth:** Required (edit permission or above)
- **Rate Limit:** 20/hour
- **Request:** Multipart form data (file field, max 10MB)
- **Allowed types:** .jpg, .jpeg, .png, .gif, .pdf, .txt, .doc, .docx
- **201:** FileUploadResponse

#### GET /tasks/{task_id}/files
- **Auth:** Required (view permission or above)
- **200:** Array of TaskFileInfo

#### GET /files/{file_id}
- **Auth:** Required (view permission or above)
- **200:** File stream (binary)

#### DELETE /files/{file_id}
- **Auth:** Required (edit permission or above)
- **204:** No content

### Notifications

#### GET /notifications/preferences
- **Auth:** Required
- **200:** NotificationPreferenceResponse

#### PATCH /notifications/preferences
- **Auth:** Required
- **Request:** Partial preference fields
- **200:** Updated preferences

#### POST /notifications/subscribe
- **Auth:** Required
- **200:** `{ "message", "email" }`

#### GET /notifications/verify?token=...
- **Auth:** None (public — email link)
- **302:** Redirects to frontend with success/error

#### POST /notifications/verify
- **Auth:** None (public)
- **Request:** `{ "token": "str" }`
- **200:** Success message

#### POST /notifications/send-verification
- **Auth:** Required
- **200:** `{ "message", "email", "expires_in" }`

### Activity

#### GET /activity
- **Auth:** Required
- **Query Params:** `resource_type`, `action`, `start_date`, `end_date`, `limit` (default 50), `offset`
- **200:** Array of ActivityLogResponse

#### GET /activity/stats
- **Auth:** Required
- **200:** `{ "total_activities", "by_action", "by_resource" }`

#### GET /activity/tasks/{task_id}
- **Auth:** Required (view permission or above)
- **200:** Array of ActivityLogResponse with summary strings

### Users

#### GET /users/me
- **Auth:** Required
- **200:** UserProfile

#### POST /users/me/avatar
- **Auth:** Required
- **Request:** Multipart form data (image file)
- **200:** `{ "avatar_url" }`

#### PATCH /users/me/change-password
- **Auth:** Required
- **Request:** `{ "current_password", "new_password" (8-100) }`
- **200:** Success message

#### GET /users/search?query=...&limit=...
- **Auth:** Required
- **200:** Array of `{ "id", "username" }`

#### GET /users/{user_id}/avatar.{ext}
- **Auth:** None (public)
- **200:** Image file stream

### Health

#### GET /health
- **Auth:** None (public)
- **200:** `{ "status": "healthy", "database": "connected" }`

#### GET /version
- **Auth:** None (public)
- **200:** `{ "version", "environment" }`

#### GET /
- **Auth:** None (public)
- **200:** `{ "message": "Task Manager API", "status": "running" }`

---

## Key Decisions

| Decision | Choice | Alternatives Considered | Why |
|----------|--------|------------------------|-----|
| Auth token delivery | Bearer header (localStorage on client) | httpOnly cookie | Simpler SPA integration |
| DB driver | psycopg2-binary (sync) | asyncpg (async) | Simpler for learning, sync throughout |
| Model style | SQLAlchemy 1.x Column() | 2.0 mapped_column | Project started before migration |
| Query style | db.query().filter() | select() + execute() | Matches model style, consistent codebase |
| Schema isolation | PostgreSQL `faros` schema | Separate databases | Shared Render/Supabase free tier DB |
| File storage | S3 with local fallback | S3 only | Local dev without AWS credentials |
| Email provider | Resend with SES fallback | SES only | Resend simpler for dev, SES for production |
| Rate limit backend | Redis with in-memory fallback | Redis only | Graceful degradation without Redis |
| Task stats | Redis-cached (5 min TTL) | Real-time query | 5x speedup on expensive aggregation |
| Primary keys | INTEGER | BIGINT | Project started before BIGINT convention |
| Activity logging | Flush (don't commit) per log | Separate commits | Batches with parent transaction |
| Background notifications | FastAPI BackgroundTasks | Celery, external queue | Simple, no infrastructure needed |
