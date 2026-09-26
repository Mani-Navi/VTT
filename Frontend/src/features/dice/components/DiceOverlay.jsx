// src/features/dice/components/DiceOverlay.jsx
import React from 'react';
import { DiceCanvas } from './DiceCanvas';
import { useDiceStore } from '../state/dice.store';
import { formatDieValue } from '../engine/diceDefinitions';
import { Dices, RotateCcw, X } from 'lucide-react';

// دکمه‌های پرتاب سریع برای هر ۷ نوع تاس D&D
const QUICK_ROLL_BUTTONS = [
    { label: 'd4', dice: ['d4'], color: 'emerald' },
    { label: 'd6', dice: ['d6'], color: 'blue' },
    { label: 'd8', dice: ['d8'], color: 'teal' },
    { label: 'd10', dice: ['d10'], color: 'violet' },
    { label: 'd12', dice: ['d12'], color: 'amber' },
    { label: 'd20', dice: ['d20'], color: 'red' },
    { label: 'd100', dice: ['d100'], color: 'cyan' },
];

const COLOR_CLASSES = {
    emerald: 'bg-emerald-700/80 hover:bg-emerald-600 shadow-emerald-900/20',
    blue: 'bg-blue-700/80 hover:bg-blue-600 shadow-blue-900/20',
    teal: 'bg-teal-700/80 hover:bg-teal-600 shadow-teal-900/20',
    violet: 'bg-violet-700/80 hover:bg-violet-600 shadow-violet-900/20',
    amber: 'bg-amber-700/80 hover:bg-amber-600 shadow-amber-900/20',
    red: 'bg-red-700/80 hover:bg-red-600 shadow-red-900/20',
    cyan: 'bg-cyan-700/80 hover:bg-cyan-600 shadow-cyan-900/20',
};

export function DiceOverlay() {
    const { isOpen, isRolling, activeDice, results, totalSum, setOpen, triggerRoll, clearDice } = useDiceStore();

    if (!isOpen) return null;

    // نتیجه‌ی هر تاس را با نوعش جفت می‌کنیم (نوع در activeDice است، نه در
    // results) تا وقتی چند نوع تاس مختلف با هم رول می‌شوند، مشخص باشد کدام
    // عدد مال کدام تاس است.
    const labeledResults = results.map((r) => {
        const die = activeDice.find((d) => d.id === r.id);
        return { ...r, type: die?.type ?? 'd20' };
    });

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
                    {labeledResults.length > 0 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 border border-amber-500/40 px-6 py-2.5 rounded-2xl shadow-xl backdrop-blur-md max-w-[92%] overflow-x-auto">
                            <span className="text-slate-300 text-sm shrink-0">مجموع:</span>
                            <span className={`text-2xl font-black shrink-0 ${isRolling ? 'text-slate-400 animate-pulse' : 'text-amber-400'}`}>
                                {totalSum}
                            </span>
                            <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3 mr-1">
                                {labeledResults.map((r, i) => (
                                    <span
                                        key={i}
                                        className="text-xs bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono whitespace-nowrap"
                                        title={r.type}
                                    >
                                        {r.type}:{formatDieValue(r.type, r.value)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* نوار دکمه‌های پرتاب سریع */}
                <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
                    <div className="flex items-center gap-2">
                        {QUICK_ROLL_BUTTONS.map((btn) => (
                            <button
                                key={btn.label}
                                disabled={isRolling}
                                onClick={() => triggerRoll(btn.dice)}
                                className={`px-4 py-2 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition active:scale-95 shadow-lg shrink-0 ${COLOR_CLASSES[btn.color]}`}
                            >
                                {btn.label}
                            </button>
                        ))}
                        <button
                            disabled={isRolling}
                            onClick={() => triggerRoll(['d20', 'd20'])}
                            className="px-4 py-2 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/50 rounded-xl text-sm transition active:scale-95 shrink-0"
                        >
                            Advantage (2d20)
                        </button>
                        <button
                            disabled={isRolling}
                            onClick={() => triggerRoll(['d6', 'd6', 'd6'])}
                            className="px-4 py-2 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/50 rounded-xl text-sm transition active:scale-95 shrink-0"
                        >
                            3d6
                        </button>
                    </div>

                    <span className="text-xs text-slate-500 hidden sm:inline shrink-0">
                        فیزیک بلادرنگ WASM (Rapier)
                    </span>
                </div>

            </div>
        </div>
    );
}