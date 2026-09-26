import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginForm } from "../../components/auth/LoginForm";
import { useAuthStore } from "../../store/auth.store";
import { Dices, Sparkles, ShieldCheck } from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
      <div
          className="min-h-[100dvh] w-full bg-[#090a0f] text-zinc-100 flex flex-col justify-center items-center font-fa select-none relative overflow-x-hidden"
          dir="rtl"
      >
        {/* هاله‌های نور محیطی */}
        <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-80 sm:w-[36rem] h-80 sm:h-[36rem] bg-amber-500/10 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none" />
        <div className="fixed -bottom-24 right-1/4 w-72 sm:w-[30rem] h-72 sm:h-[30rem] bg-amber-600/5 rounded-full blur-[110px] sm:blur-[140px] pointer-events-none" />

        <main className="w-full flex-1 flex items-center justify-center p-3 sm:p-6 py-6 sm:py-12 z-10">
          <div className="w-full max-w-4xl bg-zinc-950/95 border border-zinc-800/90 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/80 backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden my-auto">
            {/* ستون تزئینی دسکتاپ */}
            <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-[#090a0f] border-l border-zinc-800/80 p-8 flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                Next-Gen Persian VTT
              </span>
              </div>

              <div className="relative z-10 my-auto flex flex-col items-center justify-center py-6">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-amber-500/20 border-dashed animate-[spin_25s_linear_infinite]" />

                  <div className="absolute -left-2 top-2 w-28 h-36 bg-gradient-to-tr from-zinc-900 to-zinc-800 border border-amber-500/30 rounded-2xl shadow-xl -rotate-12 flex flex-col items-center justify-center">
                    <Dices className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                    <span className="text-[10px] font-mono text-amber-300 mt-2 font-bold">D20 CRIT</span>
                  </div>

                  <div className="absolute -right-2 bottom-2 w-28 h-36 bg-gradient-to-br from-zinc-900 to-zinc-800/90 border border-zinc-700/60 rounded-2xl shadow-2xl rotate-12 flex flex-col items-center justify-center backdrop-blur-md">
                    <Sparkles className="w-8 h-8 text-amber-400/80" />
                    <span className="text-[10px] font-mono text-zinc-300 mt-2">TABLETOP</span>
                  </div>

                  <div className="absolute -bottom-2 -left-1 w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/50 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse">
                    <ShieldCheck className="w-7 h-7 text-amber-400" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-center space-y-1">
                <div className="text-sm font-black text-amber-400 tracking-wide">
                  Titipool Studio
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  تجربه سریع، روان و بی‌دردسر نقش‌آفرینی روی میز مجازی فارسی.
                </p>
                <div className="text-[10px] text-zinc-600 font-mono pt-2">
                  © 2025 Titipool. All rights reserved.
                </div>
              </div>
            </div>

            {/* محتوای اصلی فرم - کامپکت و لمسی برای موبایل */}
            <div className="lg:col-span-7 p-5 sm:p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="text-center mb-5 sm:mb-6">
                  <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2 shadow-lg shadow-amber-500/10">
                    <Dices className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h1 className="text-lg sm:text-2xl font-black text-zinc-100 tracking-tight">
                    ورود به حساب کاربری
                  </h1>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    برای ورود به میزهای بازی خود مشخصاتتان را وارد کنید
                  </p>
                </div>

                <LoginForm onSuccess={() => navigate("/dashboard", { replace: true })} />
              </div>

              <div className="mt-6 sm:mt-8 text-center text-xs text-zinc-400 pt-3.5 border-t border-zinc-800/80">
                هنوز حساب کاربری ندارید؟{" "}
                <Link
                    to="/register"
                    className="text-amber-400 hover:text-amber-300 font-bold hover:underline mr-1 transition-colors inline-block py-1"
                >
                  هم‌اکنون ثبت‌نام کنید
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
};