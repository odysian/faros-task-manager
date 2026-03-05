export const PRIORITY_CONFIG = {
  high: {
    label: 'HIGH',
    class: 'text-orange-400 bg-orange-950/30 border-orange-900/50',
  },
  medium: {
    label: 'MED',
    class: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/50',
  },
  low: {
    label: 'LOW',
    class: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50',
  },
};

export function getActivityIcon(action, resourceType) {
  if (resourceType === 'task') {
    switch (action) {
      case 'created':
        return { icon: 'CirclePlus', color: 'text-emerald-400' };
      case 'updated':
        return { icon: 'Pencil', color: 'text-blue-400' };
      case 'deleted':
        return { icon: 'Trash2', color: 'text-red-400' };
      case 'shared':
        return { icon: 'UserPlus', color: 'text-purple-400' };
      case 'unshared':
        return { icon: 'UserMinus', color: 'text-zinc-500' };
      default:
        return { icon: 'Circle', color: 'text-zinc-500' };
    }
  }

  if (resourceType === 'comment') {
    return { icon: 'MessageSquare', color: 'text-amber-400' };
  }

  if (resourceType === 'file') {
    return action === 'uploaded'
      ? { icon: 'Upload', color: 'text-blue-400' }
      : { icon: 'Trash2', color: 'text-red-400' };
  }

  return { icon: 'Circle', color: 'text-zinc-500' };
}

// Segment types: 'user', 'task', 'text', 'field', 'comment'
function seg(text, type = 'text') {
  return { text, type };
}

export function formatActivityDescription(activity) {
  const { action, resource_type, details, username } = activity;
  const user = seg(username, 'user');

  if (resource_type === 'task') {
    const taskName = details?.task_title || details?.title;
    switch (action) {
      case 'created':
        return taskName
          ? [user, seg(' created task '), seg(taskName, 'task')]
          : [user, seg(' created a task')];
      case 'updated':
        if (details?.changed_fields) {
          const fields = seg(details.changed_fields.join(', '), 'field');
          return taskName
            ? [user, seg(' updated '), fields, seg(' on '), seg(taskName, 'task')]
            : [user, seg(' updated '), fields];
        }
        return taskName
          ? [user, seg(' updated task '), seg(taskName, 'task')]
          : [user, seg(' updated a task')];
      case 'deleted':
        return taskName
          ? [user, seg(' deleted task '), seg(taskName, 'task')]
          : [user, seg(' deleted a task')];
      case 'shared':
        return taskName
          ? [
              user,
              seg(' shared '),
              seg(taskName, 'task'),
              seg(' with '),
              seg(details?.shared_with_username, 'user'),
              seg(` (${details?.permission})`),
            ]
          : [
              user,
              seg(' shared a task with '),
              seg(details?.shared_with_username, 'user'),
              seg(` (${details?.permission})`),
            ];
      case 'unshared':
        return taskName
          ? [
              user,
              seg(' removed '),
              seg(details?.unshared_username, 'user'),
              seg("'s access on "),
              seg(taskName, 'task'),
            ]
          : [
              user,
              seg(' removed '),
              seg(details?.unshared_username, 'user'),
              seg("'s access"),
            ];
      default:
        return [user, seg(` ${action} task`)];
    }
  }

  if (resource_type === 'comment') {
    const taskName = details?.task_title;
    const preview = details?.content_preview;
    switch (action) {
      case 'created':
        if (preview) {
          return taskName
            ? [
                user,
                seg(' commented on '),
                seg(taskName, 'task'),
                seg(': '),
                seg(`"${preview}"`, 'comment'),
              ]
            : [user, seg(' commented: '), seg(`"${preview}"`, 'comment')];
        }
        return taskName
          ? [user, seg(' added a comment on '), seg(taskName, 'task')]
          : [user, seg(' added a comment')];
      case 'updated':
        return taskName
          ? [user, seg(' edited a comment on '), seg(taskName, 'task')]
          : [user, seg(' edited a comment')];
      case 'deleted':
        return taskName
          ? [user, seg(' deleted a comment on '), seg(taskName, 'task')]
          : [user, seg(' deleted a comment')];
      default:
        return [user, seg(` ${action} comment`)];
    }
  }

  if (resource_type === 'file') {
    const filename = details?.filename || 'a file';
    switch (action) {
      case 'uploaded':
        return [user, seg(` uploaded ${filename}`)];
      case 'deleted':
        return [user, seg(` deleted ${filename}`)];
      default:
        return [user, seg(` ${action} file`)];
    }
  }

  return [user, seg(` ${action} ${resource_type}`)];
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';

  const safeTimestamp =
    timestamp.endsWith('Z') || timestamp.includes('+')
      ? timestamp
      : `${timestamp}Z`;

  const date = new Date(safeTimestamp);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();

  const diffSeconds = Math.floor(Math.max(0, diffMs) / 1000);
  const diffMins = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return (
    date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' ' +
    date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}
