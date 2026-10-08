import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';
import { sound } from '../../utils/tableAudio';
import { GsapHeadingReveal } from './GsapHeadingReveal';

export const PlayerSection = () => {
    const [currentHp, setCurrentHp] = useState(42);
    const maxHp = 48;
    const [lastAction, setLastAction] = useState(null);

    const adjustHp = (delta) => {
        sound.playTokenClick();
        setCurrentHp((prev) => Math.min(maxHp, Math.max(0, prev + delta)));
    };

    const handleAction = (name, diceType) => {
        sound.playDiceRoll();
        setLastAction(`${name} (${diceType})`);
        setTimeout(() => setLastAction(null), 2500);
    };

    return (
        <section id="player" className="py-20 sm:py-28 px-4 sm:px-8 overflow-hidden w-full" dir="rtl">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

                    {/* ستون کارت تعاملی بازیکن (اسکرین‌شات ۲) */}
                    <div className="lg:col-span-6 order-2 lg:order-2">
                        <div className="relative rounded-3xl bg-[#0b0c12] border border-[#232636] p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.2)] text-right">

                            {/* مشخصات کاراکتر */}
                            <div className="flex items-center justify-between pb-5 border-b border-[#1c1f2d] mb-6">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0f4040] via-[#1b5e3a] to-[#3dba7a] border border-emerald-400/50 p-1 flex items-center justify-center text-3xl shadow-lg">
                                        🛡️
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white">امیر (سر والدریک)</h3>
                                        <div className="text-xs text-neutral-400 mt-0.5">پالادین سوگند نور · سطح ۴</div>
                                    </div>
                                </div>

                                <div className="text-left font-mono">
                                    <span className="text-xs bg-[#1a1d28] border border-[#292c3c] text-[#f59e0b] px-2.5 py-1 rounded-lg font-bold">
                                        AC 18 · سرعت 30ft
                                    </span>
                                </div>
                            </div>

                            {/* مدیریت زنده HP */}
                            <div className="p-4 rounded-2xl bg-[#12141f] border border-[#222535] mb-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                                        <span>سلامتی کاراکتر (Hit Points)</span>
                                    </span>
                                    <span className="text-sm font-black font-mono text-white">
                                        {currentHp} / {maxHp}
                                    </span>
                                </div>

                                <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden mb-3">
                                    <motion.div
                                        animate={{ width: `${(currentHp / maxHp) * 100}%` }}
                                        className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 rounded-full"
                                    />
                                </div>

                                <div className="flex items-center justify-between text-xs font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => adjustHp(-5)}
                                            className="px-2.5 py-1 rounded-lg bg-[#1a1c29] hover:bg-rose-950/60 hover:text-rose-400 border border-[#2b2e40] text-neutral-300 transition-colors cursor-pointer"
                                        >
                                            -5 آسیب
                                        </button>
                                        <button
                                            onClick={() => adjustHp(-1)}
                                            className="px-2.5 py-1 rounded-lg bg-[#1a1c29] hover:bg-rose-950/60 hover:text-rose-400 border border-[#2b2e40] text-neutral-300 transition-colors cursor-pointer"
                                        >
                                            -1
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => adjustHp(1)}
                                            className="px-2.5 py-1 rounded-lg bg-[#1a1c29] hover:bg-emerald-950/60 hover:text-emerald-400 border border-[#2b2e40] text-neutral-300 transition-colors cursor-pointer"
                                        >
                                            +1 شفا
                                        </button>
                                        <button
                                            onClick={() => adjustHp(5)}
                                            className="px-2.5 py-1 rounded-lg bg-[#1a1c29] hover:bg-emerald-950/60 hover:text-emerald-400 border border-[#2b2e40] text-neutral-300 transition-colors cursor-pointer"
                                        >
                                            +5
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* اقدامات نبرد */}
                            <div className="space-y-2.5">
                                <div className="text-xs font-bold text-neutral-400">اقدامات نبرد (Combat Actions)</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleAction('ضربه شمشیر خورشید', '1d20+6 / 1d8+3')}
                                        className="p-3 rounded-xl bg-[#141624] hover:bg-[#1c2032] border border-[#262a3d] text-right transition-colors cursor-pointer group"
                                    >
                                        <div className="text-xs font-bold text-white group-hover:text-[#f59e0b]">
                                            شمشیر خورشید
                                        </div>
                                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                            1d20+6 · آسیب 1d8+3
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleAction('لمس شفا (Lay on Hands)', '+15 HP')}
                                        className="p-3 rounded-xl bg-[#141624] hover:bg-[#1c2032] border border-[#262a3d] text-right transition-colors cursor-pointer group"
                                    >
                                        <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                                            لمس شفا (Lay on Hands)
                                        </div>
                                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                            شفا تا ۱۵ نقطه سلامت
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {lastAction && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs text-center flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>انجام شد: {lastAction}</span>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* ستون متنی */}
                    <div className="lg:col-span-6 order-1 lg:order-1 text-right">
                        <GsapHeadingReveal
                            align="right"
                            eyebrow="تجربه بدون اصطکاک · PLAYER EXPERIENCE"
                            lines={['برای بازیکن،', 'فقط بازی کن.']}
                            subtitle="وارد شو، شخصیتت را انتخاب کن و ماجراجویی را شروع کن. بدون منوهای گیج‌کننده و بدون فرم‌های بی‌پایان."
                        />

                        <div className="mt-8 space-y-4">
                            <div className="flex items-start gap-3.5 text-right">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 font-bold text-sm">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-neutral-900">اتصال با یک کلیک</h4>
                                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                                        با وارد کردن کد ۶ رقمی اتاق مستقیماً به نقشه منتقل می‌شوید و توکن‌تان روی بوم ظاهر می‌شود.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 text-right">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 font-bold text-sm">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-neutral-900">کنترل کامل HP و تجهیزات</h4>
                                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                                        سلامتی، طلسم‌ها و آیتم‌های خود را در هر لحظه بدون درگیر کردن DM تغییر دهید.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 text-right">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 font-bold text-sm">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-neutral-900">پرتاب تاس‌های فرموله‌دار</h4>
                                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                                        تاس حمله، میزان آسیب و چک‌های مهارتی با یک اشاره محاسبه و در چت عمومی نمایش داده می‌شوند.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};