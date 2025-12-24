import { AlertTriangle } from 'lucide-react';

function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Delete',
  isDanger = true,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`p-3 rounded-full ${
              isDanger
                ? 'bg-red-500/10 text-red-500'
                : 'bg-emerald-500/10 text-emerald-500'
            }`}
          >
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>

        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-lg ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
