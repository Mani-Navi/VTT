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
import { PlayerSection } from '../../components/landing/PlayerSection';
import { FeaturesSequence } from '../../components/landing/FeaturesSequence';
import { HowItWorks } from '../../components/landing/HowItWorks';
import { PersianBrandSection } from '../../components/landing/PersianBrandSection';
import { FinalCta } from '../../components/landing/FinalCta';
import { Footer } from '../../components/landing/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);

    const isSessionValid = Boolean(isAuthenticated && token && !isTokenExpired(token));

    useEffect(() => {
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
        <div className="w-full min-h-screen bg-white text-[#121316] flex flex-col items-center justify-start overflow-x-hidden selection:bg-[#f59e0b] selection:text-black">
            {/* لایه‌بندی لبه‌به‌لبه و تمام‌صفحه بدون کادر و حاشیه اضافه */}
            <div className="w-full flex flex-col relative">
                {/* نوبار */}
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

                {/* بیانیه بزرگ */}
                <BigStatement />

                {/* استیج سه‌بعدی تاس (پیش‌فرض D12) */}
                <DiceSection />

                {/* سناریوها */}
                <ScenariosSection onSelectScenario={handleSelectScenario} />

                {/* پنل دانجن‌مستر */}
                <GameMasterSection />

                {/* کارت تعاملی بازیکن نبرد */}
                <PlayerSection />

                {/* توالی قابلیت‌های ۶گانه */}
                <FeaturesSequence />

                {/* مراحل شروع بازی */}
                <HowItWorks onStartGame={handleStartGame} />

                {/* هویت فارسی */}
                <PersianBrandSection />

                {/* پیام اقدام پایانی */}
                <FinalCta
                    onStartGame={handleStartGame}
                    onOpenAuth={handleOpenAuth}
                />

                {/* فوتر */}
                <Footer />
            </div>
        </div>
    );
}