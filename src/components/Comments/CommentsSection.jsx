import { Loader2, MessageSquareOff } from 'lucide-react';
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
    <div className="mt-6 pt-6 border-t border-zinc-800/50">
      <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
        Discussion ({comments.length})
      </h4>

      <div className="mb-6">
        <CommentForm onSubmit={handleAddComment} />
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-red-400 text-xs text-center py-2">{error}</div>
      )}

      {!loading && comments.length === 0 && !error && (
        <div className="text-center py-8 text-zinc-600 flex flex-col items-center">
          <MessageSquareOff className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">No comments yet. Start the conversation!</p>
        </div>
      )}

      <div className="space-y-4">
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
