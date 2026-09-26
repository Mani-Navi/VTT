import React, { useState, useMemo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Check, X, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth";
import { ENV } from "../../config/validateEnv";

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
    const { register: registerUser, loginWithGoogle } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState("");
    const googleButtonRef = useRef(null);

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

    useEffect(() => {
        if (!ENV.GOOGLE_CLIENT_ID) return;

        const handleCredentialResponse = async (response) => {
            try {
                setServerError("");
                await loginWithGoogle(response.credential);
                onSuccess?.();
            } catch (err) {
                const errorMsg =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "خطا در ثبت‌نام با حساب گوگل.";
                setServerError(errorMsg);
            }
        };

        const renderGoogleButton = () => {
            if (!window.google?.accounts?.id || !googleButtonRef.current) return;

            window.google.accounts.id.initialize({
                client_id: ENV.GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: false,
            });

            const containerWidth = googleButtonRef.current.offsetWidth || 320;
            const validWidth = Math.min(Math.max(containerWidth, 230), 400);

            googleButtonRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                type: "standard",
                theme: "filled_black",
                size: "large",
                text: "signup_with",
                shape: "rectangular",
                logo_alignment: "center",
                width: validWidth,
            });
        };

        if (window.google?.accounts?.id) {
            renderGoogleButton();
        } else {
            const script = document.createElement("script");
            script.id = "google-gsi-script";
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = renderGoogleButton;
            document.body.appendChild(script);
        }
    }, [loginWithGoogle, onSuccess]);

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
        <div className="space-y-3 text-right w-full" dir="rtl">
            {/* دکمه گوگل */}
            <div className="flex justify-center w-full min-h-[44px] overflow-hidden">
                <div ref={googleButtonRef} className="w-full flex justify-center max-w-[340px]" />
            </div>

            <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-zinc-950 px-3 text-[11px] text-zinc-500 font-medium shrink-0">
          یا تکمیل فرم زیر
        </span>
                <div className="border-t border-zinc-800 w-full" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {serverError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-fadeIn">
                        {serverError}
                    </div>
                )}

                <Input
                    label="نام کاربری (Username)"
                    placeholder="مثلا: dungeon_master"
                    error={errors.username?.message}
                    disabled={isSubmitting}
                    className="h-11 sm:h-10 text-sm"
                    {...register("username")}
                />

                <Input
                    label="ایمیل"
                    type="email"
                    placeholder="name@example.com"
                    error={errors.email?.message}
                    disabled={isSubmitting}
                    className="h-11 sm:h-10 text-sm"
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
                            className="h-11 sm:h-10 text-sm pl-11"
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-2.5 top-[39px] sm:top-[38px] -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-2 cursor-pointer rounded-lg active:scale-95 transition-all flex items-center justify-center"
                            tabIndex={-1}
                            aria-label="تغییر وضعیت نمایش رمز"
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

                            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
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
                                        <span className="truncate">{item.label}</span>
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
                        className="h-11 sm:h-10 text-sm pl-11"
                        {...register("confirmPassword")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-2.5 top-[39px] sm:top-[38px] -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-2 cursor-pointer rounded-lg active:scale-95 transition-all flex items-center justify-center"
                        tabIndex={-1}
                        aria-label="تغییر وضعیت نمایش تکرار رمز"
                    >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                <Button
                    type="submit"
                    variant="amber"
                    className="w-full mt-2 font-bold shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 active:scale-[0.98] transition-all h-11 sm:h-11 text-xs sm:text-sm"
                    isLoading={isSubmitting}
                >
                    <UserPlus className="w-4 h-4 ml-2" />
                    ساخت حساب و شروع بازی
                </Button>
            </form>
        </div>
    );
};

export default RegisterForm;