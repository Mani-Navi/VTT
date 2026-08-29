import { create } from "zustand";

export const useRoomStore = create((set) => ({
    rooms: [],
    currentRoom: null,
    isLoading: false,
    error: null,

    setRooms: (rooms) => set({ rooms }),

    setCurrentRoom: (currentRoom) => set({ currentRoom }),

    addRoom: (room) =>
        set((state) => ({
            rooms: [room, ...state.rooms],
        })),

    updateRoomInStore: (updatedRoom) =>
        set((state) => ({
            currentRoom: state.currentRoom?.id === updatedRoom.id ? { ...state.currentRoom, ...updatedRoom } : state.currentRoom,
            rooms: state.rooms.map((r) =>
                r.id === updatedRoom.id ? { ...r, ...updatedRoom } : r
            ),
        })),

    removeRoom: (id) =>
        set((state) => ({
            currentRoom: state.currentRoom?.id === id ? null : state.currentRoom,
            rooms: state.rooms.filter((room) => room.id !== id),
        })),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error, isLoading: false }),
}));