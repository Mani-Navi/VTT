// src/features/dice/engine/textureGenerator.js
import * as THREE from 'three';

/**
 * تعداد اضلاعِ حاشیه‌ای که دور هر عدد رسم می‌شود، فقط برای هم‌خوانی بصری با
 * شکل واقعیِ آن وجه (مثلث برای d4/d8/d20، مربع برای d6، پنج‌ضلعی برای d12،
 * لوزی/بادبادکی برای d10 و d100).
 */
const FACE_SHAPE_SIDES = {
    d4: 3,
    d6: 4,
    d8: 3,
    d10: 4, // لوزی — با rotation=45deg در drawPolygonBorder به بادبادکی نزدیک می‌شود
    d12: 5,
    d20: 3,
    d100: 4,
};

const DEFAULT_PALETTES = {
    d4: { bg: '#1e293b', text: '#f8fafc', accent: '#38bdf8' },
    d6: { bg: '#1e3a8a', text: '#ffffff', accent: '#38bdf8' },
    d8: { bg: '#134e4a', text: '#f0fdfa', accent: '#2dd4bf' },
    d10: { bg: '#3f2d5c', text: '#f5f3ff', accent: '#a78bfa' },
    d12: { bg: '#78350f', text: '#fffbeb', accent: '#fbbf24' },
    d20: { bg: '#881337', text: '#ffffff', accent: '#f43f5e' },
    d100: { bg: '#164e63', text: '#ecfeff', accent: '#22d3ee' },
};

function drawPolygonBorder(ctx, size, sides, accentColor, rotationDeg = -90) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.42;
    const rot = (rotationDeg * Math.PI) / 180;

    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = size * 0.03;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
        const angle = rot + (i / sides) * Math.PI * 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

/**
 * بافتِ یک وجه: پس‌زمینه‌ی گرادیانی (حس «رزینِ» تاس‌های واقعی) + حاشیه‌ی
 * چندضلعیِ هم‌شکل با وجه + عدد با سایه‌ی ملایم (افکت برجسته/emboss).
 */
export function createFaceTexture(dieType, displayText, options = {}) {
    const palette = DEFAULT_PALETTES[dieType] || DEFAULT_PALETTES.d6;
    const {
        size = 256,
        bgColor = palette.bg,
        textColor = palette.text,
        accentColor = palette.accent,
        isCrit = false,
        isCritFail = false,
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // --- پس‌زمینه‌ی گرادیانی به‌جای رنگ تخت ---
    const grad = ctx.createRadialGradient(size * 0.4, size * 0.35, size * 0.05, size * 0.5, size * 0.5, size * 0.75);
    const finalBg = isCrit ? '#701a75' : isCritFail ? '#450a0a' : bgColor;
    grad.addColorStop(0, lighten(finalBg, 18));
    grad.addColorStop(1, finalBg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // --- چند ذره‌ی نور محو، برای حس رزینِ برق‌دار (اختیاری، سبک) ---
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 2 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // --- حاشیه‌ی هم‌شکل با وجه ---
    const sides = FACE_SHAPE_SIDES[dieType] || 4;
    drawPolygonBorder(ctx, size, sides, isCrit ? '#fbbf24' : isCritFail ? '#f43f5e' : accentColor);

    // --- عدد، با سایه‌ی ملایم زیرش برای افکت برجسته ---
    const fontSize = displayText.length > 2 ? size * 0.32 : sides === 3 ? size * 0.3 : size * 0.4;
    ctx.font = `bold ${fontSize}px 'Cinzel', 'Trebuchet MS', 'Arial', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // مثلث‌ها (d4/d8/d20) عدد را کمی پایین‌تر از مرکز هندسی می‌خواهند تا داخل
    // فضای بصریِ وجه بماند
    const centerY = sides === 3 ? size * 0.58 : size * 0.52;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = size * 0.03;
    ctx.shadowOffsetY = size * 0.015;
    ctx.fillStyle = isCrit ? '#fde047' : isCritFail ? '#fca5a5' : textColor;
    ctx.fillText(displayText, size * 0.5, centerY);
    ctx.restore();

    // نقطه‌ی زیر رقم آخر اگر 6 یا 9 باشد — قرارداد رایج تاس‌های فیزیکی برای
    // این‌که با چرخش ۱۸۰ درجه اشتباه گرفته نشوند
    const lastDigit = displayText[displayText.length - 1];
    if (lastDigit === '6' || lastDigit === '9') {
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(size * 0.5, centerY + fontSize * 0.42, size * 0.018, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.needsUpdate = true;
    return texture;
}

function lighten(hex, amount) {
    const c = hex.replace('#', '');
    const num = parseInt(c, 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `rgb(${r}, ${g}, ${b})`;
}

function formatValue(dieType, value) {
    if (dieType === 'd100') return value === 0 ? '00' : String(value);
    if (dieType === 'd10') return String(value); // 0..9، بدون صفرِ اضافه
    return String(value);
}

/**
 * ورودی‌اش خروجیِ diceDefinitions است: dieConfig.faces = [{normal, value}, ...]
 * (همان ترتیبی که geometry.groups با آن ساخته شده)، پس material[i] دقیقاً
 * روی face[i] می‌نشیند — نیازی به نگاشتِ دستیِ «ترتیب وجوه Box» و امثال آن،
 * که در نسخه‌ی قبلی شکننده بود، نیست.
 */
export function createDiceMaterials(dieConfig, options = {}) {
    const { dieType = dieConfig.type } = options;
    return dieConfig.faces.map(({ value }) => {
        const isCrit = dieType === 'd20' && value === 20;
        const isCritFail = dieType === 'd20' && value === 1;
        const texture = createFaceTexture(dieType, formatValue(dieType, value), {
            ...options,
            isCrit,
            isCritFail,
        });

        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.32,
            metalness: 0.15,
            flatShading: true,
        });
    });
}