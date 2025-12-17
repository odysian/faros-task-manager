import { Pencil, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import CommentForm from './CommentForm';

function CommentItem({ comment, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);

  const currentUser = localStorage.getItem('username');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isOwner = currentUser && comment.username === currentUser;

  // LOGIC: If editing, return the Form instead of the normal display
  if (isEditing) {
    return (
      <div className="mb-4">
        <CommentForm
          initialValue={comment.content} // Pre-fill with existing text
          isEditing={true} // Tell form to show "Save" button
          onCancel={() => setIsEditing(false)} // Let user cancel
          onSubmit={(newContent) => {
            onUpdate(comment.id, newContent); // Call parent update function
            setIsEditing(false); // Switch back to view mode
          }}
        />
      </div>
    );
  }

  return (
    <div className="group flex gap-3 p-3 rounded-lg hover:bg-zinc-900/50 transition-colors">
      {/* 1. Avatar (Left) */}
      <div className="shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
          <User size={14} className="text-zinc-400" />
        </div>
      </div>

      {/* 2. Content Body (Right) */}
      <div className="flex-1 space-y-1">
        {/* Header Row: Username + Date + Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400">
              {comment.username || 'Unknown'}
            </span>
            <span className="text-[10px] text-zinc-500">
              {formatDate(comment.created_at)}
            </span>
          </div>

          {/* Action Buttons: Only show on hover (group-hover) */}
          {isOwner && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-zinc-500 hover:text-emerald-400"
                title="Edit"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1.5 text-zinc-500 hover:text-red-400"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>

        {/* The Actual Comment Text */}
        <div className="text-sm text-zinc-300 whitespace-pre-wrap">
          {comment.content}
        </div>
      </div>
    </div>
  );
}

export default CommentItem;
