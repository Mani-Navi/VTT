import { apiClient } from "./axios";
import { Room } from "../types";
import { generateRoomCode } from "../utils/roomCode";

const ROOMS_STORAGE_KEY = "vtt_saved_rooms";

const INITIAL_DEFAULT_ROOMS: Room[] = [
  {
    id: "room-default-1",
    code: "OWL-7721",
    name: "کمپین سیاهچاله‌های باستانی (D&D 5e)",
    description: "جلسه دهم: رویارویی با اژدهای کهن در اعماق سرداب سنگی",
    gmId: "gm-default",
    gmName: "آرش دانجن‌مستر",
    maxPlayers: 6,
    isLocked: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    activeSceneId: "scene-dungeon-1",
  },
  {
    id: "room-default-2",
    code: "MAGE-4410",
    name: "ماجراجویی در جنگل سحرآمیز",
    description: "کمپین تک‌جلسه‌ای (One-Shot) برای بازیکنان تازه‌کار و متوسط",
    gmId: "gm-2",
    gmName: "سارا راوی",
    maxPlayers: 5,
    isLocked: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    activeSceneId: "scene-forest-1",
  },
];

function getStoredRooms(): Room[] {
  const data = localStorage.getItem(ROOMS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_ROOMS));
    return INITIAL_DEFAULT_ROOMS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEFAULT_ROOMS;
  }
}

function saveStoredRooms(rooms: Room[]) {
  localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
}

export const roomApi = {
  getRooms: async (): Promise<Room[]> => {
    try {
      const res = await apiClient.get<Room[]>("/rooms");
      return res.data;
    } catch {
      return getStoredRooms();
    }
  },

  getRoomById: async (id: string): Promise<Room> => {
    try {
      const res = await apiClient.get<Room>(`/rooms/${id}`);
      return res.data;
    } catch {
      const rooms = getStoredRooms();
      const found = rooms.find((r) => r.id === id);
      if (found) return found;
      return rooms[0] || INITIAL_DEFAULT_ROOMS[0];
    }
  },

  getRoomByCode: async (code: string): Promise<Room> => {
    try {
      const res = await apiClient.get<Room>(`/rooms/code/${code}`);
      return res.data;
    } catch {
      const rooms = getStoredRooms();
      const cleanCode = code.trim().toUpperCase();
      const found = rooms.find((r) => r.code.toUpperCase() === cleanCode || r.id === code);
      if (found) return found;

      // If room code doesn't exist, create a dynamic quick room for that code
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        code: cleanCode,
        name: `اتاق بازی ${cleanCode}`,
        description: "اتاق متصل شده به صورت مستقیم",
        gmId: "current_user",
        maxPlayers: 8,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveStoredRooms([newRoom, ...rooms]);
      return newRoom;
    }
  },

  createRoom: async (dto: { name: string; description?: string; maxPlayers?: number; isLocked?: boolean; password?: string }): Promise<Room> => {
    try {
      const res = await apiClient.post<Room>("/rooms", dto);
      return res.data;
    } catch {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        code: generateRoomCode(),
        name: dto.name,
        description: dto.description || "",
        gmId: "current_user",
        gmName: "شما (GM)",
        maxPlayers: dto.maxPlayers || 6,
        isLocked: dto.isLocked || false,
        password: dto.password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const rooms = getStoredRooms();
      saveStoredRooms([newRoom, ...rooms]);
      return newRoom;
    }
  },

  updateRoom: async (id: string, updates: Partial<Room>): Promise<Room> => {
    try {
      const res = await apiClient.put<Room>(`/rooms/${id}`, updates);
      return res.data;
    } catch {
      const rooms = getStoredRooms();
      const updated = rooms.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
      saveStoredRooms(updated);
      const room = updated.find((r) => r.id === id);
      if (!room) throw new Error("Room not found");
      return room;
    }
  },

  deleteRoom: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/rooms/${id}`);
    } catch {
      const rooms = getStoredRooms().filter((r) => r.id !== id);
      saveStoredRooms(rooms);
    }
  },
};
