import {createStore} from "zustand";
import {type ApplicationObj} from "@/libs/types/admission.types.ts";
import apis from "@/libs/api.ts";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import type {FilterStoreState, PaginatedResponse} from "@/libs/types/app.types.ts";


// interface ApplicationFilterState {
//     page: number | 1;
//     lastPage: number | 1;
//     pageSize: number | 100;
//     filterMode: boolean;
//     flipPage: (page: number) => void;
//     list: Map<number, Map<string, ApplicationObj>>
//
//     setFilterMode(active?: boolean): void;
//
//     filterApplicants: (filter: ApplicantQueryFilter, intake: string | 'all') => Promise<PaginatedResponse<ApplicationObj>>
// }

export const defaultFilterState = {
    page: 1,
    course: [],
    department: [],
    gender: null,
    migrated: null,
    pending: null,
    submitted: null,
}

const useApplicantsFilter = createStore<FilterStoreState<ApplicationObj>>()(
    (set, get) => ({
        page: 1,
        filters: defaultFilterState,
        isFiltersOn: false,
        setFilter: (field) => {
            const value = {...get().filters, ...field}
            set(prev => ({...prev, isFiltersOn: true, filters: value}))
        },
        resetFilter: () => {
            set(prev => ({...prev, isFiltersOn: false, filters: defaultFilterState}))
        },
        list: new Map(),
        lastPage: 1,
        pageSize: 100,
        flipPage: (page) => set(prev => ({...prev, page})),

        filterTargetGroup: async (filter, intakePeriod) => {
            let cleanedFilter = {...filter}
            Object.entries(cleanedFilter).forEach(([key, value]) => {
                if (value == null) delete cleanedFilter[key]
            })
            // TODO: If department sorting has been fixed in the backend remove this bit
            /**
             * Since departments are not in the admission db, fetch all the courses in the deps and add to the course array
             */
            if (Array.isArray(cleanedFilter.department) && cleanedFilter.department.length > 0) {
                const courseIds = cleanedFilter.department.flatMap(id => useAcademicStore.getState().departments[id]?.courses.map(course => course.id) ?? [])
                cleanedFilter.course = [...cleanedFilter.course || [], ...courseIds]
            }

            const response = await apis.admission.get<PaginatedResponse<ApplicationObj>>(`/applicants/all`, {
                params: {...cleanedFilter, intake: intakePeriod},
                paramsSerializer: {indexes: null}
            })
            // save in local store
            const listMap = new Map(get().list)
            listMap.set(response.data.page, new Map(response.data.data.map(app => [app.id, app])))

            set(prev => ({
                ...prev,
                lastPage: response.data.lastPageIs,
                pageSize: response.data.pageSize,
                list: listMap
            }))
            return response.data
        }
    })
)

export default useApplicantsFilter