// src/features/dice/components/DiceOverlay.jsx
import React, { useState, useEffect, useRef } from 'react';
import { DiceCanvas } from './DiceCanvas';
import { useDiceStore } from '../state/dice.store';
import { RotateCcw, X, Trash2, Dices, Zap, Sparkles } from 'lucide-react';

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

    // وضعیت سیستم درگ و پرتاب دستی
    const [dragState, setDragState] = useState(null); // { startX, startY, currentX, currentY, startTime, dieType, isPool }
    const dragRef = useRef(null);

    // نگاشت مختصات صفحه ۲بعدی به صفحه زمین سه‌بعدی X/Z (زاویه دید دوربین FOV 45 در ارتفاع 16)
    const mapScreenTo3DPlane = (screenX, screenY) => {
        const aspect = window.innerWidth / window.innerHeight;
        const visibleHeight = 2 * Math.tan((45 * Math.PI) / 360) * 16; // ~13.25
        const visibleWidth = visibleHeight * aspect;

        const normX = (screenX / window.innerWidth) - 0.5;
        const normY = (screenY / window.innerHeight) - 0.5;

        // ضریب جهت و مقیاس دقیق
        const worldX = normX * visibleWidth;
        const worldZ = normY * visibleHeight;

        return [worldX, worldZ];
    };

    // لیسنرهای سراسری ماوس/لمس هنگام کشیدن تاس
    useEffect(() => {
        const handlePointerMove = (e) => {
            if (!dragRef.current) return;
            const currentX = e.clientX;
            const currentY = e.clientY;

            setDragState((prev) => (prev ? { ...prev, currentX, currentY } : null));
        };

        const handlePointerUp = (e) => {
            if (!dragRef.current) return;
            const state = dragRef.current;
            dragRef.current = null;
            setDragState(null);

            const dx = e.clientX - state.startX;
            const dy = e.clientY - state.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const duration = Math.max(16, performance.now() - state.startTime);

            // اگر جابجایی خیلی ناچیز باشد (کمتر از ۱۲ پیکسل)، یک کلیک ساده محسوب می‌شود
            if (distance < 12) {
                if (state.isPool) {
                    executePoolRoll();
                } else if (mode === 'quick') {
                    executeSingleRoll(state.dieType);
                } else {
                    handleAddToPool(state.dieType);
                }
                return;
            }

            // محاسبه بردار جهت و سرعت پرتاب
            // بردار از نقطه شروع به نقطه رها شدن
            const speed = (distance / duration) * 1000; // پیکسل بر ثانیه
            // نرمال‌سازی قدرت بین ۱۵ تا ۱۰۰
            const power = Math.min(100, Math.max(15, speed * 0.05 + distance * 0.12));

            // بردار سرعت در فضای سه‌بعدی
            const dirX = dx / distance;
            const dirY = dy / distance;

            // شدت پرتاب در محورهای X و Z
            const impulseMultiplier = 0.28 * (power / 100) * 45;
            const velX = dirX * impulseMultiplier;
            const velZ = dirY * impulseMultiplier;

            // موقعیت مبدا پرتاب سه‌بعدی (کمی عقب‌تر از محل رهاسازی)
            const [spawnX, spawnZ] = mapScreenTo3DPlane(state.startX, state.startY);

            const customPhysics = {
                origin: [spawnX, spawnZ],
                velocity: [velX, velZ],
                power,
            };

            if (state.isPool) {
                executePoolRoll(customPhysics);
            } else {
                executeSingleRoll(state.dieType, customPhysics);
            }
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [mode, poolCounts]);

    // تایمر پاکسازی پس از اتمام غلتش
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

    // پرتاب تکی
    const executeSingleRoll = (type, customPhysics = null) => {
        const diceToRoll = type === 'd100' ? ['d100', 'd10'] : [type];
        setLastRollTypes(diceToRoll);
        triggerRoll(diceToRoll, customPhysics);
    };

    // پرتاب استخر
    const executePoolRoll = (customPhysics = null) => {
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
        triggerRoll(diceToRoll, customPhysics);
    };

    // شروع درگ از روی یک تاس
    const handleStartDragDie = (type, e) => {
        // جلوگیری از ثبت تاچ اسکرول در موبایل
        e.preventDefault();
        const startData = {
            startX: e.clientX,
            startY: e.clientY,
            currentX: e.clientX,
            currentY: e.clientY,
            startTime: performance.now(),
            dieType: type,
            isPool: false,
        };
        dragRef.current = startData;
        setDragState(startData);
    };

    // شروع درگ از روی دکمه پرتاب استخر
    const handleStartDragPool = (e) => {
        e.preventDefault();
        const startData = {
            startX: e.clientX,
            startY: e.clientY,
            currentX: e.clientX,
            currentY: e.clientY,
            startTime: performance.now(),
            dieType: null,
            isPool: true,
        };
        dragRef.current = startData;
        setDragState(startData);
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

    const totalPoolDiceCount = Object.values(poolCounts).reduce((a, b) => a + b, 0);

    const handleReRoll = () => {
        if (lastRollTypes.length > 0) {
            triggerRoll(lastRollTypes);
        } else {
            triggerRoll(['d20']);
        }
    };

    // محاسبه زنده خط بردار و درصد قدرت پرتاب در حالت درگ
    let dragVectorUI = null;
    if (dragState) {
        const dx = dragState.currentX - dragState.startX;
        const dy = dragState.currentY - dragState.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 15) {
            const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
            const currentPower = Math.min(100, Math.max(15, Math.round(dist * 0.35)));

            dragVectorUI = (
                <div className="fixed inset-0 pointer-events-none z-[120]">
                    {/* خط بردار پرتاب */}
                    <svg className="w-full h-full">
                        <defs>
                            <linearGradient id="throwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
                            </linearGradient>
                        </defs>
                        <line
                            x1={dragState.startX}
                            y1={dragState.startY}
                            x2={dragState.currentX}
                            y2={dragState.currentY}
                            stroke="url(#throwGrad)"
                            strokeWidth="3.5"
                            strokeDasharray="6 4"
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* المان دنبال‌کننده مکان‌نما به همراه درصد قدرت پرتاب */}
                    <div
                        style={{
                            left: `${dragState.currentX}px`,
                            top: `${dragState.currentY}px`,
                            transform: 'translate(-50%, -50%)',
                        }}
                        className="absolute flex flex-col items-center gap-1.5 transition-transform"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-700 to-amber-500 border border-amber-300 p-0.5 shadow-[0_0_20px_rgba(251,191,36,0.6)] flex items-center justify-center animate-bounce">
                            <span className="text-zinc-950 font-black text-xs uppercase font-serif">
                                {dragState.isPool ? 'POOL' : dragState.dieType}
                            </span>
                        </div>

                        {/* نشانگر شتاب و قدرت پرتاب */}
                        <div className="flex items-center gap-1 bg-zinc-950/90 border border-amber-500/50 px-2 py-0.5 rounded-full shadow-lg backdrop-blur-md">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span className="text-[10px] font-mono font-bold text-amber-300">
                                قدرت: {currentPower}٪
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="fixed inset-0 z-[110] pointer-events-none select-none font-fa" dir="rtl">

            {/* رندر بلادرنگ ۳D فیزیک تاس روی کانواس مپ */}
            <div className="absolute inset-0">
                <DiceCanvas />
            </div>

            {/* نشانگر زنده درگ و زاویه پرتاب دستی */}
            {dragVectorUI}

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

            {/* کنترل‌پنل شناور انتخاب تاس و داک لمسی */}
            <div className="absolute bottom-6 left-6 pointer-events-auto flex flex-col gap-2">

                {/* استخر تاس‌های انتخابی در حالت چندتایی */}
                {mode === 'pool' && totalPoolDiceCount > 0 && (
                    <div className="bg-zinc-950/95 border border-purple-500/30 p-2 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                            {Object.entries(poolCounts).map(([type, count]) => (
                                <button
                                    key={type}
                                    onClick={(e) => handleRemoveFromPool(type, e)}
                                    title="برای کاهش کلیک کنید"
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

                            {/* دکمه پرتاب استخر (با قابلیت کلیک معمولی یا کشیدن و پرتاب با شتاب) */}
                            <button
                                onPointerDown={handleStartDragPool}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none"
                                title="کلیک برای پرتاب یا درگ به داخل صفحه برای شوت پرقدرت!"
                            >
                                <Dices className="w-3.5 h-3.5" />
                                <span>پرتاب ({totalPoolDiceCount})</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* داک اصلی دکمه‌های تاس */}
                <div className="flex items-center gap-1.5 bg-zinc-950/95 border border-zinc-800/90 p-1.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl">

                    {/* سوئیچر حالت */}
                    <div className="flex items-center bg-zinc-900/90 p-0.5 rounded-xl border border-zinc-800/80 ml-1">
                        <button
                            onClick={() => setMode('quick')}
                            className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                                mode === 'quick'
                                    ? 'bg-purple-950 border border-purple-500/40 text-amber-300 shadow-sm'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="پرتاب سریع (تکی یا با کشیدن)"
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

                    {/* دکمه‌های تاس با پشتیبانی لمس، درگ و پرتاب شتاب‌دار */}
                    {DICE_TYPES.map((d) => {
                        const inPoolCount = poolCounts[d.type] || 0;
                        return (
                            <button
                                key={d.type}
                                onPointerDown={(e) => handleStartDragDie(d.type, e)}
                                className="relative px-2.5 py-1.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/20 hover:border-amber-500/40 text-amber-200 font-serif text-xs font-bold transition active:scale-95 group cursor-grab active:cursor-grabbing select-none"
                                title="کلیک برای پرتاب، یا درگ به سمت مپ برای پرتاب دستی"
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

                    {/* بستن لایه تاس */}
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