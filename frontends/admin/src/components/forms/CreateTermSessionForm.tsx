import {useForm} from "@mantine/form";
import termSessionSchema, {type CreateTermSessionFormInput, SessionPeriod} from "@/schemas/termSession.schema.ts";
import {Button, Select} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import {RiAddLargeFill} from "react-icons/ri";
import {useStore} from "zustand/react";
import useTermSessionStore from "@/stores/useTermSessionStore.ts";
import {useMutation} from "@tanstack/react-query";
import z from "zod";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import {useCallback} from "react";


export default function () {
    const getCurrentDefaultSessionPeriod = useCallback(() => {
        const currentMonth = new Date().getMonth() + 1
        if (currentMonth <= 4) return SessionPeriod.JAN_APR
        if (currentMonth >= 5 && currentMonth <= 8) return SessionPeriod.MAY_AUG
        return SessionPeriod.SEP_DEC
    }, [])

    const form = useForm<CreateTermSessionFormInput>({
        initialValues: {
            period: getCurrentDefaultSessionPeriod(),
            startDate: new Date(),
            endDate: null,
        }
    })

    const {createSession} = useStore(useTermSessionStore)

    const mutate = useMutation({
        mutationKey: ['create-session'],
        mutationFn: async () => {
            const parsed = z.safeParse(termSessionSchema.createTermSessionAPISchema, form.getValues())
            if (!parsed.success) {
                const errors = Object.fromEntries(parsed.error.issues.map(issue => [issue.path[0], issue.message]))
                form.setErrors(errors)
                return
            }
            return createSession(parsed.data)
        },
        onSuccess: (res) => {
            if (!res) return
            notifications.show(showSuccess(res.data.message))
            form.reset()
        },
        onError: error => {
            notifications.show(showErr(error))
        }
    })

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                mutate.mutate()
            }}
            className={"grid gap-2"}
        >
            <Select
                label={"Session period"}
                placeholder={"Session period"}
                data={[
                    {label: "Jan-April", value: SessionPeriod.JAN_APR},
                    {label: "May-Aug", value: SessionPeriod.MAY_AUG},
                    {label: "Sep-Dec", value: SessionPeriod.SEP_DEC},
                ]}
                required
                disabled={mutate.isPending}
                {...form.getInputProps("period")}
            />
            <DatePickerInput
                label={"Start date"}
                placeholder={"Start date"}
                required
                disabled={mutate.isPending}
                {...form.getInputProps("startDate")}
            />
            <DatePickerInput
                label={"Closing date"}
                placeholder={"Closing date"}
                disabled={mutate.isPending}
                {...form.getInputProps("endDate")}
            />
            <Button
                type={"submit"}
                disabled={mutate.isPending}
                loading={mutate.isPending}
                leftSection={<RiAddLargeFill/>}
            >
                Create term session
            </Button>
        </form>
    )
}