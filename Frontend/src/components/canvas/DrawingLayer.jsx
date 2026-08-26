import React from "react";
import { Line, Rect, Circle, RegularPolygon, Text, Group } from "react-konva";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { DRAW_MODES } from "../../constants/tools";

export const DrawingLayer = ({ liveDrawing = null }) => {
  const currentScene = useSceneStore((state) => state.currentScene);
  const { isGM } = usePermissions();

  const drawings = currentScene?.drawings || [];

  const renderSingleDraw = (draw, isLive = false) => {
    if (draw.isGMLayer && !isGM) return null;
    const opacity = isLive ? 0.75 : draw.isGMLayer ? 0.65 : 1;
    const type = draw.type || draw.tool || "marker";
    const stroke = draw.stroke || draw.color || "#f59e0b";
    const strokeWidth = draw.strokeWidth || draw.lineWidth || 4;

    switch (type) {
      case DRAW_MODES.MARKER:
      case "marker":
      case "freehand":
        return (
            <Line
                key={draw.id || "live-freehand"}
                points={draw.points || []}
                stroke={stroke}
                strokeWidth={strokeWidth}
                tension={0.4}
                lineCap="round"
                lineJoin="round"
                opacity={opacity}
                listening={false}
            />
        );

      case DRAW_MODES.BRUSH:
      case "brush":
        return (
            <Line
                key={draw.id || "live-brush"}
                points={draw.points || []}
                stroke={stroke}
                strokeWidth={strokeWidth}
                fill={draw.fill || `${stroke}33`}
                closed={true}
                tension={0.3}
                lineCap="round"
                lineJoin="round"
                opacity={opacity}
                listening={false}
            />
        );

      case DRAW_MODES.LINE:
      case "line":
        return (
            <Line
                key={draw.id || "live-line"}
                points={draw.points || []}
                stroke={stroke}
                strokeWidth={strokeWidth}
                lineCap="round"
                lineJoin="round"
                opacity={opacity}
                listening={false}
            />
        );

      case DRAW_MODES.POLYGON:
      case "polygon":
        return (
            <Line
                key={draw.id || "live-poly"}
                points={draw.points || []}
                stroke={stroke}
                strokeWidth={strokeWidth}
                fill={draw.fill || "transparent"}
                closed={true}
                lineCap="round"
                lineJoin="round"
                opacity={opacity}
                listening={false}
            />
        );

      case DRAW_MODES.RECTANGLE:
      case "rectangle":
      case "rect":
        return (
            <Rect
                key={draw.id || "live-rect"}
                x={draw.x || 0}
                y={draw.y || 0}
                width={draw.width || 60}
                height={draw.height || 60}
                stroke={stroke}
                strokeWidth={strokeWidth}
                fill={draw.fill || "transparent"}
                cornerRadius={4}
                opacity={opacity}
                listening={false}
            />
        );

      case DRAW_MODES.CIRCLE:
      case "circle":
        return (
            <Circle
                key={draw.id || "live-circle"}
                x={draw.x || 0}
                y={draw.y || 0}
                radius={draw.radius || 40}
                stroke={stroke}
                strokeWidth={strokeWidth}
                fill={draw.fill || "transparent"}
                opacity={opacity}
                listening={false}
            />
        );

      case DRAW_MODES.TRIANGLE:
      case "triangle":
        return (
            <RegularPolygon
                key={draw.id || "live-triangle"}
                x={draw.x || 0}
                y={draw.y || 0}
                sides={3}
                radius={draw.radius || 40}
                stroke={stroke}
                strokeWidth={strokeWidth}
                fill={draw.fill || "transparent"}
                opacity={opacity}
                listening={false}
            />
        );

      case DRAW_MODES.HEXAGON:
      case "hexagon":
        return (
            <RegularPolygon
                key={draw.id || "live-hex"}
                x={draw.x || 0}
                y={draw.y || 0}
                sides={6}
                radius={draw.radius || 45}
                stroke={stroke}
                strokeWidth={strokeWidth}
                fill={draw.fill || "transparent"}
                opacity={opacity}
                listening={false}
            />
        );

      case "text":
      case "TEXT":
        return (
            <Text
                key={draw.id || "live-text"}
                x={draw.x || 0}
                y={draw.y || 0}
                text={draw.text || ""}
                fontSize={20}
                fontFamily="Vazirmatn"
                fill={stroke}
                opacity={opacity}
                listening={false}
            />
        );

      default:
        return null;
    }
  };

  return (
      <Group id="drawing-group-layer">
        {drawings.map((draw) => renderSingleDraw(draw, false))}
        {liveDrawing && renderSingleDraw(liveDrawing, true)}
      </Group>
  );
};