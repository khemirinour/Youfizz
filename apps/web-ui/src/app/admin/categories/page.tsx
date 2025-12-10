'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import AdminNavbar from '@/components/AdminNavbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getCategories, getCategoryTree, createCategory, updateCategory, deleteCategory } from '@/lib/categories.api';
import type { Category } from '@/lib/articles.api';
import type { CreateCategoryDto } from '@/lib/categories.api';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const AdminCategoriesPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/signin');
    }
  }, [hydrated, isAuthenticated, user?.role, router]);

  // Load categories
  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'admin') return;
    loadCategories();
  }, [hydrated, isAuthenticated, user?.role, viewMode]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      if (viewMode === 'tree') {
        const tree = await getCategoryTree(true);
        setCategoryTree(tree);
        setExpandedCategories(new Set());
      } else {
        const list = await getCategories(true);
        setCategories(list);
      }
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to load categories',
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
        parentId: category.parentId,
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

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: undefined,
      isActive: true,
      order: 0,
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: 'Error',
          description: 'Category name is required',
          variant: 'destructive',
        });
        return;
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        await createCategory(formData);
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
      }
      handleCloseDialog();
      loadCategories();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to save category',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCategory(id);
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      loadCategories();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Helper function to find a category in the tree recursively
  const findCategoryInTree = (tree: Category[], id: string): Category | null => {
    for (const category of tree) {
      if (category.id === id) return category;
      if (category.children) {
        const found = findCategoryInTree(category.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper function to check if a category should be shown (recursive check)
  const shouldShowCategory = (category: Category, tree: Category[]): boolean => {
    // Always show root categories (no parent)
    if (!category.parentId) return true;
    
    // Find parent in tree
    const parent = findCategoryInTree(tree, category.parentId);
    if (parent && expandedCategories.has(category.parentId)) return true;
    
    // Recursively check ancestors
    if (parent && parent.parentId) {
      return shouldShowCategory(parent, tree);
    }
    
    return false;
  };

  // Get root categories (categories without parents)
  const rootCategories = useMemo(() => {
    return categoryTree.filter(cat => !cat.parentId);
  }, [categoryTree]);

  // Flatten tree for parent selection (with indentation info)
  const flattenCategoriesForSelect = useMemo(() => {
    const result: Array<{ category: Category; depth: number; path: string }> = [];
    
    const traverse = (cats: Category[], depth: number = 0, path: string = '') => {
      cats.forEach(cat => {
        const currentPath = path ? `${path} > ${cat.name}` : cat.name;
        result.push({ category: cat, depth, path: currentPath });
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children, depth + 1, currentPath);
        }
      });
    };
    
    traverse(categoryTree);
    return result;
  }, [categoryTree]);

  const renderCategoryTree = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const childrenToShow = category.children?.filter(child => shouldShowCategory(child, categoryTree)) || [];

    return (
      <div key={category.id} className="border-b border-border/50 last:border-b-0">
        <div
          className="flex items-center gap-2 py-3 px-4 hover:bg-secondary/50 transition-colors"
          style={{ paddingLeft: `${16 + level * 24}px` }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-secondary rounded transition-transform"
                type="button"
              >
                <ChevronRight 
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium text-foreground ${level === 0 ? 'text-base' : 'text-sm'}`}>
                  {category.name}
                </span>
                {!category.isActive && (
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Inactive</span>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground truncate mt-1">{category.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>Slug: {category.slug}</span>
                <span>Order: {category.order}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenDialog(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(category.id, category.name)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && childrenToShow.length > 0 && (
          <div className="ml-4 border-l-2 border-muted/50">
            {childrenToShow.map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!hydrated || !isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatedBackground />
      <AdminNavbar activeTab="categories" />

      <div className="relative z-20 max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Gestion des Catégories</h1>
            <p className="text-muted-foreground">Organisez les catégories de produits (Admin uniquement)</p>
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
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Catégorie
            </Button>
          </div>
        </div>

        <Card className="bg-card border border-border rounded-xl p-6 shadow-lg">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des catégories...</p>
            </div>
          ) : viewMode === 'tree' ? (
            <div className="space-y-0">
              {rootCategories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Aucune catégorie trouvée. Créez votre première catégorie !
                </div>
              ) : (
                rootCategories.map(category => renderCategoryTree(category))
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {categories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Aucune catégorie trouvée. Créez votre première catégorie !
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground bg-secondary/80 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Nom</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Slug</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Parent</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Ordre</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase">Statut</th>
                        <th className="px-4 py-3 text-xs font-medium uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {categories.map(category => (
                        <tr key={category.id} className="hover:bg-secondary/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium">{category.name}</div>
                            {category.description && (
                              <div className="text-xs text-muted-foreground mt-1">{category.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {category.parent ? category.parent.name : '—'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{category.order}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded ${category.isActive ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(category.id, category.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie pour organiser vos produits'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Électronique"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Ex: electronique (auto-généré si vide)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la catégorie"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Catégorie Parente</Label>
              <Select
                value={formData.parentId || '__none__'}
                onValueChange={(value) => setFormData({ ...formData, parentId: value === '__none__' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucune (catégorie racine)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucune (catégorie racine)</SelectItem>
                  {flattenCategoriesForSelect
                    .filter(item => !editingCategory || item.category.id !== editingCategory.id)
                    .map(item => (
                      <SelectItem 
                        key={item.category.id} 
                        value={item.category.id}
                        style={{ paddingLeft: `${12 + item.depth * 20}px` }}
                      >
                        <span className={item.depth === 0 ? 'font-medium' : ''}>
                          {item.depth > 0 ? '└─ ' : ''}{item.category.name}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Ordre</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive" className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <span>Active</span>
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {editingCategory ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategoriesPage;

