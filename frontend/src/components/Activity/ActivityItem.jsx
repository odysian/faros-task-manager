import {
  ChevronDown,
  Circle,
  CirclePlus,
  MessageSquare,
  Pencil,
  Trash2,
  Upload,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import {
  PRIORITY_CONFIG,
  formatActivityDescription,
  formatRelativeTime,
  getActivityIcon,
} from '../../utils/activityHelpers';

const SEGMENT_STYLES = {
  user: 'text-zinc-100 font-medium',
  task: 'text-emerald-400/70',
  field: 'text-blue-400/70',
  comment: 'text-zinc-500 italic',
  text: '',
};

const ICON_MAP = {
  CirclePlus,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  MessageSquare,
  Upload,
  Circle,
};

function ActivityItem({ activity }) {
  const [showDetails, setShowDetails] = useState(false);

  const { icon: iconName, color } = getActivityIcon(activity.action, activity.resource_type);
  const IconComponent = ICON_MAP[iconName] || Circle;
  const segments = formatActivityDescription(activity);
  const timeAgo = formatRelativeTime(activity.created_at);

  const priority =
    activity.resource_type === 'task' && activity.details?.priority
      ? PRIORITY_CONFIG[activity.details.priority]
      : null;

  const hasExpandableDetails =
    activity.action === 'updated' &&
    activity.details?.old_values &&
    activity.details?.new_values;

  return (
    <div className="flex gap-3">
      <div className="shrink-0 pt-0.5">
        <IconComponent size={16} className={color} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300">
          {segments.map((s, i) => (
            <span key={i} className={SEGMENT_STYLES[s.type] || ''}>
              {s.text}
            </span>
          ))}
          {priority && (
            <span
              className={`ml-1.5 inline-block align-middle px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border shrink-0 ${priority.class}`}
            >
              {priority.label}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-zinc-600">{timeAgo}</p>
          {hasExpandableDetails && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              aria-label={showDetails ? 'Hide activity details' : 'Show activity details'}
              className="flex cursor-pointer items-center gap-0.5 text-xs text-emerald-500 hover:text-emerald-400"
            >
              {showDetails ? 'Hide' : 'Details'}
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
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
