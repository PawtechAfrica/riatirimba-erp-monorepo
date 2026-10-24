import {createFileRoute, Outlet} from '@tanstack/react-router'

export const Route = createFileRoute(
    '/(app)/__layout/hr/__hr_layout',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>
        <Outlet/>
    </div>
}
