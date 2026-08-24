import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage.jsx";
import { RegisterPage } from "../pages/auth/RegisterPage.jsx";
import { DashboardPage } from "../pages/dashboard/DashboardPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuthStore } from "../store/auth.store";
import { RoomPage } from "../pages/room/RoomPage";

const RootRedirect = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export const router = createBrowserRouter([
    { path: "/", element: <RootRedirect /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    {
        element: <ProtectedRoute />,
        children: [
            { path: "/dashboard", element: <DashboardPage /> },
            { path: "/room/:roomId", element: <RoomPage /> },
            // مسیر اتاق بازی برای ماژول بعد
            { path: "/room/:roomId", element: <div className="text-vtt-t1 p-6">اتاق بازی</div> },
        ],
    },
]);