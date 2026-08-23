import { GRID_TYPES, GridType } from "../constants/tools";

export function snapToGrid(
  x: number,
  y: number,
  gridSize: number,
  gridType: GridType = GRID_TYPES.SQUARE,
  tokenSize: number = 1
): { x: number; y: number } {
  if (gridSize <= 0 || gridType === GRID_TYPES.NONE) {
    return { x, y };
  }

  if (gridType === GRID_TYPES.SQUARE) {
    // For 1x1 token, center or top-left snapping
    const halfGrid = (gridSize * tokenSize) / 2;
    const snappedX = Math.round((x - halfGrid) / gridSize) * gridSize + halfGrid;
    const snappedY = Math.round((y - halfGrid) / gridSize) * gridSize + halfGrid;
    return { x: snappedX, y: snappedY };
  }

  if (gridType === GRID_TYPES.HEX_H || gridType === GRID_TYPES.HEX_V) {
    // Hexagonal snapping approximation
    const rowHeight = gridSize * 0.866; // sqrt(3)/2
    const colWidth = gridSize * 0.75;
    const snappedX = Math.round(x / colWidth) * colWidth;
    const snappedY = Math.round(y / rowHeight) * rowHeight;
    return { x: snappedX, y: snappedY };
  }

  const snappedX = Math.round(x / gridSize) * gridSize;
  const snappedY = Math.round(y / gridSize) * gridSize;
  return { x: snappedX, y: snappedY };
}

export function getHexPoints(radius: number, isHorizontal: boolean = true): number[] {
  const points: number[] = [];
  const angleOffset = isHorizontal ? 0 : Math.PI / 6;

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + angleOffset;
    points.push(radius * Math.cos(angle));
    points.push(radius * Math.sin(angle));
  }

  return points;
}
