import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {
    Badge,
    Button,
    Card,
    Code,
    Divider,
    Group,
    Select,
    SimpleGrid,
    Skeleton,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {FaDownload, FaSearch} from "react-icons/fa";
import feesService from "@/services/fees.service.ts";
import type {EnrollmentObligation} from "@/libs/types/fees.types.ts";

export default function ReceiptsTab() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSearch, setActiveSearch] = useState("");

    const [selectedObligationId, setSelectedObligationId] = useState<string | null>(null);
    const [receiptType, setReceiptType] = useState<"student" | "sponsor">("student");
    const [showJson, setShowJson] = useState(false);

    // Query student fee position to pick an obligation
    const { data: position, isLoading: isPositionLoading } = useQuery({
        queryKey: ["receipt-student-position", activeSearch],
        queryFn: () => feesService.getStudentFeePosition(activeSearch),
        enabled: activeSearch.trim().length > 0,
    });

    // Query receipt JSON when obligation selected
    const { data: receiptData, isLoading: isReceiptLoading } = useQuery({
        queryKey: ["receipt-json", selectedObligationId],
        queryFn: () => (selectedObligationId ? feesService.getReceiptJson(selectedObligationId) : null),
        enabled: !!selectedObligationId,
    });


    const handleSearch = () => {
        if (!searchQuery.trim()) {
            notifications.show({ title: "Validation", message: "Enter registration number", color: "yellow" });
            return;
        }
        setSelectedObligationId(null);
        setShowJson(false);
        setActiveSearch(searchQuery.trim());
    };

    const handleDownloadPdf = () => {
        if (!selectedObligationId) return;
        const pdfUrl = feesService.getReceiptPdfUrl(selectedObligationId, receiptType);
        window.open(pdfUrl, "_blank");
    };

    const obligations = position?.obligations || [];

    return (
        <Stack gap="md" className="w-full">
            <Group justify="space-between" align="center">
                <div>
                    <Title order={3}>Official Fee Receipts</Title>
                    <Text size="sm" c="dimmed">Lookup trainee fee obligations and generate official trainee or sponsor receipts</Text>
                </div>
            </Group>

            <Card withBorder shadow="sm" radius="md" p="md">
                <Group align="flex-end">
                    <TextInput
                        label={"Registration number"}
                        placeholder="Enter registration number (e.g., S12345)..."
                        leftSection={<FaSearch className="text-gray-400" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-1 max-w-md"
                    />
                    <Button leftSection={<FaSearch />} onClick={handleSearch}>
                        Search trainee
                    </Button>
                </Group>
            </Card>

            {isPositionLoading ? (
                <Skeleton height={150} radius="md" />
            ) : position && position.found ? (
                <Stack gap="md">
                    <Card withBorder shadow="sm" radius="md" p="md">
                        <Stack gap="sm">
                            <Group justify="space-between">
                                <div>
                                    <Text fw={700} size="lg" className="text-blue-600">
                                        {position.studentName || position.studentId}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        Reg: {position.studentRegNo || "N/A"} | Prog: {position.programmeCode || "N/A"}
                                    </Text>
                                </div>
                                <Group gap="md">
                                    <Badge size="lg" color="rose" variant="light">
                                        Balance: KES {parseFloat(position.summary?.totalBalance as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                    </Badge>
                                    <Badge size="lg" color="emerald" variant="light">
                                        Paid: KES {parseFloat(position.summary?.totalPaid as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                    </Badge>
                                </Group>
                            </Group>

                            <Divider my="xs" />

                            <Title order={5}>Select Obligation to Receipt</Title>
                            <Table.ScrollContainer minWidth={600}>
                                <Table verticalSpacing="xs" striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Obligation ID</Table.Th>
                                            <Table.Th>Type</Table.Th>
                                            <Table.Th>Term</Table.Th>
                                            <Table.Th>Total Amount</Table.Th>
                                            <Table.Th>Total Paid</Table.Th>
                                            <Table.Th>Status</Table.Th>
                                            <Table.Th style={{ textAlign: "right" }}>Action</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {obligations.map((ob: EnrollmentObligation) => (
                                            <Table.Tr key={ob.id || ob.obligationId}>
                                                <Table.Td className="font-mono text-xs text-blue-600">{ob.obligationId || ob.id}</Table.Td>
                                                <Table.Td className="font-medium">{ob.type}</Table.Td>
                                                <Table.Td>Term {ob.studentTerm}</Table.Td>
                                                <Table.Td>
                                                    KES {parseFloat(ob.totalAmount as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                                </Table.Td>
                                                <Table.Td className="text-emerald-600">
                                                    KES {parseFloat(ob.totalPaid as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge
                                                        color={
                                                            ob.status === "cleared"
                                                                ? "green"
                                                                : ob.status === "partial"
                                                                ? "orange"
                                                                : "red"
                                                        }
                                                    >
                                                        {ob.status}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td style={{ textAlign: "right" }}>
                                                    <Button
                                                        size="xs"
                                                        variant={selectedObligationId === (ob.obligationId || ob.id) ? "filled" : "outline"}
                                                        color={"primary"}
                                                        onClick={() => setSelectedObligationId(ob.obligationId || ob.id)}
                                                    >
                                                        {selectedObligationId === (ob.obligationId || ob.id) ? "Selected" : "Select"}
                                                    </Button>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        </Stack>
                    </Card>

                    {selectedObligationId && (
                        <Card withBorder shadow="sm" radius="md" p="md" className="bg-slate-50">
                            <Stack gap="md">
                                <Group justify="space-between" align="center">
                                    <Title order={4}>Receipt Generator Settings</Title>
                                    <Group gap="sm">
                                        <Select
                                            label="Receipt Type"
                                            data={[
                                                { value: "student", label: "Trainee Receipt (Full Itemized Breakdown)" },
                                                { value: "sponsor", label: "Sponsor Receipt (Summary Total)" },
                                            ]}
                                            value={receiptType}
                                            onChange={(val) => setReceiptType((val as any) || "student")}
                                            className="w-80"
                                        />
                                        <Button
                                            mt={24}
                                            // color="emerald"
                                            leftSection={<FaDownload />}
                                            onClick={handleDownloadPdf}
                                        >
                                            Download PDF
                                        </Button>
                                        {/*<Button*/}
                                        {/*    mt={24}*/}
                                        {/*    variant="light"*/}
                                        {/*    color="indigo"*/}
                                        {/*    leftSection={<FaCode />}*/}
                                        {/*    onClick={() => setShowJson(!showJson)}*/}
                                        {/*>*/}
                                        {/*    {showJson ? "Hide JSON" : "View JSON"}*/}
                                        {/*</Button>*/}
                                    </Group>
                                </Group>

                                {isReceiptLoading ? (
                                    <Skeleton height={100} radius="md" />
                                ) : receiptData ? (
                                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mt="xs">
                                        <Card withBorder radius="md" p="xs" bg="white">
                                            <Text size="xs" c="dimmed">Receipt Number</Text>
                                            <Text fw={700} size="md" className="font-mono text-blue-600">
                                                {receiptData.receiptNumber}
                                            </Text>
                                            <Text size="xs" c="dimmed">{receiptData.generatedDate}</Text>
                                        </Card>
                                        <Card withBorder radius="md" p="xs" bg="white">
                                            <Text size="xs" c="dimmed">Trainee</Text>
                                            <Text fw={700} size="md">
                                                {receiptData.studentName || receiptData.studentId}
                                            </Text>
                                            <Text size="xs" c="dimmed">{receiptData.studentRegNo || "N/A"}</Text>
                                        </Card>
                                        <Card withBorder radius="md" p="xs" bg="white">
                                            <Text size="xs" c="dimmed">Total Amount</Text>
                                            <Text fw={700} size="md" className="text-emerald-600">
                                                KES {parseFloat(receiptData.totalAmount as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                            </Text>
                                            <Text size="xs" c="dimmed">{receiptData.obligationType}</Text>
                                        </Card>
                                        <Card withBorder radius="md" p="xs" bg="white">
                                            <Text size="xs" c="dimmed">Status</Text>
                                            <Badge color={receiptData.status === "cleared" ? "green" : "orange"} size="lg" mt={2}>
                                                {receiptData.status}
                                            </Badge>
                                            <Text size="xs" c="dimmed" mt={2}>
                                                Balance: KES {parseFloat(receiptData.totalBalance as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                            </Text>
                                        </Card>
                                    </SimpleGrid>
                                ) : null}

                                {showJson && receiptData && (
                                    <Stack gap="xs" mt="xs">
                                        <Text fw={600} size="sm">JSON Receipt Metadata:</Text>
                                        <Code block className="p-3 text-xs max-h-80 overflow-y-auto rounded-md">
                                            {JSON.stringify(receiptData, null, 2)}
                                        </Code>
                                    </Stack>
                                )}
                            </Stack>
                        </Card>
                    )}
                </Stack>
            ) : activeSearch ? (
                <Card withBorder shadow="sm" radius="md" p="lg" className="text-center text-gray-500">
                    Student "{activeSearch}" not found or has no fee obligations.
                </Card>
            ) : (
                <Card withBorder shadow="sm" radius="md" p="lg" className="text-center text-gray-400">
                    Search for a trainee above to view obligations and generate official receipts.
                </Card>
            )}
        </Stack>
    );
}
