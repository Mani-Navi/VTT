import { apiClient } from "./axios";
import { MAP_PRESETS, MapPreset } from "../constants/mapPresets";
import { TOKEN_PRESETS, TokenPreset } from "../constants/tokenPresets";

export const assetApi = {
  getPresetMaps: async (): Promise<MapPreset[]> => {
    return MAP_PRESETS;
  },

  getPresetTokens: async (): Promise<TokenPreset[]> => {
    return TOKEN_PRESETS;
  },

  uploadAsset: async (file: File): Promise<{ url: string; name: string }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post<{ url: string; name: string }>("/assets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch {
      // In-browser preview data URL conversion
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            url: e.target?.result as string,
            name: file.name,
          });
        };
        reader.readAsDataURL(file);
      });
    }
  },
};
