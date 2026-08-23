import { apiClient } from "./axios";
import { FogShape } from "../types";

export const fogApi = {
  getFog: async (sceneId: string): Promise<FogShape[]> => {
    try {
      const res = await apiClient.get<FogShape[]>(`/scenes/${sceneId}/fog`);
      return res.data;
    } catch {
      return [];
    }
  },

  saveFog: async (sceneId: string, fogShapes: FogShape[]): Promise<void> => {
    try {
      await apiClient.post(`/scenes/${sceneId}/fog`, { fogShapes });
    } catch {
      // Ignored for standalone mode
    }
  },
};
