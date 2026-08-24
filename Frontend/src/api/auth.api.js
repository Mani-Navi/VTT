import api from "./axios";

export const authApi = {
  register: async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  login: async (data) => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  googleLogin: async (idToken) => {
    const res = await api.post("/auth/google", { idToken });
    return res.data;
  },
};