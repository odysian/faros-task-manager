# ARCHITECTURE.md — Task Manager Frontend

## System Overview

React SPA for the FAROS task management app. Provides a dark-themed UI for creating, organizing, and sharing tasks with file attachments, comments, activity tracking, and user settings. Communicates with a separate FastAPI backend via REST API. Deployed to AWS CloudFront + S3.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React 19 | Component model, hooks, wide ecosystem |
| Build | Vite 7 | Fast HMR, ESM-native |
| Language | JavaScript (JSX) | Project started before TS adoption |
| Styling | Tailwind CSS v4 (@tailwindcss/vite plugin) | Utility-first, dark theme |
| HTTP Client | Axios | Interceptors for auth, upload progress |
| Icons | Lucide React | Consistent, tree-shakable icon set |
| Toasts | Sonner | Lightweight toast notifications |
| Linting | ESLint 9 (flat config) | React Hooks + React Refresh plugins |
| Formatting | Prettier | 2-space indent, single quotes, semicolons |
| Deployment | CloudFront + S3 (primary), Vercel (alt) | CDN-backed SPA hosting |

---

## Component Hierarchy

```
App
├── LandingPage
│   └── (warmup health check on mount)
├── LoginForm
├── RegisterForm
├── ForgotPasswordForm
├── PasswordResetForm
├── VerifyEmailPage
└── TaskDashboard
    ├── UserMenu
    ├── View Switcher (My Tasks | Shared | Activity)
    ├── Stats Grid (personal view only)
    ├── TaskForm (personal view only)
    ├── Filter Panel (search, priority, status)
    ├── TaskList
    │   ├── TaskSkeleton (loading state)
    │   └── TaskCard (per task)
    │       ├── CommentsSection
    │       │   ├── CommentForm
    │       │   └── CommentItem
    │       ├── FilesSection
    │       │   ├── FileUploadZone
    │       │   └── FileItem
    │       ├── ShareModal
    │       │   ├── UserSearch
    │       │   └── ShareList
    │       │       └── ShareItem
    │       ├── ActivityTimeline
    │       │   └── ActivityItem
    │       └── ConfirmModal (delete confirmation)
    ├── Pagination
    └── SettingsModal
        ├── ProfileSection
        ├── NotificationSection
        └── SecuritySection
```

---

## Routing

There is **no router library**. Navigation is state-driven in `App.jsx`:

```javascript
const [currentView, setCurrentView] = useState('landing');
const [authResolved, setAuthResolved] = useState(false);

useEffect(() => {
  const resolveAuthSession = async () => {
    try {
      await userService.getProfile(); // cookie-backed /users/me
      setCurrentView('dashboard');
    } catch {
      setCurrentView('landing');
    } finally {
      setAuthResolved(true);
    }
  };
  resolveAuthSession();
}, []);
```

Views: `landing`, `login`, `register`, `forgot-password`, `password-reset`, `verify`, `dashboard`

URL-based routing is only used for deep links:
- `/verify?token=...` → email verification
- `/password-reset?token=...` → password reset

These are read from `window.location` in a `useEffect` on mount.

---

## State Management

**No global state library.** All state is managed with React hooks:

| State | Location | Mechanism |
|-------|----------|-----------|
| Auth/session | `App.jsx` + backend cookie | Session resolved from API (`/users/me`) on app boot |
| Current view | `App.jsx` | `useState` |
| Task data | `useTasks` hook | `useState` + API calls |
| User profile | `TaskDashboard` | `useState` + `userService.getProfile()` |
| UI toggles (modals, forms, filters) | Individual components | `useState` |
| Form data | Individual components | `useState` |

---

## API Integration

All API calls go through the service layer (`src/services/`), which uses the shared Axios client (`src/api.js`).

### Request Flow

```
Component → Service → Axios Client → Backend API
                         ↓
                  Response Interceptor
                  (broadcasts unauthorized session event on protected-route 401s)
```

### Service Files

| Service | Endpoints Called |
|---------|----------------|
| `authService.js` | `/auth/login`, `/auth/logout`, `/auth/register`, `/auth/password-reset/*`, `/notifications/send-verification`, `/notifications/verify` |
| `taskService.js` | `/tasks/*`, `/comments/*`, `/files/*`, `/activity/*` |
| `userService.js` | `/users/*`, `/notifications/preferences` |
| `healthService.js` | `/health` (warmup) |

### Auth Session Flow

1. Login/register → backend returns token payload and sets httpOnly auth cookie.
2. Axios sends cookie automatically (`withCredentials: true`) on API requests.
3. App boot resolves session by calling `/users/me` (not by reading browser storage).
4. On protected-route 401 response, axios emits `faros:unauthorized`; `App.jsx` resets view/auth state.
5. Logout calls `/auth/logout`, backend clears cookie, UI returns to `landing`.

---

## Data Flow Example: Task CRUD

```
TaskDashboard
  ├── addTask() → taskService.createTask() → POST /tasks
  │   └── on success: fetchTasks(), fetchStats()
  ├── toggleTask() → taskService.updateTask() → PATCH /tasks/{id}
  │   └── on success: update local state
  └── deleteTask() → taskService.deleteTask() → DELETE /tasks/{id}
      └── on success: filter from local list, fetchStats()

useTasks hook (manages task list state):
  └── fetchTasks()
      ├── personal: taskService.getTasks(filters, pagination)
      └── shared: taskService.getSharedTasks()
```

---

## Styling Architecture

**Theme object** in `src/styles/theme.js` defines reusable class strings:

| Token | Used For |
|-------|---------|
| `THEME.card` | Card containers (zinc-900 bg, zinc-800 border) |
| `THEME.input` | All text inputs (zinc-900 bg, emerald focus ring) |
| `THEME.label` | Form labels (zinc-400, 10px uppercase) |
| `THEME.button.primary` | Primary actions (emerald-600 bg) |
| `THEME.button.secondary` | Secondary actions (emerald-900 border) |
| `THEME.button.ghost` | Icon buttons (transparent, emerald hover) |
| `THEME.button.danger` | Destructive actions (red hover) |
| `THEME.badge` | Tag/status badges |

**Color palette:** zinc-950 (darkest bg) → zinc-200 (text). Emerald-500/600 for accents. Red for danger. Amber for warnings.

---

## Deployment

### AWS (Primary)
- `npm run build` → produces `dist/`
- GitHub Actions workflow syncs `dist/` to S3
- CloudFront distribution serves from S3 origin
- All routes rewrite to `index.html` (SPA)

### Vercel (Alternative)
- `vercel.json` configures SPA rewrites
- Builds automatically from `main` branch

### Environment Variables
- `VITE_API_URL` — Backend API base URL (set in build env or `.env`)
- Env access is centralized in `src/config/env.js` (`API_BASE_URL`, `buildApiUrl()`).
- Local runtime (`vite dev` / localhost) defaults to `http://localhost:8000` when `VITE_API_URL` is not set.
- Non-local runtime throws at startup if `VITE_API_URL` is missing.
