import * as THREE from "three";
import * as CANNON from "cannon-es";

// 10 Luxurious Artisan Dice Themes (Marbled, Gemstone, Cosmic)
export interface DiceTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  darkAccent: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  marblingColor: string;
}

export const ARTISAN_THEMES: DiceTheme[] = [
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
    id: "cosmic_nebula",
    name: "سحابی کیهانی (Cosmic Nebula)",
    primaryColor: "#db2777",
    secondaryColor: "#831843",
    darkAccent: "#500724",
    textColor: "#ffffff",
    borderColor: "#f472b6",
    glowColor: "rgba(244, 114, 182, 0.55)",
    marblingColor: "#fbcfe8",
  },
  {
    id: "bloodstone_obsidian",
    name: "ابسیدین خونین (Bloodstone)",
    primaryColor: "#be123c",
    secondaryColor: "#4c0519",
    darkAccent: "#18181b",
    textColor: "#ffffff",
    borderColor: "#fb7185",
    glowColor: "rgba(251, 113, 133, 0.55)",
    marblingColor: "#fda4af",
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
  {
    id: "molten_lava",
    name: "گدازه آتشفشانی (Molten Lava)",
    primaryColor: "#ea580c",
    secondaryColor: "#7c2d12",
    darkAccent: "#1c1917",
    textColor: "#fef08a",
    borderColor: "#fb923c",
    glowColor: "rgba(251, 146, 60, 0.6)",
    marblingColor: "#fed7aa",
  },
  {
    id: "frostbite_pearl",
    name: "مروارید یخی (Frostbite)",
    primaryColor: "#0284c7",
    secondaryColor: "#0369a1",
    darkAccent: "#0c4a6e",
    textColor: "#ffffff",
    borderColor: "#bae6fd",
    glowColor: "rgba(186, 230, 253, 0.6)",
    marblingColor: "#e0f2fe",
  },
];

export function getRandomTheme(): DiceTheme {
  return ARTISAN_THEMES[Math.floor(Math.random() * ARTISAN_THEMES.length)];
}

/**
 * Creates high-resolution 512px per-tile Texture Atlas with marble swirls, mica glitter, and gold inlays
 */
