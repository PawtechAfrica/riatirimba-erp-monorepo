import {createFileRoute} from '@tanstack/react-router'
import CreateEditVoucherForm from "@/components/forms/CreateEditVoucherForm.tsx";

export const Route = createFileRoute(
    '/(app)/__layout/finance/__finance_layout/vouchers/__vouchers_layout/edit/single/$id',
)({
    component: RouteComponent,
    params: {
        parse: (params) => ({id: params.id as 'new' | number}),
    }
})

function RouteComponent() {
    const {id} = Route.useParams()

    return (
        <div className={"w-full p-4 bg-white"}>
            <CreateEditVoucherForm id={id}/>
        </div>
    )
}
