import {Button, PasswordInput, TextInput, Title} from "@mantine/core";
import {useNavigate, useSearch, type ValidateToPath} from "@tanstack/react-router";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import apis from "@/libs/api.ts";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import {useStore} from "zustand/react";
import useAuthStore from "@/stores/useAuthStore.ts";

export default function LoginForm() {
    const {prev} = useSearch({from: "/auth/$step"})
    const {login} = useStore(useAuthStore)
    const [form, setForm] = useState({
        email: "", password: "",
    })
    const change = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({...prev, [e.target.name]: e.target.value}))
    }
    const navigate = useNavigate()
    const timeRef = useRef<number | null>(null)

    const {mutate, isPending} = useMutation({
        mutationKey: ['authentication'],
        mutationFn: async (e: React.FormEvent<HTMLFormElement>): Promise<LoginResponseObj> => {
            e.preventDefault();
            return (await apis.auth.post("/auth/login", form, {
                // timeout: 10000
            })).data
        },
        onSuccess: (response) => {
            notifications.show(showSuccess("Welcome Back!"))
            login(response)
            timeRef.current = window.setTimeout(async () => {
                return navigate({to: (prev ? prev : "/") as ValidateToPath,})
            }, 1500)
        },
        onError: (err) => {
            notifications.show(showErr(err))
        }
    })

    useEffect(() => {
        if (timeRef.current !== null) {
            window.clearTimeout(timeRef.current)
            timeRef.current = null
            // navigate({to: (prev ? prev : "/") as ValidateToPath,})
        }
    }, [timeRef])

    return (
        <>
            <Title order={4}>Login</Title>
            <form onSubmit={mutate} className={"min-w-[300px] transition-all grid gap-2"}>
                <TextInput
                    placeholder={"Email"}
                    label={"Email"}
                    name={'email'}
                    disabled={isPending}
                    onChange={change}
                />
                <PasswordInput
                    placeholder={"Password"}
                    label={"Password"}
                    name={'password'}
                    disabled={isPending}
                    onChange={change}
                />
                <Button
                    type={"submit"}
                    loading={isPending}
                    disabled={isPending}
                >
                    Login
                </Button>
            </form>
        </>
    )
}

