import TaskCard from './TaskCard';

function TaskList({ tasks, loading, onToggle, onDelete, onUpdate }) {
  // LOADING STATE
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        {/* The Spinner: Grey circle with a spinning Green top border */}
        <div className="w-10 h-10 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>

        {/* Pulsing text to indicate activity */}
        <p className="text-zinc-500 text-sm animate-pulse">
          Synchronizing tasks...
        </p>
      </div>
    );
  }

  // EMPTY STATE
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
        {/* The Icon: Desaturated to look like a background watermark */}
        <div className="text-5xl mb-4 opacity-50 grayscale">📋</div>

        <p className="text-xl font-bold text-zinc-400 mb-2">No tasks found</p>

        <p className="text-zinc-600 max-w-sm mx-auto text-sm">
          Your backlog is clear. Create a new task above or adjust your filters
          to see more history.
        </p>
      </div>
    );
  }

  // DATA LIST
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

export default TaskList;
