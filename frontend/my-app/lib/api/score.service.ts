import { apiClient } from './client';
import { DailyScore, DailyLockStatus } from '../types';

export interface DailyScoreSheetData {
  date: string;
  lockStatus: DailyLockStatus;
  scores: DailyScore[];
}

export interface LockDatePayload {
  date: string;
  officerName?: string;
  note?: string;
}

export interface UnlockDatePayload {
  date: string;
  officerName?: string;
  reason: string;
}

export const scoreService = {
  getDailyScores: async (date: string, unitId?: string): Promise<DailyScoreSheetData> => {
    return apiClient.get<DailyScoreSheetData>('/scores/daily', {
      params: { date, unitId },
    });
  },

  saveDailyScore: async (score: DailyScore): Promise<DailyScore> => {
    return apiClient.post<DailyScore>('/scores/daily', score);
  },

  lockDate: async (payload: LockDatePayload): Promise<DailyLockStatus> => {
    return apiClient.post<DailyLockStatus>('/scores/lock', payload);
  },

  unlockDate: async (payload: UnlockDatePayload): Promise<DailyLockStatus> => {
    return apiClient.post<DailyLockStatus>('/scores/unlock', payload);
  },

  getDailyLockStatus: async (date: string): Promise<DailyLockStatus> => {
    return apiClient.get<DailyLockStatus>('/scores/lock-status', {
      params: { date },
    });
  },
};
