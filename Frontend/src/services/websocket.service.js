import { Client } from "@stomp/stompjs";
import { useWebSocketStore } from "../store/websocket.store.js";
import { WS_EVENTS } from "../constants/wsEvents.js";
import { ENV } from "../config/validateEnv";

class WebSocketService {
  constructor() {
    this.client = null;
    this.listeners = new Map();
    this.subscriptions = [];
    this.isConnected = false;
    this.currentRoomId = null;

    if (typeof window !== "undefined") {
      window.addEventListener("pagehide", () => {
        this.sendPresenceLeave();
      });
    }
  }

  connect(roomId, token) {
    if (!roomId) return;

    if (this.isConnected && this.currentRoomId === roomId) {
      return;
    }

    // اگر کلاینت قبلی هنوز باز است، فوراً قطع و تخلیه شود
    if (this.client) {
      try {
        this.clearSubscriptions();
        this.client.deactivate();
      } catch (ignored) {}
      this.client = null;
    }

    this.currentRoomId = roomId;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = ENV.WS_URL || `${protocol}//${window.location.hostname}:8080/ws`;

    try {
      this.clearSubscriptions();

      this.client = new Client({
        brokerURL: host.startsWith("ws") ? host : `${protocol}//${host.replace(/^https?:\/\//, "")}`,
        reconnectDelay: 2000,
        heartbeatIncoming: 20000,
        heartbeatOutgoing: 20000,
        beforeConnect: () => {
          const freshToken = localStorage.getItem("vtt_jwt") || token;
          this.client.connectHeaders = freshToken
              ? {
                Authorization: `Bearer ${freshToken}`,
                roomId: this.currentRoomId,
              }
              : { roomId: this.currentRoomId };
        },
        debug: () => {},
      });

      this.client.onConnect = () => {
        this.isConnected = true;
        useWebSocketStore.getState().setStatus("CONNECTED");

        try {
          const subRoom = this.client.subscribe(`/topic/room/${roomId}`, (message) => {
            try {
              const payload = JSON.parse(message.body);
              this.handleIncomingMessage(payload);
            } catch (e) {
              if (import.meta.env.DEV) console.error("STOMP parse error:", e);
            }
          });

          const subUsers = this.client.subscribe(`/topic/room/${roomId}/users`, (message) => {
            try {
              const onlineMembers = JSON.parse(message.body);
              this.trigger("USERS_UPDATE", onlineMembers);
            } catch (e) {
              if (import.meta.env.DEV) console.error("Users parse error:", e);
            }
          });

          const subSettings = this.client.subscribe(`/topic/room/${roomId}/settings`, (message) => {
            try {
              const settings = JSON.parse(message.body);
              this.trigger("SETTINGS_UPDATE", settings);
            } catch (e) {
              if (import.meta.env.DEV) console.error("Settings parse error:", e);
            }
          });

          this.subscriptions.push(subRoom, subUsers, subSettings);
          this.sendPresenceJoin();
        } catch (subErr) {
          if (import.meta.env.DEV) console.warn("STOMP subscribe error:", subErr);
        }
      };

      this.client.onWebSocketClose = () => {
        this.isConnected = false;
        useWebSocketStore.getState().setStatus("DISCONNECTED");
      };

      this.client.onStompError = (frame) => {
        if (import.meta.env.DEV) {
          console.warn("STOMP Error:", frame.headers ? frame.headers["message"] : "Unknown");
        }
      };

      this.client.activate();
    } catch (err) {
      if (import.meta.env.DEV) console.error("WS activation error:", err);
    }
  }

