import {makeLabel} from "@/libs/utils.ts"
import {Table, Title} from "@mantine/core"

// type AdmissionDataReturnTypes = string | number | boolean | IntakeObj | AcademicHistoryObj | AddressObj | ApplicantDocuments | Partial<NextOfKinObj> | Date | null | undefined

type props = {
    title: string
    keys: string[]
    dataList: Partial<{ [key: string]: any }>[]
}

export default function KeyValueTable({keys, title, dataList}: props) {

    return (
        <div
            className={'flex-1 grid gap-2 break-inside-avoid p-2 border border-slate-200 rounded-lg w-max auto-rows-max'}>
            <Title c={'primary.8'} className={'px-2'} order={5}>{title}</Title>
            <Table className={"w-full max-w-full"}>
                <Table.Thead>
                    <Table.Tr>
                        {dataList.length > 1 ? <Table.Th>No.</Table.Th> : <></>}
                        {keys.map(key => (
                            <Table.Th key={key}>{makeLabel(key)}</Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {dataList.map((data, i) =>
                        <Table.Tr>
                            {dataList.length > 1 ? <Table.Td>{i + 1}</Table.Td> : <></>}
                            {keys.map(key => (
                                <Table.Td
                                    key={key}>{typeof data[key] === 'number' ? data[key] : makeLabel(data[key] ?? "----")}</Table.Td>
                            ))}
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </div>
    )
}
