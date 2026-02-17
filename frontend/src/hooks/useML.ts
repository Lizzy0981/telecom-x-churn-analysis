// frontend/src/hooks/useML.ts
/**
 * useML Hook
 * Custom hook for ML predictions and model management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { churnPredictor } from '../services/ml/tfjs';
import { simplePredictor } from '../services/ml/brain';
import type { ChurnPrediction, CustomerData } from '../services/ml/tfjs';

export interface UseMLOptions {
  modelType?: 'tfjs' | 'brain';
  modelPath?: string;
  autoInit?: boolean;
  onInitSuccess?: () => void;
  onInitError?: (error: any) => void;
}

export interface UseMLResult {
  initialized: boolean;
  loading: boolean;
  error: any;
  predict: (data: CustomerData, customerId?: string) => Promise<ChurnPrediction | null>;
  predictBatch: (customers: Array<{ data: CustomerData; id: string }>) => Promise<ChurnPrediction[]>;
  modelInfo: any;
  initialize: () => Promise<void>;
}

/**
 * Hook for ML predictions
 */
export function useML(options: UseMLOptions = {}): UseMLResult {
  const {
    modelType = 'tfjs',
    modelPath = '/models/churn_model/model.json',
    autoInit = true,
    onInitSuccess,
    onInitError
  } = options;

  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize model
  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (modelType === 'tfjs') {
        await churnPredictor.initialize(modelPath);
        if (isMounted.current) {
          setModelInfo(churnPredictor.getModelInfo());
        }
      } else {
        simplePredictor.initialize();
        
        // Try to load from localStorage, if not found, train
        try {
          simplePredictor.loadFromLocalStorage();
        } catch {
          await simplePredictor.train();
          simplePredictor.saveToLocalStorage();
        }

        if (isMounted.current) {
          setModelInfo(simplePredictor.getInfo());
        }
      }

      if (isMounted.current) {
        setInitialized(true);
        setLoading(false);
        onInitSuccess?.();
      }
    } catch (err) {
      console.error('Model initialization failed:', err);
      if (isMounted.current) {
        setError(err);
        setLoading(false);
        onInitError?.(err);
      }
    }
  }, [modelType, modelPath, onInitSuccess, onInitError]);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInit) {
      initialize();
    }
  }, [autoInit, initialize]);

  // Predict single customer
  const predict = useCallback(async (
    data: CustomerData,
    customerId: string = 'unknown'
  ): Promise<ChurnPrediction | null> => {
    if (!initialized) {
      console.warn('Model not initialized. Call initialize() first.');
      return null;
    }

    try {
      if (modelType === 'tfjs') {
        return await churnPredictor.predict(data, customerId);
      } else {
        // Convert to SimplePredictor format
        const simpleInput = {
          tenure: data.tenure,
          monthlyCharges: data.monthlyCharges,
          totalCharges: data.totalCharges,
          hasContract: data.contractType !== 'Month-to-month' ? 1 : 0,
          hasTechSupport: data.techSupport === 'Yes' ? 1 : 0
        };

        const result = simplePredictor.predict(simpleInput);
        
        // Convert to ChurnPrediction format
        return {
          customerId,
          churnProbability: result.churnProbability,
          churnLabel: result.churnLabel,
          confidence: result.confidence,
          riskLevel: result.riskLevel,
          factors: []
        };
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err);
      return null;
    }
  }, [initialized, modelType]);

  // Predict batch
  const predictBatch = useCallback(async (
    customers: Array<{ data: CustomerData; id: string }>
  ): Promise<ChurnPrediction[]> => {
    if (!initialized) {
      console.warn('Model not initialized. Call initialize() first.');
      return [];
    }

    try {
      if (modelType === 'tfjs') {
        return await churnPredictor.predictBatch(customers);
      } else {
        // Predict individually for SimplePredictor
        const predictions: ChurnPrediction[] = [];
        
        for (const customer of customers) {
          const prediction = await predict(customer.data, customer.id);
          if (prediction) {
            predictions.push(prediction);
          }
        }

        return predictions;
      }
    } catch (err) {
      console.error('Batch prediction error:', err);
      setError(err);
      return [];
    }
  }, [initialized, modelType, predict]);

  return {
    initialized,
    loading,
    error,
    predict,
    predictBatch,
    modelInfo,
    initialize
  };
}

