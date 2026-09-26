// src/features/dice/components/DiceOverlay.jsx
import React from 'react';
import { DiceCanvas } from './DiceCanvas';
import { useDiceStore } from '../state/dice.store';
import { Dices, RotateCcw, X } from 'lucide-react';

export function DiceOverlay() {
    const { isOpen, isRolling, results, totalSum, setOpen, triggerRoll, clearDice } = useDiceStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
            {/* ظرف اصلی سینی ۳D */}
            <div className="relative w-full max-w-2xl h-[70vh] max-h-[580px] bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">

                {/* نوار بالای مودال */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/50">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <Dices className="w-5 h-5" />
                        <span>پرتاب تاس سه‌بعدی فیزیکی</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearDice}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                            title="پاک‌کردن سینی"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* بستر رندر فیزیک ۳D */}
                <div className="relative flex-1 w-full h-full">
                    <DiceCanvas />

                    {/* بنر اعلام نتیجه نهایی در پایین سینی */}
                    {results.length > 0 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 border border-amber-500/40 px-6 py-2.5 rounded-2xl shadow-xl backdrop-blur-md">
                            <span className="text-slate-300 text-sm">مجموع:</span>
                            <span className={`text-2xl font-black ${isRolling ? 'text-slate-400 animate-pulse' : 'text-amber-400'}`}>
                {totalSum}
              </span>
                            <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3 mr-1">
                                {results.map((r, i) => (
                                    <span key={i} className="text-xs bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono">
                    {r.value}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* نوار دکمه‌های پرتاب سریع */}
                <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            disabled={isRolling}
                            onClick={() => triggerRoll(['d20'])}
                            className="px-4 py-2 bg-red-700/80 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition active:scale-95 shadow-lg shadow-red-900/20"
                        >
                            رول 1d20
                        </button>
                        <button
                            disabled={isRolling}
                            onClick={() => triggerRoll(['d20', 'd20'])}
                            className="px-4 py-2 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/50 rounded-xl text-sm transition active:scale-95"
                        >
                            Advantage (2d20)
                        </button>
                        <button
                            disabled={isRolling}
                            onClick={() => triggerRoll(['d6'])}
                            className="px-4 py-2 bg-blue-700/80 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition active:scale-95 shadow-lg shadow-blue-900/20"
                        >
                            رول 1d6
                        </button>
                        <button
                            disabled={isRolling}
                            onClick={() => triggerRoll(['d6', 'd6', 'd6'])}
                            className="px-4 py-2 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/50 rounded-xl text-sm transition active:scale-95"
                        >
                            3d6
                        </button>
                    </div>

                    <span className="text-xs text-slate-500 hidden sm:inline">
            فیزیک بلادرنگ WASM (Rapier)
          </span>
                </div>

            </div>
        </div>
    );
}