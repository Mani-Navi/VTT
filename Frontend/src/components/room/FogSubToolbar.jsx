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
    Check,
    PenTool,
    Sparkles,
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
        bgClass: "bg-amber-500/10 border-amber-500/30",
    },
    {
        key: "trim",
        label: "Trim (برش اضافات)",
        shortLabel: "Trim",
        icon: Crop,
        colorClass: "text-cyan-400",
        bgClass: "bg-cyan-500/10 border-cyan-500/30",
    },
    {
        key: "join",
        label: "Join (ادغام نواحی)",
        shortLabel: "Join",
        icon: Minimize2,
        colorClass: "text-emerald-400",
        bgClass: "bg-emerald-500/10 border-emerald-500/30",
    },
    {
        key: "overlay",
        label: "Overlay (لایه رویی)",
        shortLabel: "Overlay",
        icon: Layers,
        colorClass: "text-purple-400",
        bgClass: "bg-purple-500/10 border-purple-500/30",
    },
];

export const FogSubToolbar = () => {
    const activeTool = useCanvasStore((state) => state.activeTool);
    const fogAction = useCanvasStore((state) => state.fogAction);
    const fogBrushShape = useCanvasStore((state) => state.fogBrushShape);
    const isFogRevealedGlobally = useCanvasStore((state) => state.isFogRevealedGlobally);
    const selectedFogId = useCanvasStore((state) => state.selectedFogId);

    const setFogAction = useCanvasStore((state) => state.setFogAction);
    const setFogBrushShape = useCanvasStore((state) => state.setFogBrushShape);
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
            points: {},
        });
    };

    const handleFitOptionSelect = (optionKey) => {
        setSelectedFitOptionKey(optionKey);
        setIsFitMenuOpen(false);

        const mapWidth = currentScene?.mapWidth || 2000;
        const mapHeight = currentScene?.mapHeight || 1500;
        const fogShapes = currentScene?.fogShapes || [];
        const selectedShape = fogShapes.find((f) => String(f.id) === String(selectedFogId));

        if (optionKey === "fit") {
            if (selectedShape) {
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
                handleToggleFillFog();
            }
        } else if (optionKey === "trim") {
            if (selectedShape) {
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
                setFogAction(FOG_ACTIONS.SLICE);
                setFogBrushShape(FOG_BRUSH_SHAPES.RECTANGLE);
            }
        } else if (optionKey === "join") {
            setFogAction(FOG_ACTIONS.HIDE);
            setFogBrushShape(FOG_BRUSH_SHAPES.RECTANGLE);
        } else if (optionKey === "overlay") {
            setFogAction(FOG_ACTIONS.HIDE);
        }
    };

    return (
        <div
            className="relative flex items-center gap-2 px-3.5 py-2 bg-zinc-950/95 border border-zinc-800/90 rounded-2xl shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 text-zinc-100"
            dir="rtl"
        >
            {/* ۱. بخش حالت‌های عملکردی مه (آشکارساز، پوشش، برش) */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800/80">
                <Tooltip
                    content={isFogRevealedGlobally ? "Disable Global Reveal" : "Enable Global Reveal"}
                    subContent={
                        isFogRevealedGlobally
                            ? "غیرفعال‌سازی آشکارساز (نمایش مجدد مه برای بازیکنان)"
                            : "فعال‌سازی آشکارساز (پنهان کردن موقت مه نقشه)"
                    }
                >
                    <button
                        type="button"
                        onClick={handleToggleGlobalReveal}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
                            isFogRevealedGlobally
                                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/50"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                        )}
                    >
                        <Eye className="w-4 h-4 stroke-[2.2]" />
                        <span>آشکارساز</span>
                    </button>
                </Tooltip>

                <Tooltip content="Hide Fog" subContent="پوشاندن نقشه با تاریکی">
                    <button
                        type="button"
                        onClick={() => setFogAction(FOG_ACTIONS.HIDE)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
                            fogAction === FOG_ACTIONS.HIDE
                                ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25 ring-1 ring-rose-400/50"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                        )}
                    >
                        <EyeOff className="w-4 h-4 stroke-[2.2]" />
                        <span>پوشاندن</span>
                    </button>
                </Tooltip>

                <Tooltip content="Slice Fog" subContent="برش دقیق بخشی از مه با شکل یا خودنویس">
                    <button
                        type="button"
                        onClick={() => setFogAction(FOG_ACTIONS.SLICE)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
                            fogAction === FOG_ACTIONS.SLICE
                                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-400/50"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                        )}
                    >
                        <Scissors className="w-4 h-4 stroke-[2.2]" />
                        <span>برش</span>
                    </button>
                </Tooltip>
            </div>

            <div className="h-6 w-px bg-zinc-800/80 mx-0.5" />

            {/* ۲. اشکال هندسی مه جنگ با سایزهای فراگیر و تاچ راحت */}
            <div className="flex items-center gap-1 p-0.5 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                <Tooltip content="Circle Fog" subContent="دایره">
                    <button
                        type="button"
                        onClick={() => setFogBrushShape(FOG_BRUSH_SHAPES.CIRCLE)}
                        className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            fogBrushShape === FOG_BRUSH_SHAPES.CIRCLE
                                ? "bg-zinc-800 text-amber-400 border border-amber-500/50 shadow-md"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                        )}
                    >
                        <Circle className="w-4 h-4 stroke-[2]" />
                    </button>
                </Tooltip>

                <Tooltip content="Rectangle Fog" subContent="مستطیل">
                    <button
                        type="button"
                        onClick={() => setFogBrushShape(FOG_BRUSH_SHAPES.RECTANGLE)}
                        className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            fogBrushShape === FOG_BRUSH_SHAPES.RECTANGLE
                                ? "bg-zinc-800 text-amber-400 border border-amber-500/50 shadow-md"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                        )}
                    >
                        <Square className="w-4 h-4 stroke-[2]" />
                    </button>
                </Tooltip>

                <Tooltip content="Triangle Fog" subContent="مثلث">
                    <button
                        type="button"
                        onClick={() => setFogBrushShape(FOG_BRUSH_SHAPES.TRIANGLE)}
                        className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            fogBrushShape === FOG_BRUSH_SHAPES.TRIANGLE
                                ? "bg-zinc-800 text-amber-400 border border-amber-500/50 shadow-md"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                        )}
                    >
                        <Triangle className="w-4 h-4 stroke-[2]" />
                    </button>
                </Tooltip>

                <Tooltip content="Hexagon Fog" subContent="شش‌ضلعی">
                    <button
                        type="button"
                        onClick={() => setFogBrushShape(FOG_BRUSH_SHAPES.HEXAGON)}
                        className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            fogBrushShape === FOG_BRUSH_SHAPES.HEXAGON
                                ? "bg-zinc-800 text-amber-400 border border-amber-500/50 shadow-md"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                        )}
                    >
                        <Hexagon className="w-4 h-4 stroke-[2]" />
                    </button>
                </Tooltip>

                <Tooltip content="Pen / Polygon Fog" subContent="خودنویس چندضلعی نقطه‌به‌نقطه">
                    <button
                        type="button"
                        onClick={() => setFogBrushShape(FOG_BRUSH_SHAPES.POLYGON)}
                        className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                            fogBrushShape === FOG_BRUSH_SHAPES.POLYGON
                                ? "bg-zinc-800 text-amber-400 border border-amber-500/50 shadow-md"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                        )}
                    >
                        <PenTool className="w-4 h-4 stroke-[2]" />
                    </button>
                </Tooltip>
            </div>

            <div className="h-6 w-px bg-zinc-800/80 mx-0.5" />

            {/* ۳. دکمه Fill Fog */}
            <Tooltip content="Fill Fog" subContent={isFogFilled ? "خالی کردن مه کل نقشه" : "پوشاندن کل نقشه با مه"}>
                <button
                    type="button"
                    onClick={handleToggleFillFog}
                    className={cn(
                        "flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95",
                        isFogFilled
                            ? "bg-rose-600 text-white shadow-rose-600/30 border border-rose-400/40"
                            : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80"
                    )}
                >
                    <EyeOff className="w-4 h-4 stroke-[2]" />
                    <span>{isFogFilled ? "خالی کردن مه" : "Fill Fog"}</span>
                </button>
            </Tooltip>

            {/* ۴. منوی بازشونده Fit Fog */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsFitMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900/90 border border-amber-500/40 hover:border-amber-500 text-amber-400 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm hover:bg-zinc-850"
                >
                    <CurrentOptionIcon className={cn("w-4 h-4 stroke-[2.2]", currentOption.colorClass)} />
                    <span>{currentOption.shortLabel} Fog</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 opacity-80", isFitMenuOpen ? "rotate-180" : "")} />
                </button>

                {isFitMenuOpen && (
                    <div className="absolute bottom-full mb-2.5 right-0 w-56 bg-zinc-950/95 border border-zinc-800/90 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                        {FIT_OPTIONS.map((opt) => {
                            const OptionIcon = opt.icon;
                            const isSelected = selectedFitOptionKey === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => handleFitOptionSelect(opt.key)}
                                    className={cn(
                                        "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                                        isSelected
                                            ? "bg-zinc-900 text-zinc-100 border border-zinc-700/60 shadow-sm"
                                            : "hover:bg-zinc-900/70 text-zinc-400 hover:text-zinc-200"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn("p-1.5 rounded-lg border", opt.bgClass)}>
                                            <OptionIcon className={cn("w-4 h-4", opt.colorClass)} />
                                        </div>
                                        <span>{opt.label}</span>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-amber-400 stroke-[2.5]" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="h-6 w-px bg-zinc-800/80 mx-0.5" />

            {/* ۵. دکمه پاک‌کردن کامل مه */}
            <Tooltip content="Clear Fog" subContent="حذف کامل تمام مه جنگ نقشه">
                <button
                    type="button"
                    onClick={handleClearAll}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                >
                    <Trash2 className="w-4 h-4 stroke-[2]" />
                </button>
            </Tooltip>
        </div>
    );
};