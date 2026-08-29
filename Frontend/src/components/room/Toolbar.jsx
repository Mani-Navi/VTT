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
  Settings,
  ZoomIn,
  ZoomOut,
  Type,
  User,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { Tooltip } from "../ui/Tooltip";
import { DrawSubToolbar } from "./DrawSubToolbar.jsx";
import { TextSubToolbar } from "./TextSubToolbar.jsx";
import { FogSubToolbar } from "./FogSubToolbar.jsx";
import { TOOLS } from "../../constants/tools";
import { cn } from "../../utils/cn";

export const Toolbar = ({ isGM: propIsGM, permissions = {} }) => {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const zoom = useCanvasStore((state) => state.zoom);

  const setActiveTool = useCanvasStore((state) => state.setActiveTool);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const resetView = useCanvasStore((state) => state.resetView);
  const focusOnCoordinates = useCanvasStore((state) => state.focusOnCoordinates);
  const toggleTokenSelection = useCanvasStore((state) => state.toggleTokenSelection);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const isAssetOpen = useCanvasStore((state) => state.isAssetMenuOpen);
  const isSettingsOpen = useCanvasStore((state) => state.isSettingsMenuOpen);
  const isDiceOpen = useCanvasStore((state) => state.isDiceRollerOpen);

  const currentScene = useSceneStore((state) => state.currentScene);
  const addToken = useSceneStore((state) => state.addToken);
  const currentUser = useAuthStore((state) => state.user);

  const hasActiveMap = Boolean(currentScene?.assetUrl || currentScene?.mapUrl);
  const isGM = propIsGM ?? true;

  const currentUserId = String(currentUser?.id || currentUser?.userId || "").toLowerCase().trim();
  const currentUsername = String(currentUser?.username || "").toLowerCase().trim();
  const currentUserEmail = String(currentUser?.email || "").toLowerCase().trim();

  // بررسی وجود توکن فعال بازیکن
  const myExistingToken = currentScene?.tokens?.find((t) => {
    const cb = String(t.controlledBy || "").toLowerCase().trim();
    const lbl = String(t.label || t.name || "").toLowerCase().trim();
    return (
        (cb && (cb === currentUserId || cb === currentUsername || cb === currentUserEmail)) ||
        (lbl && lbl === currentUsername)
    );
  });

  const handleToolClick = (toolId) => {
    if (activeTool === toolId) {
      setActiveTool(TOOLS.SELECT);
    } else {
      setActiveTool(toolId);
    }
  };

  const handleMyCharacterClick = () => {
    if (!hasActiveMap) return;

    if (myExistingToken) {
      toggleTokenSelection(myExistingToken.id);
      setActiveTool(TOOLS.SELECT);
      if (myExistingToken.x !== undefined && myExistingToken.y !== undefined) {
        focusOnCoordinates(myExistingToken.x, myExistingToken.y);
      }
      return;
    }

    const charName = currentUser?.username || "قهرمان من";
    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
        charName
    )}&backgroundColor=b6e3f4`;

    // ساخت توکن جدید بدون هاردکد پرمیشن‌ها (پرمیشن پایدار از دیتابیس خوانده می‌شود)
    addToken({
      name: charName,
      label: charName,
      avatarUrl: avatar,
      controlledBy: currentUserId || currentUsername,
      x: (currentScene?.mapWidth || 2000) / 2,
      y: (currentScene?.mapHeight || 1500) / 2,
      size: 1,
      hp: 20,
      maxHp: 20,
      ac: 14,
      isProp: false,
      showHp: true,
      showConditions: true,
      showAc: true,
    });
  };

  const primaryTools = [
    {
      id: TOOLS.SELECT,
      label: "Select",
      labelFa: "انتخاب و جابجایی (V)",
      icon: MousePointer,
      shortcut: "V",
      allowed: true,
    },
    {
      id: TOOLS.PAN,
      label: "Pan",
      labelFa: "حرکت در نقشه (H)",
      icon: Hand,
      shortcut: "H",
      allowed: true,
    },
    {
      id: TOOLS.DRAW,
      label: "Draw",
      labelFa: "قلم و اشکال هندسی (D)",
      icon: Pencil,
      shortcut: "D",
      allowed: isGM || permissions?.canDrawing !== false,
    },
    {
      id: TOOLS.TEXT,
      label: "Text",
      labelFa: "نوشت‌افزار (T)",
      icon: Type,
      shortcut: "T",
      allowed: isGM || permissions?.canText !== false,
    },
    {
      id: TOOLS.FOG,
      label: "Fog of War",
      labelFa: "مه جنگ و تاریکی (F)",
      icon: EyeOff,
      shortcut: "F",
      allowed: isGM || permissions?.canFog === true,
    },
    {
      id: TOOLS.RULER,
      label: "Ruler",
      labelFa: "خط‌کش اندازه‌گیری (R)",
      icon: Ruler,
      shortcut: "R",
      allowed: isGM || permissions?.canRuler !== false,
    },
    {
      id: TOOLS.LASER,
      label: "Laser Pointer",
      labelFa: "نشانگر لیزری (L)",
      icon: Crosshair,
      shortcut: "L",
      allowed: true,
    },
  ];

  return (
      <>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-auto">
          {hasActiveMap && (
              <>
                <DrawSubToolbar />
                <TextSubToolbar />
                <FogSubToolbar />
              </>
          )}

          <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl shadow-2xl backdrop-blur-xl text-zinc-200">
            <div className="flex items-center gap-1">
              {primaryTools.map((t) => {
                if (!t.allowed) return null;
                const Icon = t.icon;
                const isActive = activeTool === t.id && hasActiveMap;
                const isDisabled = !hasActiveMap;

                return (
                    <Tooltip
                        key={t.id}
                        content={t.label}
                        subContent={isDisabled ? "ابتدا نقشه را بارگذاری کنید" : t.labelFa}
                        shortcut={isDisabled ? undefined : t.shortcut}
                    >
                      <button
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleToolClick(t.id)}
                          className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150",
                              isDisabled
                                  ? "text-zinc-600 opacity-40 cursor-not-allowed"
                                  : isActive
                                      ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20 scale-105 cursor-pointer"
                                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 cursor-pointer"
                          )}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    </Tooltip>
                );
              })}
            </div>

            {!isGM && hasActiveMap && (
                <>
                  <div className="h-6 w-px bg-zinc-800 mx-1" />
                  <Tooltip
                      content="My Character"
                      subContent={
                        myExistingToken
                            ? "نمایش و فوکوس روی کاراکتر شما"
                            : "افزودن کاراکتر من به نقشه"
                      }
                  >
                    <button
                        type="button"
                        onClick={handleMyCharacterClick}
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                            myExistingToken
                                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 animate-pulse shadow-md shadow-amber-500/10"
                        )}
                    >
                      <User className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </>
            )}

            <div className="h-6 w-px bg-zinc-800 mx-1" />

            <Tooltip content="Dice Tray" subContent="سینی پرتاب تاس سه‌بعدی" shortcut="Space">
              <button
                  type="button"
                  onClick={() => toggleMenu("dice")}
                  className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                      isDiceOpen
                          ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                          : "text-amber-400 hover:bg-amber-500/10"
                  )}
              >
                <Dices className="w-5 h-5" />
              </button>
            </Tooltip>

            {(isGM || permissions?.canAssets) && (
                <Tooltip content="Asset Library" subContent="کتابخانه منابع و نقشه‌ها">
                  <button
                      type="button"
                      onClick={() => toggleMenu("asset")}
                      className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                          isAssetOpen
                              ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                              : !hasActiveMap
                                  ? "text-amber-400 bg-amber-500/10 animate-pulse border border-amber-500/40"
                                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      )}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </Tooltip>
            )}

            {isGM && (
                <Tooltip content="Room Settings" subContent="تنظیمات اتاق و گرید">
                  <button
                      type="button"
                      onClick={() => toggleMenu("settings")}
                      className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer",
                          isSettingsOpen
                              ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      )}
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </Tooltip>
            )}
          </div>
        </div>

        <div className="fixed bottom-6 right-6 z-30 flex items-center gap-1.5 p-1.5 bg-zinc-900/90 border border-zinc-800/80 rounded-xl shadow-xl backdrop-blur-md text-xs text-zinc-300">
          <button
              type="button"
              disabled={!hasActiveMap}
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.2))}
              className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  !hasActiveMap ? "text-zinc-700 cursor-not-allowed" : "text-zinc-400 hover:bg-zinc-800 cursor-pointer"
              )}
              title="کوچک‌نمایی"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
              type="button"
              disabled={!hasActiveMap}
              onClick={resetView}
              className={cn(
                  "px-2 h-8 rounded-lg font-mono text-xs transition-colors",
                  !hasActiveMap ? "text-zinc-700 cursor-not-allowed" : "text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              )}
              title="بازنشانی بزرگ‌نمایی"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
              type="button"
              disabled={!hasActiveMap}
              onClick={() => setZoom((z) => Math.min(z + 0.15, 3.5))}
              className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  !hasActiveMap ? "text-zinc-700 cursor-not-allowed" : "text-zinc-400 hover:bg-zinc-800 cursor-pointer"
              )}
              title="بزرگ‌نمایی"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </>
  );
};