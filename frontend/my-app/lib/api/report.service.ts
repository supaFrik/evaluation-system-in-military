import { apiClient } from './client';
import { UnitAggregate } from '../types';

export const reportService = {
  getUnitAggregates: async (unitId?: string, date?: string): Promise<UnitAggregate[]> => {
    return apiClient.get<UnitAggregate[]>('/reports/unit-aggregate', {
      params: { unitId, date },
    });
  },
};
