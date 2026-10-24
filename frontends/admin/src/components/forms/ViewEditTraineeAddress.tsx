import {ActionIcon, Button, TextInput} from "@mantine/core";
import React, {useEffect, useState} from "react";
import type {AddressObj} from "@/libs/types/admission.types.ts";
import {makeLabel} from "@/libs/utils.ts";
import {showErr, showSuccess} from "@/utils/notification.util.tsx"
import {HiCheck} from "react-icons/hi";
import {useMutation} from "@tanstack/react-query";
import apis from "@/libs/api.ts";
import type {AxiosResponse} from "axios";
import {notifications} from "@mantine/notifications";
import ViewEditTraineeAspects from "@/components/layouts/ViewEditTraineeAspects.tsx";

interface props {
    value: AddressObj | null;
    traineeId: string;
    refresh: () => void;
}

const keys = ["county", "location", "subLocation", "village", "poBox", "zipCode"]

export default function ViewEditTraineeAddress({value, traineeId, refresh}: props) {
    const [addy, setAddy] = useState<AddressObj>({
        id: 0,
        county: "",
        location: "",
        subLocation: "",
        village: "",
        poBox: null,
        zipCode: null
    })

    const {mutate, isPending} = useMutation({
        mutationKey: ['update-address'],
        mutationFn: async (e: React.FormEvent<HTMLFormElement>): Promise<AxiosResponse<{ message: string }>> => {
            e.preventDefault()
            const {id, ...data} = addy
            if (addy.id == 0) { // edit a new address
                return apis.trainees.post(`/address/new/${traineeId}`, data)
            }
            return apis.trainees.post(`/address/update/${id}`, data)
        },
        onSuccess: (res) => {
            notifications.show(showSuccess(res.data.message))
            refresh()
        },
        onError: (err) => {
            notifications.show(showErr(err))
        }
    })

    useEffect(() => {
        if (value)
            setAddy(value)
    }, [value])


    return (
        <ViewEditTraineeAspects aspect={"Address"}>
            <form onSubmit={mutate} className={"flex flex-col md:flex-row bg-white gap-2"}>
                <div
                    className={" flex-1 flex gap-2 flex-col md:flex-row items-baseline justify-baseline content-baseline "}>
                    {keys.map(key =>
                        <TextInput
                            key={key}
                            className={'flex-1 w-full'}
                            label={makeLabel(key)}
                            placeholder={makeLabel(key)}
                            type={'poBox_zipCode'.includes(key) ? 'number' : 'text'}
                            value={addy[key as keyof AddressObj] ?? ""}
                            onChange={e => setAddy(prev => ({...prev, [key]: e.target.value}))}
                        />
                    )}
                </div>
                <ActionIcon
                    type={'submit'} loading={isPending} disabled={isPending} size={'lg'}
                    className={'hidden md:block mt-auto'}
                >
                    <HiCheck/>
                </ActionIcon>
                <Button type={'submit'} loading={isPending} disabled={isPending} className={'block md:hidden'}>
                    Update
                </Button>
            </form>
        </ViewEditTraineeAspects>
    )
}

