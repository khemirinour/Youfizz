'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import VendorNavbar from '@/components/VendorNavbar';
import { getCategories, getCategoryTree, createCategory, updateCategory, deleteCategory, type Category, type CreateCategoryDto } from '@/lib/categories.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';

const CategoriesPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, vendorId } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('tree');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    slug: '',
    description: '',
    parentId: undefined,
    isActive: true,
    order: 0,
  });

  // Wait for Zustand hydration
  useEffect(() => {
    const api = (useAuthStore as any).persist;
    if (api?.hasHydrated?.()) setHydrated(true);
    const unsub = api?.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  // Verify authentication
  useEffect(() => {
    if (!hydrated) return;
    
    const verifyAuth = async () => {
      if (isAuthenticated && user?.role === 'vendeur' && vendorId) {
        try {
          const refreshed = await useAuthStore.getState().refreshToken();
          if (!refreshed) {
            router.replace('/signin');
          }
        } catch (error) {
          router.replace('/signin');
        }
      } else {
        router.replace('/signin');
      }
    };

    verifyAuth();
  }, [hydrated, isAuthenticated, user?.role, vendorId, router]);

  // Load categories
  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return;
    loadCategories();
  }, [hydrated, isAuthenticated, user?.role, vendorId, viewMode]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      if (viewMode === 'tree') {
        const tree = await getCategoryTree();
        setCategoryTree(tree);
      } else {
        const cats = await getCategories();
        setCategories(cats);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || error?.message || 'Échec du chargement des catégories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || undefined,
        isActive: category.isActive,
        order: category.order,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: undefined,
        isActive: true,
        order: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast({ title: 'Succès', description: 'Catégorie mise à jour' });
      } else {
        await createCategory(formData);
        toast({ title: 'Succès', description: 'Catégorie créée' });
      }
      setDialogOpen(false);
      loadCategories();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || error?.message || 'Échec de l\'opération',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await deleteCategory(id);
      toast({ title: 'Succès', description: 'Catégorie supprimée' });
      loadCategories();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || error?.message || 'Échec de la suppression',
        variant: 'destructive',
      });
    }
  };

  const renderCategoryTree = (cats: Category[], level: number = 0): JSX.Element[] => {
    return cats.map((category) => (
      <div key={category.id} className="space-y-1">
        <div
          className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50"
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 font-medium">{category.name}</span>
          <span className="text-sm text-muted-foreground">{category.slug}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenDialog(category)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(category.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        {category.children && category.children.length > 0 && (
          <div className="ml-4">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return null;

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(circle at top left, hsl(var(--primary) / 0.12), hsl(var(--background)) 60%)',
        }}
      />
      <VendorNavbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Gestion des Catégories</h1>
            <p className="text-muted-foreground">Organisez vos produits par catégories hiérarchiques</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              Liste
            </Button>
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              onClick={() => setViewMode('tree')}
            >
              Arborescence
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle catégorie
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nom de la catégorie"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="slug-de-la-categorie (auto-généré si vide)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description de la catégorie"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie parente</Label>
                    <Select
                      value={formData.parentId || 'none'}
                      onValueChange={(value) =>
                        setFormData({ ...formData, parentId: value === 'none' ? undefined : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune (catégorie racine)</SelectItem>
                        {categories
                          .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ordre</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Enregistrer</Button>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-card border border-border rounded-xl p-6 shadow-lg">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Chargement...</div>
          ) : viewMode === 'tree' ? (
            <div className="space-y-1">
              {categoryTree.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">Aucune catégorie</div>
              ) : (
                renderCategoryTree(categoryTree)
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Aucune catégorie
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        {category.parent
                          ? category.parent.name
                          : category.parentId
                          ? category.parentId
                          : '-'}
                      </TableCell>
                      <TableCell>{category.order}</TableCell>
                      <TableCell>{category.isActive ? 'Oui' : 'Non'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CategoriesPage;

