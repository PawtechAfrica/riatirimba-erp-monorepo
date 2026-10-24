import {type TraineeObj, TraineeStatusEnum} from "@/libs/types/trainee.types.ts";
import {Button, Select, TextInput} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {GenderEnum} from "@/libs/types/admission.types.ts";
import {makeLabel} from "@/libs/utils.ts";
import useTraineeUpdate from "@/hooks/useTraineeUpdate.ts";
import ViewEditTraineeAspects from "@/components/layouts/ViewEditTraineeAspects.tsx";
import {RxUpdate} from "react-icons/rx";


const defaultProfile = {
    "firstName": "",
    "middleName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    // "idType": null,
    "birthCertNumber": null,
    "idNumber": "",
    "gender": null,
    "nemisCode": "",
    "status": null,
    "pinNumber": "",
    dateOfBirth: null,
}

interface props {
    traineeObj: TraineeObj,
    page?: number | 1
}

export default function ViewEditTraineeProfile({traineeObj, page}: props) {
    // const [profile, setProfile] = useState<Record<string, string | null>>()
    const [profile, setProfile] = useState<typeof defaultProfile & { [key: string]: string | null }>(defaultProfile)


    useEffect(() => {
        const data: Partial<typeof profile> = {}
        for (const key in profile) {
            const value = traineeObj[key as keyof TraineeObj]
            if (value)
                data[key] = value.toString()
        }
        setProfile(data as typeof profile)
    }, []);

    const textChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(prev => ({...prev, [e.target.name]: e.target.value}))
    }
    const selectChange = (key: string, value: any) => {
        setProfile(prev => ({...prev, [key]: value}))
    }

    const traineeQuery = useTraineeUpdate({id: traineeObj.id, page: page})


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        traineeQuery.mutate(profile)
    }

    return (
        <ViewEditTraineeAspects aspect={"Personal Details"}>
            <form onSubmit={handleSubmit} className={'bg-white grid gap-4 auto-rows-max md:grid-cols-3'}>
                <TextInput
                    value={profile.firstName ?? ""}
                    onChange={textChange}
                    label={'First name'}
                    name={'firstName'}
                />
                <TextInput
                    value={profile.middleName ?? ""}
                    onChange={textChange}
                    name={'middleName'}
                    label={'Middle name'}
                    placeholder={"Middle name"}
                />
                <TextInput
                    value={profile.lastName ?? ""}
                    onChange={textChange}
                    label={'Last name'}
                    name={'lastName'}
                />
                <TextInput
                    value={profile.birthCertNumber || ""}
                    onChange={textChange}
                    name={'birthCertNumber'}
                    label={'Birth certificate number'}
                    placeholder={'Birth certificate number'}
                />
                <TextInput
                    placeholder={'Trainee ID number'}
                    value={profile.idNumber ?? ""}
                    label={"ID number"}
                    name={'idNumber'}
                    onChange={textChange}
                />
                <Select
                    placeholder={'Gender'}
                    value={profile.gender} label={'Gender'}
                    onChange={val => selectChange('gender', val)}
                    data={[{label: "Male", value: GenderEnum.MALE}, {label: "Female", value: GenderEnum.FEMALE}]}
                />
                <TextInput
                    value={profile.nemisCode ?? ""}
                    label={'Nemis code'}
                    placeholder={'Nemis code'}
                    name={'nemisCode'}
                    onChange={textChange}
                />
                <TextInput
                    value={profile.pinNumber ?? ""}
                    label={'Pin Number'}
                    placeholder={'Pin Number'}
                    name={'pinNumber'}
                    onChange={textChange}
                />
                <Select
                    value={profile.status}
                    onChange={val => selectChange('status', val)}
                    label={'Status'}
                    data={Object.keys(TraineeStatusEnum).map(key => ({
                        label: makeLabel(key),
                        value: TraineeStatusEnum[key as keyof typeof TraineeStatusEnum]
                    }))}
                />
                <Button leftSection={<RxUpdate/>}
                        className={"w-max"}
                        type={'submit'}
                        loading={traineeQuery.isPending}>Update</Button>
            </form>
        </ViewEditTraineeAspects>
    )
}
