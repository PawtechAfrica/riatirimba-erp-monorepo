import {useQuery} from "@tanstack/react-query";
import {Badge, Button, Card, Group, SimpleGrid, Skeleton, Stack, Table, Text, Title} from "@mantine/core";
import {FaChartBar, FaCreditCard, FaHistory, FaReceipt, FaUserGraduate} from "react-icons/fa";
import feesService from "@/services/fees.service.ts";
import dayjs from "dayjs";


interface FeesDashboardTabProps {
    onNavigate: (tab: string) => void;
}

export default function FeesDashboardTab({onNavigate}: FeesDashboardTabProps) {
    const todayStr = dayjs().format("YYYY-MM-DD");

    const queryDashboard = useQuery({
        queryKey: ["fees-dashboard-data", todayStr],
        queryFn: async () => {
            const [outstanding, stats, daily] = await Promise.all([
                feesService.getOutstanding().catch(() => []),
                feesService.getAuditLogStats().catch(() => ({total: 0, today: 0, recent: []})),
                feesService.getDailyCollection(todayStr).catch(() => ({
                    summary: {
                        totalCollected: 0,
                        totalTransactions: 0
                    }
                })),
            ]);

            const totalOutstanding = Array.isArray(outstanding)
                ? outstanding.reduce((sum, s) => sum + parseFloat(s.total_outstanding || 0), 0)
                : 0;

            return {
                outstanding,
                totalOutstanding,
                stats,
                daily,
            };
        },
        refetchInterval: 60000,
    });

    const isLoading = queryDashboard.isLoading;
    const data = queryDashboard.data;

    return (
        <Stack gap="lg" className="w-full">
            <Group justify="space-between" align="center">
                <div>
                    <Title order={3} className="text-gray-800">Fees Executive Dashboard</Title>
                    <Text size="sm" c="dimmed">Overview of collections, outstanding balances, and system activity</Text>
                </div>
                <Badge color="green" variant="light" size="lg"
                       leftSection={<span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1"/>}>
                    System Operational
                </Badge>
            </Group>

            <SimpleGrid cols={{base: 1, sm: 2, md: 4}} spacing="md">
                <Card withBorder shadow="sm" radius="md" p="md">
                    <Stack gap="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Total Outstanding
                        </Text>
                        {isLoading ? (
                            <Skeleton height={28} width="60%"/>
                        ) : (
                            <Text size="xl" fw={700} className="text-rose-600">
                                KES {(data?.totalOutstanding || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                            </Text>
                        )}
                        <Text size="xs" c="dimmed">
                            {data?.outstanding?.length || 0} Trainees with balance
                        </Text>
                    </Stack>
                </Card>

                <Card withBorder shadow="sm" radius="md" p="md">
                    <Stack gap="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Today's Collections
                        </Text>
                        {isLoading ? (
                            <Skeleton height={28} width="60%"/>
                        ) : (
                            <Text size="xl" fw={700} className="text-emerald-600">
                                KES {(data?.daily?.summary?.totalCollected || 0).toLocaleString("en-KE", {minimumFractionDigits: 2})}
                            </Text>
                        )}
                        <Text size="xs" c="dimmed">
                            {data?.daily?.summary?.totalTransactions || 0} transaction(s) today
                        </Text>
                    </Stack>
                </Card>

                <Card withBorder shadow="sm" radius="md" p="md">
                    <Stack gap="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Total Audit Logs
                        </Text>
                        {isLoading ? (
                            <Skeleton height={28} width="60%"/>
                        ) : (
                            <Text size="xl" fw={700} className="text-blue-600">
                                {(data?.stats?.total || 0).toLocaleString()}
                            </Text>
                        )}
                        <Text size="xs" c="dimmed">
                            {data?.stats?.today || 0} logged today
                        </Text>
                    </Stack>
                </Card>

                <Card withBorder shadow="sm" radius="md" p="md">
                    <Stack gap="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Service Health
                        </Text>
                        <Text size="xl" fw={700} className="text-slate-800">
                            Online
                        </Text>
                        <Text size="xs" c="dimmed">
                            Postgres & Fees API active
                        </Text>
                    </Stack>
                </Card>
            </SimpleGrid>

            <Card withBorder shadow="sm" radius="md" p="md">
                <Stack gap="md">
                    <Title order={4} className="text-gray-700">Quick Actions</Title>
                    <Group gap="sm">
                        <Button
                            leftSection={<FaUserGraduate/>}
                            variant="light"
                            onClick={() => onNavigate("enrollments")}
                        >
                            New Enrollment
                        </Button>
                        <Button
                            leftSection={<FaCreditCard/>}
                            variant={"light"}
                            color={"emerald"}
                            onClick={() => onNavigate("payments")}
                        >
                            Post Payment
                        </Button>
                        <Button
                            leftSection={<FaReceipt/>}
                            variant="light"
                            color="orange"
                            onClick={() => onNavigate("receipts")}
                        >
                            Generate Receipt
                        </Button>
                        <Button
                            leftSection={<FaChartBar/>}
                            variant="light"
                            color="indigo"
                            onClick={() => onNavigate("reports")}
                        >
                            View Reports
                        </Button>
                    </Group>
                </Stack>
            </Card>

            <Card withBorder shadow="sm" radius="md" p="md">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Title order={4} className="text-gray-700">Recent Audit Activity</Title>
                        <Button
                            size="xs"
                            variant="subtle"
                            leftSection={<FaHistory/>}
                            onClick={() => onNavigate("audit-logs")}
                        >
                            View All Logs
                        </Button>
                    </Group>

                    <Table.ScrollContainer minWidth={500}>
                        <Table verticalSpacing="xs" striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Timestamp</Table.Th>
                                    <Table.Th>User</Table.Th>
                                    <Table.Th>Action</Table.Th>
                                    <Table.Th>Entity Type</Table.Th>
                                    <Table.Th>Entity ID</Table.Th>
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

                                ) : data?.stats?.recent && data.stats.recent.length > 0 ? (
                                    data.stats.recent.slice(0, 5).map((log) => (
                                        <Table.Tr key={log.id}>
                                            <Table.Td>{dayjs(log.created_at).format("YYYY-MM-DD HH:mm:ss")}</Table.Td>
                                            <Table.Td>{log.user_id}</Table.Td>
                                            <Table.Td>
                                                <Badge size="sm" variant="light" color="blue">
                                                    {log.action}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>{log.entity_type}</Table.Td>
                                            <Table.Td className="font-mono text-xs">{log.entity_id}</Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={5} className="text-center text-gray-400 py-4">
                                            No recent activity logged
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Stack>
            </Card>
        </Stack>
    );
}
