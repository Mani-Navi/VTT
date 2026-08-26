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
import { MapPin, ImagePlus, Lock } from "lucide-react";

export const GameCanvas = ({ isGM = false, permissions = {} }) => {
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

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
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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
    const clampedScale = Math.min(Math.max(newScale, 0.15), 3.5);

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

    const isClickedOnEmpty = e.target === e.target.getStage();
    if (isClickedOnEmpty && activeTool === TOOLS.SELECT) {
      clearSelection();
    }

    const pos = getPointerCanvasPos();

    // ۱. ابزار نقاشی (Draw)
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

    // ۲. ابزار نوشت‌افزار (Text)
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

    // ۳. ابزار خط‌کش (Ruler)
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

    // ۴. ابزار مه جنگ (Fog of War)
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

  const handleDblClick = () => {
    if (!hasActiveMap) return;
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
          className="relative w-full h-full bg-[#090a0f] overflow-hidden select-none"
          onContextMenu={(e) => e.preventDefault()}
      >
        {/* گیت عدم انتخاب نقشه */}
        {!hasActiveMap && (
            <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#090a0f]/90 backdrop-blur-md p-6 text-center"
                dir="rtl"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-xl shadow-amber-500/10">
                <MapPin className="w-8 h-8 animate-bounce" />
              </div>
              <h2 className="text-xl font-black text-zinc-100 mb-2">هنوز نقشه‌ای در صحنه قرار ندارد</h2>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed mb-6">
                برای فعال‌سازی ابزارهای بازی، توکن‌ها و مه جنگ، ابتدا یک نقشه از بخش Asset Library انتخاب یا آپلود کنید.
              </p>

              {isGM || permissions?.canAssets ? (
                  <button
                      onClick={() => toggleMenu("asset")}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <ImagePlus className="w-4 h-4" />
                    انتخاب یا بارگذاری نقشه از Asset Library
                  </button>
              ) : (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/60 px-4 py-2 rounded-xl border border-zinc-800">
                    <Lock className="w-4 h-4 text-amber-500/60" />
                    <span>منتظر بارگذاری نقشه توسط دانجن‌مستر (GM)...</span>
                  </div>
              )}
            </div>
        )}

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
            onDragEnd={(e) => {
              if (e.target === stageRef.current) {
                setStagePos(e.target.x(), e.target.y());
              }
            }}
        >
          <Layer id="layer-map">
            <MapLayer
                mapUrl={activeMapUrl}
                width={currentScene?.mapWidth || 2000}
                height={currentScene?.mapHeight || 1500}
            />
          </Layer>

          {hasActiveMap && (
              <>
                <Layer id="layer-grid">
                  {currentScene?.grid && (
                      <GridLayer
                          grid={currentScene.grid}
                          width={currentScene.mapWidth || 2000}
                          height={currentScene.mapHeight || 1500}
                      />
                  )}
                </Layer>

                <Layer id="layer-drawings">
                  <DrawingLayer liveDrawing={liveDrawing} />
                </Layer>

                <Layer id="layer-tokens">
                  <TokenLayer gridSize={currentScene?.grid?.size || 60} />
                </Layer>

                <Layer id="layer-fog">
                  <FogLayer
                      width={currentScene?.mapWidth || 2000}
                      height={currentScene?.mapHeight || 1500}
                  />
                </Layer>

                <Layer id="layer-ruler">
                  <RulerLayer />
                </Layer>

                <Layer id="layer-pings">
                  <PingLayer />
                </Layer>
              </>
          )}
        </Stage>
      </div>
  );
};