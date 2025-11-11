import { get, post, patch, del } from './http';

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
  categoryId?: string;
  images?: string[];
  metadata?: Record<string, any>;
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
  categoryId?: string;
  images?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {}

export interface QueryArticlesParams {
  search?: string;
  categoryId?: string;
  vendorId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface PaginatedArticlesResponse {
  items: Article[];
  total: number;
}

export async function getArticles(params?: QueryArticlesParams) {
  return get<Article[]>('/api/articles', params);
}

export async function getArticleById(id: string) {
  return get<Article>(`/api/articles/${id}`);
}

export async function getArticlesByVendor(vendorId: string, params?: Omit<QueryArticlesParams, 'vendorId'>) {
  return get<PaginatedArticlesResponse>(`/api/articles/vendor/${vendorId}`, params);
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

