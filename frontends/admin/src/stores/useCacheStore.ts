import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

interface CacheEntry<T = any> {
    value: T;
    expiry: number; // timestamp in ms
}

interface CacheState {
    cache: Record<string, CacheEntry>;
    setItem: (key: string, value: any, ttlSeconds?: number) => void;
    getItem: <T = any>(key: string) => T | null;
    removeItem: (key: string) => void;
    clear: () => void;
}

export const useCacheStore = create<CacheState>()(
    persist(
        (set, get) => ({
            cache: {},
            /**
             * @param key - key to be used as cache key
             * @param value - value to be stored in cache
             * @param ttlSeconds - time to live in seconds. Default is 10 minutes.
             */
            setItem: (key, value, ttlSeconds=600) => {
                const expiry = Date.now() + ttlSeconds * 1000;
                set((state) => ({
                    cache: {
                        ...state.cache,
                        [key]: {value, expiry},
                    },
                }));
            },

            getItem: (key) => {
                const entry = get().cache[key];
                if (!entry) return null;

                if (Date.now() > entry.expiry) {
                    // expired → remove it
                    set((state) => {
                        const newCache = {...state.cache};
                        delete newCache[key];
                        return {cache: newCache};
                    });
                    return null;
                }

                return entry.value;
            },

            removeItem: (key) =>
                set((state) => {
                    const newCache = {...state.cache};
                    delete newCache[key];
                    return {cache: newCache};
                }),

            clear: () => set({cache: {}}),
        }),
        {
            name: "client-cache",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

