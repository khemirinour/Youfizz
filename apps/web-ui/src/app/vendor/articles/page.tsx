'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import VendorNavbar from '@/components/VendorNavbar';
import { getArticlesByVendor, type Article } from '@/lib/articles.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { activateArticle, deactivateArticle, deleteArticle } from '@/lib/articles.api';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
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
  
  // Pagination state
  const pageSize = 20;
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>(() => {
    const statusParam = searchParams.get('status');
    return (statusParam as any) || 'ALL';
  });
  const [isActiveFilter, setIsActiveFilter] = useState<'ALL' | 'true' | 'false'>(() => {
    const isActiveParam = searchParams.get('isActive');
    return (isActiveParam as any) || 'ALL';
  });

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

  const queryKey = useMemo(() => `${searchQuery}|${statusFilter}|${isActiveFilter}|${page}|${vendorId}`, [searchQuery, statusFilter, isActiveFilter, page, vendorId]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return;
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params: any = {
          limit: pageSize,
          offset: (page - 1) * pageSize,
        };
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        if (statusFilter !== 'ALL') {
          params.status = statusFilter;
        }
        if (isActiveFilter !== 'ALL') {
          params.isActive = isActiveFilter === 'true';
        }
        const data = await getArticlesByVendor(vendorId, params);
        setArticles(data.items || []);
        setTotal(data.total || 0);
        
        // Update URL after successful fetch
        const urlParams = new URLSearchParams();
        if (searchQuery.trim()) urlParams.set('search', searchQuery.trim());
        if (statusFilter !== 'ALL') urlParams.set('status', statusFilter);
        if (isActiveFilter !== 'ALL') urlParams.set('isActive', isActiveFilter);
        if (page > 1) urlParams.set('page', page.toString());
        router.replace(`/vendor/articles${urlParams.toString() ? `?${urlParams.toString()}` : ''}`);
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e?.response?.data?.message || e?.message || 'Failed to load articles',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, hydrated, isAuthenticated, user?.role, vendorId]);

  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as 'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED');
    setPage(1); // Reset to first page on filter change
  };

  const handleIsActiveFilterChange = (value: string) => {
    setIsActiveFilter(value as 'ALL' | 'true' | 'false');
    setPage(1); // Reset to first page on filter change
  };

  const totalPages = Math.ceil(total / pageSize);
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const handleAction = async (id: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      if (action === 'delete') {
        if (!confirm('Delete this article?')) return;
        await deleteArticle(id);
        toast({ title: 'Success', description: 'Article deleted' });
      } else if (action === 'activate') {
        await activateArticle(id);
        toast({ title: 'Success', description: 'Article activated' });
      } else {
        await deactivateArticle(id);
        toast({ title: 'Success', description: 'Article deactivated' });
      }
      // Refresh articles with current filters and pagination
      const params: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (isActiveFilter !== 'ALL') {
        params.isActive = isActiveFilter === 'true';
      }
      const data = await getArticlesByVendor(vendorId!, params);
      setArticles(data.items || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.response?.data?.message || e?.message || 'Action failed',
        variant: 'destructive',
      });
    }
  };

  if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return null;

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 z-0" style={{ background: 'var(--gradient-radial)' }} />
      <VendorNavbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des Articles</h1>
            <p className="text-muted-foreground">Manage your articles and inventory</p>
          </div>
          <Link href="/vendor/articles/new">
            <Button>Create Article</Button>
          </Link>
        </div>

        <Card className="card-glass rounded-xl p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleSearch}>Search</Button>
              {(searchQuery || statusFilter !== 'ALL' || isActiveFilter !== 'ALL') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setIsActiveFilter('ALL');
                    setPage(1);
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger id="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                    <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                    <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="active-filter">Visibility</Label>
                <Select value={isActiveFilter} onValueChange={handleIsActiveFilterChange}>
                  <SelectTrigger id="active-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {startItem}-{endItem} of {total} articles
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>{article.status || '-'}</TableCell>
                        <TableCell>{article.isActive ? 'Yes' : 'No'}</TableCell>
                        <TableCell className="text-right">{article.stock ?? 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/vendor/articles/${article.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            {article.isActive ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(article.id, 'deactivate')}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(article.id, 'activate')}
                              >
                                Activate
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleAction(article.id, 'delete')}
                            >
                              Delete
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
                        // Show first page, last page, current page, and pages around current
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
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (pageNum === page - 2 || pageNum === page + 2) {
                          return (
                            <PaginationItem key={pageNum}>
                              <span className="px-2">...</span>
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

