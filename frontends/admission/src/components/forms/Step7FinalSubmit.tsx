import {Button, Checkbox, Space, Text, Title} from "@mantine/core";
import React, {useState} from "react";
import {FaCheck} from "react-icons/fa6";
import {useMutation} from "@tanstack/react-query";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import apis from "@/libs/axios.ts";
import {notifications} from "@mantine/notifications";
import {getErr} from "@/libs/functions.ts";
import {Link, useNavigate} from "@tanstack/react-router";
import {GoArrowLeft} from "react-icons/go";


export default function Step7FinalSubmit() {
    const [submit, setSubmit] = useState(false)
    const {update, admissionData} = useStore(useAdmissionDataStore)
    const navigate = useNavigate()
    const {mutate, isPending} = useMutation({
        mutationKey: ['submit-form'],
        mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const result = await apis.admission.post(`/applicants/submit/${admissionData?.id}`,
                {submit: submit})
            return result.data as { message: string, data: { submitted: boolean } };
        },
        onSuccess: ({message, data}) => {
            notifications.show({title: "Success!", message})
            update(data)

            setTimeout(() => {
                navigate({to: "/"}).catch()
            }, 3000)
        },
        onError: error => {
            notifications.show(getErr(error))
        }
    })
    return (
        <div className={"flex p-2 w-full h-full min-h-[calc(100vh-70px)]"}>
            <form onSubmit={mutate} className={"p-4 bg-white grid gap-4 w-[90%] md:w-1/2 justify-center m-auto"}>
                <Title c={'primary'}>Submit</Title>
                <Text className={'max-w-full'}>Thank you for filling and completing the form. Once you submit this form,
                    <strong className={'text-accent-700'}>YOU WILL NOT BE ABLE TO DIRECTLY UPDATE THE
                        INFORMATION</strong>.
                    Please ensure everything is
                    correct</Text>
                <Space h={20}/>
                <Checkbox
                    className={" max-w-full m-auto"}
                    label={"I consent to provide my details and confirm they are correct."}
                    checked={submit}
                    defaultChecked={false}
                    onChange={({target: {checked}}) => setSubmit(checked)}
                />
                <Button type={'submit'} loading={isPending} disabled={!submit || isPending} leftSection={<FaCheck/>}>
                    Complete application
                </Button>
                <Link className={"w-full"} to={"/steps/$stage"} params={{stage: "1"}}>
                    <Button leftSection={<GoArrowLeft/>} className={'w-full'} variant={'outline'} color={'orange.7'}>Go
                        back</Button>
                </Link>
            </form>
        </div>
    )
}


