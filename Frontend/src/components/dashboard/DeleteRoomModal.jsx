import React, { memo } from "react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { AlertTriangle, Trash2 } from "lucide-react";

export const DeleteRoomModal = memo(({ isOpen, onClose, onConfirm, room, isLoading }) => {
    if (!room) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Room Confirmation"
            titleFa="تأیید حذف اتاق بازی"
            maxWidth="sm"
        >
            <div className="space-y-4 text-right font-fa" dir="rtl">
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-rose-300">آیا از حذف این اتاق اطمینان دارید؟</h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            اتاق <span className="font-bold text-zinc-200">«{room.name}»</span> و تمامی توکن‌ها،
                            نقشه‌ها و ژورنال‌های آن برای همیشه پاک خواهند شد و این عملیات قابل بازگشت نیست.
                        </p>
                    </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-zinc-800">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                        انصراف
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
                    >
                        <Trash2 className="w-4 h-4 ml-1.5" />
                        حذف قطعی اتاق
                    </Button>
                </div>
            </div>
        </Modal>
    );
});

DeleteRoomModal.displayName = "DeleteRoomModal";