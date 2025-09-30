import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get environment variables with fallbacks
const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3001/api';

const AUTH_TOKEN_KEY = import.meta.env.REACT_APP_AUTH_TOKEN_KEY ||
    import.meta.env.VITE_AUTH_TOKEN_KEY ||
    'authToken';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

// Generic API call function
export const apiCall = async <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    config?: any
): Promise<{ data: T | null; error: string | null }> => {
    try {
        const response: AxiosResponse<T> = await api({
            method,
            url,
            data,
            ...config,
        });

        // Check for token expiration in success response
        if (response.data && (response.data as any).message?.toLowerCase().includes('token expired')) {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            window.location.href = '/signin';
            return { data: null, error: 'Token expired' };
        }

        return { data: response.data, error: null };
    } catch (error: any) {
        return {
            data: null,
            error: error.response?.data?.message || error.message || 'An error occurred'
        };
    }
};

// Auth API functions
export const authAPI = {
    login: (email: string, password: string) =>
        apiCall<{ token: string }>('POST', '/auth/login', { email, password }),

    logout: () => apiCall('POST', '/auth/logout'),

    getProfile: () => apiCall<{ user: any }>('GET', '/auth/profile'),
};

// CRUD convenience functions
export const apiService = {
    get: <T>(url: string, config?: any) => apiCall<T>('GET', url, undefined, config),
    post: <T>(url: string, data?: any, config?: any) => apiCall<T>('POST', url, data, config),
    put: <T>(url: string, data?: any, config?: any) => apiCall<T>('PUT', url, data, config),
    patch: <T>(url: string, data?: any, config?: any) => apiCall<T>('PATCH', url, data, config),
    delete: <T>(url: string, config?: any) => apiCall<T>('DELETE', url, undefined, config),
};