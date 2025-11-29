import { create } from 'zustand';
import { Article, PaginatedArticlesResponse } from '@/lib/articles.api';

interface ArticlesState {
  articlesCache: Record<string, PaginatedArticlesResponse>;
  articleByIdCache: Record<string, Article>;
}

interface ArticlesActions {
  setCachedArticles: (key: string, data: PaginatedArticlesResponse) => void;
  getCachedArticles: (key: string) => PaginatedArticlesResponse | undefined;
  setCachedArticleById: (id: string, data: Article) => void;
  getCachedArticleById: (id: string) => Article | undefined;
  clearCache: () => void;
  clearCacheByKey: (key: string) => void;
  clearArticleById: (id: string) => void;
}

type ArticlesStore = ArticlesState & ArticlesActions;

// Helper function to generate cache key from params
export function generateArticlesCacheKey(params?: {
  vendorId?: string;
  status?: string;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}): string {
  if (!params) return 'articles:default';
  
  const parts = [
    params.vendorId || 'all',
    params.status || 'ALL',
    params.search || '',
    params.categoryId || 'all',
    params.isActive !== undefined ? params.isActive.toString() : 'all',
    params.page?.toString() || '0',
    params.pageSize?.toString() || '20',
  ];
  
  return `articles:${parts.join(':')}`;
}

export const useArticlesStore = create<ArticlesStore>((set, get) => ({
  // Initial state
  articlesCache: {},
  articleByIdCache: {},

  // Actions
  setCachedArticles: (key: string, data: PaginatedArticlesResponse) => {
    set((state) => ({
      articlesCache: {
        ...state.articlesCache,
        [key]: data,
      },
    }));
  },

  getCachedArticles: (key: string) => {
    return get().articlesCache[key];
  },

  setCachedArticleById: (id: string, data: Article) => {
    set((state) => ({
      articleByIdCache: {
        ...state.articleByIdCache,
        [id]: data,
      },
    }));
  },

  getCachedArticleById: (id: string) => {
    return get().articleByIdCache[id];
  },

  clearCache: () => {
    set({ articlesCache: {}, articleByIdCache: {} });
  },

  clearCacheByKey: (key: string) => {
    set((state) => {
      const newCache = { ...state.articlesCache };
      delete newCache[key];
      return { articlesCache: newCache };
    });
  },

  clearArticleById: (id: string) => {
    set((state) => {
      const newCache = { ...state.articleByIdCache };
      delete newCache[id];
      return { articleByIdCache: newCache };
    });
  },
}));

