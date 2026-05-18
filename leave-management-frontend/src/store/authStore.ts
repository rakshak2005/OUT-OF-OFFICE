import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      loading: false,
    }),

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  initAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, isAuthenticated: false, loading: false });
      return;
    }

    try {
      const user = await authService.getMe();
      set({
        user,
        isAuthenticated: true,
        loading: false,
      });
      
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Auth initialization failed:', error);
      authService.logout();
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
}));