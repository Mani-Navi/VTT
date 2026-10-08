import React, { useState, useEffect } from 'react';
import { Dices, Key, ArrowUpRight } from 'lucide-react';
import { sound } from '../../utils/tableAudio';

export const Navbar = ({
                           onOpenAuth,
                           onOpenProfile,
                           onOpenRoomCode,
                           onStartGame,
                           user,
                       }) => {
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);

            const sections = ['hero', 'reveal', 'statement', 'dice', 'scenarios', 'gm', 'features', 'how-it-works'];
            for (const sectionId of sections) {
                const el = document.getElementById(sectionId);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 200 && rect.bottom >= 200) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { id: 'reveal', label: 'محصول' },
        { id: 'dice', label: 'تاس‌ها' },
        { id: 'scenarios', label: 'سناریوها' },
        { id: 'features', label: 'امکانات' },
        { id: 'how-it-works', label: 'نحوه کار' },
    ];

    return (
        <header
            className="sticky top-3 sm:top-5 z-40 w-full transition-all duration-300 px-3 sm:px-6"
            dir="rtl"
        >
            <div
                className={`max-w-[1240px] mx-auto rounded-full transition-all duration-300 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 ${
                    scrolled
                        ? 'bg-[#0e1017]/85 backdrop-blur-md border border-[#262838] shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
                        : 'bg-[#12141f]/60 backdrop-blur-sm border border-[#242738]/60'
                }`}
            >
                <a
                    href="#hero"
                    onClick={() => sound.playTokenClick()}
                    className="flex items-center gap-2.5 group"
                >
                    <div className="w-8 h-8 rounded-lg bg-[#181a24] border border-[#2d3042] flex items-center justify-center text-[#f59e0b] shadow-sm transition-transform duration-200 group-hover:scale-105">
                        <Dices className="w-4 h-4" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black tracking-tight text-white">
                            Titipool
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#ea580c] uppercase">
                            VTT
                        </span>
                    </div>
                </a>

                <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-400">
                    {navLinks.map((link) => {
                        const isActive = activeSection === link.id;
                        return (
                            <a
                                key={link.id}
                                href={`#${link.id}`}
                                onClick={() => sound.playTokenClick()}
                                className={`transition-colors relative py-1 ${
                                    isActive ? 'text-white font-bold' : 'hover:text-white'
                                }`}
                            >
                                {link.label}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f59e0b] rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                )}
                            </a>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => {
                            sound.playTokenClick();
                            onOpenRoomCode();
                        }}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="ورود مستقیم به اتاق با کد"
                    >
                        <Key className="w-3.5 h-3.5 text-[#f59e0b]" />
                        <span>ورود با کد</span>
                    </button>

                    {user ? (
                        <button
                            onClick={() => {
                                sound.playTokenClick();
                                onOpenProfile();
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181a26] border border-[#292c3e] hover:border-[#f59e0b]/50 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
                        >
                            <div className="w-5 h-5 rounded-full bg-[#f59e0b] text-neutral-950 flex items-center justify-center text-[10px] font-black">
                                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="max-w-[80px] truncate">{user.name || user.email}</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                sound.playTokenClick();
                                onOpenAuth();
                            }}
                            className="text-xs font-semibold text-zinc-300 hover:text-white px-2.5 py-1.5 transition-colors cursor-pointer"
                        >
                            ورود
                        </button>
                    )}

                    <button
                        onClick={() => {
                            sound.playDiceRoll();
                            onStartGame();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ea580c] hover:from-[#fbbf24] hover:to-[#f59e0b] text-neutral-950 font-bold text-xs sm:text-[13px] shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer group active:scale-[0.97]"
                    >
                        <span>شروع بازی</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </button>
                </div>
            </div>
        </header>
    );
};