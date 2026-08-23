import React, { useState } from "react";
import { cn } from "../../utils/cn";

export interface TooltipProps {
  content: string;
  subContent?: string;
  shortcut?: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  subContent,
  shortcut,
  position = "top",
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 pointer-events-none px-2.5 py-1.5 bg-zinc-950/95 border border-zinc-800 text-zinc-100 text-xs rounded-lg shadow-xl backdrop-blur-md whitespace-nowrap flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100",
            positionClasses[position]
          )}
        >
          <div className="flex flex-col">
            <span className="font-medium">{content}</span>
            {subContent && <span className="text-[10px] text-zinc-400 font-fa">{subContent}</span>}
          </div>
          {shortcut && (
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 border border-zinc-700 text-amber-400 rounded">
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  );
};
