import {Badge, Button, Menu, Table} from "@mantine/core";
import termSessionSchema, {type TermSessionAPI} from "@/schemas/termSession.schema.ts";
import z from "zod";
import {CgInfo} from "react-icons/cg";
import {IoReload} from "react-icons/io5";
import type {UseQueryResult} from "@tanstack/react-query";

interface props {
    termSessions: TermSessionAPI[],
    query: UseQueryResult<TermSessionAPI[]>;
}

export default function TermSessionTable({termSessions = [], query}: props) {

    return (
        <div className={"w-full grid gap-2"}>
            <Table variant={'default'} striped classNames={{tbody: "bg-white", thead: 'table-header p-2'}}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Year</Table.Th>
                        <Table.Th>Period</Table.Th>
                        <Table.Th>Started</Table.Th>
                        <Table.Th>Ended</Table.Th>
                        <Table.Th>Enrollments</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Action</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {termSessions.map(session => {
                        const {data, success, error} = z.safeParse(termSessionSchema.termSessionDTOSchema, session)
                        if (!success) {
                            return <>{error.issues.map(i => i.message).join(", ")}</>
                        }
                        return (
                            <Table.Tr key={session.id}>
                                <Table.Td>{data.year}</Table.Td>
                                <Table.Td>{data.period}</Table.Td>
                                <Table.Td>{data.startDate}</Table.Td>
                                <Table.Td>{data.endDate}</Table.Td>
                                <Table.Td>{data.modules?.length || 0}</Table.Td>
                                <Table.Td>
                                    <Badge variant={''}
                                           color={session.endDate ? 'accent.2' : 'secondary'}>{session.endDate ? "Complete" : "Ongoing"}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Menu></Menu>
                                </Table.Td>
                            </Table.Tr>
                        )
                    })}
                </Table.Tbody>
            </Table>
            {termSessions.length < 1 &&
                <div
                    className={'bg-accent-100 p-5 grid gap-2 content-center rounded-lg border border-accent-200 transition-all w-full'}>
                    <div className={"flex items-center gap-2"}>
                        <CgInfo/><span>No term sessions found, try creating one or refreshing</span>
                    </div>
                    <Button
                        // variant={"outline"}
                        hidden={!query.isFetched}
                        loading={query.isRefetching || query.isLoading} className={'w-max'}
                        leftSection={<IoReload/>}
                        color={'orange.5'}
                        onClick={() => query.refetch()}
                    >
                        Refresh
                    </Button>
                </div>}
        </div>
    )
}
