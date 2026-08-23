import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "../../components/auth/LoginForm";
import { useAuthStore } from "../../store/auth.store";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const redirectPath = location.state?.from || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
      <div className="min-h-screen bg-vtt-bg flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-sm bg-vtt-s1 border border-vtt-border p-6 rounded-lg shadow-xl">
          <h1 className="text-xl font-bold text-vtt-t1 text-center mb-6 font-fa">
            ورود به میز بازی
          </h1>

          <LoginForm onSuccess={() => navigate(redirectPath, { replace: true })} />

          <div className="mt-5 text-center text-xs text-vtt-t3">
            حساب کاربری ندارید؟{" "}
            <Link to="/register" className="text-neon hover:underline font-medium">
              ثبت‌نام
            </Link>
          </div>
        </div>
      </div>
  );
};