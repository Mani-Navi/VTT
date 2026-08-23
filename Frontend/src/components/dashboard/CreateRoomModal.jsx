import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createRoomSchema = z.object({
  name: z.string().min(2, "حداقل ۲ کاراکتر").max(100, "حداکثر ۱۰۰ کاراکتر"),
  expire_days: z.number().int().min(1).max(365).default(30),
});

export const CreateRoomModal = ({ isOpen, onClose, onCreate }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      expire_days: 30,
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      await onCreate(data);
      reset();
      onClose();
    } catch {
      // خطا توسط هوک داشبورد مدیریت می‌شود
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-vtt-bg/80 backdrop-blur-xs p-4">
        <div className="w-full max-w-md bg-vtt-s1 border border-vtt-border rounded-lg p-5 shadow-2xl" dir="rtl">
          <h2 className="text-base font-bold text-vtt-t1 mb-4 font-fa">ساخت اتاق جدید</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-vtt-t2 mb-1.5">نام اتاق</label>
              <input
                  type="text"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-vtt-s2 text-vtt-t1 rounded-md border border-vtt-border focus:border-neon focus:outline-none text-sm"
                  placeholder="مثلا: کمپین دخمه تاریک"
                  {...register("name")}
              />
              {errors.name && (
                  <p className="text-vtt-danger text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-vtt-t2 mb-1.5">مدت اعتبار (روز)</label>
              <input
                  type="number"
                  min={1}
                  max={365}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-vtt-s2 text-vtt-t1 rounded-md border border-vtt-border focus:border-neon focus:outline-none text-sm"
                  {...register("expire_days", { valueAsNumber: true })}
              />
              {errors.expire_days && (
                  <p className="text-vtt-danger text-xs mt-1">{errors.expire_days.message}</p>
              )}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-vtt-border">
              <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-vtt-t3 hover:text-vtt-t1 transition-colors"
              >
                انصراف
              </button>
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-md text-xs font-semibold bg-neon text-vtt-bg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? <span className="w-3 h-3 border-2 border-vtt-bg border-t-transparent rounded-full animate-spin" /> : null}
                ساخت اتاق
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};