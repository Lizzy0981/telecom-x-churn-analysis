// frontend/src/services/api/index.ts
/**
 * API Services Entry Point
 * Centralized exports for all API-related modules
 */

// Export HTTP Client
export { apiClient, default as HttpClient } from './client';
export type { RequestConfig, ApiResponse, ApiError } from './client';

// Export Endpoints
export { API_ENDPOINTS, buildEndpoint, buildQueryParams } from './endpoints';

// Export Auth Service
export { authService } from './auth';
export type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ResetPasswordData
} from './auth';

// Re-export for convenience
export default {
  client: apiClient,
  endpoints: API_ENDPOINTS,
  auth: authService
};