/**
 * Hook for tracking prediction history
 */
export function usePredictionHistory() {
  const [history, setHistory] = useState<ChurnPrediction[]>([]);

  const addPrediction = useCallback((prediction: ChurnPrediction) => {
    setHistory(prev => [prediction, ...prev].slice(0, 100)); // Keep last 100
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getByCustomerId = useCallback((customerId: string) => {
    return history.filter(p => p.customerId === customerId);
  }, [history]);

  const getHighRisk = useCallback((threshold: number = 0.7) => {
    return history.filter(p => p.churnProbability >= threshold);
  }, [history]);

  return {
    history,
    addPrediction,
    clearHistory,
    getByCustomerId,
    getHighRisk
  };
}

/**
 * Hook for feature importance
 */
export function useFeatureImportance() {
  const [importance, setImportance] = useState<Array<{ name: string; importance: number }>>([]);

  useEffect(() => {
    // Mock feature importance (in real app, get from model)
    setImportance([
      { name: 'Tenure', importance: 0.245 },
      { name: 'Monthly Charges', importance: 0.187 },
      { name: 'Total Charges', importance: 0.156 },
      { name: 'Contract Type', importance: 0.134 },
      { name: 'Internet Service', importance: 0.098 },
      { name: 'Payment Method', importance: 0.072 },
      { name: 'Tech Support', importance: 0.045 },
      { name: 'Online Security', importance: 0.034 }
    ]);
  }, []);

  const getTopN = useCallback((n: number = 5) => {
    return importance.slice(0, n);
  }, [importance]);

  return {
    importance,
    getTopN
  };
}

/**
 * Hook for model performance metrics
 */
export function useModelMetrics() {
  const [metrics, setMetrics] = useState({
    accuracy: 0.873,
    precision: 0.851,
    recall: 0.892,
    f1Score: 0.871,
    aucRoc: 0.915,
    loss: 0.342
  });

  const updateMetrics = useCallback((newMetrics: Partial<typeof metrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  }, []);

  const getPerformanceLevel = useCallback((metric: keyof typeof metrics) => {
    const value = metrics[metric];
    
    if (metric === 'loss') {
      if (value < 0.2) return 'excellent';
      if (value < 0.4) return 'good';
      if (value < 0.6) return 'fair';
      return 'poor';
    } else {
      if (value >= 0.9) return 'excellent';
      if (value >= 0.8) return 'good';
      if (value >= 0.7) return 'fair';
      return 'poor';
    }
  }, [metrics]);

  return {
    metrics,
    updateMetrics,
    getPerformanceLevel
  };
}

/**
 * Hook for real-time predictions with streaming
 */
export function useStreamingPredictions() {
  const [predictions, setPredictions] = useState<ChurnPrediction[]>([]);
  const [processing, setProcessing] = useState(false);
  const { predict } = useML({ autoInit: true });

  const processBatch = useCallback(async (
    customers: Array<{ data: CustomerData; id: string }>,
    onProgress?: (completed: number, total: number) => void
  ) => {
    setProcessing(true);
    setPredictions([]);

    const results: ChurnPrediction[] = [];

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const prediction = await predict(customer.data, customer.id);
      
      if (prediction) {
        results.push(prediction);
        setPredictions([...results]);
      }

      onProgress?.(i + 1, customers.length);
    }

    setProcessing(false);
    return results;
  }, [predict]);

  return {
    predictions,
    processing,
    processBatch
  };
}

export default useML;
