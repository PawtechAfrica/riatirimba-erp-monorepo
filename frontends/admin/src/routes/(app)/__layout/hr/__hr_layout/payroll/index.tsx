import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute(
    '/(app)/__layout/hr/__hr_layout/payroll/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return <div className={"w-full h-[calc(100vh-80px)] flex"}>
        <span className={'m-auto bg-white p-5 rounded-md font-bold'}>Coming soon... ⌛</span>
    </div>
}
