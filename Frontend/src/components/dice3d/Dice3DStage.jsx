import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import confetti from "canvas-confetti";
import { Sparkles, X, MousePointerClick, Move } from "lucide-react";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { buildNumberedPolyDie } from "./polyhedralDice.js";
import { cn } from "../../utils/cn";

export const Dice3DStage = () => {
  const canvasRef = useRef(null);

  const active3DRoll = useCanvasStore((state) => state.active3DRoll);
  const is3DDiceEnabled = useCanvasStore((state) => state.is3DDiceEnabled);
  const clear3DRoll = useCanvasStore((state) => state.clear3DRoll);
  const trigger3DRoll = useCanvasStore((state) => state.trigger3DRoll);
  const chatMessages = useSceneStore((state) => state.chatMessages) || [];

  const [currentRoll, setCurrentRoll] = useState(null);
  const [showResultBanner, setShowResultBanner] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);

  const animationFrameRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const worldRef = useRef(null);
  const diceGroupRef = useRef(null);
  const activeDiceRef = useRef([]);
  const lastProcessedRollIdRef = useRef(null);
  const isThrownRef = useRef(false);

  const playBounceSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(160 + Math.random() * 120, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  }, []);

  const triggerCritCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.55 },
        colors: ["#fbbf24", "#f59e0b", "#d97706", "#ffffff", "#10b981"],
      });
    } catch {
      // Ignore
    }
  }, []);

  // گوش دادن به آخرین تاس‌های ثبت شده در استور
  useEffect(() => {
    if (!is3DDiceEnabled || chatMessages.length === 0) return;
    const latest = chatMessages[chatMessages.length - 1];
    if (latest && latest.diceRoll && latest.diceRoll.id !== lastProcessedRollIdRef.current) {
      lastProcessedRollIdRef.current = latest.diceRoll.id;
      trigger3DRoll(latest.diceRoll);
    }
  }, [chatMessages, is3DDiceEnabled, trigger3DRoll]);

  useEffect(() => {
    if (active3DRoll) {
      setCurrentRoll(active3DRoll);
      setShowResultBanner(false);
    }
  }, [active3DRoll]);

  // ساخت دیواره‌های سینی تاس در Cannon
  const buildTrayWalls = (world) => {
    const wallMaterial = new CANNON.Material({ friction: 0.2, restitution: 0.7 });
    const wallThickness = 1;
    const trayWidth = 24;
    const trayDepth = 18;
    const wallHeight = 10;

    // کف سینی
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: new CANNON.Material({ friction: 0.35, restitution: 0.55 }),
    });
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(floorBody);

    // دیواره جلو، عقب، چپ و راست سینی تاس
    const walls = [
      { pos: [0, wallHeight / 2, trayDepth / 2], size: [trayWidth / 2, wallHeight / 2, wallThickness] },
      { pos: [0, wallHeight / 2, -trayDepth / 2], size: [trayWidth / 2, wallHeight / 2, wallThickness] },
      { pos: [-trayWidth / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight / 2, trayDepth / 2] },
      { pos: [trayWidth / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight / 2, trayDepth / 2] },
    ];

    walls.forEach((w) => {
      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(...w.size)),
        material: wallMaterial,
      });
      body.position.set(...w.pos);
      world.addBody(body);
    });
  };

  // راه‌اندازی Three.js
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 19, 17);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff8eb, 2.5);
    mainLight.position.set(10, 26, 14);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const diceGroup = new THREE.Group();
    scene.add(diceGroup);
    diceGroupRef.current = diceGroup;

    const world = new CANNON.World();
    world.gravity.set(0, -32, 0);
    worldRef.current = world;

    buildTrayWalls(world);

    renderer.render(scene, camera);

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
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
    };
  }, []);

  // پرتاب فیزیکی تاس
  const flingDice = useCallback(
      (dragVector = { x: 0, y: -180 }) => {
        if (isThrownRef.current || !worldRef.current) return;
        isThrownRef.current = true;
        setIsAiming(false);

        const forceX = (dragVector.x / 20) * 1.5;
        const forceZ = Math.min(Math.max((dragVector.y / 15) * 1.8, -35), -14);
        const forceY = 6 + Math.random() * 4;

        activeDiceRef.current.forEach((die) => {
          die.body.velocity.set(
              forceX + (Math.random() - 0.5) * 8,
              forceY,
              forceZ + (Math.random() - 0.5) * 6
          );
          die.body.angularVelocity.set(
              (Math.random() - 0.5) * 40,
              (Math.random() - 0.5) * 40,
              (Math.random() - 0.5) * 40
          );
        });

        const startTime = performance.now();
        const world = worldRef.current;

        const animate = () => {
          const now = performance.now();
          const elapsed = (now - startTime) / 1000;
          world.step(1 / 60);

          let allSettled = true;

          activeDiceRef.current.forEach((die) => {
            die.mesh.position.copy(die.body.position);
            die.mesh.quaternion.copy(die.body.quaternion);

            const vel = die.body.velocity.length();
            if (!die.settled) {
              if (elapsed > 1.4 || (elapsed > 0.8 && vel < 0.25)) {
                die.settled = true;
                die.body.velocity.set(0, 0, 0);
              } else {
                allSettled = false;
              }
            } else if (die.targetQuaternion) {
              die.mesh.quaternion.slerp(die.targetQuaternion, 0.2);
            }
          });

          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }

          if (allSettled && elapsed > 1.3) {
            setShowResultBanner(true);
            if (currentRoll?.isCriticalHit) triggerCritCelebration();
            setTimeout(() => handleDismiss(), 6000);
          } else {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
      },
      [currentRoll, triggerCritCelebration]
  );

  // آماده‌سازی اولیه تاس‌ها در دست کاربر قبل از پرتاب
  useEffect(() => {
    if (!currentRoll || !sceneRef.current || !diceGroupRef.current || !worldRef.current) return;

    const diceGroup = diceGroupRef.current;
    const world = worldRef.current;

    activeDiceRef.current.forEach((d) => {
      world.removeBody(d.body);
      diceGroup.remove(d.mesh);
    });
    activeDiceRef.current = [];

    const diceList = currentRoll.dice || [{ sides: 20, result: currentRoll.total }];
    const count = Math.min(diceList.length, 10);
    const cameraViewDirection = new THREE.Vector3(0, 0.82, 0.57).normalize();
    const newActiveDice = [];

    diceList.slice(0, count).forEach((die, index) => {
      const sides = die.sides || 20;
      const result = die.result || 1;
      const { mesh, body, targetFaceNormal, theme } = buildNumberedPolyDie(sides, result);

      const startX = (index - (count - 1) / 2) * 2.6;
      mesh.position.set(startX, 9.0, 6.5);
      body.position.set(startX, 9.0, 6.5);

      body.addEventListener("collide", () => playBounceSound());

      const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
          targetFaceNormal,
          cameraViewDirection
      );

      diceGroup.add(mesh);
      world.addBody(body);

      newActiveDice.push({ mesh, body, sides, result, targetQuaternion, settled: false, theme });
    });

    activeDiceRef.current = newActiveDice;
    setIsAiming(true);
    isThrownRef.current = false;
    setShowResultBanner(false);

    // پرتاب خودکار پس از ۲ ثانیه در صورت عدم کشیدن دستی
    const autoFlingTimer = setTimeout(() => {
      if (!isThrownRef.current) flingDice({ x: 0, y: -180 });
    }, 2200);

    return () => clearTimeout(autoFlingTimer);
  }, [currentRoll, flingDice, playBounceSound]);

  const handleDismiss = () => {
    setCurrentRoll(null);
    clear3DRoll();
  };

  // کنترل کشش ماوس برای پرتاب دستی واقعی
  const handleMouseDown = (e) => {
    if (isAiming && !isThrownRef.current) {
      setDragStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e) => {
    if (dragStartPos && isAiming && !isThrownRef.current) {
      const deltaX = e.clientX - dragStartPos.x;
      const deltaY = e.clientY - dragStartPos.y;
      const drag = Math.hypot(deltaX, deltaY) > 20 ? { x: deltaX, y: deltaY } : { x: 0, y: -180 };
      flingDice(drag);
      setDragStartPos(null);
    }
  };

  return (
      <div
          id="dice-3d-stage-overlay"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className={cn(
              "fixed inset-0 z-50 flex flex-col justify-between p-6 select-none transition-all duration-300 font-fa",
              currentRoll ? "pointer-events-auto bg-black/40 backdrop-blur-xs opacity-100" : "pointer-events-none opacity-0"
          )}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {currentRoll && (
            <>
              <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto" dir="rtl">
                <div className="flex items-center gap-3 px-4 py-2 bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="text-xs text-zinc-300 font-medium">
                    پرتاب تاس فیزیکی توسط: <span className="text-amber-400 font-bold">{currentRoll.userName}</span>
                  </div>
                </div>

                <button
                    type="button"
                    onClick={handleDismiss}
                    className="p-2 bg-zinc-900/90 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-300 border border-zinc-800 rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* راهنمای پرتاب کششی */}
              {isAiming && (
                  <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none animate-pulse">
                    <div className="flex items-center gap-2 px-6 py-3 bg-zinc-950/90 border border-amber-500/50 rounded-full shadow-2xl text-amber-300 text-sm font-bold">
                      <Move className="w-4 h-4 text-amber-400 animate-bounce" />
                      <span>ماوس را بکشید و رها کنید تا تاس در سینی پرتاب شود!</span>
                    </div>
                  </div>
              )}

              {/* بنر نتیجه نهایی با استایل Titipool */}
              {showResultBanner && (
                  <div className="relative z-10 w-full max-w-md mx-auto animate-in zoom-in-95 duration-200">
                    <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-xl text-center">
                      {currentRoll.isCriticalHit && (
                          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500/25 border border-amber-500/60 rounded-full text-amber-300 font-black text-xs mb-2 animate-bounce">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>ضربه بحرانی! (Natural 20)</span>
                          </div>
                      )}
                      {currentRoll.isCriticalFail && (
                          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/25 border border-rose-500/60 rounded-full text-rose-300 font-black text-xs mb-2 animate-bounce">
                            <span>شکست فاجعه‌بار! (Natural 1)</span>
                          </div>
                      )}
                      <div className="text-7xl font-black font-mono text-white drop-shadow-2xl my-2">
                        {currentRoll.total}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-1">
                        {currentRoll.formula} ➔ [{currentRoll.dice?.map((d) => d.result).join(", ")}]
                      </div>
                    </div>
                  </div>
              )}
            </>
        )}
      </div>
  );
};