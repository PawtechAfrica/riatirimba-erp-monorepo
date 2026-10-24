import { createFileRoute, useNavigate } from '@tanstack/react-router'
import IntakeOverview from "@/components/components/IntakeOverview.tsx";
import { Button, Select, Title } from "@mantine/core";
import { useStore } from "zustand/react";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import React, { useCallback, useEffect, useState } from "react";
import { type IntakeObjInput, IntakePeriodEnum } from "@/libs/types/admission.types.ts";
import { notifications } from "@mantine/notifications";
import { showErr, showSuccess } from "@/utils/notification.util.tsx";
import { DateInput, YearPickerInput } from "@mantine/dates";
import { useMutation, useQuery } from "@tanstack/react-query";
import FinalPageLayout from "@/components/layouts/FinalPageLayout.tsx";
import { useShallow } from "zustand/react/shallow";
import dayjs from "dayjs";

export const Route = createFileRoute(
    '/(app)/__layout/registry/__registry_layout/admission/intakes/manage',
)({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            intake_key: 'intake_key' in search ? search.intake_key as string : "new",
        }
    }
})

function RouteComponent() {
    const { intake_key } = Route.useSearch()
    const navigate = useNavigate()

    const { intakes, fetchIntakeById, createUpdateIntake } = useStore(useAdmissionStore,
        useShallow(store => ({
            intakes: store.intakes,
            fetchIntakeById: store.fetchIntakeById,
            createUpdateIntake: store.createUpdateIntake,
            openCloseIntake: store.openCloseIntake
        })))
    const isNew = useCallback(() => intake_key === 'new',
        [intake_key])

    const [newIntake, setNewIntake] = useState<IntakeObjInput>({
        period: null,
        periodYearKey: null,
        year: new Date(),
        opens: null,
        closes: null,
        closed: false
    })

    useEffect(() => {
        // auto update periodYearKey when user changes dates
        if (isNew() && newIntake.period && newIntake.year) {
            const periodKey = `${newIntake.period}-${dayjs(newIntake.year).year()}`
            setNewIntake(prev => ({ ...prev, periodYearKey: periodKey }))
        }
    }, [isNew, newIntake?.period, newIntake?.year]);

    const { data, refetch, isSuccess, isPlaceholderData } = useQuery({
        queryKey: ['fetch-one-intake', intakes],
        queryFn: async () => fetchIntakeById(intake_key),
        enabled: !isNew(),
        placeholderData: intakes.get(intake_key),
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    })

    const updateState = useCallback(() => {
        if (data && isSuccess && !isPlaceholderData) {
            const { period, periodYearKey, year, ...rest } = data
            return setNewIntake(prev => ({
                ...prev, ...rest,
                year: dayjs().set('year', year).toDate(),
                opens: rest.opens ? new Date(rest.opens) : null,
                closes: data.closes ? new Date(data.closes) : null,
            }))
        }

        const localData = intakes.get(intake_key)
        if (localData)
            setNewIntake(prev => ({
                ...prev, ...localData,
                year: dayjs().set('year', localData.year).toDate(),
                period: localData['period'],
                opens: localData.opens ? new Date(localData.opens) : null,
                closes: localData.closes ? new Date(localData.closes) : null,
            }))

    }, [data, isSuccess, isPlaceholderData, intakes, intake_key])

    useEffect(() => {
        updateState()
    }, [updateState])

    const { mutate, isPending } = useMutation({
        mutationKey: ['edit-update-intake', isNew()],
        mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            return createUpdateIntake(newIntake, isNew())
        },
        onSuccess: async ({ message, data }) => {
            notifications.show(showSuccess(message))
            setNewIntake(prev => ({ ...prev, ...data, year: dayjs().set('year', data.year).toDate() }))
            if (isNew())
                setTimeout(() => {
                    navigate({ to: "/registry/admission/intakes/manage", search: { intake_key: data.periodYearKey } })
                }, 1500)
            else {
                await refetch()
            }
        },
        onError: error => {
            notifications.show(showErr(error))
        }
    })

    return (
        <FinalPageLayout>
            <div className={'p-2'}>
                <div className={"flex flex-wrap justify-between gap-2"}>
                    {(!isNew() && data) && <IntakeOverview currentIntake={data} />}
                    <form
                        onSubmit={mutate}
                        className={'bg-white h-max p-4 m-auto shadow-md transition-all rounded-lg grid gap-2 min-w-[400px]'}>
                        <Title
                            order={3}>{isNew() ? "Create" : "Manage "} {('readable' in newIntake) ? newIntake.readable as string : " intake"}</Title>
                        {isNew() &&
                            <>
                                <Select
                                    label={"Intake period"}
                                    placeholder={"Intake period"}
                                    required={true}
                                    name={'period'}
                                    value={newIntake.period}
                                    error={intakes.has(newIntake.periodYearKey ?? "") ? "A similar intake exists. Pick a different year or edit intake" : ""}
                                    onChange={val => {
                                        setNewIntake(prev => ({
                                            ...prev, period: val as IntakePeriodEnum | null
                                        }
                                        ))
                                    }}
                                    readOnly={!isNew()}
                                    data={[
                                        { label: "January Intake", value: IntakePeriodEnum.JANUARY_INTAKE },
                                        { label: "May Intake", value: IntakePeriodEnum.MAY_INTAKE },
                                        { label: "September Intake", value: IntakePeriodEnum.SEPTEMBER_INTAKE },
                                    ]}
                                />
                                <YearPickerInput
                                    required={true}
                                    label={"Year"}
                                    placeholder={"Year"}
                                    defaultValue={new Date()}
                                    value={newIntake.year}
                                    onChange={val => setNewIntake(prev => ({ ...prev, year: val }))}
                                />
                            </>
                        }
                        <DateInput
                            label={"Opening date"}
                            placeholder={"Opening date"}
                            value={newIntake.opens}
                            onChange={val => setNewIntake(prev => ({ ...prev, opens: val ? new Date(val) : null }))}
                        />
                        <DateInput
                            label={"Closing date"}
                            placeholder={"Closing date"}
                            value={newIntake.closes}
                            onChange={val => setNewIntake(prev => ({ ...prev, closes: val ? new Date(val) : null }))}
                        />
                        <Button disabled={isPending} loading={isPending} type={'submit'}>
                            Save update
                        </Button>
                    </form>
                </div>
            </div>
        </FinalPageLayout>
    )
}
