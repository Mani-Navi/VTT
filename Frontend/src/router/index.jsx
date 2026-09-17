import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage.jsx";
import { RegisterPage } from "../pages/auth/RegisterPage.jsx";
import { DashboardPage } from "../pages/dashboard/DashboardPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuthStore } from "../store/auth.store";

// لود تنبل صفحه پروفایل برای رفع باگ دو نقطه در مسیر قبلی
const ProfilePage = lazy(() =>
    import("../pages/profile/ProfilePage.jsx").then((m) => ({
        default: m.ProfilePage || m.default,
    }))
);

// طبق بند ۲ سند: RoomPage و کتابخانه صوتی ۵۰۰ کیلوبایتی باید فقط در زمان ورود به اتاق لود شوند
const RoomPage = lazy(() =>
    import("../pages/room/RoomPage.jsx").then((m) => ({
        default: m.RoomPage || m.default,
    }))
);

// اسپینر لودینگ هماهنگ با پالت تاریک و طلایی VTT
const LoadingFallback = () => (
    <div className="min-h-screen w-full bg-[#090a0f] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-zinc-400 font-medium">در حال بارگذاری میز بازی...</span>
    </div>
);

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
            {
                path: "/profile",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <ProfilePage />
                    </Suspense>
                ),
            },
            {
                path: "/room/:roomId",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <RoomPage />
                    </Suspense>
                ),
            },
        ],
    },
]);