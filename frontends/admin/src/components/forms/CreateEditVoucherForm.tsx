import type {
    CreateVoucherRequest,
    UpdateVoucherRequest,
    VoucherObj,
    VoucherPaymentMethod,
    VoucherVoteHeadItem
} from "@/libs/types/voucher.types.ts";
import {downloadBlob, printDialogue} from "@/libs/utils.ts";
import {showErr, showSuccess} from "@/utils/notification.util.tsx"
import useAuthStore from "@/stores/useAuthStore";
import useVoucherStore from "@/stores/useVoucherStore.ts";
import {
    ActionIcon,
    Button,
    Fieldset,
    NumberInput,
    Select,
    Space,
    Table,
    Textarea,
    TextInput,
    Title
} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import {useForm} from "@mantine/form";
import {notifications} from "@mantine/notifications";
import {useMutation, useQuery} from "@tanstack/react-query";
import {useNavigate} from "@tanstack/react-router";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import {BiSave} from "react-icons/bi";
import {IoMdCalendar, IoMdTrash} from "react-icons/io";
import {MdAdd, MdCancel, MdCreate, MdDownload, MdPrint} from "react-icons/md";
import {useStore} from "zustand";
import {FaPencil} from "react-icons/fa6";
import {toWords} from "to-words/en-GB";
import {useConfirmAction} from "@/hooks/useConfirmAction.ts";


export const defaultVoteheadLineItem: VoucherVoteHeadItem = {
    date: dayjs().toISOString(),
    expenditureVoteHead: "",
    kshs: 0,
    cts: 0,
}

export const defaultVoucher: Partial<VoucherObj> = {
    amountInWords: "",
    createdAt: "",
    pdfGenerated: false,
    // voucherNo: "",
    chequeNo: "",
    lineItems: [{
        date: dayjs().toISOString(),
        kshs: 0,
        cts: 0,
        particulars: ""
    }],
    paymentMethod: null,
    paymentDetails: "",
    accountName: "",
    approvedBy: "",
    approvedDate: null,
    authorizedByPrincipal: null,
    authorizedDate: null,
    date: dayjs().toISOString(),
    payeeAddress: "",
    payeeName: "",
    preparedBy: "",
    preparedDate: dayjs().toISOString(),
    receivedCashOrCheque: "",
    receivedDate: null,
    receivedSum: "",
    receiverIdNo: "",
    receiverSignature: undefined,
    voteheadItems: [],
    budget: 0,
    votehead: null,
    amountSpent: null,
}

interface props {
    id: 'new' | number
}


