import { apiClient } from './apiClient';
import { ChangeRecord, ChangeType } from '../types';
import { apiService } from '../services/apiService';

export interface CreateChangeInput {
  serviceId: number;
  changeType: ChangeType;
  description: string;
  oldVersion: string;
  newVersion: string;
  complexity: number;
}

export const changesApi = {
  async getChanges(): Promise<ChangeRecord[]> {
    try {
      const response = await apiClient.get<ChangeRecord[]>('/api/changes');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return apiService.getChanges();
    } catch (error) {
      return apiService.getChanges();
    }
  },

  async getChangeById(id: number): Promise<ChangeRecord | undefined> {
    try {
      const response = await apiClient.get<ChangeRecord>(`/api/changes/${id}`);
      if (response.data && response.data.id) {
        return response.data;
      }
      return apiService.getChangeById(id);
    } catch (error) {
      return apiService.getChangeById(id);
    }
  },

  async createChange(input: CreateChangeInput): Promise<ChangeRecord> {
    try {
      const response = await apiClient.post<ChangeRecord>('/api/changes', input);
      if (response.data && response.data.id) {
        return response.data;
      }
      return apiService.createChange(input);
    } catch (error) {
      return apiService.createChange(input);
    }
  }
};
