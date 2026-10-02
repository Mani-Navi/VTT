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
        {/* هاله‌های نور محیطی ملایم */}
        <div className="fixed -top-28 left-1/2 -translate-x-1/2 w-80 sm:w-[40rem] h-80 sm:h-[40rem] bg-amber-500/10 rounded-full blur-[110px] sm:blur-[140px] pointer-events-none transition-opacity duration-1000" />
        <div className="fixed -bottom-28 right-1/4 w-72 sm:w-[32rem] h-72 sm:h-[32rem] bg-amber-600/5 rounded-full blur-[120px] sm:blur-[150px] pointer-events-none" />

        <main className="w-full flex-1 flex items-center justify-center p-3.5 sm:p-6 py-6 sm:py-12 z-10">
          <div className="w-full max-w-4xl glass-card border border-zinc-800/80 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden my-auto animate-fade-in-up">
            {/* ستون تزئینی دسکتاپ */}
            <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-[#090a0f] border-l border-zinc-800/70 p-8 flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
                <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                Next-Gen Persian VTT
              </span>
              </div>

              <div className="relative z-10 my-auto flex flex-col items-center justify-center py-6">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  {/* حلقه چرخشی پس‌زمینه */}
                  <div className="absolute inset-0 rounded-full border border-amber-500/15 border-dashed animate-[spin_35s_linear_infinite]" />

                  {/* کارت اول با هاور متحرک */}
                  <div className="absolute -left-2 top-2 w-28 h-36 bg-gradient-to-tr from-zinc-900 via-zinc-850 to-zinc-800 border border-amber-500/25 rounded-2xl shadow-2xl -rotate-12 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:rotate-[-8deg] hover:border-amber-400/40">
                    <Dices className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]" />
                    <span className="text-[10px] font-mono text-amber-300 mt-2 font-bold tracking-wide">D20 CRIT</span>
                  </div>

                  {/* کارت دوم */}
                  <div className="absolute -right-2 bottom-2 w-28 h-36 bg-gradient-to-br from-zinc-900 to-zinc-850 border border-zinc-700/50 rounded-2xl shadow-2xl rotate-12 flex flex-col items-center justify-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:rotate-[8deg] hover:border-zinc-500/60">
                    <Sparkles className="w-8 h-8 text-amber-400/80" />
                    <span className="text-[10px] font-mono text-zinc-300 mt-2 tracking-wide">TABLETOP</span>
                  </div>

                  {/* نشان سپر شیشه‌ای */}
                  <div className="absolute -bottom-2 -left-1 w-14 h-14 rounded-full bg-zinc-900/90 border border-amber-400/40 backdrop-blur-md flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-110">
                    <ShieldCheck className="w-7 h-7 text-amber-400" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-center space-y-1.5">
                <div className="text-sm font-black text-amber-400 tracking-wide">
                  Titipool Studio
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[240px] mx-auto">
                  تجربه سریع، روان و بی‌دردسر نقش‌آفرینی روی میز مجازی فارسی.
                </p>
                <div className="text-[10px] text-zinc-600 font-mono pt-1">
                  © 2025 Titipool. All rights reserved.
                </div>
              </div>
            </div>

            {/* فرم ورود */}
            <div className="lg:col-span-7 p-6 sm:p-9 md:p-10 flex flex-col justify-between">
              <div>
                <div className="text-center mb-6 sm:mb-7">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/25 mb-3 shadow-[0_0_20px_rgba(251,191,36,0.12)] transition-transform duration-300 hover:scale-105">
                    <Dices className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
                    ورود به حساب کاربری
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                    برای ورود به میزهای بازی خود مشخصاتتان را وارد کنید
                  </p>
                </div>

                <LoginForm onSuccess={() => navigate("/dashboard", { replace: true })} />
              </div>

              <div className="mt-7 sm:mt-9 text-center text-xs text-zinc-400 pt-4 border-t border-zinc-800/80">
                هنوز حساب کاربری ندارید؟{" "}
                <Link
                    to="/register"
                    className="text-amber-400 hover:text-amber-300 font-bold hover:underline mr-1 transition-colors duration-150 inline-block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded"
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

export default LoginPage;