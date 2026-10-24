import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    Badge,
    Button,
    Card,
    Group,
    Modal,
    NumberInput,
    Select,
    Skeleton,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import {useForm} from "@mantine/form";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import {FaEye, FaSearch} from "react-icons/fa";
import feesService from "@/services/fees.service.ts";
import type {EnrollmentObj, EnrollmentObligation, ProcessEnrollmentDto} from "@/libs/types/fees.types.ts";
import dayjs from "dayjs";


export default function EnrollmentsTab() {
    const queryClient = useQueryClient();
    const [searchStudentId, setSearchStudentId] = useState("");
    const [activeSearchId, setActiveSearchId] = useState("");
    const [processModalOpen, setProcessModalOpen] = useState(false);
    const [obligationsModalOpen, setObligationsModalOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentObj | null>(null);

    const {data: enrollments = [], isLoading, isFetched} = useQuery({
        queryKey: ["student-enrollments", activeSearchId],
        queryFn: () => feesService.getEnrollmentsByStudent(activeSearchId),
        enabled: activeSearchId.trim().length > 0,
    });

    const form = useForm<ProcessEnrollmentDto>({
        initialValues: {
            event: "TERM_ADVANCED",
            eventId: `EVT-${Date.now()}`,
            studentId: "",
            studentName: "",
            studentRegNo: "",
            programmeCode: "",
            studentYear: 1,
            studentTerm: 1,
            enrollmentDate: dayjs().format("YYYY-MM-DD"),
            studentCategory: "regular",
            isNewStudent: false,
            enrolledBy: "HOD-01",
        },
        validate: {
            studentId: (val) => (val.trim().length === 0 ? "Trainee registration number is required" : null),
            programmeCode: (val) => (val.trim().length === 0 ? "Programme code is required" : null),
            enrolledBy: (val) => (val.trim().length === 0 ? "Enrolled by ID is required" : null),
        },
    });

    const processMutation = useMutation({
        mutationFn: (values: ProcessEnrollmentDto) => feesService.processEnrollment(values),
        onSuccess: async (_, variables) => {
            notifications.show(showSuccess("Enrollment processed & fee obligations generated!"));
            setProcessModalOpen(false);
            form.reset();
            setActiveSearchId(variables.studentId);
            setSearchStudentId(variables.studentId);
            await queryClient.invalidateQueries({queryKey: ["student-enrollments", variables.studentId]});
        },
        onError: (err: any) => {
            notifications.show(showErr(err));
        },
    });

    const handleSearch = () => {
        if (!searchStudentId.trim()) {
            notifications.show({
                title: "Validation",
                message: "Please enter a trainee registration number!",
                color: "yellow"
            });
            return;
        }
        setActiveSearchId(searchStudentId.trim());
    };

    return (
        <Stack gap="md" className="w-full">
            <Group justify="space-between" align="center">
                <div>
                    <Title order={3}>Trainee Enrollments</Title>
                    <Text size="sm" c="dimmed">Process trainee term advancements and manage auto-generated fee
                        obligations</Text>
                </div>
                {/*<Button leftSection={<FaUserPlus/>} onClick={() => setProcessModalOpen(true)}>*/}
                {/*    Process New Enrollment*/}
                {/*</Button>*/}
            </Group>

            <Card withBorder shadow="sm" radius="md" p="md">
                <Stack gap="md">
                    <Group align="flex-end">
                        <TextInput
                            label="Registration number"
                            placeholder="Enter registration number(e.g., S12345)..."
                            leftSection={<FaSearch className="text-gray-400"/>}
                            value={searchStudentId}
                            onChange={(e) => setSearchStudentId(e.currentTarget.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="max-w-md flex-1"
                        />
                        <Button onClick={handleSearch}>
                            Search Enrollments
                        </Button>
                    </Group>

                    {activeSearchId && (
                        <Text size="sm" fw={600} className="text-gray-700">
                            Showing enrollment history for: <span
                            className="text-blue-600 font-mono">{activeSearchId}</span>
                        </Text>
                    )}

                    <Table.ScrollContainer minWidth={600}>
                        <Table verticalSpacing="sm" striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Enrollment ID</Table.Th>
                                    <Table.Th>Academic Stage</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Generated Obligations</Table.Th>
                                    <Table.Th style={{textAlign: "right"}}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {isLoading ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={5}>
                                            <Stack gap="xs">
                                                <Skeleton height={25}/>
                                                <Skeleton height={25}/>
                                                <Skeleton height={25}/>
                                            </Stack>
                                        </Table.Td>
                                    </Table.Tr>

                                ) : enrollments.length > 0 ? (
                                    enrollments.map((en) => (
                                        <Table.Tr key={en.id}>
                                            <Table.Td
                                                className="font-mono text-xs font-semibold text-blue-600">{en.id}</Table.Td>
                                            <Table.Td className="font-medium">
                                                Year {en.studentYear}, Term {en.studentTerm}
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color={en.status === "active" ? "green" : "gray"}>
                                                    {en.status}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="light" color="blue">
                                                    {en.obligations?.length || 0} obligation(s)
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td style={{textAlign: "right"}}>
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                    color="blue"
                                                    leftSection={<FaEye/>}
                                                    onClick={() => {
                                                        setSelectedEnrollment(en);
                                                        setObligationsModalOpen(true);
                                                    }}
                                                >
                                                    View Obligations
                                                </Button>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : isFetched ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={5} className="text-center text-gray-400 py-6">
                                            No enrollments found for student "{activeSearchId}"
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={5} className="text-center text-gray-400 py-6">
                                            Search by registration number above to view enrollments
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Stack>
            </Card>

            {/* Process Enrollment Modal */}
            <Modal
                opened={processModalOpen}
                onClose={() => setProcessModalOpen(false)}
                title="Process Student Enrollment (Term Advancement)"
                size="lg"
                centered
            >
                <form onSubmit={form.onSubmit((vals) => processMutation.mutate(vals))}>
                    <Stack gap="sm">
                        <Group grow>
                            <TextInput
                                label="Event ID"
                                placeholder="EVT-001"
                                required
                                {...form.getInputProps("eventId")}
                            />
                            <TextInput
                                label={"Registration number"}
                                placeholder="e.g., S12345"
                                required
                                {...form.getInputProps("studentId")}
                            />
                        </Group>

                        <Group grow>
                            <TextInput
                                label="Student Name"
                                placeholder="e.g., John Mwangi"
                                {...form.getInputProps("studentName")}
                            />
                            <TextInput
                                label="Registration Number"
                                placeholder="e.g., 2026-ICT-001"
                                {...form.getInputProps("studentRegNo")}
                            />
                        </Group>

                        <Group grow>
                            <TextInput
                                label="Programme Code"
                                placeholder="e.g., DICT"
                                required
                                {...form.getInputProps("programmeCode")}
                            />
                            <NumberInput
                                label="Student Year"
                                min={1}
                                max={4}
                                required
                                {...form.getInputProps("studentYear")}
                            />
                            <Select
                                label="Student Term"
                                data={[
                                    {value: "1", label: "Term 1"},
                                    {value: "2", label: "Term 2"},
                                    {value: "3", label: "Term 3"},
                                ]}
                                value={form.values.studentTerm.toString()}
                                onChange={(val) => form.setFieldValue("studentTerm", parseInt(val || "1"))}
                            />
                        </Group>

                        <Group grow>
                            <Select
                                label="Sponsorship Category"
                                data={[
                                    {value: "regular", label: "Regular"},
                                    {value: "kuccps", label: "KUCCPS"},
                                    {value: "nita", label: "NITA"},
                                    {value: "employer", label: "Employer"},
                                    {value: "self_sponsored", label: "Self Sponsored"},
                                ]}
                                {...form.getInputProps("studentCategory")}
                            />
                            <Select
                                label="Is new trainee?"
                                data={[
                                    {value: "true", label: "Yes (Apply One-Time Fees)"},
                                    {value: "false", label: "No (Continuing Student)"},
                                ]}
                                value={form.values.isNewStudent ? "true" : "false"}
                                onChange={(val) => form.setFieldValue("isNewStudent", val === "true")}
                            />
                        </Group>

                        <Group grow>
                            <TextInput
                                label="Enrollment Date"
                                type="date"
                                required
                                {...form.getInputProps("enrollmentDate")}
                            />
                            <TextInput
                                label="Enrolled By (Staff ID)"
                                placeholder="e.g., HOD-01"
                                required
                                {...form.getInputProps("enrolledBy")}
                            />
                        </Group>

                        <Group justify="flex-end" mt="md">
                            <Button variant={"default"} onClick={() => setProcessModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type={"submit"} loading={processMutation.isPending}>
                                Process Enrollment
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Obligations Breakdown Modal */}
            <Modal
                opened={obligationsModalOpen}
                onClose={() => setObligationsModalOpen(false)}
                title={`Fee Obligations - Enrollment ${selectedEnrollment?.id || ""}`}
                size="lg"
                centered
            >
                {selectedEnrollment && (
                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">
                                Stage: Year {selectedEnrollment.studentYear}, Term {selectedEnrollment.studentTerm}
                            </Text>
                            <Badge color={selectedEnrollment.status === "active" ? "green" : "gray"}>
                                Status: {selectedEnrollment.status}
                            </Badge>
                        </Group>

                        <Table verticalSpacing="xs" striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Obligation ID</Table.Th>
                                    <Table.Th>Type</Table.Th>
                                    <Table.Th>Total Fee</Table.Th>
                                    <Table.Th>Total Paid</Table.Th>
                                    <Table.Th>Balance</Table.Th>
                                    <Table.Th>State</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {selectedEnrollment.obligations && selectedEnrollment.obligations.length > 0 ? (
                                    selectedEnrollment.obligations.map((ob: EnrollmentObligation) => (
                                        <Table.Tr key={ob.id || ob.obligationId}>
                                            <Table.Td
                                                className="font-mono text-xs text-blue-600">{ob.obligationId || ob.id}</Table.Td>
                                            <Table.Td className="font-semibold">{ob.type}</Table.Td>
                                            <Table.Td>KES {parseFloat(ob.totalAmount as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}</Table.Td>
                                            <Table.Td className="text-emerald-600">
                                                KES {parseFloat(ob.totalPaid as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                                            </Table.Td>
                                            <Table.Td className="text-rose-600 font-bold">
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
                                        <Table.Td colSpan={6} className="text-center text-gray-400 py-4">
                                            No obligations generated for this enrollment
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Stack>
                )}
            </Modal>
        </Stack>
    );
}
