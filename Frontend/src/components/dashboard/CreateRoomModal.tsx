import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Sparkles } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useRoomStore } from "../../store/room.store";

const createRoomSchema = z.object({
  name: z.string().min(3, "نام اتاق باید حداقل ۳ حرف باشد"),
  description: z.string().optional(),
  maxPlayers: z.number().min(2, "حداقل ۲ بازیکن").max(20, "حداکثر ۲۰ بازیکن"),
  isLocked: z.boolean(),
  password: z.string().optional(),
});

type CreateRoomFormData = {
  name: string;
  description?: string;
  maxPlayers: number;
  isLocked: boolean;
  password?: string;
};

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (room: any) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const createRoom = useRoomStore((state) => state.createRoom);
  const isLoading = useRoomStore((state) => state.isLoading);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema) as any,
    defaultValues: {
      name: "ماجراجویی جدید D&D",
      description: "جلسه اول کمپین در دنیای فانتزی",
      maxPlayers: 6,
      isLocked: false,
    },
  });

  const isLocked = watch("isLocked");

  const onSubmit = async (data: CreateRoomFormData) => {
    try {
      const newRoom = await createRoom({
        name: data.name,
        description: data.description,
        maxPlayers: Number(data.maxPlayers),
        isLocked: data.isLocked,
        password: data.password,
      });
      reset();
      onClose();
      onSuccess(newRoom);
    } catch {
      // Handled
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="نام اتاق / کمپین (Campaign Name)"
          placeholder="مثلا: نبرد در دژ سرخ"
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-medium text-zinc-300">توضیحات یا یادداشت برای بازیکنان</label>
          <textarea
            rows={3}
            className="w-full px-3.5 py-2 bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 rounded-lg border border-zinc-700/80 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-fa"
            placeholder="مثلا: سطح کاراکترها: ۳، قوانین: D&D 5e رسمی"
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="حداکثر تعداد بازیکنان"
            type="number"
            min={2}
            max={20}
            error={errors.maxPlayers?.message}
            {...register("maxPlayers", { valueAsNumber: true })}
          />

          <div className="flex flex-col justify-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300">
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-amber-500"
                {...register("isLocked")}
              />
              اتاق خصوصی (نیاز به رمز)
            </label>
          </div>
        </div>

        {isLocked && (
          <Input
            label="رمز عبور اتاق"
            type="password"
            placeholder="••••••••"
            {...register("password")}
          />
        )}

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" variant="amber" isLoading={isLoading}>
            <Sparkles className="w-4 h-4 ml-1.5" />
            ایجاد و ورود به میز بازی
          </Button>
        </div>
      </form>
    </Modal>
  );
};
