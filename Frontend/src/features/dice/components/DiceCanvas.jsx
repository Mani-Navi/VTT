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
            <ambientLight intensity={0.7} color="#fed7aa" />

            <directionalLight
                position={[6, 18, 8]}
                intensity={1.9}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={0.5}
                shadow-camera-far={35}
                shadow-bias={-0.0001}
            />

            <pointLight position={[-6, 10, -6]} intensity={0.5} color="#c084fc" />

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