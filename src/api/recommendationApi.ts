import { apiClient } from './apiClient';
import { RecommendationResponse } from '../types';
import { apiService } from '../services/apiService';

export interface RecommendationRequestPayload {
  serviceId: number;
  changeType: string;
  oldVersion?: string;
  newVersion?: string;
  complexity: number | string;
  description?: string;
}

export const recommendationApi = {
  /**
   * POST /api/recommendations/analyze
   */
  async analyzeRecommendations(payload: RecommendationRequestPayload): Promise<RecommendationResponse> {
    try {
      const response = await apiClient.post<RecommendationResponse>('/api/recommendations/analyze', payload);
      if (response.data && response.data.recommendations) {
        return response.data;
      }
      return apiService.getRecommendationsForProposed(payload);
    } catch (error) {
      return apiService.getRecommendationsForProposed(payload);
    }
  },

  /**
   * GET /api/recommendations/change/{changeId}
   */
  async getRecommendationsForChange(changeId: number): Promise<RecommendationResponse> {
    try {
      const response = await apiClient.get<RecommendationResponse>(`/api/recommendations/change/${changeId}`);
      if (response.data && response.data.recommendations) {
        return response.data;
      }
      return apiService.getRecommendationsForChangeRecord(changeId);
    } catch (error) {
      return apiService.getRecommendationsForChangeRecord(changeId);
    }
  }
};
