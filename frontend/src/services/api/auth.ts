// frontend/src/services/api/auth.ts
/**
 * Authentication Services
 * Handles user authentication and authorization
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  company?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  company?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Token Storage Keys
 */
const TOKEN_KEY = 'telecom_x_auth_token';
const REFRESH_TOKEN_KEY = 'telecom_x_refresh_token';
const USER_KEY = 'telecom_x_user';

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Store tokens and user
      this.setTokens(response.data.token, response.data.refreshToken);
      this.setUser(response.data.user);

      // Set auth header
      apiClient.setAuthToken(response.data.token);

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );

      // Store tokens and user
      this.setTokens(response.data.token, response.data.refreshToken);
      this.setUser(response.data.user);

      // Set auth header
      apiClient.setAuthToken(response.data.token);

      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (optional)
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local data
      this.clearTokens();
      this.clearUser();
      apiClient.clearAuthToken();
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<{ token: string; expiresIn: number }>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      // Update access token
      this.setToken(response.data.token);
      apiClient.setAuthToken(response.data.token);

      return response.data.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid tokens
      this.clearTokens();
      throw error;
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
      
      // Update stored user
      this.setUser(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  },

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  },

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  },

  /**
   * Get stored access token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Get stored user
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  /**
   * Set access token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Set refresh token
   */
  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /**
   * Set both tokens
   */
  setTokens(token: string, refreshToken: string): void {
    this.setToken(token);
    this.setRefreshToken(refreshToken);
  },

  /**
   * Set user data
   */
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Clear tokens
   */
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Clear user data
   */
  clearUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Initialize auth from stored data
   */
  initialize(): void {
    const token = this.getToken();
    if (token) {
      apiClient.setAuthToken(token);
    }
  }
};

// Initialize on load
authService.initialize();

export default authService;
