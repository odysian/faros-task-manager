import { ChevronDown, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api';
import ActivityItem from './ActivityItem';

function ActivityTimeline({ taskId, isExpanded }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded && isTimelineExpanded && activities.length === 0) {
      fetchTimeline();
    }
  }, [isExpanded, isTimelineExpanded, taskId]);

  const fetchTimeline = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/activity/tasks/${taskId}`);
      setActivities(response.data);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) return null;

  return (
    // REDUCED: mt-4 pt-4 to mt-2 pt-2
    <div className="mt-2 pt-2 border-t border-zinc-800">
      <button
        onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
        // REDUCED: Padding p-2 to py-1 px-2
        className="flex items-center justify-between w-full text-left group hover:bg-zinc-800/30 py-1 px-2 rounded transition-colors"
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
          className={`text-zinc-500 transition-transform ${
            isTimelineExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isTimelineExpanded && (
        <div className="mt-2 pl-2">
          {error && (
            <div className="p-1.5 bg-red-950/30 border border-red-900/50 rounded text-red-400 text-[10px] mb-2">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-2">
              <div className="w-4 h-4 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
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
