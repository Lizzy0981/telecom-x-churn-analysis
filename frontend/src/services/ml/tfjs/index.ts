// frontend/src/services/ml/tfjs/index.ts
/**
 * TensorFlow.js ML Services
 * Exports for churn prediction using TensorFlow.js
 */

export { ChurnPredictor, churnPredictor } from './ChurnPredictor';
export type { CustomerData, ChurnPrediction } from './ChurnPredictor';

export { ModelLoader, modelLoader } from './ModelLoader';
export type { ModelMetadata } from './ModelLoader';

export { FeatureProcessor, featureProcessor } from './FeatureProcessor';
export type { FeatureConfig } from './FeatureProcessor';

// Re-export for convenience
export default {
  ChurnPredictor: churnPredictor,
  ModelLoader: modelLoader,
  FeatureProcessor: featureProcessor
};
