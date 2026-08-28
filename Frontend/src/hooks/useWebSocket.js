import { useEffect, useRef } from "react";
import { wsService } from "../services/websocket.service";
import { useSceneStore } from "../store/scene.store";
import { useWebSocketStore } from "../store/websocket.store";

export function useWebSocket(roomId, onMessage = null) {
  const status = useWebSocketStore((state) => state.status);
  const latency = useWebSocketStore((state) => state.latency);

  const syncTokenFromSocket = useSceneStore((state) => state.syncTokenFromSocket);
  const addDrawing = useSceneStore((state) => state.addDrawing);
  const addFogShape = useSceneStore((state) => state.addFogShape);
  const addDiceRoll = useSceneStore((state) => state.addDiceRoll);
  const switchScene = useSceneStore((state) => state.switchScene);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("vtt_jwt");
    wsService.connect(roomId, token);

    // ۱. رویداد حضور آنلاین اعضا
    const unsubUsers = wsService.on("USERS_UPDATE", (payload) => {
      if (onMessageRef.current) {
        onMessageRef.current(payload.users || payload);
      }
    });

    // ۲. رویداد توکن‌ها (MOVE / UPDATE / DELETE / ADD)
    const unsubToken = wsService.on("TOKEN_MOVE", (payload) => {
      const data = payload.data || payload;
      if (data && (data.tokenId || data.id)) {
        syncTokenFromSocket(data);
      }
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۳. پیام‌های عمومی تاپیک اتاق
    const unsubGeneral = wsService.on("MESSAGE", (payload) => {
      if (payload?.action === "MOVE" && payload.data) {
        syncTokenFromSocket(payload.data);
      }
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۴. نقاشی بلادرنگ
    const unsubDraw = wsService.on("DRAWING_ADD", (payload) => {
      const data = payload.data || payload;
      addDrawing(data);
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۵. مه جنگ
    const unsubFog = wsService.on("FOG_UPDATE", (payload) => {
      const data = payload.data || payload;
      addFogShape(data);
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۶. پرتاب تاس
    const unsubDice = wsService.on("DICE_ROLL", (payload) => {
      const data = payload.data || payload;
      addDiceRoll(data);
      if (onMessageRef.current) onMessageRef.current(payload);
    });

    // ۷. تغییر صحنه
    const unsubScene = wsService.on("SCENE_CHANGE", (payload) => {
      const data = payload.data || payload;
      if (data.sceneId) {
        switchScene(data.sceneId, false);
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
  }, [roomId, syncTokenFromSocket, addDrawing, addFogShape, addDiceRoll, switchScene]);

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