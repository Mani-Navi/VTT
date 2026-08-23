import React from "react";

export const EmptyRooms = ({ onCreateClick }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center" dir="rtl">
            <div className="w-16 h-16 rounded-full bg-vtt-s2 border border-vtt-border flex items-center justify-center mb-4 text-2xl text-vtt-t3">
                🎲
            </div>
            <h3 className="text-base font-bold text-vtt-t1 mb-1 font-fa">هیچ اتاقی ساخته نشده است</h3>
            <p className="text-xs text-vtt-t3 mb-5 max-w-xs font-fa">
                اولین اتاق بازی رومیزی خود را بسازید و بازیکنان را با کد اتاق دعوت کنید.
            </p>
            <button
                type="button"
                onClick={onCreateClick}
                className="px-4 py-2 bg-neon text-vtt-bg font-semibold rounded-md text-xs hover:opacity-90 active:scale-[0.99] transition-all"
            >
                اتاق جدید بساز
            </button>
        </div>
    );
};