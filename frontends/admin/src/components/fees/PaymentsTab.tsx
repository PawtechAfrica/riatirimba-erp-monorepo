import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useDebouncedCallback} from "@mantine/hooks";
import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Group,
    Loader,
    Modal,
    Skeleton,
    Stack,
    Table,
    Text,
    Textarea,
    TextInput,
    Title,
} from "@mantine/core";

import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import {FaCreditCard, FaSearch} from "react-icons/fa";
import feesService from "@/services/fees.service.ts";
import type {PaymentObj} from "@/libs/types/fees.types.ts";

import PostPaymentForm from "@/components/forms/PostPaymentForm.tsx";
import {MdCancel} from "react-icons/md";
import stylesUtil from "@/utils/styles.util.ts";

export default function PaymentsTab() {
    const queryClient = useQueryClient();
    const [searchStudentId, setSearchStudentId] = useState("");
    const [activeSearchId, setActiveSearchId] = useState("");
    const [postModalOpen, setPostModalOpen] = useState(false);
    const [reverseModalOpen, setReverseModalOpen] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
    const [reversalNotes, setReversalNotes] = useState("");

    const {data: payments = [], isLoading, isFetched} = useQuery({
        queryKey: ["student-payments", activeSearchId],
        queryFn: () => feesService.getPaymentsByStudent(activeSearchId),
        enabled: activeSearchId.trim().length > 0,
    });

    const reverseMutation = useMutation({
        mutationKey: [activeSearchId],
        mutationFn: ({id, notes}: { id: string; notes: string }) =>
            // set reversedBy to be the logged-in user
            feesService.reversePayment(id, {reversedBy: "ADMIN", notes}),
        onSuccess: async () => {
            notifications.show(showSuccess("Payment reversed successfully!"));
            setReverseModalOpen(false);
            setSelectedPaymentId(null);
            setReversalNotes("");
            await queryClient.invalidateQueries({queryKey: ["student-payments", activeSearchId]});
            // manually remove
            payments.splice(payments.findIndex((payment) => payment.id === selectedPaymentId), 1);
        },
        onError: (err: any) => {
            notifications.show(showErr(err));
        },
    });

    // 1. Setup the debounced search trigger (waits 500ms after typing stops)
    const debouncedSearch = useDebouncedCallback((value: string) => {
        if (value.trim().length >= 3) {
            setActiveSearchId(value.trim());
        }
    }, 500);

    const handleSearch = () => {
        // Cancel any pending debounced search to avoid duplicate state updates
        debouncedSearch.cancel();

        if (!searchStudentId.trim()) {
            notifications.show({title: "Validation", message: "Please enter registration number", color: "yellow"});
            return;
        }
        setActiveSearchId(searchStudentId.trim());
    };

    return (
        <Stack gap="md" className="w-full">
            <Group justify="space-between" align="center">
                <div>
                    <Title order={3}>Trainee Payments</Title>
                    <Text size="sm" c="dimmed">Post fee payments, record receipts, and handle payment reversals</Text>
                </div>
                <Button leftSection={<FaCreditCard/>} color={"secondary"} onClick={() => setPostModalOpen(true)}>
                    Post New Payment
                </Button>
            </Group>

            <Card withBorder shadow="sm" radius="md" p="md">
                <Stack gap="md">
                    {/*<Group align="flex-start">*/}
                    <TextInput
                        rightSection={isLoading ? <Loader size="sm"/>
                            : searchStudentId ? <ActionIcon
                                onClick={() => {
                                    setSearchStudentId("")
                                    setActiveSearchId("")
                                }}
                                variant={'light'}><MdCancel/></ActionIcon> : undefined}
                        label="Registration number"
                        placeholder="Enter registration number (e.g., S12345)..."
                        leftSection={<FaSearch className="text-gray-400"/>}
                        value={searchStudentId}
                        onChange={(e) => {
                            const val = e.currentTarget.value;
                            setSearchStudentId(val);

                            // 2. Trigger debounce, or clear immediately if empty
                            if (!val.trim()) {
                                debouncedSearch.cancel();
                                setActiveSearchId("");
                            } else {
                                debouncedSearch(val);
                            }
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="max-w-xs flex-1"
                    />
                    {/*<Button loading={isLoading} onClick={handleSearch}>*/}
                    {/*    Search Payments*/}
                    {/*</Button>*/}
                    {/*</Group>*/}

                    {activeSearchId && (
                        <Text size="sm" fw={600} className="text-gray-700">
                            Showing payment records for: <span
                            className="text-blue-600 font-mono">{activeSearchId}</span>
                        </Text>
                    )}

                    <Table.ScrollContainer minWidth={700}>
                        <Table verticalSpacing="sm" striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Receipt Number</Table.Th>
                                    <Table.Th>Amount Paid</Table.Th>
                                    <Table.Th>Mode</Table.Th>
                                    <Table.Th>Funding Source</Table.Th>
                                    <Table.Th>Payment Date</Table.Th>
                                    {/*<Table.Th style={{textAlign: "right"}}>Actions</Table.Th>*/}
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {isLoading ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={6}>
                                            <Stack gap="xs">
                                                <Skeleton height={25}/>
                                                <Skeleton height={25}/>
                                                <Skeleton height={25}/>
                                            </Stack>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : payments.length > 0 ? (
                                    payments.map((pay: PaymentObj) => (
                                        <Table.Tr key={pay.id || pay.receipt_number}>
                                            <Table.Td className="font-mono font-bold text-blue-600">
                                                {pay.receipt_number}
                                            </Table.Td>
                                            <Table.Td className="font-bold text-emerald-600">
                                                KES {parseFloat(pay.total_amount as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                                            </Table.Td>
                                            <Table.Td tt="capitalize">
                                                <Badge variant="light" color="blue">
                                                    {pay.payment_mode}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td tt="capitalize">
                                                <Badge variant="outline" color="violet">
                                                    {pay.funding_source}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>{pay.payment_date}</Table.Td>
                                            {/*<Table.Td style={{textAlign: "right"}}>*/}
                                            {/*    <Tooltip label="Reverse Payment">*/}
                                            {/*        <Button*/}
                                            {/*            size="xs"*/}
                                            {/*            color="red"*/}
                                            {/*            variant="light"*/}
                                            {/*            leftSection={<FaUndo/>}*/}
                                            {/*            onClick={() => {*/}
                                            {/*                setSelectedPaymentId(pay.id || pay.receipt_number);*/}
                                            {/*                setReversalNotes("");*/}
                                            {/*                setReverseModalOpen(true);*/}
                                            {/*            }}*/}
                                            {/*        >*/}
                                            {/*            Reverse*/}
                                            {/*        </Button>*/}
                                            {/*    </Tooltip>*/}
                                            {/*</Table.Td>*/}
                                        </Table.Tr>
                                    ))
                                ) : isFetched ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={6} className="text-center text-gray-400 py-6">
                                            No payments found for student "{activeSearchId}"
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={6} className="text-center text-gray-400 py-6">
                                            Search by registration number above to view payments
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Stack>
            </Card>

            {/* 'Post payment' Modal */}
            <Modal
                opened={postModalOpen}
                onClose={() => setPostModalOpen(false)}
                title={"Post Trainee Payment"}
                classNames={stylesUtil.modalHeader}
                size={"md"}
                centered
            >
                <PostPaymentForm
                    initialStudentId={searchStudentId}
                    onSuccess={(postedStudentId) => {
                        setPostModalOpen(false);
                        setActiveSearchId(postedStudentId);
                        setSearchStudentId(postedStudentId);
                    }}
                    onCancel={() => setPostModalOpen(false)}
                />
            </Modal>

            {/* Reversal Confirmation Modal */}
            <Modal
                opened={reverseModalOpen}
                onClose={() => setReverseModalOpen(false)}
                title="Reverse Payment"
                centered
            >
                <Stack gap="sm">
                    <Text size="sm" c="red" fw={600}>
                        Warning: Reversing a payment will alter financial ledgers and receipt records!
                    </Text>
                    <Textarea
                        label="Reason / Notes for Reversal"
                        placeholder="State reason for payment reversal..."
                        required
                        value={reversalNotes}
                        onChange={(e) => setReversalNotes(e.currentTarget.value)}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setReverseModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            loading={reverseMutation.isPending}
                            onClick={() => {
                                if (selectedPaymentId && reversalNotes.trim()) {
                                    reverseMutation.mutate({id: selectedPaymentId, notes: reversalNotes.trim()});
                                } else {
                                    notifications.show({
                                        title: "Validation",
                                        message: "Please state reason",
                                        color: "yellow"
                                    });
                                }
                            }}
                        >
                            Confirm Reversal
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}