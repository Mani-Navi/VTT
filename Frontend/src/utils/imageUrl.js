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

    // لینک‌های محلی آپلودشده در سرور
    const backendBase =
        import.meta.env.VITE_BACKEND_URL ||
        import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
        "http://localhost:8080";

    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${backendBase}${cleanPath}`;
}