import {Button, Table} from "@mantine/core";
import {Link} from "@tanstack/react-router";
import {BsArrowRight} from "react-icons/bs";
import type {SystemUserObj} from "@/libs/types/admission.types.ts";


interface props {
    users: Array<SystemUserObj>
}

export default function UserTable({users}: props) {

    return (
        <Table striped={true} stripedColor={'gray.0'}>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>No. </Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Action</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {users.map((user, i) => (
                    <Table.Tr key={user.id}>
                        <Table.Td>{i + 1}</Table.Td>
                        <Table.Td>{user.name}</Table.Td>
                        <Table.Td>{user.role}</Table.Td>
                        <Table.Td>{user.email}</Table.Td>
                        <Table.Td>
                            <Link to={"/administration/users/manage"} search={{user_id: user.id}}>
                                <Button rightSection={<BsArrowRight/>} variant={'light'}>Manage</Button>
                            </Link>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    )
}

