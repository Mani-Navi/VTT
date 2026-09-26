// src/features/dice/engine/geometryUtils.js
import * as THREE from 'three';

/**
 * چرا این فایل لازم است:
 * نسخه‌ی قبلی، مقادیر وجوه d20 را با یک آرایه‌ی ثابت (hardcoded) که به ترتیب
 * تولید مثلث‌های IcosahedronGeometry متکی بود مشخص می‌کرد. این ترتیب هیچ‌جا
 * توسط Three.js تضمین/مستند نشده، پس با تغییر نسخه‌ی کتابخانه یا تغییر جزئی
 * پیاده‌سازی داخلی‌اش، می‌تواند بی‌سروصدا خراب شود (وجوه روبرو دیگر جمعشان ۲۱
 * نمی‌شود) بدون این‌که هیچ خطایی پرتاب شود.
 *
 * راه‌حل: به‌جای فرض کردن ترتیب، وجه‌ها را از روی هندسه‌ی واقعی استخراج می‌کنیم
 * و جفت‌های روبرو را با محاسبه‌ی نرمال‌ها پیدا می‌کنیم (نزدیک‌ترین به هم‌جهت
 * مخالف). این کار برای هر solid محدب و متقارن (d6, d8, d12, d20 و حتی d10
 * سفارشی) درست کار می‌کند و به نسخه‌ی Three.js وابسته نیست.
 */

/**
 * وجوه یکتای یک BufferGeometry محدب را استخراج می‌کند و هم‌زمان geometry.groups
 * را طوری می‌سازد که materials[i] دقیقاً روی همان وجهی بنشیند که faces[i] توصیف
 * می‌کند (پیش‌نیاز لازم برای این‌که هر وجه بتواند تکسچر/عدد مخصوص خودش را داشته
 * باشد). فرض: مثلث‌های متعلق به یک وجه‌ی فیزیکی واحد، در بافر پشت‌سرهم هستند —
 * این برای هندسه‌های استاندارد Box/Tetrahedron/Octahedron/Dodecahedron/
 * Icosahedron در Three.js و برای هندسه‌ی دستی D10 که خودمان می‌سازیم برقرار است.
 */
export function extractFacesAndGroup(geometry, normalDotThreshold = 0.999) {
    const geo = geometry.index ? geometry.toNonIndexed() : geometry;
    const pos = geo.attributes.position;
    const triCount = pos.count / 3;

    const faces = []; // { normal, triStart, triCount }
    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const vC = new THREE.Vector3();

    for (let t = 0; t < triCount; t++) {
        vA.fromBufferAttribute(pos, t * 3);
        vB.fromBufferAttribute(pos, t * 3 + 1);
        vC.fromBufferAttribute(pos, t * 3 + 2);
        const normal = new THREE.Vector3()
            .subVectors(vC, vB)
            .cross(new THREE.Vector3().subVectors(vA, vB))
            .normalize();

        const current = faces[faces.length - 1];
        if (current && current.normal.dot(normal) > normalDotThreshold) {
            current.triCount += 1;
        } else {
            faces.push({ normal, triStart: t, triCount: 1 });
        }
    }

    geo.clearGroups();
    faces.forEach((f, materialIndex) => {
        geo.addGroup(f.triStart * 3, f.triCount * 3, materialIndex);
    });

    return { geometry: geo, normals: faces.map((f) => f.normal) };
}

/**
 * قانون استاندارد تاس‌های دی‌اندی: وجوه روبرو جمعشان عددی ثابت است
 * (d6:7, d8:9, d10:9 با شمارش از ۰، d12:13, d20:21).
 * این تابع به‌جای فرض ترتیب، برای هر وجه، هم‌جهت‌ترینِ مخالف را پیدا می‌کند
 * و بر همین اساس مقدار جفتش را تعیین می‌کند.
 */
export function assignAntipodalValues(normals, pairSum, startValue = 1) {
    const n = normals.length;
    const used = new Array(n).fill(false);
    const values = new Array(n).fill(null);
    let low = startValue;
    let high = pairSum - startValue;

    for (let i = 0; i < n; i++) {
        if (used[i]) continue;
        let bestJ = -1;
        let bestDot = Infinity;
        for (let j = 0; j < n; j++) {
            if (j === i || used[j]) continue;
            const d = normals[i].dot(normals[j]);
            if (d < bestDot) {
                bestDot = d;
                bestJ = j;
            }
        }
        used[i] = true;
        values[i] = low;
        if (bestJ !== -1) {
            used[bestJ] = true;
            values[bestJ] = high;
        }
        low += 1;
        high -= 1;
    }
    return values;
}

