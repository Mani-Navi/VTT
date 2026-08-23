import React from "react";
import { Line, Arrow, Rect, Circle, Text, Group } from "react-konva";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { DRAW_SHAPES } from "../../constants/tools";

export const DrawingLayer: React.FC = () => {
  const currentScene = useSceneStore((state) => state.currentScene);
  const { isGM } = usePermissions();

  if (!currentScene || !currentScene.drawings) {
    return null;
  }

  return (
    <Group>
      {currentScene.drawings.map((draw) => {
        // If drawing is on GM layer and current user is not GM, do not render
        if (draw.isGMLayer && !isGM) {
          return null;
        }

        const opacity = draw.isGMLayer ? 0.6 : 1;

        switch (draw.type) {
          case DRAW_SHAPES.FREEHAND:
          case DRAW_SHAPES.LINE:
            return (
              <Line
                key={draw.id}
                points={draw.points}
                stroke={draw.stroke}
                strokeWidth={draw.strokeWidth}
                tension={draw.type === DRAW_SHAPES.FREEHAND ? 0.4 : 0}
                lineCap="round"
                lineJoin="round"
                opacity={opacity}
                listening={false}
              />
            );

          case DRAW_SHAPES.ARROW:
            return (
              <Arrow
                key={draw.id}
                points={draw.points}
                stroke={draw.stroke}
                fill={draw.stroke}
                strokeWidth={draw.strokeWidth}
                pointerLength={12}
                pointerWidth={12}
                opacity={opacity}
                listening={false}
              />
            );

          case DRAW_SHAPES.RECTANGLE:
            return (
              <Rect
                key={draw.id}
                x={draw.x}
                y={draw.y}
                width={draw.width || 50}
                height={draw.height || 50}
                stroke={draw.stroke}
                strokeWidth={draw.strokeWidth}
                fill={draw.fill || "transparent"}
                opacity={opacity}
                listening={false}
              />
            );

          case DRAW_SHAPES.CIRCLE:
            return (
              <Circle
                key={draw.id}
                x={draw.x}
                y={draw.y}
                radius={draw.radius || 40}
                stroke={draw.stroke}
                strokeWidth={draw.strokeWidth}
                fill={draw.fill || "transparent"}
                opacity={opacity}
                listening={false}
              />
            );

          case DRAW_SHAPES.TEXT:
            return (
              <Text
                key={draw.id}
                x={draw.x}
                y={draw.y}
                text={draw.text || ""}
                fontSize={draw.fontSize || 16}
                fill={draw.stroke || "#ffffff"}
                fontStyle="bold"
                opacity={opacity}
                listening={false}
              />
            );

          default:
            return null;
        }
      })}
    </Group>
  );
};
