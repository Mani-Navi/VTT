import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUpRight, Mic, Dices, Compass } from 'lucide-react';
import { sound } from '../../utils/tableAudio';
import { GsapHeadingReveal } from './GsapHeadingReveal';

export const Hero = ({ onStartGame, onExploreMore, onDiceClick }) => {
    return (
        <section id="hero" className="relative pt-8 pb-16 sm:pb-24 px-4 sm:px-8 text-center" dir="rtl">
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

            <div className="relative mt-14 sm:mt-20 max-w-4xl mx-auto min-h-[220px] sm:min-h-[280px] flex items-center justify-center [perspective:1000px]">
                {/* Floating Card 1: Tactical Token Party */}
                <motion.div
                    initial={{ opacity: 0, x: 60, rotate: 6 }}
                    animate={{ opacity: 1, x: 0, rotate: 4 }}
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 30 }}
                    transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -right-2 sm:right-6 top-4 sm:top-2 w-52 sm:w-64 p-3.5 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-[0_20px_45px_rgba(0,0,0,0.08)] z-10 text-right cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>بازیکنان آماده</span>
            </span>
                        <span className="text-[10px] font-mono text-neutral-400">۳ نفر</span>
                    </div>

                    <div className="flex items-center -space-x-2 space-x-reverse py-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2a2060] to-[#7c6fd4] border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow">
                            مانی
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0f4040] to-[#3dba7a] border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow">
                            امیر
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5c1e3a] to-[#e05c6a] border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow">
                            سارا
                        </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                        <span>کد اتاق</span>
                        <span className="font-mono font-bold text-[#ea580c] bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
              75B4EE
            </span>
                    </div>
                </motion.div>

                {/* Center Hero Die */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 12 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        sound.playDiceRoll();
                        onDiceClick();
                    }}
                    transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-20 w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-[#181922] via-[#0e1017] to-[#07080b] border-2 border-[#f59e0b]/60 shadow-[0_25px_60px_rgba(245,158,11,0.25)] flex flex-col items-center justify-center text-white cursor-pointer group"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15),transparent)] rounded-3xl" />
                    <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    >
                        <Dices className="w-12 h-12 sm:w-16 sm:h-16 text-[#f59e0b] drop-shadow-[0_0_16px_rgba(245,158,11,0.6)]" />
                    </motion.div>
                    <div className="mt-1 text-xs sm:text-sm font-mono font-extrabold text-[#f59e0b] tracking-wider">
                        D20 CRIT
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">کلیک برای تاس</span>
                </motion.div>

                {/* Floating Card 2: Voice PTT Live */}
                <motion.div
                    initial={{ opacity: 0, x: -60, rotate: -6 }}
                    animate={{ opacity: 1, x: 0, rotate: -4 }}
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 30 }}
                    transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -left-2 sm:left-6 bottom-3 sm:bottom-1 w-52 sm:w-60 p-3.5 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-[0_20px_45px_rgba(0,0,0,0.08)] z-10 text-right cursor-pointer"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                            <Mic className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-neutral-900">صدای بلادرنگ</div>
                            <div className="text-[10px] font-mono text-neutral-400">Push-to-Talk (Space)</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 h-5 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200/60">
                        <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
                        <span className="w-1 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                        <span className="w-1 h-5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                        <span className="text-[10px] font-medium text-neutral-600 mr-auto font-mono">
              LiveKit SFU &lt;80ms
            </span>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="hidden sm:flex absolute -top-4 left-1/4 -translate-x-1/2 items-center gap-1.5 px-3 py-1 rounded-full bg-[#12141d] text-white border border-[#2b2d3d] text-[11px] font-medium shadow-lg z-25"
                >
                    <Compass className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>موتور رندر Konva ۶۰fps</span>
                </motion.div>
            </div>
        </section>
    );
};