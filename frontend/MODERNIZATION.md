# MODERNIZATION.md — Task Manager Frontend

Changes needed to bring this project in line with the standards defined in `WORKFLOW.md`. Each section is independent and can be tackled incrementally.

---

## 1. TypeScript Migration

**Current:** JavaScript (`.js` / `.jsx`). No type checking.

**Target:** TypeScript (`.ts` / `.tsx`) with strict mode.

**Changes required:**
- Add `typescript` to devDependencies
- Create `tsconfig.json` with strict settings
- Rename all `.js` → `.ts` and `.jsx` → `.tsx` files
- Add interfaces for all component props
- Add types for API responses (matching backend Pydantic schemas)
- Add types for service return values
- Replace implicit `any` with proper types
- Update ESLint config for TypeScript (`@typescript-eslint/eslint-plugin`)
- Update Vite config if needed

**Recommended approach:** Migrate incrementally — start with service files and types, then components. Use `// @ts-expect-error` sparingly during transition.

---

## 2. React Router

**Current:** State-based view switching in `App.jsx` with `currentView` state and a switch/case block. No URL-based navigation except for deep links.

**Target:** React Router v6+ with proper URL routes.

**Changes required:**
- Add `react-router-dom`
- Replace switch/case in `App.jsx` with `<Routes>` / `<Route>`
- Create route layout components (auth layout, dashboard layout)
- Protected route wrapper (redirects to login if no token)
- Replace `setCurrentView('login')` calls with `navigate('/login')`
- Handle `/verify` and `/password-reset` as proper routes
- Update Vercel/CloudFront config for SPA fallback (already done)

**Proposed routes:**
```
/                → LandingPage
/login           → LoginForm
/register        → RegisterForm
/forgot-password → ForgotPasswordForm
/password-reset  → PasswordResetForm
/verify          → VerifyEmailPage
/dashboard       → TaskDashboard (protected)
```

---

## 3. Test Framework

**Current:** No tests.

**Target:** Vitest + React Testing Library for unit/integration tests.

**Changes required:**
- Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw` to devDependencies
- Configure Vitest in `vite.config.js`
- Create test setup file
- Add MSW (Mock Service Worker) for API mocking
- Write tests for:
  - Service layer (API calls with mocked responses)
  - Hook behavior (`useTasks` with mocked services)
  - Component rendering and interaction
  - Auth flow (login, register, logout)
  - Permission-based UI visibility

**Priority test targets:**
1. `useTasks` hook — filtering, pagination, view switching
2. Auth flow — login stores token, logout clears, 401 redirects
3. TaskCard — permission-based button visibility
4. CommentsSection — CRUD lifecycle
5. FilesSection — upload validation, progress

---

## 4. Error Boundaries

**Current:** Errors caught per-component in try/catch. No top-level error boundary.

**Target:** React Error Boundaries for graceful failure handling.

**Changes required:**
- Create `ErrorBoundary` component (class component or `react-error-boundary` package)
- Wrap `App` and key sections (dashboard, settings)
- Provide "something went wrong" fallback UI
- Log errors to console or external service

---

## 5. Environment Variable Validation

**Current:** `VITE_API_URL` read with fallback to hardcoded IP (`http://54.80.178.193:8000`).

**Target:** Validated environment config with no hardcoded fallbacks.

**Changes required:**
- Create `src/config.js` (or `.ts`) that reads and validates env vars
- Remove hardcoded IP from `api.js`
- Throw clear error if `VITE_API_URL` is missing in production builds
- Create `.env.example` with placeholder values

---

## 6. httpOnly Cookie Auth (Backend Coordination)

**Current:** JWT stored in `localStorage`. Axios interceptor attaches Bearer token.

**Target:** httpOnly cookie set by backend. No token in JavaScript.

**Changes required (frontend):**
- Remove all `localStorage.getItem('token')` / `setItem` calls
- Remove Authorization header interceptor from `api.js`
- Ensure `withCredentials: true` on axios instance (sends cookies)
- Determine auth state from API response (GET /users/me) not localStorage
- Logout calls a backend endpoint that clears the cookie

**Note:** Requires backend changes first (see backend MODERNIZATION.md #9).

---

## 7. Centralized API Client Pattern

**Current:** Axios instance in `api.js` with interceptors. Hardcoded EC2 IP as fallback.

**Target:** Match WORKFLOW.md `lib/api.ts` pattern with proper error handling.

```javascript
// Target pattern
export async function apiClient(path, options = {}) {
  const response = await api({ url: path, ...options });
  return response.data;
}
```

**Changes required:**
- Wrap axios calls to unwrap `response.data` at the client level
- Services return data directly, not axios response objects
- Centralize error transformation

---

## Recommended Order

1. **Environment validation** (#5) — Small, removes hardcoded IP
2. **Error boundaries** (#4) — Small, improves resilience
3. **Test framework** (#3) — Safety net for further changes
4. **TypeScript migration** (#1) — Large but high-value
5. **React Router** (#2) — Improves UX with proper URLs
6. **API client pattern** (#7) — Clean up after other changes
7. **httpOnly cookies** (#6) — Coordinate with backend
