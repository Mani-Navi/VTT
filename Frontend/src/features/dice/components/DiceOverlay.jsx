import React, { useState, useEffect, useRef } from 'react';
import { DiceCanvas } from './DiceCanvas';
import { useDiceStore } from '../state/dice.store';
import { DICE_THEMES } from '../engine/textureGenerator';
import { diceAudio } from '../engine/diceAudio';
import { RotateCcw, X, Trash2, Dices, Zap, User, Sparkles } from 'lucide-react';

const DICE_TYPES = [
    { type: 'd4', label: 'D4', maxVal: 4 },
    { type: 'd6', label: 'D6', maxVal: 6 },
    { type: 'd8', label: 'D8', maxVal: 8 },
    { type: 'd10', label: 'D10', maxVal: 9 }, // در فرمت تک d10 مقدار 0 تا 9 است
    { type: 'd12', label: 'D12', maxVal: 12 },
    { type: 'd20', label: 'D20', maxVal: 20 },
    { type: 'd100', label: 'D100', maxVal: 100 },
];

export function DiceOverlay() {
    const {
        isOpen,
        isRolling,
        results,
        totalSum,
        rollerName,
        isRemoteRoll,
        setOpen,
        triggerRoll,
        clearDice,
        activeDice,
        selectedTheme,
        setSelectedTheme,
    } = useDiceStore();

    const [mode, setMode] = useState('quick');
    const [poolCounts, setPoolCounts] = useState({});
    const [lastRollTypes, setLastRollTypes] = useState(['d20']);
    const playedCritAudioRef = useRef(false);

    // بررسی اینکه آیا هر یک از تاس‌ها به حداکثر مقدار ممکن خود (Max / Critical) رسیده‌اند یا خیر
    const isAnyCritical = React.useMemo(() => {
        if (results.length === 0 || isRolling) return false;
        return results.some((r) => {
            const config = DICE_TYPES.find((d) => d.type === r.type);
            if (!config) return false;
            if (r.type === 'd10') return r.value === 0 || r.value === 9;
            return r.value === config.maxVal;
        });
    }, [results, isRolling]);

    // پخش افکت صدای جادویی در صورت وقوع Critical
    useEffect(() => {
        if (isAnyCritical && !playedCritAudioRef.current) {
            diceAudio.playCriticalSuccess();
            playedCritAudioRef.current = true;
        }
        if (isRolling) {
            playedCritAudioRef.current = false;
        }
    }, [isAnyCritical, isRolling]);

    if (!isOpen && activeDice.length === 0) return null;

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

    const handleClearPool = () => {
        setPoolCounts({});
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

            {/* رندر بلادرنگ ۳D */}
            <div className="absolute inset-0">
                <DiceCanvas />
            </div>

            {/* بنر نتیجه نهایی در بالای صفحه */}
            {results.length > 0 && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <div
                        className={`flex items-center gap-3.5 px-5 py-2.5 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
                            isAnyCritical
                                ? 'bg-gradient-to-r from-amber-950/90 via-zinc-950/95 to-amber-950/90 border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.55)] scale-105'
                                : 'bg-zinc-950/90 border border-purple-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.6)]'
                        }`}
                    >
                        {/* بج نشان‌دهنده Critical */}
                        {isAnyCritical && (
                            <div className="flex items-center gap-1 text-amber-300 text-xs font-black px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/50 animate-pulse">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                                <span>کرییتیکال!</span>
                            </div>
                        )}

                        {isRemoteRoll && rollerName ? (
                            <div className="flex items-center gap-1.5 pl-3 border-l border-zinc-800 text-purple-300 text-xs font-bold">
                                <User className="w-3.5 h-3.5 text-purple-400" />
                                <span>{rollerName}:</span>
                            </div>
                        ) : (
                            <span className="text-zinc-400 text-xs font-medium">مجموع:</span>
                        )}

                        <span
                            className={`text-3xl font-black font-mono tracking-tight transition-all ${
                                isRolling
                                    ? 'text-zinc-500 animate-pulse'
                                    : isAnyCritical
                                        ? 'text-amber-300 text-4xl drop-shadow-[0_0_18px_rgba(252,211,77,0.9)] animate-bounce'
                                        : 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                            }`}
                        >
                            {totalSum}
                        </span>

                        <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-3.5 mr-1">
                            {results.map((r, i) => {
                                const cfg = DICE_TYPES.find((d) => d.type === r.type);
                                const isCritDie = cfg && (r.value === cfg.maxVal || (r.type === 'd10' && r.value === 0));

                                return (
                                    <span
                                        key={i}
                                        className={`text-xs px-2 py-0.5 rounded-lg font-mono font-bold shadow-inner transition-all ${
                                            isCritDie
                                                ? 'bg-amber-400 text-zinc-950 font-black border border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-110'
                                                : 'bg-purple-950/60 border border-purple-500/30 text-amber-200/90'
                                        }`}
                                    >
                                        {r.value}
                                    </span>
                                );
                            })}
                        </div>

                        {!isRemoteRoll && (
                            <button
                                onClick={handleReRoll}
                                className="p-1.5 text-zinc-400 hover:text-amber-300 rounded-lg hover:bg-zinc-800/80 transition"
                                title="پرتاب مجدد"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}

                        {/* دکمه بستن بنر برای تماشاگران */}
                        {isRemoteRoll && (
                            <button
                                onClick={() => clearDice()}
                                className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg transition"
                                title="بستن"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* داک شناور انتخاب تاس */}
            {isOpen && !isRemoteRoll && (
                <div className="absolute bottom-6 left-6 pointer-events-auto flex flex-col gap-2">

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

                    <div className="flex items-center gap-1.5 bg-zinc-950/95 border border-zinc-800/90 p-1.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl">

                        {/* انتخاب تِم رنگی ۶‌گانه */}
                        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80 ml-1">
                            {Object.values(DICE_THEMES).map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTheme(t.id)}
                                    title={t.name}
                                    className={`w-5 h-5 rounded-full transition-all duration-150 relative ${
                                        selectedTheme === t.id
                                            ? 'ring-2 ring-amber-400 scale-110 shadow-[0_0_8px_rgba(251,191,36,0.5)] z-10'
                                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                                    }`}
                                    style={{
                                        background: `linear-gradient(135deg, ${t.bgCenter} 0%, ${t.bgEdge} 100%)`,
                                        border: `1.5px solid ${t.borderColor || '#ca8a04'}`,
                                    }}
                                />
                            ))}
                        </div>

                        <div className="w-px h-5 bg-zinc-800 mx-0.5" />

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
                            title="بستن منو و پاکسازی تاس‌ها"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}