// src/features/dice/components/DiceOverlay.jsx
import React, { useState, useEffect } from 'react';
import { DiceCanvas } from './DiceCanvas';
import { useDiceStore } from '../state/dice.store';
import { RotateCcw, X, Trash2, Dices, Zap } from 'lucide-react';

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

    const [mode, setMode] = useState('quick');
    const [poolCounts, setPoolCounts] = useState({});
    const [lastRollTypes, setLastRollTypes] = useState(['d20']);

    // تایمر پاک‌سازی خودکار تاس‌ها ۴.۵ ثانیه پس از توقف
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

    // ۱. پرتاب خودکار و سریع تکی
    const handleQuickRoll = (type) => {
        const diceToRoll = type === 'd100' ? ['d100', 'd10'] : [type];
        setLastRollTypes(diceToRoll);
        triggerRoll(diceToRoll);
    };

    // ۲. افزودن تاس به استخر
    const handleAddToPool = (type) => {
        setPoolCounts((prev) => ({
            ...prev,
            [type]: (prev[type] || 0) + 1,
        }));
    };

    // ۳. کاهش از استخر
    const handleRemoveFromPool = (type, e) => {
        e.stopPropagation();
        setPoolCounts((prev) => {
            const current = prev[type] || 0;
            if (current <= 1) {
                const next = { ...prev };
                delete next[type];
                return next;
            }
            return { ...prev, [type]: current - 1 };
        });
    };

    // ۴. خالی کردن استخر
    const handleClearPool = () => {
        setPoolCounts({});
    };

    // ۵. پرتاب کل استخر به صورت خودکار
    const handleRollPool = () => {
        const diceToRoll = [];
        Object.entries(poolCounts).forEach(([type, count]) => {
            for (let i = 0; i < count; i++) {
                if (type === 'd100') {
                    diceToRoll.push('d100', 'd10');
                } else {
                    diceToRoll.push(type);
                }
            }
        });

        if (diceToRoll.length === 0) return;

        setLastRollTypes(diceToRoll);
        triggerRoll(diceToRoll);
    };

    const totalPoolDiceCount = Object.values(poolCounts).reduce((a, b) => a + b, 0);

    const handleReRoll = () => {
        if (lastRollTypes.length > 0) {
            triggerRoll(lastRollTypes);
        } else {
            triggerRoll(['d20']);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] pointer-events-none select-none font-fa" dir="rtl">

            {/* رندر بلادرنگ ۳D و دریافت اشاره‌گر ماوس برای برداشتن تاس‌ها */}
            <div className="absolute inset-0">
                <DiceCanvas />
            </div>

            {/* بنر نتیجه نهایی در بالای صفحه */}
            {results.length > 0 && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3.5 bg-zinc-950/90 border border-purple-500/40 px-5 py-2.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                        <span className="text-zinc-400 text-xs font-medium">مجموع:</span>
                        <span className={`text-3xl font-black font-mono tracking-tight ${isRolling ? 'text-zinc-500 animate-pulse' : 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]'}`}>
                            {totalSum}
                        </span>

                        <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-3.5 mr-1">
                            {results.map((r, i) => (
                                <span
                                    key={i}
                                    className="text-xs bg-purple-950/60 border border-purple-500/30 text-amber-200/90 px-2 py-0.5 rounded-lg font-mono font-bold shadow-inner"
                                >
                                    {r.value}
                                </span>
                            ))}
                        </div>

                        <button
                            onClick={handleReRoll}
                            className="p-1.5 text-zinc-400 hover:text-amber-300 rounded-lg hover:bg-zinc-800/80 transition"
                            title="پرتاب مجدد"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* داک شناور انتخاب تاس */}
            <div className="absolute bottom-6 left-6 pointer-events-auto flex flex-col gap-2">

                {/* پیش‌نمایش استخر در حالت چندتایی */}
                {mode === 'pool' && totalPoolDiceCount > 0 && (
                    <div className="bg-zinc-950/95 border border-purple-500/30 p-2 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                            {Object.entries(poolCounts).map(([type, count]) => (
                                <button
                                    key={type}
                                    onClick={(e) => handleRemoveFromPool(type, e)}
                                    title="برای حذف کلیک کنید"
                                    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-purple-950/70 border border-purple-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-rose-950/60 hover:border-rose-500/50 hover:text-rose-200 transition group"
                                >
                                    <span>{count}×</span>
                                    <span className="uppercase">{type}</span>
                                    <span className="text-[10px] text-zinc-500 group-hover:text-rose-300 mr-0.5">×</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={handleClearPool}
                                className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-xl hover:bg-zinc-800 transition"
                                title="پاکسازی استخر"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleRollPool}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center gap-1.5"
                            >
                                <Dices className="w-3.5 h-3.5" />
                                <span>پرتاب ({totalPoolDiceCount})</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* داک دکمه‌ها */}
                <div className="flex items-center gap-1.5 bg-zinc-950/95 border border-zinc-800/90 p-1.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl">

                    <div className="flex items-center bg-zinc-900/90 p-0.5 rounded-xl border border-zinc-800/80 ml-1">
                        <button
                            onClick={() => setMode('quick')}
                            className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                                mode === 'quick'
                                    ? 'bg-purple-950 border border-purple-500/40 text-amber-300 shadow-sm'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="پرتاب سریع (تکی)"
                        >
                            <Zap className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setMode('pool')}
                            className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                                mode === 'pool'
                                    ? 'bg-purple-950 border border-purple-500/40 text-amber-300 shadow-sm'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="حالت استخر (چندتایی)"
                        >
                            <Dices className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="w-px h-5 bg-zinc-800 mx-0.5" />

                    {DICE_TYPES.map((d) => {
                        const inPoolCount = poolCounts[d.type] || 0;
                        return (
                            <button
                                key={d.type}
                                onClick={() => {
                                    if (mode === 'quick') {
                                        handleQuickRoll(d.type);
                                    } else {
                                        handleAddToPool(d.type);
                                    }
                                }}
                                className="relative px-2.5 py-1.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/20 hover:border-amber-500/40 text-amber-200 font-serif text-xs font-bold transition active:scale-95 group"
                            >
                                <span>{d.label}</span>
                                {mode === 'pool' && inPoolCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-zinc-950 text-[10px] font-sans font-black rounded-full flex items-center justify-center shadow-md animate-in zoom-in-75">
                                        {inPoolCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    <div className="w-px h-5 bg-zinc-800 mx-0.5" />

                    <button
                        onClick={() => {
                            clearDice();
                            setOpen(false);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-xl hover:bg-zinc-900 transition"
                        title="بستن"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

        </div>
    );
}