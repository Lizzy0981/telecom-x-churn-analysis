// frontend/src/types/data.types.ts
/**
 * Data Types
 * Types for customer data, datasets, and related entities
 */

import type { BaseEntity, Timestamps, RiskLevel, ContractType, PaymentMethod, InternetServiceType } from './common.types';

/**
 * Customer entity
 */
export interface Customer extends Partial<BaseEntity> {
  customerId: string;
  name?: string;
  email?: string;
  phone?: string;
  
  // Subscription info
  tenure: number;                        // Months as customer
  monthlyCharges: number;                // Monthly subscription cost
  totalCharges: number;                  // Lifetime total charges
  
  // Contract details
  contractType: ContractType;
  paymentMethod: PaymentMethod;
  paperlessBilling?: boolean;
  
  // Services
  internetService: InternetServiceType;
  onlineBackup?: string;
  onlineSecurity?: string;
  techSupport?: string;
  deviceProtection?: string;
  streamingTV?: string;
  streamingMovies?: string;
  
  // Phone services
  phoneService?: string;
  multipleLines?: string;
  
  // Demographics
  gender?: 'Male' | 'Female' | 'Other';
  seniorCitizen?: boolean;
  partner?: boolean;
  dependents?: boolean;
  
  // Churn prediction
  churnProbability?: number;             // 0-1
  churnLabel?: 0 | 1;                    // 0 = No churn, 1 = Churn
  riskLevel?: RiskLevel;
  predictedAt?: Date | string;
  
  // Status
  status?: 'active' | 'inactive' | 'suspended';
  churnDate?: Date | string | null;
  
  // Metadata
  tags?: string[];
  notes?: string;
  lastInteraction?: Date | string;
}

/**
 * Customer creation/update input
 */
export interface CustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  tenure: number;
  monthlyCharges: number;
  totalCharges: number;
  contractType: ContractType;
  paymentMethod: PaymentMethod;
  internetService: InternetServiceType;
  techSupport?: string;
  onlineSecurity?: string;
  onlineBackup?: string;
  deviceProtection?: string;
  streamingTV?: string;
  streamingMovies?: string;
  phoneService?: string;
  multipleLines?: string;
  paperlessBilling?: boolean;
  gender?: 'Male' | 'Female' | 'Other';
  seniorCitizen?: boolean;
  partner?: boolean;
  dependents?: boolean;
}

/**
 * Dataset entity
 */
export interface Dataset extends BaseEntity {
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;                      // Bytes
  fileSizeFormatted?: string;            // e.g., "2.5 MB"
  fileType: 'csv' | 'xlsx' | 'json';
  
  // Data info
  rowCount: number;
  columnCount: number;
  columns: string[];
  
  // Processing
  status: 'uploading' | 'processing' | 'ready' | 'error';
  processingProgress?: number;           // 0-100
  processingMessage?: string;
  
  // Validation
  validationStatus?: 'pending' | 'passed' | 'failed';
  validationErrors?: DataValidationError[];
  validationWarnings?: string[];
  
  // Statistics
  statistics?: DatasetStatistics;
  
  // Upload info
  uploadedBy?: string;
  uploadDate: Date | string;
  
  // Metadata
  tags?: string[];
  isActive?: boolean;
}

/**
 * Dataset statistics
 */
export interface DatasetStatistics {
  totalCustomers: number;
  activeCustomers: number;
  churnedCustomers: number;
  churnRate: number;                     // Percentage
  avgTenure: number;
  avgMonthlyCharges: number;
  avgTotalCharges: number;
  totalRevenue: number;
  
  // Distribution
  contractTypeDistribution: Record<ContractType, number>;
  paymentMethodDistribution: Record<PaymentMethod, number>;
  riskLevelDistribution: Record<RiskLevel, number>;
  
  // Quality metrics
  completeness: number;                  // Percentage
  missingValues: Record<string, number>;
  duplicateCount: number;
}

/**
 * Data validation error
 */
