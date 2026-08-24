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
  Box,
  Flame,
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
  {
    sides: 4,
    label: "d4",
    nameFa: "۴ وجهی (هرمی)",
    color: "from-emerald-600 to-teal-700",
    borderColor: "border-emerald-500/40 hover:border-emerald-400",
    iconPath: "M12 2 L22 20 L2 20 Z",
  },
  {
    sides: 6,
    label: "d6",
    nameFa: "۶ وجهی (مکعب)",
    color: "from-sky-600 to-blue-700",
    borderColor: "border-sky-500/40 hover:border-sky-400",
    iconPath: "M3 3 H21 V21 H3 Z",
  },
  {
    sides: 8,
    label: "d8",
    nameFa: "۸ وجهی (الماس)",
    color: "from-indigo-600 to-violet-700",
    borderColor: "border-indigo-500/40 hover:border-indigo-400",
    iconPath: "M12 2 L21 12 L12 22 L3 12 Z",
  },
  {
    sides: 10,
    label: "d10",
    nameFa: "۱۰ وجهی (بادبادکی)",
    color: "from-purple-600 to-fuchsia-700",
    borderColor: "border-purple-500/40 hover:border-purple-400",
    iconPath: "M12 2 L21 9 L17 21 L7 21 L3 9 Z",
  },
  {
    sides: 12,
    label: "d12",
    nameFa: "۱۲ وجهی (دوازده‌وجهی)",
    color: "from-pink-600 to-rose-700",
    borderColor: "border-pink-500/40 hover:border-pink-400",
    iconPath: "M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z",
  },
  {
    sides: 20,
    label: "d20",
    nameFa: "۲۰ وجهی (اصلی D&D)",
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-500/50 hover:border-amber-400",
    iconPath: "M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z",
  },
  {
    sides: 100,
    label: "d100",
    nameFa: "درصدی (d%)",
    color: "from-rose-600 to-red-700",
    borderColor: "border-rose-500/40 hover:border-rose-400",
    iconPath: "M12 2 A10 10 0 1 0 12 22 A10 10 0 1 0 12 2 Z",
  },
];

function playDiceSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140 + Math.random() * 260, now + i * 0.05);
      gain.gain.setValueAtTime(0.12, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.09);
    }
  } catch {
    // Ignore audio
  }
}

export const DiceRoller = () => {
  const isDiceOpen = useCanvasStore((state) => state.isDiceRollerOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);
  const is3DDiceEnabled = useCanvasStore((state) => state.is3DDiceEnabled);
  const setIs3DDiceEnabled = useCanvasStore((state) => state.setIs3DDiceEnabled);
  const trigger3DRoll = useCanvasStore((state) => state.trigger3DRoll);

  const user = useAuthStore((state) => state.user);
  const addDiceRoll = useSceneStore((state) => state.addDiceRoll);
  const chatMessages = useSceneStore((state) => state.chatMessages) || [];

  const [selectedDie, setSelectedDie] = useState(20);
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollReason, setRollReason] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [recentToasts, setRecentToasts] = useState([]);

  useEffect(() => {
    if (chatMessages.length === 0) return;
    const latest = chatMessages[chatMessages.length - 1];
    if (latest && latest.diceRoll) {
      const newRoll = latest.diceRoll;
      setRecentToasts((prev) => {
        if (prev.some((t) => t.id === newRoll.id)) return prev;
        return [newRoll, ...prev].slice(0, 4);
      });

      const timer = setTimeout(() => {
        setRecentToasts((prev) => prev.filter((t) => t.id !== newRoll.id));
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [chatMessages]);

  const executeRoll = (formulaToRoll, label, overrideAdvantage) => {
    setIsRolling(true);
    if (soundEnabled) playDiceSound();

    setTimeout(() => {
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
    }, 200);
  };

  const removeToast = (id) => {
    setRecentToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const rollHistory = chatMessages.filter((m) => !!m.diceRoll).slice(-6).reverse();

  return (
      <>
        {/* توست نمایش نتایج پرتاب‌ها در بالای صفحه */}
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-80 pointer-events-none font-fa" dir="rtl">
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
                      onClick={() => removeToast(toast.id)}
                      className="text-zinc-400 hover:text-zinc-100 p-0.5 rounded"
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
                          NAT 20 CRIT!
                        </Badge>
                    )}
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* منوی پرتاب تاس */}
        {isDiceOpen && (
            <div
                id="vtt-dice-roller-modal"
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-96 max-w-[96vw] bg-zinc-900/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-2xl p-4 text-zinc-100 font-fa"
                dir="rtl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Dices className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">پرتاب تاس‌های چندوجهی</h4>
                    <p className="text-[11px] text-zinc-400">انتخاب تاس و اصلاح‌گر</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                      type="button"
                      onClick={() => toggleMenu("dice")}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="py-3">
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {POLYHEDRAL_DICE.map((die) => (
                      <button
                          key={die.sides}
                          type="button"
                          onClick={() => {
                            setSelectedDie(die.sides);
                            executeRoll(`${diceCount}d${die.sides}${modifier ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`);
                          }}
                          className={cn(
                              "p-2 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                              selectedDie === die.sides
                                  ? "bg-amber-500/10 border-amber-400 shadow-lg"
                                  : "bg-zinc-950/80 hover:bg-zinc-800/60 border-zinc-800"
                          )}
                      >
                        <span className="text-xs font-black font-mono text-zinc-100">{die.label}</span>
                      </button>
                  ))}
                </div>

                {/* تعداد و مودفایر */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center justify-between p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <span className="text-xs text-zinc-400 mr-1">تعداد:</span>
                    <div className="flex items-center gap-1.5">
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
                    <span className="text-xs text-zinc-400 mr-1">مودفایر:</span>
                    <div className="flex items-center gap-1.5">
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

                {/* دکمه‌های Advantage / Disadvantage */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                      type="button"
                      onClick={() => executeRoll(undefined, "مزیت (Advantage)", "adv")}
                      className="py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Advantage (2d20kh1)
                  </button>
                  <button
                      type="button"
                      onClick={() => executeRoll(undefined, "عدم‌مزیت (Disadvantage)", "dis")}
                      className="py-2 px-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
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
            </div>
        )}
      </>
  );
};