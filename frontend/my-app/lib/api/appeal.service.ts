import { apiClient } from './client';
import { EmulationAppeal, AppealStatus } from '../types';

export interface CreateAppealPayload {
  soldierId: string;
  soldierName: string;
  unitId: string;
  unitName: string;
  date: string;
  criterionId?: string;
  criterionName?: string;
  deductionPoints?: number;
  reason: string;
}

export interface ResolveAppealPayload {
  status: AppealStatus;
  reply: string;
  resolvedBy?: string;
}

export const appealService = {
  getAppeals: async (params?: {
    unitId?: string;
    soldierId?: string;
    status?: AppealStatus | string;
  }): Promise<EmulationAppeal[]> => {
    return apiClient.get<EmulationAppeal[]>('/appeals', { params });
  },

  createAppeal: async (
    payload: CreateAppealPayload | Omit<EmulationAppeal, 'id' | 'status' | 'createdAt'>
  ): Promise<EmulationAppeal> => {
    return apiClient.post<EmulationAppeal>('/appeals', payload);
  },

  resolveAppeal: async (
    appealId: string,
    status: AppealStatus,
    reply: string,
    resolvedBy?: string
  ): Promise<EmulationAppeal> => {
    return apiClient.put<EmulationAppeal>(`/appeals/${appealId}/resolve`, {
      status,
      reply,
      resolvedBy,
    });
  },
};
