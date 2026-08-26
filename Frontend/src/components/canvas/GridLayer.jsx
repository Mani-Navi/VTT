import React, { useMemo } from "react";
import { Line, Shape, Group, Circle } from "react-konva";
import { GRID_TYPES } from "../../constants/tools";
import { getHexPoints } from "../../utils/grid";

export const GridLayer = ({ grid, width, height }) => {
  if (!grid || !grid.enabled || grid.type === (GRID_TYPES?.NONE || "none") || (grid.size || 50) <= 5) {
    return null;
  }

  const {
    type = "square",
    size = 50,
    color = "#000000",
    opacity = 0.3,
    lineType = "solid",
    lineWidth = 1,
  } = grid;

  const dashPattern = useMemo(() => {
    if (lineType === "dotted") return [4, 4];
    return undefined;
  }, [lineType]);

  // ۱. رندر گرید مربعی (Solid, Dotted, Dots)
  if (type === "square" || type === (GRID_TYPES?.SQUARE || "square")) {
    if (lineType === "dots") {
      // رندر به صورت نقاط تقاطع
      const dots = [];
      for (let x = 0; x <= width; x += size) {
        for (let y = 0; y <= height; y += size) {
          dots.push({ x, y, key: `dot-${x}-${y}` });
        }
      }

      return (
          <Group listening={false} opacity={opacity}>
            {dots.map((d) => (
                <Circle
                    key={d.key}
                    x={d.x}
                    y={d.y}
                    radius={lineWidth * 1.5}
                    fill={color}
                    listening={false}
                />
            ))}
          </Group>
      );
    }

    const lines = [];
    for (let x = 0; x <= width; x += size) {
      lines.push({ points: [x, 0, x, height], key: `v-${x}` });
    }
    for (let y = 0; y <= height; y += size) {
      lines.push({ points: [0, y, width, y], key: `h-${y}` });
    }

    return (
        <Group listening={false} opacity={opacity}>
          {lines.map((line) => (
              <Line
                  key={line.key}
                  points={line.points}
                  stroke={color}
                  strokeWidth={lineWidth}
                  dash={dashPattern}
                  listening={false}
              />
          ))}
        </Group>
    );
  }

  // ۲. رندر گرید ایزومتریک / لوزی
  if (type === "isometric" || type === (GRID_TYPES?.DIMETRIC || "isometric")) {
    return (
        <Shape
            listening={false}
            opacity={opacity}
            stroke={color}
            strokeWidth={lineWidth}
            dash={dashPattern}
            sceneFunc={(context, shape) => {
              context.beginPath();
              const step = size;
              for (let d = -height; d <= width; d += step) {
                context.moveTo(d, 0);
                context.lineTo(d + height, height);
                context.moveTo(d + height, 0);
                context.lineTo(d, height);
              }
              context.fillStrokeShape(shape);
            }}
        />
    );
  }

  // ۳. رندر گرید شش‌ضلعی (Hexagonal H & V)
  if (type === "hex_h" || type === "hex_v" || type === (GRID_TYPES?.HEX_H || "hex_h") || type === (GRID_TYPES?.HEX_V || "hex_v")) {
    const isHorizontal = type === "hex_h" || type === (GRID_TYPES?.HEX_H || "hex_h");
    const radius = size / 2;
    const hexPoints = getHexPoints(radius, isHorizontal);

    return (
        <Shape
            listening={false}
            opacity={opacity}
            stroke={color}
            strokeWidth={lineWidth}
            dash={dashPattern}
            sceneFunc={(context, shape) => {
              context.beginPath();
              const colStep = isHorizontal ? size * 0.75 : size * 0.866;
              const rowStep = isHorizontal ? size * 0.866 : size * 0.75;

              for (let x = radius; x < width + radius; x += colStep) {
                const colIndex = Math.floor(x / colStep);
                const yOffset = (colIndex % 2) * (rowStep / 2);

                for (let y = radius + yOffset; y < height + radius; y += rowStep) {
                  context.save();
                  context.translate(x, y);
                  context.moveTo(hexPoints[0], hexPoints[1]);
                  for (let i = 2; i < hexPoints.length; i += 2) {
                    context.lineTo(hexPoints[i], hexPoints[i + 1]);
                  }
                  context.closePath();
                  context.restore();
                }
              }

              context.fillStrokeShape(shape);
            }}
        />
    );
  }

  return null;
};