import {Button, Checkbox, Select, TextInput} from "@mantine/core";
import {useForm, type UseFormReturnType} from "@mantine/form";
import enrollmentSchema, {type EnrollmentFormInput} from "@/schemas/enrollment.schema.ts";
import {useStore} from "zustand/react";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import {type CourseObj, TraineeTypeEnum} from "@/libs/types/admission.types.ts";
import {type EnrollmentObj, ExamBody} from "@/libs/types/app.types.ts";
import type {TraineeObj} from "@/libs/types/trainee.types.ts";
import {GrSend} from "react-icons/gr";
import {useMutation} from "@tanstack/react-query";
import {useState} from "react";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import useEnrollmentStore from "@/stores/useEnrollmentStore.ts";
import z from "zod";

export const defaultEnrollment: EnrollmentFormInput = {
    admissionNumber: null,
    course: null,
    createdAt: new Date(),
    id: 0,
    intake: null,
    newApplicant: null,
    studentType: null,
    examiningBody: null,
    yearOfStudy: "1",
    modules: []
}

interface props {
    currentCourse: CourseObj;
    formControl?: UseFormReturnType<EnrollmentFormInput>;
    traineeId: string;
    selected: EnrollmentObj<TraineeObj> | null;
    externalRefresh?: () => void;
}

export default function CreateEditTraineeEnrollmentForm({
                                                            selected,
                                                            traineeId,
                                                            currentCourse,
                                                            formControl,
                                                            externalRefresh
                                                        }: props) {
    const {intakes} = useStore(useAdmissionStore)

    const enrollmentForm = formControl || useForm<EnrollmentFormInput>({
        initialValues: {...defaultEnrollment},
    })
    const {updateEnrollment} = useStore(useEnrollmentStore)
    const [autoAdmissionNumber, setAutoAdmissionNumber] = useState(false)

    const mutate = useMutation({
        mutationKey: ['alter-enrollment'],
        mutationFn: async (data: EnrollmentFormInput) => {
            const parsedData = z.safeParse(enrollmentSchema.updateEnrollmentDTOSchema, data)
            if (!parsedData.success) {
                // throw new Error("Validation error")
                parsedData.error.issues.forEach(issue => enrollmentForm.setFieldError(issue.path[0] as any, issue.message))
                throw new Error("Validation error!")
            }
            return updateEnrollment(traineeId, selected?.id!.toString()!, autoAdmissionNumber, parsedData.data)
        },
        onSuccess: (res) => {
            notifications.show(showSuccess(res.data.message))
            enrollmentForm.resetDirty()
            if (externalRefresh) externalRefresh()
        },
        onError: err => {
            notifications.show(showErr(err))
        }
    })

    return (
        <form
            className={"grid gap-2"}
            onSubmit={
                enrollmentForm.onSubmit(val => mutate.mutate(val))
            }
        >
            <div className={"grid md:grid-cols-2 lg:grid-cols-3 gap-2 p-2 "}>
                <TextInput
                    label={"Admission number"} placeholder={"Admission number"}
                    variant={'filled'}
                    {...enrollmentForm.getInputProps('admissionNumber')}
                />
                <Select
                    variant={'filled'}
                    searchable
                    label={"Intake"} placeholder={"Intake admitted"}
                    data={[...intakes.values()].map(intk => ({
                        label: intk.readable,
                        value: intk.periodYearKey
                    }))}
                    {...enrollmentForm.getInputProps('intake')}
                />
                <Select
                    searchable
                    variant={'filled'}
                    label={"Sponsor"}
                    placeholder={"KUCCPS/PSS/NYS"}
                    data={[
                        {label: "KUCCPS", value: TraineeTypeEnum.KUCCPS__GOVT_SPONSORED},
                        {label: "NYS", value: TraineeTypeEnum.NYS_Sponsored},
                        {label: "Private sponsored", value: TraineeTypeEnum.PrivateSponsored}
                    ]}
                    {...enrollmentForm.getInputProps('studentType')}
                />
                <Select
                    searchable
                    variant={'filled'}
                    label={"Existing/New applicant"}
                    placeholder={"Applicant type"}
                    data={[
                        {label: "New applicant", value: "true"},
                        {label: "Existing applicant", value: "false"}
                    ]}
                    {...enrollmentForm.getInputProps('newApplicant')}
                />
                <Select
                    searchable
                    variant={'filled'}
                    label={"Examining body"}
                    placeholder={"Examining body"}
                    data={[{label: "CDACC", value: ExamBody.CDACC}, {
                        label: "KNEC",
                        value: ExamBody.KNEC
                    }]}
                    {...enrollmentForm.getInputProps('examiningBody')}
                />
                <Select
                    // readOnly
                    label={"Year of study"}
                    placeholder={"Year of study"}
                    // value={enrollmentForm.getValues().yearOfStudy}
                    variant={'filled'}
                    data={[...Array(Math.ceil(currentCourse.duration / 3)).keys()].map((_, i) => {
                        return {label: `Year ${i + 1}`, value: `${i + 1}`}
                    })}
                    {...enrollmentForm.getInputProps('yearOfStudy')}
                />
            </div>
            <div className={"grid gap-3"}>
                <Checkbox
                    label={"Auto-assign admission number"}
                    checked={autoAdmissionNumber}
                    onChange={() => setAutoAdmissionNumber(!autoAdmissionNumber)}
                />
                <Button
                    type={'submit'}
                    className={'w-max'}
                    leftSection={<GrSend/>}
                    loading={mutate.isPending}
                    disabled={mutate.isPending || !enrollmentForm.isDirty()}
                >
                    {selected ? "Update" : "Save"}
                </Button>
            </div>
        </form>
    )
}