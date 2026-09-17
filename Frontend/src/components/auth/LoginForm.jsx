import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";
import { useAuth } from "../../hooks/useAuth";
import { ENV } from "../../config/validateEnv";

const loginSchema = z.object({
    email: z.string().email("ایمیل معتبر وارد کنید"),
    password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export const LoginForm = ({ onSuccess }) => {
    const { login, loginWithGoogle } = useAuth();
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const googleButtonRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (!ENV.GOOGLE_CLIENT_ID) {
            console.warn("[GOOGLE AUTH] Google Client ID is not set.");
            return;
        }

        const handleCredentialResponse = async (response) => {
            try {
                setServerError("");
                await loginWithGoogle(response.credential);
                onSuccess?.();
            } catch (err) {
                const errorMsg =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "خطا در ورود با حساب گوگل.";
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

            // محاسبه عرض متناسب با کانتینر
            const containerWidth = googleButtonRef.current.offsetWidth || 340;
            const validWidth = Math.min(Math.max(containerWidth, 240), 400);

            googleButtonRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                type: "standard",
                theme: "filled_black",
                size: "large",
                text: "continue_with",
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
            await login(data.email, data.password);
            onSuccess?.();
        } catch (err) {
            if (err.response?.status === 401) {
                setServerError("ایمیل یا رمز عبور اشتباه است.");
            } else if (err.response?.status === 429) {
                setServerError("تعداد درخواست‌ها بیش از حد مجاز است — لطفاً کمی صبر کنید.");
            } else {
                const errorMsg = err.response?.data?.message || err.response?.data?.error;
                setServerError(errorMsg || "خطا در برقراری ارتباط با سرور.");
            }
        }
    };

    return (
        <div className="space-y-4 text-right" dir="rtl">
            {/* دکمه رسمی و هماهنگ گوگل */}
            <div className="flex justify-center w-full min-h-[44px]">
                <div ref={googleButtonRef} className="w-full flex justify-center" />
            </div>

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
                        className="absolute left-3 top-[43px] -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer flex items-center justify-center"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                {serverError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-fadeIn">
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

export default LoginForm;