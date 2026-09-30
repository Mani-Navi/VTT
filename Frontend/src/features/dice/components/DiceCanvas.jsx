import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Tray } from './Tray';
import { Die } from './Die';
import { useDiceStore } from '../state/dice.store';

export function DiceCanvas() {
    const activeDice = useDiceStore((s) => s.activeDice);

    return (
        <Canvas
            shadows
            camera={{ position: [0, 15.5, 0.05], fov: 48 }}
            style={{ width: '100%', height: '100%' }}
        >
            {/* نور محیطی گرم برای حفظ جزئیات در سایه‌ها */}
            <ambientLight intensity={0.55} color="#fed7aa" />

            {/* نور اصلی زاویه‌دار برای هایلایت‌های طلایی و سایه‌های پرکنتراست */}
            <directionalLight
                position={[4, 16, 6]}
                intensity={1.8}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-bias={-0.0001}
            />

            {/* نور نقطه‌ای ملایم جهت شفافیت رگه‌های بنفش */}
            <pointLight position={[-4, 8, -5]} intensity={0.6} color="#c084fc" />

            <Suspense fallback={null}>
                <Physics gravity={[0, -32, 0]} timeStep={1 / 60}>
                    <Tray />
                    {activeDice.map((die) => (
                        <Die key={die.id} {...die} />
                    ))}
                </Physics>
            </Suspense>
        </Canvas>
    );
}