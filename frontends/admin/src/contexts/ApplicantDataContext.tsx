import {createContext, type ReactNode, useCallback, useEffect} from "react";
import {useQuery, type UseQueryResult} from "@tanstack/react-query";
import {useStore} from "zustand/react";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import type {ApplicationObj} from "@/libs/types/admission.types.ts";
import {useLocation} from "@tanstack/react-router";

export const ApplicantDataContext = createContext<{
    applicantQuery: null | UseQueryResult<Array<ApplicationObj>, Error>
}>({
    applicantQuery: null,
})

export function ApplicantDataProvider({children}: { children: ReactNode }) {
    const {
        fetchApplicantsByIntake,
        intakePages,
        page,
        intakes,
        fetchIntakes,
        setProp,
        activeIntake
    } = useStore(useAdmissionStore)

    const {pathname} = useLocation()
    const isEnabled = pathname.startsWith('/registry/admission/applications')

    const pageMap: () => ApplicationObj[] | undefined = useCallback(() => {
        if (activeIntake) {
            const pages = intakePages.get(activeIntake)
            if (pages) return [...pages.values()].flatMap(p => [...p.values()])
        }
        return undefined
    }, [intakePages, activeIntake])

    useEffect(() => {
        if (intakes.size < 1 && !activeIntake)
            fetchIntakes().catch()
        if (!activeIntake && intakes.size > 0) {
            const latest = [...intakes.values()].sort((a, b) => {
                if (!b.closes || !a.closes) return -1
                return new Date(b.closes).getTime() - new Date(a.closes).getTime()
            })[0]
            if (latest) setProp({'activeIntake': latest.periodYearKey})
        }
    }, [intakes.size])


    const applicantQuery = useQuery({
        queryKey: ['fetch-applicants', pageMap(), page, activeIntake],
        queryFn: async () => {
            const result = await fetchApplicantsByIntake(Number(page), activeIntake!)
            return result.data
        },
        notifyOnChangeProps: 'all',
        placeholderData: [...pageMap()?.values() ?? []],
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        enabled: isEnabled && !!activeIntake,
    })

    return (
        <ApplicantDataContext.Provider
            value={{applicantQuery: applicantQuery}}
        >
            {children}
        </ApplicantDataContext.Provider>
    )
}