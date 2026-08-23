import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "../../components/auth/LoginForm";
import { useAuthStore } from "../../store/auth.store";
import { Dices, Sparkles } from "lucide-react";

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
      <div className="min-h-screen bg-vtt-bg flex flex-col justify-center items-center px-4 relative overflow-hidden font-fa" dir="rtl">
        {/* جلوه نوری پس‌زمینه */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-vtt-s1/90 border border-vtt-border p-8 rounded-2xl shadow-2xl backdrop-blur-xl z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-3 shadow-neon">
              <Dices className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-vtt-t1">ورود به میز بازی</h1>
            <p className="text-xs text-vtt-t3 mt-1">پلتفرم سبک و سریع VTT فارسی</p>
          </div>

          <LoginForm onSuccess={() => navigate(redirectPath, { replace: true })} />

          <div className="mt-6 text-center text-xs text-vtt-t3 pt-4 border-t border-vtt-border/60">
            حساب کاربری ندارید؟{" "}
            <Link to="/register" className="text-amber-400 hover:underline font-bold mr-1">
              ثبت‌نام و ساخت اکانت
            </Link>
          </div>
        </div>
      </div>
  );
};