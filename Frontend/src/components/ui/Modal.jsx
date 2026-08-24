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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* پس‌زمینه مات و تیره */}
        <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        />

        {/* باکس مودال */}
        <div
            className={cn(
                "relative w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 text-zinc-100",
                maxWidthClasses[maxWidth],
                className
            )}
        >
          {/* هدر مودال */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
              {titleFa && <p className="text-xs text-zinc-400 font-fa mt-0.5">{titleFa}</p>}
            </div>
            <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* محتوای مودال */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
  );
};