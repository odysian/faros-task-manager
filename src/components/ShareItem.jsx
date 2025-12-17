import { ChevronDown, User, UserMinus } from 'lucide-react';
import { useState } from 'react';

function ShareItem({ share, onUpdate, onRevoke, isOwner }) {
  const [loading, setLoading] = useState(false);

  // 1. EXTRACT USERNAME
  // The API response uses 'shared_with_username', but 'username' is a safe fallback
  const username = share.shared_with_username || share.username;

  const togglePermission = async () => {
    if (!isOwner) return;

    const newPerm = share.permission === 'view' ? 'edit' : 'view';
    setLoading(true);

    // 2. PASS USERNAME (Not ID) to the update function
    await onUpdate(username, newPerm);

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg group hover:border-zinc-700 transition-colors">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-400">
          <User size={14} />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-200">{username}</p>
          <p className="text-xs text-zinc-500">
            {share.shared_at
              ? new Date(share.shared_at).toLocaleDateString()
              : 'Collaborator'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Permission Toggle */}
        <button
          onClick={togglePermission}
          disabled={loading || !isOwner}
          className={`
            flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border transition-all
            ${
              share.permission === 'edit'
                ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/50'
                : 'bg-blue-950/30 text-blue-400 border-blue-900/50 hover:bg-blue-900/50'
            }
            ${!isOwner && 'cursor-default opacity-80'}
          `}
        >
          {loading ? '...' : share.permission}
          {isOwner && <ChevronDown size={10} className="opacity-50" />}
        </button>

        {/* Revoke Button */}
        {isOwner && (
          <button
            onClick={() => onRevoke(username)} // 3. PASS USERNAME HERE
            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors"
            title="Revoke Access"
          >
            <UserMinus size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default ShareItem;
