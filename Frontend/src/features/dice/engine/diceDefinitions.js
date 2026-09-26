// src/features/dice/engine/diceDefinitions.js
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
    extractFacesAndGroup,
    assignAntipodalValues,
    buildTrapezohedronGeometry,
    buildD4FaceValues,
} from './geometryUtils';

/**
 * قانون تقارن رسمی هر تاس D&D (وجوه روبرو):
 *   d4  -> تتراهدرون؛ قاعده‌ی «روبرو» ندارد، نتیجه از روی رأس بالا خوانده می‌شود
 *   d6  -> جمع وجوه روبرو = 7
 *   d8  -> جمع وجوه روبرو = 9
 *   d10 -> اعداد 0..9، جمع وجوه روبرو = 9
 *   d12 -> جمع وجوه روبرو = 13
 *   d20 -> جمع وجوه روبرو = 21
 *   d100 -> همان هندسه‌ی d10 با مقادیر ×10 (00, 10, ..., 90)
 *
 * readMode مشخص می‌کند در زمان اجرا نتیجه از کجا خوانده شود:
 *   'up'   -> وجهی که نرمالش بیشترین هم‌راستایی را با بردار بالا دارد
 *   'down' -> فقط d4؛ وجهی که نرمالش بیشترین هم‌راستایی را با بردار پایین دارد
 *             (یعنی همان وجهی که روی میز نشسته)، چون مقدار چاپ‌شده مال رأس
 *             روبروی همان وجه است (ر.ک. buildD4FaceValues در geometryUtils.js)
 */

function buildAntipodalDie({ type, radius, geometryFactory, pairSum, startValue = 1, collider, physics }) {
    const rawGeometry = geometryFactory();
    const { geometry, normals } = extractFacesAndGroup(rawGeometry);
    const values = assignAntipodalValues(normals, pairSum, startValue);

    return {
        type,
        radius,
        readMode: 'up',
        faces: normals.map((normal, i) => ({ normal, value: values[i] })),
        collider,
        physics,
        // هندسه‌ی گروه‌بندی‌شده همین یک‌بار ساخته و کش می‌شود؛ چون گروه‌بندی روی
        // instance ست شده، برگرداندنِ همین نمونه برای هر رول جدید کاملاً امن است
        // (فقط چرخش/موقعیتِ mesh در R3F عوض می‌شود، نه خودِ geometry).
        createGeometry: () => geometry,
    };
}

// ---------------- D4 ----------------
const D4_RADIUS = 1.3;
function buildD4() {
    const rawGeometry = new THREE.TetrahedronGeometry(D4_RADIUS, 0);
    const readValues = buildD4FaceValues(rawGeometry);
    const { geometry, normals } = extractFacesAndGroup(rawGeometry);

    return {
        type: 'd4',
        radius: D4_RADIUS,
        readMode: 'down',
        faces: normals.map((normal, i) => ({ normal, value: readValues[i] })),
        collider: 'convexHull',
        physics: {
            // d4 روی لبه گیر می‌کند بیشتر از بقیه؛ اصطکاک کمی بالاتر و restitution
            // پایین‌تر کمک می‌کند سریع‌تر و طبیعی‌تر روی یک وجه بی‌افتد
            restitution: 0.25,
            friction: 0.7,
            angularDamping: 0.4,
        },
        createGeometry: () => geometry,
    };
}
export const D4_DEFINITION = buildD4();

// ---------------- D6 ----------------
// از RoundedBoxGeometry برای ظاهرِ لبه‌ی پخ‌دار (chamfer) استفاده می‌کنیم —
// هم شبیه تاس واقعی‌ست هم فیزیکاً طبیعی‌تر می‌غلتد (لبه‌ی تیز باعث گیر کردن و
// توقف ناگهانی/غیرطبیعی می‌شود). توجه: کالایدر فیزیکی جدا و ساده (cuboid) است؛
// mesh پخ‌دار فقط بصری‌ست و بار محاسباتی فیزیک را افزایش نمی‌دهد.
const D6_HALF_EXTENT = 0.9;
export const D6_DEFINITION = buildAntipodalDie({
    type: 'd6',
    radius: D6_HALF_EXTENT,
    geometryFactory: () => new THREE.BoxGeometry(D6_HALF_EXTENT * 2, D6_HALF_EXTENT * 2, D6_HALF_EXTENT * 2),
    pairSum: 7,
    startValue: 1,
    collider: 'cuboid',
    physics: { restitution: 0.35, friction: 0.5, angularDamping: 0.3 },
});
// mesh بصریِ جدا با لبه‌ی گرد؛ در کامپوننت <Die> این را به‌جای هندسه‌ی
// createGeometry فقط برای رندر استفاده کن (گروه‌بندی/متریال همان ترتیب حفظ می‌شود
// چون از همان BoxGeometry پایه با ابعاد یکسان می‌آید).
export function createD6VisualGeometry(bevelSegments = 3, bevelRadius = 0.12) {
    return new RoundedBoxGeometry(D6_HALF_EXTENT * 2, D6_HALF_EXTENT * 2, D6_HALF_EXTENT * 2, bevelSegments, bevelRadius);
}

