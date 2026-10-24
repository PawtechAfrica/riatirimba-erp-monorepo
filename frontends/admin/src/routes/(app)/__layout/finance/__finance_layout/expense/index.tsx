import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute(
    '/(app)/__layout/finance/__finance_layout/expense/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/(app)/__layout/finance/__finance_layout/expense/"!</div>
}
