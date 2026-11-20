import { apiClient } from './apiClient';
import {
  RiskHistoryRecord,
  OutcomeRecordPayload,
  HighRiskServiceStat,
  RiskTrendsResponse,
  HistoricalMLPerformance
} from '../types';
import { apiService } from '../services/apiService';

export const riskHistoryApi = {
  /**
   * GET /api/risk-history
   */
  async getAllHistory(): Promise<RiskHistoryRecord[]> {
    try {
      const response = await apiClient.get<RiskHistoryRecord[]>('/api/risk-history');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return apiService.getRiskHistory();
    } catch (error) {
      return apiService.getRiskHistory();
    }
  },

  /**
   * GET /api/risk-history/{id}
   */
  async getHistoryById(id: number): Promise<RiskHistoryRecord> {
    try {
      const response = await apiClient.get<RiskHistoryRecord>(`/api/risk-history/${id}`);
      if (response.data) {
        return response.data;
      }
      return apiService.getRiskHistoryById(id);
    } catch (error) {
      return apiService.getRiskHistoryById(id);
    }
  },

  /**
   * GET /api/risk-history/service/{serviceId}
   */
  async getHistoryByService(serviceId: number): Promise<RiskHistoryRecord[]> {
    try {
      const response = await apiClient.get<RiskHistoryRecord[]>(`/api/risk-history/service/${serviceId}`);
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return apiService.getRiskHistoryByService(serviceId);
    } catch (error) {
      return apiService.getRiskHistoryByService(serviceId);
    }
  },

  /**
   * PATCH /api/risk-history/{id}/outcome
   */
  async recordOutcome(id: number, payload: OutcomeRecordPayload): Promise<RiskHistoryRecord> {
    try {
      const response = await apiClient.patch<RiskHistoryRecord>(`/api/risk-history/${id}/outcome`, payload);
      if (response.data) {
        return response.data;
      }
      return apiService.recordHistoryOutcome(id, payload);
    } catch (error) {
      return apiService.recordHistoryOutcome(id, payload);
    }
  },

  /**
   * GET /api/risk-history/high-risk-services
   */
  async getHighRiskServices(): Promise<HighRiskServiceStat[]> {
    try {
      const response = await apiClient.get<HighRiskServiceStat[]>('/api/risk-history/high-risk-services');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return apiService.getHighRiskServices();
    } catch (error) {
      return apiService.getHighRiskServices();
    }
  },

  /**
   * GET /api/risk-history/trends
   */
  async getRiskTrends(): Promise<RiskTrendsResponse> {
    try {
      const response = await apiClient.get<RiskTrendsResponse>('/api/risk-history/trends');
      if (response.data && response.data.points) {
        return response.data;
      }
      return apiService.getRiskTrends();
    } catch (error) {
      return apiService.getRiskTrends();
    }
  },

  /**
   * GET /api/risk-history/ml-performance
   */
  async getMLPerformance(): Promise<HistoricalMLPerformance> {
    try {
      const response = await apiClient.get<HistoricalMLPerformance>('/api/risk-history/ml-performance');
      if (response.data && response.data.status) {
        return response.data;
      }
      return apiService.getHistoricalMLPerformance();
    } catch (error) {
      return apiService.getHistoricalMLPerformance();
    }
  }
};
