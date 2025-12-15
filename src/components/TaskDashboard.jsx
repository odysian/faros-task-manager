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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

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
    } catch (err) {
      console.error('Failed to toggle task:', err);
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
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Styles
  const inputClasses =
    'p-2 rounded bg-zinc-900 border border-zinc-700 text-white ' +
    'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ' + // Glowing Green Focus
    'focus:outline-none transition-all placeholder-zinc-500';

  const buttonClasses =
    'px-4 py-2 rounded text-emerald-100 bg-emerald-900/30 border border-emerald-900/50 ' +
    'hover:bg-emerald-900/50 hover:text-white hover:border-emerald-500 ' +
    'transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  // Special class for the "Page X" highlight
  const highlightClass = 'text-emerald-400 font-bold';

  return (
    <div>
      <TaskForm
        formData={formData}
        onFormChange={handleFormChange}
        onAddTask={addTask}
      />

      <div className="my-8 border-t border-neutral-800" />

      {/* New Filter Bar UI */}
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
