// frontend/src/types/ml.types.ts
/**
 * Machine Learning Types
 * Types for ML models, predictions, and related entities
 */

import type { BaseEntity, RiskLevel } from './common.types';
import type { Customer } from './data.types';

/**
 * ML Model type
 */
export type MLModelType = 'tfjs' | 'brain' | 'sklearn' | 'xgboost';

/**
 * ML Model status
 */
export type ModelStatus = 
  | 'training'
  | 'ready'
  | 'deployed'
  | 'deprecated'
  | 'error';

/**
 * ML Model info
 */
export interface MLModel extends Partial<BaseEntity> {
  modelId: string;
  name: string;
  version: string;
  type: MLModelType;
  status: ModelStatus;
  
  // Model details
  description?: string;
  algorithm: string;
  framework: string;
  
  // Training info
  trainedOn?: Date | string;
  trainingDuration?: number;            // Seconds
  trainingDataSize?: number;            // Number of samples
  
  // Performance metrics
  metrics: ModelMetrics;
  
  // Deployment
  deployedAt?: Date | string;
  lastUsed?: Date | string;
  predictionCount?: number;
  
  // Configuration
  hyperparameters?: Record<string, any>;
  features: string[];
  targetVariable: string;
  
  // Metadata
  tags?: string[];
  isActive?: boolean;
}

/**
 * Model performance metrics
 */
export interface ModelMetrics {
  // Classification metrics
  accuracy: number;                     // 0-1
  precision: number;                    // 0-1
  recall: number;                       // 0-1
  f1Score: number;                      // 0-1
  aucRoc: number;                       // 0-1
  
  // Loss
  loss: number;
  
  // Confusion matrix
  confusionMatrix?: ConfusionMatrix;
  
  // Additional metrics
  specificity?: number;
  sensitivity?: number;
  matthewsCorrCoef?: number;            // -1 to 1
  
  // Cross-validation
  cvScore?: number;
  cvStd?: number;
}

/**
 * Confusion matrix
 */
export interface ConfusionMatrix {
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
}

/**
 * Churn prediction
 */
export interface ChurnPrediction extends Partial<BaseEntity> {
  predictionId?: string;
  customerId: string;
  
  // Prediction results
  churnProbability: number;             // 0-1
  churnLabel: 0 | 1;                    // 0 = No churn, 1 = Churn
  confidence: number;                   // 0-1
  riskLevel: RiskLevel;
  
  // Factors
  topFactors?: PredictionFactor[];
  shapValues?: ShapValue[];
  
  // Model info
  modelId?: string;
  modelVersion?: string;
  
  // Timing
  predictedAt: Date | string;
  expiresAt?: Date | string;
  
  // Recommendations
  recommendations?: Recommendation[];
}

/**
 * Prediction factor (feature impact)
 */
export interface PredictionFactor {
  featureName: string;
  value: any;
  impact: number;                       // -1 to 1 (negative = reduces churn, positive = increases)
  importance: number;                   // 0-1
  description?: string;
}

/**
 * SHAP value for explainability
 */
export interface ShapValue {
  feature: string;
  value: number;
  baseValue: number;
  shapValue: number;
}

/**
 * Feature importance
 */
export interface FeatureImportance {
  feature: string;
  importance: number;                   // 0-1
  rank: number;
  category?: 'numerical' | 'categorical' | 'binary';
}

/**
 * Recommendation for customer retention
 */
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'upgrade' | 'support' | 'engagement' | 'contract' | 'other';
  priority: 'high' | 'medium' | 'low';
  estimatedImpact?: number;             // Expected reduction in churn probability
  cost?: number;
  implementationDifficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Batch prediction request
 */
export interface BatchPredictionRequest {
  customers: Array<{
    customerId: string;
    data: Partial<Customer>;
  }>;
  modelId?: string;
  options?: {
    includeFactors?: boolean;
    includeRecommendations?: boolean;
    confidenceThreshold?: number;
  };
}

/**
 * Batch prediction response
 */
export interface BatchPredictionResponse {
  batchId: string;
  status: 'processing' | 'completed' | 'error';
  progress?: number;                    // 0-100
  predictions: ChurnPrediction[];
  summary: {
    total: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    avgChurnProbability: number;
  };
  processedAt: Date | string;
  duration: number;                     // Milliseconds
}

/**
 * Model training request
 */
export interface ModelTrainingRequest {
  datasetId: string;
  modelType: MLModelType;
  algorithm: string;
  
  // Configuration
  hyperparameters?: Record<string, any>;
  features?: string[];
  targetVariable: string;
  
  // Training options
  testSize?: number;                    // 0-1 (e.g., 0.2 = 20% for testing)
  randomState?: number;
  crossValidation?: number;             // Number of folds
  
  // Validation
  validationStrategy?: 'holdout' | 'k-fold' | 'stratified';
  
  // Optimization
  optimize?: boolean;
  optimizationMetric?: 'accuracy' | 'f1' | 'auc_roc' | 'precision' | 'recall';
}

/**
 * Model training response
 */
