import React from "react";
import {
    Eye,
    EyeOff,
    Square,
    Circle,
    Paintbrush,
    Triangle,
    Hexagon,
    Scissors,
    Maximize2,
    Trash2,
    Sparkles,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { TOOLS, FOG_ACTIONS, FOG_BRUSH_SHAPES } from "../../constants/tools";
import { Tooltip } from "../ui/Tooltip";
import { cn } from "../../utils/cn";

export const FogSubToolbar = () => {
    const activeTool = useCanvasStore((state) => state.activeTool);
    const fogAction = useCanvasStore((state) => state.fogAction);
    const fogBrushShape = useCanvasStore((state) => state.fogBrushShape);
    const fogBrushRadius = useCanvasStore((state) => state.fogBrushRadius);

    const setFogAction = useCanvasStore((state) => state.setFogAction);
    const setFogBrushShape = useCanvasStore((state) => state.setFogBrushShape);
    const setFogBrushRadius = useCanvasStore((state) => state.setFogBrushRadius);

    const currentScene = useSceneStore((state) => state.currentScene);
    const setScene = useSceneStore((state) => state.setScene);

    if (activeTool !== TOOLS.FOG) return null;

    const handleFillAll = () => {
        if (!currentScene) return;
        setScene({
            ...currentScene,
            fogEnabled: true,
            fogFilled: true,
            fogShapes: [],
        });
    };

    const handleClearAll = () => {
        if (!currentScene) return;
        setScene({
            ...currentScene,
            fogEnabled: false,
            fogFilled: false,
            fogShapes: [],
        });
    };

    return (
        <div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150 text-zinc-200"
            dir="rtl"
        >
            {/* انتخاب اکشن مه: آشکارسازی (Reveal) / پوشاندن (Hide) / برش (Slice UCS-02) */}
            <div className="flex items-center gap-1 p-0.5 bg-zinc-900 rounded-xl border border-zinc-800">
                <Tooltip content="Reveal Area" subContent="آشکارسازی و نمایش نقشه برای بازیکنان">
                    <button
                        type="button"
                        onClick={() => setFogAction(FOG_ACTIONS.REVEAL)}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            fogAction === FOG_ACTIONS.REVEAL
                                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                                : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>آشکارسازی</span>
                    </button>
                </Tooltip>

                <Tooltip content="Hide Area" subContent="پوشاندن نقشه با تاریکی">
                    <button
                        type="button"
                        onClick={() => setFogAction(FOG_ACTIONS.HIDE)}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            fogAction === FOG_ACTIONS.HIDE
                                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                                : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>پوشاندن</span>
                    </button>
                </Tooltip>

                <Tooltip content="Slice Fog" subContent="برش دقیق بخشی از مه جنگ (UCS-02)">
                    <button
                        type="button"
                        onClick={() => setFogAction(FOG_ACTIONS.SLICE)}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            fogAction === FOG_ACTIONS.SLICE
                                ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                                : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>برش (Slice)</span>
                    </button>
                </Tooltip>
            </div>

            <div className="h-5 w-px bg-zinc-800 mx-1" />

            {/* انتخاب اشکال قلم مه جنگ (Circle, Rectangle, Triangle, Hexagon, Freehand) */}
            <div className="flex items-center gap-1">
                <Tooltip content="Circle Fog" subContent="برش یا پوشش دایره‌ای">
                    <button
                        type="button"
                        onClick={() => setFogBrushShape(FOG_BRUSH_SHAPES.CIRCLE)}
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            fogBrushShape === FOG_BRUSH_SHAPES.CIRCLE
                                ? "bg-zinc-800 text-amber-400 border border-amber-500/40"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        )}
                    >
                        <Circle className="w-4 h-4" />
                    </button>
                </Tooltip>

                <Tooltip content="Rectangle Fog" subContent="برش یا پوشش مستطیلی">
                    <button
                        type="button"
                        onClick={() => setFogBrushShape(FOG_BRUSH_SHAPES.RECTANGLE)}
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            fogBrushShape === FOG_BRUSH_SHAPES.RECTANGLE
                                ? "bg-zinc-800 text-amber-400 border border-amber-500/40"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        )}
                    >
                        <Square className="w-4 h-4" />
                    </button>
                </Tooltip>

                <Tooltip content="Triangle Fog" subContent="برش مثلثی">
                    <button
                        type="button"
                        onClick={() => setFogBrushShape(FOG_BRUSH_SHAPES.TRIANGLE)}
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            fogBrushShape === FOG_BRUSH_SHAPES.TRIANGLE
                                ? "bg-zinc-800 text-amber-400 border border-amber-500/40"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        )}
                    >
                        <Triangle className="w-4 h-4" />
                    </button>
                </Tooltip>

                <Tooltip content="Hexagon Fog" subContent="برش شش‌ضلعی">
                    <button
                        type="button"
                        onClick={() => setFogBrushShape(FOG_BRUSH_SHAPES.HEXAGON)}
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            fogBrushShape === FOG_BRUSH_SHAPES.HEXAGON
                                ? "bg-zinc-800 text-amber-400 border border-amber-500/40"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        )}
                    >
                        <Hexagon className="w-4 h-4" />
                    </button>
                </Tooltip>

                <Tooltip content="Freehand Brush" subContent="براش آزاد مه">
                    <button
                        type="button"
                        onClick={() => setFogBrushShape(FOG_BRUSH_SHAPES.FREEHAND)}
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            fogBrushShape === FOG_BRUSH_SHAPES.FREEHAND
                                ? "bg-zinc-800 text-amber-400 border border-amber-500/40"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        )}
                    >
                        <Paintbrush className="w-4 h-4" />
                    </button>
                </Tooltip>
            </div>

            <div className="h-5 w-px bg-zinc-800 mx-1" />

            {/* اسلایدر اندازه براش */}
            <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] text-zinc-400 font-mono">{fogBrushRadius || 70}px</span>
                <input
                    type="range"
                    min="30"
                    max="250"
                    step="10"
                    value={fogBrushRadius || 70}
                    onChange={(e) => setFogBrushRadius(Number(e.target.value))}
                    className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>

            <div className="h-5 w-px bg-zinc-800 mx-1" />

            {/* دکمه‌های پر کردن یا پاک‌سازی کل مه */}
            <Tooltip content="Cover All" subContent="پوشاندن کل نقشه با مه تاریکی">
                <button
                    type="button"
                    onClick={handleFillAll}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
            </Tooltip>

            <Tooltip content="Clear Fog" subContent="حذف تمام مه جنگ">
                <button
                    type="button"
                    onClick={handleClearAll}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </Tooltip>
        </div>
    );
};