import {createFileRoute, Link} from '@tanstack/react-router'
import VoucherTable from "@/components/tables/VoucherTable.tsx";
import {useStore} from "zustand";
import useVoucherStore from "@/stores/useVoucherStore.ts";
import {useQuery} from "@tanstack/react-query";
import {Button} from "@mantine/core";
import {FaPencil} from "react-icons/fa6";

export const Route = createFileRoute(
    '/(app)/__layout/finance/__finance_layout/vouchers/__vouchers_layout/list/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const {vouchers, fetchAllVouchers} = useStore(useVoucherStore)

    const query = useQuery({
        queryKey: ['fetch-vouchers', vouchers.size],
        queryFn: async () => await fetchAllVouchers(),
        // staleTime: 60 * 60 * 1000,
        initialData: [...vouchers.values()],
        refetchOnMount: true,
    })

    return (
        <div className={"min-h-[calc(100vh-80px)]"}>
            <div className={"w-ful p-2 pb-[50px]"}>
                <VoucherTable loading={query.isPending} vouchers={query.data}/>
            </div>
            {query.data.length < 1 && !query.isPending ? (
                    <div className={'grid bg-white gap-2 justify-items-center p-5'}>
                        <span className={''}>No vouchers at this time</span>
                        <Link to={"/finance/vouchers/edit/single/$id"} params={{id: 'new'}}>
                            <Button className={'w-max'}>New voucher</Button>
                        </Link>
                    </div>
                ) :
                <Link className={'fixed bottom-2 z-10'} to={"/finance/vouchers/edit/single/$id"} params={{id: 'new'}}>
                    <Button leftSection={<FaPencil/>} className={'w-max'}>New voucher</Button>
                </Link>}
        </div>
    )
}
