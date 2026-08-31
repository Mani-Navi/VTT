import React, { useRef, useEffect } from "react";
import { Line, Rect, Circle, RegularPolygon, Text, Group, Transformer } from "react-konva";
import { useSceneStore } from "../../store/scene.store";
import { useCanvasStore } from "../../store/canvas.store";
import { usePermissions } from "../../hooks/usePermissions";
import { wsService } from "../../services/websocket.service";
import { DRAW_MODES } from "../../constants/tools";

const SingleDrawingShape = ({
                              draw,
                              isLive = false,
                              isEraser = false,
                              isSelectMode = false,
                              isSelected = false,
                              onSelect = null,
                              onErase = null,
                              onUpdate = null,
                              isGM = false,
                            }) => {
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (!draw) return null;
  if (draw.isGMLayer && !isGM) return null;

  const opacity = isLive ? 0.75 : draw.isGMLayer ? 0.65 : 1;
  const type = draw.type || draw.tool || "marker";
  const stroke = draw.stroke || draw.color || "#f59e0b";
  const strokeWidth = draw.strokeWidth || draw.lineWidth || 4;
  const drawId = String(draw.clientDrawingId || draw.id || draw.drawingId || "");

  const scaleX = draw.scaleX !== undefined && draw.scaleX !== null ? Number(draw.scaleX) : 1;
  const scaleY = draw.scaleY !== undefined && draw.scaleY !== null ? Number(draw.scaleY) : 1;
  const rotation = draw.rotation !== undefined && draw.rotation !== null ? Number(draw.rotation) : 0;

  let safePoints = [];
  if (Array.isArray(draw.points)) {
    safePoints = draw.points;
  } else if (typeof draw.points === "string") {
    try {
      safePoints = JSON.parse(draw.points);
    } catch (e) {
      safePoints = [];
    }
  }

  const handleEraseAction = (e) => {
    if (e && e.cancelBubble !== undefined) e.cancelBubble = true;
    if (isEraser && onErase) {
      onErase(drawId);
    }
  };

  const handleClick = (e) => {
    if (e && e.cancelBubble !== undefined) e.cancelBubble = true;
    if (isEraser) {
      handleEraseAction(e);
    } else if (isSelectMode && onSelect) {
      onSelect(drawId);
    }
  };

  const handleDragEnd = (e) => {
    if (e && e.cancelBubble !== undefined) e.cancelBubble = true;
    const node = shapeRef.current;
    if (!node || !onUpdate) return;

    onUpdate(drawId, {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: Math.round(node.rotation()),
    });
  };

  const handleTransformEnd = (e) => {
    if (e && e.cancelBubble !== undefined) e.cancelBubble = true;
    const node = shapeRef.current;
    if (!node || !onUpdate) return;

    onUpdate(drawId, {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      scaleX: Number(node.scaleX().toFixed(3)),
      scaleY: Number(node.scaleY().toFixed(3)),
      rotation: Math.round(node.rotation()),
    });
  };

  const isInteractive = (isEraser || isSelectMode) && !isLive;

  const commonProps = {
    ref: shapeRef,
    x: draw.x || 0,
    y: draw.y || 0,
    scaleX: scaleX,
    scaleY: scaleY,
    rotation: rotation,
    draggable: isSelectMode && !isLive,
    listening: isInteractive,
    onClick: handleClick,
    onTap: handleClick,
    onMouseDown: (e) => {
      if (isEraser) handleEraseAction(e);
    },
    onMouseEnter: (e) => {
      if (isEraser && e.evt && (e.evt.buttons === 1 || e.evt.which === 1)) {
        handleEraseAction(e);
      }
    },
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    hitStrokeWidth: Math.max(strokeWidth + 14, 24),
  };

  let renderedElement = null;

  switch (type) {
    case DRAW_MODES.MARKER:
    case "marker":
    case "freehand":
      renderedElement = (
          <Line
              points={safePoints}
              stroke={stroke}
              strokeWidth={strokeWidth}
              tension={0.4}
              lineCap="round"
              lineJoin="round"
              opacity={opacity}
              {...commonProps}
          />
      );
      break;

    case DRAW_MODES.BRUSH:
    case "brush":
      renderedElement = (
          <Line
              points={safePoints}
              stroke={stroke}
              strokeWidth={strokeWidth}
              fill={draw.fill || `${stroke}33`}
              closed={true}
              tension={0.3}
              lineCap="round"
              lineJoin="round"
              opacity={opacity}
              {...commonProps}
          />
      );
      break;

    case DRAW_MODES.LINE:
    case "line":
      renderedElement = (
          <Line
              points={safePoints}
              stroke={stroke}
              strokeWidth={strokeWidth}
              lineCap="round"
              lineJoin="round"
              opacity={opacity}
              {...commonProps}
          />
      );
      break;

    case DRAW_MODES.POLYGON:
    case "polygon":
      renderedElement = (
          <Line
              points={safePoints}
              stroke={stroke}
              strokeWidth={strokeWidth}
              fill={draw.fill || "transparent"}
              closed={!isLive}
              tension={0.1}
              lineCap="round"
              lineJoin="round"
              opacity={opacity}
              {...commonProps}
          />
      );
      break;

    case DRAW_MODES.RECTANGLE:
    case "rectangle":
    case "rect":
      renderedElement = (
          <Rect
              width={draw.width || 60}
              height={draw.height || 60}
              stroke={stroke}
              strokeWidth={strokeWidth}
              fill={draw.fill || "transparent"}
              cornerRadius={4}
              opacity={opacity}
              {...commonProps}
          />
      );
      break;

    case DRAW_MODES.CIRCLE:
    case "circle":
      renderedElement = (
          <Circle
              radius={draw.radius || 40}
              stroke={stroke}
              strokeWidth={strokeWidth}
              fill={draw.fill || "transparent"}
              opacity={opacity}
              {...commonProps}
          />
      );
      break;

    case DRAW_MODES.TRIANGLE:
    case "triangle":
      renderedElement = (
          <RegularPolygon
              sides={3}
              radius={draw.radius || 40}
              stroke={stroke}
              strokeWidth={strokeWidth}
              fill={draw.fill || "transparent"}
              opacity={opacity}
              {...commonProps}
          />
      );
      break;

    case DRAW_MODES.HEXAGON:
    case "hexagon":
      renderedElement = (
          <RegularPolygon
              sides={6}
              radius={draw.radius || 45}
              stroke={stroke}
              strokeWidth={strokeWidth}
              fill={draw.fill || "transparent"}
              opacity={opacity}
              {...commonProps}
          />
      );
      break;

    case "text":
    case "TEXT":
      renderedElement = (
          <Text
              text={draw.text || ""}
              fontSize={draw.fontSize || 22}
              fontFamily="Vazirmatn"
              fill={draw.fill || stroke}
              opacity={opacity}
              {...commonProps}
          />
      );
      break;

    default:
      return null;
  }

  return (
      <Group>
        {renderedElement}
        {isSelected && isSelectMode && (
            <Transformer
                ref={trRef}
                rotateEnabled={true}
                keepRatio={type === DRAW_MODES.CIRCLE || type === "circle" || type === DRAW_MODES.TRIANGLE || type === DRAW_MODES.HEXAGON}
                boundBoxFunc={(oldBox, newBox) => {
                  if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
                anchorFill="#f59e0b"
                anchorStroke="#090a0f"
                anchorCornerRadius={3}
                anchorSize={8}
                borderStroke="#f59e0b"
                borderDash={[4, 4]}
            />
        )}
      </Group>
  );
};

export const DrawingLayer = ({
                               liveDrawing = null,
                               isEraser = false,
                               isSelectMode = false,
                               onErase = null,
                             }) => {
  const currentScene = useSceneStore((state) => state.currentScene);
  const remoteLiveDrawing = useSceneStore((state) => state.remoteLiveDrawing);
  const updateDrawing = useSceneStore((state) => state.updateDrawing);

  const selectedDrawingId = useCanvasStore((state) => state.selectedDrawingId);
  const setSelectedDrawingId = useCanvasStore((state) => state.setSelectedDrawingId);

  const { isGM } = usePermissions();
  const drawings = currentScene?.drawings || [];

  const handleUpdateDrawing = (drawId, updates) => {
    updateDrawing(drawId, updates);
    const existing = drawings.find((d) => String(d.clientDrawingId || d.id || d.drawingId) === String(drawId));
    if (existing) {
      const fullUpdated = {
        ...existing,
        ...updates,
        id: drawId,
        clientDrawingId: drawId,
        sceneId: currentScene?.id,
      };
      wsService.send("DRAWING_ADD", fullUpdated);
    }
  };

  return (
      <Group id="drawing-group-layer">
        {drawings.map((draw) => {
          const drawId = String(draw.clientDrawingId || draw.id || draw.drawingId);
          return (
              <SingleDrawingShape
                  key={drawId}
                  draw={draw}
                  isLive={false}
                  isEraser={isEraser}
                  isSelectMode={isSelectMode}
                  isSelected={selectedDrawingId === drawId}
                  onSelect={setSelectedDrawingId}
                  onErase={onErase}
                  onUpdate={handleUpdateDrawing}
                  isGM={isGM}
              />
          );
        })}

        {liveDrawing && (
            <SingleDrawingShape
                draw={liveDrawing}
                isLive={true}
                isGM={isGM}
            />
        )}

        {remoteLiveDrawing && (
            <SingleDrawingShape
                draw={remoteLiveDrawing}
                isLive={true}
                isGM={isGM}
            />
        )}
      </Group>
  );
};