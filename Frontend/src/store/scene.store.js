import { create } from "zustand";
import { sceneApi } from "../api/scene.api";
import { tokenApi } from "../api/token.api";
import { settingsApi } from "../api/settings.api";
import { wsService } from "../services/websocket.service";
import { useCanvasStore } from "./canvas.store";
import { snapToGrid } from "../utils/grid";

const matchDrawingId = (a, b) => {
    if (!a || !b) return false;
    const idA = String(a.clientDrawingId || a.id || a.drawingId || "").trim();
    const idB = String(b.clientDrawingId || b.id || b.drawingId || "").trim();
    if (idA && idB && idA === idB) return true;
    if (a.id && b.id && String(a.id) === String(b.id)) return true;
    if (a.clientDrawingId && b.clientDrawingId && String(a.clientDrawingId) === String(b.clientDrawingId)) return true;
    return false;
};

const matchFogId = (a, b) => {
    if (!a || !b) return false;
    const idA = String(a.id || a.fogId || (typeof a.points === "object" ? a.points?.id : "") || "").trim().toLowerCase();
    const idB = String(b.id || b.fogId || (typeof b.points === "object" ? b.points?.id : "") || "").trim().toLowerCase();
    return Boolean(idA && idB && idA === idB);
};

const normalizeFogRegion = (fog) => {
    if (!fog) return null;

    let shapeObj = fog;
    if (fog.points && typeof fog.points === "object" && !Array.isArray(fog.points)) {
        shapeObj = {
            ...fog.points,
            id: fog.id || fog.points.id,
            isCover: fog.type === "HIDE" || fog.points.isCover,
        };
    }

    const isCover =
        shapeObj.isCover !== undefined
            ? Boolean(shapeObj.isCover)
            : String(fog.type).toUpperCase() === "HIDE";

    return {
        ...shapeObj,
        id: String(fog.id || shapeObj.id || `fog-${Date.now()}`),
        isCover: isCover,
        type: shapeObj.type || (shapeObj.radius ? "circle" : "rect"),
    };
};

