// src/features/dice/components/Die.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { DICE_CONFIGS } from '../engine/diceDefinitions';
import { createMaterialsForType } from '../engine/textureGenerator';
import { useDiceStore } from '../state/dice.store';
import { diceAudio } from '../engine/diceAudio';

const UP_VECTOR = new THREE.Vector3(0, 1, 0);
const DOWN_VECTOR = new THREE.Vector3(0, -1, 0);
const VELOCITY_THRESHOLD = 0.08;
const ANGULAR_THRESHOLD = 0.12;
const REQUIRED_STABLE_FRAMES = 25;

// صفحه مجازی ارتفاع هنگام نگه‌داشتن تاس در هوا
const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -3.2);

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

    // وضعیت درگ سه‌بعدی
    const isDraggingRef = useRef(false);
    const dragHistoryRef = useRef([]); // ذخیره موقعیت‌های اخیر برای محاسبه شتاب پرتاب

    // تولید هندسه چندمتریاله و نگاشت دقیق UV و Materialها
    const { geometry, materials } = useMemo(() => {
        const geom = config.createGeometry();
        const faceValues = config.faces.map((f) => f.value);

        if (type === 'd6') {
            const d6Order = [3, 4, 6, 1, 5, 2];
            const mats = createMaterialsForType('d6', d6Order);
            return { geometry: geom, materials: mats };
        }

        const faceCount = config.faces.length;
        geom.clearGroups();

        const trianglesPerFace =
            type === 'd10' || type === 'd100' ? 2 : type === 'd12' ? 3 : 1;

        for (let i = 0; i < faceCount; i++) {
            geom.addGroup(i * trianglesPerFace * 3, trianglesPerFace * 3, i);
        }

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

    const handleCollision = () => {
        if (!rigidBodyRef.current || isDraggingRef.current) return;
        const linvel = rigidBodyRef.current.linvel();
        const speed = Math.hypot(linvel.x, linvel.y, linvel.z);

        if (speed > 0.8) {
            const intensity = Math.min(speed / 16, 1.0);
            diceAudio.playImpact(intensity);
        }
    };

    // محاسبه وجه برنده پس از توقف
    const calculateTopValue = () => {
        if (!rigidBodyRef.current || isSettledRef.current || isDraggingRef.current) return;
        const rotation = rigidBodyRef.current.rotation();
        const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);

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

        if (maxDot < 0.6) {
            rigidBodyRef.current.applyImpulse({ x: 0.15, y: 0.6, z: 0.15 }, true);
            rigidBodyRef.current.applyTorqueImpulse({ x: 0.3, y: 0.3, z: 0.3 }, true);
            stableFrameCounter.current = 0;
            return;
        }

        isSettledRef.current = true;
        setDieResult(id, winningValue);
    };

    // حلقه فیزیک و سکون
    useFrame(() => {
        if (isDraggingRef.current || isSettledRef.current || !rigidBodyRef.current) return;

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

        if (Date.now() - spawnTimeRef.current > 5500) {
            calculateTopValue();
        }
    });

    // ۱. گرفتن تاس با ماوس (برداشتن از زمین)
    const handlePointerDown = (e) => {
        e.stopPropagation();
        e.target.setPointerCapture(e.pointerId);

        isDraggingRef.current = true;
        isSettledRef.current = true; // جلوگیری از خواندن عدد حین جابجایی
        dragHistoryRef.current = [];

        document.body.style.cursor = 'grabbing';

        if (rigidBodyRef.current) {
            rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
    };

    // ۲. حرکت دادن تاس در هوا به دنبال ماوس
    const handlePointerMove = (e) => {
        if (!isDraggingRef.current || !rigidBodyRef.current) return;
        e.stopPropagation();

        const targetPoint = new THREE.Vector3();
        if (e.ray && e.ray.intersectPlane(DRAG_PLANE, targetPoint)) {
            // نگه داشتن تاس در ارتفاع ۳.۲ واحدی
            rigidBodyRef.current.setTranslation(
                { x: targetPoint.x, y: 3.2, z: targetPoint.z },
                true
            );

            // ثبت تاریخچه برای محاسبه بردار شتاب پرتاب دست بازیکن
            const now = performance.now();
            dragHistoryRef.current.push({ x: targetPoint.x, z: targetPoint.z, time: now });
            if (dragHistoryRef.current.length > 5) {
                dragHistoryRef.current.shift();
            }
        }
    };

    // ۳. رها کردن یا شوت کردن تاس
    const handlePointerUp = (e) => {
        if (!isDraggingRef.current || !rigidBodyRef.current) return;
        e.stopPropagation();
        e.target.releasePointerCapture(e.pointerId);

        isDraggingRef.current = false;
        document.body.style.cursor = 'default';

        // محاسبه سرعت و جهت پرتاب دست بازیکن
        let vx = (Math.random() - 0.5) * 4;
        let vz = (Math.random() - 0.5) * 4;

        const history = dragHistoryRef.current;
        if (history.length >= 2) {
            const first = history[0];
            const last = history[history.length - 1];
            const dt = Math.max(16, last.time - first.time) / 1000;

            const calcVx = (last.x - first.x) / dt;
            const calcVz = (last.z - first.z) / dt;

            // اعمال ضریب شتاب با سقف مجاز
            vx = THREE.MathUtils.clamp(calcVx * 0.85, -28, 28);
            vz = THREE.MathUtils.clamp(calcVz * 0.85, -28, 28);
        }

        // سرعت رو به پایین و جلو
        const vy = -4 - Math.random() * 4;

        rigidBodyRef.current.setLinvel({ x: vx, y: vy, z: vz }, true);

        // چرخش و غلتش پرقدرت حین پرتاب مجدد
        rigidBodyRef.current.setAngvel(
            {
                x: (Math.random() - 0.5) * 45,
                y: (Math.random() - 0.5) * 45,
                z: (Math.random() - 0.5) * 45,
            },
            true
        );

        // صدای پرتاب مجدد
        diceAudio.playThrow(1);

        // ریست وضعیت برای محاسبه نتیجه جدید
        spawnTimeRef.current = Date.now();
        stableFrameCounter.current = 0;
        isSettledRef.current = false;
    };

    return (
        <RigidBody
            ref={rigidBodyRef}
            colliders="hull"
            position={initialPos}
            rotation={initialRotation}
            linearVelocity={initialLinearVelocity}
            angularVelocity={initialAngularVelocity}
            restitution={0.46}
            friction={0.5}
            linearDamping={0.08}
            angularDamping={0.12}
            onCollisionEnter={handleCollision}
        >
            <mesh
                geometry={geometry}
                material={materials}
                castShadow
                receiveShadow
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerOver={() => {
                    if (!isDraggingRef.current) document.body.style.cursor = 'grab';
                }}
                onPointerOut={() => {
                    if (!isDraggingRef.current) document.body.style.cursor = 'default';
                }}
            />
        </RigidBody>
    );
}