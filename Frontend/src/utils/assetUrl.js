import { ENV } from "../config/validateEnv";

export function getFullAssetUrl(url) {
    if (!url) return "";
    const trimmed = String(url).trim();
    if (!trimmed) return "";

    // لینک‌های خارجی، Data URL یا Blob
    if (
        trimmed.startsWith("data:") ||
        trimmed.startsWith("blob:") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://")
    ) {
        return trimmed;
    }

    // نرمال‌سازی مسیر آدرس‌های آپلودشده محلی سرور
    const backendBase = ENV.API_BASE_URL.replace(/\/api\/?$/, "") || "http://localhost:8080";
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

    return `${backendBase}${cleanPath}`;
}