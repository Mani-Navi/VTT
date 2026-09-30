import React from 'react';
import { useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function Tray() {
    const { viewport } = useThree();
    const width = viewport.width;
    const height = viewport.height;
    const halfW = width / 2;
    const halfH = height / 2;
    const wallThickness = 1.0;
    const wallHeight = 12.0;

    return (
        <group position={[0, 0, 0]}>
            {/* کف سینی نامرئی با قابلیت دریافت سایه زنده روی نقشه */}
            <RigidBody type="fixed" friction={0.6} restitution={0.35}>
                <CuboidCollider args={[halfW * 1.5, 0.2, halfH * 1.5]} position={[0, -0.2, 0]} />

                {/* این متریال فقط سایه تاس‌ها را روی نقشه زیرین می‌اندازد و خود سطح شفاف است */}
                <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[width * 2, height * 2]} />
                    <shadowMaterial opacity={0.38} />
                </mesh>
            </RigidBody>

            {/* دیواره‌های نامرئی منطبق بر لبه‌های کادر صفحه نمایش */}
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