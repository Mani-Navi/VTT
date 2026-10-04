import { create } from "zustand";

export const useToastStore = create((set) => ({
    toasts: [],

    addToast: ({ title, message, type = "error", duration = 4500 }) => {
        const id = Date.now() + Math.random().toString(36).substring(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { id, title, message, type, duration }],
        }));

        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, duration);
        }
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));

export const toast = {
    error: (message, title = "خطا") =>
        useToastStore.getState().addToast({ title, message, type: "error" }),
    success: (message, title = "موفق") =>
        useToastStore.getState().addToast({ title, message, type: "success" }),
    warning: (message, title = "هشدار") =>
        useToastStore.getState().addToast({ title, message, type: "warning" }),
    info: (message, title = "اطلاعیه") =>
        useToastStore.getState().addToast({ title, message, type: "info" }),
};