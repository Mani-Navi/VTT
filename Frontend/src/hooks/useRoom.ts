import { useCallback } from "react";
import { useRoomStore } from "../store/room.store";
import { useSceneStore } from "../store/scene.store";
import { useAuthStore } from "../store/auth.store";

export function useRoom() {
  const currentRoom = useRoomStore((state) => state.currentRoom);
  const players = useRoomStore((state) => state.players);
  const isLoading = useRoomStore((state) => state.isLoading);
  const error = useRoomStore((state) => state.error);
  const fetchRoomByCode = useRoomStore((state) => state.fetchRoomByCode);
  const createRoom = useRoomStore((state) => state.createRoom);
  const addPlayer = useRoomStore((state) => state.addPlayer);
  const removePlayer = useRoomStore((state) => state.removePlayer);
  const updatePlayer = useRoomStore((state) => state.updatePlayer);
  const leaveRoom = useRoomStore((state) => state.leaveRoom);

  const loadScenes = useSceneStore((state) => state.loadScenes);
  const user = useAuthStore((state) => state.user);

  const joinRoomByCode = useCallback(
    async (code: string) => {
      const room = await fetchRoomByCode(code);
      if (room) {
        await loadScenes(room.id);
        if (user) {
          addPlayer({
            id: `p-${user.id}`,
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            role: user.role,
            avatarUrl: user.avatarUrl,
            color: user.role === "GM" ? "#3b82f6" : "#10b981",
            isOnline: true,
            ping: 25,
          });
        }
      }
      return room;
    },
    [fetchRoomByCode, loadScenes, user, addPlayer]
  );

  return {
    currentRoom,
    players,
    isLoading,
    error,
    createRoom,
    joinRoomByCode,
    addPlayer,
    removePlayer,
    updatePlayer,
    leaveRoom,
  };
}
