'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import VendorNavbar from '@/components/VendorNavbar';
import { createArticle, activateArticle, type CreateArticleDto } from '@/lib/articles.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

const NewArticlePage = () => {
  const router = useRouter();
  const { user, isAuthenticated, vendorId } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateArticleDto>({
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

  useEffect(() => {
    // Redirect non-vendors to sign in (after hydration)
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== 'vendeur' || !vendorId) {
      router.replace('/signin');
    }
  }, [hydrated, isAuthenticated, user?.role, vendorId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;

    try {
      setSubmitting(true);
      const dataToSend: CreateArticleDto = {
        ...formData,
        vendorId: vendorId,
        stock: formData.stock || 0,
        price: formData.price || '0',
      };
      const created = await createArticle(dataToSend);
      if (makeActive && created?.id) {
        await activateArticle(created.id);
      }
      toast({ 
        title: 'Success', 
        description: 'Article created successfully. You can now upload images on the edit page.' 
      });
      // Redirect to edit page to allow image upload
      if (created?.id) {
        router.push(`/vendor/articles/${created.id}/edit`);
      } else {
        router.push('/vendor/articles');
      }
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.response?.data?.message || e?.message || 'Failed to create article',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return null;

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-radial)' }} />
      <VendorNavbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create Article</h1>
          <p className="text-muted-foreground">Add a new product to your inventory</p>
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
              <Label htmlFor="makeActive">Activate after create</Label>
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

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> After creating the article, you'll be redirected to the edit page where you can upload images.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Article'}
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
      </div>
    </div>
  );
};

export default NewArticlePage;

