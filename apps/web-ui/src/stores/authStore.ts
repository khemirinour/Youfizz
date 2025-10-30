import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiLogin, apiRegister, apiLogout, apiLogoutAll, type AuthResponse, type RegisterPayload } from '@/lib/auth.api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'vendeur' | 'confirmateur' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const res: AuthResponse = await apiLogin({ email, password });
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('token', res.accessToken);
            window.localStorage.setItem('refreshToken', res.refreshToken);
          }

          set({
            user: {
              id: res.user.id,
              email: res.user.email,
              firstName: res.user.firstName ?? '',
              lastName: res.user.lastName ?? '',
              role: (res.user.role as User['role']) || 'vendeur',
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const message =
            (error as any)?.response?.data?.message ||
            (error instanceof Error ? error.message : 'Login failed');
          set({ isLoading: false, error: Array.isArray(message) ? message.join(', ') : message });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          // Backend register returns the created user (no tokens). You may auto-login after register if backend provides tokens later.
          const created = await apiRegister(userData as unknown as RegisterPayload);
          set({
            user: {
              id: created.id,
              email: created.email,
              firstName: created.firstName ?? '',
              lastName: created.lastName ?? '',
              role: (created.role as User['role']) || 'vendeur',
            },
            isAuthenticated: false, // remain unauthenticated until login
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const message =
            (error as any)?.response?.data?.message ||
            (error instanceof Error ? error.message : 'Registration failed');
          set({ isLoading: false, error: Array.isArray(message) ? message.join(', ') : message });
          throw error;
        }
      },

      logout: async () => {
        try {
          const refreshToken = typeof window !== 'undefined' ? window.localStorage.getItem('refreshToken') : null;
          if (refreshToken) {
            await apiLogout(refreshToken);
          }
        } finally {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('refreshToken');
          }
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      logoutAll: async () => {
        try {
          const currentUser = get().user;
          if (currentUser?.id) {
            await apiLogoutAll(currentUser.id);
          }
        } finally {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('refreshToken');
          }
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
