import axios from 'axios';
import { backendAPI } from '../utils/constants';
const api = axios.create({
    baseURL: backendAPI,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/';
        }
        if (error.response) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;