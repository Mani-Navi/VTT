import { useEffect, useRef } from "react";
import { wsService } from "../services/websocket.service";
import { useSceneStore } from "../store/scene.store";
import { useWebSocketStore } from "../store/websocket.store";

export function useWebSocket(roomId, onMessage = null) {
  const status = useWebSocketStore((state) => state.status);
  const latency = useWebSocketStore((state) => state.latency);

  const moveToken = useSceneStore((state) => state.moveToken);
  const addDrawing = useSceneStore((state) => state.addDrawing);
  const addFogShape = useSceneStore((state) => state.addFogShape);
  const addDiceRoll = useSceneStore((state) => state.addDiceRoll);
  const switchScene = useSceneStore((state) => state.switchScene);

  // استفاده از ref برای پایدار نگه‌داشتن کالبک بدون نیاز به ری‌استارت کردن وب‌سوکت
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("vtt_jwt");
    wsService.connect(roomId, token);

    // ۱. رویداد کاربران آنلاین
    const unsubUsers = wsService.on("USERS_UPDATE", (payload) => {
      if (onMessageRef.current) {
        onMessageRef.current(payload.users || payload);
      }
    });

    // ۲. جابجایی توکن
    const unsubMove = wsService.on("TOKEN_MOVE", (payload) => {
      const data = payload.data || payload;
      if (data.tokenId) {
        moveToken(data.tokenId, data.x, data.y);
      }
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۳. نقاشی
    const unsubDraw = wsService.on("DRAWING_ADD", (payload) => {
      const data = payload.data || payload;
      addDrawing(data);
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۴. مه جنگ
    const unsubFog = wsService.on("FOG_UPDATE", (payload) => {
      const data = payload.data || payload;
      addFogShape(data);
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۵. پرتاب تاس
    const unsubDice = wsService.on("DICE_ROLL", (payload) => {
      const data = payload.data || payload;
      addDiceRoll(data);
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۶. تغییر صحنه
    const unsubScene = wsService.on("SCENE_CHANGE", (payload) => {
      const data = payload.data || payload;
      if (data.sceneId) {
        switchScene(data.sceneId, false);
      }
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۷. پیام‌های عمومی
    const unsubGeneral = wsService.on("MESSAGE", (payload) => {
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    return () => {
      unsubUsers();
      unsubMove();
      unsubDraw();
      unsubFog();
      unsubDice();
      unsubScene();
      unsubGeneral();
      wsService.disconnect();
    };
  }, [roomId, moveToken, addDrawing, addFogShape, addDiceRoll, switchScene]);

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