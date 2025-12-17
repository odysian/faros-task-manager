import { ChevronDown, Pencil, Trash2, Users } from 'lucide-react'; // <--- NEW IMPORTS
import { useEffect, useState } from 'react';
import CommentsSection from './CommentsSection';
import ShareModal from './ShareModal';

function TaskCard({ task, onToggle, onDelete, onUpdate, isOwner = true }) {
  // Tracks if the card details are visible
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // --- LIVE SHARE COUNT ---
  const [shareCount, setShareCount] = useState(task.share_count || 0);

  // Sync state if the parent data changes (e.g. page refresh)
  useEffect(() => {
    setShareCount(task.share_count || 0);
  }, [task.share_count]);
  // -------------------------------

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

  const isOverdue =
    task.due_date && !task.completed && new Date(task.due_date) < new Date();

  const styles = {
    header:
      'flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors',
    checkbox:
      'w-5 h-5 accent-emerald-500 cursor-pointer rounded bg-zinc-800 border-zinc-600 focus:ring-emerald-500',
    detailsContainer:
      'px-14 pb-4 pt-0 text-sm animate-in slide-in-from-top-2 duration-200',
    detailsGrid:
      'pt-4 border-t border-zinc-800/50 grid grid-cols-1 md:grid-cols-2 gap-4',
    label: 'text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1',
    deleteBtn:
      'cursor-pointer p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100',
  };

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
    onUpdate(task.id, { ...editForm, tags: tagArray });
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
    ? 'group bg-emerald-950/10 border border-emerald-500/10 rounded-lg overflow-hidden transition-all shadow-sm opacity-60 hover:opacity-100'
    : 'group bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-all hover:border-emerald-500/50 shadow-sm';

  // --- RENDER: EDIT MODE ---
  if (isEditing) {
    return (
      <div className={`${styles.card} p-4 border-emerald-500/50`}>
        <div className="space-y-3">
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
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
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
              {isOverdue && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-red-400 bg-red-950/50 border border-red-900/50 rounded uppercase tracking-wider">
                  Overdue
                </span>
              )}
            </div>
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

        <div className="flex items-center gap-4">
          {/* Share Button */}
          {(isOwner || !isOwner) && isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-800 transition-colors group/share"
              title="Manage sharing"
            >
              <Users
                size={14}
                className={
                  shareCount > 0
                    ? 'text-emerald-400'
                    : 'text-zinc-600 group-hover/share:text-zinc-400'
                }
              />
              {shareCount > 0 && (
                <span className="text-xs font-bold text-zinc-400 group-hover/share:text-zinc-200">
                  {shareCount}
                </span>
              )}
            </button>
          )}

          <span
            className={`w-20 text-center shrink-0 block py-1 text-xs font-bold uppercase rounded border-l-4 shadow-sm ${
              priorityColors[task.priority] || priorityColors.medium
            }`}
          >
            {task.priority}
          </span>

          {/* EDIT BUTTON (Logic: Show if Owner OR Shared) */}
          {(isOwner || !isOwner) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // GUARD: Prevent action if View Only
                if (!isOwner && task.my_permission !== 'edit') return;
                setIsEditing(true);
              }}
              // DISABLE LOGIC: Grey out if guest AND View Only
              disabled={!isOwner && task.my_permission !== 'edit'}
              className={`
                p-2 rounded-lg transition-all 
                ${
                  !isOwner && task.my_permission !== 'edit'
                    ? 'text-zinc-600 cursor-not-allowed' // Disabled Style
                    : 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer' // Active Style
                }
              `}
              title={
                isOwner
                  ? 'Edit Task'
                  : task.my_permission === 'edit'
                  ? 'Edit Task (Collaborator)'
                  : 'View Only (No Edit Access)'
              }
            >
              {/* --- NEW: Lucide Pencil Icon --- */}
              <Pencil size={16} />
            </button>
          )}

          {/* FIX 4: Only Owners can Delete */}
          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className={styles.deleteBtn}
              title="Delete Task"
            >
              {/* --- NEW: Lucide Trash2 Icon --- */}
              <Trash2 size={16} />
            </button>
          )}

          {/* Expand Arrow */}
          <span
            className="text-zinc-600 text-xs transition-transform duration-200 ml-1"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            {/* --- NEW: Lucide ChevronDown Icon --- */}
            <ChevronDown size={16} />
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.detailsContainer}>
          <div className={styles.detailsGrid}>
            <div className="md:col-span-2">
              <p className={styles.label}>Description</p>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {task.description || 'No description provided.'}
              </p>
            </div>
            <div>
              <p className={styles.label}>Created</p>
              <p className="text-zinc-400 font-mono text-xs">
                {formatDate(task.created_at)}
              </p>
            </div>
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
          <CommentsSection taskId={task.id} />
        </div>
      )}

      {showShareModal && (
        <ShareModal
          taskId={task.id}
          onClose={() => setShowShareModal(false)}
          onCountChange={(newCount) => setShareCount(newCount)}
        />
      )}
    </div>
  );
}

export default TaskCard;
