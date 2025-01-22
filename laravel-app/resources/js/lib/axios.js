import axios from 'axios';
import { usePage } from '@inertiajs/react';

const axiosInstance = axios.create({
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    }
});

// Add interceptor để tự động thêm CSRF token
axiosInstance.interceptors.request.use((config) => {
    const { csrf_token } = usePage().props;
    if (csrf_token) {
        config.headers['X-CSRF-TOKEN'] = csrf_token;
    }
    return config;
});

export default axiosInstance;
