import React, { useState } from "react";
import { Users, Lock, ArrowRight, Copy, Check, Shield, Trash2, Clock } from "lucide-react";
import { Room } from "../../types";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

interface RoomCardProps {
  room: Room;
  onEnter: (room: Room) => void;
  onDelete?: (id: string) => void;
  isOwner?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onEnter, onDelete, isOwner }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(room.createdAt).toLocaleDateString("fa-IR", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      onClick={() => onEnter(room)}
      className="group relative bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-amber-500/5 flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="amber" size="sm">
              <span className="font-mono">{room.code}</span>
            </Badge>
            {room.isLocked && (
              <Badge variant="danger" size="sm">
                <Lock className="w-3 h-3" />
                قفل
              </Badge>
            )}
          </div>

          <button
            onClick={handleCopyCode}
            title="کپی کد اتاق"
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Title & Desc */}
        <h4 className="text-base font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors mb-1.5 font-fa leading-snug">
          {room.name}
        </h4>
        <p className="text-xs text-zinc-400 font-fa line-clamp-2 mb-4 leading-relaxed">
          {room.description || "بدون توضیحات اضافی برای این اتاق بازی."}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            حداکثر {room.maxPlayers} نفر
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isOwner && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(room.id);
              }}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="حذف اتاق"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <Button
            size="sm"
            variant="amber"
            onClick={(e) => {
              e.stopPropagation();
              onEnter(room);
            }}
            className="gap-1 px-3 text-xs"
          >
            ورود
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
