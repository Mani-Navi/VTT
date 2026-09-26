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
            camera={{ position: [0, 9, 8], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
        >
            {/* نورپردازی استودیویی با سایه‌های نرم */}
            <ambientLight intensity={0.7} />
            <directionalLight
                position={[6, 12, 5]}
                intensity={1.4}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={25}
                shadow-camera-left={-8}
                shadow-camera-right={8}
                shadow-camera-top={8}
                shadow-camera-bottom={-8}
            />
            <pointLight position={[-6, 8, -4]} intensity={0.5} />

            <Suspense fallback={null}>
                {/* موتور فیزیک با تایم‌استپ پایدار و گرانش استاندارد */}
                <Physics gravity={[0, -28, 0]} timeStep={1 / 60}>
                    <Tray size={10} />
                    {activeDice.map((die) => (
                        <Die key={die.id} {...die} />
                    ))}
                </Physics>
            </Suspense>
        </Canvas>
    );
}