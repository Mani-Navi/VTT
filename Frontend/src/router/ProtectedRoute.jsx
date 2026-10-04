import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { isTokenExpired } from "../utils/jwt";

export const ProtectedRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const token = useAuthStore((state) => state.token);
    const logout = useAuthStore((state) => state.logout);
    const location = useLocation();

    const isSessionValid = Boolean(isAuthenticated && token && !isTokenExpired(token));

    useEffect(() => {
        if (isAuthenticated && token && isTokenExpired(token)) {
            logout();
        }
    }, [isAuthenticated, token, logout]);

    if (!isSessionValid) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <Outlet />;
};