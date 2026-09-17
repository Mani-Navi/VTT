import { create } from "zustand";

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem("vtt_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getInitialToken = () => {
  return localStorage.getItem("vtt_jwt") || localStorage.getItem("token") || null;
};

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: Boolean(getInitialToken()),

  setAuth: (user, token) => {
    if (token) localStorage.setItem("vtt_jwt", token);
    if (user) localStorage.setItem("vtt_user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      const nextUser = state.user ? { ...state.user, ...updatedFields } : updatedFields;
      if (nextUser) localStorage.setItem("vtt_user", JSON.stringify(nextUser));
      return { user: nextUser };
    });
  },

  logout: () => {
    localStorage.removeItem("vtt_jwt");
    localStorage.removeItem("vtt_user");
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));