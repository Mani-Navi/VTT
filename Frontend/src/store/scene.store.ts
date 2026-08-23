import { create } from "zustand";
import { Scene, Token, DrawingShape, FogShape, GridConfig, PingState, InitiativeItem, ChatMessage, DiceRoll } from "../types";
import { sceneApi } from "../api/scene.api";
import { snapToGrid } from "../utils/grid";

interface SceneState {
  currentScene: Scene | null;
  scenes: Scene[];
  pings: PingState[];
  initiatives: InitiativeItem[];
  currentTurnIndex: number;
  roundNumber: number;
  chatMessages: ChatMessage[];
  isLoading: boolean;

  // Scene lifecycle
  loadScenes: (roomId: string) => Promise<void>;
  fetchScene: (sceneId: string) => Promise<Scene | null>;
  setScene: (scene: Scene) => void;
  updateSceneData: (updates: Partial<Scene>) => void;
  updateGrid: (grid: Partial<GridConfig>) => void;

  // Tokens
  addToken: (token: Omit<Token, "id">) => void;
  updateToken: (tokenId: string, updates: Partial<Token>) => void;
  moveToken: (tokenId: string, x: number, y: number) => void;
  removeToken: (tokenId: string) => void;
  deleteToken: (tokenId: string) => void;
  duplicateToken: (tokenId: string) => void;
  clearTokens: () => void;

  // Drawings
  addDrawing: (drawing: DrawingShape) => void;
  removeDrawing: (id: string) => void;
  clearDrawings: (targetLayer?: "all" | "public" | "gm") => void;
  undoDrawing: (targetLayer?: "all" | "public" | "gm") => void;

  // Fog of War
  addFogShape: (shape: Omit<FogShape, "id">) => void;
  resetFog: () => void;
  revealAllFog: () => void;
  setFogOpacity: (opacity: number) => void;

  // Pings & Lasers
  addPing: (ping: Omit<PingState, "id" | "timestamp">) => void;
  removePing: (id: string) => void;

  // Initiative Tracker
  setInitiatives: (items: InitiativeItem[]) => void;
  addInitiativeItem: (item: Omit<InitiativeItem, "id" | "isCurrent">) => void;
  removeInitiativeItem: (id: string) => void;
  updateInitiativeItem: (id: string, updates: Partial<InitiativeItem>) => void;
  nextTurn: () => void;
  previousTurn: () => void;
  sortInitiatives: () => void;
  resetInitiatives: () => void;

  // Chat & Rolls
  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  addDiceRoll: (roll: DiceRoll) => void;
}

const DEFAULT_SCENE: Scene = {
  id: "scene-crypt-1",
  roomId: "room-crypt-demo",
  name: "دخمه باستانی (Ancient Crypt)",
  mapUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
  mapWidth: 2400,
  mapHeight: 1800,
  grid: {
    enabled: true,
    type: "square",
    size: 70,
    color: "rgba(255, 255, 255, 0.25)",
    opacity: 0.35,
    snapToGrid: true,
    scaleValue: 5,
    scaleUnit: "ft",
  },
  fogEnabled: true,
  fogColor: "#09090b",
  fogOpacity: 0.6,
  fogShapes: [
    {
      id: "fog-init-reveal",
      type: "rect",
      x: 100,
      y: 100,
      width: 1400,
      height: 1200,
      isCover: false,
    },
  ],
  tokens: [
    {
      id: "token-paladin",
      name: "گارث (پالادین)",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Gareth&backgroundColor=b6e3f4",
      x: 350,
      y: 420,
      size: 1,
      rotation: 0,
      elevation: 0,
      hp: 42,
      maxHp: 42,
      tempHp: 5,
      showHpBar: true,
      hpVisibility: "all",
      hpStyle: "bar_numbers",
      ac: 18,
      speed: 30,
      conditions: ["blessed"],
      tintColor: "#3b82f6",
      controlledBy: ["user-gareth"],
      isLocked: false,
      isHidden: false,
    },
    {
      id: "token-mage",
      name: "الارا (میج)",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Elara&backgroundColor=c0aede",
      x: 280,
      y: 490,
      size: 1,
      rotation: 0,
      elevation: 0,
      hp: 26,
      maxHp: 26,
      showHpBar: true,
      hpVisibility: "all",
      hpStyle: "bar_numbers",
      ac: 12,
      speed: 30,
      conditions: [],
      tintColor: "#8b5cf6",
      controlledBy: ["user-elara"],
      isLocked: false,
      isHidden: false,
    },
    {
      id: "token-rogue",
      name: "سایه (روگ)",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Shadow&backgroundColor=d1d4f9",
      x: 420,
      y: 350,
      size: 1,
      rotation: 0,
      elevation: 0,
      hp: 31,
      maxHp: 31,
      showHpBar: true,
      hpVisibility: "all",
      hpStyle: "bar_numbers",
      ac: 15,
      speed: 35,
      conditions: [],
      tintColor: "#10b981",
      controlledBy: ["user-gm-1"],
      isLocked: false,
      isHidden: false,
    },
    {
      id: "token-orc-boss",
      name: "سرکرده اورک‌ها",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=OrcChief&backgroundColor=ffd5dc",
      x: 770,
      y: 420,
      size: 2,
      rotation: 0,
      elevation: 0,
      hp: 55,
      maxHp: 65,
      showHpBar: true,
      hpVisibility: "all",
      hpStyle: "bar_numbers",
      ac: 16,
      speed: 30,
      conditions: [],
      tintColor: "#ef4444",
      controlledBy: ["user-gm-1"],
      isLocked: false,
      isHidden: false,
    },
    {
      id: "token-stealth-goblin",
      name: "گابلین در کمین (Stealth)",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Goblin1&backgroundColor=d1d4f9",
      x: 910,
      y: 280,
      size: 1,
      rotation: 0,
      elevation: 0,
      hp: 12,
      maxHp: 12,
      showHpBar: true,
      hpVisibility: "gm_only",
      hpStyle: "bar",
      ac: 13,
      speed: 30,
      conditions: ["invisible"],
      tintColor: "#f59e0b",
      controlledBy: ["user-gm-1"],
      isLocked: false,
      isHidden: true, // Only GM sees this
    },
  ],
  drawings: [],
};

