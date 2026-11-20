import { apiClient } from './apiClient';
import { RiskAnalysisResult } from '../types';
import { apiService } from '../services/apiService';

export interface RiskAnalysisRequestPayload {
  serviceId: number;
  changeType: string;
  oldVersion?: string;
  newVersion?: string;
  complexity: number | string;
  description?: string;
}

export const riskApi = {
  async analyzeRisk(payload: RiskAnalysisRequestPayload): Promise<RiskAnalysisResult> {
    try {
      const response = await apiClient.post<RiskAnalysisResult>('/api/risk/analyze', payload);
      if (response.data && response.data.riskLevel) {
        return response.data;
      }
      return apiService.analyzeRiskProposed(payload);
    } catch (error) {
      return apiService.analyzeRiskProposed(payload);
    }
  },

  async analyzeRiskForChange(changeId: number): Promise<RiskAnalysisResult> {
    try {
      const response = await apiClient.post<RiskAnalysisResult>(`/api/risk/analyze/change/${changeId}`);
      if (response.data && response.data.riskLevel) {
        return response.data;
      }
      return apiService.analyzeRiskForChangeRecord(changeId);
    } catch (error) {
      return apiService.analyzeRiskForChangeRecord(changeId);
    }
  },

  async getRiskConfig(): Promise<any> {
    try {
      const response = await apiClient.get('/api/risk/config');
      if (response.data) {
        return response.data;
      }
      return apiService.getRiskConfig();
    } catch (error) {
      return apiService.getRiskConfig();
    }
  }
};
