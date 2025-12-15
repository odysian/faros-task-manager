import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ITEMS_PER_PAGE = 10;

function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    incomplete: 0,
    overdue: 0,
  });

  const abortControllerRef = useRef(null);

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

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newController = new AbortController();
    abortControllerRef.current = newController;
    try {
      const token = localStorage.getItem('token');

      const params = {
        limit: ITEMS_PER_PAGE,
        skip: (page - 1) * ITEMS_PER_PAGE,
      };
      if (filters.search) params.search = filters.search;
      if (filters.priority) params.priority = filters.priority;
      if (filters.status === 'completed') params.completed = true;
      if (filters.status === 'pending') params.completed = false;

      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        params: params,
        signal: newController.signal,
      });

      setTasks(response.data.tasks);
      setTotalPages(response.data.pages);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
        return;
      }
      console.error('Failed to fetch tasks:', err);
    } finally {
      if (abortControllerRef.current === newController) {
        setLoading(false);
      }
    }
  }, [filters, page]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
      fetchStats();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchTasks, fetchStats]);

  const handleFormChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const addTask = async () => {
    if (!formData.title.trim()) return;

    try {
      const token = localStorage.getItem('token');

      const taskData = {
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim())
          : [],
      };

      const response = await axios.post(`${API_URL}/tasks`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks([...tasks, response.data]);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        tags: '',
      });
      fetchStats();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/tasks/${taskId}`,
        {
          completed: !currentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      );
      fetchStats();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      const token = localStorage.getItem('token');

      await axios.patch(`${API_URL}/tasks/${taskId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to save changes. Please try again.');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(tasks.filter((task) => task.id !== taskId));
      fetchStats();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Styles
  const inputClasses =
    'p-2 rounded bg-zinc-900 border border-zinc-700 text-white ' +
    'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ' +
    'focus:outline-none transition-all placeholder-zinc-500';

  const buttonClasses =
    'px-4 py-2 rounded text-emerald-100 bg-emerald-900/30 border border-emerald-900/50 ' +
    'hover:bg-emerald-900/50 hover:text-white hover:border-emerald-500 ' +
    'transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  // Special class for the "Page X" highlight
  const highlightClass = 'text-emerald-400 font-bold';

  return (
    <div>
      {/* ERROR BANNER */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-900/50 rounded-lg flex justify-between items-center text-red-400 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="hover:text-white transition-colors"
          >
            ✖
          </button>
        </div>
      )}

      {/* 2. STATS HUD (Compact + Slim Desktop) */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {/* Total */}
        <div className="p-2 md:py-3 md:px-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center md:text-left">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-0 truncate">
            Total
          </p>
          <p className="text-xl md:text-2xl font-mono text-white">
            {stats.total || 0}
          </p>
        </div>

        {/* Done */}
        <div className="p-2 md:py-3 md:px-4 bg-emerald-950/10 border border-emerald-900/20 rounded-lg text-center md:text-left">
          <p className="text-emerald-500/70 text-[10px] font-bold uppercase tracking-wider mb-0 truncate">
            Done
          </p>
          <p className="text-xl md:text-2xl font-mono text-emerald-400">
            {stats.completed || 0}
          </p>
        </div>

        {/* Active */}
        <div className="p-2 md:py-3 md:px-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center md:text-left">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-0 truncate">
            Active
          </p>
          <p className="text-xl md:text-2xl font-mono text-white">
            {stats.incomplete || 0}
          </p>
        </div>

        {/* Late */}
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

      {/* Filter Bar UI */}
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
          <option value="">All Priorities</option>
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
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>

        <button
          onClick={() => setFilters({ search: '', priority: '', status: '' })}
          className={buttonClasses}
        >
          Reset
        </button>
      </div>

      <TaskList
        tasks={tasks}
        loading={loading}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onUpdate={updateTask}
      />
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
    </div>
  );
}

export default TaskDashboard;
