import { apiClient } from "./axios";
import { Scene, Token, DrawingShape, FogShape } from "../types";
import { MAP_PRESETS } from "../constants/mapPresets";
import { TOKEN_PRESETS } from "../constants/tokenPresets";

const SCENES_STORAGE_KEY = "vtt_saved_scenes";

const DEFAULT_SCENES: Scene[] = [
  {
    id: "scene-dungeon-1",
    roomId: "room-default-1",
    name: "سرداب باستانی سنگی",
    nameFa: "سرداب باستانی سنگی",
    mapUrl: MAP_PRESETS[0].imageUrl,
    mapWidth: 2000,
    mapHeight: 1500,
    grid: {
      enabled: true,
      type: "square",
      size: 70,
      color: "rgba(255, 255, 255, 0.25)",
      opacity: 0.3,
      snapToGrid: true,
      scaleValue: 5,
      scaleUnit: "ft",
    },
    fogEnabled: true,
    fogColor: "#09090b",
    fogOpacity: 0.95,
    tokens: [
      {
        id: "token-gareth",
        name: "گارث (پالادین)",
        avatarUrl: TOKEN_PRESETS[0].avatarUrl,
        x: 350,
        y: 420,
        size: 1,
        rotation: 0,
        elevation: 0,
        hp: 42,
        maxHp: 42,
        ac: 18,
        speed: 30,
        conditions: [],
        tintColor: "#3b82f6",
      },
      {
        id: "token-elara",
        name: "الارا (میج)",
        avatarUrl: TOKEN_PRESETS[1].avatarUrl,
        x: 280,
        y: 420,
        size: 1,
        rotation: 0,
        elevation: 0,
        hp: 26,
        maxHp: 26,
        ac: 13,
        speed: 30,
        conditions: ["blessed"],
        tintColor: "#8b5cf6",
      },
      {
        id: "token-goblin-1",
        name: "گابلین ۱",
        avatarUrl: TOKEN_PRESETS[4].avatarUrl,
        x: 770,
        y: 350,
        size: 1,
        rotation: 0,
        elevation: 0,
        hp: 7,
        maxHp: 7,
        ac: 15,
        speed: 30,
        conditions: [],
        tintColor: "#ef4444",
      },
      {
        id: "token-goblin-2",
        name: "گابلین ۲",
        avatarUrl: TOKEN_PRESETS[4].avatarUrl,
        x: 840,
        y: 420,
        size: 1,
        rotation: 0,
        elevation: 0,
        hp: 4,
        maxHp: 7,
        ac: 15,
        speed: 30,
        conditions: ["poisoned"],
        tintColor: "#ef4444",
      },
      {
        id: "token-orc-boss",
        name: "سرکرده اورک‌ها",
        avatarUrl: TOKEN_PRESETS[5].avatarUrl,
        x: 980,
        y: 350,
        size: 2,
        rotation: 0,
        elevation: 0,
        hp: 45,
        maxHp: 45,
        ac: 16,
        speed: 30,
        conditions: [],
        tintColor: "#dc2626",
      },
    ],
    drawings: [
      {
        id: "draw-1",
        type: "arrow",
        points: [350, 420, 600, 420],
        x: 0,
        y: 0,
        stroke: "#f59e0b",
        strokeWidth: 4,
        isGMLayer: false,
      },
    ],
    fogShapes: [
      // Initially reveal player area
      {
        id: "fog-reveal-1",
        type: "rect",
        x: 100,
        y: 100,
        width: 800,
        height: 600,
        isCover: false, // reveal
      },
    ],
  },
];

function getStoredScenes(): Scene[] {
  const data = localStorage.getItem(SCENES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(SCENES_STORAGE_KEY, JSON.stringify(DEFAULT_SCENES));
    return DEFAULT_SCENES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_SCENES;
  }
}

function saveStoredScenes(scenes: Scene[]) {
  localStorage.setItem(SCENES_STORAGE_KEY, JSON.stringify(scenes));
}

export const sceneApi = {
  getScenes: async (roomId: string): Promise<Scene[]> => {
    try {
      const res = await apiClient.get<Scene[]>(`/rooms/${roomId}/scenes`);
      return res.data;
    } catch {
      const scenes = getStoredScenes();
      return scenes.filter((s) => s.roomId === roomId || s.roomId === "room-default-1");
    }
  },

  getSceneById: async (id: string): Promise<Scene> => {
    try {
      const res = await apiClient.get<Scene>(`/scenes/${id}`);
      return res.data;
    } catch {
      const scenes = getStoredScenes();
      const scene = scenes.find((s) => s.id === id);
      if (scene) return scene;
      return DEFAULT_SCENES[0];
    }
  },

  createScene: async (scene: Omit<Scene, "id">): Promise<Scene> => {
    try {
      const res = await apiClient.post<Scene>("/scenes", scene);
      return res.data;
    } catch {
      const newScene: Scene = {
        ...scene,
        id: `scene-${Date.now()}`,
      };
      const scenes = getStoredScenes();
      saveStoredScenes([...scenes, newScene]);
      return newScene;
    }
  },

  updateScene: async (id: string, updates: Partial<Scene>): Promise<Scene> => {
    try {
      const res = await apiClient.put<Scene>(`/scenes/${id}`, updates);
      return res.data;
    } catch {
      const scenes = getStoredScenes();
      const updated = scenes.map((s) => (s.id === id ? { ...s, ...updates } : s));
      saveStoredScenes(updated);
      const s = updated.find((item) => item.id === id);
      if (!s) return DEFAULT_SCENES[0];
      return s;
    }
  },

  deleteScene: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/scenes/${id}`);
    } catch {
      const scenes = getStoredScenes().filter((s) => s.id !== id);
      saveStoredScenes(scenes);
    }
  },
};
