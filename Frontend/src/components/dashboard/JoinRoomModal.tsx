import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, KeyRound } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useRoom } from "../../hooks/useRoom";

const joinRoomSchema = z.object({
  code: z.string().min(3, "کد اتاق معتبر نیست"),
  password: z.string().optional(),
});

type JoinRoomFormData = z.infer<typeof joinRoomSchema>;

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (room: any) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { joinRoomByCode, isLoading } = useRoom();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinRoomFormData>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: JoinRoomFormData) => {
    try {
      const room = await joinRoomByCode(data.code);
      reset();
      onClose();
      onSuccess(room);
    } catch {
      // Handled
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join Room by Code"
      titleFa="ورود به اتاق با کد دعوت"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="کد اتاق بازی (Room Code)"
          placeholder="مثلا: OWL-7721"
          error={errors.code?.message}
          className="uppercase font-mono text-center tracking-widest text-base"
          {...register("code")}
        />

        <Input
          label="رمز عبور (در صورت خصوصی بودن اتاق)"
          type="password"
          placeholder="••••••••"
          {...register("password")}
        />

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" variant="amber" isLoading={isLoading}>
            <LogIn className="w-4 h-4 ml-1.5" />
            ورود به اتاق
          </Button>
        </div>
      </form>
    </Modal>
  );
};
