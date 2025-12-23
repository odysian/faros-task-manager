import { Pencil, Trash2, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatRelativeTime } from '../../utils/activityHelpers';
import CommentForm from './CommentForm';

function CommentItem({ comment, onDelete, onUpdate, isTaskOwner }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const contentRef = useRef(null);
  const [, setTick] = useState(0);

  const currentUser = localStorage.getItem('username') || '';

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      const isOverflowing =
        contentRef.current.scrollHeight > contentRef.current.clientHeight;
      setNeedsCollapse(isOverflowing);
    }
  }, [comment.content, isEditing]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isCommentAuthor = currentUser && comment.username === currentUser;
  const canEdit = isCommentAuthor;
  const canDelete = isCommentAuthor || isTaskOwner;

  if (isEditing) {
    return (
      <div className="mb-2">
        <CommentForm
          initialValue={comment.content}
          isEditing={true}
          onCancel={() => setIsEditing(false)}
          onSubmit={(newContent) => {
            onUpdate(comment.id, newContent);
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="group flex gap-3 p-2 rounded-lg hover:bg-zinc-900/50 transition-colors">
      <div className="shrink-0 mt-1">
        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
          <User size={12} className="text-zinc-400" />
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400">
              {comment.username || 'Unknown'}
            </span>
            <span
              className="text-[10px] text-zinc-500"
              title={new Date(comment.created_at).toLocaleString()}
            >
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>

          <div className="flex items-center gap-4 transition-opacity">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-zinc-500 hover:text-emerald-400 active:text-emerald-400 transition-colors"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1.5 text-zinc-500 hover:text-red-400 active:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <div
            ref={contentRef}
            className={`text-sm text-zinc-300 whitespace-pre-wrap wrap-break-word ${
              !isExpanded ? 'line-clamp-3' : ''
            }`}
          >
            {comment.content}
          </div>

          {(needsCollapse || isExpanded) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] font-bold text-emerald-500/70 hover:text-emerald-400 mt-1 uppercase tracking-wider block"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentItem;
