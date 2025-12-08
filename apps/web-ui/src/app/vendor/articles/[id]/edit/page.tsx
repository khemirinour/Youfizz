'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import VendorNavbar from '@/components/VendorNavbar';
import { getArticleById, updateArticle, type UpdateArticleDto, activateArticle, deactivateArticle, uploadArticleImage, uploadMultipleArticleImages, removeArticleImage } from '@/lib/articles.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ImageUpload';
import { ImageGallery } from '@/components/ImageGallery';
import type { Article } from '@/lib/articles.api';

const EditArticlePage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated, vendorId } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<UpdateArticleDto>({
    title: '',
    description: '',
    price: '',
    stock: 0,
    sku: '',
    status: 'DRAFT',
    categoryId: '',
  });
  const [makeActive, setMakeActive] = useState(false);

  // Wait for Zustand persist hydration
  useEffect(() => {
    const api = (useAuthStore as any).persist;
    if (api?.hasHydrated?.()) setHydrated(true);
    const unsub = api?.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  // Verify authentication and refresh token if needed
  useEffect(() => {
    if (!hydrated) return;
    
    const verifyAuth = async () => {
      // If we think we're authenticated but tokens might be missing, try to refresh
      if (isAuthenticated && user?.role === 'vendeur' && vendorId) {
        try {
          // Attempt to refresh token to verify we still have valid cookies
          const refreshed = await useAuthStore.getState().refreshToken();
          if (!refreshed) {
            // Refresh failed, redirect to signin
            router.replace('/signin');
          }
        } catch (error) {
          // Refresh failed, redirect to signin
          router.replace('/signin');
        }
      } else {
        // Not authenticated, redirect to signin
        router.replace('/signin');
      }
    };

    verifyAuth();
  }, [hydrated, isAuthenticated, user?.role, vendorId, router]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !params.id) return;
    let cancelled = false;
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await getArticleById(params.id);
        if (!cancelled) {
          setArticle(data);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            price: data.price || '',
            stock: data.stock || 0,
            sku: data.sku || '',
            status: data.status || 'DRAFT',
            categoryId: data.categoryId || '',
          });
          setMakeActive(data.isActive ?? false);
        }
      } catch (e: any) {
        if (!cancelled) {
          toast({
            title: 'Error',
            description: e?.response?.data?.message || e?.message || 'Failed to load article',
            variant: 'destructive',
          });
          router.push('/vendor/articles');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchArticle();
    return () => { cancelled = true; };
  }, [hydrated, isAuthenticated, user?.role, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.id) return;

    try {
      setSubmitting(true);
      const dataToSend: UpdateArticleDto = {
        ...formData,
        stock: formData.stock || 0,
        price: formData.price || '0',
      };
      const updated = await updateArticle(params.id, dataToSend);
      if (makeActive && updated?.id) {
        await activateArticle(updated.id);
      } else if (!makeActive && updated?.id) {
        await deactivateArticle(updated.id);
      }
      toast({ title: 'Success', description: 'Article updated successfully' });
      router.push('/vendor/articles');
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.response?.data?.message || e?.message || 'Failed to update article',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (!params.id || files.length === 0) return;

    try {
      let updated: Article;
      if (files.length === 1) {
        updated = await uploadArticleImage(params.id, files[0]);
      } else {
        updated = await uploadMultipleArticleImages(params.id, files);
      }
      
      // Refresh article data
      setArticle(updated);
      toast({ 
        title: 'Success', 
        description: `${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully` 
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.response?.data?.message || e?.message || 'Failed to upload images',
        variant: 'destructive',
      });
      throw e; // Re-throw to let ImageUpload component handle it
    }
  };

  const handleImageRemove = async (imageUrl: string) => {
    if (!params.id) return;

    try {
      const updated = await removeArticleImage(params.id, imageUrl);
      // Refresh article data
      setArticle(updated);
      toast({ 
        title: 'Success', 
        description: 'Image removed successfully' 
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.response?.data?.message || e?.message || 'Failed to remove image',
        variant: 'destructive',
      });
      throw e; // Re-throw to let ImageGallery component handle it
    }
  };

  if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return null;
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-radial)' }} />
        <VendorNavbar />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }
  if (!article) {
    return (
      <div className="min-h-screen">
        <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-radial)' }} />
        <VendorNavbar />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Article not found</p>
            <Button onClick={() => router.push('/vendor/articles')} className="mt-4">
              Back to Articles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-radial)' }} />
      <VendorNavbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Article</h1>
          <p className="text-muted-foreground">Update article information</p>
        </div>

        <Card className="card-glass rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter article title"
                maxLength={160}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter article description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="text"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                  <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="makeActive"
                checked={makeActive}
                onCheckedChange={setMakeActive}
              />
              <Label htmlFor="makeActive">Active (Visible)</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category ID</Label>
              <Input
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                placeholder="Enter category ID (optional)"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Article'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/vendor/articles')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        <Card className="card-glass rounded-xl p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Article Images</h2>
              <p className="text-sm text-muted-foreground">Upload and manage images for this article</p>
            </div>

            {article && (
              <>
                <ImageGallery
                  images={article.images || []}
                  onRemove={handleImageRemove}
                  disabled={submitting}
                />
                
                <div className="border-t pt-6">
                  <ImageUpload
                    onUpload={handleImageUpload}
                    multiple={true}
                    maxFiles={10}
                    disabled={submitting}
                  />
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditArticlePage;

