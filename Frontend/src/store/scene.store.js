import { create } from "zustand";
import { sceneApi } from "../api/scene.api";
import { tokenApi } from "../api/token.api";
import { snapToGrid } from "../utils/grid.js";
import { wsService } from "../services/websocket.service";

export const useSceneStore = create((set, get) => ({
  currentScene: null,
  scenes: [],
  pings: [],
  isLoading: false,

  availableConditions: ["blinded", "poisoned", "stunned", "invisible", "prone"],

  // ۱. بارگذاری پایدار و کامل صحنه و توکن‌ها از دیتابیس
  loadScenes: async (roomId) => {
    if (!roomId) return;
    set({ isLoading: true });
    try {
      let scenes = await sceneApi.getScenes(roomId);

      if (!scenes || scenes.length === 0) {
        const defaultScene = await sceneApi.createScene({
          roomId: roomId,
          name: "صحنه اصلی",
          isActive: true,
        });
        scenes = [defaultScene];
      }

      const active = scenes.find((s) => s.isActive) || scenes[0];
      const fullState = await sceneApi.getSceneState(active.id);
      const sceneData = fullState.scene || active;

      const finalMapUrl = sceneData.mapUrl || sceneData.assetUrl || "";

      // همسان‌سازی دقیق توکن‌ها تا پس از ریلود آواتار و مشخصات حفظ شوند
      const loadedTokens = (fullState.tokens || []).map((t) => ({
        ...t,
        id: String(t.id),
        avatarUrl: t.avatarUrl || t.assetUrl || "",
        assetUrl: t.avatarUrl || t.assetUrl || "",
        name: t.label || t.name || "توکن",
        label: t.label || t.name || "توکن",
        controlledBy: t.controlledBy ? String(t.controlledBy) : null,
      }));

      const sceneWithState = {
        ...sceneData,
        assetUrl: finalMapUrl,
        mapUrl: finalMapUrl,
        mapWidth: sceneData.mapWidth || 2000,
        mapHeight: sceneData.mapHeight || 1500,
        tokens: loadedTokens,
        drawings: fullState.drawings || [],
        fogShapes: fullState.fogRegions || [],
        fogEnabled: false,
        fogFilled: false,
        grid: {
          enabled: true,
          type: "square",
          size: sceneData.gridSize || 60,
          color: sceneData.gridColor || "#000000",
          opacity: 0.35,
          snapToGrid: true,
        },
      };

      set({
        scenes: scenes,
        currentScene: sceneWithState,
        isLoading: false,
      });
    } catch (err) {
      console.error("خطا در دریافت صحنه‌های اتاق:", err);
      set({ isLoading: false });
    }
  },

  // ۲. دریافت و همگام‌سازی بلادرنگ رویدادهای وب‌سوکت برای تمام کلاینت‌ها
  syncTokenFromSocket: (socketData) => {
    set((state) => {
      if (!state.currentScene) return state;
      const currentTokens = state.currentScene.tokens || [];
      const sTokenId = String(socketData.tokenId || socketData.id);

      // رویداد حذف توکن
      if (socketData.isDeleted) {
        return {
          currentScene: {
            ...state.currentScene,
            tokens: currentTokens.filter((t) => String(t.id) !== sTokenId),
          },
        };
      }

      const existsIndex = currentTokens.findIndex((t) => String(t.id) === sTokenId);
      let updatedTokens;

      const incomingAvatar = socketData.avatarUrl || socketData.assetUrl;

      if (existsIndex !== -1) {
        updatedTokens = currentTokens.map((t, idx) =>
            idx === existsIndex
                ? {
                  ...t,
                  ...socketData,
                  id: sTokenId,
                  avatarUrl: incomingAvatar || t.avatarUrl,
                  assetUrl: incomingAvatar || t.assetUrl,
                  x: socketData.x !== undefined ? socketData.x : t.x,
                  y: socketData.y !== undefined ? socketData.y : t.y,
                }
                : t
        );
      } else {
        // افزودن توکن جدید ساخته‌شده توسط پلیر/GM دیگر
        const newToken = {
          ...socketData,
          id: sTokenId,
          name: socketData.name || socketData.label || "توکن",
          label: socketData.label || socketData.name || "توکن",
          avatarUrl: incomingAvatar || "",
          assetUrl: incomingAvatar || "",
          x: socketData.x || 0,
          y: socketData.y || 0,
          controlledBy: socketData.controlledBy ? String(socketData.controlledBy) : null,
        };
        updatedTokens = [...currentTokens, newToken];
      }

      return { currentScene: { ...state.currentScene, tokens: updatedTokens } };
    });
  },

  addAvailableCondition: (conditionId) => {
    set((state) => {
      if (state.availableConditions.includes(conditionId)) return state;
      return { availableConditions: [...state.availableConditions, conditionId] };
    });
  },

  removeAvailableCondition: (conditionId) => {
    set((state) => {
      const nextAvailable = state.availableConditions.filter((c) => c !== conditionId);
      const updatedTokens = (state.currentScene?.tokens || []).map((t) => ({
        ...t,
        conditions: (t.conditions || []).filter((c) => c !== conditionId),
      }));

      return {
        availableConditions: nextAvailable,
        currentScene: state.currentScene ? { ...state.currentScene, tokens: updatedTokens } : null,
      };
    });
  },

  setMapForCurrentScene: async (mapUrl, mapName = "نقشه اصلی", assetId = null) => {
    const state = get();
    let current = state.currentScene;
    if (!current) return;

    const updatedScene = {
      ...current,
      mapUrl: mapUrl,
      assetUrl: mapUrl,
      name: mapName,
    };

    set({
      currentScene: updatedScene,
      scenes: state.scenes.map((s) => (s.id === current.id ? { ...s, mapUrl, name: mapName } : s)),
    });

    try {
      await sceneApi.updateSceneMap(current.id, {
        mapUrl,
        name: mapName,
        assetId,
      });
      wsService.send("SCENE_UPDATE", { sceneId: current.id, mapUrl, mapName });
    } catch (err) {
      console.error("خطا در ذخیره نقشه در سرور:", err);
    }
  },

  // ۳. ایجاد توکن + ذخیره دائمی در دیتابیس + برادکست بلادرنگ سوکت
  addToken: async (tokenData) => {
    const state = get();
    if (!state.currentScene) return;

    const grid = state.currentScene.grid || {};
    let finalX = tokenData.x;
    let finalY = tokenData.y;
    if (grid.snapToGrid && grid.enabled && snapToGrid) {
      const snapped = snapToGrid(tokenData.x, tokenData.y, grid.size, grid.type, tokenData.size);
      finalX = snapped.x;
      finalY = snapped.y;
    }

    try {
      // ذخیره دائمی در دیتابیس
      const savedToken = await tokenApi.createToken({
        sceneId: state.currentScene.id,
        assetId: tokenData.assetId || null,
        label: tokenData.name || tokenData.label || "توکن",
        avatarUrl: tokenData.avatarUrl || tokenData.assetUrl || "",
        x: finalX,
        y: finalY,
        size: tokenData.size || 1,
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
        avatarUrl: savedToken.avatarUrl || savedToken.assetUrl || tokenData.avatarUrl,
        assetUrl: savedToken.avatarUrl || savedToken.assetUrl || tokenData.avatarUrl,
        x: finalX,
        y: finalY,
      };

      const updatedTokens = [...(state.currentScene.tokens || []), fullToken];
      set({ currentScene: { ...state.currentScene, tokens: updatedTokens } });

      // انتشار زنده در سوکت
      wsService.send("TOKEN_MOVE", {
        tokenId: String(savedToken.id),
        ...fullToken,
      });
    } catch (err) {
      console.error("خطا در ثبت پایدار توکن:", err);
    }
  },

  updateToken: (tokenId, updates) => {
    set((state) => {
      if (!state.currentScene || !state.currentScene.tokens) return state;
      const updatedTokens = state.currentScene.tokens.map((t) =>
          String(t.id) === String(tokenId) ? { ...t, ...updates } : t
      );
      return { currentScene: { ...state.currentScene, tokens: updatedTokens } };
    });
  },

  moveToken: (tokenId, x, y) => {
    set((state) => {
      if (!state.currentScene || !state.currentScene.tokens) return state;
      const grid = state.currentScene.grid || {};
      const target = state.currentScene.tokens.find((t) => String(t.id) === String(tokenId));
      if (!target) return state;

      let finalX = x;
      let finalY = y;
      if (grid.snapToGrid && grid.enabled && snapToGrid) {
        const snapped = snapToGrid(x, y, grid.size, grid.type, target.size);
        finalX = snapped.x;
        finalY = snapped.y;
      }

      const updatedTokens = state.currentScene.tokens.map((t) =>
          String(t.id) === String(tokenId) ? { ...t, x: finalX, y: finalY } : t
      );
      return { currentScene: { ...state.currentScene, tokens: updatedTokens } };
    });
  },

  removeToken: (tokenId) => {
    set((state) => {
      if (!state.currentScene || !state.currentScene.tokens) return state;
      return {
        currentScene: {
          ...state.currentScene,
          tokens: state.currentScene.tokens.filter((t) => String(t.id) !== String(tokenId)),
        },
      };
    });
  },

  addDrawing: (drawing) => {
    set((state) => {
      if (!state.currentScene) return state;
      const drawings = state.currentScene.drawings ? [...state.currentScene.drawings, drawing] : [drawing];
      return { currentScene: { ...state.currentScene, drawings } };
    });
  },

  clearDrawings: () => {
    set((state) => {
      if (!state.currentScene) return state;
      return { currentScene: { ...state.currentScene, drawings: [] } };
    });
  },

  addFogShape: (shapeData) => {
    set((state) => {
      if (!state.currentScene) return state;
      const fogShapes = state.currentScene.fogShapes ? [...state.currentScene.fogShapes, shapeData] : [shapeData];
      return { currentScene: { ...state.currentScene, fogShapes, fogEnabled: true } };
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
    set({ isLoading: true });
    try {
      if (shouldBroadcast) {
        await sceneApi.activateScene(sceneId);
        wsService.send("SCENE_CHANGE", { sceneId });
      }

      const fullState = await sceneApi.getSceneState(sceneId);
      const sceneData = fullState.scene || {};
      const finalMapUrl = sceneData.mapUrl || sceneData.assetUrl || "";

      const loadedTokens = (fullState.tokens || []).map((t) => ({
        ...t,
        id: String(t.id),
        avatarUrl: t.avatarUrl || t.assetUrl || "",
        assetUrl: t.avatarUrl || t.assetUrl || "",
        name: t.label || t.name || "توکن",
        label: t.label || t.name || "توکن",
        controlledBy: t.controlledBy ? String(t.controlledBy) : null,
      }));

      const sceneWithState = {
        ...sceneData,
        assetUrl: finalMapUrl,
        mapUrl: finalMapUrl,
        mapWidth: sceneData.mapWidth || 2000,
        mapHeight: sceneData.mapHeight || 1500,
        tokens: loadedTokens,
        drawings: fullState.drawings || [],
        fogShapes: fullState.fogRegions || [],
        fogEnabled: false,
        grid: {
          enabled: true,
          type: "square",
          size: sceneData.gridSize || 60,
          color: sceneData.gridColor || "#000000",
          opacity: 0.35,
          snapToGrid: true,
        },
      };

      set((state) => ({
        currentScene: sceneWithState,
        scenes: state.scenes.map((s) => ({
          ...s,
          isActive: s.id === sceneId,
        })),
        isLoading: false,
      }));
    } catch (err) {
      console.error("خطا در تغییر صحنه:", err);
      set({ isLoading: false });
    }
  },

  setScene: (scene) => set({ currentScene: scene }),
}));