import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RotateCcw, Sparkles, Trash2, Dices, Zap, Hand } from 'lucide-react';

import { GsapHeadingReveal } from './GsapHeadingReveal';
import { DiceCanvas } from '../../features/dice/components/DiceCanvas';
import { useDiceStore } from '../../features/dice/state/dice.store';
import { DICE_THEMES } from '../../features/dice/engine/textureGenerator';
import { diceAudio } from '../../features/dice/engine/diceAudio';

const DICE_TYPES = [
    { type: 'd4', label: 'D4', maxVal: 4 },
    { type: 'd6', label: 'D6', maxVal: 6 },
    { type: 'd8', label: 'D8', maxVal: 8 },
    { type: 'd10', label: 'D10', maxVal: 9 },
    { type: 'd12', label: 'D12', maxVal: 12 },
    { type: 'd20', label: 'D20', maxVal: 20 },
    { type: 'd100', label: 'D100', maxVal: 100 },
];

export const DiceSection = () => {
    const sectionRef = useRef(null);
    const [isCanvasVisible, setIsCanvasVisible] = useState(false);
    const hasTriggeredInitialRoll = useRef(false);

    const {
        isRolling,
        results,
        totalSum,
        triggerRoll,
        clearDice,
        selectedTheme,
        setSelectedTheme,
    } = useDiceStore();

    const [mode, setMode] = useState('quick');
    const [poolCounts, setPoolCounts] = useState({});
    const [lastRollTypes, setLastRollTypes] = useState(['d12']);
    const playedCritAudioRef = useRef(false);

    // بهینه‌سازی لود تنبل کانواس سه‌بعدی و فیزیک Rapier با IntersectionObserver
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsCanvasVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '300px' }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // بررسی رخ دادن کریتیکال (Max Die)
    const isAnyCritical = useMemo(() => {
        if (results.length === 0 || isRolling) return false;
        return results.some((r) => {
            const config = DICE_TYPES.find((d) => d.type === r.type);
            if (!config) return false;
            if (r.type === 'd10') return r.value === 0 || r.value === 9;
            return r.value === config.maxVal;
        });
    }, [results, isRolling]);

    useEffect(() => {
        if (isAnyCritical && !playedCritAudioRef.current) {
            diceAudio.playCriticalSuccess();
            playedCritAudioRef.current = true;
        }
        if (isRolling) {
            playedCritAudioRef.current = false;
        }
    }, [isAnyCritical, isRolling]);

    // پرتاب خودکار D12 فقط زمانی که کاربر به سکشن رسیده باشد
    useEffect(() => {
        if (isCanvasVisible && !hasTriggeredInitialRoll.current) {
            hasTriggeredInitialRoll.current = true;
            const timer = setTimeout(() => {
                triggerRoll(['d12']);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isCanvasVisible, triggerRoll]);

    const handleQuickRoll = (type) => {
        const diceToRoll = type === 'd100' ? ['d100', 'd10'] : [type];
        setLastRollTypes(diceToRoll);
        triggerRoll(diceToRoll);
    };

    const handleAddToPool = (type) => {
        setPoolCounts((prev) => ({
            ...prev,
            [type]: (prev[type] || 0) + 1,
        }));
    };

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

    const handleReRoll = () => {
        if (lastRollTypes.length > 0) {
            triggerRoll(lastRollTypes);
        } else {
            triggerRoll(['d12']);
        }
    };

    const totalPoolCount = Object.values(poolCounts).reduce((a, b) => a + b, 0);

    return (
        <section
            ref={sectionRef}
            id="dice"
            className="py-16 sm:py-28 px-3 sm:px-8 overflow-hidden w-full"
            dir="rtl"
        >
            <div className="max-w-6xl mx-auto">
                <GsapHeadingReveal
                    eyebrow="موتور فیزیک سه‌بعدی · REAL 3D RAPIER PHYSICS"
                    lines={['پرتاب واقعی،', 'درست مثل دور میز نبرد.']}
                    subtitle="با انگشت یا ماوس تاس‌ها را بردارید و پرتاب کنید. فیزیک واقعی قطعی، صداگذاری چوب و بافت مرمر دست‌ساز."
                    containerClassName="max-w-2xl mx-auto mb-8 sm:mb-14"
                />

                <div className="relative rounded-3xl bg-[#090a10] border border-[#242738] shadow-[0_30px_90px_rgba(0,0,0,0.25)] h-[480px] sm:h-[580px] overflow-hidden select-none">

                    {/* کانتینر استیج سه‌بعدی مجهز به touch-none اختصاصی جهت فعال‌سازی درگ و پرتاب با انگشت در موبایل */}
                    <div
                        className="absolute inset-0 touch-none"
                        style={{ touchAction: 'none' }}
                    >
                        {isCanvasVisible ? (
                            <DiceCanvas />
                        ) : (
                            <div className="w-full h-full bg-[#090a10] flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin opacity-40" />
                            </div>
                        )}
                    </div>

                    {/* راهنمای سریع لمس برای کاربر موبایل */}
                    <div className="sm:hidden absolute top-3 right-3 z-10 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/70 border border-zinc-800 text-[10px] text-zinc-400 backdrop-blur-md">
                        <Hand className="w-3 h-3 text-amber-400" />
                        <span>با لمس تاس را پرتاب کنید</span>
                    </div>

                    {/* بنر نتیجه نهایی */}
                    {results.length > 0 && (
                        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-1.5 z-20 animate-fade-in-up">
                            <div
                                className={`flex items-center gap-2 sm:gap-3.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
                                    isAnyCritical
                                        ? "bg-gradient-to-r from-amber-950/90 via-zinc-950/95 to-amber-950/90 border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.45)] scale-105"
                                        : "bg-zinc-950/90 border border-amber-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.7)]"
                                }`}
                            >
                                {isAnyCritical && (
                                    <div className="flex items-center gap-1 text-amber-300 text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 animate-pulse">
                                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 animate-spin" />
                                        <span>کریتیکال!</span>
                                    </div>
                                )}

                                <span className="text-zinc-400 text-[11px] sm:text-xs font-semibold">مجموع:</span>

                                <span
                                    className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-all ${
                                        isRolling
                                            ? "text-zinc-500 animate-pulse"
                                            : isAnyCritical
                                                ? "text-amber-300 text-3xl sm:text-4xl drop-shadow-[0_0_18px_rgba(252,211,77,0.85)] animate-bounce"
                                                : "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]"
                                    }`}
                                >
                                    {totalSum}
                                </span>

                                <div className="flex items-center gap-1 border-r border-zinc-800/80 pr-2 sm:pr-3 mr-0.5 sm:mr-1">
                                    {results.map((r, i) => (
                                        <span
                                            key={i}
                                            className="text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-lg font-mono font-bold bg-zinc-900 border border-zinc-700/80 text-amber-200/90 shadow-inner"
                                        >
                                            {r.value}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleReRoll}
                                    className="p-1 sm:p-1.5 text-zinc-400 hover:text-amber-300 rounded-xl hover:bg-zinc-900 active:scale-90 transition-all cursor-pointer"
                                    title="پرتاب مجدد"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* داک کنترل تاس در پایین باکس */}
                    <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-2 z-20 w-full px-2 sm:px-4 max-w-2xl">
                        {mode === 'pool' && totalPoolCount > 0 && (
                            <div className="bg-zinc-950/95 border border-amber-500/30 p-2 rounded-2xl shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-2 animate-fade-in-up w-full sm:w-auto">
                                <div className="flex items-center gap-1 flex-wrap">
                                    {Object.entries(poolCounts).map(([type, count]) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={(e) => handleRemoveFromPool(type, e)}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-300 text-xs font-mono font-bold hover:bg-rose-950/60 hover:text-rose-200 transition-all cursor-pointer"
                                        >
                                            <span>{count}×</span>
                                            <span className="uppercase">{type}</span>
                                            <span className="text-[9px] text-zinc-500">×</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setPoolCounts({})}
                                        className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-xl hover:bg-zinc-900 transition-all cursor-pointer"
                                        title="پاکسازی"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleRollPool}
                                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                        <Dices className="w-3.5 h-3.5" />
                                        <span>پرتاب ({totalPoolCount})</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-1 sm:gap-1.5 bg-zinc-950/90 border border-zinc-800/80 p-1 sm:p-1.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl flex-wrap justify-center max-w-full">

                            {/* سوییچر تم‌ها */}
                            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80">
                                {Object.values(DICE_THEMES).map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setSelectedTheme(t.id)}
                                        title={t.name}
                                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-150 cursor-pointer active:scale-90 ${
                                            selectedTheme === t.id
                                                ? "ring-2 ring-amber-400 scale-110 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                                                : "opacity-70 hover:opacity-100 hover:scale-105"
                                        }`}
                                        style={{
                                            background: `linear-gradient(135deg, ${t.bgCenter} 0%, ${t.bgEdge} 100%)`,
                                            border: `1.5px solid ${t.borderColor || '#ca8a04'}`,
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="w-px h-4 sm:h-5 bg-zinc-800/80 mx-0.5" />

                            {/* سوییچر حالت تکی / استخر */}
                            <div className="flex items-center bg-zinc-900/80 p-0.5 rounded-xl border border-zinc-800/80">
                                <button
                                    type="button"
                                    onClick={() => setMode('quick')}
                                    className={`p-1 sm:p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        mode === 'quick'
                                            ? "bg-amber-500 text-zinc-950 shadow-sm"
                                            : "text-zinc-400 hover:text-zinc-200"
                                    }`}
                                    title="پرتاب سریع (تکی)"
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('pool')}
                                    className={`p-1 sm:p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        mode === 'pool'
                                            ? "bg-amber-500 text-zinc-950 shadow-sm"
                                            : "text-zinc-400 hover:text-zinc-200"
                                    }`}
                                    title="حالت استخر (چندتایی)"
                                >
                                    <Dices className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="w-px h-4 sm:h-5 bg-zinc-800/80 mx-0.5" />

                            {/* دکمه‌های انتخاب تاس */}
                            {DICE_TYPES.map((d) => {
                                const inPool = poolCounts[d.type] || 0;
                                return (
                                    <button
                                        key={d.type}
                                        type="button"
                                        onClick={() => {
                                            if (mode === 'quick') {
                                                handleQuickRoll(d.type);
                                            } else {
                                                handleAddToPool(d.type);
                                            }
                                        }}
                                        className="relative px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-zinc-900/60 hover:bg-zinc-800/90 border border-zinc-800 hover:border-amber-500/50 text-amber-200/90 font-mono text-[11px] sm:text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
                                    >
                                        <span>{d.label}</span>
                                        {mode === 'pool' && inPool > 0 && (
                                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-500 text-zinc-950 text-[9px] sm:text-[10px] font-sans font-black rounded-full flex items-center justify-center shadow-md animate-fade-in-up">
                                                {inPool}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}

                            <div className="w-px h-4 sm:h-5 bg-zinc-800/80 mx-0.5" />

                            <button
                                type="button"
                                onClick={() => {
                                    clearDice();
                                    setPoolCounts({});
                                }}
                                className="p-1 sm:p-1.5 text-zinc-400 hover:text-rose-400 rounded-xl hover:bg-zinc-900 active:scale-90 transition-all cursor-pointer"
                                title="پاکسازی میز"
                            >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};