import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Line, Rect, Circle, Arrow, Group } from "react-konva";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { usePermissions } from "../../hooks/usePermissions";
import { TOOLS, DRAW_SHAPES, FOG_MODES } from "../../constants/tools";
import { MapLayer } from "./MapLayer.jsx";
import { GridLayer } from "./GridLayer.jsx";
import { TokenLayer } from "./TokenLayer.jsx";
import { DrawingLayer } from "./DrawingLayer.jsx";
import { FogLayer } from "./FogLayer.jsx";
import { RulerLayer } from "./RulerLayer.jsx";
import { PingLayer } from "./PingLayer.jsx";
import { wsService } from "../../services/websocket.service";

export const GameCanvas = () => {
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
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

  const [currentLinePoints, setCurrentLinePoints] = useState([]);
  const [shapeStart, setShapeStart] = useState(null);
  const [shapeCurrent, setShapeCurrent] = useState(null);
  const isInteracting = useRef(false);

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
    const isClickedOnEmpty = e.target === e.target.getStage();
    if (isClickedOnEmpty && activeTool === (TOOLS?.SELECT || "select")) {
      clearSelection();
    }

    const pos = getPointerCanvasPos();

    if (activeTool === (TOOLS?.DRAW || "draw")) {
      isInteracting.current = true;
      setShapeStart(pos);
      setShapeCurrent(pos);
      if (activeDrawShape === (DRAW_SHAPES?.FREEHAND || "freehand")) {
        setCurrentLinePoints([pos.x, pos.y]);
      }
    }

    if (activeTool === (TOOLS?.RULER || "ruler")) {
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

    if (activeTool === (TOOLS?.FOG || "fog") && isGM) {
      isInteracting.current = true;
      setShapeStart(pos);
      setShapeCurrent(pos);

      const isCover = fogAction === "hide" || activeFogMode === (FOG_MODES?.HIDE_BRUSH || "hide_brush");
      const fogShape = {
        type: "circle",
        x: pos.x,
        y: pos.y,
        radius: fogBrushRadius || 70,
        isCover,
      };
      addFogShape(fogShape);
      wsService.send("FOG_UPDATE", fogShape);
    }
  };

  const handleMouseMove = () => {
    const pos = getPointerCanvasPos();

    if (activeTool === (TOOLS?.LASER || "laser")) {
      setLaserPosition(pos);
    }

    if (!isInteracting.current) return;

    if (activeTool === (TOOLS?.RULER || "ruler")) {
      updateMeasurement(pos.x, pos.y);
    }

    if (activeTool === (TOOLS?.DRAW || "draw")) {
      setShapeCurrent(pos);
      if (activeDrawShape === (DRAW_SHAPES?.FREEHAND || "freehand")) {
        setCurrentLinePoints((prev) => [...prev, pos.x, pos.y]);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isInteracting.current) return;
    const pos = getPointerCanvasPos();

    if (activeTool === (TOOLS?.DRAW || "draw") && shapeStart) {
      const newDraw = {
        id: `draw-${Date.now()}`,
        type: activeDrawShape || "freehand",
        points: currentLinePoints.length > 2 ? currentLinePoints : [shapeStart.x, shapeStart.y, pos.x, pos.y],
        x: Math.min(shapeStart.x, pos.x),
        y: Math.min(shapeStart.y, pos.y),
        stroke: drawStrokeColor,
        strokeWidth: drawStrokeWidth,
        fill: drawFillColor,
        isGMLayer: isDrawGMLayer,
      };
      addDrawing(newDraw);
      wsService.send("DRAWING_ADD", newDraw);

      setCurrentLinePoints([]);
      setShapeStart(null);
      setShapeCurrent(null);
      isInteracting.current = false;
    }
  };

  const handleDblClick = () => {
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
          className="relative w-full h-full bg-[#090a0f] overflow-hidden cursor-crosshair"
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
            draggable={activeTool === (TOOLS?.PAN || "pan")}
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
                mapUrl={currentScene?.assetUrl || currentScene?.mapUrl}
                width={currentScene?.mapWidth || 2000}
                height={currentScene?.mapHeight || 1500}
            />
          </Layer>

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
            <DrawingLayer />
          </Layer>

          <Layer id="layer-tokens">
            <TokenLayer gridSize={currentScene?.grid?.size || 50} />
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
        </Stage>
      </div>
  );
};