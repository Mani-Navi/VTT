// src/features/dice/components/DiceCanvas.jsx
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
            gl={{ alpha: true, antialias: true }}
            camera={{ position: [0, 16, 0.01], fov: 45 }}
            style={{
                width: '100%',
                height: '100%',
                pointerEvents: activeDice.length > 0 ? 'auto' : 'none',
            }}
        >
            <ambientLight intensity={0.85} color="#ffffff" />

            {/* نورپردازی عمودی تمیز برای جلوگیری از کشیده شدن سایه به دیواره‌ها و گوشه‌ها */}
            <directionalLight
                position={[2, 22, 3]}
                intensity={1.8}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={0.5}
                shadow-camera-far={40}
                shadow-camera-left={-25}
                shadow-camera-right={25}
                shadow-camera-top={25}
                shadow-camera-bottom={-25}
                shadow-bias={-0.00015}
            />

            <pointLight position={[-8, 12, -8]} intensity={0.4} color="#e0e7ff" />

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