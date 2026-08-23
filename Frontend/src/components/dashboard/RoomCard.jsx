import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClipboard } from "../../hooks/useClipboard";

export const RoomCard = ({ room, onDelete }) => {
  const navigate = useNavigate();
  const { copy, copied } = useClipboard();
  const [isDeleting, setIsDeleting] = useState(false);

  // محاسبه روزهای مانده تا انقضا
  const getDaysLeft = (expiresAt) => {
    if (!expiresAt) return 30;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = getDaysLeft(room.expires_at);
  const isExpiringSoon = daysLeft <= 3;
  const isOptimistic = !!room.isOptimistic;

  const truncateName = (name) => {
    if (!name) return "";
    return name.length > 28 ? `${name.substring(0, 28)}...` : name;
  };

  return (
      <div
          className={`group relative bg-vtt-s1 border border-vtt-border rounded-md p-4 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-[3px] shadow-md ${
              isOptimistic ? "opacity-60 pointer-events-none" : ""
          }`}
          dir="rtl"
      >
        {isOptimistic && (
            <div className="absolute inset-0 bg-vtt-bg/50 backdrop-blur-xs flex items-center justify-center rounded-md z-10 text-xs text-vtt-t2 font-medium">
              در حال ساخت...
            </div>
        )}

        <div>
          {/* هدر کارت: عنوان و نقش */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
                className="text-sm font-semibold text-vtt-t1 font-fa title-clamp"
                title={room.name}
            >
              {truncateName(room.name)}
            </h3>

            <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    room.role === "GM"
                        ? "bg-purple-950/80 text-purple-300 border border-purple-800/50"
                        : "bg-vtt-s3 text-vtt-t3"
                }`}
            >
            {room.role === "GM" ? "GM" : "Player"}
          </span>
          </div>

          {/* کد اتاق و وضعیت */}
          <div className="flex items-center gap-2 mb-3">
            <button
                type="button"
                onClick={() => copy(room.code)}
                className="text-xs font-mono bg-vtt-s2 hover:bg-vtt-s3 text-vtt-t2 px-2 py-1 rounded-sm border border-vtt-border transition-colors flex items-center gap-1.5"
                title="کلیک برای کپی کد"
            >
              <span>{copied ? "کپی شد ✓" : room.code}</span>
            </button>

            <span className="flex items-center gap-1 text-[11px] text-vtt-t3">
            <span
                className={`w-2 h-2 rounded-full ${
                    room.is_active ? "bg-vtt-success" : "bg-vtt-t3"
                }`}
            />
              {room.is_active ? "فعال" : "غیرفعال"}
          </span>
          </div>
        </div>

        {/* فوتر کارت و اکشن‌ها */}
        <div className="pt-3 border-t border-vtt-border flex items-center justify-between text-xs text-vtt-t3">
          <div className="flex items-center gap-3">
            <span>{room.player_count || 1} بازیکن</span>

            <span
                className={
                  isExpiringSoon
                      ? "text-vtt-warning font-medium flex items-center gap-1"
                      : ""
                }
            >
            {isExpiringSoon ? `⚠ منقضی در ${daysLeft} روز` : `${daysLeft} روز مانده`}
          </span>
          </div>

          {/* اکشن‌های دکمه ورود / حذف درون‌خطی */}
          {!isOptimistic && (
              <div className="flex items-center gap-1.5">
                {isDeleting ? (
                    <div className="flex items-center gap-1 bg-vtt-s2 px-2 py-1 rounded-sm border border-vtt-border">
                      <span className="text-[11px] text-vtt-danger">حذف؟</span>
                      <button
                          type="button"
                          onClick={() => onDelete(room.id, room)}
                          className="text-[11px] font-bold text-vtt-danger hover:underline px-1"
                      >
                        بله
                      </button>
                      <button
                          type="button"
                          onClick={() => setIsDeleting(false)}
                          className="text-[11px] text-vtt-t3 hover:text-vtt-t1 px-1"
                      >
                        خیر
                      </button>
                    </div>
                ) : (
                    <>
                      <button
                          type="button"
                          onClick={() => setIsDeleting(true)}
                          className="p-1 text-vtt-t3 hover:text-vtt-danger transition-colors text-xs"
                          title="حذف اتاق"
                      >
                        حذف
                      </button>
                      <button
                          type="button"
                          onClick={() => navigate(`/room/${room.id}`)}
                          className="px-3 py-1 bg-neon text-vtt-bg font-semibold rounded-sm hover:opacity-90 transition-opacity text-xs"
                      >
                        ورود
                      </button>
                    </>
                )}
              </div>
          )}
        </div>
      </div>
  );
};