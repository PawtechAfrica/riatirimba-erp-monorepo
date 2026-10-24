import {createFileRoute} from '@tanstack/react-router'
import {Button, Checkbox, Divider, Space, TextInput, Title} from "@mantine/core";
import {useStore} from "zustand/react";
import usePermissionStore from "@/stores/usePermissionStore.ts";
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import useUserStore from "@/stores/useUserStore.ts";
import {useMutation} from "@tanstack/react-query";
import type {SystemUserObj} from "@/libs/types/admission.types.ts";
import FinalPageLayout from "@/components/layouts/FinalPageLayout.tsx";

export const Route = createFileRoute(
    '/(app)/__layout/administration/__admin_layout/users/__users_layout/manage',
)({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            user_id: "user_id" in search ? search.user_id as number : null,
        }
    }
})

function RouteComponent() {
    const {permissionIds, fetchPermissions, fetched} = useStore(usePermissionStore)
    const {users, createUser, editUser, fetchUserById} = useStore(useUserStore)
    const {user_id} = Route.useSearch()

    useEffect(() => {
        if (!fetched && permissionIds.size < 1)
            fetchPermissions().catch(err => notifications.show(showErr(err)))
    }, [])
    const [user, setUser] = useState<CreateSystemUserObj>({
        username: "",
        email: "",
        role: "",
        permissions: new Set(),
    })

    const updateLocalState = useCallback((userObj: SystemUserObj) => {
        setUser(prev => ({
            ...prev,
            id: userObj.id,
            email: userObj.email,
            username: userObj.name,
            role: userObj.role,
            permissions: new Set(userObj.permissions?.map(p => p.id))
        }))
    }, [])

    useEffect(() => {
        if (user_id) {
            let found = users.get(user_id)
            if (found) {
                // get permissions
                updateLocalState(found)
            } else {
                fetchUserById(user_id)
                    .then(result => updateLocalState(result))
                    .catch(err => notifications.show(showErr(err)))
            }
        }
    }, []);

    const create = useMutation({
        mutationKey: ["edit-user"],
        mutationFn: () => createUser(user),
        onSuccess: () => notifications.show(showSuccess("User created successfully.")),
        onError: err => notifications.show(showErr(err))
    })

    const edit = useMutation({
        mutationKey: ["edit-user"],
        mutationFn: () => editUser(user),
        onSuccess: () => notifications.show(showSuccess("User updated successfully.")),
        onError: err => notifications.show(showErr(err))
    })

    const change = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser(prev => ({...prev, [e.target.name]: e.target.value}))
    }
    return (
        <FinalPageLayout className={"p-4 bg-white grid auto-rows-max gap-2"}>
            <div className={"flex flex-wrap gap-10 w-full justify-evenly"}>
                <div className={"flex-1 min-w-[300px] grid gap-2 auto-rows-max"}>
                    <Title order={5}>{user_id ? "Edit" : "New"} user</Title>
                    <TextInput
                        label={"Full name"}
                        placeholder={"Name"}
                        name={'username'}
                        value={user.username}
                        onChange={change}
                    />
                    <TextInput
                        label={"Email"}
                        placeholder={"Email"}
                        name={'email'}
                        value={user.email}
                        onChange={change}
                    />
                    <TextInput
                        label={'Role'}
                        placeholder={'Role of user'}
                        // TODO: look into this data={["Applicant", "Student"]}
                        name={'role'}
                        value={user.role}
                        onChange={change}
                    />
                </div>
                <div className={'flex-1 grid gap-2 auto-rows-max'}>
                    <Title order={5}>Permissions</Title>
                    <Checkbox onChange={({target: {checked}}) => setUser(prev => ({
                        ...prev,
                        permissions: !checked ? new Set() : new Set([...permissionIds.values()].map(p => p.id))
                    }))} checked={permissionIds.size === user.permissions.size} label={"All permissions"}/>
                    <Divider/>
                    {[...permissionIds.values()].map(permission => (
                        <Checkbox
                            checked={user.permissions.has(permission.id)}
                            onChange={({target: {checked}}) => {
                                const newSet = new Set(user.permissions)
                                checked ? newSet.add(permission.id) : newSet.delete(permission.id)
                                setUser(prev => ({...prev, permissions: newSet}))
                            }}
                            key={permission.id} value={permission.id} label={permission.name}
                            description={permission.description}/>
                    ))}
                </div>
            </div>
            <Space h={10}/>
            <div className={'sticky bottom-5 bg-white z-20 flex gap-2'}>
                <Button onClick={() => user_id ? edit.mutate() : create.mutate()}>
                    Submit
                </Button>
                <Button color={'orange'} variant={'light'}>
                    Block
                </Button>
                <Button color={'accent'} variant={'light'}>
                    Delete
                </Button>
            </div>
        </FinalPageLayout>
    )
}
