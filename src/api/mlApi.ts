import { apiClient } from './apiClient';
import { MLHealthResponse, MLMetricsData } from '../types';
import { apiService } from '../services/apiService';

export const mlApi = {
  async getHealth(): Promise<MLHealthResponse> {
    try {
      const response = await apiClient.get<MLHealthResponse>('/api/ml/health');
      if (response.data && response.data.status) {
        return response.data;
      }
      return apiService.getMLHealth();
    } catch (error) {
      return apiService.getMLHealth();
    }
  },

  async predict(payload: any): Promise<any> {
    try {
      const response = await apiClient.post('/api/ml/predict', payload);
      if (response.data && response.data.failureProbability !== undefined) {
        return response.data;
      }
      return apiService.predictMLDirect(payload);
    } catch (error) {
      return apiService.predictMLDirect(payload);
    }
  },

  async getMetrics(): Promise<MLMetricsData> {
    // Phase 6 exact metrics stored in ml-service/results/metrics.json
    return {
      dataset_metadata: {
        total_samples: 2000,
        train_samples: 1600,
        test_samples: 400,
        incident_rate_overall: 0.6565,
        random_seed: 42
      },
      selected_model: "Random Forest",
      selection_reason: "Random Forest selected with composite score 0.8636 vs 0.8540 (F1: 0.8587, ROC-AUC: 0.8441, Recall: 0.8897). Offers superior nonlinear decision boundaries for cross-feature interaction.",
      models: {
        logistic_regression: {
          model_name: "Logistic Regression",
          accuracy: 0.8025,
          precision: 0.8407,
          recall: 0.8631,
          f1: 0.8518,
          roc_auc: 0.8477,
          confusion_matrix: {
            true_negatives: 94,
            false_positives: 43,
            false_negatives: 36,
            true_positives: 227
          }
        },
        random_forest: {
          model_name: "Random Forest",
          accuracy: 0.8075,
          precision: 0.8298,
          recall: 0.8897,
          f1: 0.8587,
          roc_auc: 0.8441,
          confusion_matrix: {
            true_negatives: 89,
            false_positives: 48,
            false_negatives: 29,
            true_positives: 234
          }
        }
      },
      feature_importances_random_forest: [
        { feature: "blast_radius_score", importance: 0.2196 },
        { feature: "critical_services_affected", importance: 0.1657 },
        { feature: "dependency_count", importance: 0.1312 },
        { feature: "change_complexity", importance: 0.0932 },
        { feature: "criticality_score", importance: 0.0766 },
        { feature: "dependency_depth", importance: 0.0636 },
        { feature: "service_age", importance: 0.0624 },
        { feature: "historical_failure_rate", importance: 0.0601 },
        { feature: "version_change_size", importance: 0.0564 },
        { feature: "previous_incidents", importance: 0.0268 },
        { feature: "change_type_CONFIG_CHANGE", importance: 0.0079 },
        { feature: "change_type_INFRASTRUCTURE_CHANGE", importance: 0.0076 }
      ]
    };
  },

  async getEvaluationReport(): Promise<any> {
    try {
      const response = await apiClient.get('/api/ml/evaluation');
      if (response.data && response.data.experiment_title) {
        return response.data;
      }
      return apiService.getEvaluationReport();
    } catch {
      return apiService.getEvaluationReport();
    }
  }
};
