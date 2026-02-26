# REVIEW_CHECKLIST.md — Task Manager API

Run through this checklist after every implementation session, before committing. Check items relevant to your changes.

---

## Security

- [ ] Every new endpoint has `Depends(get_current_user)` unless explicitly public
- [ ] Public endpoints are documented in ARCHITECTURE.md as "Auth: None"
- [ ] Task access uses `require_task_access()` with the correct `min_permission` level
- [ ] User-specific queries filter by authenticated user's ID (no data leakage between users)
- [ ] Ownership is checked before UPDATE and DELETE (load resource, verify user_id)
- [ ] String fields have `max_length` in Pydantic schemas
- [ ] File uploads validate extension against `ALLOWED_EXTENSIONS`
- [ ] File uploads enforce `MAX_UPLOAD_SIZE` limit
- [ ] Password hashing uses bcrypt (never plaintext, never weak hashing)
- [ ] Error responses don't expose internal details (stack traces, SQL errors, file paths)
- [ ] `UnauthorizedTaskAccessError` response doesn't include task_id or user_id
- [ ] No secrets hardcoded — all from environment variables
- [ ] Runtime modules use `core.settings.settings` (no new direct `os.getenv()` reads)
- [ ] CORS origins are explicit (no `*` wildcard)
- [ ] Rate limiting applied to auth endpoints and creation endpoints

## Performance

- [ ] No N+1 queries — check any loop that queries inside a loop
- [ ] Redis cache invalidated after task mutations (`invalidate_user_cache`)
- [ ] New columns used in WHERE clauses have indexes
- [ ] Pagination used for list endpoints (not unbounded queries)
- [ ] Background tasks used for slow operations (email, file cleanup)

## Database

- [ ] New schema changes have an Alembic migration
- [ ] Migration has a working `downgrade()` function
- [ ] No existing migration files modified — new migration created instead
- [ ] Foreign keys specify ON DELETE behavior (CASCADE, SET NULL, or RESTRICT)
- [ ] New tables use the `faros` schema (inherit from `Base`)
- [ ] UNIQUE constraints prevent logical duplicates

## Code Quality

- [ ] Router is thin — business logic in services or inline DB operations
- [ ] Activity logging added for new mutations (create, update, delete, share)
- [ ] Pydantic models used for request validation (not manual checks)
- [ ] Custom exceptions used instead of raw `HTTPException` where domain exceptions exist
- [ ] No `print()` statements — use `logging` module
- [ ] No `import *` — explicit imports only
- [ ] Type hints on function signatures
- [ ] Consistent with patterns in PATTERNS.md

## Tests

- [ ] Happy path test exists
- [ ] At least one error case test (wrong auth, invalid input, not found)
- [ ] At least one edge case test where applicable
- [ ] Test names describe scenario and expected outcome
- [ ] Assertions check status code AND response body content
- [ ] Tests use fixtures from conftest.py (not hardcoded test data)
- [ ] External services mocked (S3, email)
- [ ] Backend verification passes: `make backend-verify`

## Documentation

- [ ] ARCHITECTURE.md updated if schema, endpoints, or infrastructure changed
- [ ] PATTERNS.md updated if new convention introduced
- [ ] This checklist updated if new category of checks discovered
