import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import confetti from "canvas-confetti";
import { Sparkles, X, RotateCcw, ShieldAlert, MousePointerClick, Dices } from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { DiceRoll } from "../../types";
import { buildNumberedPolyDie, DiceTheme } from "./polyhedralDice";
import { cn } from "../../utils/cn";

interface ActiveDie {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  sides: number;
  result: number;
  targetQuaternion: THREE.Quaternion;
  targetFaceNormal: THREE.Vector3;
  settled: boolean;
  settleProgress: number;
  theme: DiceTheme;
}

export const Dice3DStage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const active3DRoll = useCanvasStore((state) => state.active3DRoll);
  const is3DDiceEnabled = useCanvasStore((state) => state.is3DDiceEnabled);
  const clear3DRoll = useCanvasStore((state) => state.clear3DRoll);
  const trigger3DRoll = useCanvasStore((state) => state.trigger3DRoll);
  const chatMessages = useSceneStore((state) => state.chatMessages);

  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [showResultBanner, setShowResultBanner] = useState<boolean>(false);
  const [isAiming, setIsAiming] = useState<boolean>(false);
  const [dragVector, setDragVector] = useState<{ startX: number; startY: number; currX: number; currY: number } | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const worldRef = useRef<CANNON.World | null>(null);
  const diceGroupRef = useRef<THREE.Group | null>(null);
  const activeDiceRef = useRef<ActiveDie[]>([]);
  const lastProcessedRollIdRef = useRef<string | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragCurrentPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isThrownRef = useRef<boolean>(false);

  // Sound synthesizer for realistic dice bounce and tray impact
  const playBounceSound = useCallback((impactSpeed: number = 2) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const volume = Math.min(Math.max(impactSpeed / 12, 0.04), 0.22);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(120 + Math.random() * 120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.09);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore audio failure
    }
  }, []);

  // Fire celebratory fireworks for Critical rolls
  const triggerCritCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ["#fbbf24", "#f59e0b", "#d97706", "#ffffff", "#10b981", "#3b82f6", "#ec4899"],
      });
    } catch {
      // Ignore confetti errors
    }
  }, []);

  // Listen to new room chat rolls and trigger 3D if enabled
  useEffect(() => {
    if (!is3DDiceEnabled) return;
    if (chatMessages.length === 0) return;
    const latest = chatMessages[chatMessages.length - 1];
    if (latest && latest.diceRoll && latest.diceRoll.id !== lastProcessedRollIdRef.current) {
      lastProcessedRollIdRef.current = latest.diceRoll.id;
      trigger3DRoll(latest.diceRoll);
    }
  }, [chatMessages, is3DDiceEnabled, trigger3DRoll]);

  // Sync active 3D roll from zustand
  useEffect(() => {
    if (active3DRoll) {
      setCurrentRoll(active3DRoll);
      setShowResultBanner(false);
    }
  }, [active3DRoll]);

  // Initialize Three.js Scene and CANNON-es Physics World
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Three.js Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera (Looking slightly down at tabletop tray)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 18, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer with PCF Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff8eb, 2.8);
    mainLight.position.set(10, 26, 14);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -16;
    mainLight.shadow.camera.right = 16;
    mainLight.shadow.camera.top = 16;
    mainLight.shadow.camera.bottom = -16;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
    fillLight.position.set(-14, 16, -10);
    scene.add(fillLight);

    const sparkleLight = new THREE.PointLight(0xffffff, 2.2, 40);
    sparkleLight.position.set(0, 12, 6);
    scene.add(sparkleLight);

    // 5. Shadow Receiver Floor Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(80, 80);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.4 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 6. Dice Group
    const diceGroup = new THREE.Group();
    scene.add(diceGroup);
    diceGroupRef.current = diceGroup;

    // 7. CANNON-es Physics World
    const world = new CANNON.World();
    world.gravity.set(0, -28, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    (world.solver as any).iterations = 12;
    worldRef.current = world;

    // Floor physics plane
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: new CANNON.Material({ friction: 0.35, restitution: 0.55 }),
    });
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(floorBody);

    // Boundary walls (Tray containment)
    const wallMat = new CANNON.Material({ friction: 0.2, restitution: 0.6 });
    const createWall = (pos: CANNON.Vec3, normalAngle: number, axis: CANNON.Vec3) => {
      const wall = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: wallMat });
      wall.position.copy(pos);
      wall.quaternion.setFromAxisAngle(axis, normalAngle);
      world.addBody(wall);
    };

    createWall(new CANNON.Vec3(0, 0, -10), 0, new CANNON.Vec3(0, 1, 0)); // Back
    createWall(new CANNON.Vec3(0, 0, 11), Math.PI, new CANNON.Vec3(0, 1, 0)); // Front
    createWall(new CANNON.Vec3(-13, 0, 0), Math.PI / 2, new CANNON.Vec3(0, 1, 0)); // Left
    createWall(new CANNON.Vec3(13, 0, 0), -Math.PI / 2, new CANNON.Vec3(0, 1, 0)); // Right

    // Initial render
    renderer.render(scene, camera);

    // Resize handling
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
    };
  }, []);

  // Launch Dice with initial state when currentRoll changes
  useEffect(() => {
    if (!currentRoll || !sceneRef.current || !diceGroupRef.current || !worldRef.current) return;

    const diceGroup = diceGroupRef.current;
    const world = worldRef.current;

    // Clean up existing dice
    activeDiceRef.current.forEach((d) => {
      world.removeBody(d.body);
      diceGroup.remove(d.mesh);
      if (d.mesh.geometry) d.mesh.geometry.dispose();
      if (Array.isArray(d.mesh.material)) {
        d.mesh.material.forEach((m) => m.dispose());
      } else if (d.mesh.material) {
        d.mesh.material.dispose();
      }
    });
    activeDiceRef.current = [];

    const diceList =
      currentRoll.dice && currentRoll.dice.length > 0
        ? currentRoll.dice
        : [{ sides: 20, result: currentRoll.total }];

    const count = Math.min(diceList.length, 10);
    const cameraViewDirection = new THREE.Vector3(0, 0.82, 0.57).normalize();
    const newActiveDice: ActiveDie[] = [];

    diceList.slice(0, count).forEach((die, index) => {
      const sides = die.sides || 20;
      const result = die.result ?? (die as any).value ?? 1;

      // Build polyhedral die with authentic artisan randomized theme
      const { mesh, body, targetFaceNormal, theme } = buildNumberedPolyDie(sides, result);

      // Start position (Hovering above tray ready for throw)
      const spreadX = (index - (count - 1) / 2) * 2.8;
      const startX = spreadX;
      const startY = 8.5;
      const startZ = 6.0;

      mesh.position.set(startX, startY, startZ);
      body.position.set(startX, startY, startZ);

      // Collision sound listener
      body.addEventListener("collide", (e: any) => {
        const relVel = e.contact ? e.contact.getImpactVelocityAlongNormal() : 2;
        if (Math.abs(relVel) > 1.2) {
          playBounceSound(Math.abs(relVel));
        }
      });

      // Target alignment quaternion
      const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
        targetFaceNormal,
        cameraViewDirection
      );
      const yawQuat = new THREE.Quaternion().setFromAxisAngle(
        cameraViewDirection,
        (Math.random() - 0.5) * 0.35
      );
      targetQuaternion.premultiply(yawQuat);

      diceGroup.add(mesh);
      world.addBody(body);

      newActiveDice.push({
        mesh,
        body,
        sides,
        result,
        targetQuaternion,
        targetFaceNormal,
        settled: false,
        settleProgress: 0,
        theme,
      });
    });

    activeDiceRef.current = newActiveDice;
    setIsAiming(true);
    isThrownRef.current = false;
    setShowResultBanner(false);

    // If user doesn't drag within 1.2s, auto-fling with natural impulse!
    const autoFlingTimer = setTimeout(() => {
      if (!isThrownRef.current) {
        flingDice({ x: 0, y: -160 });
      }
    }, 900);

    return () => clearTimeout(autoFlingTimer);
  }, [currentRoll, playBounceSound]);

  // Fling / Throw physics impulse function
  const flingDice = useCallback(
    (dragDelta: { x: number; y: number }) => {
      if (isThrownRef.current || !worldRef.current) return;
      isThrownRef.current = true;
      setIsAiming(false);
      setDragVector(null);

      const power = Math.min(Math.hypot(dragDelta.x, dragDelta.y) / 12, 18);
      const angle = Math.atan2(dragDelta.y, dragDelta.x);

      // Throw direction mapped to 3D world (dx -> x, dy -> -z)
      const forwardForce = Math.max(power * 1.6, 12);
      const dirX = Math.cos(angle) * power * 0.8;
      const dirZ = Math.sin(angle) * power * 1.1;

      activeDiceRef.current.forEach((die, index) => {
        const body = die.body;
        // Apply impulse
        body.velocity.set(
          dirX + (Math.random() - 0.5) * 4,
          1.5 + Math.random() * 3,
          -forwardForce + (Math.random() - 0.5) * 4
        );

        // Apply realistic intense tumbling torque
        body.angularVelocity.set(
          (Math.random() - 0.5) * 32,
          (Math.random() - 0.5) * 32,
          (Math.random() - 0.5) * 32
        );
      });

      // Start CANNON Physics Animation Loop
      const startTime = performance.now();
      const world = worldRef.current;

      const animate = () => {
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        const dt = 1 / 60;

        world.step(dt);

        let allSettled = true;

        activeDiceRef.current.forEach((die) => {
          // Sync Three.js mesh with Cannon.js rigid body
          die.mesh.position.copy(die.body.position as unknown as THREE.Vector3);
          die.mesh.quaternion.copy(die.body.quaternion as unknown as THREE.Quaternion);

          const vel = die.body.velocity.length();
          const angVel = die.body.angularVelocity.length();

          if (!die.settled) {
            if (elapsed > 1.3 || (elapsed > 0.8 && vel < 0.25 && angVel < 0.35)) {
              die.settled = true;
              die.body.velocity.set(0, 0, 0);
              die.body.angularVelocity.set(0, 0, 0);
            } else {
              allSettled = false;
            }
          } else {
            // Smoothly align target face towards camera
            if (die.settleProgress < 1) {
              die.settleProgress = Math.min(1, die.settleProgress + dt * 3.6);
              die.mesh.quaternion.slerp(die.targetQuaternion, 0.18);
            }
          }
        });

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }

        if (allSettled && elapsed > 1.4) {
          setShowResultBanner(true);

          const isCritical = currentRoll?.isCriticalHit || (currentRoll as any)?.isCrit;
          if (isCritical) {
            triggerCritCelebration();
          }

          // Auto dismiss after 5.5 seconds
          const timer = setTimeout(() => {
            handleDismiss();
          }, 5500);

          return () => clearTimeout(timer);
        } else {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [currentRoll, triggerCritCelebration]
  );

  // Pointer Drag Handlers (Mouse / Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isAiming || isThrownRef.current) return;
    isDraggingRef.current = true;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    dragCurrentPosRef.current = { x: e.clientX, y: e.clientY };
    setDragVector({ startX: e.clientX, startY: e.clientY, currX: e.clientX, currY: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    dragCurrentPosRef.current = { x: e.clientX, y: e.clientY };
    setDragVector({
      startX: dragStartPosRef.current.x,
      startY: dragStartPosRef.current.y,
      currX: e.clientX,
      currY: e.clientY,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const dx = e.clientX - dragStartPosRef.current.x;
    const dy = e.clientY - dragStartPosRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 20) {
      flingDice({ x: dx, y: dy });
    } else {
      // Default throw upwards towards tray
      flingDice({ x: 0, y: -180 });
    }
  };

  const handleDismiss = () => {
    setCurrentRoll(null);
    clear3DRoll();
  };

  const handleReroll = () => {
    if (currentRoll) {
      const rerolledDice = currentRoll.dice.map((d) => ({
        ...d,
        result: Math.floor(Math.random() * d.sides) + 1,
      }));
      const newTotal =
        rerolledDice.reduce((acc, cur) => acc + cur.result, 0) + (currentRoll.modifier || 0);
      const isCrit = rerolledDice.some((d) => d.sides === 20 && d.result === 20);

      setCurrentRoll({
        ...currentRoll,
        id: `reroll-${Date.now()}`,
        dice: rerolledDice,
        total: newTotal,
        isCriticalHit: isCrit,
        isCriticalFail: rerolledDice.some((d) => d.sides === 20 && d.result === 1),
      });
    }
  };

  const isCrit = currentRoll ? currentRoll.isCriticalHit || (currentRoll as any).isCrit : false;
  const isFumble = currentRoll ? currentRoll.isCriticalFail || (currentRoll as any).isFumble : false;
  const rollLabel = currentRoll ? currentRoll.label || (currentRoll as any).reason : null;

  return (
    <div
      id="dice-3d-stage-overlay"
      className={cn(
        "fixed inset-0 z-50 flex flex-col justify-between p-6 select-none transition-all duration-300 touch-none",
        currentRoll
          ? "pointer-events-auto bg-black/35 backdrop-blur-[2px] opacity-100"
          : "pointer-events-none opacity-0"
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Slingshot Drag Vector Visualizer */}
      {dragVector && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <defs>
            <linearGradient id="dragGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <line
            x1={dragVector.startX}
            y1={dragVector.startY}
            x2={dragVector.currX}
            y2={dragVector.currY}
            stroke="url(#dragGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="6 6"
          />
          <circle
            cx={dragVector.currX}
            cy={dragVector.currY}
            r="12"
            fill="#ef4444"
            className="animate-ping"
          />
          <circle cx={dragVector.currX} cy={dragVector.currY} r="8" fill="#f59e0b" />
        </svg>
      )}

      {currentRoll && (
        <>
          {/* Top Header Bar */}
          <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto animate-in fade-in duration-200">
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md">
              <div
                className="w-3.5 h-3.5 rounded-full ring-2 ring-zinc-700 shadow"
                style={{ backgroundColor: currentRoll.userColor || "#3b82f6" }}
              />
              <div>
                <div className="text-xs text-zinc-300 font-medium">
                  پرتاب فیزیکی تاس توسط:{" "}
                  <span className="text-zinc-100 font-bold">{currentRoll.userName}</span>
                </div>
                {rollLabel && (
                  <div className="text-[11px] text-amber-400 font-fa">
                    هدف: {rollLabel}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-dice3d-reroll"
                onClick={handleReroll}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl text-xs font-medium transition-all shadow-lg cursor-pointer"
                title="پرتاب مجدد (Re-roll)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>پرتاب مجدد</span>
              </button>

              <button
                id="btn-dice3d-close"
                onClick={handleDismiss}
                className="p-2 bg-zinc-900/90 hover:bg-rose-950/80 hover:text-rose-400 text-zinc-400 border border-zinc-800 rounded-xl transition-colors shadow-lg cursor-pointer"
                title="بستن صفحه ۳بعدی"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Aiming & Drag Hint Badge */}
          {isAiming && (
            <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none animate-pulse">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950/85 border border-amber-500/40 rounded-full shadow-2xl backdrop-blur-md text-amber-300 font-fa text-sm font-medium">
                <MousePointerClick className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>موس را بکشید و رها کنید تا تاس پرتاب شود!</span>
              </div>
            </div>
          )}

          {/* Bottom Result Banner & Formula Breakdown */}
          {showResultBanner && (
            <div className="relative z-10 w-full max-w-xl mx-auto animate-in zoom-in-95 fade-in slide-in-from-bottom-6 duration-200">
              <div
                className={cn(
                  "relative p-5 rounded-3xl border shadow-2xl backdrop-blur-xl text-center overflow-hidden transition-all",
                  isCrit
                    ? "bg-amber-950/90 border-amber-500/80 shadow-amber-500/30"
                    : isFumble
                    ? "bg-rose-950/90 border-rose-500/80 shadow-rose-500/30"
                    : "bg-zinc-950/90 border-zinc-800 shadow-black/70"
                )}
              >
                {/* Ambient Corner Sparkle for Crits */}
                {isCrit && (
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-500/30 rounded-full blur-xl pointer-events-none" />
                )}

                {/* Critical & Fumble Badges */}
                {isCrit && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/25 border border-amber-500/60 rounded-full text-amber-300 font-black text-xs mb-2 animate-bounce">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>ضربه‌ی بحرانی! (Natural 20 - Critical Hit!)</span>
                  </div>
                )}

                {isFumble && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-rose-500/25 border border-rose-500/60 rounded-full text-rose-300 font-black text-xs mb-2 animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>شکست فاجعه‌بار! (Natural 1 - Critical Fumble)</span>
                  </div>
                )}

                {/* Giant Total Result Display */}
                <div className="flex items-center justify-center gap-3 my-1">
                  <span className="text-5xl md:text-6xl font-black font-mono tracking-tight text-white drop-shadow-lg">
                    {currentRoll.total}
                  </span>
                </div>

                {/* Formula & Dice Individual Values */}
                <div className="flex items-center justify-center flex-wrap gap-2 mt-2 text-xs text-zinc-300 font-mono">
                  <span className="text-zinc-400 font-bold">{currentRoll.formula}</span>
                  <span>=</span>
                  <div className="flex items-center gap-1">
                    [
                    {currentRoll.dice.map((d, i) => {
                      const val = d.result ?? (d as any).value;
                      return (
                        <span
                          key={i}
                          className={cn(
                            "px-1.5 py-0.5 rounded font-bold",
                            d.sides === 20 && val === 20
                              ? "bg-amber-500/30 text-amber-300 ring-1 ring-amber-500/50"
                              : d.sides === 20 && val === 1
                              ? "bg-rose-500/30 text-rose-300 ring-1 ring-rose-500/50"
                              : "bg-zinc-800 text-zinc-200"
                          )}
                        >
                          {val}
                        </span>
                      );
                    })}
                    ]
                  </div>
                  {currentRoll.modifier ? (
                    <span className="text-amber-400 font-bold">
                      {currentRoll.modifier > 0
                        ? `+${currentRoll.modifier}`
                        : `${currentRoll.modifier}`}
                    </span>
                  ) : null}
                </div>

                {/* Dismiss Hint */}
                <div className="mt-3 text-[11px] text-zinc-500 font-fa">
                  برای بستن، روی صفحه کلیک کنید یا دکمه ✕ را بزنید
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
