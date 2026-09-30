// src/features/dice/components/Tray.jsx
import React from 'react';
import { useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

// ابعاد استاندارد و یکسان محوطه پرتاب برای تمام رزولوشن‌ها و مانیتورها
const FIXED_ARENA_WIDTH = 13.5;
const FIXED_ARENA_HEIGHT = 8.5;

export function Tray() {
    const { viewport } = useThree();
    const halfW = FIXED_ARENA_WIDTH / 2;
    const halfH = FIXED_ARENA_HEIGHT / 2;
    const wallThickness = 1.0;
    const wallHeight = 12.0;

    return (
        <group position={[0, 0, 0]}>
            {/* کف سینی نامرئی که برای پشتیبانی از تمام صفحه به اندازه viewport گسترش می‌یابد */}
            <RigidBody type="fixed" friction={0.6} restitution={0.35}>
                <CuboidCollider args={[Math.max(viewport.width, 30), 0.2, Math.max(viewport.height, 30)]} position={[0, -0.2, 0]} />

                <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[Math.max(viewport.width * 2, 50), Math.max(viewport.height * 2, 50)]} />
                    <shadowMaterial opacity={0.38} />
                </mesh>
            </RigidBody>

            {/* دیواره‌های نامرئی با ابعاد ثابت استاندارد (تضمین کمانه یکسان روی تمام مانیتورها) */}
            <RigidBody type="fixed" friction={0.2} restitution={0.5}>
                {/* دیوار بالا (شمال) */}
                <CuboidCollider args={[halfW + wallThickness, wallHeight / 2, wallThickness / 2]} position={[0, wallHeight / 2, -halfH - wallThickness / 2]} />
                {/* دیوار پایین (جنوب) */}
                <CuboidCollider args={[halfW + wallThickness, wallHeight / 2, wallThickness / 2]} position={[0, wallHeight / 2, halfH + wallThickness / 2]} />
                {/* دیوار چپ (غرب) */}
                <CuboidCollider args={[wallThickness / 2, wallHeight / 2, halfH + wallThickness]} position={[-halfW - wallThickness / 2, wallHeight / 2, 0]} />
                {/* دیوار راست (شرق) */}
                <CuboidCollider args={[wallThickness / 2, wallHeight / 2, halfH + wallThickness]} position={[halfW + wallThickness / 2, wallHeight / 2, 0]} />
            </RigidBody>
        </group>
    );
}