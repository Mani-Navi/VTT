import api from "./axios";

export const sceneApi = {
  // دریافت لیست سکانس‌های یک اتاق
  getScenes: async (roomId) => {
    const res = await api.get(`/scenes/room/${roomId}`);
    return res.data;
  },

  // دریافت وضعیت کامل یک سکانس (شامل توکن‌ها، نقاشی‌ها و مه جنگ)
  getSceneState: async (sceneId) => {
    const res = await api.get(`/scenes/${sceneId}/state`);
    return res.data;
  },

  // ساخت سکانس جدید
  createScene: async (data) => {
    const res = await api.post("/scenes", data);
    return res.data;
  },

  // دریافت توکن‌های یک سکانس
  getTokens: async (sceneId) => {
    const res = await api.get(`/tokens/scene/${sceneId}`);
    return res.data;
  },

  // ایجاد توکن جدید
  createToken: async (tokenData) => {
    const res = await api.post("/tokens", tokenData);
    return res.data;
  },
};