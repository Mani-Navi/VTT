import React, { useId } from "react";
import { cn } from "../../utils/cn";

export const Input = React.forwardRef(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;

        return (
            <div className="w-full space-y-1.5 text-right font-fa" dir="rtl">
                {label && (
                    <label htmlFor={inputId} className="block text-xs font-medium text-zinc-300">
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "w-full h-10 px-3.5 bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 rounded-lg border border-zinc-700/80 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors",
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