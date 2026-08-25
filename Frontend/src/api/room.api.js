import api from "./axios";

export const roomApi = {
  getRooms: async () => {
    const res = await api.get("/rooms");
    return res.data;
  },

  getTemplates: async () => {
    const res = await api.get("/rooms/templates");
    return res.data;
  },

  createRoom: async (data) => {
    const res = await api.post("/rooms", data);
    return res.data;
  },

  deleteRoom: async (id) => {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  },

  joinRoom: async (code, password) => {
    const res = await api.post("/rooms/join", { roomCode: code, password });
    return res.data;
  },
};