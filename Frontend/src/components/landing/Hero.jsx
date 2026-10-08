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
        <section id="hero" className="relative pt-8 pb-20 sm:pb-32 px-4 sm:px-8 text-center w-full" dir="rtl">
            {/* هاله نور پس‌زمینه */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[600px] bg-gradient-to-tr from-amber-100/50 via-rose-50/25 to-purple-50/35 rounded-full blur-3xl pointer-events-none -z-10" />

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
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm sm:text-base shadow-[0_10px_30px_rgba(0,0,0,0.14)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.22)] transition-all cursor-pointer group active:scale-[0.98]"
                >
                    <span>شروع بازی</span>
                    <ArrowUpRight className="w-4.5 h-4.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-[#f59e0b]" />
                </button>

                <button
                    onClick={() => {
                        sound.playTokenClick();
                        onExploreMore();
                    }}
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-bold text-sm sm:text-base transition-colors cursor-pointer"
                >
                    <span>بیشتر ببینید</span>
                    <ArrowDown className="w-4.5 h-4.5 text-neutral-500" />
                </button>
            </motion.div>

            {/* کهکشان اسمارتیزی بزرگ‌تر، پرحجم و چشم‌گیر (Large Kinetic Candy Chips) */}
            <div className="relative mt-16 sm:mt-24 max-w-6xl mx-auto min-h-[460px] sm:min-h-[520px] flex flex-wrap items-center justify-center gap-4 sm:gap-6 p-4 sm:p-6 select-none">

                {/* ۱. چیپ طلایی کریتیکال (بزرگ و درخشان) */}
                <motion.div
                    animate={{ y: [0, -8, 0], rotate: [-3, 0, -3] }}
                    transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.15, rotate: 0 }}
                    onClick={() => { sound.playCritChime(); onDiceClick(); }}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-zinc-950 font-black text-sm sm:text-base flex items-center gap-2.5 shadow-[0_12px_30px_rgba(245,158,11,0.4)] cursor-pointer border border-amber-300"
                >
                    <Sparkles className="w-5 h-5 text-zinc-950 animate-spin" />
                    <span>Nat 20 Critical!</span>
                </motion.div>

                {/* ۲. توکن بزرگ زمردی پالادین */}
                <motion.div
                    animate={{ y: [0, 8, 0], rotate: [4, 1, 4] }}
                    transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-emerald-950/95 border-2 border-emerald-500/50 text-emerald-300 font-bold text-sm sm:text-base flex items-center gap-3 shadow-xl cursor-pointer"
                >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/30 flex items-center justify-center text-sm shadow">🛡️</div>
                    <span>امیر (پالادین) · AC 18</span>
                </motion.div>

                {/* ۳. چیپ یاقوتی اژدهای بزرگ */}
                <motion.div
                    animate={{ y: [0, -9, 0], rotate: [-2, 3, -2] }}
                    transition={{ repeat: Infinity, duration: 5.1, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playDiceRoll()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-rose-950/95 border-2 border-rose-500/60 text-rose-300 font-bold text-sm sm:text-base flex items-center gap-3 shadow-xl cursor-pointer"
                >
                    <span className="text-xl">🐉</span>
                    <span>اژدهای سرخ · HP 160</span>
                </motion.div>

                {/* ۴. کپسول ویس‌چت نعنایی پرحجم */}
                <motion.div
                    animate={{ y: [0, 7, 0], rotate: [-4, -1, -4] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playPttBeep(true)}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-zinc-950/98 border-2 border-emerald-400/50 text-emerald-400 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-2xl cursor-pointer"
                >
                    <Mic className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span>صدای زنده · Space</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </motion.div>

                {/* ۵. توکن بنفش آمیتیست ویزارد */}
                <motion.div
                    animate={{ y: [0, -7, 0], rotate: [5, 2, 5] }}
                    transition={{ repeat: Infinity, duration: 4.9, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-purple-950/95 border-2 border-purple-500/50 text-purple-300 font-bold text-sm sm:text-base flex items-center gap-3 shadow-xl cursor-pointer"
                >
                    <span className="text-xl">🧙‍♂️</span>
                    <span>مانی (DM)</span>
                    <Crown className="w-4 h-4 text-amber-400" />
                </motion.div>

                {/* ۶. چیپ بزرگ کد اتاق طلایی */}
                <motion.div
                    animate={{ y: [0, 9, 0], rotate: [-3, 1, -3] }}
                    transition={{ repeat: Infinity, duration: 4.3, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.15 }}
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-amber-500/20 border-2 border-amber-500/60 text-amber-300 font-mono font-black text-sm sm:text-base flex items-center gap-2.5 shadow-lg cursor-pointer"
                >
                    <Key className="w-5 h-5 text-amber-400" />
                    <span>ROOM: 75B4EE</span>
                </motion.div>

                {/* ۷. چیپ صورتی طلسم نور سارا */}
                <motion.div
                    animate={{ y: [0, -6, 0], rotate: [2, -2, 2] }}
                    transition={{ repeat: Infinity, duration: 5.3, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-fuchsia-950/95 border-2 border-fuchsia-500/50 text-fuchsia-300 font-bold text-sm sm:text-base flex items-center gap-3 shadow-xl cursor-pointer"
                >
                    <span className="text-xl">🔮</span>
                    <span>سارا · طلسم نور</span>
                </motion.div>

                {/* ۸. برچسب زرد خط‌کش D&D */}
                <motion.div
                    animate={{ y: [0, 8, 0], rotate: [-5, -2, -5] }}
                    transition={{ repeat: Infinity, duration: 4.7, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-zinc-950/95 border-2 border-yellow-500/50 text-yellow-300 font-mono font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg cursor-pointer"
                >
                    <Ruler className="w-5 h-5 text-yellow-400" />
                    <span>30ft (6 سلول)</span>
                </motion.div>

                {/* ۹. چیپ ارغوانی مه جنگ */}
                <motion.div
                    animate={{ y: [0, -8, 0], rotate: [4, 0, 4] }}
                    transition={{ repeat: Infinity, duration: 4.6, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-violet-950/95 border-2 border-violet-500/50 text-violet-300 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg cursor-pointer"
                >
                    <EyeOff className="w-5 h-5 text-violet-400" />
                    <span>برش مه (Fog)</span>
                </motion.div>

                {/* ۱۰. اسمارتیز بزرگ تم مرمر آتشین */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.25 }}
                    onClick={() => sound.playDiceRoll()}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 border-2 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center justify-center text-xl sm:text-2xl text-white cursor-pointer font-bold"
                    title="تاس مرمر آتشین"
                >
                    🔥
                </motion.div>

                {/* ۱۱. بج قلبی سلامت */}
                <motion.div
                    animate={{ y: [0, 6, 0], rotate: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 5.0, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-zinc-950/98 border-2 border-rose-500/50 text-rose-300 font-mono font-black text-sm sm:text-base flex items-center gap-2.5 shadow-lg cursor-pointer"
                >
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    <span>HP 42/48</span>
                </motion.div>

                {/* ۱۲. تگ اکشن مبارزه و ضربه */}
                <motion.div
                    animate={{ y: [0, -7, 0], rotate: [3, -1, 3] }}
                    transition={{ repeat: Infinity, duration: 4.4, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playDiceRoll()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-zinc-950/98 border-2 border-amber-500/50 text-amber-300 font-mono font-black text-sm sm:text-base flex items-center gap-2.5 shadow-lg cursor-pointer"
                >
                    <Swords className="w-5 h-5 text-amber-400" />
                    <span>1d20+6 = 24</span>
                </motion.div>

                {/* ۱۳. اسمارتیز بزرگ تم مرمر آمیتیست */}
                <motion.div
                    animate={{ scale: [1, 1.12, 1], rotate: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.25 }}
                    onClick={() => sound.playDiceRoll()}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 border-2 border-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.6)] flex items-center justify-center text-xl sm:text-2xl text-white cursor-pointer font-bold"
                    title="تاس مرمر آمیتیست"
                >
                    💎
                </motion.div>

                {/* ۱۴. تگ شبکه سوکت STOMP فیروزه‌ای */}
                <motion.div
                    animate={{ y: [0, 8, 0], rotate: [-4, 0, -4] }}
                    transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-cyan-950/95 border-2 border-cyan-500/50 text-cyan-300 font-mono font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg cursor-pointer"
                >
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <span>Live Sync · 32ms</span>
                </motion.div>

                {/* ۱۵. تگ شفای آسمانی آبی */}
                <motion.div
                    animate={{ y: [0, -6, 0], rotate: [2, 5, 2] }}
                    transition={{ repeat: Infinity, duration: 4.1, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-sky-950/95 border-2 border-sky-400/50 text-sky-300 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg cursor-pointer"
                >
                    <Sparkles className="w-5 h-5 text-sky-400" />
                    <span>لمس شفا +15 HP</span>
                </motion.div>

                {/* ۱۶. اسمارتیز بزرگ تم مرمر سبز جنگلی */}
                <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 4.1, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.25 }}
                    onClick={() => sound.playDiceRoll()}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 border-2 border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.6)] flex items-center justify-center text-xl sm:text-2xl text-white cursor-pointer font-bold"
                    title="تاس مرمر جنگل"
                >
                    🌲
                </motion.div>

                {/* ۱۷. تگ اسنپ گرید تاکتیکال */}
                <motion.div
                    animate={{ y: [0, 7, 0], rotate: [-2, -5, -2] }}
                    transition={{ repeat: Infinity, duration: 4.9, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.12 }}
                    onClick={() => sound.playTokenClick()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-zinc-950/95 border-2 border-zinc-700 text-zinc-200 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg cursor-pointer"
                >
                    <Grid className="w-5 h-5 text-amber-400" />
                    <span>اسنپ گرید D&D 5e</span>
                </motion.div>

                {/* ۱۸. نشان پرتاب تاس D12 نارنجی */}
                <motion.div
                    animate={{ y: [0, -8, 0], rotate: [4, -1, 4] }}
                    transition={{ repeat: Infinity, duration: 4.6, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.15 }}
                    onClick={() => { sound.playDiceRoll(); onDiceClick(); }}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black text-sm sm:text-base flex items-center gap-2.5 shadow-lg cursor-pointer border border-amber-300"
                >
                    <Dices className="w-5 h-5" />
                    <span>D12 Polyhedral</span>
                </motion.div>

            </div>
        </section>
    );
};