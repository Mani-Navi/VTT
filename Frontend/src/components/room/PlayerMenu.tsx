import React from "react";
import { Users, X, Crown, User, Shield, Volume2, Radio, UserCheck } from "lucide-react";
import { useRoomStore } from "../../store/room.store";
import { useAuthStore } from "../../store/auth.store";
import { useCanvasStore } from "../../store/canvas.store";
import { usePermissions } from "../../hooks/usePermissions";
import { ROLES, UserRole } from "../../constants/permissions";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const PlayerMenu: React.FC = () => {
  const isPlayerOpen = useCanvasStore((state) => state.isPlayerMenuOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const players = useRoomStore((state) => state.players);
  const user = useAuthStore((state) => state.user);
  const setRole = useAuthStore((state) => state.setRole);
  const { isGM } = usePermissions();

  if (!isPlayerOpen) return null;

  return (
    <div className="fixed top-16 right-6 z-40 w-80 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-zinc-100 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">بازیکنان متصل ({players.length})</h4>
            <p className="text-[11px] text-zinc-400 font-fa">اعضای حاضر در این اتاق</p>
          </div>
        </div>
        <button
          onClick={() => toggleMenu("player")}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role Switcher for Testing / Live Switch */}
      <div className="my-3 p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-850">
        <div className="text-[11px] text-zinc-400 font-fa mb-1.5 flex items-center justify-between">
          <span>نقش شما در این جلسه:</span>
          <Badge variant={user?.role === ROLES.GM ? "gm" : "player"}>
            {user?.role === ROLES.GM ? "دانجن مستر (GM)" : "بازیکن (Player)"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRole(ROLES.GM)}
            className={`flex-1 py-1 text-xs rounded-lg font-medium transition-all ${
              user?.role === ROLES.GM
                ? "bg-amber-500 text-zinc-950 font-bold"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            تغییر به GM
          </button>
          <button
            onClick={() => setRole(ROLES.PLAYER)}
            className={`flex-1 py-1 text-xs rounded-lg font-medium transition-all ${
              user?.role === ROLES.PLAYER
                ? "bg-blue-600 text-white font-bold"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            تغییر به Player
          </button>
        </div>
      </div>

      {/* Player List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {players.map((p) => {
          const isMe = p.userId === user?.id;
          return (
            <div
              key={p.id}
              className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/50 border border-zinc-850 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={p.avatarUrl}
                    alt={p.displayName}
                    className="w-8 h-8 rounded-full border-2 border-zinc-700 bg-zinc-800"
                  />
                  {p.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-100 font-fa">
                      {p.displayName}
                    </span>
                    {isMe && <span className="text-[10px] text-amber-400 font-mono">(شما)</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <span>{p.role === ROLES.GM ? "Dungeon Master" : "Player"}</span>
                    {p.ping && <span>• {p.ping}ms</span>}
                  </div>
                </div>
              </div>

              <div>
                {p.role === ROLES.GM ? (
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