export interface ModelTrainingResponse {
  trainingId: string;
  status: 'queued' | 'training' | 'completed' | 'failed';
  progress?: number;                    // 0-100
  model?: MLModel;
  logs?: string[];
  errors?: string[];
  startedAt: Date | string;
  completedAt?: Date | string;
  duration?: number;                    // Seconds
}

/**
 * Model evaluation result
 */
export interface ModelEvaluation {
  modelId: string;
  evaluatedAt: Date | string;
  
  // Test set metrics
  testMetrics: ModelMetrics;
  
  // Validation metrics
  validationMetrics?: ModelMetrics;
  
  // Charts data
  rocCurve?: RocCurveData;
  precisionRecallCurve?: PrecisionRecallCurveData;
  learningCurve?: LearningCurveData;
  
  // Feature analysis
  featureImportance: FeatureImportance[];
  
  // Predictions distribution
  predictionsDistribution: {
    bins: number[];
    counts: number[];
  };
}

/**
 * ROC Curve data
 */
export interface RocCurveData {
  fpr: number[];                        // False positive rate
  tpr: number[];                        // True positive rate
  thresholds: number[];
  auc: number;
}

/**
 * Precision-Recall Curve data
 */
export interface PrecisionRecallCurveData {
  precision: number[];
  recall: number[];
  thresholds: number[];
  averagePrecision: number;
}

/**
 * Learning Curve data
 */
export interface LearningCurveData {
  trainSizes: number[];
  trainScores: number[];
  validationScores: number[];
}

/**
 * Prediction history entry
 */
export interface PredictionHistory {
  id: string;
  customerId: string;
  predictions: Array<{
    timestamp: Date | string;
    churnProbability: number;
    riskLevel: RiskLevel;
    modelVersion: string;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  change: number;                       // Change in probability
}

/**
 * Model comparison
 */
export interface ModelComparison {
  models: Array<{
    modelId: string;
    name: string;
    version: string;
    metrics: ModelMetrics;
  }>;
  winner?: string;                      // Model ID of best performing
  comparisonMetric: keyof ModelMetrics;
}

/**
 * Feature engineering config
 */
export interface FeatureEngineeringConfig {
  numericalFeatures?: {
    scaling?: 'standard' | 'minmax' | 'robust';
    handleOutliers?: 'cap' | 'remove' | 'transform';
    polynomialDegree?: number;
  };
  categoricalFeatures?: {
    encoding?: 'onehot' | 'label' | 'target' | 'frequency';
    handleUnknown?: 'error' | 'ignore' | 'indicator';
  };
  missingValues?: {
    strategy?: 'mean' | 'median' | 'mode' | 'constant' | 'drop';
    constantValue?: any;
  };
  featureSelection?: {
    method?: 'variance' | 'correlation' | 'mutual_info' | 'recursive';
    nFeatures?: number;
  };
}

/**
 * AutoML configuration
 */
export interface AutoMLConfig {
  datasetId: string;
  targetVariable: string;
  
  // Models to try
  models?: MLModelType[];
  
  // Time budget
  timeLimit?: number;                   // Minutes
  
  // Optimization
  optimizationMetric: 'accuracy' | 'f1' | 'auc_roc' | 'precision' | 'recall';
  
  // Feature engineering
  autoFeatureEngineering?: boolean;
  
  // Hyperparameter tuning
  hyperparameterTuning?: boolean;
  maxEvaluations?: number;
  
  // Ensemble
  useEnsemble?: boolean;
}

/**
 * AutoML result
 */
export interface AutoMLResult {
  bestModel: MLModel;
  leaderboard: Array<{
    modelId: string;
    score: number;
    rank: number;
  }>;
  totalTime: number;                    // Minutes
  modelsEvaluated: number;
}

/**
 * Model deployment config
 */
export interface ModelDeploymentConfig {
  modelId: string;
  environment: 'development' | 'staging' | 'production';
  
  // Scaling
  replicas?: number;
  autoScaling?: boolean;
  
  // Monitoring
  enableMonitoring?: boolean;
  alertThresholds?: {
    accuracy?: number;
    latency?: number;                   // Milliseconds
    errorRate?: number;
  };
  
  // A/B testing
  trafficPercentage?: number;           // 0-100
  canaryDeployment?: boolean;
}

/**
 * Model monitoring metrics
 */
export interface ModelMonitoring {
  modelId: string;
  period: 'hourly' | 'daily' | 'weekly';
  
  // Performance drift
  performanceDrift?: {
    current: ModelMetrics;
    baseline: ModelMetrics;
    degradation: number;                // Percentage
  };
  
  // Data drift
  dataDrift?: {
    features: Array<{
      name: string;
      driftScore: number;               // 0-1
      significant: boolean;
    }>;
  };
  
  // Prediction stats
  predictionStats: {
    count: number;
    avgLatency: number;                 // Milliseconds
    errorRate: number;
    avgConfidence: number;
  };
  
  // Alerts
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: Date | string;
  }>;
}

export default {
  // Export all types as namespace
};
