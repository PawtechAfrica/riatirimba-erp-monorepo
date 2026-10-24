import {Avatar, Progress, Text, Title} from "@mantine/core";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import {useCallback, useEffect} from "react";
import {useFileService} from "@/hooks/useFileService.ts";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import type {ApplicantDocuments} from "@/libs/types.ts";
import {useCacheStore} from "@/stores/useCacheStore.ts";


export default function HomeProfileCard() {
    const {admissionData} = useStore(useAdmissionDataStore)
    const courses = useStore(useAcademicStore, store => store.courses)
    const cacheStore = useCacheStore()
    const {getUrl} = useFileService()

    const populate = useCallback(async () => {
        if (admissionData && admissionData.documents) {
            for (const key in admissionData.documents) {
                const filename = admissionData.documents[key as keyof ApplicantDocuments]
                if (typeof filename === 'string')
                    cacheStore.setItem(key, await getUrl(filename))
            }
        }
    }, [admissionData, cacheStore, getUrl])

    useEffect(() => {
        populate().catch()
    }, [admissionData?.documents]);

    const course = courses().find(f => f.id == admissionData?.enrollments?.course)

    if (!admissionData)
        return <></>;
    return (
        <div
            // data-aos={'zoom-in'}
            className={'w-full h-max min-h-[20vh] flex-1 flex p-5 md:py-7 rounded-xl bg-white transition-all text-primary-600 '}>
            <div className={"m-auto w-full flex flex-wrap items-center justify-start gap-5"}>
                <Avatar
                    variant={'filled'} w={100} h={100}
                    // src={files['passportPhoto']}
                    src={cacheStore.getItem('passportPhoto')}
                    className={'bg-primary-800 w-[150px]'}
                />
                <div className={"flex-1 min-w-[150px] h-max my-auto grid gap-2 auto-rows-max"}>
                    <Title order={3} c={''}>{`${admissionData.firstName} ${admissionData.lastName}`}</Title>
                    <Text hidden={!course}
                          className={'px-2 md:w-max rounded-full text-secondary-950 bg-primary-100'}>{course?.name} (level {course?.level})</Text>

                    <div className={"w-full grid gap-2"}>
                        <Text>Application progress ({admissionData.completionStatus}%)</Text>
                        <Progress className={"w-full"} variant={'gradient'} color={'primary'}
                                  value={admissionData.completionStatus ?? 0}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

