import TaskCard from './TaskCard';
import TaskSkeleton from './TaskSkeleton';

function TaskList({
  tasks,
  loading,
  onToggle,
  onDelete,
  onUpdate,
  isOwner,
  currentUsername,
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {/* Show 5 skeletons while loading */}
        {[...Array(5)].map((_, i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 px-4 py-16 text-center transition-colors hover:border-zinc-700">
        <div className="text-5xl mb-4 opacity-50 grayscale">📋</div>

        <p className="mb-2 text-xl font-bold text-zinc-400">No tasks found</p>

        <p className="mx-auto max-w-sm text-sm text-zinc-600">
          Your backlog is clear. Create a new task above or adjust your filters
          to see more history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          isOwner={isOwner}
          currentUsername={currentUsername}
        />
      ))}
    </div>
  );
}

export default TaskList;
