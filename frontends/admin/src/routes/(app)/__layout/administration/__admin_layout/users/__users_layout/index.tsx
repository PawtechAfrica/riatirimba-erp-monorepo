import {createFileRoute} from '@tanstack/react-router'
import {Space, TextInput, Title} from "@mantine/core";
import {BiSearch} from "react-icons/bi";
import UserTable from "@/components/tables/UserTable.tsx";
import {useStore} from "zustand/react";
import useUserStore from "@/stores/useUserStore.ts";
import {useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";

export const Route = createFileRoute(
    '/(app)/__layout/administration/__admin_layout/users/__users_layout/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const {users, fetchUsers} = useStore(useUserStore)
    const [term, setTerm] = useState("")
    const list = useMemo(() => {
        const userList = [...users.values()]
        if (term.length > 1)
            return userList.filter(u => JSON.stringify(u)?.toLowerCase().includes(term.toLowerCase()))
        return userList
    }, [users, term])

    useQuery({
        queryKey: ['fetch-users', users.size],
        queryFn: fetchUsers,
        staleTime: 60 * 60 * 1000, // 1 hour
    })
    return (
        <div>
            <div className={"grid gap-2 auto-rows-max shadow bg-white p-4"}>
                <Title order={5}>Filters</Title>
                <div>
                    <TextInput
                        value={term}
                        placeholder={"Find by name or role"} leftSection={<BiSearch/>}
                        onChange={({target: {value}}) => setTerm(value)}
                    />
                </div>
            </div>
            <Space h={10}/>
            <div className={"p-2 bg-white shadow rounded"}>
                <UserTable users={list}/>
            </div>
        </div>
    )
}
