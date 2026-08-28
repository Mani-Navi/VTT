import { create } from "zustand";
import { sceneApi } from "../api/scene.api";
import { tokenApi } from "../api/token.api";
import { wsService } from "../services/websocket.service";
import { useAuthStore } from "./auth.store";

const snapToCellCenter = (rawX, rawY, gridSize = 60, tokenSize = 1) => {
  const S = Number(gridSize) || 60;
  const size = Number(tokenSize) || 1;

  if (size % 2 === 1) {
    const cellX = Math.floor(rawX / S);
    const cellY = Math.floor(rawY / S);
    return {
      x: cellX * S + S / 2,
      y: cellY * S + S / 2,
    };
  } else {
    const snappedX = Math.round(rawX / S) * S;
    const snappedY = Math.round(rawY / S) * S;
    return {
      x: snappedX,
      y: snappedY,
    };
  }
};

export const useSceneStore = create((set, get) => ({
  currentScene: null,
  scenes: [],
  pings: [],
  isLoading: false,

  availableConditions: ["blinded", "poisoned", "stunned", "invisible", "prone"],

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

      const currentUser = useAuthStore.getState().user;
      const currentUserId = String(currentUser?.id || currentUser?.userId || "").toLowerCase();
      const currentUsername = String(currentUser?.username || "").toLowerCase();

      // نرمال‌سازی توکن‌ها و جلوگیری از تکرار
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
          });
        }
      }

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

      // بررسی دقیق برای جلوگیری از ساخت مجدد توکن
      if (currentUser && currentUser.role !== "GM" && currentUser.role !== "ADMIN") {
        const hasExistingToken = loadedTokens.some((t) => {
          const cb = String(t.controlledBy || "").toLowerCase();
          const lbl = String(t.label || t.name || "").toLowerCase();
          return (
              (cb && (cb === currentUserId || cb === currentUsername)) ||
              (lbl && lbl === currentUsername)
          );
        });

        // فقط در صورتی که مطلقاً هیچ توکنی وجود نداشته باشد، ۱ توکن ساخته می‌شود
        if (!hasExistingToken && loadedTokens.length === 0) {
          const gridSize = sceneData.gridSize || 60;
          const initialCenter = snapToCellCenter(
              (sceneData.mapWidth || 2000) / 2,
              (sceneData.mapHeight || 1500) / 2,
              gridSize,
              1
          );

          get().addToken({
            name: currentUser.username || "بازیکن",
            label: currentUser.username || "بازیکن",
            avatarUrl: currentUser.avatarUrl || "",
            controlledBy: currentUserId,
            x: initialCenter.x,
            y: initialCenter.y,
            size: 1,
            hp: 20,
            maxHp: 20,
            ac: 12,
          });
        }
      }
    } catch (err) {
      console.error("خطا در دریافت صحنه‌های اتاق:", err);
      set({ isLoading: false });
    }
  },

  syncTokenFromSocket: (socketData) => {
    set((state) => {
      if (!state.currentScene || !state.currentScene.tokens) return state;

      const rawId = socketData.tokenId || socketData.id;
      if (!rawId) return state;
      const targetId = String(rawId).toLowerCase();

      const currentTokens = state.currentScene.tokens;

      if (socketData.isDeleted) {
        return {
          currentScene: {
            ...state.currentScene,
            tokens: currentTokens.filter((t) => String(t.id).toLowerCase() !== targetId),
          },
        };
      }

      const existsIndex = currentTokens.findIndex(
          (t) => String(t.id).toLowerCase() === targetId
      );

      const incomingAvatar = socketData.avatarUrl || socketData.assetUrl;
      const incomingName = socketData.label || socketData.name;

      let updatedTokens;
      if (existsIndex !== -1) {
        updatedTokens = currentTokens.map((t, idx) =>
            idx === existsIndex
                ? {
                  ...t,
                  ...socketData,
                  id: String(t.id),
                  name: incomingName || t.name || t.label,
                  label: incomingName || t.label || t.name,
                  x: socketData.x !== undefined ? Number(socketData.x) : t.x,
                  y: socketData.y !== undefined ? Number(socketData.y) : t.y,
                  avatarUrl: incomingAvatar || t.avatarUrl,
                  assetUrl: incomingAvatar || t.assetUrl,
                }
                : t
        );
      } else {
        const newToken = {
          ...socketData,
          id: String(rawId),
          name: incomingName || "توکن",
          label: incomingName || "توکن",
          avatarUrl: incomingAvatar || "",
          assetUrl: incomingAvatar || "",
          x: Number(socketData.x || 0),
          y: Number(socketData.y || 0),
          controlledBy: socketData.controlledBy ? String(socketData.controlledBy) : null,
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

  addToken: async (tokenData) => {
    const state = get();
    if (!state.currentScene) return;

    const gridSize = state.currentScene.grid?.size || 60;
    const centerPos = snapToCellCenter(tokenData.x || 0, tokenData.y || 0, gridSize, tokenData.size || 1);
    const tokenName = tokenData.name || tokenData.label || "توکن";

    try {
      const savedToken = await tokenApi.createToken({
        sceneId: state.currentScene.id,
        assetId: tokenData.assetId || null,
        label: tokenName,
        avatarUrl: tokenData.avatarUrl || tokenData.assetUrl || "",
        x: centerPos.x,
        y: centerPos.y,
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
      console.error("خطا در ثبت پایدار توکن:", err);
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
        name: t.label || t.name || "",
        label: t.label || t.name || "",
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