import { Activity, BarChart3, Filter, FolderOpen, Plus, Share2, Users, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTasks } from '../../hooks/useTasks';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService'; // Import userService
import { THEME } from '../../styles/theme';
import { buildApiUrl } from '../../config/env';
import ActivityFeed from '../Activity/ActivityFeed';
import UserMenu from '../Common/UserMenu';
import SettingsModal from '../Settings/SettingsModal';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

const SHARE_TIP_DISMISSED_KEY = 'faros:share-tip-dismissed';
const VALID_VIEWS = new Set(['personal', 'shared', 'activity']);
const VALID_PRIORITIES = new Set(['high', 'medium', 'low']);
const VALID_STATUSES = new Set(['pending', 'completed']);
const VALID_RESOURCE_TYPES = new Set(['task', 'comment', 'file']);

const getInitialDashboardState = () => {
  const defaults = {
    view: 'personal',
    page: 1,
    filters: { search: '', priority: '', status: '' },
  };

  if (typeof window === 'undefined') return defaults;

  const params = new URLSearchParams(window.location.search);
  const rawView = params.get('view');
  const rawPriority = params.get('priority');
  const rawStatus = params.get('status');
  const rawPage = params.get('page');
  const parsedPage = Number.parseInt(rawPage || '1', 10);

  const rawType = params.get('type');

  return {
    view: VALID_VIEWS.has(rawView) ? rawView : defaults.view,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    filters: {
      search: params.get('search') || '',
      priority: VALID_PRIORITIES.has(rawPriority) ? rawPriority : '',
      status: VALID_STATUSES.has(rawStatus) ? rawStatus : '',
    },
    activityFilter: VALID_RESOURCE_TYPES.has(rawType) ? rawType : null,
    activityPage: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
};

function TaskDashboard({ onLogout }) {
  const [initialDashboardState] = useState(() => getInitialDashboardState());
  const [user, setUser] = useState(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState(() => Date.now());
  const [showSettings, setShowSettings] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [shareTipDismissed, setShareTipDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(SHARE_TIP_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [showStatsMenu, setShowStatsMenu] = useState(false);
  const statsMenuRef = useRef(null);
  const hasHydratedQueryStateRef = useRef(false);
  const previousQueryRef = useRef(initialDashboardState);
  const pendingViewRef = useRef(null);
  const activityStateRef = useRef({ resourceType: initialDashboardState.activityFilter, page: initialDashboardState.activityPage });
  const [activityUrlTick, setActivityUrlTick] = useState(0);
  const [isViewSwitching, setIsViewSwitching] = useState(false);

  const handleActivityStateChange = useCallback(({ resourceType, page: actPage }) => {
    activityStateRef.current = { resourceType, page: actPage };
    setActivityUrlTick((t) => t + 1);
  }, []);

  // View State
  const [page, setPage] = useState(initialDashboardState.page);
  const [view, setView] = useState(initialDashboardState.view); // 'personal', 'shared', 'activity'

  const [filters, setFilters] = useState(initialDashboardState.filters);
  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    Boolean(filters.priority) ||
    Boolean(filters.status);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    tags: '',
  });

  // Custom hook for task data management
  const {
    tasks,
    setTasks,
    loading,
    totalPages,
    stats,
    fetchTasks,
    fetchStats,
  } = useTasks(filters, page, view);

  // Use userService instead of raw api call
  const fetchProfile = async (isUpdate = false) => {
    try {
      const response = await userService.getProfile();
      setUser(response.data);
      if (isUpdate) setAvatarTimestamp(Date.now());
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Failed to load user profile');
    }
  };

  useEffect(() => {
    // Initial profile load on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchProfile updates local profile state as part of initial data hydration.
    fetchProfile(false);
  }, []);

  useEffect(() => {
    // Reset pagination when filters/view change.
    if (!hasHydratedQueryStateRef.current) {
      hasHydratedQueryStateRef.current = true;
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pagination reset is required when filters/view change.
    setPage(1);
  }, [filters, view]);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (
        showStatsMenu &&
        statsMenuRef.current &&
        !statsMenuRef.current.contains(event.target)
      ) {
        setShowStatsMenu(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [showStatsMenu]);

  useEffect(() => {
    const previousQuery = previousQueryRef.current;
    const filtersChanged =
      previousQuery.filters.search !== filters.search ||
      previousQuery.filters.priority !== filters.priority ||
      previousQuery.filters.status !== filters.status;
    const shouldDebounceFetch =
      filtersChanged && previousQuery.view === view && previousQuery.page === page;
    const timer = setTimeout(() => {
      void (async () => {
        await fetchTasks();
        await fetchStats();
        if (pendingViewRef.current === view) {
          pendingViewRef.current = null;
          setIsViewSwitching(false);
        }
      })();
    }, shouldDebounceFetch ? 500 : 0);
    previousQueryRef.current = { view, page, filters };
    return () => clearTimeout(timer);
  }, [filters, page, view, fetchTasks, fetchStats]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (view === 'activity') {
      params.set('view', view);
      if (activityStateRef.current.resourceType) params.set('type', activityStateRef.current.resourceType);
      if (activityStateRef.current.page > 1) params.set('page', String(activityStateRef.current.page));
    } else if (view !== 'personal') {
      params.set('view', view);
    } else {
      const search = filters.search.trim();
      if (search) params.set('search', search);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.status) params.set('status', filters.status);
      if (page > 1) params.set('page', String(page));
    }

    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, document.title, nextUrl);
    }
  }, [view, filters.search, filters.priority, filters.status, page, activityUrlTick]);

  const addTask = async () => {
    if (!formData.title.trim()) return;

    try {
      const taskData = {
        ...formData,
        due_date: formData.due_date ? formData.due_date : null,
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim())
          : [],
      };

      const response = await taskService.createTask(taskData);

      if (view === 'shared') setView('personal');
      else {
        setTasks([response.data, ...tasks]);
        fetchStats();
      }

      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        tags: '',
      });
      setIsFormOpen(false);
      toast.success('Task created successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to create task');
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    try {
      await taskService.updateTask(taskId, { completed: !currentStatus });
      setTasks(
        tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !currentStatus } : t
        )
      );
      fetchStats();
    } catch {
      toast.error('Failed to update task status');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      const remainingTasks = tasks.filter((t) => t.id !== taskId);
      setTasks(remainingTasks);
      fetchStats();

      // Re-fetch list after deletion so pagination stays accurate without manual reload.
      if (remainingTasks.length === 0 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        await fetchTasks();
      }

      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const fullAvatarUrl = user?.avatar_url
    ? `${buildApiUrl(user.avatar_url)}?t=${avatarTimestamp}`
    : null;
  const statsItems = [
    { label: 'Total', value: stats.total || 0, tone: 'text-white' },
    { label: 'Done', value: stats.completed || 0, tone: 'text-emerald-300' },
    { label: 'Active', value: stats.incomplete || 0, tone: 'text-zinc-100' },
    { label: 'Late', value: stats.overdue || 0, tone: 'text-red-300' },
  ];
  const showShareTip =
    view === 'personal' && Boolean(user) && tasks.length > 0 && !shareTipDismissed;
  const safeTotalPages = Math.max(1, totalPages || 1);
  const isTaskListLoading = loading || isViewSwitching;

  const dismissShareTip = () => {
    try {
      window.localStorage.setItem(SHARE_TIP_DISMISSED_KEY, 'true');
    } catch {
      // If storage is unavailable, just hide for this session.
    }
    setShareTipDismissed(true);
  };

  const handleViewChange = (nextView) => {
    if (nextView === view) return;
    pendingViewRef.current = nextView;
    setIsViewSwitching(true);
    setView(nextView);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="mb-2 flex items-center justify-between gap-2 border-b border-zinc-800 pb-4 md:pb-3">
        <div className="flex min-w-0 items-center gap-2 md:gap-4">
          <span className="text-3xl md:text-4xl text-emerald-500 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.9)] pr-1">
            ⟡
          </span>
          <div className="flex min-w-0 flex-col">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
              FAROS
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-px w-4 md:w-6 bg-emerald-500/50"></span>
              <p className="text-[0.55rem] md:text-[0.65rem] text-emerald-500 font-bold tracking-[0.2em] uppercase">
                Navigate your backlog
              </p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <UserMenu
            username={user?.username}
            email={user?.email}
            avatarUrl={fullAvatarUrl}
            onLogout={onLogout}
            onOpenSettings={() => setShowSettings(true)}
          />
        </div>
      </header>

      {/* View Switcher */}
      <div className="mb-4 flex justify-center">
        <div className="flex flex-wrap gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          <button
            onClick={() => handleViewChange('personal')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
              view === 'personal'
                  ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]'
                  : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FolderOpen size={16} />
            <span className="hidden md:block">My Tasks</span>
          </button>
          <button
            onClick={() => handleViewChange('shared')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
              view === 'shared'
                  ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]'
                  : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Share2 size={16} />
            <span className="hidden md:block">Shared With Me</span>
          </button>
          <button
            onClick={() => handleViewChange('activity')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
              view === 'activity'
                  ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]'
                  : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Activity size={16} />
            <span className="hidden md:block">Activity</span>
          </button>
        </div>
      </div>

      {/* View: Personal Tasks */}
      {view === 'personal' && (
        <>
          {/* ACTION BAR */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Left: Filter Toggle */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                  isFilterOpen
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-transparent border-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <Filter size={16} />
                <span className="hidden md:inline">
                  {isFilterOpen ? 'Hide Filters' : 'Filter & Search'}
                </span>
              </button>

              {/* Stats Toggle */}
              <div className="relative" ref={statsMenuRef}>
                <button
                  onClick={() => setShowStatsMenu((open) => !open)}
                  aria-label="Toggle stats"
                  title="Stats"
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                    showStatsMenu
                      ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-100'
                      : 'border-zinc-800/50 bg-transparent text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-300'
                  }`}
                >
                  <BarChart3 size={16} />
                  <span className="hidden md:inline">Stats</span>
                </button>

                {showStatsMenu && (
                  <div className="absolute left-0 top-full z-20 mt-2 w-44 rounded-xl border border-zinc-700 bg-zinc-900/95 p-2 shadow-xl backdrop-blur">
                    <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Personal Stats
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {statsItems.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-md border border-zinc-800 bg-zinc-950/70 px-2 py-1.5"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                            {item.label}
                          </p>
                          <p className={`font-mono text-sm font-semibold ${item.tone}`}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Create Task Toggle */}
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all shadow-lg active:scale-95 ${
                isFormOpen
                  ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-emerald-500/20'
              }`}
            >
              {isFormOpen ? (
                <>
                  <X size={16} /> Cancel
                </>
              ) : (
                <>
                  <Plus size={16} /> New Task
                </>
              )}
            </button>
          </div>

          {/* Collapsible Area 1: New Task Form */}
          {isFormOpen && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-200 mb-4">
              <TaskForm
                formData={formData}
                onFormChange={(field, val) =>
                  setFormData((prev) => ({ ...prev, [field]: val }))
                }
                onAddTask={addTask}
              />
            </div>
          )}

          {/* Collapsible Area 2: Filters */}
          {isFilterOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 mb-4">
              <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 shadow-inner md:flex-row md:gap-4">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, search: e.target.value }))
                  }
                  className={`${THEME.input} w-full md:flex-1`}
                  autoFocus
                />
                <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:gap-3">
                  <select
                    value={filters.priority}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, priority: e.target.value }))
                    }
                    className={`${THEME.input} min-w-32 flex-1 md:w-32`}
                  >
                    <option value="">Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, status: e.target.value }))
                    }
                    className={`${THEME.input} min-w-32 flex-1 md:w-32`}
                  >
                    <option value="">Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={() =>
                      setFilters({ search: '', priority: '', status: '' })
                    }
                    className={THEME.button.secondary}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {showShareTip && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
              <div className="flex items-start gap-3">
                <Users size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Collaboration Tip
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">
                    Use the share icon on a task card to invite collaborators and
                    choose their permissions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismissShareTip}
                  className="text-xs font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* <div className="my-2 border-t border-neutral-800" /> */}
        </>
      )}

      {/* View: Shared Tasks Header */}
      {view === 'shared' && (
        <div className="mb-6 p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl text-center">
          <Share2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-80" />
          <h2 className="text-xl font-bold text-white">Collaborative Tasks</h2>
          <p className="text-zinc-500 text-sm mt-1">Shared by others.</p>
        </div>
      )}

      {/* View: Activity Feed */}
      {view === 'activity' && (
        <ActivityFeed
          initialFilter={initialDashboardState.activityFilter}
          initialPage={initialDashboardState.activityPage}
          onStateChange={handleActivityStateChange}
        />
      )}

      {/* Task List (Personal & Shared) */}
      {view !== 'activity' && (
        <TaskList
          tasks={tasks}
          loading={isTaskListLoading}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onUpdate={async (id, data) => {
            await taskService.updateTask(id, data);
            fetchTasks();
            fetchStats();
          }}
          view={view}
          hasActiveFilters={hasActiveFilters}
          onOpenCreateTask={() => setIsFormOpen(true)}
          onClearFilters={() => setFilters({ search: '', priority: '', status: '' })}
          onSwitchToPersonal={() => handleViewChange('personal')}
          isOwner={view === 'personal'}
          currentUsername={user?.username || ''}
        />
      )}

      {/* Pagination (Personal Only) */}
      {view === 'personal' && (
        <div className="mt-6 flex items-center justify-center gap-4 text-zinc-400">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isTaskListLoading}
            className={THEME.button.secondary}
          >
            Previous
          </button>
          <span>
            Page <span className="font-semibold text-white">{page}</span> of {safeTotalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(safeTotalPages, p + 1))}
            disabled={page >= safeTotalPages || isTaskListLoading}
            className={THEME.button.secondary}
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {showSettings && user && (
        <SettingsModal
          user={user}
          avatarUrl={fullAvatarUrl}
          onClose={() => setShowSettings(false)}
          onUserUpdate={() => fetchProfile(true)}
        />
      )}
    </div>
  );
}

export default TaskDashboard;
