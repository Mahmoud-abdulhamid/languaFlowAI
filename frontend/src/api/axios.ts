import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Create axios instance with base URL
// In production, this would come from import.meta.env.VITE_API_URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// Add response interceptor for 401 handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Auto logout on 401
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default api;
