import React, { useId } from "react";
import { cn } from "../../utils/cn";

export const Input = React.forwardRef(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;

        return (
            <div className="w-full space-y-1.5 text-right font-fa" dir="rtl">
                {label && (
                    <label htmlFor={inputId} className="block text-xs font-semibold text-zinc-300">
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        /* text-base در موبایل مانع زوم ناخواسته در آیفون می‌شود و در sm:text-sm متناسب می‌شود */
                        "w-full h-11 sm:h-10 px-3.5 bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 rounded-xl border border-zinc-700/80 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors shadow-inner",
                        error && "border-rose-500 focus:ring-rose-500/40 focus:border-rose-500",
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
                {helperText && !error && <p className="text-xs text-zinc-400">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";