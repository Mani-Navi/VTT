import * as THREE from 'three';

/**
 * تولید متریال لوکس مرمر بنفش امپریال با کادر فرورفته و طلای آنتیک
 * منطبق بر شیت مرجع D&D
 */
export function createAmethystMarbleTexture(text, type = 'd20', size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // ۱. پس‌زمینه مرمر ارغوانی تیره و اشرافی
    const bgGrad = ctx.createRadialGradient(
        size * 0.45, size * 0.4, size * 0.05,
        size * 0.5, size * 0.5, size * 0.72
    );
    bgGrad.addColorStop(0, '#361754');
    bgGrad.addColorStop(0.5, '#220e38');
    bgGrad.addColorStop(1, '#130720');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // ۲. رگه‌های ابری طبیعی سنگ مرمر (Veining)
    ctx.save();
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.filter = 'blur(10px)';

    // رگه‌های بنفش و یاسی
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.beginPath();
    ctx.moveTo(size * 0.15, size * 0.15);
    ctx.bezierCurveTo(size * 0.45, size * 0.25, size * 0.55, size * 0.75, size * 0.85, size * 0.85);
    ctx.stroke();

    // رگه‌های متالیک مس/طلا در عمق سنگ
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.20)';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(size * 0.85, size * 0.2);
    ctx.bezierCurveTo(size * 0.6, size * 0.45, size * 0.4, size * 0.65, size * 0.15, size * 0.8);
    ctx.stroke();
    ctx.restore();

    // ۳. رسم خطوط فرورفته کادر دور هر وجه (Inset Border) مطابق پوستر
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 151, 80, 0.45)'; // برنز/طلای فرورفته
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';

    if (type === 'd6') {
        // کادر مربع
        ctx.strokeRect(size * 0.1, size * 0.1, size * 0.8, size * 0.8);
    } else if (type === 'd4' || type === 'd8' || type === 'd20') {
        // کادر مثلث متقارن
        ctx.beginPath();
        ctx.moveTo(size * 0.5, size * 0.12);
        ctx.lineTo(size * 0.88, size * 0.85);
        ctx.lineTo(size * 0.12, size * 0.85);
        ctx.closePath();
        ctx.stroke();
    } else if (type === 'd12') {
        // کادر پنج‌ضلعی
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const x = size * 0.5 + Math.cos(a) * size * 0.40;
            const y = size * 0.5 + Math.sin(a) * size * 0.40;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    } else if (type === 'd10' || type === 'd100') {
        // کادر کایت (لوزی نوک‌تیز)
        ctx.beginPath();
        ctx.moveTo(size * 0.5, size * 0.1);
        ctx.lineTo(size * 0.88, size * 0.52);
        ctx.lineTo(size * 0.5, size * 0.9);
        ctx.lineTo(size * 0.12, size * 0.52);
        ctx.closePath();
        ctx.stroke();
    }
    ctx.restore();

    // ۴. رسم عدد با گرادینت ورق طلای آنتیک
    const textStr = String(text);
    const isPercentile = type === 'd100';
    const fontSize = isPercentile ? 125 : textStr.length >= 2 ? 140 : 185;

    ctx.font = `bold ${fontSize}px "Cinzel", "Times New Roman", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // سایه عمیق برای حس حکاکی فرورفته در سنگ
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 6;

    // گرادیانت برنز-طلای گرم متالیک
    const goldGrad = ctx.createLinearGradient(0, size * 0.25, 0, size * 0.75);
    goldGrad.addColorStop(0, '#fef08a'); // هایلایت روشن
    goldGrad.addColorStop(0.35, '#eab308'); // طلایی اصلی
    goldGrad.addColorStop(0.7, '#ca8a04');  // برنز تیره
    goldGrad.addColorStop(1, '#854d0e');  // سایه مس

    const centerY = (type === 'd4' || type === 'd8' || type === 'd20') ? size * 0.55 : size * 0.51;
    ctx.fillStyle = goldGrad;
    ctx.fillText(textStr, size * 0.5, centerY);

    // خط بیرونی ظریف برای لبه‌های تیز حروف
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
    ctx.lineWidth = 3;
    ctx.strokeText(textStr, size * 0.5, centerY);

    // خط زیر ۶ و ۹ مطابق شیت مرجع
    if (text === 6 || text === 9) {
        ctx.fillStyle = goldGrad;
        ctx.fillRect(size * 0.38, centerY + 80, size * 0.24, 12);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
}

export function createMaterialsForType(type, values) {
    return values.map((val) => {
        const isCrit = type === 'd20' && val === 20;
        const tex = createAmethystMarbleTexture(val, type);

        return new THREE.MeshStandardMaterial({
            map: tex,
            roughness: isCrit ? 0.16 : 0.24, // ساتین صیقلی مطابق عکس
            metalness: 0.14,
            flatShading: true,
            side: THREE.DoubleSide,
        });
    });
}