import { Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';
import ShareList from './ShareList';
import UserSearch from './UserSearch';

function ShareModal({ taskId, onClose, onCountChange }) {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // SYNC COUNT
  useEffect(() => {
    if (!loading && onCountChange) {
      onCountChange(shares.length);
    }
  }, [shares, loading, onCountChange]);

  // FETCH
  useEffect(() => {
    const fetchShares = async () => {
      try {
        const response = await api.get(`/tasks/${taskId}/shares`);

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.shares || [];
        setShares(data);
      } catch (err) {
        console.error('Failed to load shares:', err);
        setError('Could not load access list');
      } finally {
        setLoading(false);
      }
    };
    fetchShares();
  }, [taskId]);

  const handleShare = async (user, permission) => {
    setError('');
    try {
      const response = await api.post(`/tasks/${taskId}/share`, {
        shared_with_username: user.username,
        permission,
      });
      // Add to list (Triggering the count sync effect above)
      setShares((prev) => [...prev, response.data]);
      setSuccess(`Shared with ${user.username}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to share');
    }
  };

  const handleRevoke = async (username) => {
    try {
      await api.delete(`/tasks/${taskId}/share/${username}`);
      // Remove from list (Triggering the count sync effect above)
      setShares((prev) =>
        prev.filter((s) => s.shared_with_username !== username)
      );
    } catch (err) {
      setError('Failed to revoke access');
    }
  };

  const handleUpdate = async (username, newPermission) => {
    try {
      await api.put(`/tasks/${taskId}/share/${username}`, {
        permission: newPermission,
      });
      setShares((prev) =>
        prev.map((share) =>
          share.shared_with_username === username
            ? { ...share, permission: newPermission }
            : share
        )
      );
    } catch (err) {
      console.error('Update failed:', err);
      setError('Failed to update permission');
    }
  };

  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={handleModalClick}
      >
        {/* ... Header ... */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Users className="text-emerald-500" size={20} />
            <h3 className="font-bold text-white">Share Task</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ... Content ... */}
        <div className="p-4 space-y-6">
          {error && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded text-emerald-400 text-sm">
              {success}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
              Add People
            </label>
            <UserSearch onSelect={(user) => handleShare(user, 'view')} />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
              People with Access
            </label>
            {loading ? (
              <div className="flex justify-center py-4">
                <span className="w-5 h-5 border-2 border-zinc-600 border-t-emerald-500 rounded-full animate-spin"></span>
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
