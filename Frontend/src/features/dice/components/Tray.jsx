import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function Tray({ width = 7.6, length = 13.8, wallHeight = 12 }) {
    const halfW = width / 2;
    const halfL = length / 2;
    const rimThickness = 0.5;
    const rimHeight = 0.8;

    return (
        <group position={[0, -0.4, 0]}>
            {/* کف نمدی/چرمی مات سینی */}
            <RigidBody type="fixed" friction={0.65} restitution={0.32}>
                <CuboidCollider args={[halfW, 0.4, halfL]} position={[0, -0.4, 0]} />
                <mesh receiveShadow position={[0, -0.39, 0]}>
                    <boxGeometry args={[width, 0.8, length]} />
                    <meshStandardMaterial
                        color="#141316"
                        roughness={0.92}
                        metalness={0.05}
                    />
                </mesh>
            </RigidBody>

            {/* قاب چوبی گردوی تیره دور سینی (ماهوگانی با لبه‌های پخ‌خورده) */}
            <group position={[0, 0, 0]}>
                {/* لبه بالایی */}
                <mesh position={[0, rimHeight / 2 - 0.2, -halfL - rimThickness / 2]} receiveShadow castShadow>
                    <boxGeometry args={[width + rimThickness * 2, rimHeight, rimThickness]} />
                    <meshStandardMaterial color="#24130d" roughness={0.4} metalness={0.1} />
                </mesh>
                {/* لبه پایینی */}
                <mesh position={[0, rimHeight / 2 - 0.2, halfL + rimThickness / 2]} receiveShadow castShadow>
                    <boxGeometry args={[width + rimThickness * 2, rimHeight, rimThickness]} />
                    <meshStandardMaterial color="#24130d" roughness={0.4} metalness={0.1} />
                </mesh>
                {/* لبه چپ */}
                <mesh position={[-halfW - rimThickness / 2, rimHeight / 2 - 0.2, 0]} receiveShadow castShadow>
                    <boxGeometry args={[rimThickness, rimHeight, length]} />
                    <meshStandardMaterial color="#20100a" roughness={0.4} metalness={0.1} />
                </mesh>
                {/* لبه راست */}
                <mesh position={[halfW + rimThickness / 2, rimHeight / 2 - 0.2, 0]} receiveShadow castShadow>
                    <boxGeometry args={[rimThickness, rimHeight, length]} />
                    <meshStandardMaterial color="#20100a" roughness={0.4} metalness={0.1} />
                </mesh>
            </group>

            {/* دیواره‌های برخورددهنده فیزیکی نامرئی */}
            <RigidBody type="fixed" friction={0.25} restitution={0.45}>
                <CuboidCollider args={[halfW, wallHeight / 2, 0.5]} position={[0, wallHeight / 2, -halfL]} />
                <CuboidCollider args={[halfW, wallHeight / 2, 0.5]} position={[0, wallHeight / 2, halfL]} />
                <CuboidCollider args={[0.5, wallHeight / 2, halfL]} position={[-halfW, wallHeight / 2, 0]} />
                <CuboidCollider args={[0.5, wallHeight / 2, halfL]} position={[halfW, wallHeight / 2, 0]} />
            </RigidBody>
        </group>
    );
}