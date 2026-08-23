import { apiClient } from "./axios";
import { DrawingShape } from "../types";

export const drawingApi = {
  getDrawings: async (sceneId: string): Promise<DrawingShape[]> => {
    try {
      const res = await apiClient.get<DrawingShape[]>(`/scenes/${sceneId}/drawings`);
      return res.data;
    } catch {
      return [];
    }
  },

  saveDrawings: async (sceneId: string, drawings: DrawingShape[]): Promise<void> => {
    try {
      await apiClient.post(`/scenes/${sceneId}/drawings`, { drawings });
    } catch {
      // Ignored for standalone mode
    }
  },
};
