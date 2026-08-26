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

  saveFogShape: async (sceneId, fogShape) => {
    const res = await api.post(`/fog/scene/${sceneId}`, fogShape);
    return res.data;
  },

  clearFog: async (sceneId) => {
    const res = await api.delete(`/fog/scene/${sceneId}`);
    return res.data;
  },

  fitFogToMap: async (sceneId, width, height) => {
    const res = await api.post(`/fog/scene/${sceneId}/fit`, { width, height });
    return res.data;
  },
};