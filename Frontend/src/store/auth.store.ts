import { create } from "zustand";
import { User } from "../types";
import { UserRole, ROLES } from "../constants/permissions";
import { authApi, LoginDto, RegisterDto } from "../api/auth.api";
import { isTokenExpired } from "../utils/jwt";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  guestLogin: (displayName: string) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  setUser: (user: User) => void;
}

const getInitialAuth = () => {
  const token = localStorage.getItem("vtt_auth_token");
  const userStr = localStorage.getItem("vtt_user");
  if (token && userStr && !isTokenExpired(token)) {
    try {
      const user = JSON.parse(userStr);
      return { user, token, isAuthenticated: true };
    } catch {
      // Fallback
    }
  }
  // Default guest session so app is immediately interactive
  const defaultUser: User = {
    id: "user-gm-1",
    username: "arash_gm",
    displayName: "آرش (دانجن مستر)",
    role: ROLES.GM,
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=arash&backgroundColor=b6e3f4",
    isGuest: false,
  };
  return {
    user: defaultUser,
    token: "mock-valid-token",
    isAuthenticated: true,
  };
};

export const useAuthStore = create<AuthState>((set) => {
  const initial = getInitialAuth();

  return {
    user: initial.user,
    token: initial.token,
    isAuthenticated: initial.isAuthenticated,
    isLoading: false,
    error: null,

    login: async (dto: LoginDto) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authApi.login(dto);
        localStorage.setItem("vtt_auth_token", data.token);
        localStorage.setItem("vtt_user", JSON.stringify(data.user));
        set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      } catch (err: any) {
        set({ error: err.message || "Failed to login", isLoading: false });
        throw err;
      }
    },

    register: async (dto: RegisterDto) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authApi.register(dto);
        localStorage.setItem("vtt_auth_token", data.token);
        localStorage.setItem("vtt_user", JSON.stringify(data.user));
        set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      } catch (err: any) {
        set({ error: err.message || "Failed to register", isLoading: false });
        throw err;
      }
    },

    guestLogin: async (displayName: string) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authApi.guestLogin(displayName);
        localStorage.setItem("vtt_auth_token", data.token);
        localStorage.setItem("vtt_user", JSON.stringify(data.user));
        set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      } catch (err: any) {
        set({ error: err.message || "Failed guest login", isLoading: false });
        throw err;
      }
    },

    logout: () => {
      localStorage.removeItem("vtt_auth_token");
      localStorage.removeItem("vtt_user");
      set({ user: null, token: null, isAuthenticated: false });
    },

    setRole: (role: UserRole) => {
      set((state) => {
        if (!state.user) return state;
        const updated = { ...state.user, role };
        localStorage.setItem("vtt_user", JSON.stringify(updated));
        return { user: updated };
      });
    },

    setUser: (user: User) => {
      localStorage.setItem("vtt_user", JSON.stringify(user));
      set({ user });
    },
  };
});
