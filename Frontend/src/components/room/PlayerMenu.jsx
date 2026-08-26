import React, { useState } from "react";
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
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useClipboard } from "../../hooks/useClipboard";
import { roomApi } from "../../api/room.api";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";

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

  return (
      <div className="fixed top-4 right-6 z-40 font-fa select-none pointer-events-auto" dir="rtl">
        {/* هدر یکپارچه اتاق و بازیکنان */}
        <div
            className={cn(
                "w-88 max-w-[95vw] bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl transition-all duration-200",
                isOpen ? "rounded-t-3xl border-b-0" : "rounded-3xl"
            )}
        >
          <div className="flex items-center justify-between p-2.5 pl-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black shrink-0">
                <Dices className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs font-bold text-zinc-100 truncate max-w-[130px]">
                    {roomData?.name || "ماجراجویی D&D"}
                  </h1>
                  <Badge variant={isGM ? "gm" : "player"} size="sm">
                    {isGM ? <Crown className="w-3 h-3 ml-0.5" /> : <User className="w-3 h-3 ml-0.5" />}
                    {isGM ? "دانجن‌مستر (GM)" : "بازیکن"}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                  <span>کد دعوت:</span>
                  <button
                      type="button"
                      onClick={() => copy(displayCode)}
                      className="flex items-center gap-1 font-mono text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
                      title="کلیک برای کپی"
                  >
                    <span>{displayCode}</span>
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* دکمه باز/بسته کردن منوی اعضا با شمارنده آنلاین بلادرنگ */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-bold cursor-pointer transition-all"
                title="نمایش/مخفی‌سازی اعضای آنلاین"
            >
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-mono font-bold">
              {onlineMembers.length}
            </span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* لیست کشویی بازشونده متصل به هدر */}
        {isOpen && (
            <div className="w-88 max-w-[95vw] bg-zinc-900/95 border border-zinc-800 border-t-0 rounded-b-3xl shadow-2xl backdrop-blur-2xl p-3 pt-1 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
                {onlineMembers.length === 0 ? (
                    <div className="text-center py-3 text-zinc-500 text-xs">
                      هیچ کاربری آنلاین نیست
                    </div>
                ) : (
                    onlineMembers.map((member) => {
                      const isSelf =
                          member.userId === currentUser?.id ||
                          member.username?.toLowerCase() === currentUser?.username?.toLowerCase();
                      const isMemberGM = member.role === "GM";
                      const isExpanded = expandedMemberId === member.id;
                      const perms = member.permissions || {};

                      return (
                          <div
                              key={member.id || member.userId}
                              className="p-2 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-[11px]">
                                    {member.username ? member.username.slice(0, 2).toUpperCase() : "U"}
                                  </div>
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 border border-zinc-950 absolute -bottom-0.5 -right-0.5 animate-pulse" />
                                </div>

                                <div>
                                  <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-zinc-100 truncate max-w-[110px]">
                                {member.username} {isSelf && "(شما)"}
                              </span>
                                    {member.isMuted && <VolumeX className="w-3 h-3 text-rose-400" />}
                                  </div>
                                  <span className="text-[9px] text-zinc-400">{member.role}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Badge variant={isMemberGM ? "gm" : "player"} size="sm">
                                  {isMemberGM ? <Crown className="w-3 h-3 ml-1" /> : <User className="w-3 h-3 ml-1" />}
                                  {isMemberGM ? "GM" : "Player"}
                                </Badge>

                                {isGM && !isSelf && (
                                    <button
                                        type="button"
                                        onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                                        className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                                    >
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                )}
                              </div>
                            </div>

                            {isGM && !isSelf && isExpanded && (
                                <div className="pt-2 mt-2 border-t border-zinc-900 space-y-2 animate-in fade-in duration-100">
                                  <div className="grid grid-cols-4 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleMute(member.id)}
                                        className={cn(
                                            "p-1 rounded-lg border text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer transition-all",
                                            member.isMuted
                                                ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                                                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                                        )}
                                        title="میوت"
                                    >
                                      {member.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                      <span>{member.isMuted ? "بی‌صدا" : "صدا"}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRoleChange(member.id, member.role)}
                                        className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer"
                                        title="تغییر رول"
                                    >
                                      <Shield className="w-3 h-3" />
                                      <span>{isMemberGM ? "پلیر کن" : "GM کن"}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleKick(member.id)}
                                        className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-rose-400 hover:bg-rose-500/10 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer"
                                        title="کیک از اتاق"
                                    >
                                      <UserX className="w-3 h-3" />
                                      <span>اخراج</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleBan(member.id)}
                                        className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-rose-500 hover:bg-rose-500/15 text-[9px] font-bold flex flex-col items-center gap-1 cursor-pointer"
                                        title="بن دائمی"
                                    >
                                      <Ban className="w-3 h-3" />
                                      <span>مسدود</span>
                                    </button>
                                  </div>

                                  <div className="p-2 bg-zinc-900/80 rounded-xl border border-zinc-800/80 space-y-1">
                            <span className="text-[9px] font-bold text-amber-400 block mb-0.5">
                              دسترسی‌ها (Player Permissions):
                            </span>

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
                                          <div key={p.key} className="flex items-center justify-between text-[10px]">
                                            <span className="text-zinc-300">{p.label}</span>
                                            <button
                                                type="button"
                                                onClick={() => handlePermissionToggle(member.id, p.key, isAllowed)}
                                                className={cn(
                                                    "w-6 h-3.5 rounded-full transition-colors relative cursor-pointer",
                                                    isAllowed ? "bg-amber-500" : "bg-zinc-800"
                                                )}
                                            >
                                              <div
                                                  className={cn(
                                                      "w-2.5 h-2.5 rounded-full bg-white transition-transform absolute top-0.5",
                                                      isAllowed ? "right-0.5" : "right-3"
                                                  )}
                                              />
                                            </button>
                                          </div>
                                      );
                                    })}
                                  </div>
                                </div>
                            )}
                          </div>
                      );
                    })
                )}
              </div>
            </div>
        )}
      </div>
  );
};