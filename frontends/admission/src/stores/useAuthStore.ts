import {createStore} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

interface AuthStoreObj {
    kcpeIndexNumber: string | null;
    name: string | null;
    id: string | null;

    login(kcseIndexNumber: string, id: string, name: string): void;

    logout(): void;
}

const useAuthStore = createStore<AuthStoreObj>()(
    persist(
        (set, _get) => ({
            kcpeIndexNumber: null,
            name: null,
            id: null,
            login(kcseIndexNumber, id, name) {
                set({kcpeIndexNumber: kcseIndexNumber, id, name})
            },
            logout() {
                set({kcpeIndexNumber: null, name: null})
            }
        }),
        {
            name: "admission-auth-store",
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)

export default useAuthStore;


