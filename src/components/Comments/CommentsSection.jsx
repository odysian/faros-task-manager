import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import api from '../../api';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

function CommentsSection({ taskId, isTaskOwner }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/tasks/${taskId}/comments`);
      setComments(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError('Failed to load conversation.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (content) => {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { content });
      setComments((prev) => [response.data, ...prev]);
      return true;
    } catch (err) {
      console.error('Failed to post comment:', err);
      throw err;
    }
  };

  const handleDeleteComment = async (commentId) => {
    const previousComments = [...comments];
    setComments(comments.filter((c) => c.id !== commentId));
    try {
      await api.delete(`/comments/${commentId}`);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setComments(previousComments);
      alert('Failed to delete comment');
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      const response = await api.patch(`/comments/${commentId}`, {
        content: newContent,
      });
      setComments(
        comments.map((c) => (c.id === commentId ? response.data : c))
      );
    } catch (err) {
      console.error('Failed to update comment:', err);
      throw err;
    }
  };

  return (
    // REDUCED: mt-6 pt-6 to mt-4 pt-4
    <div className="mt-4 pt-4 border-t border-zinc-800/50">
      {/* REDUCED: mb-4 to mb-2 */}
      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
        Discussion ({comments.length})
      </h4>

      {/* REDUCED: mb-6 to mb-3 */}
      <div className="mb-3">
        <CommentForm onSubmit={handleAddComment} />
      </div>

      {loading && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-red-400 text-[10px] text-center py-1">{error}</div>
      )}

      {!loading && comments.length === 0 && !error && (
        <div className="text-center py-4 text-zinc-600 flex flex-col items-center">
          <p className="text-xs">No comments yet.</p>
        </div>
      )}

      {/* REDUCED: space-y-4 to space-y-2 */}
      <div className="space-y-2">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onDelete={handleDeleteComment}
            onUpdate={handleUpdateComment}
            isTaskOwner={isTaskOwner}
          />
        ))}
      </div>
    </div>
  );
}

export default CommentsSection;
