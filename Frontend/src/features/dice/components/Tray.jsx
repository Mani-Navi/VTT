// src/features/dice/components/Tray.jsx
import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export function Tray({ size = 10, wallHeight = 1.35 }) {
    const half = size / 2;
    const floorY = -1.0;

    return (
        <group>
            {/* Soft-felt playing surface */}
            <RigidBody type="fixed" friction={0.72} restitution={0.16}>
                <CuboidCollider args={[half, 0.10, half]} position={[0, floorY, 0]} />
                <mesh receiveShadow position={[0, floorY - 0.10, 0]}>
                    <boxGeometry args={[size, 0.20, size]} />
                    <meshStandardMaterial
                        color="#242833"
                        roughness={0.92}
                        metalness={0.02}
                    />
                </mesh>
            </RigidBody>

            {/* Thick rounded tray rim */}
            <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
                <primitive
                    object={new RoundedBoxGeometry(size + 0.7, 0.42, size + 0.7, 5, 0.16)}
                    attach="geometry"
                />
                <meshStandardMaterial color="#241b16" roughness={0.72} metalness={0.08} />
            </mesh>

            {/* Raised inner rim: visible and physically collidable */}
            <RigidBody type="fixed" friction={0.62} restitution={0.18}>
                <CuboidCollider args={[half + 0.05, wallHeight / 2, 0.22]} position={[0, floorY + wallHeight / 2, -half - 0.12]} />
                <CuboidCollider args={[half + 0.05, wallHeight / 2, 0.22]} position={[0, floorY + wallHeight / 2, half + 0.12]} />
                <CuboidCollider args={[0.22, wallHeight / 2, half + 0.05]} position={[-half - 0.12, floorY + wallHeight / 2, 0]} />
                <CuboidCollider args={[0.22, wallHeight / 2, half + 0.05]} position={[half + 0.12, floorY + wallHeight / 2, 0]} />
            </RigidBody>

            {/* Subtle inner lip for contact shadows */}
            <mesh position={[0, floorY + 0.03, 0]} receiveShadow>
                <boxGeometry args={[size - 0.28, 0.08, size - 0.28]} />
                <meshStandardMaterial color="#171a21" roughness={0.98} />
            </mesh>
        </group>
    );
}
