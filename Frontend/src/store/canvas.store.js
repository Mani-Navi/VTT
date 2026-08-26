import { create } from "zustand";
import {
    TOOLS,
    DRAW_SHAPES,
    FOG_MODES,
    FOG_BRUSH_SHAPES,
    FOG_ACTIONS,
} from "../constants/tools.js";
import { MEASUREMENT_TYPES, MEASUREMENT_UNITS } from "../constants/measurementTypes.js";

export const useCanvasStore = create((set) => ({
    // ابزارهای فعال
    activeTool: TOOLS.SELECT || "SELECT",
    activeDrawShape: DRAW_SHAPES.FREEHAND || "FREEHAND",
    activeFogMode: FOG_MODES.REVEAL_RECT || "REVEAL_RECT",

    // موقعیت بوم و بزرگ‌نمایی (Viewport & Zoom)
    zoom: 1,
    stageX: 0,
    stageY: 0,
    stageWidth: typeof window !== "undefined" ? window.innerWidth : 1920,
    stageHeight: typeof window !== "undefined" ? window.innerHeight : 1080,

    // توکن‌های انتخاب‌شده
    selectedTokenIds: [],

    // تنظیمات نقاشی و قلم
    drawStrokeColor: "#f59e0b",
    drawStrokeWidth: 4,
    drawFillColor: "transparent",
    isDrawGMLayer: false,

    // تنظیمات براش مه جنگ
    fogBrushRadius: 70,
    fogBrushShape: FOG_BRUSH_SHAPES.CIRCLE || "CIRCLE",
    fogAction: FOG_ACTIONS.REVEAL || "REVEAL",

    // تاس سه‌بعدی
    is3DDiceEnabled: true,
    active3DRoll: null,

    // ابزار خط‌کش و اندازه‌گیری
    rulerType: MEASUREMENT_TYPES.EUCLIDEAN || "EUCLIDEAN",
    rulerUnit: MEASUREMENT_UNITS.FEET || "FEET",
    isMeasuring: false,
    measureStart: null,
    measureCurrent: null,
    measureWaypoints: [],

    // پوینتر لیزری
    isLaserActive: false,
    laserPosition: null,

    // وضعیت پنل‌های شناور (Extensions حذف شد)
    isAssetMenuOpen: false,
    isPlayerMenuOpen: false,
    isSettingsMenuOpen: false,
    isDiceRollerOpen: false,
    isTokenEditorOpen: false,
    editingTokenId: null,

    // اکشن‌ها
    setActiveTool: (tool) =>
        set({
            activeTool: tool,
            isMeasuring: false,
            measureStart: null,
            measureCurrent: null,
            measureWaypoints: [],
            isLaserActive: tool === (TOOLS.LASER || "LASER"),
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
            isDiceRollerOpen: menu === "dice" ? !state.isDiceRollerOpen : false,
        })),

    closeAllMenus: () =>
        set({
            isAssetMenuOpen: false,
            isPlayerMenuOpen: false,
            isSettingsMenuOpen: false,
            isDiceRollerOpen: false,
            isTokenEditorOpen: false,
        }),

    openTokenEditor: (tokenId) =>
        set({ isTokenEditorOpen: true, editingTokenId: tokenId }),
    closeTokenEditor: () =>
        set({ isTokenEditorOpen: false, editingTokenId: null }),
}));