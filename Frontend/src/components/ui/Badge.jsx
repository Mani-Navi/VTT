import React from "react";
import { cn } from "../../utils/cn";

export const Badge = ({
                        variant = "default",
                        size = "sm",
                        children,
                        className,
                      }) => {
  const variantClasses = {
    default: "bg-zinc-800 text-zinc-300 border border-zinc-700",
    gm: "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold",
    player: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    danger: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    amber: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    outline: "bg-transparent text-zinc-400 border border-zinc-700",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] rounded-md",
    md: "px-2.5 py-1 text-xs rounded-lg",
  };

  return (
      <span
          className={cn(
              "inline-flex items-center gap-1 font-medium select-none whitespace-nowrap",
              variantClasses[variant],
              sizeClasses[size],
              className
          )}
      >
      {children}
    </span>
  );
};