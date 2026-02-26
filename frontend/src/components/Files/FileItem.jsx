import {
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

function FileItem({ file, onDelete, onDownload, canDelete }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    const filename = file.original_filename.toLowerCase();

    if (filename.match(/\.(jpg|jpeg|png|gif)$/)) {
      return <ImageIcon size={16} className="text-blue-400" />;
    }
    if (filename.match(/\.(pdf|doc|docx|txt)$/)) {
      return <FileText size={16} className="text-red-400" />;
    }
    if (filename.match(/\.(csv|xlsx)$/)) {
      return <FileSpreadsheet size={16} className="text-green-400" />;
    }
    return <FileText size={16} className="text-zinc-400" />;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await onDownload(file.id, file.original_filename);
    setIsDownloading(false);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="shrink-0">{getFileIcon()}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white truncate">
            {file.original_filename}
          </p>
          <p className="text-xs text-zinc-600">
            {formatFileSize(file.file_size)} •{' '}
            {new Date(file.uploaded_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-950/30 rounded transition-all disabled:opacity-50"
          title="Download"
        >
          <Download size={14} />
        </button>

        {canDelete && (
          <button
            onClick={() => onDelete(file.id)}
            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-all opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default FileItem;
