import StepFormLayout from "../layout/StepFormLayout";
import {useEffect, useMemo, useState} from "react";
import {Select, Space, TextInput, Title} from "@mantine/core";
import useAcademicStore from "@/stores/useAcademicStore";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import {type EnrollmentObj, ExamBody, StudentTypeEnum} from "@/libs/types.ts";
import {getYearOfStudyList, makeLabel} from "@/libs/functions.ts";
import {useForm} from "@mantine/form";

export default function Step5CourseForm() {
    const academicStore = useStore(useAcademicStore);
    const {admissionData} = useStore(useAdmissionDataStore);
    const [department, setDepartment] = useState<string | null>(null);

    const courseForm = useForm<Partial<EnrollmentObj>>({
        mode: "controlled",
        name: 'enrollment-details',
        validateInputOnBlur: true,
        initialValues: {
            newApplicant: true,
            course: null,
            admissionNumber: null,
            intake: null,
            studentType: null,
            yearOfStudy: "1",
            examiningBody: null
        },
        onValuesChange: (current) => {
            if (current.newApplicant !== null)
                current.newApplicant = (current.newApplicant as unknown as string) == "true";
        }
    })

    useEffect(() => {
        if (admissionData && admissionData.enrollments) {
            // setEnrollment(prev => ({...prev, ...admissionData.enrollments}))
            courseForm.setValues(prev => ({...prev, ...admissionData.enrollments}));
        } else {
            const data = {
                id: undefined,
                course: null,
                intake: null,
                studentType: null,
                admissionNumber: null,
                yearOfStudy: "1",
                newApplicant: true, // default to true
                examiningBody: null,
            }
            courseForm.setInitialValues(data);
        }
    }, [admissionData?.enrollments]);

    const pickedCourse = useMemo(() => {
        // return academicStore.courses().find(c => c.id === enrollment.course)
        return academicStore.courses().find(c => c.id === courseForm.values.course)
        // }, [academicStore, enrollment.course])
    }, [academicStore, courseForm.values.course])

    const intakeList = useMemo(() => {
        return [...academicStore.intakes.values()];
    }, [academicStore.intakes]);

    // const selectChange = (key: string, value: string | number | null | boolean) => {
    //     setEnrollment(prev => ({...prev, [key]: value}));
    // }
    // const textChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setEnrollment(prev => ({...prev, [e.target.name]: e.target.value}));
    // }

    return (
        <StepFormLayout title={"Course Selection"} step={'enrollment'} //proppedData={enrollment}
                        proppedData={courseForm.values}>
            <span className={'grid bg-primary-50 p-2 rounded-md'}>
                <Title order={4}>Filter</Title>
                <Select
                    className={'flex-1'}
                    variant={"default"}
                    clearable={true}
                    label={'Filter courses by department'}
                    placeholder={"Select a department"}
                    data={[...academicStore.departments.values()].map((dept) => ({
                        label: dept.name,
                        value: dept.id?.toString(),
                    }))}
                    searchable
                    value={department?.toString() || null}
                    onChange={(val) => {
                        if (admissionData?.submitted) return;
                        setDepartment(val);
                    }}
                />
            </span>
            <Space h={20}/>
            <Select
                searchable
                clearable
                label="Course"
                placeholder="Select a course"
                data={academicStore.courses(department ?? undefined).map((c) => ({
                    value: c.id?.toString(),
                    label: `${makeLabel(c.name)} - Level ${c.level}`,
                }))}
                {...courseForm.getInputProps('course')}
                value={courseForm.values.course?.toString()}
                // value={enrollment.course?.toString() || null}
                // onChange={val => selectChange('course', val ? Number(val) : null)}
            />
            {/* todo: uncomment */}
            <Select
                {...courseForm.getInputProps('newApplicant')}
                label={"Continuing student/New applicant"}
                placeholder={"Are you a student or a new applicant?"}
                // value={enrollment.newApplicant === null ? null : enrollment.newApplicant ? "1" : "0"}
                // defaultValue={"1"}
                // onChange={val => selectChange('newApplicant', val == null ? null : !!parseInt(val))}
                clearable={false}
                value={courseForm.getValues()?.newApplicant ? "true" : "false"}
                data={[
                    {label: "New applicant ~ I am applying to join the school", value: "true"},
                    {label: "Continuing student ~ I am currently enrolled", value: "false"},
                ]}
            />
            {/*todo: uncomment */}
            <TextInput
                {...courseForm.getInputProps("admissionNumber")}
                display={courseForm.getValues().newApplicant === true ? "none" : "block"}
                label={"Admission number"}
                placeholder={"Your admission number"}
                name={'admissionNumber'}
            />
            <Select
                label={"Year of study"} placeholder={"Your year of study"}
                clearable
                {...courseForm.getInputProps('yearOfStudy')}
                value={courseForm.values.yearOfStudy?.toString()}
                data={pickedCourse
                    ? getYearOfStudyList(pickedCourse).map((year) => ({label: `Year ${year}`, value: year.toString()}))
                    : []
                }/>
            <Select
                display={courseForm.values.newApplicant ? "none" : "block"}
                label={'Examining body'}
                placeholder={'Examining body'}
                {...courseForm.getInputProps('examiningBody')}
                data={[{label: "KNEC", value: ExamBody.KNEC}, {label: "CDACC", value: ExamBody.CDACC}]}
            />
            <Select
                label={`Intake`}
                placeholder="Select an intake"
                data={intakeList
                    .map((intake) => ({
                        value: intake.periodYearKey,
                        label: `${intake.readable} ${intake.status === "open" ? "(Open🎉)" : ""}`,
                    }))}
                clearable={false}
                searchable
                nothingFoundMessage={"No intake available"}
                {...courseForm.getInputProps('intake')}
            />
            <Select
                name={"studentType"}
                label={`Sponsorship`}
                clearable={true}
                {...courseForm.getInputProps('studentType')}
                placeholder={"Select how you will sponsor your education"}
                data={[
                    {
                        label: makeLabel(StudentTypeEnum.KUCCPS__GOVT_SPONSORED),
                        value: StudentTypeEnum.KUCCPS__GOVT_SPONSORED
                    },
                    {label: makeLabel(StudentTypeEnum.PrivateSponsored), value: StudentTypeEnum.PrivateSponsored},
                    {label: makeLabel(StudentTypeEnum.NYS_Sponsored), value: StudentTypeEnum.NYS_Sponsored},
                ]}
            />
        </StepFormLayout>
    );
}
