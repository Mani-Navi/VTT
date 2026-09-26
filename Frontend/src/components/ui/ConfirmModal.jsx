import React from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import { useConfirmStore } from "../../store/confirm.store";

export const ConfirmModal = () => {
    const {
        isOpen,
        title,
        message,
        confirmText,
        cancelText,
        variant,
        handleConfirm,
        handleCancel,
    } = useConfirmStore();

    if (!isOpen) return null;

    const isDanger = variant === "danger";

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 font-fa select-none"
            dir="rtl"
            onClick={handleCancel}
        >
            <div
                className="relative w-full max-w-md bg-zinc-950/95 border border-zinc-800/90 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-4 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20 ${
                        isDanger ? "bg-rose-500" : "bg-amber-500"
                    }`}
                />

                <div className="flex items-start gap-3 sm:gap-4">
                    <div
                        className={`p-2.5 sm:p-3 rounded-2xl shrink-0 ${
                            isDanger
                                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                    >
                        {isDanger ? (
                            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                        <h4 className="text-xs sm:text-sm font-black text-zinc-100 mb-1 leading-snug">
                            {title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed font-medium">
                            {message}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="p-1 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center justify-end gap-2 mt-5 pt-3.5 border-t border-zinc-900">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-3.5 sm:px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg ${
                            isDanger
                                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                                : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/30"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};