import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClipboard } from "../../hooks/useClipboard";
import { Users, Clock, Copy, Check, Trash2, ArrowRight, AlertTriangle } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const RoomCard = ({ room, onDelete }) => {
  const navigate = useNavigate();
  const { copy, copied } = useClipboard();
  const [isDeleting, setIsDeleting] = useState(false);

  const getDaysLeft = (expiresAt) => {
    if (!expiresAt) return 30;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = getDaysLeft(room.expires_at || room.expiresAt);
  const isExpiringSoon = daysLeft <= 3;
  const isOptimistic = !!room.isOptimistic;

  const truncateName = (name) => {
    if (!name) return "";
    return name.length > 28 ? `${name.substring(0, 28)}...` : name;
  };

  return (
      <div
          className={`group relative bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 ${
              isOptimistic ? "opacity-60 pointer-events-none" : ""
          }`}
          dir="rtl"
      >
        {isOptimistic && (
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center rounded-2xl z-20">
              <Badge variant="amber" size="md">
                <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin ml-1" />
                در حال ساخت اتاق...
              </Badge>
            </div>
        )}

        <div>
          {/* هدر: عنوان و نشانگر نقش */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3
                className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors leading-snug"
                title={room.name}
            >
              {truncateName(room.name)}
            </h3>

            <Badge variant={room.role === "GM" ? "gm" : "player"}>
              {room.role === "GM" ? "دانجن‌مستر (GM)" : "بازیکن"}
            </Badge>
          </div>

          {/* کد اتاق و وضعیت فعال بودن */}
          <div className="flex items-center gap-2 mb-4">
            <button
                type="button"
                onClick={() => copy(room.code)}
                className="group/code text-xs font-mono bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 px-2.5 py-1 rounded-lg border border-zinc-700/60 transition-all flex items-center gap-2"
                title="کلیک برای کپی کد"
            >
              <span className="tracking-widest font-bold">{room.code}</span>
              {copied ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-fa">
                <Check className="w-3.5 h-3.5" /> کپی شد
              </span>
              ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover/code:text-amber-400" />
              )}
            </button>

            <span className="flex items-center gap-1.5 text-xs text-zinc-400 mr-auto">
            <span className={`w-2 h-2 rounded-full ${room.is_active || room.isActive ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-zinc-600"}`} />
              {room.is_active || room.isActive ? "فعال" : "غیرفعال"}
          </span>
          </div>
        </div>

        {/* فوتر: آمار و اکشن‌ها */}
        <div className="pt-3.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            {room.player_count || room.playerCount || 1} بازیکن
          </span>

            <span className={`flex items-center gap-1 ${isExpiringSoon ? "text-amber-400 font-semibold" : "text-zinc-500"}`}>
            {isExpiringSoon ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <Clock className="w-3.5 h-3.5" />}
              {isExpiringSoon ? `منقضی در ${daysLeft} روز` : `${daysLeft} روز اعتبار`}
          </span>
          </div>

          {/* دکمه‌های ورود و حذف درون‌خطی */}
          {!isOptimistic && (
              <div className="flex items-center gap-2">
                {isDeleting ? (
                    <div className="flex items-center gap-1.5 bg-zinc-800 px-2 py-1 rounded-lg border border-rose-500/30">
                      <span className="text-[11px] text-rose-400 font-medium">حذف؟</span>
                      <button
                          type="button"
                          onClick={() => onDelete(room.id, room)}
                          className="text-[11px] font-bold text-rose-400 hover:text-rose-300 px-1"
                      >
                        بله
                      </button>
                      <button
                          type="button"
                          onClick={() => setIsDeleting(false)}
                          className="text-[11px] text-zinc-400 hover:text-zinc-200 px-1"
                      >
                        خیر
                      </button>
                    </div>
                ) : (
                    <>
                      <button
                          type="button"
                          onClick={() => setIsDeleting(true)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="حذف اتاق"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Button
                          size="sm"
                          variant="amber"
                          onClick={() => navigate(`/room/${room.id}`)}
                          className="px-3 text-xs gap-1 font-bold"
                      >
                        ورود
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </>
                )}
              </div>
          )}
        </div>
      </div>
  );
};