'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import VendorNavbar from '@/components/VendorNavbar';
import { getArticlesByVendor, type Article, activateArticle, deactivateArticle, deleteArticle } from '@/lib/articles.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getArticleUrl } from '@/lib/utils/url';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Copy, Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { getCategories } from '@/lib/categories.api';
import { Category } from '@/lib/articles.api';
import { Checkbox } from '@/components/ui/checkbox';
import { CategoryTree } from '@/components/CategoryTree';
import { getCategoryTree } from '@/lib/categories.api';

const ArticlesListPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, vendorId } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copiedArticleId, setCopiedArticleId] = useState<string | null>(null);

  const pageSize = 20;
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>(
    (searchParams.get('status') as any) || 'ALL'
  );
  const [isActiveFilter, setIsActiveFilter] = useState<'ALL' | 'true' | 'false'>(
    (searchParams.get('isActive') as any) || 'ALL'
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');
  const [minStock, setMinStock] = useState<number | undefined>(
    searchParams.get('minStock') ? parseInt(searchParams.get('minStock')!, 10) : undefined
  );
  const [maxStock, setMaxStock] = useState<number | undefined>(
    searchParams.get('maxStock') ? parseInt(searchParams.get('maxStock')!, 10) : undefined
  );
  const [createdAfter, setCreatedAfter] = useState<Date | undefined>(
    searchParams.get('createdAfter') ? new Date(searchParams.get('createdAfter')!) : undefined
  );
  const [createdBefore, setCreatedBefore] = useState<Date | undefined>(
    searchParams.get('createdBefore') ? new Date(searchParams.get('createdBefore')!) : undefined
  );
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'stock' | 'createdAt'>(
    (searchParams.get('sortBy') as any) || 'title'
  );
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(
    (searchParams.get('sortOrder') as any) || 'ASC'
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Wait for Zustand hydration
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

  // Load categories on mount
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

  const queryKey = useMemo(
    () => `${searchQuery}|${statusFilter}|${isActiveFilter}|${selectedCategories.join(',')}|${minPrice}|${maxPrice}|${minStock}|${maxStock}|${createdAfter?.toISOString()}|${createdBefore?.toISOString()}|${sortBy}|${sortOrder}|${page}|${vendorId}`,
    [searchQuery, statusFilter, isActiveFilter, selectedCategories, minPrice, maxPrice, minStock, maxStock, createdAfter, createdBefore, sortBy, sortOrder, page, vendorId]
  );

  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return;
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params: any = { limit: pageSize, offset: (page - 1) * pageSize };
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (statusFilter !== 'ALL') params.status = statusFilter;
        if (isActiveFilter !== 'ALL') params.isActive = isActiveFilter === 'true';
        if (selectedCategories.length > 0) params.categoryIds = selectedCategories;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minStock !== undefined) params.minStock = minStock;
        if (maxStock !== undefined) params.maxStock = maxStock;
        if (createdAfter) params.createdAfter = createdAfter.toISOString();
        if (createdBefore) params.createdBefore = createdBefore.toISOString();
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
        const data = await getArticlesByVendor(vendorId, params);
        setArticles(data?.items || []);
        setTotal(data?.total || 0);

        const urlParams = new URLSearchParams();
        if (searchQuery.trim()) urlParams.set('search', searchQuery.trim());
        if (statusFilter !== 'ALL') urlParams.set('status', statusFilter);
        if (isActiveFilter !== 'ALL') urlParams.set('isActive', isActiveFilter);
        if (selectedCategories.length > 0) urlParams.set('categoryIds', selectedCategories.join(','));
        if (minPrice) urlParams.set('minPrice', minPrice);
        if (maxPrice) urlParams.set('maxPrice', maxPrice);
        if (minStock !== undefined) urlParams.set('minStock', minStock.toString());
        if (maxStock !== undefined) urlParams.set('maxStock', maxStock.toString());
        if (createdAfter) urlParams.set('createdAfter', createdAfter.toISOString());
        if (createdBefore) urlParams.set('createdBefore', createdBefore.toISOString());
        if (sortBy !== 'title') urlParams.set('sortBy', sortBy);
        if (sortOrder !== 'ASC') urlParams.set('sortOrder', sortOrder);
        if (page > 1) urlParams.set('page', page.toString());
        router.replace(`/vendor/articles${urlParams.toString() ? `?${urlParams.toString()}` : ''}`);
      } catch (e: any) {
        toast({
          title: 'Erreur',
          description: e?.response?.data?.message || e?.message || 'Échec du chargement des articles',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [queryKey, hydrated, isAuthenticated, user?.role, vendorId]);

  const totalPages = Math.ceil(total / pageSize);
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const handleAction = async (id: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      if (action === 'delete') {
        if (!confirm('Supprimer cet article ?')) return;
        await deleteArticle(id);
        toast({ title: 'Succès', description: 'Article supprimé' });
      } else if (action === 'activate') {
        await activateArticle(id);
        toast({ title: 'Succès', description: 'Article activé' });
      } else {
        await deactivateArticle(id);
        toast({ title: 'Succès', description: 'Article désactivé' });
      }
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e?.response?.data?.message || e?.message || "Échec de l'action",
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = async (articleId: string) => {
    try {
      const articleUrl = getArticleUrl(articleId);
      await navigator.clipboard.writeText(articleUrl);
      setCopiedArticleId(articleId);
      toast({
        title: 'Succès',
        description: 'Lien copié dans le presse-papiers',
      });
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedArticleId(null), 2000);
    } catch (e: any) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = getArticleUrl(articleId);
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedArticleId(articleId);
        toast({
          title: 'Succès',
          description: 'Lien copié dans le presse-papiers',
        });
        setTimeout(() => setCopiedArticleId(null), 2000);
      } catch (fallbackError) {
        toast({
          title: 'Erreur',
          description: 'Impossible de copier le lien',
          variant: 'destructive',
        });
      }
    }
  };

  if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return null;

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* --- Dégradé radial orange --- */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at top left, hsl(var(--primary) / 0.12), hsl(var(--background)) 60%)',
        }}
      />
      <VendorNavbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Gestion des Articles</h1>
            <p className="text-muted-foreground">Gérez vos produits et votre inventaire</p>
          </div>
          <Link href="/vendor/articles/new">
            <Button>
              Créer un article
            </Button>
          </Link>
        </div>

        {/* Filters + Table */}
        <Card className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <div className="space-y-4 mb-6">
            {/* Search bar */}
            <div className="flex items-center gap-4">
              <Input
                placeholder="Rechercher par titre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                className="flex-1 bg-secondary/80 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
              <Button onClick={() => setPage(1)}>
                Rechercher
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="border-border text-foreground hover:bg-secondary/70"
              >
                Filtres avancés
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </Button>
              {(searchQuery || statusFilter !== 'ALL' || isActiveFilter !== 'ALL' || selectedCategories.length > 0 || minPrice || maxPrice || minStock !== undefined || maxStock !== undefined || createdAfter || createdBefore) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setIsActiveFilter('ALL');
                    setSelectedCategories([]);
                    setMinPrice('');
                    setMaxPrice('');
                    setMinStock(undefined);
                    setMaxStock(undefined);
                    setCreatedAfter(undefined);
                    setCreatedBefore(undefined);
                    setSortBy('title');
                    setSortOrder('ASC');
                    setPage(1);
                  }}
                  className="border-border text-foreground hover:bg-secondary/70"
                >
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-muted-foreground">
                  Statut
                </Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger
                    id="status-filter"
                    className="bg-secondary/80 border-border text-foreground"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-foreground border-border">
                    <SelectItem value="ALL">Tous</SelectItem>
                    <SelectItem value="DRAFT">Brouillons</SelectItem>
                    <SelectItem value="PUBLISHED">Publiés</SelectItem>
                    <SelectItem value="ARCHIVED">Archivés</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="active-filter" className="text-muted-foreground">
                  Visibilité
                </Label>
                <Select value={isActiveFilter} onValueChange={(v) => setIsActiveFilter(v as any)}>
                  <SelectTrigger
                    id="active-filter"
                    className="bg-secondary/80 border-border text-foreground"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-foreground border-border">
                    <SelectItem value="ALL">Toutes</SelectItem>
                    <SelectItem value="true">Actives</SelectItem>
                    <SelectItem value="false">Inactives</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Categories Multi-Select */}
                  <div className="space-y-2">
                    <Label>Catégories</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {selectedCategories.length > 0
                            ? `${selectedCategories.length} sélectionnée(s)`
                            : 'Sélectionner des catégories'}
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 bg-card border-border">
                        <div className="max-h-60 overflow-y-auto p-3 bg-muted/30">
                          <CategoryTree
                            categories={categories}
                            selectedIds={selectedCategories}
                            onToggle={(categoryId) => {
                              if (selectedCategories.includes(categoryId)) {
                                setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
                              } else {
                                setSelectedCategories([...selectedCategories, categoryId]);
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Prix min</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="bg-secondary/80 border-border text-foreground"
                    />
                    
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Prix max</Label>
                    <Input
                      type="number"
                      placeholder="9999.99"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="bg-secondary/80 border-border text-foreground"
                    />
                  </div>

                  {/* Stock Range */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Stock min</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minStock ?? ''}
                      onChange={(e) => setMinStock(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      className="bg-secondary/80 border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Stock max</Label>
                    <Input
                      type="number"
                      placeholder="9999"
                      value={maxStock ?? ''}
                      onChange={(e) => setMaxStock(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      className="bg-secondary/80 border-border text-foreground"
                    />
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Créé après</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-secondary/80 border-border text-foreground"
                        >
                          {createdAfter ? format(createdAfter, 'PPP') : 'Sélectionner une date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border-border">
                        <Calendar
                          mode="single"
                          selected={createdAfter}
                          onSelect={setCreatedAfter}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Créé avant</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-secondary/80 border-border text-foreground"
                        >
                          {createdBefore ? format(createdBefore, 'PPP') : 'Sélectionner une date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border-border">
                        <Calendar
                          mode="single"
                          selected={createdBefore}
                          onSelect={setCreatedBefore}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Trier par</Label>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                      <SelectTrigger className="bg-secondary/80 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card text-foreground border-border">
                        <SelectItem value="title">Titre</SelectItem>
                        <SelectItem value="price">Prix</SelectItem>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="createdAt">Date de création</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Ordre</Label>
                    <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
                      <SelectTrigger className="bg-secondary/80 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card text-foreground border-border">
                        <SelectItem value="ASC">Croissant</SelectItem>
                        <SelectItem value="DESC">Décroissant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Chargement...</div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Aucun article trouvé</div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Affichage {startItem}-{endItem} sur {total} articles
              </div>
              <div className="overflow-x-auto">
                <Table className="text-foreground">
                  <TableHeader className="bg-secondary/80">
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actif</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id} className="hover:bg-secondary/60">
                        <TableCell>{article.title}</TableCell>
                        <TableCell>{article.status}</TableCell>
                        <TableCell>{article.isActive ? 'Oui' : 'Non'}</TableCell>
                        <TableCell className="text-right">{article.stock ?? 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyLink(article.id)}
                              className="border-border text-foreground hover:bg-secondary/70"
                              title="Copier le lien de l'article"
                              aria-label="Copier le lien de l'article"
                            >
                              {copiedArticleId === article.id ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Link href={`/vendor/articles/${article.id}/edit`}>
                              <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-secondary/70">
                                Éditer
                              </Button>
                            </Link>
                            {article.isActive ? (
                              <Button
                                size="sm"
                                onClick={() => handleAction(article.id, 'deactivate')}
                                variant="outline"
                                className="border-border text-muted-foreground hover:bg-secondary/70"
                              >
                                Désactiver
                              </Button>
                            ) : (
                              <Button size="sm" onClick={() => handleAction(article.id, 'activate')}>
                                Activer
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAction(article.id, 'delete')}
                              className="hover:bg-destructive/90"
                            >
                              Supprimer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                          }}
                          className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPage(pageNum);
                                }}
                                isActive={pageNum === page}
                                className={`${
                                  pageNum === page
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    : 'bg-secondary text-foreground hover:bg-secondary/70'
                                }`}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < totalPages) setPage(page + 1);
                          }}
                          className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ArticlesListPage;