export const useSceneStore = create<SceneState>((set, get) => ({
  currentScene: DEFAULT_SCENE,
  scenes: [DEFAULT_SCENE],
  pings: [],
  initiatives: [
    { id: "init-1", name: "الارا (میج)", score: 18, hp: 26, maxHp: 26, conditions: ["blessed"], isCurrent: true, isNpc: false },
    { id: "init-2", name: "گارث (پالادین)", score: 15, hp: 42, maxHp: 42, conditions: [], isCurrent: false, isNpc: false },
    { id: "init-3", name: "سرکرده اورک‌ها", score: 12, hp: 55, maxHp: 65, conditions: [], isCurrent: false, isNpc: true },
    { id: "init-4", name: "گابلین‌ها", score: 9, hp: 12, maxHp: 12, conditions: [], isCurrent: false, isNpc: true },
  ],
  currentTurnIndex: 0,
  roundNumber: 1,
  chatMessages: [
    {
      id: "msg-welcome",
      senderId: "system",
      senderName: "سیستم بازی",
      senderColor: "#f59e0b",
      isGM: true,
      content: "به میز مجازی Persian VTT خوش آمدید! مپ تاکتیکال، توکن‌ها و تاس آماده استفاده هستند.",
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    },
  ],
  isLoading: false,

  loadScenes: async (roomId: string) => {
    set({ isLoading: true });
    try {
      const scenes = await sceneApi.getScenes(roomId);
      const active = scenes[0] || DEFAULT_SCENE;
      set({ scenes: scenes.length > 0 ? scenes : [DEFAULT_SCENE], currentScene: active, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchScene: async (sceneId: string) => {
    try {
      const scene = await sceneApi.getSceneById(sceneId);
      set({ currentScene: scene });
      return scene;
    } catch {
      set({ currentScene: DEFAULT_SCENE });
      return DEFAULT_SCENE;
    }
  },

  setScene: (scene: Scene) => {
    set({ currentScene: scene });
  },

  updateSceneData: (updates: Partial<Scene>) => {
    set((state) => {
      if (!state.currentScene) return state;
      const updated = { ...state.currentScene, ...updates };
      sceneApi.updateScene(updated.id, updates).catch(() => {});
      return {
        currentScene: updated,
        scenes: state.scenes.map((s) => (s.id === updated.id ? updated : s)),
      };
    });
  },

  updateGrid: (gridUpdates: Partial<GridConfig>) => {
    set((state) => {
      if (!state.currentScene) return state;
      const newGrid = { ...state.currentScene.grid, ...gridUpdates };
      const updatedScene = { ...state.currentScene, grid: newGrid };
      return {
        currentScene: updatedScene,
        scenes: state.scenes.map((s) => (s.id === updatedScene.id ? updatedScene : s)),
      };
    });
  },

  addToken: (tokenData) => {
    set((state) => {
      if (!state.currentScene) return state;
      const grid = state.currentScene.grid;
      let finalX = tokenData.x;
      let finalY = tokenData.y;
      if (grid.snapToGrid && grid.enabled) {
        const snapped = snapToGrid(tokenData.x, tokenData.y, grid.size, grid.type, tokenData.size);
        finalX = snapped.x;
        finalY = snapped.y;
      }

      const newToken: Token = {
        ...tokenData,
        x: finalX,
        y: finalY,
        id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };

      const updatedTokens = [...state.currentScene.tokens, newToken];
      const updatedScene = { ...state.currentScene, tokens: updatedTokens };
      return { currentScene: updatedScene };
    });
  },

  updateToken: (tokenId, updates) => {
    set((state) => {
      if (!state.currentScene) return state;
      const updatedTokens = state.currentScene.tokens.map((t) =>
        t.id === tokenId ? { ...t, ...updates } : t
      );
      return { currentScene: { ...state.currentScene, tokens: updatedTokens } };
    });
  },

  moveToken: (tokenId, x, y) => {
    set((state) => {
      if (!state.currentScene) return state;
      const grid = state.currentScene.grid;
      const targetToken = state.currentScene.tokens.find((t) => t.id === tokenId);
      if (!targetToken) return state;

      let finalX = x;
      let finalY = y;
      if (grid.snapToGrid && grid.enabled) {
        const snapped = snapToGrid(x, y, grid.size, grid.type, targetToken.size);
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
      if (!state.currentScene) return state;
      const updatedTokens = state.currentScene.tokens.filter((t) => t.id !== tokenId);
      return { currentScene: { ...state.currentScene, tokens: updatedTokens } };
    });
  },

  deleteToken: (tokenId) => {
    get().removeToken(tokenId);
  },

  duplicateToken: (tokenId) => {
    set((state) => {
      if (!state.currentScene) return state;
      const orig = state.currentScene.tokens.find((t) => t.id === tokenId);
      if (!orig) return state;

      const gridSize = state.currentScene.grid.size || 70;
      const duplicate: Token = {
        ...orig,
        id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: `${orig.name} (کپی)`,
        x: orig.x + gridSize,
        y: orig.y + gridSize,
      };

      return {
        currentScene: {
          ...state.currentScene,
          tokens: [...state.currentScene.tokens, duplicate],
        },
      };
    });
  },

  clearTokens: () => {
    set((state) => {
      if (!state.currentScene) return state;
      return { currentScene: { ...state.currentScene, tokens: [] } };
    });
  },

  addDrawing: (drawing) => {
    set((state) => {
      if (!state.currentScene) return state;
      return {
        currentScene: {
          ...state.currentScene,
          drawings: [...state.currentScene.drawings, drawing],
        },
      };
    });
  },

  removeDrawing: (id) => {
    set((state) => {
      if (!state.currentScene) return state;
      return {
        currentScene: {
          ...state.currentScene,
          drawings: state.currentScene.drawings.filter((d) => d.id !== id),
        },
      };
    });
  },

  clearDrawings: (targetLayer?: "all" | "public" | "gm") => {
    set((state) => {
      if (!state.currentScene) return state;
      let updatedDrawings = state.currentScene.drawings;
      if (!targetLayer || targetLayer === "all") {
        updatedDrawings = [];
      } else if (targetLayer === "public") {
        updatedDrawings = state.currentScene.drawings.filter((d) => d.isGMLayer);
      } else if (targetLayer === "gm") {
        updatedDrawings = state.currentScene.drawings.filter((d) => !d.isGMLayer);
      }
      return {
        currentScene: {
          ...state.currentScene,
          drawings: updatedDrawings,
        },
      };
    });
  },

  undoDrawing: (targetLayer?: "all" | "public" | "gm") => {
    set((state) => {
      if (!state.currentScene || state.currentScene.drawings.length === 0) return state;
      const drawings = [...state.currentScene.drawings];
      if (!targetLayer || targetLayer === "all") {
        drawings.pop();
      } else if (targetLayer === "public") {
        let lastPublicIdx = -1;
        for (let i = drawings.length - 1; i >= 0; i--) {
          if (!drawings[i].isGMLayer) {
            lastPublicIdx = i;
            break;
          }
        }
        if (lastPublicIdx !== -1) drawings.splice(lastPublicIdx, 1);
      } else if (targetLayer === "gm") {
        let lastGmIdx = -1;
        for (let i = drawings.length - 1; i >= 0; i--) {
          if (drawings[i].isGMLayer) {
            lastGmIdx = i;
            break;
          }
        }
        if (lastGmIdx !== -1) drawings.splice(lastGmIdx, 1);
      }
      return {
        currentScene: {
          ...state.currentScene,
          drawings,
        },
      };
    });
  },

  addFogShape: (shapeData) => {
    set((state) => {
      if (!state.currentScene) return state;
      const newShape: FogShape = {
        ...shapeData,
        id: `fog-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      return {
        currentScene: {
          ...state.currentScene,
          fogShapes: [...state.currentScene.fogShapes, newShape],
        },
      };
    });
  },

  resetFog: () => {
    set((state) => {
      if (!state.currentScene) return state;
      return {
        currentScene: {
          ...state.currentScene,
          fogShapes: [],
          fogEnabled: true,
        },
      };
    });
  },

  revealAllFog: () => {
    set((state) => {
      if (!state.currentScene) return state;
      const fullReveal: FogShape = {
        id: `fog-reveal-all-${Date.now()}`,
        type: "rect",
        x: 0,
        y: 0,
        width: state.currentScene.mapWidth || 3000,
        height: state.currentScene.mapHeight || 3000,
        isCover: false,
      };
      return {
        currentScene: {
          ...state.currentScene,
          fogShapes: [fullReveal],
        },
      };
    });
  },

  setFogOpacity: (opacity: number) => {
    set((state) => {
      if (!state.currentScene) return state;
      return {
        currentScene: {
          ...state.currentScene,
          fogOpacity: opacity,
        },
      };
    });
  },

  addPing: (pingData) => {
    const newPing: PingState = {
      ...pingData,
      id: `ping-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    set((state) => ({ pings: [...state.pings, newPing] }));

    setTimeout(() => {
      get().removePing(newPing.id);
    }, 4000);
  },

  removePing: (id) => {
    set((state) => ({ pings: state.pings.filter((p) => p.id !== id) }));
  },

  setInitiatives: (items) => {
    set({ initiatives: items });
  },

  addInitiativeItem: (item) => {
    set((state) => {
      const newItem: InitiativeItem = {
        ...item,
        id: `init-${Date.now()}`,
        isCurrent: state.initiatives.length === 0,
      };
      return { initiatives: [...state.initiatives, newItem] };
    });
  },

  removeInitiativeItem: (id) => {
    set((state) => ({
      initiatives: state.initiatives.filter((i) => i.id !== id),
    }));
  },

  updateInitiativeItem: (id, updates) => {
    set((state) => ({
      initiatives: state.initiatives.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  },

  nextTurn: () => {
    set((state) => {
      if (state.initiatives.length === 0) return state;
      const nextIndex = (state.currentTurnIndex + 1) % state.initiatives.length;
      const isNewRound = nextIndex === 0;

      const updated = state.initiatives.map((item, idx) => ({
        ...item,
        isCurrent: idx === nextIndex,
      }));

      return {
        initiatives: updated,
        currentTurnIndex: nextIndex,
        roundNumber: isNewRound ? state.roundNumber + 1 : state.roundNumber,
      };
    });
  },

  previousTurn: () => {
    set((state) => {
      if (state.initiatives.length === 0) return state;
      const prevIndex =
        state.currentTurnIndex === 0
          ? state.initiatives.length - 1
          : state.currentTurnIndex - 1;

      const updated = state.initiatives.map((item, idx) => ({
        ...item,
        isCurrent: idx === prevIndex,
      }));

      return {
        initiatives: updated,
        currentTurnIndex: prevIndex,
      };
    });
  },

  sortInitiatives: () => {
    set((state) => {
      const sorted = [...state.initiatives].sort((a, b) => b.score - a.score);
      const updated = sorted.map((item, idx) => ({
        ...item,
        isCurrent: idx === 0,
      }));
      return { initiatives: updated, currentTurnIndex: 0 };
    });
  },

  resetInitiatives: () => {
    set({ initiatives: [], currentTurnIndex: 0, roundNumber: 1 });
  },

  addChatMessage: (msg) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    set((state) => ({ chatMessages: [...state.chatMessages, newMsg] }));
  },

  addDiceRoll: (roll: DiceRoll) => {
    const chatMsg: ChatMessage = {
      id: `msg-roll-${Date.now()}`,
      senderId: roll.userId,
      senderName: roll.userName,
      senderColor: roll.userColor,
      content: `${roll.label ? `[${roll.label}] ` : ""}فرمول: ${roll.formula} ➔ مجموع: ${roll.total}`,
      diceRoll: roll,
      timestamp: roll.timestamp,
    };
    set((state) => ({ chatMessages: [...state.chatMessages, chatMsg] }));
  },
}));
