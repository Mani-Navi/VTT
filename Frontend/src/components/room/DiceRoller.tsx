import React, { useState, useEffect } from "react";
import {
  Dices,
  Sparkles,
  X,
  RotateCcw,
  Flame,
  ShieldAlert,
  History,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Box,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { rollDice } from "../../utils/dice";
import { wsService } from "../../services/websocket.service";
import { DiceRoll } from "../../types";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";

// Polyhedral Dice Definition with Shape geometry & theme
export interface PolyhedralDie {
  sides: number;
  label: string;
  nameFa: string;
  color: string;
  borderColor: string;
  textColor: string;
  bgLight: string;
  iconPath: string;
}

export const POLYHEDRAL_DICE: PolyhedralDie[] = [
  {
    sides: 4,
    label: "d4",
    nameFa: "۴ وجهی (هرمی)",
    color: "from-emerald-600 to-teal-700",
    borderColor: "border-emerald-500/40 hover:border-emerald-400",
    textColor: "text-emerald-400",
    bgLight: "bg-emerald-500/15",
    iconPath: "M12 2 L22 20 L2 20 Z", // Triangle
  },
  {
    sides: 6,
    label: "d6",
    nameFa: "۶ وجهی (مکعب)",
    color: "from-sky-600 to-blue-700",
    borderColor: "border-sky-500/40 hover:border-sky-400",
    textColor: "text-sky-400",
    bgLight: "bg-sky-500/15",
    iconPath: "M3 3 H21 V21 H3 Z", // Square
  },
  {
    sides: 8,
    label: "d8",
    nameFa: "۸ وجهی (الماس)",
    color: "from-indigo-600 to-violet-700",
    borderColor: "border-indigo-500/40 hover:border-indigo-400",
    textColor: "text-indigo-400",
    bgLight: "bg-indigo-500/15",
    iconPath: "M12 2 L21 12 L12 22 L3 12 Z", // Diamond
  },
  {
    sides: 10,
    label: "d10",
    nameFa: "۱۰ وجهی (بادبادکی)",
    color: "from-purple-600 to-fuchsia-700",
    borderColor: "border-purple-500/40 hover:border-purple-400",
    textColor: "text-purple-400",
    bgLight: "bg-purple-500/15",
    iconPath: "M12 2 L21 9 L17 21 L7 21 L3 9 Z", // Pentagon-like kite
  },
  {
    sides: 12,
    label: "d12",
    nameFa: "۱۲ وجهی (دوازده‌وجهی)",
    color: "from-pink-600 to-rose-700",
    borderColor: "border-pink-500/40 hover:border-pink-400",
    textColor: "text-pink-400",
    bgLight: "bg-pink-500/15",
    iconPath: "M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z", // Hexagon
  },
  {
    sides: 20,
    label: "d20",
    nameFa: "۲۰ وجهی (اصلی D&D)",
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-500/50 hover:border-amber-400",
    textColor: "text-amber-400",
    bgLight: "bg-amber-500/20",
    iconPath: "M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z", // Polyhedron
  },
  {
    sides: 100,
    label: "d100",
    nameFa: "درصدی (d%)",
    color: "from-rose-600 to-red-700",
    borderColor: "border-rose-500/40 hover:border-rose-400",
    textColor: "text-rose-400",
    bgLight: "bg-rose-500/15",
    iconPath: "M12 2 A10 10 0 1 0 12 22 A10 10 0 1 0 12 2 Z", // Circle
  },
];

// Audio synthesizer for dice roll sound effect
function playDiceSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
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
    // Ignore audio errors
  }
}

