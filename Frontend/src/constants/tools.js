export const TOOLS = {
  SELECT: "select",
  PAN: "pan",
  DRAW: "draw",
  TEXT: "text",
  FOG: "fog",
  RULER: "ruler",
  LASER: "laser",
  ERASER: "eraser",
  DICE: "dice",
};

export const DRAW_MODES = {
  GRAB: "grab",
  MARKER: "marker",
  BRUSH: "brush",
  LINE: "line",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  TRIANGLE: "triangle",
  HEXAGON: "hexagon",
  POLYGON: "polygon",
  ERASER: "eraser",
};

export const DRAW_SHAPES = DRAW_MODES;

export const TEXT_FONTS = [
  { id: "Vazirmatn", label: "وزیرمتن (Vazirmatn)" },
  { id: "Sahel", label: "ساحل (Sahel)" },
  { id: "Shabnam", label: "شبنم (Shabnam)" },
  { id: "Samim", label: "صمیم (Samim)" },
  { id: "monospace", label: "تک‌فاصله (Monospace)" },
];

export const FOG_ACTIONS = {
  REVEAL: "reveal",
  HIDE: "hide",
  SLICE: "slice",
};

export const FOG_BRUSH_SHAPES = {
  CIRCLE: "circle",
  RECTANGLE: "rect",
  TRIANGLE: "triangle",
  HEXAGON: "hexagon",
  FREEHAND: "freehand",
};

export const FOG_MODES = {
  REVEAL_RECT: "reveal_rect",
  REVEAL_CIRCLE: "reveal_circle",
  HIDE_RECT: "hide_rect",
  HIDE_CIRCLE: "hide_circle",
  SLICE: "slice",
  FILL_ALL: "fill_all",
  CLEAR_ALL: "clear_all",
};

// ثابت گرید مورد نیاز سیستم و رندرینگ تاکتیکال
export const GRID_TYPES = {
  SQUARE: "square",
  HEX_H: "hex_h",
  HEX_V: "hex_v",
  DIMETRIC: "isometric",
  NONE: "none",
};