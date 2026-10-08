import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Compass,
    Eye,
    Mic,
    Grid,
    Image,
    Zap,
    CheckCircle2,
} from 'lucide-react';
import { sound } from '../../utils/tableAudio';
import { FEATURES } from '../../data/landingData';
import { GsapHeadingReveal } from './GsapHeadingReveal';

export const FeaturesSequence = () => {
    const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
    const current = FEATURES[selectedFeatureIndex];

    const handleSelect = (idx) => {
        sound.playTokenClick();
        setSelectedFeatureIndex(idx);
    };

    const icons = [Compass, Eye, Mic, Grid, Image, Zap];

    return (
        <section id="features" className="py-20 sm:py-28 px-4 sm:px-8 overflow-hidden w-full" dir="rtl">
            <div className="max-w-6xl mx-auto">
                {/* تیتر بدون کراپ با مارجین متناسب */}
                <GsapHeadingReveal
                    eyebrow="معماری فنی و قابلیت‌ها · DEEP FEATURES"
                    lines={['تکامل ابزارهای بازی،', 'روی میز مجازی.']}
                    subtitle="به‌جای کارت‌های خلاصه، هر ویژگی را در ابعاد واقعی بررسی کنید."
                    containerClassName="max-w-2xl mx-auto mb-10 sm:mb-14 pt-4"
                />

                {/* تب‌های ۶گانه */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-12 border-b border-neutral-200">
                    {FEATURES.map((item, idx) => {
                        const isSelected = selectedFeatureIndex === idx;
                        const Icon = icons[idx];
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(idx)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    isSelected
                                        ? 'bg-neutral-950 text-white shadow-md'
                                        : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#f59e0b]' : ''}`} />
                                <span className="font-mono text-[11px] opacity-70">{item.number}</span>
                                <span>{item.title}</span>
                            </button>
                        );
                    })}
                </div>

                {/* استیج بزرگ قابلیت فعال */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="rounded-3xl bg-[#090a10] border border-[#222434] p-6 sm:p-10 md:p-12 shadow-[0_30px_90px_rgba(0,0,0,0.2)] text-right overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

                            {/* توضیحات */}
                            <div className="lg:col-span-6">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-3xl font-black text-[#f59e0b]">
                                        {current.number}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-[#181b28] border border-[#2b3044] text-[11px] font-mono text-neutral-300">
                                        {current.badge}
                                    </span>
                                </div>

                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-4 tracking-tight leading-snug">
                                    {current.headline}
                                </h3>

                                <p className="text-sm sm:text-base text-neutral-400 mt-4 leading-relaxed">
                                    {current.description}
                                </p>

                                <div className="mt-6 space-y-2.5">
                                    {current.details.map((detail, dIdx) => (
                                        <div key={dIdx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                                            <CheckCircle2 className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                                            <span>{detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ویجت تعاملی هر قابلیت */}
                            <div className="lg:col-span-6">
                                <div className="rounded-2xl bg-[#10121a] border border-[#242738] p-5 sm:p-6 shadow-inner relative overflow-hidden min-h-[300px] flex flex-col justify-center">
                                    {current.mockUiType === 'map' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                                                <span>موتور بوم تاکتیکال Konva</span>
                                                <span className="font-mono text-emerald-400">60 FPS Hardware Accel</span>
                                            </div>
                                            <div className="h-44 rounded-xl bg-[#090a0f] border border-[#1e202e] relative overflow-hidden flex items-center justify-center">
                                                <div
                                                    className="absolute inset-0 opacity-20"
                                                    style={{
                                                        backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)',
                                                        backgroundSize: '24px 24px',
                                                    }}
                                                />
                                                <motion.div
                                                    animate={{ x: [0, 40, -40, 0] }}
                                                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                                    className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-[#f59e0b] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] z-10"
                                                >
                                                    ⚔️
                                                </motion.div>
                                            </div>
                                        </div>
                                    )}

                                    {current.mockUiType === 'fog' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                                                <span>ابزار مه پویا (Fog Brush)</span>
                                                <span className="font-mono text-amber-400">Composite: Destination-Out</span>
                                            </div>
                                            <div className="h-44 rounded-xl bg-[#090a0f] border border-[#1e202e] relative overflow-hidden flex items-center justify-center">
                                                <div className="absolute inset-0 bg-neutral-950/90 flex items-center justify-center">
                                                    <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#f59e0b] shadow-[0_0_40px_rgba(245,158,11,0.3)] flex items-center justify-center text-xs text-white">
                                                        دید بازیکن (Line of Sight)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {current.mockUiType === 'voice' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                                                <span>کلاود صوتی LiveKit SFU</span>
                                                <span className="font-mono text-emerald-400">Latency: 64ms</span>
                                            </div>
                                            <div className="h-44 rounded-xl bg-[#090a0f] border border-[#1e202e] p-4 flex flex-col justify-center items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs text-white font-bold">مکالمه بدون تأخیر با کلید Space</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 h-10">
                                                    {[40, 70, 95, 30, 85, 100, 60, 80, 45, 90, 30].map((h, i) => (
                                                        <motion.span
                                                            key={i}
                                                            animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.4}%`] }}
                                                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.08 }}
                                                            className="w-1.5 bg-[#f59e0b] rounded-full"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {current.mockUiType === 'grid' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                                                <span>سیستم‌های اندازه‌گیری استاندارد</span>
                                                <span className="font-mono text-neutral-300">D&D 5E 5/10/5 Rule</span>
                                            </div>
                                            <div className="h-44 rounded-xl bg-[#090a0f] border border-[#1e202e] relative overflow-hidden flex items-center justify-center">
                                                <div
                                                    className="absolute inset-0 opacity-40"
                                                    style={{
                                                        backgroundImage:
                                                            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                                                        backgroundSize: '30px 30px',
                                                    }}
                                                />
                                                <div className="relative z-10 px-3 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-700 text-xs font-mono text-amber-400 font-bold">
                                                    فاصله تا هدف: 30ft (6 سلول)
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {current.mockUiType === 'assets' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                                                <span>کتابخانه ابری اختصاصی</span>
                                                <span className="font-mono text-neutral-300">Drag & Drop Direct</span>
                                            </div>
                                            <div className="h-44 rounded-xl bg-[#090a0f] border border-[#1e202e] p-3 grid grid-cols-3 gap-2">
                                                <div className="rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center text-lg p-2">
                                                    <span>🏰</span>
                                                    <span className="text-[9px] text-neutral-400 mt-1">قلعه کهن</span>
                                                </div>
                                                <div className="rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center text-lg p-2">
                                                    <span>🌲</span>
                                                    <span className="text-[9px] text-neutral-400 mt-1">جنگل تاریک</span>
                                                </div>
                                                <div className="rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center text-lg p-2">
                                                    <span>💀</span>
                                                    <span className="text-[9px] text-neutral-400 mt-1">اسکلت</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {current.mockUiType === 'sync' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                                                <span>سوکت بلادرنگ STOMP</span>
                                                <span className="font-mono text-emerald-400">&lt;90ms Latency</span>
                                            </div>
                                            <div className="h-44 rounded-xl bg-[#090a0f] border border-[#1e202e] p-4 flex flex-col items-center justify-center gap-3">
                                                <div className="flex items-center gap-4 text-xs font-mono text-neutral-300">
                                                    <span className="px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700">GM Host</span>
                                                    <span className="text-[#f59e0b] animate-pulse">⇄</span>
                                                    <span className="px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700">Player 1</span>
                                                </div>
                                                <div className="text-xs text-emerald-400 font-bold">
                                                    همگام‌سازی لحظه‌ای تمام رویدادها
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};