import { useEffect, useRef } from "react";
import { wsService } from "../services/websocket.service";
import { useSceneStore } from "../store/scene.store";
import { useWebSocketStore } from "../store/websocket.store";

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

    // ۱. رویداد آنلاین‌ها
    const unsubUsers = wsService.on("USERS_UPDATE", (payload) => {
      if (onMessageRef.current) {
        onMessageRef.current(payload.users || payload);
      }
    });

    // ۲. رویداد توکن‌ها
    const unsubToken = wsService.on("TOKEN_MOVE", (payload) => {
      const data = payload?.data || payload;
      if (data) {
        useSceneStore.getState().syncTokenFromSocket(data);
      }
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۳. پیام‌های عمومی
    const unsubGeneral = wsService.on("MESSAGE", (payload) => {
      if (payload?.action === "MOVE" && payload.data) {
        useSceneStore.getState().syncTokenFromSocket(payload.data);
      }
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۴. نقاشی
    const unsubDraw = wsService.on("DRAWING_ADD", (payload) => {
      const data = payload?.data || payload;
      if (data) useSceneStore.getState().addDrawing(data);
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۵. مه جنگ
    const unsubFog = wsService.on("FOG_UPDATE", (payload) => {
      const data = payload?.data || payload;
      if (data) useSceneStore.getState().addFogShape(data);
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۶. تاس
    const unsubDice = wsService.on("DICE_ROLL", (payload) => {
      const data = payload?.data || payload;
      if (data && useSceneStore.getState().addDiceRoll) {
        useSceneStore.getState().addDiceRoll(data);
      }
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۷. تغییر / سوییچ صحنه برای همه کاربران
    const unsubScene = wsService.on("SCENE_CHANGE", async (payload) => {
      const data = payload?.data || payload;
      if (data && data.sceneId) {
        const store = useSceneStore.getState();
        const exists = store.scenes.some((s) => s.id === data.sceneId);
        if (!exists) {
          await store.loadScenes(roomId);
        } else {
          store.switchScene(data.sceneId, false);
        }
      }
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۸. حذف بلادرنگ صحنه از نوار ابزار تمام کاربران
    const unsubSceneDelete = wsService.on("SCENE_DELETE", async (payload) => {
      const data = payload?.data || payload;
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
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۹. به‌روزرسانی بلادرنگ نقشه صحنه (آپلود / تغییر مپ)
    const unsubSceneUpdate = wsService.on("SCENE_UPDATE", (payload) => {
      const data = payload?.data || payload;
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
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۱۰. تغییر نام صحنه
    const unsubRename = wsService.on("SCENE_RENAME", (payload) => {
      const data = payload?.data || payload;
      if (data && data.sceneId && data.name) {
        useSceneStore.setState((state) => ({
          scenes: state.scenes.map((s) => (s.id === data.sceneId ? { ...s, name: data.name } : s)),
          currentScene: state.currentScene?.id === data.sceneId ? { ...state.currentScene, name: data.name } : state.currentScene,
        }));
      }
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    return () => {
      unsubUsers();
      unsubToken();
      unsubGeneral();
      unsubDraw();
      unsubFog();
      unsubDice();
      unsubScene();
      unsubSceneDelete();
      unsubSceneUpdate();
      unsubRename();
      wsService.disconnect();
    };
  }, [roomId]); // اتصال فقط به ورود و خروج اتاق وابسته است

  const sendEvent = (type, data) => {
    wsService.send(type, data);
  };

  return {
    status,
    latency,
    isConnected: status === "CONNECTED",
    sendEvent,
  };
}