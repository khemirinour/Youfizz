'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import { getArticles, type Article } from '@/lib/articles.api';
import { getCategoryTree, type Category } from '@/lib/categories.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Search, ShoppingBag, Filter, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ShopPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const pageSize = 12;
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cats = searchParams.get('categories');
    return cats ? cats.split(',') : [];
  });
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minStock, setMinStock] = useState(searchParams.get('minStock') || '');
  const [maxStock, setMaxStock] = useState(searchParams.get('maxStock') || '');
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'stock' | 'createdAt' | ''>(
    (searchParams.get('sortBy') as any) || ''
  );
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(
    (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC'
  );

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategoryTree();
        setCategories(cats);
      } catch (e: any) {
        console.error('Failed to load categories:', e);
      }
    };
    loadCategories();
  }, []);

  const queryKey = useMemo(() => {
    return `${searchQuery}|${selectedCategories.join(',')}|${minPrice}|${maxPrice}|${minStock}|${maxStock}|${sortBy}|${sortOrder}|${page}`;
  }, [searchQuery, selectedCategories, minPrice, maxPrice, minStock, maxStock, sortBy, sortOrder, page]);

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
        if (selectedCategories.length > 0) {
          params.categoryIds = selectedCategories;
        }
        if (minPrice) {
          params.minPrice = minPrice;
        }
        if (maxPrice) {
          params.maxPrice = maxPrice;
        }
        if (minStock) {
          params.minStock = parseInt(minStock, 10);
        }
        if (maxStock) {
          params.maxStock = parseInt(maxStock, 10);
        }
        if (sortBy) {
          params.sortBy = sortBy;
          params.sortOrder = sortOrder;
        }
        const data = await getArticles(params);
        setArticles(data.items || []);
        setTotal(data.total || 0);
        
        // Update URL after successful fetch
        const urlParams = new URLSearchParams();
        if (searchQuery.trim()) urlParams.set('search', searchQuery.trim());
        if (selectedCategories.length > 0) urlParams.set('categories', selectedCategories.join(','));
        if (minPrice) urlParams.set('minPrice', minPrice);
        if (maxPrice) urlParams.set('maxPrice', maxPrice);
        if (minStock) urlParams.set('minStock', minStock);
        if (maxStock) urlParams.set('maxStock', maxStock);
        if (sortBy) {
          urlParams.set('sortBy', sortBy);
          urlParams.set('sortOrder', sortOrder);
        }
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

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setMinStock('');
    setMaxStock('');
    setSortBy('');
    setSortOrder('DESC');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || minPrice || maxPrice || minStock || maxStock || sortBy;

  const totalPages = Math.ceil(total / pageSize);

  // Flatten categories for checkbox list
  const flattenCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const traverse = (category: Category) => {
      result.push(category);
      if (category.children) {
        category.children.forEach(traverse);
      }
    };
    cats.forEach(traverse);
    return result;
  };

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop</h1>
          <p className="text-muted-foreground">Browse our collection of products</p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
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
            <div className="flex gap-2">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {[searchQuery, selectedCategories.length, minPrice, maxPrice, minStock, maxStock, sortBy].filter(Boolean).length}
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Categories */}
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="text-sm">
                          {selectedCategories.length > 0 
                            ? `${selectedCategories.length} selected` 
                            : 'All categories'}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                      {flatCategories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cat-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => handleCategoryToggle(category.id)}
                          />
                          <Label
                            htmlFor={`cat-${category.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPage(1);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Stock Range */}
                <div className="space-y-2">
                  <Label>Stock Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minStock}
                      onChange={(e) => {
                        setMinStock(e.target.value);
                        setPage(1);
                      }}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxStock}
                      onChange={(e) => {
                        setMaxStock(e.target.value);
                        setPage(1);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select
                    value={sortBy || '__default__'}
                    onValueChange={(value) => {
                      setSortBy(value === '__default__' ? '' : (value as any));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__default__">Default</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="createdAt">Date</SelectItem>
                    </SelectContent>
                  </Select>
                  {sortBy && (
                    <Select
                      value={sortOrder}
                      onValueChange={(value) => {
                        setSortOrder(value as 'ASC' | 'DESC');
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASC">Ascending</SelectItem>
                        <SelectItem value="DESC">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </Card>
          )}
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

