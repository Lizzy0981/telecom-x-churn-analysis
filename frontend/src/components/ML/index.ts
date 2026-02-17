// frontend/src/components/ML/index.ts
// Export Machine Learning UI components

export { PredictionDashboard } from './PredictionDashboard';
export type { PredictionDashboardProps, Prediction } from './PredictionDashboard';

export { ClusteringViz3D } from './ClusteringViz3D';
export type { ClusteringViz3DProps, ClusterPoint } from './ClusteringViz3D';

export { ExplainabilityDashboard } from './ExplainabilityDashboard';
export type { ExplainabilityDashboardProps } from './ExplainabilityDashboard';

export { ModelPerformance } from './ModelPerformance';
export type { ModelPerformanceProps, PerformanceMetrics } from './ModelPerformance';

export { FeatureImportance } from './FeatureImportance';
export type { FeatureImportanceProps, Feature } from './FeatureImportance';

export { ROCCurve } from './ROCCurve';
export type { ROCCurveProps, ROCPoint } from './ROCCurve';

export { ConfusionMatrix } from './ConfusionMatrix';
export type { ConfusionMatrixProps, ConfusionMatrixData } from './ConfusionMatrix';

export { SHAPWaterfall } from './SHAPWaterfall';
export type { SHAPWaterfallProps, SHAPValue } from './SHAPWaterfall';
