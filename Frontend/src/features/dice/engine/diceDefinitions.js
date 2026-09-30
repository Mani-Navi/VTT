import * as THREE from 'three';

function applyPlanarUVs(geom, faces, trianglesPerFace, faceRadius) {
    const pos = geom.attributes.position;
    const uvs = [];
    geom.clearGroups();

    for (let f = 0; f < faces.length; f++) {
        const normal = faces[f].normal;

        let upRef = new THREE.Vector3(0, 1, 0);
        if (Math.abs(normal.dot(upRef)) > 0.88) {
            upRef.set(0, 0, 1);
        }
        const tangent = new THREE.Vector3().crossVectors(upRef, normal).normalize();
        const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

        const faceCenter = new THREE.Vector3();
        const startIndex = f * trianglesPerFace * 3;
        const totalVerts = trianglesPerFace * 3;

        for (let v = 0; v < totalVerts; v++) {
            faceCenter.add(new THREE.Vector3().fromBufferAttribute(pos, startIndex + v));
        }
        faceCenter.divideScalar(totalVerts);

        for (let v = 0; v < totalVerts; v++) {
            const vert = new THREE.Vector3().fromBufferAttribute(pos, startIndex + v);
            const diff = new THREE.Vector3().subVectors(vert, faceCenter);

            const u = 0.5 + (diff.dot(tangent) / (faceRadius * 2));
            const vCoord = 0.5 + (diff.dot(bitangent) / (faceRadius * 2));
            uvs.push(u, vCoord);
        }

        geom.addGroup(startIndex, totalVerts, f);
    }

    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.computeVertexNormals();
}

// ---------------- D4 (20mm / 4 Faces) ----------------
function createD4Data() {
    const radius = 1.35;
    const geom = new THREE.TetrahedronGeometry(radius, 0).toNonIndexed();
    const pos = geom.attributes.position;
    const faces = [];
    const values = [1, 2, 3, 4];

    for (let i = 0; i < 4; i++) {
        const vA = new THREE.Vector3().fromBufferAttribute(pos, i * 3);
        const vB = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 1);
        const vC = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 2);
        const normal = new THREE.Vector3().subVectors(vC, vB).cross(new THREE.Vector3().subVectors(vA, vB)).normalize();
        faces.push({ normal, value: values[i] });
    }

    applyPlanarUVs(geom, faces, 1, radius * 1.05);
    return { type: 'd4', radius, faces, createGeometry: () => geom.clone() };
}

// ---------------- D6 (16mm / 6 Faces) ----------------
export const D6_DEFINITION = {
    type: 'd6',
    radius: 1.0,
    faces: [
        { normal: new THREE.Vector3( 0,  1,  0), value: 6 },
        { normal: new THREE.Vector3( 0, -1,  0), value: 1 },
        { normal: new THREE.Vector3( 1,  0,  0), value: 3 },
        { normal: new THREE.Vector3(-1,  0,  0), value: 4 },
        { normal: new THREE.Vector3( 0,  0,  1), value: 5 },
        { normal: new THREE.Vector3( 0,  0, -1), value: 2 },
    ],
    createGeometry: () => new THREE.BoxGeometry(1.4, 1.4, 1.4),
};

// ---------------- D8 (20mm / 8 Faces) ----------------
function createD8Data() {
    const radius = 1.35;
    const geom = new THREE.OctahedronGeometry(radius, 0).toNonIndexed();
    const pos = geom.attributes.position;
    const faces = [];
    const d8Values = [1, 8, 2, 7, 3, 6, 4, 5];

    for (let i = 0; i < 8; i++) {
        const vA = new THREE.Vector3().fromBufferAttribute(pos, i * 3);
        const vB = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 1);
        const vC = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 2);
        const normal = new THREE.Vector3().subVectors(vC, vB).cross(new THREE.Vector3().subVectors(vA, vB)).normalize();
        faces.push({ normal, value: d8Values[i] });
    }

    applyPlanarUVs(geom, faces, 1, radius * 1.05);
    return { type: 'd8', radius, faces, createGeometry: () => geom.clone() };
}

