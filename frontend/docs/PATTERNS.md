# PATTERNS.md — Task Manager Frontend

Established code conventions in this project. Follow these patterns when adding new features.

---

## Service Layer

All API calls are abstracted into service files (`src/services/`). Components never call `api.get()`/`api.post()` directly.

```javascript
// services/taskService.js
export const taskService = {
  getTasks: (params, signal) => api.get('/tasks', { params, signal }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};
```

**Convention:** One service file per backend domain. Methods return the axios promise (not unwrapped data).

---

## Component Organization

Components are grouped by feature domain under `src/components/`:

```
components/
├── Auth/        # Login, register, password flows
├── Tasks/       # Dashboard, list, card, form
├── Sharing/     # Share modal, share list
├── Comments/    # Comment section, form, item
├── Files/       # Upload zone, file list
├── Activity/    # Timeline, activity items
├── Settings/    # Settings modal, profile, security, notifications
├── Common/      # Reusable: ConfirmModal, UserMenu, UserSearch
└── UI/          # Primitives: Button, Input
```

**Convention:** Feature components go in their domain folder. Generic reusable components go in `Common/` or `UI/`.

---

## Theme System

All styling uses Tailwind classes. Repeated class combinations are stored in the `THEME` object (`src/styles/theme.js`):

```javascript
import { THEME } from '../styles/theme';

<input className={THEME.input} />
<button className={THEME.button.primary}>Save</button>
<div className={THEME.card}>...</div>
```

**Convention:** Use `THEME` tokens for inputs, buttons, cards, labels, and badges. Use inline Tailwind classes for layout-specific styles (margins, padding, flex).

---

## Form Handling

Forms use controlled inputs with `useState`:

```javascript
const [formData, setFormData] = useState({ title: '', priority: 'medium' });

const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

<input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
```

**Validation:** Client-side only (checks before API call). Show errors via `toast.error()` from Sonner.

**Submission pattern:**
1. Set loading state
2. Call service method in try/catch
3. On success: reset form, show success toast, refresh data
4. On error: show error toast with `error.response?.data?.detail`
5. Clear loading state in `finally`

---

## Permission-Based UI

Task permissions control what the user can see and do:

```javascript
const canEdit = isOwner || (task.my_permission === 'edit');

// Conditional rendering
{canEdit && <button onClick={handleEdit}>Edit</button>}
{isOwner && <button onClick={handleDelete}>Delete</button>}
{canEdit && <FileUploadZone />}
```

**Convention:** Compute `canEdit` and `isOwner` at the component level and pass as props. Never check permissions deep in child components.

---

## Optimistic Updates

For fast-feeling interactions, update local state before the API confirms:

```javascript
// Delete comment — optimistic
const handleDeleteComment = async (id) => {
  const previousComments = [...comments];
  setComments(prev => prev.filter(c => c.id !== id));

  try {
    await taskService.deleteComment(id);
  } catch {
    setComments(previousComments); // rollback
    toast.error('Failed to delete comment');
  }
};
```

**Used for:** Comment deletion, file deletion. Not used for task creation (waits for server response to get the ID).

---

## Toast Notifications

All user feedback uses Sonner toasts:

```javascript
import { toast } from 'sonner';

toast.success('Task created!');
toast.error(error.response?.data?.detail || 'Something went wrong');
toast.info('Logged out');
```

**Convention:** Success toasts for completed actions. Error toasts for failures with backend detail message. Info toasts for neutral events.

The `<Toaster>` is mounted once in `App.jsx` with dark theme.

---

## Request Cancellation

The `useTasks` hook uses `AbortController` to cancel stale requests when filters or page change:

```javascript
const abortControllerRef = useRef(null);

const fetchTasks = useCallback(async () => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = new AbortController();

  const response = await taskService.getTasks(params, abortControllerRef.current.signal);
  // ...
}, [filters, page, view]);
```

**Convention:** Any component that re-fetches data on filter/search changes should use `AbortController` to prevent race conditions.

---

## Relative Time Display

Timestamps are displayed as relative time using `formatRelativeTime()` from `src/utils/activityHelpers.js`:

- < 1 min: "just now"
- < 1 hour: "5m ago"
- < 1 day: "3h ago"
- < 7 days: "2d ago"
- Older: "Jan 15, 12:34"

**Convention:** Comments and activity items set a 60-second interval to keep timestamps fresh.

---

## Loading States

Every async operation has an explicit loading boolean:

```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try { /* ... */ }
  finally { setLoading(false); }
};

<button disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
```

**Convention:** Disable interactive elements during loading. Show skeleton components for list loading (`TaskSkeleton`). Show spinners for inline loading.

---

## Backend Warmup

The landing page pings `/health` on mount to wake up the Render free-tier backend:

```javascript
useEffect(() => {
  healthService.warmUpBackend({ signal: controller.signal });
}, []);
```

**Convention:** Only done on the landing page. Not on the dashboard (user is already authenticated, backend is awake).
