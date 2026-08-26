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

  // ۱. بارگذاری صحنه‌ها از دیتابیس
  loadScenes: async (roomId) => {
    if (!roomId) return;
    set({ isLoading: true });
    try {
      let scenes = await sceneApi.getScenes(roomId);

      // اگر صحنه‌ای نبود، صحنه پیش‌فرض در دیتابیس ساخته می‌شود
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

      const sceneWithState = {
        ...sceneData,
        assetUrl: finalMapUrl,
        mapUrl: finalMapUrl,
        mapWidth: sceneData.mapWidth || 2000,
        mapHeight: sceneData.mapHeight || 1500,
        tokens: fullState.tokens || [],
        drawings: fullState.drawings || [],
        fogShapes: fullState.fogRegions || [],
        fogEnabled: false, // پیش‌فرض مه غیرفعال است تا نقشه دیده شود
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

  // ۲. تنظیم و ذخیره دائمی نقشه در پایگاه‌داده
  setMapForCurrentScene: async (mapUrl, mapName = "نقشه اصلی", assetId = null) => {
    const state = get();
    let current = state.currentScene;
    if (!current) return;

    // آپدیت سریع و خوش‌بینانه در فرانت
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

    // ذخیره پایدار در بک‌اند
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

  // ۳. ایجاد و ذخیره دائمی توکن در سرور
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

    const localId = tokenData.id || `token-${Date.now()}`;
    const newToken = {
      ...tokenData,
      id: localId,
      x: finalX,
      y: finalY,
    };

    // آپدیت آنی لوکال
    const updatedTokens = state.currentScene.tokens ? [...state.currentScene.tokens, newToken] : [newToken];
    set({ currentScene: { ...state.currentScene, tokens: updatedTokens } });

    // ذخیره پایدار در دیتابیس
    try {
      const savedToken = await tokenApi.createToken({
        sceneId: state.currentScene.id,
        assetId: tokenData.assetId || null,
        label: tokenData.name || tokenData.label || "توکن",
        x: finalX,
        y: finalY,
      });

      if (savedToken && savedToken.id) {
        set((s) => ({
          currentScene: {
            ...s.currentScene,
            tokens: s.currentScene.tokens.map((t) => (t.id === localId ? { ...t, id: savedToken.id } : t)),
          },
        }));
      }
    } catch (err) {
      console.warn("ذخیره آفلاین توکن انجام شد");
    }
  },

  updateToken: (tokenId, updates) => {
    set((state) => {
      if (!state.currentScene || !state.currentScene.tokens) return state;
      const updatedTokens = state.currentScene.tokens.map((t) =>
          t.id === tokenId ? { ...t, ...updates } : t
      );
      return { currentScene: { ...state.currentScene, tokens: updatedTokens } };
    });
  },

  moveToken: (tokenId, x, y) => {
    set((state) => {
      if (!state.currentScene || !state.currentScene.tokens) return state;
      const grid = state.currentScene.grid || {};
      const target = state.currentScene.tokens.find((t) => t.id === tokenId);
      if (!target) return state;

      let finalX = x;
      let finalY = y;
      if (grid.snapToGrid && grid.enabled && snapToGrid) {
        const snapped = snapToGrid(x, y, grid.size, grid.type, target.size);
        finalX = snapped.x;
        finalY = snapped.y;
      }

      const updatedTokens = state.currentScene.tokens.map((t) =>
          t.id === tokenId ? { ...t, x: finalX, y: finalY } : t
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
          tokens: state.currentScene.tokens.filter((t) => t.id !== tokenId),
        },
      };
    });
  },

  // ۴. مدیریت خطوط و نقاشی‌ها
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

  // ۵. مدیریت مه جنگ
  addFogShape: (shapeData) => {
    set((state) => {
      if (!state.currentScene) return state;
      const fogShapes = state.currentScene.fogShapes ? [...state.currentScene.fogShapes, shapeData] : [shapeData];
      return { currentScene: { ...state.currentScene, fogShapes, fogEnabled: true } };
    });
  },

  // ۶. پینگ رادار
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

  addDiceRoll: (roll) => {},

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

      const sceneWithState = {
        ...sceneData,
        assetUrl: finalMapUrl,
        mapUrl: finalMapUrl,
        mapWidth: sceneData.mapWidth || 2000,
        mapHeight: sceneData.mapHeight || 1500,
        tokens: fullState.tokens || [],
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