import {useForm} from "@mantine/form";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Button, Group, Loader, NumberInput, Select, Stack, TextInput,} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import feesService from "@/services/fees.service.ts";
import type {EnrollmentObligation, PostPaymentDto} from "@/libs/types/fees.types.ts";
import dayjs from "dayjs";
import {useRef, useState} from "react";
import {useDebouncedCallback} from "@mantine/hooks";

export interface PostPaymentFormProps {
    initialStudentId?: string;
    initialObligationId?: string;
    onSuccess?: (studentId: string) => void;
    onCancel?: () => void;
}

export default function PostPaymentForm({
                                            initialStudentId = "",
                                            initialObligationId = "",
                                            onSuccess,
                                            onCancel,
                                        }: PostPaymentFormProps) {
    const queryClient = useQueryClient();
    const {getStudentFeePosition} = feesService;

    const form = useForm<{
        regNo: string;
        obligationId: string;
        bankName: string;
        amount: number;
        paymentMode: string;
        transactionRef: string;
        fundingSource: string;
        receivedBy: string;
        paymentDate: string;
    }>({
        // mode: 'controlled',
        initialValues: {
            regNo: initialStudentId,
            obligationId: initialObligationId,
            bankName: "",
            amount: 0,
            paymentMode: "cash",
            transactionRef: "",
            fundingSource: "self",
            receivedBy: "CASHIER-01",
            paymentDate: dayjs().format("YYYY-MM-DD"),
        },
        validate: {
            bankName: (val, others) => ['bank_transfer', 'cheque'].includes(others.paymentMode) && !val ? "Bank name is required!" : undefined,
            regNo: (val) => (val.trim().length === 0 ? "Registration number is required" : null),
            obligationId: (val) => (val.trim().length === 0 ? "Obligation ID is required" : null),
            amount: (val) => (val <= 0 ? "Amount must be greater than 0" : null),
            receivedBy: (val) => (val.trim().length === 0 ? "Cashier ID is required" : null),
            paymentDate: (val) => (val.trim().length === 0 ? "Payment date is required" : null),
        },
    });

    const [message, setMessage] = useState<string | null>(null);
    const [obligations, setObligations] = useState<EnrollmentObligation[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const activeSearchId = useRef(0);

    const [studentName, setStudentName] = useState<string | undefined>(undefined);

// 1. Create the debounced API call (waits 500ms)
    const fetchStudentData = useDebouncedCallback(async (value) => {
        const currentSearchId = Date.now();
        activeSearchId.current = currentSearchId;

        setMessage("Searching...");

        try {
            const result = await getStudentFeePosition(value);

            // Network Race Condition Check
            if (activeSearchId.current !== currentSearchId) return;

            if (!result.found) {
                setMessage("Student not found");
            } else if (!result.obligations.length) {
                setMessage("No obligations found");
            } else {
                setObligations(result.obligations);
                setMessage(null);
                setStudentName(result.studentName);
            }
        } catch (error) {
            if (activeSearchId.current === currentSearchId) {
                setMessage("Search failed. Please try again.");
            }
        } finally {
            if (activeSearchId.current === currentSearchId) {
                setLoading(false);
            }
        }
    }, 500);

// 2. Attach to your form watcher
    // 2. Attach to your form watcher
    form.watch('regNo', ({value}) => {
        // Immediate UI resets on every keystroke
        setObligations([]);

        if (!value || value.length < 3) {
            fetchStudentData.cancel(); // Built-in Mantine method to abort the pending debounce
            setLoading(false);
            setMessage("Admission number too short");
            return;
        }

        // Set UI to loading while they type, before the 500ms fetch fires
        setMessage(null);
        setLoading(true);

        // Trigger the debounced function
        fetchStudentData(value);
    });

    const postMutation = useMutation({
        mutationFn: (values: typeof form.values) => {
            const dto: PostPaymentDto = {
                regNo: values.regNo.trim(),
                obligations: [
                    {
                        obligationId: values.obligationId.trim(),
                        amount: values.amount,
                    },
                ],
                bankName: values.bankName.trim(),
                totalAmount: values.amount,
                paymentMode: values.paymentMode,
                transactionRef: values.transactionRef.trim() || undefined,
                fundingSource: values.fundingSource,
                receivedBy: values.receivedBy.trim(),
                paymentDate: values.paymentDate,
            };
            return feesService.postPayment(dto);
        },
        onSuccess: async (_, variables) => {
            notifications.show(showSuccess("Payment posted successfully!"));
            await queryClient.invalidateQueries({queryKey: ["student-payments", variables.regNo]});
            await queryClient.invalidateQueries({queryKey: ["fees-dashboard"]});
            await queryClient.invalidateQueries({queryKey: ["student-position", variables.regNo]});
            form.reset();
            if (onSuccess) onSuccess(variables.regNo);
        },
        onError: (err: any) => {
            notifications.show(showErr(err));
        },
    });

    const handleSubmit = (values: typeof form.values) => {
        if (!form.getValues().obligationId) return form.setFieldError('obligationId', "Please select obligation") //notifications.show(showErr(new Error("Please select an obligation")));
        postMutation.mutate(values);
    };
    const money = new Intl.NumberFormat('en-UK', {style: 'currency', currency: 'KES'})

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
                {studentName && <span className={"text-lg font-bold"}>Name: {studentName}</span>}
                <TextInput
                    rightSection={loading && <Loader size={'sm'}/>}
                    label={"Registration number"}
                    placeholder={"e.g., S12345"}
                    required
                    {...form.getInputProps("regNo")}
                />
                {
                    message && message.length > 0 || obligations.length < 1
                        ? <span>{message}</span>
                        : <>
                            <Select
                                label={"Obligation ID"}
                                placeholder={"e.g., OBL-2026-001"}
                                required
                                {...form.getInputProps("obligationId")}
                                data={obligations.map(obl => ({
                                    label: `Type: ${obl.type} Bal: ${money.format(obl.totalBalance)}`,
                                    value: obl.obligationId
                                }))}
                            />

                            <NumberInput
                                label="Amount Paid (KES)"
                                placeholder="e.g., 20000.00"
                                min={1}
                                step={0.01}
                                required
                                {...form.getInputProps("amount")}
                                onFocus={() => {
                                    // @ts-ignore
                                    if (!form.getValues().amount) form.setFieldValue("amount", "")
                                }}
                            />

                            <Group grow>
                                <Select
                                    label="Payment Mode"
                                    data={[
                                        {value: "cash", label: "Cash"},
                                        {value: "mpesa", label: "M-Pesa"},
                                        {value: "bank_transfer", label: "Bank Transfer"},
                                        {value: "cheque", label: "Cheque"},
                                    ]}
                                    {...form.getInputProps("paymentMode")}
                                />

                                {/*{(form.getValues().paymentMode === "bank_transfer" || form.getValues().paymentMode === "cheque")*/}
                                {(['bank_transfer', 'cheque'].includes(form.getValues().paymentMode))
                                    &&
                                    <Select
                                        label={"Bank Name"}
                                        placeholder={"e.g., Equity Bank"}
                                        required
                                        data={[
                                            {label: "Equity Bank", value: "Equity"},
                                            {label: "KCB Bank", value: "KCB"},
                                            {label: "Co-operative Bank", value: "Co-op"},
                                        ]}
                                        {...form.getInputProps("bankName")}
                                    />
                                }

                                <Select
                                    label="Funding Source"
                                    data={[
                                        {value: "self", label: "Self / Guardian"},
                                        {value: "kuccps", label: "KUCCPS"},
                                        {value: "nita", label: "NITA"},
                                        {value: "helb", label: "HELB"},
                                        {value: "employer", label: "Employer"},
                                        {value: "cdf_bursary", label: "CDF Bursary"},
                                        {value: "county_bursary", label: "County Bursary"},
                                    ]}
                                    {...form.getInputProps("fundingSource")}
                                />
                            </Group>

                            <TextInput
                                label="Transaction Reference / Cheque #"
                                placeholder="e.g., QX8921KL / PAY-001"
                                {...form.getInputProps("transactionRef")}
                            />

                            <Group grow>
                                <TextInput
                                    label="Payment Date"
                                    type="date"
                                    required
                                    {...form.getInputProps("paymentDate")}
                                />
                                <TextInput
                                    label="Received By (Cashier ID)"
                                    placeholder="e.g., CASHIER-01"
                                    required
                                    {...form.getInputProps("receivedBy")}
                                />
                            </Group>

                            <Group justify="flex-end" mt="md">
                                <Button type={"submit"} loading={postMutation.isPending}>
                                    Post Payment
                                </Button>
                                {onCancel && (
                                    <Button variant="default" onClick={onCancel}>
                                        Cancel
                                    </Button>
                                )}
                            </Group>
                        </>
                }
            </Stack>
        </form>
    )
        ;
}
