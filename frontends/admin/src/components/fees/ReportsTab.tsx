import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {Badge, Card, Group, SimpleGrid, Skeleton, Stack, Table, Tabs, Text, Title,} from "@mantine/core";

import {FaCalendarAlt, FaCalendarDay, FaGraduationCap, FaHistory} from "react-icons/fa";
import feesService from "@/services/fees.service.ts";
import dayjs from "dayjs";

export default function ReportsTab() {
    const todayStr = dayjs().format("YYYY-MM-DD");
    const monthStartStr = dayjs().startOf("month").format("YYYY-MM-DD");
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1;

    const [subTab, setSubTab] = useState<string>("daily");

    // Primary summary query
    const { data: reportsSummary, isLoading } = useQuery({
        queryKey: ["reports-summary-overview", todayStr],
        queryFn: async () => {
            const [daily, monthly, aging] = await Promise.all([
                feesService.getDailyCollection(todayStr).catch(() => null),
                feesService.getMonthlySummary(currentYear, currentMonth).catch(() => null),
                feesService.getAgingReport().catch(() => null),
            ]);

            return { daily, monthly, aging };
        },
    });

    // Detail queries based on selected subTab
    const { data: programmeReport, isLoading: isProgrammeLoading } = useQuery({
        queryKey: ["reports-programme-collection", monthStartStr, todayStr],
        queryFn: () => feesService.getProgrammeCollection(monthStartStr, todayStr),
        enabled: subTab === "programme",
    });

    const daily = reportsSummary?.daily;
    const monthly = reportsSummary?.monthly;
    const aging = reportsSummary?.aging;

    return (
        <Stack gap="md" className="w-full">
            <Group justify="space-between" align="center">
                <div>
                    <Title order={3}>Financial Reports & Intelligence</Title>
                    <Text size="sm" c="dimmed">Comprehensive collection statistics, aging analysis, and programme revenue totals</Text>
                </div>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                <Card withBorder shadow="sm" radius="md" p="md">
                    <Stack gap="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Today's Collections
                        </Text>
                        {isLoading ? (
                            <Skeleton height={28} width="60%" />
                        ) : (
                            <Text size="xl" fw={700} className="text-emerald-600">
                                KES {parseFloat(daily?.summary?.totalCollected as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                            </Text>
                        )}
                        <Text size="xs" c="dimmed">
                            {daily?.summary?.totalTransactions || 0} transaction(s)
                        </Text>
                    </Stack>
                </Card>

                <Card withBorder shadow="sm" radius="md" p="md">
                    <Stack gap="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Month-to-Date
                        </Text>
                        {isLoading ? (
                            <Skeleton height={28} width="60%" />
                        ) : (
                            <Text size="xl" fw={700} className="text-blue-600">
                                KES {parseFloat(monthly?.summary?.totalCollected as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                            </Text>
                        )}
                        <Text size="xs" c="dimmed">
                            {monthly?.summary?.totalTransactions || 0} transaction(s) this month
                        </Text>
                    </Stack>
                </Card>

                <Card withBorder shadow="sm" radius="md" p="md">
                    <Stack gap="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Total Outstanding
                        </Text>
                        {isLoading ? (
                            <Skeleton height={28} width="60%" />
                        ) : (
                            <Text size="xl" fw={700} className="text-amber-600">
                                KES {parseFloat(aging?.totalOutstanding as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                            </Text>
                        )}
                        <Text size="xs" c="dimmed">
                            Across {aging?.totalStudents || 0} trainee{(aging?.totalStudents || 0) > 1 ? "s" : ""}
                        </Text>
                    </Stack>
                </Card>

                <Card withBorder shadow="sm" radius="md" p="md">
                    <Stack gap="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Overdue (90+ Days)
                        </Text>
                        {isLoading ? (
                            <Skeleton height={28} width="60%" />
                        ) : (
                            <Text size="xl" fw={700} className="text-rose-600">
                                KES {parseFloat(aging?.agingBuckets?.["90+"]?.total as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                            </Text>
                        )}
                        <Text size="xs" c="dimmed">
                            {aging?.agingBuckets?.["90+"]?.count || 0} overdue obligation(s)
                        </Text>
                    </Stack>
                </Card>
            </SimpleGrid>

            <Card withBorder shadow="sm" radius="md" p="md">
                <Tabs value={subTab} onChange={(val) => setSubTab(val || "daily")}>
                    <Tabs.List mb="md">
                        <Tabs.Tab value="daily" leftSection={<FaCalendarDay />}>
                            Daily Collection
                        </Tabs.Tab>
                        <Tabs.Tab value="monthly" leftSection={<FaCalendarAlt />}>
                            Monthly Summary
                        </Tabs.Tab>
                        <Tabs.Tab value="aging" leftSection={<FaHistory />}>
                            Aging Buckets
                        </Tabs.Tab>
                        <Tabs.Tab value="programme" leftSection={<FaGraduationCap />}>
                            Programme Collection
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="daily">
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Title order={4}>Daily Collections Breakdown ({daily?.date || todayStr})</Title>
                                <Badge size="lg" color="emerald">
                                    Total: KES {parseFloat(daily?.summary?.totalCollected as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                </Badge>
                            </Group>

                            <Table verticalSpacing="xs" striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Payment Mode</Table.Th>
                                        <Table.Th>Transactions Count</Table.Th>
                                        <Table.Th style={{ textAlign: "right" }}>Total Amount (KES)</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {daily?.byPaymentMode && Object.keys(daily.byPaymentMode).length > 0 ? (
                                        Object.entries(daily.byPaymentMode).map(([mode, item]) => (
                                            <Table.Tr key={mode}>
                                                <Table.Td className="font-semibold capitalize">{mode}</Table.Td>
                                                <Table.Td>{item.count}</Table.Td>
                                                <Table.Td style={{ textAlign: "right" }} className="font-bold text-emerald-600">
                                                    KES {parseFloat(item.total as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    ) : (
                                        <Table.Tr>
                                            <Table.Td colSpan={3} className="text-center text-gray-400 py-4">
                                                No payments recorded today
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="monthly">
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Title order={4}>Monthly Collections Summary ({monthly?.month || `${currentYear}-${currentMonth}`})</Title>
                                <Badge size="lg" variant={"light"}>
                                    Total: KES {parseFloat(monthly?.summary?.totalCollected as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                </Badge>
                            </Group>

                            <Table verticalSpacing="xs" striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Week Period</Table.Th>
                                        <Table.Th>Transactions Count</Table.Th>
                                        <Table.Th style={{ textAlign: "right" }}>Total Collected (KES)</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {monthly?.weeklyBreakdown && Object.keys(monthly.weeklyBreakdown).length > 0 ? (
                                        Object.entries(monthly.weeklyBreakdown).map(([week, item]) => (
                                            <Table.Tr key={week}>
                                                <Table.Td className="font-semibold">{week}</Table.Td>
                                                <Table.Td>{item.count}</Table.Td>
                                                <Table.Td style={{ textAlign: "right" }} className="font-bold text-blue-600">
                                                    KES {parseFloat(item.total as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    ) : (
                                        <Table.Tr>
                                            <Table.Td colSpan={3} className="text-center text-gray-400 py-4">
                                                No weekly breakdown data available
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="aging">
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Title order={4}>Aging Analysis Breakdown</Title>
                                <Badge size="lg" color="amber">
                                    Outstanding: KES {parseFloat(aging?.totalOutstanding as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                </Badge>
                            </Group>

                            <Table verticalSpacing="xs" striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Aging Bracket</Table.Th>
                                        <Table.Th>Obligations Count</Table.Th>
                                        <Table.Th>Affected Trainees</Table.Th>
                                        <Table.Th style={{ textAlign: "right" }}>Total Overdue (KES)</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {aging?.agingBuckets && Object.keys(aging.agingBuckets).length > 0 ? (
                                        Object.entries(aging.agingBuckets).map(([bucket, item]) => (
                                            <Table.Tr key={bucket}>
                                                <Table.Td className="font-semibold">{bucket} Days</Table.Td>
                                                <Table.Td>{item.count}</Table.Td>
                                                <Table.Td>{item.students?.length || 0}</Table.Td>
                                                <Table.Td style={{ textAlign: "right" }} className="font-bold text-rose-600">
                                                    KES {parseFloat(item.total as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    ) : (
                                        <Table.Tr>
                                            <Table.Td colSpan={4} className="text-center text-gray-400 py-4">
                                                No aging data available
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="programme">
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Title order={4}>Programme Revenue Collections</Title>
                                <Badge size="lg" color="violet">
                                    Total: KES {parseFloat(programmeReport?.summary?.totalCollected as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                </Badge>
                            </Group>

                            <Table verticalSpacing="xs" striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Programme Code</Table.Th>
                                        <Table.Th>Enrolled Students</Table.Th>
                                        <Table.Th>Transactions</Table.Th>
                                        <Table.Th style={{ textAlign: "right" }}>Total Paid (KES)</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {isProgrammeLoading ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={4}>
                                                <Stack gap="xs">
                                                    <Skeleton height={25} />
                                                    <Skeleton height={25} />
                                                    <Skeleton height={25} />
                                                </Stack>
                                            </Table.Td>
                                        </Table.Tr>

                                    ) : programmeReport?.programmes && programmeReport.programmes.length > 0 ? (
                                        programmeReport.programmes.map((p) => (
                                            <Table.Tr key={p.programmeCode}>
                                                <Table.Td className="font-mono font-bold text-blue-600">{p.programmeCode}</Table.Td>
                                                <Table.Td>{p.studentCount || 0}</Table.Td>
                                                <Table.Td>{p.transactionCount || 0}</Table.Td>
                                                <Table.Td style={{ textAlign: "right" }} className="font-bold text-emerald-600">
                                                    KES {parseFloat(p.totalPaid as any || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    ) : (
                                        <Table.Tr>
                                            <Table.Td colSpan={4} className="text-center text-gray-400 py-4">
                                                No programme collection data found for this period
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Card>
        </Stack>
    );
}
