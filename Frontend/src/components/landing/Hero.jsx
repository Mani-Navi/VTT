import React from 'react';
import { motion } from 'motion/react';
import {
    ArrowDown,
    ArrowUpRight,
    Mic,
    Crown,
    Shield,
    EyeOff,
    Ruler,
    Dices,
    Swords,
    Sparkles,
    Heart,
    Zap,
    Grid,
    Key,
} from 'lucide-react';
import { sound } from '../../utils/tableAudio';
import { GsapHeadingReveal } from './GsapHeadingReveal';

export const Hero = ({ onStartGame, onExploreMore, onDiceClick }) => {
    return (
        <section id="hero" className="relative pt-4 sm:pt-6 pb-12 sm:pb-16 px-4 sm:px-8 text-center w-full" dir="rtl">
            {/* هاله نور بهینه */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

            <GsapHeadingReveal
                eyebrow="Persian Virtual Tabletop"
                eyebrowColor="text-neutral-500"
                lines={['میز مجازی', 'برای ماجراجویی‌های بزرگ.']}
                gradientLineIndex={1}
                subtitle="یک میز بازی مجازی فارسی برای ساختن، بازی کردن و تجربه کردن ماجراجویی‌ها."
                headingTag="h1"
                headingClassName="text-[44px] sm:text-[64px] md:text-[80px] lg:text-[90px] font-black leading-[1.05] tracking-[-0.035em] text-neutral-950 max-w-4xl mx-auto mt-2"
                subtitleClassName="mt-4 sm:mt-5 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto font-normal leading-relaxed"
            />

            {/* دکمه‌های اکشن */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            >
                <button
                    onClick={() => {
                        sound.playDiceRoll();
                        onStartGame();
                    }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm sm:text-base shadow-md transition-all cursor-pointer group active:scale-[0.98]"
                >
                    <span>شروع بازی</span>
                    <ArrowUpRight className="w-4.5 h-4.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-[#f59e0b]" />
                </button>

                <button
                    onClick={() => {
                        sound.playTokenClick();
                        onExploreMore();
                    }}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-bold text-sm sm:text-base transition-colors cursor-pointer"
                >
                    <span>بیشتر ببینید</span>
                    <ArrowDown className="w-4.5 h-4.5 text-neutral-500" />
                </button>
            </motion.div>

            {/* کهکشان اسمارتیزی سبک با شتاب‌دهنده گرافیکی GPU */}
            <div className="relative mt-8 sm:mt-12 max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-3 sm:gap-5 p-2 sm:p-4 select-none gpu-smooth">

                {/* ۱. چیپ طلایی کریتیکال */}
                <div
                    onClick={() => { sound.playCritChime(); onDiceClick(); }}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black text-sm sm:text-base flex items-center gap-2.5 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <Sparkles className="w-5 h-5" />
                    <span>Nat 20 Critical!</span>
                </div>

                {/* ۲. توکن زمردی پالادین */}
                <div
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-emerald-950 border-2 border-emerald-500/60 text-emerald-300 font-bold text-sm sm:text-base flex items-center gap-3 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/30 flex items-center justify-center text-sm">🛡️</div>
                    <span>امیر (پالادین) · AC 18</span>
                </div>

                {/* ۳. چیپ یاقوتی اژدها */}
                <div
                    onClick={() => sound.playDiceRoll()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-rose-950 border-2 border-rose-500/60 text-rose-300 font-bold text-sm sm:text-base flex items-center gap-3 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <span className="text-xl">🐉</span>
                    <span>اژدهای سرخ · HP 160</span>
                </div>

                {/* ۴. کپسول ویس‌چت نعنایی */}
                <div
                    onClick={() => sound.playPttBeep(true)}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-zinc-950 border-2 border-emerald-400/60 text-emerald-400 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <Mic className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span>صدای زنده · Space</span>
                </div>

                {/* ۵. توکن بنفش ویزارد */}
                <div
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-purple-950 border-2 border-purple-500/60 text-purple-300 font-bold text-sm sm:text-base flex items-center gap-3 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <span className="text-xl">🧙‍♂️</span>
                    <span>مانی (DM)</span>
                    <Crown className="w-4 h-4 text-amber-400" />
                </div>

                {/* ۶. چیپ کد اتاق */}
                <div
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-zinc-950 border-2 border-amber-500/60 text-amber-300 font-mono font-black text-sm sm:text-base flex items-center gap-2.5 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <Key className="w-5 h-5 text-amber-400" />
                    <span>ROOM: 75B4EE</span>
                </div>

                {/* ۷. چیپ صورتی سارا */}
                <div
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-fuchsia-950 border-2 border-fuchsia-500/60 text-fuchsia-300 font-bold text-sm sm:text-base flex items-center gap-3 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <span className="text-xl">🔮</span>
                    <span>سارا · طلسم نور</span>
                </div>

                {/* ۸. برچسب زرد خط‌کش */}
                <div
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-zinc-950 border-2 border-yellow-500/60 text-yellow-300 font-mono font-bold text-sm sm:text-base flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <Ruler className="w-5 h-5 text-yellow-400" />
                    <span>30ft (6 سلول)</span>
                </div>

                {/* ۹. چیپ ارغوانی مه جنگ */}
                <div
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-violet-950 border-2 border-violet-500/60 text-violet-300 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <EyeOff className="w-5 h-5 text-violet-400" />
                    <span>برش مه (Fog)</span>
                </div>

                {/* ۱۰. اسمارتیز تم مرمر آتشین */}
                <div
                    onClick={() => sound.playDiceRoll()}
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 border-2 border-amber-300 shadow-md flex items-center justify-center text-xl text-white cursor-pointer hover:scale-110 active:scale-95 transition-transform font-bold"
                    title="تاس مرمر آتشین"
                >
                    🔥
                </div>

                {/* ۱۱. بج سلامت */}
                <div
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-zinc-950 border-2 border-rose-500/60 text-rose-300 font-mono font-black text-sm sm:text-base flex items-center gap-2.5 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    <span>HP 42/48</span>
                </div>

                {/* ۱۲. تگ اکشن مبارزه */}
                <div
                    onClick={() => sound.playDiceRoll()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-zinc-950 border-2 border-amber-500/60 text-amber-300 font-mono font-black text-sm sm:text-base flex items-center gap-2.5 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <Swords className="w-5 h-5 text-amber-400" />
                    <span>1d20+6 = 24</span>
                </div>

                {/* ۱۳. اسمارتیز تم مرمر آمیتیست */}
                <div
                    onClick={() => sound.playDiceRoll()}
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 border-2 border-purple-300 shadow-md flex items-center justify-center text-xl text-white cursor-pointer hover:scale-110 active:scale-95 transition-transform font-bold"
                    title="تاس مرمر آمیتیست"
                >
                    💎
                </div>

                {/* ۱۴. تگ Live Sync */}
                <div
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-cyan-950 border-2 border-cyan-500/60 text-cyan-300 font-mono font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <span>Live Sync · 32ms</span>
                </div>

                {/* ۱۵. تگ شفای آسمانی */}
                <div
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-sky-950 border-2 border-sky-400/60 text-sky-300 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <Sparkles className="w-5 h-5 text-sky-400" />
                    <span>لمس شفا +15 HP</span>
                </div>

                {/* ۱۶. اسمارتیز تم مرمر سبز */}
                <div
                    onClick={() => sound.playDiceRoll()}
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 border-2 border-emerald-300 shadow-md flex items-center justify-center text-xl text-white cursor-pointer hover:scale-110 active:scale-95 transition-transform font-bold"
                    title="تاس مرمر جنگل"
                >
                    🌲
                </div>

                {/* ۱۷. تگ اسنپ گرید */}
                <div
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-zinc-950 border-2 border-zinc-700 text-zinc-200 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                    <Grid className="w-5 h-5 text-amber-400" />
                    <span>اسنپ گرید D&D 5e</span>
                </div>

                {/* ۱۸. نشان پرتاب تاس D12 */}
                <div
                    onClick={() => { sound.playDiceRoll(); onDiceClick(); }}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black text-sm sm:text-base flex items-center gap-2.5 shadow-md cursor-pointer border border-amber-300 hover:scale-105 active:scale-95 transition-transform"
                >
                    <Dices className="w-5 h-5" />
                    <span>D12 Polyhedral</span>
                </div>

            </div>
        </section>
    );
};