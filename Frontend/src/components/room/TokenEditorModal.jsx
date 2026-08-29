import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Trash2,
  Plus,
  Minus,
  Activity,
  User,
  Upload,
  Image as ImageIcon,
  Shield,
  Maximize2,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  Eye,
  Key,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { useRoomStore } from "../../store/room.store";
import { usePermissions } from "../../hooks/usePermissions";
import { wsService } from "../../services/websocket.service";
import { getAssetUrl, assetApi } from "../../api/asset.api";

const PRESET_TOKEN_ICONS = [
  { id: "knight", label: "شوالیه / جنگجو", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4" },
  { id: "mage", label: "جادوگر / ویچ", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria&backgroundColor=ffdfbf" },
  { id: "rogue", label: "روگ / قاتل", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow&backgroundColor=c0aede" },
  { id: "cleric", label: "کشیش / پالادین", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Thorin&backgroundColor=d1d4f9" },
  { id: "ranger", label: "کماندار / رنجر", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=ffd5dc" },
  { id: "barbarian", label: "بربرین / وحشی", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Garen&backgroundColor=ffdfbf" },
  { id: "warlock", label: "وارلاک / شیاطین", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Morgath&backgroundColor=c0aede" },
  { id: "elf", label: "الف / دروید", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Valkyrie&backgroundColor=b6e3f4" },
  { id: "monster", label: "هیولا / اورک", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Golem&backgroundColor=ffd5dc" },
  { id: "dragon", label: "دراگون / تایتان", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Dragon&backgroundColor=ffdfbf" },
];

const ALL_DND_CONDITIONS = [
  { id: "blinded", nameFa: "کور شده (Blinded)", icon: "🙈" },
  { id: "charmed", nameFa: "افسون شده (Charmed)", icon: "💖" },
  { id: "deafened", nameFa: "ناشنوا (Deafened)", icon: "🙉" },
  { id: "frightened", nameFa: "وحشت‌زده (Frightened)", icon: "😨" },
  { id: "grappled", nameFa: "گلاویز شده (Grappled)", icon: "🤼" },
  { id: "incapacitated", nameFa: "ناتوان (Incapacitated)", icon: "💫" },
  { id: "invisible", nameFa: "نامرئی (Invisible)", icon: "👻" },
  { id: "paralyzed", nameFa: "فلج شده (Paralyzed)", icon: "⚡" },
  { id: "petrified", nameFa: "سنگ شده (Petrified)", icon: "🗿" },
  { id: "poisoned", nameFa: "مسموم (Poisoned)", icon: "🤢" },
  { id: "prone", nameFa: "افتاده به خاک (Prone)", icon: "🛌" },
  { id: "restrained", nameFa: "در بند (Restrained)", icon: "⛓️" },
  { id: "stunned", nameFa: "گیج شده (Stunned)", icon: "😵" },
  { id: "unconscious", nameFa: "بیهوش (Unconscious)", icon: "💤" },
  { id: "exhaustion", nameFa: "خستگی شدید (Exhaustion)", icon: "😫" },
  { id: "bleeding", nameFa: "خونریزی (Bleeding)", icon: "🩸" },
];

const MAX_TOKEN_FILE_SIZE = 3 * 1024 * 1024; // 3MB

const isValidImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("/uploads/") ||
      trimmed.startsWith("blob:")
  );
};

const safeAssetUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("/uploads/") ||
      trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  return getAssetUrl ? getAssetUrl(trimmed) : trimmed;
};

export const TokenEditorModal = ({ roomData }) => {
  const isEditing = useCanvasStore((state) => state.isTokenEditorOpen);
  const editingTokenId = useCanvasStore((state) => state.editingTokenId);
  const closeEditor = useCanvasStore((state) => state.closeTokenEditor);

  const currentScene = useSceneStore((state) => state.currentScene);
  const updateToken = useSceneStore((state) => state.updateToken);
  const removeToken = useSceneStore((state) => state.removeToken);
  const availableConditions = useSceneStore((state) => state.availableConditions || []);
  const addAvailableCondition = useSceneStore((state) => state.addAvailableCondition);
  const removeAvailableCondition = useSceneStore((state) => state.removeAvailableCondition);

  const storeRoom = useRoomStore((state) => state.currentRoom || state.room || state.activeRoom);
  const currentRoom = roomData || storeRoom;
  const { isGM, canMoveToken } = usePermissions(currentRoom);
  const currentUser = useAuthStore((state) => state.user);

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  const token = currentScene?.tokens?.find((t) => String(t.id) === String(editingTokenId));

  const tokenOwner = token?.controlledBy ? String(token.controlledBy).toLowerCase().trim() : "";
  const userId = currentUser?.id ? String(currentUser.id).toLowerCase().trim() : "";
  const userAltId = currentUser?.userId ? String(currentUser.userId).toLowerCase().trim() : "";
  const userName = currentUser?.username ? String(currentUser.username).toLowerCase().trim() : "";
  const userEmail = currentUser?.email ? String(currentUser.email).toLowerCase().trim() : "";
  const tokenLabel = String(token?.label || token?.name || "").toLowerCase().trim();

  const isOwner = Boolean(
      !tokenOwner ||
      tokenOwner === userId ||
      (userAltId && tokenOwner === userAltId) ||
      (userName && tokenOwner === userName) ||
      (userEmail && tokenOwner === userEmail) ||
      (userName && tokenLabel === userName) ||
      canMoveToken(token?.controlledBy)
  );

  const canEditBasic = Boolean(isGM || isOwner);

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [hp, setHp] = useState(20);
  const [maxHp, setMaxHp] = useState(20);
  const [ac, setAc] = useState(14);
  const [size, setSize] = useState(1);
  const [isHidden, setIsHidden] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [gmNotes, setGmNotes] = useState("");
  const [calcInput, setCalcInput] = useState("");

  const isProp = Boolean(token?.isProp);

  // ۱. تاگل‌های نمایش روی بوم (Canvas Display)
  const [showHp, setShowHp] = useState(true);
  const [showConditions, setShowConditions] = useState(true);
  const [showAc, setShowAc] = useState(true);

  // ۲. تاگل‌های پرمیشن دسترسی پلیر (Player Modal Access)
  const [allowPlayerHp, setAllowPlayerHp] = useState(true);
  const [allowPlayerConditions, setAllowPlayerConditions] = useState(true);
  const [allowPlayerAc, setAllowPlayerAc] = useState(true);
  const [allowPlayerSize, setAllowPlayerSize] = useState(true);

  const [selectedConditions, setSelectedConditions] = useState([]);
  const [showAddConditionPicker, setShowAddConditionPicker] = useState(false);

  useEffect(() => {
    if (token) {
      setName(token.label || token.name || "");

      // فقط در صورتی که آدرس یک URL معتبر باشد پر می‌شود، در غیر این صورت خالی است
      const rawAvatar = token.avatarUrl || token.assetUrl || "";
      setAvatarUrl(isValidImageUrl(rawAvatar) ? rawAvatar : "");

      setHp(token.hp !== undefined ? token.hp : (token.maxHp || 20));
      setMaxHp(token.maxHp !== undefined ? token.maxHp : 20);
      setAc(token.ac !== undefined ? token.ac : 14);
      setSize(token.size || 1);
      setIsHidden(Boolean(token.isHidden));
      setIsLocked(Boolean(token.isLocked));
      setGmNotes(token.gmNotes || "");

      setShowHp(token.showHp === false ? false : true);
      setShowConditions(token.showConditions === false ? false : true);
      setShowAc(token.showAc === false ? false : true);

      setAllowPlayerHp(token.allowPlayerHp === false ? false : true);
      setAllowPlayerConditions(token.allowPlayerConditions === false ? false : true);
      setAllowPlayerAc(token.allowPlayerAc === false ? false : true);
      setAllowPlayerSize(token.allowPlayerSize === false ? false : true);

      setSelectedConditions(token.conditions || []);
      setShowAddConditionPicker(false);
      setShowPresetPicker(false);
      setUploadError("");
    }
  }, [token, isEditing]);

  if (!isEditing || !token) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_TOKEN_FILE_SIZE) {
      setUploadError("حجم تصویر توکن نمی‌تواند بیشتر از ۳ مگابایت باشد.");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      let uploadedUrl = "";
      if (assetApi && typeof assetApi.uploadAsset === "function") {
        const res = await assetApi.uploadAsset(file, "TOKEN");
        uploadedUrl = res.fileUrl || res.url || res.data?.fileUrl || "";
      } else {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "TOKEN");
        const jwt = localStorage.getItem("vtt_jwt") || localStorage.getItem("token");
        const res = await fetch("/api/assets/upload", {
          method: "POST",
          headers: {
            Authorization: jwt ? `Bearer ${jwt}` : "",
          },
          body: formData,
        });
        const data = await res.json();
        uploadedUrl = data.fileUrl || data.url || "";
      }

      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
      }
    } catch (err) {
      console.error("خطا در آپلود تصویر توکن:", err);
      setUploadError("آپلود تصویر با خطا مواجه شد.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!canEditBasic) return;

    const finalName = name.trim() || token.label || token.name || "توکن کاراکتر";
    const finalAvatar = avatarUrl.trim() || "";

    const updated = {
      name: finalName,
      label: finalName,
      avatarUrl: finalAvatar,
      assetUrl: finalAvatar,
      ...(isGM || allowPlayerHp ? { hp, maxHp } : {}),
      ...(isGM || allowPlayerAc ? { ac } : {}),
      ...(isGM || allowPlayerSize ? { size } : {}),
      ...(isGM || allowPlayerConditions ? { conditions: selectedConditions } : {}),
      showHp: isGM ? showHp : token.showHp,
      showConditions: isGM ? showConditions : token.showConditions,
      showAc: isGM ? showAc : token.showAc,
      allowPlayerHp: isGM ? allowPlayerHp : token.allowPlayerHp,
      allowPlayerConditions: isGM ? allowPlayerConditions : token.allowPlayerConditions,
      allowPlayerAc: isGM ? allowPlayerAc : token.allowPlayerAc,
      allowPlayerSize: isGM ? allowPlayerSize : token.allowPlayerSize,
      ...(isGM ? {
        isHidden,
        isLocked,
        gmNotes,
      } : {}),
    };

    updateToken(token.id, updated);
    wsService.send("TOKEN_MOVE", { tokenId: String(token.id), ...updated });
    closeEditor();
  };

  const handleDelete = () => {
    if (!isGM) return;
    removeToken(token.id);
    wsService.send("TOKEN_MOVE", { tokenId: String(token.id), isDeleted: true });
    closeEditor();
  };

  const handleApplyDamage = () => {
    const amount = parseInt(calcInput, 10);
    if (isNaN(amount) || amount <= 0) return;
    setHp((prev) => Math.max(0, prev - amount));
    setCalcInput("");
  };

  const handleApplyHeal = () => {
    const amount = parseInt(calcInput, 10);
    if (isNaN(amount) || amount <= 0) return;
    setHp((prev) => Math.min(maxHp, prev + amount));
    setCalcInput("");
  };

  const handleToggleSelectCondition = (condId) => {
    if (selectedConditions.includes(condId)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== condId));
    } else {
      if (selectedConditions.length >= 3) {
        alert("حداکثر می‌توانید ۳ وضعیت فعال را به صورت همزمان برای هر توکن انتخاب کنید.");
        return;
      }
      setSelectedConditions([...selectedConditions, condId]);
    }
  };

  const handleAddConditionToPool = (condId) => {
    if (addAvailableCondition) {
      addAvailableCondition(condId);
    }
    setShowAddConditionPicker(false);
  };

  const handleRemoveConditionFromPool = (e, condId) => {
    e.stopPropagation();
    if (!isGM) return;
    if (removeAvailableCondition) {
      removeAvailableCondition(condId);
    }
    setSelectedConditions((prev) => prev.filter((c) => c !== condId));
  };

  const hasValidAvatar = isValidImageUrl(avatarUrl);

  return (
      <Modal
          isOpen={isEditing}
          onClose={closeEditor}
          title={isProp ? "تنظیمات شیء / پراپ" : "تنظیمات مشخصات و وضعیت توکن"}
          titleFa={isProp ? "Object Properties" : "Token Properties & Conditions"}
          maxWidth="md"
      >
        <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1 font-fa text-zinc-200 select-none" dir="rtl">

          {/* ۱. نام و آواتار کاراکتر */}
          <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/50 bg-zinc-900 shrink-0 shadow-inner flex items-center justify-center">
                {hasValidAvatar ? (
                    <img
                        src={safeAssetUrl(avatarUrl)}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarUrl("")}
                    />
                ) : (
                    <User className="w-8 h-8 text-zinc-600" />
                )}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] text-amber-400 font-bold">
                      ...
                    </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    {isProp ? "نام شیء:" : "نام کاراکتر:"}
                  </label>
                  <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="نام توکن را وارد کنید..."
                      className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                  />
                  <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isUploading ? "در حال آپلود..." : "آپلود عکس (تا ۳MB)"}</span>
                  </button>

                  <button
                      type="button"
                      onClick={() => setShowPresetPicker(!showPresetPicker)}
                      className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>آیکون‌های آماده</span>
                  </button>
                </div>
              </div>
            </div>

            {uploadError && (
                <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                  {uploadError}
                </div>
            )}

            {/* گالری آیکون‌های آماده */}
            {showPresetPicker && (
                <div className="p-3 bg-zinc-900 rounded-xl border border-amber-500/40 space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-bold border-b border-zinc-800 pb-1.5">
                    <span>انتخاب آیکون آماده فانتزی:</span>
                    <button
                        type="button"
                        onClick={() => setShowPresetPicker(false)}
                        className="text-zinc-400 hover:text-zinc-200 cursor-pointer p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                    {PRESET_TOKEN_ICONS.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setAvatarUrl(preset.url);
                              setShowPresetPicker(false);
                            }}
                            className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                avatarUrl === preset.url
                                    ? "border-amber-500 bg-amber-500/20"
                                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                            }`}
                        >
                          <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-10 h-10 rounded-full object-cover bg-zinc-800"
                              loading="lazy"
                          />
                          <span className="text-[9px] text-zinc-300 truncate w-full text-center">{preset.label}</span>
                        </button>
                    ))}
                  </div>
                </div>
            )}

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">یا آدرس مستقیم لینک اینترنتی تصویر:</label>
              <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://... یا /uploads/..."
                  className="w-full h-7 px-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-zinc-300 focus:outline-none focus:border-amber-500 font-mono"
                  dir="ltr"
              />
            </div>
          </div>

          {/* ۲. بخش نوار سلامتی (HP) با دو تاگل تفکیک‌شده برای GM */}
          {!isProp && (isGM || allowPlayerHp) && (
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-100">
                    <Heart className="w-4 h-4 text-emerald-400" />
                    <span>نوار سلامتی (HP)</span>
                  </div>

                  {isGM && (
                      <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setAllowPlayerHp(!allowPlayerHp)}
                            className={`text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer ${
                                allowPlayerHp ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                            }`}
                            title="اعطای پرمیشن مشاهده و ویرایش این بخش در مودال به پلیر"
                        >
                          <Key className="w-3 h-3 text-amber-400" />
                          <span>{allowPlayerHp ? "دسترسی پلیر: فعال" : "دسترسی پلیر: قفل"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowHp(!showHp)}
                            className={`text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer ${
                                showHp ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                            }`}
                            title="نمایش نوار سلامتی روی توکن در صفحه بازی"
                        >
                          <Eye className="w-3 h-3 text-emerald-400" />
                          <span>{showHp ? "نمایش روی توکن" : "مخفی از توکن"}</span>
                        </button>
                      </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">HP فعلی:</label>
                    <input
                        type="number"
                        value={hp}
                        onChange={(e) => setHp(Number(e.target.value))}
                        className="w-full h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">حداکثر Max HP:</label>
                    <input
                        type="number"
                        value={maxHp}
                        onChange={(e) => setMaxHp(Math.max(1, Number(e.target.value)))}
                        className="w-full h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                      type="number"
                      placeholder="مقدار..."
                      value={calcInput}
                      onChange={(e) => setCalcInput(e.target.value)}
                      className="w-24 h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none"
                  />
                  <button
                      type="button"
                      onClick={handleApplyDamage}
                      className="flex-1 py-1 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg hover:bg-rose-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" /> آسیب
                  </button>
                  <button
                      type="button"
                      onClick={handleApplyHeal}
                      className="flex-1 py-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> شفا
                  </button>
                </div>
              </div>
          )}

          {/* ۳. وضعیت‌ها (Conditions) */}
          {!isProp && (isGM || allowPlayerConditions) && (
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-100">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>فهرست شرایط و وضعیت‌ها (حداکثر ۳ مورد)</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isGM && (
                        <>
                          <button
                              type="button"
                              onClick={() => setAllowPlayerConditions(!allowPlayerConditions)}
                              className={`text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer ${
                                  allowPlayerConditions ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                              }`}
                              title="اعطای پرمیشن انتخاب وضعیت‌ها به پلیر"
                          >
                            <Key className="w-3 h-3 text-amber-400" />
                            <span>{allowPlayerConditions ? "دسترسی: فعال" : "دسترسی: قفل"}</span>
                          </button>

                          <button
                              type="button"
                              onClick={() => setShowConditions(!showConditions)}
                              className={`text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer ${
                                  showConditions ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                              }`}
                              title="نمایش آیکون کاندیشن‌ها روی توکن در بوم"
                          >
                            <Eye className="w-3 h-3 text-amber-400" />
                            <span>{showConditions ? "نمایش روی توکن" : "مخفی از توکن"}</span>
                          </button>

                          <button
                              type="button"
                              onClick={() => setShowAddConditionPicker(!showAddConditionPicker)}
                              className="text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 px-2 py-1 rounded-lg flex items-center gap-1 font-bold cursor-pointer transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> افزودن
                          </button>
                        </>
                    )}
                  </div>
                </div>

                {showAddConditionPicker && isGM && (
                    <div className="p-3 bg-zinc-900 rounded-2xl border border-amber-500/50 space-y-2 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400 pb-1.5 border-b border-zinc-800">
                        <span>انتخاب وضعیت برای افزودن به فهرست پیش‌فرض:</span>
                        <button
                            type="button"
                            onClick={() => setShowAddConditionPicker(false)}
                            className="text-zinc-400 hover:text-zinc-200 cursor-pointer p-1 rounded-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {ALL_DND_CONDITIONS.map((cond) => {
                          const isAlreadyInPool = availableConditions.includes(cond.id);
                          return (
                              <button
                                  key={cond.id}
                                  type="button"
                                  disabled={isAlreadyInPool}
                                  onClick={() => handleAddConditionToPool(cond.id)}
                                  className={`p-2 rounded-xl text-right text-xs flex items-center justify-between transition-all ${
                                      isAlreadyInPool
                                          ? "bg-zinc-950/60 text-zinc-600 border border-transparent cursor-not-allowed opacity-50"
                                          : "bg-zinc-950 border border-zinc-800 hover:border-amber-500 hover:bg-zinc-800 text-zinc-200 cursor-pointer"
                                  }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="text-base">{cond.icon}</span>
                                  <span className="truncate text-[11px] font-medium">{cond.nameFa}</span>
                                </div>
                                {isAlreadyInPool && <span className="text-[10px] text-zinc-500 font-bold">در فهرست</span>}
                              </button>
                          );
                        })}
                      </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {availableConditions.length === 0 ? (
                      <div className="col-span-2 text-center py-3 text-xs text-zinc-500">
                        هیچ وضعیتی انتخاب نشده است.
                      </div>
                  ) : (
                      availableConditions.map((condId) => {
                        const condDef = ALL_DND_CONDITIONS.find((c) => c.id === condId) || {
                          nameFa: condId,
                          icon: "⚡",
                        };
                        const isSelected = selectedConditions.includes(condId);

                        return (
                            <div
                                key={condId}
                                onClick={() => handleToggleSelectCondition(condId)}
                                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                    isSelected
                                        ? "bg-amber-500/15 border-amber-400 text-amber-300 font-bold shadow-sm shadow-amber-500/10"
                                        : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-base">{condDef.icon}</span>
                                <span className="text-xs truncate">{condDef.nameFa}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isSelected && (
                                    <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                                )}
                                {isGM && (
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemoveConditionFromPool(e, condId)}
                                        className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 cursor-pointer transition-colors"
                                        title="حذف از فهرست کلی بازی"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                              </div>
                            </div>
                        );
                      })
                  )}
                </div>
              </div>
          )}

          {/* ۴. زره و اندازه در گرید */}
          <div className="grid grid-cols-2 gap-2">
            {!isProp && (isGM || allowPlayerAc) && (
                <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                      <span>زره (AC):</span>
                    </label>
                    {isGM && (
                        <div className="flex items-center gap-1">
                          <button
                              type="button"
                              onClick={() => setAllowPlayerAc(!allowPlayerAc)}
                              className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-medium transition-all cursor-pointer ${
                                  allowPlayerAc ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                              }`}
                              title="پرمیشن پلیر"
                          >
                            <Key className="w-2.5 h-2.5 text-amber-400" />
                            <span>{allowPlayerAc ? "دسترسی" : "قفل"}</span>
                          </button>
                          <button
                              type="button"
                              onClick={() => setShowAc(!showAc)}
                              className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-medium transition-all cursor-pointer ${
                                  showAc ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                              }`}
                              title="نمایش نشان روی توکن"
                          >
                            <Eye className="w-2.5 h-2.5 text-blue-400" />
                            <span>{showAc ? "نمایش" : "مخفی"}</span>
                          </button>
                        </div>
                    )}
                  </div>
                  <input
                      type="number"
                      value={ac}
                      onChange={(e) => setAc(Number(e.target.value))}
                      className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-blue-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
            )}

            {(isGM || allowPlayerSize) && (
                <div className={`p-3 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2 ${isProp || (!allowPlayerAc && !isGM) ? "col-span-2" : ""}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>اندازه در گرید:</span>
                    </label>
                    {isGM && (
                        <button
                            type="button"
                            onClick={() => setAllowPlayerSize(!allowPlayerSize)}
                            className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium transition-all cursor-pointer ${
                                allowPlayerSize ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                            }`}
                            title="پرمیشن تغییر اندازه توسط پلیر"
                        >
                          <Key className="w-2.5 h-2.5 text-amber-400" />
                          <span>{allowPlayerSize ? "دسترسی پلیر: فعال" : "دسترسی پلیر: قفل"}</span>
                        </button>
                    )}
                  </div>
                  <select
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value={0.5}>0.5x0.5 (Tiny / Prop)</option>
                    <option value={1}>1x1 (Medium)</option>
                    <option value={2}>2x2 (Large)</option>
                    <option value={3}>3x3 (Huge)</option>
                    <option value={4}>4x4 (Gargantuan)</option>
                  </select>
                </div>
            )}
          </div>

          {/* ۵. شرح و یادداشت GM */}
          {isGM && (
              <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1.5">
                <div className="text-xs font-bold text-amber-400/90">
                  <span>یادداشت GM (مخفی از همه بازیکنان):</span>
                </div>
                <textarea
                    rows={2}
                    value={gmNotes}
                    onChange={(e) => setGmNotes(e.target.value)}
                    placeholder="توضیحات مخفی، معما، تله یا لوت این مورد..."
                    className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>
          )}

          {/* فوتر */}
          <div className="pt-3 flex items-center justify-between border-t border-zinc-800">
            {isGM && (
                <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف توکن
                </button>
            )}

            <div className="flex gap-2 mr-auto">
              <Button variant="ghost" onClick={closeEditor}>
                انصراف
              </Button>
              <Button variant="amber" onClick={handleSave}>
                ذخیره تغییرات
              </Button>
            </div>
          </div>
        </div>
      </Modal>
  );
};