// frontend/src/services/ml/tfjs/ChurnPredictor.ts
/**
 * Churn Predictor using TensorFlow.js
 * Performs client-side ML inference for churn prediction
 */

import * as tf from '@tensorflow/tfjs';
import { FeatureProcessor } from './FeatureProcessor';
import { ModelLoader } from './ModelLoader';

export interface CustomerData {
  tenure: number;
  monthlyCharges: number;
  totalCharges: number;
  contractType: string;
  paymentMethod: string;
  internetService: string;
  techSupport: string;
  onlineSecurity: string;
  // Add more features as needed
}

export interface ChurnPrediction {
  customerId: string;
  churnProbability: number;
  churnLabel: 0 | 1;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: {
    name: string;
    value: any;
    impact: number;
  }[];
}

export class ChurnPredictor {
  private model: tf.LayersModel | null = null;
  private featureProcessor: FeatureProcessor;
  private modelLoader: ModelLoader;
  private isInitialized: boolean = false;

  constructor() {
    this.featureProcessor = new FeatureProcessor();
    this.modelLoader = new ModelLoader();
  }

  /**
   * Initialize the predictor and load model
   */
  async initialize(modelPath: string = '/models/churn_model/model.json'): Promise<void> {
    if (this.isInitialized) {
      console.log('ChurnPredictor already initialized');
      return;
    }

    try {
      console.log('Initializing ChurnPredictor...');
      
      // Load the model
      this.model = await this.modelLoader.loadModel(modelPath);
      
      this.isInitialized = true;
      console.log('ChurnPredictor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ChurnPredictor:', error);
      throw new Error('Model initialization failed');
    }
  }

  /**
   * Predict churn for a single customer
   */
  async predict(
    customerData: CustomerData,
    customerId: string = 'unknown'
  ): Promise<ChurnPrediction> {
    if (!this.isInitialized || !this.model) {
      throw new Error('ChurnPredictor not initialized. Call initialize() first.');
    }

    try {
      // Process features
      const features = this.featureProcessor.processFeatures(customerData);
      
      // Convert to tensor
      const inputTensor = tf.tensor2d([features]);

      // Make prediction
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const predictionArray = await prediction.data();
      
      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();

      // Get probability (assuming binary classification)
      const churnProbability = predictionArray[0];
      const churnLabel = churnProbability >= 0.5 ? 1 : 0;
      const confidence = churnProbability >= 0.5 ? churnProbability : 1 - churnProbability;

      // Determine risk level
      const riskLevel = this.getRiskLevel(churnProbability);

      // Calculate feature impacts (simplified)
      const factors = this.calculateFeatureImpacts(customerData, churnProbability);

      return {
        customerId,
        churnProbability,
        churnLabel,
        confidence,
        riskLevel,
        factors
      };
    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error('Failed to make prediction');
    }
  }

  /**
   * Predict churn for multiple customers (batch)
   */
  async predictBatch(
    customers: Array<{ data: CustomerData; id: string }>
  ): Promise<ChurnPrediction[]> {
    if (!this.isInitialized || !this.model) {
      throw new Error('ChurnPredictor not initialized. Call initialize() first.');
    }

    try {
      // Process all features
      const allFeatures = customers.map(c => 
        this.featureProcessor.processFeatures(c.data)
      );

      // Convert to tensor (batch)
      const inputTensor = tf.tensor2d(allFeatures);

      // Make batch prediction
      const predictions = this.model.predict(inputTensor) as tf.Tensor;
      const predictionsArray = await predictions.data();

      // Clean up tensors
      inputTensor.dispose();
      predictions.dispose();

      // Process results
      const results: ChurnPrediction[] = customers.map((customer, idx) => {
        const churnProbability = predictionsArray[idx];
        const churnLabel = churnProbability >= 0.5 ? 1 : 0;
        const confidence = churnProbability >= 0.5 ? churnProbability : 1 - churnProbability;
        const riskLevel = this.getRiskLevel(churnProbability);
        const factors = this.calculateFeatureImpacts(customer.data, churnProbability);

        return {
          customerId: customer.id,
          churnProbability,
          churnLabel,
          confidence,
          riskLevel,
          factors
        };
      });

      return results;
    } catch (error) {
      console.error('Batch prediction error:', error);
      throw new Error('Failed to make batch predictions');
    }
  }

  /**
   * Determine risk level based on churn probability
   */
  private getRiskLevel(probability: number): 'low' | 'medium' | 'high' {
    if (probability >= 0.7) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calculate feature impacts (simplified feature importance)
   */
  private calculateFeatureImpacts(
    data: CustomerData,
    probability: number
  ): Array<{ name: string; value: any; impact: number }> {
    // Simplified feature importance (in real scenario, use SHAP or similar)
    const impacts = [
      {
        name: 'Tenure',
        value: `${data.tenure} months`,
        impact: data.tenure < 12 ? 0.35 : -0.15
      },
      {
        name: 'Monthly Charges',
        value: `$${data.monthlyCharges.toFixed(2)}`,
        impact: data.monthlyCharges > 80 ? 0.25 : -0.10
      },
      {
        name: 'Contract Type',
        value: data.contractType,
        impact: data.contractType === 'Month-to-month' ? 0.30 : -0.20
      },
      {
        name: 'Tech Support',
        value: data.techSupport,
        impact: data.techSupport === 'No' ? 0.15 : -0.10
      },
      {
        name: 'Total Charges',
        value: `$${data.totalCharges.toFixed(2)}`,
        impact: data.totalCharges < 500 ? 0.10 : -0.15
      }
    ];

    // Sort by absolute impact
    return impacts.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  /**
   * Get model info
   */
  getModelInfo(): any {
    if (!this.model) {
      return null;
    }

    return {
      name: 'Churn Prediction Model',
      version: '1.0.0',
      inputShape: this.model.inputs[0].shape,
      outputShape: this.model.outputs[0].shape,
      layers: this.model.layers.length,
      trainable: this.model.trainable,
      backend: tf.getBackend()
    };
  }

  /**
   * Dispose model and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isInitialized = false;
    console.log('ChurnPredictor disposed');
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.model !== null;
  }
}

// Export singleton instance
export const churnPredictor = new ChurnPredictor();

export default ChurnPredictor;
