import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    TextInput,
    Title,
    ActionIcon,
    Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { showErr, showSuccess } from "@/utils/notification.util.tsx";
import { FaPlus, FaTrash, FaPowerOff, FaPencilAlt, FaSearch } from "react-icons/fa";
import feesService from "@/services/fees.service.ts";
import type { VoteHeadObj, CreateVoteHeadDto } from "@/libs/types/fees.types.ts";
import {FaPencil} from "react-icons/fa6";

export default function VoteHeadsTab() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingVoteHead, setEditingVoteHead] = useState<VoteHeadObj | null>(null);

    const { data: voteHeads = [], isLoading } = useQuery({
        queryKey: ["vote-heads"],
        queryFn: () => feesService.getVoteHeads(),
    });

    const form = useForm<CreateVoteHeadDto>({
        initialValues: {
            id: "",
            name: "",
            description: "",
            priority_order: 10,
            is_one_time: false,
            is_refundable: false,
            is_active: true,
        },
        validate: {
            id: (val) => (val.trim().length === 0 ? "ID is required" : null),
            name: (val) => (val.trim().length === 0 ? "Name is required" : null),
            priority_order: (val) => (val === undefined || val === null ? "Priority is required" : null),
        },
    });

    const createMutation = useMutation({
        mutationFn: (values: CreateVoteHeadDto) => feesService.createVoteHead(values),
        onSuccess: () => {
            notifications.show(showSuccess("Vote Head created successfully"));
            queryClient.invalidateQueries({ queryKey: ["vote-heads"] });
            setModalOpen(false);
            form.reset();
        },
        onError: (err: any) => {
            notifications.show(showErr(err));
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: string; values: Partial<CreateVoteHeadDto> }) =>
            feesService.updateVoteHead(id, values),
        onSuccess: () => {
            notifications.show(showSuccess("Vote Head updated successfully"));
            queryClient.invalidateQueries({ queryKey: ["vote-heads"] });
            setModalOpen(false);
            setEditingVoteHead(null);
            form.reset();
        },
        onError: (err: any) => {
            notifications.show(showErr(err));
        },
    });

    const toggleMutation = useMutation({
        mutationFn: (id: string) => feesService.toggleVoteHead(id),
        onSuccess: () => {
            notifications.show(showSuccess("Status toggled successfully"));
            queryClient.invalidateQueries({ queryKey: ["vote-heads"] });
        },
        onError: (err: any) => {
            notifications.show(showErr(err));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => feesService.deleteVoteHead(id),
        onSuccess: () => {
            notifications.show(showSuccess("Vote Head deleted successfully"));
            queryClient.invalidateQueries({ queryKey: ["vote-heads"] });
        },
        onError: (err: any) => {
            notifications.show(showErr(err));
        },
    });


    const handleOpenCreate = () => {
        setEditingVoteHead(null);
        form.setValues({
            id: "",
            name: "",
            description: "",
            priority_order: 10,
            is_one_time: false,
            is_refundable: false,
            is_active: true,
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (vh: VoteHeadObj) => {
        setEditingVoteHead(vh);
        form.setValues({
            id: vh.id,
            name: vh.name,
            description: vh.description || "",
            priority_order: vh.priority_order,
            is_one_time: vh.is_one_time,
            is_refundable: vh.is_refundable,
            is_active: vh.is_active,
        });
        setModalOpen(true);
    };

    const handleSubmit = (values: CreateVoteHeadDto) => {
        if (editingVoteHead) {
            updateMutation.mutate({ id: editingVoteHead.id, values });
        } else {
            createMutation.mutate(values);
        }
    };

    const filteredVoteHeads = voteHeads.filter(
        (vh) =>
            vh.name.toLowerCase().includes(search.toLowerCase()) ||
            vh.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Stack gap="md" className="w-full">
            <Group justify="space-between" align="center">
                <div>
                    <Title order={3}>Vote Heads Management</Title>
                    <p className="text-sm text-gray-500">Configure fee revenue accounts and priority orders</p>
                </div>
                <Button leftSection={<FaPlus />} color={"primary"} onClick={handleOpenCreate}>
                    New Vote Head
                </Button>
            </Group>

            <Card withBorder shadow="sm" radius="md" p="md">
                <Stack gap="md">
                    <TextInput
                        placeholder={"Search vote head by ID or Name..."}
                        leftSection={<FaSearch className="text-gray-400" />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        className={"max-w-md"}
                    />

                    <Table.ScrollContainer minWidth={600}>
                        <Table verticalSpacing="sm" striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Vote Head ID</Table.Th>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th>Description</Table.Th>
                                    <Table.Th>Priority</Table.Th>
                                    <Table.Th>Type</Table.Th>
                                    <Table.Th>Refundable</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {isLoading ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={8}>
                                            <Stack gap="xs">
                                                <Skeleton height={25} />
                                                <Skeleton height={25} />
                                                <Skeleton height={25} />
                                            </Stack>
                                        </Table.Td>
                                    </Table.Tr>

                                ) : filteredVoteHeads.length > 0 ? (
                                    filteredVoteHeads.map((vh) => (
                                        <Table.Tr key={vh.id}>
                                            <Table.Td className="font-mono font-medium text-blue-600">{vh.id}</Table.Td>
                                            <Table.Td className="font-semibold">{vh.name}</Table.Td>
                                            <Table.Td className="text-gray-500 text-sm">{vh.description || "N/A"}</Table.Td>
                                            <Table.Td>{vh.priority_order}</Table.Td>
                                            <Table.Td>
                                                <Badge color={vh.is_one_time ? "orange" : "gray"} variant="light">
                                                    {vh.is_one_time ? "One-Time" : "Recurring"}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color={vh.is_refundable ? "teal" : "gray"} variant="outline">
                                                    {vh.is_refundable ? "Yes" : "No"}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color={vh.is_active ? "green" : "red"}>
                                                    {vh.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: "right" }}>
                                                <Group gap="xs" justify="flex-end">
                                                    <Tooltip label="Edit Vote Head">
                                                        <ActionIcon variant="light" color="blue" onClick={() => handleOpenEdit(vh)}>
                                                            <FaPencilAlt size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>

                                                    <Tooltip label={vh.is_active ? "Deactivate" : "Activate"}>
                                                        <ActionIcon
                                                            variant="light"
                                                            color={vh.is_active ? "orange" : "green"}
                                                            onClick={() => toggleMutation.mutate(vh.id)}
                                                        >
                                                            <FaPowerOff size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>

                                                    <Tooltip label="Delete Vote Head">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="red"
                                                            onClick={() => {
                                                                if (confirm(`Delete vote head ${vh.name} (${vh.id})?`)) {
                                                                    deleteMutation.mutate(vh.id);
                                                                }
                                                            }}
                                                        >
                                                            <FaTrash size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={8} className="text-center text-gray-400 py-6">
                                            No vote heads found
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Stack>
            </Card>

            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                classNames={{title: "text-xl font-bold"}}
                title={editingVoteHead ? "Edit Vote Head" : "Create New Vote Head"}
                centered
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="sm">
                        <TextInput
                            label="Vote Head ID"
                            placeholder="e.g., VH-TUI or VH-ACT"
                            disabled={!!editingVoteHead}
                            required
                            {...form.getInputProps("id")}
                        />

                        <TextInput
                            label="Vote Head Name"
                            placeholder="e.g., Tuition Fee"
                            required
                            {...form.getInputProps("name")}
                        />

                        <TextInput
                            label="Description"
                            placeholder="Optional description"
                            {...form.getInputProps("description")}
                        />

                        <NumberInput
                            label="Priority Order"
                            placeholder="e.g., 10 (Lower = higher payment allocation priority)"
                            min={1}
                            required
                            {...form.getInputProps("priority_order")}
                        />

                        <Select
                            label="Payment Frequency"
                            data={[
                                { value: "false", label: "Recurring (Every Term)" },
                                { value: "true", label: "One-Time (New Students)" },
                            ]}
                            value={form.values.is_one_time ? "true" : "false"}
                            onChange={(val) => form.setFieldValue("is_one_time", val === "true")}
                        />

                        <Select
                            label="Refundable"
                            data={[
                                { value: "false", label: "No (Non-refundable)" },
                                { value: "true", label: "Yes (Refundable Deposit)" },
                            ]}
                            value={form.values.is_refundable ? "true" : "false"}
                            onChange={(val) => form.setFieldValue("is_refundable", val === "true")}
                        />

                        <Select
                            label="Status"
                            data={[
                                { value: "true", label: "Active" },
                                { value: "false", label: "Inactive" },
                            ]}
                            value={form.values.is_active ? "true" : "false"}
                            onChange={(val) => form.setFieldValue("is_active", val === "true")}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button
                                leftSection={<FaPencil />}
                                type="submit"
                                loading={createMutation.isPending || updateMutation.isPending}
                            >
                                {editingVoteHead ? "Save Changes" : "Create Vote Head"}
                            </Button>
                            <Button variant="default" onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Stack>
    );
}
