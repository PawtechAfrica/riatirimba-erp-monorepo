import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Badge,
    Button,
    Card,
    Group,
    Skeleton,
    Stack,
    Table,
    TextInput,
    Title,
    Text,
} from "@mantine/core";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import feesService from "@/services/fees.service.ts";
import type { AuditLogObj } from "@/libs/types/fees.types.ts";
import dayjs from "dayjs";

export default function AuditLogsTab() {
    const [search, setSearch] = useState("");

    const { data: result, isLoading, refetch } = useQuery({
        queryKey: ["audit-logs-list"],
        queryFn: () => feesService.getAuditLogs({ limit: 100 }),
    });

    const logs = result?.data || [];
    const total = result?.total || 0;

    const filteredLogs = logs.filter(
        (log) =>
            log.user_id?.toLowerCase().includes(search.toLowerCase()) ||
            log.action?.toLowerCase().includes(search.toLowerCase()) ||
            log.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
            log.entity_id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Stack gap="md" className="w-full">
            <Group justify="space-between" align="center">
                <div>
                    <Title order={3}>Fees Service Audit Trail</Title>
                    <Text size="sm" c="dimmed">Immutable log of financial transactions, structure modifications, and administrative operations</Text>
                </div>
                <Button leftSection={<FaSyncAlt />} variant="light" onClick={() => refetch()}>
                    Refresh Logs
                </Button>
            </Group>

            <Card withBorder shadow="sm" radius="md" p="md">
                <Stack gap="md">
                    <TextInput
                        placeholder="Search audit logs by User, Action, Entity Type, or Entity ID..."
                        leftSection={<FaSearch className="text-gray-400" />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        className="max-w-md"
                    />

                    <Table.ScrollContainer minWidth={650}>
                        <Table verticalSpacing="sm" striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Timestamp</Table.Th>
                                    <Table.Th>User ID</Table.Th>
                                    <Table.Th>Action Executed</Table.Th>
                                    <Table.Th>Entity Type</Table.Th>
                                    <Table.Th>Entity ID</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {isLoading ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={5}>
                                            <Stack gap="xs">
                                                <Skeleton height={25} />
                                                <Skeleton height={25} />
                                                <Skeleton height={25} />
                                            </Stack>
                                        </Table.Td>
                                    </Table.Tr>

                                ) : filteredLogs.length > 0 ? (
                                    filteredLogs.map((log: AuditLogObj) => (
                                        <Table.Tr key={log.id}>
                                            <Table.Td>{dayjs(log.created_at).format("YYYY-MM-DD HH:mm:ss")}</Table.Td>
                                            <Table.Td className="font-semibold">{log.user_id}</Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    variant="light"
                                                    color={
                                                        log.action?.includes("DELETE") || log.action?.includes("REVERSE")
                                                            ? "red"
                                                            : log.action?.includes("CREATE") || log.action?.includes("POST")
                                                            ? "green"
                                                            : "blue"
                                                    }
                                                >
                                                    {log.action}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>{log.entity_type}</Table.Td>
                                            <Table.Td className="font-mono text-xs text-blue-600">{log.entity_id}</Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={5} className="text-center text-gray-400 py-6">
                                            No audit logs matched search criteria
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>

                    <Text size="xs" c="dimmed">
                        Total Recorded Audit Logs: {total} (showing latest {filteredLogs.length})
                    </Text>
                </Stack>
            </Card>
        </Stack>
    );
}
