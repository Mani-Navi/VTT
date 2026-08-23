import React, { useEffect, useState } from "react";
import { useRooms } from "../../hooks/useRooms";
import { useAuth } from "../../hooks/useAuth";
import { RoomCard } from "../../components/dashboard/RoomCard";
import { CreateRoomModal } from "../../components/dashboard/CreateRoomModal";
import { JoinRoomModal } from "../../components/dashboard/JoinRoomModal";
import { EmptyRooms } from "../../components/dashboard/EmptyRooms";

export const DashboardPage = () => {
  const { rooms, isLoading, error, fetchRooms, createRoom, deleteRoom } = useRooms();
  const { user, logout } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [toastError, setToastError] = useState("");

  // دریافت اولیه داده‌ها
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ریفرش پس‌زمینه با فوکوس پنجره (Owlbear pattern)
  useEffect(() => {
    const handleFocus = () => {
      fetchRooms();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchRooms]);

  const handleCreateRoom = async (data) => {
    try {
      await createRoom(data);
    } catch {
      setToastError("اتاق ساخته نشد — دوباره تلاش کنید");
      setTimeout(() => setToastError(""), 3500);
    }
  };

  const handleDeleteRoom = async (id, roomBackup) => {
    try {
      await deleteRoom(id, roomBackup);
    } catch {
      setToastError("حذف اتاق با خطا مواجه شد");
      setTimeout(() => setToastError(""), 3500);
    }
  };

  return (
      <div className="min-h-screen bg-vtt-bg text-vtt-t1 flex flex-col" dir="rtl">
        {/* Toast پیام خطا */}
        {toastError && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-vtt-danger text-white px-4 py-2 rounded-md shadow-lg text-xs font-medium font-fa animate-bounce">
              {toastError}
            </div>
        )}

        {/* هدر داشبورد */}
        <header className="h-14 border-b border-vtt-border bg-vtt-s1 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-vtt-t1 tracking-wide">VTT Platform</span>
            {user?.username && (
                <span className="text-xs text-vtt-t3">({user.username})</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={() => setIsJoinOpen(true)}
                className="px-3 py-1.5 bg-vtt-s2 hover:bg-vtt-s3 border border-vtt-border text-vtt-t1 rounded-md text-xs font-medium transition-colors"
            >
              ورود با کد
            </button>
            <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="px-3.5 py-1.5 bg-neon text-vtt-bg font-semibold rounded-md text-xs hover:opacity-90 transition-opacity"
            >
              + ایجاد اتاق
            </button>
            <button
                type="button"
                onClick={logout}
                className="text-xs text-vtt-t3 hover:text-vtt-danger transition-colors mr-2"
            >
              خروج
            </button>
          </div>
        </header>

        {/* محتوای اصلی */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-6">
          {/* بنر خطای فچ داده‌ها با دکمه تلاش مجدد */}
          {error && (
              <div className="mb-6 p-3 rounded-md bg-vtt-danger/10 border border-vtt-danger/30 flex items-center justify-between text-xs text-vtt-danger">
                <span>{error}</span>
                <button
                    type="button"
                    onClick={fetchRooms}
                    className="font-bold underline hover:opacity-80"
                >
                  تلاش مجدد
                </button>
              </div>
          )}

          {/* وضعیت‌های بارگذاری و نمایش کارت‌ها */}
          {isLoading && rooms.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                    <div
                        key={n}
                        className="h-36 rounded-md bg-vtt-s1 border border-vtt-border p-4 animate-pulse flex flex-col justify-between"
                    >
                      <div className="h-4 bg-vtt-s2 rounded w-2/3" />
                      <div className="h-3 bg-vtt-s2 rounded w-1/3" />
                      <div className="h-4 bg-vtt-s2 rounded w-full mt-4" />
                    </div>
                ))}
              </div>
          ) : rooms.length === 0 && !isLoading ? (
              <EmptyRooms onCreateClick={() => setIsCreateOpen(true)} />
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* مدال‌ها */}
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