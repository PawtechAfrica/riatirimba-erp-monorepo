import {createStore} from "zustand";
import type {CourseObj, DepartmentObj} from "@/libs/types/admission.types.ts";
import {createJSONStorage, persist} from "zustand/middleware";
import apis from "@/libs/api.ts";


interface AcademicStoreState {
    // departments: { [key: number]: DepartmentObj | undefined };
    departments: Record<number, DepartmentObj | undefined>;

    getCourses(): Map<number, CourseObj>;

    addDepartmentWithCourses(depWithCourses: DepartmentObj[]): void

    fetchDepartmentWithCourses(): Promise<DepartmentObj[]>
}

const useAcademicStore = createStore<AcademicStoreState>()(
    persist(
        (set, get) => ({
            departments: {},

            getCourses: () => {
                try {
                    const departments = get().departments;
                    const courses = Object.values(departments).flatMap(dep => dep ? dep.courses : []);
                    return new Map(courses.map(course => [course.id, course]));
                } catch (err) {
                    return new Map();
                }
            },
            addDepartmentWithCourses(departments) {
                try {
                    const map = {...get().departments};
                    departments.forEach(department => map[department.id] = department);
                    set(() => ({departments: map}));
                } catch (err) {
                    console.log("Wsa")
                }
            },
            async fetchDepartmentWithCourses(): Promise<DepartmentObj[]> {
                try {
                    // fetch from db
                    const results = await apis.academic.get("/courses")
                    // save to local store
                    get().addDepartmentWithCourses(results.data)
                    return results.data;
                } catch (err) {
                    return []
                }
            }
        }),
        {
            name: "academic-store",
            storage: createJSONStorage(() => sessionStorage, {
                reviver: (_key, val) => {
                    if (val && Array.isArray(val) && 'type' in val && val.type === 'map') {
                        return new Map(val.map(val => [val.id, val]));
                    }
                    return val;
                },
                replacer: (key, value) => {
                    if (key === 'departments' && value instanceof Map) {
                        const object = [];
                        [...value.values()].forEach(val => object.push(val))
                        return {type: 'map', value};
                    }
                    return value;
                },
            }),
        }
    )
)


export default useAcademicStore;
