// frontend/src/types/api.types.ts
/**
 * API Types
 * Types for API requests, responses, and endpoints
 */

import type { 
  ApiResponse, 
  PaginatedResponse, 
  ErrorResponse,
  PaginationParams,
  FilterCondition,
  SortConfig
} from './common.types';
import type { Customer, Dataset, CustomerFilters } from './data.types';
import type { ChurnPrediction, MLModel, ModelMetrics } from './ml.types';

/**
 * HTTP Method
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request configuration
 */
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * API endpoint definition
 */
export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  requiresAuth?: boolean;
}

/**
 * Authentication
 */
export namespace Auth {
  export interface LoginRequest {
    email: string;
    password: string;
  }

  export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
  }

  export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    company?: string;
  }

  export interface RegisterResponse extends LoginResponse {}

  export interface RefreshTokenRequest {
    refreshToken: string;
  }

  export interface RefreshTokenResponse {
    token: string;
    expiresIn: number;
  }

  export interface ForgotPasswordRequest {
    email: string;
  }

  export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
  }

  export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
  }

  export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'analyst' | 'viewer';
    avatar?: string;
    company?: string;
    department?: string;
    createdAt: Date | string;
    lastLogin?: Date | string;
  }
}

/**
 * Customers API
 */
export namespace Customers {
  export interface ListRequest extends PaginationParams {
    search?: string;
    filters?: CustomerFilters;
  }

  export type ListResponse = PaginatedResponse<Customer>;

  export interface GetRequest {
    customerId: string;
  }

  export type GetResponse = ApiResponse<Customer>;

  export interface CreateRequest {
    customer: Partial<Customer>;
  }

  export type CreateResponse = ApiResponse<Customer>;

  export interface UpdateRequest {
    customerId: string;
    updates: Partial<Customer>;
  }

  export type UpdateResponse = ApiResponse<Customer>;

  export interface DeleteRequest {
    customerId: string;
  }

  export type DeleteResponse = ApiResponse<{ deleted: boolean }>;

  export interface SearchRequest {
    query: string;
    limit?: number;
  }

  export type SearchResponse = ApiResponse<Customer[]>;

  export interface BulkImportRequest {
    file: File;
    mapping?: Record<string, string>;
  }

  export interface BulkImportResponse {
    imported: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }

  export interface StatsResponse {
    total: number;
    active: number;
    churned: number;
    churnRate: number;
    avgRevenue: number;
    totalRevenue: number;
  }
}

/**
 * Datasets API
 */
export namespace Datasets {
  export interface ListRequest extends PaginationParams {}

  export type ListResponse = PaginatedResponse<Dataset>;

  export interface GetRequest {
    datasetId: string;
  }

  export type GetResponse = ApiResponse<Dataset>;

  export interface UploadRequest {
    file: File;
    name?: string;
    description?: string;
    tags?: string[];
  }

  export interface UploadResponse {
    datasetId: string;
    status: 'uploading' | 'processing';
    message: string;
  }

  export interface ProcessRequest {
    datasetId: string;
    options?: {
      cleanData?: boolean;
      removeOutliers?: boolean;
      fillMissing?: boolean;
    };
  }

  export interface ProcessResponse {
    datasetId: string;
    status: 'processing' | 'completed';
    progress: number;
  }

  export interface ValidateRequest {
    datasetId: string;
  }

  export interface ValidateResponse {
    valid: boolean;
    errors: Array<{ row: number; column: string; error: string }>;
    warnings: string[];
  }

  export interface DeleteRequest {
    datasetId: string;
  }

  export type DeleteResponse = ApiResponse<{ deleted: boolean }>;
}

/**
 * ML Predictions API
 */
export namespace ML {
  export interface PredictRequest {
    customerId: string;
    customerData?: Partial<Customer>;
    modelId?: string;
  }

  export type PredictResponse = ApiResponse<ChurnPrediction>;

