import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: خواندن توکن مستقیماً از localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("vtt_jwt");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: خروج و انتقال به صفحه لاگین در صورت خطای 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("vtt_jwt");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;