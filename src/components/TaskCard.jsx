import { useState } from 'react';

function TaskCard({ task, onToggle, onDelete, onUpdate }) {
  // Tracks if the card details are visible
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';

    const safeDateString = dateString.endsWith('Z')
      ? dateString
      : dateString + 'Z';

    const date = new Date(safeDateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    tags: task.tags ? task.tags.join(', ') : '',
  });

  // Check if task is overdue
  const isOverdue =
    task.due_date && !task.completed && new Date(task.due_date) < new Date();

  // Styles
  const styles = {
    // Main clickable row
    header:
      'flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors',

    checkbox:
      'w-5 h-5 accent-emerald-500 cursor-pointer rounded bg-zinc-800 border-zinc-600 focus:ring-emerald-500',

    // Hidden details section
    detailsContainer:
      'px-14 pb-4 pt-0 text-sm animate-in slide-in-from-top-2 duration-200',
    detailsGrid:
      'pt-4 border-t border-zinc-800/50 grid grid-cols-1 md:grid-cols-2 gap-4',

    // Text labels
    label: 'text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1',

    // Delete button (hidden until hover)
    deleteBtn:
      'cursor-pointer p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100',
  };

  // Colors for Priority Badges
  const priorityColors = {
    high: 'border-l-red-500 text-red-400 bg-red-950/30',
    medium: 'border-l-yellow-500 text-yellow-400 bg-yellow-950/30',
    low: 'border-l-emerald-500 text-emerald-400 bg-emerald-950/30',
  };

  const handleSave = () => {
    const tagArray = editForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    onUpdate(task.id, {
      ...editForm,
      tags: tagArray,
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      tags: task.tags ? task.tags.join(', ') : '',
    });
    setIsEditing(false);
  };

  const containerClass = task.completed
    ? 'group bg-emerald-950/10 border border-emerald-500/10 rounded-lg overflow-hidden transition-all shadow-sm opacity-60 hover:opacity-100' // Completed Style
    : 'group bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-all hover:border-emerald-500/50 shadow-sm'; // Active Style

  // --- RENDER: EDIT MODE ---
  if (isEditing) {
    return (
      <div className={`${styles.card} p-4 border-emerald-500/50`}>
        <div className="space-y-3">
          {/* Title Input */}
          <div>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority Select */}
            <div>
              <label className={styles.label}>Priority</label>
              <select
                value={editForm.priority}
                onChange={(e) =>
                  setEditForm({ ...editForm, priority: e.target.value })
                }
                className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Due Date Input */}
            <div>
              <label className={styles.label}>Due Date</label>
              <input
                type="date"
                value={editForm.due_date}
                onChange={(e) =>
                  setEditForm({ ...editForm, due_date: e.target.value })
                }
                className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className={styles.label}>Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-emerald-500 focus:outline-none resize-y min-h-20"
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className={styles.label}>Tags (comma separated)</label>
            <input
              type="text"
              value={editForm.tags}
              onChange={(e) =>
                setEditForm({ ...editForm, tags: e.target.value })
              }
              placeholder="dev, urgent, meeting"
              className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors shadow-lg shadow-emerald-900/20"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: VIEW MODE ---
  return (
    <div className={containerClass}>
      {/* HEADER ROW (Click to Expand) */}
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        {/* Left Side: Checkbox + Title */}
        <div className="flex items-center gap-4 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            // Stop click from bubbling to parent div (prevents expanding)
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggle(task.id, task.completed)}
            className={styles.checkbox}
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className={`font-medium transition-all ${
                  task.completed
                    ? 'line-through text-zinc-600'
                    : 'text-zinc-100 group-hover:text-white'
                }`}
              >
                {task.title}
              </span>

              {/* Overdue Badge */}
              {isOverdue && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-red-400 bg-red-950/50 border border-red-900/50 rounded uppercase tracking-wider">
                  Overdue
                </span>
              )}
            </div>

            {/* Tags */}
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

        {/* Right Side: Priority + Expand Icon + Delete */}
        <div className="flex items-center gap-4">
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

          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950/30 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
            title="Edit Task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
              />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className={styles.deleteBtn}
            title="Delete Task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>

          {/* Expand Arrow */}
          <span
            className="text-zinc-600 text-xs transition-transform duration-200 ml-1"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* EXPANDED DETAILS */}
      {isExpanded && (
        <div className={styles.detailsContainer}>
          <div className={styles.detailsGrid}>
            {/* Description */}
            <div className="md:col-span-2">
              <p className={styles.label}>Description</p>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {task.description || 'No description provided.'}
              </p>
            </div>

            {/* Created Date */}
            <div>
              <p className={styles.label}>Created</p>
              <p className="text-zinc-400 font-mono text-xs">
                {formatDate(task.created_at)}
              </p>
            </div>

            {/* Due Date (Only if exists) */}
            {task.due_date && (
              <div>
                <p
                  className={`${styles.label} ${
                    isOverdue ? 'text-red-500' : ''
                  }`}
                >
                  Due Date
                </p>

                <p
                  className={`font-mono text-xs ${
                    isOverdue ? 'text-red-400 font-bold' : 'text-emerald-400'
                  }`}
                >
                  {new Date(task.due_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCard;
