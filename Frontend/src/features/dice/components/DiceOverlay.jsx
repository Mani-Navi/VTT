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
    { type: 'd100', label: '00' },
];

export function DiceOverlay() {
    const { isOpen, isRolling, results, totalSum, setOpen, triggerRoll, clearDice } = useDiceStore();
    const [selectedPool, setSelectedPool] = useState([]);

    if (!isOpen) return null;

// مدیریت افزودن تاس با منطق جفتی برای d100
    const handleQuickAdd = (type) => {
        if (type === 'd100') {
            // در D&D تاس d100 همواره دو قلو است: ده‌گان (d100) + یکان (d10)
            const nextPool = [...selectedPool, 'd100', 'd10'];
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

            {/* بدنه کل سینی و سایدبار */}
            <div className="relative flex h-[92vh] max-h-[820px] w-full max-w-[480px] sm:max-w-[520px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 bg-[#0e0f13]">

                {/* سایدبار عمودی سمت چپ دقیقاً مشابه اسکرین‌شات */}
                <aside className="w-16 sm:w-18 bg-[#181920]/95 border-r border-zinc-800/80 flex flex-col items-center py-4 z-20 shrink-0">

                    {/* نشانگر بزرگ d20 در بالای سایدبار */}
                    <button
                        onClick={() => handleQuickAdd('d20')}
                        className="w-11 h-11 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-amber-300 font-serif font-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
                        title="رول D20"
                    >
                        20
                    </button>

                    <div className="w-8 h-px bg-zinc-800 my-3" />

                    {/* لیست عمودی انواع تاس‌ها با استایل فانتزی */}
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

                    {/* ابزارهای پایین سایدبار */}
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                        <button
                            onClick={() => setSelectedPool([])}
                            className="p-2 hover:text-white transition"
                            title="پاک‌کردن انتخاب‌ها"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleQuickAdd('d6')}
                            className="p-2 hover:text-white transition text-xs font-bold"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={clearDice}
                            className="p-2 hover:text-white transition"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </aside>

                {/* سینی فیزیکی سه‌بعدی و هدر شناور */}
                <div className="relative flex-1 h-full w-full bg-[#100f13] overflow-hidden">

                    {/* هدر شناور مینیمال: Re-roll، عدد مجموع، و دکمه X */}
                    <div className="absolute top-4 inset-x-6 z-20 flex items-center justify-between pointer-events-auto">
                        <button
                            onClick={handleReRoll}
                            className="p-2.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition active:rotate-180 duration-300"
                            title="رول مجدد"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>

                        {/* عدد مجموع بزرگ و درخشان سفید */}
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

                    {/* رندر سه‌بعدی سینی و تاس‌های مرمر بنفش */}
                    <DiceCanvas />

                </div>

            </div>
        </div>
    );
}