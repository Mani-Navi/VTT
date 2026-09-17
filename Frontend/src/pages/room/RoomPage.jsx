import React, { useEffect, useState, useCallback, useMemo, Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    LogOut,
    Maximize2,
    Minimize2,
    HelpCircle,
    PowerOff,
    RefreshCw,
} from "lucide-react";
import { useSceneStore } from "../../store/scene.store.js";
import { useAuthStore } from "../../store/auth.store";
import { useRoomStore } from "../../store/room.store";
import { useWebSocket } from "../../hooks/useWebSocket.js";
import { usePermissions } from "../../hooks/usePermissions";
import { wsService } from "../../services/websocket.service";
import { roomApi } from "../../api/room.api";
import { GameCanvas } from "../../components/canvas/GameCanvas.jsx";
import { Toolbar } from "../../components/room/Toolbar.jsx";
import { SceneBar } from "../../components/room/SceneBar.jsx";
import { DiceRoller } from "../../components/room/DiceRoller.jsx";
import { Dice3DStage } from "../../components/dice3d/Dice3DStage.jsx";
import { PlayerMenu } from "../../components/room/PlayerMenu.jsx";
import { SettingsMenu } from "../../components/room/SettingsMenu.jsx";
import { AssetMenu } from "../../components/room/AssetMenu.jsx";
import { TokenEditorModal } from "../../components/room/TokenEditorModal.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { WS_EVENTS } from "../../constants/wsEvents.js";

/**
 * مرز خطای اختصاصی کانواس برای جلوگیری از سقوط کل صفحه اتاق در خطاهای Konva/WebGL
 */
class CanvasErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        if (import.meta.env.DEV) {
            console.error("[Canvas Crash]:", error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center text-center p-6 z-10 font-fa">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 mb-1">خطا در پردازش گرافیکی بوم بازی</h3>
                    <p className="text-xs text-zinc-400 mb-4 max-w-sm">
                        بافت گرافیکی یا شتاب‌دهنده وب‌جی‌ال مرورگر با وقفه مواجه شد.
                    </p>
                    <button
                        type="button"
                        onClick={() => this.setState({ hasError: false })}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
                    >
                        راه‌اندازی مجدد کانواس
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export const RoomPage = () => {
    const { roomId: urlParamId } = useParams();
    const navigate = useNavigate();

    const user = useAuthStore((state) => state.user);
    const setCurrentRoom = useRoomStore((state) => state.setCurrentRoom);
    const loadScenes = useSceneStore((state) => state.loadScenes);
    const setAvailableConditions = useSceneStore((state) => state.setAvailableConditions);

    const [roomData, setRoomData] = useState(null);
    const [onlineMembers, setOnlineMembers] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const effectiveRoomId = useMemo(() => {
        return roomData?.id ? String(roomData.id) : urlParamId;
    }, [roomData?.id, urlParamId]);

    const { isGM, permissions: userPermissions } = usePermissions(roomData);

    const handleSocketMessage = useCallback(
        (event) => {
            if (!event) return;

            if (Array.isArray(event)) {
                setOnlineMembers(event);
                return;
            }

            const action = event.action || (event.data ? event.action : null);
            const data = event.data !== undefined ? event.data : event;

            if (action === "ROOM_CLOSED") {
                alert(data || "اتاق توسط دانجن‌مستر (GM) غیرفعال شد.");
                navigate("/dashboard");
                return;
            }

            if (action === "MEMBER_KICKED") {
                const currentUname = String(user?.username || "").toLowerCase().trim();
                const incomingUname = String(data?.username || "").toLowerCase().trim();
                if (data?.userId === user?.id || (currentUname && currentUname === incomingUname)) {
                    alert("شما توسط دانجن‌مستر از اتاق اخراج شدید.");
                    navigate("/dashboard");
                    return;
                }
            }

            if (action === "MEMBER_BANNED") {
                const currentUname = String(user?.username || "").toLowerCase().trim();
                const incomingUname = String(data?.username || "").toLowerCase().trim();
                if (data?.userId === user?.id || (currentUname && currentUname === incomingUname)) {
                    alert("شما توسط دانجن‌مستر از اتاق مسدود (Ban) شدید.");
                    navigate("/dashboard");
                    return;
                }
            }

            if (action === WS_EVENTS.ROLE_TITLE_UPDATE || action === "ROLE_TITLE_UPDATE") {
                wsService.trigger("ROLE_TITLE_UPDATE", data);
            }

            if (action === WS_EVENTS.MEMBER_MUTE_TOGGLED || action === "MEMBER_MUTE_TOGGLED") {
                wsService.trigger("MEMBER_MUTE_TOGGLED", data);
            }

            if (action === "CONDITION_POOL_UPDATE") {
                if (data?.availableConditions) {
                    setAvailableConditions(data.availableConditions);
                }
            }

            if (action === "PERMISSION_UPDATED" && data) {
                const currentUname = String(user?.username || "").toLowerCase().trim();
                const incomingUname = String(data.username || "").toLowerCase().trim();
                const currentUid = String(user?.id || user?.userId || "").toLowerCase().trim();
                const incomingMemberId = String(data.memberId || "").toLowerCase().trim();

                const isTargetMe =
                    (currentUname && currentUname === incomingUname) ||
                    (data.userId && String(data.userId).toLowerCase().trim() === currentUid) ||
                    (incomingMemberId &&
                        onlineMembers.some(
                            (m) =>
                                String(m.id || m.memberId).toLowerCase() === incomingMemberId &&
                                (String(m.userId) === currentUid || String(m.username).toLowerCase() === currentUname)
                        ));

                if (isTargetMe) {
                    const updatedPerms = {
                        canAssets: Boolean(data.canAssets),
                        canText: Boolean(data.canText),
                        canFog: Boolean(data.canFog),
                        canDrawing: Boolean(data.canDrawing),
                        canScene: Boolean(data.canScene),
                        canRuler: data.canRuler !== undefined ? Boolean(data.canRuler) : true,
                        canEditToken: Boolean(data.canEditToken),
                    };

                    setRoomData((prev) => ({
                        ...prev,
                        permissions: updatedPerms,
                    }));

                    setCurrentRoom((prev) => (prev ? { ...prev, permissions: updatedPerms } : prev));
                }
            }
        },
        [user, setCurrentRoom, setAvailableConditions, onlineMembers, navigate]
    );

    const { isConnected } = useWebSocket(effectiveRoomId, handleSocketMessage);

    useEffect(() => {
        if (!urlParamId) return;

        roomApi
            .getRoom(urlParamId)
            .then((data) => {
                setRoomData(data);
                setCurrentRoom(data);
                const actualId = data?.id ? String(data.id) : urlParamId;
                loadScenes(actualId);
            })
            .catch((err) => {
                if (import.meta.env.DEV) {
                    console.error("خطا در دریافت اطلاعات اتاق:", err);
                }
                const message = err.response?.data?.message || "امکان ورود به این اتاق وجود ندارد";
                alert(message);
                navigate("/dashboard");
            });
    }, [urlParamId, loadScenes, setCurrentRoom, navigate]);

    const handleCloseRoom = async () => {
        if (!confirm("آیا از بستن اتاق اطمینان دارید؟ تمام بازیکنان خارج شده و اتاق غیرفعال می‌شود.")) {
            return;
        }
        try {
            await roomApi.closeRoom(effectiveRoomId);
            navigate("/dashboard");
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error("خطا در بستن اتاق:", err);
            }
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-[#090a0f] select-none font-fa">
            <PlayerMenu
                isGM={isGM}
                roomId={effectiveRoomId}
                roomData={roomData}
                onlineMembers={onlineMembers}
            />

            <SceneBar isGM={isGM} roomId={effectiveRoomId} />

            <header
                className="fixed top-4 left-6 z-30 flex items-center gap-2.5 pointer-events-auto"
                dir="ltr"
            >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800/80 rounded-xl shadow-xl backdrop-blur-xl text-[11px]">
          <span
              className={`w-2 h-2 rounded-full ${
                  isConnected
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"
                      : "bg-amber-500"
              }`}
          />
                    <span className="text-zinc-300 font-mono text-[10px]">
            {isConnected ? "Live Sync" : "Connecting..."}
          </span>
                </div>

                <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-zinc-400 hover:text-zinc-100 flex items-center justify-center shadow-xl backdrop-blur-xl transition-colors cursor-pointer"
                    title="راهنمای کلیدها"
                >
                    <HelpCircle className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-zinc-400 hover:text-zinc-100 flex items-center justify-center shadow-xl backdrop-blur-xl transition-colors cursor-pointer"
                    title="تمام صفحه"
                >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {isGM && (
                    <button
                        type="button"
                        onClick={handleCloseRoom}
                        className="px-2.5 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 flex items-center gap-1.5 shadow-xl backdrop-blur-xl transition-all cursor-pointer font-bold text-xs"
                        title="بستن و غیرفعال‌سازی اتاق"
                    >
                        <PowerOff className="w-3.5 h-3.5" />
                        <span>بستن اتاق</span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="w-9 h-9 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center shadow-xl backdrop-blur-xl transition-colors cursor-pointer"
                    title="خروج از اتاق"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </header>

            {/* بوم بازی محافظت‌شده با ErrorBoundary طبق بند ۴ سند */}
            <CanvasErrorBoundary>
                <GameCanvas isGM={isGM} permissions={userPermissions} />
            </CanvasErrorBoundary>

            <Toolbar isGM={isGM} permissions={userPermissions} />

            <DiceRoller />
            <Dice3DStage />
            <SettingsMenu isGM={isGM} />
            <AssetMenu isGM={isGM} permissions={userPermissions} />
            <TokenEditorModal roomData={roomData} />

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
                            <div className="flex justify-between">
                                <span>انتخاب:</span>
                                <kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">V</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span>جابجایی نقشه:</span>
                                <kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">H</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span>نقاشی و خطوط:</span>
                                <kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">D</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span>نوشت‌افزار:</span>
                                <kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">T</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span>خط‌کش:</span>
                                <kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">R</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span>مه جنگ (GM):</span>
                                <kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">F</kbd>
                            </div>
                        </div>

                        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                            <span className="font-bold text-amber-400 block">اکشن‌ها:</span>
                            <div className="flex justify-between">
                                <span>زوم:</span>
                                <span className="text-zinc-400">اسکرول ماوس</span>
                            </div>
                            <div className="flex justify-between">
                                <span>پینگ رادار:</span>
                                <span className="text-zinc-400">دوبار کلیک روی مپ</span>
                            </div>
                            <div className="flex justify-between">
                                <span>ویرایش توکن:</span>
                                <span className="text-zinc-400">راست کلیک روی توکن</span>
                            </div>
                            <div className="flex justify-between">
                                <span>وصل/قطع میکروفون:</span>
                                <kbd className="font-mono bg-zinc-800 px-1.5 rounded text-amber-400">Space</kbd>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};