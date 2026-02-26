# AGENTS.md

## Process

Read and follow `WORKFLOW.md` for the full development process — it defines the Design → Test → Implement → Review → Document loop, TDD workflow, technical constraints, security requirements, and documentation maintenance rules.

This file contains **project-specific rules** that supplement WORKFLOW.md. If they conflict, this file wins.

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

**Stack deviations from WORKFLOW.md defaults:**

- **No async.** This project uses sync SQLAlchemy (`create_engine`, `sessionmaker`, `psycopg2-binary`), not async (`create_async_engine`, `async_sessionmaker`, `asyncpg`). Endpoints use `def`, not `async def` for DB-bound routes. Do not introduce async patterns unless explicitly asked.
- **SQLAlchemy 1.x model style.** Models use `Column()` and `relationship()`, not `Mapped[]` / `mapped_column()`. Match the existing style.
- **SQLAlchemy 1.x query style.** Code uses `db.query(Model).filter(...)`, not `select()` / `db.execute()`. Match the existing style.
- **Backend-only repo.** The frontend (React + Vite) lives in a separate repository (`task-manager-frontend`). There are no frontend files here — ignore all frontend sections in WORKFLOW.md.
- **No `app/` package.** Modules live at the project root: `main.py`, `db_models.py`, `db_config.py`, `dependencies.py`. Subpackages (`routers/`, `services/`, `schemas/`, `core/`) are also at root level.
- **Single `db_models.py` file.** All SQLAlchemy models are in one file, not split per domain.
- **Schema isolation.** All tables use the `faros` PostgreSQL schema (shared DB with other portfolio projects). The `Base` class sets `metadata = MetaData(schema="faros")`.
- **No ruff or mypy.** This project uses `pylint` and `black` for linting/formatting. Do not reference ruff or mypy in verification steps.

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
pylint --rcfile=.pylintrc routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py

# Format check
black --check .

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

- [ ] **ARCHITECTURE.md** — Update if you changed: DB schema, API endpoints, system diagram, or infrastructure.
- [ ] **PATTERNS.md** — Update if you introduced or changed a code convention.
- [ ] **REVIEW_CHECKLIST.md** — Update if the feature introduced a new category of checks.
- [ ] **TESTPLAN.md** — Update before writing any new tests.

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
- **CI/CD** → `.github/workflows/`

---

## Planning & Execution

### Think before coding

- State assumptions explicitly. If uncertain, ask.
- If multiple valid approaches exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop and ask.

### Vague or multi-file tasks

1. Plan first — outline files, data flow, API contracts as a checklist.
2. Get approval before writing code.
3. Execute step by step, verify after each step.

### Clear, scoped tasks

Execute directly. No plan needed. Verify and report.

### Goal-driven execution

Transform tasks into verifiable goals before coding:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

---

## Common Mistakes to Avoid

_Add to this section when the agent makes a mistake. Each line prevents a repeat. These are project-specific — generic rules live in WORKFLOW.md Section 9._

- **Do not install packages without asking first.** State what and why. Wait for approval.
- **Do not create `.env` files with real secrets.** Use `.env.example` with placeholders.
- **Do not add dependencies that duplicate existing functionality.** Check what's installed.
- **Do not modify migration files after they've been applied.** Create a new one.

---

_Living document. When the agent does something wrong, add a rule. The goal: never the same mistake twice._
