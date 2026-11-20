import { apiClient } from './apiClient';
import { BankingService } from '../types';
import { apiService } from '../services/apiService';

export const servicesApi = {
  async getServices(): Promise<BankingService[]> {
    try {
      const response = await apiClient.get<BankingService[]>('/api/services');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return apiService.getServices();
    } catch (error) {
      // Fallback to high-fidelity simulated backend data
      return apiService.getServices();
    }
  },

  async getServiceById(id: number): Promise<BankingService | undefined> {
    try {
      const response = await apiClient.get<BankingService>(`/api/services/${id}`);
      if (response.data && response.data.id) {
        return response.data;
      }
      return apiService.getServiceById(id);
    } catch (error) {
      return apiService.getServiceById(id);
    }
  },

  async getServicesByCriticality(criticality: string): Promise<BankingService[]> {
    try {
      const response = await apiClient.get<BankingService[]>(`/api/services/critical/${criticality}`);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return apiService.getServicesByCriticality(criticality);
    } catch (error) {
      return apiService.getServicesByCriticality(criticality);
    }
  }
};
