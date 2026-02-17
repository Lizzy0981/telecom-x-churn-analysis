// frontend/src/store/authStore.ts
/**
 * Auth Store (Zustand)
 * State management for authentication and user session
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { authService } from '../services/api/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatar?: string;
  company?: string;
  department?: string;
  createdAt: Date;
  lastLogin?: Date;
  preferences?: {
    emailNotifications: boolean;
    weeklyReports: boolean;
    darkMode: boolean;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  
  // Tokens
  tokens: AuthTokens | null;
  
  // Loading & Error
  loading: boolean;
  error: string | null;
  
  // Session
  sessionExpiresAt: number | null;
  rememberMe: boolean;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshToken: () => Promise<void>;
  
  // Password
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  
  // Session management
  checkSession: () => boolean;
  extendSession: () => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset
  reset: () => void;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

const initialState = {
  user: null,
  isAuthenticated: false,
  tokens: null,
  loading: false,
  error: null,
  sessionExpiresAt: null,
  rememberMe: false
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Login
        login: async (email, password, rememberMe = false) => {
          set({ loading: true, error: null });

          try {
            const response = await authService.login({ email, password });
            
            const expiresAt = Date.now() + SESSION_DURATION;
            
            set({
              user: response.user,
              tokens: {
                accessToken: response.token,
                refreshToken: response.refreshToken || '',
                expiresAt
              },
              isAuthenticated: true,
              sessionExpiresAt: expiresAt,
              rememberMe,
              loading: false,
              error: null
            });

            // Start token refresh interval
            if (rememberMe) {
              get().startTokenRefresh();
            }
          } catch (error: any) {
            set({
              loading: false,
              error: error.message || 'Login failed'
            });
            throw error;
          }
        },

        // Logout
        logout: () => {
          authService.logout();
          set(initialState);
        },

        // Register
        register: async (data) => {
          set({ loading: true, error: null });

          try {
            const response = await authService.register(data);
            
            const expiresAt = Date.now() + SESSION_DURATION;
            
            set({
              user: response.user,
              tokens: {
                accessToken: response.token,
                refreshToken: response.refreshToken || '',
                expiresAt
              },
              isAuthenticated: true,
              sessionExpiresAt: expiresAt,
              loading: false,
              error: null
            });
          } catch (error: any) {
            set({
              loading: false,
              error: error.message || 'Registration failed'
            });
            throw error;
          }
        },

        // Update user
        updateUser: (updates) => {
          const user = get().user;
          if (user) {
            set({ user: { ...user, ...updates } });
          }
        },

        // Refresh token
        refreshToken: async () => {
          try {
            const newToken = await authService.refreshToken();
            
            const expiresAt = Date.now() + SESSION_DURATION;
            
            set((state) => ({
              tokens: state.tokens ? {
                ...state.tokens,
                accessToken: newToken,
                expiresAt
              } : null,
              sessionExpiresAt: expiresAt
            }));
          } catch (error: any) {
            console.error('Token refresh failed:', error);
            get().logout();
          }
        },

        // Start token refresh interval
        startTokenRefresh: () => {
          setInterval(() => {
            const { isAuthenticated, tokens } = get();
            
            if (isAuthenticated && tokens) {
              const timeUntilExpiry = tokens.expiresAt - Date.now();
              
              // Refresh if token expires in less than 30 minutes
              if (timeUntilExpiry < 30 * 60 * 1000) {
                get().refreshToken();
              }
            }
          }, TOKEN_REFRESH_INTERVAL);
        },

        // Forgot password
        forgotPassword: async (email) => {
          set({ loading: true, error: null });

          try {
            await authService.forgotPassword(email);
            set({ loading: false });
          } catch (error: any) {
            set({
              loading: false,
              error: error.message || 'Failed to send reset email'
            });
            throw error;
          }
        },

        // Reset password
        resetPassword: async (token, newPassword) => {
          set({ loading: true, error: null });

          try {
            await authService.resetPassword({ token, newPassword });
            set({ loading: false });
          } catch (error: any) {
            set({
              loading: false,
              error: error.message || 'Failed to reset password'
            });
            throw error;
          }
        },

        // Change password
        changePassword: async (oldPassword, newPassword) => {
          set({ loading: true, error: null });

          try {
            // Call API to change password
            // await apiClient.post('/auth/change-password', { oldPassword, newPassword });
            
            set({ loading: false });
          } catch (error: any) {
            set({
              loading: false,
              error: error.message || 'Failed to change password'
            });
            throw error;
          }
        },

        // Check session
        checkSession: () => {
          const { sessionExpiresAt, isAuthenticated } = get();
          
          if (!isAuthenticated || !sessionExpiresAt) {
            return false;
          }

          const isExpired = Date.now() > sessionExpiresAt;
          
          if (isExpired) {
            get().logout();
            return false;
          }

          return true;
        },

        // Extend session
        extendSession: () => {
          const expiresAt = Date.now() + SESSION_DURATION;
          set({ sessionExpiresAt: expiresAt });
        },

        // Set error
        setError: (error) => set({ error }),

        // Clear error
        clearError: () => set({ error: null }),

        // Reset
        reset: () => set(initialState)
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.rememberMe ? state.user : null,
          tokens: state.rememberMe ? state.tokens : null,
          isAuthenticated: state.rememberMe ? state.isAuthenticated : false,
          sessionExpiresAt: state.rememberMe ? state.sessionExpiresAt : null,
          rememberMe: state.rememberMe
        })
      }
    ),
    { name: 'AuthStore' }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin';
export const selectAuthLoading = (state: AuthState) => state.loading;
export const selectAuthError = (state: AuthState) => state.error;

// Permission helpers
export const hasPermission = (permission: string): boolean => {
  const state = useAuthStore.getState();
  const role = state.user?.role;

  const permissions: Record<string, string[]> = {
    admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
    analyst: ['read', 'write', 'export'],
    viewer: ['read']
  };

  return role ? permissions[role]?.includes(permission) || false : false;
};

export default useAuthStore;
