import { create } from "zustand";
import { sceneApi } from "../api/scene.api";
import { snapToGrid } from "../utils/grid.js";

export const useSceneStore = create((set, get) => ({
  currentScene: null,
  scenes: [],
  pings: [],
  initiatives: [],
  currentTurnIndex: 0,
  roundNumber: 1,
  chatMessages: [
    {
      id: "msg-welcome",
      senderId: "system",
      senderName: "سیستم بازی",
      senderColor: "#f59e0b",
      isGM: true,
      content: "به میز مجازی VTT خوش آمدید! مپ تاکتیکال، توکن‌ها و تاس آماده استفاده هستند.",
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    },
  ],
  isLoading: false,

  // بارگذاری سکانس‌های اتاق
  loadScenes: async (roomId) => {
    set({ isLoading: true });
    try {
      const scenes = await sceneApi.getScenes(roomId);
      if (scenes && scenes.length > 0) {
        const active = scenes.find((s) => s.isActive) || scenes[0];

        // فچ وضعیت کامل سکانس فعال از سرور
        const fullState = await sceneApi.getSceneState(active.id);
        const sceneWithState = {
          ...active,
          tokens: fullState.tokens || [],
          drawings: fullState.drawings || [],
          fogShapes: fullState.fogRegions || [],
          grid: {
            enabled: true,
            type: "square",
            size: active.gridSize || 50,
            color: active.gridColor || "#000000",
            opacity: 0.4,
            snapToGrid: true,
          }
        };

        set({
          scenes: scenes,
          currentScene: sceneWithState,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setScene: (scene) => set({ currentScene: scene }),

  // مدیریت توکن‌ها
  addToken: (tokenData) => {
    set((state) => {
      if (!state.currentScene) return state;
      const grid = state.currentScene.grid || {};
      let finalX = tokenData.x;
      let finalY = tokenData.y;
      if (grid.snapToGrid && grid.enabled && snapToGrid) {
        const snapped = snapToGrid(tokenData.x, tokenData.y, grid.size, grid.type, tokenData.size);
        finalX = snapped.x;
        finalY = snapped.y;
      }

      const newToken = {
        ...tokenData,
        x: finalX,
        y: finalY,
        id: tokenData.id || `token-${Date.now()}`,
      };

      const tokens = state.currentScene.tokens ? [...state.currentScene.tokens, newToken] : [newToken];
      return { currentScene: { ...state.currentScene, tokens } };
    });
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

  // مدیریت خطوط و نقاشی‌ها
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

  // مدیریت مه جنگ (Fog of War)
  addFogShape: (shapeData) => {
    set((state) => {
      if (!state.currentScene) return state;
      const fogShapes = state.currentScene.fogShapes ? [...state.currentScene.fogShapes, shapeData] : [shapeData];
      return { currentScene: { ...state.currentScene, fogShapes } };
    });
  },

  // پینگ راداری
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

  // چت لاگ و پرتاب تاس
  addChatMessage: (msg) => {
    const newMsg = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    };
    set((state) => ({ chatMessages: [...state.chatMessages, newMsg] }));
  },

  addDiceRoll: (roll) => {
    const chatMsg = {
      id: `msg-roll-${Date.now()}`,
      senderId: roll.username || "کاربر",
      senderName: roll.username || "کاربر",
      senderColor: "#f59e0b",
      content: `پرتاب تاس [${roll.formula || ""}] ➔ نتیجه کل: ${roll.total}`,
      diceRoll: roll,
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    };
    set((state) => ({ chatMessages: [...state.chatMessages, chatMsg] }));
  },
}));