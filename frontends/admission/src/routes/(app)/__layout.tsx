import {createFileRoute, Outlet, redirect, useNavigate} from '@tanstack/react-router'
import apis from "@/libs/axios.ts";
import type {ApplicantData} from "@/libs/types.ts";
import {useEffect} from "react";
import {useStore} from "zustand/react";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import Navbar from "@/components/navigation/Navbar.tsx";
import {useQuery} from "@tanstack/react-query";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import useAuthStore from "@/stores/useAuthStore.ts";
import SplashScreen from "@/components/screens/SplashScreen.tsx";
import {Text} from "@mantine/core";
import config from "@/libs/config.ts";

export const Route = createFileRoute('/(app)/__layout')({
    component: RouteComponent,
    beforeLoad: () => {
        if (!useAuthStore.getState().kcpeIndexNumber)
            throw redirect({to: "/auth"})
    },
    pendingComponent: () => <SplashScreen/>,
    // pendingMinMs: 800,
})

function RouteComponent() {
    const {fetchIntakes, fetchDepartmentWithCourses, intakes, departments} = useStore(useAcademicStore)
    const {update, admissionData} = useStore(useAdmissionDataStore)
    const {kcpeIndexNumber, id} = useStore(useAuthStore)
    const navigate = useNavigate();

    const {data, isLoading} = useQuery({
        queryKey: ['data', admissionData],
        queryFn: async (): Promise<Partial<ApplicantData> | {}> => {
            if (id) {
                const results = await apis.admission.get(`/applicants/fetch/${id}`)
                return results.data
            }
            return {}
        },
        refetchOnMount: true,
        refetchOnWindowFocus: true
    })
    useQuery({
        queryKey: ['intakes', 'department', intakes],
        queryFn: async () => {
            return Promise.all([fetchIntakes(), fetchDepartmentWithCourses()])
        },
        enabled: () => intakes.size < 1 || departments.size < 1,
        refetchOnMount: true,
        gcTime: 30 * 60 * 1000,
        retry: true,
        staleTime: 24 * 60 * 60 * 1000
    })

    useEffect(() => {
        if (!isLoading && data) {
            update(data)
        }
    }, [isLoading, data]);

    useEffect(() => {
        if (!kcpeIndexNumber)
            navigate({to: '/auth'}).catch()
    }, [kcpeIndexNumber]);

    return (
        <div>
            <div
                className={'w-full h-max bg-primary-800 overflow-hidden text-white p-1'}>
                <div className={'max-sm:animate-[marquee_10s_linear_infinite] flex justify-between gap-10 '}>
                    <Text className={'text-nowrap'}>General enquiries: {config.contacts.general.join(", ")}</Text>
                    <Text className={'text-nowrap'}>Technical enquiries: {config.contacts.technical.join(", ")}</Text>
                </div>
            </div>
            <Navbar/>
            <Outlet/>
        </div>
    )
}
