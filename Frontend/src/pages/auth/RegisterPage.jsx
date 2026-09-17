import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterForm } from "../../components/auth/RegisterForm.jsx";
import { useAuthStore } from "../../store/auth.store";
import { Dices, Sparkles } from "lucide-react";

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
      <div
          className="h-screen w-full bg-[#090a0f] text-zinc-100 overflow-y-auto overflow-x-hidden font-fa select-none"
          dir="rtl"
      >
        <div className="fixed -top-32 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="fixed -bottom-32 left-1/4 w-[30rem] h-[30rem] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="min-h-full w-full flex items-center justify-center p-4 sm:p-6 py-12 sm:py-16">
          <div className="w-full max-w-4xl bg-zinc-950/95 border border-zinc-800/90 rounded-3xl shadow-2xl shadow-black/80 backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 z-10 my-auto overflow-hidden">
            <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-[#090a0f] border-l border-zinc-800/80 p-8 flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                Join The Adventure
              </span>
              </div>

              <div className="relative z-10 my-auto flex flex-col items-center justify-center py-6">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-amber-500/20 border-dashed animate-[spin_25s_linear_infinite]" />

                  <div className="absolute -right-2 top-2 w-28 h-36 bg-gradient-to-tr from-zinc-900 to-zinc-800 border border-amber-500/30 rounded-2xl shadow-xl rotate-12 flex flex-col items-center justify-center">
                    <Sparkles className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                    <span className="text-[10px] font-mono text-amber-300 mt-2 font-bold">HERO CREATOR</span>
                  </div>

                  <div className="absolute -left-2 bottom-2 w-28 h-36 bg-gradient-to-br from-zinc-900 to-zinc-800/90 border border-zinc-700/60 rounded-2xl shadow-2xl -rotate-12 flex flex-col items-center justify-center backdrop-blur-md">
                    <Dices className="w-8 h-8 text-amber-400/80" />
                    <span className="text-[10px] font-mono text-zinc-300 mt-2">D&D 5E READY</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-center space-y-1">
                <div className="text-sm font-black text-amber-400 tracking-wide">
                  Titipool Platform
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  ساخت آسان مپ، مه جنگ پویا، توکن‌ها و تاس‌های ۳بعدی در یکجا.
                </p>
                <div className="text-[10px] text-zinc-600 font-mono pt-2">
                  © 2025 Titipool. All rights reserved.
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2.5 shadow-lg shadow-amber-500/10">
                    <Dices className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
                    ساخت حساب کاربری جدید
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    اطلاعات خود را برای شروع میزبانی یا پیوستن به اتاق‌ها وارد کنید
                  </p>
                </div>

                <RegisterForm onSuccess={() => navigate("/dashboard", { replace: true })} />
              </div>

              <div className="mt-6 text-center text-xs text-zinc-400 pt-4 border-t border-zinc-800/80">
                قبلاً ثبت‌نام کرده‌اید؟{" "}
                <Link
                    to="/login"
                    className="text-amber-400 hover:text-amber-300 font-bold hover:underline mr-1 transition-colors"
                >
                  ورود به حساب کاربری
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RegisterPage;