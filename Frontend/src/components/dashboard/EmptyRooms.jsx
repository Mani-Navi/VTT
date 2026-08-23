import React from "react";
import { Dices, Plus } from "lucide-react";

export const EmptyRooms = ({ onCreateClick }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center" dir="rtl">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 text-amber-400 shadow-neon">
                <Dices className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-vtt-t1 mb-2">هنوز هیچ اتاقی ساخته نشده است</h3>
            <p className="text-xs text-vtt-t3 mb-6 max-w-sm leading-relaxed">
                اولین اتاق میز مجازی خود را بسازید، نقشه را آپلود کنید و بازیکنان را با کد اتاق دعوت نمایید.
            </p>
            <button
                type="button"
                onClick={onCreateClick}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-neon active:scale-95"
            >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                ایجاد اولین اتاق بازی
            </button>
        </div>
    );
};