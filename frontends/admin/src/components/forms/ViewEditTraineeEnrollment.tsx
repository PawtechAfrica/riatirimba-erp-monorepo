import CourseModulesTable from "@/components/tables/CourseModulesTable.tsx";
import TraineeEnrollmentsTable, {defaultCourse} from "@/components/tables/TraineeEnrollmentsTable.tsx";
import apis from "@/libs/api.ts";
import {type EnrollmentObj} from "@/libs/types/app.types.ts";
import {ModuleStatusEnum, type TraineeObj} from "@/libs/types/trainee.types.ts";
import enrollmentSchema, {type EnrollmentFormInput} from "@/schemas/enrollment.schema.ts";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import {Button, Drawer, Fieldset, ScrollAreaAutosize, Title} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {type DefinedQueryObserverResult, type QueryObserverPlaceholderResult, useMutation} from "@tanstack/react-query";
import {useCallback, useEffect, useMemo, useState} from "react";
import {CgInfo} from "react-icons/cg";
import {FaPencil} from "react-icons/fa6";
import {IoReload} from "react-icons/io5";
import {PiLightningAFill} from "react-icons/pi";
import z from "zod";
import type {CourseObj} from "@/libs/types/admission.types.ts";
import {useStore} from "zustand/react";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import CreateEditTraineeEnrollmentForm from "@/components/forms/CreateEditTraineeEnrollmentForm.tsx";
import {useForm} from "@mantine/form";

const defaultEnrollment: EnrollmentFormInput = {
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
    enrollments: EnrollmentObj<TraineeObj>[];
    refresh: QueryObserverPlaceholderResult<TraineeObj, Error> | DefinedQueryObserverResult<TraineeObj, Error>;
    trainee: TraineeObj;
}

export default function ViewEditTraineeEnrollment({enrollments, refresh, trainee}: props) {
    const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentObj<TraineeObj> | null>(null)
    const {getCourses} = useStore(useAcademicStore)

    const enrollmentForm = useForm<EnrollmentFormInput>({
        initialValues: {...defaultEnrollment},
    })

    useEffect(() => {
        if (selectedEnrollment) {
            const parsed = z.safeParse(enrollmentSchema.enrollmentFormSchema, selectedEnrollment)
            enrollmentForm.setValues(parsed.success ? parsed.data : defaultEnrollment)
        }
    }, [selectedEnrollment])

    const autoEnroll = useMutation({
        mutationKey: ['auto-enroll'],
        mutationFn: async (admissionNumber: string) => {
            return await apis.trainees.post(`/modules/enroll/auto`, {admissionNumber})
        },
        onSuccess: async (res) => {
            notifications.show(showSuccess(res.data.message || "Auto enrolled to module"))
            if (selectedEnrollment) setSelectedEnrollment(prev => ({
                ...prev!,
                modules: [...prev!.modules, res.data.data]
            }))
        },
        onError: (error) => {
            notifications.show(showErr(error))
        }
    })


    const course: (id: number | null) => CourseObj = useCallback((id: number | null) => {
        return id ? getCourses().get(id) || defaultCourse : defaultCourse
    }, [getCourses])

    const currentCourse = useMemo(() => {
        // years = duration/3
        if (selectedEnrollment) {
            const found = course(selectedEnrollment.course)
            // Could be a network problem in fetching the course , so use the applicant's already set yearOfStudy
            if (found.name === "NOT_FOUND" && selectedEnrollment.yearOfStudy !== null)
                found.duration = (selectedEnrollment.yearOfStudy * 3)
            return found
        }
        return defaultCourse
    }, [selectedEnrollment, course])


    const disableEnrolling = useMemo(() => {
        if (!selectedEnrollment) return false;
        // if last module is not complete
        const sortedModules = selectedEnrollment.modules.sort((a, b) => a.moduleNumber - b.moduleNumber)
        const lastModule = sortedModules[sortedModules.length - 1]
        if (!lastModule) return false;
        return lastModule.status !== ModuleStatusEnum.COMPLETED
    }, [selectedEnrollment])

    return (
        <div className={'grid gap-2'}>
            <TraineeEnrollmentsTable
                enrollmentList={enrollments}
                action={(index) => {
                    const enrollment = enrollments[index]
                    if (!enrollment) return notifications.show(showErr(new Error("No enrollment found. Refresh and try again!")))
                    setSelectedEnrollment(enrollment)
                }}
            />
            <Drawer
                size={'xl'}
                transitionProps={{transition: 'fade-left'}}
                scrollAreaComponent={ScrollAreaAutosize}
                overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                classNames={{
                    header: "bg-primary-900 text-white",
                    body: "py-2",
                    content: 'bg-neutral-50',
                    close: "bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-white"
                }} position={'right'}
                opened={selectedEnrollment !== null}
                onClose={() => setSelectedEnrollment(null)}
                title={
                    <span className={"flex items-center gap-2"}>
                        <FaPencil/>
                        <Title
                            order={4}>{selectedEnrollment && selectedEnrollment.id != 0 ? `Edit: ${currentCourse.name} Level ${currentCourse.level}` : "Add new enrollment"}</Title>
                    </span>
                }
            >
                {selectedEnrollment ?
                    <>
                        <Fieldset legend={<span className={"font-bold text-xl"}>Course details</span>}>
                            <CreateEditTraineeEnrollmentForm
                                selected={selectedEnrollment}
                                currentCourse={currentCourse}
                                formControl={enrollmentForm}
                                traineeId={trainee.id}
                                externalRefresh={() => refresh.refetch()}
                            />
                        </Fieldset>
                        <Fieldset
                            className={"grid gap-2"}
                            legend={<span className={"font-bold text-xl"}>Modules</span>}>
                            <CourseModulesTable modules={selectedEnrollment.modules}/>
                            <div className={"flex gap-2 items-center"}>
                                <Button
                                    leftSection={<PiLightningAFill/>}
                                    onClick={() => autoEnroll.mutate(selectedEnrollment.admissionNumber)}
                                    loading={autoEnroll.isPending}
                                    disabled={autoEnroll.isPending || disableEnrolling}
                                >
                                    Enroll {trainee.firstName}
                                </Button>
                            </div>
                        </Fieldset>
                    </>
                    :
                    <div
                        className={"w-full m-auto bg-orange-100 border border-orange-200 p-3 grid gap-2 items-center rounded-lg"}>
                        <span className={"flex gap-2 items-center"}>
                            <CgInfo/>Can't display information at this time. Please refresh and try again!
                        </span>
                        <Button
                            onClick={() => refresh.refetch()}
                            variant={'filled'}
                            loading={refresh.isRefetching}
                            color={'orange.6'}
                            className={'w-max'}
                            leftSection={<IoReload/>}
                        >
                            Retry
                        </Button>
                    </div>}
                {/*</div>*/}
            </Drawer>

            <Button onClick={() => {
                // setList(prev => ([...prev, defaultEnrollment]))
                // setCurrent()
            }} className={'w-max'}>
                Add new enrollment
            </Button>
        </div>
    )
}
