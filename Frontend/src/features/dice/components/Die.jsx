// src/features/dice/components/Die.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { DICE_CONFIGS } from '../engine/diceDefinitions';
import { createD6Materials, createD20Materials } from '../engine/textureGenerator';
import { useDiceStore } from '../state/dice.store';

const UP_VECTOR = new THREE.Vector3(0, 1, 0);
const VELOCITY_THRESHOLD = 0.08;
const ANGULAR_THRESHOLD = 0.12;
const REQUIRED_STABLE_FRAMES = 25;

export function Die({
                        id,
                        type,
                        initialPos,
                        initialRotation,
                        initialLinearVelocity,
                        initialAngularVelocity,
                    }) {
    const rigidBodyRef = useRef(null);
    const config = DICE_CONFIGS[type] || DICE_CONFIGS.d6;
    const setDieResult = useDiceStore((s) => s.setDieResult);

    const stableFrameCounter = useRef(0);
    const isSettledRef = useRef(false);
    const spawnTimeRef = useRef(Date.now());

    const { geometry, materials } = useMemo(() => {
        if (type === 'd20') {
            const geom = new THREE.IcosahedronGeometry(config.radius, 0).toNonIndexed();
            geom.clearGroups();

            const uvs = [];
            for (let i = 0; i < 20; i++) {
                geom.addGroup(i * 3, 3, i);
                uvs.push(
                    0.5, 0.95,
                    0.05, 0.05,
                    0.95, 0.05
                );
            }
            geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            geom.computeVertexNormals();

            const mats = createD20Materials(config.faces.map((f) => f.value));
            return { geometry: geom, materials: mats };
        }

        const geom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const mats = createD6Materials();
        return { geometry: geom, materials: mats };
    }, [type, config]);

    const calculateTopValue = () => {
        if (!rigidBodyRef.current || isSettledRef.current) return;
        const rotation = rigidBodyRef.current.rotation();
        const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);

        let maxDot = -Infinity;
        let winningValue = null;

        for (const face of config.faces) {
            const worldNormal = face.normal.clone().applyQuaternion(quat);
            const dot = worldNormal.dot(UP_VECTOR);

            if (dot > maxDot) {
                maxDot = dot;
                winningValue = face.value;
            }
        }

        // رفع حالت لبه (Cocked Die) با ریزضربه فیزیکی
        if (maxDot < 0.62) {
            rigidBodyRef.current.applyImpulse({ x: 0.15, y: 0.6, z: 0.15 }, true);
            rigidBodyRef.current.applyTorqueImpulse({ x: 0.3, y: 0.3, z: 0.3 }, true);
            stableFrameCounter.current = 0;
            return;
        }

        isSettledRef.current = true;
        setDieResult(id, winningValue);
    };

    useFrame(() => {
        if (isSettledRef.current || !rigidBodyRef.current) return;

        // جلوگیری از ثبت نتیجه در ۱ ثانیه اول پرتاب
        if (Date.now() - spawnTimeRef.current < 900) return;

        const linvel = rigidBodyRef.current.linvel();
        const angvel = rigidBodyRef.current.angvel();

        const speed = Math.hypot(linvel.x, linvel.y, linvel.z);
        const rotSpeed = Math.hypot(angvel.x, angvel.y, angvel.z);

        if (speed < VELOCITY_THRESHOLD && rotSpeed < ANGULAR_THRESHOLD) {
            stableFrameCounter.current += 1;
            if (stableFrameCounter.current >= REQUIRED_STABLE_FRAMES) {
                calculateTopValue();
            }
        } else {
            stableFrameCounter.current = 0;
        }

        // تایم‌اوت اضطراری در ثانیه ۵.۵
        if (Date.now() - spawnTimeRef.current > 5500) {
            calculateTopValue();
        }
    });

    return (
        <RigidBody
            ref={rigidBodyRef}
            colliders="hull"
            position={initialPos}
            rotation={initialRotation}
            linearVelocity={initialLinearVelocity}
            angularVelocity={initialAngularVelocity}
            restitution={0.5}
            friction={0.4}
            linearDamping={0.08}
            angularDamping={0.12}
        >
            <mesh
                geometry={geometry}
                material={materials}
                castShadow
                receiveShadow
            />
        </RigidBody>
    );
}