export interface DataValidationError {
  row: number;
  column: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

/**
 * Data upload request
 */
export interface DataUploadRequest {
  file: File;
  name?: string;
  description?: string;
  tags?: string[];
  validateOnUpload?: boolean;
  processImmediately?: boolean;
}

/**
 * Data upload response
 */
export interface DataUploadResponse {
  datasetId: string;
  status: 'uploading' | 'processing' | 'completed';
  message: string;
  dataset?: Dataset;
}

/**
 * Customer filter options
 */
export interface CustomerFilters {
  search?: string;
  contractTypes?: ContractType[];
  paymentMethods?: PaymentMethod[];
  riskLevels?: RiskLevel[];
  internetServices?: InternetServiceType[];
  tenureRange?: {
    min: number;
    max: number;
  };
  chargesRange?: {
    min: number;
    max: number;
  };
  churnProbabilityRange?: {
    min: number;
    max: number;
  };
  hasChurned?: boolean;
  status?: ('active' | 'inactive' | 'suspended')[];
  gender?: ('Male' | 'Female' | 'Other')[];
  seniorCitizen?: boolean;
  hasPartner?: boolean;
  hasDependents?: boolean;
  tags?: string[];
}

/**
 * Customer aggregation
 */
export interface CustomerAggregation {
  groupBy: string[];
  metrics: {
    field: string;
    operation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'median';
  }[];
}

/**
 * Customer segment
 */
export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  filters: CustomerFilters;
  customerCount: number;
  avgChurnProbability: number;
  avgRevenue: number;
  color?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Cohort analysis
 */
export interface Cohort {
  cohortId: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  customerCount: number;
  retentionRate: number;
  churnRate: number;
  revenue: number;
  avgLifetimeValue: number;
}

/**
 * Customer lifecycle stage
 */
export type LifecycleStage = 
  | 'prospect'
  | 'new'
  | 'active'
  | 'at_risk'
  | 'churned'
  | 'win_back';

/**
 * Customer journey event
 */
export interface CustomerJourneyEvent {
  id: string;
  customerId: string;
  eventType: string;
  eventName: string;
  timestamp: Date | string;
  metadata?: Record<string, any>;
  impact?: 'positive' | 'negative' | 'neutral';
}

/**
 * Data quality report
 */
export interface DataQualityReport {
  datasetId: string;
  timestamp: Date | string;
  
  // Completeness
  completeness: number;                  // Percentage
  missingByField: Record<string, number>;
  
  // Accuracy
  accuracy: number;                      // Percentage
  outlierCount: number;
  outliersDetected: Array<{
    field: string;
    count: number;
    threshold: number;
  }>;
  
  // Consistency
  consistency: number;                   // Percentage
  duplicates: number;
  inconsistencies: Array<{
    field: string;
    issue: string;
    count: number;
  }>;
  
  // Validity
  validity: number;                      // Percentage
  invalidRecords: number;
  validationErrors: DataValidationError[];
  
  // Overall score
  overallScore: number;                  // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * Bulk operation
 */
export interface BulkOperation<T = any> {
  operation: 'create' | 'update' | 'delete';
  items: T[];
  options?: {
    continueOnError?: boolean;
    validateBeforeExecute?: boolean;
  };
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    item: any;
    error: string;
  }>;
  duration: number;                      // Milliseconds
}

/**
 * Data export options
 */
export interface DataExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  fields?: string[];                     // Specific fields to export
  filters?: CustomerFilters;             // Filter before export
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeHeaders?: boolean;
  fileName?: string;
  maxRows?: number;
}

/**
 * Data import options
 */
export interface DataImportOptions {
  file: File;
  mapping?: Record<string, string>;      // Map file columns to schema
  skipValidation?: boolean;
  updateExisting?: boolean;              // Update if customer exists
  identifierField?: string;              // Field to use for matching
}

/**
 * Customer summary
 */
export interface CustomerSummary {
  totalCustomers: number;
  activeCustomers: number;
  churnedCustomers: number;
  churnRate: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalRevenue: number;
  avgRevenue: number;
  avgTenure: number;
}

export default {
  // Export all types as namespace
};
