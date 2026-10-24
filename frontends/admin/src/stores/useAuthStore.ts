import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import type {LinkGroupObj} from "@/libs/types/admission.types.ts";
import apis from "@/libs/api.ts";


interface IAuthStoreState {
    loggedIn: boolean;
    accessToken: string;
    profile: LoggedInUserObj;
    permissions: string[];
    modified: Date | null

    // useCan(permission)
    permissionFilter(p: LinkGroupObj): boolean

    getAllowedPaths(paths: LinkGroupObj[]): LinkGroupObj[]

    // fills the data and sets loggedIn to true
    login(response: LoginResponseObj): void;

    refresh(): Promise<{ access_token: string, refresh_token: string }>;

    // clears the store
    logout(): Promise<void>;
}

const useAuthStore = create<IAuthStoreState>()(
    persist(
        (set, get) => ({
            loggedIn: false,
            accessToken: "",
            profile: {} as LoggedInUserObj,
            permissions: [],
            modified: null,
            async refresh() {
                try {
                    const result = await apis.auth.post("/auth/refresh")
                    // update tokens

                    set((prev: IAuthStoreState) => ({
                        ...prev,
                        permissions: result.data.user.permissions,
                        accessToken: result.data.access_token,
                        profile: result.data.user,
                        modified: new Date()
                    }))
                    return result.data;
                } catch (error) {
                    throw error;
                }
            },
            getAllowedPaths: (paths: LinkGroupObj[]): LinkGroupObj[] => {
                const {permissions} = get();

                const hasPermission = (required?: string | string[]) => {
                    if (!required) return true; // no restriction
                    if (Array.isArray(required)) {
                        return required.some(p => permissions.includes(p));
                    }
                    return permissions.includes(required);
                };

                const filterPaths = (items: LinkGroupObj[]): LinkGroupObj[] => {
                    return items
                        .map(item => {
                            if (!hasPermission(item.permissions)) return null;

                            let childPaths: LinkGroupObj[] | undefined = undefined;
                            if (item.childPaths) {
                                childPaths = filterPaths(item.childPaths);
                            }

                            return {...item, childPaths};
                        })
                        .filter(Boolean) as LinkGroupObj[];
                };

                return filterPaths(paths);
            },
            permissionFilter(p: LinkGroupObj): boolean {
                const permissions = get().permissions
                const perms = p.permissions
                if (!perms)
                    return true
                if (typeof perms === "string")
                    return permissions.includes(perms)
                else return permissions.some(locPerms => perms.includes(locPerms))
            },
            login: ({user, access_token}) => {
                set({
                    loggedIn: true,
                    accessToken: access_token,
                    profile: user,
                    permissions: user.permissions,
                    modified: new Date(),
                });
            },

            logout: async () => {
                set({
                    loggedIn: false,
                    accessToken: "",
                    profile: {} as LoggedInUserObj,
                    permissions: [],
                });
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => sessionStorage)
        }
    )
);

export default useAuthStore;