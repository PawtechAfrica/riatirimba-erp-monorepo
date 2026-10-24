import {showErr} from "@/utils/notification.util.tsx";
import usePermissionStore from "@/stores/usePermissionStore.ts";
import {Button, Text} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {useQuery} from '@tanstack/react-query';
import {createFileRoute, Outlet} from '@tanstack/react-router';
import {useEffect} from "react";
import {RxReload} from "react-icons/rx";
import {useStore} from "zustand/react";

export const Route = createFileRoute(
    '/(app)/__layout/administration/__admin_layout/permissions/__permission_layout',
)({
    component: RouteComponent,
    shouldReload: true,
})

function RouteComponent() {
    const { fetchPermissions } = useStore(usePermissionStore)

    // useQuery to fetch permissions using fetchPermissions
    const { error, refetch } = useQuery({
        queryKey: ['permissions'],
        queryFn: fetchPermissions,
        refetchOnReconnect: true,
        // retryDelay: 5 * 60 * 1000
    });

    useEffect(() => {
        if (error) {
            notifications.show(showErr(error))
        }
    }, [error])

    return (
        <>
            {error?.message.toLowerCase() === 'network error' &&
                <div className={"flex-1 p-3 flex items-center gap-10 border border-solid border-accent-300 bg-accent-100 rounded-lg"}>
                    <Text>Unable to reach the service. Check your internet and retry again. If it persists <a className={'text-primary-500'} href={""}>click here</a> to contact support.</Text>
                    <Button color={'accent'} variant={'outline'} leftSection={<RxReload />} onClick={() => refetch()}>Retry</Button>
                </div>}
            <Outlet />
        </>
    )
}
