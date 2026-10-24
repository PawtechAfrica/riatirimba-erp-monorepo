import {createFileRoute, useNavigate} from '@tanstack/react-router'
import {useStore} from "zustand/react";
import usePermissionStore from "@/stores/usePermissionStore.ts";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Button, Checkbox, Divider, Space, Textarea, TextInput, Title} from "@mantine/core";
import {BsPerson, BsSend, BsTrash3} from "react-icons/bs";
import {GrGroup} from "react-icons/gr";
import {useMutation} from "@tanstack/react-query";
import apis from "@/libs/api.ts";
import type {PermissionObj} from "@/libs/types/admission.types.ts";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import FinalPageLayout from "@/components/layouts/FinalPageLayout.tsx";

export const Route = createFileRoute(
    '/(app)/__layout/administration/__admin_layout/permissions/__permission_layout/manage',
)({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            permission_id: 'permission_id' in search ? search.permission_id as number : undefined,
        }
    }
})


const defaultEmptyPermission = {
    name: "", description: "",
}

function RouteComponent() {
    const {permissionIds, addPermissions} = useStore(usePermissionStore)
    const {permission_id} = Route.useSearch()
    const [permission, setPermission] = useState<{
        id?: number,
        name: string,
        description?: string
    }>(defaultEmptyPermission)
    const navigate = useNavigate();

    useEffect(() => {
        if (permission_id) {
            const found = permissionIds.get(Number(permission_id))
            if (!found) {
                setPermission(prev => ({...prev, ...defaultEmptyPermission}))
            } else setPermission(prev => ({...prev, name: found.name, description: found.description, id: found.id}))
        }
    }, [permission_id, permissionIds]);

    const suggestions = useMemo(() => {
        if (!permission.name) return []
        const list = [...permissionIds.values()].filter(p => p.name?.toLowerCase().includes(permission.name))
        if (list.length === 1 && list[0]?.name === permission.name) return []
        return list
    }, [permission.name, permissionIds])

    const inEditMode = useCallback(() => {
        // Ensure if no permission_id to return a Non-number value, DON'T USE EMPTY STRING IN PLACE OF 'new'
        return !Number.isNaN(+(permission_id ?? "new"))
    }, [permission_id])

    const {mutate, isPending} = useMutation({
        mutationKey: ['update_permission'],
        mutationFn: async () => {
            const request = () => inEditMode()
                ? apis.auth.patch(`/api/permissions/${permission_id}`, permission)
                : apis.auth.post("/api/permissions", permission)
            return (await request()).data as PermissionObj;
        },
        onSuccess: (data) => {
            addPermissions([data])
            setPermission(defaultEmptyPermission)
            notifications.show(showSuccess(`Permission successfully ${inEditMode() ? "updated" : "created"}!`))
        },
        onError: (err) => {
            notifications.show(showErr(err))
        }
    })

    return (
        <FinalPageLayout>
            <div className={"bg-white p-5 grid gap-2"}>
                <Title order={2}>{inEditMode() ? "Edit" : "New"} permission</Title>
                <div className={"grid auto-rows-max gap-2"}>
                    <TextInput
                        list={'existing_permissions'}
                        placeholder={'Permission name'}
                        label={'Permission name'}
                        value={permission.name}
                        onChange={({target: {value}}) => {
                            const val = value?.replace(" ", "_")?.toLowerCase()
                            setPermission(prev => ({...prev, name: val}))
                        }}
                    />
                    <div hidden={suggestions.length < 1}
                         className={"min-w-1/2 grid absolute bottom-0 z-30 shadow-xl rounded-lg auto-rows-max bg-primary-50"}>
                        {suggestions.map(perm => (
                            <div
                                onClick={() => navigate({
                                    to: "/administration/permissions/manage",
                                    search: {permission_id: perm.id}
                                })}
                                className={"w-full active:bg-primary-100 border-b border-b-slate-200 cursor-pointer p-2 px-4"}
                                key={perm.id}
                            >
                                {perm.name}
                            </div>
                        ))}
                    </div>
                    <Textarea
                        label={"Permission description"}
                        placeholder={'Short clear description'}
                        value={permission.description}
                        onChange={({target: {value}}) => {
                            setPermission(prev => ({...prev, description: value}))
                        }}
                    />
                </div>
                <Space h={10}/>
                <div className={"grid gap-2"}>
                    <Title order={5}>Manage users/groups</Title>
                    <div className={"flex gap-10"}>
                        <div className={"grid auto-rows-max gap-2 bg-slate-50 p-4 rounded-lg "}>
                            <span className={"flex gap-2"}><BsPerson/><Title order={6}>Users</Title></span>
                            <div className={"grid gap-2"}>
                                <Checkbox label={"Select all"}/>
                                <Divider/>
                                <Checkbox label={"Oluoch Makarini"} description={"Deputy principal"}/>
                                <Checkbox label={"Principals"} description={"Finance officer"}/>
                                <Checkbox label={"Finance officer"} description={"Secretary"}/>
                            </div>
                        </div>
                        <div className={"grid auto-rows-max gap-2 bg-slate-50 p-4 rounded-lg "}>
                            <span className={'flex gap-2'}><GrGroup/><Title order={6}>Roles</Title></span>
                            <div className={"grid gap-2"}>
                                <Checkbox label={"Select all"}/>
                                <Divider/>
                                <Checkbox label={`System admins (${10})`}/>
                                <Checkbox label={`Principals (${1})`}/>
                                <Checkbox label={`Finance officer (${2})`}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"flex gap-4"}>
                    <Button disabled={isPending} onClick={() => mutate()} leftSection={<BsSend/>}>
                        Submit
                    </Button>
                    <Button disabled={isPending} variant={'outline'} color={'accent'} leftSection={<BsTrash3/>}>
                        Submit
                    </Button>
                </div>
            </div>
        </FinalPageLayout>
    )
}
