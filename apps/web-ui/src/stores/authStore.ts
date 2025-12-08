import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiLogin, apiRegister, apiLogout, apiLogoutAll, apiRefreshToken, type AuthResponse, type RegisterPayload } from '@/lib/auth.api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'vendeur' | 'confermateur' | 'admin';
}

interface AuthState {
  user: User | null;
  vendorId: string | null;
  confirmateurId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
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
      vendorId: null,
      confirmateurId: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const res: AuthResponse = await apiLogin({ email, password });
          // Tokens are now stored in HttpOnly cookies, not localStorage
          // Only store vendorId and confirmateurId in localStorage (not sensitive)
          if (typeof window !== 'undefined') {
            if (res.vendorId) {
              window.localStorage.setItem('vendorId', res.vendorId);
            }
            if (res.confirmateurId) {
              window.localStorage.setItem('confirmateurId', res.confirmateurId);
            }
          }

          set({
            user: {
              id: res.user.id,
              email: res.user.email,
              firstName: res.user.firstName ?? '',
              lastName: res.user.lastName ?? '',
              role: (res.user.role as User['role']) || 'vendeur',
            },
            vendorId: res.vendorId || null,
            confirmateurId: res.confirmateurId || null,
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
          // Refresh token is in HttpOnly cookie, backend will read it from cookie
          await apiLogout('');
        } finally {
          // Clear localStorage (vendorId, confirmateurId)
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('vendorId');
            window.localStorage.removeItem('confirmateurId');
          }
          // Cookies are cleared by backend
          set({ user: null, vendorId: null, confirmateurId: null, isAuthenticated: false, error: null });
        }
      },

      logoutAll: async () => {
        try {
          const currentUser = get().user;
          if (currentUser?.id) {
            await apiLogoutAll(currentUser.id);
          }
        } finally {
          // Clear localStorage (vendorId, confirmateurId)
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('vendorId');
            window.localStorage.removeItem('confirmateurId');
          }
          // Cookies are cleared by backend
          set({ user: null, vendorId: null, confirmateurId: null, isAuthenticated: false, error: null });
        }
      },

      refreshToken: async () => {
        try {
          if (typeof window === 'undefined') return false;
          
          // Refresh token is in HttpOnly cookie, backend will read it from cookie
          const res: AuthResponse = await apiRefreshToken('');
          
          // Tokens are now stored in HttpOnly cookies, not localStorage
          // Only update vendorId and confirmateurId in localStorage if provided
          if (res.vendorId) {
            window.localStorage.setItem('vendorId', res.vendorId);
          }
          if (res.confirmateurId) {
            window.localStorage.setItem('confirmateurId', res.confirmateurId);
          }

          // Update user data if provided
          if (res.user) {
            set({
              user: {
                id: res.user.id,
                email: res.user.email,
                firstName: res.user.firstName ?? '',
                lastName: res.user.lastName ?? '',
                role: (res.user.role as User['role']) || 'vendeur',
              },
              vendorId: res.vendorId || null,
              confirmateurId: res.confirmateurId || null,
              isAuthenticated: true,
            });
          }

          return true;
        } catch (error) {
          // Refresh failed, clear localStorage
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('vendorId');
            window.localStorage.removeItem('confirmateurId');
          }
          // Cookies are cleared by backend
          set({ user: null, vendorId: null, confirmateurId: null, isAuthenticated: false });
          return false;
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
        vendorId: state.vendorId,
        confirmateurId: state.confirmateurId,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
