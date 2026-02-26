import { Activity, Filter, FolderOpen, Plus, Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTasks } from '../../hooks/useTasks';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService'; // Import userService
import { THEME } from '../../styles/theme';
import { buildApiUrl } from '../../config/env';
import ActivityTimeline from '../Activity/ActivityTimeline';
import UserMenu from '../Common/UserMenu';
import SettingsModal from '../Settings/SettingsModal';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

function TaskDashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState(() => Date.now());
  const [showSettings, setShowSettings] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // View State
  const [page, setPage] = useState(1);
  const [view, setView] = useState('personal'); // 'personal', 'shared', 'activity'

  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    status: '',
  });

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile(false);
  }, []);

  useEffect(() => {
    // Reset pagination when filters/view change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [filters, view]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
      fetchStats();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, page, view]);

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
      setTasks(tasks.filter((t) => t.id !== taskId));
      fetchStats();
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const fullAvatarUrl = user?.avatar_url
    ? `${buildApiUrl(user.avatar_url)}?t=${avatarTimestamp}`
    : null;

  return (
    <div>
      {/* Header */}
      <header className="flex flex-row justify-between items-center mb-4 border-b border-zinc-800 pb-4 md:pb-2 gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-3xl md:text-4xl text-emerald-500 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.9)] pr-1">
            ⟡
          </span>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
              FAROS
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-px w-4 md:w-6 bg-emerald-500/50"></span>
              <p className="text-[0.55rem] md:text-[0.65rem] text-emerald-500 font-bold tracking-[0.2em] uppercase">
                Navigate your backlog
              </p>
            </div>
          </div>
        </div>
        <UserMenu
          username={user?.username}
          email={user?.email}
          avatarUrl={fullAvatarUrl}
          onLogout={onLogout}
          onOpenSettings={() => setShowSettings(true)}
        />
      </header>

      {/* View Switcher */}
      <div className="flex justify-center mb-4">
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 gap-1">
          <button
            onClick={() => setView('personal')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-md text-sm font-bold transition-all ${
              view === 'personal'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FolderOpen size={16} />
            <span className="hidden md:block">My Tasks</span>
          </button>
          <button
            onClick={() => setView('shared')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-md text-sm font-bold transition-all ${
              view === 'shared'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Share2 size={16} />
            <span className="hidden md:block">Shared With Me</span>
          </button>
          <button
            onClick={() => setView('activity')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-md text-sm font-bold transition-all ${
              view === 'activity'
                ? 'bg-zinc-800 text-white'
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
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            <div className="py-1.5 px-2 md:py-2 md:px-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex flex-col md:flex-row md:items-baseline md:justify-between text-center md:text-left">
              <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider truncate">
                Total
              </p>
              <p className="text-lg md:text-xl font-mono text-white leading-none">
                {stats.total || 0}
              </p>
            </div>
            <div className="py-1.5 px-2 md:py-2 md:px-4 bg-emerald-950/10 border border-emerald-900/20 rounded-lg flex flex-col md:flex-row md:items-baseline md:justify-between text-center md:text-left">
              <p className="text-emerald-500/70 text-[9px] md:text-[10px] font-bold uppercase tracking-wider truncate">
                Done
              </p>
              <p className="text-lg md:text-xl font-mono text-emerald-400 leading-none">
                {stats.completed || 0}
              </p>
            </div>
            <div className="py-1.5 px-2 md:py-2 md:px-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex flex-col md:flex-row md:items-baseline md:justify-between text-center md:text-left">
              <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider truncate">
                Active
              </p>
              <p className="text-lg md:text-xl font-mono text-white leading-none">
                {stats.incomplete || 0}
              </p>
            </div>
            <div className="py-1.5 px-2 md:py-2 md:px-4 bg-red-950/10 border border-red-900/20 rounded-lg flex flex-col md:flex-row md:items-baseline md:justify-between text-center md:text-left">
              <p className="text-red-500/70 text-[9px] md:text-[10px] font-bold uppercase tracking-wider truncate">
                Late
              </p>
              <p className="text-lg md:text-xl font-mono text-red-400 leading-none">
                {stats.overdue || 0}
              </p>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="flex justify-between items-center mb-4">
            {/* Left: Filter Toggle (Smaller Size) */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                isFilterOpen
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-transparent border-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              <Filter size={24} />
              {isFilterOpen ? 'Hide Filters' : 'Filter & Search'}
            </button>

            {/* Right: Create Task Toggle */}
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg hover:scale-105 active:scale-95 ${
                isFormOpen
                  ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-emerald-500/20'
              }`}
            >
              {isFormOpen ? (
                <>
                  <X size={26} strokeWidth={3} /> Cancel
                </>
              ) : (
                <>
                  <Plus size={26} strokeWidth={3} /> New Task
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
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg items-center shadow-inner">
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
                <div className="flex gap-2 md:gap-4 w-full md:w-auto items-center">
                  <select
                    value={filters.priority}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, priority: e.target.value }))
                    }
                    className={`${THEME.input} flex-1 md:w-32`}
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
                    className={`${THEME.input} flex-1 md:w-32`}
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

      {/* View: Activity Header */}
      {view === 'activity' && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl text-center">
            <Activity className="w-10 h-10 text-blue-500 mx-auto mb-3 opacity-80" />
            <h2 className="text-xl font-bold text-white">Activity Log</h2>
          </div>
          {/* Note: This component might need props to function as a global feed */}
          <ActivityTimeline />
        </div>
      )}

      {/* Task List (Personal & Shared) */}
      {view !== 'activity' && (
        <TaskList
          tasks={tasks}
          loading={loading}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onUpdate={async (id, data) => {
            await taskService.updateTask(id, data);
            fetchTasks();
            fetchStats();
          }}
          isOwner={view === 'personal'}
        />
      )}

      {/* Pagination (Personal Only) */}
      {view === 'personal' && (
        <div className="mt-6 flex justify-center gap-4 items-center text-zinc-400">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className={THEME.button.secondary}
          >
            Previous
          </button>
          <span>
            Page <span className={THEME.highlight}>{page}</span> of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
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
