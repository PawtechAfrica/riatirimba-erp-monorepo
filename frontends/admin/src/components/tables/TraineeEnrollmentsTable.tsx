import type {CourseObj} from "@/libs/types/admission.types.ts";
import type {EnrollmentObj} from "@/libs/types/app.types.ts";
import {EnrollmentStatusEnum, type TraineeObj} from "@/libs/types/trainee.types.ts";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import {Badge, Button, Table} from "@mantine/core";
import dayjs from "dayjs";
import {useCallback} from "react";
import {useStore} from "zustand/react";

export const defaultCourse: CourseObj = {code: "", id: 0, name: "NOT_FOUND", level: 0, duration: 1}

interface props {
    enrollmentList: EnrollmentObj<TraineeObj>[];
    action: (index: number) => void;
}

export default function TraineeEnrollmentsTable({enrollmentList, action}: props) {
    const {getCourses} = useStore(useAcademicStore)

    const course = useCallback((id: number | null) => {
        return id ? getCourses().get(id) ?? defaultCourse : defaultCourse
    }, [getCourses])

    const getStatusColor = (status: EnrollmentStatusEnum | null) => {
        switch (status) {
            case EnrollmentStatusEnum.ACTIVE:
                return "orange"
            case EnrollmentStatusEnum.ATTACHMENT:
                return "purple"
            case EnrollmentStatusEnum.GRADUATED:
                return "green"
            case EnrollmentStatusEnum.DROPPED_OUT:
                return "black"
            default:
                return "red"
        }
    }

    return (
        <Table
            striped
            // stripedColor={'gray.1'}
            className={'bg-white'}
            classNames={{tr: "cursor-pointer"}}
        >
            <Table.Thead className={"bg-gradient-to-r from-primary-800 to-secondary-700 text-white "}>
                <Table.Tr>
                    <Table.Th>No.</Table.Th>
                    <Table.Th>Admission No.</Table.Th>
                    <Table.Th>Intake</Table.Th>
                    <Table.Th>Sponsor</Table.Th>
                    <Table.Th>New trainee</Table.Th>
                    <Table.Th>Course</Table.Th>
                    <Table.Th>Level</Table.Th>
                    <Table.Th>Examiner</Table.Th>
                    <Table.Th>Admission Date</Table.Th>
                    <Table.Th>Academic Year</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th></Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {enrollmentList.map((en, i) =>
                    (
                        <Table.Tr
                            onClick={() => action(i)}
                            className={'active:bg-primary-100 hover:bg-primary-50'}
                            key={i}>
                            <Table.Td>{i + 1}</Table.Td>
                            <Table.Td>{en.admissionNumber}</Table.Td>
                            <Table.Td>{en.intake}</Table.Td>
                            <Table.Td>{en.studentType}</Table.Td>
                            <Table.Td>{en.newApplicant ? "New" : "Existing"}</Table.Td>
                            <Table.Td>{course(en.course).name}</Table.Td>
                            <Table.Td>{course(en.course).level}</Table.Td>
                            <Table.Td>{en.examiningBody}</Table.Td>
                            <Table.Td>{dayjs(en.createdAt).format("DD MMM YYYY") ?? "---"}</Table.Td>
                            <Table.Td>Year {en.yearOfStudy}</Table.Td>
                            <Table.Td>
                                <Badge color={getStatusColor(en.status)}>
                                    {en.status}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                <Button onClick={() => action(i)} variant={'subtle'}>
                                    Edit
                                </Button>
                            </Table.Td>
                        </Table.Tr>
                    )
                )}
            </Table.Tbody>
        </Table>
    )
}
