import { Client } from "@stomp/stompjs";
import { useWebSocketStore } from "../store/websocket.store.js";

class WebSocketService {
  constructor() {
    this.client = null;
    this.broadcastChannel = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.currentRoomId = null;

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.broadcastChannel = new BroadcastChannel("persian_vtt_room_sync");
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };
      } catch (e) {
        console.warn("BroadcastChannel not supported", e);
      }
    }
  }

  connect(roomId, token) {
    this.currentRoomId = roomId;
    const authToken = token || localStorage.getItem("vtt_jwt");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:8080/ws`;

    try {
      this.client = new Client({
        brokerURL: host.startsWith("ws") ? host : `${protocol}//${host.replace(/^https?:\/\//, "")}`,
        connectHeaders: authToken
            ? {
              Authorization: `Bearer ${authToken}`,
              roomId: roomId,
            }
            : { roomId: roomId },
        reconnectDelay: 4000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: () => {},
      });

      this.client.onConnect = () => {
        this.isConnected = true;
        useWebSocketStore.getState().setStatus("CONNECTED");

        // ۱. سابسکرایب به کانال اصلی رویدادهای اتاق
        this.client.subscribe(`/topic/room/${roomId}`, (message) => {
          try {
            const payload = JSON.parse(message.body);
            this.handleIncomingMessage(payload);
          } catch (e) {
            console.error("STOMP parse error:", e);
          }
        });

        // ۲. سابسکرایب به کانال کاربران آنلاین
        this.client.subscribe(`/topic/room/${roomId}/users`, (message) => {
          try {
            const users = JSON.parse(message.body);
            this.trigger("USERS_UPDATE", { users });
          } catch (e) {
            console.error("Users parse error:", e);
          }
        });

        // ۳. سابسکرایب به تنظیمات اتاق
        this.client.subscribe(`/topic/room/${roomId}/settings`, (message) => {
          try {
            const settings = JSON.parse(message.body);
            this.trigger("SETTINGS_UPDATE", settings);
          } catch (e) {
            console.error("Settings parse error:", e);
          }
        });
      };

      this.client.onWebSocketClose = () => {
        this.isConnected = false;
        useWebSocketStore.getState().setStatus("DISCONNECTED");
      };

      this.client.onStompError = (frame) => {
        console.warn("STOMP Error:", frame.headers["message"]);
      };

      this.client.activate();
    } catch (err) {
      console.error("WS activation error:", err);
    }
  }

  disconnect() {
    if (this.client && this.isConnected) {
      this.client.deactivate();
    }
    this.isConnected = false;
    useWebSocketStore.getState().setStatus("DISCONNECTED");
  }

  // ارسال دقیق پیام به اندپوینت مربوطه در اسپرینگ بوت
  send(type, data) {
    if (!this.currentRoomId) return;

    let destination = `/app/room/${this.currentRoomId}/event`;
    let action = "UPDATE";

    switch (type) {
      case "TOKEN_MOVE":
        destination = `/app/room/${this.currentRoomId}/token/move`;
        action = "MOVE";
        break;
      case "DRAWING_ADD":
        destination = `/app/room/${this.currentRoomId}/drawing`;
        action = "ADD";
        break;
      case "FOG_UPDATE":
        destination = `/app/room/${this.currentRoomId}/fog`;
        action = "UPDATE";
        break;
      case "DICE_ROLL":
        destination = `/app/room/${this.currentRoomId}/dice`;
        action = "ROLL";
        break;
      case "SETTINGS_UPDATE":
        destination = `/app/room/${this.currentRoomId}/settings`;
        action = "UPDATE";
        break;
    }

    const socketEvent = {
      roomId: this.currentRoomId,
      action: action,
      data: data,
    };

    if (this.client && this.isConnected) {
      try {
        this.client.publish({
          destination: destination,
          body: JSON.stringify(socketEvent),
        });
      } catch (err) {
        console.warn("STOMP publish failed, using BroadcastChannel", err);
      }
    }

    // پخش محلی بین تب‌ها
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type, data });
    }
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);

    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  trigger(type, data) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  handleIncomingMessage(payload) {
    if (!payload) return;
    useWebSocketStore.getState().touchEvent();

    // هندل SocketEvent ارسالی از سرور
    if (payload.action && payload.data) {
      if (payload.data.tokenId !== undefined) {
        this.trigger("TOKEN_MOVE", payload);
      } else if (payload.data.tool !== undefined) {
        this.trigger("DRAWING_ADD", payload);
      } else if (payload.data.formula !== undefined) {
        this.trigger("DICE_ROLL", payload);
      }
    }

    if (payload.type) {
      this.trigger(payload.type, payload.data);
    }
  }
}

export const wsService = new WebSocketService();