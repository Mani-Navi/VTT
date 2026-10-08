import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { sound } from '../../utils/tableAudio';
import { GsapHeadingReveal } from './GsapHeadingReveal';

export const FinalCta = ({ onStartGame, onOpenAuth }) => {
    return (
        <section className="py-24 sm:py-36 px-6 text-center w-full relative overflow-hidden" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <GsapHeadingReveal
                    eyebrow="شروع آنی بازی"
                    lines={['ماجراجویی بعدی تو،', 'از همین‌جا شروع می‌شود.']}
                    subtitle="بدون پیچیدگی. فقط بازی."
                    headingClassName="text-[40px] sm:text-[60px] md:text-[76px] lg:text-[84px] font-black leading-[1.08] tracking-[-0.03em] text-neutral-950"
                    subtitleClassName="mt-5 text-base sm:text-lg text-neutral-500 font-medium"
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4"
                >
                    <button
                        onClick={() => {
                            sound.playDiceRoll();
                            onStartGame();
                        }}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm sm:text-base shadow-[0_15px_40px_rgba(0,0,0,0.18)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-all cursor-pointer group active:scale-95"
                    >
                        <span>شروع بازی</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-[#f59e0b]" />
                    </button>

                    <button
                        onClick={() => {
                            sound.playTokenClick();
                            onOpenAuth();
                        }}
                        className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-bold text-sm sm:text-base transition-colors cursor-pointer"
                    >
                        <span>ورود به حساب</span>
                        <ArrowLeft className="w-4 h-4 text-neutral-500" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
};