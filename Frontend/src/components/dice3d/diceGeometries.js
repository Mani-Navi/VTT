import * as THREE from "three";

// رنگ‌های تم تاس‌های چندوجهی
export const DICE_THEME_COLORS = {
  4: { primary: 0x0d9488, secondary: 0x115e59, text: "#ffffff" },   // زمردی (d4)
  6: { primary: 0x0284c7, secondary: 0x0369a1, text: "#ffffff" },   // آبی آسمانی (d6)
  8: { primary: 0x6366f1, secondary: 0x4338ca, text: "#ffffff" },   // نیلی (d8)
  10: { primary: 0x9333ea, secondary: 0x7e22ce, text: "#ffffff" },  // بنفش (d10)
  12: { primary: 0xdb2777, secondary: 0xbe185d, text: "#ffffff" },  // صورتی (d12)
  20: { primary: 0xd97706, secondary: 0xb45309, text: "#ffffff" },  // کهربایی طلایی (d20)
  100: { primary: 0xe11d48, secondary: 0xbe123c, text: "#ffffff" }, // قرمز یاقوتی (d100)
};

/**
 * تولید بافت عددی با کیفیت بالا روی Canvas
 */
export function createNumberTexture(text, primaryColorHex, textColor = "#ffffff") {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // ۱. گرادینت پس‌زمینه
    const grad = ctx.createRadialGradient(
        size / 2,
        size / 2,
        size * 0.1,
        size / 2,
        size / 2,
        size * 0.8
    );
    grad.addColorStop(0, primaryColorHex);
    grad.addColorStop(0.7, "#18181b");
    grad.addColorStop(1, "#09090b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // ۲. حاشیه فلزی
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, size - 40, size - 40);

    // ۳. رندر عدد تاس
    ctx.fillStyle = textColor;
    ctx.font = "900 180px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillText(String(text), size / 2, size / 2 + 10);

    // خط زیر عدد برای تشخیص ۶ از ۹
    if (text === 6 || text === 9 || text === "6" || text === "9") {
      ctx.lineWidth = 14;
      ctx.strokeStyle = textColor;
      ctx.beginPath();
      ctx.moveTo(size / 2 - 55, size / 2 + 110);
      ctx.lineTo(size / 2 + 55, size / 2 + 110);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * ساخت شیء سه‌بعدی Mesh بر اساس تعداد وجوه تاس
 */
export function createDieMesh(sides, targetResult, userColor) {
  const theme = DICE_THEME_COLORS[sides] || {
    primary: 0xd97706,
    secondary: 0x92400e,
    text: "#ffffff",
  };
  const primaryHex = userColor || `#${theme.primary.toString(16).padStart(6, "0")}`;

  let geometry;
  let material;

  switch (sides) {
    case 4: {
      geometry = new THREE.TetrahedronGeometry(1.6);
      const texture = createNumberTexture(targetResult, primaryHex, theme.text);
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.2,
        metalness: 0.45,
      });
      break;
    }
    case 6: {
      geometry = new THREE.BoxGeometry(2.1, 2.1, 2.1);
      const materials = [];
      for (let i = 0; i < 6; i++) {
        const num = i === 2 ? targetResult : ((targetResult + i) % 6) + 1;
        const texture = createNumberTexture(num, primaryHex, theme.text);
        materials.push(
            new THREE.MeshStandardMaterial({
              map: texture,
              roughness: 0.25,
              metalness: 0.4,
            })
        );
      }
      material = materials;
      break;
    }
    case 8: {
      geometry = new THREE.OctahedronGeometry(1.8);
      const texture = createNumberTexture(targetResult, primaryHex, theme.text);
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.2,
        metalness: 0.45,
      });
      break;
    }
    case 10: {
      geometry = new THREE.CylinderGeometry(1.5, 1.5, 1.9, 5);
      const texture = createNumberTexture(targetResult, primaryHex, theme.text);
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.25,
        metalness: 0.4,
      });
      break;
    }
    case 12: {
      geometry = new THREE.DodecahedronGeometry(1.7);
      const texture = createNumberTexture(targetResult, primaryHex, theme.text);
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.2,
        metalness: 0.45,
      });
      break;
    }
    case 20: {
      geometry = new THREE.IcosahedronGeometry(1.9);
      const texture = createNumberTexture(targetResult, primaryHex, theme.text);
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.18,
        metalness: 0.5,
      });
      break;
    }
    case 100: {
      geometry = new THREE.IcosahedronGeometry(1.9, 1);
      const texture = createNumberTexture(`${targetResult}%`, primaryHex, theme.text);
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.2,
        metalness: 0.5,
      });
      break;
    }
    default: {
      geometry = new THREE.IcosahedronGeometry(1.9);
      const texture = createNumberTexture(targetResult, primaryHex, theme.text);
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.2,
        metalness: 0.45,
      });
    }
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}