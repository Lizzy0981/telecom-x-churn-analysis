// frontend/src/hooks/useData.ts
/**
 * useData Hook
 * Custom hook for data fetching, caching, and state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/api';

export interface UseDataOptions<T> {
  endpoint?: string;
  params?: Record<string, any>;
  initialData?: T;
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  cacheKey?: string;
  cacheTime?: number; // milliseconds
}

export interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

// Simple in-memory cache
const dataCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Hook for data fetching with caching
 */
export function useData<T = any>(
  options: UseDataOptions<T> = {}
): UseDataResult<T> {
  const {
    endpoint,
    params,
    initialData = null,
    autoFetch = true,
    onSuccess,
    onError,
    cacheKey,
    cacheTime = 5 * 60 * 1000 // 5 minutes default
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!endpoint) return;

    // Check cache
    if (cacheKey) {
      const cached = dataCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<T>(endpoint, params);
      
      if (isMounted.current) {
        setData(response.data);
        setLoading(false);

        // Cache the result
        if (cacheKey) {
          dataCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
          });
        }

        onSuccess?.(response.data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err);
        setLoading(false);
        onError?.(err);
      }
    }
  }, [endpoint, params, cacheKey, cacheTime, onSuccess, onError]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && endpoint) {
      fetchData();
    }
  }, [autoFetch, endpoint, fetchData]);

  // Mutate data manually
  const mutate = useCallback((newData: T) => {
    setData(newData);
    
    // Update cache
    if (cacheKey) {
      dataCache.set(cacheKey, {
        data: newData,
        timestamp: Date.now()
      });
    }
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate
  };
}

/**
 * Hook for paginated data
 */
export function usePaginatedData<T = any>(
  endpoint: string,
  pageSize: number = 20
) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const { data, loading, error, refetch } = useData<{
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  }>({
    endpoint,
    params: { page, pageSize },
    autoFetch: true,
    onSuccess: (response) => {
      setTotalItems(response.total);
      setTotalPages(Math.ceil(response.total / pageSize));
    }
  });

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  return {
    data: data?.items || [],
    loading,
    error,
    page,
    totalPages,
    totalItems,
    pageSize,
    nextPage,
    prevPage,
    goToPage,
    refetch
  };
}

/**
 * Hook for infinite scroll data
 */
export function useInfiniteData<T = any>(
  endpoint: string,
  pageSize: number = 20
) {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, error } = useData<{
    items: T[];
    total: number;
    hasMore: boolean;
  }>({
    endpoint,
    params: { page, pageSize },
    autoFetch: true,
    onSuccess: (response) => {
      setAllData(prev => [...prev, ...response.items]);
      setHasMore(response.hasMore);
    }
  });

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset
  };
}

/**
 * Hook for local storage data
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Save to localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for async operation
 */
export function useAsync<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, execute, reset };
}

/**
 * Clear all data cache
 */
export function clearDataCache(): void {
  dataCache.clear();
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(key: string): void {
  dataCache.delete(key);
}

export default useData;
