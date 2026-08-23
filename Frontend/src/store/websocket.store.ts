import { create } from "zustand";

export type ConnectionStatus = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR";

interface WebSocketState {
  status: ConnectionStatus;
  latency: number;
  lastEventTime: number | null;
  setStatus: (status: ConnectionStatus) => void;
  setLatency: (latency: number) => void;
  touchEvent: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  status: "CONNECTED",
  latency: 24,
  lastEventTime: Date.now(),

  setStatus: (status) => set({ status }),
  setLatency: (latency) => set({ latency }),
  touchEvent: () => set({ lastEventTime: Date.now() }),
}));
