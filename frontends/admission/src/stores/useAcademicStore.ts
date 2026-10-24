import {createStore} from "zustand";
import type {CourseObj, DepartmentObj, IntakeObj} from "@/libs/types.ts";
import apis from "@/libs/axios.ts";
import type {AxiosResponse} from "axios";


interface AcademicStoreState {
    departments: Map<number, DepartmentObj>
    courses: (department?: number | string) => Array<CourseObj>
    intakes: Map<string, IntakeObj>

    addDepartments(departments: DepartmentObj[]): void

    addIntakes(intakes: IntakeObj[]): void

    filterIntakes(filter: { status?: IntakeStatusObj }): IntakeObj[]

    fetchIntakes(): Promise<IntakeObj[]>

    fetchDepartmentWithCourses(): Promise<DepartmentObj[]>
}

const useAcademicStore = createStore<AcademicStoreState>()((set, get) => ({
    departments: new Map(),
    intakes: new Map(),
    courses: (department) => [...get()?.departments.values()].filter(f => department ? f.id == department : true).flatMap(dept => dept.courses) ?? [],
    async fetchDepartmentWithCourses(): Promise<DepartmentObj[]> {
        try {
            const result = await apis.academic.get('/courses')
            // add to local store
            get().addDepartments(result.data)
            return result.data
        } catch (err) {
            throw err;
        }
    },
    async fetchIntakes(): Promise<IntakeObj[]> {
        try {
            const results = await apis.admission.get("/intakes/intakes") as AxiosResponse<IntakeObj[]>
            // add to local store
            get().addIntakes(results.data)
            return results.data
        } catch (e) {
            throw e;
        }
    },
    filterIntakes(filter) {
        const intakes = [...get().intakes.values()]
        return intakes.filter(intake => filter.status ? intake.status === filter.status : false)
    },
    addDepartments(departments) {
        const map = new Map(get().departments)
        for (const department of departments) {
            map.set(department.id, department)
        }
        set(prev => ({...prev, departments: map}))
    },
    addIntakes(intakes) {
        const maps = new Map(get().intakes)
        for (const intake of intakes) {
            maps.set(intake.periodYearKey, intake)
        }
        set(prev => ({...prev, intakes: maps}))
    }
}))

export default useAcademicStore;

