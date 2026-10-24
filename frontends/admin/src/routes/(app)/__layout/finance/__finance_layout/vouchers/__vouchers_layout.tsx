import {createFileRoute, Outlet} from '@tanstack/react-router'

export const Route = createFileRoute(
    '/(app)/__layout/finance/__finance_layout/vouchers/__vouchers_layout',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <Outlet/>
        </div>
    )
}
