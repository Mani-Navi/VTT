import { create } from "zustand";

export const useWebSocketStore = create((set) => ({
  status: "DISCONNECTED",
  latency: 20,
  lastEventTime: Date.now(),

  setStatus: (status) => set({ status }),
  setLatency: (latency) => set({ latency }),
  touchEvent: () => set({ lastEventTime: Date.now() }),
}));