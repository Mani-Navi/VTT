import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Check, X, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth";

const registerSchema = z
    .object({
        username: z
            .string()
            .min(3, "حداقل ۳ کاراکتر")
            .max(50, "حداکثر ۵۰ کاراکتر")
            .regex(/^[a-zA-Z0-9_]+$/, "فقط حروف انگلیسی، عدد و _"),
        email: z.string().email("ایمیل معتبر وارد کنید"),
        password: z.string().min(8, "حداقل ۸ کاراکتر").max(72, "حداکثر ۷۲ کاراکتر"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "رمزها یکسان نیستند",
        path: ["confirmPassword"],
    });

const checkPasswordCriteria = (pass = "") => [
    { label: "حداقل ۸ کاراکتر", valid: pass.length >= 8 },
    { label: "حروف بزرگ و کوچک (a-Z)", valid: /[a-z]/.test(pass) && /[A-Z]/.test(pass) },
    { label: "حداقل یک عدد (0-9)", valid: /\d/.test(pass) },
    { label: "حداقل یک نماد خاص (!@#$%)", valid: /[^A-Za-z0-9]/.test(pass) },
];

export const RegisterForm = ({ onSuccess }) => {
    const { register: registerUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const passwordValue = watch("password", "");
    const criteria = useMemo(() => checkPasswordCriteria(passwordValue), [passwordValue]);
    const passedCriteriaCount = criteria.filter((c) => c.valid).length;

    const strengthInfo = useMemo(() => {
        if (!passwordValue) return { label: "", color: "bg-zinc-700", width: "0%" };
        if (passedCriteriaCount <= 1) return { label: "ضعیف", color: "bg-rose-500", width: "25%" };
        if (passedCriteriaCount === 2) return { label: "متوسط", color: "bg-amber-500", width: "50%" };
        if (passedCriteriaCount === 3) return { label: "خوب", color: "bg-cyan-500", width: "75%" };
        return { label: "بسیار قوی", color: "bg-emerald-500", width: "100%" };
    }, [passwordValue, passedCriteriaCount]);

    const onSubmit = async (data) => {
        setServerError("");
        try {
            await registerUser(data.username, data.email, data.password);
            onSuccess?.();
        } catch (err) {
            const serverMsg = err.response?.data?.message || err.response?.data?.error;
            if (err.response?.status === 409) {
                setServerError(serverMsg || "این ایمیل یا نام کاربری قبلاً ثبت شده است.");
            } else if (err.response?.status === 400 && serverMsg) {
                setServerError(serverMsg);
            } else {
                setServerError(serverMsg || "خطا در ارتباط با سرور — لطفاً دوباره تلاش کنید.");
            }
        }
    };

    return (
        <div className="space-y-3.5 text-right" dir="rtl">
            {/* دکمه ثبت نام سریع با گوگل */}
            <button
                type="button"
                aria-label="ثبت‌نام با گوگل"
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all flex items-center justify-center gap-2 text-xs font-medium text-zinc-300 shadow-sm cursor-pointer"
            >
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
                ثبت‌نام سریع با حساب گوگل
            </button>

            <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-zinc-950 px-3 text-[11px] text-zinc-500 font-medium shrink-0">
          یا تکمیل فرم زیر
        </span>
                <div className="border-t border-zinc-800 w-full" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {serverError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-fadeIn">
                        {serverError}
                    </div>
                )}

                <Input
                    label="نام کاربری (Username)"
                    placeholder="مثلا: dungeon_master"
                    error={errors.username?.message}
                    disabled={isSubmitting}
                    {...register("username")}
                />

                <Input
                    label="ایمیل"
                    type="email"
                    placeholder="name@example.com"
                    error={errors.email?.message}
                    disabled={isSubmitting}
                    {...register("email")}
                />

                <div className="space-y-1.5">
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
                            className="absolute left-3 top-[43px] -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer flex items-center justify-center"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {passwordValue.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-2 mt-1">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-zinc-400">میزان امنیت رمز:</span>
                                <span
                                    className={`font-bold ${
                                        passedCriteriaCount <= 1
                                            ? "text-rose-400"
                                            : passedCriteriaCount === 2
                                                ? "text-amber-400"
                                                : passedCriteriaCount === 3
                                                    ? "text-cyan-400"
                                                    : "text-emerald-400"
                                    }`}
                                >
                  {strengthInfo.label}
                </span>
                            </div>

                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                                    style={{ width: strengthInfo.width }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                                {criteria.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center gap-1 transition-colors ${
                                            item.valid ? "text-emerald-400" : "text-zinc-500"
                                        }`}
                                    >
                                        {item.valid ? (
                                            <Check className="w-3 h-3 shrink-0 text-emerald-400" />
                                        ) : (
                                            <X className="w-3 h-3 shrink-0 text-zinc-600" />
                                        )}
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <Input
                        label="تکرار رمز عبور"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        error={errors.confirmPassword?.message}
                        disabled={isSubmitting}
                        {...register("confirmPassword")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-[43px] -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer flex items-center justify-center"
                        tabIndex={-1}
                    >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                <Button
                    type="submit"
                    variant="amber"
                    className="w-full mt-2 font-bold shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 transition-all py-2.5"
                    isLoading={isSubmitting}
                >
                    <UserPlus className="w-4 h-4 ml-2" />
                    ساخت حساب و شروع بازی
                </Button>
            </form>
        </div>
    );
};