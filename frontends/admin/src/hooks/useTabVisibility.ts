import {useEffect} from "react";

export function useTabVisibility(onVisible: () => void, onHidden?: () => void) {
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                onVisible();
            } else {
                onHidden?.();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [onVisible, onHidden]);
}