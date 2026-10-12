/**
 * Native Fetch HTTP Client (Ponytail: 0 external dependency)
 * Supports automatic Base URL, JWT Authorization header, ApiResponse parsing, and token refresh.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

export const AUTH_TOKEN_KEY =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'thi_dua_jwt_token';
export const REFRESH_TOKEN_KEY =
  process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'thi_dua_refresh_token';

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
  timestamp?: string;
}

export class ApiError extends Error {
  status: number;
  code: number;
  errors?: Array<{ field: string; message: string }>;
  data?: any;

  constructor(message: string, status: number, code: number = status, errors?: Array<{ field: string; message: string }>, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>;
  _retry?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((sub) => sub.resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed(err: any) {
  refreshSubscribers.forEach((sub) => sub.reject(err));
  refreshSubscribers = [];
}

function addRefreshSubscriber(resolve: (token: string) => void, reject: (err: any) => void) {
  refreshSubscribers.push({ resolve, reject });
}

export async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, _retry = false, headers: customHeaders, ...fetchOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const headers = new Headers(customHeaders);
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: fetchOptions.signal || AbortSignal.timeout(3000),
    });
  } catch (err: any) {
    throw new ApiError(err?.message || 'Không thể kết nối đến máy chủ API', 0, 0);
  }

  // Handle 401 Unauthorized with automatic token refresh attempt
  if (response.status === 401 && !_retry && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshRes.ok) {
            throw new Error('Refresh failed');
          }

          const refreshJson: ApiResponse<{ accessToken: string; refreshToken?: string }> = await refreshRes.json();
          const newAccessToken = refreshJson.data?.accessToken;
          if (!newAccessToken) {
            throw new Error('No token returned');
          }

          localStorage.setItem(AUTH_TOKEN_KEY, newAccessToken);
          if (refreshJson.data?.refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshJson.data.refreshToken);
          }

          isRefreshing = false;
          onRefreshed(newAccessToken);
        } catch (refreshErr) {
          isRefreshing = false;
          onRefreshFailed(refreshErr);
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem('thi_dua_user');
          throw new ApiError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', 401, 401);
        }
      }

      return new Promise<T>((resolve, reject) => {
        addRefreshSubscriber(
          (newToken: string) => {
            const retryHeaders = new Headers(headers);
            retryHeaders.set('Authorization', `Bearer ${newToken}`);
            request<T>(endpoint, {
              ...options,
              _retry: true,
              headers: retryHeaders,
            })
              .then(resolve)
              .catch(reject);
          },
          (err: any) => {
            reject(err);
          }
        );
      });
    }
  }

  let json: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      json = await response.json();
    } catch {
      json = null;
    }
  } else {
    const text = await response.text();
    json = { success: response.ok, code: response.status, message: text, data: text };
  }

  if (!response.ok || (json && typeof json === 'object' && json.success === false)) {
    const errorMsg = json?.message || `Yêu cầu thất bại (${response.status})`;
    throw new ApiError(errorMsg, response.status, json?.code || response.status, json?.errors, json?.data);
  }

  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
