import { apiClient } from './client';
import { EmulationCriterion } from '../types';

export const criteriaService = {
  getCriteria: async (activeOnly?: boolean): Promise<EmulationCriterion[]> => {
    return apiClient.get<EmulationCriterion[]>('/criteria', {
      params: { activeOnly },
    });
  },

  getCriterionById: async (id: string): Promise<EmulationCriterion> => {
    return apiClient.get<EmulationCriterion>(`/criteria/${id}`);
  },

  createCriterion: async (criterion: Omit<EmulationCriterion, 'id'> | EmulationCriterion): Promise<EmulationCriterion> => {
    return apiClient.post<EmulationCriterion>('/criteria', criterion);
  },

  updateCriterion: async (id: string, criterion: Partial<EmulationCriterion>): Promise<EmulationCriterion> => {
    return apiClient.put<EmulationCriterion>(`/criteria/${id}`, criterion);
  },

  toggleCriterion: async (id: string): Promise<EmulationCriterion> => {
    return apiClient.patch<EmulationCriterion>(`/criteria/${id}/toggle`);
  },

  deleteCriterion: async (id: string): Promise<void> => {
    return apiClient.delete(`/criteria/${id}`);
  },
};
