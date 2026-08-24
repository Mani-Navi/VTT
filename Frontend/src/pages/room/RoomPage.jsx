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
  Dices,
} from "lucide-react";
import { useSceneStore } from "../../store/scene.store.js";
import { useAuthStore } from "../../store/auth.store";
import { useWebSocket } from "../../hooks/useWebSocket.js";
import { useClipboard } from "../../hooks/useClipboard";
import { GameCanvas } from "../../components/canvas/GameCanvas.jsx";
import { Toolbar } from "../../components/room/Toolbar.jsx";
import { DiceRoller } from "../../components/room/DiceRoller.jsx";
import { Dice3DStage } from "../../components/dice3d/Dice3DStage.jsx";
import { PlayerMenu } from "../../components/room/PlayerMenu.jsx";
import { SettingsMenu } from "../../components/room/SettingsMenu.jsx";
import { AssetMenu } from "../../components/room/AssetMenu.jsx";
import { ExtensionsMenu } from "../../components/room/ExtensionsMenu.jsx";
import { TokenEditorModal } from "../../components/room/TokenEditorModal.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import api from "../../api/axios";

export const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const loadScenes = useSceneStore((state) => state.loadScenes);
  const currentScene = useSceneStore((state) => state.currentScene);

  const { isConnected } = useWebSocket(roomId);
  const { copy, copied } = useClipboard();

  const [roomData, setRoomData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // لود اطلاعات اتاق و سکانس‌ها از API
  useEffect(() => {
    if (!roomId) return;

    // دریافت اطلاعات پایه اتاق
    api
        .get(`/rooms/${roomId}`)
        .then((res) => setRoomData(res.data))
        .catch(() => {
          // Fallback در صورت عدم وجود اندپوینت تکی
          setRoomData({ id: roomId, name: "میز بازی VTT", code: "ROOM" });
        });

    // لود سکانس‌های اتاق
    loadScenes(roomId);
  }, [roomId, loadScenes]);

  const isGM = roomData?.ownerUsername === user?.username || roomData?.role === "GM";

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#090a0f] select-none font-fa">
        {/* هدر شناور شیشه‌ای بالای صفحه */}
        <header className="fixed top-4 left-6 right-6 z-30 flex items-center justify-between pointer-events-none" dir="rtl">
          {/* اطلاعات سمت راست: عنوان و کد اتاق */}
          <div className="flex items-center gap-3 p-1.5 pl-3.5 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl shadow-xl backdrop-blur-xl pointer-events-auto">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
              <Dices className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-bold text-zinc-100">
                  {roomData?.name || "میز بازی رول‌پلینگ"}
                </h1>
                <Badge variant={isGM ? "gm" : "player"} size="sm">
                  {isGM ? <Crown className="w-3 h-3 ml-1" /> : <User className="w-3 h-3 ml-1" />}
                  {isGM ? "دانجن‌مستر" : "بازیکن"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                <span>کد دعوت:</span>
                <button
                    type="button"
                    onClick={() => copy(roomData?.code)}
                    className="flex items-center gap-1 font-mono text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
                    title="کلیک برای کپی"
                >
                  <span>{roomData?.code || roomId?.substring(0, 6).toUpperCase()}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* اطلاعات سمت چپ: وضعیت اتصال و ابزارهای سریع */}
          <div className="flex items-center gap-2.5 pointer-events-auto" dir="ltr">
            {/* وضعیت سینک زنده وب‌سوکت */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800/80 rounded-xl shadow-xl backdrop-blur-xl text-[11px]">
            <span
                className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" : "bg-amber-500"
                }`}
            />
              <span className="text-zinc-300 font-mono text-[10px]">
              {isConnected ? "Live Sync" : "Connecting..."}
            </span>
            </div>

            {/* راهنما و کلیدهای میانبر */}
            <button
                onClick={() => setIsHelpOpen(true)}
                className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-zinc-400 hover:text-zinc-100 flex items-center justify-center shadow-xl backdrop-blur-xl transition-colors cursor-pointer"
                title="راهنمای کلیدها"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* تمام‌صفحه */}
            <button
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-zinc-400 hover:text-zinc-100 flex items-center justify-center shadow-xl backdrop-blur-xl transition-colors cursor-pointer"
                title="تمام صفحه"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* دکمه خروج */}
            <button
                onClick={() => navigate("/dashboard")}
                className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center shadow-xl backdrop-blur-xl transition-colors cursor-pointer"
                title="خروج از اتاق"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* بوم تعاملی Konva */}
        <GameCanvas />

        {/* نوار ابزار شناور میز بازی */}
        <Toolbar />

        {/* پنل‌های تاس، منوهای بازیکنان و تنظیمات */}
        <DiceRoller />
        <Dice3DStage />
        <PlayerMenu />
        <SettingsMenu />
        <AssetMenu />
        <ExtensionsMenu />
        <TokenEditorModal />

        {/* مدال راهنما */}
        <Modal
            isOpen={isHelpOpen}
            onClose={() => setIsHelpOpen(false)}
            title="Keyboard Controls"
            titleFa="کلیدهای میانبر و کنترل‌ها"
            maxWidth="md"
        >
          <div className="space-y-3 text-xs text-zinc-300 font-fa" dir="rtl">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-amber-400 block">ابزارها:</span>
                <div className="flex justify-between"><span>انتخاب:</span><kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">V</kbd></div>
                <div className="flex justify-between"><span>جابجایی نقشه:</span><kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">H</kbd></div>
                <div className="flex justify-between"><span>نقاشی و خطوط:</span><kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">D</kbd></div>
                <div className="flex justify-between"><span>خط‌کش اندازه‌گیری:</span><kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">R</kbd></div>
                <div className="flex justify-between"><span>مه جنگ (GM):</span><kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">F</kbd></div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-amber-400 block">اکشن‌ها:</span>
                <div className="flex justify-between"><span>زوم:</span><span className="text-zinc-400">اسکرول ماوس</span></div>
                <div className="flex justify-between"><span>پینگ رادار:</span><span className="text-zinc-400">دوبار کلیک روی مپ</span></div>
                <div className="flex justify-between"><span>ویرایش توکن:</span><span className="text-zinc-400">دوبار کلیک روی توکن</span></div>
                <div className="flex justify-between"><span>پرتاب سریع تاس:</span><kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">Space</kbd></div>
                <div className="flex justify-between"><span>حذف:</span><kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">Delete</kbd></div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
  );
};