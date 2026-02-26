import { Send } from 'lucide-react';
import { useState } from 'react';

function CommentForm({
  onSubmit,
  initialValue = '',
  isEditing = false,
  onCancel,
}) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(content);
      setContent('');

      if (isEditing && onCancel) onCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseClasses =
    'w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-zinc-600 resize-none';

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isEditing ? 'Update...' : 'Add a comment...'}
        rows={1}
        className={`${baseClasses} ${isEditing ? 'min-h-9.5' : 'min-h-9.5'}`}
        disabled={isSubmitting}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />

      <div className="flex gap-1 shrink-0">
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3 h-9.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 h-9.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all"
        >
          {isSubmitting ? (
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{isEditing ? 'Save' : <Send size={14} />}</>
          )}
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
