import {Button, PasswordInput, TextInput} from "@mantine/core";
import React from "react";
import {useMutation} from "@tanstack/react-query";
import {type ApplicantData, FormError} from "@/libs/types.ts";
import apis from "@/libs/axios.ts";
import {notifications} from "@mantine/notifications";
import {MdWarning} from "react-icons/md";
import {getErr} from "@/libs/functions.ts";
import {useForm} from "@mantine/form";

interface props {
    handleSuccess: (data: ApplicantData) => void
}

export default function LoginForm({handleSuccess}: props) {
    const loginForm = useForm({
        name: "login-form",
        mode: 'controlled',
        initialValues: {email: "", indexNumber: ""},
        validateInputOnBlur: true,
        validate: values => {
            const errors: Record<string, string> = {};
            if (!values.email) errors.email = "Email is required";
            if (!values.indexNumber) errors.indexNumber = "Index number is required";
            return errors;
        }
    })

    const {mutate, isPending} = useMutation({
        mutationKey: ['login-form'],
        mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            // reset errors
            // setErrors({})
            // transform the data
            // const result = await apis.admission.post("/applicants/login", form)
            const result = await apis.admission.post("/applicants/login", loginForm.getValues())
            return result.data as { message: string, data: ApplicantData }
        },
        onSuccess: ({message, data}) => {
            notifications.show({title: "Success!", message})
            // set login credentials
            handleSuccess(data)
        },
        onError: error => {
            if (error instanceof FormError) {
                notifications.show({
                    title: "Warning!",
                    message: error.serverMessage,
                    color: "orange",
                    icon: <MdWarning/>
                })
                // setErrors(error.validations)
                loginForm.setErrors(error.validations)
            } else notifications.show(getErr(error))
        }
    })

    return (
        <form
            data-aos={'fade-up'} data-aos-duration={720}
            onSubmit={mutate} className={'max-w-[500px] grid gap-4 flex-1 w-full '}>
            <TextInput
                label={"Email"}
                placeholder={"Your email"}
                {...loginForm.getInputProps('email')}
            />
            <PasswordInput
                label={"KCSE/KCPE Index number/Year"}
                placeholder={"E.g 40735253016/2022"}
                {...loginForm.getInputProps('indexNumber')}
            />
            <Button type={'submit'} loading={isPending} disabled={isPending}>
                Submit
            </Button>
        </form>
    )
}

