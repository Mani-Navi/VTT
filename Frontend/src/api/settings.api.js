import api from "./axios";

export const settingsApi = {
    getSettings: async (roomId) => {
        const res = await api.get(`/rooms/${roomId}/settings`);
        return res.data;
    },

    updateSettings: async (roomId, settingsData) => {
        const res = await api.put(`/rooms/${roomId}/settings`, settingsData);
        return res.data;
    },

    resetSettings: async (roomId) => {
        const res = await api.post(`/rooms/${roomId}/settings/reset`);
        return res.data;
    },
};