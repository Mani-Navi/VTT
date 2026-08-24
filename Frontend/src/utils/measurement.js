import { MEASUREMENT_TYPES } from "../constants/measurementTypes.js";

/**
 * محاسبه فاصله یک قطعه بر اساس قوانین هندسی و D&D 5e
 */
export function calculateSegmentDistance(p1, p2, gridSize, scaleValue, type) {
  if (!gridSize || gridSize <= 0) return { distance: 0, gridUnits: 0 };

  const dxPixels = Math.abs(p2.x - p1.x);
  const dyPixels = Math.abs(p2.y - p1.y);

  const dxCells = dxPixels / gridSize;
  const dyCells = dyPixels / gridSize;

  let cellDistance = 0;
  const euclideanType = MEASUREMENT_TYPES?.EUCLIDEAN || "EUCLIDEAN";
  const dnd5eType = MEASUREMENT_TYPES?.DND5E_5105 || "DND5E_5105";
  const manhattanType = MEASUREMENT_TYPES?.MANHATTAN || "MANHATTAN";
  const chebyshevType = MEASUREMENT_TYPES?.CHEBYSHEV || "CHEBYSHEV";

  switch (type) {
    case euclideanType: {
      cellDistance = Math.sqrt(dxCells * dxCells + dyCells * dyCells);
      break;
    }
    case dnd5eType: {
      // قانون ۵-۱۰-۵ در دی اند دی: قطر اول ۵ فوت، قطر دوم ۱۰ فوت
      const straight = Math.max(dxCells, dyCells);
      const diagonal = Math.min(dxCells, dyCells);
      cellDistance = straight + Math.floor(diagonal * 0.5);
      break;
    }
    case manhattanType: {
      cellDistance = dxCells + dyCells;
      break;
    }
    case chebyshevType: {
      cellDistance = Math.max(dxCells, dyCells);
      break;
    }
    default:
      cellDistance = Math.sqrt(dxCells * dxCells + dyCells * dyCells);
  }

  const distance = cellDistance * (scaleValue || 5);
  return { distance, gridUnits: cellDistance };
}

/**
 * محاسبه مجموع مسافت مسیر چندنقطه‌ای (Waypoints)
 */
export function calculateTotalDistance(start, end, waypoints = [], gridSize = 50, scaleValue = 5, unit = "ft", type = "EUCLIDEAN") {
  const points = [start, ...waypoints, end];
  let totalDistance = 0;
  let totalCells = 0;

  for (let i = 0; i < points.length - 1; i++) {
    if (points[i] && points[i + 1]) {
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
  }

  const roundedDist = Math.round(totalDistance * 10) / 10;
  const roundedCells = Math.round(totalCells * 10) / 10;

  let unitLabel = unit;
  if (unit === "ft") unitLabel = "فوت";
  if (unit === "m") unitLabel = "متر";
  if (unit === "sq") unitLabel = "خانه";
  if (unit === "hex") unitLabel = "هگز";

  return {
    distance: roundedDist,
    gridUnits: roundedCells,
    formattedText: `${roundedDist} ${unitLabel}`,
  };
}