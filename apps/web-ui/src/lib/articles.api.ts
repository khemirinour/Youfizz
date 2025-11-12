import { get, post, patch, del } from './http';
import axios from 'axios';

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
  return get<PaginatedArticlesResponse>('/api/articles', params);
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

export async function uploadArticleImage(articleId: string, file: File): Promise<Article> {
  const formData = new FormData();
  formData.append('image', file);

  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

  const response = await axios.post<Article>(`${baseURL}/api/articles/${articleId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    withCredentials: true,
  });
  return response.data;
}

export async function uploadMultipleArticleImages(articleId: string, files: File[]): Promise<Article> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

  const response = await axios.post<Article>(`${baseURL}/api/articles/${articleId}/images/multiple`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    withCredentials: true,
  });
  return response.data;
}

export async function removeArticleImage(articleId: string, imageUrl: string): Promise<Article> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

  const response = await axios.delete<Article>(`${baseURL}/api/articles/${articleId}/images`, {
    params: { imageUrl },
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    withCredentials: true,
  });
  return response.data;
}

