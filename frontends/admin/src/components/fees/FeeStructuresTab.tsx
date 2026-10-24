import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Divider,
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
    Tooltip,
} from "@mantine/core";
import {useForm} from "@mantine/form";
import {notifications} from "@mantine/notifications";
import {FaEye, FaLock, FaPlus, FaSearch, FaTrash} from "react-icons/fa";
import feesService from "@/services/fees.service.ts";
import type {CreateFeeStructureDto, FeeStructureLine, FeeStructureObj} from "@/libs/types/fees.types.ts";
import dayjs from "dayjs";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";

export default function FeeStructuresTab() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [viewLinesModalOpen, setViewLinesModalOpen] = useState(false);
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [closeModalOpen, setCloseModalOpen] = useState(false);

    const [selectedStructure, setSelectedStructure] = useState<FeeStructureObj | null>(null);

    // Close form states
    const [validToDate, setValidToDate] = useState(dayjs().format("YYYY-MM-DD"));

    // Copy form states
    const [newVersionLabel, setNewVersionLabel] = useState("");
    const [copyValidFrom, setCopyValidFrom] = useState(dayjs().format("YYYY-MM-DD"));

    const {data: structures = [], isLoading} = useQuery({
        queryKey: ["fee-structures"],
        queryFn: () => feesService.getFeeStructures(),
    });

    const {data: voteHeads = []} = useQuery({
        queryKey: ["vote-heads"],
        queryFn: () => feesService.getVoteHeads(),
    });

    // Form state for creating fee structure
    const createForm = useForm<CreateFeeStructureDto>({
        initialValues: {
            version_label: "",
            term_number: 1,
            scope_type: "college",
            scope_id: "",
            valid_from: dayjs().format("YYYY-MM-DD"),
            valid_to: null,
            total_amount: 0,
            created_by: "ADMIN",
            lines: [],
        },
        validate: {
            version_label: (val) => (val.trim().length === 0 ? "Version label is required" : null),
            valid_from: (val) => (!val ? "Valid from date is required" : null),
            created_by: (val) => (val.trim().length === 0 ? "Creator ID is required" : null),
        },
    });

    // Dynamic line item addition inside form
    const [tempVoteHeadId, setTempVoteHeadId] = useState<string>("");
    const [tempAmount, setTempAmount] = useState<number | "">(0);

    const handleAddLine = () => {
        if (!tempVoteHeadId) {
            notifications.show({title: "Validation", message: "Select a Vote Head", color: "yellow"});
            return;
        }
        if (typeof tempAmount !== "number" || tempAmount <= 0) {
            notifications.show({title: "Validation", message: "Amount must be greater than 0", color: "yellow"});
            return;
        }

        const vh = voteHeads.find((v) => v.id === tempVoteHeadId);
        const existingLines = createForm.values.lines;

        if (existingLines.some((l) => l.vote_head_id === tempVoteHeadId)) {
            notifications.show({title: "Validation", message: "Vote head already added", color: "yellow"});
            return;
        }

        const newLine: FeeStructureLine = {
            vote_head_id: tempVoteHeadId,
            amount: tempAmount,
            priority_order: vh?.priority_order || 10,
            vote_head_name: vh?.name,
        };

        const updatedLines = [...existingLines, newLine];
        const newTotal = updatedLines.reduce((sum, l) => sum + l.amount, 0);

        createForm.setFieldValue("lines", updatedLines);
        createForm.setFieldValue("total_amount", newTotal);

        setTempVoteHeadId("");
        setTempAmount(0);
    };

    const handleRemoveLine = (index: number) => {
        const updatedLines = createForm.values.lines.filter((_, i) => i !== index);
        const newTotal = updatedLines.reduce((sum, l) => sum + l.amount, 0);
        createForm.setFieldValue("lines", updatedLines);
        createForm.setFieldValue("total_amount", newTotal);
    };

    const createMutation = useMutation({
        mutationFn: (values: CreateFeeStructureDto) => feesService.createFeeStructure(values),
        onSuccess: async () => {
            notifications.show(showSuccess("Fee structure created"));
            await queryClient.invalidateQueries({queryKey: ["fee-structures"]});
            setCreateModalOpen(false);
            createForm.reset();
        },
        onError: (err: any) => {
            notifications.show(showErr(err));
        },
    });

    const closeMutation = useMutation({
        mutationFn: ({id, valid_to}: { id: string; valid_to: string }) =>
            feesService.closeFeeStructure(id, {valid_to, closedBy: "ADMIN"}),
        onSuccess: async () => {
            notifications.show(showSuccess("Fee structure closed"));
            await queryClient.invalidateQueries({queryKey: ["fee-structures"]});
            setCloseModalOpen(false);
            setSelectedStructure(null);
        },
        onError: (err: any) => {
            notifications.show(showErr(err));
        },
    });

    const copyMutation = useMutation({
        mutationFn: ({id, newVersionLabel, validFrom}: { id: string; newVersionLabel: string; validFrom: string }) =>
            feesService.copyFeeStructure(id, {newVersionLabel, validFrom, copiedBy: "ADMIN"}),
        onSuccess: async() => {
            notifications.show(showSuccess("Fee structure copied"));
            await queryClient.invalidateQueries({queryKey: ["fee-structures"]});
            setCopyModalOpen(false);
            setSelectedStructure(null);
        },
        onError: (err: any) => {
            notifications.show(showErr(err));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => feesService.deleteFeeStructure(id),
        onSuccess: async () => {
            notifications.show(showSuccess("Fee structure deleted"));
            await queryClient.invalidateQueries({queryKey: ["fee-structures"]});
        },
        onError: (err: any) => {
            notifications.show(showErr(err));
        },
    });


    const filteredStructures = structures.filter(
        (fs) =>
            fs.version_label.toLowerCase().includes(search.toLowerCase()) ||
            fs.id.toLowerCase().includes(search.toLowerCase()) ||
            (fs.scope_id && fs.scope_id.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <Stack gap="md" className="w-full">
            <Group justify="space-between" align="center">
                <div>
                    <Title order={3}>Fee Structures</Title>
                    <Text size="sm" c="dimmed">Manage fee schedules, term totals, and line breakdowns</Text>
                </div>
                <Button leftSection={<FaPlus/>} onClick={() => setCreateModalOpen(true)}>
                    New Fee Structure
                </Button>
            </Group>

            <Card withBorder shadow="sm" radius="md" p="md">
                <Stack gap="md">
                    <TextInput
                        placeholder="Search structure by ID or Label..."
                        leftSection={<FaSearch className="text-gray-400"/>}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        className="max-w-md"
                    />

                    <Table.ScrollContainer minWidth={700}>
                        <Table verticalSpacing="sm" striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>ID</Table.Th>
                                    <Table.Th>Version Label</Table.Th>
                                    <Table.Th>Term</Table.Th>
                                    <Table.Th>Scope</Table.Th>
                                    <Table.Th>Valid From</Table.Th>
                                    <Table.Th>Valid To</Table.Th>
                                    <Table.Th>Total Amount</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th style={{textAlign: "right"}}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {isLoading ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={9}>
                                            <Stack gap="xs">
                                                <Skeleton height={25}/>
                                                <Skeleton height={25}/>
                                                <Skeleton height={25}/>
                                            </Stack>
                                        </Table.Td>
                                    </Table.Tr>

                                ) : filteredStructures.length > 0 ? (
                                    filteredStructures.map((fs) => (
                                        <Table.Tr key={fs.id}>
                                            <Table.Td className="font-mono text-xs text-blue-600">{fs.id}</Table.Td>
                                            <Table.Td className="font-semibold">{fs.version_label}</Table.Td>
                                            <Table.Td>Term {fs.term_number}</Table.Td>
                                            <Table.Td>
                                                <Badge color="violet" variant="light" tt="capitalize">
                                                    {fs.scope_type} {fs.scope_id ? `(${fs.scope_id})` : ""}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>{fs.valid_from}</Table.Td>
                                            <Table.Td>{fs.valid_to || "∞ (Open)"}</Table.Td>
                                            <Table.Td className="font-bold text-emerald-600">
                                                KES {parseFloat(fs.total_amount as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color={fs.is_active ? "green" : "red"}>
                                                    {fs.is_active ? "Active" : "Closed"}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td style={{textAlign: "right"}}>
                                                <Group gap="xs" justify="flex-end">
                                                    <Tooltip label="View Breakdown Lines">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="blue"
                                                            onClick={() => {
                                                                setSelectedStructure(fs);
                                                                setViewLinesModalOpen(true);
                                                            }}
                                                        >
                                                            <FaEye size={14}/>
                                                        </ActionIcon>
                                                    </Tooltip>

                                                    {/*<Tooltip label="Copy Structure">*/}
                                                    {/*    <ActionIcon*/}
                                                    {/*        variant="light"*/}
                                                    {/*        color="teal"*/}
                                                    {/*        onClick={() => {*/}
                                                    {/*            setSelectedStructure(fs);*/}
                                                    {/*            setNewVersionLabel(`${fs.version_label} (Copy)`);*/}
                                                    {/*            setCopyValidFrom(dayjs().format("YYYY-MM-DD"));*/}
                                                    {/*            setCopyModalOpen(true);*/}
                                                    {/*        }}*/}
                                                    {/*    >*/}
                                                    {/*        <FaCopy size={14}/>*/}
                                                    {/*    </ActionIcon>*/}
                                                    {/*</Tooltip>*/}

                                                    {fs.is_active && (
                                                        <Tooltip label="Close Structure">
                                                            <ActionIcon
                                                                variant="light"
                                                                color="orange"
                                                                onClick={() => {
                                                                    setSelectedStructure(fs);
                                                                    setValidToDate(dayjs().format("YYYY-MM-DD"));
                                                                    setCloseModalOpen(true);
                                                                }}
                                                            >
                                                                <FaLock size={14}/>
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    )}

                                                    <Tooltip label="Delete Structure">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="red"
                                                            onClick={() => {
                                                                if (confirm(`Delete fee structure ${fs.version_label} (${fs.id})?`)) {
                                                                    deleteMutation.mutate(fs.id);
                                                                }
                                                            }}
                                                        >
                                                            <FaTrash size={14}/>
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={9} className="text-center text-gray-400 py-6">
                                            No fee structures found
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Stack>
            </Card>

            {/* Create Fee Structure Modal */}
            <Modal
                opened={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="Create Fee Structure"
                size="lg"
                centered
            >
                <form onSubmit={createForm.onSubmit((vals) => createMutation.mutate(vals))}>
                    <Stack gap="sm">
                        <TextInput
                            label="Version Label"
                            placeholder="e.g., 2026 Gazette Regular"
                            required
                            {...createForm.getInputProps("version_label")}
                        />

                        <Group grow>
                            <Select
                                label="Term Number"
                                data={[
                                    {value: "1", label: "Term 1"},
                                    {value: "2", label: "Term 2"},
                                    {value: "3", label: "Term 3"},
                                ]}
                                value={createForm.values.term_number.toString()}
                                onChange={(val) => createForm.setFieldValue("term_number", parseInt(val || "1"))}
                            />
                            <Select
                                label="Scope Type"
                                data={[
                                    {value: "college", label: "College Wide"},
                                    {value: "department", label: "Department Specific"},
                                    {value: "programme", label: "Programme Specific"},
                                ]}
                                {...createForm.getInputProps("scope_type")}
                            />
                        </Group>

                        <TextInput
                            hidden={createForm.getValues().scope_type === "college"}
                            label="Scope ID"
                            placeholder="Leave blank for college-wide, or enter e.g. DEPT-ICT / PROG-DICT"
                            {...createForm.getInputProps("scope_id")}
                        />

                        <Group grow>
                            <TextInput
                                label="Valid From"
                                type="date"
                                required
                                {...createForm.getInputProps("valid_from")}
                            />
                            <TextInput
                                label="Created By"
                                placeholder="Admin ID"
                                required
                                {...createForm.getInputProps("created_by")}
                            />
                        </Group>

                        <Divider label="Vote Head Breakdown Lines" labelPosition="center" my="xs"/>

                        <Group align="flex-end">
                            <Select
                                label="Select Vote Head"
                                placeholder="Choose vote head..."
                                className="flex-1"
                                data={voteHeads.map((vh) => ({value: vh.id, label: `${vh.name} (${vh.id})`}))}
                                value={tempVoteHeadId}
                                onChange={(val) => setTempVoteHeadId(val || "")}
                            />
                            <NumberInput
                                label="Amount (KES)"
                                placeholder="0.00"
                                className="w-36"
                                min={0}
                                value={tempAmount}
                                onChange={(val) => setTempAmount(typeof val === "number" ? val : 0)}
                            />
                            <Button type="button" variant="light" color="blue" onClick={handleAddLine}>
                                Add Line
                            </Button>
                        </Group>

                        {createForm.values.lines.length > 0 && (
                            <Table verticalSpacing="xs" striped withTableBorder mt="xs">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Vote Head</Table.Th>
                                        <Table.Th>Amount (KES)</Table.Th>
                                        <Table.Th style={{width: 60}}></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {createForm.values.lines.map((line, idx) => (
                                        <Table.Tr key={idx}>
                                            <Table.Td>{line.vote_head_name || line.vote_head_id}</Table.Td>
                                            <Table.Td className="font-semibold">
                                                KES {line.amount.toLocaleString("en-KE", {minimumFractionDigits: 2})}
                                            </Table.Td>
                                            <Table.Td>
                                                <ActionIcon color="red" variant="subtle"
                                                            onClick={() => handleRemoveLine(idx)}>
                                                    <FaTrash size={12}/>
                                                </ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}

                        <Group justify="space-between" align="center" mt="sm">
                            <Text fw={700} size="lg" className="text-emerald-600">
                                Total:
                                KES {createForm.values.total_amount.toLocaleString("en-KE", {minimumFractionDigits: 2})}
                            </Text>
                            <Group gap="xs">
                                <Button variant="default" onClick={() => setCreateModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" color="blue" loading={createMutation.isPending}>
                                    Create Structure
                                </Button>
                            </Group>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* View Lines Breakdown Modal */}
            <Modal
                opened={viewLinesModalOpen}
                onClose={() => setViewLinesModalOpen(false)}
                title={`Fee Structure Breakdown - ${selectedStructure?.version_label || ""}`}
                size="md"
                centered
            >
                {selectedStructure && (
                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Text size="sm"
                                  c="dimmed">Term {selectedStructure.term_number} | {selectedStructure.scope_type}</Text>
                            <Badge color="emerald" size="lg">
                                Total:
                                KES {parseFloat(selectedStructure.total_amount as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                            </Badge>
                        </Group>

                        <Table verticalSpacing="xs" striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Vote Head</Table.Th>
                                    <Table.Th>Priority</Table.Th>
                                    <Table.Th style={{textAlign: "right"}}>Amount (KES)</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {selectedStructure.lines && selectedStructure.lines.length > 0 ? (
                                    selectedStructure.lines.map((line, idx) => (
                                        <Table.Tr key={idx}>
                                            <Table.Td
                                                className="font-medium">{line.vote_head_name || line.vote_head_id}</Table.Td>
                                            <Table.Td>{line.priority_order}</Table.Td>
                                            <Table.Td style={{textAlign: "right"}}
                                                      className="font-semibold text-gray-800">
                                                KES {parseFloat(line.amount as any || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={3} className="text-center text-gray-400 py-4">
                                            No breakdown lines attached
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Stack>
                )}
            </Modal>

            {/* Close Structure Modal */}
            <Modal
                opened={closeModalOpen}
                onClose={() => setCloseModalOpen(false)}
                title="Close Fee Structure"
                centered
            >
                <Stack gap="sm">
                    <Text size="sm">Specify the date when this fee structure expires / closes:</Text>
                    <TextInput
                        label="Valid To Date"
                        type="date"
                        value={validToDate}
                        onChange={(e) => setValidToDate(e.currentTarget.value)}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setCloseModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            color="orange"
                            loading={closeMutation.isPending}
                            onClick={() => {
                                if (selectedStructure) {
                                    closeMutation.mutate({id: selectedStructure.id, valid_to: validToDate});
                                }
                            }}
                        >
                            Close Structure
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Copy Structure Modal */}
            <Modal
                opened={copyModalOpen}
                onClose={() => setCopyModalOpen(false)}
                title="Copy Fee Structure"
                centered
            >
                <Stack gap="sm">
                    <TextInput
                        label="New Version Label"
                        value={newVersionLabel}
                        onChange={(e) => setNewVersionLabel(e.currentTarget.value)}
                        required
                    />
                    <TextInput
                        label="Valid From Date"
                        type="date"
                        value={copyValidFrom}
                        onChange={(e) => setCopyValidFrom(e.currentTarget.value)}
                        required
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setCopyModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            color="teal"
                            loading={copyMutation.isPending}
                            onClick={() => {
                                if (selectedStructure && newVersionLabel.trim()) {
                                    copyMutation.mutate({
                                        id: selectedStructure.id,
                                        newVersionLabel: newVersionLabel.trim(),
                                        validFrom: copyValidFrom,
                                    });
                                }
                            }}
                        >
                            Copy Structure
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}
