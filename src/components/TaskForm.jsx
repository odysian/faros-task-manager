function TaskForm({ formData, onFormChange, onAddTask }) {
  // Reusing the same "System" styles from Dashboard for consistency
  const inputClasses =
    'w-full p-3 rounded bg-zinc-900 border border-zinc-700 text-white ' +
    'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ' +
    'focus:outline-none transition-all placeholder-zinc-500';

  const labelClasses = 'block text-zinc-400 text-sm font-bold mb-2';

  return (
    <div className="mb-8 p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-emerald-500">::</span> Create New Task
      </h3>

      {/* Grid Layout for Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title (Full Width) */}
        <div className="md:col-span-2">
          <label className={labelClasses}>Task Title</label>
          <input
            type="text"
            placeholder="e.g. Deploy to Production"
            value={formData.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddTask()}
            className={inputClasses}
          />
        </div>

        {/* Priority */}
        <div>
          <label className={labelClasses}>Priority Level</label>
          <select
            value={formData.priority}
            onChange={(e) => onFormChange('priority', e.target.value)}
            className={inputClasses}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className={labelClasses}>Due Date</label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => onFormChange('due_date', e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Tags (Full Width) */}
        <div className="md:col-span-2">
          <label className={labelClasses}>Tags</label>
          <input
            type="text"
            placeholder="work, urgent, frontend..."
            value={formData.tags}
            onChange={(e) => onFormChange('tags', e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Description (Full Width) */}
        <div className="md:col-span-2">
          <label className={labelClasses}>Description</label>
          <textarea
            placeholder="Add extra details..."
            value={formData.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            rows={3}
            className={`${inputClasses} resize-y min-h-20`}
          />
        </div>

        {/* Action Button (Full Width) */}
        <div className="md:col-span-2 mt-2">
          <button
            onClick={onAddTask}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.99]"
          >
            + Add Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskForm;
