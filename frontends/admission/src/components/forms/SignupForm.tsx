import React, {useState} from "react";
import {Button, PasswordInput, TextInput} from "@mantine/core";
import {getErr} from "@/libs/functions.ts";
import {type ApplicantData, FormError, type SignupDataObj} from "@/libs/types.ts";
import {useMutation} from "@tanstack/react-query";
import apis from "@/libs/axios.ts";
import {notifications} from "@mantine/notifications";
import {MdWarning} from "react-icons/md";

interface props {
    handleSuccess: (data: ApplicantData) => void
}


export default function SignupForm({handleSuccess}: props) {
    const [form, setForm] = useState<SignupDataObj>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        kcpeIndexNumber: "",
    })
    const [errors, setErrors] = useState<Record<string, string | undefined>>({})

    const change = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.name === 'email' ? e.target.value.toLowerCase() : e.target.value
        }))
    }

    const {mutate, isPending} = useMutation({
        mutationKey: ['signup-form'],
        mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            // reset errors
            setErrors({})
            // transform the data
            const result = await apis.admission.post("/applicants/signup", form)
            return result.data as { message: string, data: ApplicantData }
        },
        onSuccess: ({message, data}) => {
            notifications.show({title: "Success!", message})
            // set login credentials
            handleSuccess(data)
        },
        onError: error => {
            console.log(error)
            if (error instanceof FormError) {
                notifications.show({
                    title: "Warning!",
                    message: error.serverMessage,
                    color: "orange",
                    icon: <MdWarning/>
                })
                setErrors(error.validations)
            } else notifications.show(getErr(error))
        }
    })

    return (
        <form
            data-aos={'fade-up'} data-aos-duration={720}
            role={'form'} onSubmit={mutate}
            className={"m-auto w-[95%] max-w-[500px] grid gap-2 p-5 md:p-5 rounded-lg bg-white "}
        >
            <div className={"flex flex-wrap gap-4"}>
                <TextInput
                    label={'First Name'}
                    placeholder={'First Name'}
                    name={'firstName'}
                    value={form.firstName}
                    onChange={change}
                    className={'flex-1 min-w-[200px]'}
                    error={errors['firstName']}
                />
                <TextInput
                    label={'Last Name'}
                    placeholder={'Last Name'}
                    name={'lastName'}
                    value={form.lastName}
                    onChange={change}
                    className={'flex-1 min-w-[200px]'}
                    error={errors['lastName']}
                />
                <TextInput
                    label={'Email'}
                    placeholder={'Your email'}
                    name={'email'}
                    value={form.email}
                    onChange={change}
                    className={'flex-1 min-w-[200px]'}
                    error={errors['email']}
                />
                <TextInput
                    type={'number'}
                    name={'phone'}
                    placeholder={"Phone number"}
                    label={"Phone"}
                    value={form.phone ?? ""}
                    onChange={change}
                    className={'flex-1 min-w-[200px]'}
                    error={errors['phone']}
                />
                <PasswordInput
                    name={'kcpeIndexNumber'}
                    value={form.kcpeIndexNumber}
                    onChange={change}
                    label={"KCPE Index number/Year"}
                    placeholder={"E.g 40735253016/2022"}
                    className={'flex-1 min-w-[200px]'}
                    error={errors['kcpeIndexNumber']}
                />
            </div>
            <Button disabled={isPending} loading={isPending} type={'submit'}>
                Submit
            </Button>
        </form>
    )
}

