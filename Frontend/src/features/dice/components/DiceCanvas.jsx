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
            camera={{ position: [0, 8.6, 8.8], fov: 43 }}
            style={{ width: '100%', height: '100%' }}
        >
            {/* نورپردازی استودیویی با سایه‌های نرم */}
            <hemisphereLight args={['#fff8ed', '#1b1d25', 1.15]} />
            <ambientLight intensity={0.22} />
            <directionalLight
                position={[5, 10, 4]}
                intensity={2.0}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-bias={-0.0003}
                shadow-normalBias={0.025}
                shadow-camera-far={25}
                shadow-camera-left={-8}
                shadow-camera-right={8}
                shadow-camera-top={8}
                shadow-camera-bottom={-8}
            />
            <pointLight position={[-5, 6, -4]} intensity={0.75} />
            <pointLight position={[4, 3, 6]} intensity={0.35} />

            <Suspense fallback={null}>
                {/* موتور فیزیک با تایم‌استپ پایدار و گرانش استاندارد */}
                <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60} interpolate={true}>
                    <Tray size={10} />
                    {activeDice.map((die) => (
                        <Die key={die.id} {...die} />
                    ))}
                </Physics>
            </Suspense>
        </Canvas>
    );
}