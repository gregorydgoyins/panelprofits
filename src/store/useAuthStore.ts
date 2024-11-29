import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'free' | 'premium' | 'enterprise';
  credits: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateCredits: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (email === 'test@example.com' && password === 'password') {
            set({
              user: {
                id: '1',
                email,
                name: 'Test User',
                role: 'free',
                credits: 100
              },
              isLoading: false
            });
          } else {
            throw new Error('Invalid credentials');
          }
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, error: null });
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({
            user: {
              id: Date.now().toString(),
              email,
              name,
              role: 'free',
              credits: 50
            },
            isLoading: false
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateCredits: (amount: number) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            credits: state.user.credits + amount
          } : null
        }));
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);