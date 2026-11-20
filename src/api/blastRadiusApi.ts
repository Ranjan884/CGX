import { apiClient } from './apiClient';
import { BlastRadiusResult } from '../types';
import { apiService } from '../services/apiService';

export const blastRadiusApi = {
  async getBlastRadiusForService(serviceId: number): Promise<BlastRadiusResult> {
    try {
      const response = await apiClient.get<BlastRadiusResult>(`/api/blast-radius/service/${serviceId}`);
      if (response.data && response.data.blastRadiusScore !== undefined) {
        return response.data;
      }
      return apiService.analyzeBlastRadius(serviceId);
    } catch (error) {
      return apiService.analyzeBlastRadius(serviceId);
    }
  },

  async getBlastRadiusForChange(changeId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/blast-radius/change/${changeId}`);
      if (response.data) {
        return response.data;
      }
      return apiService.analyzeBlastRadiusForChange(changeId);
    } catch (error) {
      return apiService.analyzeBlastRadiusForChange(changeId);
    }
  },

  async analyzeBlastRadius(payload: { serviceId: number }): Promise<BlastRadiusResult> {
    try {
      const response = await apiClient.post<BlastRadiusResult>('/api/blast-radius/analyze', payload);
      if (response.data && response.data.blastRadiusScore !== undefined) {
        return response.data;
      }
      return apiService.analyzeBlastRadius(payload.serviceId);
    } catch (error) {
      return apiService.analyzeBlastRadius(payload.serviceId);
    }
  }
};
