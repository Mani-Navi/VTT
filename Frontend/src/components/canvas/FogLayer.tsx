import React from "react";
import { Group, Rect, Circle, Line, Shape } from "react-konva";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { FogShape } from "../../types";

interface FogLayerProps {
  width: number;
  height: number;
}

export const FogLayer: React.FC<FogLayerProps> = ({ width, height }) => {
  const currentScene = useSceneStore((state) => state.currentScene);
  const { isGM } = usePermissions();

  if (!currentScene || !currentScene.fogEnabled) {
    return null;
  }

  const fogShapes: FogShape[] = currentScene.fogShapes || [];
  const fogOpacity = isGM ? (currentScene.fogOpacity || 0.6) * 0.72 : 0.98;
  const fogColor = currentScene.fogColor || "#09090b";

  // If no fog cutouts exist, cover the whole map
  if (fogShapes.length === 0) {
    return (
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={fogColor}
        opacity={fogOpacity}
        listening={false}
      />
    );
  }

  return (
    <Group listening={false}>
      {/* 1. Base Dark Mask with Cutout Subtractions (Reveals) */}
      <Shape
        opacity={fogOpacity}
        fill={fogColor}
        sceneFunc={(context, shape) => {
          context.beginPath();

          // 1. Outer boundary (entire canvas/map)
          context.rect(0, 0, width, height);

          // 2. Cut out revealed shapes (isCover: false)
          fogShapes.forEach((fog) => {
            if (!fog.isCover) {
              if (fog.type === "rect" && fog.x !== undefined && fog.y !== undefined) {
                // Cut rectangle in counter-clockwise orientation
                const w = fog.width || 0;
                const h = fog.height || 0;
                context.rect(fog.x + w, fog.y, -w, h);
              } else if (
                (fog.type === "circle" || !fog.type) &&
                fog.x !== undefined &&
                fog.y !== undefined
              ) {
                // Cut circle
                context.arc(
                  fog.x,
                  fog.y,
                  fog.radius || 50,
                  0,
                  Math.PI * 2,
                  true // counter-clockwise to subtract
                );
              } else if (fog.type === "brush" && fog.points && fog.points.length >= 2) {
                // Cut brush stroke path
                const rad = fog.radius || 40;
                for (let i = 0; i < fog.points.length; i += 2) {
                  const px = fog.points[i];
                  const py = fog.points[i + 1];
                  context.moveTo(px + rad, py);
                  context.arc(px, py, rad, 0, Math.PI * 2, true);
                }
              } else if (fog.type === "polygon" && fog.points && fog.points.length >= 6) {
                // Cut polygon
                context.moveTo(fog.points[0], fog.points[1]);
                for (let i = fog.points.length - 2; i >= 2; i -= 2) {
                  context.lineTo(fog.points[i], fog.points[i + 1]);
                }
                context.closePath();
              }
            }
          });

          context.fillStrokeShape(shape);
        }}
      />

      {/* 2. Re-covered Fog Shapes (isCover: true) */}
      <Group>
        {fogShapes
          .filter((f) => f.isCover)
          .map((cover) => {
            if (cover.type === "circle") {
              return (
                <Circle
                  key={cover.id}
                  x={cover.x || 0}
                  y={cover.y || 0}
                  radius={cover.radius || 50}
                  fill={fogColor}
                  opacity={fogOpacity}
                  listening={false}
                />
              );
            }

            if (cover.type === "brush" && cover.points && cover.points.length >= 2) {
              return (
                <Group key={cover.id}>
                  <Line
                    points={cover.points}
                    stroke={fogColor}
                    strokeWidth={(cover.radius || 40) * 2}
                    lineCap="round"
                    lineJoin="round"
                    opacity={fogOpacity}
                    listening={false}
                  />
                  {/* Endpoint circles for round caps */}
                  <Circle
                    x={cover.points[0]}
                    y={cover.points[1]}
                    radius={cover.radius || 40}
                    fill={fogColor}
                    opacity={fogOpacity}
                    listening={false}
                  />
                  <Circle
                    x={cover.points[cover.points.length - 2]}
                    y={cover.points[cover.points.length - 1]}
                    radius={cover.radius || 40}
                    fill={fogColor}
                    opacity={fogOpacity}
                    listening={false}
                  />
                </Group>
              );
            }

            return (
              <Rect
                key={cover.id}
                x={cover.x || 0}
                y={cover.y || 0}
                width={cover.width || 100}
                height={cover.height || 100}
                fill={fogColor}
                opacity={fogOpacity}
                listening={false}
              />
            );
          })}
      </Group>
    </Group>
  );
};
