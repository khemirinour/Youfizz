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
import { useToast } from '@/hooks/use-toast';
import { activateArticle, deactivateArticle, deleteArticle } from '@/lib/articles.api';
import Link from 'next/link';

const ArticlesListPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, vendorId } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

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

  const queryKey = useMemo(() => `${searchQuery}|${vendorId}`, [searchQuery, vendorId]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== 'vendeur' || !vendorId) return;
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (searchQuery) {
          params.search = searchQuery;
        }
        const data = await getArticlesByVendor(vendorId, params);
        setArticles(Array.isArray(data) ? data : []);
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
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    router.push(`/vendor/articles?${params.toString()}`);
  };

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
      // Refresh articles
      const params: any = {};
      if (searchQuery) {
        params.search = searchQuery;
      }
      const data = await getArticlesByVendor(vendorId!, params);
      setArticles(Array.isArray(data) ? data : []);
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
          <div className="flex items-center gap-4 mb-6">
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
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  router.push('/vendor/articles');
                }}
              >
                Clear
              </Button>
            )}
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
          )}
        </Card>
      </div>
    </div>
  );
};

export default ArticlesListPage;

