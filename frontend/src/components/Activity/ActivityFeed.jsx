import { Activity, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useActivityLog } from '../../hooks/useActivityLog';
import { THEME } from '../../styles/theme';
import ActivityItem from './ActivityItem';

const RESOURCE_FILTERS = [
  { key: null, label: 'All' },
  { key: 'task', label: 'Tasks' },
  { key: 'comment', label: 'Comments' },
  { key: 'file', label: 'Files' },
];

function ActivityFeed({ initialFilter, initialPage, onStateChange }) {
  const [resourceType, setResourceType] = useState(initialFilter || null);
  const [page, setPage] = useState(initialPage || 1);

  const { activities, loading, hasMore, fetchActivities } = useActivityLog(
    resourceType,
    page
  );

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    onStateChange?.({ resourceType, page });
  }, [resourceType, page, onStateChange]);

  const handleFilterChange = (key) => {
    setResourceType(key);
    setPage(1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl text-center">
        <Activity className="w-10 h-10 text-blue-500 mx-auto mb-3 opacity-80" />
        <h2 className="text-xl font-bold text-white">Activity Log</h2>
      </div>

      {/* Filter chips */}
      <div className="mb-4 flex items-center gap-2">
        {RESOURCE_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => handleFilterChange(f.key)}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
              resourceType === f.key
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && activities.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">No activity yet</p>
        </div>
      )}

      {/* Activity list */}
      {!loading && activities.length > 0 && (
        <div className="space-y-1 bg-zinc-900/30 border border-zinc-800 rounded-xl p-4">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && (page > 1 || hasMore) && (
        <div className="mt-6 flex items-center justify-center gap-4 text-zinc-400">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={THEME.button.secondary}
          >
            Previous
          </button>
          <span>
            Page <span className="font-semibold text-white">{page}</span>
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className={THEME.button.secondary}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
