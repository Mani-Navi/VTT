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

  deleteDrawing: async (drawingId, sceneId = null) => {
    try {
      const res = await api.delete(`/drawings/${encodeURIComponent(drawingId)}`, {
        params: sceneId ? { sceneId } : {},
      });
      return res.data;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("[drawingApi] خطا در حذف نقاشی:", err);
      }
      return false;
    }
  },
};