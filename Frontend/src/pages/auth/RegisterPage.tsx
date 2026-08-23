import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { Dices } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-4 shadow-lg shadow-amber-500/10">
          <Dices className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100 font-fa">
          ثبت‌نام در پلتفرم VTT فارسی
        </h2>
        <p className="mt-2 text-xs text-zinc-400 font-fa">
          شروع میزبانی و تجربه بازی‌های نقش‌آفرینی رومیزی آنلاین
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="bg-zinc-900/90 border border-zinc-800/80 py-8 px-6 shadow-2xl rounded-2xl backdrop-blur-xl sm:px-10">
          <RegisterForm onSuccess={() => navigate("/dashboard")} />

          <div className="mt-6 text-center text-xs text-zinc-400">
            قبلاً حساب ساخته‌اید؟{" "}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold font-fa">
              ورود به حساب
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
