import {YearPickerInput} from "@mantine/dates";
import {Button, Select} from "@mantine/core";
import {useForm} from "@mantine/form";
import type {EnrollmentObj} from "@/libs/types/app.types.ts";
import {getCurrentTermNumber} from "@/libs/utils.ts";
import {showErr, showSuccess} from "@/utils/notification.util.tsx"
import type {CourseObj} from "@/libs/types/admission.types.ts";
import {type TraineeObj} from "@/libs/types/trainee.types.ts";
import {useMutation} from "@tanstack/react-query";
import apis from "@/libs/api";
import {notifications} from "@mantine/notifications";
import enrollmentSchema, {type CreateModuleInput} from "@/schemas/enrollment.schema.ts";
import React from "react";
import z, {ZodError} from "zod";

interface props {
    enrollmentCourse: CourseObj;
    enrollment: EnrollmentObj<TraineeObj>;
}

export default function EnrollEditModuleForm({enrollmentCourse, enrollment}: props) {
    const enrollModuleForm = useForm<CreateModuleInput>({
        initialValues: {
            moduleNumber: (enrollment ? enrollment.modules.length + 1 : 1).toString(),
            termNumber: getCurrentTermNumber().toString(),
            admissionNumber: enrollment.admissionNumber
        }
    })

    const enrollModule = useMutation({
        mutationKey: ['enroll-module'],
        mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const data = enrollModuleForm.getValues();
            const parsed = z.safeParse(enrollmentSchema.createModuleDtoSchema, data)
            if (!parsed.success) throw parsed.error
            return apis.trainees.post("/modules/enroll", parsed.data)
        },
        onSuccess: (res) => {
            notifications.show(showSuccess(res.data.message || "Module enrolled successfully!"))
        },
        onError: (err) => {
            if (err instanceof ZodError) {
                return enrollModuleForm.setErrors(Object.fromEntries(err.issues.map((i) => [i.path[0], i.message])))
            }
            notifications.show(showErr(err))
        },
    })

    return (
        <form
            onSubmit={enrollModule.mutate}
            className={"flex flex-wrap items-baseline gap-2 rounded-md"}
        >
            <Select
                label={"Module number"}
                placeholder={"Module number"}
                data={[...Array(enrollmentCourse.duration).keys()].map((_, i) => (
                    {label: `Module ${i + 1}`, value: `${i}`}
                ))}
                {...enrollModuleForm.getInputProps('moduleNumber')}
            />
            <Select
                label={"Term Number"}
                placeholder={"1/2/3"}
                data={[
                    {label: "Term 1 (Jan-Apr)", value: '1'},
                    {label: "Term 2 (May-Aug)", value: '2'},
                    {label: "Term 3 (Sep-Dec)", value: '3'},
                ]}
                {...enrollModuleForm.getInputProps('termNumber')}
            />
            <YearPickerInput
                className={'flex-1'}
                label={"Year"}
                placeholder={"Year"}
                defaultDate={new Date()}
                {...enrollModuleForm.getInputProps("year")}
            />
            <Button type={"submit"} loading={enrollModule.isPending} className={"mt-auto"}>
                Enroll
            </Button>
        </form>
    )
}
