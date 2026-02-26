# Issues Workflow

This repository uses GitHub issues as the execution control plane.

## Workflow Loop

1. Whiteboard feature ideas in `plans/*.md` or spec docs (scratch planning).
2. Document work as issues using one of the execution modes below.
3. Implement and close Task issues via PRs (`Closes #...`).
4. Finalize by updating required docs and closing related Spec/tracker issues.

## Objects

- **Task** (`type:task`): PR-sized implementation unit and default feature issue.
- **Spec** (`type:spec`): feature-set/spec umbrella with decision locks and child Task links.
- **Decision** (`type:decision`): short-term decision lock with rationale.

## Control Plane Rules

1. GitHub Issues are the source of truth for execution. `TASKS.md` (if present) is scratchpad only.
2. The default execution path is **1 feature -> 1 Task -> 1 PR**.
3. PRs close Task issues (`Closes #...`), not Specs.
4. Specs close only when all child Tasks are done or explicitly deferred.
5. Tasks are PR-sized; in this workflow PR-sized usually means end-to-end feature delivery.
6. Backend-coupled work requires Decision Locks checked before implementation begins.
7. After major refactors, open one docs-only Task for readability hardening (comments + `docs/PATTERNS.md` updates), with no behavior changes.
8. For `single` and `gated` modes, create a dedicated branch for the Task issue before implementation (for example: `task-123-short-name`).

## Execution Modes (Choose Before Opening Issues)

### `single` (Default)

Use one Task issue per feature, then one PR that closes it.

- Best for most feature work.
- Task includes mini-spec content: summary/scope/acceptance criteria/verification.
- Decision Locks live in the Task for backend-coupled work.

### `gated` (Spec + Tasks)

Use one Spec issue plus child Task issue(s).

- Use when working a feature set or higher-risk work.
- Decision Locks live in the Spec.
- Child Tasks should stay PR-sized (default one Task per feature).

### `fast` (Quick Fix)

For low-risk maintenance, a direct quick-fix path can be allowed (if project policy allows) without mandatory issue creation when all are true:

- the change is a single logical fix
- no schema/API/realtime contract change
- no auth/security model change
- no migration/dependency changes
- no ADR-worthy architecture decision

When using Fast Lane:

- run relevant verification
- use a clear quick-fix commit message
- follow the repo's branch/merge policy
- if scope grows, switch to `single` or `gated`

## When to Split Into Multiple Tasks

Split only when it clearly improves delivery or risk control:

- change is too large for one PR (guideline: ~600+ LOC or hard to review)
- backend contract should land before frontend integration
- migrations or realtime contract changes increase risk
- parallel work or staged rollout is needed

## Definition of Ready

A Task is ready when:

- acceptance criteria are explicit
- verification commands are listed
- dependencies/links are included
- for backend-coupled work: Decision Locks are checked in the controlling issue (Task in `single`, Spec in `gated`)

## Definition of Done

A Task is done when:

- PR is merged
- verification commands pass
- tests and docs for the feature are included in the same Task by default
- follow-up issues are created for deferred work

## Decision Records and ADRs

- Default: Decision Locks live in the controlling issue (Task in `single`, Spec in `gated`).
- Use a separate Decision issue only for non-trivial or cross-Spec discussion.
- If a decision has lasting architecture/security/performance impact:
  - create an ADR (`NNN-*.md`)
  - link it from the Spec or Task
  - link it from the implementing PR

## Verification Template

Use project commands:

```bash
# Backend
cd backend && pylint --rcfile=.pylintrc routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py && black --check . && pytest -v

# Frontend
cd frontend && npm run lint && npm run build

# Database
cd backend && alembic check && alembic upgrade head && alembic downgrade -1 && alembic upgrade head
```

## Codex + GitHub CLI Playbook

If using Codex in VS Code with GitHub CLI, follow `skills/spec-workflow-gh.md`.

- `mode=single` (default): generate one Task issue body + `gh issue create` command
- `mode=gated`: generate Spec + Task issue body + commands
- `mode=fast`: generate quick-fix checklist (no issue commands by default)

## Common GitHub CLI Commands

```bash
gh issue create --title "Task: <feature> end-to-end" --label "type:task,area:frontend" --body-file task-<feature>-01.md
gh issue create --title "Spec: <feature set>" --label "type:spec" --body-file spec-<feature-set>.md
gh issue list --label type:task
gh issue view <id>
```

## Optional Later

MCP is not required for v1. Add it later only for automation (issue creation/labeling/CI summaries).