  export interface PredictBatchRequest {
    customers: Array<{
      customerId: string;
      data: Partial<Customer>;
    }>;
    modelId?: string;
  }

  export interface PredictBatchResponse {
    batchId: string;
    predictions: ChurnPrediction[];
    summary: {
      total: number;
      highRisk: number;
      mediumRisk: number;
      lowRisk: number;
    };
  }

  export interface ModelInfoRequest {
    modelId?: string;
  }

  export type ModelInfoResponse = ApiResponse<MLModel>;

  export interface ModelMetricsRequest {
    modelId: string;
  }

  export type ModelMetricsResponse = ApiResponse<ModelMetrics>;

  export interface RetrainRequest {
    datasetId: string;
    modelType?: string;
    hyperparameters?: Record<string, any>;
  }

  export interface RetrainResponse {
    trainingId: string;
    status: 'queued' | 'training';
    estimatedTime: number;
  }

  export interface FeatureImportanceRequest {
    modelId: string;
  }

  export interface FeatureImportanceResponse {
    features: Array<{
      name: string;
      importance: number;
    }>;
  }

  export interface ShapValuesRequest {
    customerId: string;
    modelId?: string;
  }

  export interface ShapValuesResponse {
    customerId: string;
    values: Array<{
      feature: string;
      value: number;
      shapValue: number;
    }>;
  }

  export interface ConfusionMatrixRequest {
    modelId: string;
  }

  export interface ConfusionMatrixResponse {
    matrix: number[][];
    labels: string[];
  }

  export interface RocCurveRequest {
    modelId: string;
  }

  export interface RocCurveResponse {
    fpr: number[];
    tpr: number[];
    thresholds: number[];
    auc: number;
  }

  export interface PredictionsHistoryRequest extends PaginationParams {
    customerId?: string;
    dateRange?: {
      start: Date | string;
      end: Date | string;
    };
  }

  export type PredictionsHistoryResponse = PaginatedResponse<ChurnPrediction>;
}

/**
 * Clustering API
 */
export namespace Clustering {
  export interface ComputeRequest {
    datasetId: string;
    algorithm: 'kmeans' | 'dbscan' | 'hierarchical';
    numClusters?: number;
    features?: string[];
  }

  export interface ComputeResponse {
    clusteringId: string;
    status: 'computing' | 'completed';
    clusters: number;
  }

  export interface GetClustersRequest {
    clusteringId: string;
  }

  export interface GetClustersResponse {
    clusters: Array<{
      clusterId: number;
      name: string;
      size: number;
      centroid: number[];
      characteristics: Record<string, any>;
    }>;
  }

  export interface GetClusterRequest {
    clusteringId: string;
    clusterId: number;
  }

  export interface GetClusterResponse {
    clusterId: number;
    customers: Customer[];
    statistics: Record<string, any>;
  }

  export interface CustomerSegmentRequest {
    customerId: string;
    clusteringId: string;
  }

  export interface CustomerSegmentResponse {
    customerId: string;
    clusterId: number;
    clusterName: string;
    similarity: number;
  }

  export interface MetricsRequest {
    clusteringId: string;
  }

  export interface MetricsResponse {
    silhouetteScore: number;
    calinskiHarabaszScore: number;
    daviesBouldinScore: number;
    inertia?: number;
  }
}

/**
 * Reports API
 */
export namespace Reports {
  export interface ListRequest extends PaginationParams {
    type?: string;
    status?: string;
  }

  export interface Report {
    id: string;
    name: string;
    type: string;
    status: 'generating' | 'ready' | 'error';
    createdAt: Date | string;
    fileUrl?: string;
    fileSize?: number;
  }

  export type ListResponse = PaginatedResponse<Report>;

  export interface GetRequest {
    reportId: string;
  }

  export type GetResponse = ApiResponse<Report>;

  export interface CreateRequest {
    name: string;
    type: string;
    filters?: CustomerFilters;
    options?: Record<string, any>;
  }

