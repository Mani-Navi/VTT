import React, { useState } from "react";
import {
    Eye,
    EyeOff,
    Square,
    Circle,
    Triangle,
    Hexagon,
    Scissors,
    Maximize2,
    Trash2,
    Crop,
    Layers,
    Minimize2,
    ChevronDown,
    SlidersHorizontal,
    Check,
    PenTool,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { TOOLS, FOG_ACTIONS, FOG_BRUSH_SHAPES } from "../../constants/tools";
import { Tooltip } from "../ui/Tooltip";
import { cn } from "../../utils/cn";
import { wsService } from "../../services/websocket.service";

const FIT_OPTIONS = [
    {
        key: "fit",
        label: "Fit (انطباق با نقشه)",
        shortLabel: "Fit",
        icon: Maximize2,
        colorClass: "text-amber-400",
    },
    {
        key: "trim",
        label: "Trim (برش اضافات)",
        shortLabel: "Trim",
        icon: Crop,
        colorClass: "text-cyan-400",
    },
    {
        key: "join",
        label: "Join (ادغام نواحی)",
        shortLabel: "Join",
        icon: Minimize2,
        colorClass: "text-emerald-400",
    },
    {
        key: "overlay",
        label: "Overlay (لایه رویی)",
        shortLabel: "Overlay",
        icon: Layers,
        colorClass: "text-purple-400",
    },
];

export const FogSubToolbar = () => {
    const activeTool = useCanvasStore((state) => state.activeTool);
    const fogAction = useCanvasStore((state) => state.fogAction);
    const fogBrushShape = useCanvasStore((state) => state.fogBrushShape);
    const fogBrushRadius = useCanvasStore((state) => state.fogBrushRadius);
    const isFogRevealedGlobally = useCanvasStore((state) => state.isFogRevealedGlobally);
    const selectedFogId = useCanvasStore((state) => state.selectedFogId);

    const setFogAction = useCanvasStore((state) => state.setFogAction);
    const setFogBrushShape = useCanvasStore((state) => state.setFogBrushShape);
    const setFogBrushRadius = useCanvasStore((state) => state.setFogBrushRadius);
    const setFogGlobalReveal = useCanvasStore((state) => state.setFogGlobalReveal);

    const currentScene = useSceneStore((state) => state.currentScene);
    const setScene = useSceneStore((state) => state.setScene);
    const updateFogShape = useSceneStore((state) => state.updateFogShape);

    const [isFitMenuOpen, setIsFitMenuOpen] = useState(false);
    const [selectedFitOptionKey, setSelectedFitOptionKey] = useState("fit");

    if (activeTool !== TOOLS.FOG) return null;

    const isFogFilled = Boolean(currentScene?.fogFilled);
    const currentOption = FIT_OPTIONS.find((o) => o.key === selectedFitOptionKey) || FIT_OPTIONS[0];
    const CurrentOptionIcon = currentOption.icon;

    const handleToggleGlobalReveal = () => {
        const nextState = !isFogRevealedGlobally;
        setFogGlobalReveal(nextState);

        wsService.send("FOG_GLOBAL_REVEAL", {
            sceneId: currentScene?.id,
            isRevealed: nextState,
        });
    };

    const handleToggleFillFog = () => {
        if (!currentScene) return;

        if (isFogFilled) {
            const updated = {
                ...currentScene,
                fogEnabled: false,
                fogFilled: false,
                fogShapes: [],
            };
            setScene(updated);
            wsService.send("FOG_CLEAR", {
                sceneId: currentScene.id,
                type: "CLEAR_ALL",
                points: {},
            });
        } else {
            const updated = {
                ...currentScene,
                fogEnabled: true,
                fogFilled: true,
                fogShapes: [],
            };
            setScene(updated);
            wsService.send("FOG_UPDATE", {
                sceneId: currentScene.id,
                type: "FILL_ALL",
                fogFilled: true,
                isCover: true,
                mode: "fill_all",
                points: { mode: "fill_all" },
            });
        }
    };

    const handleClearAll = () => {
        if (!currentScene) return;
        const updated = {
            ...currentScene,
            fogEnabled: false,
            fogFilled: false,
            fogShapes: [],
        };
        setScene(updated);
        wsService.send("FOG_CLEAR", {
            sceneId: currentScene.id,
            type: "CLEAR_ALL",
        });
    };

    // اجرای عملیات بر اساس گزینه انتخابی و بررسی داشتن شکل انتخاب شده یا نه
    const handleFitOptionSelect = (optionKey) => {
        setSelectedFitOptionKey(optionKey);
        setIsFitMenuOpen(false);

        const mapWidth = currentScene?.mapWidth || 2000;
        const mapHeight = currentScene?.mapHeight || 1500;
        const fogShapes = currentScene?.fogShapes || [];
        const selectedShape = fogShapes.find((f) => String(f.id) === String(selectedFogId));

        if (optionKey === "fit") {
            if (selectedShape) {
                // حالت الف: اگر شکلی انتخاب شده، به ابعاد کل نقشه فیت می‌شود
                const fittedShape = {
                    ...selectedShape,
                    type: "rect",
                    x: 0,
                    y: 0,
                    width: mapWidth,
                    height: mapHeight,
                };
                updateFogShape(selectedShape.id, fittedShape);
                wsService.send("FOG_UPDATE", {
                    ...fittedShape,
                    sceneId: currentScene.id,
                    type: fittedShape.isCover ? "HIDE" : "REVEAL",
                    points: fittedShape,
                });
            } else {
                // حالت ب: اگر شکلی انتخاب نشده، کل نقشه پوشانده می‌شود
                handleToggleFillFog();
            }
        } else if (optionKey === "trim") {
            if (selectedShape) {
                // حالت الف: شکل انتخاب شده به حاشیه مپ محدود (Trim) می‌شود
                const trimmedX = Math.max(0, selectedShape.x || 0);
                const trimmedY = Math.max(0, selectedShape.y || 0);
                const trimmedW = Math.min(mapWidth - trimmedX, selectedShape.width || mapWidth);
                const trimmedH = Math.min(mapHeight - trimmedY, selectedShape.height || mapHeight);

                const trimmedShape = {
                    ...selectedShape,
                    x: trimmedX,
                    y: trimmedY,
                    width: Math.max(20, trimmedW),
                    height: Math.max(20, trimmedH),
                };
                updateFogShape(selectedShape.id, trimmedShape);
                wsService.send("FOG_UPDATE", {
                    ...trimmedShape,
                    sceneId: currentScene.id,
                    type: trimmedShape.isCover ? "HIDE" : "REVEAL",
                    points: trimmedShape,
                });
            } else {
                // حالت ب: ابزار برش مستطیلی فعال می‌شود
                setFogAction(FOG_ACTIONS.SLICE);
                setFogBrushShape(FOG_BRUSH_SHAPES.RECTANGLE);
            }
        } else if (optionKey === "join") {
            // ادغام کلیه بخش‌های مه به عنوان یک لایه پیوسته
            setFogAction(FOG_ACTIONS.HIDE);
            setFogBrushShape(FOG_BRUSH_SHAPES.RECTANGLE);
        } else if (optionKey === "overlay") {
            // سوئیچ به لایه رویی استاندارد
            setFogAction(FOG_ACTIONS.HIDE);
        }
    };

    return (
        <div
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150 text-zinc-200"
            dir="rtl"
        >
            {/* انتخاب اکشن مه: تاگل آشکارسازی سراسری / پوشاندن / برش (Slice) */}
            <div className="flex items-center gap-1 p-0.5 bg-zinc-900 rounded-xl border border-zinc-800">
                <Tooltip
                    content={isFogRevealedGlobally ? "Disable Global Reveal" : "Enable Global Reveal"}
                    subContent={
                        isFogRevealedGlobally
                            ? "غیرفعال‌سازی آشکارسازی (نمایش مجدد مه برای تمام بازیکنان)"
                            : "فعال‌سازی آشکارسازی (پنهان کردن موقت تمام مه نقشه برای همه)"
                    }
                >
                    <button
                        type="button"
                        onClick={handleToggleGlobalReveal}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            isFogRevealedGlobally
                                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                                : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isFogRevealedGlobally ? "آشکارساز (فعال)" : "آشکارساز"}</span>
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

                <Tooltip content="Slice Fog" subContent="برش دقیق بخشی از مه با شکل یا خودنویس">
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

            {/* اشکال مه جنگ */}
            <div className="flex items-center gap-1">
                <Tooltip content="Circle Fog" subContent="دایره">
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

                <Tooltip content="Rectangle Fog" subContent="مستطیل">
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

                <Tooltip content="Triangle Fog" subContent="مثلث">
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

                <Tooltip content="Hexagon Fog" subContent="شش‌ضلعی">
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

                <Tooltip content="Pen / Polygon Fog" subContent="خودنویس چندضلعی نقطه‌به‌نقطه">
                    <button
                        type="button"
                        onClick={() => setFogBrushShape(FOG_BRUSH_SHAPES.POLYGON)}
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            fogBrushShape === FOG_BRUSH_SHAPES.POLYGON
                                ? "bg-zinc-800 text-amber-400 border border-amber-500/40"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        )}
                    >
                        <PenTool className="w-4 h-4" />
                    </button>
                </Tooltip>
            </div>

            <div className="h-5 w-px bg-zinc-800 mx-1" />

            {/* اسلایدر سایز */}
            <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] text-zinc-400 font-mono">{fogBrushRadius || 75}px</span>
                <input
                    type="range"
                    min="30"
                    max="250"
                    step="10"
                    value={fogBrushRadius || 75}
                    onChange={(e) => setFogBrushRadius(Number(e.target.value))}
                    className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>

            <div className="h-5 w-px bg-zinc-800 mx-1" />

            {/* دکمه تاگل Fill Fog */}
            <Tooltip content="Fill Fog" subContent={isFogFilled ? "حذف مه کل نقشه" : "پوشاندن یکپارچه کل نقشه با مه"}>
                <button
                    type="button"
                    onClick={handleToggleFillFog}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95",
                        isFogFilled
                            ? "bg-rose-600 text-white shadow-rose-600/30 border border-rose-400/30"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
                    )}
                >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{isFogFilled ? "خالی کردن مه" : "Fill Fog"}</span>
                </button>
            </Tooltip>

            {/* منوی بازشونده Fit Fog با عنوان و آیکون داینامیک */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsFitMenuOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-amber-500/40 hover:border-amber-500 text-amber-400 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm"
                >
                    <CurrentOptionIcon className={cn("w-3.5 h-3.5", currentOption.colorClass)} />
                    <span>{currentOption.shortLabel} Fog</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isFitMenuOpen ? "rotate-180" : "")} />
                </button>

                {isFitMenuOpen && (
                    <div className="absolute bottom-full mb-2 right-0 w-52 bg-zinc-950/95 border border-zinc-800 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
                        {FIT_OPTIONS.map((opt) => {
                            const OptionIcon = opt.icon;
                            const isSelected = selectedFitOptionKey === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => handleFitOptionSelect(opt.key)}
                                    className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-900 text-zinc-200 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <OptionIcon className={cn("w-4 h-4", opt.colorClass)} />
                                        <span>{opt.label}</span>
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="h-5 w-px bg-zinc-800 mx-1" />

            {/* پاک‌کردن مه */}
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