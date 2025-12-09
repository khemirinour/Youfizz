import { get, post, patch, del } from './http';
import axios from 'axios';
import { useArticlesStore, generateArticlesCacheKey } from '@/stores/articlesStore';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  description?: string;
  price?: string;
  stock?: number;
  sku?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isActive?: boolean;
  vendorId?: string;
  categoryId?: string; // Kept for backward compatibility
  categories?: Category[];
  images?: string[];
  metadata?: Record<string, any>;
  specifications?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateArticleDto {
  title: string;
  description?: string;
  price?: string;
  stock?: number;
  sku?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isActive?: boolean;
  categoryId?: string; // Kept for backward compatibility
  categoryIds?: string[];
  images?: string[];
  metadata?: Record<string, any>;
  specifications?: Record<string, any>;
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {}

export interface QueryArticlesParams {
  search?: string;
  categoryId?: string; // Kept for backward compatibility
  categoryIds?: string[];
  vendorId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isActive?: boolean;
  minPrice?: string;
  maxPrice?: string;
  minStock?: number;
  maxStock?: number;
  createdAfter?: string;
  createdBefore?: string;
  sortBy?: 'title' | 'price' | 'stock' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface PaginatedArticlesResponse {
  items: Article[];
  total: number;
}

export async function getArticles(params?: QueryArticlesParams): Promise<PaginatedArticlesResponse | undefined> {
  // Generate cache key from params
  const cacheKey = generateArticlesCacheKey({
    vendorId: params?.vendorId,
    status: params?.status,
    search: params?.search,
    categoryId: params?.categoryId,
    categoryIds: params?.categoryIds,
    isActive: params?.isActive,
    minPrice: params?.minPrice,
    maxPrice: params?.maxPrice,
    minStock: params?.minStock,
    maxStock: params?.maxStock,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
    page: params?.offset ? Math.floor(params.offset / (params.limit || 20)) : 0,
    pageSize: params?.limit,
  });
  
  // Get cached data from store
  const { getCachedArticles, setCachedArticles } = useArticlesStore.getState();
  const cachedData = getCachedArticles(cacheKey);
  
  // Make API call
  const response = await get<PaginatedArticlesResponse>('/api/articles', params);
  
  // If response is undefined (304 Not Modified), return cached data from store
  if (!response) {
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  }
  
  // Empty items might indicate a 304 - return cached data if available
  if (!response.items || response.items.length === 0) {
    if (cachedData) {
      return cachedData;
    }
    return response; // Return empty response if no cache
  }
  
  // Update cache with new data
  setCachedArticles(cacheKey, response);
  
  return response;
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  // Get cached data from store
  const { getCachedArticleById, setCachedArticleById } = useArticlesStore.getState();
  const cachedData = getCachedArticleById(id);
  
  // Make API call
  const response = await get<Article>(`/api/articles/${id}`);
  
  // If response is undefined (304 Not Modified), return cached data from store
  if (!response) {
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  }
  
  // Update cache with new data
  setCachedArticleById(id, response);
  
  return response;
}

export async function getArticlesByVendor(vendorId: string, params?: Omit<QueryArticlesParams, 'vendorId'>): Promise<PaginatedArticlesResponse | undefined> {
  // Generate cache key from params
  const cacheKey = generateArticlesCacheKey({
    vendorId,
    status: params?.status,
    search: params?.search,
    categoryId: params?.categoryId,
    categoryIds: params?.categoryIds,
    isActive: params?.isActive,
    minPrice: params?.minPrice,
    maxPrice: params?.maxPrice,
    minStock: params?.minStock,
    maxStock: params?.maxStock,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
    page: params?.offset ? Math.floor(params.offset / (params.limit || 20)) : 0,
    pageSize: params?.limit,
  });
  
  // Get cached data from store
  const { getCachedArticles, setCachedArticles } = useArticlesStore.getState();
  const cachedData = getCachedArticles(cacheKey);
  
  // Make API call
  const response = await get<PaginatedArticlesResponse>(`/api/articles/vendor/${vendorId}`, params);
  
  // If response is undefined (304 Not Modified), return cached data from store
  if (!response) {
    if (cachedData) {
      return cachedData;
    }
    return undefined;
  }
  
  // Empty items might indicate a 304 - return cached data if available
  if (!response.items || response.items.length === 0) {
    if (cachedData) {
      return cachedData;
    }
    return response; // Return empty response if no cache
  }
  
  // Update cache with new data
  setCachedArticles(cacheKey, response);
  
  return response;
}

export async function createArticle(data: CreateArticleDto) {
  return post<Article>('/api/articles', data);
}

export async function updateArticle(id: string, data: UpdateArticleDto) {
  return patch<Article>(`/api/articles/${id}`, data);
}

export async function deleteArticle(id: string) {
  return del<{ message?: string }>(`/api/articles/${id}`);
}

export async function activateArticle(id: string) {
  return patch<Article>(`/api/articles/${id}/activate`);
}

export async function deactivateArticle(id: string) {
  return patch<Article>(`/api/articles/${id}/deactivate`);
}

export async function getArticleHealth() {
  return get<{ status: string; timestamp: string; service: string }>('/api/articles/health');
}

export async function uploadArticleImage(articleId: string, file: File): Promise<Article> {
  const formData = new FormData();
  formData.append('image', file);

  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Tokens are in HttpOnly cookies, browser sends them automatically

  const response = await axios.post<Article>(`${baseURL}/api/articles/${articleId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true, // Required to send cookies
  });
  return response.data;
}

export async function uploadMultipleArticleImages(articleId: string, files: File[]): Promise<Article> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Tokens are in HttpOnly cookies, browser sends them automatically

  const response = await axios.post<Article>(`${baseURL}/api/articles/${articleId}/images/multiple`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true, // Required to send cookies
  });
  return response.data;
}

export async function removeArticleImage(articleId: string, imageUrl: string): Promise<Article> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Tokens are in HttpOnly cookies, browser sends them automatically

  const response = await axios.delete<Article>(`${baseURL}/api/articles/${articleId}/images`, {
    params: { imageUrl },
    headers: {},
    withCredentials: true, // Required to send cookies
  });
  return response.data;
}

