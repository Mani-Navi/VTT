import React from "react";
import { Group, Rect, Circle, Line, Shape } from "react-konva";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";

export const FogLayer = ({ width = 2000, height = 1500 }) => {
  const currentScene = useSceneStore((state) => state.currentScene);
  const { isGM } = usePermissions();

  if (!currentScene || !currentScene.fogEnabled) {
    return null;
  }

  const fogShapes = currentScene.fogShapes || [];
  const fogOpacity = isGM ? (currentScene.fogOpacity || 0.6) * 0.72 : 0.98;
  const fogColor = currentScene.fogColor || "#09090b";

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
        {/* ۱. لایه پایه با بریدگی‌های آشکارسازی (Reveals) */}
        <Shape
            opacity={fogOpacity}
            fill={fogColor}
            sceneFunc={(context, shape) => {
              context.beginPath();
              context.rect(0, 0, width, height);

              fogShapes.forEach((fog) => {
                if (!fog.isCover) {
                  if (fog.type === "rect" && fog.x !== undefined && fog.y !== undefined) {
                    const w = fog.width || 0;
                    const h = fog.height || 0;
                    context.rect(fog.x + w, fog.y, -w, h);
                  } else if (fog.x !== undefined && fog.y !== undefined) {
                    context.arc(
                        fog.x,
                        fog.y,
                        fog.radius || 50,
                        0,
                        Math.PI * 2,
                        true
                    );
                  } else if (fog.type === "brush" && fog.points && fog.points.length >= 2) {
                    const rad = fog.radius || 40;
                    for (let i = 0; i < fog.points.length; i += 2) {
                      const px = fog.points[i];
                      const py = fog.points[i + 1];
                      context.moveTo(px + rad, py);
                      context.arc(px, py, rad, 0, Math.PI * 2, true);
                    }
                  }
                }
              });

              context.fillStrokeShape(shape);
            }}
        />

        {/* ۲. بخش‌های دوباره پوشانده‌شده (Covers) */}
        <Group>
          {fogShapes
              .filter((f) => f.isCover)
              .map((cover, idx) => {
                if (cover.type === "circle" || (!cover.type && cover.radius)) {
                  return (
                      <Circle
                          key={cover.id || idx}
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
                      <Line
                          key={cover.id || idx}
                          points={cover.points}
                          stroke={fogColor}
                          strokeWidth={(cover.radius || 40) * 2}
                          lineCap="round"
                          lineJoin="round"
                          opacity={fogOpacity}
                          listening={false}
                      />
                  );
                }

                return (
                    <Rect
                        key={cover.id || idx}
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