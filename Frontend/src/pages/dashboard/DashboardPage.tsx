import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogIn, Dices, Crown, User, Sparkles, LogOut, Compass, Swords, Shield } from "lucide-react";
import { useRoomStore } from "../../store/room.store";
import { useAuthStore } from "../../store/auth.store";
import { RoomCard } from "../../components/dashboard/RoomCard";
import { CreateRoomModal } from "../../components/dashboard/CreateRoomModal";
import { JoinRoomModal } from "../../components/dashboard/JoinRoomModal";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const rooms = useRoomStore((state) => state.rooms);
  const fetchMyRooms = useRoomStore((state) => state.fetchMyRooms);
  const deleteRoom = useRoomStore((state) => state.deleteRoom);
  const isLoading = useRoomStore((state) => state.isLoading);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  useEffect(() => {
    fetchMyRooms();
  }, [fetchMyRooms]);

  const handleEnterRoom = (room: any) => {
    const roomId = typeof room === "string" ? room : room.id;
    navigate(`/room/${roomId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Dices className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-100 font-fa">میز بازی مجازی VTT</h1>
            <p className="text-[11px] text-zinc-400 font-fa">Virtual Tabletop Platform</p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl">
            <img
              src={user?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=GM1"}
              alt={user?.displayName}
              className="w-7 h-7 rounded-full bg-zinc-800"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-zinc-200 font-fa">{user?.displayName}</p>
              <p className="text-[10px] text-amber-400 font-mono">{user?.role || "GM"}</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-rose-400 hover:text-rose-300">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline mr-1">خروج</span>
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-blue-500/10 border border-zinc-800 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <Badge variant="amber" size="md">
              <Sparkles className="w-3.5 h-3.5" />
              آماده برای جلسه بازی بعدی
            </Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100 font-fa tracking-tight">
              داشبورد اتاق‌های بازی و ماجراجویی
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 font-fa leading-relaxed">
              نقشه‌های نبرد تاکتیکال خود را بارگذاری کنید، مه تاریکی (Fog of War) را کنترل کنید، تاس
              بریزید و با بازیکنان خود همگام شوید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="md" onClick={() => setIsJoinOpen(true)}>
              <LogIn className="w-4 h-4 ml-1.5" />
              ورود با کد دعوت
            </Button>

            <Button variant="amber" size="md" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 ml-1.5" />
              ساخت اتاق جدید (GM)
            </Button>
          </div>
        </div>

        {/* Rooms Grid Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-zinc-100 font-fa">اتاق‌های شما ({rooms.length})</h3>
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-16 px-4 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                <Dices className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-300 font-fa">هنوز اتاقی ایجاد نکرده‌اید</h4>
              <p className="text-xs text-zinc-500 font-fa max-w-sm mx-auto">
                برای شروع یک بازی جدید به عنوان دانجن‌مستر دکمه ساخت اتاق را بزنید یا با کد دعوت وارد
                اتاق دوستان شوید.
              </p>
              <Button variant="amber" size="sm" onClick={() => setIsCreateOpen(true)} className="mt-2">
                <Plus className="w-4 h-4 ml-1" />
                ساخت اولین اتاق بازی
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEnter={handleEnterRoom}
                  onDelete={(id) => deleteRoom(id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(room) => navigate(`/room/${room.id}`)}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={(room) => navigate(`/room/${room.id}`)}
      />
    </div>
  );
};
