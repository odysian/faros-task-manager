import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { taskService } from '../services/taskService';

const ITEMS_PER_PAGE = 10;

export function useTasks(filters, page, view) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    incomplete: 0,
    overdue: 0,
  });
  const abortControllerRef = useRef(null);

  const fetchStats = useCallback(async () => {
    if (view === 'shared') return;
    try {
      const response = await taskService.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [view]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const newController = new AbortController();
    abortControllerRef.current = newController;

    try {
      if (view === 'shared') {
        const response = await taskService.getSharedTasks(newController.signal);
        setTasks(
          response.data.map((w) => ({
            ...w.task,
            my_permission: w.permission,
            owner_username: w.owner_username,
          }))
        );
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
        const response = await taskService.getTasks(
          params,
          newController.signal
        );
        setTasks(response.data.tasks);
        setTotalPages(response.data.pages);
      }
    } catch (err) {
      if (err.name !== 'CanceledError') toast.error('Failed to load tasks');
    } finally {
      if (abortControllerRef.current === newController) setLoading(false);
    }
  }, [filters, page, view]);

  return {
    tasks,
    setTasks,
    loading,
    totalPages,
    stats,
    fetchTasks,
    fetchStats,
  };
}
