import * as THREE from "three";
import * as CANNON from "cannon-es";

export const DICE_THEME_COLORS = {
  4: { primary: 0x0d9488, secondary: 0x115e59, text: "#ffffff" },
  6: { primary: 0x0284c7, secondary: 0x0369a1, text: "#ffffff" },
  8: { primary: 0x6366f1, secondary: 0x4338ca, text: "#ffffff" },
  10: { primary: 0x9333ea, secondary: 0x7e22ce, text: "#ffffff" },
  12: { primary: 0xdb2777, secondary: 0xbe185d, text: "#ffffff" },
  20: { primary: 0xf59e0b, secondary: 0xb45309, text: "#090a0f" },
  100: { primary: 0xe11d48, secondary: 0xbe123c, text: "#ffffff" },
};

export function createNumberTexture(text, primaryColorHex, textColor = "#ffffff") {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
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
    grad.addColorStop(1, "#090a0f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 12;
    ctx.strokeRect(16, 16, size - 32, size - 32);

    ctx.fillStyle = textColor;
    ctx.font = "900 170px 'Vazirmatn', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText(String(text), size / 2, size / 2 + 8);

    if (text === 6 || text === 9 || text === "6" || text === "9") {
      ctx.lineWidth = 12;
      ctx.strokeStyle = textColor;
      ctx.beginPath();
      ctx.moveTo(size / 2 - 50, size / 2 + 105);
      ctx.lineTo(size / 2 + 50, size / 2 + 105);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function buildNumberedPolyDie(sides, targetResult, userColor) {
  const theme = DICE_THEME_COLORS[sides] || {
    primary: 0xf59e0b,
    secondary: 0x92400e,
    text: "#ffffff",
  };
  const primaryHex = userColor || `#${theme.primary.toString(16).padStart(6, "0")}`;

  let geometry;
  let shape;
  let targetFaceNormal = new THREE.Vector3(0, 1, 0);

  switch (sides) {
    case 4: {
      geometry = new THREE.TetrahedronGeometry(1.6);
      shape = new CANNON.Box(new CANNON.Vec3(1.1, 1.1, 1.1));
      targetFaceNormal = new THREE.Vector3(0, 1, 0);
      break;
    }
    case 6: {
      geometry = new THREE.BoxGeometry(2.0, 2.0, 2.0);
      shape = new CANNON.Box(new CANNON.Vec3(1.0, 1.0, 1.0));
      targetFaceNormal = new THREE.Vector3(0, 1, 0);
      break;
    }
    case 8: {
      geometry = new THREE.OctahedronGeometry(1.8);
      shape = new CANNON.Sphere(1.4);
      targetFaceNormal = new THREE.Vector3(0, 1, 0);
      break;
    }
    case 10: {
      geometry = new THREE.CylinderGeometry(1.4, 1.4, 1.8, 5);
      shape = new CANNON.Cylinder(1.4, 1.4, 1.8, 5);
      targetFaceNormal = new THREE.Vector3(0, 1, 0);
      break;
    }
    case 12: {
      geometry = new THREE.DodecahedronGeometry(1.7);
      shape = new CANNON.Sphere(1.5);
      targetFaceNormal = new THREE.Vector3(0, 1, 0);
      break;
    }
    case 20: {
      geometry = new THREE.IcosahedronGeometry(1.9);
      shape = new CANNON.Sphere(1.6);
      targetFaceNormal = new THREE.Vector3(0, 1, 0);
      break;
    }
    default: {
      geometry = new THREE.IcosahedronGeometry(1.9);
      shape = new CANNON.Sphere(1.6);
      targetFaceNormal = new THREE.Vector3(0, 1, 0);
    }
  }

  const texture = createNumberTexture(targetResult, primaryHex, theme.text);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.15,
    metalness: 0.4,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const body = new CANNON.Body({
    mass: 1.2,
    shape: shape,
    material: new CANNON.Material({ friction: 0.3, restitution: 0.6 }),
  });

  return { mesh, body, targetFaceNormal, theme };
}