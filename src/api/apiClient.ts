import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { UserRole } from '../types';

// Get base URL from Vite environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ApiStatus {
  isBackendOnline: boolean;
  lastChecked: Date | null;
  errorMessage?: string;
}

export const apiStatusState: ApiStatus = {
  isBackendOnline: true,
  lastChecked: null,
  errorMessage: undefined
};

// Phase 14: Dynamic Role State (Admin, Engineer, Viewer)
const ROLE_STORAGE_KEY = 'changeguard_user_role';

export const getActiveRole = (): UserRole => {
  try {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    if (saved === 'ADMIN' || saved === 'ENGINEER' || saved === 'VIEWER') {
      return saved;
    }
  } catch {
    // ignore local storage error in non-browser environments
  }
  return 'ADMIN'; // Default to ADMIN for complete portfolio demonstration access
};

export const setActiveRole = (role: UserRole): void => {
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    window.dispatchEvent(new CustomEvent('changeguard:role-changed', { detail: { role } }));
  } catch {
    // ignore
  }
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: Inject active User Role for RBAC & Audit Logging
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const role = getActiveRole();
    if (config.headers) {
      config.headers['X-User-Role'] = role;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    apiStatusState.isBackendOnline = true;
    apiStatusState.lastChecked = new Date();
    apiStatusState.errorMessage = undefined;
    return response;
  },
  (error: AxiosError) => {
    apiStatusState.lastChecked = new Date();
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      apiStatusState.isBackendOnline = false;
      apiStatusState.errorMessage = 'Unable to connect to CGX Spring Boot backend at ' + BASE_URL;
    } else {
      apiStatusState.errorMessage = error.message;
    }
    return Promise.reject(error);
  }
);

export const getApiBaseUrl = (): string => BASE_URL;
