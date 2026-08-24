import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRooms } from "../../hooks/useRooms";
import { useAuth } from "../../hooks/useAuth";
import { RoomCard } from "../../components/dashboard/RoomCard";
import { CreateRoomModal } from "../../components/dashboard/CreateRoomModal";
import { JoinRoomModal } from "../../components/dashboard/JoinRoomModal";
import { EmptyRooms } from "../../components/dashboard/EmptyRooms";
import { RpgAvatar } from "../../components/profile/RpgAvatar";
import { Button } from "../../components/ui/Button.jsx";
import {
  Dices,
  Plus,
  KeyRound,
  LogOut,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { rooms, isLoading, error, fetchRooms, createRoom, deleteRoom } = useRooms();
  const { user, logout } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [toastError, setToastError] = useState("");

  // دریافت اولیه اتاق‌ها هنگام لود صفحه
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // به‌روزرسانی هوشمند لیست اتاق‌ها هنگام فوکوس مجدد مرورگر
  useEffect(() => {
    const handleFocus = () => fetchRooms();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchRooms]);

  const handleCreateRoom = async (data) => {
    try {
      await createRoom(data);
    } catch {
      setToastError("اتاق ساخته نشد — لطفاً دوباره تلاش کنید");
      setTimeout(() => setToastError(""), 3500);
    }
  };

  const handleDeleteRoom = async (id, roomBackup) => {
    try {
      await deleteRoom(id, roomBackup);
    } catch {
      setToastError("خطا در حذف اتاق");
      setTimeout(() => setToastError(""), 3500);
    }
  };

  return (
      <div className="h-screen w-full bg-[#090a0f] text-zinc-100 flex flex-col font-fa select-none overflow-y-auto" dir="rtl">
        {/* نوتیفیکیشن خطا (Toast) */}
        {toastError && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-rose-600/95 backdrop-blur-md text-white px-5 py-2.5 rounded-xl shadow-2xl text-xs font-semibold border border-rose-500/40 flex items-center gap-2 animate-bounce">
              <AlertCircle className="w-4 h-4" />
              {toastError}
            </div>
        )}

        {/* هدر بالایی داشبورد */}
        <header className="h-16 shrink-0 border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-zinc-100 tracking-wide">میز بازی Titipool</h1>
              {user?.username && (
                  <p className="text-[11px] text-zinc-400">
                    خوش آمدید،{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="text-amber-400 font-semibold hover:underline cursor-pointer"
                    >
                      {user.username}
                    </button>
                  </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsJoinOpen(true)}
                className="text-xs gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              ورود با کد
            </Button>

            <Button
                type="button"
                variant="amber"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="text-xs font-bold gap-1.5 shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              ایجاد اتاق جدید
            </Button>

            <div className="h-5 w-px bg-zinc-800 mx-1" />

            {/* آواتار کاربر متصل به روت /profile */}
            <button
                type="button"
                onClick={() => navigate("/profile")}
                className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/80 overflow-hidden flex items-center justify-center hover:border-amber-500/60 hover:scale-105 transition-all cursor-pointer p-0.5"
                title="مشاهده و ویرایش پروفایل"
            >
              <RpgAvatar avatarId={user?.avatarUrl || "cowboy"} className="w-full h-full" />
            </button>

            <button
                type="button"
                onClick={logout}
                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="خروج از حساب"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* محتوای اصلی داشبورد */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
          {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-400">
                <span>{error}</span>
                <button
                    type="button"
                    onClick={fetchRooms}
                    className="flex items-center gap-1.5 font-bold hover:underline text-rose-300 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  تلاش مجدد
                </button>
              </div>
          )}

          {isLoading && rooms.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                    <div
                        key={n}
                        className="h-44 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 animate-pulse flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="h-4 bg-zinc-800 rounded-md w-2/3" />
                        <div className="h-3 bg-zinc-800 rounded-md w-1/3" />
                      </div>
                      <div className="h-4 bg-zinc-800 rounded-md w-full" />
                    </div>
                ))}
              </div>
          ) : rooms.length === 0 && !isLoading ? (
              <EmptyRooms onCreateClick={() => setIsCreateOpen(true)} />
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rooms.map((room) => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        onDelete={handleDeleteRoom}
                    />
                ))}
              </div>
          )}
        </main>

        {/* مدال‌های ساخت اتاق و ملحق شدن */}
        <CreateRoomModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreate={handleCreateRoom}
        />
        <JoinRoomModal
            isOpen={isJoinOpen}
            onClose={() => setIsJoinOpen(false)}
        />
      </div>
  );
};