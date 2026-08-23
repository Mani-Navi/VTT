import React from "react";
import {
  MousePointer,
  Hand,
  Pencil,
  EyeOff,
  Eye,
  Ruler,
  Crosshair,
  Dices,
  Image as ImageIcon,
  Users,
  Settings,
  ListOrdered,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Sparkles,
  Eraser,
  Paintbrush,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import {
  TOOLS,
  ToolType,
  DRAW_SHAPES,
  DrawShapeType,
  FOG_MODES,
  FogModeType,
  FOG_BRUSH_SHAPES,
  FogBrushShapeType,
  FOG_ACTIONS,
  FogActionType,
} from "../../constants/tools";
import { MEASUREMENT_TYPES, MeasurementType } from "../../constants/measurementTypes";
import { Tooltip } from "../ui/Tooltip";
import { cn } from "../../utils/cn";

export const Toolbar: React.FC = () => {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const activeDrawShape = useCanvasStore((state) => state.activeDrawShape);
  const activeFogMode = useCanvasStore((state) => state.activeFogMode);
  const fogBrushShape = useCanvasStore((state) => state.fogBrushShape);
  const fogAction = useCanvasStore((state) => state.fogAction);
  const fogBrushRadius = useCanvasStore((state) => state.fogBrushRadius);
  const rulerType = useCanvasStore((state) => state.rulerType);
  const drawStrokeColor = useCanvasStore((state) => state.drawStrokeColor);
  const drawStrokeWidth = useCanvasStore((state) => state.drawStrokeWidth);
  const zoom = useCanvasStore((state) => state.zoom);

  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const setActiveDrawShape = useCanvasStore((state) => state.setActiveDrawShape);
  const setActiveFogMode = useCanvasStore((state) => state.setActiveFogMode);
  const setFogBrushShape = useCanvasStore((state) => state.setFogBrushShape);
  const setFogAction = useCanvasStore((state) => state.setFogAction);
  const setFogBrushRadius = useCanvasStore((state) => state.setFogBrushRadius);
  const setRulerType = useCanvasStore((state) => state.setRulerType);
  const setDrawStrokeColor = useCanvasStore((state) => state.setDrawStrokeColor);
  const setDrawStrokeWidth = useCanvasStore((state) => state.setDrawStrokeWidth);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const resetView = useCanvasStore((state) => state.resetView);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const isAssetOpen = useCanvasStore((state) => state.isAssetMenuOpen);
  const isPlayerOpen = useCanvasStore((state) => state.isPlayerMenuOpen);
  const isSettingsOpen = useCanvasStore((state) => state.isSettingsMenuOpen);
  const isExtOpen = useCanvasStore((state) => state.isExtensionsMenuOpen);
  const isDiceOpen = useCanvasStore((state) => state.isDiceRollerOpen);

  const currentScene = useSceneStore((state) => state.currentScene);
  const updateGrid = useSceneStore((state) => state.updateGrid);
  const resetFog = useSceneStore((state) => state.resetFog);
  const revealAllFog = useSceneStore((state) => state.revealAllFog);

  const { isGM } = usePermissions();

  const primaryTools: Array<{ id: ToolType; label: string; labelFa: string; icon: any; shortcut: string; gmOnly?: boolean }> = [
    { id: TOOLS.SELECT, label: "Select & Move", labelFa: "انتخاب و جابجایی", icon: MousePointer, shortcut: "V" },
    { id: TOOLS.PAN, label: "Pan Stage", labelFa: "جابجایی مپ", icon: Hand, shortcut: "H" },
    { id: TOOLS.DRAW, label: "Draw Shapes", labelFa: "ابزار رسم و یادداشت", icon: Pencil, shortcut: "D" },
    { id: TOOLS.FOG, label: "Fog of War", labelFa: "مه تاریکی (Fog)", icon: EyeOff, shortcut: "F", gmOnly: true },
    { id: TOOLS.RULER, label: "Tactical Ruler", labelFa: "خط‌کش اندازه‌گیری", icon: Ruler, shortcut: "R" },
    { id: TOOLS.LASER, label: "Laser Pointer", labelFa: "اشاره‌گر لیزری", icon: Crosshair, shortcut: "L" },
  ];

  const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff", "#18181b"];

  return (
    <>
      {/* Primary Floating Bottom Pill Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
        {/* Secondary Sub-toolbar for Active Tool */}
        {activeTool === TOOLS.DRAW && (
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Shape selection */}
            <div className="flex items-center gap-1 border-r border-zinc-800 pr-2">
              <button
                onClick={() => setActiveDrawShape(DRAW_SHAPES.FREEHAND)}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeDrawShape === DRAW_SHAPES.FREEHAND ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:bg-zinc-800"
                )}
                title="قلم آزاد"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveDrawShape(DRAW_SHAPES.LINE)}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeDrawShape === DRAW_SHAPES.LINE ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:bg-zinc-800"
                )}
                title="خط مستقیم"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveDrawShape(DRAW_SHAPES.ARROW)}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeDrawShape === DRAW_SHAPES.ARROW ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:bg-zinc-800"
                )}
                title="پیکان / فلش"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveDrawShape(DRAW_SHAPES.RECTANGLE)}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeDrawShape === DRAW_SHAPES.RECTANGLE ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:bg-zinc-800"
                )}
                title="مستطیل"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveDrawShape(DRAW_SHAPES.CIRCLE)}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeDrawShape === DRAW_SHAPES.CIRCLE ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:bg-zinc-800"
                )}
                title="دایره"
              >
                <Circle className="w-4 h-4" />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-1.5 pl-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setDrawStrokeColor(c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    "w-5 h-5 rounded-full border border-black/40 transition-transform",
                    drawStrokeColor === c ? "scale-125 ring-2 ring-amber-400" : "hover:scale-110"
                  )}
                />
              ))}
            </div>

            {/* Stroke Width */}
            <div className="flex items-center gap-1 border-l border-zinc-800 pl-2">
              {[2, 4, 8].map((w) => (
                <button
                  key={w}
                  onClick={() => setDrawStrokeWidth(w)}
                  className={cn(
                    "w-6 h-6 rounded flex items-center justify-center text-xs font-mono transition-colors",
                    drawStrokeWidth === w ? "bg-zinc-700 text-amber-400 font-bold" : "text-zinc-400 hover:bg-zinc-800"
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Secondary Sub-toolbar for Fog of War (GM) */}
        {activeTool === TOOLS.FOG && isGM && (
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Action Mode: Erase / Reveal vs Draw / Cover */}
            <div className="flex items-center gap-1 bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800">
              <button
                id="btn-fog-action-reveal"
                onClick={() => {
                  setFogAction(FOG_ACTIONS.REVEAL);
                  setActiveFogMode(
                    fogBrushShape === "rect"
                      ? FOG_MODES.REVEAL_RECT
                      : FOG_MODES.REVEAL_BRUSH
                  );
                }}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all",
                  fogAction === FOG_ACTIONS.REVEAL
                    ? "bg-emerald-600 text-white font-bold shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
                title="پاک‌کردن مه و آشکارسازی نقشه"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>پاک‌کردن مه (Erase)</span>
              </button>

              <button
                id="btn-fog-action-hide"
                onClick={() => {
                  setFogAction(FOG_ACTIONS.HIDE);
                  setActiveFogMode(
                    fogBrushShape === "rect"
                      ? FOG_MODES.HIDE_RECT
                      : FOG_MODES.HIDE_BRUSH
                  );
                }}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all",
                  fogAction === FOG_ACTIONS.HIDE
                    ? "bg-rose-600 text-white font-bold shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
                title="رسم مه و پوشاندن منطقه"
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>رسم مه (Draw)</span>
              </button>
            </div>

            <div className="h-4 w-px bg-zinc-800" />

            {/* Brush Shape: Circle vs Rect */}
            <div className="flex items-center gap-1 bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800">
              <button
                id="btn-fog-shape-circle"
                onClick={() => {
                  setFogBrushShape(FOG_BRUSH_SHAPES.CIRCLE);
                  setActiveFogMode(
                    fogAction === FOG_ACTIONS.HIDE
                      ? FOG_MODES.HIDE_BRUSH
                      : FOG_MODES.REVEAL_BRUSH
                  );
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors",
                  fogBrushShape === FOG_BRUSH_SHAPES.CIRCLE
                    ? "bg-zinc-700 text-amber-400 font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
                title="قلم دایره‌ای (Circular Brush)"
              >
                <Circle className="w-3.5 h-3.5" />
                <span className="text-[11px] font-fa">دایره</span>
              </button>

              <button
                id="btn-fog-shape-rect"
                onClick={() => {
                  setFogBrushShape(FOG_BRUSH_SHAPES.RECTANGLE);
                  setActiveFogMode(
                    fogAction === FOG_ACTIONS.HIDE
                      ? FOG_MODES.HIDE_RECT
                      : FOG_MODES.REVEAL_RECT
                  );
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors",
                  fogBrushShape === FOG_BRUSH_SHAPES.RECTANGLE
                    ? "bg-zinc-700 text-amber-400 font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
                title="قلم مستطیلی (Rectangular Brush)"
              >
                <Square className="w-3.5 h-3.5" />
                <span className="text-[11px] font-fa">مستطیل</span>
              </button>
            </div>

            <div className="h-4 w-px bg-zinc-800" />

            {/* Brush Size Controls */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-zinc-500 font-fa mr-0.5">اندازه:</span>
              {[35, 65, 100, 150].map((size) => (
                <button
                  key={size}
                  onClick={() => setFogBrushRadius(size)}
                  className={cn(
                    "px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors",
                    fogBrushRadius === size
                      ? "bg-amber-500 text-zinc-950 font-bold"
                      : "text-zinc-400 hover:bg-zinc-800"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-zinc-800" />

            {/* Global Map Fog Actions */}
            <button
              onClick={revealAllFog}
              className="px-2 py-1 text-xs rounded-lg font-medium text-amber-400 hover:bg-zinc-800 transition-colors"
              title="آشکارسازی تمام نقشه"
            >
              نمایش کل
            </button>
            <button
              onClick={resetFog}
              className="px-2 py-1 text-xs rounded-lg font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
              title="پوشاندن مجدد کل نقشه با مه"
            >
              پوشاندن کل
            </button>
          </div>
        )}

        {/* Secondary Sub-toolbar for Ruler */}
        {activeTool === TOOLS.RULER && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
            <span className="text-zinc-400 font-fa text-[11px] pr-1">قانون محاسبه:</span>
            <button
              onClick={() => setRulerType(MEASUREMENT_TYPES.EUCLIDEAN)}
              className={cn(
                "px-2 py-1 rounded-md transition-colors",
                rulerType === MEASUREMENT_TYPES.EUCLIDEAN ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:bg-zinc-800"
              )}
            >
              مستقیم (اقلیدسی)
            </button>
            <button
              onClick={() => setRulerType(MEASUREMENT_TYPES.DND5E_5105)}
              className={cn(
                "px-2 py-1 rounded-md transition-colors",
                rulerType === MEASUREMENT_TYPES.DND5E_5105 ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:bg-zinc-800"
              )}
            >
              D&D 5e (5-10-5)
            </button>
            <button
              onClick={() => setRulerType(MEASUREMENT_TYPES.MANHATTAN)}
              className={cn(
                "px-2 py-1 rounded-md transition-colors",
                rulerType === MEASUREMENT_TYPES.MANHATTAN ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:bg-zinc-800"
              )}
            >
              شبکه‌ای (تاکسی)
            </button>
          </div>
        )}

        {/* Main Floating Tool Container */}
        <div className="flex items-center gap-1 px-3 py-2 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl shadow-2xl backdrop-blur-xl text-zinc-200">
          {/* Canvas Tools */}
          <div className="flex items-center gap-1">
            {primaryTools.map((t) => {
              if (t.gmOnly && !isGM) return null;
              const Icon = t.icon;
              const isActive = activeTool === t.id;

              return (
                <Tooltip key={t.id} content={t.label} subContent={t.labelFa} shortcut={t.shortcut}>
                  <button
                    onClick={() => setActiveTool(t.id)}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative cursor-pointer",
                      isActive
                        ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold scale-105"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 active:scale-95"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                </Tooltip>
              );
            })}
          </div>

          <div className="h-6 w-px bg-zinc-800 mx-1" />

          {/* Dice Launcher Button */}
          <Tooltip content="3D Dice Roller" subContent="پرتاب تاس سه‌بعدی" shortcut="Space">
            <button
              onClick={() => toggleMenu("dice")}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative cursor-pointer",
                isDiceOpen
                  ? "bg-amber-500 text-zinc-950 font-bold scale-105"
                  : "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              )}
            >
              <Dices className="w-5 h-5" />
            </button>
          </Tooltip>

          <div className="h-6 w-px bg-zinc-800 mx-1" />

          {/* Asset & Library Drawer */}
          <Tooltip content="Map & Token Library" subContent="کتابخانه مپ و توکن">
            <button
              onClick={() => toggleMenu("asset")}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                isAssetOpen ? "bg-zinc-700 text-zinc-100 font-bold" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              )}
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </Tooltip>

          {/* Initiative Tracker & Extensions */}
          <Tooltip content="Initiative Tracker & Notes" subContent="ترتیب نوبت و یادداشت">
            <button
              onClick={() => toggleMenu("extensions")}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                isExtOpen ? "bg-zinc-700 text-zinc-100 font-bold" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              )}
            >
              <ListOrdered className="w-5 h-5" />
            </button>
          </Tooltip>

          {/* Connected Players */}
          <Tooltip content="Players Roster" subContent="لیست بازیکنان">
            <button
              onClick={() => toggleMenu("player")}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                isPlayerOpen ? "bg-zinc-700 text-zinc-100 font-bold" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              )}
            >
              <Users className="w-5 h-5" />
            </button>
          </Tooltip>

          {/* Settings Drawer */}
          <Tooltip content="Room & Grid Settings" subContent="تنظیمات اتاق و گرید">
            <button
              onClick={() => toggleMenu("settings")}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                isSettingsOpen ? "bg-zinc-700 text-zinc-100 font-bold" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              )}
            >
              <Settings className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Floating Bottom-Right Zoom & Navigation Controls */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-1.5 p-1.5 bg-zinc-900/90 border border-zinc-800/80 rounded-xl shadow-xl backdrop-blur-md text-xs text-zinc-300">
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.2))}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          title="کوچک‌نمایی (Ctrl -)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={resetView}
          className="px-2 h-8 rounded-lg font-mono text-xs hover:bg-zinc-800 text-zinc-300 transition-colors"
          title="بازنشانی به ۱۰۰٪"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 3.5))}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          title="بزرگ‌نمایی (Ctrl +)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Snap to Grid Quick Toggle */}
        <button
          onClick={() => {
            if (currentScene) {
              updateGrid({ snapToGrid: !currentScene.grid.snapToGrid });
            }
          }}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            currentScene?.grid.snapToGrid
              ? "bg-amber-500/20 text-amber-400"
              : "text-zinc-500 hover:bg-zinc-800"
          )}
          title={currentScene?.grid.snapToGrid ? "چسبیدن به گرید (فعال)" : "چسبیدن به گرید (غیرفعال)"}
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};
