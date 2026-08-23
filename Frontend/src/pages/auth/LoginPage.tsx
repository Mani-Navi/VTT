import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginForm } from "../../components/auth/LoginForm";
import { Dices, Sparkles, Shield, Compass, Swords } from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-4 shadow-lg shadow-amber-500/10">
          <Dices className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100 font-fa">
          پلتفرم Virtual Tabletop فارسی
        </h2>
        <p className="mt-2 text-xs text-zinc-400 font-fa">
          میز بازی رول‌پلینگ سبک و سریع (شبیه Owlbear Rodeo)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="bg-zinc-900/90 border border-zinc-800/80 py-8 px-6 shadow-2xl rounded-2xl backdrop-blur-xl sm:px-10">
          <LoginForm onSuccess={() => navigate("/dashboard")} />

          <div className="mt-6 text-center text-xs text-zinc-400">
            حساب کاربری ندارید؟{" "}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-semibold font-fa">
              ثبت‌نام و ساخت اکانت
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-[11px] text-zinc-400 font-fa">
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-850">
            <Swords className="w-4 h-4 mx-auto mb-1 text-amber-400" />
            <span>نبرد تاکتیکال و توکن‌ها</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-850">
            <Shield className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
            <span>مه تاریکی Fog of War</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-850">
            <Compass className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <span>همگام‌سازی لحظه‌ای</span>
          </div>
        </div>
      </div>
    </div>
  );
};
