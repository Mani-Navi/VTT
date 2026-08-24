import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";
import { roomApi } from "../../api/room.api";

const joinRoomSchema = z.object({
  code: z.string().length(6, "کد اتاق باید ۶ کاراکتر باشد").toUpperCase(),
});

export const JoinRoomModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(joinRoomSchema),
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await roomApi.joinRoom(data.code);
      reset();
      onClose();
      navigate(`/room/${res.roomId || res.id}`);
    } catch (err) {
      if (err.response?.status === 404) {
        setServerError("اتاق یافت نشد یا منقضی شده است.");
      } else {
        setServerError("خطا در ورود به اتاق.");
      }
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
          <Input
              label="کد ۶ حرفی اتاق بازی"
              placeholder="مثلا: OWL772"
              error={errors.code?.message}
              disabled={isSubmitting}
              className="uppercase font-mono text-center tracking-widest text-base font-bold"
              {...register("code", {
                onChange: (e) => setValue("code", e.target.value.toUpperCase()),
              })}
          />

          {serverError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
                {serverError}
              </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" variant="amber" isLoading={isSubmitting} className="font-bold">
              <LogIn className="w-4 h-4 ml-1.5" />
              ورود به اتاق
            </Button>
          </div>
        </form>
      </Modal>
  );
};