import { apiClient } from './apiClient';
import { IncidentRecord } from '../types';
import { apiService } from '../services/apiService';

export const incidentApi = {
  async getIncidents(): Promise<IncidentRecord[]> {
    try {
      const response = await apiClient.get<IncidentRecord[]>('/api/incidents');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return apiService.getIncidents();
    } catch (error) {
      return apiService.getIncidents();
    }
  },

  async getFailedIncidents(): Promise<IncidentRecord[]> {
    try {
      const response = await apiClient.get<IncidentRecord[]>('/api/incidents/failed');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return apiService.getIncidents().filter((i) => i.failure);
    } catch (error) {
      return apiService.getIncidents().filter((i) => i.failure);
    }
  }
};
