import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
  formatActivityDescription,
  formatRelativeTime,
  getActivityIcon,
} from '../../utils/activityHelpers';

function ActivityItem({ activity }) {
  const [showDetails, setShowDetails] = useState(false);

  const { icon, color } = getActivityIcon(
    activity.action,
    activity.resource_type
  );
  const description = formatActivityDescription(activity);
  const timeAgo = formatRelativeTime(activity.created_at);

  const hasExpandableDetails =
    activity.action === 'updated' &&
    activity.details?.old_values &&
    activity.details?.new_values;

  return (
    <div className="flex gap-3">
      <div className="text-lg shrink-0">{icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300">{description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-zinc-600">{timeAgo}</p>
          {hasExpandableDetails && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-0.5"
            >
              {showDetails ? 'Hide' : 'Details'}
              <ChevronDown
                size={12}
                className={showDetails ? 'rotate-180' : ''}
              />
            </button>
          )}
        </div>

        {showDetails && hasExpandableDetails && (
          <div className="mt-2 p-2 bg-zinc-950 border border-zinc-800 rounded text-xs space-y-1">
            {activity.details.changed_fields.map((field) => (
              <div key={field} className="flex items-center gap-2">
                <span className="text-zinc-500 font-medium w-20">{field}:</span>
                <span className="text-red-400 line-through">
                  {String(activity.details.old_values[field] || 'none')}
                </span>
                <span className="text-zinc-600">→</span>
                <span className="text-emerald-400">
                  {String(activity.details.new_values[field] || 'none')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityItem;
