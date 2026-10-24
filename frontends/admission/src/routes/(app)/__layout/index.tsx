import {createFileRoute, Link} from '@tanstack/react-router'
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import HomeProfileCard from "@/components/cards/HomeProfileCard.tsx";
import OpenIntakeStatusCard from "@/components/cards/OpenIntakeStatusCard.tsx";
import {Button, Card, Text} from "@mantine/core";
import {LuPencilLine} from "react-icons/lu";
import useAuthStore from "@/stores/useAuthStore.ts";
import {PiSealWarningLight} from "react-icons/pi";
import {FiDownload} from "react-icons/fi";
import {useMutation} from "@tanstack/react-query";
import type {AxiosResponse} from "axios";
import apis from "@/libs/axios.ts";
import {downloadBlob} from "@/libs/downloadBuffer.ts";
import {notifications} from "@mantine/notifications";
import {getErr} from "@/libs/functions.ts";

export const Route = createFileRoute('/(app)/__layout/')({
    component: App,
})

function App() {
    const {admissionData} = useStore(useAdmissionDataStore)
    const {kcpeIndexNumber} = useStore(useAuthStore)

    const {mutate, isPending} = useMutation({
        mutationKey: ['download-admission-letter'],
        mutationFn: async (): Promise<AxiosResponse<Blob>> => {
            // return await apis.admission.get("/admission/admission-letter", {responseType: "blob"})
            return await apis.students.get(`/admission/admission-letter/download/${admissionData?.id}/${admissionData?.enrollments?.intake}`, {responseType: "blob"})
        },
        onSuccess: (res) => {
            downloadBlob(res.data, `${name}-admission-letter.pdf`)
        },
        onError: (err) => {
            notifications.show(getErr(err))
        }
    })

    if (!admissionData || !kcpeIndexNumber) {
        return null
    }
    return (
        <div className="flex w-full min-h-[calc(100vh-70px)] py-5">
            <div className={"w-[95%] md:w-1/2 md:min-w-max m-auto grid auto-rows-max gap-5"}>
                {admissionData.pending &&
                    <Card
                        data-aos={'zoom-in'} radius={'lg'} shadow={'lg'}
                        className={"bg-white p-5 gap-2"}
                    >
                        <span className={'flex items-center gap-3 flex-wrap'}>
                            <PiSealWarningLight size={'32px'} className={'text-secondary-800'}/>
                            <Text>🎊  Congratulations!! You have been accepted.</Text>
                        </span>
                        <Button
                            hidden={!admissionData.migrated}
                            size={'sm'}
                            className={'w-max                                                                                                                                           '}
                            onClick={() => mutate()} loading={isPending}
                            disabled={isPending}
                            leftSection={<FiDownload/>}
                            color={'secondary.6'} variant={''}>
                            Download admission letter
                        </Button>
                    </Card>
                }
                <div className={"grid md:grid-flow-col cols-[70%_30%] flex-wrap gap-2 "}>
                    <HomeProfileCard/>
                    <OpenIntakeStatusCard/>
                </div>
                <div className={"w-full flex flex-wrap gap-5 break-inside-avoid"}>
                    <Link className={"flex-1 w-max h-max"} to={"/steps/$stage"} params={{stage: "1"}}>
                        <Button className={'w-full'} size={'xl'} leftSection={<LuPencilLine/>}>
                            Fill application form
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
