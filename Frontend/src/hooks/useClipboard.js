import { useState, useCallback } from "react";

export function useClipboard() {
    const [copied, setCopied] = useState(false);

    const copy = useCallback((text) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, []);

    return { copy, copied };
}