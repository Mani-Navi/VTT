export const TOOLS = {
  SELECT: "select",
  PAN: "pan",
  DRAW: "draw",
  FOG: "fog",
  RULER: "ruler",
  LASER: "laser",
  TOKEN: "token",
  DICE: "dice",
  NOTE: "note",
} as const;

export type ToolType = (typeof TOOLS)[keyof typeof TOOLS];

export const DRAW_SHAPES = {
  FREEHAND: "freehand",
  LINE: "line",
  ARROW: "arrow",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  TEXT: "text",
  ERASER: "eraser",
} as const;

export type DrawShapeType = (typeof DRAW_SHAPES)[keyof typeof DRAW_SHAPES];

export const FOG_MODES = {
  REVEAL_RECT: "reveal_rect",
  REVEAL_CIRCLE: "reveal_circle",
  REVEAL_BRUSH: "reveal_brush",
  HIDE_RECT: "hide_rect",
  HIDE_CIRCLE: "hide_circle",
  HIDE_BRUSH: "hide_brush",
  HIDE_ALL: "hide_all",
  REVEAL_ALL: "reveal_all",
} as const;

export type FogModeType = (typeof FOG_MODES)[keyof typeof FOG_MODES];

export const FOG_BRUSH_SHAPES = {
  CIRCLE: "circle",
  RECTANGLE: "rect",
} as const;

export type FogBrushShapeType = (typeof FOG_BRUSH_SHAPES)[keyof typeof FOG_BRUSH_SHAPES];

export const FOG_ACTIONS = {
  REVEAL: "reveal",
  HIDE: "hide",
} as const;

export type FogActionType = (typeof FOG_ACTIONS)[keyof typeof FOG_ACTIONS];

export const GRID_TYPES = {
  SQUARE: "square",
  HEX_H: "hex_h",
  HEX_V: "hex_v",
  DIMETRIC: "isometric",
  NONE: "none",
} as const;

export type GridType = (typeof GRID_TYPES)[keyof typeof GRID_TYPES];
