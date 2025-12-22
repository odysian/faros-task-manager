import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api';
import FileItem from './FileItem';
import FileUploadZone from './FileUploadZone';

function FilesSection({ taskId, isExpanded, canUpload, canDelete }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isExpanded && files.length === 0) {
      fetchFiles();
    }
  }, [isExpanded, taskId]);

  const fetchFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/tasks/${taskId}/files`);
      setFiles(response.data);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB)');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/tasks/${taskId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });
      setFiles([...files, response.data]);
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await api.get(`/files/${fileId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Download failed');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await api.delete(`/files/${fileId}`);
      setFiles(files.filter((f) => f.id !== fileId));
    } catch (err) {
      setError('Delete failed');
    }
  };

  if (!isExpanded) return null;

  return (
    // REDUCED: mt-4 pt-4 to mt-2 pt-2
    <div className="mt-2 pt-2 border-t border-zinc-800">
      {/* REDUCED: mb-3 to mb-1 */}
      <div className="flex items-center gap-2 mb-1">
        <FileText size={14} className="text-zinc-500" />
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          Attachments ({files.length})
        </h4>
      </div>

      {error && (
        <div className="mb-2 p-1.5 bg-red-950/30 border border-red-900/50 rounded text-red-400 text-[10px]">
          {error}
        </div>
      )}

      {canUpload && (
        <FileUploadZone
          onUpload={handleUpload}
          uploading={uploading}
          uploadProgress={uploadProgress}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-2">
          <div className="w-4 h-4 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      ) : files.length > 0 ? (
        // REDUCED: mt-3 space-y-2 to mt-2 space-y-1
        <div className="mt-2 space-y-1">
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onDownload={handleDownload}
              onDelete={handleDelete}
              canDelete={canDelete}
            />
          ))}
        </div>
      ) : (
        <p className="text-center py-2 text-zinc-600 text-xs">No files</p>
      )}
    </div>
  );
}

export default FilesSection;
