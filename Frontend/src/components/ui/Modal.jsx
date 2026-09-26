import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export const Modal = ({
                          isOpen,
                          onClose,
                          title,
                          titleFa,
                          children,
                          maxWidth = "md",
                          className,
                      }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div
                className={cn(
                    "relative w-full bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 text-zinc-100 flex flex-col max-h-[88dvh]",
                    maxWidthClasses[maxWidth],
                    className
                )}
            >
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
                    <div>
                        <h3 className="text-sm sm:text-base font-bold text-zinc-100">{title}</h3>
                        {titleFa && <p className="text-[11px] sm:text-xs text-zinc-400 font-fa mt-0.5">{titleFa}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div
                    className="p-3.5 sm:p-6 overflow-y-auto custom-scrollbar flex-1"
                    style={{ WebkitOverflowScrolling: "touch" }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};