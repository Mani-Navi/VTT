import * as THREE from "three";
import * as CANNON from "cannon-es";

// ۱۰ تم ماربل، کریستالی و اژدهایی
export const ARTISAN_THEMES = [
  {
    id: "solar_king",
    name: "طلایی خورشیدی (Solar King)",
    primaryColor: "#d97706",
    secondaryColor: "#92400e",
    darkAccent: "#451a03",
    textColor: "#ffffff",
    borderColor: "#fbbf24",
    glowColor: "rgba(251, 191, 36, 0.6)",
    marblingColor: "#fef08a",
  },
  {
    id: "astral_sapphire",
    name: "یاقوت آبی سماوی (Astral Sapphire)",
    primaryColor: "#2563eb",
    secondaryColor: "#1e3a8a",
    darkAccent: "#0f172a",
    textColor: "#ffffff",
    borderColor: "#93c5fd",
    glowColor: "rgba(147, 197, 253, 0.55)",
    marblingColor: "#60a5fa",
  },
  {
    id: "emerald_dragon",
    name: "اژدهای زمردین (Emerald Dragon)",
    primaryColor: "#059669",
    secondaryColor: "#065f46",
    darkAccent: "#022c22",
    textColor: "#fef08a",
    borderColor: "#34d399",
    glowColor: "rgba(52, 211, 153, 0.55)",
    marblingColor: "#a7f3d0",
  },
  {
    id: "arcane_amethyst",
    name: "آمتیست باستانی (Arcane Amethyst)",
    primaryColor: "#8b5cf6",
    secondaryColor: "#5b21b6",
    darkAccent: "#2e1065",
    textColor: "#fde047",
    borderColor: "#c084fc",
    glowColor: "rgba(192, 132, 252, 0.55)",
    marblingColor: "#e9d5ff",
  },
  {
    id: "dragon_ruby",
    name: "یاقوت سرخ آتشین (Dragon Ruby)",
    primaryColor: "#dc2626",
    secondaryColor: "#991b1b",
    darkAccent: "#450a0a",
    textColor: "#fef08a",
    borderColor: "#f87171",
    glowColor: "rgba(248, 113, 113, 0.55)",
    marblingColor: "#fecaca",
  },
  {
    id: "cyber_neon",
    name: "سایبر نئون (Cyber Neon)",
    primaryColor: "#0284c7",
    secondaryColor: "#0f172a",
    darkAccent: "#020617",
    textColor: "#facc15",
    borderColor: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.6)",
    marblingColor: "#67e8f9",
  },
];

export function getRandomTheme() {
  return ARTISAN_THEMES[Math.floor(Math.random() * ARTISAN_THEMES.length)];
}

