import {createFileRoute, redirect} from '@tanstack/react-router'

export const Route = createFileRoute(
    '/(app)/__layout/registry/__registry_layout/academics/',
)({
    component: RouteComponent,
    beforeLoad: ({location}) => {
        console.log("location", location)
        throw redirect({
            to: '/registry/academics/sessions/sessions',
        })
    },
})

function RouteComponent() {
    return (
        <div>Hello "/(app)/__layout/registry/__registry_layout/academics/"!</div>
    )
}
