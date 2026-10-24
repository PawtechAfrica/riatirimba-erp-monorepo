import {createStore} from "zustand";
import apis from "@/libs/api.ts";
import type {SystemUserObj} from "@/libs/types/admission.types.ts";
import type {AxiosResponse} from "axios";

interface UserStoreState {
    users: Map<number, SystemUserObj>

    /**
     * @param users
     * @description - Adds users to the local store
     */
    addUsers(users: SystemUserObj[]): void

    /**
     * @param user - object of CreateUserInputObj
     * @description - Creates a new user and adds them to the database
     */
    createUser(user: CreateSystemUserObj): Promise<SystemUserObj>

    editUser(user: CreateSystemUserObj): Promise<{ message: string }>

    /**
     * @description - Fetches users from the server (Remote database)
     */
    fetchUsers(): Promise<SystemUserObj[]>

    /**
     * @param id
     * @description - Fetches specific user by first checking if they're in the local store then remote db
     */
    fetchUserById(id: number): Promise<SystemUserObj>

}

const useUserStore = createStore<UserStoreState>()((set, get) => ({
    users: new Map(),
    addUsers(users) {
        const newMap = new Map(get().users)
        for (const user of users) {
            newMap.set(user.id, user)
        }
        set(prev => ({...prev, users: newMap}))
    },
    async createUser(user) {
        try {
            // send request
            const result = await apis.auth.post("/api/users", user);
            // add to local db
            get().addUsers([result.data])
            // return response
            return result.data as SystemUserObj;
        } catch (err) {
            throw err
        }
    },
    async editUser({permissions, ...rest}) {
        try {
            const data = {...rest}
            Object.assign(data, {permissionIds: [...permissions.values()]})
            // send update request
            const result = await apis.auth.put(`/api/users/${data?.id}`, data) as AxiosResponse<{ message: string }>;
            return result.data;
        } catch (err) {
            throw err
        }
    },
    async fetchUserById(id) {
        try {
            // check local store first
            const found = get().users.get(id)
            if (found) return found
            // fetch from db
            const result = await apis.auth.get(`/api/users/${id}`)
            // update local db
            get().addUsers([result.data])
            return result.data
        } catch (err) {
            throw err
        }
    },
    async fetchUsers(): Promise<SystemUserObj[]> {
        try {
            // fetch from db
            const result = await apis.auth.get("/api/users")
            // hydrate local db
            get().addUsers(result.data)
            return result.data
        } catch (err) {
            throw err
        }
    }
}))

export default useUserStore