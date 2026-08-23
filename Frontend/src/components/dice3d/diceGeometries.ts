import * as THREE from "three";

// Colors corresponding to polyhedral dice
export const DICE_THEME_COLORS: Record<number, { primary: number; secondary: number; text: string }> = {
  4: { primary: 0x0d9488, secondary: 0x115e59, text: "#ffffff" },   // Emerald / Teal
  6: { primary: 0x0284c7, secondary: 0x0369a1, text: "#ffffff" },   // Sky / Blue
  8: { primary: 0x6366f1, secondary: 0x4338ca, text: "#ffffff" },   // Indigo
  10: { primary: 0x9333ea, secondary: 0x7e22ce, text: "#ffffff" },  // Purple
  12: { primary: 0xdb2777, secondary: 0xbe185d, text: "#ffffff" },  // Pink
  20: { primary: 0xd97706, secondary: 0xb45309, text: "#ffffff" },  // Amber / Gold
  100: { primary: 0xe11d48, secondary: 0xbe123c, text: "#ffffff" }, // Rose / Red
};

// Generates high-res canvas texture with number stamped
export function createNumberTexture(
  text: string | number,
  primaryColorHex: string,
  textColor: string = "#ffffff"
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // 1. Background gradient with rich jewel sheen
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

    // 2. High-contrast metallic outer border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, size - 40, size - 40);

    // 3. Inner decorative framing
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, size - 72, size - 72);

    // 4. Center Die Number rendering
    ctx.fillStyle = textColor;
    ctx.font = "900 180px 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillText(String(text), size / 2, size / 2 + 10);

    // Underline for 6 and 9 to distinguish
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

// Create 3D Mesh for each die type
export function createDieMesh(
  sides: number,
  targetResult: number,
  userColor?: string
): THREE.Mesh {
  const theme = DICE_THEME_COLORS[sides] || {
    primary: 0xd97706,
    secondary: 0x92400e,
    text: "#ffffff",
  };
  const primaryHex = userColor || `#${theme.primary.toString(16).padStart(6, "0")}`;

  let geometry: THREE.BufferGeometry;
  let material: THREE.Material | THREE.Material[];

  switch (sides) {
    case 4: {
      // d4 Tetrahedron
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
      // d6 Cube with multi-face materials
      geometry = new THREE.BoxGeometry(2.1, 2.1, 2.1);
      const materials: THREE.Material[] = [];
      for (let i = 0; i < 6; i++) {
        // Face 2 (top y+) gets target result
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
      // d8 Octahedron
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
      // d10 Decahedron
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
      // d12 Dodecahedron
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
      // d20 Icosahedron
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
      // d100 Faceted Sphere
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
