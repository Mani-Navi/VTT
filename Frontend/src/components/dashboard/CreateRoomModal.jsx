import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";

const createRoomSchema = z.object({
  name: z.string().min(2, "نام اتاق باید حداقل ۲ حرف باشد").max(100, "حداکثر ۱۰۰ حرف"),
  expire_days: z.number().int().min(1, "حداقل ۱ روز").max(365, "حداکثر ۳۶۵ روز").default(30),
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

  const onSubmit = async (data) => {
    try {
      await onCreate(data);
      reset();
      onClose();
    } catch {
      // مدیریت خطا در هوک انجام می‌شود
    }
  };

  return (
      <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="Create New Game Room"
          titleFa="ساخت اتاق جدید بازی"
          maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
          <Input
              label="نام اتاق یا کمپین"
              placeholder="مثلا: کمپین نبرد در دخمه سیاه"
              error={errors.name?.message}
              disabled={isSubmitting}
              {...register("name")}
          />

          <Input
              label="مدت اعتبار اتاق (روز)"
              type="number"
              min={1}
              max={365}
              error={errors.expire_days?.message}
              disabled={isSubmitting}
              {...register("expire_days", { valueAsNumber: true })}
          />

          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" variant="amber" isLoading={isSubmitting} className="font-bold">
              <Sparkles className="w-4 h-4 ml-1.5" />
              ایجاد و ورود به میز بازی
            </Button>
          </div>
        </form>
      </Modal>
  );
};