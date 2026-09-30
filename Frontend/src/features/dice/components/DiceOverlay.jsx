import React, { useState, useEffect } from 'react';
import { DiceCanvas } from './DiceCanvas';
import { useDiceStore } from '../state/dice.store';
import { RotateCcw, X, Plus } from 'lucide-react';

const DICE_TYPES = [
    { type: 'd4', label: 'D4' },
    { type: 'd6', label: 'D6' },
    { type: 'd8', label: 'D8' },
    { type: 'd10', label: 'D10' },
    { type: 'd12', label: 'D12' },
    { type: 'd20', label: 'D20' },
    { type: 'd100', label: 'D100' },
];

export function DiceOverlay() {
    const { isOpen, isRolling, results, totalSum, setOpen, triggerRoll, clearDice, activeDice } = useDiceStore();
    const [selectedPool, setSelectedPool] = useState([]);

    // تایمر پاک‌سازی خودکار تاس‌ها ۳.۵ ثانیه پس از توقف کامل
    useEffect(() => {
        let timer;
        if (!isRolling && results.length > 0 && activeDice.length > 0) {
            timer = setTimeout(() => {
                clearDice();
            }, 4500);
        }
        return () => clearTimeout(timer);
    }, [isRolling, results, activeDice, clearDice]);

    if (!isOpen && activeDice.length === 0) return null;

    const handleQuickAdd = (type) => {
        if (type === 'd100') {
            const nextPool = ['d100', 'd10'];
            setSelectedPool(nextPool);
            triggerRoll(nextPool);
            return;
        }
        const nextPool = [...selectedPool, type];
        setSelectedPool(nextPool);
        triggerRoll(nextPool);
    };

    const handleReRoll = () => {
        if (selectedPool.length > 0) {
            triggerRoll(selectedPool);
        } else {
            triggerRoll(['d20']);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] pointer-events-none select-none font-fa">

            {/* رندر بلادرنگ ۳D تاس‌ها مستقیماً روی نقشه بازی */}
            <div className="absolute inset-0">
                <DiceCanvas />
            </div>

            {/* بنر نتیجه نهایی بزرگ و درخشان در بالای صفحه */}
            {results.length > 0 && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 bg-zinc-950/85 border border-purple-500/40 px-6 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md">
                        <span className="text-zinc-400 text-xs font-bold">نتیجه پرتاب:</span>
                        <span className={`text-4xl font-black font-mono ${isRolling ? 'text-zinc-500 animate-pulse' : 'text-amber-400'}`}>
              {totalSum}
            </span>

                        {/* تفکیک مقادیر هر تاس */}
                        <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-3 mr-1">
                            {results.map((r, i) => (
                                <span key={i} className="text-xs bg-purple-950/70 border border-purple-500/30 text-amber-200 px-2 py-0.5 rounded-lg font-mono font-bold">
                  {r.value}
                </span>
                            ))}
                        </div>

                        <button
                            onClick={handleReRoll}
                            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
                            title="رول مجدد"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* داک شناور و مینیمال انتخاب تاس‌ها در پایین-راست نقشه (بدون سد کردن دید) */}
            <div className="absolute bottom-6 left-6 pointer-events-auto flex items-center gap-1.5 bg-zinc-950/90 border border-zinc-800/90 p-1.5 rounded-2xl shadow-2xl backdrop-blur-xl">
                {DICE_TYPES.map((d) => (
                    <button
                        key={d.type}
                        onClick={() => handleQuickAdd(d.type)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/20 hover:border-amber-500/40 text-amber-300 font-serif text-xs font-bold transition active:scale-90"
                    >
                        {d.label}
                    </button>
                ))}

                <div className="w-px h-5 bg-zinc-800 mx-1" />

                <button
                    onClick={() => {
                        clearDice();
                        setOpen(false);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg transition"
                    title="بستن"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

        </div>
    );
}