  clearSubscriptions() {
    this.subscriptions.forEach((sub) => {
      try {
        sub.unsubscribe();
      } catch (ignored) {}
    });
    this.subscriptions = [];
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
    this.clearSubscriptions();
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (ignored) {}
      this.client = null;
    }
    this.isConnected = false;
    this.currentRoomId = null;
    useWebSocketStore.getState().setStatus("DISCONNECTED");
  }

  send(type, data) {
    if (!this.currentRoomId || !this.client || !this.isConnected) return;

    let destination = `/app/room/${this.currentRoomId}/event`;
    let action = type;

    switch (type) {
      case WS_EVENTS.TOKEN_MOVED:
      case "TOKEN_MOVE":
        destination = `/app/room/${this.currentRoomId}/token/move`;
        action = "MOVE";
        break;
      case "CONDITION_POOL_UPDATE":
        destination = `/app/room/${this.currentRoomId}/conditions`;
        action = "CONDITION_POOL_UPDATE";
        break;
      case WS_EVENTS.ROLE_TITLE_UPDATE:
      case "ROLE_TITLE_UPDATE":
        destination = `/app/room/${this.currentRoomId}/role-title`;
        action = "ROLE_TITLE_UPDATE";
        break;
      case WS_EVENTS.DRAWING_ADDED:
      case "DRAWING_ADD":
      case "DRAWING_UPDATE":
        destination = `/app/room/${this.currentRoomId}/drawing`;
        action = "ADD";
        break;
      case WS_EVENTS.DRAWING_DELETED:
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
      case WS_EVENTS.FOG_UPDATED:
      case "FOG_UPDATE":
      case "FOG_CLEAR":
        destination = `/app/room/${this.currentRoomId}/fog`;
        action = type;
        break;
      case "FOG_LIVE":
      case "FOG_LIVE_END":
        destination = `/app/room/${this.currentRoomId}/event`;
        action = type;
        break;
      case "DICE_ROLL":
        destination = `/app/room/${this.currentRoomId}/dice`;
        action = "ROLL";
        break;
      case WS_EVENTS.SETTINGS_UPDATED:
      case "SETTINGS_UPDATE":
        destination = `/app/room/${this.currentRoomId}/settings`;
        action = "UPDATE";
        break;
      case WS_EVENTS.VIEWPORT_SYNC:
      case "VIEWPORT_SYNC":
        destination = `/app/room/${this.currentRoomId}/event`;
        action = "VIEWPORT_SYNC";
        break;
      case "FOG_GLOBAL_REVEAL":
        destination = `/app/room/${this.currentRoomId}/fog/global-reveal`;
        action = "FOG_GLOBAL_REVEAL";
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
      if (import.meta.env.DEV) console.warn("STOMP publish failed", err);
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

    switch (action) {
      case "ADD":
      case "DRAWING_ADD":
      case "DRAWING_ADDED":
        this.trigger("DRAWING_ADD", eventData);
        this.trigger("DRAWING_ADDED", eventData);
        this.trigger(WS_EVENTS.DRAWING_ADDED, eventData);
        break;
      case "DELETE":
      case "DRAWING_DELETE":
      case "DRAWING_DELETED":
      case "DRAWING_REMOVE":
        this.trigger("DRAWING_DELETE", eventData);
        this.trigger("DRAWING_DELETED", eventData);
        this.trigger(WS_EVENTS.DRAWING_DELETED, eventData);
        break;
      case "DRAWING_LIVE":
        this.trigger("DRAWING_LIVE", eventData);
        break;
      case "DRAWING_LIVE_END":
        this.trigger("DRAWING_LIVE_END", eventData);
        break;
      case "MOVE":
      case "TOKEN_MOVE":
      case "TOKEN_MOVED":
        this.trigger("TOKEN_MOVE", eventData);
        this.trigger("TOKEN_MOVED", eventData);
        this.trigger(WS_EVENTS.TOKEN_MOVED, eventData);
        break;
      case "ROLE_TITLE_UPDATE":
        this.trigger("ROLE_TITLE_UPDATE", eventData);
        this.trigger(WS_EVENTS.ROLE_TITLE_UPDATE, eventData);
        break;
      case "CONDITION_POOL_UPDATE":
        this.trigger("CONDITION_POOL_UPDATE", eventData);
        break;
      case "ROLL":
      case "DICE_ROLL":
        this.trigger("DICE_ROLL", eventData);
        break;
      case "VIEWPORT_SYNC":
        this.trigger("VIEWPORT_SYNC", eventData);
        this.trigger(WS_EVENTS.VIEWPORT_SYNC, eventData);
        break;
      case "FOG_UPDATE":
      case "FOG_UPDATED":
        this.trigger("FOG_UPDATE", eventData);
        this.trigger("FOG_UPDATED", eventData);
        this.trigger(WS_EVENTS.FOG_UPDATED, eventData);
        break;
      case "UPDATE":
        if (eventData?.isCover !== undefined || eventData?.points !== undefined) {
          this.trigger("FOG_UPDATE", eventData);
          this.trigger("FOG_UPDATED", eventData);
        }
        break;
      case "FOG_CLEAR":
        this.trigger("FOG_CLEAR", eventData);
        this.trigger(WS_EVENTS.DRAWINGS_CLEARED, eventData);
        break;
      case "FOG_LIVE":
        this.trigger("FOG_LIVE", eventData);
        break;
      case "FOG_LIVE_END":
        this.trigger("FOG_LIVE_END", eventData);
        break;
      case "SCENE_CHANGE":
      case "SCENE_ACTIVATED":
        this.trigger("SCENE_CHANGE", eventData);
        this.trigger("SCENE_ACTIVATED", eventData);
        this.trigger(WS_EVENTS.SCENE_ACTIVATED, eventData);
        break;
      case "SCENE_UPDATE":
      case "SCENE_UPDATED":
        this.trigger("SCENE_UPDATE", eventData);
        this.trigger("SCENE_UPDATED", eventData);
        this.trigger(WS_EVENTS.SCENE_UPDATED, eventData);
        break;
      case "SCENE_CREATE":
      case "SCENE_CREATED":
        this.trigger("SCENE_CREATE", eventData);
        this.trigger("SCENE_CREATED", eventData);
        break;
      case "SCENE_DELETE":
        this.trigger("SCENE_DELETE", eventData);
        break;
      case "SCENE_RENAME":
        this.trigger("SCENE_RENAME", eventData);
        break;
      default:
        if (action) {
          this.trigger(action, eventData);
        }
        break;
    }
  }
}

export const wsService = new WebSocketService();