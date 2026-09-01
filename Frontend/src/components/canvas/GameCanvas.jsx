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
import { drawingApi } from "../../api/drawing.api";
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

const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const GameCanvas = ({ isGM = false, permissions = {} }) => {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const textEditorInputRef = useRef(null);

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

  const textFontFamily = useCanvasStore((state) => state.textFontFamily || "Vazirmatn");
  const textFontSize = useCanvasStore((state) => state.textFontSize || 24);
  const textColor = useCanvasStore((state) => state.textColor || "#f59e0b");
  const textIsBold = useCanvasStore((state) => state.textIsBold);
  const textIsItalic = useCanvasStore((state) => state.textIsItalic);
  const textHasStroke = useCanvasStore((state) => state.textHasStroke);
  const textStrokeColor = useCanvasStore((state) => state.textStrokeColor || "#000000");
  const textStrokeWidth = useCanvasStore((state) => state.textStrokeWidth || 2);
  const pendingEmoji = useCanvasStore((state) => state.pendingEmoji);
  const setPendingEmoji = useCanvasStore((state) => state.setPendingEmoji);

  const rulerType = useCanvasStore((state) => state.rulerType);

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
  const removeDrawing = useSceneStore((state) => state.removeDrawing);
  const addFogShape = useSceneStore((state) => state.addFogShape);
  const addPing = useSceneStore((state) => state.addPing);
  const user = useAuthStore((state) => state.user);

  const [liveDrawing, setLiveDrawing] = useState(null);
  const liveDrawingRef = useRef(null);
  const [liveFog, setLiveFog] = useState(null);
  const liveFogRef = useRef(null);

  const [currentLinePoints, setCurrentLinePoints] = useState([]);
  const [polygonVertices, setPolygonVertices] = useState([]);
  const [fogPolygonVertices, setFogPolygonVertices] = useState([]);
  const [shapeStart, setShapeStart] = useState(null);
  const isInteracting = useRef(false);

  const [inlineTextEditor, setInlineTextEditor] = useState(null);
  const isTextEditorOpenRef = useRef(false);

  const lastBroadcastTime = useRef(0);
  const lastFogBroadcastTime = useRef(0);
  const lastLaserBroadcastTime = useRef(0);
  const lastRulerBroadcastTime = useRef(0);

  const activeMapUrl = currentScene?.mapUrl || currentScene?.assetUrl || "";
  const hasActiveMap = Boolean(activeMapUrl && activeMapUrl.trim() !== "");

  const isStageDraggable = hasActiveMap && activeTool === TOOLS.PAN;

  const isEraserActive =
      activeTool === TOOLS.ERASER ||
      (activeTool === TOOLS.DRAW && activeDrawShape === DRAW_MODES.ERASER);

  const isSelectMode = activeTool === TOOLS.SELECT;
  const canUseFog = isGM || Boolean(permissions?.canFog);

  const myIdentifier = String(user?.id || user?.userId || user?.username || "player-1");

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

  const handleEraseDrawing = useCallback(
      async (drawId) => {
        if (!drawId) return;
        const targetId = String(drawId);
        const sceneId = currentScene?.id;

        removeDrawing(targetId);

        wsService.send("DRAWING_DELETE", {
          id: targetId,
          drawingId: targetId,
          clientDrawingId: targetId,
          sceneId: sceneId,
        });

        try {
          await drawingApi.deleteDrawing(targetId, sceneId);
        } catch (err) {
          console.error("خطا در حذف دیتابیس نقاشی:", err);
        }
      },
      [removeDrawing, currentScene?.id]
  );

  const finishInlineText = useCallback(() => {
    if (!inlineTextEditor) return;
    const textVal = inlineTextEditor.text ? inlineTextEditor.text.trim() : "";

    if (textVal) {
      const uniqueId = inlineTextEditor.id || `draw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      let fontStyleStr = "normal";
      if (textIsBold && textIsItalic) fontStyleStr = "italic bold";
      else if (textIsBold) fontStyleStr = "bold";
      else if (textIsItalic) fontStyleStr = "italic";

      const textPayload = {
        id: uniqueId,
        clientDrawingId: uniqueId,
        type: "text",
        x: Math.round(inlineTextEditor.canvasX),
        y: Math.round(inlineTextEditor.canvasY),
        text: textVal,
        fontSize: inlineTextEditor.fontSize || textFontSize || 24,
        fontFamily: inlineTextEditor.fontFamily || textFontFamily || "Vazirmatn",
        fontStyle: fontStyleStr,
        fill: inlineTextEditor.fill || textColor || "#f59e0b",
        stroke: textHasStroke ? textStrokeColor : undefined,
        strokeWidth: textHasStroke ? textStrokeWidth : 0,
        isGMLayer: isDrawGMLayer,
        sceneId: currentScene?.id,
      };

      addDrawing(textPayload);
      wsService.send("DRAWING_ADD", textPayload);
    }

    isTextEditorOpenRef.current = false;
    setInlineTextEditor(null);
  }, [
    inlineTextEditor,
    textIsBold,
    textIsItalic,
    textFontSize,
    textFontFamily,
    textColor,
    textHasStroke,
    textStrokeColor,
    textStrokeWidth,
    isDrawGMLayer,
    currentScene?.id,
    addDrawing,
  ]);

  useEffect(() => {
    if (inlineTextEditor && !isTextEditorOpenRef.current) {
      isTextEditorOpenRef.current = true;
      setTimeout(() => {
        if (textEditorInputRef.current) {
          textEditorInputRef.current.focus();
          const len = textEditorInputRef.current.value.length;
          textEditorInputRef.current.setSelectionRange(len, len);
        }
      }, 10);
    }
  }, [inlineTextEditor]);

  useEffect(() => {
    if (pendingEmoji) {
      if (inlineTextEditor) {
        setInlineTextEditor((prev) => ({
          ...prev,
          text: (prev.text || "") + pendingEmoji,
        }));
      } else {
        const centerX = (dimensions.width / 2 - stageX) / zoom;
        const centerY = (dimensions.height / 2 - stageY) / zoom;
        setInlineTextEditor({
          canvasX: centerX,
          canvasY: centerY,
          text: pendingEmoji,
          fontFamily: textFontFamily,
          fontSize: textFontSize,
          fill: textColor,
        });
      }
      setPendingEmoji(null);
    }
  }, [pendingEmoji, inlineTextEditor, dimensions, stageX, stageY, zoom, textFontFamily, textFontSize, textColor, setPendingEmoji]);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        setPolygonVertices([]);
        setFogPolygonVertices([]);
        setLiveDrawing(null);
        liveDrawingRef.current = null;
        setLiveFog(null);
        liveFogRef.current = null;
        if (activeTool === TOOLS.RULER) {
          endMeasurement();
          wsService.send("RULER_CLEAR", { userId: myIdentifier });
        }
        if (inlineTextEditor) {
          isTextEditorOpenRef.current = false;
          setInlineTextEditor(null);
        }
        isInteracting.current = false;
      }
    };
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [activeTool, endMeasurement, myIdentifier, inlineTextEditor]);

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

    if (inlineTextEditor) {
      finishInlineText();
    }

    const isClickedOnEmpty = e.target === e.target.getStage() || e.target.name() === "map-background";
    if (isClickedOnEmpty) {
      clearSelection();
    }

    if (isSelectMode || activeTool === TOOLS.PAN) {
      return;
    }

    const pos = getPointerCanvasPos();
    if (pos.x < 0 || pos.x > mapWidth || pos.y < 0 || pos.y > mapHeight) return;

    if (isEraserActive) {
      isInteracting.current = true;
      return;
    }

    if (activeTool === TOOLS.TEXT) {
      isTextEditorOpenRef.current = false;
      setInlineTextEditor({
        canvasX: pos.x,
        canvasY: pos.y,
        text: "",
        fontFamily: textFontFamily,
        fontSize: textFontSize,
        fill: textColor,
      });
      return;
    }

    if (activeTool === TOOLS.RULER) {
      if (e.evt.button === 0) {
        if (!isInteracting.current) {
          isInteracting.current = true;
          startMeasurement(pos.x, pos.y);
          wsService.send("RULER_UPDATE", {
            startX: pos.x,
            startY: pos.y,
            currentX: pos.x,
            currentY: pos.y,
            waypoints: [],
            userId: myIdentifier,
            userName: user?.username || "Player",
            userColor: isGM ? "#f59e0b" : "#38bdf8",
            rulerType: rulerType,
          });
        } else {
          addMeasurementWaypoint(pos.x, pos.y);
          const currentMeas = useCanvasStore.getState().measurement;
          wsService.send("RULER_UPDATE", {
            ...(currentMeas || {}),
            userId: myIdentifier,
            userName: user?.username || "Player",
            userColor: isGM ? "#f59e0b" : "#38bdf8",
            rulerType: rulerType,
          });
        }
      } else if (e.evt.button === 2) {
        endMeasurement();
        wsService.send("RULER_CLEAR", { userId: myIdentifier });
        isInteracting.current = false;
      }
      return;
    }

    // چندضلعی نقاشی
    if (activeTool === TOOLS.DRAW && activeDrawShape === DRAW_MODES.POLYGON) {
      if (e.evt.button === 2) {
        setPolygonVertices([]);
        setLiveDrawing(null);
        liveDrawingRef.current = null;
        return;
      }

      if (polygonVertices.length === 0) {
        setPolygonVertices([pos.x, pos.y]);
        const initPoly = {
          type: DRAW_MODES.POLYGON,
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: drawFillColor,
          isGMLayer: isDrawGMLayer,
        };
        liveDrawingRef.current = initPoly;
        setLiveDrawing(initPoly);
      } else {
        const startX = polygonVertices[0];
        const startY = polygonVertices[1];
        const distToStart = Math.hypot(pos.x - startX, pos.y - startY);

        if (distToStart < 25 && polygonVertices.length >= 6) {
          const uniqueId = `draw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const finalPolygon = {
            id: uniqueId,
            clientDrawingId: uniqueId,
            type: DRAW_MODES.POLYGON,
            points: polygonVertices,
            stroke: drawStrokeColor,
            strokeWidth: drawStrokeWidth,
            fill: drawFillColor,
            isGMLayer: isDrawGMLayer,
            sceneId: currentScene?.id,
          };
          addDrawing(finalPolygon);
          wsService.send("DRAWING_ADD", finalPolygon);
          setPolygonVertices([]);
          setLiveDrawing(null);
          liveDrawingRef.current = null;
        } else {
          const nextPoints = [...polygonVertices, pos.x, pos.y];
          setPolygonVertices(nextPoints);
          const currentPoly = {
            type: DRAW_MODES.POLYGON,
            points: [...nextPoints, pos.x, pos.y],
            stroke: drawStrokeColor,
            strokeWidth: drawStrokeWidth,
            fill: drawFillColor,
            isGMLayer: isDrawGMLayer,
          };
          liveDrawingRef.current = currentPoly;
          setLiveDrawing(currentPoly);
        }
      }
      return;
    }

    // چندضلعی مه جنگ
    if (activeTool === TOOLS.FOG && canUseFog && fogBrushShape === FOG_BRUSH_SHAPES.POLYGON) {
      if (e.evt.button === 2) {
        setFogPolygonVertices([]);
        setLiveFog(null);
        liveFogRef.current = null;
        return;
      }

      const isCoverAction = fogAction === FOG_ACTIONS.HIDE;
      const modeName = fogAction === FOG_ACTIONS.SLICE ? "slice" : (isCoverAction ? "hide" : "reveal");

      if (fogPolygonVertices.length === 0) {
        setFogPolygonVertices([pos.x, pos.y]);
        const initFogPoly = {
          type: "polygon",
          mode: modeName,
          points: [pos.x, pos.y, pos.x, pos.y],
          isCover: isCoverAction,
        };
        liveFogRef.current = initFogPoly;
        setLiveFog(initFogPoly);
      } else {
        const startX = fogPolygonVertices[0];
        const startY = fogPolygonVertices[1];
        const distToStart = Math.hypot(pos.x - startX, pos.y - startY);

        if (distToStart < 25 && fogPolygonVertices.length >= 6) {
          const uniqueFogId = generateUUID();
          const finalFogShape = {
            id: uniqueFogId,
            type: "polygon",
            mode: modeName,
            points: fogPolygonVertices,
            isCover: isCoverAction,
            sceneId: currentScene?.id,
          };

          addFogShape(finalFogShape);
          wsService.send("FOG_UPDATE", {
            ...finalFogShape,
            type: isCoverAction ? "HIDE" : "REVEAL",
            points: finalFogShape,
          });

          setFogPolygonVertices([]);
          setLiveFog(null);
          liveFogRef.current = null;
        } else {
          const nextPoints = [...fogPolygonVertices, pos.x, pos.y];
          setFogPolygonVertices(nextPoints);
          const currentFogPoly = {
            type: "polygon",
            mode: modeName,
            points: [...nextPoints, pos.x, pos.y],
            isCover: isCoverAction,
          };
          liveFogRef.current = currentFogPoly;
          setLiveFog(currentFogPoly);
        }
      }
      return;
    }

    // سایر اشکال نقاشی
    if (activeTool === TOOLS.DRAW) {
      isInteracting.current = true;
      setShapeStart(pos);

      let initialDraw = null;
      if (activeDrawShape === DRAW_MODES.MARKER || activeDrawShape === DRAW_MODES.BRUSH) {
        const initialPoints = [pos.x, pos.y];
        setCurrentLinePoints(initialPoints);
        initialDraw = {
          type: activeDrawShape,
          points: initialPoints,
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: activeDrawShape === DRAW_MODES.BRUSH ? drawFillColor : "transparent",
          isGMLayer: isDrawGMLayer,
        };
      } else if (activeDrawShape === DRAW_MODES.RECTANGLE) {
        initialDraw = {
          type: DRAW_MODES.RECTANGLE,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: drawFillColor,
          isGMLayer: isDrawGMLayer,
        };
      } else if (activeDrawShape === DRAW_MODES.CIRCLE || activeDrawShape === DRAW_MODES.TRIANGLE || activeDrawShape === DRAW_MODES.HEXAGON) {
        initialDraw = {
          type: activeDrawShape,
          x: pos.x,
          y: pos.y,
          radius: 0,
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: drawFillColor,
          isGMLayer: isDrawGMLayer,
        };
      } else if (activeDrawShape === DRAW_MODES.LINE) {
        initialDraw = {
          type: DRAW_MODES.LINE,
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          isGMLayer: isDrawGMLayer,
        };
      }

      if (initialDraw) {
        liveDrawingRef.current = initialDraw;
        setLiveDrawing(initialDraw);
        wsService.send("DRAWING_LIVE", { ...initialDraw, sceneId: currentScene?.id });
      }
      return;
    }

    // اشکال هندسی مه جنگ
    if (activeTool === TOOLS.FOG && canUseFog && fogBrushShape !== FOG_BRUSH_SHAPES.POLYGON) {
      isInteracting.current = true;
      setShapeStart(pos);

      const isCoverAction = fogAction === FOG_ACTIONS.HIDE;
      const modeName = fogAction === FOG_ACTIONS.SLICE ? "slice" : (isCoverAction ? "hide" : "reveal");

      let initialFog = null;
      if (fogBrushShape === FOG_BRUSH_SHAPES.RECTANGLE) {
        initialFog = {
          type: "rect",
          mode: modeName,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          isCover: isCoverAction,
        };
      } else if (fogBrushShape === FOG_BRUSH_SHAPES.CIRCLE || fogBrushShape === FOG_BRUSH_SHAPES.TRIANGLE || fogBrushShape === FOG_BRUSH_SHAPES.HEXAGON) {
        initialFog = {
          type: fogBrushShape,
          mode: modeName,
          x: pos.x,
          y: pos.y,
          radius: 0,
          isCover: isCoverAction,
        };
      }

      if (initialFog) {
        liveFogRef.current = initialFog;
        setLiveFog(initialFog);
        wsService.send("FOG_LIVE", { ...initialFog, sceneId: currentScene?.id });
      }
    }
  };

  const handleMouseMove = () => {
    if (!hasActiveMap) return;
    const pos = getPointerCanvasPos();

    if (activeTool === TOOLS.LASER) {
      setLaserPosition(pos);

      const now = Date.now();
      if (now - lastLaserBroadcastTime.current > 30) {
        lastLaserBroadcastTime.current = now;
        wsService.send("LASER_MOVE", {
          x: Math.round(pos.x),
          y: Math.round(pos.y),
          userId: myIdentifier,
          userName: user?.username || "Player",
          color: isGM ? "#ef4444" : "#f59e0b",
        });
      }
    }

    if (activeTool === TOOLS.RULER && isInteracting.current) {
      updateMeasurement(pos.x, pos.y);

      const now = Date.now();
      if (now - lastRulerBroadcastTime.current > 30) {
        lastRulerBroadcastTime.current = now;
        const currentMeas = useCanvasStore.getState().measurement;
        if (currentMeas) {
          wsService.send("RULER_UPDATE", {
            ...currentMeas,
            userId: myIdentifier,
            userName: user?.username || "Player",
            userColor: isGM ? "#f59e0b" : "#38bdf8",
            rulerType: rulerType,
          });
        }
      }
    }

    if (activeTool === TOOLS.DRAW && activeDrawShape === DRAW_MODES.POLYGON && polygonVertices.length > 0) {
      const polyPreview = {
        type: DRAW_MODES.POLYGON,
        points: [...polygonVertices, pos.x, pos.y],
        stroke: drawStrokeColor,
        strokeWidth: drawStrokeWidth,
        fill: drawFillColor,
        isGMLayer: isDrawGMLayer,
      };
      liveDrawingRef.current = polyPreview;
      setLiveDrawing(polyPreview);
      return;
    }

    if (activeTool === TOOLS.FOG && canUseFog && fogBrushShape === FOG_BRUSH_SHAPES.POLYGON && fogPolygonVertices.length > 0) {
      const isCoverAction = fogAction === FOG_ACTIONS.HIDE;
      const modeName = fogAction === FOG_ACTIONS.SLICE ? "slice" : (isCoverAction ? "hide" : "reveal");
      const fogPolyPreview = {
        type: "polygon",
        mode: modeName,
        points: [...fogPolygonVertices, pos.x, pos.y],
        isCover: isCoverAction,
      };
      liveFogRef.current = fogPolyPreview;
      setLiveFog(fogPolyPreview);
      return;
    }

    if (!isInteracting.current) return;

    if (activeTool === TOOLS.DRAW && shapeStart) {
      let updatedDraw = null;

      if (activeDrawShape === DRAW_MODES.MARKER || activeDrawShape === DRAW_MODES.BRUSH) {
        const updatedPoints = [...currentLinePoints, pos.x, pos.y];
        setCurrentLinePoints(updatedPoints);
        updatedDraw = {
          type: activeDrawShape,
          points: updatedPoints,
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: activeDrawShape === DRAW_MODES.BRUSH ? drawFillColor : "transparent",
          isGMLayer: isDrawGMLayer,
        };
      } else if (activeDrawShape === DRAW_MODES.RECTANGLE) {
        updatedDraw = {
          type: DRAW_MODES.RECTANGLE,
          x: Math.min(shapeStart.x, pos.x),
          y: Math.min(shapeStart.y, pos.y),
          width: Math.abs(pos.x - shapeStart.x),
          height: Math.abs(pos.y - shapeStart.y),
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: drawFillColor,
          isGMLayer: isDrawGMLayer,
        };
      } else if (activeDrawShape === DRAW_MODES.CIRCLE || activeDrawShape === DRAW_MODES.TRIANGLE || activeDrawShape === DRAW_MODES.HEXAGON) {
        const radius = Math.hypot(pos.x - shapeStart.x, pos.y - shapeStart.y);
        updatedDraw = {
          type: activeDrawShape,
          x: shapeStart.x,
          y: shapeStart.y,
          radius: radius,
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          fill: drawFillColor,
          isGMLayer: isDrawGMLayer,
        };
      } else if (activeDrawShape === DRAW_MODES.LINE) {
        updatedDraw = {
          type: DRAW_MODES.LINE,
          points: [shapeStart.x, shapeStart.y, pos.x, pos.y],
          stroke: drawStrokeColor,
          strokeWidth: drawStrokeWidth,
          isGMLayer: isDrawGMLayer,
        };
      }

      if (updatedDraw) {
        liveDrawingRef.current = updatedDraw;
        setLiveDrawing(updatedDraw);

        const now = Date.now();
        if (now - lastBroadcastTime.current > 30) {
          lastBroadcastTime.current = now;
          wsService.send("DRAWING_LIVE", { ...updatedDraw, sceneId: currentScene?.id });
        }
      }
    }

    if (activeTool === TOOLS.FOG && canUseFog && shapeStart && fogBrushShape !== FOG_BRUSH_SHAPES.POLYGON) {
      const isCoverAction = fogAction === FOG_ACTIONS.HIDE;
      const modeName = fogAction === FOG_ACTIONS.SLICE ? "slice" : (isCoverAction ? "hide" : "reveal");
      let updatedFog = null;

      if (fogBrushShape === FOG_BRUSH_SHAPES.RECTANGLE) {
        updatedFog = {
          type: "rect",
          mode: modeName,
          x: Math.min(shapeStart.x, pos.x),
          y: Math.min(shapeStart.y, pos.y),
          width: Math.abs(pos.x - shapeStart.x),
          height: Math.abs(pos.y - shapeStart.y),
          isCover: isCoverAction,
        };
      } else if (fogBrushShape === FOG_BRUSH_SHAPES.CIRCLE || fogBrushShape === FOG_BRUSH_SHAPES.TRIANGLE || fogBrushShape === FOG_BRUSH_SHAPES.HEXAGON) {
        const radius = Math.hypot(pos.x - shapeStart.x, pos.y - shapeStart.y);
        updatedFog = {
          type: fogBrushShape,
          mode: modeName,
          x: shapeStart.x,
          y: shapeStart.y,
          radius: radius,
          isCover: isCoverAction,
        };
      }

      if (updatedFog) {
        liveFogRef.current = updatedFog;
        setLiveFog(updatedFog);

        const now = Date.now();
        if (now - lastFogBroadcastTime.current > 30) {
          lastFogBroadcastTime.current = now;
          wsService.send("FOG_LIVE", { ...updatedFog, sceneId: currentScene?.id });
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (activeTool === TOOLS.RULER) {
      return;
    }

    if (activeTool === TOOLS.DRAW && activeDrawShape === DRAW_MODES.POLYGON) {
      return;
    }

    if (activeTool === TOOLS.FOG && fogBrushShape === FOG_BRUSH_SHAPES.POLYGON) {
      return;
    }

    if (!isInteracting.current || !hasActiveMap) return;

    if (activeTool === TOOLS.DRAW && shapeStart) {
      const finalShape = liveDrawingRef.current;
      if (finalShape) {
        const uniqueId = `draw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newDraw = {
          ...finalShape,
          id: uniqueId,
          clientDrawingId: uniqueId,
          sceneId: currentScene?.id,
        };
        addDrawing(newDraw);
        wsService.send("DRAWING_ADD", newDraw);
      }

      wsService.send("DRAWING_LIVE_END", { sceneId: currentScene?.id });
      liveDrawingRef.current = null;
      setLiveDrawing(null);
      setCurrentLinePoints([]);
      setShapeStart(null);
      isInteracting.current = false;
    }

    if (activeTool === TOOLS.FOG && canUseFog && shapeStart) {
      const finalFogShape = liveFogRef.current;
      if (finalFogShape) {
        const uniqueFogId = generateUUID();
        const isCoverAction = finalFogShape.isCover === true;
        const fogPayload = {
          ...finalFogShape,
          id: uniqueFogId,
          sceneId: currentScene?.id,
          type: isCoverAction ? "HIDE" : "REVEAL",
          points: {
            ...finalFogShape,
            id: uniqueFogId,
            isCover: isCoverAction,
          },
        };

        addFogShape(fogPayload);
        wsService.send("FOG_UPDATE", fogPayload);
      }

      wsService.send("FOG_LIVE_END", { sceneId: currentScene?.id });
      liveFogRef.current = null;
      setLiveFog(null);
      setCurrentLinePoints([]);
      setShapeStart(null);
      isInteracting.current = false;
    }

    isInteracting.current = false;
  };

  const handleMouseLeave = () => {
    if (activeTool === TOOLS.LASER) {
      setLaserPosition(null);
      wsService.send("LASER_CLEAR", { userId: myIdentifier });
    }
  };

  const handleDblClick = (e) => {
    if (!hasActiveMap) return;

    if (activeTool === TOOLS.DRAW && activeDrawShape === DRAW_MODES.POLYGON && polygonVertices.length >= 6) {
      const uniqueId = `draw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const finalPolygon = {
        id: uniqueId,
        clientDrawingId: uniqueId,
        type: DRAW_MODES.POLYGON,
        points: polygonVertices,
        stroke: drawStrokeColor,
        strokeWidth: drawStrokeWidth,
        fill: drawFillColor,
        isGMLayer: isDrawGMLayer,
        sceneId: currentScene?.id,
      };
      addDrawing(finalPolygon);
      wsService.send("DRAWING_ADD", finalPolygon);
      setPolygonVertices([]);
      setLiveDrawing(null);
      liveDrawingRef.current = null;
      return;
    }

    if (activeTool === TOOLS.FOG && canUseFog && fogBrushShape === FOG_BRUSH_SHAPES.POLYGON && fogPolygonVertices.length >= 6) {
      const isCoverAction = fogAction === FOG_ACTIONS.HIDE;
      const modeName = fogAction === FOG_ACTIONS.SLICE ? "slice" : (isCoverAction ? "hide" : "reveal");
      const uniqueFogId = generateUUID();

      const finalFogShape = {
        id: uniqueFogId,
        type: "polygon",
        mode: modeName,
        points: fogPolygonVertices,
        isCover: isCoverAction,
        sceneId: currentScene?.id,
      };

      addFogShape(finalFogShape);
      wsService.send("FOG_UPDATE", {
        ...finalFogShape,
        type: isCoverAction ? "HIDE" : "REVEAL",
        points: finalFogShape,
      });

      setFogPolygonVertices([]);
      setLiveFog(null);
      liveFogRef.current = null;
      return;
    }

    if (activeTool !== TOOLS.SELECT && activeTool !== TOOLS.PAN) return;
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
          dir="ltr"
          className={`relative w-full h-full overflow-hidden select-none ${
              activeTool === TOOLS.TEXT ? "cursor-text" : ""
          }`}
          style={{
            background: "radial-gradient(circle at center, #111420 0%, #07080c 100%)",
          }}
          onContextMenu={(e) => e.preventDefault()}
      >
        <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(to right, #f59e0b 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }}
        />

        {inlineTextEditor && (
            <div
                className="absolute z-50 pointer-events-auto"
                style={{
                  left: `${stageX + inlineTextEditor.canvasX * zoom}px`,
                  top: `${stageY + inlineTextEditor.canvasY * zoom}px`,
                  transform: "translate(0, 0)",
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
            >
              <input
                  ref={textEditorInputRef}
                  type="text"
                  value={inlineTextEditor.text}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setInlineTextEditor((prev) => (prev ? { ...prev, text: nextVal } : null));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      finishInlineText();
                    } else if (e.key === "Escape") {
                      isTextEditorOpenRef.current = false;
                      setInlineTextEditor(null);
                    }
                  }}
                  onBlur={finishInlineText}
                  className="bg-transparent border-0 outline-0 p-0 m-0 shadow-none ring-0 focus:ring-0 focus:outline-none"
                  style={{
                    fontFamily: inlineTextEditor.fontFamily || textFontFamily,
                    fontSize: `${Math.max(14, (inlineTextEditor.fontSize || textFontSize) * zoom)}px`,
                    color: inlineTextEditor.fill || textColor,
                    caretColor: inlineTextEditor.fill || textColor,
                    fontWeight: textIsBold ? "bold" : "normal",
                    fontStyle: textIsItalic ? "italic" : "normal",
                    textShadow: textHasStroke ? `-1px -1px 0 ${textStrokeColor}, 1px -1px 0 ${textStrokeColor}, -1px 1px 0 ${textStrokeColor}, 1px 1px 0 ${textStrokeColor}` : "none",
                    lineHeight: "1.0",
                    height: "auto",
                    width: `${Math.max(40, (inlineTextEditor.text.length + 2) * (inlineTextEditor.fontSize || textFontSize) * zoom * 0.75)}px`,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    appearance: "none",
                  }}
              />
            </div>
        )}

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

        <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            scaleX={zoom}
            scaleY={zoom}
            x={stageX}
            y={stageY}
            draggable={isStageDraggable}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onDblClick={handleDblClick}
            onContextMenu={(e) => e.evt.preventDefault()}
            onDragEnd={(e) => {
              if (e.target === stageRef.current && isStageDraggable) {
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
                {/* لایه ۲: ترسیمات، متن و مه جنگ */}
                <Layer
                    id="layer-canvas-features"
                    clip={{ x: 0, y: 0, width: mapWidth, height: mapHeight }}
                    listening={true}
                >
                  <DrawingLayer
                      liveDrawing={liveDrawing}
                      isEraser={isEraserActive}
                      isSelectMode={isSelectMode}
                      isGM={isGM}
                      permissions={permissions}
                      onErase={handleEraseDrawing}
                      onDblClickText={(textShape) => {
                        isTextEditorOpenRef.current = false;
                        setInlineTextEditor({
                          id: String(textShape.clientDrawingId || textShape.id || textShape.drawingId),
                          canvasX: textShape.x || 0,
                          canvasY: textShape.y || 0,
                          text: textShape.text || "",
                          fontFamily: textShape.fontFamily || "Vazirmatn",
                          fontSize: textShape.fontSize || 24,
                          fill: textShape.fill || textColor,
                        });
                      }}
                  />
                  <FogLayer
                      width={mapWidth}
                      height={mapHeight}
                      liveFog={liveFog}
                      polygonVertices={fogPolygonVertices.length > 0 ? (liveFog?.points || fogPolygonVertices) : []}
                  />
                  <RulerLayer />
                  <PingLayer />
                </Layer>

                {/* لایه ۳: توکن‌ها */}
                <Layer
                    id="layer-tokens"
                    listening={isSelectMode}
                >
                  <TokenLayer gridSize={currentScene?.grid?.size || 60} isGM={isGM} />
                </Layer>
              </>
          )}
        </Stage>
      </div>
  );
};