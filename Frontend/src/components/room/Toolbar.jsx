import React from "react";
import {
  MousePointer,
  Hand,
  Pencil,
  EyeOff,
  Ruler,
  Crosshair,
  Dices,
  Image as ImageIcon,
  Users,
  Settings,
  ListOrdered,
  ZoomIn,
  ZoomOut,
  Grid,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { TOOLS } from "../../constants/tools";
import { Tooltip } from "../ui/Tooltip";
import { cn } from "../../utils/cn";

export const Toolbar = () => {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const zoom = useCanvasStore((state) => state.zoom);

  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const resetView = useCanvasStore((state) => state.resetView);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const isAssetOpen = useCanvasStore((state) => state.isAssetMenuOpen);
  const isPlayerOpen = useCanvasStore((state) => state.isPlayerMenuOpen);
  const isSettingsOpen = useCanvasStore((state) => state.isSettingsMenuOpen);
  const isExtOpen = useCanvasStore((state) => state.isExtensionsMenuOpen);
  const isDiceOpen = useCanvasStore((state) => state.isDiceRollerOpen);

  const { isGM } = usePermissions();

  const primaryTools = [
    { id: TOOLS?.SELECT || "select", label: "Select", labelFa: "انتخاب و حرکت", icon: MousePointer, shortcut: "V" },
    { id: TOOLS?.PAN || "pan", label: "Pan", labelFa: "جابجایی نقشه", icon: Hand, shortcut: "H" },
    { id: TOOLS?.DRAW || "draw", label: "Draw", labelFa: "نقاشی و خطوط", icon: Pencil, shortcut: "D" },
    { id: TOOLS?.FOG || "fog", label: "Fog", labelFa: "مه تاریکی", icon: EyeOff, shortcut: "F", gmOnly: true },
    { id: TOOLS?.RULER || "ruler", label: "Ruler", labelFa: "خط‌کش", icon: Ruler, shortcut: "R" },
    { id: TOOLS?.LASER || "laser", label: "Laser", labelFa: "لیزر پوینتر", icon: Crosshair, shortcut: "L" },
  ];

  return (
      <>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl shadow-2xl backdrop-blur-xl text-zinc-200">
            <div className="flex items-center gap-1">
              {primaryTools.map((t) => {
                if (t.gmOnly && !isGM) return null;
                const Icon = t.icon;
                const isActive = activeTool === t.id;

                return (
                    <Tooltip key={t.id} content={t.label} subContent={t.labelFa} shortcut={t.shortcut}>
                      <button
                          type="button"
                          onClick={() => setActiveTool(t.id)}
                          className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                              isActive
                                  ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20 scale-105"
                                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80"
                          )}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    </Tooltip>
                );
              })}
            </div>

            <div className="h-6 w-px bg-zinc-800 mx-1" />

            {/* کلید باز کردن تاس */}
            <Tooltip content="Dice Roller" subContent="پرتاب تاس سه‌بعدی" shortcut="Space">
              <button
                  type="button"
                  onClick={() => toggleMenu("dice")}
                  className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                      isDiceOpen ? "bg-amber-500 text-zinc-950 font-bold" : "text-amber-400 hover:bg-amber-500/10"
                  )}
              >
                <Dices className="w-5 h-5" />
              </button>
            </Tooltip>

            <div className="h-6 w-px bg-zinc-800 mx-1" />

            {/* کلیدهای منوهای کمکی */}
            <Tooltip content="Asset Library" subContent="کتابخانه توکن‌ها">
              <button
                  type="button"
                  onClick={() => toggleMenu("asset")}
                  className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                      isAssetOpen ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800"
                  )}
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </Tooltip>

            <Tooltip content="Initiative & Notes" subContent="ترتیب نوبت و چت">
              <button
                  type="button"
                  onClick={() => toggleMenu("extensions")}
                  className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                      isExtOpen ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800"
                  )}
              >
                <ListOrdered className="w-5 h-5" />
              </button>
            </Tooltip>

            <Tooltip content="Players" subContent="لیست بازیکنان">
              <button
                  type="button"
                  onClick={() => toggleMenu("player")}
                  className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                      isPlayerOpen ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800"
                  )}
              >
                <Users className="w-5 h-5" />
              </button>
            </Tooltip>

            <Tooltip content="Settings" subContent="تنظیمات اتاق">
              <button
                  type="button"
                  onClick={() => toggleMenu("settings")}
                  className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                      isSettingsOpen ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800"
                  )}
              >
                <Settings className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* دکمه‌های زوم در پایین سمت راست */}
        <div className="fixed bottom-6 right-6 z-30 flex items-center gap-1.5 p-1.5 bg-zinc-900/90 border border-zinc-800/80 rounded-xl shadow-xl backdrop-blur-md text-xs text-zinc-300">
          <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.2))}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-800 text-zinc-400"
              title="کوچک‌نمایی"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
              type="button"
              onClick={resetView}
              className="px-2 h-8 rounded-lg font-mono text-xs hover:bg-zinc-800 text-zinc-300"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.15, 3.5))}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-800 text-zinc-400"
              title="بزرگ‌نمایی"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </>
  );
};