import React, { useState } from 'react';
import { DiceCanvas } from './DiceCanvas';
import { useDiceStore } from '../state/dice.store';
import { RotateCcw, X, Eye, Plus, Search } from 'lucide-react';

const DICE_TYPES = [
    { type: 'd4', label: '4' },
    { type: 'd6', label: '6' },
    { type: 'd8', label: '8' },
    { type: 'd10', label: '0' },
    { type: 'd12', label: '12' },
    { type: 'd20', label: '20' },
    { type: 'd100', label: '00' }, // تاس درصد جفتی
];

export function DiceOverlay() {
    const { isOpen, isRolling, results, totalSum, setOpen, triggerRoll, clearDice } = useDiceStore();
    const [selectedPool, setSelectedPool] = useState([]);

    if (!isOpen) return null;

    const handleQuickAdd = (type) => {
        if (type === 'd100') {
            // در D&D تاس d100 همواره جفت ده‌گان + یکان پرتاب می‌شود
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md select-none font-fa">

            {/* سینی مستطیلی چوبی و سایدبار عمودی */}
            <div className="relative flex h-[92vh] max-h-[820px] w-full max-w-[480px] sm:max-w-[520px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 bg-[#0e0f13]">

                {/* سایدبار عمودی سمت چپ */}
                <aside className="w-16 sm:w-18 bg-[#181920]/95 border-r border-zinc-800/80 flex flex-col items-center py-4 z-20 shrink-0">

                    <button
                        onClick={() => handleQuickAdd('d20')}
                        className="w-11 h-11 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-amber-300 font-serif font-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
                        title="رول D20"
                    >
                        20
                    </button>

                    <div className="w-8 h-px bg-zinc-800 my-3" />

                    {/* لیست دکمه‌های تاس */}
                    <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto no-scrollbar w-full px-1">
                        {DICE_TYPES.map((d) => (
                            <button
                                key={d.type}
                                onClick={() => handleQuickAdd(d.type)}
                                className="w-10 h-10 rounded-xl bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/20 hover:border-amber-500/40 text-amber-200/90 font-serif text-xs font-bold flex flex-col items-center justify-center transition active:scale-90"
                            >
                                <span>{d.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="w-8 h-px bg-zinc-800 my-2" />

                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                        <button onClick={() => setSelectedPool([])} className="p-2 hover:text-white transition">
                            <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleQuickAdd('d6')} className="p-2 hover:text-white transition text-xs font-bold">
                            <Plus className="w-4 h-4" />
                        </button>
                        <button onClick={clearDice} className="p-2 hover:text-white transition">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </aside>

                {/* سینی فیزیکی سه‌بعدی */}
                <div className="relative flex-1 h-full w-full bg-[#100f13] overflow-hidden">

                    {/* هدر شناور: Re-roll، عدد مجموع، و خروج */}
                    <div className="absolute top-4 inset-x-6 z-20 flex items-center justify-between pointer-events-auto">
                        <button
                            onClick={handleReRoll}
                            className="p-2.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition active:rotate-180 duration-300"
                            title="رول مجدد"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>

                        {/* عدد نهایی بزرگ در مرکز */}
                        <div className="flex items-center justify-center">
              <span className={`text-5xl font-black tracking-tight drop-shadow-md ${isRolling ? 'text-zinc-500 animate-pulse' : 'text-zinc-100'}`}>
                {results.length > 0 ? totalSum : ''}
              </span>
                        </div>

                        <button
                            onClick={() => setOpen(false)}
                            className="p-2.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition"
                            title="بستن سینی"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* بنر تفکیک ده‌گان و یکان در پایین سینی */}
                    {results.length > 0 && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-zinc-900/90 border border-purple-500/30 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md">
                            {results.map((r, idx) => (
                                <div key={idx} className="flex items-center gap-1 text-xs">
                                    <span className="text-zinc-400 font-bold">{r.type === 'd100' ? 'ده‌گان:' : r.type === 'd10' ? 'یکان:' : ''}</span>
                                    <span className="font-mono bg-purple-950/80 border border-purple-500/40 text-amber-300 px-2 py-0.5 rounded-lg font-bold">
                    {r.value}
                  </span>
                                    {idx < results.length - 1 && <span className="text-zinc-500">+</span>}
                                </div>
                            ))}
                            <span className="text-zinc-400 font-bold mr-1">=</span>
                            <span className="text-amber-400 font-black text-sm">{totalSum}</span>
                        </div>
                    )}

                    {/* رندر سه‌بعدی Canvas */}
                    <DiceCanvas />

                </div>

            </div>
        </div>
    );
}