export default function CreateEditVoucherForm({id}: props) {
    const form = useForm<Partial<VoucherObj>>({
        initialValues: {...defaultVoucher},
        onValuesChange: ((values, previous) => {
            const sum: number = values.lineItems?.reduce((acc, curr) => acc + Number(curr.kshs), 0) || 0
            values.amountInWords = toWords(sum)
            // if payment method changed
            if (previous.paymentMethod !== values.paymentMethod) {
                // reset the payment details if values.paymentMethod changes
                values.paymentDetails = ""
            }
            // if payment method is cash autopopulate paymentDetails
            if (values.paymentMethod === 'CASH') values.paymentDetails = sum
        })
    })

    const confirmDeletion = useConfirmAction();

    const {
        vouchers,
        fetchSpecificVoucher,
        createVoucher,
        updateVoucher,
        deleteVoucher,
        getVoucherPdf
    } = useStore(useVoucherStore)

    const fetchVoucher = useQuery({
        enabled: false,
        queryFn: async () => {
            if (id === 'new') throw new Error(
                "Save the voucher first before editing it"
            )
            return fetchSpecificVoucher(id)
        },
        queryKey: ['voucher', id],
    })
    const {profile} = useAuthStore()

    useEffect(() => {
        // autopopulate
        if (id !== 'new') {
            // check locally
            let found = vouchers.get(id);
            if (found) return form.setValues(found)
            fetchVoucher.refetch()
                .then(result => {
                    if (result.data) form.setValues(result.data)
                })
        } else {
            form.reset()
            form.setFieldValue('preparedBy', profile.name)
            form.setFieldValue('preparedDate', dayjs().format('YYYY-MM-DD'))
            if (profile.role === 'finance') form.setFieldValue('approvedBy', profile.name)

        }
    }, [id, profile?.name]);

    const navigate = useNavigate()

    const createVoucherMutation = useMutation({
        mutationKey: ['create-voucher'],
        mutationFn: async () => {
            return await createVoucher(form.getValues() as CreateVoucherRequest)
        },
        onSuccess: async (result) => {
            notifications.show(showSuccess("Voucher created successfully"))
            // set path param to result.id
            await navigate({to: "/finance/vouchers/edit/single/$id", params: {id: result.id}})
        },
        onError: err => {
            console.log("You caught me...")
            notifications.show(showErr(err))
        }
    })

    const updateVoucherMutation = useMutation({
        mutationKey: ['update-voucher'],
        mutationFn: async ({data, auto = false}: { data: UpdateVoucherRequest, auto?: boolean }) => {
            if (id === 'new') return {}
            const result = await updateVoucher(id, data)
            return {result, auto}
        },
        onSuccess: ({result, auto}) => {
            if (!result) return
            form.setValues(result)
            if (!auto) return notifications.show(showSuccess("Voucher updated successfully"))
            notifications.show(showSuccess("Voucher auto-saved", "Autosaved!"))
        },
        onError: (err) => {
            notifications.show(showErr(err))
        }
    })

    const delVoteHead = async (index: number) => {
        form.removeListItem('voteheadItems', index)
        const items = form.getValues().voteheadItems || []
        if (items.length < 1) form.insertListItem('voteheadItems', {...defaultVoteheadLineItem})

        if (id === 'new') return;

        const data: UpdateVoucherRequest = {
            voteheadItems: form.getValues().voteheadItems
        }
        updateVoucherMutation.mutate({data})
    }

    const delVoucher = useMutation({
        mutationKey: ['delete-voucher'],
        mutationFn: async () => {
            if (id === 'new') throw new Error(
                "Cannot delete a new voucher"
            )
            return await deleteVoucher(id)
        },
        onSuccess: async (data) => {
            notifications.show(showSuccess(data.message, "Notification!"))
            await navigate({to: "/finance/vouchers/edit/single/$id", params: {id: 'new'}})
        },
        onError: err => {
            notifications.show(showErr(err))
        }
    })

    async function autoUpdate() {
        updateVoucherMutation.mutate({data: form.getValues(), auto: true})
    }

    const [print, setPrint] = useState(false)
    const downloadVoucherQuery = useMutation({
        mutationKey: ['download-voucher'],
        retry: false,
        mutationFn: async () => {
            if (id === 'new') throw new Error(
                "Cannot download a new voucher"
            )
            return await getVoucherPdf(id)
        },
        onSuccess: (result) => {
            notifications.show(showSuccess("Voucher downloaded successfully"))
            if (print) return printDialogue(result)
            downloadBlob(result, `${form.getValues().voucherNo}.pdf`)
            // print instead
        },
        onSettled: () => {
            setPrint(false)
        }
    })

    // Add this right above the return statement
    const handleDeleteVoucher = async () => {
        if (id === 'new') {
            form.reset();
            return;
        }

        await confirmDeletion({
            question: "Are you sure you want to delete this voucher? This action cannot be undone.",
            // Using mutateAsync returns the Promise that the global form needs for its loading state
            acceptFn: () => delVoucher.mutateAsync()
        });
    };

    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            if (id === 'new') createVoucherMutation.mutate()
            else updateVoucherMutation.mutate({data: form.getValues()})
        }} className={"grid gap-2"}>
            <Title order={3}>{id === 'new' ? "New" : "Edit"} voucher</Title>
            <Fieldset classNames={{legend: 'text-primary-800 font-bold text-lg'}} legend={"Header"}
                      className={"grid md:grid-cols-4 gap-2"}>
                <TextInput
                    {...form.getInputProps('payeeName')} label={"Payee name"} placeholder={"Payee name"}
                    required={true}/>
                <TextInput
                    {...form.getInputProps('accountName')} label={"Account name"} placeholder={"Account name"}/>
                <TextInput
                    {...form.getInputProps('payeeAddress')} label={"Payee address"}
                    placeholder={"P.O Box/Street"} required={true}/>
                <DatePickerInput
                    leftSection={<IoMdCalendar/>}
                    {...form.getInputProps('date')} defaultValue={new Date()} label={'Date'}
                    placeholder={"Date"} required={true}/>
            </Fieldset>
            <Fieldset classNames={{legend: 'text-primary-800 font-bold text-lg'}} legend={"Particulars"}>
                <div className={'grid gap-2'}>
                    <div
                        className={'grid grid-cols-[20%_60%_20%] font-bold text-sm bg-primary-100 p-2 py-[10px] gap-2'}>
                        <span>Date</span>
                        <span>Particulars</span>
                        <span>Amount (Ksh)</span>
                    </div>
                    <div className={'grid grid-cols-[20%_auto_25%] gap-2'}>
                        <DatePickerInput
                            leftSection={<IoMdCalendar/>}
                            {...form.getInputProps('lineItems.0.date')}
                            placeholder={"Date"}
                        />
                        <Textarea
                            leftSection={<FaPencil/>}
                            autosize
                            {...form.getInputProps('lineItems.0.particulars')}
                            placeholder={"Description"}
                            onBlur={autoUpdate}
                        />
                        <NumberInput
                            min={0}
                            rightSection={<></>}
                            {...form.getInputProps('lineItems.0.kshs')}
                            placeholder={"1000"}
                            onFocus={val => {
                                if (val.target.value == "0") form.setFieldValue('lineItems.0.kshs', "" as unknown as number);
                            }}
                        />
                    </div>
                </div>
            </Fieldset>
            <Fieldset classNames={{legend: 'text-primary-800 font-bold text-lg ', root: "grid grid-flow-col gap-2"}}
                      legend={"Budget"}>
                <Select
                    {...form.getInputProps('votehead')}
                    data={[]}
                    label={"Votehead"} placeholder={"Votehead"}
                />
                <NumberInput {...form.getInputProps('budget')} label={"Budget"} placeholder={"Budget"}/>
                <NumberInput {...form.getInputProps('amountSpent')} label={"Amount spent"}
                             placeholder={"Amount spent"}/>
            </Fieldset>
            <Fieldset classNames={{legend: 'text-primary-800 font-bold text-lg'}} legend={"Payment"}>
                <TextInput
                    classNames={{input: 'font-black'}}
                    label={"Amount in words"} variant={'unstyled'} readOnly
                    value={form.getValues().amountInWords + " shillings"}/>
                <Select
                    placeholder={"Payment method"}
                    required={true}
                    label={"Payment Method"}
                    classNames={{label: "text-primary-800 font-black"}}
                    {...form.getInputProps('paymentMethod')}
                    data={[
                        {label: "Cash", value: "CASH"},
                        {label: "Online", value: "ONLINE"},
                        {label: "KCB Development", value: "KCB_DEVELOPMENT"},
                        {label: "KCB Operations", value: "KCB_OPERATIONS"},
                        {label: "Equity bank", value: "EQUITY_BANK"},
                    ] satisfies { label: string, value: VoucherPaymentMethod }[]}
                />
                {form.getValues().paymentMethod !== 'CASH' && form.getValues().paymentMethod !== null && (
                    <TextInput
                        type={form.getValues().paymentMethod === 'CASH' ? 'number' : 'text'}
                        {...form.getInputProps('paymentDetails')}
                        required={(["KCB_OPERATIONS", "KCB_DEVELOPMENT", "EQUITY_BANK"] as VoucherPaymentMethod[]).some(r => r == form.getValues().paymentMethod)}
                        placeholder={form.getValues().paymentMethod?.split('_').some(r => ['KCB', 'EQUITY'].includes(r)) ? '4-digit cheque No'
                            : form.getValues().paymentMethod === 'ONLINE' ? "EFT Reference (optional)" : ""}
                        label={form.getValues().paymentMethod?.split('_').some(r => ['KCB', 'EQUITY'].includes(r)) ? 'Cheque No'
                            : form.getValues().paymentMethod === 'ONLINE' ? "EFT Reference (optional)" : null}
                    />
                )}
            </Fieldset>
            <Fieldset classNames={{legend: 'text-primary-800 font-bold text-lg'}} legend={"Expenditure vote heads"}>
                <Table striped>
                    <Table.Thead className={' bg-primary-100 '}>
                        <Table.Tr>
                            <Table.Th style={{width: "20%"}}>Date</Table.Th>
                            <Table.Th style={{width: "auto"}}>Expenditure vote head</Table.Th>
                            <Table.Th style={{width: "20%"}}>Ksh</Table.Th>
                            <Table.Th style={{width: "5%"}}>Delete</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {form.getValues().voteheadItems?.map((_item, i) => (
                            <Table.Tr key={i}>
                                <Table.Td>
                                    <DatePickerInput
                                        {...form.getInputProps(`voteheadItems.${i}.date`)}
                                        variant={'unstyled'} placeholder={"Date"}
                                        valueFormat={"MMMM DD, YYYY"}
                                        leftSection={<IoMdCalendar/>}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Textarea
                                        {...form.getInputProps(`voteheadItems.${i}.expenditureVoteHead`)}
                                        variant={'unstyled'} autosize
                                        placeholder={"Vote head description"}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <NumberInput
                                        {...form.getInputProps(`voteheadItems.${i}.kshs`)}
                                        variant={'unstyled'} placeholder={"0"}/>
                                </Table.Td>
                                <Table.Td>
                                    <ActionIcon
                                        disabled={updateVoucherMutation.isPending}
                                        variant={'light'} color={'red'} size={'lg'}
                                        onClick={async () => {
                                            await delVoteHead(i)
                                        }}
                                    >
                                        <IoMdTrash/>
                                    </ActionIcon>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                <Space h={10}/>
                <Button leftSection={<MdAdd/>} variant={'outline'} onClick={() => {
                    form.insertListItem('voteheadItems', {...defaultVoteheadLineItem})
                }}>
                    Add row
                </Button>
            </Fieldset>
            <Fieldset
                classNames={{legend: 'text-primary-800 font-bold text-lg'}} legend={"Authorization"}
                className={'grid md:grid-cols-2 gap-2'}
            >
                <TextInput
                    {...form.getInputProps('preparedBy')}
                    readOnly disabled label={'Prepared by'}
                    placeholder={'Prepared by'}/>
                <DatePickerInput
                    leftSection={<IoMdCalendar/>}
                    {...form.getInputProps('preparedDate')} defaultValue={new Date()}
                    label={'Preparation Date'} placeholder={'Date'}/>
                <TextInput
                    {...form.getInputProps('approvedBy')}
                    label={'Finance Officer(Approved by)'} placeholder={'Prepared by'}/>
                <DatePickerInput
                    leftSection={<IoMdCalendar/>}
                    {...form.getInputProps('approvedDate')}
                    defaultValue={new Date()} label={'Approval Date'} placeholder={'Date'}/>
            </Fieldset>
            <Fieldset
                legend={"Receipt acknowledgement"} className={'grid grid-cols-3 gap-2'}
                classNames={{legend: 'text-primary-800 font-bold text-lg'}}>
                <Select
                    {...form.getInputProps('receivedCashOrCheque')}
                    defaultValue={'cheque'}
                    data={[
                        {label: "Cheque", value: "CHEQUE"},
                        {label: "Cash", value: "CASH"},
                        {label: "EFT", value: "EFT"},
                    ]}
                    placeholder={"Cash or cheque"}
                    label={"Cash/Cheque/EFT"}
                />
                <TextInput
                    {...form.getInputProps('receiverIdNo')}
                    label={"Receiver ID No"}
                    placeholder={"National ID"}
                />
                <DatePickerInput
                    leftSection={<IoMdCalendar/>}
                    {...form.getInputProps('receivedDate')}
                    label={'Received date'}
                    placeholder={'Date received'}
                />
            </Fieldset>
            <Fieldset legend={"Principal Authorization"} classNames={{legend: "text-primary-800 font-bold text-lg"}}
                      className={'grid grid-cols-2 gap-2'}>
                <DatePickerInput
                    leftSection={<IoMdCalendar/>}
                    {...form.getInputProps('authorizedDate')}
                    label={'Principal Authorization Date'}
                    placeholder={'Date of principal authorization'}
                />
            </Fieldset>
            <div className={'sticky bottom-0 z-[30] bg-white py-4 flex flex-wrap justify-between gap-2'}>
                <div className={'flex flex-wrap gap-2'}>
                    <Button
                        loading={updateVoucherMutation.isPending}
                        leftSection={<BiSave/>}
                        type={'submit'}>Save</Button>
                    <Button
                        onClick={() => downloadVoucherQuery.mutate()}
                        hidden={id === 'new'} variant={'light'}
                        leftSection={<MdDownload/>}
                        loading={downloadVoucherQuery.isPending && !print}
                        disabled={downloadVoucherQuery.isPending}
                    >
                        Download
                    </Button>
                    <Button
                        onClick={() => {
                            setPrint(true)
                            downloadVoucherQuery.mutate()
                        }}
                        hidden={id === 'new'} variant={'light'}
                        leftSection={<MdPrint/>}
                        loading={downloadVoucherQuery.isPending && print}
                        disabled={downloadVoucherQuery.isPending}
                    >
                        Print
                    </Button>
                </div>
                <div className={'flex flex-wrap gap-2'}>
                    <Button
                        hidden={id === 'new'}
                        leftSection={<MdCreate/>}
                        onClick={() => navigate({to: '/finance/vouchers/edit/single/$id', params: {id: 'new'}})}
                    >
                        New voucher
                    </Button>
                    <Button
                        disabled={delVoucher.isPending || createVoucherMutation.isPending || updateVoucherMutation.isPending}
                        // onClick={id === 'new' ? form.reset : () => delVoucher.mutate()}
                        onClick={handleDeleteVoucher}
                        leftSection={id === 'new' ? <MdCancel/> : <IoMdTrash/>} color={'accent'}
                    >
                        {id === 'new' ? "Cancel" : "Delete"}
                    </Button>
                </div>
            </div>
        </form>
    )
}
