// src/features/dice/components/Die.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { DICE_CONFIGS, resolveDieValue, createD6VisualGeometry } from '../engine/diceDefinitions';
import { createDiceMaterials } from '../engine/textureGenerator';
import { useDiceStore } from '../state/dice.store';

const VELOCITY_THRESHOLD = 0.08;
const ANGULAR_THRESHOLD = 0.12;
const REQUIRED_STABLE_FRAMES = 25;
const SPAWN_GRACE_MS = 900; // در این بازه بعد از اسپان، هیچ‌وقت نتیجه ثبت نمی‌شود
const TIMEOUT_MS = 5500; // سقف اضطراری اگر فیزیک هیچ‌وقت کامل نایستد

// نگاشتِ نوعِ کالایدرِ منطقی (diceDefinitions.js) به نامی که پراپ
// `colliders` کتابخانه‌ی @react-three/rapier می‌شناسد
const COLLIDER_MAP = {
    cuboid: 'cuboid',
    convexHull: 'hull',
};

export function Die({
                        id,
                        type,
                        initialPos,
                        initialRotation,
                        initialLinearVelocity,
                        initialAngularVelocity,
                    }) {
    const rigidBodyRef = useRef(null);
    const config = DICE_CONFIGS[type] || DICE_CONFIGS.d20;
    const setDieResult = useDiceStore((s) => s.setDieResult);

    const stableFrameCounter = useRef(0);
    const isSettledRef = useRef(false);
    const spawnTimeRef = useRef(Date.now());

    // هندسه‌ی «منطقی» (همانی که face-values و geometry.groups رویش سوار شده)
    // همیشه از diceDefinitions می‌آید -- برای هر ۷ نوع تاس یکسان، بدون
    // if/else دستی مثل نسخه‌ی قبلی که فقط d20 و d6 را می‌شناخت.
    // فقط d6 یک mesh بصریِ جداگانه‌ی لبه‌گرد دارد (صرفاً ظاهری)؛ کالایدر
    // فیزیکی همچنان از همان config.collider ('cuboid' برای d6) استفاده می‌کند
    // پس دقت فیزیک تحت تأثیر قرار نمی‌گیرد.
    const { visualGeometry, materials } = useMemo(() => {
        const logicalGeometry = config.createGeometry();
        const mats = createDiceMaterials(config);
        const visual = type === 'd6' ? createD6VisualGeometry() : logicalGeometry;
        return { visualGeometry: visual, materials: mats };
    }, [config, type]);

    const resolveAndMaybeCorrect = () => {
        if (!rigidBodyRef.current || isSettledRef.current) return;

        const rotation = rigidBodyRef.current.rotation();
        const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
        const { resolved, value } = resolveDieValue(config, quat);

        if (!resolved) {
            // حالت لبه/رأس (Cocked Die): نه UP و نه DOWN به‌اندازه‌ی کافی
            // واضح نیست -> یک ریزضربه‌ی فیزیکی تا از حالت ناپایدار خارج شود
            rigidBodyRef.current.applyImpulse({ x: 0.15, y: 0.6, z: 0.15 }, true);
            rigidBodyRef.current.applyTorqueImpulse({ x: 0.3, y: 0.3, z: 0.3 }, true);
            stableFrameCounter.current = 0;
            return;
        }

        isSettledRef.current = true;
        setDieResult(id, value);
    };

    useFrame(() => {
        if (isSettledRef.current || !rigidBodyRef.current) return;

        const elapsed = Date.now() - spawnTimeRef.current;
        if (elapsed < SPAWN_GRACE_MS) return;

        const linvel = rigidBodyRef.current.linvel();
        const angvel = rigidBodyRef.current.angvel();
        const speed = Math.hypot(linvel.x, linvel.y, linvel.z);
        const rotSpeed = Math.hypot(angvel.x, angvel.y, angvel.z);

        if (speed < VELOCITY_THRESHOLD && rotSpeed < ANGULAR_THRESHOLD) {
            stableFrameCounter.current += 1;
            if (stableFrameCounter.current >= REQUIRED_STABLE_FRAMES) {
                resolveAndMaybeCorrect();
            }
        } else {
            stableFrameCounter.current = 0;
        }

        if (elapsed > TIMEOUT_MS) {
            resolveAndMaybeCorrect();
        }
    });

    // هر نوع تاس مقادیر فیزیکیِ مخصوص خودش را از diceDefinitions می‌گیرد
    // (مثلاً d4 اصطکاک بالاتر/کشسانیِ کمتر چون راحت روی لبه گیر می‌کند،
    // d20 نزدیک‌ترین به کره است پس بیشترین کشسانی و کمترین میرایی را دارد)
    const { restitution, friction, angularDamping } = config.physics;

    return (
        <RigidBody
            ref={rigidBodyRef}
            colliders={COLLIDER_MAP[config.collider] || 'hull'}
            position={initialPos}
            rotation={initialRotation}
            linearVelocity={initialLinearVelocity}
            angularVelocity={initialAngularVelocity}
            restitution={restitution}
            friction={friction}
            angularDamping={angularDamping}
            linearDamping={0.05}
        >
            <mesh geometry={visualGeometry} material={materials} castShadow receiveShadow />
        </RigidBody>
    );
}