import { apiClient } from './client';
import { UserAccount, UserRole, UnitTier } from '../types';

export interface UpdateRoleScopePayload {
  role: UserRole;
  roleTitle?: string;
  unitScopeTier?: UnitTier;
  assignedUnitId?: string;
  assignedUnitIds?: string[];
  platoonId?: string;
  status?: string;
}

export const userService = {
  getAllUsers: async (role?: UserRole, status?: string, search?: string): Promise<UserAccount[]> => {
    return apiClient.get<UserAccount[]>('/users', {
      params: { role, status, search },
    });
  },

  assignSoldier: async (userId: string, soldierId: string): Promise<UserAccount> => {
    return apiClient.put<UserAccount>(`/users/${userId}/assign-soldier`, { soldierId });
  },

  updateRoleScope: async (userId: string, data: UpdateRoleScopePayload): Promise<UserAccount> => {
    return apiClient.put<UserAccount>(`/users/${userId}/role-scope`, data);
  },

  assignUnitsToUser: async (userId: string, unitIds: string[]): Promise<UserAccount> => {
    return apiClient.put<UserAccount>(`/users/${userId}/assigned-units`, { unitIds });
  },

  deleteUser: async (userId: string): Promise<void> => {
    return apiClient.delete<void>(`/users/${userId}`);
  },
};
