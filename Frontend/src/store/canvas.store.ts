import { create } from "zustand";
import {
  ToolType,
  TOOLS,
  DrawShapeType,
  DRAW_SHAPES,
  FogModeType,
  FOG_MODES,
  FogBrushShapeType,
  FOG_BRUSH_SHAPES,
  FogActionType,
  FOG_ACTIONS,
} from "../constants/tools";
import { MeasurementType, MEASUREMENT_TYPES, MeasurementUnit, MEASUREMENT_UNITS } from "../constants/measurementTypes";
import { Waypoint, DiceRoll } from "../types";

interface CanvasState {
  // Active tool & sub-tools
  activeTool: ToolType;
  activeDrawShape: DrawShapeType;
  activeFogMode: FogModeType;

  // Viewport & Zoom
  zoom: number;
  stageX: number;
  stageY: number;
  stageWidth: number;
  stageHeight: number;

  // Selection
  selectedTokenIds: string[];

  // Drawing settings
  drawStrokeColor: string;
  drawStrokeWidth: number;
  drawFillColor: string;
  isDrawGMLayer: boolean;

  // Fog brush settings
  fogBrushRadius: number;
  fogBrushShape: FogBrushShapeType;
  fogAction: FogActionType;

  // 3D Dice Simulation State
  is3DDiceEnabled: boolean;
  active3DRoll: DiceRoll | null;

  // Measurement tool state
  rulerType: MeasurementType;
  rulerUnit: MeasurementUnit;
  isMeasuring: boolean;
  measureStart: { x: number; y: number } | null;
  measureCurrent: { x: number; y: number } | null;
  measureWaypoints: Waypoint[];

  // Laser pointer state
  isLaserActive: boolean;
  laserPosition: { x: number; y: number } | null;

  // UI Panels state
  isAssetMenuOpen: boolean;
  isPlayerMenuOpen: boolean;
  isSettingsMenuOpen: boolean;
  isExtensionsMenuOpen: boolean;
  isDiceRollerOpen: boolean;
  isTokenEditorOpen: boolean;
  editingTokenId: string | null;

  // Actions
  setActiveTool: (tool: ToolType) => void;
  setActiveDrawShape: (shape: DrawShapeType) => void;
  setActiveFogMode: (mode: FogModeType) => void;

  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setStagePos: (x: number, y: number) => void;
  setStageSize: (width: number, height: number) => void;
  resetView: () => void;

  setSelectedTokenIds: (ids: string[]) => void;
  toggleTokenSelection: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;

  setDrawStrokeColor: (color: string) => void;
  setDrawStrokeWidth: (width: number) => void;
  setDrawFillColor: (color: string) => void;
  setIsDrawGMLayer: (isGM: boolean) => void;

  setFogBrushRadius: (radius: number) => void;
  setFogBrushShape: (shape: FogBrushShapeType) => void;
  setFogAction: (action: FogActionType) => void;

  setIs3DDiceEnabled: (enabled: boolean) => void;
  trigger3DRoll: (roll: DiceRoll) => void;
  clear3DRoll: () => void;

  setRulerType: (type: MeasurementType) => void;
  setRulerUnit: (unit: MeasurementUnit) => void;
  startMeasurement: (x: number, y: number) => void;
  updateMeasurement: (x: number, y: number) => void;
  addMeasurementWaypoint: (x: number, y: number) => void;
  endMeasurement: () => void;

  setLaserPosition: (pos: { x: number; y: number } | null) => void;
  setLaserActive: (active: boolean) => void;

  toggleMenu: (menu: "asset" | "player" | "settings" | "extensions" | "dice") => void;
  closeAllMenus: () => void;
  openTokenEditor: (tokenId: string) => void;
  closeTokenEditor: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  activeTool: TOOLS.SELECT,
  activeDrawShape: DRAW_SHAPES.FREEHAND,
  activeFogMode: FOG_MODES.REVEAL_RECT,

  zoom: 1,
  stageX: 0,
  stageY: 0,
  stageWidth: window.innerWidth,
  stageHeight: window.innerHeight,

  selectedTokenIds: [],

  drawStrokeColor: "#ef4444",
  drawStrokeWidth: 4,
  drawFillColor: "transparent",
  isDrawGMLayer: false,

  fogBrushRadius: 70,
  fogBrushShape: FOG_BRUSH_SHAPES.CIRCLE,
  fogAction: FOG_ACTIONS.REVEAL,

  is3DDiceEnabled: true,
  active3DRoll: null,

  rulerType: MEASUREMENT_TYPES.EUCLIDEAN,
  rulerUnit: MEASUREMENT_UNITS.FEET,
  isMeasuring: false,
  measureStart: null,
  measureCurrent: null,
  measureWaypoints: [],

