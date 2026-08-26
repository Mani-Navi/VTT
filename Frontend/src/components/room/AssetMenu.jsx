import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  X,
  Upload,
  Search,
  MapPin,
  Lock,
  Sparkles,
  Box,
  Paperclip,
  Check,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { assetApi } from "../../api/asset.api";
import { MAP_PRESETS } from "../../constants/mapPresets";
import { TOKEN_PRESETS } from "../../constants/tokenPresets";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

export const AssetMenu = ({ isGM = false, permissions = {} }) => {
  const isAssetOpen = useCanvasStore((state) => state.isAssetMenuOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const currentScene = useSceneStore((state) => state.currentScene);
  const setMapForCurrentScene = useSceneStore((state) => state.setMapForCurrentScene);
  const addToken = useSceneStore((state) => state.addToken);

  const mapFileInputRef = useRef(null);
  const tokenFileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("maps"); // maps | tokens | props | starter
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [userAssets, setUserAssets] = useState([]);
  const [uploadError, setUploadError] = useState("");

  const setStagePos = useCanvasStore((state) => state.setStagePos);
  const setZoom = useCanvasStore((state) => state.setZoom);

  const hasActiveMap = Boolean(currentScene?.assetUrl || currentScene?.mapUrl);
  const canAccessAssets = isGM || permissions?.canAssets === true;
  const canUploadMap = isGM || permissions?.canScene === true || permissions?.canMap === true;

  useEffect(() => {
    if (isAssetOpen && canAccessAssets) {
      loadAssets();
    }
  }, [isAssetOpen, activeTab, canAccessAssets]);

  const loadAssets = async () => {
    try {
      let typeParam = null;
      if (activeTab === "maps") typeParam = "MAP";
      if (activeTab === "tokens") typeParam = "TOKEN";
      if (activeTab === "props") typeParam = "PROP";

      const data = await assetApi.getAssets(typeParam);
      setUserAssets(data || []);
    } catch {
      setUserAssets([]);
    }
  };

  if (!isAssetOpen) return null;

  if (!canAccessAssets) {
    return (
        <div
            className="fixed top-16 right-6 z-50 w-80 bg-zinc-900/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-2xl p-5 text-zinc-100 font-fa select-none text-center"
            dir="rtl"
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-zinc-100">دسترسی محدود است</h4>
          <p className="text-xs text-zinc-400 mt-1">
            تنها گیم‌مستر یا بازیکنان دارای پرمیشن مجاز به استفاده از کتابخانه منابع هستند.
          </p>
          <Button
              size="sm"
              variant="secondary"
              className="mt-4 w-full text-xs font-bold"
              onClick={() => toggleMenu("asset")}
          >
            بستن
          </Button>
        </div>
    );
  }

  // اعمال و قرارگیری فوری نقشه
  const handleSelectMap = async (mapUrl, mapName, assetId = null) => {
    if (!canUploadMap) return;

    await setMapForCurrentScene(mapUrl, mapName, assetId);

    const mapWidth = 2000;
    const mapHeight = 1500;
    const centerX = (window.innerWidth - mapWidth * 0.6) / 2;
    const centerY = (window.innerHeight - mapHeight * 0.6) / 2;
    setStagePos(Math.max(centerX, 20), Math.max(centerY, 20));
    setZoom(0.6);

    toggleMenu("asset");
  };

  // آپلود مستقیم نقشه با فرمت و ابعاد استاندارد خودکار
  const handleMapDirectUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const mapName = file.name.replace(/\.[^/.]+$/, "");
      const uploaded = await assetApi.uploadAsset(file, mapName, "MAP", { dpi: 150 });
      await handleSelectMap(uploaded.fileUrl, uploaded.name, uploaded.id);
    } catch {
      setUploadError("خطا در آپلود نقشه. لطفاً مجدداً امتحان کنید.");
    } finally {
      setIsUploading(false);
      if (mapFileInputRef.current) mapFileInputRef.current.value = "";
    }
  };

  // افزودن توکن به نقشه
  const handleAddToken = (tokenUrl, tokenName, extraData = {}) => {
    if (!hasActiveMap) return;

    const newToken = {
      name: tokenName || "توکن جدید",
      avatarUrl: tokenUrl,
      assetId: extraData.id || null,
      x: (currentScene?.mapWidth || 2000) / 2,
      y: (currentScene?.mapHeight || 1500) / 2,
      size: extraData.size || 1,
      hp: extraData.maxHp || 20,
      maxHp: extraData.maxHp || 20,
      ac: extraData.ac || 12,
    };
    addToken(newToken);
  };

  // آپلود توکن شخصی
  const handleTokenDirectUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const tokenName = file.name.replace(/\.[^/.]+$/, "");
      const uploaded = await assetApi.uploadAsset(file, tokenName, "TOKEN", { dpi: 150 });
      handleAddToken(uploaded.fileUrl, uploaded.name, uploaded);
      loadAssets();
    } catch {
      setUploadError("خطا در آپلود توکن.");
    } finally {
      setIsUploading(false);
      if (tokenFileInputRef.current) tokenFileInputRef.current.value = "";
    }
  };

  const filteredPresets =
      activeTab === "maps"
          ? (MAP_PRESETS || []).filter((m) =>
              (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (m.nameFa || "").includes(searchQuery)
          )
          : (TOKEN_PRESETS || []).filter((t) =>
              (t.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (t.nameFa || "").includes(searchQuery)
          );

  const filteredUserAssets = userAssets.filter((a) =>
      (a.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <div
          className="fixed top-16 right-6 z-50 w-[460px] max-w-[95vw] bg-zinc-900/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-2xl p-4 text-zinc-100 font-fa select-none animate-in fade-in zoom-in-95 duration-150"
          dir="rtl"
      >
        {/* هدر */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">کتابخانه منابع (Asset Library)</h4>
              <p className="text-[11px] text-zinc-400">مدیریت نقشه‌ها و توکن‌های استاندارد</p>
            </div>
          </div>
          <button
              type="button"
              onClick={() => toggleMenu("asset")}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* تب‌های تفکیک‌شده */}
        <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 my-3">
          {[
            { id: "maps", label: "نقشه‌ها", icon: MapPin },
            { id: "tokens", label: "توکن‌ها", icon: Sparkles },
            { id: "props", label: "اشیاء", icon: Box },
            { id: "starter", label: "پک آماده", icon: Paperclip },
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                        "flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                        activeTab === tab.id
                            ? "bg-amber-500 text-zinc-950 shadow-md"
                            : "text-zinc-400 hover:text-zinc-200"
                    )}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
            );
          })}
        </div>

        {/* نوار جستجو و دکمه اختصاصی آپلود */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در نام منبع..."
                className="w-full pl-3 pr-8 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {activeTab === "maps" ? (
              <>
                <input
                    type="file"
                    ref={mapFileInputRef}
                    onChange={handleMapDirectUpload}
                    accept="image/*"
                    className="hidden"
                />
                <Button
                    size="sm"
                    variant="amber"
                    className="text-xs font-bold shrink-0 cursor-pointer shadow-md shadow-amber-500/20"
                    onClick={() => mapFileInputRef.current?.click()}
                    isLoading={isUploading}
                    disabled={!canUploadMap}
                >
                  <Upload className="w-3.5 h-3.5 ml-1" />
                  آپلود نقشه
                </Button>
              </>
          ) : (
              <>
                <input
                    type="file"
                    ref={tokenFileInputRef}
                    onChange={handleTokenDirectUpload}
                    accept="image/*"
                    className="hidden"
                />
                <Button
                    size="sm"
                    variant="amber"
                    className="text-xs font-bold shrink-0 cursor-pointer shadow-md shadow-amber-500/20"
                    onClick={() => tokenFileInputRef.current?.click()}
                    isLoading={isUploading}
                >
                  <Upload className="w-3.5 h-3.5 ml-1" />
                  آپلود توکن
                </Button>
              </>
          )}
        </div>

        {uploadError && (
            <div className="mb-3 p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-[11px] text-rose-400 text-center font-bold">
              {uploadError}
            </div>
        )}

        {/* محتوای تب‌ها */}
        <div className="max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar space-y-3">
          {/* تب نقشه‌ها */}
          {activeTab === "maps" && (
              <div>
            <span className="text-[11px] font-bold text-zinc-400 mb-2 block">
              یک نقشه را انتخاب یا آپلود کنید تا در صحنه قرار گیرد:
            </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredPresets.map((map) => (
                      <div
                          key={map.id}
                          onClick={() => canUploadMap && handleSelectMap(map.url || map.thumbnailUrl, map.nameFa || map.name)}
                          className={cn(
                              "group relative rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950 transition-all",
                              canUploadMap
                                  ? "hover:border-amber-500 cursor-pointer hover:scale-[1.02]"
                                  : "opacity-60 cursor-not-allowed"
                          )}
                      >
                        <img
                            src={map.url || map.thumbnailUrl}
                            alt={map.name}
                            className="w-full h-24 object-cover group-hover:brightness-110"
                        />
                        <div className="p-2 bg-zinc-900/90 flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-200 truncate">{map.nameFa || map.name}</span>
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* تب توکن‌ها */}
          {activeTab === "tokens" && (
              <div>
            <span className="text-[11px] font-bold text-zinc-400 mb-2 block">
              {!hasActiveMap
                  ? "ابتدا نقشه را انتخاب کنید تا بتوانید توکن اضافه نمایید."
                  : "برای افزودن به بازی، روی توکن کلیک کنید:"}
            </span>
                <div className="grid grid-cols-3 gap-2">
                  {filteredPresets.map((token) => (
                      <div
                          key={token.id}
                          onClick={() => handleAddToken(token.avatarUrl || token.url, token.nameFa || token.name, token)}
                          className={cn(
                              "group p-2 rounded-2xl border border-zinc-800 bg-zinc-950 transition-all flex flex-col items-center gap-1.5",
                              !hasActiveMap
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:border-amber-500 cursor-pointer hover:scale-105"
                          )}
                      >
                        <img
                            src={token.avatarUrl || token.url}
                            alt={token.name}
                            className="w-12 h-12 rounded-full object-cover border border-amber-500/30"
                        />
                        <span className="text-[11px] font-bold text-zinc-300 truncate max-w-full">
                    {token.nameFa || token.name}
                  </span>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* تب اشیاء */}
          {activeTab === "props" && (
              <div>
            <span className="text-[11px] font-bold text-zinc-400 mb-2 block">
              اشیاء و تجهیزات:
            </span>
                <div className="grid grid-cols-3 gap-2">
                  {(TOKEN_PRESETS || [])
                      .filter((p) => p.category === "props")
                      .map((prop) => (
                          <div
                              key={prop.id}
                              onClick={() => handleAddToken(prop.avatarUrl, prop.nameFa || prop.name, prop)}
                              className={cn(
                                  "group p-2 rounded-2xl border border-zinc-800 bg-zinc-950 transition-all flex flex-col items-center gap-1.5",
                                  !hasActiveMap
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:border-amber-500 cursor-pointer hover:scale-105"
                              )}
                          >
                            <img
                                src={prop.avatarUrl}
                                alt={prop.name}
                                className="w-12 h-12 rounded-xl object-contain border border-amber-500/30"
                            />
                            <span className="text-[11px] font-bold text-zinc-300 truncate max-w-full">
                      {prop.nameFa || prop.name}
                    </span>
                          </div>
                      ))}
                </div>
              </div>
          )}

          {/* است‌های آپلودشده شخصی */}
          {filteredUserAssets.length > 0 && activeTab !== "starter" && (
              <div className="pt-3 border-t border-zinc-800/80">
            <span className="text-[11px] font-bold text-amber-400/90 mb-2 block">
              فایل‌های شخصی ذخیره‌شده شما:
            </span>
                <div className="grid grid-cols-3 gap-2">
                  {filteredUserAssets.map((asset) => (
                      <div
                          key={asset.id}
                          onClick={() => {
                            if (asset.type === "MAP" && canUploadMap) {
                              handleSelectMap(asset.fileUrl, asset.name, asset.id);
                            } else if (hasActiveMap) {
                              handleAddToken(asset.fileUrl, asset.name, asset);
                            }
                          }}
                          className={cn(
                              "group p-1.5 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col items-center gap-1 transition-all",
                              !hasActiveMap && asset.type !== "MAP"
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:border-amber-500 cursor-pointer"
                          )}
                      >
                        <img
                            src={asset.fileUrl}
                            alt={asset.name}
                            className="w-10 h-10 object-cover rounded-lg"
                        />
                        <span className="text-[10px] text-zinc-300 truncate max-w-full">
                    {asset.name}
                  </span>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* پک‌های آماده */}
          {activeTab === "starter" && (
              <div className="space-y-2">
                {[
                  {
                    id: "dungeon-starter",
                    title: "سیاه‌چال تاریک (Dungeon Crypt)",
                    desc: "شامل نقشه زیرزمین تاریک و مهیب",
                    mapUrl:
                        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
                  },
                  {
                    id: "forest-starter",
                    title: "جنگل اسرارآمیز (Elven Woods)",
                    desc: "مناسب برای نبردهای در محیط باز",
                    mapUrl:
                        "https://images.unsplash.com/photo-1511497584788-87676104235f?w=1600&auto=format&fit=crop&q=80",
                  },
                ].map((starter) => (
                    <div
                        key={starter.id}
                        className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between hover:border-amber-500 transition-all"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-amber-400">{starter.title}</h5>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{starter.desc}</p>
                      </div>
                      <Button
                          size="sm"
                          variant="amber"
                          className="text-xs font-bold cursor-pointer"
                          disabled={!canUploadMap}
                          onClick={() => handleSelectMap(starter.mapUrl, starter.title)}
                      >
                        بارگذاری
                      </Button>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
};