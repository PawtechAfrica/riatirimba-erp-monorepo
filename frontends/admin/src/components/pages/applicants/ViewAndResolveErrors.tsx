import type {AdmissionErrorsRecords} from "@/libs/types/admission.types.ts";
import {Button, Table} from "@mantine/core";
import {useMutation} from "@tanstack/react-query";
import api from "@/libs/api.ts";
import {notifications} from "@mantine/notifications";
import {makeLabel} from "@/libs/utils.ts";
import {showErr, showSuccess} from "@/utils/notification.util.tsx"

interface props {
    errorList: AdmissionErrorsRecords,
    applicantId: string;
    refetch: () => Promise<any>
}

export default function ViewAndResolveErrors({errorList, applicantId, refetch}: props) {

    const {mutate, isPending} = useMutation({
        mutationKey: ['resolve-errors'],
        mutationFn: async (index: number) => {
            return await api.admission.post('/applicants/resolve-error', {
                index, applicantId
            })
        },
        onSuccess: async () => {
            notifications.show(showSuccess("Error resolved!"))
            await refetch()
        },
        onError: error => notifications.show(showErr(error))
    })
    return (
        <div>
            <Table className={'bg-white'}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>No</Table.Th>
                        <Table.Th>Field</Table.Th>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Resolve</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {errorList.errors.map((err, i) => {
                        return (
                            <Table.Tr key={i}>
                                <Table.Td>{i + 1}</Table.Td>
                                <Table.Td>{err.property.split(".").map(p => makeLabel(p)).join(" → ")}</Table.Td>
                                <Table.Td>{err.message}</Table.Td>
                                <Table.Td>
                                    <Button
                                        onClick={() => mutate(i)} disabled={isPending} loading={isPending}
                                        variant={'light'}>
                                        Mark resolved
                                    </Button>
                                </Table.Td>
                            </Table.Tr>
                        )
                    })}
                </Table.Tbody>
            </Table>
        </div>
    )
}