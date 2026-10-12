import { apiClient } from './client';
import { MilitaryUnit, UnitTier } from '../types';

export interface UnitImportSummary {
  success: boolean;
  totalProcessed: number;
  unitsCreated: number;
  unitsUpdated: number;
  message: string;
  errors?: string[];
}

export const unitService = {
  getAllUnits: async (tier?: UnitTier, parentId?: string): Promise<MilitaryUnit[]> => {
    return apiClient.get<MilitaryUnit[]>('/units', {
      params: { tier, parentId },
    });
  },

  getUnitTree: async (): Promise<MilitaryUnit[]> => {
    return apiClient.get<MilitaryUnit[]>('/units/tree');
  },

  getUnitById: async (id: string): Promise<MilitaryUnit> => {
    return apiClient.get<MilitaryUnit>(`/units/${id}`);
  },

  createUnit: async (data: Partial<MilitaryUnit>): Promise<MilitaryUnit> => {
    return apiClient.post<MilitaryUnit>('/units', data);
  },

  updateUnit: async (id: string, data: Partial<MilitaryUnit>): Promise<MilitaryUnit> => {
    return apiClient.put<MilitaryUnit>(`/units/${id}`, data);
  },

  deleteUnit: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/units/${id}`);
  },

  assignLeader: async (unitId: string, payload: { soldierId?: string; leaderName?: string; leaderTitle?: string }): Promise<MilitaryUnit> => {
    return apiClient.put<MilitaryUnit>(`/units/${unitId}/assign-leader`, payload);
  },

  importUnitsExcel: async (file: File): Promise<UnitImportSummary> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<UnitImportSummary>('/units/import', formData);
  },

  downloadTemplate: async (): Promise<Blob> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';
    const response = await fetch(`${baseUrl}/units/template`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Không thể tải file mẫu Excel');
    }
    return response.blob();
  },

  exportExcel: async (): Promise<Blob> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';
    const response = await fetch(`${baseUrl}/units/export`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Không thể xuất danh sách đơn vị');
    }
    return response.blob();
  },

  recalculateHeadcounts: async (): Promise<void> => {
    return apiClient.post<void>('/units/recalculate-headcounts');
  },

  saveRemark: async (unitId: string, date: string, remark: string): Promise<any> => {
    return apiClient.post(`/units/${unitId}/remarks`, {
      date,
      remark,
    });
  },

  getRemark: async (unitId: string, date: string): Promise<string> => {
    return apiClient.get<string>(`/units/${unitId}/remarks`, {
      params: { date },
    });
  },
};
