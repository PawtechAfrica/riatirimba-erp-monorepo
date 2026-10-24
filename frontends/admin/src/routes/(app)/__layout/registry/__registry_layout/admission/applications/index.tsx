import PendingLoading from "@/components/screens/PendingLoading.tsx";
import ApplicantsTable from "@/components/tables/ApplicantsTable.tsx";
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import type {ApplicationObj} from "@/libs/types/admission.types.ts";
import {useContext, useMemo} from "react";
import {useStore} from "zustand/react";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import {Button, Pagination, Space} from "@mantine/core";
import {ApplicantDataContext} from "@/contexts/ApplicantDataContext.tsx";
import ExportApplicantsTrainees from "@/components/components/ExportApplicantsTrainees";
import {useQuery} from "@tanstack/react-query";
import apis from "@/libs/api.ts";
import ApplicantFilter from "@/components/components/ApplicantFilter.tsx";
import useApplicantsFilter from "@/hooks/useApplicantsFilter.ts";
import EntitySearchInput from "@/components/components/EntitySearchInput.tsx";
import IntakeSelector from "@/components/components/IntakeSelector.tsx";


export const Route = createFileRoute(
    '/(app)/__layout/registry/__registry_layout/admission/applications/',
)({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            page: 'page' in search ? Number(search.page) || 1 : 1,
        }
    },
    beforeLoad: ({search}) => {
        return {
            page: Number(search.page)
        }
    },
    onEnter: (val) => {
        useAdmissionStore.getState().setPageMeta({page: Number(val.search.page)})
        // set default active intake
    },
    pendingComponent: PendingLoading
})

function RouteComponent() {
    const {page} = Route.useSearch()
    const {intakePages, lastPageIs, activeIntake, pageSize, intakes, setPageMeta, setProp} = useStore(useAdmissionStore)
    const {filters, setFilter, isFiltersOn, list, resetFilter, ...filter} = useStore(useApplicantsFilter)

    const {applicantQuery} = useContext(ApplicantDataContext)

    const applicationList: ApplicationObj[] = useMemo(() => {
        if (isFiltersOn)
            return [...(list.get(filter.page)?.values() || [])]
        const queryList = applicantQuery && applicantQuery.data ? [...applicantQuery.data] : []
        const storeList = intakePages.get(activeIntake ?? "")
        if (!storeList || queryList.length !== storeList.size)
            return queryList
        return [...(storeList.get(Number(page))?.values() || [])]
    }, [isFiltersOn, applicantQuery, intakePages, activeIntake, page, list, filter.page])

    const navigate = useNavigate()

    const filterQuery = useQuery({
        queryKey: ['filter-applications', filters, activeIntake],
        queryFn: async () => {
            return filter.filterTargetGroup(filters, activeIntake || "all")
        },
        notifyOnChangeProps: 'all',
        enabled: isFiltersOn,
    })

    return (
        <div className={"w-full grid gap-2 auto-rows-max shadow bg-white rounded-lg p-4"}>
            <div className={'flex justify-between'}>
                <IntakeSelector
                    intakes={[...intakes.values()]}
                    value={activeIntake}
                    onChange={(value) => {
                        setProp({'activeIntake': value});
                    }}
                    showAllOption={false}
                />
                <EntitySearchInput
                    placeholder="Search applicants"
                    searchParamName="search"
                    apiInstance={apis.admission}
                    searchPath="/applicants/search"
                    linkTo="/registry/admission/applications/$id"
                    page={Number(page)}
                    getIntake={(item) => item.enrollments?.intake}
                />
            </div>
            <ApplicantFilter setFilters={setFilter} filters={filters} query={filterQuery}/>
            <div className={'flex gap-2 justify-between'}>
                <Button variant={'light'} size={'xs'}>
                    Approve all
                </Button>
                <ExportApplicantsTrainees/>

            </div>
            <ApplicantsTable
                page={Number(page)}
                pageSize={pageSize}
                applicants={applicationList}
                loading={applicantQuery?.isLoading || applicantQuery?.isRefetching}
                retry={isFiltersOn
                    ? filterQuery.refetch
                    : applicantQuery
                        ? () => applicantQuery.refetch()
                        : undefined}
            />
            <Space h={70}/>
            <Pagination
                style={{"marginTop": "auto"}}
                onChange={val => {
                    // update store if not in filter mode
                    if (!isFiltersOn) {
                        setPageMeta({page: val})
                        return navigate({
                            to: "/registry/admission/applications",
                            // params: {page: val.toString()}
                            search: {page: val}
                        })
                    } else {
                        filter.flipPage(val)
                    }
                }}
                value={isFiltersOn
                    ? filter.page //filters.page
                    : Number(page)}
                className={'w-full fixed bottom-0 py-3 bg-white'}
                total={isFiltersOn
                    ? filter.lastPage //query.data?.data.lastPageIs || 1
                    : lastPageIs || 1}
                classNames={{root: " bg-primary-500"}}
            />
        </div>
    )
}
