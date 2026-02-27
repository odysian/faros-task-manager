# PATTERNS.md — Task Manager API

Established code conventions in this project. Follow these patterns when adding new features. Update this file when a new convention is introduced.

---

## Thin Routers, Fat Services

Routers validate input (via Pydantic) and call services or directly query the DB. Business logic that spans multiple queries or has conditional behavior lives in `services/`.

```python
# routers/tasks.py — thin
@router.post("", status_code=201, response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db_session=Depends(get_db), current_user=Depends(get_current_user)):
    new_task = db_models.Task(**task.model_dump(), user_id=current_user.id)
    db_session.add(new_task)
    db_session.commit()
    db_session.refresh(new_task)
    return new_task
```

For simple CRUD, routers interact with the DB directly. Services are used for cross-cutting concerns (activity logging, notifications, caching).

---

## Centralized Settings

Use `core/settings.py` as the single source of truth for runtime config.

```python
from core.settings import settings

REDIS_URL = settings.redis_url
```

**Convention:** Avoid direct `os.getenv()` reads in runtime modules. Add new env fields to `Settings` and consume through `settings`.

---

## Auth Compatibility Dependency (Cookie + Bearer)

Protected routes use `get_current_user` from `dependencies.py`, which resolves auth in this order during migration:

1. `Authorization: Bearer <token>` header (compatibility)
2. httpOnly auth cookie (`settings.ACCESS_TOKEN_COOKIE_NAME`)

If neither is present, the route returns `401 Not authenticated`.

**Convention:** New protected routes should continue to depend on `get_current_user` and must not parse cookies/headers directly in router code.

`/auth/login` sets the auth cookie and still returns a token payload during the compatibility window. `/auth/logout` clears the cookie and is intentionally idempotent for predictable frontend behavior.

---

## Permission Checking

All task access goes through the permission system in `dependencies.py`:

```python
# 1. Load task
task = db_session.query(db_models.Task).filter(db_models.Task.id == task_id).first()
if not task:
    raise TaskNotFoundError(task_id=task_id)

# 2. Check permission (raises UnauthorizedTaskAccessError if insufficient)
require_task_access(task, current_user, db_session, TaskPermission.EDIT)
```

Permission hierarchy: `NONE(0) < VIEW(1) < EDIT(2) < OWNER(3)`.

**Convention:** Always load the task first, then check permissions. Never filter by `user_id` alone — shared tasks would be excluded.

---

## Activity Logging

Activity is logged via `services/activity_service.py`. Every mutation (create, update, delete, share) logs an entry.

**Key pattern:** Log functions call `db_session.flush()`, not `db_session.commit()`. The parent endpoint commits the full transaction (including the activity log) atomically.

```python
# In router — after mutation, before commit
activity_service.log_task_created(db_session, current_user.id, new_task)
db_session.commit()
```

**Detail fields captured:**
- Task created: title, priority, completed, tags, due_date
- Task updated: changed_fields, old_values, new_values
- Task deleted: full task snapshot
- Share/unshare: username, permission
- Comment: content_preview (first 100 chars)
- File: filename, file_size, content_type

---

## Background Tasks (Fire-and-Forget Notifications)

Email notifications run as FastAPI `BackgroundTasks` to avoid blocking the response:

```python
@router.post("/{task_id}/share", status_code=201)
def share_task(..., background_tasks: BackgroundTasks):
    # ... create share ...
    background_tasks.add_task(
        notify_task_shared,
        recipient_user_id=shared_user.id,
        recipient_email=shared_user.email,
        task_title=task.title,
        sharer_username=current_user.username,
        permission=share_data.permission,
    )
    return share_response
```

**Convention:** Background task functions in `services/background_tasks.py` create their own `SessionLocal()` to check notification preferences. They never share the request's DB session.

---

## Storage Abstraction

File storage uses an interface pattern (`core/storage.py`) with two implementations:

- `LocalStorage` — filesystem, for development without AWS credentials
- `S3Storage` — AWS S3, for production

