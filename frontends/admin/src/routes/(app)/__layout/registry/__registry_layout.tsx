import {createFileRoute, Outlet} from '@tanstack/react-router'
import {useStore} from "zustand/react";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import {useQuery} from "@tanstack/react-query";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import {ApplicantDataProvider} from "@/contexts/ApplicantDataContext.tsx";

export const Route = createFileRoute(
    '/(app)/__layout/registry/__registry_layout',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const {fetchDepartmentWithCourses, departments} = useStore(useAcademicStore)
    const {intakePages} = useStore(useAdmissionStore)

    // fetch courses and departments
    useQuery({
        queryKey: ['fetch-courses', 'fetch-departments', departments, intakePages.size],
        queryFn: async () => {
            try{
                return await fetchDepartmentWithCourses()
            } catch(error){
                return []
            }
        },
        placeholderData: Object.keys(departments).map(key => departments[Number(key)]).filter(dep => dep !== undefined),
        staleTime: (query) => {
            const data = query.state.data;
            const test = !data || data.length < 1 || data.length !== Object.values(departments).length;
            return test ? 0 : 7 * 24 * 60 * 60 * 1000;
        },
        networkMode: "offlineFirst",
    })

    return (
        <ApplicantDataProvider>
            <Outlet/>
        </ApplicantDataProvider>
    )
}
