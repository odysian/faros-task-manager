import { Upload } from 'lucide-react';
import { useState } from 'react';

function FileUploadZone({ onUpload, uploading, uploadProgress }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg transition-all
        ${
          isDragging
            ? 'border-emerald-500 bg-emerald-950/20'
            : 'border-zinc-800 hover:border-zinc-700'
        }
        ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        /* MOBILE: Compact padding | DESKTOP: Slightly more space */
        p-2 md:p-4 text-center
      `}
    >
      <input
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      {/* ICON & TEXT: Flex row on mobile (button style), Flex col on desktop */}
      <div className="flex flex-row md:flex-col items-center justify-center gap-2 md:gap-1">
        <Upload
          className={`${
            isDragging ? 'text-emerald-400' : 'text-zinc-600'
          } w-4 h-4 md:w-6 md:h-6`}
        />

        <p className="text-xs md:text-sm text-zinc-400 font-medium">
          {uploading ? (
            'Uploading...'
          ) : (
            <>
              <span className="md:hidden">Attach file</span>
              <span className="hidden md:inline">
                Drop file or click to browse
              </span>
            </>
          )}
        </p>

        {/* Info text hidden on mobile to save height */}
        <p className="hidden md:block text-[10px] text-zinc-600">
          Max 10MB • Images, PDFs, Docs
        </p>
      </div>

      {uploading && uploadProgress > 0 && (
        <div className="mt-2 px-4">
          <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploadZone;
