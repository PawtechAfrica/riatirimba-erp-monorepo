import type {CourseModuleDTO} from "@/libs/types/app.types.ts";
import {ActionIcon, Badge, Table} from "@mantine/core";
import dayjs from "dayjs";
import {CgInfo} from "react-icons/cg";
import {BsUnlock} from "react-icons/bs";
import {ModuleStatusEnum} from "@/libs/types/trainee.types.ts";


interface props {
    modules: CourseModuleDTO[]
}

export default function CourseModulesTable({modules}: props) {

    return (
        modules.length === 0
            ? (
                <div className={"flex items-center gap-2 bg-accent-100 border border-accent-200 p-4 rounded-lg"}>
                    <CgInfo/> <span>No modules enrolled</span>
                </div>)
            :
            <Table striped={true}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Module No</Table.Th>
                        <Table.Th>Term</Table.Th>
                        <Table.Th>Academic Year</Table.Th>
                        <Table.Th>Started</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Complete</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {modules.map(mod => (
                        <Table.Tr key={mod.id}>
                            <Table.Td>{mod.moduleNumber}</Table.Td>
                            <Table.Td>{mod.termNumber}</Table.Td>
                            <Table.Td>{mod.academicYear}</Table.Td>
                            <Table.Td>{dayjs(mod.createdAt).format("DD MMM")}</Table.Td>
                            <Table.Td>
                                <Badge variant={'light'} color={
                                                             mod.status === ModuleStatusEnum.COMPLETED ? "orange" : "secondary"
                                                         }>{mod.status}</Badge></Table.Td>
                            <Table.Td>
                                <ActionIcon variant={'light'}>
                                    <BsUnlock/>
                                </ActionIcon>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
    )
}

