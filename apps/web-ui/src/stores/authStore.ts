import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'vendeur' | 'confirmateur';
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
  logout: () => void;
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
          // TODO: Replace with actual API call
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1500));
          
          // Mock user data - replace with actual API response
          const mockUser: User = {
            id: '1',
            email,
            firstName: 'John',
            lastName: 'Doe',
            role: 'vendeur'
          };
          
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed'
          });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Replace with actual API call
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1500));
          
          // Mock user data - replace with actual API response
          const mockUser: User = {
            id: '1',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role
          };
          
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed'
          });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
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
