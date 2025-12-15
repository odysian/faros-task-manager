function TaskCard({ task, onToggle, onDelete }) {
  // Dynamic border color based on priority
  const priorityColors = {
    high: 'border-l-red-500 text-red-400 bg-red-950/30',
    medium: 'border-l-yellow-500 text-yellow-400 bg-yellow-950/30',
    low: 'border-l-emerald-500 text-emerald-400 bg-emerald-950/30',
  };

  return (
    <div className="group flex items-center justify-between p-4 mb-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-emerald-500 transition-all shadow-sm">
      {/* Left Side: Checkbox + Title */}
      <div className="flex items-center gap-4 flex-1">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id, task.completed)}
          className="w-5 h-5 accent-emerald-500 cursor-pointer rounded bg-zinc-800 border-zinc-600 focus:ring-emerald-500"
        />

        <div className="flex flex-col">
          <span
            className={`font-medium transition-all ${
              task.completed
                ? 'line-through text-zinc-600'
                : 'text-zinc-100 group-hover:text-white'
            }`}
          >
            {task.title}
          </span>

          {/* Tags (if any exist) */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-2 mt-1">
              {task.tags.map((tag, i) => (
                <span key={i} className="text-xs text-zinc-500">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Priority Badge + Delete */}
      <div className="flex items-center gap-4">
        {/* Priority Badge */}
        <span
          className={`
            w-20 text-center shrink-0 block          
            py-1 text-xs font-bold uppercase rounded border-l-4 
            shadow-sm                                
            ${priorityColors[task.priority] || priorityColors.medium}
          `}
        >
          {task.priority}
        </span>

        {/* Delete Button (Only shows when hovering the card) */}
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-all opacity-0 group-hover:opacity-100"
          title="Delete Task"
        >
          ✖️
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
