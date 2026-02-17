// frontend/src/services/ml/brain/index.ts
/**
 * Brain.js ML Services
 * Simple neural network for lightweight churn prediction
 */

export { SimplePredictor, simplePredictor } from './SimplePredictor';
export type { 
  SimplePredictionInput, 
  SimplePredictionResult 
} from './SimplePredictor';

// Re-export for convenience
export default simplePredictor;
