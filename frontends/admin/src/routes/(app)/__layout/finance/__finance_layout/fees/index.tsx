import {useState} from "react";
import {createFileRoute} from "@tanstack/react-router";
import {Tabs} from "@mantine/core";
import {
    FaBuilding,
    FaChartBar,
    FaChartPie,
    FaCreditCard,
    FaHistory,
    FaList,
    FaReceipt,
    FaUser,
    FaUserGraduate,
} from "react-icons/fa";

import FeesDashboardTab from "@/components/fees/FeesDashboardTab.tsx";
import VoteHeadsTab from "@/components/fees/VoteHeadsTab.tsx";
import FeeStructuresTab from "@/components/fees/FeeStructuresTab.tsx";
import EnrollmentsTab from "@/components/fees/EnrollmentsTab.tsx";
import PaymentsTab from "@/components/fees/PaymentsTab.tsx";
import StudentPositionTab from "@/components/fees/StudentPositionTab.tsx";
import ReceiptsTab from "@/components/fees/ReceiptsTab.tsx";
import ReportsTab from "@/components/fees/ReportsTab.tsx";
import AuditLogsTab from "@/components/fees/AuditLogsTab.tsx";

export const Route = createFileRoute("/(app)/__layout/finance/__finance_layout/fees/")({
    component: FeesRouteComponent,
});

function FeesRouteComponent() {
    const [activeTab, setActiveTab] = useState<string | null>("dashboard");

    return (
        <div className="w-full min-h-[calc(100vh-80px)] p-4 bg-gray-50">
            {/*<Card withBorder shadow="sm" radius="md" p="md" className="bg-white">*/}
            <Tabs defaultValue={activeTab} value={activeTab} onChange={setActiveTab} variant={"default"} classNames={{tab: "font-bold hover:bg-primary-100 data-[active]:bg-primary-500 data-[active]:text-white"}} radius={"md"}>
                <Tabs.List className="mb-6 flex-wrap">
                    <Tabs.Tab value="dashboard" leftSection={<FaChartPie/>}>
                        Dashboard
                    </Tabs.Tab>
                    <Tabs.Tab value="vote-heads" leftSection={<FaList/>}>
                        Vote Heads
                    </Tabs.Tab>
                    <Tabs.Tab value="fee-structures" leftSection={<FaBuilding/>}>
                        Fee Structures
                    </Tabs.Tab>
                    <Tabs.Tab value="enrollments" leftSection={<FaUserGraduate/>}>
                        Enrollments
                    </Tabs.Tab>
                    <Tabs.Tab value="payments" leftSection={<FaCreditCard/>}>
                        Payments
                    </Tabs.Tab>
                    <Tabs.Tab value="students" leftSection={<FaUser/>}>
                        Fee Position
                    </Tabs.Tab>
                    <Tabs.Tab value="receipts" leftSection={<FaReceipt/>}>
                        Receipts
                    </Tabs.Tab>
                    <Tabs.Tab value="reports" leftSection={<FaChartBar/>}>
                        Reports
                    </Tabs.Tab>
                    <Tabs.Tab value="audit-logs" leftSection={<FaHistory/>}>
                        Audit Logs
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="dashboard">
                    <FeesDashboardTab onNavigate={setActiveTab}/>
                </Tabs.Panel>

                <Tabs.Panel value="vote-heads">
                    <VoteHeadsTab/>
                </Tabs.Panel>

                <Tabs.Panel value="fee-structures">
                    <FeeStructuresTab/>
                </Tabs.Panel>

                <Tabs.Panel value="enrollments">
                    <EnrollmentsTab/>
                </Tabs.Panel>

                <Tabs.Panel value="payments">
                    <PaymentsTab/>
                </Tabs.Panel>

                <Tabs.Panel value="students">
                    <StudentPositionTab/>
                </Tabs.Panel>

                <Tabs.Panel value="receipts">
                    <ReceiptsTab/>
                </Tabs.Panel>

                <Tabs.Panel value="reports">
                    <ReportsTab/>
                </Tabs.Panel>

                <Tabs.Panel value="audit-logs">
                    <AuditLogsTab/>
                </Tabs.Panel>
            </Tabs>
            {/*</Card>*/}
        </div>
    );
}
