import { create } from 'zustand';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface UIState {
  toasts: Toast[];
  language: string;
  theme: 'light' | 'dark' | 'system';
}

interface UIActions {
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  toasts: [],
  language: 'en',
  theme: 'system',

  // Actions
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    };

    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }));
  },

  setLanguage: (language: string) => {
    set({ language });
  },

  setTheme: (theme: 'light' | 'dark' | 'system') => {
    set({ theme });
  }
}));
