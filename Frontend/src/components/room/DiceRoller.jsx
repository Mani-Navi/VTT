import React, { useState, useEffect } from "react";
import {
  Dices,
  Sparkles,
  X,
  ShieldAlert,
  History,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Flame,
  Wrench,
  ChevronLeft,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { rollDice } from "../../utils/dice";
import { wsService } from "../../services/websocket.service";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";

export const POLYHEDRAL_DICE = [
  { sides: 4, label: "d4", nameFa: "۴ وجهی" },
  { sides: 6, label: "d6", nameFa: "۶ وجهی" },
  { sides: 8, label: "d8", nameFa: "۸ وجهی" },
  { sides: 10, label: "d10", nameFa: "۱۰ وجهی" },
  { sides: 12, label: "d12", nameFa: "۱۲ وجهی" },
  { sides: 20, label: "d20", nameFa: "۲۰ وجهی" },
  { sides: 100, label: "d100", nameFa: "درصدی" },
];

export const DiceRoller = () => {
  const isDiceOpen = useCanvasStore((state) => state.isDiceRollerOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);
  const is3DDiceEnabled = useCanvasStore((state) => state.is3DDiceEnabled);
  const trigger3DRoll = useCanvasStore((state) => state.trigger3DRoll);

  const user = useAuthStore((state) => state.user);
  const addDiceRoll = useSceneStore((state) => state.addDiceRoll);
  const chatMessages = useSceneStore((state) => state.chatMessages) || [];

  const [activeTab, setActiveTab] = useState("quick"); // quick | custom | log
  const [selectedDie, setSelectedDie] = useState(20);
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [customFormula, setCustomFormula] = useState("");
  const [rollReason, setRollReason] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [recentToasts, setRecentToasts] = useState([]);

  // مدیریت اعلان‌های شناور بالای صفحه
  useEffect(() => {
    if (chatMessages.length === 0) return;
    const latest = chatMessages[chatMessages.length - 1];
    if (latest && latest.diceRoll) {
      const newRoll = latest.diceRoll;
      setRecentToasts((prev) => {
        if (prev.some((t) => t.id === newRoll.id)) return prev;
        return [newRoll, ...prev].slice(0, 3);
      });

      const timer = setTimeout(() => {
        setRecentToasts((prev) => prev.filter((t) => t.id !== newRoll.id));
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [chatMessages]);

  const executeRoll = (formulaToRoll, label, overrideAdvantage) => {
    setIsRolling(true);

    let finalFormula = formulaToRoll;
    if (!finalFormula) {
      const modPart = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : "";
      if (overrideAdvantage === "adv") {
        finalFormula = `2d${selectedDie}kh1${modPart}`;
      } else if (overrideAdvantage === "dis") {
        finalFormula = `2d${selectedDie}kl1${modPart}`;
      } else {
        finalFormula = `${diceCount}d${selectedDie}${modPart}`;
      }
    }

    const roll = rollDice(
        finalFormula,
        user?.username || "Player",
        "#f59e0b",
        user?.id || "user-1",
        label || rollReason || undefined
    );

    addDiceRoll(roll);
    wsService.send("DICE_ROLL", roll);
    if (is3DDiceEnabled && trigger3DRoll) {
      trigger3DRoll(roll);
    }
    setIsRolling(false);
  };

  const rollHistory = chatMessages.filter((m) => !!m.diceRoll).slice(-15).reverse();

  return (
      <>
        {/* توست‌های شناور نتایج اخیر */}
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm w-80 pointer-events-none font-fa" dir="rtl">
          {recentToasts.map((toast) => (
              <div
                  key={toast.id}
                  className={cn(
                      "pointer-events-auto p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300",
                      toast.isCriticalHit
                          ? "bg-zinc-950/95 border-amber-500/80 ring-2 ring-amber-500/40 text-amber-200"
                          : toast.isCriticalFail
                              ? "bg-zinc-950/95 border-rose-500/80 ring-2 ring-rose-500/40 text-rose-200"
                              : "bg-zinc-900/95 border-zinc-800 text-zinc-100"
                  )}
              >
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="font-semibold text-zinc-200 truncate">{toast.userName}</span>
                    <span className="text-zinc-500 font-mono text-[11px] mr-1">{toast.formula}</span>
                  </div>
                  <button
                      type="button"
                      onClick={() => setRecentToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                      className="text-zinc-400 hover:text-zinc-100 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    {toast.label && <p className="text-xs text-zinc-300 font-medium mb-0.5">{toast.label}</p>}
                    <div className="text-[11px] text-zinc-400 font-mono">
                      [{toast.dice?.map((d) => d.result).join(", ")}]
                      {toast.modifier ? ` + ${toast.modifier}` : ""}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                <span className="text-3xl font-black font-mono tracking-tight text-amber-400">
                  {toast.total}
                </span>
                    {toast.isCriticalHit && (
                        <Badge variant="amber" size="sm" className="mt-0.5 animate-bounce">
                          <Flame className="w-3 h-3 text-amber-400" />
                          NAT 20
                        </Badge>
                    )}
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* مودال سینی تاس و لاگ */}
        {isDiceOpen && (
            <div
                id="vtt-dice-roller-modal"
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-96 max-w-[96vw] bg-zinc-900/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-2xl p-4 text-zinc-100 font-fa"
                dir="rtl"
            >
              {/* هدر */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Dices className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold">سینی پرتاب تاس Titipool</h4>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                      type="button"
                      onClick={() => toggleMenu("dice")}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* تب‌ها: تاس سریع | ساخت تاس سفارشی | لاگ زنده */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 my-3">
                <button
                    type="button"
                    onClick={() => setActiveTab("quick")}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                        activeTab === "quick" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"
                    )}
                >
                  تاس‌های استاندارد
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("custom")}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                        activeTab === "custom" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"
                    )}
                >
                  تاس سفارشی
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("log")}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                        activeTab === "log" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"
                    )}
                >
                  لاگ پرتاب‌ها
                </button>
              </div>

              {/* محتوای تب استاندارد */}
              {activeTab === "quick" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      {POLYHEDRAL_DICE.map((die) => (
                          <button
                              key={die.sides}
                              type="button"
                              onClick={() => {
                                setSelectedDie(die.sides);
                                executeRoll(`${diceCount}d${die.sides}${modifier ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`);
                              }}
                              className={cn(
                                  "p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                                  selectedDie === die.sides
                                      ? "bg-amber-500/15 border-amber-400 shadow-md scale-105"
                                      : "bg-zinc-950/80 hover:bg-zinc-800 border-zinc-800 text-zinc-400"
                              )}
                          >
                            <span className="text-xs font-black font-mono text-zinc-100">{die.label}</span>
                          </button>
                      ))}
                    </div>

                    {/* شمارنده و اصلاح‌گر */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                        <span className="text-xs text-zinc-400 mr-1">تعداد:</span>
                        <div className="flex items-center gap-1">
                          <button
                              type="button"
                              onClick={() => setDiceCount((c) => Math.max(1, c - 1))}
                              className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-amber-400 text-sm">{diceCount}</span>
                          <button
                              type="button"
                              onClick={() => setDiceCount((c) => Math.min(20, c + 1))}
                              className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                        <span className="text-xs text-zinc-400 mr-1">اصلاح‌گر:</span>
                        <div className="flex items-center gap-1">
                          <button
                              type="button"
                              onClick={() => setModifier((m) => m - 1)}
                              className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-zinc-200 text-xs">
                      {modifier >= 0 ? `+${modifier}` : modifier}
                    </span>
                          <button
                              type="button"
                              onClick={() => setModifier((m) => m + 1)}
                              className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Advantage & Disadvantage */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                          type="button"
                          onClick={() => executeRoll(undefined, "مزیت (Advantage)", "adv")}
                          className="py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Advantage (2d20kh1)
                      </button>
                      <button
                          type="button"
                          onClick={() => executeRoll(undefined, "عدم‌مزیت (Disadvantage)", "dis")}
                          className="py-2 px-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Disadvantage (2d20kl1)
                      </button>
                    </div>

                    <Button
                        type="button"
                        variant="amber"
                        className="w-full font-bold shadow-lg shadow-amber-500/20"
                        onClick={() => executeRoll()}
                        isLoading={isRolling}
                    >
                      پرتاب {diceCount}d{selectedDie} {modifier ? (modifier > 0 ? `+${modifier}` : modifier) : ""}
                    </Button>
                  </div>
              )}

              {/* محتوای تب تاس سفارشی */}
              {activeTab === "custom" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">فرمول تاس دلخواه (مثلاً: 4d6kh3 + 2 یا 1d20+7):</label>
                      <input
                          type="text"
                          value={customFormula}
                          onChange={(e) => setCustomFormula(e.target.value)}
                          placeholder="2d20 + 5"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-400 font-mono text-sm focus:outline-none focus:border-amber-500"
                          dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">عنوان پرتاب (اختیاری):</label>
                      <input
                          type="text"
                          value={rollReason}
                          onChange={(e) => setRollReason(e.target.value)}
                          placeholder="مثال: حمله با شمشیر آتشین"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <Button
                        type="button"
                        variant="amber"
                        className="w-full font-bold shadow-lg shadow-amber-500/20 mt-2"
                        onClick={() => customFormula && executeRoll(customFormula, rollReason)}
                        isLoading={isRolling}
                        disabled={!customFormula.trim()}
                    >
                      پرتاب تاس سفارشی
                    </Button>
                  </div>
              )}

              {/* محتوای تب لاگ اختصاصی */}
              {activeTab === "log" && (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {rollHistory.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-6">هنوز تاسی پرتاب نشده است.</p>
                    ) : (
                        rollHistory.map((item) => {
                          const roll = item.diceRoll;
                          return (
                              <div
                                  key={item.id}
                                  className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-zinc-200">{roll.userName}</span>
                                    <span className="text-zinc-500 font-mono text-[11px]">({roll.formula})</span>
                                  </div>
                                  {roll.label && <p className="text-[11px] text-zinc-400 mt-0.5">{roll.label}</p>}
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-black font-mono text-amber-400">{roll.total}</span>
                                </div>
                              </div>
                          );
                        })
                    )}
                  </div>
              )}
            </div>
        )}
      </>
  );
};