import { apiClient } from './apiClient';
import { WhatIfSimulationRequest, WhatIfSimulationResponse } from '../types';
import { apiService } from '../services/apiService';

export const whatIfApi = {
  /**
   * Executes What-If Change Simulation.
   * Calls Spring Boot backend POST /api/simulation/what-if.
   * If backend is unavailable or responds with error, seamlessly evaluates
   * simulation using client-side graph algorithms so user experience is uninterrupted.
   */
  async simulateChange(request: WhatIfSimulationRequest): Promise<WhatIfSimulationResponse> {
    try {
      const response = await apiClient.post<WhatIfSimulationResponse>('/api/simulation/what-if', request);
      if (response.data && response.data.currentState && response.data.simulatedState) {
        return response.data;
      }
      return apiService.simulateWhatIf(request);
    } catch (error) {
      return apiService.simulateWhatIf(request);
    }
  }
};
