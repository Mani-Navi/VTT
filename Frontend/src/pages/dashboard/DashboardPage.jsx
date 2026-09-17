import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRooms } from "../../hooks/useRooms";
import { useAuth } from "../../hooks/useAuth";
import { RoomCard } from "../../components/dashboard/RoomCard";
import { CreateRoomModal } from "../../components/dashboard/CreateRoomModal";
import { JoinRoomModal } from "../../components/dashboard/JoinRoomModal";
import { DeleteRoomModal } from "../../components/dashboard/DeleteRoomModal";
import { EditRoomModal } from "../../components/dashboard/EditRoomModal";
import { LeaveRoomModal } from "../../components/dashboard/LeaveRoomModal";
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
  Search,
  Crown,
  Swords,
} from "lucide-react";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, isLoading, error, fetchRooms, createRoom, updateRoom, deleteRoom, leaveRoom } = useRooms();
  const { user, logout } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [roomToEdit, setRoomToEdit] = useState(null);
  const [roomToLeave, setRoomToLeave] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastError, setToastError] = useState("");

  useEffect(() => {
    const inviteCode = searchParams.get("join");
    if (inviteCode) {
      setIsJoinOpen(true);
      searchParams.delete("join");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (
          activeEl &&
          (activeEl.tagName === "INPUT" ||
              activeEl.tagName === "TEXTAREA" ||
              activeEl.tagName === "SELECT" ||
              activeEl.isContentEditable)
      ) {
        return;
      }

      if (e.key === "n" || e.key === "N" || e.key === "د") {
        e.preventDefault();
        setIsCreateOpen(true);
      } else if (e.key === "j" || e.key === "J" || e.key === "ت") {
        e.preventDefault();
        setIsJoinOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const handleFocus = () => fetchRooms();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchRooms]);

  const handleCreateRoom = async (data) => {
    await createRoom(data);
  };

  const handleUpdateRoom = async (id, data) => {
    await updateRoom(id, data);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    setIsActionLoading(true);
    try {
      await deleteRoom(roomToDelete.id, roomToDelete);
      setRoomToDelete(null);
    } catch {
      setToastError("خطا در حذف اتاق");
      setTimeout(() => setToastError(""), 3500);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmLeave = async () => {
    if (!roomToLeave) return;
    setIsActionLoading(true);
    try {
      await leaveRoom(roomToLeave.id, roomToLeave);
      setRoomToLeave(null);
    } catch {
      setToastError("خطا در خروج از اتاق");
      setTimeout(() => setToastError(""), 3500);
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const query = searchQuery.trim().toLowerCase();
    return rooms.filter(
        (r) =>
            r.name?.toLowerCase().includes(query) ||
            r.code?.toLowerCase().includes(query) ||
            r.description?.toLowerCase().includes(query)
    );
  }, [rooms, searchQuery]);

  const myCreatedAdventures = useMemo(
      () => filteredRooms.filter((r) => r.role === "GM"),
      [filteredRooms]
  );
  const myJoinedAdventures = useMemo(
      () => filteredRooms.filter((r) => r.role !== "GM"),
      [filteredRooms]
  );

  return (
      <div className="h-screen w-full bg-[#090a0f] text-zinc-100 flex flex-col font-fa select-none overflow-y-auto" dir="rtl">
        {toastError && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-rose-600/95 backdrop-blur-md text-white px-5 py-2.5 rounded-xl shadow-2xl text-xs font-semibold border border-rose-500/40 flex items-center gap-2 animate-bounce">
              <AlertCircle className="w-4 h-4" />
              {toastError}
            </div>
        )}

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
                title="میانبر: کلید J"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              ورود با کد
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded border border-zinc-700">J</kbd>
            </Button>

            <Button
                type="button"
                variant="amber"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="text-xs font-bold gap-1.5 shadow-lg shadow-amber-500/10"
                title="میانبر: کلید N"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              ایجاد ماجرا
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-amber-600/30 text-amber-200 rounded border border-amber-400/40">N</kbd>
            </Button>

            <div className="h-5 w-px bg-zinc-800 mx-1" />

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

        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
          {rooms.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-2xl">
                <div className="relative w-full sm:w-80">
                  <input
                      type="text"
                      placeholder="جستجو در بین تمامی اتاق‌ها..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3.5 py-2 pl-9 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span>
                مجموع اتاق‌ها: <strong className="text-zinc-200">{rooms.length}</strong>
              </span>
                  <span className="h-3 w-px bg-zinc-700" />
                  <span>
                ماجراهای من: <strong className="text-amber-400">{rooms.filter((r) => r.role === "GM").length}</strong>
              </span>
                  <span className="h-3 w-px bg-zinc-700" />
                  <span>
                ماجراجویی‌های من: <strong className="text-blue-400">{rooms.filter((r) => r.role !== "GM").length}</strong>
              </span>
                </div>
              </div>
          )}

          {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-400">
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
              <div className="space-y-8">
                {myCreatedAdventures.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <h2 className="text-sm font-bold text-zinc-100">ماجراهای من</h2>
                        <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                    {myCreatedAdventures.length}
                  </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {myCreatedAdventures.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                onRequestEdit={(r) => setRoomToEdit(r)}
                                onRequestDelete={(r) => setRoomToDelete(r)}
                            />
                        ))}
                      </div>
                    </section>
                )}

                {myJoinedAdventures.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                        <Swords className="w-4 h-4 text-blue-400" />
                        <h2 className="text-sm font-bold text-zinc-100">ماجراجویی‌های من</h2>
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                    {myJoinedAdventures.length}
                  </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {myJoinedAdventures.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                onRequestLeave={(r) => setRoomToLeave(r)}
                            />
                        ))}
                      </div>
                    </section>
                )}

                {filteredRooms.length === 0 && searchQuery.trim() && (
                    <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center text-zinc-400 space-y-2">
                      <p className="text-sm">اتاقی با عبارت «{searchQuery}» پیدا نشد.</p>
                      <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="text-xs text-amber-400 hover:underline cursor-pointer"
                      >
                        پاک کردن جستجو
                      </button>
                    </div>
                )}
              </div>
          )}
        </main>

        <CreateRoomModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreate={handleCreateRoom}
        />
        <JoinRoomModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
        <EditRoomModal
            isOpen={!!roomToEdit}
            onClose={() => setRoomToEdit(null)}
            onUpdate={handleUpdateRoom}
            room={roomToEdit}
        />
        <DeleteRoomModal
            isOpen={!!roomToDelete}
            onClose={() => setRoomToDelete(null)}
            onConfirm={handleConfirmDelete}
            room={roomToDelete}
            isLoading={isActionLoading}
        />
        <LeaveRoomModal
            isOpen={!!roomToLeave}
            onClose={() => setRoomToLeave(null)}
            onConfirm={handleConfirmLeave}
            room={roomToLeave}
            isLoading={isActionLoading}
        />
      </div>
  );
};