Selected by `STORAGE_PROVIDER` env var ("local" or "s3").

**File naming convention:**
- Task files: `task_{task_id}_{uuid}{ext}`
- Avatars: `avatars/user_{user_id}_avatar{ext}`

---

## Email Abstraction

Email sending uses the same interface pattern (`core/email.py`):

- `ResendEmail` — Resend API, default
- `AWSEmail` — AWS SES

Selected by `EMAIL_PROVIDER` env var ("resend" or "aws").

---

## Redis Caching

Used for task statistics only. Pattern in `core/redis_config.py`:

```python
# Check cache first
cached = get_cache(f"stats:user_{user_id}")
if cached:
    return json.loads(cached)

# Compute expensive stats
stats = compute_stats(db_session, user_id)

# Cache result
set_cache(f"stats:user_{user_id}", json.dumps(stats), ttl=300)

return stats
```

**Invalidation:** Call `invalidate_user_cache(user_id)` after any task mutation (create, update, delete). This deletes the `stats:user_{user_id}` key.

**Graceful degradation:** If Redis is unavailable, caching functions return None / no-op. The app works without Redis — just slower stats.

---

## Custom Exceptions → HTTP Responses

Domain exceptions are defined in `core/exceptions.py` and mapped to HTTP responses via exception handlers in `main.py`:

| Exception | Status | Response Shape |
|-----------|--------|---------------|
| `TaskNotFoundError(task_id)` | 404 | `{ error, message, task_id }` |
| `UnauthorizedTaskAccessError(task_id, user_id)` | 403 | `{ error, message }` (no IDs exposed) |
| `TagNotFoundError(task_id, tag)` | 404 | `{ error, message, task_id, tag }` |
| `DuplicateUserError(field, value)` | 409 | `{ error, message, field }` |
| `InvalidCredentialsError()` | 401 | `{ error, message }` + WWW-Authenticate |

**Convention:** Raise domain exceptions from service/router code. Never construct `JSONResponse` directly in routers — let the exception handlers do it.

---

## Rate Limiting

Applied per-endpoint via slowapi decorators:

```python
@router.post("/register")
@limiter.limit("10/hour")
def register(request: Request, ...):
```

**Key function:** `get_user_id_or_ip(request)` determines the rate limit key — uses authenticated user ID if available, otherwise client IP.

**Convention:** Rate limits are disabled entirely during tests (`TESTING=true` env var skips slowapi import).

---

## Test Fixtures

Tests use a real PostgreSQL test database (`task_manager_test`) with the `faros` schema. Key fixtures in `tests/conftest.py`:

- `db_session` — Creates/drops all tables per test. Yields a Session.
- `client` — `TestClient` with overridden `get_db` dependency
- `test_user` / `auth_token` — Pre-created user + JWT
- `authenticated_client` — Client with auth header pre-set
- `create_user_and_token` — Factory for multi-user tests
- `mock_ses` / `mock_s3` — Patch external services
- `patch_background_tasks_db` — Forces background tasks to use test session

**Convention:** Tests use `testuser` / `test@example.com` / `testpass123` as default credentials. Multi-user tests use the `create_user_and_token` factory to avoid collisions.

---

## Pydantic Model Conventions

- Request models: `{Resource}Create`, `{Resource}Update` (partial, all Optional)
- Response models: `{Resource}` or `{Resource}Response`
- All response models use `model_config = ConfigDict(from_attributes=True)` for ORM compatibility
- Validation: `Field(min_length=..., max_length=...)` for strings, `Literal[...]` for enums

---

## CORS Configuration

Allowed origins are hardcoded in `main.py` — no wildcard. Includes:
- `localhost:5173` / `localhost:5174` (dev)
- `faros.odysian.dev` (production)
- CloudFront distribution URL
- Vercel preview URL

**Convention:** When adding a new frontend deployment URL, add it to the `allow_origins` list in `main.py`.
