// src/features/dice/engine/diceDefinitions.js
import * as THREE from 'three';

/**
 * قانون تقارن D&D:
 * در d6 مجموع وجوه متقابل = ۷ است.
 * در d20 مجموع وجوه متقابل = ۲۱ است.
 */

// ---------------- D6 Definition ----------------
export const D6_DEFINITION = {
    type: 'd6',
    radius: 1.0,
    // 6 بردار نرمال وجوه مکعب در حالت استاندارد
    faces: [
        { normal: new THREE.Vector3( 0,  1,  0), value: 6 }, // بالا
        { normal: new THREE.Vector3( 0, -1,  0), value: 1 }, // پایین (1 + 6 = 7)
        { normal: new THREE.Vector3( 1,  0,  0), value: 3 }, // راست
        { normal: new THREE.Vector3(-1,  0,  0), value: 4 }, // چپ   (3 + 4 = 7)
        { normal: new THREE.Vector3( 0,  0,  1), value: 5 }, // جلو
        { normal: new THREE.Vector3( 0,  0, -1), value: 2 }, // عقب  (5 + 2 = 7)
    ],
    createGeometry: () => new THREE.BoxGeometry(1.5, 1.5, 1.5),
};

// ---------------- D20 Definition ----------------
// تولید خودکار نرمال‌های ۲۰ وجه Icosahedron بر اساس ژئومتری استاندارد Three.js
function createD20Data() {
    const radius = 1.2;
    const geom = new THREE.IcosahedronGeometry(radius, 0); // detail = 0 -> 20 مثلث
    const pos = geom.attributes.position;
    const faces = [];

    // آرایه مقادیر D20 استاندارد چیده شده به طوری که وجوه روبرو ۲۱ بشوند
    const d20Values = [
        20, 1, 18, 4, 14, 8, 16, 6, 12, 10,
        11, 9, 15, 7, 13, 5, 17, 3, 19, 2
    ];

    for (let i = 0; i < pos.count; i += 3) {
        const vA = new THREE.Vector3().fromBufferAttribute(pos, i);
        const vB = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
        const vC = new THREE.Vector3().fromBufferAttribute(pos, i + 2);

        const cb = new THREE.Vector3().subVectors(vC, vB);
        const ab = new THREE.Vector3().subVectors(vA, vB);
        const normal = cb.cross(ab).normalize();

        const faceIndex = i / 3;
        faces.push({
            normal,
            value: d20Values[faceIndex] || (faceIndex + 1),
        });
    }

    return {
        type: 'd20',
        radius,
        faces,
        createGeometry: () => new THREE.IcosahedronGeometry(radius, 0),
    };
}

export const D20_DEFINITION = createD20Data();

export const DICE_CONFIGS = {
    d6: D6_DEFINITION,
    d20: D20_DEFINITION,
};