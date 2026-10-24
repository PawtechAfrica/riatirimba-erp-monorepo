import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import Step7FinalSubmit from "@/components/forms/Step7FinalSubmit.tsx";
import {Link} from "@tanstack/react-router";
import SuccessFormCompletionCard from "@/components/cards/SuccessFormCompletionCard.tsx";
import {Button, Space, Text, Title} from "@mantine/core";
import {BiHome} from "react-icons/bi";

export default function CompletedApplicationForm() {
    const {admissionData} = useStore(useAdmissionDataStore)

    if (!admissionData || typeof (admissionData.completionStatus) === "undefined")
        return <></>

    return (
        <div className={"w-full m-auto text-center h-[calc(100vh-70px)] flex"}>
            {
                admissionData.pending ?
                    <SuccessFormCompletionCard/>
                    :
                    admissionData.submitted
                        ? <div className={"m-auto grid gap-2"}>
                            <Title c={'primary'}>Success!</Title>
                            <Text size={'xl'}>Your application was received and is pending approval</Text>
                            <Space h={20}/>
                            <div className={"flex gap-2 m-auto w-max max-w-full"}>
                                <Link to={"/"}>
                                    <Button leftSection={<BiHome/>}>
                                        Go to homepage
                                    </Button>
                                </Link>
                                <Link to={'/steps/$stage'} params={{stage: "1"}}>
                                    <Button variant={'light'}>
                                        Review application
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        :
                        <Step7FinalSubmit/>
            }
        </div>
    )
}


