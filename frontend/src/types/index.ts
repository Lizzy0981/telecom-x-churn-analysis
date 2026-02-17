// frontend/src/types/index.ts
/**
 * Types Index
 * Central exports for all TypeScript types
 */

// Common types
export * from './common.types';
export type {
  ApiResponse,
  ResponseMeta,
  PaginationParams,
  PaginatedResponse,
  FilterOperator,
  FilterCondition,
  SortConfig,
  DateRange,
  NumberRange,
  Coordinate,
  DataPoint,
  ColorScheme,
  Status,
  UploadStatus,
  ID,
  Nullable,
  Optional,
  DeepPartial,
  Timestamps,
  SoftDelete,
  BaseEntity,
  SelectOption,
  KeyValue,
  Dictionary,
  ValidationError,
  ErrorResponse,
  LoadingState,
  AsyncState,
  ChartDataPoint,
  ChartSeries,
  TableColumn,
  Tab,
  BreadcrumbItem,
  MenuItem,
  NotificationType,
  Notification,
  ThemeMode,
  LanguageCode,
  CurrencyCode,
  UserRole,
  Permission,
  FileType,
  ExportFormat,
  TimePeriod,
  ChartType,
  RiskLevel,
  ContractType,
  PaymentMethod,
  InternetServiceType
} from './common.types';

// Data types
export * from './data.types';
export type {
  Customer,
  CustomerInput,
  Dataset,
  DatasetStatistics,
  DataValidationError,
  DataUploadRequest,
  DataUploadResponse,
  CustomerFilters,
  CustomerAggregation,
  CustomerSegment,
  Cohort,
  LifecycleStage,
  CustomerJourneyEvent,
  DataQualityReport,
  BulkOperation,
  BulkOperationResult,
  DataExportOptions,
  DataImportOptions,
  CustomerSummary
} from './data.types';

// ML types
export * from './ml.types';
export type {
  MLModelType,
  ModelStatus,
  MLModel,
  ModelMetrics,
  ConfusionMatrix,
  ChurnPrediction,
  PredictionFactor,
  ShapValue,
  FeatureImportance,
  Recommendation,
  BatchPredictionRequest,
  BatchPredictionResponse,
  ModelTrainingRequest,
  ModelTrainingResponse,
  ModelEvaluation,
  RocCurveData,
  PrecisionRecallCurveData,
  LearningCurveData,
  PredictionHistory,
  ModelComparison,
  FeatureEngineeringConfig,
  AutoMLConfig,
  AutoMLResult,
  ModelDeploymentConfig,
  ModelMonitoring
} from './ml.types';

// API types
export * from './api.types';
export type {
  HttpMethod,
  RequestConfig,
  ApiEndpoint
} from './api.types';

// API Namespaces
export type {
  Auth,
  Customers,
  Datasets,
  ML,
  Clustering,
  Reports,
  Analytics,
  Settings,
  Health
} from './api.types';

// Utility type helpers
export type ValueOf<T> = T[keyof T];
export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };
export type Immutable<T> = { readonly [P in keyof T]: T[P] };

// Branded types for type safety
export type Brand<K, T> = K & { __brand: T };
export type CustomerId = Brand<string, 'CustomerId'>;
export type DatasetId = Brand<string, 'DatasetId'>;
export type ModelId = Brand<string, 'ModelId'>;
export type PredictionId = Brand<string, 'PredictionId'>;
export type ReportId = Brand<string, 'ReportId'>;

// Discriminated unions
export type ApiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

export type AsyncResult<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

// Function types
export type Callback<T = void> = () => T;
export type Predicate<T> = (value: T) => boolean;
export type Mapper<T, U> = (value: T) => U;
export type Reducer<T, U> = (accumulator: U, current: T) => U;
export type Comparator<T> = (a: T, b: T) => number;

// React types helpers
export type PropsWithClassName<P = {}> = P & { className?: string };
export type PropsWithChildren<P = {}> = P & { children?: React.ReactNode };
export type PropsWithStyle<P = {}> = P & { style?: React.CSSProperties };

// Default export with commonly used types
export default {
  // Common
  type: {} as ApiResponse,
  type: {} as PaginatedResponse<any>,
  type: {} as FilterCondition,
  type: {} as SortConfig,
  
  // Data
  type: {} as Customer,
  type: {} as Dataset,
  type: {} as CustomerFilters,
  
  // ML
  type: {} as ChurnPrediction,
  type: {} as MLModel,
  type: {} as ModelMetrics,
  
  // API
  type: {} as Auth.LoginRequest,
  type: {} as Auth.User,
  type: {} as Customers.ListRequest,
  type: {} as ML.PredictRequest
};
