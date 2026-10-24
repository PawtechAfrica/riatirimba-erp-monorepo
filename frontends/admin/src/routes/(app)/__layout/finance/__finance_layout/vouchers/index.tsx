import {createFileRoute, redirect} from '@tanstack/react-router'

export const Route = createFileRoute(
    '/(app)/__layout/finance/__finance_layout/vouchers/',
)({
    component: RouteComponent,
    beforeLoad: () => {
        throw redirect({to: "/finance/vouchers/list"})
    }
})

function RouteComponent() {
    return <div></div>
}
