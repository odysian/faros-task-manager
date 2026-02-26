import TaskCard from './TaskCard';
import TaskSkeleton from './TaskSkeleton';

function TaskList({ tasks, loading, onToggle, onDelete, onUpdate, isOwner }) {
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
      <div className="text-center py-16 px-4 bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
        <div className="text-5xl mb-4 opacity-50 grayscale">📋</div>

        <p className="text-xl font-bold text-zinc-400 mb-2">No tasks found</p>

        <p className="text-zinc-600 max-w-sm mx-auto text-sm">
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
        />
      ))}
    </div>
  );
}

export default TaskList;
