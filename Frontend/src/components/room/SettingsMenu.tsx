import React from "react";
import { Settings, X, Grid, Eye, Ruler, Shield, Copy, Check } from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useRoomStore } from "../../store/room.store";
import { usePermissions } from "../../hooks/usePermissions";
import { GRID_TYPES, GridType } from "../../constants/tools";
import { MEASUREMENT_UNITS, MeasurementUnit } from "../../constants/measurementTypes";
import { Button } from "../ui/Button";

export const SettingsMenu: React.FC = () => {
  const isSettingsOpen = useCanvasStore((state) => state.isSettingsMenuOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const currentScene = useSceneStore((state) => state.currentScene);
  const updateGrid = useSceneStore((state) => state.updateGrid);
  const updateSceneData = useSceneStore((state) => state.updateSceneData);
  const currentRoom = useRoomStore((state) => state.currentRoom);
  const { isGM } = usePermissions();

  const [copied, setCopied] = React.useState(false);

  if (!isSettingsOpen || !currentScene) return null;

  const grid = currentScene.grid;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-16 right-6 z-40 w-88 max-w-[95vw] bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-zinc-100 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">تنظیمات اتاق و مپ</h4>
            <p className="text-[11px] text-zinc-400 font-fa">گرید، مقیاس و مه تاریکی</p>
          </div>
        </div>
        <button
          onClick={() => toggleMenu("settings")}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-3 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Room Share Card */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 font-fa">کد اتاق بازی:</span>
            <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {currentRoom?.code || "OWL-7721"}
            </span>
          </div>
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={handleCopyLink}>
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            کپی لینک دعوت به اتاق
          </Button>
        </div>

        {/* Grid Settings (GM) */}
        {isGM && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 font-fa">
              <Grid className="w-4 h-4" />
              تنظیمات شبکه و گرید (Grid)
            </div>

            {/* Grid Toggle */}
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span>نمایش شبکه روی مپ:</span>
              <button
                onClick={() => updateGrid({ enabled: !grid.enabled })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  grid.enabled ? "bg-amber-500" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                    grid.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Grid Type */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">نوع گرید:</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => updateGrid({ type: GRID_TYPES.SQUARE })}
                  className={`py-1.5 rounded-lg border transition-all ${
                    grid.type === GRID_TYPES.SQUARE
                      ? "bg-amber-500 text-zinc-950 font-bold border-amber-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  مربعی (Square)
                </button>
                <button
                  onClick={() => updateGrid({ type: GRID_TYPES.HEX_H })}
                  className={`py-1.5 rounded-lg border transition-all ${
                    grid.type === GRID_TYPES.HEX_H
                      ? "bg-amber-500 text-zinc-950 font-bold border-amber-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  هگز افقی
                </button>
                <button
                  onClick={() => updateGrid({ type: GRID_TYPES.HEX_V })}
                  className={`py-1.5 rounded-lg border transition-all ${
                    grid.type === GRID_TYPES.HEX_V
                      ? "bg-amber-500 text-zinc-950 font-bold border-amber-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  هگز عمودی
                </button>
              </div>
            </div>

            {/* Grid Size Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>اندازه هر خانه گرید:</span>
                <span className="font-mono text-zinc-200">{grid.size}px</span>
              </div>
              <input
                type="range"
                min={30}
                max={150}
                step={2}
                value={grid.size}
                onChange={(e) => updateGrid({ size: Number(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Grid Opacity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>شفافیت خطوط گرید:</span>
                <span className="font-mono text-zinc-200">{Math.round(grid.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={grid.opacity}
                onChange={(e) => updateGrid({ opacity: Number(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Scale Settings */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">مقدار هر خانه:</label>
                <input
                  type="number"
                  value={grid.scaleValue}
                  onChange={(e) => updateGrid({ scaleValue: Number(e.target.value) || 5 })}
                  className="w-full h-8 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">واحد اندازه‌گیری:</label>
                <select
                  value={grid.scaleUnit}
                  onChange={(e) => updateGrid({ scaleUnit: e.target.value as MeasurementUnit })}
                  className="w-full h-8 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200"
                >
                  <option value={MEASUREMENT_UNITS.FEET}>Feet (ft - فوت)</option>
                  <option value={MEASUREMENT_UNITS.METERS}>Meters (m - متر)</option>
                  <option value={MEASUREMENT_UNITS.GRID_UNITS}>خانه (Squares)</option>
                  <option value={MEASUREMENT_UNITS.HEXES}>هگز (Hexes)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Fog of War Settings (GM) */}
        {isGM && (
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 font-fa">
              <Eye className="w-4 h-4" />
              تنظیمات مه تاریکی (Fog of War)
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span>فعال بودن مه تاریکی:</span>
              <button
                onClick={() => updateSceneData({ fogEnabled: !currentScene.fogEnabled })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  currentScene.fogEnabled ? "bg-emerald-500" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                    currentScene.fogEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>دید GM از مناطق پوشیده با مه:</span>
                <span className="font-mono text-zinc-200">
                  {Math.round((currentScene.fogOpacity || 0.6) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={currentScene.fogOpacity || 0.6}
                onChange={(e) => updateSceneData({ fogOpacity: Number(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500 font-fa">
                (بازیکنان همیشه مناطق مه را ۱۰۰٪ سیاه و مخفی می‌بینند)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
