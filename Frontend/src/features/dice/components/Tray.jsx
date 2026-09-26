// src/features/dice/components/Tray.jsx
import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function Tray({ size = 12, wallHeight = 10 }) {
    const half = size / 2;

    return (
        <group position={[0, -0.5, 0]}>
            {/* کف سینی اصلی */}
            <RigidBody type="fixed" friction={0.6} restitution={0.3}>
                <CuboidCollider args={[half, 0.5, half]} position={[0, -0.5, 0]} />
                <mesh receiveShadow position={[0, -0.5, 0]}>
                    <boxGeometry args={[size, 1, size]} />
                    <meshStandardMaterial
                        color="#12151e"
                        roughness={0.7}
                        metalness={0.2}
                    />
                </mesh>
            </RigidBody>

            {/* حاشیه‌ی چرمی دور سینی */}
            <mesh position={[0, 0.1, 0]} receiveShadow>
                <boxGeometry args={[size + 0.6, 0.4, size + 0.6]} />
                <meshStandardMaterial color="#221b16" roughness={0.9} />
            </mesh>

            {/* دیواره‌های نامرئی (Physics Colliders) برای جلوگیری از خروج تاس */}
            <RigidBody type="fixed" friction={0.2} restitution={0.5}>
                {/* دیوار شمالی */}
                <CuboidCollider args={[half, wallHeight / 2, 0.5]} position={[0, wallHeight / 2, -half]} />
                {/* دیوار جنوبی */}
                <CuboidCollider args={[half, wallHeight / 2, 0.5]} position={[0, wallHeight / 2, half]} />
                {/* دیوار شرقی */}
                <CuboidCollider args={[0.5, wallHeight / 2, half]} position={[half, wallHeight / 2, 0]} />
                {/* دیوار غربی */}
                <CuboidCollider args={[0.5, wallHeight / 2, half]} position={[-half, wallHeight / 2, 0]} />
            </RigidBody>
        </group>
    );
}