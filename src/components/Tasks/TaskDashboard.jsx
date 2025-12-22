import { Activity, FolderOpen, Share2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../api';
import ActivityTimeline from '../Activity/ActivityTimeline';
import UserMenu from '../Common/UserMenu';
import SettingsModal from '../Settings/SettingsModal';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

const ITEMS_PER_PAGE = 10;

function TaskDashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
  const [showSettings, setShowSettings] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [view, setView] = useState('personal');

  const fullAvatarUrl = user?.avatar_url
    ? `${import.meta.env.VITE_API_URL}${user.avatar_url}?t=${avatarTimestamp}`
    : null;

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    incomplete: 0,
    overdue: 0,
  });

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

  const abortControllerRef = useRef(null);

  const fetchProfile = async (isUpdate = false) => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
      // Only update the timestamp if explicitly triggered by an upload
      if (isUpdate) {
        setAvatarTimestamp(Date.now());
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile(false);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filters, view]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
      fetchStats();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, page, view]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newController = new AbortController();
    abortControllerRef.current = newController;

    try {
      if (view === 'shared') {
        const response = await api.get('/tasks/shared-with-me', {
          signal: newController.signal,
        });

        const formattedTasks = response.data.map((wrapper) => ({
          ...wrapper.task,
          my_permission: wrapper.permission,
          owner_username: wrapper.owner_username,
        }));

        setTasks(formattedTasks);
        setTotalPages(1);
      } else {
        const params = {
          limit: ITEMS_PER_PAGE,
          skip: (page - 1) * ITEMS_PER_PAGE,
          ...(filters.search && { search: filters.search }),
          ...(filters.priority && { priority: filters.priority }),
          ...(filters.status === 'completed' && { completed: true }),
          ...(filters.status === 'pending' && { completed: false }),
        };

        const response = await api.get('/tasks', {
          params,
          signal: newController.signal,
        });

        setTasks(response.data.tasks);
        setTotalPages(response.data.pages);
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error('Failed to fetch tasks:', err);
        setError('Could not load tasks.');
      }
    } finally {
      if (abortControllerRef.current === newController) {
        setLoading(false);
      }
    }
  }, [filters, page, view]);

  const fetchStats = useCallback(async () => {
    if (view === 'shared') return;

    try {
      const response = await api.get('/tasks/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [view]);

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const addTask = async () => {
    if (!formData.title.trim()) return;
    try {
      const taskData = {
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim())
          : [],
      };

      const response = await api.post('/tasks', taskData);

      if (view === 'shared') {
        setView('personal');
      } else {
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
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { completed: !currentStatus });
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      );
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      await api.patch(`/tasks/${taskId}`, updatedData);
      fetchTasks();
      fetchStats();
    } catch (err) {
      setError('Failed to save changes.');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId));
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const inputClasses =
    'p-2 rounded bg-zinc-900 border border-zinc-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder-zinc-500';
  const buttonClasses =
    'px-4 py-2 rounded text-emerald-100 bg-emerald-900/30 border border-emerald-900/50 hover:bg-emerald-900/50 hover:text-white hover:border-emerald-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const highlightClass = 'text-emerald-400 font-bold';

  return (
    <div>
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-zinc-800 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl text-emerald-500 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.9)] pr-1">
            ⟡
          </span>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tight text-white leading-none">
              FAROS
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-px w-6 bg-emerald-500/50"></span>
              <p className="text-[0.65rem] text-emerald-500 font-bold tracking-[0.2em] uppercase">
                Navigate your backlog
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <UserMenu
            username={user?.username}
            email={user?.email}
            avatarUrl={fullAvatarUrl}
            onLogout={onLogout}
            onOpenSettings={() => setShowSettings(true)}
          />
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-900/50 rounded-lg flex justify-between items-center text-red-400">
          <div className="flex items-center gap-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="hover:text-white">
            ✖
          </button>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setView('personal')}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
              view === 'personal'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FolderOpen size={16} />
            My Tasks
          </button>
          <button
            onClick={() => setView('shared')}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
              view === 'shared'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Share2 size={16} />
            Shared With Me
          </button>
          <button
            onClick={() => setView('activity')}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
              view === 'activity'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Activity size={16} />
            Activity
          </button>
        </div>
      </div>

      {view === 'personal' && (
        <>
          <div className="grid grid-cols-4 gap-2 mb-8">
            <div className="p-2 md:py-3 md:px-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center md:text-left">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-0 truncate">
                Total
              </p>
              <p className="text-xl md:text-2xl font-mono text-white">
                {stats.total || 0}
              </p>
            </div>
            <div className="p-2 md:py-3 md:px-4 bg-emerald-950/10 border border-emerald-900/20 rounded-lg text-center md:text-left">
              <p className="text-emerald-500/70 text-[10px] font-bold uppercase tracking-wider mb-0 truncate">
                Done
              </p>
              <p className="text-xl md:text-2xl font-mono text-emerald-400">
                {stats.completed || 0}
              </p>
            </div>
            <div className="p-2 md:py-3 md:px-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center md:text-left">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-0 truncate">
                Active
              </p>
              <p className="text-xl md:text-2xl font-mono text-white">
                {stats.incomplete || 0}
              </p>
            </div>
            <div className="p-2 md:py-3 md:px-4 bg-red-950/10 border border-red-900/20 rounded-lg text-center md:text-left">
              <p className="text-red-500/70 text-[10px] font-bold uppercase tracking-wider mb-0 truncate">
                Late
              </p>
              <p className="text-xl md:text-2xl font-mono text-red-400">
                {stats.overdue || 0}
              </p>
            </div>
          </div>

          <TaskForm
            formData={formData}
            onFormChange={handleFormChange}
            onAddTask={addTask}
          />

          <div className="my-8 border-t border-neutral-800" />

          <div className="flex flex-wrap gap-4 p-4 mb-6 bg-zinc-900/50 border border-emerald-900/30 rounded-lg items-center">
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className={`${inputClasses} flex-1 min-w-50`}
            />
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value }))
              }
              className={inputClasses}
            >
              <option value="">Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className={inputClasses}
            >
              <option value="">Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={() =>
                setFilters({ search: '', priority: '', status: '' })
              }
              className={buttonClasses}
            >
              Reset
            </button>
          </div>
        </>
      )}

      {view === 'shared' && (
        <div className="mb-6 p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl text-center">
          <Share2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-80" />
          <h2 className="text-xl font-bold text-white">Collaborative Tasks</h2>
          <p className="text-zinc-500 text-sm mt-1">
            These tasks have been shared with you by others.
          </p>
        </div>
      )}
      {view === 'activity' && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl text-center">
            <Activity className="w-10 h-10 text-blue-500 mx-auto mb-3 opacity-80" />
            <h2 className="text-xl font-bold text-white">Activity Log</h2>
            <p className="text-zinc-500 text-sm mt-1">
              History of all actions taken on your tasks.
            </p>
          </div>
          <ActivityTimeline />
        </div>
      )}

      {view !== 'activity' && (
        <TaskList
          tasks={tasks}
          loading={loading}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onUpdate={updateTask}
          isOwner={view === 'personal'}
        />
      )}

      {view === 'personal' && (
        <div className="mt-6 flex justify-center gap-4 items-center text-zinc-400">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className={buttonClasses}
          >
            Previous
          </button>
          <span className="text-zinc-400">
            Page <span className={highlightClass}>{page}</span> of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className={buttonClasses}
          >
            Next
          </button>
        </div>
      )}
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
