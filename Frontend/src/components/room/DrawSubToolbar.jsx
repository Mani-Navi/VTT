import React from "react";
import {
    Shapes,
    PenTool,
    Paintbrush,
    Minus,
    Square,
    Circle as CircleIcon,
    Triangle as TriangleIcon,
    Hexagon as HexagonIcon,
    Eraser,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { DRAW_MODES, TOOLS } from "../../constants/tools";
import { cn } from "../../utils/cn";
import { Tooltip } from "../ui/Tooltip";

const COLOR_PALETTE = [
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#a855f7", // Purple
    "#ffffff", // White
    "#090a0f", // Dark
];

export const DrawSubToolbar = () => {
    const activeTool = useCanvasStore((state) => state.activeTool);
    const activeDrawShape = useCanvasStore((state) => state.activeDrawShape);
    const drawStrokeColor = useCanvasStore((state) => state.drawStrokeColor);
    const drawStrokeWidth = useCanvasStore((state) => state.drawStrokeWidth);
    const isDrawGMLayer = useCanvasStore((state) => state.isDrawGMLayer);

    const setActiveDrawShape = useCanvasStore((state) => state.setActiveDrawShape);
    const setDrawStrokeColor = useCanvasStore((state) => state.setDrawStrokeColor);
    const setDrawStrokeWidth = useCanvasStore((state) => state.setDrawStrokeWidth);
    const setIsDrawGMLayer = useCanvasStore((state) => state.setIsDrawGMLayer);

    if (activeTool !== TOOLS.DRAW) return null;

    const drawModesList = [
        { id: DRAW_MODES.MARKER, label: "ماژیک آزاد (Marker)", icon: PenTool },
        { id: DRAW_MODES.BRUSH, label: "قلم پر شده (Brush)", icon: Paintbrush },
        { id: DRAW_MODES.LINE, label: "خط مستقیم (Line)", icon: Minus },
        { id: DRAW_MODES.RECTANGLE, label: "مستطیل (Rectangle)", icon: Square },
        { id: DRAW_MODES.CIRCLE, label: "دایره (Circle)", icon: CircleIcon },
        { id: DRAW_MODES.TRIANGLE, label: "مثلث (Triangle)", icon: TriangleIcon },
        { id: DRAW_MODES.HEXAGON, label: "شش‌ضلعی (Hexagon)", icon: HexagonIcon },
        { id: DRAW_MODES.POLYGON, label: "چندضلعی (Polygon)", icon: Shapes },
        { id: DRAW_MODES.ERASER, label: "پاک‌کن (Eraser)", icon: Eraser },
    ];

    return (
        <div
            className="flex items-center gap-2 p-1.5 bg-zinc-900/95 border border-zinc-800/90 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150"
            dir="rtl"
        >
            {/* حالت‌های رسم اشکال */}
            <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/50">
                {drawModesList.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = activeDrawShape === mode.id;

                    return (
                        <Tooltip key={mode.id} content={mode.label}>
                            <button
                                type="button"
                                onClick={() => setActiveDrawShape(mode.id)}
                                className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                                    isActive
                                        ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20 scale-105"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    );
                })}
            </div>

            <div className="h-5 w-px bg-zinc-800" />

            {/* پالت رنگ سریع */}
            <div className="flex items-center gap-1.5 px-1">
                {COLOR_PALETTE.map((color) => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => setDrawStrokeColor(color)}
                        style={{ backgroundColor: color }}
                        className={cn(
                            "w-5 h-5 rounded-full transition-transform cursor-pointer border",
                            drawStrokeColor === color
                                ? "scale-125 border-white ring-2 ring-amber-500/50 shadow-sm"
                                : "border-zinc-700 hover:scale-110"
                        )}
                    />
                ))}
            </div>

            <div className="h-5 w-px bg-zinc-800" />

            {/* ضخامت خطوط */}
            <div className="flex items-center gap-1">
                {[2, 4, 8, 14].map((width) => (
                    <button
                        key={width}
                        type="button"
                        onClick={() => setDrawStrokeWidth(width)}
                        className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono transition-all cursor-pointer",
                            drawStrokeWidth === width
                                ? "bg-zinc-800 text-amber-400 font-bold border border-zinc-700"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        {width}
                    </button>
                ))}
            </div>

            <div className="h-5 w-px bg-zinc-800" />

            {/* لایه مخفی GM */}
            <button
                type="button"
                onClick={() => setIsDrawGMLayer(!isDrawGMLayer)}
                className={cn(
                    "px-2.5 h-7 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1",
                    isDrawGMLayer
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : "text-zinc-400 hover:bg-zinc-800"
                )}
            >
                {isDrawGMLayer ? "لایه GM (مخفی)" : "لایه عمومی"}
            </button>
        </div>
    );
};