export const DiceRoller: React.FC = () => {
  const isDiceOpen = useCanvasStore((state) => state.isDiceRollerOpen);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);
  const is3DDiceEnabled = useCanvasStore((state) => state.is3DDiceEnabled);
  const setIs3DDiceEnabled = useCanvasStore((state) => state.setIs3DDiceEnabled);
  const trigger3DRoll = useCanvasStore((state) => state.trigger3DRoll);

  const user = useAuthStore((state) => state.user);
  const addDiceRoll = useSceneStore((state) => state.addDiceRoll);
  const chatMessages = useSceneStore((state) => state.chatMessages);

  // Roll Configuration
  const [selectedDie, setSelectedDie] = useState<number>(20);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [customFormula, setCustomFormula] = useState<string>("");
  const [rollReason, setRollReason] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Animation & Feedback
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [animNumber, setAnimNumber] = useState<number>(20);

  // Toast Notification Queue
  const [recentToasts, setRecentToasts] = useState<DiceRoll[]>([]);
  const [isToastExpanded, setIsToastExpanded] = useState<boolean>(true);

  // Listen to new rolls from scene store to pop up notifications
  useEffect(() => {
    if (chatMessages.length === 0) return;
    const latest = chatMessages[chatMessages.length - 1];
    if (latest && latest.diceRoll) {
      const newRoll = latest.diceRoll;
      setRecentToasts((prev) => {
        // Prevent duplicate toasts
        if (prev.some((t) => t.id === newRoll.id)) return prev;
        return [newRoll, ...prev].slice(0, 4);
      });

      // Auto dismiss oldest toast after 7 seconds
      const timer = setTimeout(() => {
        setRecentToasts((prev) => prev.filter((t) => t.id !== newRoll.id));
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [chatMessages]);

  const executeRoll = (
    formulaToRoll?: string,
    label?: string,
    overrideAdvantage?: "adv" | "dis"
  ) => {
    setIsRolling(true);
    if (soundEnabled) {
      playDiceSound();
    }

    // Number tumbling animation
    let frames = 0;
    const interval = setInterval(() => {
      setAnimNumber(Math.floor(Math.random() * selectedDie) + 1);
      frames++;
      if (frames > 7) clearInterval(interval);
    }, 30);

    setTimeout(() => {
      clearInterval(interval);

      let finalFormula = formulaToRoll;

      if (!finalFormula) {
        if (customFormula.trim()) {
          finalFormula = customFormula.trim();
        } else {
          const modPart =
            modifier !== 0
              ? modifier > 0
                ? `+${modifier}`
                : `${modifier}`
              : "";

          if (overrideAdvantage === "adv") {
            finalFormula = `2d${selectedDie}kh1${modPart}`;
          } else if (overrideAdvantage === "dis") {
            finalFormula = `2d${selectedDie}kl1${modPart}`;
          } else {
            finalFormula = `${diceCount}d${selectedDie}${modPart}`;
          }
        }
      }

      const roll = rollDice(
        finalFormula,
        user?.displayName || "Player",
        user?.role === "GM" ? "#3b82f6" : "#10b981",
        user?.id || "user-1",
        label || rollReason || undefined
      );

      addDiceRoll(roll);
      wsService.send("DICE_ROLL", roll);
      if (is3DDiceEnabled) {
        trigger3DRoll(roll);
      }
      setIsRolling(false);
      setAnimNumber(roll.total);
    }, 220);
  };

  const removeToast = (id: string) => {
    setRecentToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const rollHistory = chatMessages
    .filter((m) => !!m.diceRoll)
    .slice(-6)
    .reverse();

  return (
    <>
      {/* 1. FLOATING TOAST NOTIFICATION PANEL (Top Right of Stage) */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-80 pointer-events-none">
        {recentToasts.map((toast) => {
          const isCritical = toast.isCriticalHit || toast.isCriticalFail;
          return (
            <div
              key={toast.id}
              id={`dice-toast-${toast.id}`}
              className={cn(
                "pointer-events-auto p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform",
                // Subtle impact shake or bounce entrance animation
                isCritical ? "animate-dice-shake" : "animate-dice-bounce",
                toast.isCriticalHit
                  ? "bg-zinc-950/95 border-amber-500/80 ring-2 ring-amber-500/40 text-amber-200 animate-nat20-glow"
                  : toast.isCriticalFail
                  ? "bg-zinc-950/95 border-rose-500/80 ring-2 ring-rose-500/40 text-rose-200 animate-nat1-glow"
                  : "bg-zinc-900/95 border-zinc-800 text-zinc-100 hover:border-zinc-700"
              )}
            >
              {/* Header: User & Formula */}
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-zinc-800/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-zinc-800"
                    style={{ backgroundColor: toast.userColor || "#3b82f6" }}
                  />
                  <span className="font-semibold text-zinc-200 truncate max-w-[110px]">
                    {toast.userName}
                  </span>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    {toast.formula}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => trigger3DRoll(toast)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800/80 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 text-[10px] font-mono transition-colors"
                    title="نمایش مجدد انیمیشن ۳بعدی"
                  >
                    <Box className="w-3 h-3" />
                    <span>3D</span>
                  </button>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {toast.timestamp}
                  </span>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-zinc-400 hover:text-zinc-100 p-0.5 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Result Number & Breakdown */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  {toast.label && (
                    <p className="text-xs text-zinc-300 font-fa font-medium mb-0.5">
                      {toast.label}
                    </p>
                  )}
                  {/* Dice calculation details */}
                  <div className="text-[11px] text-zinc-400 font-mono">
                    [
                    {toast.dice.map((d, i) => (
                      <span
                        key={i}
                        className={cn(
                          d.dropped && "line-through text-zinc-600 opacity-60 mr-1",
                          !d.dropped && "text-zinc-300 font-semibold"
                        )}
                      >
                        {d.result}
                        {i < toast.dice.length - 1 ? ", " : ""}
                      </span>
                    ))}
                    ]
                    {toast.modifier !== 0 && (
                      <span className="text-amber-400 font-semibold mr-1">
                        {toast.modifier > 0 ? ` + ${toast.modifier}` : ` - ${Math.abs(toast.modifier)}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Huge Total Result with Impact Pop */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-3xl font-black font-mono tracking-tight transition-transform duration-200 hover:scale-110",
                        toast.isCriticalHit
                          ? "text-amber-400 drop-shadow-[0_0_14px_rgba(245,158,11,0.7)] scale-105"
                          : toast.isCriticalFail
                          ? "text-rose-400 drop-shadow-[0_0_14px_rgba(244,63,94,0.7)] scale-105"
                          : "text-zinc-50"
                      )}
                    >
                      {toast.total}
                    </span>
                  </div>

                  {toast.isCriticalHit && (
                    <Badge variant="amber" size="sm" className="mt-0.5 animate-bounce">
                      <Flame className="w-3 h-3 text-amber-400" />
                      NAT 20 CRIT!
                    </Badge>
                  )}
                  {toast.isCriticalFail && (
                    <Badge variant="danger" size="sm" className="mt-0.5">
                      NAT 1 FAIL
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. MAIN INTERACTIVE DICE ROLLER DRAWER / OVERLAY */}
      {isDiceOpen && (
        <div
          id="vtt-dice-roller-modal"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-96 max-w-[96vw] bg-zinc-900/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-2xl p-4 text-zinc-100 animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
                <Dices className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  پرتاب تاس‌های چندوجهی
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    Polyhedral
                  </span>
                </h4>
                <p className="text-[11px] text-zinc-400 font-fa">
                  انتخاب تاس، تعداد و اصلاح‌گر پرتاب
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="btn-toggle-3d-dice"
                onClick={() => setIs3DDiceEnabled(!is3DDiceEnabled)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors border",
                  is3DDiceEnabled
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold"
                    : "bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                )}
                title={is3DDiceEnabled ? "انیمیشن سه‌بعدی فعال است" : "انیمیشن سه‌بعدی غیرفعال"}
              >
                <Box className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px]">3D</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                title={soundEnabled ? "صدای پرتاب فعال است" : "بی‌صدا"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => toggleMenu("dice")}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Polyhedral Dice Grid Selector */}
          <div className="py-3">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {POLYHEDRAL_DICE.map((die) => {
                const isSelected = selectedDie === die.sides;
                return (
                  <button
                    key={die.sides}
                    id={`btn-die-${die.label}`}
                    onClick={() => {
                      setSelectedDie(die.sides);
                      executeRoll(`${diceCount}d${die.sides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`);
                    }}
                    className={cn(
                      "relative p-2 rounded-2xl border transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer group",
                      isSelected
                        ? "bg-gradient-to-b border-amber-400/80 shadow-lg shadow-amber-500/20 scale-[1.03]"
                        : "bg-zinc-950/80 hover:bg-zinc-800/60 border-zinc-800",
                      die.borderColor
                    )}
                  >
                    {/* Die Polygon SVG Icon */}
                    <div className="w-6 h-6 flex items-center justify-center relative">
                      <svg
                        viewBox="0 0 24 24"
                        className={cn(
                          "w-5 h-5 transition-transform group-hover:scale-110",
                          isSelected ? "text-amber-400 fill-amber-400/20 stroke-amber-400" : "text-zinc-400 fill-zinc-800/40 stroke-zinc-400"
                        )}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={die.iconPath} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-black text-zinc-200">
                        {die.sides}
                      </span>
                    </div>

                    <span className="text-xs font-black font-mono text-zinc-100">
                      {die.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dice Count & Modifier Incrementers */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Quantity */}
              <div className="flex items-center justify-between p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span className="text-xs text-zinc-400 font-fa mr-1">تعداد تاس:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setDiceCount((c) => Math.max(1, c - 1))}
                    className="w-6 h-6 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-amber-400 text-sm">
                    {diceCount}
                  </span>
                  <button
                    onClick={() => setDiceCount((c) => Math.min(20, c + 1))}
                    className="w-6 h-6 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Modifier */}
              <div className="flex items-center justify-between p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span className="text-xs text-zinc-400 font-fa mr-1">اصلاح‌گر (Mod):</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setModifier((m) => m - 1)}
                    className="w-6 h-6 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-zinc-200 text-xs">
                    {modifier >= 0 ? `+${modifier}` : modifier}
                  </span>
                  <button
                    onClick={() => setModifier((m) => m + 1)}
                    className="w-6 h-6 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* D&D 5e Advantage & Disadvantage Quick Triggers */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                id="btn-roll-advantage"
                onClick={() => executeRoll(undefined, "پرتاب با مزیت (Advantage)", "adv")}
                className="py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Advantage (2d20kh1)
              </button>

              <button
                id="btn-roll-disadvantage"
                onClick={() => executeRoll(undefined, "پرتاب با عدم‌مزیت (Disadvantage)", "dis")}
                className="py-2 px-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/25 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Disadvantage (2d20kl1)
              </button>
            </div>

            {/* Optional Roll Reason Label & Custom Formula */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={rollReason}
                onChange={(e) => setRollReason(e.target.value)}
                placeholder="عنوان پرتاب (مثلا: Attack Roll, Fireball)"
                className="flex-1 h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 font-fa"
              />

              <Button
                id="btn-execute-main-roll"
                size="sm"
                variant="amber"
                className="h-9 px-4 font-bold shadow-lg shadow-amber-500/20"
                onClick={() => executeRoll()}
                isLoading={isRolling}
              >
                پرتاب {diceCount}d{selectedDie}
                {modifier !== 0 && (modifier > 0 ? `+${modifier}` : modifier)}
              </Button>
            </div>
          </div>

          {/* Quick Roll History Tray */}
          {rollHistory.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
                <span className="flex items-center gap-1 font-fa">
                  <History className="w-3 h-3" />
                  تاریخچه آخرین پرتاب‌ها
                </span>
                <span className="font-mono text-[10px]">{rollHistory.length} roll</span>
              </div>

              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {rollHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-850"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.senderColor || "#3b82f6" }}
                      />
                      <span className="text-zinc-300 font-fa text-[11px]">
                        {item.senderName}
                      </span>
                      {item.diceRoll?.label && (
                        <span className="text-[10px] text-zinc-500 font-fa">
                          ({item.diceRoll.label})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-zinc-400 text-[11px]">
                        {item.diceRoll?.formula} ➔
                      </span>
                      <span
                        className={cn(
                          "font-mono font-bold text-xs px-1.5 py-0.5 rounded",
                          item.diceRoll?.isCriticalHit
                            ? "bg-amber-500/20 text-amber-400"
                            : item.diceRoll?.isCriticalFail
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-zinc-800 text-zinc-200"
                        )}
                      >
                        {item.diceRoll?.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
