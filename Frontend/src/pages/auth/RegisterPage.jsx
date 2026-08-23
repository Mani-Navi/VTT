import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { useAuthStore } from "../../store/auth.store";
import { Dices, Sparkles, ShieldCheck } from "lucide-react";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // در صورت لاگین بودن، کاربر مستقیماً به داشبورد هدایت می‌شود
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
      <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-fa" dir="rtl">
        {/* هاله‌های نور پس‌زمینه سبک فانتزی */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* هدر صفحه ثبت‌نام */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3 shadow-lg shadow-amber-500/10">
            <Dices className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
            ساخت حساب کاربری VTT
          </h1>
          <p className="mt-1.5 text-xs text-zinc-400">
            میزبانی و تجربه آسان بازی‌های نقش‌آفرینی رومیزی (D&D و...)
          </p>
        </div>

        {/* باکس فرم */}
        <div className="w-full sm:max-w-md z-10">
          <div className="bg-zinc-900/90 border border-zinc-800/90 py-8 px-6 sm:px-8 shadow-2xl rounded-2xl backdrop-blur-xl">
            <RegisterForm onSuccess={() => navigate("/dashboard", { replace: true })} />

            <div className="mt-6 text-center text-xs text-zinc-400 pt-4 border-t border-zinc-800/80">
              قبلاً ثبت‌نام کرده‌اید؟{" "}
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-bold hover:underline mr-1">
                ورود به حساب کاربری
              </Link>
            </div>
          </div>

          {/* فیچرهای کلیدی در زیر فرم */}
          <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            شروع سریع در کمتر از ۶۰ ثانیه
          </span>
            <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            بدون نیاز به نصب برنامه
          </span>
          </div>
        </div>
      </div>
  );
};