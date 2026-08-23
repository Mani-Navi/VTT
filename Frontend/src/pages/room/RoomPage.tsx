import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Crown,
  User,
  Copy,
  Check,
  LogOut,
  Maximize2,
  Minimize2,
  HelpCircle,
  Sparkles,
  Wifi,
  WifiOff,
  Dices,
  Shield,
  Layers,
} from "lucide-react";
import { useRoomStore } from "../../store/room.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { useCanvasStore } from "../../store/canvas.store";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useCanvas } from "../../hooks/useCanvas";
import { usePermissions } from "../../hooks/usePermissions";
import { GameCanvas } from "../../components/canvas/GameCanvas";
import { Toolbar } from "../../components/room/Toolbar";
import { DiceRoller } from "../../components/room/DiceRoller";
import { Dice3DStage } from "../../components/dice3d/Dice3DStage";
import { PlayerMenu } from "../../components/room/PlayerMenu";
import { SettingsMenu } from "../../components/room/SettingsMenu";
import { AssetMenu } from "../../components/room/AssetMenu";
import { ExtensionsMenu } from "../../components/room/ExtensionsMenu";
import { TokenEditorModal } from "../../components/room/TokenEditorModal";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { ROLES } from "../../constants/permissions";

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const fetchRoomById = useRoomStore((state) => state.fetchRoomById);
  const currentRoom = useRoomStore((state) => state.currentRoom);
  const players = useRoomStore((state) => state.players);
  const setPlayers = useRoomStore((state) => state.setPlayers);

  const fetchScene = useSceneStore((state) => state.fetchScene);
  const currentScene = useSceneStore((state) => state.currentScene);
  const user = useAuthStore((state) => state.user);

  const { isConnected } = useWebSocket(roomId);
  useCanvas(); // Active keyboard shortcuts listener
  const { isGM } = usePermissions();

  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchRoomById(roomId);
      fetchScene("scene-crypt-1");
    }
  }, [roomId, fetchRoomById, fetchScene]);

  const handleCopyCode = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(currentRoom.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 select-none">
      {/* Top Floating Glass Header */}
      <header className="fixed top-4 left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
        {/* Left Info: Room Title & Code */}
        <div className="flex items-center gap-3 p-1.5 pr-3 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl shadow-xl backdrop-blur-xl pointer-events-auto">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
            VTT
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold text-zinc-100 font-fa">
                {currentRoom?.name || "اتاق بازی D&D"}
              </h1>
              {isGM ? (
                <Badge variant="gm" size="sm">
                  <Crown className="w-3 h-3" />
                  GM
                </Badge>
              ) : (
                <Badge variant="player" size="sm">
                  <User className="w-3 h-3" />
                  بازیکن
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span>کد دعوت:</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 font-mono text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                title="کپی کد اتاق"
              >
                <span>{currentRoom?.code || "OWL-7721"}</span>
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Info: Connected Players Avatars & Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Connection Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800/80 rounded-xl shadow-xl backdrop-blur-xl text-[11px]">
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-zinc-300 font-mono">Live Sync</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-zinc-400 font-mono">P2P Tab Sync</span>
              </>
            )}
          </div>

          {/* Connected Player Avatars Stack */}
          <div className="flex items-center -space-x-2 bg-zinc-900/90 border border-zinc-800/80 p-1 rounded-xl shadow-xl backdrop-blur-xl">
            {players.slice(0, 4).map((p) => (
              <img
                key={p.id}
                src={p.avatarUrl}
                alt={p.displayName}
                title={`${p.displayName} (${p.role})`}
                className="w-7 h-7 rounded-full border-2 border-zinc-900 object-cover bg-zinc-800"
              />
            ))}
            {players.length > 4 && (
              <span className="w-7 h-7 rounded-full bg-zinc-800 text-[10px] text-zinc-300 flex items-center justify-center font-mono border-2 border-zinc-900">
                +{players.length - 4}
              </span>
            )}
          </div>

          {/* Quick Help Modal Trigger */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-zinc-400 hover:text-zinc-100 flex items-center justify-center shadow-xl backdrop-blur-xl transition-colors cursor-pointer"
            title="کلیدهای میانبر و راهنما"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-zinc-400 hover:text-zinc-100 flex items-center justify-center shadow-xl backdrop-blur-xl transition-colors cursor-pointer"
            title="تمام صفحه"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit Room Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center shadow-xl backdrop-blur-xl transition-colors cursor-pointer"
            title="خروج از اتاق"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Interactive Konva Stage Canvas */}
      <GameCanvas />

      {/* Primary Floating Toolbar */}
      <Toolbar />

      {/* Floating Overlays and Drawers */}
      <DiceRoller />
      <Dice3DStage />
      <PlayerMenu />
      <SettingsMenu />
      <AssetMenu />
      <ExtensionsMenu />
      <TokenEditorModal />

      {/* Quick Shortcuts & Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Keyboard Shortcuts & Controls"
        titleFa="راهنمای کلیدهای میانبر و کنترل‌ها"
        maxWidth="md"
      >
        <div className="space-y-3 text-xs text-zinc-300 font-fa">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 space-y-1.5">
              <span className="font-bold text-amber-400 block">ابزارهای اصلی:</span>
              <div className="flex justify-between">
                <span>انتخاب توکن:</span>
                <kbd className="font-mono bg-zinc-800 px-1.5 rounded">V</kbd>
              </div>
              <div className="flex justify-between">
                <span>جابجایی مپ (Pan):</span>
                <kbd className="font-mono bg-zinc-800 px-1.5 rounded">H</kbd>
              </div>
              <div className="flex justify-between">
                <span>ابزار رسم:</span>
                <kbd className="font-mono bg-zinc-800 px-1.5 rounded">D</kbd>
              </div>
              <div className="flex justify-between">
                <span>خط‌کش اندازه‌گیری:</span>
                <kbd className="font-mono bg-zinc-800 px-1.5 rounded">R</kbd>
              </div>
              <div className="flex justify-between">
                <span>مه تاریکی (GM):</span>
                <kbd className="font-mono bg-zinc-800 px-1.5 rounded">F</kbd>
              </div>
            </div>

            <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 space-y-1.5">
              <span className="font-bold text-amber-400 block">کنترل‌های ماوس و اکشن‌ها:</span>
              <div className="flex justify-between">
                <span>بزرگ‌نمایی:</span>
                <span className="text-zinc-400">چرخش اسکرول</span>
              </div>
              <div className="flex justify-between">
                <span>رادار پینگ:</span>
                <span className="text-zinc-400">دوبار کلیک روی مپ</span>
              </div>
              <div className="flex justify-between">
                <span>ویرایش آمار توکن:</span>
                <span className="text-zinc-400">دوبار کلیک روی توکن</span>
              </div>
              <div className="flex justify-between">
                <span>پرتاب سریع تاس:</span>
                <kbd className="font-mono bg-zinc-800 px-1.5 rounded">Space</kbd>
              </div>
              <div className="flex justify-between">
                <span>حذف مورد انتخابی:</span>
                <kbd className="font-mono bg-zinc-800 px-1.5 rounded">Del / Backspace</kbd>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-zinc-500 text-[11px]">
            طراحی شده با الهام از سادگی و سرعت Owlbear Rodeo و پشتیبانی کامل از زبان فارسی
          </div>
        </div>
      </Modal>
    </div>
  );
};
