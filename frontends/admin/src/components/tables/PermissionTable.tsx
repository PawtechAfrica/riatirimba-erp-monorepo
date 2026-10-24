import {Button, Table} from "@mantine/core";
import type {PermissionObj} from "@/libs/types/admission.types.ts";
import {GoArrowRight} from "react-icons/go";
import {Link} from "@tanstack/react-router";

interface props {
    permissions: PermissionObj[];
}

export default function PermissionTable({permissions}: props) {

    return (
        <Table striped={true} stripedColor={'gray.1'}>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>No. </Table.Th>
                    <Table.Th>Permission</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Action</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {permissions.map((permission, i) => (
                    <Table.Tr key={permission.id}>
                        <Table.Td>{i + 1}</Table.Td>
                        <Table.Td>{permission.name}</Table.Td>
                        <Table.Td>{permission.description}</Table.Td>
                        <Table.Td>
                            <Link to={"/administration/permissions/manage"}
                                  search={{permission_id: permission.id}}>
                                <Button variant={'light'} rightSection={<GoArrowRight/>}>Manage</Button>
                            </Link>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    )

}

