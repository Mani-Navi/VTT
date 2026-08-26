import api from "./axios";

export const sceneApi = {
  getScenes: async (roomId) => {
    const res = await api.get(`/scenes/room/${roomId}`);
    return res.data;
  },

  getSceneState: async (sceneId) => {
    const res = await api.get(`/scenes/${sceneId}/state`);
    return res.data;
  },

  createScene: async (data) => {
    const res = await api.post("/scenes", data);
    return res.data;
  },

  updateSceneMap: async (sceneId, payload) => {
    const res = await api.put(`/scenes/${sceneId}/map`, payload);
    return res.data;
  },

  activateScene: async (sceneId) => {
    const res = await api.post(`/scenes/${sceneId}/activate`);
    return res.data;
  },

  deleteScene: async (sceneId) => {
    await api.delete(`/scenes/${sceneId}`);
    return true;
  },

  getTokens: async (sceneId) => {
    const res = await api.get(`/tokens/scene/${sceneId}`);
    return res.data;
  },

  createToken: async (tokenData) => {
    const res = await api.post("/tokens", tokenData);
    return res.data;
  },
};