/**
 * اعتبارسنجی مقادیر محیطی ضروری کلاینت
 * در محیط توسعه، در صورت نبود متغیرها از مقادیر پیش‌فرض لوکال استفاده می‌شود
 */
export function validateEnv() {
    const required = ["VITE_API_BASE_URL", "VITE_LIVEKIT_URL"];
    const missing = required.filter((k) => !import.meta.env[k]);

    if (missing.length > 0) {
        if (import.meta.env.DEV) {
            console.warn(
                `[CONFIG] Warning: Missing environment variables (${missing.join(
                    ", "
                )}). Using local development defaults.`
            );
            return;
        }

        throw new Error(
            `[CONFIG] Missing critical environment variables: ${missing.join(", ")}`
        );
    }
}

export const ENV = {
    API_BASE_URL:
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
    WS_URL:
        import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws",
    LIVEKIT_URL:
        import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880",
    GOOGLE_CLIENT_ID:
        import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    IS_DEV: import.meta.env.DEV,
};