import React, { useState, useEffect } from "react";
import {
  Heart,
  Trash2,
  Plus,
  Minus,
  Activity,
  Eye,
  FileText,
  Coins,
  X,
  Check,
  User,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { useRoomStore } from "../../store/room.store";
import { usePermissions } from "../../hooks/usePermissions";
import { wsService } from "../../services/websocket.service";
import { getAssetUrl } from "../../api/asset.api";

// کاتالوگ وضعیت‌های D&D 5e
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

export const TokenEditorModal = () => {
  const isEditing = useCanvasStore((state) => state.isTokenEditorOpen);
  const editingTokenId = useCanvasStore((state) => state.editingTokenId);
  const closeEditor = useCanvasStore((state) => state.closeTokenEditor);

  const currentScene = useSceneStore((state) => state.currentScene);
  const updateToken = useSceneStore((state) => state.updateToken);
  const removeToken = useSceneStore((state) => state.removeToken);
  const availableConditions = useSceneStore((state) => state.availableConditions || []);
  const addAvailableCondition = useSceneStore((state) => state.addAvailableCondition);
  const removeAvailableCondition = useSceneStore((state) => state.removeAvailableCondition);

  const { isGM: hookIsGM, permissions } = usePermissions();
  const currentUser = useAuthStore((state) => state.user);
  const currentRoom = useRoomStore((state) => state.currentRoom);

  const isRoomHost =
      currentRoom?.creatorId &&
      currentUser?.id &&
      String(currentRoom.creatorId) === String(currentUser.id);

  const isGM = Boolean(
      hookIsGM ||
      isRoomHost ||
      currentUser?.role === "GM" ||
      currentUser?.role === "ADMIN"
  );

  const token = currentScene?.tokens?.find((t) => String(t.id) === String(editingTokenId));

  const tokenOwner = token?.controlledBy ? String(token.controlledBy).toLowerCase() : "";
  const userId = currentUser?.id ? String(currentUser.id).toLowerCase() : "";
  const userName = currentUser?.username ? String(currentUser.username).toLowerCase() : "";
  const userEmail = currentUser?.email ? String(currentUser.email).toLowerCase() : "";

  const isOwner = Boolean(
      tokenOwner &&
      (tokenOwner === userId || tokenOwner === userName || tokenOwner === userEmail)
  );

  // دسترسی ادیت
  const canEdit = isGM || (isOwner && Boolean(permissions?.canEditToken));

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
  const [goldValue, setGoldValue] = useState(0);
  const [xpValue, setXpValue] = useState(0);

  const [showHp, setShowHp] = useState(true);
  const [showName, setShowName] = useState(true);
  const [showAc, setShowAc] = useState(false);
  const [showConditions, setShowConditions] = useState(true);
  const [showNotes, setShowNotes] = useState(false);

  const [selectedConditions, setSelectedConditions] = useState([]);
  const [showAddConditionPicker, setShowAddConditionPicker] = useState(false);

  useEffect(() => {
    if (token) {
      setName(token.label || token.name || "");
      setAvatarUrl(token.avatarUrl || token.assetUrl || "");
      setHp(token.hp !== undefined ? token.hp : (token.maxHp || 20));
      setMaxHp(token.maxHp !== undefined ? token.maxHp : 20);
      setAc(token.ac || 14);
      setSize(token.size || 1);
      setIsHidden(token.isHidden || false);
      setIsLocked(token.isLocked || false);
      setGmNotes(token.gmNotes || "");
      setGoldValue(token.goldValue || 0);
      setXpValue(token.xpValue || 0);

      setShowHp(token.showHp !== false);
      setShowName(token.showName !== false);
      setShowAc(Boolean(token.showAc));
      setShowConditions(token.showConditions !== false);
      setShowNotes(Boolean(token.showNotes));
      setSelectedConditions(token.conditions || []);
      setShowAddConditionPicker(false);
    }
  }, [token, isEditing]);

  if (!isEditing || !token) return null;

  const handleSave = () => {
    const updated = {
      name,
      label: name,
      avatarUrl,
      hp,
      maxHp,
      ac,
      size,
      isHidden,
      isLocked,
      gmNotes,
      goldValue,
      xpValue,
      showHp,
      showName,
      showAc,
      showConditions,
      showNotes,
      conditions: selectedConditions,
    };

    updateToken(token.id, updated);
    wsService.send("TOKEN_MOVE", { tokenId: String(token.id), ...updated });
    closeEditor();
  };

  const handleDelete = () => {
    if (!isGM && !isOwner) return;
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
    if (removeAvailableCondition) {
      removeAvailableCondition(condId);
    }
    setSelectedConditions((prev) => prev.filter((c) => c !== condId));
  };

  return (
      <Modal
          isOpen={isEditing}
          onClose={closeEditor}
          title={isProp ? "تنظیمات شیء / پراپ" : "تنظیمات مشخصات و وضعیت توکن"}
          titleFa={isProp ? "Object Properties" : "Token Properties & Conditions"}
          maxWidth="md"
      >
        <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1 font-fa text-zinc-200 select-none" dir="rtl">
          {/* نام و آواتار کاراکتر */}
          <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/50 bg-zinc-900 shrink-0">
              {avatarUrl ? (
                  <img src={getAssetUrl(avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                  <User className="w-8 h-8 m-auto text-zinc-600 mt-2.5" />
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <Input
                  label={isProp ? "نام شیء" : "نام کاراکتر"}
                  value={name}
                  disabled={!isGM && !isOwner}
                  onChange={(e) => setName(e.target.value)}
              />
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">آدرس لینک تصویر / آیکون:</label>
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
          </div>

          {/* بخش HP و نوار جان */}
          {!isProp && (
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-100">
                    <Heart className="w-4 h-4 text-emerald-400" />
                    <span>نوار سلامتی (HP)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">HP فعلی:</label>
                    <input
                        type="number"
                        disabled={!canEdit}
                        value={hp}
                        onChange={(e) => setHp(Number(e.target.value))}
                        className="w-full h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">حداکثر Max HP:</label>
                    <input
                        type="number"
                        disabled={!canEdit}
                        value={maxHp}
                        onChange={(e) => setMaxHp(Math.max(1, Number(e.target.value)))}
                        className="w-full h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                {canEdit && (
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
                )}
              </div>
          )}

          {/* اشیاء (Props) */}
          {isProp && (
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Coins className="w-4 h-4" />
                  <span>ارزش و پاداش تعاملی شیء</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">ارزش سکه طلا (Gold GP):</label>
                    <input
                        type="number"
                        disabled={!isGM}
                        value={goldValue}
                        onChange={(e) => setGoldValue(Number(e.target.value))}
                        className="w-full h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">امتیاز تجربه (XP Value):</label>
                    <input
                        type="number"
                        disabled={!isGM}
                        value={xpValue}
                        onChange={(e) => setXpValue(Number(e.target.value))}
                        className="w-full h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-purple-400 focus:outline-none focus:border-purple-500 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
          )}

          {/* وضعیت‌ها (Conditions) */}
          {!isProp && (
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-100">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>فهرست شرایط و وضعیت‌ها (حداکثر ۳ مورد)</span>
                  </div>

                  {isGM && (
                      <button
                          type="button"
                          onClick={() => setShowAddConditionPicker(!showAddConditionPicker)}
                          className="text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold cursor-pointer transition-all shadow-md shadow-amber-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" /> افزودن به فهرست
                      </button>
                  )}
                </div>

                {showAddConditionPicker && isGM && (
                    <div className="p-3 bg-zinc-900 rounded-2xl border border-amber-500/50 space-y-2 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400 pb-1.5 border-b border-zinc-800">
                        <span>انتخاب وضعیت برای افزودن به فهرست پیش‌فرض همه توکن‌ها:</span>
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
                      <div className="col-span-2 text-center py-4 text-xs text-zinc-500">
                        فهرست خالی است. از دکمه «افزودن به فهرست» استفاده کنید.
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

          {/* زره و ابعاد */}
          <div className="grid grid-cols-2 gap-2">
            {!isProp && (
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">زره (AC):</label>
                  <input
                      type="number"
                      disabled={!canEdit}
                      value={ac}
                      onChange={(e) => setAc(Number(e.target.value))}
                      className="w-full h-9 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-blue-400 focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />
                </div>
            )}
            <div className={isProp ? "col-span-2" : ""}>
              <label className="text-[11px] text-zinc-400 block mb-1">اندازه در گرید:</label>
              <select
                  value={size}
                  disabled={!isGM}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full h-9 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-500 disabled:opacity-60"
              >
                <option value={0.5}>0.5x0.5 (Tiny / Prop)</option>
                <option value={1}>1x1 (Medium)</option>
                <option value={2}>2x2 (Large)</option>
                <option value={3}>3x3 (Huge)</option>
                <option value={4}>4x4 (Gargantuan)</option>
              </select>
            </div>
          </div>

          {/* شرح و یادداشت GM */}
          {isGM && (
              <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400/90">
                  <FileText className="w-4 h-4" />
                  <span>یادداشت و شرح GM (اختیاری):</span>
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

          {/* تاگل‌های نمایش */}
          {isGM && (
              <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
                <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 mb-1">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>تنظیمات نمایش جزئیات روی بوم:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                        type="checkbox"
                        checked={showName}
                        onChange={(e) => setShowName(e.target.checked)}
                        className="accent-amber-500 rounded"
                    />
                    <span>نمایش نام</span>
                  </label>

                  {!isProp && (
                      <>
                        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                          <input
                              type="checkbox"
                              checked={showHp}
                              onChange={(e) => setShowHp(e.target.checked)}
                              className="accent-amber-500 rounded"
                          />
                          <span>نمایش نوار جان (HP)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                          <input
                              type="checkbox"
                              checked={showAc}
                              onChange={(e) => setShowAc(e.target.checked)}
                              className="accent-amber-500 rounded"
                          />
                          <span>نمایش نشان زره (AC)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                          <input
                              type="checkbox"
                              checked={showConditions}
                              onChange={(e) => setShowConditions(e.target.checked)}
                              className="accent-amber-500 rounded"
                          />
                          <span>نمایش کاندیشن‌ها (حداکثر ۳)</span>
                        </label>
                      </>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                        type="checkbox"
                        checked={showNotes}
                        onChange={(e) => setShowNotes(e.target.checked)}
                        className="accent-amber-500 rounded"
                    />
                    <span>نمایش نوت GM</span>
                  </label>
                </div>
              </div>
          )}

          {/* فوتر */}
          <div className="pt-3 flex items-center justify-between border-t border-zinc-800">
            {(isGM || isOwner) && (
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