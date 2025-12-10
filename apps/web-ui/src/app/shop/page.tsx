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
import { Search, ShoppingBag, Filter, X, ChevronDown, ChevronRight } from 'lucide-react';
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
  
  // Applied filters (used for fetching) - initialized from URL
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(searchParams.get('search') || '');
  const [appliedCategories, setAppliedCategories] = useState<string[]>(() => {
    const cats = searchParams.get('categories');
    return cats ? cats.split(',') : [];
  });
  const [appliedMinPrice, setAppliedMinPrice] = useState(searchParams.get('minPrice') || '');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [appliedMinStock, setAppliedMinStock] = useState(searchParams.get('minStock') || '');
  const [appliedMaxStock, setAppliedMaxStock] = useState(searchParams.get('maxStock') || '');
  const [appliedSortBy, setAppliedSortBy] = useState<'title' | 'price' | 'stock' | 'createdAt' | ''>(
    (searchParams.get('sortBy') as any) || ''
  );
  const [appliedSortOrder, setAppliedSortOrder] = useState<'ASC' | 'DESC'>(
    (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC'
  );

  // Draft filters (what user is editing) - initialized from URL
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

  // Fetch articles only when applied filters or page changes
  const queryKey = useMemo(() => {
    return `${appliedSearchQuery}|${appliedCategories.join(',')}|${appliedMinPrice}|${appliedMaxPrice}|${appliedMinStock}|${appliedMaxStock}|${appliedSortBy}|${appliedSortOrder}|${page}`;
  }, [appliedSearchQuery, appliedCategories, appliedMinPrice, appliedMaxPrice, appliedMinStock, appliedMaxStock, appliedSortBy, appliedSortOrder, page]);

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
        if (appliedSearchQuery.trim()) {
          params.search = appliedSearchQuery.trim();
        }
        if (appliedCategories.length > 0) {
          params.categoryIds = appliedCategories;
        }
        if (appliedMinPrice) {
          params.minPrice = appliedMinPrice;
        }
        if (appliedMaxPrice) {
          params.maxPrice = appliedMaxPrice;
        }
        if (appliedMinStock) {
          params.minStock = parseInt(appliedMinStock, 10);
        }
        if (appliedMaxStock) {
          params.maxStock = parseInt(appliedMaxStock, 10);
        }
        if (appliedSortBy) {
          params.sortBy = appliedSortBy;
          params.sortOrder = appliedSortOrder;
        }
        const data = await getArticles(params);
        setArticles(data.items || []);
        setTotal(data.total || 0);
        
        // Update URL after successful fetch
        const urlParams = new URLSearchParams();
        if (appliedSearchQuery.trim()) urlParams.set('search', appliedSearchQuery.trim());
        if (appliedCategories.length > 0) urlParams.set('categories', appliedCategories.join(','));
        if (appliedMinPrice) urlParams.set('minPrice', appliedMinPrice);
        if (appliedMaxPrice) urlParams.set('maxPrice', appliedMaxPrice);
        if (appliedMinStock) urlParams.set('minStock', appliedMinStock);
        if (appliedMaxStock) urlParams.set('maxStock', appliedMaxStock);
        if (appliedSortBy) {
          urlParams.set('sortBy', appliedSortBy);
          urlParams.set('sortOrder', appliedSortOrder);
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

  // Apply filters button handler
  const handleApplyFilters = () => {
    setAppliedSearchQuery(searchQuery);
    setAppliedCategories([...selectedCategories]);
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setAppliedMinStock(minStock);
    setAppliedMaxStock(maxStock);
    setAppliedSortBy(sortBy);
    setAppliedSortOrder(sortOrder);
    setPage(1); // Reset to first page when applying filters
  };

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
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
    // Don't reset page here - wait for Apply button
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
    // Also clear applied filters
    setAppliedSearchQuery('');
    setAppliedCategories([]);
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setAppliedMinStock('');
    setAppliedMaxStock('');
    setAppliedSortBy('');
    setAppliedSortOrder('DESC');
    setPage(1);
  };

  const hasActiveFilters = appliedSearchQuery || appliedCategories.length > 0 || appliedMinPrice || appliedMaxPrice || appliedMinStock || appliedMaxStock || appliedSortBy;
  const hasDraftFilters = searchQuery !== appliedSearchQuery || 
    JSON.stringify([...selectedCategories].sort()) !== JSON.stringify([...appliedCategories].sort()) ||
    minPrice !== appliedMinPrice ||
    maxPrice !== appliedMaxPrice ||
    minStock !== appliedMinStock ||
    maxStock !== appliedMaxStock ||
    sortBy !== appliedSortBy ||
    sortOrder !== appliedSortOrder;

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

  // Helper function to check if a category has any selected children
  const hasSelectedChildren = (category: Category): boolean => {
    if (!category.children || category.children.length === 0) return false;
    return category.children.some(child => 
      selectedCategories.includes(child.id) || hasSelectedChildren(child)
    );
  };

  // Helper function to check if a category should be shown
  const shouldShowCategory = (category: Category): boolean => {
    // Always show root categories (no parent)
    if (!category.parentId) return true;
    
    // Show if parent is selected
    const parent = categories.find(cat => cat.id === category.parentId);
    if (parent && selectedCategories.includes(category.parentId)) return true;
    
    // Show if any ancestor is selected
    const findAncestor = (cat: Category | undefined): boolean => {
      if (!cat || !cat.parentId) return false;
      if (selectedCategories.includes(cat.parentId)) return true;
      const ancestor = categories.find(c => c.id === cat.parentId);
      return findAncestor(ancestor);
    };
    
    return findAncestor(category);
  };

  // Get root categories (categories without parents)
  const rootCategories = useMemo(() => {
    return categories.filter(cat => !cat.parentId);
  }, [categories]);

  // Render category with children recursively
  const renderCategory = (category: Category, level: number = 0): JSX.Element => {
    const isSelected = selectedCategories.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const showChildren = isSelected && hasChildren;
    const childrenToShow = category.children?.filter(child => shouldShowCategory(child)) || [];

    return (
      <div key={category.id}>
        <div 
          className={`flex items-center space-x-2 py-1.5 ${level > 0 ? 'pl-6' : ''}`}
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          <Checkbox
            id={`cat-${category.id}`}
            checked={isSelected}
            onCheckedChange={() => handleCategoryToggle(category.id)}
          />
          <Label
            htmlFor={`cat-${category.id}`}
            className="text-sm font-normal cursor-pointer flex-1 flex items-center gap-2"
          >
            {hasChildren && (
              <ChevronRight 
                className={`h-4 w-4 transition-transform ${showChildren ? 'rotate-90' : ''}`}
              />
            )}
            <span className={level === 0 ? 'font-medium' : ''}>{category.name}</span>
            {category.description && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                ({category.description})
              </span>
            )}
          </Label>
        </div>
        {showChildren && childrenToShow.length > 0 && (
          <div className="ml-4 border-l-2 border-muted pl-2">
            {childrenToShow.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
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
                    {[appliedSearchQuery, appliedCategories.length, appliedMinPrice, appliedMaxPrice, appliedMinStock, appliedMaxStock, appliedSortBy].filter(Boolean).length}
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
                  <Label className="text-base font-semibold">Categories</Label>
                  <Collapsible defaultOpen>
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
                    <CollapsibleContent className="mt-2 max-h-96 overflow-y-auto border rounded-md p-3 space-y-1 bg-muted/30">
                      {rootCategories.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-4 text-center">
                          No categories available
                        </div>
                      ) : (
                        rootCategories.map(category => renderCategory(category))
                      )}
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
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
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
                      onChange={(e) => setMinStock(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxStock}
                      onChange={(e) => setMaxStock(e.target.value)}
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
              
              {/* Apply Filters Button */}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset draft filters to match applied filters
                    setSearchQuery(appliedSearchQuery);
                    // Create a new array to ensure React detects the change
                    setSelectedCategories(appliedCategories.length > 0 ? [...appliedCategories] : []);
                    setMinPrice(appliedMinPrice);
                    setMaxPrice(appliedMaxPrice);
                    setMinStock(appliedMinStock);
                    setMaxStock(appliedMaxStock);
                    setSortBy(appliedSortBy);
                    setSortOrder(appliedSortOrder);
                    clearFilters();
                  }}
                  disabled={!hasDraftFilters && !hasActiveFilters}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  disabled={!hasDraftFilters}
                >
                  Apply Filters
                </Button>
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
                  {appliedSearchQuery ? 'Try adjusting your search terms' : 'Check back later for new products'}
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

