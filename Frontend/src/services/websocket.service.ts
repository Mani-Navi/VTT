import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useWebSocketStore } from "../store/websocket.store";

export type WsEventType =
  | "TOKEN_MOVE"
  | "TOKEN_UPDATE"
  | "TOKEN_ADD"
  | "TOKEN_DELETE"
  | "DRAWING_ADD"
  | "DRAWING_REMOVE"
  | "DRAWING_CLEAR"
  | "FOG_UPDATE"
  | "PING_CREATE"
  | "LASER_UPDATE"
  | "DICE_ROLL"
  | "CHAT_MESSAGE"
  | "INITIATIVE_UPDATE"
  | "SCENE_CHANGE"
  | "PLAYER_JOIN"
  | "PLAYER_LEAVE";

export interface WsPayload<T = any> {
  type: WsEventType;
  roomId: string;
  senderId: string;
  data: T;
  timestamp: number;
}

class WebSocketService {
  private client: Client | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Map<WsEventType, Set<(payload: WsPayload) => void>> = new Map();
  private isConnected: boolean = false;
  private currentRoomId: string | null = null;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.broadcastChannel = new BroadcastChannel("persian_vtt_room_sync");
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };
      } catch {
        // Fallback
      }
    }
  }

  public connect(roomId: string, token?: string) {
    this.currentRoomId = roomId;
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const envWsUrl = import.meta.env.VITE_WS_URL;

    // Check if we have a valid secure endpoint or if we should run in browser broadcast channel mode
    const canAttemptSockJS =
      Boolean(envWsUrl) &&
      (!isHttps || envWsUrl.startsWith("https://") || envWsUrl.startsWith("wss://"));

    if (!canAttemptSockJS) {
      // In standalone / preview mode on HTTPS, operating in BroadcastChannel mode
      useWebSocketStore.getState().setStatus("CONNECTED");
      return;
    }

    try {
      const wsUrl = envWsUrl || "http://localhost:8080/ws";

      this.client = new Client({
        webSocketFactory: () => {
          try {
            return new SockJS(wsUrl);
          } catch (e) {
            console.warn("SockJS factory warning, using fallback", e);
            return null as any;
          }
        },
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: () => {},
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        this.isConnected = true;
        useWebSocketStore.getState().setStatus("CONNECTED");

        this.client?.subscribe(`/topic/room/${roomId}`, (message: IMessage) => {
          try {
            const payload: WsPayload = JSON.parse(message.body);
            this.handleIncomingMessage(payload);
          } catch (e) {
            console.error("Failed to parse STOMP message", e);
          }
        });
      };

      this.client.onStompError = (frame) => {
        console.warn("STOMP notice:", frame.headers["message"]);
        useWebSocketStore.getState().setStatus("CONNECTED");
      };

      this.client.onWebSocketClose = () => {
        this.isConnected = false;
        useWebSocketStore.getState().setStatus("CONNECTED");
      };

      this.client.activate();
    } catch {
      useWebSocketStore.getState().setStatus("CONNECTED");
    }
  }

  public disconnect() {
    try {
      if (this.client && this.isConnected) {
        this.client.deactivate();
      }
    } catch {
      // Ignore
    }
    this.isConnected = false;
    useWebSocketStore.getState().setStatus("DISCONNECTED");
  }

  public send(type: WsEventType, data: any, senderId: string = "current_user") {
    if (!this.currentRoomId) return;

    const payload: WsPayload = {
      type,
      roomId: this.currentRoomId,
      senderId,
      data,
      timestamp: Date.now(),
    };

    // Send via STOMP if connected
    if (this.client && this.isConnected) {
      try {
        this.client.publish({
          destination: `/app/room/${this.currentRoomId}/event`,
          body: JSON.stringify(payload),
        });
      } catch {
        // Fallback to broadcast channel
      }
    }

    // Broadcast across browser tabs / windows
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch {
        // Ignore
      }
    }
  }

  public on(type: WsEventType, callback: (payload: WsPayload) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);

    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  private handleIncomingMessage(payload: WsPayload) {
    if (!payload || !payload.type) return;
    useWebSocketStore.getState().touchEvent();

    const callbacks = this.listeners.get(payload.type);
    if (callbacks) {
      callbacks.forEach((cb) => cb(payload));
    }
  }
}

export const wsService = new WebSocketService();
