import React from 'react';
import { motion } from 'motion/react';
import {
    ArrowDown,
    ArrowUpRight,
    Mic,
    Crown,
    Shield,
    MousePointer,
    EyeOff,
    Ruler,
    ImageIcon,
    Dices,
    Swords,
    Flame,
    Zap,
    Sparkles,
} from 'lucide-react';
import { sound } from '../../utils/tableAudio';
import { GsapHeadingReveal } from './GsapHeadingReveal';

export const Hero = ({ onStartGame, onExploreMore, onDiceClick }) => {
    return (
        <section id="hero" className="relative pt-8 pb-20 sm:pb-28 px-4 sm:px-8 text-center w-full" dir="rtl">
            {/* هاله نور پس‌زمینه عمیق */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-amber-100/40 via-amber-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

            <GsapHeadingReveal
                eyebrow="Persian Virtual Tabletop"
                eyebrowColor="text-neutral-500"
                lines={['میز مجازی', 'برای ماجراجویی‌های بزرگ.']}
                gradientLineIndex={1}
                subtitle="یک میز بازی مجازی فارسی برای ساختن، بازی کردن و تجربه کردن ماجراجویی‌ها."
                headingTag="h1"
                headingClassName="text-[46px] sm:text-[68px] md:text-[84px] lg:text-[96px] font-black leading-[1.04] tracking-[-0.035em] text-neutral-950 max-w-4xl mx-auto mt-2"
                subtitleClassName="mt-6 text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto font-normal leading-relaxed"
            />

            {/* دکمه‌های اکشن */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            >
                <button
                    onClick={() => {
                        sound.playDiceRoll();
                        onStartGame();
                    }}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm sm:text-base shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] transition-all cursor-pointer group active:scale-[0.98]"
                >
                    <span>شروع بازی</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-[#f59e0b]" />
                </button>

                <button
                    onClick={() => {
                        sound.playTokenClick();
                        onExploreMore();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                >
                    <span>بیشتر ببینید</span>
                    <ArrowDown className="w-4 h-4 text-neutral-500" />
                </button>
            </motion.div>

            {/* صحنه مینیاتوری پر از المان‌های تاکتیکال میز نبرد (Miniature Battlemap Deck) */}
            <div className="relative mt-16 sm:mt-24 max-w-6xl mx-auto min-h-[380px] sm:min-h-[440px] flex items-center justify-center select-none">

                {/* ۱. استیج مرکزی: نمای تاکتیکال نقشه سیاه‌چال و گرید نبرد */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative w-full max-w-2xl sm:max-w-3xl h-64 sm:h-80 rounded-[32px] bg-[#08090e] border border-zinc-800/90 shadow-[0_30px_90px_rgba(0,0,0,0.45)] overflow-hidden flex items-center justify-center"
                >
                    {/* شبکه گرید تاکتیکال طلایی */}
                    <div
                        className="absolute inset-0 opacity-25 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(to right, rgba(245, 158, 11, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 158, 11, 0.4) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    {/* بافت محیطی اتاق سیاه‌چال */}
                    <div className="absolute inset-4 rounded-2xl border border-amber-500/10 bg-gradient-to-br from-zinc-950/80 via-[#0d0f17]/90 to-zinc-950/80 pointer-events-none" />

                    {/* خط‌کش اندازه‌گیری تاکتیکال روی نقشه (30ft) */}
                    <div className="absolute top-1/2 left-1/3 -translate-y-6 flex items-center gap-1 z-15 pointer-events-none">
                        <div className="w-28 sm:w-36 h-[2px] bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 border-b border-dashed border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                        <span className="px-2 py-0.5 rounded-md bg-zinc-950/90 border border-amber-500/40 text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 shadow">
                            30ft (6 سلول)
                        </span>
                    </div>

                    {/* توکن ۱: ویزارد (مانی / GM) */}
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        className="absolute top-16 right-1/4 sm:right-1/3 z-20 flex flex-col items-center cursor-pointer group"
                        onClick={() => sound.playTokenClick()}
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-950/80 border-2 border-purple-400 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
                            🧙‍♂️
                        </div>
                        <div className="mt-1 px-2 py-0.2 rounded bg-zinc-950/90 border border-zinc-700 text-[9px] text-white font-bold shadow">
                            مانی (GM)
                        </div>
                        <div className="w-10 h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5 border border-zinc-700">
                            <div className="w-[100%] h-full bg-emerald-400 rounded-full" />
                        </div>
                    </motion.div>

                    {/* توکن ۲: پالادین (امیر) */}
                    <motion.div
                        animate={{ y: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                        className="absolute bottom-14 left-1/3 z-20 flex flex-col items-center cursor-pointer group"
                        onClick={() => sound.playTokenClick()}
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(52,211,153,0.5)] group-hover:scale-110 transition-transform">
                            🛡️
                        </div>
                        <div className="mt-1 px-2 py-0.2 rounded bg-zinc-950/90 border border-zinc-700 text-[9px] text-white font-bold shadow">
                            امیر (پالادین)
                        </div>
                        <div className="w-10 h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5 border border-zinc-700">
                            <div className="w-[85%] h-full bg-emerald-400 rounded-full" />
                        </div>
                    </motion.div>

                    {/* توکن ۳: اژدهای جوان (Boss) */}
                    <motion.div
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                        className="absolute top-12 left-14 sm:left-20 z-20 flex flex-col items-center cursor-pointer group"
                        onClick={() => sound.playTokenClick()}
                    >
                        <div className="w-14 h-14 rounded-full bg-rose-950/90 border-2 border-rose-500 flex items-center justify-center text-2xl shadow-[0_0_25px_rgba(244,63,94,0.6)] group-hover:scale-110 transition-transform">
                            🐉
                        </div>
                        <div className="mt-1 px-2 py-0.2 rounded bg-zinc-950/90 border border-rose-500/40 text-[9px] text-rose-300 font-bold shadow">
                            اژدهای جوان
                        </div>
                        <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5 border border-zinc-700">
                            <div className="w-[60%] h-full bg-rose-500 rounded-full" />
                        </div>
                    </motion.div>

                    {/* نوار بزرگ‌نمایی نقشه */}
                    <div className="absolute bottom-3 left-4 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950/90 border border-zinc-800 text-[10px] font-mono text-zinc-300 shadow">
                        <span className="text-amber-400 font-bold">Zoom:</span>
                        <span>100%</span>
                    </div>

                    {/* بج وضعیت صحنه در بالا */}
                    <div className="absolute top-3 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-950/90 border border-zinc-800 text-[10px] text-zinc-300 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>صحنه: تالار اژدهای باستانی</span>
                    </div>
                </motion.div>

                {/* ۲. کارت پارتی بازیکنان (بالا - راست) */}
                <motion.div
                    initial={{ opacity: 0, x: 40, y: -20 }}
                    animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                    transition={{ y: { repeat: Infinity, duration: 4.8, ease: 'easeInOut' }, duration: 0.7, delay: 0.3 }}
                    whileHover={{ scale: 1.04, zIndex: 40 }}
                    onClick={() => sound.playTokenClick()}
                    className="absolute -right-2 sm:-right-4 -top-6 sm:-top-8 w-56 sm:w-64 p-3 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 shadow-[0_20px_45px_rgba(0,0,0,0.6)] z-30 text-right cursor-pointer"
                >
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
                        <span className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>۳ بازیکن آماده</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-zinc-900 px-2 py-0.2 rounded border border-zinc-800">
                            75B4EE
                        </span>
                    </div>

                    <div className="flex items-center -space-x-2 space-x-reverse py-0.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-[10px] font-bold shadow-sm relative">
                            MA
                            <Crown className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold shadow-sm">
                            AM
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-[10px] font-bold shadow-sm">
                            SA
                        </div>
                        <span className="text-[10px] text-zinc-400 mr-4 font-medium">مانی (DM)، امیر، سارا</span>
                    </div>
                </motion.div>

                {/* ۳. ویجت نوبت نبرد (Initiative Tracker - بالا - چپ) */}
                <motion.div
                    initial={{ opacity: 0, x: -40, y: -20 }}
                    animate={{ opacity: 1, x: 0, y: [0, 5, 0] }}
                    transition={{ y: { repeat: Infinity, duration: 5.2, ease: 'easeInOut' }, duration: 0.7, delay: 0.35 }}
                    whileHover={{ scale: 1.04, zIndex: 40 }}
                    className="hidden sm:flex absolute -left-2 sm:-left-4 -top-6 sm:-top-8 p-3 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 shadow-[0_20px_45px_rgba(0,0,0,0.6)] z-30 flex-col gap-1.5 text-right w-52"
                >
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 pb-1 border-b border-zinc-800">
                        <span className="flex items-center gap-1">
                            <Swords className="w-3.5 h-3.5" />
                            <span>ترتیب نوبت نبرد</span>
                        </span>
                        <span className="font-mono text-[10px]">دور ۱</span>
                    </div>
                    <div className="space-y-1 text-[10px]">
                        <div className="p-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-between">
                            <span>۱. امیر (پالادین)</span>
                            <span className="font-mono text-emerald-400">نوبت فعال</span>
                        </div>
                        <div className="p-1 rounded-lg bg-zinc-900 text-zinc-400 flex items-center justify-between">
                            <span>۲. اژدهای سرخ</span>
                            <span className="font-mono">بعدی</span>
                        </div>
                    </div>
                </motion.div>

                {/* ۴. ویجت ویس‌چت LiveKit (پایین - چپ) */}
                <motion.div
                    initial={{ opacity: 0, x: -40, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
                    transition={{ y: { repeat: Infinity, duration: 4.6, ease: 'easeInOut' }, duration: 0.7, delay: 0.4 }}
                    whileHover={{ scale: 1.04, zIndex: 40 }}
                    onClick={() => sound.playPttBeep(true)}
                    className="absolute -left-2 sm:-left-4 -bottom-6 sm:-bottom-8 w-56 sm:w-60 p-3 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 shadow-[0_20px_45px_rgba(0,0,0,0.6)] z-30 text-right cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                <Mic className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-zinc-100">صدای بلادرنگ</div>
                                <div className="text-[9px] text-zinc-400 font-mono">Push-to-Talk (Space)</div>
                            </div>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                            LiveKit
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 h-5 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800">
                        <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" />
                        <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] text-zinc-400 mr-auto font-mono">Ping: 34ms</span>
                    </div>
                </motion.div>

                {/* ۵. لاگ زنده اکشن مبارزه (پایین - راست) */}
                <motion.div
                    initial={{ opacity: 0, x: 40, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: [0, 6, 0] }}
                    transition={{ y: { repeat: Infinity, duration: 5.4, ease: 'easeInOut' }, duration: 0.7, delay: 0.45 }}
                    whileHover={{ scale: 1.04, zIndex: 40 }}
                    className="absolute -right-2 sm:-right-4 -bottom-6 sm:-bottom-8 p-3 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 shadow-[0_20px_45px_rgba(0,0,0,0.6)] z-30 text-right w-56 sm:w-64 cursor-pointer"
                    onClick={() => sound.playDiceRoll()}
                >
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 pb-1.5 border-b border-zinc-800 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>گزارش نبرد (Action Log)</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">CRIT!</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono">
                        <span className="text-amber-400 font-bold">امیر:</span> شمشیر خورشید 1d20+6 = <span className="text-emerald-400 font-black">26 (اصابت!)</span>
                    </div>
                </motion.div>

                {/* ۶. مینی-تولبار معلق شبیه‌سازی اتاق (پایین - مرکز دقیق) */}
                <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.06 }}
                    className="absolute -bottom-5 sm:-bottom-6 z-35 flex items-center gap-1 p-1 bg-zinc-950/95 border border-zinc-800/90 rounded-2xl shadow-2xl backdrop-blur-xl text-zinc-300"
                >
                    <div className="w-7 h-7 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shadow">
                        <MousePointer className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-7 h-7 rounded-xl hover:bg-zinc-900 flex items-center justify-center text-zinc-400">
                        <EyeOff className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-7 h-7 rounded-xl hover:bg-zinc-900 flex items-center justify-center text-zinc-400">
                        <Ruler className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-7 h-7 rounded-xl hover:bg-zinc-900 flex items-center justify-center text-amber-400">
                        <Dices className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-7 h-7 rounded-xl hover:bg-zinc-900 flex items-center justify-center text-zinc-400">
                        <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                </motion.div>

                {/* ۷. بج مه جنگ لایه GM (بالا - مرکز) */}
                <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
                    className="hidden md:flex absolute -top-5 z-25 items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/95 border border-zinc-800 text-[10px] font-mono font-bold text-amber-400 shadow-lg"
                >
                    <EyeOff className="w-3 h-3 text-amber-400" />
                    <span>Fog of War: Active (GM Layer)</span>
                </motion.div>

            </div>
        </section>
    );
};