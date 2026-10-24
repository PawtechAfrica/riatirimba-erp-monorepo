import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {
    Badge,
    Button,
    Card,
    Group,
    NumberInput,
    SimpleGrid,
    Skeleton,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {FaSearch, FaUserGraduate} from "react-icons/fa";
import feesService from "@/services/fees.service.ts";
import type {EnrollmentObligation} from "@/libs/types/fees.types.ts";

export default function StudentPositionTab() {
    const [studentIdInput, setStudentIdInput] = useState("");
    const [yearInput, setYearInput] = useState<number | "">("");
    const [activeSearch, setActiveSearch] = useState<{ studentId: string; year: number | null }>({
        studentId: "",
        year: null,
    });

    const {data: position, isLoading, isFetched} = useQuery({
        queryKey: ["student-fee-position", activeSearch.studentId, activeSearch.year],
        queryFn: () => feesService.getStudentFeePosition(activeSearch.studentId.replace("/", "-"), Number.isNaN(Number(yearInput)) ? undefined : Number(yearInput)),
        enabled: activeSearch.studentId.trim().length > 0,
    });

    const handleSearch = () => {
        if (!studentIdInput.trim()) {
            notifications.show({title: "Validation", message: "Enter registration number", color: "yellow"});
            return;
        }
        setActiveSearch({
            studentId: studentIdInput.trim(),
            year: typeof yearInput === "number" ? yearInput : null,
        });
    };

    const summary = position?.summary || {totalBalance: 0, totalPaid: 0, grandTotal: 0, creditOnAccount: 0};
    const obligations = position?.obligations || [];

    return (
        <Stack gap="md" className="w-full">
            <Group justify="space-between" align="center">
                <div>
                    <Title order={3}>Trainee Fee Position</Title>
                    <Text size="sm" c="dimmed">Complete statement of trainee fee balances, credits, and term
                        obligations</Text>
                </div>
            </Group>

            <Card withBorder shadow="sm" radius="md" p="md">
                <Group align="flex-end">
                    <TextInput
                        label={"Registration number"}
                        placeholder="Enter registration number (e.g., S12345)..."
                        leftSection={<FaSearch className="text-gray-400"/>}
                        value={studentIdInput}
                        onChange={(e) => setStudentIdInput(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-1 max-w-sm"
                    />
                    <NumberInput
                        label="Year (Optional)"
                        placeholder="e.g. 1"
                        min={1}
                        max={4}
                        value={yearInput}
                        onChange={(val) => setYearInput(typeof val === "number" ? val : "")}
                        className="w-32"
                    />
                    <Button leftSection={<FaUserGraduate/>} onClick={handleSearch}>
                        View Fee Position
                    </Button>
                </Group>
            </Card>

            {isLoading ? (
                <SimpleGrid cols={{base: 1, sm: 2, md: 4}} spacing="md">
                    <Skeleton height={100} radius="md"/>
                    <Skeleton height={100} radius="md"/>
                    <Skeleton height={100} radius="md"/>
                    <Skeleton height={100} radius="md"/>
                </SimpleGrid>

            ) : position && position.found ? (
                <Stack gap="md">
                    <SimpleGrid cols={{base: 1, sm: 2, md: 4}} spacing="md">
                        <Card withBorder shadow="sm" radius="md" p="md">
                            <Stack gap="xs">
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                                    Trainee Profile
                                </Text>
                                <Text size="lg" fw={700} className="text-blue-600">
                                    {position.studentName || position.studentId}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Reg: {position.studentRegNo || "N/A"} | Prog: {position.programmeCode || "N/A"}
                                </Text>
                            </Stack>
                        </Card>

                        <Card withBorder shadow="sm" radius="md" p="md">
                            <Stack gap="xs">
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                                    Total Balance Due
                                </Text>
                                <Text size="xl" fw={700} className="text-rose-600">
                                    KES {parseFloat(summary.totalBalance as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Grand Total:
                                    KES {parseFloat(summary.grandTotal as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                                </Text>
                            </Stack>
                        </Card>

                        <Card withBorder shadow="sm" radius="md" p="md">
                            <Stack gap="xs">
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                                    Total Paid
                                </Text>
                                <Text size="xl" fw={700} className="text-emerald-600">
                                    KES {parseFloat(summary.totalPaid as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Across {position.obligationCount || 0} obligation(s)
                                </Text>
                            </Stack>
                        </Card>

                        <Card withBorder shadow="sm" radius="md" p="md">
                            <Stack gap="xs">
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                                    Credit on Account
                                </Text>
                                <Text size="xl" fw={700} className="text-teal-600">
                                    KES {parseFloat(summary.creditOnAccount as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {position.enrollmentCount || 0} active enrollment(s)
                                </Text>
                            </Stack>
                        </Card>
                    </SimpleGrid>

                    <Card withBorder shadow="sm" radius="md" p="md">
                        <Stack gap="md">
                            <Title order={4} className="text-gray-700">Fee Obligations Statement</Title>

                            <Table.ScrollContainer minWidth={600}>
                                <Table verticalSpacing="sm" striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Type / Description</Table.Th>
                                            <Table.Th>Term</Table.Th>
                                            <Table.Th>Total Fee</Table.Th>
                                            <Table.Th>Total Paid</Table.Th>
                                            <Table.Th>Outstanding Balance</Table.Th>
                                            <Table.Th>Status</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {obligations.length > 0 ? (
                                            obligations.map((ob: EnrollmentObligation, idx: number) => (
                                                <Table.Tr key={ob.id || ob.obligationId || idx}>
                                                    <Table.Td className="font-semibold">{ob.type}</Table.Td>
                                                    <Table.Td>Term {ob.studentTerm}</Table.Td>
                                                    <Table.Td>
                                                        KES {parseFloat(ob.totalAmount as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                                                    </Table.Td>
                                                    <Table.Td className="text-emerald-600">
                                                        KES {parseFloat(ob.totalPaid as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                                                    </Table.Td>
                                                    <Table.Td className="font-bold text-rose-600">
                                                        KES {parseFloat(ob.totalBalance as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
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
                                                </Table.Tr>
                                            ))
                                        ) : (
                                            <Table.Tr>
                                                <Table.Td colSpan={6} className="text-center text-gray-400 py-6">
                                                    No obligations found for this trainee
                                                </Table.Td>
                                            </Table.Tr>
                                        )}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        </Stack>
                    </Card>
                </Stack>
            ) : isFetched ? (
                <Card withBorder shadow="sm" radius="md" p="lg" className="text-center text-gray-500">
                    Registration number: "{activeSearch.studentId}" not found in fee records.
                </Card>
            ) : (
                <Card withBorder shadow="sm" radius="md" p="lg" className="text-center text-gray-400">
                    Enter a registration number above and click "View Fee Position" to load statement.
                </Card>
            )}
        </Stack>
    );
}
