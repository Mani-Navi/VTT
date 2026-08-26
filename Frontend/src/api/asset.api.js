import api from "./axios";
import { MAP_PRESETS } from "../constants/mapPresets";
import { TOKEN_PRESETS } from "../constants/tokenPresets";

export const assetApi = {
  getPresetMaps: async () => {
    return MAP_PRESETS || [];
  },

  getPresetTokens: async () => {
    return TOKEN_PRESETS || [];
  },

  getAssets: async (type = null) => {
    const params = type ? { type } : {};
    const res = await api.get("/assets", { params });
    return res.data;
  },

  uploadAsset: async (file, name, type = "TOKEN", metadata = {}) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (name) formData.append("name", name);
      formData.append("type", type);

      if (metadata.dpi !== undefined) formData.append("dpi", metadata.dpi);
      if (metadata.columns !== undefined) formData.append("columns", metadata.columns);
      if (metadata.rows !== undefined) formData.append("rows", metadata.rows);
      if (metadata.rotation !== undefined) formData.append("rotation", metadata.rotation);
      if (metadata.isVisible !== undefined) formData.append("isVisible", metadata.isVisible);
      if (metadata.isLocked !== undefined) formData.append("isLocked", metadata.isLocked);
      if (metadata.defaultText) formData.append("defaultText", metadata.defaultText);
      if (metadata.textColor) formData.append("textColor", metadata.textColor);
      if (metadata.fontSize) formData.append("fontSize", metadata.fontSize);
      if (metadata.fontFamily) formData.append("fontFamily", metadata.fontFamily);

      const res = await api.post("/assets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: `temp-${Date.now()}`,
            fileUrl: e.target?.result,
            name: name || file.name,
            type: type,
            dpi: metadata.dpi || 150,
            gridColumns: metadata.columns || 1,
            gridRows: metadata.rows || 1,
            rotation: metadata.rotation || 0,
            isVisible: metadata.isVisible !== undefined ? metadata.isVisible : true,
            isLocked: metadata.isLocked !== undefined ? metadata.isLocked : false,
          });
        };
        reader.readAsDataURL(file);
      });
    }
  },

  updateAsset: async (assetId, updateData) => {
    const res = await api.patch(`/assets/${assetId}`, updateData);
    return res.data;
  },

  deleteAsset: async (assetId) => {
    await api.delete(`/assets/${assetId}`);
    return true;
  },
};