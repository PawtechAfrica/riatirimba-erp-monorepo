import {create} from "zustand";
import apis from "@/libs/api.ts";
import type {AxiosResponse} from "axios";
import {CreateTraineeDTO, type FetchTraineesResponse, type TraineeObj} from "@/libs/types/trainee.types.ts";
import config from "@/libs/config.ts";


interface FilterObj {
    [key: string]: string | number | boolean | null;

    term: string,
    department: number | null,
    course: number | null,
    intake: number | null,
    set: boolean
}

type AtLeastOne<T, Keys extends keyof T = keyof T> =
    Keys extends keyof T
        ? { [K in Keys]-?: Required<Pick<T, K>> & Partial<T> }[Keys]
        : never;

export interface TraineesStoreObj {
    // trainees stored in Pages
    page: number;
    pageSize: number
    lastPageIs: number
    filters: FilterObj

    setFilters(value: AtLeastOne<FilterObj>): void

    // get pageSize(): number;
    //
    // set pageSize(size: number);

    trainees: MapPage<number, Map<string, TraineeObj>>
    addTrainees: (trainees: TraineeObj[], page?: number) => void
    fetchAllTrainees: (page: number, intake: string | 'all') => Promise<FetchTraineesResponse>
    fetchTraineeById: (trainee_id: string, page?: number) => Promise<TraineeObj>

    createTrainee(trainee: any): Promise<{ message: string, data: TraineeObj }>

    updateTrainee(trainee: Partial<CreateTraineeDTO>, page?: number, id?: string): Promise<{
        message: string,
        data: TraineeObj
    }>

    deleteTrainee(trainee_id: string, page?: number): Promise<{ message: string }>;

    setPageMetaData: (metadata: { page?: number, pageSize?: number, lastPageIs?: number }) => void

}

// Todo: test this
const useTraineeStore = create<TraineesStoreObj>((set, get) => ({
    page: 1,
    pageSize: config.TRAINEES_FETCH_SIZE, // default
    lastPageIs: 1,
    setPageMetaData(metadata) {
        set(prev => ({...prev, ...metadata}))
    },

    async updateTrainee(trainee, page = 1, id) {
        try {
            const response = await apis.trainees.post(`/students/update/${id}`, trainee) as AxiosResponse<{
                message: string,
                data: TraineeObj
            }>
            // save locally
            get().addTrainees([response.data.data], page)
            return response.data;
        } catch (err) {
            throw err
        }
    },
    async deleteTrainee(id, page = 1) {
        try {
            const result = await apis.trainees.delete(`/students/${id}`)
            // delete locally
            const pageTrainees = get().trainees.get(page)
            if (pageTrainees && pageTrainees.has(id)) {
                pageTrainees.delete(id)
            }
            return result.data
        } catch (err) {
            throw err
        }
    },
    async createTrainee(trainee: any) {
        try {
            const result = await apis.trainees.post("/students/new", trainee)
            get().addTrainees([result.data.data])
            return result.data as { message: string, data: TraineeObj };
        } catch (err) {
            throw err;
        }
    },
    filters: {term: "", course: null, department: null, intake: null, set: false},
    setFilters(value) {
        // @ts-ignore
        set(prev => ({...prev, filters: {...prev.filters, ...value}}))
    },
    trainees: new Map(),
    async fetchTraineeById(trainee_id, page = 1) {
        try {
            const result = await apis.trainees.get(`/students/${trainee_id}`)
            // add
            get().addTrainees([result.data], page)
            return result.data as TraineeObj
        } catch (err) {
            throw err
        }
    },
    addTrainees(trainees, page = 1) {
        // get a particular page or edit if it doesn't exist
        const pages = new Map(get().trainees) satisfies Map<number, Map<string, TraineeObj>>

        pages.set(page, new Map(trainees.map(trainee => [trainee.id, trainee])))

        set(prev => ({...prev, trainees: pages}))
    },
    async fetchAllTrainees(page: number = 1, intake = "all") {
        try {
            // const results = await apis.admission.get(`/trainees`, {
            const results = await apis.trainees.get(`/students/all`, {
                params: {
                    intake: intake,
                    page: page,
                    count: get().pageSize,
                },
            }) as FetchTraineesResponse

            // add to local store
            get().addTrainees(results.data.data, page)
            // set last page number
            set(prev => ({...prev, lastPageIs: results.data.lastPageIs}))
            return results;
        } catch (err) {
            throw err
        }
    }
}))


export default useTraineeStore;
