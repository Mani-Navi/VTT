import api from "./axios";

export const getVoiceToken = async (roomId) => {
    const response = await api.get(`/voice/token?roomId=${encodeURIComponent(roomId)}`);
    return response.data;
};