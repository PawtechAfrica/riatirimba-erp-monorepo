import {createStore} from "zustand";
import type {CreateTermSessionAPIInput, TermSessionAPI} from "@/schemas/termSession.schema.ts";
import type {AxiosResponse} from "axios";
import apis from "@/libs/api.ts";

interface TermSessionStore {
    sessions: Map<string, TermSessionAPI>

    updateSessionMap(session: TermSessionAPI[]): void;

    sessionsArray(): TermSessionAPI[]

    // @description: Fetches all term sessions from the server
    fetchSessions(): Promise<AxiosResponse<{ message: string, data: TermSessionAPI[] }>>,

    // @description: Creates a new term session on the server
    createSession(session: CreateTermSessionAPIInput): Promise<AxiosResponse<{ message: string, data: TermSessionAPI }>>
}

const useTermSessionStore = createStore<TermSessionStore>()((set, get) => ({
    sessions: new Map(),
    updateSessionMap: (sessions) => {
        const mapCopy = new Map(get().sessions)
        sessions.forEach((session) => {
            mapCopy.set(session.id, session)
        })
        set({sessions: mapCopy})
    },
    sessionsArray: () => Array.from(get().sessions.values()),

    fetchSessions: async () => {
        const result = await apis.trainees<{ message: string, data: TermSessionAPI[] }>("/sessions")
        get().updateSessionMap(result.data.data)
        return result
    },
    createSession: async (session) => {
        const result = await apis.trainees.post<{ message: string, data: TermSessionAPI }>("/sessions/create", session)
        get().updateSessionMap([result.data.data])
        return result
    }
}))

export default useTermSessionStore;
