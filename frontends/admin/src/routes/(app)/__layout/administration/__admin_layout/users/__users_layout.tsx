import {createFileRoute, Outlet} from '@tanstack/react-router'

export const Route = createFileRoute(
    '/(app)/__layout/administration/__admin_layout/users/__users_layout',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <Outlet/>
    )
}
