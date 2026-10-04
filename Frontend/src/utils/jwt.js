export function decodeToken(token) {
    if (!token || typeof token !== "string") return null;
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );

        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

/**
 * بررسی انقضای توکن با ۳۰ ثانیه حاشیه امنیتی جهت جبران تاخیر شبکه و اختلاف ساعت کلاینت/سرور
 */
export function isTokenExpired(token, leewaySeconds = 30) {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp - leewaySeconds < currentTime;
}