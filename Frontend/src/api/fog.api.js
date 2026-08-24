import api from "./axios";

export const fogApi = {
  getFog: async (sceneId) => {
    try {
      const res = await api.get(`/fog/scene/${sceneId}`);
      return res.data;
    } catch {
      return [];
    }
  },
};