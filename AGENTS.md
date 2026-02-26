# AGENTS.md — faros-task-manager

## Start Here (Canonical Entrypoint)

`AGENTS.md` is the canonical entrypoint for agents and contributors in this repository.

Read in this order:
1. `AGENTS.md` (this file)
2. `WORKFLOW.md`
3. `ISSUES_WORKFLOW.md`
4. `backend/AGENTS.md` (for backend work)
5. `backend/docs/ARCHITECTURE.md` (for backend work)
6. `backend/docs/PATTERNS.md` (for backend work)
7. `backend/docs/REVIEW_CHECKLIST.md` (for backend work)
8. `frontend/AGENTS.md` (for frontend work)
9. `frontend/docs/ARCHITECTURE.md` (for frontend work)
10. `frontend/docs/PATTERNS.md` (for frontend work)
11. `frontend/docs/REVIEW_CHECKLIST.md` (for frontend work)
12. `skills/write-spec.md` (if present)
13. `skills/spec-to-issues.md` (if present)
14. `skills/issue-to-pr.md` (if present)
15. `skills/spec-workflow-gh.md` (if present)

## Unit of Work Rule

- **Unit of work is a GitHub Issue.**
- Choose an execution mode from `ISSUES_WORKFLOW.md` before coding:
  - `single` (default): one feature -> one Task issue -> one PR
  - `gated`: Spec issue + child Task issue(s) for feature sets or higher-risk work
  - `fast`: quick-fix path for tiny low-risk changes (if project policy allows)
- Convert freeform requests into the selected issue mode before implementation.
- Work one Task issue at a time.
- PRs close Task issues (`Closes #123`), not Specs.
- Specs close only when all child Tasks are done or explicitly deferred.
- Detailed control-plane rules are canonical in `ISSUES_WORKFLOW.md`.
- For one-shot issue body + `gh` command generation, use `skills/spec-workflow-gh.md`.
- Default shorthand command:
  - `Create an issue workflow for feature <feature-id> in <filename>.`
  - Interpreted as `mode=single` automation using `skills/spec-workflow-gh.md` with minimal chatter and direct `gh issue create`.

## Agent Operating Loop

1. Whiteboard scope in `plans/*.md` or spec docs (scratch only).
2. Choose execution mode (`single` default, `gated`, or `fast`) and create required issue(s).
3. Restate goal and acceptance criteria.
4. Plan minimal files and scope.
5. Implement with tight, surgical changes.
6. Run verification commands.
7. Update tests/docs if required.
8. Open PR that closes the Task issue; close Spec after child Tasks are done/deferred.

## Project Context

- **Project:** `faros-task-manager`
- **Stack:** FastAPI (Python 3.12+, sync SQLAlchemy 1.x) + React 19 (Vite 7, JavaScript) + PostgreSQL 16 + Redis 7 + S3
- **Repo layout:** Monorepo: `backend/` (FastAPI API, root-level modules) + `frontend/` (React SPA, Vite)

## Operating Rules

- Keep solutions simple and explicit.
- Make surgical changes only.
- Match existing style and conventions.
- Do not install dependencies without approval.
- Do not change unrelated files.
- Do not modify applied migrations; create a new migration.

### Project-Specific Deviations

- **No async (backend).** Sync SQLAlchemy (`create_engine`, `sessionmaker`, `psycopg2-binary`). Endpoints use `def`, not `async def`. Do not introduce async patterns unless explicitly asked.
- **SQLAlchemy 1.x style (backend).** Models use `Column()` and `relationship()`, not `Mapped[]` / `mapped_column()`. Queries use `db.query(Model).filter(...)`, not `select()` / `db.execute()`. Match the existing style.
- **JavaScript frontend (no TypeScript).** All frontend files are `.js` / `.jsx`. Do not introduce TypeScript unless explicitly asked.
- **No React Router.** Frontend routing uses `currentView` state in `App.jsx`. Do not introduce React Router unless explicitly asked.
- **pylint + black (backend).** No ruff or mypy. Do not reference them in verification.

## Decision Brief (Required)

For non-trivial fixes/features, include a short decision brief before completion:

- **Chosen approach:** what was implemented.
- **Alternative considered:** one realistic alternative.
- **Tradeoff:** why this choice won (complexity/risk/perf/security).
- **Revisit trigger:** when the alternative should be reconsidered.

For tiny quick fixes, a one-line brief is enough: chosen approach + primary risk.

## Workflow Order

1. Read `WORKFLOW.md`
2. Read `ISSUES_WORKFLOW.md`
3. Read project docs in `backend/docs/`, `frontend/docs/`
4. Execute one ready Task issue

## Verification

### Full

```bash
# Backend
cd backend && pylint --rcfile=.pylintrc routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py && black --check . && pytest -v

# Frontend
cd frontend && npm run lint && npm run build
```

### Frontend

```bash
cd frontend && npm run lint && npm run build
```

### Backend

```bash
cd backend && pylint --rcfile=.pylintrc routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py && black --check . && pytest -v
```

### DB

```bash
cd backend && alembic check && alembic upgrade head && alembic downgrade -1 && alembic upgrade head
```

## Documentation Discipline

Treat doc updates like failing tests. Keep architecture, patterns, checklists, and ADRs current.

## Skills Note

`skills/*.md` are portable procedural playbooks unless your runtime explicitly loads them.

## Skill Governance

Keep external skills high-signal and conflict-free:

- Precedence order: `AGENTS.md` -> `WORKFLOW.md` -> `ISSUES_WORKFLOW.md` -> local `skills/*` -> external installed skills.
- Install external skills globally in Codex home, not inside project repos.
- Keep a small baseline (about 4-6 active external skills).
- Use skills intentionally (named skill or clear task match), not by default for every request.
- Avoid overlap: keep one primary skill per domain (API design, DB design, security, TypeScript).
- If an external skill conflicts with repo docs, follow repo docs and treat the skill as advisory.
- Review and prune unused or low-value skills regularly.

## Optional Later

MCP is out of scope for v1. It can be added later to automate issue creation/labeling/CI summaries.
