# WORKFLOW.md — faros-task-manager

## Project Context

- **Project:** `faros-task-manager`
- **Stack:** FastAPI (Python 3.12+, sync SQLAlchemy 1.x) + React 19 (Vite 7, JavaScript) + PostgreSQL 16 + Redis 7 + S3
- **Repo layout:** Monorepo: `backend/` (FastAPI API) + `frontend/` (React SPA)

## Development Loop

Every feature follows:

1. Whiteboard
2. Document
3. Implement
4. Finalize

## Issues Workflow (Control Plane)

Read `ISSUES_WORKFLOW.md` before implementation.

Core rule:

- GitHub issues are the execution source of truth.
- Choose execution mode: `single` (default), `gated` (Spec + Tasks), or `fast` (tiny low-risk fixes).
- Default sizing is 1 feature -> 1 Task -> 1 PR unless split criteria apply.
- PRs close Tasks.
- Specs close only when all child Tasks are done or deferred.
- For `single` and `gated` modes, create a dedicated Task branch before implementation.
- Backend-coupled work must have Decision Locks checked before implementation.
- After major refactors, open one docs-only Task for readability hardening (comments + `docs/PATTERNS.md` updates), with no behavior changes.

Definition of Ready and Definition of Done are defined in `ISSUES_WORKFLOW.md` and are mandatory gates.

## Planning and Scope

- One issue at a time.
- Default to one end-to-end Task per feature.
- For existing repos, keep current structure unless a dedicated migration task explicitly scopes restructuring.
- Practical file-size budgets: target `<=250` LOC for leaf components and `<=180` LOC for single-purpose hooks/services; `300-400` LOC is acceptable when cohesive; split or create a linked follow-up when a component exceeds `450` LOC or a hook/service exceeds `300` LOC.
- Split Tasks only when `ISSUES_WORKFLOW.md` split criteria apply.
- Keep changes surgical.

## Decision Brief Requirement

For each non-trivial change, include a short decision brief:

- chosen approach
- one alternative considered
- tradeoff behind the choice (complexity/risk/perf/security)
- revisit trigger for when the alternative becomes preferable

For quick-fix fast-lane work, a one-line brief is sufficient.

## Verification

Run the relevant checks before claiming completion.

### Full Verification

```bash
# Backend
cd backend && pylint --rcfile=.pylintrc routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py && black --check . && pytest -v

# Frontend
cd frontend && npm run lint && npm run build
```

### Frontend Verification

```bash
cd frontend && npm run lint && npm run build
```

### Backend Verification

```bash
cd backend && pylint --rcfile=.pylintrc routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py && black --check . && pytest -v
```

### Database Verification

```bash
cd backend && alembic check && alembic upgrade head && alembic downgrade -1 && alembic upgrade head
```

## Documentation

Update docs when behavior/contracts/patterns change.

Docs paths:

- `backend/docs/`
- `frontend/docs/`

## CI

- GitHub Actions: `backend-test.yml` (PR/push on backend/**), `backend-deploy.yml` (manual), `frontend-deploy.yml` (manual), `infrastructure.yml` (manual)

## Optional Later

MCP is optional and not part of v1. Introduce it only when you need automation for issue operations or CI summaries.
