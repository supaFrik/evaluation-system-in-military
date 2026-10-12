import { apiClient, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from './client';
import { UserAccount } from '../types';

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserAccount;
}

export interface RegisterPayload {
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface VerifyOtpPayload {
  identifier: string;
  otpCode: string;
}

export interface ResendOtpPayload {
  identifier: string;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponseData> => {
    const data = await apiClient.post<LoginResponseData>('/auth/login', {
      username,
      password,
    });
    if (data.accessToken && typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
      localStorage.setItem('thi_dua_user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (payload: RegisterPayload): Promise<UserAccount> => {
    return apiClient.post<UserAccount>('/auth/register', payload);
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<LoginResponseData> => {
    const data = await apiClient.post<LoginResponseData>('/auth/verify-otp', payload);
    if (data.accessToken && typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
      localStorage.setItem('thi_dua_user', JSON.stringify(data.user));
    }
    return data;
  },

  resendOtp: async (payload: ResendOtpPayload): Promise<void> => {
    await apiClient.post('/auth/resend-otp', payload);
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('thi_dua_user');
    }
  },

  getMe: async (): Promise<UserAccount> => {
    return apiClient.get<UserAccount>('/auth/me');
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> => {
    return apiClient.post('/auth/refresh-token', { refreshToken });
  },
};
