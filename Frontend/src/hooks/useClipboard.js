import { useState, useCallback, useEffect, useRef } from "react";

export function useClipboard() {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const copy = useCallback((text) => {
        if (!text || !navigator.clipboard) return;

        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopied(true);
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
                timerRef.current = setTimeout(() => {
                    setCopied(false);
                }, 2000);
            })
            .catch((err) => {
                if (import.meta.env.DEV) {
                    console.warn("[useClipboard] Copy failed:", err);
                }
            });
    }, []);

    return { copy, copied };
}