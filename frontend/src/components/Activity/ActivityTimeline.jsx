import { ChevronDown, Clock, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { taskService } from '../../services/taskService';
import ActivityItem from './ActivityItem';

function ActivityTimeline({ taskId, isExpanded }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskService.getTaskActivity(taskId);
      setActivities(response.data);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (isExpanded && isTimelineExpanded && activities.length === 0) {
      fetchTimeline();
    }
  }, [isExpanded, isTimelineExpanded, activities.length, fetchTimeline]);

  if (!isExpanded) return null;

  return (
    <div className="mt-2 pt-2 border-t border-zinc-800">
      <button
        onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
        aria-label={isTimelineExpanded ? 'Collapse activity history' : 'Expand activity history'}
        className="group flex w-full cursor-pointer items-center justify-between rounded px-2 py-1 text-left transition-colors hover:bg-zinc-800/30"
      >
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-zinc-500" />
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Activity History
          </h4>
          {activities.length > 0 && (
            <span className="text-[10px] text-zinc-600">
              ({activities.length})
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-zinc-500 transition-transform duration-200 ${
            isTimelineExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isTimelineExpanded && (
        <div className="mt-2 pl-2">
          {loading && (
            <div className="flex justify-center py-2">
              <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
            </div>
          )}

          {!loading && activities.length === 0 && (
            <p className="text-center py-2 text-zinc-600 text-xs">
              No activity
            </p>
          )}

          {!loading && activities.length > 0 && (
            // REDUCED: space-y-3 to space-y-1
            <div className="space-y-1">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityTimeline;
