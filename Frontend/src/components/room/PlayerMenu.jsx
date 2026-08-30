import React, { useState, useEffect } from "react";
import {
  Dices,
  Crown,
  User,
  Shield,
  Volume2,
  VolumeX,
  UserX,
  Ban,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Tag,
  Sparkles,
  Settings2,
  Sliders,
  Users,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useClipboard } from "../../hooks/useClipboard";
import { roomApi } from "../../api/room.api";
import { wsService } from "../../services/websocket.service";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";

const HOST_ROLE_PRESETS = [
  "میزبان",
  "دانجن‌مستر (DM)",
  "گیم‌مستر (GM)",
  "داستان‌گو (Storyteller)",
  "نگهبان (Keeper)",
  "داور (Referee)",
];

const PLAYER_ROLE_PRESETS = [
  "بازیکن",
  "ماجراجو (Adventurer)",
  "قهرمان (Hero)",
  "محقق (Investigator)",
  "مبارز (Warrior)",
  "جادوگر (Mage)",
];

export const PlayerMenu = ({
                             isGM = false,
                             roomId = null,
                             roomData = null,
                             onlineMembers = [],
                           }) => {
  const currentUser = useAuthStore((state) => state.user);
  const { copy, copied } = useClipboard();

  const [isOpen, setIsOpen] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState(null);

  // عناوین همگانی نقش‌های اتاق
  const [hostTitle, setHostTitle] = useState(() => {
    return roomData?.hostRoleTitle || localStorage.getItem(`room_${roomId}_host_title`) || "میزبان";
  });

  const [playerTitle, setPlayerTitle] = useState(() => {
    return roomData?.playerRoleTitle || localStorage.getItem(`room_${roomId}_player_title`) || "بازیکن";
  });

  const [customInputMap, setCustomInputMap] = useState({});

  useEffect(() => {
    if (roomData?.hostRoleTitle) setHostTitle(roomData.hostRoleTitle);
    if (roomData?.playerRoleTitle) setPlayerTitle(roomData.playerRoleTitle);
  }, [roomData]);

  useEffect(() => {
    if (!roomId) return;
    try {
      localStorage.setItem(`room_${roomId}_host_title`, hostTitle);
      localStorage.setItem(`room_${roomId}_player_title`, playerTitle);
    } catch {}
  }, [hostTitle, playerTitle, roomId]);

  useEffect(() => {
    const unsubscribe = wsService.on("ROLE_TITLE_UPDATE", (data) => {
      if (data?.targetType === "HOST" && data.title) {
        setHostTitle(data.title);
      } else if (data?.targetType === "PLAYER" && data.title) {
        setPlayerTitle(data.title);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const handleSetRoleTitle = (targetType, title) => {
    if (!title || !title.trim()) return;
    const finalTitle = title.trim();

    if (targetType === "HOST") {
      setHostTitle(finalTitle);
    } else {
      setPlayerTitle(finalTitle);
    }

    wsService.send("ROLE_TITLE_UPDATE", {
      targetType: targetType,
      title: finalTitle,
    });
  };

  const getMemberDisplayTitle = (isMemberGM) => {
    return isMemberGM ? hostTitle : playerTitle;
  };

  const handleKick = async (memberId) => {
    if (!confirm("آیا از اخراج این کاربر از اتاق اطمینان دارید؟")) return;
    try {
      await roomApi.kickMember(roomId, memberId);
    } catch (err) {
      console.error("خطا در اخراج کاربر:", err);
    }
  };

  const handleBan = async (memberId) => {
    if (!confirm("آیا از مسدودسازی دائمی (Ban) این کاربر اطمینان دارید؟")) return;
    try {
      await roomApi.banMember(roomId, memberId);
    } catch (err) {
      console.error("خطا در بن کاربر:", err);
    }
  };

  const handleToggleMute = async (memberId) => {
    try {
      await roomApi.muteMember(roomId, memberId);
    } catch (err) {
      console.error("خطا در تغییر وضعیت صدا:", err);
    }
  };

  const handleRoleChange = async (memberId, currentRole) => {
    const targetRole = currentRole === "GM" ? "Player" : "GM";
    try {
      await roomApi.changeRole(roomId, memberId, targetRole);
    } catch (err) {
      console.error("خطا در تغییر رول:", err);
    }
  };

  const handlePermissionToggle = async (memberId, permissionKey, currentValue) => {
    try {
      const payload = {
        memberId: memberId,
        [permissionKey]: !currentValue,
      };
      await roomApi.updatePermissions(payload);
    } catch (err) {
      console.error("خطا در آپدیت پرمیشن:", err);
    }
  };

  const displayCode = roomData?.code || (roomId ? roomId.substring(0, 6).toUpperCase() : "------");
  const myMemberObject = onlineMembers.find((m) => m.userId === currentUser?.id || m.username === currentUser?.username);
  const mySelfTitle = getMemberDisplayTitle(isGM);

  // تفکیک اعضا به دو گروه دیسکوردی (میزبانان و بازیکنان)
  const hostMembers = onlineMembers.filter((m) => m.role === "GM" || m.role === "ADMIN");
  const playerMembers = onlineMembers.filter((m) => m.role !== "GM" && m.role !== "ADMIN");

  const renderMemberCard = (member) => {
    const isSelf =
        member.userId === currentUser?.id ||
        member.username?.toLowerCase() === currentUser?.username?.toLowerCase();
    const isMemberGM = member.role === "GM" || member.role === "ADMIN";
    const isExpanded = expandedMemberId === member.id;
    const perms = member.permissions || {};
    const displayTitle = getMemberDisplayTitle(isMemberGM);

    const currentInputVal = customInputMap[member.id] || "";
    const targetType = isMemberGM ? "HOST" : "PLAYER";
    const availablePresets = isMemberGM ? HOST_ROLE_PRESETS : PLAYER_ROLE_PRESETS;

    return (
        <div
            key={member.id || member.userId}
            className={cn(
                "rounded-2xl border transition-all duration-200 overflow-hidden",
                isExpanded
                    ? "bg-zinc-950/95 border-amber-500/40 shadow-lg ring-1 ring-amber-500/20"
                    : "bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700"
            )}
        >
          {/* ردیف اصلی اطلاعات کاربر (Discord-like Member Row) */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                    className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-inner transition-transform",
                        isMemberGM
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                    )}
                >
                  {member.username ? member.username.slice(0, 2).toUpperCase() : "U"}
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950 absolute -bottom-0.5 -right-0.5 animate-pulse shadow-sm shadow-emerald-500/50" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-100 truncate max-w-[120px]">
                  {member.username}
                </span>
                  {isSelf && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded-md font-medium">
                    شما
                  </span>
                  )}
                  {member.isMuted && <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
                </div>

                <div className="flex items-center gap-1">
                <span
                    className={cn(
                        "text-[10px] font-semibold",
                        isMemberGM ? "text-amber-400" : "text-zinc-400"
                    )}
                >
                  {displayTitle}
                </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                  className={cn(
                      "px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border",
                      isMemberGM
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10"
                          : "bg-zinc-800/80 text-zinc-300 border-zinc-700/60"
                  )}
              >
                {isMemberGM ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <User className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{displayTitle}</span>
              </div>

              {isGM && (
                  <button
                      type="button"
                      onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                      className={cn(
                          "w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                          isExpanded
                              ? "bg-amber-500 text-zinc-950 font-bold"
                              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      )}
                      title="تنظیمات مدیریت و دسترسی"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                  </button>
              )}
            </div>
          </div>

          {/* پنل مدیریت تفصیلی (Discord Style Popover Panel) */}
          {isGM && isExpanded && (
              <div className="p-3.5 bg-zinc-950 border-t border-zinc-800/90 space-y-3 animate-in fade-in zoom-in-95 duration-150">

                {/* بخش تغییر همگانی عنوان نقش */}
                <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>تغییر تگ و عنوان همگانی {isMemberGM ? "میزبان‌ها" : "تمام بازیکنان"}:</span>
                    </div>
                  </div>

                  {/* کپسول‌های عناوین آماده دیسکوردی */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {availablePresets.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => handleSetRoleTitle(targetType, preset)}
                            className={cn(
                                "px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer border",
                                displayTitle === preset
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold shadow-sm shadow-amber-500/20"
                                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/80"
                            )}
                        >
                          {preset}
                        </button>
                    ))}
                  </div>

                  {/* ورودی متن دلخواه */}
                  <div className="flex gap-1.5 pt-1.5">
                    <input
                        type="text"
                        value={currentInputVal}
                        onChange={(e) =>
                            setCustomInputMap((prev) => ({
                              ...prev,
                              [member.id]: e.target.value,
                            }))
                        }
                        placeholder={isMemberGM ? "عنوان دلخواه میزبان..." : "عنوان دلخواه تمام بازیکنان..."}
                        className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 shadow-inner"
                    />
                    <button
                        type="button"
                        onClick={() => {
                          if (currentInputVal) {
                            handleSetRoleTitle(targetType, currentInputVal);
                            setCustomInputMap((prev) => ({ ...prev, [member.id]: "" }));
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-amber-500/20"
                    >
                      اعمال به همه
                    </button>
                  </div>
                </div>

                {/* کنترل‌های سریع دیسکوردی (میوت، ارتقا، اخراج، بن) */}
                {!isSelf && (
                    <>
                      <div className="grid grid-cols-4 gap-2">
                        <button
                            type="button"
                            onClick={() => handleToggleMute(member.id)}
                            className={cn(
                                "py-2 px-1 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all",
                                member.isMuted
                                    ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                            )}
                        >
                          {member.isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-zinc-400" />}
                          <span>{member.isMuted ? "صدا قطع" : "بی‌صدا"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleRoleChange(member.id, member.role)}
                            className="py-2 px-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 hover:border-zinc-700 text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Shield className="w-4 h-4 text-amber-400" />
                          <span>{isMemberGM ? "تبدیل به پلیر" : "تبدیل به میزبان"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleKick(member.id)}
                            className="py-2 px-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <UserX className="w-4 h-4 text-rose-400" />
                          <span>اخراج</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleBan(member.id)}
                            className="py-2 px-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-rose-500 hover:bg-rose-500/20 hover:border-rose-500/40 text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Ban className="w-4 h-4 text-rose-500" />
                          <span>مسدود</span>
                        </button>
                      </div>

                      {/* تاگل‌های پرمیشن ابزارها */}
                      <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>دسترسی‌های ابزار بازیکن (Permissions):</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {[
                            { key: "canDrawing", label: "ترسیم (Drawing)" },
                            { key: "canText", label: "نوشت‌افزار (Text)" },
                            { key: "canFog", label: "مه جنگ (Fog)" },
                            { key: "canAssets", label: "منابع (Assets)" },
                            { key: "canScene", label: "نقشه (Map)" },
                            { key: "canRuler", label: "خط‌کش (Ruler)" },
                          ].map((p) => {
                            const isAllowed = Boolean(perms[p.key]);
                            return (
                                <div
                                    key={p.key}
                                    onClick={() => handlePermissionToggle(member.id, p.key, isAllowed)}
                                    className={cn(
                                        "p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none",
                                        isAllowed
                                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300 font-medium"
                                            : "bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                                    )}
                                >
                                  <span className="text-[11px] truncate">{p.label}</span>
                                  <div
                                      className={cn(
                                          "w-6 h-3.5 rounded-full transition-colors relative",
                                          isAllowed ? "bg-amber-500" : "bg-zinc-800"
                                      )}
                                  >
                                    <div
                                        className={cn(
                                            "w-2.5 h-2.5 rounded-full bg-white transition-transform absolute top-0.5",
                                            isAllowed ? "right-0.5" : "right-3"
                                        )}
                                    />
                                  </div>
                                </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                )}
              </div>
          )}
        </div>
    );
  };

  return (
      <div className="fixed top-4 right-6 z-40 font-fa select-none pointer-events-auto" dir="rtl">
        {/* هدر بالایی کارت اتاق */}
        <div
            className={cn(
                "w-96 max-w-[95vw] bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl transition-all duration-200",
                isOpen ? "rounded-t-3xl border-b-0" : "rounded-3xl"
            )}
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black shrink-0 shadow-inner">
                <Dices className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xs font-bold text-zinc-100 truncate max-w-[130px]">
                    {roomData?.name || "ماجراجویی D&D"}
                  </h1>
                  <Badge variant={isGM ? "gm" : "player"} size="sm" className="font-bold">
                    {isGM ? <Crown className="w-3 h-3 ml-0.5 text-amber-400" /> : <User className="w-3 h-3 ml-0.5" />}
                    <span>{mySelfTitle}</span>
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                  <span>کد دعوت:</span>
                  <button
                      type="button"
                      onClick={() => copy(displayCode)}
                      className="flex items-center gap-1 font-mono text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer bg-zinc-950/60 px-1.5 py-0.5 rounded-lg border border-zinc-800"
                      title="کلیک برای کپی کد"
                  >
                    <span>{displayCode}</span>
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* دکمه باز و بسته کردن لیست با شمارنده زنده */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-bold cursor-pointer transition-all shadow-sm"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-amber-400 font-bold">{onlineMembers.length}</span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* پنل کشویی لیست اعضا به سبک دیسکورد */}
        {isOpen && (
            <div className="w-96 max-w-[95vw] bg-zinc-900/95 border border-zinc-800 border-t-0 rounded-b-3xl shadow-2xl backdrop-blur-2xl p-3.5 pt-1 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-1 custom-scrollbar">
                {onlineMembers.length === 0 ? (
                    <div className="text-center py-6 text-zinc-500 text-xs">
                      هیچ کاربری آنلاین نیست
                    </div>
                ) : (
                    <>
                      {/* گروه میزبانان (Hosts) */}
                      {hostMembers.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" />
                        <span>— {hostTitle} ({hostMembers.length}) —</span>
                      </span>
                            </div>
                            {hostMembers.map(renderMemberCard)}
                          </div>
                      )}

                      {/* گروه بازیکنان (Players) */}
                      {playerMembers.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>— {playerTitle} ({playerMembers.length}) —</span>
                      </span>
                            </div>
                            {playerMembers.map(renderMemberCard)}
                          </div>
                      )}
                    </>
                )}
              </div>
            </div>
        )}
      </div>
  );
};