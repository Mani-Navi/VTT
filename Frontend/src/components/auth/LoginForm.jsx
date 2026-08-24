import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth";

const loginSchema = z.object({
    email: z.string().email("ایمیل معتبر وارد کنید"),
    password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export const LoginForm = ({ onSuccess }) => {
    const { login } = useAuth();
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setServerError("");
        try {
            await login(data.email, data.password);
            onSuccess?.();
        } catch (err) {
            if (err.response?.status === 401) {
                setServerError("ایمیل یا رمز عبور اشتباه است.");
            } else if (err.response?.status === 429) {
                setServerError("تعداد درخواست‌ها بیش از حد مجاز است — لطفاً کمی صبر کنید.");
            } else {
                setServerError("خطا در برقراری ارتباط با سرور.");
            }
        }
    };

    return (
        <div className="space-y-4 text-right" dir="rtl">
            {/* دکمه‌های ورود با شبکه‌های اجتماعی (طرح تصویر) */}
            <div className="flex items-center justify-center gap-3">
                <button
                    type="button"
                    aria-label="ورود با گوگل"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all flex items-center justify-center gap-2 text-xs font-medium text-zinc-300 shadow-sm"
                >
                    {/* آیکون استاندارد گوگل */}
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                            fill="#EA4335"
                            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                        />
                        <path
                            fill="#4285F4"
                            d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                        />
                    </svg>
                    ورود با گوگل
                </button>
            </div>

            {/* خط جداکننده Or */}
            <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-zinc-950 px-3 text-[11px] text-zinc-500 font-medium shrink-0">
          یا ورود با ایمیل
        </span>
                <div className="border-t border-zinc-800 w-full" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="ایمیل حساب کاربری"
                    type="email"
                    placeholder="name@example.com"
                    error={errors.email?.message}
                    disabled={isSubmitting}
                    {...register("email")}
                />

                <div className="relative">
                    <Input
                        label="رمز عبور"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        error={errors.password?.message}
                        disabled={isSubmitting}
                        {...register("password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-9 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                {serverError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium animate-fadeIn">
                        {serverError}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="amber"
                    className="w-full mt-2 font-bold shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 transition-all py-2.5"
                    isLoading={isSubmitting}
                >
                    <LogIn className="w-4 h-4 ml-2" />
                    ورود به حساب کاربری
                </Button>
            </form>
        </div>
    );
};