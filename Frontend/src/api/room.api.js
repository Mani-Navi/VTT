import api from "./axios";

export const roomApi = {
  getRooms: async () => {
    const res = await api.get("/rooms");
    return res.data;
  },

  getRoom: async (id) => {
    const res = await api.get(`/rooms/${id}`);
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

  updateRoom: async (id, data) => {
    const res = await api.put(`/rooms/${id}`, data);
    return res.data;
  },

  closeRoom: async (id) => {
    const res = await api.post(`/rooms/${id}/close`);
    return res.data;
  },

  deleteRoom: async (id) => {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  },

  leaveRoom: async (id) => {
    const res = await api.post(`/rooms/${id}/leave`);
    return res.data;
  },

  joinRoom: async (code, password) => {
    const res = await api.post("/rooms/join", { roomCode: code, password });
    return res.data;
  },

  getMembers: async (roomId) => {
    const res = await api.get(`/rooms/${roomId}/members`);
    return res.data;
  },

  kickMember: async (roomId, memberId) => {
    const res = await api.post(`/rooms/${roomId}/members/${memberId}/kick`);
    return res.data;
  },

  banMember: async (roomId, memberId) => {
    const res = await api.post(`/rooms/${roomId}/members/${memberId}/ban`);
    return res.data;
  },

  muteMember: async (roomId, memberId) => {
    const res = await api.post(`/rooms/${roomId}/members/${memberId}/mute`);
    return res.data;
  },

  changeRole: async (roomId, memberId, role) => {
    const res = await api.patch(`/rooms/${roomId}/members/${memberId}/role`, { role });
    return res.data;
  },

  updatePermissions: async (permissionData) => {
    const res = await api.put(`/permissions`, permissionData);
    return res.data;
  },
};