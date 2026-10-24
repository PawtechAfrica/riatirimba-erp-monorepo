import type {NextOfKinObj} from "@/libs/types/admission.types.ts";
import {ActionIcon, TextInput} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import apis from "@/libs/api.ts";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import {HiCheck} from "react-icons/hi";
import {MdDelete} from "react-icons/md";
import {FormError} from "@/libs/types/app.types.ts";


interface props extends Partial<NextOfKinObj> {
    index: number,
    traineeId?: string,
    localRemove: (index: number) => void,
    refresh: () => void,
}

export const defaultNextOfKin = {
    firstName: "", email: "", lastName: "", phone: "", relationship: ""
}

export default function ViewEditTraineeNextOfKin({index, traineeId, localRemove, refresh, ...rest}: props) {
    const [nok, setNok] = useState<NextOfKinObj>(defaultNextOfKin)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const change = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNok(prev => ({...prev, [e.target.name]: e.target.value}))
        setErrors(prev => ({...prev, [e.target.name]: ""}))
    }

    useEffect(() => {
        const hold = {}
        Object.keys(rest).forEach(key => {
            const value = rest[key as keyof NextOfKinObj]
            if (value) {
                Object.assign(hold, {[key]: value})
            }
        })
        setNok(hold as NextOfKinObj)
    }, []);

    const update = useMutation({
        mutationKey: ['update-edit-next-of-kin'],
        mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            if (rest.id) {
                return (await apis.trainees.put(`/noks/update`, nok)).data
            } else {
                return (await apis.trainees.post(`/noks/create/${traineeId}`, nok)).data
            }
        },
        onSuccess: (result) => {
            notifications.show(showSuccess(result.message))
            refresh()
        },
        onError: (err) => {
            notifications.show(showErr(err))
            if(err instanceof FormError){
                setErrors(Object.fromEntries(err.validationErrors.map(e => ([e.property, e.message]))))
            }
        }
    })

    const deletion = useMutation({
        mutationKey: ['delete-next-of-kin'],
        mutationFn: async () => {
            return (await apis.trainees.delete(`/noks/${rest.id}`)).data
        },
        onSuccess: (result) => {
            notifications.show(showSuccess(result.message))
            refresh()
        },
        onError: (err) => {
            notifications.show(showErr(err))
        }
    })

    const handleRemove = () => {
        if (rest.id) {
            // delete from db
            deletion.mutate()
        } else localRemove(index)
    }

    return (
        <form onSubmit={update.mutate} className={"flex flex-wrap justify-between bg-white gap-2"}>
            <div className={"flex-1 w-full flex gap-2 flex-wrap"}>
                <TextInput
                    label={'First name'}
                    placeholder={"First name"}
                    name={'firstName'}
                    value={nok.firstName ?? ""}
                    onChange={change}
                    error={errors.firstName}
                />
                <TextInput
                    label={'Last name'}
                    placeholder={"Last name"}
                    name={'lastName'}
                    value={nok.lastName ?? ""}
                    onChange={change}
                    error={errors.lastName}
                />
                <TextInput
                    label={'Phone'}
                    placeholder={"Phone number"}
                    name={'phone'}
                    value={nok.phone ?? ""}
                    onChange={change}
                    error={errors.phone}
                />
                <TextInput
                    label={'Email'}
                    placeholder={"Email address"}
                    name={'email'}
                    value={nok.email ?? ""}
                    onChange={change}
                    error={errors.email}
                />
                <TextInput
                    label={'Relationship'}
                    placeholder={"Relationship"}
                    name={'relationship'}
                    value={nok.relationship ?? ""}
                    onChange={change}
                    error={errors.relationship}
                />
            </div>
            <div className={'flex gap-2 h-max mt-auto'}>
                <ActionIcon size={'lg'} loading={update.isPending} disabled={update.isPending || deletion.isPending}
                            type={'submit'}>
                    <HiCheck/>
                </ActionIcon>
                <ActionIcon size={'lg'} loading={deletion.isPending} disabled={update.isPending || deletion.isPending}
                            color={'accent'}
                            onClick={handleRemove}>
                    <MdDelete/>
                </ActionIcon>
            </div>
        </form>
    )
}

