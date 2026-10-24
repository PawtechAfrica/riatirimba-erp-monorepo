import * as v from "@/libs/types/voucher.types.ts";
import {Badge, Button, Menu, Skeleton, Space, Table} from "@mantine/core";
import {IoMdMenu, IoMdTrash} from "react-icons/io";
import dayjs from "dayjs";
import {useNavigate} from "@tanstack/react-router";
import {MdDownload, MdPrint} from "react-icons/md";
import {useStore} from "zustand";
import useVoucherStore from "@/stores/useVoucherStore.ts";
import {useState} from "react";
import {RxCross2} from "react-icons/rx";
import {FaPencil} from "react-icons/fa6";
import {useConfirmAction} from "@/hooks/useConfirmAction.ts";

interface props {
    vouchers: Partial<v.VoucherSummary>[];
    loading?: boolean;
}

export default function VoucherTable({vouchers, loading}: props) {
    const navigate = useNavigate()
    const {printVoucher, deleteVoucher, downloadVoucher} = useStore(useVoucherStore)

    const [open, setOpen] = useState<number | null>(null)
    const deletionConfirm = useConfirmAction();

    return (
        <div className={"h-max"}>
            <Table striped className={'bg-white'}>
                <Table.Thead className={'bg-primary-600 text-white'}>
                    <Table.Tr>
                        <Table.Th>No.</Table.Th>
                        <Table.Th>Voucher No.</Table.Th>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Payee</Table.Th>
                        <Table.Th>Amount</Table.Th>
                        {/*<Table.Th>Cheque/Cash</Table.Th>*/}
                        <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {loading && (
                        <>
                            {[...Array.from({length: 5})].map((_, i) => (
                                <Table.Tr key={i}>
                                    <Table.Td>
                                        <Skeleton className={'w-full h-[30px]'}/>
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton className={'w-full h-[30px]'}/>
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton className={'w-full h-[30px]'}/>
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton className={'w-full h-[30px]'}/>
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton className={'w-full h-[30px]'}/>
                                    </Table.Td>
                                    <Table.Td>
                                        <Skeleton className={'w-full h-[30px]'}/>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </>
                    )}
                    {vouchers.map((voucher, i) => (
                        <Table.Tr key={voucher.id}>
                            <Table.Td>{i + 1}.</Table.Td>
                            <Table.Td>{voucher?.voucherNo}</Table.Td>
                            <Table.Td>{voucher.date ? dayjs(voucher.date).format("MMM DD YYYY") :
                                <Badge>Unset</Badge>}</Table.Td>
                            <Table.Td>{voucher?.payeeName}</Table.Td>
                            <Table.Td>{voucher?.amountInWords}</Table.Td>
                            {/*<Table.Td>{voucher.payeeAddress}</Table.Td>*/}
                            <Table.Td>
                                <Menu opened={open == i} onChange={opened => setOpen(opened ? i : null)}>
                                    <Menu.Target>
                                        <Button leftSection={open === i ? <RxCross2/> : <IoMdMenu/>}
                                                variant={open === i ? 'filled' : 'transparent'}>Menu</Button>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item
                                            onClick={() => navigate({
                                                to: "/finance/vouchers/edit/single/$id",
                                                params: {id: voucher.id!}
                                            })}
                                            leftSection={<FaPencil/>}
                                        >
                                            Edit
                                        </Menu.Item>
                                        <Menu.Item
                                            onClick={() => downloadVoucher(voucher.id!)}
                                            leftSection={<MdDownload/>}
                                        >
                                            Download
                                        </Menu.Item>
                                        <Menu.Item
                                            onClick={() => printVoucher(voucher.id!)}
                                            leftSection={<MdPrint/>}
                                        >
                                            Print
                                        </Menu.Item>
                                        <Space h={10}/>
                                        <Menu.Divider/>
                                        <Menu.Item
                                            color={'red'}
                                            leftSection={<IoMdTrash/>}
                                            onClick={async () => {
                                                await deletionConfirm({
                                                    question: "Are you sure you want to delete this voucher?",
                                                    acceptFn: () => deleteVoucher(voucher.id!)
                                                })
                                            }}
                                        >
                                            Delete
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            {/*<LoadingOverlay className={"h-[300px]"} h={'100%'} visible={loading}/>*/}
        </div>
    )
}

