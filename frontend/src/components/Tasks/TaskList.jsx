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
  view,
  hasActiveFilters,
  onOpenCreateTask,
  onClearFilters,
  onSwitchToPersonal,
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
    const isFilteredEmpty = hasActiveFilters;

    return (
      <div className="rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 px-4 py-16 text-center transition-colors hover:border-zinc-700">
        <div className="mb-4 text-5xl opacity-50 grayscale">📋</div>

        <p className="mb-2 text-xl font-bold text-zinc-300">
          {isFilteredEmpty ? 'No matching tasks' : 'No tasks yet'}
        </p>

        <p className="mx-auto max-w-sm text-sm text-zinc-600">
          {isFilteredEmpty
            ? 'Try broadening your filters to see more results.'
            : 'Start your backlog by creating your first task or checking shared work.'}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {isFilteredEmpty ? (
            <>
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white"
              >
                Clear filters
              </button>
              {view === 'shared' && (
                <button
                  type="button"
                  onClick={onSwitchToPersonal}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white"
                >
                  Go to My Tasks
                </button>
              )}
            </>
          ) : (
            <>
              {view === 'personal' && (
                <button
                  type="button"
                  onClick={onOpenCreateTask}
                  className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/20"
                >
                  Create first task
                </button>
              )}
              {view === 'shared' && (
                <button
                  type="button"
                  onClick={onSwitchToPersonal}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white"
                >
                  Go to My Tasks
                </button>
              )}
            </>
          )}
        </div>
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