/**
 * D10 / D100 — پنتاگونال تراپزوهدرون.
 * Three.js پریمیتیو آماده برای این شکل ندارد (Platonic solid نیست).
 * ساخت: ۱۰ رأس استوایی که بین دو ارتفاع Z زیگزاگ می‌کنند + دو رأس قطبی
 * (بالا/پایین) → هر ۳ رأس متوالیِ استوا + یک قطب یک وجه بادبادکی (kite)
 * تقریباً تخت می‌سازد (انحراف از تخت‌بودن ~0.1% شعاع — از نظر بصری و فیزیکی
 * بی‌اهمیت، دقیقاً مطابق تاس‌های واقعی D10 که هم کاملاً تخت نیستند).
 *
 * نرمال هر وجه به‌صورت دستی و یکسان برای هر دو مثلثِ تشکیل‌دهنده‌ی kite
 * محاسبه و ست می‌شود (به‌جای computeVertexNormals) تا ظاهر «چندوجهیِ تیز»
 * حفظ شود، نه یک سطح صاف‌شده.
 */
export function buildTrapezohedronGeometry(radius = 1, zigzag = 0.11, apexHeight = 1.05) {
    const belt = [];
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const z = zigzag * radius * (i % 2 === 0 ? 1 : -1);
        belt.push(new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), z));
    }
    const top = new THREE.Vector3(0, 0, apexHeight * radius);
    const bottom = new THREE.Vector3(0, 0, -apexHeight * radius);

    const positions = [];
    const pushTri = (a, b, c) => {
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    };

    // ۵ وجه بادبادکی دور قطب بالا (اندیس‌های زوج به عنوان "نزدیک بالا")
    for (let i = 0; i < 10; i += 2) {
        const a = belt[i];
        const b = belt[(i + 1) % 10];
        const c = belt[(i + 2) % 10];
        pushTri(top, a, b);
        pushTri(top, b, c);
    }
    // ۵ وجه بادبادکی دور قطب پایین (اندیس‌های فرد)
    for (let i = 1; i < 10; i += 2) {
        const a = belt[i];
        const b = belt[(i + 1) % 10];
        const c = belt[(i + 2) % 10];
        pushTri(bottom, b, a);
        pushTri(bottom, c, b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const normals = [];
    const triCount = positions.length / 9;
    for (let t = 0; t < triCount; t++) {
        const base = t * 9;
        const a = new THREE.Vector3(positions[base], positions[base + 1], positions[base + 2]);
        const b = new THREE.Vector3(positions[base + 3], positions[base + 4], positions[base + 5]);
        const c = new THREE.Vector3(positions[base + 6], positions[base + 7], positions[base + 8]);
        const n = new THREE.Vector3().subVectors(c, b).cross(new THREE.Vector3().subVectors(a, b)).normalize();
        for (let v = 0; v < 3; v++) normals.push(n.x, n.y, n.z);
    }
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    // هر kite دو مثلث پشت‌سرهم دارد -> extractFacesAndGroup این‌ها را به‌درستی
    // به‌عنوان یک وجه گروه‌بندی می‌کند چون نرمالشان دقیقاً یکسان ست شده.
    return geometry;
}

/**
 * D4 با همه‌ی تاس‌های دیگر فرق دارد: عددِ نتیجه، عددِ چاپ‌شده‌ی «رأسی» است که
 * رو به بالا مانده (رأسی که به زمین نچسبیده)، نه عدد روی خودِ وجه‌ی رو به بالا.
 * برای این‌که همان منطق «پیدا کردن وجه» در بقیه‌ی تاس‌ها این‌جا هم کار کند،
 * برای هر وجه مقدار «عددی که رأس مقابلش دارد» را از پیش محاسبه و ذخیره
 * می‌کنیم؛ سپس در زمان اجرا کافی‌ست وجهی که رو به *پایین* است (یعنی روی میز
 * نشسته) را پیدا کنیم و مقدار همان وجه را بخوانیم — دقیقاً همان‌قدر ساده که
 * برای بقیه‌ی تاس‌ها «وجه‌ی رو به بالا» را پیدا می‌کردیم. این قرارداد با
 * `readMode: 'down'` در diceDefinitions.js مشخص شده.
 */
export function buildD4FaceValues(geometry) {
    const geo = geometry.index ? geometry.toNonIndexed() : geometry;
    const pos = geo.attributes.position;
    const triCount = pos.count / 3;

    const uniqueVerts = [];
    const findOrAdd = (v) => {
        let idx = uniqueVerts.findIndex((u) => u.distanceTo(v) < 1e-4);
        if (idx === -1) {
            uniqueVerts.push(v.clone());
            idx = uniqueVerts.length - 1;
        }
        return idx;
    };

    const faceVertIdx = [];
    for (let t = 0; t < triCount; t++) {
        const a = new THREE.Vector3().fromBufferAttribute(pos, t * 3);
        const b = new THREE.Vector3().fromBufferAttribute(pos, t * 3 + 1);
        const c = new THREE.Vector3().fromBufferAttribute(pos, t * 3 + 2);
        faceVertIdx.push([findOrAdd(a), findOrAdd(b), findOrAdd(c)]);
    }

    // تتراهدرون کاملاً متقارن است، پس هر شماره‌گذاری ثابتی از رأس‌ها منصفانه است
    const vertexValues = uniqueVerts.map((_, i) => i + 1);
    const allIdx = [0, 1, 2, 3];

    return faceVertIdx.map((idxs) => {
        const apexIdx = allIdx.find((vi) => !idxs.includes(vi));
        return vertexValues[apexIdx];
    });
}