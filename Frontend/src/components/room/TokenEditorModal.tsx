import React, { useState, useEffect } from "react";
import {
  Shield,
  Heart,
  EyeOff,
  Trash2,
  Plus,
  Minus,
  Eye,
  Lock,
  Sparkles,
  Layers,
  Search,
  Activity,
  Flame,
  Zap,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { wsService } from "../../services/websocket.service";
import { TokenHpVisibility, TokenHpStyle } from "../../types";
import { STATUS_CONDITIONS, CONDITION_MAP, ConditionDef } from "../../constants/conditions";

export const TokenEditorModal: React.FC = () => {
  const isEditing = useCanvasStore((state) => state.isTokenEditorOpen);
  const editingTokenId = useCanvasStore((state) => state.editingTokenId);
  const closeEditor = useCanvasStore((state) => state.closeTokenEditor);

  const currentScene = useSceneStore((state) => state.currentScene);
  const updateToken = useSceneStore((state) => state.updateToken);
  const deleteToken = useSceneStore((state) => state.deleteToken);
  const { isGM } = usePermissions();

  const token = currentScene?.tokens.find((t) => t.id === editingTokenId);

  const [name, setName] = useState("");
  const [hp, setHp] = useState<number>(20);
  const [maxHp, setMaxHp] = useState<number>(20);
  const [tempHp, setTempHp] = useState<number>(0);
  const [showHpBar, setShowHpBar] = useState<boolean>(true);
  const [hpVisibility, setHpVisibility] = useState<TokenHpVisibility>("all");
  const [hpStyle, setHpStyle] = useState<TokenHpStyle>("bar_numbers");
  const [ac, setAc] = useState<number>(14);
  const [elevation, setElevation] = useState<number>(0);
  const [size, setSize] = useState<number>(1);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [conditions, setConditions] = useState<string[]>([]);
  const [calcInput, setCalcInput] = useState<string>("");
  const [conditionCategory, setConditionCategory] = useState<string>("all");
  const [conditionSearch, setConditionSearch] = useState<string>("");

  useEffect(() => {
    if (token) {
      setName(token.name);
      setHp(token.hp !== undefined ? token.hp : 20);
      setMaxHp(token.maxHp !== undefined ? token.maxHp : 20);
      setTempHp(token.tempHp !== undefined ? token.tempHp : 0);
      setShowHpBar(token.showHpBar !== false);
      setHpVisibility(token.hpVisibility || "all");
      setHpStyle(token.hpStyle || "bar_numbers");
      setAc(token.ac || 14);
      setElevation(token.elevation || 0);
      setSize(token.size || 1);
      setIsHidden(token.isHidden || false);
      setConditions(token.conditions || []);
      setCalcInput("");
      setConditionCategory("all");
      setConditionSearch("");
    }
  }, [token]);

  if (!isEditing || !token) return null;

  const handleSave = () => {
    const updated = {
      name,
      hp,
      maxHp,
      tempHp,
      showHpBar,
      hpVisibility,
      hpStyle,
      ac,
      elevation,
      size,
      isHidden,
      conditions,
    };
    updateToken(token.id, updated);
    wsService.send("TOKEN_UPDATE", { tokenId: token.id, ...updated });
    closeEditor();
  };

  const handleDelete = () => {
    deleteToken(token.id);
    wsService.send("TOKEN_DELETE", { tokenId: token.id });
    closeEditor();
  };

  const handleApplyDamage = () => {
    const amount = parseInt(calcInput, 10);
    if (isNaN(amount) || amount <= 0) return;

    let remainingDamage = amount;
    let newTempHp = tempHp;
    let newHp = hp;

    if (newTempHp > 0) {
      if (newTempHp >= remainingDamage) {
        newTempHp -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= newTempHp;
        newTempHp = 0;
      }
    }

    if (remainingDamage > 0) {
      newHp = Math.max(0, newHp - remainingDamage);
    }

    setTempHp(newTempHp);
    setHp(newHp);
    setCalcInput("");
  };

  const handleApplyHeal = () => {
    const amount = parseInt(calcInput, 10);
    if (isNaN(amount) || amount <= 0) return;

    setHp((prev) => Math.min(maxHp, prev + amount));
    setCalcInput("");
  };

  const handleToggleCondition = (condId: string) => {
    if (conditions.includes(condId)) {
      setConditions(conditions.filter((c) => c !== condId));
    } else {
      setConditions([...conditions, condId]);
    }
  };

  const hpRatio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;

  const filteredConditions = STATUS_CONDITIONS.filter((cond) => {
    const matchesCategory =
      conditionCategory === "all" || cond.category === conditionCategory;
    const matchesSearch =
      !conditionSearch ||
      cond.name.toLowerCase().includes(conditionSearch.toLowerCase()) ||
      cond.nameFa.toLowerCase().includes(conditionSearch.toLowerCase()) ||
      cond.descriptionFa.toLowerCase().includes(conditionSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Modal
      isOpen={isEditing}
      onClose={closeEditor}
      title="Token Properties & Status Effects"
      titleFa="تنظیمات توکن، نوار سلامت و وضعیت‌ها"
      maxWidth="md"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Token Avatar Preview & Name */}
        <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-2xl border border-zinc-850">
          <div className="relative">
            <img
              src={token.avatarUrl}
              alt={token.name}
              className={`w-14 h-14 rounded-full border-2 border-amber-500 bg-zinc-850 shadow-md ${
                conditions.includes("invisible") ? "opacity-40 ring-2 ring-sky-400" : ""
              }`}
            />
            {conditions.includes("unconscious") && (
              <span className="absolute -top-1 -right-1 text-sm">💤</span>
            )}
            {conditions.includes("prone") && (
              <span className="absolute -bottom-1 -left-1 text-sm">🧎</span>
            )}
          </div>
          <div className="flex-1">
            <Input
              label="نام توکن / کاراکتر"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* --- Dynamic Health Bar & HP Indicator Settings --- */}
        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <span>نوار سلامتی (Health Bar Component)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono">
                    {Math.round(hpRatio * 100)}%
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  مدیریت پویای سلامت و دسترسی نقش‌های بازیکنان
                </div>
              </div>
            </div>

            {/* Toggle Enable HP Bar */}
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
              <span className="text-[11px] text-zinc-400">نمایش روی توکن:</span>
              <input
                type="checkbox"
                checked={showHpBar}
                onChange={(e) => setShowHpBar(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500"
              />
            </label>
          </div>

          {/* Visual Mini Preview of HP Bar with Attached Status Icons */}
          <div className="p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">پیش‌نمایش نوار سلامت و آیکون‌ها:</span>
              <span className="font-bold text-zinc-100">
                {hp} {tempHp > 0 && <span className="text-cyan-400 font-bold">+{tempHp}</span>} / {maxHp}
              </span>
            </div>

            {/* Condition Icon Bar attached above HP bar */}
            {conditions.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {conditions.map((cId) => {
                  const cond = CONDITION_MAP[cId];
                  if (!cond) return null;
                  return (
                    <span
                      key={cId}
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border shadow-xs"
                      style={{
                        backgroundColor: cond.badgeColor,
                        color: cond.badgeTextColor,
                        borderColor: "rgba(255,255,255,0.2)",
                      }}
                      title={cond.descriptionFa}
                    >
                      <span>{cond.icon}</span>
                      <span className="text-[9px]">{cond.name}</span>
                    </span>
                  );
                })}
              </div>
            )}

            {/* The Actual HP Bar */}
            <div className="relative w-full h-3.5 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  hpRatio > 0.5
                    ? "bg-emerald-500"
                    : hpRatio > 0.25
                    ? "bg-amber-500"
                    : hp <= 0
                    ? "bg-rose-950"
                    : "bg-rose-600"
                }`}
                style={{ width: `${hpRatio * 100}%` }}
              />
              {tempHp > 0 && (
                <div
                  className="absolute top-0 left-0 h-full bg-cyan-400/70 border-r border-cyan-200"
                  style={{ width: `${Math.min(100, (tempHp / maxHp) * 100)}%` }}
                />
              )}
            </div>
          </div>

          {/* Current HP, Max HP, Temp HP */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">HP فعلی:</label>
              <input
                type="number"
                value={hp}
                onChange={(e) => setHp(Number(e.target.value))}
                className="w-full h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">حداکثر Max HP:</label>
              <input
                type="number"
                value={maxHp}
                onChange={(e) => setMaxHp(Math.max(1, Number(e.target.value)))}
                className="w-full h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-200 focus:ring-1 focus:ring-zinc-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-cyan-400 block mb-1">سپر موقت (Temp HP):</label>
              <input
                type="number"
                value={tempHp}
                onChange={(e) => setTempHp(Math.max(0, Number(e.target.value)))}
                className="w-full h-8 px-2 bg-zinc-900 border border-cyan-900/60 rounded-lg text-xs font-mono text-cyan-400 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Quick Damage & Heal Calculator */}
          <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-2">
            <div className="text-[11px] text-zinc-400 font-fa">محاسبه‌گر سریع آسیب و شفا:</div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="مقدار..."
                value={calcInput}
                onChange={(e) => setCalcInput(e.target.value)}
                className="w-24 h-8 px-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyDamage();
                }}
              />
              <button
                type="button"
                onClick={handleApplyDamage}
                className="flex-1 py-1 px-2 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg hover:bg-rose-500/30 transition-colors flex items-center justify-center gap-1 font-medium cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
                آسیب (Damage)
              </button>
              <button
                type="button"
                onClick={handleApplyHeal}
                className="flex-1 py-1 px-2 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                شفا (Heal)
              </button>
            </div>
          </div>

          {/* Visibility for Player Roles */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300 font-bold block flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              محدوده نمایش نوار جان و وضعیت‌ها (Role Visibility):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setHpVisibility("all")}
                className={`p-2 rounded-xl text-right text-xs transition-all border ${
                  hpVisibility === "all"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>🌐 همه بازیکنان</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">قابل رویت برای همه در نقشه</div>
              </button>

              <button
                type="button"
                onClick={() => setHpVisibility("owner")}
                className={`p-2 rounded-xl text-right text-xs transition-all border ${
                  hpVisibility === "owner"
                    ? "bg-amber-600/20 border-amber-500 text-amber-200 shadow-sm"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>مالک و دانجن مستر</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">فقط کنترل‌کننده توکن و DM</div>
              </button>

              <button
                type="button"
                onClick={() => setHpVisibility("gm_only")}
                className={`p-2 rounded-xl text-right text-xs transition-all border ${
                  hpVisibility === "gm_only"
                    ? "bg-purple-600/20 border-purple-500 text-purple-200 shadow-sm"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-purple-400" />
                  <span>فقط دانجن مستر (DM)</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">مخفی برای دشمنان و باس‌ها</div>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATUS EFFECTS & CONDITIONS SYSTEM (PRONE, INVISIBLE, INCAPACITATED, ETC.) */}
        {/* ========================================================================= */}
        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <span>وضعیت‌ها و شرایط (Status Effects & Conditions)</span>
                  {conditions.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold">
                      {conditions.length} فعال
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-400">
                  انتخاب وضعیت‌ها جهت نمایش آیکون‌های تصویری روی کامپوننت نوار سلامت توکن
                </div>
              </div>
            </div>

            {conditions.length > 0 && (
              <button
                type="button"
                onClick={() => setConditions([])}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
              >
                پاک کردن همه
              </button>
            )}
          </div>

          {/* Search & Category Filter Tabs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="جستجوی وضعیت (Prone, Invisible, ناتوان...)"
                  value={conditionSearch}
                  onChange={(e) => setConditionSearch(e.target.value)}
                  className="w-full h-8 pl-2 pr-8 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: "all", label: "همه" },
                { id: "harmful", label: "ناتوان‌کننده" },
                { id: "movement", label: "حرکتی (Prone / Restrained)" },
                { id: "sensory", label: "حسی (Invisible / Blinded)" },
                { id: "mental", label: "ذهنی" },
                { id: "buff", label: "باف‌ها (Buffs)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setConditionCategory(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                    conditionCategory === tab.id
                      ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredConditions.map((cond) => {
              const active = conditions.includes(cond.id);
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => handleToggleCondition(cond.id)}
                  className={`p-2.5 rounded-xl text-right transition-all flex items-start gap-2.5 border ${
                    active
                      ? "bg-zinc-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/40"
                      : "bg-zinc-900/60 border-zinc-850 hover:border-zinc-700 text-zinc-400"
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 border"
                    style={{
                      backgroundColor: cond.badgeColor,
                      color: cond.badgeTextColor,
                      borderColor: "rgba(255,255,255,0.25)",
                    }}
                  >
                    {cond.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${active ? "text-zinc-100" : "text-zinc-300"}`}>
                        {cond.nameFa}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">{cond.name}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                      {cond.descriptionFa}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AC, Elevation, Size */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">زره (AC):</label>
            <input
              type="number"
              value={ac}
              onChange={(e) => setAc(Number(e.target.value))}
              className="w-full h-9 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">ارتفاع (ft):</label>
            <input
              type="number"
              value={elevation}
              onChange={(e) => setElevation(Number(e.target.value))}
              className="w-full h-9 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-indigo-400"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">اندازه:</label>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full h-9 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200"
            >
              <option value={1}>1x1 (Medium)</option>
              <option value={2}>2x2 (Large)</option>
              <option value={3}>3x3 (Huge)</option>
            </select>
          </div>
        </div>

        {/* GM Stealth / Hidden Toggle */}
        {isGM && (
          <label className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-850 cursor-pointer select-none">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <EyeOff className="w-4 h-4 text-zinc-400" />
              <span>مخفی‌سازی توکن از دید بازیکنان (Stealth Mode)</span>
            </div>
            <input
              type="checkbox"
              checked={isHidden}
              onChange={(e) => setIsHidden(e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-amber-500"
            />
          </label>
        )}

        {/* Action Buttons */}
        <div className="pt-3 flex items-center justify-between border-t border-zinc-800">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            حذف توکن
          </button>

          <div className="flex gap-2">
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
