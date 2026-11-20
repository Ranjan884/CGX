import { apiClient } from './apiClient';
import { Dependency, GraphResponse } from '../types';
import { apiService } from '../services/apiService';

export const dependencyApi = {
  async getGraph(): Promise<GraphResponse> {
    try {
      const response = await apiClient.get<GraphResponse>('/api/dependencies/graph');
      if (response.data && response.data.nodes && response.data.edges) {
        return response.data;
      }
      return apiService.getCompleteGraph();
    } catch (error) {
      return apiService.getCompleteGraph();
    }
  },

  async getAllDependencies(): Promise<Dependency[]> {
    try {
      const response = await apiClient.get<Dependency[]>('/api/dependencies');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return apiService.getDependencies();
    } catch (error) {
      return apiService.getDependencies();
    }
  },

  async getServiceImpact(serviceId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/dependencies/service/${serviceId}`);
      if (response.data) {
        return response.data;
      }
      return apiService.getServiceImpact(serviceId);
    } catch (error) {
      return apiService.getServiceImpact(serviceId);
    }
  },

  async runBFS(serviceId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/dependencies/service/${serviceId}/bfs`);
      if (response.data) {
        return response.data;
      }
      return apiService.runBFS(serviceId);
    } catch (error) {
      return apiService.runBFS(serviceId);
    }
  },

  async runBfs(serviceId: number): Promise<any> {
    return this.runBFS(serviceId);
  },

  async runDFS(serviceId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/dependencies/service/${serviceId}/dfs`);
      if (response.data) {
        return response.data;
      }
      return apiService.runDFS(serviceId);
    } catch (error) {
      return apiService.runDFS(serviceId);
    }
  },

  async runDfs(serviceId: number): Promise<any> {
    return this.runDFS(serviceId);
  },

  async getDependencyPaths(serviceId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/dependencies/service/${serviceId}/paths`);
      if (response.data) {
        return response.data;
      }
      return apiService.getDependencyPaths(serviceId);
    } catch (error) {
      return apiService.getDependencyPaths(serviceId);
    }
  },

  async getCriticalImpact(serviceId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/dependencies/service/${serviceId}/critical-impact`);
      if (response.data) {
        return response.data;
      }
      return apiService.getCriticalImpact(serviceId);
    } catch (error) {
      return apiService.getCriticalImpact(serviceId);
    }
  }
};
