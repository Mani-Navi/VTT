import { apiClient } from "./axios";
import { Token } from "../types";

export const tokenApi = {
  getTokens: async (sceneId: string): Promise<Token[]> => {
    try {
      const res = await apiClient.get<Token[]>(`/scenes/${sceneId}/tokens`);
      return res.data;
    } catch {
      return [];
    }
  },

  createToken: async (sceneId: string, token: Omit<Token, "id">): Promise<Token> => {
    try {
      const res = await apiClient.post<Token>(`/scenes/${sceneId}/tokens`, token);
      return res.data;
    } catch {
      return {
        ...token,
        id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
    }
  },

  updateToken: async (sceneId: string, tokenId: string, updates: Partial<Token>): Promise<Token> => {
    try {
      const res = await apiClient.put<Token>(`/scenes/${sceneId}/tokens/${tokenId}`, updates);
      return res.data;
    } catch {
      return { id: tokenId, ...updates } as Token;
    }
  },

  deleteToken: async (sceneId: string, tokenId: string): Promise<void> => {
    try {
      await apiClient.delete(`/scenes/${sceneId}/tokens/${tokenId}`);
    } catch {
      // Ignored for standalone mode
    }
  },
};
