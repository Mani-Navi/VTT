import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
        <div>
          <label className="block text-xs font-medium text-vtt-t2 mb-1.5">ایمیل</label>
          <input
              type="email"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-vtt-s2 text-vtt-t1 rounded-md border border-vtt-border focus:border-neon focus:outline-none transition-colors text-sm disabled:opacity-50"
              placeholder="name@example.com"
              {...register("email")}
          />
          {errors.email && (
              <p className="text-vtt-danger text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-vtt-t2 mb-1.5">رمز عبور</label>
          <input
              type="password"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-vtt-s2 text-vtt-t1 rounded-md border border-vtt-border focus:border-neon focus:outline-none transition-colors text-sm disabled:opacity-50"
              placeholder="••••••••"
              {...register("password")}
          />
          {errors.password && (
              <p className="text-vtt-danger text-xs mt-1">{errors.password.message}</p>
          )}
          {serverError && (
              <p className="text-vtt-danger text-xs mt-2 bg-vtt-danger/10 p-2 rounded-sm border border-vtt-danger/20">
                {serverError}
              </p>
          )}
        </div>

        <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-neon text-vtt-bg font-semibold rounded-md hover:opacity-90 active:scale-[0.99] transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-vtt-bg border-t-transparent rounded-full animate-spin" />
          ) : null}
          ورود به حساب
        </button>
      </form>
  );
};