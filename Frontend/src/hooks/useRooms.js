import { useCallback } from "react";
import { useRoomStore } from "../store/room.store";
import { roomApi } from "../api/room.api";

export function useRooms() {
  const rooms = useRoomStore((state) => state.rooms);
  const isLoading = useRoomStore((state) => state.isLoading);
  const error = useRoomStore((state) => state.error);
  const setRooms = useRoomStore((state) => state.setRooms);
  const addRoom = useRoomStore((state) => state.addRoom);
  const removeRoom = useRoomStore((state) => state.removeRoom);
  const setLoading = useRoomStore((state) => state.setLoading);
  const setError = useRoomStore((state) => state.setError);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roomApi.getRooms();
      setRooms(data);
      setLoading(false);
    } catch {
      setError("خطا در بارگذاری اتاق‌ها");
    }
  }, [setRooms, setLoading, setError]);

  // Optimistic Create Room
  const createRoom = async (roomData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticRoom = {
      id: tempId,
      name: roomData.name,
      code: "......",
      player_count: 1,
      role: "GM",
      is_active: true,
      expires_at: new Date(Date.now() + (roomData.expire_days || 30) * 86400000).toISOString(),
      isOptimistic: true,
    };

    addRoom(optimisticRoom);

    try {
      const realRoom = await roomApi.createRoom(roomData);
      removeRoom(tempId);
      addRoom(realRoom);
      return realRoom;
    } catch (err) {
      removeRoom(tempId);
      throw err;
    }
  };

  // Optimistic Delete Room
  const deleteRoom = async (id, roomBackup) => {
    removeRoom(id);
    try {
      await roomApi.deleteRoom(id);
    } catch (err) {
      if (roomBackup) addRoom(roomBackup);
      throw err;
    }
  };

  return {
    rooms,
    isLoading,
    error,
    fetchRooms,
    createRoom,
    deleteRoom,
  };
}