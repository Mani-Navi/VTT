import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
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

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await roomApi.joinRoom(data.code);
      reset();
      onClose();
      navigate(`/room/${res.roomId}`);
    } catch (err) {
      if (err.response?.status === 404) {
        setServerError("اتاق یافت نشد یا منقضی شده است.");
      } else {
        setServerError("خطا در ورود به اتاق.");
      }
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-vtt-bg/80 backdrop-blur-xs p-4">
        <div className="w-full max-w-sm bg-vtt-s1 border border-vtt-border rounded-lg p-5 shadow-2xl" dir="rtl">
          <h2 className="text-base font-bold text-vtt-t1 mb-4 font-fa">ورود با کد اتاق</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-vtt-t2 mb-1.5">کد ۶ رقمی اتاق</label>
              <input
                  type="text"
                  maxLength={6}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-vtt-s2 text-vtt-t1 rounded-md border border-vtt-border focus:border-neon focus:outline-none text-center font-mono text-base uppercase tracking-widest"
                  placeholder="ABC123"
                  {...register("code", {
                    onChange: (e) => setValue("code", e.target.value.toUpperCase()),
                  })}
              />
              {errors.code && (
                  <p className="text-vtt-danger text-xs mt-1 text-center">{errors.code.message}</p>
              )}
              {serverError && (
                  <p className="text-vtt-danger text-xs mt-2 text-center bg-vtt-danger/10 p-2 rounded-sm border border-vtt-danger/20">
                    {serverError}
                  </p>
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
                ورود
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};