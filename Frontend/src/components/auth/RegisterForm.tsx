import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAuthStore } from "../../store/auth.store";

const registerSchema = z.object({
  username: z.string().min(3, "نام کاربری باید حداقل ۳ حرف باشد"),
  displayName: z.string().min(2, "نام نمایشی باید حداقل ۲ حرف باشد"),
  email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  password: z.string().min(4, "رمز عبور باید حداقل ۴ حرف باشد").optional().or(z.literal("")),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      displayName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        username: data.username,
        displayName: data.displayName,
        email: data.email,
        password: data.password,
      });
      onSuccess?.();
    } catch {
      // Handled
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="نام کاربری (Username)"
        placeholder="مثلا: dungeon_master_99"
        error={errors.username?.message}
        {...register("username")}
      />

      <Input
        label="نام نمایشی در بازی (Display Name)"
        placeholder="مثلا: سیاوش دانجن‌مستر"
        error={errors.displayName?.message}
        {...register("displayName")}
      />

      <Input
        label="ایمیل (اختیاری)"
        type="email"
        placeholder="name@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="رمز عبور"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button type="submit" variant="amber" className="w-full" isLoading={isLoading}>
        <UserPlus className="w-4 h-4 ml-2" />
        ساخت حساب کاربری
      </Button>

      {onSwitchToLogin && (
        <p className="text-xs text-center text-zinc-400 pt-2 font-fa">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-amber-400 hover:underline font-semibold"
          >
            ورود به حساب
          </button>
        </p>
      )}
    </form>
  );
};
