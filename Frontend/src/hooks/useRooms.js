import { useCallback } from "react";
import { useRoomStore } from "../store/room.store";
import { roomApi } from "../api/room.api";

export function useRooms() {
  const rooms = useRoomStore((state) => state.rooms);
  const isLoading = useRoomStore((state) => state.isLoading);
  const error = useRoomStore((state) => state.error);
  const setRooms = useRoomStore((state) => state.setRooms);
  const addRoom = useRoomStore((state) => state.addRoom);
  const updateRoomInStore = useRoomStore((state) => state.updateRoomInStore);
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

  const createRoom = useCallback(
      async (roomData) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticRoom = {
          id: tempId,
          name: roomData.name,
          description: roomData.description,
          code: "......",
          player_count: 1,
          role: "GM",
          type: roomData.templateId ? "OFFICIAL" : "STANDARD",
          isProtected: !!roomData.password,
          is_active: true,
          expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
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
      },
      [addRoom, removeRoom]
  );

  const updateRoom = useCallback(
      async (id, payload) => {
        const updated = await roomApi.updateRoom(id, payload);
        if (updateRoomInStore) {
          updateRoomInStore(updated);
        }
        return updated;
      },
      [updateRoomInStore]
  );

  const deleteRoom = useCallback(
      async (id, roomBackup) => {
        removeRoom(id);
        try {
          await roomApi.deleteRoom(id);
        } catch (err) {
          if (roomBackup) addRoom(roomBackup);
          throw err;
        }
      },
      [removeRoom, addRoom]
  );

  const leaveRoom = useCallback(
      async (id, roomBackup) => {
        removeRoom(id);
        try {
          await roomApi.leaveRoom(id);
        } catch (err) {
          if (roomBackup) addRoom(roomBackup);
          throw err;
        }
      },
      [removeRoom, addRoom]
  );

  return {
    rooms,
    isLoading,
    error,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    leaveRoom,
  };
}