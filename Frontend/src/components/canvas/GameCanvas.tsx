import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Line, Rect, Circle, Arrow, Group } from "react-konva";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { usePermissions } from "../../hooks/usePermissions";
import { TOOLS, DRAW_SHAPES, FOG_MODES } from "../../constants/tools";
import { MapLayer } from "./MapLayer";
import { GridLayer } from "./GridLayer";
import { TokenLayer } from "./TokenLayer";
import { DrawingLayer } from "./DrawingLayer";
import { FogLayer } from "./FogLayer";
import { RulerLayer } from "./RulerLayer";
import { PingLayer } from "./PingLayer";
import { wsService } from "../../services/websocket.service";

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const activeTool = useCanvasStore((state) => state.activeTool);
  const activeDrawShape = useCanvasStore((state) => state.activeDrawShape);
  const activeFogMode = useCanvasStore((state) => state.activeFogMode);
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

  const currentScene = useSceneStore((state) => state.currentScene);
  const addDrawing = useSceneStore((state) => state.addDrawing);
  const addFogShape = useSceneStore((state) => state.addFogShape);
  const addPing = useSceneStore((state) => state.addPing);
  const user = useAuthStore((state) => state.user);
  const { isGM } = usePermissions();

  // Active interaction preview shape (e.g. current line being drawn)
  const [currentLinePoints, setCurrentLinePoints] = useState<number[]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeCurrent, setShapeCurrent] = useState<{ x: number; y: number } | null>(null);
  const [hoverCursorPos, setHoverCursorPos] = useState<{ x: number; y: number } | null>(null);
  const lastFogStampPos = useRef<{ x: number; y: number } | null>(null);
  const isInteracting = useRef(false);

  // Resize observer for container
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

  // Helper to convert stage pointer to map coordinate space
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

  // Mouse wheel zoom centered on cursor
  const handleWheel = (e: any) => {
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

  // Stage Mouse Down
  const handleMouseDown = (e: any) => {
    // If clicked empty space, clear selection
    const isClickedOnEmpty = e.target === e.target.getStage();
    if (isClickedOnEmpty && activeTool === TOOLS.SELECT) {
      clearSelection();
    }

    const pos = getPointerCanvasPos();

    // 1. Draw Tool
    if (activeTool === TOOLS.DRAW) {
      isInteracting.current = true;
      setShapeStart(pos);
      setShapeCurrent(pos);

      if (activeDrawShape === DRAW_SHAPES.FREEHAND) {
        setCurrentLinePoints([pos.x, pos.y]);
      }
    }

    // 2. Ruler Tool
    if (activeTool === TOOLS.RULER) {
      if (e.evt.button === 0) {
        if (!isInteracting.current) {
          isInteracting.current = true;
          startMeasurement(pos.x, pos.y);
        } else {
          // Add waypoint on subsequent click
          addMeasurementWaypoint(pos.x, pos.y);
        }
      } else if (e.evt.button === 2) {
        // Right click cancels ruler
        endMeasurement();
        isInteracting.current = false;
      }
    }

    // 3. Fog Tool (GM only)
    if (activeTool === TOOLS.FOG && isGM) {
      isInteracting.current = true;
      setShapeStart(pos);
      setShapeCurrent(pos);
      lastFogStampPos.current = pos;

      const isCover =
        fogAction === "hide" ||
        activeFogMode === FOG_MODES.HIDE_BRUSH ||
        activeFogMode === FOG_MODES.HIDE_RECT ||
        activeFogMode === FOG_MODES.HIDE_CIRCLE;

      // If using circular brush, stamp immediately on click
      if (
        fogBrushShape === "circle" ||
        activeFogMode === FOG_MODES.REVEAL_BRUSH ||
        activeFogMode === FOG_MODES.HIDE_BRUSH ||
        activeFogMode === FOG_MODES.REVEAL_CIRCLE ||
        activeFogMode === FOG_MODES.HIDE_CIRCLE
      ) {
        const fogShape = {
          type: "circle" as const,
          x: pos.x,
          y: pos.y,
          radius: fogBrushRadius,
          isCover,
        };
        addFogShape(fogShape);
        wsService.send("FOG_UPDATE", fogShape);
      }
    }

    // 4. Laser Tool
    if (activeTool === TOOLS.LASER) {
      setLaserPosition(pos);
      wsService.send("LASER_UPDATE", { ...pos, active: true });
    }
  };

  // Stage Mouse Move
  const handleMouseMove = () => {
    const pos = getPointerCanvasPos();

    // Track hover position for Fog Brush follower and Laser
    setHoverCursorPos(pos);

    // Laser pointer
    if (activeTool === TOOLS.LASER) {
      setLaserPosition(pos);
      wsService.send("LASER_UPDATE", { ...pos, active: true });
    }

    if (!isInteracting.current) return;

    // Ruler update
    if (activeTool === TOOLS.RULER) {
      updateMeasurement(pos.x, pos.y);
    }

    // Draw Tool update
    if (activeTool === TOOLS.DRAW) {
      setShapeCurrent(pos);
      if (activeDrawShape === DRAW_SHAPES.FREEHAND) {
        setCurrentLinePoints((prev) => [...prev, pos.x, pos.y]);
      }
    }

    // Fog update
    if (activeTool === TOOLS.FOG && isGM) {
      setShapeCurrent(pos);

      // If dragging with circular brush, stamp along continuous path
      if (
        fogBrushShape === "circle" ||
        activeFogMode === FOG_MODES.REVEAL_BRUSH ||
        activeFogMode === FOG_MODES.HIDE_BRUSH
      ) {
        if (lastFogStampPos.current) {
          const dist = Math.hypot(
            pos.x - lastFogStampPos.current.x,
            pos.y - lastFogStampPos.current.y
          );
          if (dist >= fogBrushRadius * 0.35) {
            const isCover =
              fogAction === "hide" ||
              activeFogMode === FOG_MODES.HIDE_BRUSH ||
              activeFogMode === FOG_MODES.HIDE_CIRCLE;
            const fogShape = {
              type: "circle" as const,
              x: pos.x,
              y: pos.y,
              radius: fogBrushRadius,
              isCover,
            };
            addFogShape(fogShape);
            wsService.send("FOG_UPDATE", fogShape);
            lastFogStampPos.current = pos;
          }
        }
      }
    }
  };

  // Stage Mouse Up
  const handleMouseUp = () => {
    if (!isInteracting.current) return;
    const pos = getPointerCanvasPos();

    // Finish Drawing
    if (activeTool === TOOLS.DRAW && shapeStart) {
      if (activeDrawShape === DRAW_SHAPES.FREEHAND && currentLinePoints.length > 2) {
        const newDraw = {
          id: `draw-${Date.now()}`,
          type: DRAW_SHAPES.FREEHAND,
          points: currentLinePoints,
          x: 0,
          y: 0,
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          isGMLayer: isDrawGMLayer,
        };
        addDrawing(newDraw);
        wsService.send("DRAWING_ADD", newDraw);
      } else if (activeDrawShape === DRAW_SHAPES.LINE || activeDrawShape === DRAW_SHAPES.ARROW) {
        const newDraw = {
          id: `draw-${Date.now()}`,
          type: activeDrawShape,
          points: [shapeStart.x, shapeStart.y, pos.x, pos.y],
          x: 0,
          y: 0,
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          isGMLayer: isDrawGMLayer,
        };
        addDrawing(newDraw);
        wsService.send("DRAWING_ADD", newDraw);
      } else if (activeDrawShape === DRAW_SHAPES.RECTANGLE) {
        const width = pos.x - shapeStart.x;
        const height = pos.y - shapeStart.y;
        if (Math.abs(width) > 5 && Math.abs(height) > 5) {
          const newDraw = {
            id: `draw-${Date.now()}`,
            type: DRAW_SHAPES.RECTANGLE,
            points: [],
            x: Math.min(shapeStart.x, pos.x),
            y: Math.min(shapeStart.y, pos.y),
            width: Math.abs(width),
            height: Math.abs(height),
            stroke: drawStrokeColor,
            strokeWidth: drawStrokeWidth,
            fill: drawFillColor,
            isGMLayer: isDrawGMLayer,
          };
          addDrawing(newDraw);
          wsService.send("DRAWING_ADD", newDraw);
        }
      } else if (activeDrawShape === DRAW_SHAPES.CIRCLE) {
        const radius = Math.sqrt(
          Math.pow(pos.x - shapeStart.x, 2) + Math.pow(pos.y - shapeStart.y, 2)
        );
        if (radius > 5) {
          const newDraw = {
            id: `draw-${Date.now()}`,
            type: DRAW_SHAPES.CIRCLE,
            points: [],
            x: shapeStart.x,
            y: shapeStart.y,
            radius,
            stroke: drawStrokeColor,
            strokeWidth: drawStrokeWidth,
            fill: drawFillColor,
            isGMLayer: isDrawGMLayer,
          };
          addDrawing(newDraw);
          wsService.send("DRAWING_ADD", newDraw);
        }
      }

      setCurrentLinePoints([]);
      setShapeStart(null);
      setShapeCurrent(null);
      isInteracting.current = false;
    }

    // Finish Fog
    if (activeTool === TOOLS.FOG && isGM && shapeStart) {
      const isCover =
        fogAction === "hide" ||
        activeFogMode === FOG_MODES.HIDE_RECT ||
        activeFogMode === FOG_MODES.HIDE_CIRCLE ||
        activeFogMode === FOG_MODES.HIDE_BRUSH;

      if (
        fogBrushShape === "rect" ||
        activeFogMode === FOG_MODES.REVEAL_RECT ||
        activeFogMode === FOG_MODES.HIDE_RECT
      ) {
        const width = pos.x - shapeStart.x;
        const height = pos.y - shapeStart.y;
        if (Math.abs(width) > 6 && Math.abs(height) > 6) {
          const fogShape = {
            type: "rect" as const,
            x: Math.min(shapeStart.x, pos.x),
            y: Math.min(shapeStart.y, pos.y),
            width: Math.abs(width),
            height: Math.abs(height),
            isCover,
          };
          addFogShape(fogShape);
          wsService.send("FOG_UPDATE", fogShape);
        }
      }

      setShapeStart(null);
      setShapeCurrent(null);
      lastFogStampPos.current = null;
      isInteracting.current = false;
    }
  };

  // Double click on canvas to drop a tactical radar ping
  const handleDblClick = () => {
    const pos = getPointerCanvasPos();
    const pingData = {
      userId: user?.id || "user-1",
      userName: user?.displayName || "Player",
      userColor: user?.role === "GM" ? "#3b82f6" : "#10b981",
      x: pos.x,
      y: pos.y,
    };
    addPing(pingData);
    wsService.send("PING_CREATE", pingData);
  };

  const isDraggableStage = activeTool === TOOLS.PAN;

  return (
    <div
      ref={containerRef}
      id="vtt-game-canvas-container"
      className="relative w-full h-full bg-zinc-950 overflow-hidden cursor-crosshair"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={zoom}
        scaleY={zoom}
        x={stageX}
        y={stageY}
        draggable={isDraggableStage}
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
        {/* Layer 1: Tactical Map Image */}
        <Layer id="layer-map">
          <MapLayer
            mapUrl={currentScene?.mapUrl}
            width={currentScene?.mapWidth || 2000}
            height={currentScene?.mapHeight || 1500}
          />
        </Layer>

        {/* Layer 2: Grid Layer */}
        <Layer id="layer-grid">
          {currentScene?.grid && (
            <GridLayer
              grid={currentScene.grid}
              width={currentScene.mapWidth || 2000}
              height={currentScene.mapHeight || 1500}
            />
          )}
        </Layer>

        {/* Layer 3: Drawings */}
        <Layer id="layer-drawings">
          <DrawingLayer />

          {/* Active drawing shape preview */}
          {activeTool === TOOLS.DRAW && isInteracting.current ? (
            <Group listening={false}>
              {activeDrawShape === DRAW_SHAPES.FREEHAND && currentLinePoints.length > 2 ? (
                <Line
                  points={currentLinePoints}
                  stroke={drawStrokeColor}
                  strokeWidth={drawStrokeWidth}
                  tension={0.4}
                  lineCap="round"
                  lineJoin="round"
                  listening={false}
                />
              ) : null}
              {(activeDrawShape === DRAW_SHAPES.LINE || activeDrawShape === DRAW_SHAPES.ARROW) &&
              shapeStart &&
              shapeCurrent ? (
                <Arrow
                  points={[shapeStart.x, shapeStart.y, shapeCurrent.x, shapeCurrent.y]}
                  stroke={drawStrokeColor}
                  fill={drawStrokeColor}
                  strokeWidth={drawStrokeWidth}
                  pointerLength={activeDrawShape === DRAW_SHAPES.ARROW ? 12 : 0}
                  pointerWidth={activeDrawShape === DRAW_SHAPES.ARROW ? 12 : 0}
                  listening={false}
                />
              ) : null}
              {activeDrawShape === DRAW_SHAPES.RECTANGLE && shapeStart && shapeCurrent ? (
                <Rect
                  x={Math.min(shapeStart.x, shapeCurrent.x)}
                  y={Math.min(shapeStart.y, shapeCurrent.y)}
                  width={Math.abs(shapeCurrent.x - shapeStart.x)}
                  height={Math.abs(shapeCurrent.y - shapeStart.y)}
                  stroke={drawStrokeColor}
                  strokeWidth={drawStrokeWidth}
                  fill={drawFillColor}
                  dash={[4, 4]}
                  listening={false}
                />
              ) : null}
              {activeDrawShape === DRAW_SHAPES.CIRCLE && shapeStart && shapeCurrent ? (
                <Circle
                  x={shapeStart.x}
                  y={shapeStart.y}
                  radius={Math.sqrt(
                    Math.pow(shapeCurrent.x - shapeStart.x, 2) +
                      Math.pow(shapeCurrent.y - shapeStart.y, 2)
                  )}
                  stroke={drawStrokeColor}
                  strokeWidth={drawStrokeWidth}
                  fill={drawFillColor}
                  dash={[4, 4]}
                  listening={false}
                />
              ) : null}
            </Group>
          ) : null}
        </Layer>

        {/* Layer 4: Tokens */}
        <Layer id="layer-tokens">
          <TokenLayer gridSize={currentScene?.grid.size || 70} />
        </Layer>

        {/* Layer 5: Fog of War */}
        <Layer id="layer-fog">
          <FogLayer
            width={currentScene?.mapWidth || 2000}
            height={currentScene?.mapHeight || 1500}
          />

          {/* Active Fog Selection & Brush Preview */}
          {activeTool === TOOLS.FOG && isGM && (
            <Group listening={false}>
              {/* 1. Dragging Rectangular Fog Preview */}
              {fogBrushShape === "rect" && shapeStart && shapeCurrent && (
                <Rect
                  x={Math.min(shapeStart.x, shapeCurrent.x)}
                  y={Math.min(shapeStart.y, shapeCurrent.y)}
                  width={Math.abs(shapeCurrent.x - shapeStart.x)}
                  height={Math.abs(shapeCurrent.y - shapeStart.y)}
                  stroke={fogAction === "hide" ? "#f43f5e" : "#10b981"}
                  strokeWidth={2}
                  dash={[6, 4]}
                  fill={
                    fogAction === "hide"
                      ? "rgba(244, 63, 94, 0.25)"
                      : "rgba(16, 185, 129, 0.25)"
                  }
                />
              )}

              {/* 2. Hovering/Active Circular Brush Follower Cursor */}
              {fogBrushShape === "circle" && hoverCursorPos && (
                <Circle
                  x={hoverCursorPos.x}
                  y={hoverCursorPos.y}
                  radius={fogBrushRadius}
                  stroke={fogAction === "hide" ? "#f43f5e" : "#10b981"}
                  strokeWidth={1.5}
                  dash={[5, 4]}
                  fill={
                    fogAction === "hide"
                      ? "rgba(244, 63, 94, 0.15)"
                      : "rgba(16, 185, 129, 0.15)"
                  }
                />
              )}

              {/* 3. Hovering Rectangular Brush Indicator (when not dragging) */}
              {fogBrushShape === "rect" && !shapeStart && hoverCursorPos && (
                <Rect
                  x={hoverCursorPos.x - fogBrushRadius}
                  y={hoverCursorPos.y - fogBrushRadius}
                  width={fogBrushRadius * 2}
                  height={fogBrushRadius * 2}
                  stroke={fogAction === "hide" ? "#f43f5e" : "#10b981"}
                  strokeWidth={1.5}
                  dash={[5, 4]}
                  fill={
                    fogAction === "hide"
                      ? "rgba(244, 63, 94, 0.1)"
                      : "rgba(16, 185, 129, 0.1)"
                  }
                />
              )}
            </Group>
          )}
        </Layer>

        {/* Layer 6: Rulers & Measurement */}
        <Layer id="layer-ruler">
          <RulerLayer />
        </Layer>

        {/* Layer 7: Radar Pings & Lasers */}
        <Layer id="layer-pings">
          <PingLayer />
        </Layer>
      </Stage>
    </div>
  );
};
