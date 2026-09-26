import * as THREE from 'three';

/**
 * ایجاد بافت گرد یا مثلثی روی یک بوم با فونت استاندارد رومیزی
 */
export function createNumberTexture(text, options = {}) {
    const {
        size = 256,
        bgColor = '#1e293b',
        textColor = '#f8fafc',
        accentColor = '#f59e0b',
        isD20 = false,
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // پس‌زمینه پایه
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    if (isD20) {
        // خطوط محیطی حاشیه وجه برای D20
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(size * 0.5, size * 0.08);
        ctx.lineTo(size * 0.92, size * 0.88);
        ctx.lineTo(size * 0.08, size * 0.88);
        ctx.closePath();
        ctx.stroke();
    } else {
        // کادر گرد ظریف برای وجوه D6
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 8;
        ctx.strokeRect(12, 12, size - 24, size - 24);
    }

    // رسم عدد اصلی
    ctx.fillStyle = textColor;
    ctx.font = `bold ${isD20 ? 82 : 110}px 'Cinzel', 'Trebuchet MS', 'Arial', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerY = isD20 ? size * 0.58 : size * 0.5;
    ctx.fillText(String(text), size * 0.5, centerY);

    // نقطه زیر ۶ و ۹ برای جلوگیری از اشتباه در بازی D&D
    if (text === 6 || text === 9) {
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(size * 0.5, centerY + (isD20 ? 34 : 44), 6, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.needsUpdate = true;

    return texture;
}

/**
 * تولید متریال‌های ۶ وجه تاس D6
 * ترتیب وجوه Three.js Box: [+X, -X, +Y, -Y, +Z, -Z]
 */
export function createD6Materials(bgColor = '#1e3a8a') {
    // بر اساس نگاشت استاندارد diceDefinitions:
    // +X: 3, -X: 4, +Y: 6, -Y: 1, +Z: 5, -Z: 2
    const values = [3, 4, 6, 1, 5, 2];

    return values.map((val) => {
        const tex = createNumberTexture(val, {
            bgColor,
            textColor: '#ffffff',
            accentColor: '#38bdf8',
            isD20: false,
        });

        return new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.3,
            metalness: 0.1,
        });
    });
}

/**
 * تولید ۲۰ متریال مجزا برای وجوه D20
 */
export function createD20Materials(d20Values, bgColor = '#881337') {
    return d20Values.map((val) => {
        const isCrit = val === 20;
        const isCritFail = val === 1;

        const tex = createNumberTexture(val, {
            bgColor: isCrit ? '#701a75' : isCritFail ? '#450a0a' : bgColor,
            textColor: isCrit ? '#fde047' : '#ffffff',
            accentColor: isCrit ? '#fbbf24' : '#f43f5e',
            isD20: true,
        });

        return new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.35,
            metalness: 0.2,
            flatShading: true,
        });
    });
}