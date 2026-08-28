import api from "./axios";

export const tokenApi = {
  createToken: async (tokenData) => {
    const res = await api.post("/tokens", tokenData);
    return res.data;
  },
};