import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
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
                setError("email", { message: "این ایمیل یا نام کاربری قبلاً ثبت شده است." });
            } else if (err.response?.status === 400 && err.response?.data?.message) {
                setError("root", { message: err.response.data.message });
            } else {
                setError("root", { message: "خطا در ارتباط با سرور — دوباره تلاش کنید." });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-right" dir="rtl">
            {errors.root && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                    {errors.root.message}
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

            <Input
                label="رمز عبور"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                disabled={isSubmitting}
                {...register("password")}
            />

            <Input
                label="تکرار رمز عبور"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                disabled={isSubmitting}
                {...register("confirmPassword")}
            />

            <Button
                type="submit"
                variant="amber"
                className="w-full mt-3 font-bold shadow-lg shadow-amber-500/10"
                isLoading={isSubmitting}
            >
                <UserPlus className="w-4 h-4 ml-2" />
                ساخت حساب و شروع بازی
            </Button>
        </form>
    );
};