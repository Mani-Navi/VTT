import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage.jsx";
import { RegisterPage } from "../pages/auth/RegisterPage.jsx";
import { DashboardPage } from "../pages/dashboard/DashboardPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuthStore } from "../stores/auth.store";
import { isTokenExpired } from "../utils/jwt";

// لود تنبل صفحات حقوقی الزامی
const PrivacyPolicyPage = lazy(() => import("../pages/legal/PrivacyPolicyPage.jsx"));
const TermsOfServicePage = lazy(() => import("../pages/legal/TermsOfServicePage.jsx"));
const CookiePolicyPage = lazy(() => import("../pages/legal/CookiePolicyPage.jsx"));
const RefundPolicyPage = lazy(() => import("../pages/legal/RefundPolicyPage.jsx"));

// لود تنبل صفحه پروفایل
const ProfilePage = lazy(() =>
    import("../pages/profile/ProfilePage.jsx").then((m) => ({
        default: m.ProfilePage || m.default,
    }))
);

// طبق بند ۲ سند: RoomPage و کتابخانه صوتی در زمان ورود به اتاق لود می‌شوند
const RoomPage = lazy(() =>
    import("../pages/room/RoomPage.jsx").then((m) => ({
        default: m.RoomPage || m.default,
    }))
);

// اسپینر لودینگ هماهنگ با پالت تاریک و استانداردهای دسترس‌پذیری
const LoadingFallback = () => (
    <div
        className="min-h-screen w-full bg-[#090a0f] flex flex-col items-center justify-center gap-3"
        role="status"
        aria-live="polite"
    >
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-zinc-400 font-medium">در حال بارگذاری اطلاعات...</span>
    </div>
);

const RootRedirect = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const token = useAuthStore((state) => state.token);
    const isSessionValid = Boolean(isAuthenticated && token && !isTokenExpired(token));

    return <Navigate to={isSessionValid ? "/dashboard" : "/login"} replace />;
};

export const router = createBrowserRouter([
    { path: "/", element: <RootRedirect /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },

    // مسیرهای عمومی و باز الزامات قانونی (Legal Compliance Routes)
    {
        path: "/privacy-policy",
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <PrivacyPolicyPage />
            </Suspense>
        ),
    },
    {
        path: "/terms-of-service",
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <TermsOfServicePage />
            </Suspense>
        ),
    },
    {
        path: "/cookie-policy",
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <CookiePolicyPage />
            </Suspense>
        ),
    },
    {
        path: "/refund-policy",
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <RefundPolicyPage />
            </Suspense>
        ),
    },

    // مسیرهای محافظت‌شده کاربری
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