import ShareItem from './ShareItem';

function ShareList({ shares, onUpdate, onRevoke, isOwner = true }) {
  if (shares.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-xl">
        <p className="text-zinc-600 text-sm">Not shared with anyone yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
      {shares.map((share) => (
        <ShareItem
          key={share.id || share.user_id}
          share={share}
          onUpdate={onUpdate}
          onRevoke={onRevoke}
          isOwner={isOwner}
        />
      ))}
    </div>
  );
}

export default ShareList;
