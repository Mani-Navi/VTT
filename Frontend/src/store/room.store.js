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

    updateRoomInStore: (updatedRoom) =>
        set((state) => ({
            rooms: state.rooms.map((r) =>
                r.id === updatedRoom.id ? { ...r, ...updatedRoom } : r
            ),
        })),

    removeRoom: (id) =>
        set((state) => ({
            rooms: state.rooms.filter((room) => room.id !== id),
        })),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error, isLoading: false }),
}));