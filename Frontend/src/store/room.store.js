import { create } from "zustand";

export const useRoomStore = create((set) => ({
  rooms: [],
  isLoading: false,
  error: null,

  setRooms: (rooms) => set({ rooms }),

  addRoom: (room) =>
      set((state) => ({
        rooms: [room, ...state.rooms],
      })),

  removeRoom: (id) =>
      set((state) => ({
        rooms: state.rooms.filter((room) => room.id !== id),
      })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),
}));