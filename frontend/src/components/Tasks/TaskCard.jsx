import { ChevronDown, Pencil, Trash2, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { formatRelativeTime } from '../../utils/activityHelpers';
import ActivityTimeline from '../Activity/ActivityTimeline';
import CommentsSection from '../Comments/CommentsSection';
import ConfirmModal from '../Common/ConfirmModal';
import FilesSection from '../Files/FilesSection';
import ShareModal from '../Sharing/ShareModal';

function TaskCard({ task, onToggle, onDelete, onUpdate, isOwner = true }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCount, setShareCount] = useState(task.share_count || 0);

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [descNeedsCollapse, setDescNeedsCollapse] = useState(false);
  const descriptionRef = useRef(null);
  const [, setTick] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
  };

  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    tags: task.tags ? task.tags.join(', ') : '',
  });

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setShareCount(task.share_count || 0);
  }, [task.share_count]);

  useEffect(() => {
    if (descriptionRef.current && isExpanded) {
      const isOverflowing =
        descriptionRef.current.scrollHeight >
        descriptionRef.current.clientHeight;
      setDescNeedsCollapse(isOverflowing);
    }
  }, [task.description, isExpanded]);

  const canEdit = isOwner || task.my_permission === 'edit';
  const isOverdue =
    task.due_date && !task.completed && new Date(task.due_date) < new Date();

  const styles = {
    header:
      'flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors gap-3',
    checkbox:
      'w-5 h-5 accent-emerald-500 cursor-pointer rounded bg-zinc-900 border-zinc-600 focus:ring-emerald-500 shrink-0',
    detailsContainer:
      'px-4 md:pl-14 md:pr-6 pb-2 pt-0 text-sm animate-in slide-in-from-top-2 duration-200',
    detailsGrid:
      'pt-3 border-t border-zinc-800/50 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8',
    label: 'text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1',
    deleteBtn:
      'cursor-pointer p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all',
    badge:
      'px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border shrink-0',
  };

  const priorityConfig = {
    high: {
      label: 'HIGH',
      class: 'text-orange-400 bg-orange-950/30 border-orange-900/50',
    },
    medium: {
      label: 'MED',
      class: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/50',
    },
    low: {
      label: 'LOW',
      class: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50',
    },
  };

  const currentPriority =
    priorityConfig[task.priority] || priorityConfig.medium;

  const containerClass = task.completed
    ? 'group bg-emerald-950/10 border border-emerald-500/10 rounded-lg overflow-hidden transition-all shadow-sm opacity-60 hover:opacity-100'
    : 'group bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-all hover:border-emerald-500/50 shadow-sm';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const safeDate = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const date = new Date(safeDate);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
  };

  const handleSave = () => {
    const tagArray = editForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    onUpdate(task.id, {
      ...editForm,
      tags: tagArray,
      due_date: editForm.due_date || null,
    });
    toast.success('Changes saved');

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

  if (isEditing) {
    return (
      <div className="group bg-zinc-900 border border-emerald-500/50 rounded-lg overflow-hidden p-4">
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

  return (
    <div className={containerClass}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={task.completed}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggle(task.id, task.completed)}
            className={styles.checkbox}
          />

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                title={formatDate(task.created_at)}
                className={`font-medium transition-all min-w-0 ${
                  isExpanded ? 'wrap-break-word' : 'truncate'
                } ${
                  task.completed
                    ? 'line-through text-zinc-600'
                    : 'text-zinc-100 group-hover:text-white'
                }`}
              >
                {task.title}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`${styles.badge} ${currentPriority.class}`}>
                {currentPriority.label}
              </span>

              {isOverdue && (
                <span
                  className={`${styles.badge} text-red-400 bg-red-950/50 border border-red-900/50`}
                >
                  OVERDUE
                </span>
              )}

              {task.tags &&
                task.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs text-zinc-500 truncate max-w-25"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="flex items-center gap-1.5 p-2 rounded hover:bg-zinc-800 transition-colors group/share"
              title="Manage sharing"
            >
              <Users
                size={16}
                className={
                  shareCount > 0
                    ? 'text-emerald-400'
                    : 'text-zinc-600 group-hover/share:text-zinc-400'
                }
              />
              {shareCount > 0 && (
                <span className="text-xs font-bold text-zinc-400 group-hover/share:text-zinc-200 hidden sm:inline">
                  {shareCount}
                </span>
              )}
            </button>
          )}

          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-2 rounded-lg transition-all text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950/30 cursor-pointer"
              title={isOwner ? 'Edit Task' : 'Edit Task (Collaborator)'}
            >
              <Pencil size={16} />
            </button>
          )}

          {isOwner && (
            <button
              onClick={handleDeleteClick}
              className={styles.deleteBtn}
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
          )}

          <span
            className="text-zinc-600 text-xs transition-transform duration-200 ml-1"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <ChevronDown size={16} />
          </span>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Task?"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {isExpanded && (
        <div className={styles.detailsContainer}>
          <div className={styles.detailsGrid}>
            <div>
              <p className={styles.label}>Description</p>
              <div className="relative">
                <p
                  ref={descriptionRef}
                  className={`text-zinc-300 whitespace-pre-wrap leading-tight wrap-break-word ${
                    !isDescExpanded ? 'line-clamp-3' : ''
                  }`}
                >
                  {task.description || 'No description provided.'}
                </p>
                {(descNeedsCollapse || isDescExpanded) && (
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-[10px] font-bold text-emerald-500/70 hover:text-emerald-400 mt-1 uppercase tracking-wider block"
                  >
                    {isDescExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-6">
                <div>
                  <p className={styles.label}>Created</p>
                  <p
                    className="text-zinc-400 font-mono text-xs"
                    title={formatDate(task.created_at)}
                  >
                    {formatRelativeTime(task.created_at)}
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
                        isOverdue
                          ? 'text-red-400 font-bold'
                          : 'text-emerald-400'
                      }`}
                    >
                      {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {!isOwner && task.owner_username && (
                <div>
                  <p className={styles.label}>Owner</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 shrink-0 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                      <span className="text-[10px] text-emerald-400 font-bold leading-none select-none">
                        {task.owner_username[0].toUpperCase()}
                      </span>
                    </div>
                    <p className="text-emerald-400 font-medium text-xs truncate">
                      @{task.owner_username}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <CommentsSection taskId={task.id} isTaskOwner={isOwner} />
          <FilesSection
            taskId={task.id}
            isExpanded={isExpanded}
            canUpload={canEdit}
            canDelete={canEdit}
          />
          <ActivityTimeline taskId={task.id} isExpanded={isExpanded} />
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
