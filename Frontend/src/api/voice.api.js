import api from "./axios";

export const getVoiceToken = async (roomId) => {
    const response = await api.get(`/voice/token?roomId=${roomId}`);
    return response.data;
};