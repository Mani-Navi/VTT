import { GRID_TYPES } from "../constants/tools.js";

export function snapToGrid(x, y, gridSize = 50, gridType = "square", tokenSize = 1) {
  if (gridSize <= 0 || gridType === (GRID_TYPES?.NONE || "none")) {
    return { x, y };
  }

  const isSquare = gridType === (GRID_TYPES?.SQUARE || "square");
  const isHexH = gridType === (GRID_TYPES?.HEX_H || "hex_h");
  const isHexV = gridType === (GRID_TYPES?.HEX_V || "hex_v");

  if (isSquare) {
    const halfGrid = (gridSize * tokenSize) / 2;
    const snappedX = Math.round((x - halfGrid) / gridSize) * gridSize + halfGrid;
    const snappedY = Math.round((y - halfGrid) / gridSize) * gridSize + halfGrid;
    return { x: snappedX, y: snappedY };
  }

  if (isHexH || isHexV) {
    const rowHeight = gridSize * 0.866;
    const colWidth = gridSize * 0.75;
    const snappedX = Math.round(x / colWidth) * colWidth;
    const snappedY = Math.round(y / rowHeight) * rowHeight;
    return { x: snappedX, y: snappedY };
  }

  const snappedX = Math.round(x / gridSize) * gridSize;
  const snappedY = Math.round(y / gridSize) * gridSize;
  return { x: snappedX, y: snappedY };
}

export function getHexPoints(radius, isHorizontal = true) {
  const points = [];
  const angleOffset = isHorizontal ? 0 : Math.PI / 6;

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + angleOffset;
    points.push(radius * Math.cos(angle));
    points.push(radius * Math.sin(angle));
  }

  return points;
}