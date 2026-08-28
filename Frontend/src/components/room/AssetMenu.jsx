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
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { assetApi, getAssetUrl } from "../../api/asset.api";
import { MAP_PRESETS } from "../../constants/mapPresets";
import { TOKEN_PRESETS } from "../../constants/tokenPresets";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

// محدودیت‌های حجمی کلاینت
const SIZE_LIMITS = {
  maps: { bytes: 15 * 1024 * 1024, label: "۱۵ مگابایت", type: "MAP" },
  tokens: { bytes: 3 * 1024 * 1024, label: "۳ مگابایت", type: "TOKEN" },
  props: { bytes: 4 * 1024 * 1024, label: "۴ مگابایت", type: "PROP" },
};

export const AssetMenu = ({ isGM = false, permissions = {} }) => {
  const isAssetOpen = useCanvasStore((state) => state.isAssetMenuOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const currentScene = useSceneStore((state) => state.currentScene);
  const setMapForCurrentScene = useSceneStore((state) => state.setMapForCurrentScene);
  const addToken = useSceneStore((state) => state.addToken);

  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("maps"); // maps | tokens | props
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [userAssets, setUserAssets] = useState([]);
  const [uploadError, setUploadError] = useState("");

  // فرم ثبت لینک مستقیم (URL)
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [assetUrlInput, setAssetUrlInput] = useState("");
  const [assetNameInput, setAssetNameInput] = useState("");

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
      const typeParam = SIZE_LIMITS[activeTab]?.type || "TOKEN";
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

  // انتخاب و قرارگیری نقشه روی بوم
  const handleSelectMap = async (rawMapUrl, mapName, assetId = null) => {
    if (!canUploadMap) return;

    const fullMapUrl = getAssetUrl(rawMapUrl);
    await setMapForCurrentScene(fullMapUrl, mapName, assetId);

    const mapWidth = 2000;
    const mapHeight = 1500;
    const centerX = (window.innerWidth - mapWidth * 0.6) / 2;
    const centerY = (window.innerHeight - mapHeight * 0.6) / 2;
    setStagePos(Math.max(centerX, 20), Math.max(centerY, 20));
    setZoom(0.6);

    toggleMenu("asset");
  };

  // افزودن توکن یا شئ به صحنه
  const handleAddToken = (rawTokenUrl, tokenName, extraData = {}) => {
    if (!hasActiveMap) return;

    const fullUrl = getAssetUrl(rawTokenUrl);
    const newToken = {
      name: tokenName || "توکن جدید",
      avatarUrl: fullUrl,
      assetId: extraData.id || null,
      x: (currentScene?.mapWidth || 2000) / 2,
      y: (currentScene?.mapHeight || 1500) / 2,
      size: extraData.size || (activeTab === "props" ? 0.75 : 1),
      hp: extraData.maxHp || 20,
      maxHp: extraData.maxHp || 20,
      ac: extraData.ac || 12,
    };
    addToken(newToken);
  };

  // آپلود مستقیم فایل
  const handleDirectUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentLimit = SIZE_LIMITS[activeTab];
    if (file.size > currentLimit.bytes) {
      setUploadError(`حجم فایل بیشتر از حد مجاز است (حداکثر ${currentLimit.label})`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const assetName = file.name.replace(/\.[^/.]+$/, "");
      const uploaded = await assetApi.uploadAsset(file, assetName, currentLimit.type, { dpi: 150 });

      if (activeTab === "maps") {
        await handleSelectMap(uploaded.fileUrl, uploaded.name, uploaded.id);
      } else {
        handleAddToken(uploaded.fileUrl, uploaded.name, uploaded);
        loadAssets();
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || "خطا در آپلود فایل. لطفاً مجدداً امتحان کنید.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ثبت منبع از طریق لینک وب
  const handleAddFromUrl = async (e) => {
    e.preventDefault();
    if (!assetUrlInput.trim()) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const currentLimit = SIZE_LIMITS[activeTab];
      const name =
          assetNameInput.trim() || (activeTab === "maps" ? "نقشه اینترنتی" : activeTab === "props" ? "شئ اینترنتی" : "توکن اینترنتی");
      const created = await assetApi.createAssetFromUrl(assetUrlInput.trim(), name, currentLimit.type);

      setAssetUrlInput("");
      setAssetNameInput("");
      setShowUrlInput(false);

      if (activeTab === "maps") {
        await handleSelectMap(created.fileUrl, created.name, created.id);
      } else {
        handleAddToken(created.fileUrl, created.name, created);
        loadAssets();
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || "خطا در افزودن منبع از طریق لینک.");
    } finally {
      setIsUploading(false);
    }
  };

  // حذف است شخصی
  const handleDeleteAsset = async (e, assetId) => {
    e.stopPropagation();
    try {
      await assetApi.deleteAsset(assetId);
      loadAssets();
    } catch {
      setUploadError("خطا در حذف منبع.");
    }
  };

  // فیلتر پریست‌های دیفالت
  const filteredPresets =
      activeTab === "maps"
          ? (MAP_PRESETS || []).filter(
              (m) =>
                  (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (m.nameFa || "").includes(searchQuery)
          )
          : activeTab === "props"
              ? (TOKEN_PRESETS || []).filter(
                  (p) =>
                      p.category === "props" &&
                      ((p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.nameFa || "").includes(searchQuery))
              )
              : (TOKEN_PRESETS || []).filter(
                  (t) =>
                      t.category !== "props" &&
                      ((t.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.nameFa || "").includes(searchQuery))
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
              <p className="text-[11px] text-zinc-400">مدیریت نقشه‌ها، توکن‌ها و اشیاء</p>
            </div>
          </div>
          <button
              type="button"
              onClick={() => toggleMenu("asset")}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* تب‌های تفکیک‌شده (نقشه‌ها، توکن‌ها، اشیاء) */}
        <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 my-3">
          {[
            { id: "maps", label: "نقشه‌ها", icon: MapPin },
            { id: "tokens", label: "توکن‌ها", icon: Sparkles },
            { id: "props", label: "اشیاء", icon: Box },
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowUrlInput(false);
                      setUploadError("");
                    }}
                    className={cn(
                        "flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                        activeTab === tab.id
                            ? "bg-amber-500 text-zinc-950 shadow-md"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                    )}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
            );
          })}
        </div>

        {/* نوار جستجو و دکمه‌های آپلود/لینک */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در منابع..."
                className="w-full pl-3 pr-8 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <input
              type="file"
              ref={fileInputRef}
              onChange={handleDirectUpload}
              accept="image/*"
              className="hidden"
          />

          <Button
              size="sm"
              variant="secondary"
              className="text-xs font-bold shrink-0 cursor-pointer p-2 rounded-xl"
              onClick={() => setShowUrlInput(!showUrlInput)}
              title="افزودن با لینک وب"
          >
            <LinkIcon className="w-4 h-4 text-amber-400" />
          </Button>

          <Button
              size="sm"
              variant="amber"
              className="text-xs font-bold shrink-0 cursor-pointer shadow-md shadow-amber-500/20"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              disabled={activeTab === "maps" && !canUploadMap}
          >
            <Upload className="w-3.5 h-3.5 ml-1" />
            آپلود {activeTab === "maps" ? "نقشه" : activeTab === "tokens" ? "توکن" : "شئ"}
          </Button>
        </div>

        {/* فرم افزودن با لینک مستقیم وب */}
        {showUrlInput && (
            <form
                onSubmit={handleAddFromUrl}
                className="p-3 mb-3 bg-zinc-950/80 border border-amber-500/30 rounded-2xl space-y-2 animate-in fade-in"
            >
              <div className="text-[11px] font-bold text-amber-400">افزودن تصویر از وب (لینک مستقیم):</div>
              <input
                  type="url"
                  required
                  value={assetUrlInput}
                  onChange={(e) => setAssetUrlInput(e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-500 text-left"
                  dir="ltr"
              />
              <div className="flex gap-2">
                <input
                    type="text"
                    value={assetNameInput}
                    onChange={(e) => setAssetNameInput(e.target.value)}
                    placeholder="نام دلخواه (اختیاری)"
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
                <Button size="sm" variant="amber" type="submit" isLoading={isUploading} className="text-xs font-bold">
                  ثبت لینک
                </Button>
              </div>
            </form>
        )}

        {/* راهنمای حجم */}
        <div className="flex justify-between items-center px-1 mb-2 text-[10px] text-zinc-500 font-medium">
          <span>فرمت‌های مجاز: JPG, PNG, WEBP, GIF</span>
          <span>حداکثر حجم مجاز: {SIZE_LIMITS[activeTab]?.label}</span>
        </div>

        {uploadError && (
            <div className="mb-3 p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-[11px] text-rose-400 text-center font-bold">
              {uploadError}
            </div>
        )}

        {/* لیست منابع */}
        <div className="max-h-[48vh] overflow-y-auto pr-1 custom-scrollbar space-y-3">
          {/* ۱. نقشه‌ها */}
          {activeTab === "maps" && (
              <div>
                <span className="text-[11px] font-bold text-zinc-400 mb-2 block">نقشه‌های پیش‌فرض سیستم:</span>
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
                            src={getAssetUrl(map.url || map.thumbnailUrl)}
                            alt={map.name}
                            className="w-full h-24 object-cover group-hover:brightness-110"
                            loading="lazy"
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

          {/* ۲. توکن‌ها */}
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
                            src={getAssetUrl(token.avatarUrl || token.url)}
                            alt={token.name}
                            className="w-12 h-12 rounded-full object-cover border border-amber-500/30"
                            loading="lazy"
                        />
                        <span className="text-[11px] font-bold text-zinc-300 truncate max-w-full">
                    {token.nameFa || token.name}
                  </span>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* ۳. اشیاء (Props) */}
          {activeTab === "props" && (
              <div>
                <span className="text-[11px] font-bold text-zinc-400 mb-2 block">اشیاء و تجهیزات پیش‌فرض:</span>
                <div className="grid grid-cols-3 gap-2">
                  {filteredPresets.map((prop) => (
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
                            src={getAssetUrl(prop.avatarUrl)}
                            alt={prop.name}
                            className="w-12 h-12 rounded-xl object-contain border border-amber-500/30"
                            loading="lazy"
                        />
                        <span className="text-[11px] font-bold text-zinc-300 truncate max-w-full">
                    {prop.nameFa || prop.name}
                  </span>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* فایل‌های شخصی ذخیره‌شده کاربر */}
          {filteredUserAssets.length > 0 && (
              <div className="pt-3 border-t border-zinc-800/80">
            <span className="text-[11px] font-bold text-amber-400/90 mb-2 block">
              فایل‌های شخصی ذخیره‌شده شما ({SIZE_LIMITS[activeTab]?.label}):
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
                              "group relative p-1.5 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col items-center gap-1 transition-all",
                              !hasActiveMap && asset.type !== "MAP"
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:border-amber-500 cursor-pointer"
                          )}
                      >
                        <img
                            src={getAssetUrl(asset.fileUrl)}
                            alt={asset.name}
                            className="w-10 h-10 object-cover rounded-lg"
                            loading="lazy"
                        />
                        <span className="text-[10px] text-zinc-300 truncate max-w-full">{asset.name}</span>

                        <button
                            type="button"
                            onClick={(e) => handleDeleteAsset(e, asset.id)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="حذف"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                  ))}
                </div>
              </div>
          )}
        </div>
      </div>
  );
};