export function createDiceAtlas(
  faceCount: number,
  theme: DiceTheme,
  isPercentile: boolean = false
): { texture: THREE.CanvasTexture; cols: number; rows: number } {
  const cols = faceCount <= 6 ? faceCount : faceCount <= 12 ? 4 : 5;
  const rows = Math.ceil(faceCount / cols);

  const cellSize = 512;
  const canvas = document.createElement("canvas");
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext("2d")!;

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

    // 1. Base Resin Gradient
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

    // 2. Swirling Organic Marbling Ribbons
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

    // 3. Embedded Glitter & Mica Flakes
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.45;
    for (let g = 0; g < 18; g++) {
      const gx = x + 35 + ((g * 127) % (cellSize - 70));
      const gy = y + 35 + ((g * 241) % (cellSize - 70));
      const gr = 1.5 + (g % 3.5);
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Glossy Top Curved Highlight
    const glossGrad = ctx.createLinearGradient(x, y, x, y + cellSize * 0.5);
    glossGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    glossGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glossGrad;
    ctx.beginPath();
    ctx.ellipse(cx, y + 55, cellSize * 0.42, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Metallic Beveled Borders
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 14;
    ctx.strokeRect(x + 18, y + 18, cellSize - 36, cellSize - 36);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 4;
    ctx.strokeRect(x + 30, y + 30, cellSize - 60, cellSize - 60);

    // 6. Glow on Nat 20 / Nat 100 / Nat 1
    if (num === "20" || num === "100" || num === "00") {
      ctx.fillStyle = theme.glowColor;
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.38, 0, Math.PI * 2);
      ctx.fill();
    } else if (num === "1") {
      ctx.fillStyle = "rgba(239, 68, 68, 0.32)";
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Die Number Inlay
    ctx.fillStyle = theme.textColor;
    ctx.font = `900 ${num.length > 2 ? 140 : 175}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 5;
    ctx.fillText(num, cx, cy + 8);

    // Underline for 6 and 9
    if (num === "6" || num === "9") {
      ctx.lineWidth = 14;
      ctx.strokeStyle = theme.textColor;
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy + 105);
      ctx.lineTo(cx + 50, cy + 105);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return { texture, cols, rows };
}

/**
 * Creates Regular Tetrahedron with correct CCW winding for d4
 */
export function createD4Geometry(radius: number = 1.85): THREE.BufferGeometry {
  const p = radius / Math.sqrt(3);
  const v0 = new THREE.Vector3(p, p, p);
  const v1 = new THREE.Vector3(-p, -p, p);
  const v2 = new THREE.Vector3(-p, p, -p);
  const v3 = new THREE.Vector3(p, -p, -p);

  const positions: number[] = [];
  positions.push(v0.x, v0.y, v0.z, v2.x, v2.y, v2.z, v1.x, v1.y, v1.z); // Face 0
  positions.push(v0.x, v0.y, v0.z, v3.x, v3.y, v3.z, v2.x, v2.y, v2.z); // Face 1
  positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v3.x, v3.y, v3.z); // Face 2
  positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z); // Face 3

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates Pentagonal Trapezohedron for d10 and d100 with accurate CCW winding
 */
export function createD10Geometry(radius: number = 1.9, height: number = 2.4): THREE.BufferGeometry {
  const positions: number[] = [];
  const topApex = new THREE.Vector3(0, height * 0.55, 0);
  const bottomApex = new THREE.Vector3(0, -height * 0.55, 0);

  const numSegments = 10;
  const equator: THREE.Vector3[] = [];
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
      // Upper Kite
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
      // Lower Kite
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

/**
 * Applies exact per-face UV coordinates to the geometry
 */
export function applyAtlasUVs(
  geometry: THREE.BufferGeometry,
  faceCount: number,
  cols: number,
  rows: number,
  trianglesPerFace: number = 1
) {
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
    } else if (trianglesPerFace === 3) {
      for (let t = 0; t < 3; t++) {
        const vOffset = startVert + t * 3;
        const angle0 = ((t * 2) / 5) * Math.PI * 2;
        const angle1 = (((t * 2 + 1) % 5) / 5) * Math.PI * 2;
        const angle2 = (((t * 2 + 2) % 5) / 5) * Math.PI * 2;

        uvs[(vOffset + 0) * 2] = uCenter + Math.cos(angle0) * uSpan * 0.85;
        uvs[(vOffset + 0) * 2 + 1] = (vMin + vMax) / 2 + Math.sin(angle0) * vSpan * 0.85;

        uvs[(vOffset + 1) * 2] = uCenter + Math.cos(angle1) * uSpan * 0.85;
        uvs[(vOffset + 1) * 2 + 1] = (vMin + vMax) / 2 + Math.sin(angle1) * vSpan * 0.85;

        uvs[(vOffset + 2) * 2] = uCenter + Math.cos(angle2) * uSpan * 0.85;
        uvs[(vOffset + 2) * 2 + 1] = (vMin + vMax) / 2 + Math.sin(angle2) * vSpan * 0.85;
      }
    }
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  if (geometry.getAttribute("uv")) {
    geometry.getAttribute("uv").needsUpdate = true;
  }
}

/**
 * Creates CANNON.ConvexPolyhedron rigid body from Three.js BufferGeometry
 * Automatically corrects vertex winding order so all face normals point outward.
 */
export function createCannonConvexBody(geometry: THREE.BufferGeometry, mass: number = 1): CANNON.Body {
  const posAttr = geometry.getAttribute("position");
  const vertices: CANNON.Vec3[] = [];
  const faces: number[][] = [];

  // Deduplicate vertices with rounding tolerance
  const uniqueMap = new Map<string, number>();

  for (let i = 0; i < posAttr.count; i += 3) {
    const faceIndices: number[] = [];

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

    if (faceIndices.length === 3 && faceIndices[0] !== faceIndices[1] && faceIndices[1] !== faceIndices[2]) {
      faces.push(faceIndices);
    }
  }

  // Calculate geometric centroid of polyhedron
  const centroid = new CANNON.Vec3(0, 0, 0);
  for (const v of vertices) {
    centroid.vadd(v, centroid);
  }
  centroid.scale(1 / vertices.length, centroid);

  // Correct face winding so (v1 - v0) x (v2 - v0) strictly points OUTWARD away from centroid
  const correctedFaces: number[][] = [];
  for (const face of faces) {
    const v0 = vertices[face[0]];
    const v1 = vertices[face[1]];
    const v2 = vertices[face[2]];

    const edge1 = new CANNON.Vec3();
    v1.vsub(v0, edge1);

    const edge2 = new CANNON.Vec3();
    v2.vsub(v0, edge2);

    const normal = new CANNON.Vec3();
    edge1.cross(edge2, normal);

    const toCentroid = new CANNON.Vec3();
    v0.vsub(centroid, toCentroid);

    // If normal points into shape (dot product with outward vector < 0), invert winding
    if (normal.dot(toCentroid) < 0) {
      correctedFaces.push([face[0], face[2], face[1]]);
    } else {
      correctedFaces.push(face);
    }
  }

  const shape = new CANNON.ConvexPolyhedron({
    vertices,
    faces: correctedFaces,
  });

  const body = new CANNON.Body({
    mass,
    shape,
    material: new CANNON.Material({ friction: 0.35, restitution: 0.55 }),
    linearDamping: 0.15,
    angularDamping: 0.25,
  });

  return body;
}

export interface PolyhedralFaceInfo {
  faceIndex: number;
  normal: THREE.Vector3;
  center: THREE.Vector3;
  value: number;
}

export function extractFaceInfos(
  geometry: THREE.BufferGeometry,
  faceCount: number,
  trianglesPerFace: number = 1
): PolyhedralFaceInfo[] {
  const posAttr = geometry.getAttribute("position");
  const faces: PolyhedralFaceInfo[] = [];

  for (let f = 0; f < faceCount; f++) {
    const startTri = f * trianglesPerFace;
    const endTri = startTri + trianglesPerFace;

    const center = new THREE.Vector3();
    let count = 0;
    for (let t = startTri; t < endTri; t++) {
      for (let v = 0; v < 3; v++) {
        const idx = t * 3 + v;
        center.add(new THREE.Vector3(posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx)));
        count++;
      }
    }
    center.divideScalar(count);

    const v0 = new THREE.Vector3(posAttr.getX(startTri * 3), posAttr.getY(startTri * 3), posAttr.getZ(startTri * 3));
    const v1 = new THREE.Vector3(posAttr.getX(startTri * 3 + 1), posAttr.getY(startTri * 3 + 1), posAttr.getZ(startTri * 3 + 1));
    const v2 = new THREE.Vector3(posAttr.getX(startTri * 3 + 2), posAttr.getY(startTri * 3 + 2), posAttr.getZ(startTri * 3 + 2));
    const normal = new THREE.Vector3().crossVectors(v1.clone().sub(v0), v2.clone().sub(v0)).normalize();

    faces.push({
      faceIndex: f,
      normal,
      center,
      value: f + 1,
    });
  }

  return faces;
}

/**
 * Build authentic RPG Polyhedral Die with chosen/randomized theme
 */
export function buildNumberedPolyDie(
  sides: number,
  targetResult: number,
  customTheme?: DiceTheme
): {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  geometry: THREE.BufferGeometry;
  targetFaceNormal: THREE.Vector3;
  theme: DiceTheme;
} {
  const theme = customTheme || getRandomTheme();

  let geometry: THREE.BufferGeometry;
  let trianglesPerFace = 1;
  const isPercentile = sides === 100;
  const faceCount = isPercentile ? 10 : sides;

  switch (sides) {
    case 4: {
      geometry = createD4Geometry(1.85);
      trianglesPerFace = 1;
      break;
    }
    case 6: {
      geometry = new THREE.BoxGeometry(2.1, 2.1, 2.1).toNonIndexed();
      trianglesPerFace = 2;
      break;
    }
    case 8: {
      geometry = new THREE.OctahedronGeometry(1.9, 0).toNonIndexed();
      trianglesPerFace = 1;
      break;
    }
    case 10:
    case 100: {
      geometry = createD10Geometry(1.9, 2.4);
      trianglesPerFace = 2;
      break;
    }
    case 12: {
      geometry = new THREE.DodecahedronGeometry(1.85, 0).toNonIndexed();
      trianglesPerFace = 3;
      break;
    }
    case 20:
    default: {
      geometry = new THREE.IcosahedronGeometry(1.9, 0).toNonIndexed();
      trianglesPerFace = 1;
      break;
    }
  }

  // 1. Texture Atlas with marble resin & mica
  const { texture, cols, rows } = createDiceAtlas(faceCount, theme, isPercentile);

  // 2. Exact UV Mapping
  applyAtlasUVs(geometry, faceCount, cols, rows, trianglesPerFace);
  geometry.computeVertexNormals();

  // 3. Realistic Resin Material with Specular Sheen
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.12,
    metalness: 0.35,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // 4. CANNON-es Rigid Physics Body
  let body: CANNON.Body;
  if (sides === 6) {
    body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(1.05, 1.05, 1.05)),
      material: new CANNON.Material({ friction: 0.35, restitution: 0.55 }),
      linearDamping: 0.15,
      angularDamping: 0.25,
    });
  } else {
    body = createCannonConvexBody(geometry, 1);
  }

  // 5. Target Face Normal
  const faceInfos = extractFaceInfos(geometry, faceCount, trianglesPerFace);
  let targetValue = targetResult;
  if (isPercentile) {
    targetValue = Math.min(Math.max(Math.floor(targetResult / 10) + 1, 1), 10);
  } else if (sides === 10) {
    targetValue = ((targetResult - 1 + 10) % 10) + 1;
  }

  const targetFace =
    faceInfos.find((f) => f.value === targetValue) ||
    faceInfos[0] || {
      normal: new THREE.Vector3(0, 1, 0),
    };

  return {
    mesh,
    body,
    geometry,
    targetFaceNormal: targetFace.normal.clone(),
    theme,
  };
}