export const useSceneStore = create((set, get) => ({
    currentScene: null,
    scenes: [],
    pings: [],
    remoteLiveDrawing: null,
    remoteLiveFog: null,
    isLoading: false,
    availableConditions: [],

    setAvailableConditions: (conditions) => {
        set({ availableConditions: Array.isArray(conditions) ? conditions : [] });
    },

    addSceneFromSocket: (newScene) => {
        if (!newScene || !newScene.id) return;
        const targetId = String(newScene.id).toLowerCase();

        set((state) => {
            const exists = state.scenes.some((s) => String(s.id).toLowerCase() === targetId);
            if (exists) {
                return {
                    scenes: state.scenes.map((s) =>
                        String(s.id).toLowerCase() === targetId ? { ...s, ...newScene } : s
                    ),
                };
            }
            return {
                scenes: [...state.scenes, newScene],
            };
        });
    },

    setRemoteLiveDrawing: (drawData) => {
        set({ remoteLiveDrawing: drawData });
    },

    setRemoteLiveFog: (fogData) => {
        set({ remoteLiveFog: fogData });
    },

    addAvailableCondition: (conditionId, shouldBroadcast = true) => {
        const state = get();
        if (state.availableConditions.includes(conditionId)) return;
        const nextList = [...state.availableConditions, conditionId];
        set({ availableConditions: nextList });

        if (shouldBroadcast) {
            wsService.send("CONDITION_POOL_UPDATE", { availableConditions: nextList });
        }
    },

    removeAvailableCondition: (conditionId, shouldBroadcast = true) => {
        const state = get();
        const nextAvailable = state.availableConditions.filter((c) => c !== conditionId);
        const updatedTokens = (state.currentScene?.tokens || []).map((t) => ({
            ...t,
            conditions: (t.conditions || []).filter((c) => c !== conditionId),
        }));

        set({
            availableConditions: nextAvailable,
            currentScene: state.currentScene ? { ...state.currentScene, tokens: updatedTokens } : null,
        });

        if (shouldBroadcast) {
            wsService.send("CONDITION_POOL_UPDATE", { availableConditions: nextAvailable });
        }
    },

    loadScenes: async (roomId) => {
        if (!roomId) return;
        set({ isLoading: true });
        try {
            let [scenes, roomSettings] = await Promise.all([
                sceneApi.getScenes(roomId),
                settingsApi.getSettings(roomId).catch(() => null),
            ]);

            if (!scenes || scenes.length === 0) {
                const defaultScene = await sceneApi.createScene({
                    roomId: roomId,
                    name: "صحنه خوش‌آمدگویی",
                    isActive: true,
                });
                scenes = [defaultScene];
            }

            const active = scenes.find((s) => s.isActive) || scenes[0];
            const fullState = await sceneApi.getSceneState(active.id);
            const sceneData = fullState.scene || active;

            const finalMapUrl = sceneData.mapUrl || sceneData.assetUrl || "";
            const rawTokens = fullState.tokens || [];
            const loadedTokens = [];
            const seenTokenIds = new Set();

            for (const t of rawTokens) {
                const tId = String(t.id).toLowerCase();
                if (!seenTokenIds.has(tId)) {
                    seenTokenIds.add(tId);
                    loadedTokens.push({
                        ...t,
                        id: String(t.id),
                        avatarUrl: t.avatarUrl || t.assetUrl || "",
                        assetUrl: t.avatarUrl || t.assetUrl || "",
                        name: t.label || t.name || "",
                        label: t.label || t.name || "",
                        controlledBy: t.controlledBy ? String(t.controlledBy) : null,
                        showHp: t.showHp !== undefined ? Boolean(t.showHp) : true,
                        showConditions: t.showConditions !== undefined ? Boolean(t.showConditions) : true,
                        showAc: t.showAc !== undefined ? Boolean(t.showAc) : true,
                        allowPlayerHp: t.allowPlayerHp !== undefined ? Boolean(t.allowPlayerHp) : true,
                        allowPlayerConditions: t.allowPlayerConditions !== undefined ? Boolean(t.allowPlayerConditions) : true,
                        allowPlayerAc: t.allowPlayerAc !== undefined ? Boolean(t.allowPlayerAc) : true,
                        allowPlayerSize: t.allowPlayerSize !== undefined ? Boolean(t.allowPlayerSize) : true,
                    });
                }
            }

            const rawFogRegions = fullState.fogRegions || sceneData.fogShapes || [];
            const normalizedFog = rawFogRegions.map(normalizeFogRegion).filter(Boolean);
            const isRevealedSaved = Boolean(sceneData.isFogRevealed || fullState.isFogRevealed);

            useCanvasStore.getState().setFogGlobalReveal(isRevealedSaved);

            if (roomSettings?.measurementType) {
                useCanvasStore.getState().setRulerType(roomSettings.measurementType);
            }

            const sceneWithState = {
                ...sceneData,
                id: String(sceneData.id || active.id),
                assetUrl: finalMapUrl,
                mapUrl: finalMapUrl,
                mapWidth: sceneData.mapWidth || 2000,
                mapHeight: sceneData.mapHeight || 1500,
                tokens: loadedTokens,
                drawings: fullState.drawings || [],
                fogShapes: normalizedFog,
                fogEnabled: normalizedFog.length > 0 || Boolean(sceneData.fogFilled),
                fogFilled: Boolean(sceneData.fogFilled),
                isFogRevealed: isRevealedSaved,
                grid: {
                    enabled: true,
                    type: roomSettings?.gridType || sceneData.gridType || "square",
                    size: Number(roomSettings?.gridSize || sceneData.gridSize || 60),
                    color: roomSettings?.gridColor || sceneData.gridColor || "#000000",
                    opacity: roomSettings?.gridOpacity !== undefined ? Number(roomSettings.gridOpacity) : 0.35,
                    lineWidth: roomSettings?.lineWidth !== undefined ? Number(roomSettings.lineWidth) : 1.5,
                    lineType: roomSettings?.lineType || "solid",
                    snapToGrid: roomSettings?.isGridSnapping !== undefined ? Boolean(roomSettings.isGridSnapping) : true,
                },
            };

            const persistentConditions = sceneData.availableConditions || fullState.availableConditions || [];

            set({
                scenes: scenes,
                currentScene: sceneWithState,
                availableConditions: Array.isArray(persistentConditions) ? persistentConditions : [],
                isLoading: false,
            });
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error("خطا در دریافت صحنه‌های اتاق:", err);
            }
            set({ isLoading: false });
        }
    },

    syncTokenFromSocket: (socketData) => {
        set((state) => {
            if (!state.currentScene || !state.currentScene.tokens) return state;

            const rawId = socketData.tokenId || socketData.id;
            if (!rawId) return state;

            const strId = String(rawId).toLowerCase();

            if (
                strId.startsWith("draw-") ||
                strId.startsWith("fog-") ||
                strId.startsWith("ping-") ||
                strId.startsWith("text-") ||
                socketData.points !== undefined ||
                socketData.stroke !== undefined ||
                socketData.isCover !== undefined
            ) {
                return state;
            }

            const currentTokens = state.currentScene.tokens;

            if (socketData.isDeleted) {
                return {
                    currentScene: {
                        ...state.currentScene,
                        tokens: currentTokens.filter((t) => String(t.id).toLowerCase() !== strId),
                    },
                };
            }

            const existsIndex = currentTokens.findIndex(
                (t) => String(t.id).toLowerCase() === strId
            );

            const cleanSocketData = {};
            Object.keys(socketData).forEach((key) => {
                if (socketData[key] !== null && socketData[key] !== undefined) {
                    cleanSocketData[key] = socketData[key];
                }
            });

            const incomingAvatar = cleanSocketData.avatarUrl || cleanSocketData.assetUrl;
            const incomingName = cleanSocketData.label || cleanSocketData.name;

            let updatedTokens;
            if (existsIndex !== -1) {
                const oldToken = currentTokens[existsIndex];
                updatedTokens = currentTokens.map((t, idx) =>
                    idx === existsIndex
                        ? {
                            ...oldToken,
                            ...cleanSocketData,
                            id: String(oldToken.id),
                            name: incomingName || oldToken.name || oldToken.label,
                            label: incomingName || oldToken.label || oldToken.name,
                            x: cleanSocketData.x !== undefined ? Number(cleanSocketData.x) : oldToken.x,
                            y: cleanSocketData.y !== undefined ? Number(cleanSocketData.y) : oldToken.y,
                            avatarUrl: incomingAvatar || oldToken.avatarUrl,
                            assetUrl: incomingAvatar || oldToken.assetUrl,
                            showHp: cleanSocketData.showHp !== undefined ? Boolean(cleanSocketData.showHp) : oldToken.showHp,
                            showConditions: cleanSocketData.showConditions !== undefined ? Boolean(cleanSocketData.showConditions) : oldToken.showConditions,
                            showAc: cleanSocketData.showAc !== undefined ? Boolean(cleanSocketData.showAc) : oldToken.showAc,
                            allowPlayerHp: cleanSocketData.allowPlayerHp !== undefined ? Boolean(cleanSocketData.allowPlayerHp) : oldToken.allowPlayerHp,
                            allowPlayerConditions: cleanSocketData.allowPlayerConditions !== undefined ? Boolean(cleanSocketData.allowPlayerConditions) : oldToken.allowPlayerConditions,
                            allowPlayerAc: cleanSocketData.allowPlayerAc !== undefined ? Boolean(cleanSocketData.allowPlayerAc) : oldToken.allowPlayerAc,
                            allowPlayerSize: cleanSocketData.allowPlayerSize !== undefined ? Boolean(cleanSocketData.allowPlayerSize) : oldToken.allowPlayerSize,
                        }
                        : t
                );
            } else {
                if (!cleanSocketData.x && !cleanSocketData.y && !incomingName) {
                    return state;
                }

                const newToken = {
                    ...cleanSocketData,
                    id: String(rawId),
                    name: incomingName || "توکن",
                    label: incomingName || "توکن",
                    avatarUrl: incomingAvatar || "",
                    assetUrl: incomingAvatar || "",
                    x: Number(cleanSocketData.x || 0),
                    y: Number(cleanSocketData.y || 0),
                    controlledBy: cleanSocketData.controlledBy ? String(cleanSocketData.controlledBy) : null,
                    showHp: cleanSocketData.showHp !== undefined ? Boolean(cleanSocketData.showHp) : true,
                    showConditions: cleanSocketData.showConditions !== undefined ? Boolean(cleanSocketData.showConditions) : true,
                    showAc: cleanSocketData.showAc !== undefined ? Boolean(cleanSocketData.showAc) : true,
                    allowPlayerHp: cleanSocketData.allowPlayerHp !== undefined ? Boolean(cleanSocketData.allowPlayerHp) : true,
                    allowPlayerConditions: cleanSocketData.allowPlayerConditions !== undefined ? Boolean(cleanSocketData.allowPlayerConditions) : true,
                    allowPlayerAc: cleanSocketData.allowPlayerAc !== undefined ? Boolean(cleanSocketData.allowPlayerAc) : true,
                    allowPlayerSize: cleanSocketData.allowPlayerSize !== undefined ? Boolean(cleanSocketData.allowPlayerSize) : true,
                };
                updatedTokens = [...currentTokens, newToken];
            }

            return {
                currentScene: {
                    ...state.currentScene,
                    tokens: updatedTokens,
                },
            };
        });
    },

    setMapForCurrentScene: async (mapUrl, assetId = null) => {
        const state = get();
        let current = state.currentScene;
        if (!current) return;

        const updatedScene = {
            ...current,
            mapUrl: mapUrl,
            assetUrl: mapUrl,
        };

        // ۱. تغییر آنی نقشه روی صفحه در ۱ میلی‌ثانیه
        set({
            currentScene: updatedScene,
            scenes: state.scenes.map((s) => (s.id === current.id ? { ...s, mapUrl, assetUrl: mapUrl } : s)),
        });

        // ۲. ارسال در لحظه به تمام بازیکنان
        wsService.send("SCENE_UPDATED", { sceneId: current.id, mapUrl, assetId });

        // ۳. ذخیره در دیتابیس در پس‌زمینه
        try {
            await sceneApi.updateSceneMap(current.id, { mapUrl, assetId });
        } catch (err) {
            if (import.meta.env.DEV) console.error("خطا در ذخیره نقشه در سرور:", err);
        }
    },

    renameScene: async (sceneId, newName) => {
        if (!sceneId || !newName?.trim()) return;
        const trimmed = newName.trim();
        const targetId = String(sceneId).toLowerCase();

        set((state) => ({
            scenes: state.scenes.map((s) => (String(s.id).toLowerCase() === targetId ? { ...s, name: trimmed } : s)),
            currentScene:
                String(state.currentScene?.id || "").toLowerCase() === targetId
                    ? { ...state.currentScene, name: trimmed }
                    : state.currentScene,
        }));

        try {
            await sceneApi.renameScene(sceneId, trimmed);
            wsService.send("SCENE_RENAME", { sceneId, name: trimmed });
        } catch (err) {
            if (import.meta.env.DEV) console.error("خطا در تغییر نام صحنه:", err);
        }
    },

    addToken: async (tokenData) => {
        const state = get();
        if (!state.currentScene) return;

        const mapW = state.currentScene.mapWidth || 2000;
        const mapH = state.currentScene.mapHeight || 1500;
        const defaultCenterX = mapW / 2;
        const defaultCenterY = mapH / 2;

        const rawX = tokenData.x !== undefined ? tokenData.x : defaultCenterX;
        const rawY = tokenData.y !== undefined ? tokenData.y : defaultCenterY;

        const grid = state.currentScene.grid || {};
        const gridSize = grid.size || 60;
        const gridType = grid.type || "square";
        const snapEnabled = grid.snapToGrid !== false;

        const centerPos = snapToGrid(rawX, rawY, gridSize, gridType, tokenData.size || 1, snapEnabled);
        const tokenName = tokenData.name || tokenData.label || "توکن";

        const isValidUUID = (uuid) => {
            if (!uuid || typeof uuid !== "string") return false;
            return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid.trim());
        };
        const validAssetId = isValidUUID(tokenData.assetId) ? tokenData.assetId : null;

        try {
            const savedToken = await tokenApi.createToken({
                sceneId: state.currentScene.id,
                assetId: validAssetId,
                label: tokenName,
                avatarUrl: tokenData.avatarUrl || tokenData.assetUrl || "",
                x: centerPos.x,
                y: centerPos.y,
                size: tokenData.size || (tokenData.isProp ? 0.5 : 1),
                hp: tokenData.hp || 20,
                maxHp: tokenData.maxHp || 20,
                ac: tokenData.ac || 12,
                controlledBy: tokenData.controlledBy ? String(tokenData.controlledBy) : null,
                isProp: Boolean(tokenData.isProp),
            });

            const fullToken = {
                ...tokenData,
                ...savedToken,
                id: String(savedToken.id),
                name: savedToken.label || tokenName,
                label: savedToken.label || tokenName,
                avatarUrl: savedToken.avatarUrl || savedToken.assetUrl || tokenData.avatarUrl,
                assetUrl: savedToken.avatarUrl || savedToken.assetUrl || tokenData.avatarUrl,
                x: centerPos.x,
                y: centerPos.y,
            };

            const updatedTokens = [...(state.currentScene.tokens || []), fullToken];
            set({ currentScene: { ...state.currentScene, tokens: updatedTokens } });

            wsService.send("TOKEN_MOVE", {
                tokenId: String(savedToken.id),
                ...fullToken,
            });
        } catch (err) {
            if (import.meta.env.DEV) console.error("خطا در ثبت پایدار توکن:", err);
        }
    },

    updateToken: (tokenId, updates) => {
        set((state) => {
            if (!state.currentScene || !state.currentScene.tokens) return state;
            const targetId = String(tokenId).toLowerCase();

            const updatedTokens = state.currentScene.tokens.map((t) =>
                String(t.id).toLowerCase() === targetId ? { ...t, ...updates } : t
            );
            return { currentScene: { ...state.currentScene, tokens: updatedTokens } };
        });
    },

    moveToken: (tokenId, x, y) => {
        set((state) => {
            if (!state.currentScene || !state.currentScene.tokens) return state;
            const targetId = String(tokenId).toLowerCase();

            const updatedTokens = state.currentScene.tokens.map((t) =>
                String(t.id).toLowerCase() === targetId ? { ...t, x: Number(x), y: Number(y) } : t
            );

            return { currentScene: { ...state.currentScene, tokens: updatedTokens } };
        });
    },

    removeToken: (tokenId) => {
        set((state) => {
            if (!state.currentScene || !state.currentScene.tokens) return state;
            const targetId = String(tokenId).toLowerCase();
            return {
                currentScene: {
                    ...state.currentScene,
                    tokens: state.currentScene.tokens.filter(
                        (t) => String(t.id).toLowerCase() !== targetId
                    ),
                },
            };
        });
    },

    addDrawing: (drawing) => {
        set((state) => {
            if (!state.currentScene) return state;
            const existing = state.currentScene.drawings || [];
            const existsIndex = existing.findIndex((d) => matchDrawingId(d, drawing));

            let nextDrawings;
            if (existsIndex !== -1) {
                nextDrawings = existing.map((d, i) => (i === existsIndex ? { ...d, ...drawing } : d));
            } else {
                nextDrawings = [...existing, drawing];
            }

            return {
                currentScene: {
                    ...state.currentScene,
                    drawings: nextDrawings,
                },
                remoteLiveDrawing: null,
            };
        });
    },

    updateDrawing: (drawingId, updates) => {
        set((state) => {
            if (!state.currentScene || !state.currentScene.drawings) return state;
            const dummy = { id: drawingId, clientDrawingId: drawingId, drawingId };
            const nextDrawings = state.currentScene.drawings.map((d) =>
                matchDrawingId(d, dummy) ? { ...d, ...updates } : d
            );
            return {
                currentScene: {
                    ...state.currentScene,
                    drawings: nextDrawings,
                },
            };
        });
    },

    removeDrawing: (drawingId) => {
        set((state) => {
            if (!state.currentScene || !state.currentScene.drawings) return state;
            const dummy = { id: drawingId, clientDrawingId: drawingId, drawingId };
            return {
                currentScene: {
                    ...state.currentScene,
                    drawings: state.currentScene.drawings.filter((d) => !matchDrawingId(d, dummy)),
                },
            };
        });
    },

    clearDrawings: () => {
        set((state) => {
            if (!state.currentScene) return state;
            return { currentScene: { ...state.currentScene, drawings: [] } };
        });
    },

    addFogShape: (shapeData) => {
        const normalized = normalizeFogRegion(shapeData);
        if (!normalized) return;

        set((state) => {
            if (!state.currentScene) return state;
            const existing = state.currentScene.fogShapes || [];
            const existsIndex = existing.findIndex((f) => matchFogId(f, normalized));

            let nextFog;
            if (existsIndex !== -1) {
                nextFog = existing.map((f, i) => (i === existsIndex ? { ...f, ...normalized } : f));
            } else {
                nextFog = [...existing, normalized];
            }

            return {
                currentScene: {
                    ...state.currentScene,
                    fogShapes: nextFog,
                    fogEnabled: true,
                },
                remoteLiveFog: null,
            };
        });
    },

    updateFogShape: (fogId, updates) => {
        set((state) => {
            if (!state.currentScene || !state.currentScene.fogShapes) return state;
            const targetId = String(fogId).trim().toLowerCase();
            const nextFog = state.currentScene.fogShapes.map((f) =>
                String(f.id).trim().toLowerCase() === targetId ? { ...f, ...updates } : f
            );
            return {
                currentScene: {
                    ...state.currentScene,
                    fogShapes: nextFog,
                },
            };
        });
    },

    clearFog: () => {
        set((state) => {
            if (!state.currentScene) return state;
            return {
                currentScene: {
                    ...state.currentScene,
                    fogShapes: [],
                    fogEnabled: false,
                    fogFilled: false,
                },
                remoteLiveFog: null,
            };
        });
    },

    addPing: (pingData) => {
        const newPing = {
            ...pingData,
            id: `ping-${Date.now()}`,
            timestamp: Date.now(),
        };
        set((state) => ({ pings: [...state.pings, newPing] }));
        setTimeout(() => {
            set((state) => ({ pings: state.pings.filter((p) => p.id !== newPing.id) }));
        }, 4000);
    },

    switchScene: async (sceneId, shouldBroadcast = true) => {
        if (!sceneId) return;
        const strTargetId = String(sceneId).toLowerCase();
        const state = get();

        // ۱. تغییر آنی وضعیت تب انتخاب شده و currentScene.id در کمتر از ۱ میلی‌ثانیه
        set({
            scenes: state.scenes.map((s) => ({
                ...s,
                isActive: String(s.id).toLowerCase() === strTargetId,
            })),
            currentScene: state.currentScene
                ? { ...state.currentScene, id: String(sceneId) }
                : { id: String(sceneId) },
        });

        // ۲. شلیک مستقیم به وب‌سوکت برای سوییچ سایر کلاینت‌ها
        if (shouldBroadcast) {
            wsService.send("SCENE_ACTIVATED", { sceneId: String(sceneId) });
            sceneApi.activateScene(sceneId).catch(() => {});
        }

        // ۳. لود کامل محتویات صحنه جدید
        try {
            const fullState = await sceneApi.getSceneState(sceneId);
            const sceneData = fullState.scene || {};
            const finalMapUrl = sceneData.mapUrl || sceneData.assetUrl || "";

            const loadedTokens = (fullState.tokens || []).map((t) => ({
                ...t,
                id: String(t.id),
                avatarUrl: t.avatarUrl || t.assetUrl || "",
                assetUrl: t.avatarUrl || t.assetUrl || "",
                name: t.label || t.name || "",
                label: t.label || t.name || "",
                controlledBy: t.controlledBy ? String(t.controlledBy) : null,
                showHp: t.showHp !== undefined ? Boolean(t.showHp) : true,
                showConditions: t.showConditions !== undefined ? Boolean(t.showConditions) : true,
                showAc: t.showAc !== undefined ? Boolean(t.showAc) : true,
                allowPlayerHp: t.allowPlayerHp !== undefined ? Boolean(t.allowPlayerHp) : true,
                allowPlayerConditions: t.allowPlayerConditions !== undefined ? Boolean(t.allowPlayerConditions) : true,
                allowPlayerAc: t.allowPlayerAc !== undefined ? Boolean(t.allowPlayerAc) : true,
                allowPlayerSize: t.allowPlayerSize !== undefined ? Boolean(t.allowPlayerSize) : true,
            }));

            const rawFogRegions = fullState.fogRegions || sceneData.fogShapes || [];
            const normalizedFog = rawFogRegions.map(normalizeFogRegion).filter(Boolean);
            const isRevealedSaved = Boolean(sceneData.isFogRevealed || fullState.isFogRevealed);

            useCanvasStore.getState().setFogGlobalReveal(isRevealedSaved);

            const persistentConditions = sceneData.availableConditions || fullState.availableConditions || [];

            const sceneWithState = {
                ...sceneData,
                id: String(sceneData.id || sceneId),
                assetUrl: finalMapUrl,
                mapUrl: finalMapUrl,
                mapWidth: sceneData.mapWidth || 2000,
                mapHeight: sceneData.mapHeight || 1500,
                tokens: loadedTokens,
                drawings: fullState.drawings || [],
                fogShapes: normalizedFog,
                fogEnabled: normalizedFog.length > 0 || Boolean(sceneData.fogFilled),
                fogFilled: Boolean(sceneData.fogFilled),
                isFogRevealed: isRevealedSaved,
                grid: {
                    enabled: true,
                    type: sceneData.gridType || "square",
                    size: sceneData.gridSize || 60,
                    color: sceneData.gridColor || "#000000",
                    opacity: 0.35,
                    snapToGrid: true,
                },
            };

            set({
                currentScene: sceneWithState,
                availableConditions: Array.isArray(persistentConditions) ? persistentConditions : [],
            });
        } catch (err) {
            if (import.meta.env.DEV) console.error("خطا در تغییر صحنه:", err);
        }
    },
}));