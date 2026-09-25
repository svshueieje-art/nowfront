// ========================================
// File Upload Component
// ========================================

import { useCallback, useState, type ChangeEvent, type DragEvent } from 'react';
import { clsx } from 'clsx';
import { X, FileImage, AlertCircle } from 'lucide-react';
import { config } from '@/lib/config';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error?: string;
  accept?: readonly string[];
  maxSize?: number;
  label?: string;
}

export function FileUpload({
  onFileSelect,
  selectedFile,
  error,
  accept = config.acceptedImageTypes,
  maxSize = config.maxUploadSize,
  label = 'Upload Payment Proof',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!accept.includes(file.type)) {
        return `Invalid file type. Accepted: ${accept.map((t) => t.split('/')[1]?.toUpperCase()).join(', ')}`;
      }
      if (file.size > maxSize) {
        const maxMb = Math.round(maxSize / (1024 * 1024));
        return `File too large. Maximum size: ${maxMb}MB`;
      }
      return null;
    },
    [accept, maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      if (err) {
        setValidationError(err);
        onFileSelect(null);
        setPreview(null);
        return;
      }
      setValidationError(null);
      onFileSelect(file);

      // Generate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [validateFile, onFileSelect]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    onFileSelect(null);
    setPreview(null);
    setValidationError(null);
  };

  const displayError = error || validationError;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-surface-300">{label}</label>
      )}

      {selectedFile && preview ? (
        <div className="relative rounded-lg border border-surface-700 bg-surface-800 p-3">
          <div className="flex items-start gap-3">
            <img
              src={preview}
              alt="Payment proof preview"
              className="h-20 w-20 rounded-lg object-cover border border-surface-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-surface-500 mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 rounded-md text-surface-400 hover:text-danger-500 hover:bg-surface-700 transition-colors focus-ring"
              aria-label="Remove file"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={clsx(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all duration-200 cursor-pointer',
            isDragging
              ? 'border-brand-500 bg-brand-500/5'
              : displayError
                ? 'border-danger-500/50 bg-danger-500/5'
                : 'border-surface-700 bg-surface-800/50 hover:border-surface-600 hover:bg-surface-800'
          )}
        >
          <input
            type="file"
            onChange={handleChange}
            accept={accept.join(',')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label={label}
          />
          <FileImage className="h-8 w-8 text-surface-500 mb-2" aria-hidden="true" />
          <p className="text-sm font-medium text-surface-300 mb-1">
            <span className="text-brand-500">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-surface-500">
            PNG, JPG, or WebP (max {Math.round(maxSize / (1024 * 1024))}MB)
          </p>
        </div>
      )}

      {displayError && (
        <p className="flex items-center gap-1 text-xs text-danger-500" role="alert">
          <AlertCircle className="h-3 w-3" />
          {displayError}
        </p>
      )}
    </div>
  );
}
