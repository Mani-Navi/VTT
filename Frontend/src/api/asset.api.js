import api from "./axios";
import { MAP_PRESETS } from "../constants/mapPresets";
import { TOKEN_PRESETS } from "../constants/tokenPresets";

export const assetApi = {
  getPresetMaps: async () => {
    return MAP_PRESETS;
  },

  getPresetTokens: async () => {
    return TOKEN_PRESETS;
  },

  uploadAsset: async (file, name, type = "TOKEN") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (name) formData.append("name", name);
      formData.append("type", type);

      const res = await api.post("/assets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch {
      // تبدیل سریع به Data URL در صورت عدم دسترسی موقت به سرور
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            fileUrl: e.target?.result,
            name: file.name,
          });
        };
        reader.readAsDataURL(file);
      });
    }
  },
};