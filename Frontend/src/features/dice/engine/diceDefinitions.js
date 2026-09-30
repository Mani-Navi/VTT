import * as THREE from 'three';

/**
 * متد جادویی پروجکشن UV:
 * هر وجه ۳بعدی را به صفحه ۲بعدی با مرکزیت (0.5, 0.5) مپ می‌کند تا عدد دقیقاً وسط وجه چاپ شود.
 */
function applyPlanarUVs(geom, faces, trianglesPerFace, faceRadius) {
    const pos = geom.attributes.position;
    const uvs = [];
    geom.clearGroups();

    for (let f = 0; f < faces.length; f++) {
        const normal = faces[f].normal;

        // تعریف بردار Up محلی برای حفظ جهت عمودی اعداد
        let upRef = new THREE.Vector3(0, 1, 0);
        if (Math.abs(normal.dot(upRef)) > 0.9) {
            upRef.set(0, 0, 1);
        }
        const tangent = new THREE.Vector3().crossVectors(upRef, normal).normalize();
        const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

        // محاسبه مرکز وجه
        const faceCenter = new THREE.Vector3();
        const startIndex = f * trianglesPerFace * 3;
        const totalVerts = trianglesPerFace * 3;

        for (let v = 0; v < totalVerts; v++) {
            faceCenter.add(new THREE.Vector3().fromBufferAttribute(pos, startIndex + v));
        }
        faceCenter.divideScalar(totalVerts);

        // نگاشت مختصات UV برای هر راس به مرکز (0.5, 0.5)
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

// ---------------- D4 (Tetrahedron) ----------------
function createD4Data() {
    const radius = 1.4;
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

    applyPlanarUVs(geom, faces, 1, radius * 1.1);
    return { type: 'd4', radius, faces, createGeometry: () => geom.clone() };
}

// ---------------- D6 (Box) ----------------
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
    createGeometry: () => new THREE.BoxGeometry(1.5, 1.5, 1.5),
};

// ---------------- D8 (Octahedron) ----------------
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

    applyPlanarUVs(geom, faces, 1, radius * 1.1);
    return { type: 'd8', radius, faces, createGeometry: () => geom.clone() };
}

// ---------------- D10 & D100 (Pentagonal Trapezohedron) ----------------
function createD10GeometryData(isPercentile = false) {
    const H = 1.32;
    const R = 1.22;
    const h = 0.32;

    const topPole = new THREE.Vector3(0, H, 0);
    const bottomPole = new THREE.Vector3(0, -H, 0);
    const upperRing = [];
    const lowerRing = [];

    for (let i = 0; i < 5; i++) {
        const aUp = (i * 2 * Math.PI) / 5;
        upperRing.push(new THREE.Vector3(Math.cos(aUp) * R, h, Math.sin(aUp) * R));
        const aLow = aUp + Math.PI / 5;
        lowerRing.push(new THREE.Vector3(Math.cos(aLow) * R, -h, Math.sin(aLow) * R));
    }

    const positions = [];
    const faces = [];
    const upperValues = isPercentile ? [60, 40, 80, 0, 20] : [6, 4, 8, 0, 2];
    const lowerValues = isPercentile ? [30, 50, 10, 90, 70] : [3, 5, 1, 9, 7];

    for (let i = 0; i < 5; i++) {
        const U_curr = upperRing[i];
        const L_curr = lowerRing[i];
        const U_next = upperRing[(i + 1) % 5];
        const normal = new THREE.Vector3().subVectors(L_curr, topPole).cross(new THREE.Vector3().subVectors(U_next, U_curr)).normalize();
        faces.push({ normal, value: upperValues[i] });

        positions.push(...topPole.toArray(), ...U_next.toArray(), ...L_curr.toArray());
        positions.push(...topPole.toArray(), ...L_curr.toArray(), ...U_curr.toArray());
    }

    for (let i = 0; i < 5; i++) {
        const L_curr = lowerRing[i];
        const U_next = upperRing[(i + 1) % 5];
        const L_next = lowerRing[(i + 1) % 5];
        const normal = new THREE.Vector3().subVectors(L_next, L_curr).cross(new THREE.Vector3().subVectors(U_next, bottomPole)).normalize();
        faces.push({ normal, value: lowerValues[i] });

        positions.push(...bottomPole.toArray(), ...L_next.toArray(), ...U_next.toArray());
        positions.push(...bottomPole.toArray(), ...U_next.toArray(), ...L_curr.toArray());
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    applyPlanarUVs(geom, faces, 2, R * 1.3);

    return { type: isPercentile ? 'd100' : 'd10', radius: R, faces, createGeometry: () => geom.clone() };
}

// ---------------- D12 (Dodecahedron - 12 Pentagons) ----------------
function createD12Data() {
    const radius = 1.3;
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

// ---------------- D20 (Icosahedron - 20 Triangles) ----------------
function createD20Data() {
    const radius = 1.25;
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

    applyPlanarUVs(geom, faces, 1, radius * 0.85);
    return { type: 'd20', radius, faces, createGeometry: () => geom.clone() };
}

export const DICE_CONFIGS = {
    d4: createD4Data(),
    d6: D6_DEFINITION,
    d8: createD8Data(),
    d10: createD10GeometryData(false),
    d100: createD10GeometryData(true),
    d12: createD12Data(),
    d20: createD20Data(),
};