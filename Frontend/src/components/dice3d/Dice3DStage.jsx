import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import confetti from "canvas-confetti";
import { Sparkles, X, RotateCcw, ShieldAlert, MousePointerClick } from "lucide-react";
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
      osc.frequency.setValueAtTime(140 + Math.random() * 100, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }, []);

  const triggerCritCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#fbbf24", "#f59e0b", "#d97706", "#ffffff", "#10b981"],
      });
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (!is3DDiceEnabled) return;
    if (chatMessages.length === 0) return;
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

  // راه‌اندازی صحنه Three.js و جهان فیزیک CANNON
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 18, 16);
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff8eb, 2.5);
    mainLight.position.set(10, 26, 14);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const diceGroup = new THREE.Group();
    scene.add(diceGroup);
    diceGroupRef.current = diceGroup;

    const world = new CANNON.World();
    world.gravity.set(0, -28, 0);
    worldRef.current = world;

    const floorBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: new CANNON.Material({ friction: 0.35, restitution: 0.55 }),
    });
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(floorBody);

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

  const flingDice = useCallback(
      (dragDelta = { x: 0, y: -160 }) => {
        if (isThrownRef.current || !worldRef.current) return;
        isThrownRef.current = true;
        setIsAiming(false);

        const power = Math.min(Math.hypot(dragDelta.x, dragDelta.y) / 12, 18);
        const forwardForce = Math.max(power * 1.6, 12);

        activeDiceRef.current.forEach((die) => {
          die.body.velocity.set(
              (Math.random() - 0.5) * 6,
              2 + Math.random() * 3,
              -forwardForce + (Math.random() - 0.5) * 4
          );
          die.body.angularVelocity.set(
              (Math.random() - 0.5) * 30,
              (Math.random() - 0.5) * 30,
              (Math.random() - 0.5) * 30
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
              if (elapsed > 1.3 || (elapsed > 0.8 && vel < 0.3)) {
                die.settled = true;
                die.body.velocity.set(0, 0, 0);
              } else {
                allSettled = false;
              }
            } else if (die.targetQuaternion) {
              die.mesh.quaternion.slerp(die.targetQuaternion, 0.18);
            }
          });

          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }

          if (allSettled && elapsed > 1.4) {
            setShowResultBanner(true);
            if (currentRoll?.isCriticalHit) triggerCritCelebration();
            setTimeout(() => handleDismiss(), 5500);
          } else {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
      },
      [currentRoll, triggerCritCelebration]
  );

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
    const count = Math.min(diceList.length, 8);
    const cameraViewDirection = new THREE.Vector3(0, 0.82, 0.57).normalize();
    const newActiveDice = [];

    diceList.slice(0, count).forEach((die, index) => {
      const sides = die.sides || 20;
      const result = die.result || 1;
      const { mesh, body, targetFaceNormal, theme } = buildNumberedPolyDie(sides, result);

      const startX = (index - (count - 1) / 2) * 2.8;
      mesh.position.set(startX, 8.5, 6.0);
      body.position.set(startX, 8.5, 6.0);

      body.addEventListener("collide", () => playBounceSound());

      const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(targetFaceNormal, cameraViewDirection);

      diceGroup.add(mesh);
      world.addBody(body);

      newActiveDice.push({ mesh, body, sides, result, targetQuaternion, settled: false, theme });
    });

    activeDiceRef.current = newActiveDice;
    setIsAiming(true);
    isThrownRef.current = false;
    setShowResultBanner(false);

    const autoFlingTimer = setTimeout(() => {
      if (!isThrownRef.current) flingDice({ x: 0, y: -160 });
    }, 900);

    return () => clearTimeout(autoFlingTimer);
  }, [currentRoll, flingDice, playBounceSound]);

  const handleDismiss = () => {
    setCurrentRoll(null);
    clear3DRoll();
  };

  return (
      <div
          id="dice-3d-stage-overlay"
          className={cn(
              "fixed inset-0 z-50 flex flex-col justify-between p-6 select-none transition-all duration-300 font-fa",
              currentRoll ? "pointer-events-auto bg-black/35 backdrop-blur-xs opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={() => {
            if (isAiming) flingDice({ x: 0, y: -160 });
          }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {currentRoll && (
            <>
              <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto" dir="rtl">
                <div className="flex items-center gap-3 px-4 py-2 bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="text-xs text-zinc-300 font-medium">
                    پرتاب تاس فیزیکی توسط: <span className="text-zinc-100 font-bold">{currentRoll.userName}</span>
                  </div>
                </div>

                <button
                    type="button"
                    onClick={handleDismiss}
                    className="p-2 bg-zinc-900/90 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-300 border border-zinc-800 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isAiming && (
                  <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none animate-pulse">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950/85 border border-amber-500/40 rounded-full shadow-2xl text-amber-300 text-sm">
                      <MousePointerClick className="w-4 h-4 text-amber-400 animate-bounce" />
                      <span>کلیک کنید تا تاس پرتاب شود!</span>
                    </div>
                  </div>
              )}

              {showResultBanner && (
                  <div className="relative z-10 w-full max-w-md mx-auto animate-in zoom-in-95 duration-200">
                    <div className="p-5 rounded-3xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl text-center">
                      {currentRoll.isCriticalHit && (
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/25 border border-amber-500/60 rounded-full text-amber-300 font-black text-xs mb-2 animate-bounce">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>ضربه بحرانی! (Natural 20)</span>
                          </div>
                      )}
                      <div className="text-6xl font-black font-mono text-white drop-shadow-lg my-1">
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