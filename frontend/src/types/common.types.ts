// frontend/src/types/common.types.ts
/**
 * Common Types
 * Generic and reusable TypeScript types
 */

/**
 * Base response type for API calls
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: ResponseMeta;
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  timestamp?: string;
  requestId?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Filter operator types
 */
export type FilterOperator = 
  | 'eq'          // equals
  | 'ne'          // not equals
  | 'gt'          // greater than
  | 'gte'         // greater than or equal
  | 'lt'          // less than
  | 'lte'         // less than or equal
  | 'in'          // in array
  | 'notIn'       // not in array
  | 'contains'    // contains string
  | 'startsWith'  // starts with
  | 'endsWith'    // ends with
  | 'between';    // between range

/**
 * Filter condition
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Date range
 */
export interface DateRange {
  start: Date | string;
  end: Date | string;
}

/**
 * Number range
 */
export interface NumberRange {
  min: number;
  max: number;
}

/**
 * Coordinate (for maps/charts)
 */
export interface Coordinate {
  x: number;
  y: number;
}

/**
 * Point with label
 */
export interface DataPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

/**
 * Color scheme
 */
export type ColorScheme = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

/**
 * Status types
 */
export type Status = 
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'pending';

/**
 * File upload status
 */
export type UploadStatus = 
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'error';

/**
 * Generic ID type
 */
export type ID = string | number;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * Deep partial (makes all properties optional recursively)
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Timestamp fields
 */
export interface Timestamps {
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Soft delete fields
 */
export interface SoftDelete {
  deletedAt?: Date | string | null;
  isDeleted?: boolean;
}

/**
 * Base entity with ID and timestamps
 */
export interface BaseEntity extends Timestamps {
  id: ID;
}

/**
 * Select option (for dropdowns, etc.)
 */
export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

/**
 * Key-value pair
 */
export interface KeyValue<K = string, V = any> {
  key: K;
  value: V;
}

/**
 * Generic dictionary/map
 */
export type Dictionary<T = any> = Record<string, T>;

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  validationErrors?: ValidationError[];
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Async state
 */
export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Dictionary;
}

/**
 * Chart series
 */
export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'scatter';
}

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

/**
 * Tab definition
 */
export interface Tab {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  badge?: number | string;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

/**
 * Menu item
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
  badge?: number | string;
  disabled?: boolean;
}

/**
 * Notification type
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Language code
 */
export type LanguageCode = 
  | 'en' 
  | 'es' 
  | 'pt' 
  | 'fr' 
  | 'ar' 
  | 'he' 
  | 'zh' 
  | 'ru' 
  | 'tr' 
  | 'ko'
  | 'ja';

/**
 * Currency code
 */
export type CurrencyCode = 
  | 'USD' 
  | 'EUR' 
  | 'GBP' 
  | 'JPY' 
  | 'CNY' 
  | 'DOP' 
  | 'BRL' 
  | 'MXN';

/**
 * User role
 */
export type UserRole = 'admin' | 'analyst' | 'viewer';

/**
 * Permission
 */
export type Permission = 
  | 'read' 
  | 'write' 
  | 'delete' 
  | 'export' 
  | 'manage_users' 
  | 'manage_settings';

/**
 * File type
 */
export type FileType = 
  | 'csv' 
  | 'xlsx' 
  | 'xls' 
  | 'json' 
  | 'pdf' 
  | 'txt';

/**
 * Export format
 */
export type ExportFormat = 
  | 'csv' 
  | 'excel' 
  | 'pdf' 
  | 'json' 
  | 'powerbi' 
  | 'tableau';

/**
 * Time period
 */
export type TimePeriod = 
  | '7d' 
  | '30d' 
  | '90d' 
  | '1y' 
  | 'all' 
  | 'custom';

/**
 * Chart type
 */
export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'donut' 
  | 'area' 
  | 'scatter' 
  | 'radar';

/**
 * Risk level
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Contract type
 */
export type ContractType = 
  | 'Month-to-month' 
  | 'One year' 
  | 'Two year';

/**
 * Payment method
 */
export type PaymentMethod = 
  | 'Electronic check' 
  | 'Mailed check' 
  | 'Bank transfer' 
  | 'Credit card';

/**
 * Internet service type
 */
export type InternetServiceType = 
  | 'DSL' 
  | 'Fiber optic' 
  | 'No';

export default {
  // Export all types as namespace
};