  export interface CreateResponse {
    reportId: string;
    status: 'generating';
  }

  export interface GenerateRequest {
    templateId: string;
    data: Record<string, any>;
  }

  export type GenerateResponse = CreateResponse;

  export interface DeleteRequest {
    reportId: string;
  }

  export type DeleteResponse = ApiResponse<{ deleted: boolean }>;

  export interface DownloadRequest {
    reportId: string;
  }

  export interface ShareRequest {
    reportId: string;
    emails: string[];
    message?: string;
  }

  export interface ShareResponse {
    shared: boolean;
    recipients: number;
  }

  export interface TemplatesResponse {
    templates: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
    }>;
  }
}

/**
 * Analytics API
 */
export namespace Analytics {
  export interface OverviewRequest {
    dateRange?: {
      start: Date | string;
      end: Date | string;
    };
  }

  export interface OverviewResponse {
    totalCustomers: number;
    churnRate: number;
    revenue: number;
    avgLifetimeValue: number;
    trends: {
      customers: 'up' | 'down' | 'stable';
      churn: 'up' | 'down' | 'stable';
      revenue: 'up' | 'down' | 'stable';
    };
  }

  export interface ChurnRateRequest {
    period: 'daily' | 'weekly' | 'monthly';
    dateRange?: {
      start: Date | string;
      end: Date | string;
    };
  }

  export interface ChurnRateResponse {
    data: Array<{
      date: string;
      churnRate: number;
      churned: number;
      total: number;
    }>;
  }

  export interface RevenueRequest {
    period: 'daily' | 'weekly' | 'monthly';
    dateRange?: {
      start: Date | string;
      end: Date | string;
    };
  }

  export interface RevenueResponse {
    data: Array<{
      date: string;
      revenue: number;
      customers: number;
      avgRevenuePerCustomer: number;
    }>;
  }

  export interface CustomerSegmentsResponse {
    segments: Array<{
      name: string;
      count: number;
      percentage: number;
      avgRevenue: number;
      churnRate: number;
    }>;
  }

  export interface TrendsRequest {
    metrics: string[];
    period: 'daily' | 'weekly' | 'monthly';
    dateRange?: {
      start: Date | string;
      end: Date | string;
    };
  }

  export interface TrendsResponse {
    trends: Record<string, Array<{
      date: string;
      value: number;
    }>>;
  }

  export interface KpiResponse {
    kpis: Array<{
      name: string;
      value: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  }
}

/**
 * Settings API
 */
export namespace Settings {
  export interface GetResponse {
    general: {
      language: string;
      timezone: string;
      currency: string;
      theme: string;
    };
    ml: {
      modelVersion: string;
      autoRetrain: boolean;
      confidenceThreshold: number;
    };
    notifications: {
      email: boolean;
      churnAlerts: boolean;
      reportAlerts: boolean;
      weeklyReports: boolean;
    };
  }

  export interface UpdateRequest {
    general?: Partial<GetResponse['general']>;
    ml?: Partial<GetResponse['ml']>;
    notifications?: Partial<GetResponse['notifications']>;
  }

  export type UpdateResponse = GetResponse;

  export interface MLConfigRequest {
    modelVersion?: string;
    autoRetrain?: boolean;
    confidenceThreshold?: number;
  }

  export interface NotificationsRequest {
    email?: boolean;
    churnAlerts?: boolean;
    reportAlerts?: boolean;
    weeklyReports?: boolean;
  }
}

/**
 * Health Check API
 */
export namespace Health {
  export interface PingResponse {
    status: 'ok';
    timestamp: string;
  }

  export interface StatusResponse {
    status: 'healthy' | 'degraded' | 'down';
    services: {
      database: 'up' | 'down';
      ml: 'up' | 'down';
      storage: 'up' | 'down';
    };
    version: string;
    uptime: number;
  }

  export interface VersionResponse {
    version: string;
    buildDate: string;
    commit?: string;
  }
}

export default {
  // Export all types as namespace
};
