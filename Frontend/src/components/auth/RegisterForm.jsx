import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

export const RegisterForm = ({ onSuccess }) => {
    const { register: registerUser } = useAuth();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        try {
            await registerUser(data.username, data.email, data.password);
            onSuccess?.();
        } catch (err) {
            if (err.response?.status === 409) {
                setError("email", { message: "این ایمیل یا نام کاربری قبلاً استفاده شده است." });
            } else if (err.response?.status === 400 && err.response?.data?.message) {
                setError("root", { message: err.response.data.message });
            } else {
                setError("root", { message: "خطا در برقراری ارتباط — دوباره تلاش کنید." });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" dir="rtl">
            {errors.root && (
                <div className="p-2.5 rounded-sm bg-vtt-danger/10 border border-vtt-danger/30 text-vtt-danger text-xs">
                    {errors.root.message}
                </div>
            )}

            <div>
                <label className="block text-xs font-medium text-vtt-t2 mb-1">نام کاربری</label>
                <input
                    type="text"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 bg-vtt-s2 text-vtt-t1 rounded-md border border-vtt-border focus:border-neon focus:outline-none transition-colors text-sm disabled:opacity-50"
                    placeholder="username"
                    {...register("username")}
                />
                {errors.username && (
                    <p className="text-vtt-danger text-xs mt-1">{errors.username.message}</p>
                )}
            </div>

            <div>
                <label className="block text-xs font-medium text-vtt-t2 mb-1">ایمیل</label>
                <input
                    type="email"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 bg-vtt-s2 text-vtt-t1 rounded-md border border-vtt-border focus:border-neon focus:outline-none transition-colors text-sm disabled:opacity-50"
                    placeholder="name@example.com"
                    {...register("email")}
                />
                {errors.email && (
                    <p className="text-vtt-danger text-xs mt-1">{errors.email.message}</p>
                )}
            </div>

            <div>
                <label className="block text-xs font-medium text-vtt-t2 mb-1">رمز عبور</label>
                <input
                    type="password"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 bg-vtt-s2 text-vtt-t1 rounded-md border border-vtt-border focus:border-neon focus:outline-none transition-colors text-sm disabled:opacity-50"
                    placeholder="••••••••"
                    {...register("password")}
                />
                {errors.password && (
                    <p className="text-vtt-danger text-xs mt-1">{errors.password.message}</p>
                )}
            </div>

            <div>
                <label className="block text-xs font-medium text-vtt-t2 mb-1">تکرار رمز عبور</label>
                <input
                    type="password"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 bg-vtt-s2 text-vtt-t1 rounded-md border border-vtt-border focus:border-neon focus:outline-none transition-colors text-sm disabled:opacity-50"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                    <p className="text-vtt-danger text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 bg-neon text-vtt-bg font-semibold rounded-md hover:opacity-90 active:scale-[0.99] transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-vtt-bg border-t-transparent rounded-full animate-spin" />
                ) : null}
                ثبت‌نام و ایجاد حساب
            </button>
        </form>
    );
};