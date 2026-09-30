import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { DICE_CONFIGS } from '../engine/diceDefinitions';
import { createMaterialsForType } from '../engine/textureGenerator';
import { useDiceStore } from '../state/dice.store';

const UP_VECTOR = new THREE.Vector3(0, 1, 0);
const DOWN_VECTOR = new THREE.Vector3(0, -1, 0);
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

    // تولید هندسه چندمتریاله و نگاشت دقیق UV و Materialها
    const { geometry, materials } = useMemo(() => {
        const geom = config.createGeometry();
        const faceValues = config.faces.map((f) => f.value);

        // نگاشت استاندارد ۶ وجه تاس d6
        if (type === 'd6') {
            const d6Order = [3, 4, 6, 1, 5, 2];
            const mats = createMaterialsForType('d6', d6Order);
            return { geometry: geom, materials: mats };
        }

        const faceCount = config.faces.length;
        geom.clearGroups();

        // تعیین تعداد مثلث‌های تشکیل‌دهنده هر وجه
        const trianglesPerFace =
            type === 'd10' || type === 'd100' ? 2 : type === 'd12' ? 3 : 1;

        for (let i = 0; i < faceCount; i++) {
            geom.addGroup(i * trianglesPerFace * 3, trianglesPerFace * 3, i);
        }

        // اگر ژئومتری از قبل مختصات UV نداشت، نگاشت مثلثی اعمال شود
        if (!geom.attributes.uv) {
            const uvs = [];
            for (let i = 0; i < faceCount; i++) {
                for (let t = 0; t < trianglesPerFace; t++) {
                    uvs.push(0.5, 0.95, 0.05, 0.05, 0.95, 0.05);
                }
            }
            geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        }

        geom.computeVertexNormals();

        const mats = createMaterialsForType(type, faceValues);
        return { geometry: geom, materials: mats };
    }, [type, config]);

    // الگوریتم قطعی استخراج عدد وجه برنده پس از سکون
    const calculateTopValue = () => {
        if (!rigidBodyRef.current || isSettledRef.current) return;
        const rotation = rigidBodyRef.current.rotation();
        const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);

        // در D4 چون روی قاعده می‌خوابد، وجه روی زمین برنده است؛ در سایر تاس‌ها وجه رو به آسمان
        const targetVector = type === 'd4' ? DOWN_VECTOR : UP_VECTOR;

        let maxDot = -Infinity;
        let winningValue = null;

        for (const face of config.faces) {
            const worldNormal = face.normal.clone().applyQuaternion(quat);
            const dot = worldNormal.dot(targetVector);

            if (dot > maxDot) {
                maxDot = dot;
                winningValue = face.value;
            }
        }

        // حالت تاس کج/ایستاده روی لبه (Cocked Die): اعمال ریزضربه اصلاحی
        if (maxDot < 0.6) {
            rigidBodyRef.current.applyImpulse({ x: 0.15, y: 0.6, z: 0.15 }, true);
            rigidBodyRef.current.applyTorqueImpulse({ x: 0.3, y: 0.3, z: 0.3 }, true);
            stableFrameCounter.current = 0;
            return;
        }

        isSettledRef.current = true;
        setDieResult(id, winningValue);
    };

    // حلقه مانیتورینگ سرعت و سکون فیزیکی در هر فریم
    useFrame(() => {
        if (isSettledRef.current || !rigidBodyRef.current) return;

        // جلوگیری از تشخیص اشتباه در ثانیه اول پرتاب
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

        // تایم‌اوت اضطراری در صورت نوسان‌های نامحسوس
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
            restitution={0.46} // کشسانی طبیعی برای پرش روی نمد
            friction={0.5}     // اصطکاک استاندارد رزین
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