// ---------------- D8 ----------------
export const D8_DEFINITION = buildAntipodalDie({
    type: 'd8',
    radius: 1.15,
    geometryFactory: () => new THREE.OctahedronGeometry(1.15, 0),
    pairSum: 9,
    startValue: 1,
    collider: 'convexHull',
    physics: { restitution: 0.4, friction: 0.45, angularDamping: 0.25 },
});

// ---------------- D12 ----------------
export const D12_DEFINITION = buildAntipodalDie({
    type: 'd12',
    radius: 1.05,
    geometryFactory: () => new THREE.DodecahedronGeometry(1.05, 0),
    pairSum: 13,
    startValue: 1,
    collider: 'convexHull',
    physics: { restitution: 0.45, friction: 0.4, angularDamping: 0.2 },
});

// ---------------- D20 ----------------
export const D20_DEFINITION = buildAntipodalDie({
    type: 'd20',
    radius: 1.2,
    geometryFactory: () => new THREE.IcosahedronGeometry(1.2, 0),
    pairSum: 21,
    startValue: 1,
    collider: 'convexHull',
    // نزدیک‌ترین شکل به کره در بین همه‌ی تاس‌ها -> بیشترین restitution و
    // کمترین angularDamping، غلت طولانی‌تر و واقعی‌تری دارد
    physics: { restitution: 0.5, friction: 0.35, angularDamping: 0.15 },
});

// ---------------- D10 ----------------
const D10_RADIUS = 1.0;
function buildD10({ percentile = false } = {}) {
    const rawGeometry = buildTrapezohedronGeometry(D10_RADIUS, 0.11, 1.05);
    const { geometry, normals } = extractFacesAndGroup(rawGeometry);
    const baseValues = assignAntipodalValues(normals, 9, 0); // 0..9، جمع روبرو = 9

    return {
        type: percentile ? 'd100' : 'd10',
        radius: D10_RADIUS,
        readMode: 'up',
        isPercentile: percentile,
        faces: normals.map((normal, i) => ({
            normal,
            value: percentile ? baseValues[i] * 10 : baseValues[i],
        })),
        collider: 'convexHull',
        physics: { restitution: 0.4, friction: 0.45, angularDamping: 0.25 },
        createGeometry: () => geometry,
    };
}
export const D10_DEFINITION = buildD10({ percentile: false });
export const D100_DEFINITION = buildD10({ percentile: true });

export const DICE_CONFIGS = {
    d4: D4_DEFINITION,
    d6: D6_DEFINITION,
    d8: D8_DEFINITION,
    d10: D10_DEFINITION,
    d12: D12_DEFINITION,
    d20: D20_DEFINITION,
    d100: D100_DEFINITION,
};

/**
 * نمایش متنی مقدار هر تاس — تنها جایی که این قانون تعریف می‌شود (هم UI و هم
 * لایه‌ی بافت/تکسچر از همین‌جا می‌خوانند تا هیچ‌وقت با هم ناهم‌خوان نشوند).
 * d100 صفر را به‌صورت «00» نشان می‌دهد (قرارداد رایج تاس درصد).
 */
export function formatDieValue(dieType, value) {
    if (dieType === 'd100') return value === 0 ? '00' : String(value);
    return String(value);
}

/**
 * تشخیص نتیجه‌ی نهایی بعد از توقف کامل تاس.
 * quaternion را از rigid body فیزیک بگیر و همین تابع را صدا بزن.
 */
export function resolveDieValue(dieConfig, quaternion) {
    const worldNormal = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const targetDir = dieConfig.readMode === 'down' ? up.clone().negate() : up;

    let best = null;
    let bestDot = -Infinity;
    for (const face of dieConfig.faces) {
        worldNormal.copy(face.normal).applyQuaternion(quaternion);
        const dot = worldNormal.dot(targetDir);
        if (dot > bestDot) {
            bestDot = dot;
            best = face;
        }
    }

    // اگر حتی بهترین وجه هم به‌اندازه‌ی کافی هم‌راستا نبود (تاس روی لبه/رأس
    // نشسته)، false برگردان تا لایه‌ی فیزیک یک ضربه‌ی کوچک اصلاحی بزند
    const SETTLE_CONFIDENCE_THRESHOLD = 0.75;
    if (bestDot < SETTLE_CONFIDENCE_THRESHOLD) {
        return { resolved: false, value: null, confidence: bestDot };
    }
    return { resolved: true, value: best.value, confidence: bestDot };
}