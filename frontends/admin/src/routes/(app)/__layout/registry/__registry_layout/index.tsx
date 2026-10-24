import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/__layout/registry/__registry_layout/')({
    component: RouteComponent,
})

function RouteComponent() {


    return <div>Hello "/(app)/__layout/academic/"!</div>
}
