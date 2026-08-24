import React, { useState, useEffect } from "react";
import { Heart, Trash2, Plus, Minus, Search, Activity, EyeOff } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { wsService } from "../../services/websocket.service";
import { STATUS_CONDITIONS, CONDITION_MAP } from "../../constants/conditions";

export const TokenEditorModal = () => {
  const isEditing = useCanvasStore((state) => state.isTokenEditorOpen);
  const editingTokenId = useCanvasStore((state) => state.editingTokenId);
  const closeEditor = useCanvasStore((state) => state.closeTokenEditor);

  const currentScene = useSceneStore((state) => state.currentScene);
  const updateToken = useSceneStore((state) => state.updateToken);
  const removeToken = useSceneStore((state) => state.removeToken);
  const { isGM } = usePermissions();

  const token = currentScene?.tokens?.find((t) => t.id === editingTokenId);

  const [name, setName] = useState("");
  const [hp, setHp] = useState(20);
  const [maxHp, setMaxHp] = useState(20);
  const [ac, setAc] = useState(14);
  const [elevation, setElevation] = useState(0);
  const [size, setSize] = useState(1);
  const [isHidden, setIsHidden] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [calcInput, setCalcInput] = useState("");

  useEffect(() => {
    if (token) {
      setName(token.label || token.name || "");
      setHp(token.hp !== undefined ? token.hp : 20);
      setMaxHp(token.maxHp !== undefined ? token.maxHp : 20);
      setAc(token.ac || 14);
      setElevation(token.elevation || 0);
      setSize(token.size || 1);
      setIsHidden(token.isHidden || false);
      setConditions(token.conditions || []);
    }
  }, [token]);

  if (!isEditing || !token) return null;

  const handleSave = () => {
    const updated = {
      name,
      label: name,
      hp,
      maxHp,
      ac,
      elevation,
      size,
      isHidden,
      conditions,
    };
    updateToken(token.id, updated);
    wsService.send("TOKEN_MOVE", { tokenId: token.id, ...updated });
    closeEditor();
  };

  const handleDelete = () => {
    removeToken(token.id);
    wsService.send("TOKEN_MOVE", { tokenId: token.id, isDeleted: true });
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

  const handleToggleCondition = (condId) => {
    setConditions((prev) =>
        prev.includes(condId) ? prev.filter((c) => c !== condId) : [...prev, condId]
    );
  };

  return (
      <Modal
          isOpen={isEditing}
          onClose={closeEditor}
          title="Token Properties"
          titleFa="تنظیمات مشخصات و وضعیت توکن"
          maxWidth="md"
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1 font-fa" dir="rtl">
          <Input
              label="نام کاراکتر / توکن"
              value={name}
              onChange={(e) => setName(e.target.value)}
          />

          {/* بخش HP و نوار جان */}
          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-100">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>نوار سلامتی (HP)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">HP فعلی:</label>
                <input
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(Number(e.target.value))}
                    className="w-full h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">حداکثر Max HP:</label>
                <input
                    type="number"
                    value={maxHp}
                    onChange={(e) => setMaxHp(Math.max(1, Number(e.target.value)))}
                    className="w-full h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-200"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <input
                  type="number"
                  placeholder="مقدار..."
                  value={calcInput}
                  onChange={(e) => setCalcInput(e.target.value)}
                  className="w-24 h-8 px-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-100"
              />
              <button
                  type="button"
                  onClick={handleApplyDamage}
                  className="flex-1 py-1 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg hover:bg-rose-500/30 transition-colors flex items-center justify-center gap-1"
              >
                <Minus className="w-3.5 h-3.5" /> آسیب
              </button>
              <button
                  type="button"
                  onClick={handleApplyHeal}
                  className="flex-1 py-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> شفا
              </button>
            </div>
          </div>

          {/* وضعیت‌ها و Conditions */}
          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-100 mb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>شرایط و وضعیت‌ها (Conditions)</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {STATUS_CONDITIONS.map((cond) => {
                const active = conditions.includes(cond.id);
                return (
                    <button
                        key={cond.id}
                        type="button"
                        onClick={() => handleToggleCondition(cond.id)}
                        className={`p-2 rounded-xl text-right transition-all flex items-center gap-2 border text-xs ${
                            active ? "bg-zinc-900 border-amber-400 font-bold text-amber-300" : "bg-zinc-900/50 border-zinc-800 text-zinc-400"
                        }`}
                    >
                      <span>{cond.icon}</span>
                      <span className="truncate">{cond.nameFa}</span>
                    </button>
                );
              })}
            </div>
          </div>

          {/* زره و اندازه */}
          <div className="grid grid-cols-2 gap-2">
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

          <div className="pt-3 flex items-center justify-between border-t border-zinc-800">
            <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1.5"
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