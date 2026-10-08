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
        <div className="w-full min-h-screen bg-[#f0ece5] p-2 sm:p-5 md:p-8 flex flex-col items-center justify-start text-[#121316]">
            {/* پوسته آرت‌بورد سفید معلق قبلی با حفظ اسکرول روان */}
            <div className="w-full max-w-[1360px] bg-white rounded-[24px] sm:rounded-[36px] md:rounded-[44px] shadow-[0_30px_90px_rgba(25,23,20,0.06)] border border-[#e4ded4] relative flex flex-col">
                <Navbar
                    onOpenAuth={handleOpenAuth}
                    onOpenProfile={handleOpenProfile}
                    onOpenRoomCode={handleOpenRoomCode}
                    onStartGame={handleStartGame}
                    user={isSessionValid ? user : null}
                />

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

                <BigStatement />

                {/* سکشن تاس با موتور سه‌بعدی واقعی */}
                <DiceSection />

                <ScenariosSection onSelectScenario={handleSelectScenario} />

                <GameMasterSection />

                <HowItWorks onStartGame={handleStartGame} />

                <PersianBrandSection />

                <Footer />
            </div>
        </div>
    );
}