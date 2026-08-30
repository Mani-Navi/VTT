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

    // ۷. تغییر صحنه
    const unsubScene = wsService.on("SCENE_CHANGE", (payload) => {
      const data = payload?.data || payload;
      if (data && data.sceneId) {
        useSceneStore.getState().switchScene(data.sceneId, false);
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