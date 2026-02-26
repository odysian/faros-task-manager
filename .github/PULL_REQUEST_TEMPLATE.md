## Summary

What changed and why?

## Linked Issue

- Closes #

## Scope

**In scope:**
-

**Out of scope:**
-

## Acceptance Criteria Check

- [ ] Acceptance criteria from Task issue are fully met

## Verification

```bash
# Backend
cd backend && pylint --rcfile=.pylintrc routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py && black --check . && pytest -v

# Frontend
cd frontend && npm run lint && npm run build

# Database (if schema changed)
cd backend && alembic check && alembic upgrade head && alembic downgrade -1 && alembic upgrade head
```

## Docs and Decisions

- [ ] Docs updated as needed
- [ ] ADR created/linked if decision has lasting architecture/security/perf impact

## Risks / Rollback

- Risk level:
- Rollback plan:
