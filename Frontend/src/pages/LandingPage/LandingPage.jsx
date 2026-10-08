import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useAuthStore } from '../../stores/auth.store';
import { isTokenExpired } from '../../utils/jwt';

import { Navbar } from '../../components/landing/Navbar';
import { Hero } from '../../components/landing/Hero';
import { BigStatement } from '../../components/landing/BigStatement';
import { DiceSection } from '../../components/landing/DiceSection';
import { ScenariosSection } from '../../components/landing/ScenariosSection';
import { GameMasterSection } from '../../components/landing/GameMasterSection';
import { HowItWorks } from '../../components/landing/HowItWorks';
import { PersianBrandSection } from '../../components/landing/PersianBrandSection';
import { Footer } from '../../components/landing/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);

    const isSessionValid = Boolean(isAuthenticated && token && !isTokenExpired(token));

    useEffect(() => {
        // باز کردن قفل اسکرول برای کل سند در هنگام لود لندینگ
        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.height = 'auto';
        document.body.style.overflowY = 'auto';
        document.body.style.height = 'auto';

        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 250);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    const handleStartGame = () => {
        if (isSessionValid) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const handleOpenAuth = () => {
        navigate('/login');
    };

    const handleOpenProfile = () => {
        navigate('/dashboard');
    };

    const handleOpenRoomCode = () => {
        if (isSessionValid) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const handleSelectScenario = () => {
        if (isSessionValid) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#090a0f] text-[#f3f4f6] flex flex-col items-center justify-start overflow-x-hidden selection:bg-[#f59e0b] selection:text-black">
            {/* ساختار تمام‌صفحه بدون کادر و حاشیه سفید */}
            <div className="w-full flex flex-col relative">
                {/* نوبار هوشمند متصل به کاربر جاری */}
                <Navbar
                    onOpenAuth={handleOpenAuth}
                    onOpenProfile={handleOpenProfile}
                    onOpenRoomCode={handleOpenRoomCode}
                    onStartGame={handleStartGame}
                    user={isSessionValid ? user : null}
                />

                {/* بخش هیرو */}
                <Hero
                    onStartGame={handleStartGame}
                    onExploreMore={() => {
                        const el = document.getElementById('dice');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    onDiceClick={() => {
                        const el = document.getElementById('dice');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                />

                {/* بیانیه مینیمال */}
                <BigStatement />

                {/* تاس ۳بعدی با فیزیک و صدای وب‌اودیو */}
                <DiceSection />

                {/* سناریوها */}
                <ScenariosSection onSelectScenario={handleSelectScenario} />

                {/* کنترل‌پنل دانجن‌مستر */}
                <GameMasterSection />

                {/* مراحل شروع سریع */}
                <HowItWorks onStartGame={handleStartGame} />

                {/* ستون‌های هویت فارسی */}
                <PersianBrandSection />

                {/* فوتر متصل به روت‌های حقوقی واقعی */}
                <Footer />
            </div>
        </div>
    );
}