import { apiClient } from "./axios";
import { User } from "../types";
import { generateMockToken } from "../utils/jwt";

export interface LoginDto {
  username: string;
  password?: string;
}

export interface RegisterDto {
  username: string;
  email?: string;
  displayName: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post<AuthResponse>("/auth/login", dto);
      return res.data;
    } catch {
      // Fallback for standalone preview
      const mockUser: User = {
        id: `user-${Date.now()}`,
        username: dto.username,
        displayName: dto.username,
        role: "GM",
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${dto.username}&backgroundColor=b6e3f4`,
        isGuest: false,
      };
      const token = generateMockToken(mockUser);
      return { token, user: mockUser };
    }
  },

  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post<AuthResponse>("/auth/register", dto);
      return res.data;
    } catch {
      const mockUser: User = {
        id: `user-${Date.now()}`,
        username: dto.username,
        email: dto.email,
        displayName: dto.displayName || dto.username,
        role: "GM",
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${dto.username}&backgroundColor=ffdfbf`,
        isGuest: false,
      };
      const token = generateMockToken(mockUser);
      return { token, user: mockUser };
    }
  },

  guestLogin: async (displayName: string): Promise<AuthResponse> => {
    const name = displayName.trim() || `Player-${Math.floor(100 + Math.random() * 900)}`;
    const mockUser: User = {
      id: `guest-${Date.now()}`,
      username: name.toLowerCase().replace(/\s+/g, "_"),
      displayName: name,
      role: "PLAYER",
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}&backgroundColor=ffd5dc`,
      isGuest: true,
    };
    const token = generateMockToken(mockUser);
    return { token, user: mockUser };
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const res = await apiClient.get<User>("/auth/me");
      return res.data;
    } catch {
      const stored = localStorage.getItem("vtt_user");
      if (stored) return JSON.parse(stored);
      throw new Error("No active session");
    }
  },
};