// ---------------- D10 & D100 (100% Flat-Faced Planar Pentagonal Trapezohedron) ----------------
function createD10GeometryData(isPercentile = false) {
    // ابعاد استاندارد بر اساس بلوپرینت ۲۰ میلی‌متری
    const H = 1.30;    // ارتفاع قطب‌ها
    const R = 1.25;    // شعاع بیرونی استوا

    // فرمول طلایی مسطح‌سازی کایت‌ها: (1 - cos36) / (1 + cos36) = 0.1055728
    // این نسبت تضمین می‌کند دو مثلث هر کایت زاویه 0 درجه با هم دارند و کاملاً تخت هستند
    const h = H * 0.105572809; // دقیقاً 0.13724

    const topPole = new THREE.Vector3(0, H, 0);
    const bottomPole = new THREE.Vector3(0, -H, 0);

    // ۱۰ راس زیگزاگی استوا با زاویه ۳۶ درجه
    const ring = [];
    for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5;
        const y = i % 2 === 0 ? h : -h;
        ring.push(new THREE.Vector3(Math.cos(angle) * R, y, Math.sin(angle) * R));
    }

    const positions = [];
    const uvs = [];
    const faces = [];

    // چینش اعداد استاندارد D&D
    const upperValues = isPercentile ? [0, 20, 40, 60, 80] : [0, 2, 4, 6, 8];
    const lowerValues = isPercentile ? [90, 70, 50, 30, 10] : [9, 7, 5, 3, 1];

    function addFlatKite(pApex, pWaistRight, pOppositeTip, pWaistLeft, faceValue) {
        const center = new THREE.Vector3()
            .add(pApex)
            .add(pOppositeTip)
            .add(pWaistRight)
            .add(pWaistLeft)
            .multiplyScalar(0.25);

        // محاسبه بردار عمود سطح کایت مسطح
        const diagLong = new THREE.Vector3().subVectors(pOppositeTip, pApex);
        const diagWaist = new THREE.Vector3().subVectors(pWaistLeft, pWaistRight);
        let normal = new THREE.Vector3().crossVectors(diagLong, diagWaist).normalize();
        if (normal.dot(center) < 0) {
            normal.negate();
        }
        faces.push({ normal, value: faceValue });

        // محورهای دوبعدی UV دقیقاً تراز با قطر طولی
        const upUV = new THREE.Vector3().subVectors(pApex, center).normalize();
        const rightUV = new THREE.Vector3().crossVectors(upUV, normal).normalize();

        const scale = 2.05;
        function getUV(pt) {
            const d = new THREE.Vector3().subVectors(pt, center);
            return [0.5 + d.dot(rightUV) / scale, 0.5 + d.dot(upUV) / scale];
        }

        const uvApex = getUV(pApex);
        const uvTip = getUV(pOppositeTip);
        const uvR = getUV(pWaistRight);
        const uvL = getUV(pWaistLeft);

        // دو مثلث تشکیل دهنده کایت که حالا به دلیل فرمول طلایی، ۱۰۰٪ در یک صفحه مسطح قرار دارند
        // مثلث اول
        positions.push(...pApex.toArray(), ...pWaistLeft.toArray(), ...pOppositeTip.toArray());
        uvs.push(...uvApex, ...uvL, ...uvTip);

        // مثلث دوم
        positions.push(...pApex.toArray(), ...pOppositeTip.toArray(), ...pWaistRight.toArray());
        uvs.push(...uvApex, ...uvTip, ...uvR);
    }

    // ۱. ساخت ۵ کایت بالایی (نوک بالا = topPole)
    for (let i = 0; i < 5; i++) {
        const pApex = topPole;
        const pBottomTip = ring[(i * 2 + 1) % 10]; // راس پایین در -h
        const pWaistRight = ring[i * 2];            // راس راست در +h
        const pWaistLeft = ring[(i * 2 + 2) % 10];  // راس چپ در +h
        addFlatKite(pApex, pWaistRight, pBottomTip, pWaistLeft, upperValues[i]);
    }

    // ۲. ساخت ۵ کایت پایینی (نوک پایین = bottomPole)
    for (let i = 0; i < 5; i++) {
        const pApex = bottomPole;
        const pTopTip = ring[(i * 2 + 2) % 10];     // راس بالا در +h
        const pWaistRight = ring[(i * 2 + 3) % 10]; // راس راست در -h
        const pWaistLeft = ring[(i * 2 + 1) % 10];  // راس چپ در -h
        addFlatKite(pApex, pWaistRight, pTopTip, pWaistLeft, lowerValues[i]);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.clearGroups();

    for (let f = 0; f < 10; f++) {
        geom.addGroup(f * 6, 6, f);
    }
    geom.computeVertexNormals();

    return {
        type: isPercentile ? 'd100' : 'd10',
        radius: R,
        faces,
        createGeometry: () => geom.clone(),
    };
}

// ---------------- D12 (22mm / Dodecahedron) ----------------
function createD12Data() {
    const radius = 1.35;
    const geom = new THREE.DodecahedronGeometry(radius, 0).toNonIndexed();
    const pos = geom.attributes.position;
    const faces = [];
    const d12Values = [1, 12, 2, 11, 3, 10, 4, 9, 5, 8, 6, 7];

    for (let i = 0; i < 12; i++) {
        const vA = new THREE.Vector3().fromBufferAttribute(pos, i * 9);
        const vB = new THREE.Vector3().fromBufferAttribute(pos, i * 9 + 1);
        const vC = new THREE.Vector3().fromBufferAttribute(pos, i * 9 + 2);
        const normal = new THREE.Vector3().subVectors(vC, vB).cross(new THREE.Vector3().subVectors(vA, vB)).normalize();
        faces.push({ normal, value: d12Values[i] });
    }

    applyPlanarUVs(geom, faces, 3, radius * 0.95);
    return { type: 'd12', radius, faces, createGeometry: () => geom.clone() };
}

// ---------------- D20 (20mm / Icosahedron) ----------------
function createD20Data() {
    const radius = 1.3;
    const geom = new THREE.IcosahedronGeometry(radius, 0).toNonIndexed();
    const pos = geom.attributes.position;
    const faces = [];
    const d20Values = [
        20, 1, 18, 4, 14, 8, 16, 6, 12, 10,
        11, 9, 15, 7, 13, 5, 17, 3, 19, 2
    ];

    for (let i = 0; i < 20; i++) {
        const vA = new THREE.Vector3().fromBufferAttribute(pos, i * 3);
        const vB = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 1);
        const vC = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 2);
        const normal = new THREE.Vector3().subVectors(vC, vB).cross(new THREE.Vector3().subVectors(vA, vB)).normalize();
        faces.push({ normal, value: d20Values[i] });
    }

    applyPlanarUVs(geom, faces, 1, radius * 0.9);
    return { type: 'd20', radius, faces, createGeometry: () => geom.clone() };
}

export const DICE_CONFIGS = {
    d4: createD4Data(),
    d6: D6_DEFINITION,
    d8: createD8Data(),
    d10: createD10GeometryData(false),
    d100: createD10GeometryData(true), // عیناً همان ژئومتری d10 با ارقام ده‌گان
    d12: createD12Data(),
    d20: createD20Data(),
};