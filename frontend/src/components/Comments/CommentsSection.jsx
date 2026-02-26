import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { taskService } from '../../services/taskService';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

function CommentsSection({ taskId, isTaskOwner }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskService.getComments(taskId);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (content) => {
    try {
      const response = await taskService.addComment(taskId, content);
      setComments((prev) => [response.data, ...prev]);
      toast.success('Comment added');
      return true;
    } catch (err) {
      console.error('Failed to post comment:', err);
      toast.error('Failed to add comment');
      throw err;
    }
  };

  const handleDeleteComment = async (commentId) => {
    const previousComments = [...comments];
    setComments(comments.filter((c) => c.id !== commentId));
    try {
      await taskService.deleteComment(commentId);
      toast.success('Comment deleted');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setComments(previousComments);
      toast.error('Failed to delete comment');
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      const response = await taskService.updateComment(commentId, newContent);
      setComments(
        comments.map((c) => (c.id === commentId ? response.data : c))
      );
      toast.success('Comment updated');
    } catch (err) {
      console.error('Failed to update comment:', err);
      toast.error('Failed to update comment');
      throw err;
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800/50">
      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
        Discussion ({comments.length})
      </h4>

      <div className="mb-3">
        <CommentForm onSubmit={handleAddComment} />
      </div>

      {loading && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="text-center py-4 text-zinc-600 flex flex-col items-center">
          <p className="text-xs">No comments yet.</p>
        </div>
      )}

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
