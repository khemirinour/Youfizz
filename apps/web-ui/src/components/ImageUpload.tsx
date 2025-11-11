'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const DEFAULT_MAX_SIZE = 10; // 10MB

export function ImageUpload({
  onUpload,
  multiple = false,
  maxFiles = 10,
  maxSizeMB = DEFAULT_MAX_SIZE,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewsRef = useRef<string[]>([]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type not allowed. Allowed types: ${ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }
    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const fileArray = Array.from(files);
    
    // Limit number of files
    const filesToProcess = multiple ? fileArray.slice(0, maxFiles) : [fileArray[0]];
    
    // Validate files
    const validationErrors: string[] = [];
    const validFiles: File[] = [];
    
    filesToProcess.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join('; '));
      return;
    }

    setSelectedFiles(validFiles);
    
    // Create previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    previewsRef.current = newPreviews;
    setPreviews(newPreviews);
  }, [multiple, maxFiles, maxSizeMB]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || uploading) return;
    
    handleFiles(e.dataTransfer.files);
  }, [disabled, uploading, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || uploading) return;
    handleFiles(e.target.files);
  }, [disabled, uploading, handleFiles]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      const newPreviews = prev.filter((_, i) => i !== index);
      previewsRef.current = newPreviews;
      return newPreviews;
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || uploading) return;

    try {
      setUploading(true);
      setError(null);
      await onUpload(selectedFiles);
      
      // Clear after successful upload
      setSelectedFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      previewsRef.current = [];
      setPreviews([]);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, uploading, onUpload, previews]);

  // Cleanup previews on unmount only
  useEffect(() => {
    return () => {
      // Cleanup all preview URLs when component unmounts
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive && 'border-primary bg-primary/5',
          !dragActive && 'border-border',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input
          type="file"
          id="image-upload"
          accept={ALLOWED_TYPES.join(',')}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled || uploading}
          className="hidden"
        />
        <label
          htmlFor="image-upload"
          className={cn(
            'flex flex-col items-center justify-center cursor-pointer',
            (disabled || uploading) && 'cursor-not-allowed',
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-4 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              {ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ').toUpperCase()} (MAX. {maxSizeMB}MB per file)
              {multiple && ` - Up to ${maxFiles} files`}
            </p>
          </div>
        </label>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {error}
        </div>
      )}

      {previews.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Images ({previews.length})</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedFiles[index]?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((selectedFiles[index]?.size || 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </Card>
            ))}
          </div>
          <Button
            onClick={handleUpload}
            disabled={uploading || disabled}
            className="w-full"
          >
            {uploading ? 'Uploading...' : `Upload ${previews.length} Image${previews.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  );
}

