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
                        ? 'bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
                        : 'bg-white/60 backdrop-blur-sm border border-neutral-200/40'
                }`}
            >
                <a
                    href="#hero"
                    onClick={() => sound.playTokenClick()}
                    className="flex items-center gap-2.5 group"
                >
                    <div className="w-8 h-8 rounded-lg bg-[#0e1017] border border-[#262835] flex items-center justify-center text-[#f59e0b] shadow-sm transition-transform duration-200 group-hover:scale-105">
                        <Dices className="w-4 h-4" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black tracking-tight text-neutral-900">
                            Titipool
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#ea580c] uppercase">
                            VTT
                        </span>
                    </div>
                </a>

                <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-neutral-600">
                    {navLinks.map((link) => {
                        const isActive = activeSection === link.id;
                        return (
                            <a
                                key={link.id}
                                href={`#${link.id}`}
                                onClick={() => sound.playTokenClick()}
                                className={`transition-colors relative py-1 ${
                                    isActive ? 'text-neutral-950 font-bold' : 'hover:text-neutral-950'
                                }`}
                            >
                                {link.label}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f59e0b] rounded-full" />
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
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80 transition-colors cursor-pointer"
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
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-xs font-bold text-neutral-800 transition-colors cursor-pointer"
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
                            className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 px-2.5 py-1.5 transition-colors cursor-pointer"
                        >
                            ورود
                        </button>
                    )}

                    <button
                        onClick={() => {
                            sound.playDiceRoll();
                            onStartGame();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs sm:text-[13px] shadow-[0_2px_12px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-all cursor-pointer group active:scale-[0.97]"
                    >
                        <span>شروع بازی</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </button>
                </div>
            </div>
        </header>
    );
};