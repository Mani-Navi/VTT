import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAuth } from "../../hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export const LoginForm = ({ onSuccess }) => {
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-right" dir="rtl">
        <Input
            label="ایمیل حساب کاربری"
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

        {serverError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {serverError}
            </div>
        )}

        <Button
            type="submit"
            variant="amber"
            className="w-full mt-2 font-bold shadow-lg shadow-amber-500/10"
            isLoading={isSubmitting}
        >
          <LogIn className="w-4 h-4 ml-2" />
          ورود به حساب کاربری
        </Button>
      </form>
  );
};