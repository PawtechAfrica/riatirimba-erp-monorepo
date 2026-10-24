import {type IntakeObj, IntakeStatus} from "@/libs/types/admission.types.ts";
import {Badge, Button, Table} from "@mantine/core";
import dayjs from "dayjs";
import {FaCog} from "react-icons/fa";
import {Link} from "@tanstack/react-router";


interface props {
    intakes: IntakeObj[]
}

export default function IntakesTable({intakes}: props) {

    const intakeColor = (intakeStatus: IntakeStatus) => {
        if (intakeStatus === 'open')
            return "green"
        if (intakeStatus === 'overdue')
            return "accent"
        if (intakeStatus === "closed")
            return "orange"
        return "primary"
    }
    return (
        <Table className={'bg-white'}>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Code</Table.Th>
                    <Table.Th>Title</Table.Th>
                    <Table.Th>Opening</Table.Th>
                    <Table.Th>Closing</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Action</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {intakes.map((intake) => (
                    <Table.Tr key={intake.id}>
                        <Table.Td>{intake.periodYearKey}</Table.Td>
                        <Table.Td>{intake.readable}</Table.Td>
                        <Table.Td>{dayjs(intake.opens).format("DD ddd MMM YYYY")}</Table.Td>
                        <Table.Td>{intake.closes ? dayjs(intake.closes).format("DD ddd MMM YYYY") : "NOT_SPECIFIED"}</Table.Td>
                        <Table.Td>
                            <Badge variant={'light'} color={intakeColor(intake.status)}>
                                {intake.status}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            <Link to={"/registry/admission/intakes/manage"} search={{intake_key: intake.periodYearKey}}>
                                <Button variant={'subtle'} leftSection={<FaCog/>} size={'xs'} onClick={() => {
                                }}>
                                    Manage
                                </Button>
                            </Link>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    )
}

