import { MEASUREMENT_TYPES, MeasurementType, MeasurementUnit } from "../constants/measurementTypes";
import { Waypoint } from "../types";

export interface MeasurementResult {
  distance: number;
  formattedText: string;
  gridUnits: number;
}

/**
 * Calculates distance between two points based on the active measurement rule
 */
export function calculateSegmentDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  gridSize: number,
  scaleValue: number,
  type: MeasurementType
): { distance: number; gridUnits: number } {
  if (gridSize <= 0) return { distance: 0, gridUnits: 0 };

  const dxPixels = Math.abs(p2.x - p1.x);
  const dyPixels = Math.abs(p2.y - p1.y);

  const dxCells = dxPixels / gridSize;
  const dyCells = dyPixels / gridSize;

  let cellDistance = 0;

  switch (type) {
    case MEASUREMENT_TYPES.EUCLIDEAN: {
      // Direct geometric straight line
      cellDistance = Math.sqrt(dxCells * dxCells + dyCells * dyCells);
      break;
    }
    case MEASUREMENT_TYPES.DND5E_5105: {
      // D&D 5e alternating diagonals (5ft, 10ft, 5ft, 10ft...)
      // Equivalent to: max(dx, dy) + floor(min(dx, dy) / 2)
      const straight = Math.max(dxCells, dyCells);
      const diagonal = Math.min(dxCells, dyCells);
      cellDistance = straight + Math.floor(diagonal * 0.5);
      break;
    }
    case MEASUREMENT_TYPES.MANHATTAN: {
      // Grid taxicab
      cellDistance = dxCells + dyCells;
      break;
    }
    case MEASUREMENT_TYPES.CHEBYSHEV: {
      // Diagonal equals straight (Pathfinder 1-1-1 / D&D 4e)
      cellDistance = Math.max(dxCells, dyCells);
      break;
    }
    default:
      cellDistance = Math.sqrt(dxCells * dxCells + dyCells * dyCells);
  }

  const distance = cellDistance * scaleValue;
  return { distance, gridUnits: cellDistance };
}

/**
 * Calculates total path distance across all waypoints
 */
export function calculateTotalDistance(
  start: { x: number; y: number },
  end: { x: number; y: number },
  waypoints: Waypoint[],
  gridSize: number,
  scaleValue: number,
  unit: MeasurementUnit,
  type: MeasurementType
): MeasurementResult {
  const points = [start, ...waypoints, end];
  let totalDistance = 0;
  let totalCells = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const res = calculateSegmentDistance(
      points[i],
      points[i + 1],
      gridSize,
      scaleValue,
      type
    );
    totalDistance += res.distance;
    totalCells += res.gridUnits;
  }

  // Round neatly
  const roundedDist = Math.round(totalDistance * 10) / 10;
  const roundedCells = Math.round(totalCells * 10) / 10;

  let unitLabel = unit;
  if (unit === "ft") unitLabel = "ft (فوت)" as any;
  if (unit === "m") unitLabel = "m (متر)" as any;
  if (unit === "sq") unitLabel = "خانه" as any;
  if (unit === "hex") unitLabel = "هگز" as any;

  return {
    distance: roundedDist,
    gridUnits: roundedCells,
    formattedText: `${roundedDist} ${unitLabel}`,
  };
}
