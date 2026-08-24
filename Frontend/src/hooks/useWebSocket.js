import { useEffect } from "react";
import { wsService } from "../services/websocket.service";
import { useSceneStore } from "../store/scene.store";
import { useWebSocketStore } from "../store/websocket.store";

export function useWebSocket(roomId) {
  const status = useWebSocketStore((state) => state.status);
  const latency = useWebSocketStore((state) => state.latency);

  const moveToken = useSceneStore((state) => state.moveToken);
  const addDrawing = useSceneStore((state) => state.addDrawing);
  const addFogShape = useSceneStore((state) => state.addFogShape);
  const addDiceRoll = useSceneStore((state) => state.addDiceRoll);
  const addChatMessage = useSceneStore((state) => state.addChatMessage);

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("vtt_jwt");
    wsService.connect(roomId, token);

    const unsubMove = wsService.on("TOKEN_MOVE", (payload) => {
      const data = payload.data || payload;
      if (data.tokenId) {
        moveToken(data.tokenId, data.x, data.y);
      }
    });

    const unsubDraw = wsService.on("DRAWING_ADD", (payload) => {
      const data = payload.data || payload;
      addDrawing(data);
    });

    const unsubFog = wsService.on("FOG_UPDATE", (payload) => {
      const data = payload.data || payload;
      addFogShape(data);
    });

    const unsubDice = wsService.on("DICE_ROLL", (payload) => {
      const data = payload.data || payload;
      addDiceRoll(data);
    });

    const unsubChat = wsService.on("CHAT_MESSAGE", (payload) => {
      const data = payload.data || payload;
      addChatMessage(data);
    });

    return () => {
      unsubMove();
      unsubDraw();
      unsubFog();
      unsubDice();
      unsubChat();
      wsService.disconnect();
    };
  }, [roomId, moveToken, addDrawing, addFogShape, addDiceRoll, addChatMessage]);

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