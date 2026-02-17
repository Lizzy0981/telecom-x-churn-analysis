// frontend/src/services/api/endpoints.ts
/**
 * API Endpoints
 * Centralized endpoint definitions
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },

  // Users
  USERS: {
    LIST: '/users',
    GET: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile'
  },

  // Data Upload & Processing
  DATA: {
    UPLOAD: '/data/upload',
    PROCESS: '/data/process',
    VALIDATE: '/data/validate',
    PREVIEW: '/data/preview',
    LIST: '/data/list',
    GET: (id: string) => `/data/${id}`,
    DELETE: (id: string) => `/data/${id}`,
    EXPORT: (id: string) => `/data/${id}/export`
  },

  // Customers
  CUSTOMERS: {
    LIST: '/customers',
    GET: (id: string) => `/customers/${id}`,
    CREATE: '/customers',
    UPDATE: (id: string) => `/customers/${id}`,
    DELETE: (id: string) => `/customers/${id}`,
    SEARCH: '/customers/search',
    BULK_IMPORT: '/customers/bulk-import',
    EXPORT: '/customers/export',
    STATS: '/customers/stats'
  },

  // ML Predictions
  ML: {
    PREDICT: '/ml/predict',
    PREDICT_BATCH: '/ml/predict/batch',
    MODEL_INFO: '/ml/model/info',
    MODEL_METRICS: '/ml/model/metrics',
    RETRAIN: '/ml/model/retrain',
    FEATURE_IMPORTANCE: '/ml/feature-importance',
    SHAP_VALUES: '/ml/shap-values',
    CONFUSION_MATRIX: '/ml/confusion-matrix',
    ROC_CURVE: '/ml/roc-curve',
    PREDICTIONS_HISTORY: '/ml/predictions/history'
  },

  // Clustering
  CLUSTERING: {
    COMPUTE: '/clustering/compute',
    GET_CLUSTERS: '/clustering/clusters',
    GET_CLUSTER: (id: string) => `/clustering/clusters/${id}`,
    CUSTOMER_SEGMENT: (customerId: string) => `/clustering/customer/${customerId}`,
    METRICS: '/clustering/metrics',
    EXPORT: '/clustering/export'
  },

  // Reports
  REPORTS: {
    LIST: '/reports',
    GET: (id: string) => `/reports/${id}`,
    CREATE: '/reports',
    GENERATE: '/reports/generate',
    DELETE: (id: string) => `/reports/${id}`,
    DOWNLOAD: (id: string) => `/reports/${id}/download`,
    SHARE: (id: string) => `/reports/${id}/share`,
    TEMPLATES: '/reports/templates'
  },

  // Analytics & Dashboards
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    CHURN_RATE: '/analytics/churn-rate',
    REVENUE: '/analytics/revenue',
    CUSTOMER_SEGMENTS: '/analytics/customer-segments',
    TRENDS: '/analytics/trends',
    KPI: '/analytics/kpi',
    TIME_SERIES: '/analytics/time-series'
  },

  // Settings
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
    ML_CONFIG: '/settings/ml',
    NOTIFICATIONS: '/settings/notifications',
    PREFERENCES: '/settings/preferences',
    EXPORT_DATA: '/settings/export-data',
    DELETE_DATA: '/settings/delete-data'
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    GET: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    PREFERENCES: '/notifications/preferences'
  },

  // Health & Status
  HEALTH: {
    PING: '/health/ping',
    STATUS: '/health/status',
    VERSION: '/health/version'
  }
} as const;

/**
 * Helper function to build endpoint with parameters
 */
export function buildEndpoint(
  template: string,
  params: Record<string, string | number>
): string {
  let endpoint = template;
  
  Object.entries(params).forEach(([key, value]) => {
    endpoint = endpoint.replace(`:${key}`, String(value));
  });
  
  return endpoint;
}

/**
 * Query parameter builder
 */
export function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export default API_ENDPOINTS;
