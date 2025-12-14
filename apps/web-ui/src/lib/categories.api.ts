import { get, post, patch, del } from './http';
import { Category } from './articles.api';

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export async function getCategories(includeInactive?: boolean): Promise<Category[]> {
  const params = includeInactive ? { includeInactive: 'true' } : undefined;
  return get<Category[]>('/api/categories', params);
}

export async function getCategoryTree(includeInactive?: boolean): Promise<Category[]> {
  const params = includeInactive ? { includeInactive: 'true' } : undefined;
  return get<Category[]>('/api/categories/tree', params);
}

export async function getCategoryById(id: string): Promise<Category> {
  return get<Category>(`/api/categories/${id}`);
}

export async function createCategory(data: CreateCategoryDto): Promise<Category> {
  return post<Category>('/api/categories', data);
}

export async function updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
  return patch<Category>(`/api/categories/${id}`, data);
}

export async function deleteCategory(id: string): Promise<void> {
  return del<void>(`/api/categories/${id}`);
}

