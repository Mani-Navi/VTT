import React from 'react';
import { motion } from 'motion/react';
import {
    ArrowDown,
    ArrowUpRight,
    Mic,
    Dices,
    Compass,
    Crown,
    Shield,
    Sparkles,
    MousePointer,
    EyeOff,
    Ruler,
    ImageIcon,
    Copy,
    Check,
} from 'lucide-react';
import { sound } from '../../utils/tableAudio';
import { GsapHeadingReveal } from './GsapHeadingReveal';

export const Hero = ({ onStartGame, onExploreMore, onDiceClick }) => {
    return (
        <section id="hero" className="relative pt-8 pb-16 sm:pb-24 px-4 sm:px-8 text-center w-full" dir="rtl">
            {/* هاله نور پس‌زمینه */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-amber-100/40 via-amber-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

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

            {/* دکمه‌های اکشن اولیه */}
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

            {/* ترکیب‌بندی چندلایه‌ای المان‌های معلق تاکتیکال (Kinetic Tabletop Deck) */}
            <div className="relative mt-16 sm:mt-24 max-w-5xl mx-auto min-h-[300px] sm:min-h-[340px] flex items-center justify-center select-none">

                {/* ۱. هسته مرکزی: تاس سه‌بعدی هولوگرافیک D20 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.08, rotate: 6 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        sound.playDiceRoll();
                        onDiceClick();
                    }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative z-30 w-36 h-36 sm:w-44 sm:h-44 rounded-[32px] bg-gradient-to-br from-[#1a1d28] via-[#0f1118] to-[#07080d] border-2 border-[#f59e0b]/70 shadow-[0_20px_60px_rgba(245,158,11,0.25)] flex flex-col items-center justify-center text-white cursor-pointer group backdrop-blur-2xl"
                >
                    <div className="absolute inset-0 bg-radial from-amber-500/15 to-transparent rounded-[32px] pointer-events-none" />
                    <motion.div
                        animate={{ rotate: [0, 6, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    >
                        <Dices className="w-14 h-14 sm:w-16 sm:h-16 text-[#f59e0b] drop-shadow-[0_0_20px_rgba(245,158,11,0.65)]" />
                    </motion.div>
                    <div className="mt-1 text-xs sm:text-sm font-mono font-black text-[#f59e0b] tracking-wider">
                        D20 CRIT
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium">کلیک برای تاس</span>

                    {/* افکت نئونی دور کادر هنگام هاور */}
                    <div className="absolute inset-0 rounded-[32px] border border-amber-400/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>

                {/* ۲. کارت پارتی بازیکنان آنلاین (بالا - راست) با استایل واقعی اتاق */}
                <motion.div
                    initial={{ opacity: 0, x: 50, rotate: 4 }}
                    animate={{ opacity: 1, x: 0, rotate: 3, y: [0, -6, 0] }}
                    transition={{ y: { repeat: Infinity, duration: 5, ease: 'easeInOut' }, duration: 0.8, delay: 0.3 }}
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
                    onClick={() => sound.playTokenClick()}
                    className="absolute -right-2 sm:right-8 top-0 sm:top-2 w-56 sm:w-64 p-3.5 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 shadow-[0_20px_45px_rgba(0,0,0,0.6)] z-20 text-right cursor-pointer"
                >
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2.5">
                        <span className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>۳ بازیکن آماده نبرد</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
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

                {/* ۳. ویجت ویس‌چت و PTT واقعی (پایین - چپ) */}
                <motion.div
                    initial={{ opacity: 0, x: -50, rotate: -4 }}
                    animate={{ opacity: 1, x: 0, rotate: -3, y: [0, 6, 0] }}
                    transition={{ y: { repeat: Infinity, duration: 5.5, ease: 'easeInOut' }, duration: 0.8, delay: 0.35 }}
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
                    onClick={() => sound.playPttBeep(true)}
                    className="absolute -left-2 sm:left-8 bottom-2 sm:bottom-4 w-56 sm:w-60 p-3.5 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 shadow-[0_20px_45px_rgba(0,0,0,0.6)] z-20 text-right cursor-pointer"
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

                {/* ۴. مینی-تولبار معلق شبیه‌سازی اتاق (پایین - مرکز) */}
                <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.05 }}
                    className="hidden md:flex absolute -bottom-5 z-25 items-center gap-1 p-1 bg-zinc-950/95 border border-zinc-800/90 rounded-2xl shadow-xl backdrop-blur-xl text-zinc-300"
                >
                    <div className="w-7 h-7 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold">
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

                {/* ۵. چیپ نبرد کاراکتر: AC 18 و HP (پایین - راست) */}
                <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                    className="hidden sm:flex absolute bottom-2 right-1/4 translate-x-12 z-20 items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-950/90 border border-zinc-800 text-[11px] font-mono font-bold text-zinc-200 shadow-lg"
                >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>AC 18</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-emerald-400">HP 48/48</span>
                </motion.div>

                {/* ۶. نشانگر وضعیت رندر سخت‌افزاری Konva (بالا - چپ) */}
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
                    className="hidden sm:flex absolute -top-4 left-1/4 -translate-x-12 z-20 items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/95 border border-zinc-800 text-[11px] font-medium text-zinc-300 shadow-lg"
                >
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>موتور رندر Konva 60fps</span>
                </motion.div>

                {/* ۷. بج کریتیکال معلق درخشان (بالا - کنار تاس) */}
                <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="absolute -top-3 right-1/3 z-35 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-[10px] font-black flex items-center gap-1 shadow-md shadow-amber-500/20"
                >
                    <Sparkles className="w-3 h-3" />
                    <span>Nat 20!</span>
                </motion.div>

            </div>
        </section>
    );
};