// frontend/src/store/mlStore.ts
/**
 * ML Store (Zustand)
 * Global state for ML predictions and model management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface MLPrediction {
  customerId: string;
  churnProbability: number;
  churnLabel: 0 | 1;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: Array<{
    name: string;
    value: any;
    impact: number;
  }>;
  predictedAt: Date;
}

export interface ModelInfo {
  name: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  trainedOn: Date | null;
  lastUsed: Date | null;
}

interface MLState {
  // Model
  modelInitialized: boolean;
  modelLoading: boolean;
  modelInfo: ModelInfo | null;
  modelType: 'tfjs' | 'brain';
  
  // Predictions
  predictions: MLPrediction[];
  currentPrediction: MLPrediction | null;
  
  // Batch processing
  batchProcessing: boolean;
  batchProgress: number;
  batchTotal: number;
  
  // Feature importance
  featureImportance: Array<{
    name: string;
    importance: number;
  }>;
  
  // Performance metrics
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    aucRoc: number;
    loss: number;
  };
  
  // Settings
  confidenceThreshold: number;
  autoPredict: boolean;
  
  // Error
  error: string | null;
}

interface MLActions {
  // Model actions
  setModelInitialized: (initialized: boolean) => void;
  setModelLoading: (loading: boolean) => void;
  setModelInfo: (info: ModelInfo) => void;
  setModelType: (type: 'tfjs' | 'brain') => void;
  
  // Prediction actions
  addPrediction: (prediction: MLPrediction) => void;
  addPredictions: (predictions: MLPrediction[]) => void;
  setCurrentPrediction: (prediction: MLPrediction | null) => void;
  clearPredictions: () => void;
  removePrediction: (customerId: string) => void;
  
  // Batch actions
  setBatchProcessing: (processing: boolean) => void;
  updateBatchProgress: (completed: number, total: number) => void;
  resetBatchProgress: () => void;
  
  // Feature importance actions
  setFeatureImportance: (features: Array<{ name: string; importance: number }>) => void;
  
  // Metrics actions
  updateMetrics: (metrics: Partial<MLState['metrics']>) => void;
  
  // Settings actions
  setConfidenceThreshold: (threshold: number) => void;
  setAutoPredict: (auto: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  
  // Computed
  getPredictionById: (customerId: string) => MLPrediction | undefined;
  getHighRiskPredictions: (threshold?: number) => MLPrediction[];
  getPredictionsByRiskLevel: (level: 'low' | 'medium' | 'high') => MLPrediction[];
  getAverageChurnProbability: () => number;
  getPredictionsCount: () => { total: number; high: number; medium: number; low: number };
  getTopFeatures: (n?: number) => Array<{ name: string; importance: number }>;
  
  // Reset
  reset: () => void;
}

type MLStore = MLState & MLActions;

const initialState: MLState = {
  modelInitialized: false,
  modelLoading: false,
  modelInfo: null,
  modelType: 'tfjs',
  predictions: [],
  currentPrediction: null,
  batchProcessing: false,
  batchProgress: 0,
  batchTotal: 0,
  featureImportance: [
    { name: 'Tenure', importance: 0.245 },
    { name: 'Monthly Charges', importance: 0.187 },
    { name: 'Total Charges', importance: 0.156 },
    { name: 'Contract Type', importance: 0.134 },
    { name: 'Internet Service', importance: 0.098 },
    { name: 'Payment Method', importance: 0.072 },
    { name: 'Tech Support', importance: 0.045 },
    { name: 'Online Security', importance: 0.034 }
  ],
  metrics: {
    accuracy: 0.873,
    precision: 0.851,
    recall: 0.892,
    f1Score: 0.871,
    aucRoc: 0.915,
    loss: 0.342
  },
  confidenceThreshold: 0.7,
  autoPredict: false,
  error: null
};

export const useMLStore = create<MLStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Model actions
        setModelInitialized: (initialized) => set({ modelInitialized: initialized }),

        setModelLoading: (loading) => set({ modelLoading: loading }),

        setModelInfo: (info) => set({ modelInfo: info }),

        setModelType: (type) => set({ modelType: type }),

        // Prediction actions
        addPrediction: (prediction) =>
          set((state) => ({
            predictions: [prediction, ...state.predictions].slice(0, 1000) // Keep last 1000
          })),

        addPredictions: (predictions) =>
          set((state) => ({
            predictions: [...predictions, ...state.predictions].slice(0, 1000)
          })),

        setCurrentPrediction: (prediction) => set({ currentPrediction: prediction }),

        clearPredictions: () => set({ predictions: [], currentPrediction: null }),

        removePrediction: (customerId) =>
          set((state) => ({
            predictions: state.predictions.filter(p => p.customerId !== customerId),
            currentPrediction: state.currentPrediction?.customerId === customerId 
              ? null 
              : state.currentPrediction
          })),

        // Batch actions
        setBatchProcessing: (processing) => set({ batchProcessing: processing }),

        updateBatchProgress: (completed, total) =>
          set({
            batchProgress: completed,
            batchTotal: total
          }),

        resetBatchProgress: () =>
          set({
            batchProgress: 0,
            batchTotal: 0,
            batchProcessing: false
          }),

        // Feature importance actions
        setFeatureImportance: (features) => set({ featureImportance: features }),

        // Metrics actions
        updateMetrics: (metrics) =>
          set((state) => ({
            metrics: { ...state.metrics, ...metrics }
          })),

        // Settings actions
        setConfidenceThreshold: (threshold) => set({ confidenceThreshold: threshold }),

        setAutoPredict: (auto) => set({ autoPredict: auto }),

        // Error actions
        setError: (error) => set({ error }),

        // Computed
        getPredictionById: (customerId) => {
          return get().predictions.find(p => p.customerId === customerId);
        },

        getHighRiskPredictions: (threshold = 0.7) => {
          return get().predictions.filter(p => p.churnProbability >= threshold);
        },

        getPredictionsByRiskLevel: (level) => {
          return get().predictions.filter(p => p.riskLevel === level);
        },

        getAverageChurnProbability: () => {
          const predictions = get().predictions;
          if (predictions.length === 0) return 0;
          
          const sum = predictions.reduce((acc, p) => acc + p.churnProbability, 0);
          return sum / predictions.length;
        },

        getPredictionsCount: () => {
          const predictions = get().predictions;
          
          return {
            total: predictions.length,
            high: predictions.filter(p => p.riskLevel === 'high').length,
            medium: predictions.filter(p => p.riskLevel === 'medium').length,
            low: predictions.filter(p => p.riskLevel === 'low').length
          };
        },

        getTopFeatures: (n = 5) => {
          return get().featureImportance.slice(0, n);
        },

        // Reset
        reset: () => set(initialState)
      }),
      {
        name: 'ml-store',
        partialize: (state) => ({
          predictions: state.predictions.slice(0, 100), // Only persist last 100
          confidenceThreshold: state.confidenceThreshold,
          autoPredict: state.autoPredict,
          modelType: state.modelType
        })
      }
    ),
    { name: 'MLStore' }
  )
);

export default useMLStore;
