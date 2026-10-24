import type {IntakeObj} from "@/libs/types/admission.types.ts";
import {Card, RingProgress, Text} from "@mantine/core";
import dayjs from "dayjs";
import {useCallback, useMemo} from "react";


interface props {
    intake: IntakeObj
}

export default function IntakeCountdown({intake}: props) {
    const days = useMemo(() => {
        if (intake.status === 'open') {
            const totalDays = intake.closes ? dayjs(intake.closes).diff(intake.opens, 'days') : 0
            const goneDays = dayjs().diff(intake.opens, 'days')
            const remainingDays = totalDays - goneDays
            return {remainingDays, totalDays, goneDays}
        }
        if (intake.status === "upcoming") {
            const daysTo = dayjs(intake.opens).diff(new Date(), 'days')
            const totalDays = dayjs(intake.opens).diff(intake.createdAt, 'days')
            const goneDays = dayjs(intake.createdAt).diff(new Date(), 'days')
            return {daysTo, totalDays, goneDays}
        }
    }, [intake.status, intake.closes, intake.opens, intake.createdAt])

    const ratios = useCallback(() => {

        if (intake.status === 'open' && days && ('goneDays' in days) && ('remainingDays' in days) && ('totalDays' in days)) {
            const {totalDays, goneDays, remainingDays} = days;
            return [
                {value: Math.floor(((remainingDays ?? 0) / totalDays) * 100), color: 'background.0'},
                {value: Math.floor((goneDays / totalDays) * 100), color: 'primary'},
            ]
        } else if (intake.status === 'upcoming' && days?.daysTo && days?.totalDays) {
            const gone = (Math.floor((days.goneDays / days.totalDays) * 100))
            const remaining = Math.floor((days.daysTo / days.totalDays) * 100)
            return [
                {value: gone, color: 'secondary.1'},
                {value: remaining, color: 'secondary'},
            ]
        } else return [
            {value: 50, color: "red.9"},
            {value: 50, color: "red.9"}
        ]
    }, [days, intake.status])

    return (
        <Card
            className={'flex-1 h-max bg-neutral-950 min-w-max transition-all hover:shadow-xl hover:-translate-y-2 text-primary-800'}>
            <RingProgress
                className={'m-auto'}
                size={150}
                roundCaps
                sections={ratios()}
                label={
                    <div className={'grid text-center text-white'}>
                        {intake.status === 'open' ?
                            <>
                                <Text size={'lg'} ta={'center'}>{days?.remainingDays ?? ""} days</Text>
                                <span>remaining</span>
                            </> :
                            intake.status === 'upcoming' ?
                                <>
                                    <Text size={'lg'} ta={'center'}>{days?.daysTo ?? ""} days</Text>
                                    <span>to go</span>
                                </> :
                                <>
                                    <Text size={'lg'} ta={'center'}>Closed</Text>
                                </>

                        }
                    </div>
                }
            />
        </Card>
    )
}
