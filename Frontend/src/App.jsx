import React, { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { router } from "./router";
import { useAuthStore } from "./store/auth.store";
import { ENV } from "./config/validateEnv";

/**
 * رمزگشایی ایمن Base64 توکن JWT برای پشتیبانی کامل از کاراکترهای فارسی و UTF-8
 */
function parseJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
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

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const token = localStorage.getItem("vtt_jwt");
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }

    const payload = parseJwtPayload(token);

    if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
      setAuth(payload, token);
    } else {
      localStorage.removeItem("vtt_jwt");
      logout();
    }

    setIsCheckingAuth(false);
  }, [setAuth, logout]);

  if (isCheckingAuth) {
    return (
        <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  return (
      <GoogleOAuthProvider clientId={ENV.GOOGLE_CLIENT_ID || "MOCK_GOOGLE_CLIENT_ID"}>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
  );
}