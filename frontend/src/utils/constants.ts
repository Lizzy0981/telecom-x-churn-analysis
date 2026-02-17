// frontend/src/utils/constants.ts
/**
 * Application Constants
 * Global constants and configuration values
 */

/**
 * Application Information
 */
export const APP_NAME = 'Telecom X Pro';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Advanced Churn Prediction & Customer Analytics Platform';
export const APP_AUTHOR = 'Elizabeth Díaz Familia';
export const APP_URL = 'https://telecom-x-pro.com';

/**
 * API Configuration
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const API_TIMEOUT = 30000; // 30 seconds
export const API_VERSION = 'v1';

/**
 * Authentication
 */
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'user_data';
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
export const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  SIDEBAR_STATE: 'sidebar_state',
  TABLE_PAGE_SIZE: 'table_page_size',
  RECENT_SEARCHES: 'recent_searches',
  USER_PREFERENCES: 'user_preferences',
  CACHED_DATA: 'cached_data',
  ML_MODEL_VERSION: 'ml_model_version'
} as const;

/**
 * Routes
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: '/customers/:id',
  PREDICTIONS: '/predictions',
  CLUSTERING: '/clustering',
  REPORTS: '/reports',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: '/profile',
  NOT_FOUND: '*'
} as const;

/**
 * Risk Levels
 */
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const RISK_THRESHOLDS = {
  LOW: 0.4,    // < 40% = low risk
  MEDIUM: 0.7  // 40-70% = medium, >= 70% = high
} as const;

export const RISK_COLORS = {
  low: '#22c55e',    // green
  medium: '#f59e0b', // orange
  high: '#ef4444'    // red
} as const;

export const RISK_LABELS = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk'
} as const;

/**
 * Contract Types
 */
export const CONTRACT_TYPES = {
  MONTH_TO_MONTH: 'Month-to-month',
  ONE_YEAR: 'One year',
  TWO_YEAR: 'Two year'
} as const;

export const CONTRACT_TYPE_OPTIONS = [
  { value: 'Month-to-month', label: 'Month-to-month' },
  { value: 'One year', label: 'One year' },
  { value: 'Two year', label: 'Two year' }
];

/**
 * Payment Methods
 */
export const PAYMENT_METHODS = {
  ELECTRONIC_CHECK: 'Electronic check',
  MAILED_CHECK: 'Mailed check',
  BANK_TRANSFER: 'Bank transfer',
  CREDIT_CARD: 'Credit card'
} as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'Electronic check', label: 'Electronic check' },
  { value: 'Mailed check', label: 'Mailed check' },
  { value: 'Bank transfer', label: 'Bank transfer' },
  { value: 'Credit card', label: 'Credit card' }
];

/**
 * Internet Service Types
 */
export const INTERNET_SERVICE_TYPES = {
  DSL: 'DSL',
  FIBER_OPTIC: 'Fiber optic',
  NO: 'No'
} as const;

export const INTERNET_SERVICE_OPTIONS = [
  { value: 'DSL', label: 'DSL' },
  { value: 'Fiber optic', label: 'Fiber optic' },
  { value: 'No', label: 'No Internet' }
];

/**
 * Yes/No Options
 */
export const YES_NO_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' }
];

/**
 * Gender Options
 */
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

/**
 * ML Model Types
 */
export const ML_MODEL_TYPES = {
  TFJS: 'tfjs',
  BRAIN: 'brain',
  SKLEARN: 'sklearn',
  XGBOOST: 'xgboost'
} as const;

export const ML_MODEL_NAMES = {
  tfjs: 'TensorFlow.js',
  brain: 'Brain.js',
  sklearn: 'Scikit-learn',
  xgboost: 'XGBoost'
} as const;

/**
 * Export Formats
 */
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
  JSON: 'json',
  POWERBI: 'powerbi',
  TABLEAU: 'tableau'
} as const;

