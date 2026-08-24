import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem("vtt_jwt", token);
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (updatedFields) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : updatedFields,
    }));
  },

  logout: () => {
    localStorage.removeItem("vtt_jwt");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));