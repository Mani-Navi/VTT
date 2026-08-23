import React, { useMemo } from "react";
import { Line, Shape, Group } from "react-konva";
import { GridConfig } from "../../types";
import { GRID_TYPES } from "../../constants/tools";
import { getHexPoints } from "../../utils/grid";

interface GridLayerProps {
  grid: GridConfig;
  width: number;
  height: number;
}

export const GridLayer: React.FC<GridLayerProps> = ({ grid, width, height }) => {
  const { enabled, type, size, color, opacity } = grid;

  if (!enabled || type === GRID_TYPES.NONE || size <= 5) {
    return null;
  }

  // Generate Square grid lines
  const squareLines = useMemo(() => {
    if (type !== GRID_TYPES.SQUARE) return [];
    const lines: Array<{ points: number[]; key: string }> = [];

    // Vertical lines
    for (let x = 0; x <= width; x += size) {
      lines.push({
        points: [x, 0, x, height],
        key: `v-${x}`,
      });
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += size) {
      lines.push({
        points: [0, y, width, y],
        key: `h-${y}`,
      });
    }

    return lines;
  }, [type, width, height, size]);

  if (type === GRID_TYPES.SQUARE) {
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

  // Hexagonal grid drawing
  if (type === GRID_TYPES.HEX_H || type === GRID_TYPES.HEX_V) {
    const isHorizontal = type === GRID_TYPES.HEX_H;
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
