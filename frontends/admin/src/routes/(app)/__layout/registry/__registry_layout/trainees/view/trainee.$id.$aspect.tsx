import {createFileRoute, useNavigate} from '@tanstack/react-router'
import useTraineeStore from "@/stores/useTraineeStore.ts";
import {useShallow} from "zustand/react/shallow";
import {useQuery} from "@tanstack/react-query";
import FinalPageLayout from "@/components/layouts/FinalPageLayout.tsx";
import {Tabs, Text} from "@mantine/core";
import ViewEditTraineeProfile from "@/components/forms/ViewEditTraineeProfile.tsx";
import ViewEditTraineeAddress from "@/components/forms/ViewEditTraineeAddress.tsx";
import ViewEditNextOfKinList from "@/components/components/ViewEditNextOfKinList.tsx";
import ViewEditTraineeAcademicHistory from "@/components/forms/ViewEditTraineeAcademicHistory.tsx";
import ViewEditTraineeEnrollment from "@/components/forms/ViewEditTraineeEnrollment.tsx";
import ListTraineeDocuments from "@/components/components/ListTraineeDocuments.tsx";
import {TraineeAspect} from "@/libs/types/trainee.types.ts"

export const Route = createFileRoute(
    '/(app)/__layout/registry/__registry_layout/trainees/view/trainee/$id/$aspect',
)({
    component: RouteComponent,
    validateSearch: (search: Record<string, number | string | undefined>) => {
        return {
            page: search.page ? Number(search.page) : 1,
        } as { page?: number };
    },
    params: {
        parse: rawParams => ({
            id: rawParams.id as string,
            aspect: rawParams.aspect as TraineeAspect
        })
    }
})

function RouteComponent() {
    const {id, aspect} = Route.useParams()
    const {page} = Route.useSearch()
    const {trainees, fetchById} = useTraineeStore(useShallow(store => ({
        trainees: store.trainees,
        fetchById: store.fetchTraineeById
    })))

    const navigate = useNavigate()

    const query = useQuery({
        queryKey: ['edit-trainee', id],
        queryFn: async () => await fetchById(id),
        initialData: trainees.get(page ? Number(page) : 1)?.get(id),
        enabled: !trainees.get(page ? Number(page) : 1)?.get(id),
    })

    return (
        <FinalPageLayout to={'/registry/trainees/view/list'}>
            {
                query.data ?
                    <div className={"grid"}>
                        <Tabs
                            keepMounted={true}
                            className={'w-full'}
                            classNames={{list: "h-[50px] font-bold", tab: 'data-[active]:text-primary-600'}}
                            orientation={'horizontal'}
                            value={aspect}
                            onChange={value => navigate({
                                to: "/registry/trainees/view/trainee/$id/$aspect",
                                params: {aspect: value as TraineeAspect, id: id}
                            })}
                            defaultValue={TraineeAspect.PROFILE}
                        >
                            <Tabs.List className={'bg-white'}>
                                <Tabs.Tab value={TraineeAspect.PROFILE}>Profile</Tabs.Tab>
                                <Tabs.Tab value={TraineeAspect.COURSES}>Courses</Tabs.Tab>
                                <Tabs.Tab value={TraineeAspect.DOCUMENTS}>Documents</Tabs.Tab>
                            </Tabs.List>
                            <Tabs.Panel className={'grid gap-5'} value={TraineeAspect.PROFILE}>
                                <ViewEditTraineeProfile traineeObj={query.data} page={page}/>
                                <ViewEditTraineeAddress value={query.data.address} traineeId={id}
                                                        refresh={query.refetch}/>
                                <ViewEditNextOfKinList
                                    list={query.data?.nextOfKins ?? []} refetch={query.refetch}
                                    traineeId={id}/>
                                <ViewEditTraineeAcademicHistory refetch={query.refetch} traineeId={id}
                                                                academicHistory={query.data.academicHistory}/>
                            </Tabs.Panel>
                            <Tabs.Panel value={TraineeAspect.COURSES}>
                                <ViewEditTraineeEnrollment
                                    refresh={query}
                                    enrollments={query.data.enrollments ?? []}
                                    trainee={query.data}
                                />
                            </Tabs.Panel>
                            <Tabs.Panel value={TraineeAspect.DOCUMENTS}>
                                <ListTraineeDocuments documents={query.data?.documents ?? []}/>
                            </Tabs.Panel>
                        </Tabs>
                    </div>
                    :
                    <div className={"w-full h-[50vh] flex items-center justify-around"}>
                        <Text>We could not find the trainee. Please go back and try again! If it persists, contact
                            support</Text>
                    </div>
            }
        </FinalPageLayout>
    )
}
