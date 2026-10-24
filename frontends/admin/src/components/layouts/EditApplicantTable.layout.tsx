import {Button, Table, Title} from "@mantine/core";
import React from "react";
import type {UseMutationResult} from "@tanstack/react-query";
import type {FormSteps} from "@/routes/(app)/__layout/registry/__registry_layout/admission/applications/$id.tsx";
import type {AxiosResponse} from "axios";

interface props {
    legend: string;
    titles: string[];
    children: React.ReactNode[];
    updateFn: UseMutationResult<AxiosResponse<any, any>, Error, FormSteps, unknown>;
    step: FormSteps
}

export default function EditApplicantTableLayout({legend, titles, children, updateFn, step}: props) {

    return (
        <div className={'bg-white py-5 max-w-full'}>
            <Title className={'px-3'} order={5}>{legend}</Title>
            <Table className={'bg-white'}>
                <Table.Thead>
                    <Table.Tr>
                        {titles.map((title, i) => (<Table.Th key={i}>{title}</Table.Th>))}
                        <Table.Th className={'text-center'}>
                            Action
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <Table.Tr>
                        {children.map((child, i) => (
                            <Table.Td key={i}>{child}</Table.Td>
                        ))}
                        <Table.Td className={' flex justify-end'}>
                            <Button
                                variant={'white'}
                                onClick={() => updateFn.mutate(step)}
                                disabled={updateFn.isPending}
                                className={'ml-full'}
                            >
                                Update
                            </Button>
                        </Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        </div>
    )
}

