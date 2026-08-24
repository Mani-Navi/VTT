import React, { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useAuthStore } from "./store/auth.store";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "MOCK_GOOGLE_CLIENT_ID";

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

    try {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64));

      if (payload.exp && payload.exp * 1000 > Date.now()) {
        setAuth(payload, token);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsCheckingAuth(false);
    }
  }, [setAuth, logout]);

  if (isCheckingAuth) {
    return (
        <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
  );
}