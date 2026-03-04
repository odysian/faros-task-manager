import { Loader2, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { taskService } from '../../services/taskService';
import { THEME } from '../../styles/theme';
import UserSearch from '../Common/UserSearch';
import ShareList from './ShareList';

function ShareModal({ taskId, onClose, onCountChange }) {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!loading && onCountChange) {
      onCountChange(shares.length);
    }
  }, [shares, loading, onCountChange]);

  useEffect(() => {
    const fetchShares = async () => {
      try {
        const response = await taskService.getShares(taskId);
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.shares || [];
        setShares(data);
      } catch (err) {
        console.error('Failed to load shares:', err);
        toast.error('Could not load access list');
      } finally {
        setLoading(false);
      }
    };
    fetchShares();
  }, [taskId]);

  const handleShare = async (user, permission) => {
    if (shares.some((s) => s.shared_with_username === user.username)) {
      toast.error(`${user.username} already has access`);
      return;
    }

    try {
      const response = await taskService.shareTask(taskId, {
        shared_with_username: user.username,
        permission,
      });
      setShares((prev) => [...prev, response.data]);
      toast.success(`Shared with ${user.username}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to share task');
    }
  };

  const handleRevoke = async (username) => {
    try {
      await taskService.revokeShare(taskId, username);
      setShares((prev) =>
        prev.filter((s) => s.shared_with_username !== username)
      );
      toast.success(`Removed access for ${username}`);
    } catch {
      toast.error('Failed to revoke access');
    }
  };

  const handleUpdate = async (username, newPermission) => {
    try {
      await taskService.updateShare(taskId, username, {
        permission: newPermission,
      });
      setShares((prev) =>
        prev.map((share) =>
          share.shared_with_username === username
            ? { ...share, permission: newPermission }
            : share
        )
      );
      toast.success(`Updated permissions for ${username}`);
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update permission');
    }
  };

  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/95 shadow-2xl"
        onClick={handleModalClick}
        role="dialog"
        aria-modal="true"
        aria-label="Share task"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <div className="flex items-center gap-2">
            <Users className="text-emerald-500" size={20} />
            <div>
              <h3 className="text-base font-bold text-white">Share Task</h3>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Collaboration access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={THEME.button.ghost}
            aria-label="Close share dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Add People
            </label>
            <UserSearch onSelect={(user) => handleShare(user, 'view')} />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
              People with Access
            </label>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={24} className="text-emerald-500 animate-spin" />
              </div>
            ) : (
              <ShareList
                shares={shares}
                onRevoke={handleRevoke}
                onUpdate={handleUpdate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
