import React, { memo } from "react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { LogOut } from "lucide-react";

export const LeaveRoomModal = memo(({ isOpen, onClose, onConfirm, room, isLoading }) => {
    if (!room) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Leave Adventure Confirmation"
            titleFa="تأیید خروج از ماجراجویی"
            maxWidth="sm"
        >
            <div className="space-y-4 text-right font-fa" dir="rtl">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-300">خروج از «{room.name}»</h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            با خروج از این ماجراجویی، این اتاق از داشبورد شما حذف می‌شود. هر زمان تمایل داشتید
                            می‌توانید مجدداً با کد دعوت به بازی بپیوندید.
                        </p>
                    </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-zinc-800">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                        انصراف
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className="hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/40 font-bold"
                    >
                        <LogOut className="w-4 h-4 ml-1.5" />
                        خروج از ماجراجویی
                    </Button>
                </div>
            </div>
        </Modal>
    );
});

LeaveRoomModal.displayName = "LeaveRoomModal";