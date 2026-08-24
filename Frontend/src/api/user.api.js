import api from "./axios";

export const userApi = {
    getProfile: async () => {
        const res = await api.get("/user/profile");
        return res.data;
    },

    updateProfile: async (data) => {
        const res = await api.put("/user/profile", data);
        return res.data;
    },

    changePassword: async (data) => {
        const res = await api.post("/user/change-password", data);
        return res.data;
    },

    changeEmail: async (data) => {
        const res = await api.post("/user/change-email", data);
        return res.data;
    },

    sendVerificationCode: async () => {
        const res = await api.post("/user/send-verification-code");
        return res.data;
    },

    verifyCode: async (code) => {
        const res = await api.post("/user/verify-code", { code });
        return res.data;
    },
};