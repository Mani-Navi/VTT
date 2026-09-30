// src/features/dice/components/Tray.jsx
import React from 'react';
import { useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function Tray() {
    const { viewport } = useThree();

    // حاشیه امن درونی تا تاس دقیقاً قبل از رسیدن به لبه مانیتور متوقف شود
    const safeInset = 0.8;
    const halfW = Math.max((viewport.width / 2) - safeInset, 3);
    const halfH = Math.max((viewport.height / 2) - safeInset, 3);

    // ضخامت بسیار بالا و ارتفاع زیاد برای مسدودسازی قطعی گوشه‌ها و جلوگیری از تونلینگ
    const wallThickness = 4.0;
    const wallHeight = 24.0;

    return (
        <group position={[0, 0, 0]}>
            {/* کف سینی نامرئی برای انداختن سایه زنده روی نقشه */}
            <RigidBody type="fixed" friction={0.6} restitution={0.35}>
                <CuboidCollider
                    args={[Math.max(viewport.width * 2, 60), 0.2, Math.max(viewport.height * 2, 60)]}
                    position={[0, -0.2, 0]}
                />

                <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[Math.max(viewport.width * 2, 60), Math.max(viewport.height * 2, 60)]} />
                    <shadowMaterial opacity={0.38} />
                </mesh>
            </RigidBody>

            {/* دیواره‌های نامرئی فوق‌ضخیم کاملاً چسبیده به ۴ گوشه دید دوربین */}
            <RigidBody type="fixed" friction={0.3} restitution={0.4}>
                {/* دیوار بالا (شمال) - همپوشانی کامل با گوشه‌ها */}
                <CuboidCollider
                    args={[halfW + wallThickness, wallHeight / 2, wallThickness / 2]}
                    position={[0, wallHeight / 2, -halfH - (wallThickness / 2)]}
                />
                {/* دیوار پایین (جنوب) - همپوشانی کامل با گوشه‌ها */}
                <CuboidCollider
                    args={[halfW + wallThickness, wallHeight / 2, wallThickness / 2]}
                    position={[0, wallHeight / 2, halfH + (wallThickness / 2)]}
                />
                {/* دیوار چپ (غرب) */}
                <CuboidCollider
                    args={[wallThickness / 2, wallHeight / 2, halfH + wallThickness]}
                    position={[-halfW - (wallThickness / 2), wallHeight / 2, 0]}
                />
                {/* دیوار راست (شرق) */}
                <CuboidCollider
                    args={[wallThickness / 2, wallHeight / 2, halfH + wallThickness]}
                    position={[halfW + (wallThickness / 2), wallHeight / 2, 0]}
                />
            </RigidBody>
        </group>
    );
}