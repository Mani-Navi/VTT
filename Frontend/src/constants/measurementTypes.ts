export const MEASUREMENT_TYPES = {
  EUCLIDEAN: "euclidean",      // Geometric direct straight line: sqrt(dx^2 + dy^2)
  DND5E_5105: "dnd5e_5105",    // D&D 5e rule: alternating diagonal (5ft then 10ft then 5ft...)
  MANHATTAN: "manhattan",      // Grid grid taxicab: dx + dy
  CHEBYSHEV: "chebyshev",      // Max of dx, dy (D&D 4e / Pathfinder alternate standard)
} as const;

export type MeasurementType = (typeof MEASUREMENT_TYPES)[keyof typeof MEASUREMENT_TYPES];

export const MEASUREMENT_UNITS = {
  FEET: "ft",
  METERS: "m",
  GRID_UNITS: "sq",
  HEXES: "hex",
} as const;

export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[keyof typeof MEASUREMENT_UNITS];
