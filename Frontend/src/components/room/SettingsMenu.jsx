import React, { useState, useEffect, memo } from "react";
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
  Sliders,
  MousePointer,
  Maximize2,
  Layers,
  Eye,
  Ruler,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { settingsApi } from "../../api/settings.api";
import { wsService } from "../../services/websocket.service";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { WS_EVENTS } from "../../constants/wsEvents.js";

const DEFAULT_SETTINGS = Object.freeze({
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
});

export const SettingsMenu = memo(({ isGM = false }) => {
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
  const setRoomSettings = useSceneStore((state) => state.setRoomSettings);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (isSettingsOpen && roomId && isGM) {
      settingsApi
          .getSettings(roomId)
          .then((data) => {
            if (data) {
              setSettings((prev) => ({ ...prev, ...data }));
              setRoomSettings(data);
              if (data.measurementType) setRulerType(data.measurementType);
              if (data.inputMode) setInputMode(data.inputMode);
              if (data.zoomSensitivity) setZoomSensitivity(data.zoomSensitivity);
              if (data.shapeSnapSensitivity) setShapeSnapSensitivity(data.shapeSnapSensitivity);
              if (data.gmFogBlend !== undefined) setGmFogBlend(data.gmFogBlend);
            }
          })
          .catch((err) => {
            if (import.meta.env.DEV) {
              console.error("خطا در دریافت تنظیمات اتاق:", err);
            }
          });
    }
  }, [
    isSettingsOpen,
    roomId,
    isGM,
    setRulerType,
    setInputMode,
    setZoomSensitivity,
    setShapeSnapSensitivity,
    setGmFogBlend,
    setRoomSettings,
  ]);

  if (!isSettingsOpen) return null;

  if (!isGM) {
    return (
        <div
            className="fixed top-16 right-6 z-50 w-84 bg-zinc-950/95 border border-zinc-800/90 rounded-3xl shadow-2xl backdrop-blur-2xl p-6 text-zinc-100 font-fa select-none text-center"
            dir="rtl"
        >
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/10">
            <Lock className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-zinc-100">دسترسی منحصراً برای GM</h4>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            تنها سازنده اتاق مجاز به ویرایش و شخصی‌سازی تنظیمات میز بازی است.
          </p>
          <Button
              size="sm"
              variant="secondary"
              className="mt-5 w-full text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              onClick={() => toggleMenu("settings")}
          >
            متوجه شدم
          </Button>
        </div>
    );
  }

  const handleChange = (patch) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    setRoomSettings(updated);

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

  const handleSaveSettings = async () => {
    if (!roomId) return;
    setIsSaving(true);
    try {
      const saved = await settingsApi.updateSettings(roomId, settings);
      const activeData = saved || settings;
      setRoomSettings(activeData);

      if (currentScene) {
        const finalGrid = {
          enabled: true,
          type: activeData.gridType,
          lineType: activeData.lineType,
          size: Number(activeData.gridSize),
          color: activeData.gridColor,
          opacity: Number(activeData.gridOpacity),
          lineWidth: Number(activeData.lineWidth),
          snapToGrid: activeData.isGridSnapping !== false,
        };
        useSceneStore.setState({ currentScene: { ...currentScene, grid: finalGrid } });
      }

      wsService.send(WS_EVENTS.SETTINGS_UPDATED || "SETTINGS_UPDATE", activeData);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("خطا در ذخیره تنظیمات اتاق:", err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!roomId) return;
    setIsSaving(true);
    try {
      let defaults = null;
      try {
        defaults = await settingsApi.resetSettings(roomId);
      } catch {
        defaults = null;
      }

      const finalDefaults = defaults || DEFAULT_SETTINGS;
      setSettings(finalDefaults);
      setRoomSettings(finalDefaults);

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
      }

      wsService.send(WS_EVENTS.SETTINGS_UPDATED || "SETTINGS_UPDATE", finalDefaults);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("خطا در بازنشانی تنظیمات:", err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncView = () => {
    wsService.send(WS_EVENTS.VIEWPORT_SYNC || "VIEWPORT_SYNC", {
      zoom,
      stageX,
      stageY,
    });
  };

  return (
      <div
          className="fixed top-16 right-6 z-50 w-[480px] max-w-[95vw] bg-zinc-950/95 border border-zinc-800/90 rounded-3xl shadow-2xl shadow-black/80 backdrop-blur-3xl p-5 text-zinc-100 font-fa select-none animate-in fade-in zoom-in-95 duration-200"
          dir="rtl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Settings className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-zinc-100 flex items-center gap-2">
                <span>تنظیمات میز بازی</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
                GM Panel
              </span>
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">پیکربندی گرید تاکتیکال و دوربین صحنه</p>
            </div>
          </div>
          <button
              type="button"
              onClick={() => toggleMenu("settings")}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800/80 my-4 shadow-inner">
          {[
            { id: "grid", label: "شبکه و گرید", icon: Grid },
            { id: "room", label: "کنترل‌های عمومی", icon: Sliders },
            { id: "camera", label: "دوربین (Viewport)", icon: Maximize2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                        "flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer",
                        isActive
                            ? "bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                    )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
            );
          })}
        </div>

        <div className="space-y-4 max-h-[52vh] overflow-y-auto pr-1.5 custom-scrollbar">
          {activeTab === "grid" && (
              <div className="space-y-3.5">
                <div className="p-3.5 bg-zinc-900/50 rounded-2xl border border-zinc-800/60 space-y-2.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <Grid className="w-3.5 h-3.5 text-amber-400" />
                    <span>نوع شبکه تاکتیکال (Grid Type):</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "square", label: "مربعی (Square)", desc: "استاندارد D&D 5e" },
                      { id: "isometric", label: "لوزی (Isometric)", desc: "دید پرسپکتیو" },
                      { id: "hex_h", label: "شش‌ضلعی افقی", desc: "Hex Flat-Top" },
                      { id: "hex_v", label: "شش‌ضلعی عمودی", desc: "Hex Pointy-Top" },
                    ].map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => handleChange({ gridType: type.id })}
                            className={cn(
                                "p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-0.5",
                                settings.gridType === type.id
                                    ? "bg-amber-500/15 border-amber-500/80 text-amber-300 shadow-md shadow-amber-500/10"
                                    : "bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-700"
                            )}
                        >
                          <span className="text-xs font-bold">{type.label}</span>
                          <span className="text-[10px] text-zinc-500">{type.desc}</span>
                        </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-900/50 rounded-2xl border border-zinc-800/60 space-y-2.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>استایل خطوط شبکه (Line Style):</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "solid", label: "ممتد (Line)" },
                      { id: "dotted", label: "خط‌چین (Dotted)" },
                      { id: "dots", label: "نقاط تقاطع (Cross)" },
                    ].map((lt) => (
                        <button
                            key={lt.id}
                            type="button"
                            onClick={() => handleChange({ lineType: lt.id })}
                            className={cn(
                                "py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer",
                                settings.lineType === lt.id
                                    ? "bg-amber-500/15 border-amber-500/80 text-amber-300 shadow-sm"
                                    : "bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-700"
                            )}
                        >
                          {lt.label}
                        </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-900/50 rounded-2xl border border-zinc-800/60 space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <Ruler className="w-3.5 h-3.5 text-amber-400" />
                    <span>سیستم محاسبه فواصل و خط‌کش:</span>
                  </label>
                  <select
                      value={settings.measurementType}
                      onChange={(e) => handleChange({ measurementType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-bold focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                  >
                    <option value="dnd5e_5105">قانون استاندارد Chessboard D&D 5e (۵، ۱۰، ۱۵، ۲۰ فوت)</option>
                    <option value="dnd35_alternating">قانون Alternating Diagonal D&D 3.5e (۵، ۱۰، ۵، ۱۰)</option>
                    <option value="euclidean">اقلیدسی واقعی (Euclidean - فرمول فیثاغورس مستقیم)</option>
                    <option value="manhattan">مختصات منهتن (Manhattan - مجموع افقی و عمودی)</option>
                  </select>
                </div>

                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/60 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold">اندازه سلول‌ها (Grid Size):</span>
                      <span className="font-mono px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs font-bold">
                    {settings.gridSize} px
                  </span>
                    </div>
                    <input
                        type="range"
                        min={25}
                        max={150}
                        step={5}
                        value={settings.gridSize}
                        onChange={(e) => handleChange({ gridSize: Number(e.target.value) })}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold">شفافیت گرید (Opacity):</span>
                      <span className="font-mono px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs font-bold">
                    {Math.round((settings.gridOpacity || 0.35) * 100)}%
                  </span>
                    </div>
                    <input
                        type="range"
                        min={0.05}
                        max={1}
                        step={0.05}
                        value={settings.gridOpacity}
                        onChange={(e) => handleChange({ gridOpacity: Number(e.target.value) })}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold">ضخامت خطوط (Line Width):</span>
                      <span className="font-mono px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs font-bold">
                    {settings.lineWidth} px
                  </span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={5}
                        step={0.5}
                        value={settings.lineWidth}
                        onChange={(e) => handleChange({ lineWidth: Number(e.target.value) })}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl shadow-sm">
                  <div>
                <span className="text-xs font-black text-zinc-100 block">
                  چسبیدن خودکار به سلول‌ها (Snapping)
                </span>
                    <span className="text-[11px] text-zinc-400">
                  قرارگیری دقیق توکن‌ها در مرکز هندسی گرید
                </span>
                  </div>
                  <button
                      type="button"
                      onClick={() => handleChange({ isGridSnapping: !settings.isGridSnapping })}
                      className={cn(
                          "w-12 h-6.5 rounded-full transition-colors relative cursor-pointer shadow-inner",
                          settings.isGridSnapping ? "bg-amber-500" : "bg-zinc-800"
                      )}
                  >
                    <div
                        className={cn(
                            "w-5 h-5 rounded-full bg-zinc-950 transition-transform absolute top-0.5 shadow-md",
                            settings.isGridSnapping ? "right-1" : "right-6"
                        )}
                    />
                  </button>
                </div>
              </div>
          )}

          {activeTab === "room" && (
              <div className="space-y-3.5">
                <div className="p-3.5 bg-zinc-900/50 rounded-2xl border border-zinc-800/60 space-y-2.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <MousePointer className="w-3.5 h-3.5 text-amber-400" />
                    <span>حالت کنترل ورودی (Input Mode):</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "AUTO", label: "هوشمند (Auto)", desc: "تشخیص خودکار" },
                      { id: "MOUSE", label: "ماوس (Mouse)", desc: "اسکرول = زوم" },
                      { id: "TRACKPAD", label: "ترک‌پد (Trackpad)", desc: "۲ انگشت = حرکت" },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            type="button"
                            onClick={() => handleChange({ inputMode: mode.id })}
                            className={cn(
                                "p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col gap-0.5",
                                settings.inputMode === mode.id
                                    ? "bg-amber-500/15 border-amber-500/80 text-amber-300 shadow-md shadow-amber-500/10"
                                    : "bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-700"
                            )}
                        >
                          <span className="text-xs font-bold">{mode.label}</span>
                          <span className="text-[10px] text-zinc-500">{mode.desc}</span>
                        </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/60 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold">حساسیت زوم دوربین (Zoom Speed):</span>
                      <span className="font-mono px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs font-bold">
                    {settings.zoomSensitivity}x
                  </span>
                    </div>
                    <input
                        type="range"
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        value={settings.zoomSensitivity}
                        onChange={(e) => handleChange({ zoomSensitivity: Number(e.target.value) })}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold">حساسیت اسنپ ترسیمات (Shape Snapping):</span>
                      <span className="font-mono px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs font-bold">
                    {Math.round((settings.shapeSnapSensitivity || 0.5) * 100)}%
                  </span>
                    </div>
                    <input
                        type="range"
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        value={settings.shapeSnapSensitivity}
                        onChange={(e) => handleChange({ shapeSnapSensitivity: Number(e.target.value) })}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    دید دانجن‌مستر از پشت مه (GM Fog Blend):
                  </span>
                      <span className="font-mono px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs font-bold">
                    {Math.round((settings.gmFogBlend ?? 0.45) * 100)}%
                  </span>
                    </div>
                    <input
                        type="range"
                        min={0.05}
                        max={1.0}
                        step={0.05}
                        value={settings.gmFogBlend ?? 0.45}
                        onChange={(e) => handleChange({ gmFogBlend: Number(e.target.value) })}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              </div>
          )}

          {activeTab === "camera" && (
              <div className="space-y-3.5">
                <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                    <span className="text-zinc-400">بزرگ‌نمایی کنونی صحنه (Zoom):</span>
                    <span className="font-mono text-amber-400 font-black text-sm">
                  {Math.round(zoom * 100)}%
                </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                    <span className="text-zinc-400">موقعیت افقی دوربین (Offset X):</span>
                    <span className="font-mono text-zinc-300">{Math.round(stageX)} px</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">موقعیت عمودی دوربین (Offset Y):</span>
                    <span className="font-mono text-zinc-300">{Math.round(stageY)} px</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={resetView}
                      className="py-3 text-xs font-bold cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <span>فیت و مرکز نقشه</span>
                  </Button>

                  <Button
                      variant="amber"
                      size="sm"
                      onClick={handleSyncView}
                      className="py-3 text-xs font-black cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-amber-500/20"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>همگام با همه پلیرها</span>
                  </Button>
                </div>
              </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
          <Button
              size="sm"
              variant="ghost"
              className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2.5 rounded-xl cursor-pointer"
              disabled={isSaving}
              onClick={handleResetToDefault}
          >
            <RotateCcw className="w-3.5 h-3.5 ml-1.5" />
            <span>بازنشانی به پیش‌فرض</span>
          </Button>

          <Button
              size="sm"
              variant={saveSuccess ? "outline" : "amber"}
              className={cn(
                  "text-xs font-black px-5 py-2.5 rounded-xl cursor-pointer shadow-lg transition-all duration-200",
                  saveSuccess
                      ? "border-emerald-500/80 text-emerald-400 bg-emerald-500/10 shadow-emerald-500/10"
                      : "shadow-amber-500/25 hover:scale-105"
              )}
              isLoading={isSaving}
              onClick={handleSaveSettings}
          >
            {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 ml-1.5 text-emerald-400 stroke-[2.5]" />
                  <span>تغییرات ذخیره شد</span>
                </>
            ) : (
                <>
                  <Save className="w-4 h-4 ml-1.5 stroke-[2.5]" />
                  <span>ذخیره تنظیمات</span>
                </>
            )}
          </Button>
        </div>
      </div>
  );
});

SettingsMenu.displayName = "SettingsMenu";