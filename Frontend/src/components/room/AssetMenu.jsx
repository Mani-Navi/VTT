import React, { useState } from "react";
import { Image as ImageIcon, Plus, X, Upload, Sparkles } from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { MAP_PRESETS } from "../../constants/mapPresets";
import { TOKEN_PRESETS } from "../../constants/tokenPresets";
import { assetApi } from "../../api/asset.api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { wsService } from "../../services/websocket.service";

export const AssetMenu = () => {
  const isAssetOpen = useCanvasStore((state) => state.isAssetMenuOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const currentScene = useSceneStore((state) => state.currentScene);
  const addToken = useSceneStore((state) => state.addToken);
  const { isGM } = usePermissions();

  const [activeTab, setActiveTab] = useState("tokens");
  const [customName, setCustomName] = useState("");
  const [customHp, setCustomHp] = useState(25);
  const [customAc, setCustomAc] = useState(14);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(
      "https://api.dicebear.com/7.x/bottts/svg?seed=Hero1&backgroundColor=b6e3f4"
  );

  if (!isAssetOpen) return null;

  const handleAddPresetToken = (preset) => {
    if (!currentScene) return;
    const tokenData = {
      name: preset.nameFa || preset.name,
      label: preset.nameFa || preset.name,
      avatarUrl: preset.avatarUrl,
      x: 350 + Math.random() * 150,
      y: 350 + Math.random() * 150,
      size: preset.size || 1,
      hp: preset.maxHp || 20,
      maxHp: preset.maxHp || 20,
      ac: preset.ac || 14,
      conditions: [],
      tintColor: preset.color || "#f59e0b",
    };

    addToken(tokenData);
    wsService.send("TOKEN_MOVE", tokenData);
  };

  const handleCreateCustomToken = (e) => {
    e.preventDefault();
    if (!currentScene) return;

    const tokenData = {
      name: customName || "کاراکتر سفارشی",
      label: customName || "کاراکتر سفارشی",
      avatarUrl: customAvatarUrl,
      x: 400 + Math.random() * 100,
      y: 400 + Math.random() * 100,
      size: 1,
      hp: customHp,
      maxHp: customHp,
      ac: customAc,
      conditions: [],
      tintColor: "#3b82f6",
    };

    addToken(tokenData);
    wsService.send("TOKEN_MOVE", tokenData);
    setCustomName("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await assetApi.uploadAsset(file);
      setCustomAvatarUrl(res.fileUrl || res.url);
    } catch {
      // Handled
    }
  };

  return (
      <div className="fixed top-16 left-6 z-40 w-96 max-w-[95vw] bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-zinc-100 font-fa" dir="rtl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">کتابخانه توکن‌ها و نقشه</h4>
              <p className="text-[11px] text-zinc-400">افزودن کاراکترها به نقشه</p>
            </div>
          </div>
          <button
              type="button"
              onClick={() => toggleMenu("asset")}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 my-3">
          <button
              type="button"
              onClick={() => setActiveTab("tokens")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === "tokens" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400"
              }`}
          >
            توکن‌های آماده
          </button>
          <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === "custom" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400"
              }`}
          >
            ساخت توکن
          </button>
        </div>

        {activeTab === "tokens" && (
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {TOKEN_PRESETS.map((preset) => (
                  <div
                      key={preset.id}
                      onClick={() => handleAddPresetToken(preset)}
                      className="p-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-amber-500/50 cursor-pointer flex flex-col items-center text-center gap-1.5"
                  >
                    <img
                        src={preset.avatarUrl}
                        alt={preset.name}
                        className="w-12 h-12 rounded-full border-2 border-zinc-700"
                    />
                    <p className="text-xs font-semibold text-zinc-200 truncate w-full">{preset.nameFa}</p>
                    <button
                        type="button"
                        className="w-full py-1 text-[11px] font-medium bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> افزودن
                    </button>
                  </div>
              ))}
            </div>
        )}

        {activeTab === "custom" && (
            <form onSubmit={handleCreateCustomToken} className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-850">
                <img src={customAvatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-amber-500" />
                <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg cursor-pointer">
                  آپلود عکس
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <Input
                  label="نام کاراکتر"
                  placeholder="مثلا: پهلوان سیاوش"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
              />

              <Button type="submit" variant="amber" className="w-full mt-2">
                <Sparkles className="w-4 h-4 ml-1.5" />
                قرار دادن روی نقشه
              </Button>
            </form>
        )}
      </div>
  );
};