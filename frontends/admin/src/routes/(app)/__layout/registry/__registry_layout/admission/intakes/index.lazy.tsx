import {createLazyFileRoute, Link} from '@tanstack/react-router'
import IntakesTable from "@/components/tables/IntakesTable.tsx";
import {useStore} from "zustand/react";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import {Button, Space} from "@mantine/core";
import {IoAddSharp} from "react-icons/io5";

export const Route = createLazyFileRoute(
    '/(app)/__layout/registry/__registry_layout/admission/intakes/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const {intakes} = useStore(useAdmissionStore)

    return (
        <div className={"w-full h-full p-2 bg-white"}>
            <div className={"sticky top-[70px] z-10"}>
                <Link to={"/registry/admission/intakes/manage"} search={{intake_key: "new"}}>
                    <Button className={'shadow-xl'} leftSection={<IoAddSharp/>} variant={'gradient'}>
                        Create Intake
                    </Button>
                </Link>
            </div>
            <Space h={10}/>
            <IntakesTable
                intakes={[...intakes.values()]}
            />
        </div>
    )
}
