import api from "./axios";
import { MAP_PRESETS } from "../constants/mapPresets";
import { TOKEN_PRESETS } from "../constants/tokenPresets";

export const getAssetUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();

  // اگر مقدار صرفاً یک کلمه نامعتبر باشد
  if (!trimmed.includes("/") && !trimmed.startsWith("data:")) {
    return "";
  }

  if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const rawBase = api.defaults.baseURL || "http://localhost:8080/api";
  const backendHost = rawBase.replace(/\/api\/?$/, "");
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return `${backendHost}${cleanPath}`;
};

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
  },

  createAssetFromUrl: async (url, name, type = "TOKEN", metadata = {}) => {
    const res = await api.post("/assets/from-url", {
      url: url.trim(),
      name,
      type,
      ...metadata,
    });
    return res.data;
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