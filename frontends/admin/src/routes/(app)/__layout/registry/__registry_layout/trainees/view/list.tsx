import {createFileRoute, redirect, useNavigate} from '@tanstack/react-router'
import {useQuery} from "@tanstack/react-query";
import useTraineeStore from "@/stores/useTraineeStore.ts";
import {useMemo} from "react";
import TraineesTable from "@/components/tables/TraineesTable.tsx";
import {Pagination, Space} from "@mantine/core";
import TraineeFilter from "@/components/components/TraineeFilter.tsx";
import apis from "@/libs/api.ts";
import {useStore} from "zustand";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import useTraineeFilter from "@/hooks/useTraineeFilter.ts";
import EntitySearchInput from "@/components/components/EntitySearchInput.tsx";
import IntakeSelector from "@/components/components/IntakeSelector.tsx";


export const Route = createFileRoute(
    '/(app)/__layout/registry/__registry_layout/trainees/view/list',
)({
    component: RouteComponent,
    validateSearch: (search: Record<string, number | string | undefined>) => {
        return {
            page: search.page ? Number(search.page) : 1,
            intake: search.intake ? (search.intake as string) : undefined,
        } as { page?: number, intake?: string };
    },
    beforeLoad: async (ctx) => {
        try {
            if (useAdmissionStore.getState().intakes.size === 0) {
                await useAdmissionStore.getState().fetchIntakes()
            }
        } catch (error) {
            console.error("Failed to fetch intakes: ", error)
        }

        if (!ctx.search.intake) {
            // check if intakes have been loaded
            const latestIntake = useAdmissionStore.getState().getLatestIntake()
            const targetIntake = (latestIntake && latestIntake.periodYearKey !== 'all')
                ? latestIntake.periodYearKey
                : 'all';
            
            throw redirect({
                to: "/registry/trainees/view/list",
                search: { page: ctx.search.page, intake: targetIntake }
            })
        }
    }
})


function RouteComponent() {
    const {page, intake} = Route.useSearch()

    const {trainees, fetchAllTrainees, lastPageIs, pageSize} = useTraineeStore()
    const navigate = useNavigate()
    const {intakes} = useStore(useAdmissionStore)
    console.log("Intakes: ", [...intakes.values()])

    const fetchTrainees = useQuery({
        queryKey: ['fetch-trainees', page, intake],
        queryFn: async () => await fetchAllTrainees(page ?? 1, intake || 'all'),
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    })
    const {isFiltersOn, ...filtration} = useStore(useTraineeFilter)


    const filterQuery = useQuery({
        queryKey: ['filter-trainees', intake, isFiltersOn, filtration.filters],
        queryFn: async () => {
            return filtration.filterTargetGroup(filtration.filters, intake || "all")
        },
        notifyOnChangeProps: 'all',
        enabled: isFiltersOn,
    })

    const list = useMemo(() => {
        if (isFiltersOn)
            return [...(filtration.list.get(filtration.page)?.values() || [])]
        const frmLocal = trainees.get(page ?? 1)
        if (!frmLocal && fetchTrainees.data && fetchTrainees.data.data)
            return [...(fetchTrainees.data?.data.data ?? [])]
        return [...(trainees.get(page ? page : 1)?.values() ?? [])]
    }, [trainees, page, fetchTrainees.data, filtration.list, filtration.page, isFiltersOn])

    return (
        <div className={" grid auto-rows-max gap-2 bg-white p-2 rounded-lg"}>
            <EntitySearchInput
                placeholder="Search trainees"
                searchParamName="query"
                apiInstance={apis.trainees}
                searchPath="/students/search"
                linkTo="/registry/trainees/view/trainee/$id"
                page={page || 1}
                getIntake={(item) => item.enrollments?.[0]?.intake}
            />
            <IntakeSelector
                intakes={[...intakes.values()]}
                value={intake || "all"}
                onChange={(value) => {
                    return navigate({ to: "/registry/trainees/view/list", search: { page, intake: value } });
                }}
                showAllOption={true}
            />
            <TraineeFilter
                filters={filtration.filters}
                setFilters={filtration.setFilter}
            />
            <TraineesTable
                list={list}
                page={page ?? 1}
                loading={isFiltersOn ? filterQuery.isFetching : fetchTrainees.isFetching}
                pageSize={isFiltersOn ? filtration.pageSize : pageSize}
                retry={isFiltersOn ? filterQuery.refetch : fetchTrainees.refetch}
            />
            <Space h={50}/>
            <div className={"w-full h-[50px] bg-white z-[30] fixed bottom-0 flex items-center"}>
                <Pagination
                    value={isFiltersOn ? filtration.page : page}
                    total={isFiltersOn ? filtration.lastPage : lastPageIs}
                    onChange={val => {
                        if (isFiltersOn)
                            return filtration.flipPage(val)
                        else return navigate({
                            to: "/registry/trainees/view/list",
                            search: {page: val, intake: intake || "all"}
                        })
                    }}
                />
            </div>
        </div>
    )


    // return <ViewTraineeList page={page ?? 1}/>
}
