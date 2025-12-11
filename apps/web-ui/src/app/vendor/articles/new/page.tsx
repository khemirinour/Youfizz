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
import { getCategories, type Category } from '@/lib/categories.api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Plus, X } from 'lucide-react';
import { CategoryTree } from '@/components/CategoryTree';
import { getCategoryTree } from '@/lib/categories.api';

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
    priceAfterDiscount: '',
    stock: 0,
    sku: '',
    status: 'DRAFT',
    categoryId: '',
    categoryIds: [],
    specifications: {},
  });
  const [makeActive, setMakeActive] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [specFields, setSpecFields] = useState<Array<{ key: string; value: string }>>([]);

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

  // Load categories
  useEffect(() => {
    if (!hydrated) return;
    const loadCategories = async () => {
      try {
        const cats = await getCategoryTree();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, [hydrated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;

    try {
      setSubmitting(true);
      // Build specifications object from specFields
      const specifications: Record<string, any> = {};
      specFields.forEach((field) => {
        if (field.key.trim()) {
          specifications[field.key.trim()] = field.value.trim();
        }
      });

      const dataToSend: CreateArticleDto = {
        ...formData,
        vendorId: vendorId,
        stock: formData.stock || 0,
        price: formData.price || '0',
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
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
                <Label htmlFor="priceAfterDiscount">Price After Discount</Label>
                <Input
                  id="priceAfterDiscount"
                  type="text"
                  value={formData.priceAfterDiscount}
                  onChange={(e) => setFormData({ ...formData, priceAfterDiscount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Categories Multi-Select */}
            <div className="space-y-2">
              <Label>Catégories</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {formData.categoryIds && formData.categoryIds.length > 0
                      ? `${formData.categoryIds.length} catégorie(s) sélectionnée(s)`
                      : 'Sélectionner des catégories'}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <div className="max-h-60 overflow-y-auto p-3 bg-muted/30">
                    <CategoryTree
                      categories={categories}
                      selectedIds={formData.categoryIds || []}
                      onToggle={(categoryId) => {
                        const currentIds = formData.categoryIds || [];
                        if (currentIds.includes(categoryId)) {
                          setFormData({ ...formData, categoryIds: currentIds.filter((id) => id !== categoryId) });
                        } else {
                          setFormData({ ...formData, categoryIds: [...currentIds, categoryId] });
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Specifications */}
            <div className="space-y-2">
              <Label>Spécifications du produit</Label>
              <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                {specFields.map((field, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Nom (ex: Couleur, Taille, Marque)"
                      value={field.key}
                      onChange={(e) => {
                        const newFields = [...specFields];
                        newFields[index].key = e.target.value;
                        setSpecFields(newFields);
                      }}
                      className="flex-1"
                    />
              <Input
                      placeholder="Valeur"
                      value={field.value}
                      onChange={(e) => {
                        const newFields = [...specFields];
                        newFields[index].value = e.target.value;
                        setSpecFields(newFields);
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSpecFields(specFields.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSpecFields([...specFields, { key: '', value: '' }])}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une spécification
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Exemples: Couleur, Taille, Marque, Poids, Matériau, etc.
              </p>
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

