import api from "./axios";

export const tokenApi = {
  createToken: async (tokenData) => {
    try {
      const res = await api.post("/tokens", tokenData);
      return res.data;
    } catch {
      return {
        ...tokenData,
        id: `token-${Date.now()}`,
      };
    }
  },
};