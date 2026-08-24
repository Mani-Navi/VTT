import React, { useState } from "react";
import { Settings, X, Grid, Eye, Copy, Check } from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { GRID_TYPES } from "../../constants/tools";
import { Button } from "../ui/Button";

export const SettingsMenu = () => {
  const isSettingsOpen = useCanvasStore((state) => state.isSettingsMenuOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const currentScene = useSceneStore((state) => state.currentScene);
  const { isGM } = usePermissions();

  const [copied, setCopied] = useState(false);

  if (!isSettingsOpen || !currentScene) return null;

  const grid = currentScene.grid || { enabled: true, size: 50, opacity: 0.3 };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
      <div className="fixed top-16 right-6 z-40 w-88 max-w-[95vw] bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-zinc-100 font-fa" dir="rtl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">تنظیمات اتاق و مپ</h4>
              <p className="text-[11px] text-zinc-400">گرید و مه تاریکی</p>
            </div>
          </div>
          <button
              type="button"
              onClick={() => toggleMenu("settings")}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
            <span className="text-xs text-zinc-300">لینک اشتراک‌گذاری اتاق:</span>
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={handleCopyLink}>
              {copied ? <Check className="w-3.5 h-3.5 ml-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 ml-1" />}
              کپی لینک دعوت
            </Button>
          </div>

          {isGM && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <Grid className="w-4 h-4" /> تنظیمات شبکه (Grid)
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>اندازه هر خانه:</span>
                    <span className="font-mono text-zinc-200">{grid.size}px</span>
                  </div>
                  <input
                      type="range"
                      min={30}
                      max={120}
                      step={5}
                      value={grid.size}
                      onChange={() => {}}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
          )}
        </div>
      </div>
  );
};