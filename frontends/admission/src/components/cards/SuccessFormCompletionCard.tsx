import {Button, Space, Text, Title} from "@mantine/core";
import {Link} from "@tanstack/react-router";
import {BiHome} from "react-icons/bi";
import {GoArrowLeft} from "react-icons/go";
import {useViewportSize} from "@mantine/hooks";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import Confetti from "react-confetti";

export default function SuccessFormCompletionCard() {
    const {width, height} = useViewportSize()
    const {admissionData} = useStore(useAdmissionDataStore)
    const {courses} = useStore(useAcademicStore)


    return (
        <div className={"w-[95%] md:w-1/2 flex min-h-[calc(100vh-70px)] m-auto"}>
            {admissionData?.pending ?
                <div className={'m-auto'}>

                    <Confetti
                        wind={0.05} style={{position: 'fixed', top: 0, zIndex: 0}} className={"left-0 top-0 absolute"}
                        width={width} height={height - 70}/>
                    <Title c={'secondary.6'}>Congratulations!! You have been accepted</Title>
                    <Text>We're happy to inform you that you have been accepted to
                        study {courses().find(c => c.id == admissionData?.enrollments?.course)?.name ?? ""}</Text>
                    <Text>We've sent you an email with all the information including reporting date. If you did not
                        receive it, please check your spam folder or call 0741900728</Text>

                </div> :
                <>
                    <Title c={'secondary.6'}>Hooray!!</Title>
                    <Text>Hooray, you've completed the application. We will review your application and let you know
                        when you've been admitted. Be sure to check back here.</Text>
                    <Text>You are free to review your application while the intake is still open!</Text>
                    <Space h={20}/>
                    <div className={"grid gap-2"}>
                        <Link to={"/"}>
                            <Button leftSection={<BiHome/>}>Go back to the home screen</Button>
                        </Link>
                        <Link to={"/steps/$stage"} params={{stage: "1"}}>
                            <Button variant={"light"} leftSection={<GoArrowLeft/>}>Review my application
                                details</Button>
                        </Link>
                    </div>
                </>
            }

        </div>
    )
}

