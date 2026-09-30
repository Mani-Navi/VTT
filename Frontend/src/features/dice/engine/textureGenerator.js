import * as THREE from 'three';

/**
 * تولید پویای بافت مرمر بنفش اشرافی با رگه‌های طلایی و اعداد حکاکی‌شده
 */
export function createAmethystMarbleTexture(text, size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // ۱. پس‌زمینه گرادیانتی بنفش ارغوانی تیره
    const bgGrad = ctx.createRadialGradient(
        size * 0.4, size * 0.4, size * 0.1,
        size * 0.5, size * 0.5, size * 0.7
    );
    bgGrad.addColorStop(0, '#3b1d60');
    bgGrad.addColorStop(0.5, '#26133f');
    bgGrad.addColorStop(1, '#160b24');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // ۲. ترسیم رگه‌های طبیعی مرمر (Marble Veining)
    ctx.save();
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.filter = 'blur(12px)';

    // رگه‌های بنفش روشن مه‌آلود
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.28)';
    ctx.beginPath();
    ctx.moveTo(size * 0.1, size * 0.2);
    ctx.bezierCurveTo(size * 0.4, size * 0.1, size * 0.6, size * 0.8, size * 0.9, size * 0.85);
    ctx.stroke();

    // رگه‌های طلایی محو در عمق سنگ
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.22)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(size * 0.85, size * 0.15);
    ctx.bezierCurveTo(size * 0.5, size * 0.4, size * 0.4, size * 0.7, size * 0.15, size * 0.9);
    ctx.stroke();
    ctx.restore();

    // ۳. ترسیم عدد با فونت سریف و گرادینت ورق طلا (Gold Leaf)
    const textStr = String(text);
    const fontSize = textStr.length >= 2 ? 145 : 190;
    ctx.font = `bold ${fontSize}px "Cinzel", "Times New Roman", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // سایه عمیق حکاکی در سنگ
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 6;

    // گرادیانت طلای متالیک کهنه
    const goldGrad = ctx.createLinearGradient(0, size * 0.2, 0, size * 0.8);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.4, '#eab308');
    goldGrad.addColorStop(0.7, '#ca8a04');
    goldGrad.addColorStop(1, '#854d0e');

    ctx.fillStyle = goldGrad;
    ctx.fillText(textStr, size * 0.5, size * 0.52);

    // خط باریک دور طلایی برای برجستگی
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeText(textStr, size * 0.5, size * 0.52);

    // نقطه زیر ۶ و ۹
    if (text === 6 || text === 9) {
        ctx.fillStyle = goldGrad;
        ctx.beginPath();
        ctx.arc(size * 0.5, size * 0.5 + 90, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
}

export function createMaterialsForType(type, values) {
    return values.map((val) => {
        const isCrit = type === 'd20' && val === 20;
        const tex = createAmethystMarbleTexture(val);

        return new THREE.MeshStandardMaterial({
            map: tex,
            roughness: isCrit ? 0.12 : 0.22, // براقیت رزینی لوکس
            metalness: 0.12,
            flatShading: true,
            side: THREE.DoubleSide,
        });
    });
}