import StepFormLayout from "@/components/layout/StepFormLayout.tsx";
import {ActionIcon, Button, Space, TextInput} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import type {NextOfKinObj} from "@/libs/types.ts";
import {getErr} from "@/libs/functions.ts";
import {BiPlus, BiTrash} from "react-icons/bi";
import apis from "@/libs/axios.ts";
import {notifications} from "@mantine/notifications";

const defaultNextOfKin = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    relationship: ""
}


export default function Step3NextOfKinForm() {
    const [nextOfKins, setNextOfKin] = useState<NextOfKinObj[]>([defaultNextOfKin]);
    const {admissionData} = useStore(useAdmissionDataStore)
    const [formErrors, setFormErrors] = useState<Record<number, Record<string, string | undefined>>>({})

    const change = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const {name, value} = e.target;
        let arr = [...nextOfKins]
        let val = arr[index]
        if (!val)
            return;
        val = {...val, [name]: name === 'email' ? value?.toLowerCase() : value}
        arr[index] = val
        setNextOfKin(arr);
    };

    useEffect(() => {
        if (admissionData && admissionData.nextOfKins) {
            if (admissionData.nextOfKins.length > 0) {
                const list = []
                for (const nok of admissionData.nextOfKins) {
                    // clean out nulls
                    const entries = Object.entries(nok).map(([key, val]) => ([key, val ?? ""]))
                    list.push(Object.fromEntries(entries));
                }
                setNextOfKin(list);
            }
        }
    }, [admissionData?.nextOfKins]);

    const handleDelete = async (index: number, id?: string) => {
        if (id) {
            // delete first online
            await apis.admission.delete(`/applicants/next-of-kin/${id}`)
                .then(() => {
                    notifications.show({title: "Success!", message: "Next of kin deleted successfully"})
                    const list = nextOfKins.filter((_f, i) => i !== index)
                    if (list.length === 0) {
                        list.push(defaultNextOfKin)
                    }
                    setNextOfKin(list)
                })
                .catch(err => {
                    notifications.show(getErr(err))
                })
        } else {
            const list = nextOfKins.filter((_f, i) => i !== index)
            if (list.length === 0) {
                list.push(defaultNextOfKin)
            }
            setNextOfKin(list)
        }
    }

    return (
        <StepFormLayout proppedData={nextOfKins} step={'next-of-kin'} title={"Next of Kin"}>
            <div data-aos={'fade-in'} className={"w-full grid gap-5"}>
                {nextOfKins.map((nextOfKin, i) => (
                    <div className={'w-full grid gap-2 border border-solid border-gray-200 p-4 rounded-md'}
                         key={nextOfKin.id || i}
                    >
                        <ActionIcon onClick={() => handleDelete(i, nextOfKin.id)} hidden={nextOfKins.length < 2}
                                    className={'ml-auto'} color={'accent'}
                                    variant={'light'}>
                            <BiTrash/>
                        </ActionIcon>
                        <div className={'grid md:grid-cols-2 flex-wrap gap-2'}>
                            <TextInput
                                label="First Name"
                                placeholder="First Name"
                                name="firstName"
                                value={nextOfKin.firstName}
                                required
                                onChange={e => change(e, i)}
                            />
                            <TextInput
                                label={"Last Name"}
                                placeholder={"Last Name"}
                                name={"lastName"}
                                required
                                value={nextOfKin.lastName}
                                onChange={e => change(e, i)}
                            />
                            <TextInput
                                label={"Phone"}
                                placeholder={"+254712345678"}
                                name={"phone"}
                                required
                                value={nextOfKin.phone}
                                onChange={e => change(e, i)}
                                error={formErrors[i]?.phone}
                                onFocus={() => setFormErrors(prev => ({...prev, phone: ""}))}
                                // onBlur={() => {
                                //     const hold = {...formErrors}
                                //     const got = hold[i] ?? {}
                                //     got['phone'] = (nextOfKin.phone && !isValidPhoneFormat(nextOfKin.phone)) ? "Invalid phone number format. Start with country code like +254712345678": ""
                                //     hold[i] = got
                                //     setFormErrors(hold)
                                // }}
                            />
                            <TextInput
                                label={"Email"}
                                placeholder={"Email"}
                                name={"email"}
                                value={nextOfKin.email}
                                onChange={e => change(e, i)}
                            />
                            <TextInput
                                required
                                label="Relationship"
                                placeholder={"E.g Father, Mother, Brother, Sister, etc."}
                                name="relationship"
                                value={nextOfKin.relationship}
                                onChange={e => change(e, i)}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <Space h={10}/>
            <Button className={'w-max'} rightSection={<BiPlus/>} variant={'outline'}
                    onClick={() => setNextOfKin(prev => ([...prev, defaultNextOfKin]))}
                    hidden={nextOfKins.length > 1}>Add</Button>
        </StepFormLayout>
    )
}


