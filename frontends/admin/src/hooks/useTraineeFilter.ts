import {createStore} from "zustand";
import type {FilterStoreState} from "@/libs/types/app.types.ts";
import type {PaginatedResponse} from "@/libs/types/app.types.ts";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import apis from "@/libs/api.ts";
import type {TraineeObj, TraineeQueryFilter} from "@/libs/types/trainee.types.ts";

export const defaultTraineeFilterState: TraineeQueryFilter = {
    page: 1,
    course: [],
    department: [],
    gender: null,
    migrated: null,
    pending: null,
    submitted: null,
}

const useTraineesFilter = createStore<FilterStoreState<TraineeObj>>()(
    (set, get) => ({
        page: 1,
        isFiltersOn: false,
        filterMode: () => {
            const {course, department, gender, status} = get().filters
            const value = (course && course.length > 0) || (department && department.length > 0) || (gender && gender.length > 0) || status || gender
            return !!value;
        },
        filters: defaultTraineeFilterState, // todo: come remove this page or something
        setFilter: (field) => {
            const value = {...get().filters, ...field}
            set(prev => ({...prev, filters: value, isFiltersOn: true}))
        },
        resetFilter: () => {
            set(prev => ({...prev, isFiltersOn: false, filters: defaultTraineeFilterState}))
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

            const response = await apis.trainees.get<PaginatedResponse<TraineeObj>>(`/students/filter`, {
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

export default useTraineesFilter