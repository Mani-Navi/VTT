import React, { memo } from "react";
import { Dices, Plus } from "lucide-react";

export const EmptyRooms = memo(({ onCreateClick }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in-up" dir="rtl">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-5 text-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.15)] transition-transform duration-300 hover:scale-105">
                <Dices className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-1.5">هنوز هیچ اتاقی ساخته نشده است</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-sm leading-relaxed">
                اولین اتاق میز مجازی خود را بسازید، نقشه را آپلود کنید و بازیکنان را با کد اتاق دعوت نمایید.
            </p>
            <button
                type="button"
                onClick={onCreateClick}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all duration-150 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                ایجاد اولین اتاق بازی
            </button>
        </div>
    );
});

EmptyRooms.displayName = "EmptyRooms";import React, { memo } from "react";
import { Dices, Plus } from "lucide-react";

export const EmptyRooms = memo(({ onCreateClick }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in-up" dir="rtl">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-5 text-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.15)] transition-transform duration-300 hover:scale-105">
                <Dices className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-1.5">هنوز هیچ اتاقی ساخته نشده است</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-sm leading-relaxed">
                اولین اتاق میز مجازی خود را بسازید، نقشه را آپلود کنید و بازیکنان را با کد اتاق دعوت نمایید.
            </p>
            <button
                type="button"
                onClick={onCreateClick}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all duration-150 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                ایجاد اولین اتاق بازی
            </button>
        </div>
    );
});

EmptyRooms.displayName = "EmptyRooms";