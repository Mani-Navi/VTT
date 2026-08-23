import { useEffect } from "react";
import { wsService } from "../services/websocket.service";
import { useSceneStore } from "../store/scene.store";
import { useWebSocketStore } from "../store/websocket.store";

export function useWebSocket(roomId?: string, token?: string) {
  const status = useWebSocketStore((state) => state.status);
  const latency = useWebSocketStore((state) => state.latency);

  const moveToken = useSceneStore((state) => state.moveToken);
  const updateToken = useSceneStore((state) => state.updateToken);
  const addToken = useSceneStore((state) => state.addToken);
  const removeToken = useSceneStore((state) => state.removeToken);
  const addDrawing = useSceneStore((state) => state.addDrawing);
  const removeDrawing = useSceneStore((state) => state.removeDrawing);
  const clearDrawings = useSceneStore((state) => state.clearDrawings);
  const addFogShape = useSceneStore((state) => state.addFogShape);
  const addPing = useSceneStore((state) => state.addPing);
  const addDiceRoll = useSceneStore((state) => state.addDiceRoll);
  const addChatMessage = useSceneStore((state) => state.addChatMessage);

  useEffect(() => {
    if (!roomId) return;

    wsService.connect(roomId, token);

    const unsubMove = wsService.on("TOKEN_MOVE", (payload) => {
      moveToken(payload.data.tokenId, payload.data.x, payload.data.y);
    });

    const unsubUpdate = wsService.on("TOKEN_UPDATE", (payload) => {
      updateToken(payload.data.tokenId, payload.data.updates);
    });

    const unsubAdd = wsService.on("TOKEN_ADD", (payload) => {
      addToken(payload.data);
    });

    const unsubDelete = wsService.on("TOKEN_DELETE", (payload) => {
      removeToken(payload.data.tokenId);
    });

    const unsubDraw = wsService.on("DRAWING_ADD", (payload) => {
      addDrawing(payload.data);
    });

    const unsubDrawRemove = wsService.on("DRAWING_REMOVE", (payload) => {
      if (payload.data && payload.data.id) {
        removeDrawing(payload.data.id);
      }
    });

    const unsubDrawClear = wsService.on("DRAWING_CLEAR", (payload) => {
      clearDrawings(payload.data?.targetLayer);
    });

    const unsubFog = wsService.on("FOG_UPDATE", (payload) => {
      addFogShape(payload.data);
    });

    const unsubPing = wsService.on("PING_CREATE", (payload) => {
      addPing(payload.data);
    });

    const unsubDice = wsService.on("DICE_ROLL", (payload) => {
      addDiceRoll(payload.data);
    });

    const unsubChat = wsService.on("CHAT_MESSAGE", (payload) => {
      addChatMessage(payload.data);
    });

    return () => {
      unsubMove();
      unsubUpdate();
      unsubAdd();
      unsubDelete();
      unsubDraw();
      unsubDrawRemove();
      unsubDrawClear();
      unsubFog();
      unsubPing();
      unsubDice();
      unsubChat();
      wsService.disconnect();
    };
  }, [roomId, token]);

  const sendEvent = (type: any, data: any, senderId?: string) => {
    wsService.send(type, data, senderId);
  };

  return {
    status,
    latency,
    isConnected: status === "CONNECTED",
    sendEvent,
  };
}
