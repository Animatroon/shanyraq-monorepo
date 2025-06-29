import axios from 'axios';
import { useAdminAuthStore } from '../store/admin/adminAuthSlice';
import useAuthStore from '../store/auth/authStore'; // Стор для обычных пользователей

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Для отправки httpOnly refresh cookies
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        const isAdminRoute = config.url && config.url.startsWith('/Admin');

        if (isAdminRoute) {
            const adminToken = useAdminAuthStore.getState().token;
            if (adminToken) {
                console.log('Attaching Admin Token:', adminToken.substring(0, 10) + '...'); // Лог для отладки
                config.headers.Authorization = `Bearer ${adminToken}`;
            } else {
                 delete config.headers.Authorization;
                 console.log('Admin route, but no admin token found.');
            }
        } else {
            const userToken = useAuthStore.getState().access; // Получаем токен обычного пользователя
            if (userToken) {
                 console.log('Attaching User Token:', userToken.substring(0, 10) + '...'); // Лог для отладки
                config.headers.Authorization = `Bearer ${userToken}`;
            } else {
                 delete config.headers.Authorization;
                 console.log('Non-admin route, no user token found.');
            }
        }

        return config;
    },
    (error) => {
        console.error('Axios Request Error:', error);
        return Promise.reject(error);
    }
);


export default api;