export const EXPORT_FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV', icon: '📄' },
  { value: 'excel', label: 'Excel', icon: '📊' },
  { value: 'pdf', label: 'PDF', icon: '📕' },
  { value: 'json', label: 'JSON', icon: '📋' },
  { value: 'powerbi', label: 'Power BI', icon: '📈' },
  { value: 'tableau', label: 'Tableau', icon: '📉' }
];

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  US: 'MM/DD/YYYY',
  EU: 'DD/MM/YYYY',
  FULL: 'MMMM DD, YYYY',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss'
} as const;

/**
 * Pagination
 */
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 200];
export const MAX_PAGE_SIZE = 1000;

/**
 * File Upload
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const ALLOWED_FILE_TYPES = ['.csv', '.xlsx', '.xls', '.json'];
export const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/json'
];

/**
 * Chart Configuration
 */
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1'  // indigo
];

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DONUT: 'donut',
  AREA: 'area',
  SCATTER: 'scatter',
  RADAR: 'radar'
} as const;

/**
 * Time Periods
 */
export const TIME_PERIODS = {
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d',
  LAST_YEAR: '1y',
  ALL_TIME: 'all',
  CUSTOM: 'custom'
} as const;

export const TIME_PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom range' }
];

/**
 * Languages
 */
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  PT: 'pt',
  FR: 'fr',
  AR: 'ar',
  HE: 'he',
  ZH: 'zh',
  RU: 'ru',
  TR: 'tr',
  KO: 'ko',
  JA: 'ja'
} as const;

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'pt', label: 'Português', flag: '🇧🇷' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'he', label: 'עברית', flag: '🇮🇱' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' }
];

/**
 * Currencies
 */
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  DOP: 'DOP',
  BRL: 'BRL',
  MXN: 'MXN'
} as const;

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'DOP', label: 'Dominican Peso', symbol: 'RD$' },
  { value: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
  { value: 'MXN', label: 'Mexican Peso', symbol: 'Mex$' }
];

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer'
} as const;

export const ROLE_LABELS = {
  admin: 'Administrator',
  analyst: 'Analyst',
  viewer: 'Viewer'
} as const;

export const ROLE_PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
  analyst: ['read', 'write', 'export'],
  viewer: ['read']
} as const;

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * Regex Patterns
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\(\)\+]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^[0-9]+$/,
  DECIMAL: /^[0-9]+(\.[0-9]+)?$/
} as const;

/**
 * Debounce Times (milliseconds)
 */
export const DEBOUNCE_TIME = {
  SEARCH: 500,
  INPUT: 300,
  RESIZE: 200,
  SCROLL: 100
} as const;

/**
 * Animation Durations (milliseconds)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

/**
 * Breakpoints (pixels)
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  ENABLE_CLUSTERING: true,
  ENABLE_AUTOML: true,
  ENABLE_REPORTS: true,
  ENABLE_EXPORT: true,
  ENABLE_BATCH_PREDICTIONS: true,
  ENABLE_REALTIME_PREDICTIONS: true,
  ENABLE_DARK_MODE: true,
  ENABLE_MULTI_LANGUAGE: true
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_REQUIRED: 'Authentication required. Please log in.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file.',
  RATE_LIMIT: 'Too many requests. Please try again later.'
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  SAVE_SUCCESS: 'Changes saved successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  UPLOAD_SUCCESS: 'File uploaded successfully!',
  EXPORT_SUCCESS: 'Data exported successfully!',
  PREDICTION_SUCCESS: 'Prediction completed successfully!'
} as const;

/**
 * Default Values
 */
export const DEFAULTS = {
  THEME: 'auto' as const,
  LANGUAGE: 'en' as const,
  CURRENCY: 'USD' as const,
  PAGE_SIZE: 25,
  CHART_TYPE: 'bar' as const,
  TIME_PERIOD: '30d' as const,
  MODEL_TYPE: 'tfjs' as const,
  CONFIDENCE_THRESHOLD: 0.7,
  RISK_THRESHOLD_LOW: 0.4,
  RISK_THRESHOLD_MEDIUM: 0.7
} as const;

export default {
  APP_NAME,
  APP_VERSION,
  API_BASE_URL,
  ROUTES,
  STORAGE_KEYS,
  RISK_LEVELS,
  RISK_THRESHOLDS,
  CONTRACT_TYPES,
  PAYMENT_METHODS,
  DEFAULTS
};
