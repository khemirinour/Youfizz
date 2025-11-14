'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  onRemove: (imageUrl: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function ImageGallery({
  images,
  onRemove,
  disabled = false,
  className,
}: ImageGalleryProps) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (imageUrl: string) => {
    if (disabled || removing) return;

    try {
      setRemoving(imageUrl);
      setError(null);
      await onRemove(imageUrl);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to remove image');
    } finally {
      setRemoving(null);
    }
  };

  if (images.length === 0) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label>Images</Label>
        <Card className="p-8 border-dashed">
          <div className="flex flex-col items-center justify-center text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No images uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload images to display them here</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>Images ({images.length})</Label>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((imageUrl, index) => (
          <Card key={index} className="relative group overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={imageUrl}
                alt={`Article image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-colors" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(imageUrl)}
                disabled={disabled || removing === imageUrl}
              >
                {removing === imageUrl ? (
                  <div className="h-4 w-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

