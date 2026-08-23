import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { useAuthStore } from "../../store/auth.store";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
            ساخت حساب کاربری
          </h1>

          <RegisterForm onSuccess={() => navigate("/dashboard", { replace: true })} />

          <div className="mt-5 text-center text-xs text-vtt-t3">
            حساب کاربری دارید؟{" "}
            <Link to="/login" className="text-neon hover:underline font-medium">
              ورود به حساب
            </Link>
          </div>
        </div>
      </div>
  );
};