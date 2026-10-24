import type {ApplicationObj} from "@/libs/types/admission.types.ts";
import apis from "@/libs/api.ts";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import useTraineeStore from "@/stores/useTraineeStore.ts";
import {useQuery} from "@tanstack/react-query";
import type {AxiosResponse} from "axios";
import {useCallback, useMemo, useState} from "react";
import {useStore} from "zustand";
import type {TraineeObj} from "@/libs/types/trainee.types.ts";
import type {PaginatedResponse} from "@/libs/types/app.types.ts";

export type FilterObj = {
    [key: string]: number | string | null | undefined;
    term: string;
    newApplicant?: "1" | "0" | null;
    course: number | null;
    department: number | null;
    intake: string | null;
}

interface props {
    isTrainee: boolean;
    url: string;
    enabled: boolean
}

export const useSearchEngine = <T extends TraineeObj | ApplicationObj>({isTrainee, url, enabled}: props) => {

    const [filters, setFilters] = useState<FilterObj>({
        term: "",
        course: null,
        department: null,
        intake: null,
    })
    const traineeStore = useTraineeStore()
    const admissionStore = useStore(useAdmissionStore)
    const {getCourses} = useStore(useAcademicStore)

    const applyFilters = useCallback((target: T) => {
        const enrollment = Array.isArray(target.enrollments) ? target.enrollments[0] : target.enrollments;
        const targetIntake = enrollment;
        // const targetCourse = target.course ? getCourses().get(target.course)?.id : null;
        const targetCourse = enrollment?.course ? getCourses().get(enrollment.course)?.id : null;

        if (filters.term && (!JSON.stringify(target)?.toLocaleLowerCase().includes(filters.term?.toLowerCase())))
            return false;
        // if (filters.newApplicant && 'newApplicant' in target && target.newApplicant !== filters.newApplicant)
        if (filters.newApplicant && (!!enrollment?.newApplicant) !== (!!filters.newApplicant))
            return false;
        if (filters.course && (!targetCourse || targetCourse.toString() !== filters.course.toString()))
            return false;
        if (filters.department && 'department' in target && target.department?.toString() !== filters.department.toString())
            return false;
        if (filters.intake && targetIntake?.toString() !== filters.intake.toString())
            return false;
        return target
    }, [filters])

    const store = isTrainee ? traineeStore : admissionStore;

    const list: PaginatedResponse<T> = useMemo(() => {
        function flattenMap<T>(map: MapPage<number, Map<string, T>>): T[] {
            return Array.from(map.values()).flatMap(val => Array.from(val.values()))
        }

        // try to find results in the local store
        const list = (isTrainee ? flattenMap(traineeStore.trainees) : [...admissionStore.applications.values()].map(app => app.data)).filter(f => applyFilters(f as T)) as T[]

        return {
            page: store.page,
            pageSize: store.pageSize,
            lastPageIs: store.lastPageIs,
            data: list
        } satisfies PaginatedResponse<T>
    }, [traineeStore.trainees, admissionStore.intakePages.size, isTrainee])

    const [filterData, setFilterData] = useState<{
        page: number;
        pageSize: number;
        lastPageIs: number;
        data: Array<T>[];
    } | null>(null);

    const [searchPage, setSearchPage] = useState<number>(1);

    const query = useQuery({
        queryKey: ['search-and-filter', searchPage, enabled],
        queryFn: async () => {
            const apiInstance = isTrainee ? apis.trainees : apis.admission;
            const response = await apiInstance.get(url, {
                params: {...filters, count: store.pageSize, page: searchPage},
            }) as AxiosResponse<PaginatedResponse<T>>;

            let currentDataList = [...filterData?.data ?? []]
            currentDataList[response?.data.page ?? 0] = response.data.data;
            setFilterData({
                page: searchPage,//response.data.page,
                pageSize: response.data.pageSize,
                lastPageIs: response.data.lastPageIs,
                data: currentDataList
            });
            return response.data;
        },
        notifyOnChangeProps: 'all',
        refetchOnWindowFocus: true,
        initialData: list,
        placeholderData: list,
        enabled: enabled,
        retryDelay: 1000 * 3, // 3 seconds
    })
    // useEffect(() => {
    //     query.refetch()
    //         .catch()
    // }, []);

    return {
        filters,
        setFilters,
        filterData,
        setFilterData,
        searchPage,
        setSearchPage,
        query,
    }

}
