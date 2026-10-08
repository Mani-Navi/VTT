import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCw, Volume2 } from 'lucide-react';
import { sound } from '../../utils/tableAudio';
import { DICE_SET } from '../../data/landingData';
import { GsapHeadingReveal } from './GsapHeadingReveal';

export const DiceSection = () => {
    const [selectedDie, setSelectedDie] = useState('D20');
    const [isRolling, setIsRolling] = useState(false);
    const [rollResult, setRollResult] = useState(20);
    const [rollHistory, setRollHistory] = useState([18, 14, 20]);
    const [isCrit, setIsCrit] = useState(true);

    const rollDie = (sides) => {
        if (isRolling) return;
        setIsRolling(true);
        sound.playDiceRoll();

        setTimeout(() => {
            const result = Math.floor(Math.random() * sides) + 1;
            setRollResult(result);
            setRollHistory((prev) => [result, ...prev.slice(0, 4)]);
            setIsRolling(false);

            if (sides === 20 && result === 20) {
                setIsCrit(true);
                sound.playCritChime();
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#f59e0b', '#fbbf24', '#ffffff', '#ea580c'],
                });
            } else {
                setIsCrit(false);
            }
        }, 650);
    };

    const handleDieSelect = (type, sides) => {
        setSelectedDie(type);
        rollDie(sides);
    };

    return (
        <section id="dice" className="py-20 sm:py-32 px-4 sm:px-8 overflow-hidden" dir="rtl">
            <div className="max-w-6xl mx-auto">
                <GsapHeadingReveal
                    eyebrow="فیزیک و احتمالات · D&D DICE ENGINE"
                    lines={['تاس‌ها،', 'بخشی از ماجراجویی‌اند.']}
                    subtitle="تاس بینداز. بچرخان. نتیجه را ببین."
                    containerClassName="max-w-2xl mx-auto mb-12 sm:mb-16"
                />

                <div className="relative rounded-3xl bg-[#0e1017] border border-[#232636] shadow-[0_25px_80px_rgba(0,0,0,0.18)] p-6 sm:p-12 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        {/* Interactive Roller */}
                        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-8">
                            <div className="relative [perspective:1500px] w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
                                <motion.div
                                    animate={{
                                        scale: isRolling ? [1, 0.7, 1.2, 1] : [1, 1.05, 1],
                                        opacity: isRolling ? [0.4, 0.2, 0.5, 0.4] : 0.4,
                                    }}
                                    transition={{ repeat: isRolling ? 0 : Infinity, duration: 3, ease: 'easeInOut' }}
                                    className="absolute bottom-2 w-40 sm:w-52 h-8 bg-black rounded-full blur-xl pointer-events-none"
                                />

                                <motion.div
                                    animate={
                                        isRolling
                                            ? {
                                                rotateX: [0, 360, 720, 1080],
                                                rotateY: [0, -360, -720, -1080],
                                                rotateZ: [0, 180, 360, 540],
                                                y: [0, -60, -20, 0],
                                                scale: [1, 1.15, 0.95, 1],
                                            }
                                            : {
                                                y: [0, -8, 0],
                                                rotateY: [0, 10, -10, 0],
                                            }
                                    }
                                    transition={
                                        isRolling
                                            ? { duration: 0.65, ease: [0.25, 1, 0.5, 1] }
                                            : { repeat: Infinity, duration: 4.5, ease: 'easeInOut' }
                                    }
                                    onClick={() => rollDie(selectedDie === 'D20' ? 20 : 12)}
                                    className="cursor-pointer group relative [transform-style:preserve-3d] select-none"
                                >
                                    <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-[36px] bg-gradient-to-tr from-[#161824] via-[#10121a] to-[#252838] border-2 border-[#f59e0b]/80 shadow-[0_0_50px_rgba(245,158,11,0.35)] flex flex-col items-center justify-center text-white relative transition-all duration-300 group-hover:border-[#f59e0b] group-hover:shadow-[0_0_70px_rgba(245,158,11,0.5)]">
                                        <div className="absolute inset-2 rounded-[28px] border border-white/10 pointer-events-none" />
                                        <div className="absolute top-2 text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider">
                                            {selectedDie} POLYHEDRAL
                                        </div>

                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={rollResult}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 1.4 }}
                                                transition={{ duration: 0.2 }}
                                                className={`text-5xl sm:text-6xl font-black font-mono tracking-tight ${
                                                    isCrit
                                                        ? 'text-[#f59e0b] drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                                                        : 'text-white'
                                                }`}
                                            >
                                                {rollResult}
                                            </motion.div>
                                        </AnimatePresence>

                                        {isCrit && !isRolling && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute -bottom-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ea580c] text-neutral-950 font-black text-[11px] shadow-lg flex items-center gap-1"
                                            >
                                                <Sparkles className="w-3 h-3" />
                                                <span>NAT 20 CRIT!</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            <button
                                onClick={() => rollDie(20)}
                                disabled={isRolling}
                                className="mt-8 px-7 py-3 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ea580c] hover:from-[#fbbf24] hover:to-[#f59e0b] text-neutral-950 font-black text-sm flex items-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-95"
                            >
                                <RotateCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                                <span>پرتاب تاس {selectedDie}</span>
                            </button>
                        </div>

                        {/* Dice Set Grid */}
                        <div className="lg:col-span-5 flex flex-col gap-5 text-right">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">
                                    مجموعه کامل تاس‌های D&D
                                </h3>
                                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                                    روی هر تاس کلیک کنید تا با فیزیک و صدای شبیه‌سازی‌شده چوب پرتاب شود.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                                {DICE_SET.map((die) => {
                                    const isCurrent = selectedDie === die.type;
                                    return (
                                        <button
                                            key={die.type}
                                            onClick={() => handleDieSelect(die.type, die.sides)}
                                            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                                                isCurrent
                                                    ? 'bg-[#1e1709] border-[#f59e0b] text-white shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                                                    : 'bg-[#13151f] border-[#252837] text-neutral-300 hover:border-neutral-500'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-black text-sm text-[#f59e0b]">
                          {die.type}
                        </span>
                                                <span className="text-[10px] text-neutral-500 font-mono">
                          {die.sides} وجه
                        </span>
                                            </div>
                                            <div className="text-[11px] text-neutral-400 truncate">{die.name}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#12141e] border border-[#232635]">
                                <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                                    <span>تاریخچه پرتاب‌های اخیر</span>
                                    <Volume2 className="w-3.5 h-3.5 text-[#f59e0b]" />
                                </div>
                                <div className="flex items-center gap-2">
                                    {rollHistory.map((num, idx) => (
                                        <span
                                            key={idx}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${
                                                num === 20
                                                    ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b]'
                                                    : 'bg-[#181a26] border-[#292c3d] text-white'
                                            }`}
                                        >
                      {num}
                    </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};