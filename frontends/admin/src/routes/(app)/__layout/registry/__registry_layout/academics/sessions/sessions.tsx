import {createFileRoute} from '@tanstack/react-router'
import TermSessionTable from "@/components/tables/TermSessionTable.tsx";
import {useQuery} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import {showErr} from "@/utils/notification.util.tsx";
import {Button, Modal} from "@mantine/core";
import CreateTermSessionForm from "@/components/forms/CreateTermSessionForm.tsx";
import {useMemo, useState} from "react";
import {RiAddLargeFill} from "react-icons/ri";
import {useStore} from "zustand/react";
import useTermSessionStore from "@/stores/useTermSessionStore.ts";

export const Route = createFileRoute(
    '/(app)/__layout/registry/__registry_layout/academics/sessions/sessions',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const {fetchSessions, sessionsArray} = useStore(useTermSessionStore)

    const query = useQuery({
        queryKey: ['termSessions'],
        queryFn: async () => {
            const result = await fetchSessions()
            return result.data.data
        },
        retryOnMount: true,
        initialData: [...sessionsArray()],
        behavior: {
            onFetch: context => {
                const error = context.state.error
                if (error) {
                    notifications.show(showErr(error))
                }
            }
        }
    });

    const [openForm, setForm] = useState(false);
    const list = useMemo(() => {
        const array = query.data;
        if (Array.isArray(array)) return array
        return sessionsArray()
    }, [query.data, sessionsArray])

    return (
        <div>
            <TermSessionTable query={query} termSessions={list}/>
            <Button leftSection={<RiAddLargeFill/>} color={'secondary'} className={'fixed bottom-5'}
                    onClick={() => setForm(!openForm)}>Create term session</Button>

            <Modal
                title={"Create new term session"}
                centered
                classNames={{title: "font-bold text-xl text-primary-800"}}
                opened={openForm} onClose={() => {
                setForm(false)
            }}>
                <CreateTermSessionForm/>
            </Modal>
        </div>
    )
}
