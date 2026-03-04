import { THEME } from '../../styles/theme'; // Import centralized theme

function TaskForm({ formData, onFormChange, onAddTask }) {
  return (
    <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 shadow-sm md:p-5">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <span className="text-emerald-500">::</span> Create New Task
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={THEME.label}>Task Title</label>
          <input
            type="text"
            placeholder="e.g. Deploy to Production"
            value={formData.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddTask()}
            className={THEME.input}
          />
        </div>

        <div>
          <label className={THEME.label}>Priority Level</label>
          <select
            value={formData.priority}
            onChange={(e) => onFormChange('priority', e.target.value)}
            className={THEME.input}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className={THEME.label}>Due Date</label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => onFormChange('due_date', e.target.value)}
            className={THEME.input}
          />
        </div>

        <div className="md:col-span-2">
          <label className={THEME.label}>Tags</label>
          <input
            type="text"
            placeholder="work, urgent, frontend..."
            value={formData.tags}
            onChange={(e) => onFormChange('tags', e.target.value)}
            className={THEME.input}
          />
        </div>

        <div className="md:col-span-2">
          <label className={THEME.label}>Description</label>
          <textarea
            placeholder="Add extra details..."
            value={formData.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            rows={3}
            className={`${THEME.input} resize-y min-h-20`}
          />
        </div>

        <div className="mt-1 md:col-span-2">
          <button onClick={onAddTask} className={`${THEME.button.primary} w-full md:w-auto`}>
            + Add Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskForm;
