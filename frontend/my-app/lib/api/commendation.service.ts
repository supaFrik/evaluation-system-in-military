import { apiClient } from './client';
import { CommendationItem } from '../types';

export interface CommendationQueryParams {
  date?: string;
  unitId?: string;
  targetId?: string;
}

export const commendationService = {
  getCommendations: async (params?: CommendationQueryParams): Promise<CommendationItem[]> => {
    return apiClient.get<CommendationItem[]>('/commendations', {
      params: params as any,
    });
  },

  createCommendation: async (item: Omit<CommendationItem, 'id'> | CommendationItem): Promise<CommendationItem> => {
    return apiClient.post<CommendationItem>('/commendations', item);
  },

  deleteCommendation: async (id: string): Promise<void> => {
    return apiClient.delete(`/commendations/${id}`);
  },
};
