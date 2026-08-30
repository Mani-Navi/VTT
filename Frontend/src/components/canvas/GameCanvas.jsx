import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer } from "react-konva";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { TOOLS, DRAW_MODES, FOG_ACTIONS, FOG_BRUSH_SHAPES } from "../../constants/tools";
import { MapLayer } from "./MapLayer.jsx";
import { GridLayer } from "./GridLayer.jsx";
import { TokenLayer } from "./TokenLayer.jsx";
import { DrawingLayer } from "./DrawingLayer.jsx";
import { FogLayer } from "./FogLayer.jsx";
import { RulerLayer } from "./RulerLayer.jsx";
import { PingLayer } from "./PingLayer.jsx";
import { wsService } from "../../services/websocket.service";
import {
  ImagePlus,
  Lock,
  Compass,
  Sparkles,
  Map as MapIcon,
  ShieldCheck,
  Eye,
  UserCheck,
  Dices,
  Scroll
} from "lucide-react";

export const GameCanvas = ({ isGM = false, permissions = {} }) => {
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  const [currentMapDimensions, setCurrentMapDimensions] = useState({ width: 2000, height: 1500 });

  const activeTool = useCanvasStore((state) => state.activeTool);
  const activeDrawShape = useCanvasStore((state) => state.activeDrawShape);
  const fogBrushShape = useCanvasStore((state) => state.fogBrushShape);
  const fogAction = useCanvasStore((state) => state.fogAction);
  const fogBrushRadius = useCanvasStore((state) => state.fogBrushRadius);
  const zoom = useCanvasStore((state) => state.zoom);
  const stageX = useCanvasStore((state) => state.stageX);
  const stageY = useCanvasStore((state) => state.stageY);
  const drawStrokeColor = useCanvasStore((state) => state.drawStrokeColor);
  const drawStrokeWidth = useCanvasStore((state) => state.drawStrokeWidth);
  const drawFillColor = useCanvasStore((state) => state.drawFillColor);
  const isDrawGMLayer = useCanvasStore((state) => state.isDrawGMLayer);

  const setZoom = useCanvasStore((state) => state.setZoom);
  const setStagePos = useCanvasStore((state) => state.setStagePos);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  const startMeasurement = useCanvasStore((state) => state.startMeasurement);
  const updateMeasurement = useCanvasStore((state) => state.updateMeasurement);
  const addMeasurementWaypoint = useCanvasStore((state) => state.addMeasurementWaypoint);
  const endMeasurement = useCanvasStore((state) => state.endMeasurement);
  const setLaserPosition = useCanvasStore((state) => state.setLaserPosition);
  const toggleMenu = useCanvasStore((state) => state.toggleMenu);

  const currentScene = useSceneStore((state) => state.currentScene);
  const addDrawing = useSceneStore((state) => state.addDrawing);
  const addFogShape = useSceneStore((state) => state.addFogShape);
  const addPing = useSceneStore((state) => state.addPing);
  const user = useAuthStore((state) => state.user);

  const [liveDrawing, setLiveDrawing] = useState(null);
  const [currentLinePoints, setCurrentLinePoints] = useState([]);
  const [shapeStart, setShapeStart] = useState(null);
  const isInteracting = useRef(false);

  const activeMapUrl = currentScene?.mapUrl || currentScene?.assetUrl || "";
  const hasActiveMap = Boolean(activeMapUrl && activeMapUrl.trim() !== "");

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 300 && entry.contentRect.height > 300) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMapDimensions = useCallback((w, h) => {
    setCurrentMapDimensions({ width: w, height: h });
  }, []);

  const mapWidth = currentMapDimensions.width || currentScene?.mapWidth || 2000;
  const mapHeight = currentMapDimensions.height || currentScene?.mapHeight || 1500;

  const getPointerCanvasPos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pointer = stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };

    return {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY(),
    };
  }, []);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.08;
    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.min(Math.max(newScale, 0.2), 3.5);

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setZoom(clampedScale);
    setStagePos(newPos.x, newPos.y);
  };

  const handleMouseDown = (e) => {
    if (!hasActiveMap) return;

    const isClickedOnEmpty = e.target === e.target.getStage() || e.target.name() === "map-background";
    if (isClickedOnEmpty) {
      clearSelection();
    }

    if (!isClickedOnEmpty) return;

    const pos = getPointerCanvasPos();
    if (pos.x < 0 || pos.x > mapWidth || pos.y < 0 || pos.y > mapHeight) return;

    if (activeTool === TOOLS.DRAW) {
      isInteracting.current = true;
      setShapeStart(pos);

      if (activeDrawShape === DRAW_MODES.MARKER || activeDrawShape === DRAW_MODES.BRUSH) {
        setCurrentLinePoints([pos.x, pos.y]);
        setLiveDrawing({
          type: activeDrawShape,
          points: [pos.x, pos.y],
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: drawFillColor,
          isGMLayer: isDrawGMLayer,
        });
      }
    }

    if (activeTool === TOOLS.TEXT) {
      const textContent = prompt("متن مورد نظر را وارد کنید:");
      if (textContent && textContent.trim()) {
        const newTextDraw = {
          id: `text-${Date.now()}`,
          type: "text",
          x: pos.x,
          y: pos.y,
          text: textContent.trim(),
          fontSize: 20,
          fontFamily: "Vazirmatn",
          stroke: drawStrokeColor,
          strokeWidth: 1,
          isGMLayer: isDrawGMLayer,
        };
        addDrawing(newTextDraw);
        wsService.send("DRAWING_ADD", {
          ...newTextDraw,
          sceneId: currentScene?.id,
        });
      }
    }

    if (activeTool === TOOLS.RULER) {
      if (e.evt.button === 0) {
        if (!isInteracting.current) {
          isInteracting.current = true;
          startMeasurement(pos.x, pos.y);
        } else {
          addMeasurementWaypoint(pos.x, pos.y);
        }
      } else if (e.evt.button === 2) {
        endMeasurement();
        isInteracting.current = false;
      }
    }

    if (activeTool === TOOLS.FOG && (isGM || permissions?.canFog)) {
      isInteracting.current = true;
      setShapeStart(pos);

      if (fogBrushShape === FOG_BRUSH_SHAPES.FREEHAND) {
        setCurrentLinePoints([pos.x, pos.y]);
      } else if (fogBrushShape === FOG_BRUSH_SHAPES.CIRCLE) {
        const fogShape = {
          id: `fog-${Date.now()}`,
          type: "circle",
          x: pos.x,
          y: pos.y,
          radius: fogBrushRadius || 70,
          isCover: fogAction === FOG_ACTIONS.HIDE,
        };
        addFogShape(fogShape);
        wsService.send("FOG_UPDATE", {
          ...fogShape,
          sceneId: currentScene?.id,
        });
      }
    }
  };

  const handleMouseMove = () => {
    if (!hasActiveMap) return;
    const pos = getPointerCanvasPos();

    if (activeTool === TOOLS.LASER) {
      setLaserPosition(pos);
    }

    if (!isInteracting.current) return;

    if (activeTool === TOOLS.RULER) {
      updateMeasurement(pos.x, pos.y);
    }

    if (activeTool === TOOLS.DRAW && shapeStart) {
      if (activeDrawShape === DRAW_MODES.MARKER || activeDrawShape === DRAW_MODES.BRUSH) {
        const updatedPoints = [...currentLinePoints, pos.x, pos.y];
        setCurrentLinePoints(updatedPoints);
        setLiveDrawing({
          type: activeDrawShape,
          points: updatedPoints,
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: drawFillColor,
          isGMLayer: isDrawGMLayer,
        });
      } else if (activeDrawShape === DRAW_MODES.RECTANGLE) {
        setLiveDrawing({
          type: DRAW_MODES.RECTANGLE,
          x: Math.min(shapeStart.x, pos.x),
          y: Math.min(shapeStart.y, pos.y),
          width: Math.abs(pos.x - shapeStart.x),
          height: Math.abs(pos.y - shapeStart.y),
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: drawFillColor,
          isGMLayer: isDrawGMLayer,
        });
      } else if (activeDrawShape === DRAW_MODES.CIRCLE) {
        const radius = Math.sqrt(Math.pow(pos.x - shapeStart.x, 2) + Math.pow(pos.y - shapeStart.y, 2));
        setLiveDrawing({
          type: DRAW_MODES.CIRCLE,
          x: shapeStart.x,
          y: shapeStart.y,
          radius: radius,
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: drawFillColor,
          isGMLayer: isDrawGMLayer,
        });
      } else if (activeDrawShape === DRAW_MODES.TRIANGLE || activeDrawShape === DRAW_MODES.HEXAGON) {
        const radius = Math.sqrt(Math.pow(pos.x - shapeStart.x, 2) + Math.pow(pos.y - shapeStart.y, 2));
        setLiveDrawing({
          type: activeDrawShape,
          x: shapeStart.x,
          y: shapeStart.y,
          radius: radius,
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: drawFillColor,
          isGMLayer: isDrawGMLayer,
        });
      } else if (activeDrawShape === DRAW_MODES.LINE) {
        setLiveDrawing({
          type: DRAW_MODES.LINE,
          points: [shapeStart.x, shapeStart.y, pos.x, pos.y],
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          isGMLayer: isDrawGMLayer,
        });
      }
    }

    if (activeTool === TOOLS.FOG && (isGM || permissions?.canFog) && shapeStart) {
      if (fogBrushShape === FOG_BRUSH_SHAPES.FREEHAND) {
        setCurrentLinePoints((prev) => [...prev, pos.x, pos.y]);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isInteracting.current || !hasActiveMap) return;
    const pos = getPointerCanvasPos();

    if (activeTool === TOOLS.DRAW && shapeStart) {
      if (liveDrawing) {
        const newDraw = {
          ...liveDrawing,
          id: `draw-${Date.now()}`,
        };
        addDrawing(newDraw);
        wsService.send("DRAWING_ADD", {
          ...newDraw,
          sceneId: currentScene?.id,
        });
      }

      setLiveDrawing(null);
      setCurrentLinePoints([]);
      setShapeStart(null);
      isInteracting.current = false;
    }

    if (activeTool === TOOLS.FOG && (isGM || permissions?.canFog) && shapeStart) {
      if (fogBrushShape === FOG_BRUSH_SHAPES.RECTANGLE) {
        const w = pos.x - shapeStart.x;
        const h = pos.y - shapeStart.y;
        if (Math.abs(w) > 5 && Math.abs(h) > 5) {
          const fogShape = {
            id: `fog-${Date.now()}`,
            type: "rect",
            x: Math.min(shapeStart.x, pos.x),
            y: Math.min(shapeStart.y, pos.y),
            width: Math.abs(w),
            height: Math.abs(h),
            isCover: fogAction === FOG_ACTIONS.HIDE,
          };
          addFogShape(fogShape);
          wsService.send("FOG_UPDATE", {
            ...fogShape,
            sceneId: currentScene?.id,
          });
        }
      } else if (fogBrushShape === FOG_BRUSH_SHAPES.FREEHAND && currentLinePoints.length >= 4) {
        const fogShape = {
          id: `fog-${Date.now()}`,
          type: "freehand",
          points: currentLinePoints,
          isCover: fogAction === FOG_ACTIONS.HIDE,
        };
        addFogShape(fogShape);
        wsService.send("FOG_UPDATE", {
          ...fogShape,
          sceneId: currentScene?.id,
        });
      }

      setCurrentLinePoints([]);
      setShapeStart(null);
      isInteracting.current = false;
    }
  };

  const handleDblClick = (e) => {
    if (!hasActiveMap) return;
    if (e.target.findAncestor?.("#tokens-layer-group")) return;

    const pos = getPointerCanvasPos();
    const pingData = {
      userId: user?.id || "user-1",
      userName: user?.username || "Player",
      userColor: isGM ? "#f59e0b" : "#10b981",
      x: pos.x,
      y: pos.y,
    };
    addPing(pingData);
    wsService.send("PING_CREATE", pingData);
  };

  return (
      <div
          ref={containerRef}
          id="vtt-game-canvas-container"
          className="relative w-full h-full overflow-hidden select-none"
          style={{
            background: "radial-gradient(circle at center, #111420 0%, #07080c 100%)",
          }}
          onContextMenu={(e) => e.preventDefault()}
      >
        {/* الگوی گرید پس‌زمینه */}
        <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(to right, #f59e0b 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }}
        />

        {/* کارت راهنما قبل از آپلود مپ */}
        {!hasActiveMap && (
            <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center overflow-y-auto custom-scrollbar pointer-events-auto"
                dir="rtl"
            >
              <div className="relative z-10 max-w-2xl w-full bg-zinc-950/80 border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">

                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-xl shadow-amber-500/10">
                    <Compass className="w-8 h-8 animate-spin-slow stroke-[1.8]" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>میز مجازی Persian VTT</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-black text-zinc-100">
                    به ماجراجویی خوش آمدید!
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md">
                    این صحنه آماده شروع بازی شماست. راهنمای زیر را برای آغاز نبرد و کاوش دنبال کنید:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-right">
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-amber-500/20 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Scroll className="w-4 h-4" />
                      <span>راهنمای دانجن‌مستر (GM)</span>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-2 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <MapIcon className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>۱. آپلود نقشه:</strong> تصویر نبرد را از کتابخانه است‌ها بارگذاری کنید.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>۲. تنظیمات گرید و صحنه:</strong> ابعاد و شرایط بازی را مشخص کنید.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>۳. مه جنگ و هیولاها:</strong> محیط را با مه پنهان و توکن‌ها را بچینید.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <Dices className="w-4 h-4" />
                      <span>راهنمای قهرمانان و بازیکنان</span>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-2 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>۱. کاراکتر من:</strong> با دکمه پایین، توکن اختصاصی‌تان را روی مپ بیاورید.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>۲. وضعیت سلامت:</strong> مقدار HP، زره و شرایط را در صورت دسترسی ویرایش کنید.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>۳. آماده‌باش:</strong> با بارگذاری نقشه توسط GM، سفر شما آغاز می‌شود!</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  {isGM || permissions?.canAssets ? (
                      <button
                          onClick={() => toggleMenu("asset")}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs md:text-sm flex items-center gap-2.5 shadow-xl shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <ImagePlus className="w-4 h-4 stroke-[2.5]" />
                        <span>انتخاب یا بارگذاری نقشه در صحنه</span>
                      </button>
                  ) : (
                      <div className="flex items-center gap-2.5 text-xs text-zinc-400 bg-zinc-900/80 px-5 py-2.5 rounded-2xl border border-zinc-800 shadow-inner">
                        <Lock className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>در انتظار بارگذاری نقشه صحنه توسط دانجن‌مستر (GM)...</span>
                      </div>
                  )}
                </div>

              </div>
            </div>
        )}

        {/* بوم اصلی */}
        <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            scaleX={zoom}
            scaleY={zoom}
            x={stageX}
            y={stageY}
            draggable={hasActiveMap && activeTool === TOOLS.PAN}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDblClick={handleDblClick}
            onContextMenu={(e) => e.evt.preventDefault()}
            onDragEnd={(e) => {
              if (e.target === stageRef.current && activeTool === TOOLS.PAN) {
                setStagePos(e.target.x(), e.target.y());
              }
            }}
        >
          {/* لایه ۱: نقشه و گرید */}
          <Layer id="layer-background" listening={false}>
            <MapLayer
                mapUrl={activeMapUrl}
                width={mapWidth}
                height={mapHeight}
                onDimensionsChange={handleMapDimensions}
            />
            {currentScene?.grid && hasActiveMap && (
                <GridLayer
                    grid={currentScene.grid}
                    width={mapWidth}
                    height={mapHeight}
                />
            )}
          </Layer>

          {hasActiveMap && (
              <>
                {/* لایه ۲: ترسیمات و مه جنگ */}
                <Layer
                    id="layer-canvas-features"
                    clip={{ x: 0, y: 0, width: mapWidth, height: mapHeight }}
                    listening={activeTool === TOOLS.DRAW || activeTool === TOOLS.FOG || activeTool === TOOLS.RULER}
                >
                  <DrawingLayer liveDrawing={liveDrawing} />
                  <FogLayer
                      width={mapWidth}
                      height={mapHeight}
                  />
                  <RulerLayer />
                  <PingLayer />
                </Layer>

                {/* لایه ۳: توکن‌ها */}
                <Layer id="layer-tokens" listening={true}>
                  <TokenLayer gridSize={currentScene?.grid?.size || 60} isGM={isGM} />
                </Layer>
              </>
          )}
        </Stage>
      </div>
  );
};