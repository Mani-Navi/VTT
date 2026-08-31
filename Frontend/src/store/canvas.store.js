import { create } from "zustand";
import { TOOLS, DRAW_MODES, FOG_ACTIONS, FOG_BRUSH_SHAPES } from "../constants/tools";

export const useCanvasStore = create((set, get) => ({
    activeTool: TOOLS.SELECT,
    activeDrawShape: DRAW_MODES.MARKER,
    drawStrokeColor: "#f59e0b",
    drawStrokeWidth: 4,
    drawFillColor: "rgba(245, 158, 11, 0.2)",
    isDrawGMLayer: false,

    // تنظیمات پیشرفته متن
    textFontFamily: "Vazirmatn",
    textFontSize: 24,
    textColor: "#f59e0b",
    textIsBold: false,
    textIsItalic: false,
    textHeading: "normal",
    textHasStroke: false,
    textStrokeColor: "#000000",
    textStrokeWidth: 2,
    pendingEmoji: null, // درج مستقیم ایموجی

    fogBrushShape: FOG_BRUSH_SHAPES.CIRCLE,
    fogAction: FOG_ACTIONS.REVEAL,
    fogBrushRadius: 75,

    zoom: 1.0,
    stageX: 0,
    stageY: 0,

    selectedTokenIds: [],
    selectedDrawingId: null,
    isTokenEditorOpen: false,
    editingTokenId: null,

    isAssetMenuOpen: false,
    isSettingsMenuOpen: false,
    isDiceRollerOpen: false,

    laserPosition: null,
    remoteLasers: {},

    // تنظیمات خط‌کش اندازه‌گیری
    rulerType: "dnd5e_5105",
    rulerUnit: "ft",
    measurement: null,
    remoteMeasurements: {},

    setActiveTool: (tool) => set({ activeTool: tool, selectedDrawingId: null, laserPosition: null }),
    toggleActiveTool: (tool) => set((state) => ({ activeTool: state.activeTool === tool ? TOOLS.SELECT : tool, selectedDrawingId: null, laserPosition: null })),
    setActiveDrawShape: (shape) => set({ activeDrawShape: shape, selectedDrawingId: null }),
    setDrawStrokeColor: (color) => set({ drawStrokeColor: color }),
    setDrawStrokeWidth: (width) => set({ drawStrokeWidth: width }),
    setDrawFillColor: (color) => set({ drawFillColor: color }),
    setIsDrawGMLayer: (isGM) => set({ isDrawGMLayer: isGM }),

    // متدهای تنظیمات متن
    setTextFontFamily: (fontFamily) => set({ textFontFamily }),
    setTextFontSize: (size) => set({ textFontSize: size }),
    setTextColor: (color) => set({ textColor: color }),
    setTextIsBold: (isBold) => set((state) => ({ textIsBold: typeof isBold === "function" ? isBold(state.textIsBold) : isBold })),
    setTextIsItalic: (isItalic) => set((state) => ({ textIsItalic: typeof isItalic === "function" ? isItalic(state.textIsItalic) : isItalic })),
    setTextHeading: (heading) => {
        set((state) => {
            const nextHeading = state.textHeading === heading ? "normal" : heading;
            let nextSize = 24;
            if (nextHeading === "h1") nextSize = 38;
            else if (nextHeading === "h2") nextSize = 28;
            return { textHeading: nextHeading, textFontSize: nextSize };
        });
    },
    setTextHasStroke: (hasStroke) => set((state) => ({ textHasStroke: typeof hasStroke === "function" ? hasStroke(state.textHasStroke) : hasStroke })),
    setTextStrokeColor: (color) => set({ textStrokeColor: color }),
    setTextStrokeWidth: (width) => set({ textStrokeWidth: width }),
    setPendingEmoji: (emoji) => set({ pendingEmoji: emoji }),

    setFogBrushShape: (shape) => set({ fogBrushShape: shape }),
    setFogAction: (action) => set({ fogAction: action }),
    setFogBrushRadius: (radius) => set({ fogBrushRadius: radius }),

    setRulerType: (type) => set({ rulerType: type }),
    setRulerUnit: (unit) => set({ rulerUnit: unit }),

    setZoom: (zoom) => set((state) => ({ zoom: typeof zoom === "function" ? zoom(state.zoom) : zoom })),
    setStagePos: (stageX, stageY) => set({ stageX, stageY }),

    resetView: () => set({ zoom: 1.0, stageX: 0, stageY: 0 }),

    fitToMap: (mapW = 2000, mapH = 1500, containerW = null, containerH = null) => {
        let screenW = containerW;
        let screenH = containerH;

        if (!screenW || screenW <= 300) {
            if (typeof document !== "undefined") {
                const container = document.getElementById("vtt-game-canvas-container");
                if (container && container.clientWidth > 300) {
                    screenW = container.clientWidth;
                    screenH = container.clientHeight;
                }
            }
        }
        if (!screenW || screenW <= 300) {
            screenW = typeof window !== "undefined" ? window.innerWidth : 1920;
            screenH = typeof window !== "undefined" ? window.innerHeight : 1080;
        }

        const safeW = (mapW && Number(mapW) > 50) ? Number(mapW) : 2000;
        const safeH = (mapH && Number(mapH) > 50) ? Number(mapH) : 1500;

        const paddingX = Math.min(screenW * 0.08, 90);
        const paddingY = Math.min(screenH * 0.10, 90);

        const availW = Math.max(screenW - paddingX * 2, 200);
        const availH = Math.max(screenH - paddingY * 2, 200);

        const scaleX = availW / safeW;
        const scaleY = availH / safeH;
        const optimalScale = Math.min(scaleX, scaleY);
        const clampedScale = Math.max(0.15, Math.min(optimalScale, 2.5));

        const stageX = (screenW - safeW * clampedScale) / 2;
        const stageY = (screenH - safeH * clampedScale) / 2;

        set({
            zoom: Number(clampedScale.toFixed(3)),
            stageX: Math.round(stageX),
            stageY: Math.round(stageY),
        });
    },

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
                    selectedDrawingId: null,
                };
            }
            return { selectedTokenIds: [tokenId], selectedDrawingId: null };
        });
    },

    setSelectedDrawingId: (id) => set({ selectedDrawingId: id, selectedTokenIds: [] }),
    clearSelection: () => set({ selectedTokenIds: [], selectedDrawingId: null }),

    openTokenEditor: (tokenId) => set({ isTokenEditorOpen: true, editingTokenId: tokenId }),
    closeTokenEditor: () => set({ isTokenEditorOpen: false, editingTokenId: null }),

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

    // خط‌کش لوکال
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

    // خط‌کش سایر بازیکنان
    updateRemoteMeasurement: (data) => {
        if (!data || !data.userId) return;
        const key = String(data.userId);
        set((state) => ({
            remoteMeasurements: {
                ...state.remoteMeasurements,
                [key]: {
                    ...data,
                    timestamp: Date.now(),
                },
            },
        }));
    },

    clearRemoteMeasurement: (userId) => {
        if (!userId) return;
        const key = String(userId);
        set((state) => {
            const next = { ...state.remoteMeasurements };
            delete next[key];
            return { remoteMeasurements: next };
        });
    },

    setLaserPosition: (pos) => set({ laserPosition: pos }),

    updateRemoteLaser: (laserData) => {
        if (!laserData) return;
        const key = String(laserData.userId || laserData.userName || "laser-user");
        set((state) => ({
            remoteLasers: {
                ...state.remoteLasers,
                [key]: {
                    ...laserData,
                    userId: key,
                    timestamp: Date.now(),
                },
            },
        }));
    },

    clearRemoteLaser: (userId) => {
        if (!userId) return;
        const key = String(userId);
        set((state) => {
            const next = { ...state.remoteLasers };
            delete next[key];
            return { remoteLasers: next };
        });
    },
}));