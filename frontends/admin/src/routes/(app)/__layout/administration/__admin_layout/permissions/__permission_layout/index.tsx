import {createFileRoute} from '@tanstack/react-router'
import PermissionTable from "@/components/tables/PermissionTable.tsx";
import {useStore} from "zustand/react";
import usePermissionStore from "@/stores/usePermissionStore.ts";

export const Route = createFileRoute(
    '/(app)/__layout/administration/__admin_layout/permissions/__permission_layout/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const {permissionIds} = useStore(usePermissionStore)

    return (
        <div>
            <PermissionTable permissions={[...permissionIds.values()]}/>
        </div>
    )
}