  isLaserActive: false,
  laserPosition: null,

  isAssetMenuOpen: false,
  isPlayerMenuOpen: false,
  isSettingsMenuOpen: false,
  isExtensionsMenuOpen: false,
  isDiceRollerOpen: false,
  isTokenEditorOpen: false,
  editingTokenId: null,

  setActiveTool: (tool) =>
    set({
      activeTool: tool,
      isMeasuring: false,
      measureStart: null,
      measureCurrent: null,
      measureWaypoints: [],
      isLaserActive: tool === TOOLS.LASER,
    }),

  setActiveDrawShape: (shape) => set({ activeDrawShape: shape }),
  setActiveFogMode: (mode) => set({ activeFogMode: mode }),

  setZoom: (zoomOrFn) =>
    set((state) => {
      const nextZoom =
        typeof zoomOrFn === "function" ? zoomOrFn(state.zoom) : zoomOrFn;
      const clamped = Math.min(Math.max(nextZoom, 0.15), 3.5);
      return { zoom: clamped };
    }),

  setStagePos: (x, y) => set({ stageX: x, stageY: y }),
  setStageSize: (width, height) => set({ stageWidth: width, stageHeight: height }),

  resetView: () => set({ zoom: 1, stageX: 100, stageY: 100 }),

  setSelectedTokenIds: (ids) => set({ selectedTokenIds: ids }),

  toggleTokenSelection: (id, multiSelect = false) =>
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedTokenIds.includes(id);
        const updated = isSelected
          ? state.selectedTokenIds.filter((item) => item !== id)
          : [...state.selectedTokenIds, id];
        return { selectedTokenIds: updated };
      }
      return { selectedTokenIds: [id] };
    }),

  clearSelection: () => set({ selectedTokenIds: [] }),

  setDrawStrokeColor: (color) => set({ drawStrokeColor: color }),
  setDrawStrokeWidth: (width) => set({ drawStrokeWidth: width }),
  setDrawFillColor: (color) => set({ drawFillColor: color }),
  setIsDrawGMLayer: (isGM) => set({ isDrawGMLayer: isGM }),

  setFogBrushRadius: (radius) => set({ fogBrushRadius: radius }),
  setFogBrushShape: (shape) => set({ fogBrushShape: shape }),
  setFogAction: (action) => set({ fogAction: action }),

  setIs3DDiceEnabled: (enabled) => set({ is3DDiceEnabled: enabled }),
  trigger3DRoll: (roll) => set({ active3DRoll: roll }),
  clear3DRoll: () => set({ active3DRoll: null }),

  setRulerType: (type) => set({ rulerType: type }),
  setRulerUnit: (unit) => set({ rulerUnit: unit }),

  startMeasurement: (x, y) =>
    set({
      isMeasuring: true,
      measureStart: { x, y },
      measureCurrent: { x, y },
      measureWaypoints: [],
    }),

  updateMeasurement: (x, y) =>
    set((state) => (state.isMeasuring ? { measureCurrent: { x, y } } : state)),

  addMeasurementWaypoint: (x, y) =>
    set((state) => ({
      measureWaypoints: [...state.measureWaypoints, { x, y }],
    })),

  endMeasurement: () =>
    set({
      isMeasuring: false,
      measureStart: null,
      measureCurrent: null,
      measureWaypoints: [],
    }),

  setLaserPosition: (pos) => set({ laserPosition: pos }),
  setLaserActive: (active) => set({ isLaserActive: active }),

  toggleMenu: (menu) =>
    set((state) => ({
      isAssetMenuOpen: menu === "asset" ? !state.isAssetMenuOpen : false,
      isPlayerMenuOpen: menu === "player" ? !state.isPlayerMenuOpen : false,
      isSettingsMenuOpen: menu === "settings" ? !state.isSettingsMenuOpen : false,
      isExtensionsMenuOpen: menu === "extensions" ? !state.isExtensionsMenuOpen : false,
      isDiceRollerOpen: menu === "dice" ? !state.isDiceRollerOpen : false,
    })),

  closeAllMenus: () =>
    set({
      isAssetMenuOpen: false,
      isPlayerMenuOpen: false,
      isSettingsMenuOpen: false,
      isExtensionsMenuOpen: false,
      isDiceRollerOpen: false,
      isTokenEditorOpen: false,
    }),

  openTokenEditor: (tokenId) =>
    set({ isTokenEditorOpen: true, editingTokenId: tokenId }),

  closeTokenEditor: () =>
    set({ isTokenEditorOpen: false, editingTokenId: null }),
}));
