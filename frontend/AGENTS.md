# AGENTS.md

## Process

Read and follow `WORKFLOW.md` for the full development process — it defines the Design → Test → Implement → Review → Document loop, TDD workflow, technical constraints, security requirements, and documentation maintenance rules.

This file contains **project-specific rules** that supplement WORKFLOW.md. If they conflict, this file wins.

---

## Project Context

React SPA frontend for the FAROS task management app — handles task CRUD, sharing, file uploads, comments, activity timeline, and user settings.

**Stack:**

- Frontend: React 19 + Vite 7 (JavaScript, not TypeScript)
- Styling: Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- HTTP client: Axios (centralized in `src/api.js`)
- Icons: Lucide React
- Toasts: Sonner
- Formatting: Prettier (`.prettierrc`)
- Linting: ESLint 9 (flat config, `eslint.config.js`)
- Deployment: AWS CloudFront + S3 (primary); Vercel (alternative)
- Backend API: Separate repo (`task-manager-api`) — FastAPI on Render/AWS

**Stack deviations from WORKFLOW.md defaults:**

- **Vite SPA, not Next.js.** This is a client-side React app with Vite. There are no server components, no App Router, no `getServerSideProps`. All routing is done via state in `App.jsx` (switch/case view router), not file-based routing.
- **JavaScript, not TypeScript.** All files are `.js` / `.jsx`. There is no `tsconfig.json`, no type checking. Do not introduce TypeScript unless explicitly asked.
- **No React Router.** Navigation uses `currentView` state in `App.jsx` and a manual switch/case. URL-based routing is only used for verification/password-reset deep links (read from `window.location`).
- **No test framework installed.** There are no tests in this repo currently. Do not assume test infrastructure exists.
- **Auth tokens in localStorage.** Tokens are stored in `localStorage`, not httpOnly cookies. The axios interceptor in `api.js` attaches the token to requests and handles 401 redirects.
- **No Prettier CLI in scripts.** Prettier is configured (`.prettierrc`) but not in `package.json` scripts. Format checking relies on editor integration.

---

## Core Rules

- **Simplicity first.** Write the minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No speculative flexibility. If you write 200 lines and it could be 50, rewrite it.
- **Surgical changes only.** Touch only what the task requires. Don't "improve" adjacent code, comments, or formatting. Match existing style. If you notice unrelated issues, mention them — don't fix them. Every changed line should trace to the user's request.
- **Explain what you're doing.** Include brief comments explaining _why_ for non-obvious logic. This is a learning environment.
- **Prefer explicit over clever.** Readable, straightforward code. No one-liners that sacrifice clarity.

---

## Verification

### Frontend

```bash
# Lint
npm run lint

# Build (catches import errors, missing modules)
npm run build
```

There is no type checking (`npx tsc --noEmit` does not apply — this is a JavaScript project).

If any check fails, fix before moving on.

### Documentation (after every feature)

- [ ] **ARCHITECTURE.md** — Update if you changed: component hierarchy, routing, API integration, or state management.
- [ ] **PATTERNS.md** — Update if you introduced or changed a code convention.
- [ ] **REVIEW_CHECKLIST.md** — Update if the feature introduced a new category of checks.
- [ ] **TESTPLAN.md** — Update before writing any new tests.

Edit the specific section that changed. Do not rewrite entire files.

---

## File Structure

### Frontend (Vite SPA — all code under `src/`)

- **App entrypoint** → `src/main.jsx` (React root render)
- **App shell & routing** → `src/App.jsx` (view router via `currentView` state, auth handlers, toast provider)
- **API client** → `src/api.js` (Axios instance with token interceptor and 401 handling)
- **Pages** → `src/pages/` (`LandingPage.jsx`, `PasswordResetPage.jsx`)
- **Components** → `src/components/` (organized by feature domain):
  - `Auth/` — `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `PasswordResetForm`
  - `Tasks/` — `TaskDashboard`, `TaskList`, `TaskCard`, `TaskForm`, `TaskSkeleton`
  - `Sharing/` — `ShareModal`, `ShareList`, `ShareItem`
  - `Comments/` — `CommentsSection`, `CommentForm`, `CommentItem`
  - `Files/` — `FilesSection`, `FileUploadZone`, `FileItem`
  - `Activity/` — `ActivityTimeline`, `ActivityItem`
  - `Settings/` — `SettingsModal`, `ProfileSection`, `SecuritySection`, `NotificationSection`
  - `Common/` — `ConfirmModal`, `UserMenu`, `UserSearch`
  - `UI/` — `Button`, `Input` (generic primitives)
- **Services** → `src/services/` (`authService.js`, `taskService.js`, `userService.js`, `healthService.js`) — API call abstractions using the Axios client
- **Hooks** → `src/hooks/` (`useTasks.js`)
- **Utils** → `src/utils/` (`activityHelpers.js`)
- **Styles** → `src/styles/` (`theme.js`), plus `src/index.css` (Tailwind base)
- **CI/CD** → `.github/workflows/deploy-frontend.yml`

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
- "Refactor X" → "Ensure the build passes before and after"

---

## Common Mistakes to Avoid

_Add to this section when the agent makes a mistake. Each line prevents a repeat. These are project-specific — generic rules live in WORKFLOW.md Section 9._

- **Do not install packages without asking first.** State what and why. Wait for approval.
- **Do not create `.env` files with real secrets.** Use `.env.example` with placeholders.
- **Do not add dependencies that duplicate existing functionality.** Check what's installed.
- **Do not introduce TypeScript or React Router.** Match the existing JavaScript + state-based routing patterns.

---

_Living document. When the agent does something wrong, add a rule. The goal: never the same mistake twice._
