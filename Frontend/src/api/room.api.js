import api from "./axios";

export const roomApi = {
  getRooms: async () => {
    const res = await api.get("/rooms");
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

  joinRoom: async (code) => {
    const res = await api.post("/rooms/join", { code });
    return res.data;
  },
};