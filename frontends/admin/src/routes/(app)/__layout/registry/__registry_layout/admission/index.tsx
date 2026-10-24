import {createFileRoute, redirect} from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/__layout/registry/__registry_layout/admission/')({
    component: RouteComponent,
    beforeLoad: () => {
        throw redirect({to: "/registry/admission/applications", search: {page: 1}})
    }
})

function RouteComponent() {


    return (
        <div className={"w-full"}>
            {/* todo: dashboard*/}
            Not ready yet
        </div>
    )
}
