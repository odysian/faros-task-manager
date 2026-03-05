import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { taskService } from '../services/taskService';

const ITEMS_PER_PAGE = 20;

export function useActivityLog(resourceType, page) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const abortControllerRef = useRef(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const newController = new AbortController();
    abortControllerRef.current = newController;

    try {
      const params = {
        limit: ITEMS_PER_PAGE + 1,
        offset: (page - 1) * ITEMS_PER_PAGE,
        ...(resourceType && { resource_type: resourceType }),
      };
      const response = await taskService.getGlobalActivity(
        params,
        newController.signal
      );
      const items = response.data;
      if (items.length > ITEMS_PER_PAGE) {
        setActivities(items.slice(0, ITEMS_PER_PAGE));
        setHasMore(true);
      } else {
        setActivities(items);
        setHasMore(false);
      }
    } catch (err) {
      if (err.name !== 'CanceledError') toast.error('Failed to load activity');
    } finally {
      if (abortControllerRef.current === newController) setLoading(false);
    }
  }, [resourceType, page]);

  return { activities, loading, hasMore, fetchActivities };
}
