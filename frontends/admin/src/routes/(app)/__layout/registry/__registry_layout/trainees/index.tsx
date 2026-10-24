import {createFileRoute, redirect} from '@tanstack/react-router'

export const Route = createFileRoute(
    '/(app)/__layout/registry/__registry_layout/trainees/',
)({
    component: RouteComponent,
    beforeLoad: () => {
        throw redirect({to: "/registry/trainees/view/list", search: {page: 1}})
    }
})

function RouteComponent() {
    return (
        <div>Dashboard still under progress</div>
    )
}
