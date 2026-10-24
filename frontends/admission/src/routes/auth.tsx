import {createFileRoute, useNavigate} from "@tanstack/react-router";
import SignupForm from "@/components/forms/SignupForm.tsx";
import {Button, Image, Pill, Space, Text, Title} from "@mantine/core";
import {useCallback, useMemo, useState} from "react";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import useAuthStore from "@/stores/useAuthStore.ts";
import type {ApplicantData} from "@/libs/types.ts";
import LoginForm from "@/components/forms/LoginForm.tsx";
import {notifications} from "@mantine/notifications";
import config from "@/libs/config.ts";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import dayjs from "dayjs";


export const Route = createFileRoute("/auth")({
    component: AuthPage
})

function AuthPage() {
    const {update} = useStore(useAdmissionDataStore)
    const {login} = useStore(useAuthStore)
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(false)

    const {fetchIntakes, intakes} = useStore(useAcademicStore)

    const handleSuccess = useCallback((data: ApplicantData) => {
        if (!data.academicHistory.kcpeIndexNumber)
            return notifications.show({title: "Error!", message: "Something went wrong, please try again!"})
        login(data.academicHistory.kcpeIndexNumber, data.id, data.firstName + " " + data.lastName)
        update(data)
        setTimeout(() => {
            return navigate({to: '/', replace: true});
        }, 1200);
    }, [login, navigate, update])

    const openIntake = useMemo(() => {
        if (intakes.size < 1)
            fetchIntakes().catch()
        return [...intakes.values()].find(intake => intake.status === 'open')
    }, [fetchIntakes, intakes])

    return (
        <div
            data-aos={'zoom-in'}
            className={"w-full min-h-screen grid md:grid-cols-2 bg-white "}>
            <div className={" w-full h-full hidden md:block"}>
                <Image className={"w-full h-full brightness-50"} src={"/ui/auth_background.jpg"} alt={"welcome"}/>
                <div className={"w-full h-full p-5 absolute top-0 left-0 flex m-auto text-white"}>
                    <span className={"text-[7vmin] font-black m-auto"}>Your first step to something greater</span>
                </div>
                <div className={'w-[90%] flex absolute bottom-5 left-0 right-0 mx-auto flex-wrap gap-2 justify-center'}>
                    <div
                        className={'flex-1 min-w-[250px] border border-solid rounded-lg border-gray-300 bg-white p-2 text-black grid auto-rows-max gap-2 '}>
                        <Text className={'font-bold text-center'}>For general enquiries</Text>
                        <Text size={'sm'}>Questions about the school, program, etc</Text>
                        <span className={'flex gap-4 flex-wrap justify-center'}>
                                {config.contacts.general.map((contact, i) =>
                                    <a key={i} target={"_blank"} href={`tel:${contact}`}>
                                        <Pill classNames={{root: 'bg-orange-100'}} color={'red'} variant={'filled'}>
                                            {contact}
                                        </Pill>
                                    </a>
                                )}
                            </span>
                    </div>
                    <div
                        className={'flex-1 min-w-[250px] border border-solid rounded-lg border-gray-300 bg-white p-2 text-black grid auto-rows-max gap-2 '}>
                        <Text className={'font-bold text-center'}>For technical assistance</Text>
                        <Text size={'sm'}>Help about the admission system, Whatsapp, message or call</Text>
                        <span className={'flex gap-4 flex-wrap justify-center'}>
                                {config.contacts.technical.map((contact, i) =>
                                    <a key={i} target={"_blank"} href={`tel:${contact}`}>
                                        <Pill classNames={{root: 'bg-orange-100'}} color={'red'} variant={'filled'}>
                                            {contact}
                                        </Pill>
                                    </a>)}
                            </span>
                    </div>
                </div>
            </div>
            <div className={"flex-1 flex items-center place-content-center"}>
                <div className={"max-w-[90%] flex flex-col transition-all items-center place-content-center h-max"}>
                    {openIntake && (
                        <div className={"w-full h-max rounded-md left-0 top-0 p-4 flex flex-wrap gap-2 bg-gradient-to-r from-primary-500 to-secondary-700 text-white"}>
                            <span className={"font-bold text-[14pt]"}>{openIntake.readable}</span>
                            <span className={'my-auto'}>Closes on {dayjs(openIntake.closes).format("dddd DD MMMM YYYY")}</span>
                        </div>)}
                    <Space h={20}/>
                    <div className={"grid gap-2 text-center place-items-center"}>
                        <Image className={"w-[100px]"} src={"/ui/logo.png"} alt={"school logo"}/>
                        <Title c={'blue.8'} order={3}>Riatirimba TVC Application Portal</Title>
                    </div>
                    <Space h={20}/>
                    <Title c={'blue.9'} order={2}>{isLogin ? "Login" : "Create account"}</Title>

                    {isLogin
                        ? <LoginForm handleSuccess={handleSuccess}/>
                        : <SignupForm handleSuccess={handleSuccess}/>
                    }
                    <Button onClick={() => setIsLogin(!isLogin)} variant={'transparent'}>
                        {isLogin ? "Sign up" : "Login"} instead?
                    </Button>
                    <Space h={20}/>
                    <div className={'flex md:hidden flex-wrap gap-2 justify-center'}>
                        <div
                            className={'flex-1 min-w-[250px] border border-solid rounded-lg border-gray-300 bg-white p-2 text-black grid auto-rows-max gap-2 '}>
                            <Text className={'font-bold text-center'}>For general enquiries</Text>
                            <Text size={'sm'}>Questions about the school, program, etc</Text>
                            <span className={'flex gap-4 flex-wrap justify-center'}>
                                {config.contacts.general.map((contact, i) =>
                                    <a key={i} target={"_blank"} href={`tel:${contact}`}>
                                        <Pill classNames={{root: 'bg-orange-100'}} color={'red'} variant={'filled'}>
                                            {contact}
                                        </Pill>
                                    </a>
                                )}
                            </span>
                        </div>
                        <div
                            className={'flex-1 min-w-[250px] border border-solid rounded-lg border-gray-300 bg-white p-2 text-black grid auto-rows-max gap-2 '}>
                            <Text className={'font-bold text-center'}>For technical assistance</Text>
                            <Text size={'sm'}>Help about the admission system, Whatsapp, message or call</Text>
                            <span className={'flex gap-4 flex-wrap justify-center'}>
                                {config.contacts.technical.map((contact, i) =>
                                    <a key={i} target={"_blank"} href={`tel:${contact}`}>
                                        <Pill classNames={{root: 'bg-orange-100'}} color={'red'} variant={'filled'}>
                                            {contact}
                                        </Pill>
                                    </a>)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

