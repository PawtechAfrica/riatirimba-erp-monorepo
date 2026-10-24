import {useStore} from "zustand/react";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import {useMemo} from "react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import {Title} from "@mantine/core";
import dayjs from 'dayjs'

export default function OpenIntakeStatusCard() {
    const {intakes} = useStore(useAcademicStore)
    const {admissionData} = useStore(useAdmissionDataStore)

    const data = useMemo(() => {
        // Take input the user has entered or the latest one
        let intake = admissionData?.enrollments?.intake
            ? admissionData.enrollments.intake
            : [...intakes.values()]
                .sort((a, b) => new Date(b.opens || "").getMilliseconds() - new Date(a.opens || "").getMilliseconds())
                .find(i => i.status === "open" || i.status === 'upcoming' || i.status === 'overdue')
        intake = typeof intake === 'string' ? intakes.get(intake) : intake
        if (!intake)
            return null

        const opens = intake.opens ? intake.opens : 0
        const daysTo = opens ? dayjs(intake.opens).diff(new Date(), 'days') : 0
        const closing = !!intake.closes ? intake.closes : 0
        const daysLeft = !!closing ? dayjs(closing).diff(new Date(), 'day') : 0

        return {
            intake,
            daysTo: daysTo > 0 ? daysTo : "",
            daysLeft, //: daysLeft > -1 ? daysLeft == 0 ? "Last day" : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left` : "Closed",
            daysLeftString: daysLeft > -1 ? daysLeft == 0 ? "Last day" : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left` : "Closed"
        }
    }, [admissionData?.enrollments?.intake, intakes])

    if (!data)
        return (
            <div>
                <Title order={5}>No intake selected</Title>
            </div>
        )
    return (
        <div
            className={'p-4 bg-white overflow-clip flex-1 flex flex-col items-start place-items-center place-content-center rounded-lg transition-all hover:shadow-xl hover:-translate-y-1'}
        >
            <Title>{data.daysTo}</Title>
            <Title c={!Number.isNaN(Number(data.daysLeft))
                ? data.daysLeft >= 3 ? 'secondary.7' : "orange" : 'red'
            } order={4}>{data.daysLeftString}</Title>
            <Title c={'primary.6'} order={6}>{data.intake.readable}</Title>
        </div>
    )
}

