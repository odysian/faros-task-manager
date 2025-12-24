export function getActivityIcon(action, resourceType) {
  if (resourceType === 'task') {
    switch (action) {
      case 'created':
        return { icon: '🟢', color: 'text-emerald-400' };
      case 'updated':
        return { icon: '✏️', color: 'text-blue-400' };
      case 'deleted':
        return { icon: '🗑️', color: 'text-red-400' };
      case 'shared':
        return { icon: '🔵', color: 'text-purple-400' };
      case 'unshared':
        return { icon: '⚫', color: 'text-zinc-600' };
      default:
        return { icon: '●', color: 'text-zinc-500' };
    }
  }

  if (resourceType === 'comment') {
    return { icon: '💬', color: 'text-amber-400' };
  }

  if (resourceType === 'file') {
    return action === 'uploaded'
      ? { icon: '📎', color: 'text-blue-400' }
      : { icon: '🗑️', color: 'text-red-400' };
  }

  return { icon: '●', color: 'text-zinc-500' };
}

export function formatActivityDescription(activity) {
  const { action, resource_type, details, username } = activity;

  if (resource_type === 'task') {
    switch (action) {
      case 'created':
        return `${username} created task`;
      case 'updated':
        if (details?.changed_fields) {
          return `${username} updated ${details.changed_fields.join(', ')}`;
        }
        return `${username} updated task`;
      case 'deleted':
        return `${username} deleted task`;
      case 'shared':
        return `${username} shared with ${details?.shared_with_username} (${details?.permission})`;
      case 'unshared':
        return `${username} removed ${details?.unshared_username}'s access`;
      default:
        return `${username} ${action} task`;
    }
  }

  if (resource_type === 'comment') {
    switch (action) {
      case 'created':
        return `${username} added a comment`;
      case 'updated':
        return `${username} edited a comment`;
      case 'deleted':
        return `${username} deleted a comment`;
      default:
        return `${username} ${action} comment`;
    }
  }

  if (resource_type === 'file') {
    const filename = details?.filename || 'a file';
    switch (action) {
      case 'uploaded':
        return `${username} uploaded ${filename}`;
      case 'deleted':
        return `${username} deleted ${filename}`;
      default:
        return `${username} ${action} file`;
    }
  }

  return `${username} ${action} ${resource_type}`;
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
