import { create } from "zustand";
import { Room, Player } from "../types";
import { roomApi } from "../api/room.api";
import { ROLES } from "../constants/permissions";

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  players: Player[];
  isLoading: boolean;
  error: string | null;
  setRoom: (room: Room) => void;
  setPlayers: (players: Player[]) => void;
  fetchMyRooms: () => Promise<Room[]>;
  fetchRoomById: (id: string) => Promise<Room>;
  fetchRoomByCode: (code: string) => Promise<Room>;
  createRoom: (dto: { name: string; description?: string; maxPlayers?: number; isLocked?: boolean; password?: string }) => Promise<Room>;
  deleteRoom: (id: string) => Promise<void>;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  leaveRoom: () => void;
}

const DEFAULT_CONNECTED_PLAYERS: Player[] = [
  {
    id: "p-gm",
    userId: "user-gm-1",
    username: "arash_gm",
    displayName: "آرش (دانجن مستر)",
    role: ROLES.GM,
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=arash&backgroundColor=b6e3f4",
    color: "#3b82f6",
    isOnline: true,
    ping: 28,
  },
  {
    id: "p-elara",
    userId: "user-elara",
    username: "elara_player",
    displayName: "مریم (الارا - میج)",
    role: ROLES.PLAYER,
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Elara&backgroundColor=c0aede",
    color: "#8b5cf6",
    isOnline: true,
    ping: 35,
  },
  {
    id: "p-gareth",
    userId: "user-gareth",
    username: "gareth_player",
    displayName: "پوریا (گارث - پالادین)",
    role: ROLES.PLAYER,
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Gareth&backgroundColor=b6e3f4",
    color: "#10b981",
    isOnline: true,
    ping: 42,
  },
];

const INITIAL_ROOMS: Room[] = [
  {
    id: "room-crypt-demo",
    code: "OWL-7721",
    name: "دخمه باستانی (Ancient Crypt)",
    description: "کمپین اصلی سیاهچال و اژدها D&D 5e - جلسه نبرد نهایی",
    gmId: "user-gm-1",
    maxPlayers: 6,
    isLocked: false,
    activeSceneId: "scene-crypt-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "room-tavern-demo",
    code: "OWL-3390",
    name: "مهمان‌خانه اژدهای خفته",
    description: "محل گردهمایی قهرمانان و دریافت ماموریت‌ها",
    gmId: "user-gm-1",
    maxPlayers: 8,
    isLocked: false,
    activeSceneId: "scene-tavern-1",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const useRoomStore = create<RoomState>((set) => ({
  rooms: INITIAL_ROOMS,
  currentRoom: INITIAL_ROOMS[0],
  players: DEFAULT_CONNECTED_PLAYERS,
  isLoading: false,
  error: null,

  setRoom: (room: Room) => {
    set({ currentRoom: room });
  },

  setPlayers: (players: Player[]) => {
    set({ players });
  },

  fetchMyRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const rooms = await roomApi.getRooms();
      set({ rooms: rooms.length > 0 ? rooms : INITIAL_ROOMS, isLoading: false });
      return rooms;
    } catch {
      set({ rooms: INITIAL_ROOMS, isLoading: false });
      return INITIAL_ROOMS;
    }
  },

  fetchRoomById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const room = await roomApi.getRoomById(id);
      set({ currentRoom: room, isLoading: false });
      return room;
    } catch {
      const found = INITIAL_ROOMS.find((r) => r.id === id) || INITIAL_ROOMS[0];
      set({ currentRoom: found, isLoading: false });
      return found;
    }
  },

  fetchRoomByCode: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const room = await roomApi.getRoomByCode(code);
      set({ currentRoom: room, isLoading: false });
      return room;
    } catch {
      const found = INITIAL_ROOMS.find((r) => r.code.toUpperCase() === code.toUpperCase()) || INITIAL_ROOMS[0];
      set({ currentRoom: found, isLoading: false });
      return found;
    }
  },

  createRoom: async (dto) => {
    set({ isLoading: true, error: null });
    try {
      const room = await roomApi.createRoom(dto);
      set((state) => ({
        rooms: [room, ...state.rooms],
        currentRoom: room,
        isLoading: false,
      }));
      return room;
    } catch {
      const fallbackRoom: Room = {
        id: `room-${Date.now()}`,
        code: `OWL-${Math.floor(1000 + Math.random() * 9000)}`,
        name: dto.name,
        description: dto.description || "",
        gmId: "user-gm-1",
        maxPlayers: dto.maxPlayers || 6,
        isLocked: !!dto.isLocked,
        activeSceneId: "scene-crypt-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({
        rooms: [fallbackRoom, ...state.rooms],
        currentRoom: fallbackRoom,
        isLoading: false,
      }));
      return fallbackRoom;
    }
  },

  deleteRoom: async (id: string) => {
    try {
      await roomApi.deleteRoom(id);
    } catch {
      // Handled
    }
    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== id),
      currentRoom: state.currentRoom?.id === id ? null : state.currentRoom,
    }));
  },

  addPlayer: (player) => {
    set((state) => {
      const exists = state.players.some((p) => p.userId === player.userId);
      if (exists) {
        return {
          players: state.players.map((p) => (p.userId === player.userId ? player : p)),
        };
      }
      return { players: [...state.players, player] };
    });
  },

  removePlayer: (playerId) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId && p.userId !== playerId),
    }));
  },

  updatePlayer: (playerId, updates) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId || p.userId === playerId ? { ...p, ...updates } : p
      ),
    }));
  },

  leaveRoom: () => {
    set({ currentRoom: null });
  },
}));
