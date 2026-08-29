import { create } from "zustand";
import { TOOLS, DRAW_MODES, FOG_ACTIONS, FOG_BRUSH_SHAPES } from "../constants/tools";

export const useCanvasStore = create((set) => ({
    // ابزار پیش‌فرض انتخاب و حرکت توکن
    activeTool: TOOLS.SELECT,
    activeDrawShape: DRAW_MODES.MARKER,
    drawStrokeColor: "#f59e0b",
    drawStrokeWidth: 4,
    drawFillColor: "rgba(245, 158, 11, 0.2)",
    isDrawGMLayer: false,

    fogBrushShape: FOG_BRUSH_SHAPES.CIRCLE,
    fogAction: FOG_ACTIONS.REVEAL,
    fogBrushRadius: 75,

    zoom: 1.0,
    stageX: 0,
    stageY: 0,

    selectedTokenIds: [],
    isTokenEditorOpen: false,
    editingTokenId: null,

    isAssetMenuOpen: false,
    isSettingsMenuOpen: false,
    isDiceRollerOpen: false,

    setActiveTool: (tool) => set({ activeTool: tool }),
    setActiveDrawShape: (shape) => set({ activeDrawShape: shape }),
    setDrawStrokeColor: (color) => set({ drawStrokeColor: color }),
    setDrawStrokeWidth: (width) => set({ drawStrokeWidth: width }),
    setDrawFillColor: (color) => set({ drawFillColor: color }),
    setIsDrawGMLayer: (isGM) => set({ isDrawGMLayer: isGM }),

    setFogBrushShape: (shape) => set({ fogBrushShape: shape }),
    setFogAction: (action) => set({ fogAction: action }),
    setFogBrushRadius: (radius) => set({ fogBrushRadius: radius }),

    setZoom: (zoom) => set((state) => ({ zoom: typeof zoom === "function" ? zoom(state.zoom) : zoom })),
    setStagePos: (stageX, stageY) => set({ stageX, stageY }),

    resetView: () => set({ zoom: 1.0, stageX: 0, stageY: 0 }),

    // تمرکز دوربین روی یک نقطه مشخص
    focusOnCoordinates: (targetX, targetY) => {
        const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1920;
        const windowHeight = typeof window !== "undefined" ? window.innerHeight : 1080;
        set((state) => ({
            stageX: windowWidth / 2 - targetX * state.zoom,
            stageY: windowHeight / 2 - targetY * state.zoom,
        }));
    },

    toggleTokenSelection: (tokenId, isMulti = false) => {
        set((state) => {
            if (isMulti) {
                return {
                    selectedTokenIds: state.selectedTokenIds.includes(tokenId)
                        ? state.selectedTokenIds.filter((id) => id !== tokenId)
                        : [...state.selectedTokenIds, tokenId],
                };
            }
            return { selectedTokenIds: [tokenId] };
        });
    },

    clearSelection: () => set({ selectedTokenIds: [] }),

    openTokenEditor: (tokenId) => {
        set({ isTokenEditorOpen: true, editingTokenId: tokenId });
    },

    closeTokenEditor: () => {
        set({ isTokenEditorOpen: false, editingTokenId: null });
    },

    toggleMenu: (menuName) => {
        set((state) => {
            if (menuName === "asset") {
                return { isAssetMenuOpen: !state.isAssetMenuOpen, isSettingsMenuOpen: false, isDiceRollerOpen: false };
            }
            if (menuName === "settings") {
                return { isSettingsMenuOpen: !state.isSettingsMenuOpen, isAssetMenuOpen: false, isDiceRollerOpen: false };
            }
            if (menuName === "dice") {
                return { isDiceRollerOpen: !state.isDiceRollerOpen, isAssetMenuOpen: false, isSettingsMenuOpen: false };
            }
            return {};
        });
    },

    // خط‌کش اندازه‌گیری و نشانگر لیزری
    measurement: null,
    laserPosition: null,

    startMeasurement: (x, y) => {
        set({
            measurement: {
                startX: x,
                startY: y,
                currentX: x,
                currentY: y,
                waypoints: [],
            },
        });
    },

    updateMeasurement: (x, y) => {
        set((state) => {
            if (!state.measurement) return state;
            return {
                measurement: {
                    ...state.measurement,
                    currentX: x,
                    currentY: y,
                },
            };
        });
    },

    addMeasurementWaypoint: (x, y) => {
        set((state) => {
            if (!state.measurement) return state;
            return {
                measurement: {
                    ...state.measurement,
                    waypoints: [...state.measurement.waypoints, { x, y }],
                },
            };
        });
    },

    endMeasurement: () => set({ measurement: null }),
    setLaserPosition: (pos) => set({ laserPosition: pos }),
}));