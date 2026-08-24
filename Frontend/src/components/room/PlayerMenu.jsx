import React from "react";
import { Users, X, Crown, User } from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useAuthStore } from "../../store/auth.store";
import { Badge } from "../ui/Badge";

export const PlayerMenu = () => {
  const isPlayerOpen = useCanvasStore((state) => state.isPlayerMenuOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);
  const user = useAuthStore((state) => state.user);

  if (!isPlayerOpen) return null;

  return (
      <div className="fixed top-16 right-6 z-40 w-80 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-zinc-100 font-fa" dir="rtl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">بازیکنان حاضر</h4>
              <p className="text-[11px] text-zinc-400">اعضای متصل به اتاق</p>
            </div>
          </div>
          <button
              type="button"
              onClick={() => toggleMenu("player")}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mt-3 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/50 border border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-xs">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : "U"}
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-100">{user?.username} (شما)</span>
                <p className="text-[10px] text-emerald-400">متصل (Online)</p>
              </div>
            </div>
            <Badge variant="amber" size="sm">
              <Crown className="w-3 h-3 ml-1" /> DM
            </Badge>
          </div>
        </div>
      </div>
  );
};