import useAdmissionStore from "@/stores/useAdmissionStore";
import { Card, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "zustand";
import IntakeCountdown from "@/components/charts/IntakeCountdown.tsx";
import { useShallow } from "zustand/react/shallow";
import { LiaFemaleSolid, LiaMaleSolid } from "react-icons/lia";
import type { IntakeObj } from "@/libs/types/admission.types.ts";

interface props {
    currentIntake: IntakeObj;
}

export default function IntakeOverview({ currentIntake }: props) {
    const { getStats, intakes } = useStore(useAdmissionStore,
        useShallow(store => ({
            filterApplicants: store.filterApplicants,
            // applicants: store.pages,
            applicants: store.applications,
            intakes: store.intakes,
            fetchIntakeById: store.fetchIntakeById,
            getStats: store.fetchAdmissionStatByIntake
        })))

    const stat = useQuery({
        queryKey: ['applicant-statistic', intakes, currentIntake],
        queryFn: async () => await getStats(currentIntake.periodYearKey),
        notifyOnChangeProps: 'all',
        refetchOnWindowFocus: true,
        refetchOnMount: true
    })

    if (!currentIntake)
        return <>No data</>
    return (
        <div className={"flex-1 grid gap-2"}>
            <Title>Overview</Title>
            <div className={"flex flex-wrap gap-2"}>
                <Card
                    className={'flex-1 min-w-max flex bg-primary-700 text-white items-center justify-center text-left cursor-pointer'}>
                    <Title>{stat.data?.total ?? 0}</Title>
                    <Text>Applicants</Text>
                </Card>
                <Card
                    className={"flex-1 min-w-max flex bg-secondary-700 text-white items-center justify-center text-left cursor-pointer"}>
                    <Title>{((stat.data?.acceptanceRate || 0).toFixed(1))}%</Title>
                    <Text>Acceptance rate</Text>
                </Card>
                <IntakeCountdown intake={currentIntake} />
                <Card
                    shadow={'sm'}
                    className={"flex-1 min-w-max flex bg-white items-center justify-center text-left cursor-pointer"}>
                    <div className={"grid grid-flow-col h-max gap-2"}>
                        <span className={'grid text-center text-accent-700'}>
                            <LiaFemaleSolid size={'5vh'} />
                            <Text size={'xl'} className={'font-bold text-[24px]'}>{stat.data?.applicants?.F}</Text>
                        </span>
                        <div className={'w-[2px] flex-1 h-[100%] bg-primary-800'} />
                        <span className={'grid text-center'}>
                            <LiaMaleSolid size={'5vh'} />
                            <Text size={'xl'} className={'font-bold text-[24px]'}>{stat.data?.applicants?.M}</Text>
                        </span>
                    </div>
                    <Text className={'text-[18px] text-primary-800'}>Gender Distribution</Text>
                </Card>
            </div>
            <div>

            </div>
        </div>
    )
}
