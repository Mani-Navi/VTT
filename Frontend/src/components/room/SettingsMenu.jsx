import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Settings,
  X,
  Grid,
  Check,
  RefreshCw,
  Share2,
  Lock,
  RotateCcw,
  Save,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { settingsApi } from "../../api/settings.api";
import { MEASUREMENT_TYPES } from "../../constants/measurementTypes";
import { wsService } from "../../services/websocket.service";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

const DEFAULT_SETTINGS = {
  zoomSensitivity: 1.0,
  overlayEffect: "GLASS",
  gmFogBlend: 0.45,
  colorTheme: "DARK",
  inputMode: "AUTO",
  shapeSnapSensitivity: 0.5,
  gridSnapSensitivity: 0.5,
  gridType: "square",
  lineType: "solid",
  measurementType: "dnd5e_5105",
  gridSize: 60,
  gridOpacity: 0.35,
  lineWidth: 1.5,
  gridColor: "#000000",
  isGridSnapping: true,
};

export const SettingsMenu = ({ isGM = false }) => {
  const { roomId } = useParams();

  const isSettingsOpen = useCanvasStore((state) => state.isSettingsMenuOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);
  const zoom = useCanvasStore((state) => state.zoom);
  const stageX = useCanvasStore((state) => state.stageX);
  const stageY = useCanvasStore((state) => state.stageY);
  const resetView = useCanvasStore((state) => state.resetView);

  const rulerType = useCanvasStore((state) => state.rulerType);
  const setRulerType = useCanvasStore((state) => state.setRulerType);

  const setInputMode = useCanvasStore((state) => state.setInputMode);
  const setZoomSensitivity = useCanvasStore((state) => state.setZoomSensitivity);
  const setShapeSnapSensitivity = useCanvasStore((state) => state.setShapeSnapSensitivity);
  const setGmFogBlend = useCanvasStore((state) => state.setGmFogBlend);

  const currentScene = useSceneStore((state) => state.currentScene);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("grid"); // grid | room | camera

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (isSettingsOpen && roomId && isGM) {
      settingsApi
          .getSettings(roomId)
          .then((data) => {
            if (data) {
              setSettings((prev) => ({ ...prev, ...data }));
              if (data.measurementType) setRulerType(data.measurementType);
              if (data.inputMode) setInputMode(data.inputMode);
              if (data.zoomSensitivity) setZoomSensitivity(data.zoomSensitivity);
              if (data.shapeSnapSensitivity) setShapeSnapSensitivity(data.shapeSnapSensitivity);
              if (data.gmFogBlend !== undefined) setGmFogBlend(data.gmFogBlend);
            }
          })
          .catch((err) => console.error("خطا در دریافت تنظیمات اتاق:", err));
    }
  }, [isSettingsOpen, roomId, isGM, setRulerType, setInputMode, setZoomSensitivity, setShapeSnapSensitivity, setGmFogBlend]);

  if (!isSettingsOpen) return null;

  if (!isGM) {
    return (
        <div
            className="fixed top-16 right-6 z-50 w-80 bg-zinc-900/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-2xl p-5 text-zinc-100 font-fa select-none text-center"
            dir="rtl"
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-zinc-100">دسترسی غیرمجاز</h4>
          <p className="text-xs text-zinc-400 mt-1">
            تنها سازنده اتاق (GM) مجاز به مشاهده و تغییر تنظیمات است.
          </p>
          <Button
              size="sm"
              variant="secondary"
              className="mt-4 w-full text-xs font-bold"
              onClick={() => toggleMenu("settings")}
          >
            بستن
          </Button>
        </div>
    );
  }

  // تغییرات زنده در فرم
  const handleChange = (patch) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);

    if (patch.measurementType) setRulerType(patch.measurementType);
    if (patch.inputMode) setInputMode(patch.inputMode);
    if (patch.zoomSensitivity !== undefined) setZoomSensitivity(patch.zoomSensitivity);
    if (patch.shapeSnapSensitivity !== undefined) setShapeSnapSensitivity(patch.shapeSnapSensitivity);
    if (patch.gmFogBlend !== undefined) setGmFogBlend(patch.gmFogBlend);

    if (currentScene) {
      const liveGrid = {
        enabled: true,
        type: updated.gridType,
        lineType: updated.lineType,
        size: Number(updated.gridSize),
        color: updated.gridColor,
        opacity: Number(updated.gridOpacity),
        lineWidth: Number(updated.lineWidth),
        snapToGrid: updated.isGridSnapping !== false,
      };
      useSceneStore.setState({ currentScene: { ...currentScene, grid: liveGrid } });
    }
  };

  // ذخیره پایدار نهایی با دکمه Save
  const handleSaveSettings = async () => {
    if (!roomId) return;
    setIsSaving(true);
    try {
      await settingsApi.updateSettings(roomId, settings);

      if (currentScene) {
        const finalGrid = {
          enabled: true,
          type: settings.gridType,
          lineType: settings.lineType,
          size: Number(settings.gridSize),
          color: settings.gridColor,
          opacity: Number(settings.gridOpacity),
          lineWidth: Number(settings.lineWidth),
          snapToGrid: settings.isGridSnapping !== false,
        };
        useSceneStore.setState({ currentScene: { ...currentScene, grid: finalGrid } });
        wsService.send("SETTINGS_UPDATE", settings);
        wsService.send("SCENE_GRID_UPDATE", { sceneId: currentScene.id, grid: finalGrid });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("خطا در ذخیره تنظیمات اتاق:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // بازنشانی به پیش‌فرض
  const handleResetToDefault = async () => {
    if (!roomId) return;
    setIsSaving(true);
    try {
      let defaults = null;
      try {
        defaults = await settingsApi.resetSettings(roomId);
      } catch (e) {
        defaults = null;
      }

      const finalDefaults = defaults || DEFAULT_SETTINGS;
      setSettings(finalDefaults);

      if (finalDefaults.measurementType) setRulerType(finalDefaults.measurementType);
      if (finalDefaults.inputMode) setInputMode(finalDefaults.inputMode);
      if (finalDefaults.zoomSensitivity) setZoomSensitivity(finalDefaults.zoomSensitivity);
      if (finalDefaults.shapeSnapSensitivity) setShapeSnapSensitivity(finalDefaults.shapeSnapSensitivity);
      if (finalDefaults.gmFogBlend !== undefined) setGmFogBlend(finalDefaults.gmFogBlend);

      if (currentScene) {
        const resetGrid = {
          enabled: true,
          type: finalDefaults.gridType || "square",
          lineType: finalDefaults.lineType || "solid",
          size: Number(finalDefaults.gridSize || 60),
          color: finalDefaults.gridColor || "#000000",
          opacity: Number(finalDefaults.gridOpacity || 0.35),
          lineWidth: Number(finalDefaults.lineWidth || 1.5),
          snapToGrid: finalDefaults.isGridSnapping !== false,
        };
        useSceneStore.setState({ currentScene: { ...currentScene, grid: resetGrid } });
        wsService.send("SETTINGS_UPDATE", finalDefaults);
        wsService.send("SCENE_GRID_UPDATE", { sceneId: currentScene.id, grid: resetGrid });
      }

      await settingsApi.updateSettings(roomId, finalDefaults);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("خطا در بازنشانی تنظیمات:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncView = () => {
    wsService.send("VIEWPORT_SYNC", {
      zoom,
      stageX,
      stageY,
    });
  };

  return (
      <div
          className="fixed top-16 right-6 z-50 w-96 max-w-[95vw] bg-zinc-900/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-2xl p-4 text-zinc-100 font-fa select-none animate-in fade-in zoom-in-95 duration-150"
          dir="rtl"
      >
        {/* هدر */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">تنظیمات اتاق و گرید تاکتیکال</h4>
              <p className="text-[11px] text-zinc-400">سفارشی‌سازی پایدار میز بازی Titipool</p>
            </div>
          </div>
          <button
              type="button"
              onClick={() => toggleMenu("settings")}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* تب‌ها */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 my-3">
          <button
              type="button"
              onClick={() => setActiveTab("grid")}
              className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  activeTab === "grid" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"
              )}
          >
            تنظیمات Grid
          </button>
          <button
              type="button"
              onClick={() => setActiveTab("room")}
              className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  activeTab === "room" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"
              )}
          >
            تنظیمات اتاق
          </button>
          <button
              type="button"
              onClick={() => setActiveTab("camera")}
              className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  activeTab === "camera" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"
              )}
          >
            دوربین (Viewport)
          </button>
        </div>

        {/* محتوای تب‌ها */}
        <div className="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
          {/* ۱. تب تنظیمات گرید */}
          {activeTab === "grid" && (
              <div className="space-y-3">
                {/* نوع شبکه */}
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">نوع شبکه (Grid Type):</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "square", label: "مربعی (Square)" },
                      { id: "isometric", label: "لوزی (Isometric)" },
                      { id: "hex_h", label: "شش‌ضلعی افقی" },
                      { id: "hex_v", label: "شش‌ضلعی عمودی" },
                    ].map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => handleChange({ gridType: type.id })}
                            className={cn(
                                "p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                                settings.gridType === type.id
                                    ? "bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                            )}
                        >
                          {type.label}
                        </button>
                    ))}
                  </div>
                </div>

                {/* نوع خطوط */}
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">نوع خطوط (Line Type):</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "solid", label: "ممتد (Line)" },
                      { id: "dotted", label: "خط‌چین" },
                      { id: "dots", label: "نقاط تقاطع" },
                    ].map((lt) => (
                        <button
                            key={lt.id}
                            type="button"
                            onClick={() => handleChange({ lineType: lt.id })}
                            className={cn(
                                "p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                                settings.lineType === lt.id
                                    ? "bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                            )}
                        >
                          {lt.label}
                        </button>
                    ))}
                  </div>
                </div>

                {/* سیستم محاسبه فواصل */}
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">سیستم اندازه‌گیری فاصله (Measurement):</label>
                  <select
                      value={settings.measurementType}
                      onChange={(e) => handleChange({ measurementType: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="dnd5e_5105">قانون Chessboard D&D 5e (۵، ۱۰، ۱۵، ۲۰ فوت)</option>
                    <option value="dnd35_alternating">قانون Alternating Diagonal D&D 3.5e (۵، ۱۰، ۵، ۱۰)</option>
                    <option value="euclidean">اقلیدسی (Euclidean - فرمول مستقیم فیثاغورس)</option>
                    <option value="manhattan">منهتن (Manhattan - مجموع افقی و عمودی)</option>
                  </select>
                </div>

                {/* اندازه هر خانه */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>اندازه هر خانه (Grid Size):</span>
                    <span className="font-mono text-amber-400">{settings.gridSize}px</span>
                  </div>
                  <input
                      type="range"
                      min={25}
                      max={150}
                      step={5}
                      value={settings.gridSize}
                      onChange={(e) => handleChange({ gridSize: Number(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* شفافیت خطوط */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>شفافیت گرید (Opacity):</span>
                    <span className="font-mono text-amber-400">{Math.round((settings.gridOpacity || 0.3) * 100)}%</span>
                  </div>
                  <input
                      type="range"
                      min={0.05}
                      max={1}
                      step={0.05}
                      value={settings.gridOpacity}
                      onChange={(e) => handleChange({ gridOpacity: Number(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* ضخامت خطوط */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>ضخامت خطوط (Line Width):</span>
                    <span className="font-mono text-amber-400">{settings.lineWidth}px</span>
                  </div>
                  <input
                      type="range"
                      min={1}
                      max={5}
                      step={0.5}
                      value={settings.lineWidth}
                      onChange={(e) => handleChange({ lineWidth: Number(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* چسبیدن به گرید (Snapping) */}
                <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <span className="text-xs text-zinc-300 font-bold">چسبیدن خودکار به خانه‌ها (Snapping):</span>
                  <button
                      type="button"
                      onClick={() => handleChange({ isGridSnapping: !settings.isGridSnapping })}
                      className={cn(
                          "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                          settings.isGridSnapping ? "bg-amber-500" : "bg-zinc-800"
                      )}
                  >
                    <div
                        className={cn(
                            "w-4 h-4 rounded-full bg-white transition-transform absolute top-1",
                            settings.isGridSnapping ? "right-1" : "right-6"
                        )}
                    />
                  </button>
                </div>
              </div>
          )}

          {/* ۲. تب تنظیمات عمومی اتاق */}
          {activeTab === "room" && (
              <div className="space-y-3">
                {/* حالت ورودی ماوس */}
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">حالت کنترل ورودی (Input Mode):</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["AUTO", "MOUSE", "TRACKPAD"].map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => handleChange({ inputMode: mode })}
                            className={cn(
                                "p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                                settings.inputMode === mode
                                    ? "bg-amber-500/15 border-amber-500 text-amber-300"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400"
                            )}
                        >
                          {mode === "AUTO" ? "خودکار" : mode === "MOUSE" ? "ماوس" : "ترک‌پد"}
                        </button>
                    ))}
                  </div>
                </div>

                {/* حساسیت زوم */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>حساسیت زوم (Zoom Sensitivity):</span>
                    <span className="font-mono text-amber-400">{settings.zoomSensitivity}x</span>
                  </div>
                  <input
                      type="range"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={settings.zoomSensitivity}
                      onChange={(e) => handleChange({ zoomSensitivity: Number(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* حساسیت اسنپ شکل‌ها */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>حساسیت اسنپ اشکال (Shape Snapping):</span>
                    <span className="font-mono text-amber-400">{Math.round((settings.shapeSnapSensitivity || 0.5) * 100)}%</span>
                  </div>
                  <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      value={settings.shapeSnapSensitivity}
                      onChange={(e) => handleChange({ shapeSnapSensitivity: Number(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* شفافیت دید GM از پشت مه */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>دید GM از پشت مه (GM Fog Blend):</span>
                    <span className="font-mono text-amber-400">{Math.round(settings.gmFogBlend * 100)}%</span>
                  </div>
                  <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={settings.gmFogBlend}
                      onChange={(e) => handleChange({ gmFogBlend: Number(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
          )}

          {/* ۳. تب کنترل‌های دوربین */}
          {activeTab === "camera" && (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">بزرگ‌نمایی کنونی (Zoom):</span>
                    <span className="font-mono text-amber-400 font-bold">{Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">موقعیت افقی (Position X):</span>
                    <span className="font-mono text-zinc-300">{Math.round(stageX)}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">موقعیت عمودی (Position Y):</span>
                    <span className="font-mono text-zinc-300">{Math.round(stageY)}px</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={resetView}
                      className="text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset View (مرکز مپ)
                  </Button>

                  <Button
                      variant="amber"
                      size="sm"
                      onClick={handleSyncView}
                      className="text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Sync View (همگام با همه)
                  </Button>
                </div>
              </div>
          )}
        </div>

        {/* فوتر: دکمه‌های ذخیره و بازنشانی پیش‌فرض */}
        <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
          <Button
              size="sm"
              variant="ghost"
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
              disabled={isSaving}
              onClick={handleResetToDefault}
          >
            <RotateCcw className="w-3.5 h-3.5 ml-1" />
            بازنشانی به پیش‌فرض
          </Button>

          <Button
              size="sm"
              variant={saveSuccess ? "outline" : "amber"}
              className={cn(
                  "text-xs font-bold cursor-pointer shadow-md transition-all",
                  saveSuccess ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "shadow-amber-500/20"
              )}
              isLoading={isSaving}
              onClick={handleSaveSettings}
          >
            {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 ml-1 text-emerald-400" />
                  ذخیره شد
                </>
            ) : (
                <>
                  <Save className="w-3.5 h-3.5 ml-1" />
                  ذخیره تنظیمات
                </>
            )}
          </Button>
        </div>
      </div>
  );
};