import React, { useMemo } from "react";
import { Line, Shape, Group } from "react-konva";
import { GRID_TYPES } from "../../constants/tools";
import { getHexPoints } from "../../utils/grid";

export const GridLayer = ({ grid, width, height }) => {
  if (!grid || !grid.enabled || grid.type === (GRID_TYPES?.NONE || "none") || (grid.size || 50) <= 5) {
    return null;
  }

  const { type = "square", size = 50, color = "#000000", opacity = 0.3 } = grid;

  const squareLines = useMemo(() => {
    if (type !== (GRID_TYPES?.SQUARE || "square")) return [];
    const lines = [];

    // خطوط عمودی
    for (let x = 0; x <= width; x += size) {
      lines.push({ points: [x, 0, x, height], key: `v-${x}` });
    }
    // خطوط افقی
    for (let y = 0; y <= height; y += size) {
      lines.push({ points: [0, y, width, y], key: `h-${y}` });
    }

    return lines;
  }, [type, width, height, size]);

  if (type === (GRID_TYPES?.SQUARE || "square")) {
    return (
        <Group listening={false} opacity={opacity}>
          {squareLines.map((line) => (
              <Line
                  key={line.key}
                  points={line.points}
                  stroke={color}
                  strokeWidth={1}
                  listening={false}
              />
          ))}
        </Group>
    );
  }

  // گرید شش‌ضلعی (Hexagonal)
  if (type === (GRID_TYPES?.HEX_H || "hex_h") || type === (GRID_TYPES?.HEX_V || "hex_v")) {
    const isHorizontal = type === (GRID_TYPES?.HEX_H || "hex_h");
    const radius = size / 2;
    const hexPoints = getHexPoints(radius, isHorizontal);

    return (
        <Shape
            listening={false}
            opacity={opacity}
            stroke={color}
            strokeWidth={1}
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