export function createDiceAtlas(faceCount, theme, isPercentile = false) {
  const cols = faceCount <= 6 ? faceCount : faceCount <= 12 ? 4 : 5;
  const rows = Math.ceil(faceCount / cols);

  const cellSize = 512;
  const canvas = document.createElement("canvas");
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext("2d");

  if (!ctx) return { texture: new THREE.CanvasTexture(canvas), cols, rows };

  ctx.fillStyle = theme.darkAccent || "#09090b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < faceCount; i++) {
    const num = isPercentile ? (i === 0 ? "00" : `${i * 10}`) : `${i + 1}`;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellSize + cellSize / 2;
    const cy = row * cellSize + cellSize / 2;
    const x = col * cellSize;
    const y = row * cellSize;

    // گرادینت پس‌زمینه رزینی
    const grad = ctx.createRadialGradient(
        cx - cellSize * 0.15,
        cy - cellSize * 0.18,
        cellSize * 0.05,
        cx,
        cy,
        cellSize * 0.75
    );
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.18, theme.primaryColor);
    grad.addColorStop(0.68, theme.secondaryColor);
    grad.addColorStop(1, theme.darkAccent);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, cellSize, cellSize);

    // خطوط ماربل
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, cellSize, cellSize);
    ctx.clip();
    ctx.strokeStyle = theme.marblingColor;
    ctx.lineWidth = 14;
    ctx.globalAlpha = 0.28;
    for (let s = 0; s < 3; s++) {
      ctx.beginPath();
      const sx = x + (s * cellSize) / 3;
      ctx.moveTo(sx, y);
      ctx.bezierCurveTo(
          sx + 90,
          y + cellSize * 0.35,
          sx - 70,
          y + cellSize * 0.65,
          sx + 40,
          y + cellSize
      );
      ctx.stroke();
    }
    ctx.restore();

    // حاشیه فلزی
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 14;
    ctx.strokeRect(x + 18, y + 18, cellSize - 36, cellSize - 36);

    // درخشش کریتیکال ۲۰
    if (num === "20" || num === "100" || num === "00") {
      ctx.fillStyle = theme.glowColor;
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }

    // عدد وجه تاس
    ctx.fillStyle = theme.textColor;
    ctx.font = `900 ${num.length > 2 ? 140 : 175}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 5;
    ctx.fillText(num, cx, cy + 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return { texture, cols, rows };
}

export function createD4Geometry(radius = 1.85) {
  const p = radius / Math.sqrt(3);
  const v0 = new THREE.Vector3(p, p, p);
  const v1 = new THREE.Vector3(-p, -p, p);
  const v2 = new THREE.Vector3(-p, p, -p);
  const v3 = new THREE.Vector3(p, -p, -p);

  const positions = [];
  positions.push(v0.x, v0.y, v0.z, v2.x, v2.y, v2.z, v1.x, v1.y, v1.z);
  positions.push(v0.x, v0.y, v0.z, v3.x, v3.y, v3.z, v2.x, v2.y, v2.z);
  positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v3.x, v3.y, v3.z);
  positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function createD10Geometry(radius = 1.9, height = 2.4) {
  const positions = [];
  const topApex = new THREE.Vector3(0, height * 0.55, 0);
  const bottomApex = new THREE.Vector3(0, -height * 0.55, 0);

  const numSegments = 10;
  const equator = [];
  const eqOffset = 0.38;

  for (let i = 0; i < numSegments; i++) {
    const angle = (i * Math.PI * 2) / numSegments;
    const y = i % 2 === 0 ? eqOffset : -eqOffset;
    equator.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
  }

  for (let i = 0; i < numSegments; i++) {
    const prev = (i - 1 + numSegments) % numSegments;
    const curr = i;
    const next = (i + 1) % numSegments;

    if (i % 2 === 0) {
      positions.push(
          topApex.x, topApex.y, topApex.z,
          equator[prev].x, equator[prev].y, equator[prev].z,
          equator[curr].x, equator[curr].y, equator[curr].z
      );
      positions.push(
          topApex.x, topApex.y, topApex.z,
          equator[curr].x, equator[curr].y, equator[curr].z,
          equator[next].x, equator[next].y, equator[next].z
      );
    } else {
      positions.push(
          bottomApex.x, bottomApex.y, bottomApex.z,
          equator[curr].x, equator[curr].y, equator[curr].z,
          equator[prev].x, equator[prev].y, equator[prev].z
      );
      positions.push(
          bottomApex.x, bottomApex.y, bottomApex.z,
          equator[next].x, equator[next].y, equator[next].z,
          equator[curr].x, equator[curr].y, equator[curr].z
      );
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function applyAtlasUVs(geometry, faceCount, cols, rows, trianglesPerFace = 1) {
  const posAttr = geometry.getAttribute("position");
  const totalVertices = posAttr.count;
  const uvs = new Float32Array(totalVertices * 2);

  for (let f = 0; f < faceCount; f++) {
    const col = f % cols;
    const row = Math.floor(f / cols);

    const uMin = col / cols;
    const uMax = (col + 1) / cols;
    const vMax = 1 - row / rows;
    const vMin = 1 - (row + 1) / rows;

    const uCenter = (uMin + uMax) / 2;
    const uSpan = (uMax - uMin) * 0.45;
    const vSpan = (vMax - vMin) * 0.45;

    const startVert = f * trianglesPerFace * 3;

    if (trianglesPerFace === 1) {
      uvs[(startVert + 0) * 2] = uCenter;
      uvs[(startVert + 0) * 2 + 1] = vMin + vSpan * 1.85;
      uvs[(startVert + 1) * 2] = uCenter - uSpan * 0.9;
      uvs[(startVert + 1) * 2 + 1] = vMin + vSpan * 0.15;
      uvs[(startVert + 2) * 2] = uCenter + uSpan * 0.9;
      uvs[(startVert + 2) * 2 + 1] = vMin + vSpan * 0.15;
    } else if (trianglesPerFace === 2) {
      uvs[(startVert + 0) * 2] = uCenter;
      uvs[(startVert + 0) * 2 + 1] = vMin + vSpan * 1.85;
      uvs[(startVert + 1) * 2] = uCenter - uSpan * 0.9;
      uvs[(startVert + 1) * 2 + 1] = vMin + vSpan * 0.95;
      uvs[(startVert + 2) * 2] = uCenter;
      uvs[(startVert + 2) * 2 + 1] = vMin + vSpan * 0.15;

      uvs[(startVert + 3) * 2] = uCenter;
      uvs[(startVert + 3) * 2 + 1] = vMin + vSpan * 1.85;
      uvs[(startVert + 4) * 2] = uCenter;
      uvs[(startVert + 4) * 2 + 1] = vMin + vSpan * 0.15;
      uvs[(startVert + 5) * 2] = uCenter + uSpan * 0.9;
      uvs[(startVert + 5) * 2 + 1] = vMin + vSpan * 0.95;
    }
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
}

export function createCannonConvexBody(geometry, mass = 1) {
  const posAttr = geometry.getAttribute("position");
  const vertices = [];
  const faces = [];
  const uniqueMap = new Map();

  for (let i = 0; i < posAttr.count; i += 3) {
    const faceIndices = [];
    for (let v = 0; v < 3; v++) {
      const idx = i + v;
      const x = Math.round(posAttr.getX(idx) * 1000) / 1000;
      const y = Math.round(posAttr.getY(idx) * 1000) / 1000;
      const z = Math.round(posAttr.getZ(idx) * 1000) / 1000;
      const key = `${x}_${y}_${z}`;

      let uIdx = uniqueMap.get(key);
      if (uIdx === undefined) {
        uIdx = vertices.length;
        uniqueMap.set(key, uIdx);
        vertices.push(new CANNON.Vec3(x, y, z));
      }
      faceIndices.push(uIdx);
    }
    if (faceIndices.length === 3) {
      faces.push(faceIndices);
    }
  }

  const shape = new CANNON.ConvexPolyhedron({ vertices, faces });
  return new CANNON.Body({
    mass,
    shape,
    material: new CANNON.Material({ friction: 0.35, restitution: 0.55 }),
    linearDamping: 0.15,
    angularDamping: 0.25,
  });
}

export function extractFaceInfos(geometry, faceCount, trianglesPerFace = 1) {
  const posAttr = geometry.getAttribute("position");
  const faces = [];

  for (let f = 0; f < faceCount; f++) {
    const startTri = f * trianglesPerFace;
    const v0 = new THREE.Vector3(posAttr.getX(startTri * 3), posAttr.getY(startTri * 3), posAttr.getZ(startTri * 3));
    const v1 = new THREE.Vector3(posAttr.getX(startTri * 3 + 1), posAttr.getY(startTri * 3 + 1), posAttr.getZ(startTri * 3 + 1));
    const v2 = new THREE.Vector3(posAttr.getX(startTri * 3 + 2), posAttr.getY(startTri * 3 + 2), posAttr.getZ(startTri * 3 + 2));
    const normal = new THREE.Vector3().crossVectors(v1.clone().sub(v0), v2.clone().sub(v0)).normalize();

    faces.push({
      faceIndex: f,
      normal,
      value: f + 1,
    });
  }

  return faces;
}

export function buildNumberedPolyDie(sides, targetResult, customTheme) {
  const theme = customTheme || getRandomTheme();
  let geometry;
  let trianglesPerFace = 1;
  const isPercentile = sides === 100;
  const faceCount = isPercentile ? 10 : sides;

  switch (sides) {
    case 4:
      geometry = createD4Geometry(1.85);
      break;
    case 6:
      geometry = new THREE.BoxGeometry(2.1, 2.1, 2.1).toNonIndexed();
      trianglesPerFace = 2;
      break;
    case 8:
      geometry = new THREE.OctahedronGeometry(1.9, 0).toNonIndexed();
      break;
    case 10:
    case 100:
      geometry = createD10Geometry(1.9, 2.4);
      trianglesPerFace = 2;
      break;
    case 12:
      geometry = new THREE.DodecahedronGeometry(1.85, 0).toNonIndexed();
      trianglesPerFace = 3;
      break;
    case 20:
    default:
      geometry = new THREE.IcosahedronGeometry(1.9, 0).toNonIndexed();
      break;
  }

  const { texture, cols, rows } = createDiceAtlas(faceCount, theme, isPercentile);
  applyAtlasUVs(geometry, faceCount, cols, rows, trianglesPerFace);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.12,
    metalness: 0.35,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  let body;
  if (sides === 6) {
    body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(1.05, 1.05, 1.05)),
      material: new CANNON.Material({ friction: 0.35, restitution: 0.55 }),
    });
  } else {
    body = createCannonConvexBody(geometry, 1);
  }

  const faceInfos = extractFaceInfos(geometry, faceCount, trianglesPerFace);
  let targetValue = targetResult;
  if (isPercentile) {
    targetValue = Math.min(Math.max(Math.floor(targetResult / 10) + 1, 1), 10);
  }

  const targetFace = faceInfos.find((f) => f.value === targetValue) || faceInfos[0] || { normal: new THREE.Vector3(0, 1, 0) };

  return {
    mesh,
    body,
    geometry,
    targetFaceNormal: targetFace.normal.clone(),
    theme,
  };
}