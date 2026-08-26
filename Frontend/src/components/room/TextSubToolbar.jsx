import React, { useState } from "react";
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    Smile,
    Type,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { TOOLS, TEXT_FONTS } from "../../constants/tools";
import { cn } from "../../utils/cn";

const EMOJI_LIST = ["⚔️", "🛡️", "🐉", "💀", "🔥", "💎", "📜", "🏹", "✨", "🎲"];

export const TextSubToolbar = () => {
    const activeTool = useCanvasStore((state) => state.activeTool);
    const drawStrokeColor = useCanvasStore((state) => state.drawStrokeColor);
    const setDrawStrokeColor = useCanvasStore((state) => state.setDrawStrokeColor);

    const [fontFamily, setFontFamily] = useState("Vazirmatn");
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [headingMode, setHeadingMode] = useState("normal"); // normal | h1 | h2
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);

    if (activeTool !== TOOLS.TEXT) return null;

    return (
        <div
            className="flex items-center gap-2 p-1.5 bg-zinc-900/95 border border-zinc-800/90 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150 text-zinc-200"
            dir="rtl"
        >
            {/* انتخاب فونت */}
            <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
                {TEXT_FONTS.map((font) => (
                    <option key={font.id} value={font.id}>
                        {font.label}
                    </option>
                ))}
            </select>

            <div className="h-5 w-px bg-zinc-800" />

            {/* کنترل‌های سبک متن: Bold / Italic */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                    type="button"
                    onClick={() => setIsBold(!isBold)}
                    className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                        isBold ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
                    )}
                    title="درشت (Bold)"
                >
                    <Bold className="w-3.5 h-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() => setIsItalic(!isItalic)}
                    className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                        isItalic ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
                    )}
                    title="مورب (Italic)"
                >
                    <Italic className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* تیترها: H1 / H2 */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                    type="button"
                    onClick={() => setHeadingMode(headingMode === "h1" ? "normal" : "h1")}
                    className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                        headingMode === "h1" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
                    )}
                    title="تیتر اصلی (H1)"
                >
                    <Heading1 className="w-3.5 h-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() => setHeadingMode(headingMode === "h2" ? "normal" : "h2")}
                    className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                        headingMode === "h2" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
                    )}
                    title="تیتر فرعی (H2)"
                >
                    <Heading2 className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="h-5 w-px bg-zinc-800" />

            {/* انتخاب ایموجی */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                    className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400 hover:bg-zinc-800 cursor-pointer"
                    title="درج ایموجی RPG"
                >
                    <Smile className="w-3.5 h-3.5" />
                </button>

                {isEmojiOpen && (
                    <div className="absolute bottom-10 right-0 p-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl grid grid-cols-5 gap-1.5 z-50">
                        {EMOJI_LIST.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => setIsEmojiOpen(false)}
                                className="w-7 h-7 rounded hover:bg-zinc-800 flex items-center justify-center text-sm cursor-pointer"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};