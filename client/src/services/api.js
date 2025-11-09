import axios from 'axios';
import { triggerLogout } from '../utils/authUtils';

const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            triggerLogout();
        }
        return Promise.reject(error);
    }
);

export default api;
