// frontend/src/services/api/client.ts
/**
 * API Client
 * Base HTTP client for API communication
 */

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers
    };
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options: {
      data?: any;
      params?: Record<string, any>;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    } = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Merge headers
    const headers = {
      ...this.defaultHeaders,
      ...options.headers
    };

    // Setup request
    const requestInit: RequestInit = {
      method,
      headers,
      signal: options.signal
    };

    // Add body for POST, PUT, PATCH
    if (options.data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestInit.body = JSON.stringify(options.data);
    }

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), this.timeout);
      });

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(url.toString(), requestInit),
        timeoutPromise
      ]) as Response;

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as any;
      }

      // Check if response is ok
      if (!response.ok) {
        throw {
          message: (data as any)?.message || response.statusText,
          status: response.status,
          code: (data as any)?.code,
          details: data
        } as ApiError;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'AbortError') {
        throw {
          message: 'Request was cancelled',
          code: 'CANCELLED'
        } as ApiError;
      }

      // Re-throw API errors
      if (error.status) {
        throw error;
      }

      // Throw generic error
      throw {
        message: error.message || 'Network error',
        code: 'NETWORK_ERROR',
        details: error
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, { params, signal });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, { data, signal });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, { data, signal });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, { data, signal });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, { signal });
  }

  /**
   * Upload file
   */
  async upload<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress handler
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      // Load handler
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let data: T;
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            data = xhr.responseText as any;
          }

          resolve({
            data,
            status: xhr.status,
            statusText: xhr.statusText,
            headers: {}
          });
        } else {
          reject({
            message: xhr.statusText,
            status: xhr.status
          } as ApiError);
        }
      });

      // Error handler
      xhr.addEventListener('error', () => {
        reject({
          message: 'Upload failed',
          code: 'UPLOAD_ERROR'
        } as ApiError);
      });

      // Abort handler
      if (signal) {
        signal.addEventListener('abort', () => {
          xhr.abort();
          reject({
            message: 'Upload cancelled',
            code: 'CANCELLED'
          } as ApiError);
        });
      }

      // Send request
      xhr.open('POST', url.toString());
      
      // Add auth header if exists
      if (this.defaultHeaders['Authorization']) {
        xhr.setRequestHeader('Authorization', this.defaultHeaders['Authorization']);
      }
      
      xhr.send(formData);
    });
  }
}

// Create and export default instance
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  timeout: 30000
});

export default apiClient;
