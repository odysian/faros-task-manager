# AGENTS.md — Backend (FastAPI)

_This file supplements the root `AGENTS.md` with backend-specific rules. Read the root `AGENTS.md` and `WORKFLOW.md` first._

---

## Project Context

A task management REST API where users create, organize, and share tasks with file attachments, comments, activity logging, and email notifications.

**Stack:**

- Backend: FastAPI (Python 3.12+)
- Database: PostgreSQL (sync via `psycopg2-binary`, schema-isolated under `faros`)
- ORM: SQLAlchemy 2.0 (sync engine + sessions, **1.x-style `Column()` models and `db.query()` patterns** — see deviations below)
- Schemas: Pydantic v2
- Auth: JWT (access tokens via `python-jose`, passwords hashed with `passlib` + bcrypt)
- Caching: Redis (`redis-py`)
- File storage: AWS S3 (`boto3`)
- Email: Resend + AWS SNS
- Rate limiting: `slowapi`
- Deployment: AWS (EC2, RDS, ElastiCache, S3, CloudFront) primary; Render (free tier) alternative

**Stack deviations:**

- **No async.** This project uses sync SQLAlchemy (`create_engine`, `sessionmaker`, `psycopg2-binary`), not async (`create_async_engine`, `async_sessionmaker`, `asyncpg`). Endpoints use `def`, not `async def` for DB-bound routes. Do not introduce async patterns unless explicitly asked.
- **SQLAlchemy 1.x model style.** Models use `Column()` and `relationship()`, not `Mapped[]` / `mapped_column()`. Match the existing style.
- **SQLAlchemy 1.x query style.** Code uses `db.query(Model).filter(...)`, not `select()` / `db.execute()`. Match the existing style.
- **No `app/` package.** Modules live at backend root: `main.py`, `db_models.py`, `db_config.py`, `dependencies.py`. Subpackages (`routers/`, `services/`, `schemas/`, `core/`) are also at backend root level.
- **Single `db_models.py` file.** All SQLAlchemy models are in one file, not split per domain.
- **Schema isolation.** All tables use the `faros` PostgreSQL schema (shared DB with other portfolio projects). The `Base` class sets `metadata = MetaData(schema="faros")`.
- **Ruff + MyPy (backend).** Backend verification uses `ruff` for linting and `mypy` for type checking. Do not reference `pylint`/`black` as required verification steps.

---

## Core Rules

- **Simplicity first.** Write the minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No speculative flexibility. If you write 200 lines and it could be 50, rewrite it.
- **Surgical changes only.** Touch only what the task requires. Don't "improve" adjacent code, comments, or formatting. Match existing style. If you notice unrelated issues, mention them — don't fix them. Every changed line should trace to the user's request.
- **Explain what you're doing.** Include brief comments explaining _why_ for non-obvious logic. This is a learning environment.
- **Prefer explicit over clever.** Readable, straightforward code. No one-liners that sacrifice clarity.

---

## Verification

### Backend

```bash
# Lint
ruff check routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py

# Type check
mypy routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py

# Run tests
pytest -v

# Security check (if bandit is installed)
bandit -r routers/ services/ core/ -ll
```

### Database

```bash
# Verify migrations are up to date
alembic check

# Test migration up/down
alembic upgrade head
alembic downgrade -1
alembic upgrade head
```

If any check fails, fix before moving on.

### Documentation (after every feature)

- [ ] **docs/ARCHITECTURE.md** — Update if you changed: DB schema, API endpoints, system diagram, or infrastructure.
- [ ] **docs/PATTERNS.md** — Update if you introduced or changed a code convention.
- [ ] **docs/REVIEW_CHECKLIST.md** — Update if the feature introduced a new category of checks.

Edit the specific section that changed. Do not rewrite entire files.

---

## File Structure

### Backend (root-level layout — no `app/` package)

- **App entrypoint** → `main.py` (FastAPI app factory, middleware, CORS, routers, exception handlers)
- **DB models** → `db_models.py` (all SQLAlchemy models in one file)
- **DB config** → `db_config.py` (engine, session factory, `Base` class with `faros` schema)
- **Dependencies** → `dependencies.py` (auth, permission checking, `get_current_user`)
- **Routes** → `routers/` (one file per domain: `auth.py`, `tasks.py`, `sharing.py`, `comments.py`, `files.py`, `activity.py`, `notifications.py`, `users.py`, `health.py`)
- **Pydantic schemas** → `schemas/` (one file per domain: `auth.py`, `task.py`, `sharing.py`, `comment.py`, `file.py`, `activity.py`, `notification.py`)
- **Business logic** → `services/` (`activity_service.py`, `background_tasks.py`, `notifications.py`)
- **Core utilities** → `core/` (`security.py`, `tokens.py`, `redis_config.py`, `rate_limit_config.py`, `storage.py`, `email.py`, `logging_config.py`, `exceptions.py`)
- **Tests** → `tests/` (one file per domain: `test_auth.py`, `test_tasks.py`, `test_sharing.py`, `test_comments.py`, `test_files.py`, `test_activity.py`, `test_notifications.py`, plus `conftest.py`)
- **Migrations** → `alembic/versions/`
- **Infrastructure** → `terraform/`

---

## Common Mistakes to Avoid

_Add to this section when the agent makes a mistake. Each line prevents a repeat._

- **Do not install packages without asking first.** State what and why. Wait for approval.
- **Do not create `.env` files with real secrets.** Use `.env.example` with placeholders.
- **Do not add dependencies that duplicate existing functionality.** Check what's installed.
- **Do not modify migration files after they've been applied.** Create a new one.

---

_Living document. When the agent does something wrong, add a rule. The goal: never the same mistake twice._
