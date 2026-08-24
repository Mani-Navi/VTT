import api from "./axios";

export const drawingApi = {
  getDrawings: async (sceneId) => {
    try {
      const res = await api.get(`/drawings/scene/${sceneId}`);
      return res.data;
    } catch {
      return [];
    }
  },
};