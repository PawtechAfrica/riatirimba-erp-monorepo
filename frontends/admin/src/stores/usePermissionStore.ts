import {createStore} from "zustand";
import type {PermissionObj} from "@/libs/types/admission.types.ts";
import apis from "@/libs/api.ts";

interface PermissionStoreState {
    fetched: boolean;
    permissionIds: Map<number, PermissionObj>

    addPermissions(permissions: Array<PermissionObj>): void

    fetchPermissions(): Promise<PermissionObj[]>

    createPermission(permission: PermissionObj): Promise<PermissionObj>

    updatePermission(permission: PermissionObj): Promise<PermissionObj>
}

const usePermissionStore = createStore<PermissionStoreState>()(
    (set, get) => ({
        fetched: false,
        permissionIds: new Map(),
        addPermissions(permissions) {
            const newSet = new Map(get().permissionIds)
            permissions.forEach(p => newSet.set(p.id, p))
            set(prev => ({...prev, permissionIds: newSet}))
        },
        async fetchPermissions() {
            try {
                // fetch from server
                const permissions = await apis.auth.get("/api/permissions");
                // hydrate local db
                get().addPermissions(permissions.data)
                // set fetched to true
                set(prev => ({...prev, fetched: true}))
                // return data
                return permissions.data;
            } catch (err) {
                throw err
            }
        },
        async createPermission(permission): Promise<PermissionObj> {
            try {
                // update remote db
                const result = await apis.auth.post("/api/permissions", permission)
                // copy to local db
                get().addPermissions([result.data])
                // return response
                return result.data
            } catch (err) {
                throw err
            }
        },
        async updatePermission(permission): Promise<PermissionObj> {
            try {
                // send patch request
                const result = await apis.auth.patch("/api/permissions", permission)
                // update local copy
                get().addPermissions([result.data])
                // return response
                return result.data
            } catch (err) {
                throw err
            }
        }
    })
)

export default usePermissionStore;