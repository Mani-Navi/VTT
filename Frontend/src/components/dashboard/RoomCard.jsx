import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClipboard } from "../../hooks/useClipboard";
import { Users, Clock, Copy, Check, Trash2, ArrowRight, Lock, Scroll, Crown, Swords, Link2 } from "lucide-react";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";

export const RoomCard = ({ room, onRequestDelete }) => {
  const navigate = useNavigate();
  const { copy, copied } = useClipboard();
  const [linkCopied, setLinkCopied] = useState(false);

  const getDaysLeft = (expiresAt) => {
    if (!expiresAt) return 30;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = getDaysLeft(room.expires_at || room.expiresAt);
  const isOptimistic = !!room.isOptimistic;
  const isGM = room.role === "GM";

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/room/${room.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
      <div
          className={`group relative bg-gradient-to-b from-zinc-900/95 via-zinc-900/80 to-zinc-950/90 border border-zinc-800/90 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10 backdrop-blur-sm ${
              isOptimistic ? "opacity-60 pointer-events-none" : ""
          }`}
          dir="rtl"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {isOptimistic && (
            <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center rounded-2xl z-20">
              <Badge variant="amber" size="md">
                <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin ml-1.5" />
                در حال ساخت اتاق در سرور...
              </Badge>
            </div>
        )}

        <div>
          {/* هدر کارت: عنوان + برچسب GM / Player */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h3
                    className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors truncate"
                    title={room.name}
                >
                  {room.name}
                </h3>
                {room.isProtected && (
                    <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 shrink-0" title="اتاق دارای رمز عبور است">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                )}
                {room.type === "OFFICIAL" && (
                    <span className="p-1 rounded-md bg-amber-500/10 text-amber-500 shrink-0" title="قالب و سناریوی آماده Titipool">
                  <Scroll className="w-3.5 h-3.5" />
                </span>
                )}
              </div>

              {/* توضیحات سناریو */}
              {room.description ? (
                  <p
                      className="text-xs text-zinc-400 leading-relaxed line-clamp-2 group-hover:text-zinc-300 transition-colors"
                      title={room.description}
                  >
                    {room.description}
                  </p>
              ) : (
                  <p className="text-xs text-zinc-600 italic">بدون توضیحات</p>
              )}
            </div>

            <Badge variant={isGM ? "gm" : "player"} className="shrink-0 font-semibold gap-1">
              {isGM ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <Swords className="w-3.5 h-3.5 text-blue-400" />}
              {isGM ? "دانجن‌مستر" : "بازیکن"}
            </Badge>
          </div>

          {/* کد دعوت و کپی لینک مستقیم */}
          <div className="flex items-center gap-2 my-3.5">
            <button
                type="button"
                onClick={() => copy(room.code)}
                className="group/code text-xs font-mono bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 px-2.5 py-1.5 rounded-xl border border-zinc-700/60 hover:border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-inner"
                title="کلیک برای کپی کد دعوت ۶ حرفی"
            >
              <span className="tracking-widest font-bold">{room.code}</span>
              {copied ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-fa font-bold">
                <Check className="w-3.5 h-3.5" /> کپی شد
              </span>
              ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover/code:text-amber-400" />
              )}
            </button>

            {/* دکمه کپی لینک مستقیم */}
            <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-700/60 transition-all cursor-pointer flex items-center gap-1 text-xs"
                title="کپی لینک مستقیم دعوت"
            >
              {linkCopied ? (
                  <span className="text-emerald-400 text-[11px] font-fa flex items-center gap-1 px-1">
                <Check className="w-3.5 h-3.5" /> لینک کپی شد
              </span>
              ) : (
                  <Link2 className="w-3.5 h-3.5" />
              )}
            </button>

            <span className="flex items-center gap-1.5 text-xs text-zinc-400 mr-auto bg-zinc-900/60 px-2 py-1 rounded-lg border border-zinc-800">
            <span
                className={`w-2 h-2 rounded-full ${
                    room.is_active || room.isActive
                        ? "bg-emerald-500 shadow-sm shadow-emerald-500/80 animate-pulse"
                        : "bg-zinc-600"
                }`}
            />
              {room.is_active || room.isActive ? "فعال" : "غیرفعال"}
          </span>
          </div>
        </div>

        {/* فوتر: تعداد بازیکنان، روزهای مانده و دکمه ورود */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-zinc-400 font-medium">
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            {room.player_count || room.playerCount || 1} بازیکن
          </span>

            <span className="flex items-center gap-1 text-zinc-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {`${daysLeft} روز`}
          </span>
          </div>

          <div className="flex items-center gap-2">
            {isGM && (
                <button
                    type="button"
                    onClick={() => onRequestDelete(room)}
                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                    title="حذف اتاق"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
            )}
            <Button
                size="sm"
                variant="amber"
                onClick={() => navigate(`/room/${room.id}`)}
                className="px-3.5 py-1.5 text-xs gap-1.5 font-bold shadow-md shadow-amber-500/10 hover:shadow-amber-500/20"
            >
              ورود به بازی
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
  );
};