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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import Link from 'next/link';

const ArticlesListPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, vendorId } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

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

  // Wait for Zustand hydration
  useEffect(() => {
    const api = (useAuthStore as any).persist;
    if (api?.hasHydrated?.()) setHydrated(true);
    const unsub = api?.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  // Redirect unauthorized users
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== 'vendeur' || !vendorId) {
      router.replace('/signin');
    }
  }, [hydrated, isAuthenticated, user?.role, vendorId, router]);

  const queryKey = useMemo(
    () => `${searchQuery}|${statusFilter}|${isActiveFilter}|${page}|${vendorId}`,
    [searchQuery, statusFilter, isActiveFilter, page, vendorId]
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
        const data = await getArticlesByVendor(vendorId, params);
        setArticles(data.items || []);
        setTotal(data.total || 0);

        const urlParams = new URLSearchParams();
        if (searchQuery.trim()) urlParams.set('search', searchQuery.trim());
        if (statusFilter !== 'ALL') urlParams.set('status', statusFilter);
        if (isActiveFilter !== 'ALL') urlParams.set('isActive', isActiveFilter);
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
        description: e?.response?.data?.message || e?.message || 'Échec de l’action',
        variant: 'destructive',
      });
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
      <VendorNavbar logoSrc="/logo-dark.png" />

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
              {(searchQuery || statusFilter !== 'ALL' || isActiveFilter !== 'ALL') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setIsActiveFilter('ALL');
                    setPage(1);
                  }}
                  className="border-border text-foreground hover:bg-secondary/70"
                >
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Filters */}
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
