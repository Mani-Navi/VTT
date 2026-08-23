import React, { useState } from "react";
import { Image as ImageIcon, Plus, X, Upload, Swords, Shield, Heart, MapPin, Sparkles } from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { MAP_PRESETS, MapPreset } from "../../constants/mapPresets";
import { TOKEN_PRESETS, TokenPreset } from "../../constants/tokenPresets";
import { assetApi } from "../../api/asset.api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { wsService } from "../../services/websocket.service";

export const AssetMenu: React.FC = () => {
  const isAssetOpen = useCanvasStore((state) => state.isAssetMenuOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const currentScene = useSceneStore((state) => state.currentScene);
  const addToken = useSceneStore((state) => state.addToken);
  const updateSceneData = useSceneStore((state) => state.updateSceneData);
  const { isGM } = usePermissions();

  const [activeTab, setActiveTab] = useState<"tokens" | "maps" | "custom">("tokens");
  const [tokenCategory, setTokenCategory] = useState<string>("all");

  // Custom token form state
  const [customName, setCustomName] = useState("");
  const [customHp, setCustomHp] = useState(25);
  const [customAc, setCustomAc] = useState(14);
  const [customSize, setCustomSize] = useState(1);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(
    "https://api.dicebear.com/7.x/bottts/svg?seed=Hero1&backgroundColor=b6e3f4"
  );

  if (!isAssetOpen) return null;

  const handleAddPresetToken = (preset: TokenPreset) => {
    if (!currentScene) return;
    const stageCenterX = currentScene.mapWidth / 3 + Math.random() * 200;
    const stageCenterY = currentScene.mapHeight / 3 + Math.random() * 200;

    const tokenData = {
      name: preset.nameFa || preset.name,
      avatarUrl: preset.avatarUrl,
      x: stageCenterX,
      y: stageCenterY,
      size: preset.size,
      rotation: 0,
      elevation: 0,
      hp: preset.maxHp,
      maxHp: preset.maxHp,
      ac: preset.ac,
      speed: preset.speed,
      conditions: [],
      tintColor: preset.color,
    };

    addToken(tokenData);
    wsService.send("TOKEN_ADD", tokenData);
  };

  const handleCreateCustomToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentScene) return;

    const tokenData = {
      name: customName || "کاراکتر سفارشی",
      avatarUrl: customAvatarUrl,
      x: 400 + Math.random() * 150,
      y: 400 + Math.random() * 150,
      size: customSize,
      rotation: 0,
      elevation: 0,
      hp: customHp,
      maxHp: customHp,
      ac: customAc,
      speed: 30,
      conditions: [],
      tintColor: "#3b82f6",
    };

    addToken(tokenData);
    wsService.send("TOKEN_ADD", tokenData);
    setCustomName("");
  };

  const handleLoadPresetMap = (map: MapPreset) => {
    if (!isGM) return;
    updateSceneData({
      name: map.nameFa,
      mapUrl: map.imageUrl,
      mapWidth: map.width,
      mapHeight: map.height,
      grid: {
        ...currentScene?.grid,
        size: map.gridSize,
        type: map.gridType as any,
        enabled: true,
        color: "rgba(255, 255, 255, 0.25)",
        opacity: 0.3,
        snapToGrid: true,
        scaleValue: 5,
        scaleUnit: "ft",
      },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await assetApi.uploadAsset(file);
      if (activeTab === "maps") {
        updateSceneData({ mapUrl: res.url });
      } else {
        setCustomAvatarUrl(res.url);
      }
    } catch {
      // Handled
    }
  };

  const filteredTokens = TOKEN_PRESETS.filter((t) => {
    if (tokenCategory === "all") return true;
    return t.category === tokenCategory;
  });

  return (
    <div className="fixed top-16 left-6 z-40 w-96 max-w-[95vw] bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-zinc-100 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">کتابخانه توکن‌ها و مپ</h4>
            <p className="text-[11px] text-zinc-400 font-fa">افزودن کاراکترها و نقشه‌ها به بازی</p>
          </div>
        </div>
        <button
          onClick={() => toggleMenu("asset")}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 my-3">
        <button
          onClick={() => setActiveTab("tokens")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeTab === "tokens" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          توکن‌های آماده ({TOKEN_PRESETS.length})
        </button>
        <button
          onClick={() => setActiveTab("maps")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeTab === "maps" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          نقشه‌ها ({MAP_PRESETS.length})
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeTab === "custom" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          ساخت توکن
        </button>
      </div>

      {/* Tab 1: Tokens Library */}
      {activeTab === "tokens" && (
        <div>
          {/* Category Filter Pills */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
            {["all", "heroes", "monsters", "npcs", "props"].map((cat) => (
              <button
                key={cat}
                onClick={() => setTokenCategory(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                  tokenCategory === cat
                    ? "bg-zinc-800 text-amber-400 font-semibold border border-zinc-700"
                    : "text-zinc-400 hover:bg-zinc-800/60"
                }`}
              >
                {cat === "all"
                  ? "همه"
                  : cat === "heroes"
                  ? "قهرمانان"
                  : cat === "monsters"
                  ? "هیولاها"
                  : cat === "npcs"
                  ? "NPC"
                  : "وسایل"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {filteredTokens.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleAddPresetToken(preset)}
                className="group p-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-amber-500/50 hover:bg-zinc-850 transition-all cursor-pointer flex flex-col items-center text-center gap-1.5"
              >
                <div className="relative">
                  <img
                    src={preset.avatarUrl}
                    alt={preset.name}
                    className="w-12 h-12 rounded-full border-2 border-zinc-700 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: preset.color }}
                  />
                  {preset.size > 1 && (
                    <span className="absolute -bottom-1 -right-1 px-1 text-[9px] font-bold bg-amber-500 text-zinc-950 rounded">
                      {preset.size}x{preset.size}
                    </span>
                  )}
                </div>

                <div className="w-full">
                  <p className="text-xs font-semibold text-zinc-200 font-fa truncate">
                    {preset.nameFa}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                    <span className="text-emerald-400">HP {preset.maxHp}</span>
                    <span className="text-blue-400">AC {preset.ac}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-1 text-[11px] font-medium bg-zinc-800 text-zinc-300 group-hover:bg-amber-500 group-hover:text-zinc-950 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  افزودن به مپ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Tactical Maps Library */}
      {activeTab === "maps" && (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {/* Upload custom map */}
          {isGM && (
            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900 cursor-pointer transition-colors text-xs text-zinc-300">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>بارگذاری نقشه اختصاصی از فایل...</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          )}

          <div className="space-y-2">
            {MAP_PRESETS.map((map) => (
              <div
                key={map.id}
                onClick={() => handleLoadPresetMap(map)}
                className="group relative rounded-xl overflow-hidden border border-zinc-800 hover:border-amber-500/50 cursor-pointer"
              >
                <img
                  src={map.thumbnail}
                  alt={map.name}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between p-3">
                  <div>
                    <h5 className="text-xs font-bold text-zinc-100 font-fa">{map.nameFa}</h5>
                    <p className="text-[10px] text-zinc-300 font-mono">
                      {map.width}x{map.height}px • {map.gridType}
                    </p>
                  </div>

                  {isGM && (
                    <Button size="sm" variant="amber" className="text-xs h-7 px-2.5">
                      انتخاب مپ
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Custom Token Creator */}
      {activeTab === "custom" && (
        <form onSubmit={handleCreateCustomToken} className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-850">
            <img
              src={customAvatarUrl}
              alt="Avatar"
              className="w-14 h-14 rounded-full border-2 border-amber-500 bg-zinc-800"
            />
            <div className="flex-1 space-y-1">
              <label className="block text-xs text-zinc-400">تصویر آواتار توکن:</label>
              <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                آپلود عکس
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          <Input
            label="نام کاراکتر / توکن"
            placeholder="مثلا: شاهین (باربارین)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Max HP:</label>
              <input
                type="number"
                value={customHp}
                onChange={(e) => setCustomHp(Number(e.target.value) || 1)}
                className="w-full h-9 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-emerald-400"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Armor AC:</label>
              <input
                type="number"
                value={customAc}
                onChange={(e) => setCustomAc(Number(e.target.value) || 10)}
                className="w-full h-9 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">اندازه:</label>
              <select
                value={customSize}
                onChange={(e) => setCustomSize(Number(e.target.value))}
                className="w-full h-9 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200"
              >
                <option value={1}>1x1 (Medium)</option>
                <option value={2}>2x2 (Large)</option>
                <option value={3}>3x3 (Huge)</option>
              </select>
            </div>
          </div>

          <Button type="submit" variant="amber" className="w-full mt-2">
            <Sparkles className="w-4 h-4 ml-1.5" />
            ساخت و قرار دادن روی مپ
          </Button>
        </form>
      )}
    </div>
  );
};
