import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, Sparkles, UserCheck } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAuthStore } from "../../store/auth.store";

const loginSchema = z.object({
  username: z.string().min(3, "نام کاربری باید حداقل ۳ حرف باشد"),
  password: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const login = useAuthStore((state) => state.login);
  const guestLogin = useAuthStore((state) => state.guestLogin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [guestName, setGuestName] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "arash_gm",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ username: data.username, password: data.password });
      onSuccess?.();
    } catch {
      // Handled in store
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await guestLogin(guestName || "مهمان");
      onSuccess?.();
    } catch {
      // Handled
    }
  };

  return (
    <div className="space-y-5">
      {/* Toggle between standard login and quick guest play */}
      <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => setIsGuestMode(false)}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            !isGuestMode ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          ورود با حساب کاربری
        </button>
        <button
          type="button"
          onClick={() => setIsGuestMode(true)}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            isGuestMode ? "bg-amber-500 text-zinc-950 shadow font-semibold" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          ورود سریع مهمان (بدون ثبت‌نام)
        </button>
      </div>

      {!isGuestMode ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="نام کاربری (Username)"
            placeholder="مثلا: arash_gm یا player1"
            error={errors.username?.message}
            {...register("username")}
          />

          <Input
            label="رمز عبور (اختیاری)"
            type="password"
            placeholder="••••••••"
            {...register("password")}
          />

          <Button type="submit" variant="amber" className="w-full" isLoading={isLoading}>
            <LogIn className="w-4 h-4 ml-2" />
            ورود به حساب
          </Button>

          {onSwitchToRegister && (
            <p className="text-xs text-center text-zinc-400 pt-2 font-fa">
              حساب کاربری ندارید؟{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-amber-400 hover:underline font-semibold"
              >
                ثبت‌نام رایگان
              </button>
            </p>
          )}
        </form>
      ) : (
        <form onSubmit={handleGuestSubmit} className="space-y-4">
          <Input
            label="نام نمایشی شما در بازی"
            placeholder="مثلا: آریا (فایتر) یا مریم (کلریک)"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            helperText="نام شما برای بقیه بازیکنان نمایش داده می‌شود"
          />

          <Button type="submit" variant="amber" className="w-full" isLoading={isLoading}>
            <Sparkles className="w-4 h-4 ml-2" />
            ورود مستقیم به بازی
          </Button>
        </form>
      )}
    </div>
  );
};
