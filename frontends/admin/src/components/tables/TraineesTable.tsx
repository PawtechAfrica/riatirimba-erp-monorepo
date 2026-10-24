import type {TraineeObj} from "@/libs/types/trainee.types.ts";
import {TraineeAspect} from "@/libs/types/trainee.types.ts";
import {Button, Table} from "@mantine/core";
import {useNavigate} from "@tanstack/react-router";
import {MdArrowRightAlt} from "react-icons/md";
import {useStore} from "zustand/react";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import EmptyOrLoadingList from "@/components/screens/EmptyOrLoadingList.tsx";
import {useCallback} from "react";
import type {EnrollmentObj} from "@/libs/types/app.types.ts";

interface props {
    list: TraineeObj[],
    pageSize: number
    page: number,
    loading?: boolean
    retry?: () => any;
}


export default function TraineesTable({list, page, loading, pageSize, retry}: props) {
    // just watching out
    const {getCourses} = useStore(useAcademicStore)


    const course = (id: number) =>
        getCourses().get(id) ?? {name: "----", level: "----"}

    const activeEnrollment = useCallback((enrollments: EnrollmentObj<TraineeObj>[]) => {
        const found = enrollments.sort((a, b) => (
            b.createdAt ? new Date(b.createdAt).getTime() : new Date().getTime()) - (a.createdAt ? new Date(a.createdAt).getTime() : new Date().getTime()));
        return found[0] as EnrollmentObj<TraineeObj> | undefined;
    }, [])

    const navigate = useNavigate()

    const viewTrainee = async (traineeId: string) => {
        await navigate({
            to: "/registry/trainees/view/trainee/$id/$aspect",
            params: {id: traineeId, aspect: TraineeAspect.PROFILE},
        })
    }

    return (
        <div>
            <Table striped stripedColor={'gray.1'}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Td>No.</Table.Td>
                        <Table.Th>Admission No.</Table.Th>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Phone</Table.Th>
                        <Table.Th>Course</Table.Th>
                        <Table.Th>Level</Table.Th>
                        <Table.Th>Action</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {list.map((trainee, i) => {
                        const enrollment = trainee.enrollments ? activeEnrollment(trainee.enrollments) : undefined
                        return <Table.Tr key={trainee.id}>
                            <Table.Td>{(i + 1) + pageSize * (page - 1)}</Table.Td>
                            <Table.Td>{enrollment?.admissionNumber}</Table.Td>
                            <Table.Td>{trainee.firstName + " " + trainee.lastName}</Table.Td>
                            <Table.Td>{trainee.email}</Table.Td>
                            <Table.Td>{trainee.phone}</Table.Td>
                            <Table.Td>{enrollment && enrollment?.course ? course(enrollment.course)?.name ?? "" : ""}</Table.Td>
                            <Table.Td>{enrollment && enrollment?.course ? course(enrollment.course)?.level ?? "" : ""}</Table.Td>
                            <Table.Td>
                                {/*<Link*/}
                                {/*    to={"/registry/trainees/view/trainee/$id"}*/}
                                {/*    // search={{page: Number(page), trainee: trainee.id}}>*/}
                                {/*    // search={{page: Number(page)}}*/}
                                {/*    params={{id: trainee.id}}*/}
                                {/*    replace={true}*/}
                                {/*>*/}
                                <Button onClick={() => viewTrainee(trainee.id)} rightSection={<MdArrowRightAlt/>}
                                        variant={'subtle'}>
                                    View
                                </Button>
                                {/*</Link>*/}
                            </Table.Td>
                        </Table.Tr>
                    })}
                </Table.Tbody>
            </Table>
            {list.length < 1 &&
                <EmptyOrLoadingList
                    retry={retry} loading={!!loading} message={"No trainees found"}/>
            }
        </div>
    )
}

