import { useEffect, useRef, useCallback } from "react";
import { wsService } from "../services/websocket.service";
import { useSceneStore } from "../store/scene.store";
import { useCanvasStore } from "../store/canvas.store";
import { useWebSocketStore } from "../store/websocket.store";
import { WS_EVENTS } from "../constants/wsEvents.js";

export function useWebSocket(roomId, onMessage = null) {
  const status = useWebSocketStore((state) => state.status);
  const latency = useWebSocketStore((state) => state.latency);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("vtt_jwt");
    wsService.connect(roomId, token);

    // ۱. کاربران آنلاین
    const unsubUsers = wsService.on("USERS_UPDATE", (data) => {
      if (onMessageRef.current) onMessageRef.current(data);
    });

    // ۲. جابجایی اتمیک توکن
    const unsubToken = wsService.on(WS_EVENTS.TOKEN_MOVED || "TOKEN_MOVE", (data) => {
      if (data) {
        useSceneStore.getState().syncTokenFromSocket(data);
      }
      if (onMessageRef.current) onMessageRef.current(data);
    });

    // ۳. افزودن اتمیک نقاشی
    const unsubDraw = wsService.on(WS_EVENTS.DRAWING_ADDED || "DRAWING_ADD", (data) => {
      if (data) {
        useSceneStore.getState().addDrawing(data);
      }
      if (onMessageRef.current) onMessageRef.current(data);
    });

    // ۳.۱. حذف اتمیک نقاشی
    const unsubDrawDelete = wsService.on(WS_EVENTS.DRAWING_DELETED || "DRAWING_DELETE", (data) => {
      const targetId = data?.id || data?.drawingId || data?.clientDrawingId || data;
      if (targetId) {
        useSceneStore.getState().removeDrawing(targetId);
      }
      if (onMessageRef.current) onMessageRef.current(data);
    });

    // ۳.۲. جریان زنده رسم خطوط
    const unsubDrawLive = wsService.on("DRAWING_LIVE", (data) => {
      if (data) {
        useSceneStore.getState().setRemoteLiveDrawing(data);
      }
    });

    const unsubDrawLiveEnd = wsService.on("DRAWING_LIVE_END", () => {
      useSceneStore.getState().setRemoteLiveDrawing(null);
    });

    // ۳.۳. نشانگر لیزری
    const unsubLaserMove = wsService.on("LASER_MOVE", (data) => {
      if (data && data.x !== undefined && data.y !== undefined) {
        useCanvasStore.getState().updateRemoteLaser(data);
      }
    });

    const unsubLaserClear = wsService.on("LASER_CLEAR", (data) => {
      if (data && data.userId) {
        useCanvasStore.getState().clearRemoteLaser(data.userId);
      }
    });

    // ۳.۴. خط‌کش اندازه‌گیری
    const unsubRulerUpdate = wsService.on("RULER_UPDATE", (data) => {
      if (data && data.startX !== undefined && data.currentX !== undefined) {
        useCanvasStore.getState().updateRemoteMeasurement(data);
      }
    });

    const unsubRulerClear = wsService.on("RULER_CLEAR", (data) => {
      if (data && data.userId) {
        useCanvasStore.getState().clearRemoteMeasurement(data.userId);
      }
    });

    // ۴. تغییر دسترسی‌ها
    const unsubPerm = wsService.on("PERMISSION_UPDATED", (data) => {
      if (onMessageRef.current) onMessageRef.current({ action: "PERMISSION_UPDATED", data });
    });

    // ۵. به‌روزرسانی مه جنگ
    const unsubFog = wsService.on(WS_EVENTS.FOG_UPDATED || "FOG_UPDATE", (data) => {
      if (!data) return;
      const store = useSceneStore.getState();
      const current = store.currentScene;

      if (
          data.mode === "fill_all" ||
          data.type === "fill_all" ||
          data.type === "FILL_ALL" ||
          data.fogFilled === true
      ) {
        if (current) {
          useSceneStore.setState({
            currentScene: { ...current, fogFilled: true, fogEnabled: true, fogShapes: [] },
          });
        }
      } else {
        store.addFogShape(data);
      }
      if (onMessageRef.current) onMessageRef.current(data);
    });

    const unsubFogLive = wsService.on("FOG_LIVE", (data) => {
      if (data) {
        useSceneStore.getState().setRemoteLiveFog(data);
      }
    });

    const unsubFogLiveEnd = wsService.on("FOG_LIVE_END", () => {
      useSceneStore.getState().setRemoteLiveFog(null);
    });

    const unsubFogClear = wsService.on(WS_EVENTS.DRAWINGS_CLEARED || "FOG_CLEAR", () => {
      useSceneStore.getState().clearFog();
    });

    // ۵.۱. آشکارسازی سراسری مه
    const unsubFogGlobalReveal = wsService.on("FOG_GLOBAL_REVEAL", (data) => {
      if (data && data.isRevealed !== undefined) {
        useCanvasStore.getState().setFogGlobalReveal(Boolean(data.isRevealed));
      }
    });

    // ۵.۲. تنظیمات گرید و اتاق
    const handleSettingsPayload = (payload) => {
      if (!payload) return;
      const data = payload.data !== undefined ? payload.data : payload;
      if (!data) return;

      if (data.measurementType) {
        useCanvasStore.getState().setRulerType(data.measurementType);
      }

      const store = useSceneStore.getState();
      const current = store.currentScene;
      if (current) {
        const updatedGrid = {
          ...current.grid,
          enabled: true,
          type: data.gridType || current.grid?.type || "square",
          lineType: data.lineType || current.grid?.lineType || "solid",
          size: Number(data.gridSize || current.grid?.size || 60),
          color: data.gridColor || current.grid?.color || "#000000",
          opacity: data.gridOpacity !== undefined ? Number(data.gridOpacity) : (current.grid?.opacity ?? 0.35),
          lineWidth: data.lineWidth !== undefined ? Number(data.lineWidth) : (current.grid?.lineWidth ?? 1.5),
          snapToGrid: data.isGridSnapping !== undefined ? Boolean(data.isGridSnapping) : (current.grid?.snapToGrid ?? true),
        };
        useSceneStore.setState({ currentScene: { ...current, grid: updatedGrid } });
      }
    };

    const unsubSettings = wsService.on(WS_EVENTS.SETTINGS_UPDATED || "SETTINGS_UPDATE", handleSettingsPayload);

    const unsubGrid = wsService.on("SCENE_GRID_UPDATE", (payload) => {
      if (!payload) return;
      const data = payload.data !== undefined ? payload.data : payload;
      if (data && data.grid) {
        const current = useSceneStore.getState().currentScene;
        if (current) {
          useSceneStore.setState({ currentScene: { ...current, grid: { ...current.grid, ...data.grid } } });
        }
      }
    });

    // ۵.۳. همگام‌سازی دوربین
    const unsubViewportSync = wsService.on(WS_EVENTS.VIEWPORT_SYNC || "VIEWPORT_SYNC", (payload) => {
      if (!payload) return;
      const data = payload.data !== undefined ? payload.data : payload;
      if (data && data.zoom !== undefined && data.stageX !== undefined && data.stageY !== undefined) {
        useCanvasStore.getState().setZoom(Number(data.zoom));
        useCanvasStore.getState().setStagePos(Number(data.stageX), Number(data.stageY));
      }
    });

    // ۶. تاس
    const unsubDice = wsService.on("DICE_ROLL", (data) => {
      if (data && useSceneStore.getState().addDiceRoll) {
        useSceneStore.getState().addDiceRoll(data);
      }
      if (onMessageRef.current) onMessageRef.current(data);
    });

    // ۷. تغییر صحنه
    const unsubScene = wsService.on(WS_EVENTS.SCENE_ACTIVATED || "SCENE_CHANGE", async (data) => {
      if (data && data.sceneId) {
        const store = useSceneStore.getState();
        const exists = store.scenes.some((s) => s.id === data.sceneId);
        if (!exists) {
          await store.loadScenes(roomId);
        } else {
          store.switchScene(data.sceneId, false);
        }
      }
      if (onMessageRef.current) onMessageRef.current(data);
    });

    // ۸. حذف صحنه
    const unsubSceneDelete = wsService.on("SCENE_DELETE", async (data) => {
      if (data && data.sceneId) {
        useSceneStore.setState((state) => ({
          scenes: state.scenes.filter((s) => s.id !== data.sceneId),
        }));

        if (data.activeSceneId) {
          useSceneStore.getState().switchScene(data.activeSceneId, false);
        } else {
          await useSceneStore.getState().loadScenes(roomId);
        }
      }
      if (onMessageRef.current) onMessageRef.current(data);
    });

    // ۹. به‌روزرسانی صحنه
    const unsubSceneUpdate = wsService.on(WS_EVENTS.SCENE_UPDATED || "SCENE_UPDATE", (data) => {
      if (data && data.sceneId) {
        const nextMapUrl = data.mapUrl || data.assetUrl || "";
        useSceneStore.setState((state) => {
          const isCurrent = state.currentScene?.id === data.sceneId;
          return {
            scenes: state.scenes.map((s) =>
                s.id === data.sceneId ? { ...s, mapUrl: nextMapUrl, assetUrl: nextMapUrl } : s
            ),
            currentScene: isCurrent
                ? {
                  ...state.currentScene,
                  mapUrl: nextMapUrl,
                  assetUrl: nextMapUrl,
                }
                : state.currentScene,
          };
        });
      }
      if (onMessageRef.current) onMessageRef.current(data);
    });

    // ۱۰. تغییر نام صحنه
    const unsubRename = wsService.on("SCENE_RENAME", (data) => {
      if (data && data.sceneId && data.name) {
        useSceneStore.setState((state) => ({
          scenes: state.scenes.map((s) => (s.id === data.sceneId ? { ...s, name: data.name } : s)),
          currentScene:
              state.currentScene?.id === data.sceneId
                  ? { ...state.currentScene, name: data.name }
                  : state.currentScene,
        }));
      }
      if (onMessageRef.current) onMessageRef.current(data);
    });

    return () => {
      unsubUsers();
      unsubToken();
      unsubDraw();
      unsubDrawDelete();
      unsubDrawLive();
      unsubDrawLiveEnd();
      unsubLaserMove();
      unsubLaserClear();
      unsubRulerUpdate();
      unsubRulerClear();
      unsubPerm();
      unsubFog();
      unsubFogLive();
      unsubFogLiveEnd();
      unsubFogClear();
      unsubFogGlobalReveal();
      unsubSettings();
      unsubGrid();
      unsubViewportSync();
      unsubDice();
      unsubScene();
      unsubSceneDelete();
      unsubSceneUpdate();
      unsubRename();
      wsService.disconnect();
    };
  }, [roomId]);

  const sendEvent = useCallback((type, data) => {
    wsService.send(type, data);
  }, []);

  return {
    status,
    latency,
    isConnected: status === "CONNECTED",
    sendEvent,
  };
}