import { Client } from "@stomp/stompjs";
import { useWebSocketStore } from "../store/websocket.store.js";

class WebSocketService {
  constructor() {
    this.client = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.currentRoomId = null;

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.sendPresenceLeave();
      });
    }
  }

  connect(roomId, token) {
    if (this.isConnected && this.currentRoomId === roomId) {
      return;
    }

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
        reconnectDelay: 3000,
        heartbeatIncoming: 20000,
        heartbeatOutgoing: 20000,
        debug: () => {},
      });

      this.client.onConnect = () => {
        this.isConnected = true;
        useWebSocketStore.getState().setStatus("CONNECTED");

        try {
          this.client.subscribe(`/topic/room/${roomId}`, (message) => {
            try {
              const payload = JSON.parse(message.body);
              this.handleIncomingMessage(payload);
            } catch (e) {
              console.error("STOMP parse error:", e);
            }
          });

          this.client.subscribe(`/topic/room/${roomId}/users`, (message) => {
            try {
              const onlineMembers = JSON.parse(message.body);
              this.trigger("USERS_UPDATE", onlineMembers);
            } catch (e) {
              console.error("Users parse error:", e);
            }
          });

          this.client.subscribe(`/topic/room/${roomId}/settings`, (message) => {
            try {
              const settings = JSON.parse(message.body);
              this.trigger("SETTINGS_UPDATE", settings);
            } catch (e) {
              console.error("Settings parse error:", e);
            }
          });

          this.sendPresenceJoin();
        } catch (subErr) {
          console.warn("STOMP subscribe error:", subErr);
        }
      };

      this.client.onWebSocketClose = () => {
        this.isConnected = false;
        useWebSocketStore.getState().setStatus("DISCONNECTED");
      };

      this.client.onStompError = (frame) => {
        console.warn("STOMP Error:", frame.headers ? frame.headers["message"] : "Unknown");
      };

      this.client.activate();
    } catch (err) {
      console.error("WS activation error:", err);
    }
  }

  sendPresenceJoin() {
    if (this.client && this.isConnected && this.currentRoomId) {
      this.client.publish({
        destination: `/app/room/${this.currentRoomId}/presence/join`,
        body: JSON.stringify({}),
      });
    }
  }

  sendPresenceLeave() {
    if (this.client && this.isConnected && this.currentRoomId) {
      try {
        this.client.publish({
          destination: `/app/room/${this.currentRoomId}/presence/leave`,
          body: JSON.stringify({}),
        });
      } catch (ignored) {}
    }
  }

  disconnect() {
    this.sendPresenceLeave();
    if (this.client && this.isConnected) {
      this.client.deactivate();
    }
    this.isConnected = false;
    useWebSocketStore.getState().setStatus("DISCONNECTED");
  }

  send(type, data) {
    if (!this.currentRoomId || !this.client || !this.isConnected) return;

    let destination = `/app/room/${this.currentRoomId}/event`;
    let action = type;

    switch (type) {
      case "TOKEN_MOVE":
        destination = `/app/room/${this.currentRoomId}/token/move`;
        action = "MOVE";
        break;
      case "CONDITION_POOL_UPDATE":
        destination = `/app/room/${this.currentRoomId}/conditions`;
        action = "CONDITION_POOL_UPDATE";
        break;
      case "ROLE_TITLE_UPDATE":
        destination = `/app/room/${this.currentRoomId}/role-title`;
        action = "ROLE_TITLE_UPDATE";
        break;
      case "DRAWING_ADD":
      case "DRAWING_UPDATE":
        destination = `/app/room/${this.currentRoomId}/drawing`;
        action = "ADD";
        break;
      case "DRAWING_DELETE":
      case "DRAWING_REMOVE":
        destination = `/app/room/${this.currentRoomId}/drawing/delete`;
        action = "DELETE";
        break;
      case "DRAWING_LIVE":
      case "DRAWING_LIVE_END":
        destination = `/app/room/${this.currentRoomId}/event`;
        action = type;
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
      default:
        action = type;
        break;
    }

    const socketEvent = {
      roomId: this.currentRoomId,
      action: action,
      data: data,
    };

    try {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(socketEvent),
      });
    } catch (err) {
      console.warn("STOMP publish failed", err);
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

    const action = payload.action;
    const eventData = payload.data !== undefined ? payload.data : payload;

    this.trigger("MESSAGE", payload);

    if (action === "ADD" || action === "DRAWING_ADD") {
      this.trigger("DRAWING_ADD", eventData);
    } else if (action === "DELETE" || action === "DRAWING_DELETE" || action === "DRAWING_REMOVE") {
      this.trigger("DRAWING_DELETE", eventData);
    } else if (action === "DRAWING_LIVE") {
      this.trigger("DRAWING_LIVE", eventData);
    } else if (action === "DRAWING_LIVE_END") {
      this.trigger("DRAWING_LIVE_END", eventData);
    } else if (action === "MOVE" || action === "TOKEN_MOVE") {
      this.trigger("TOKEN_MOVE", eventData);
    } else if (action === "ROLE_TITLE_UPDATE") {
      this.trigger("ROLE_TITLE_UPDATE", eventData);
    } else if (action === "CONDITION_POOL_UPDATE") {
      this.trigger("CONDITION_POOL_UPDATE", eventData);
    } else if (action === "ROLL" || action === "DICE_ROLL") {
      this.trigger("DICE_ROLL", eventData);
    } else if (action === "FOG_UPDATE" || (action === "UPDATE" && eventData && eventData.isCover !== undefined)) {
      this.trigger("FOG_UPDATE", eventData);
    } else if (action) {
      this.trigger(action, eventData);
    }
  }
}

export const wsService = new WebSocketService();