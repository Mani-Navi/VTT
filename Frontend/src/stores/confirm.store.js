import { create } from "zustand";

export const useConfirmStore = create((set) => ({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "تایید",
    cancelText: "انصراف",
    variant: "danger", // 'danger' | 'warning' | 'primary'
    resolver: null,

    openConfirm: ({
                      title = "آیا مطمئن هستید؟",
                      message = "",
                      confirmText = "تایید",
                      cancelText = "انصراف",
                      variant = "danger",
                  }) => {
        return new Promise((resolve) => {
            set({
                isOpen: true,
                title,
                message,
                confirmText,
                cancelText,
                variant,
                resolver: resolve,
            });
        });
    },

    handleConfirm: () => {
        set((state) => {
            if (state.resolver) state.resolver(true);
            return { isOpen: false, resolver: null };
        });
    },

    handleCancel: () => {
        set((state) => {
            if (state.resolver) state.resolver(false);
            return { isOpen: false, resolver: null };
        });
    },
}));

export const confirmModal = (options) =>
    useConfirmStore.getState().openConfirm(options);