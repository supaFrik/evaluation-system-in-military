import { apiClient } from './client';
import { Soldier, UnitTier } from '../types';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface SoldierQueryParams {
  unitId?: string;
  tier?: UnitTier;
  search?: string;
  page?: number;
  size?: number;
}

export const soldierService = {
  getSoldiers: async (params?: SoldierQueryParams): Promise<PageResponse<Soldier>> => {
    return apiClient.get<PageResponse<Soldier>>('/soldiers', { params: params as any });
  },

  getAllSoldiers: async (unitId?: string): Promise<Soldier[]> => {
    const res = await apiClient.get<any>('/soldiers', {
      params: { unitId, size: 1000 },
    });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.content)) return res.content;
    return [];
  },

  getSoldierById: async (id: string): Promise<Soldier> => {
    return apiClient.get<Soldier>(`/soldiers/${id}`);
  },

  createSoldier: async (soldier: Omit<Soldier, 'id'> | Soldier): Promise<Soldier> => {
    return apiClient.post<Soldier>('/soldiers', soldier);
  },

  updateSoldier: async (id: string, soldier: Partial<Soldier>): Promise<Soldier> => {
    return apiClient.put<Soldier>(`/soldiers/${id}`, soldier);
  },

  deleteSoldier: async (id: string): Promise<void> => {
    return apiClient.delete(`/soldiers/${id}`);
  },
};
