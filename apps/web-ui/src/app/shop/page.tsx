'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import { getArticles, type Article } from '@/lib/articles.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const ShopPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const pageSize = 12;
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const queryKey = useMemo(() => `${searchQuery}|${page}`, [searchQuery, page]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params: any = {
          limit: pageSize,
          offset: (page - 1) * pageSize,
          status: 'PUBLISHED',
          isActive: true,
        };
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        const data = await getArticles(params);
        setArticles(data.items || []);
        setTotal(data.total || 0);
        
        // Update URL after successful fetch
        const urlParams = new URLSearchParams();
        if (searchQuery.trim()) urlParams.set('search', searchQuery.trim());
        if (page > 1) urlParams.set('page', page.toString());
        router.replace(`/shop${urlParams.toString() ? `?${urlParams.toString()}` : ''}`, { scroll: false });
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
  }, [queryKey]);

  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop</h1>
          <p className="text-muted-foreground">Browse our collection of products</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && (
          <>
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new products'}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total} articles
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {articles.map((article) => (
                    <Link key={article.id} href={`/article/${article.id}`}>
                      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="p-0">
                          <div className="relative w-full h-48 bg-muted rounded-t-lg overflow-hidden">
                            {article.images && article.images.length > 0 ? (
                              <Image
                                src={article.images[0]}
                                alt={article.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-4">
                          <CardTitle className="text-lg mb-2 line-clamp-2">{article.title}</CardTitle>
                          {article.description && (
                            <CardDescription className="line-clamp-2 mb-2">
                              {article.description}
                            </CardDescription>
                          )}
                          {article.price && (
                            <div className="text-2xl font-bold text-primary mt-2">
                              ${article.price}
                            </div>
                          )}
                          {typeof article.stock === 'number' && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {article.stock > 0 ? `${article.stock} in stock` : 'Out of stock'}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;

