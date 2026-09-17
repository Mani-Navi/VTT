import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: خواندن مستقیم توکن تازه از استوریج برای هر درخواست
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

// Response Interceptor: پاکسازی نشست در صورت انقضا یا نامعتبر بودن ۴۰۱
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isVoiceRequest = error.config?.url?.includes("/voice");

        // فقط اگر خطای ۴۰۱ مربوط به وویس نباشد، نشست باطل شود
        if (error.response?.status === 401 && !isVoiceRequest) {
            localStorage.removeItem("vtt_jwt");
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;