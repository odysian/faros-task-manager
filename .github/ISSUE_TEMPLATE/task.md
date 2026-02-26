---
name: "Task"
about: "Small implementable unit that becomes a PR"
title: "Task: "
labels: ["type:task"]
---

## Goal
What should exist when this is done?
Default: this Task should represent the entire feature end-to-end unless split criteria apply.

## Scope
**In:**
-

**Out:**
-

## Implementation notes
-

## Decision locks (backend-coupled only)
- [ ] Locked: <decision 1>
- [ ] Locked: <decision 2>

## Acceptance criteria
- [ ] ...

## Verification
```bash
# Backend
cd backend && pylint --rcfile=.pylintrc routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py && black --check . && pytest -v

# Frontend
cd frontend && npm run lint && npm run build

# Database (if schema changed)
cd backend && alembic check && alembic upgrade head && alembic downgrade -1 && alembic upgrade head
```

## PR checklist
- [ ] PR references this issue (`Closes #...`)
- [ ] Docs updated if needed (architecture/patterns/review checklist/ADR)
- [ ] Tests added/updated where needed
