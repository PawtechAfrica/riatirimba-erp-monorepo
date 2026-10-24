import StepFormLayout from "@/components/layout/StepFormLayout.tsx";
// import {getConstituencies, getCounties, getSubCountiesInCounty, getWardsInConstituency} from "kenya-locations";
import React, {useEffect, useState} from "react";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import type {AddressObj} from "@/libs/types.ts";
import {NumberInput, TextInput} from "@mantine/core";
import {makeLabel} from "@/libs/functions.ts";


export default function Step2AddressForm() {
    const [address, setAddress] = useState<Partial<AddressObj>>({
        county: "",
        location: "",
        subLocation: "",
        village: ""
    })

    const admissionData = useStore(useAdmissionDataStore, store => store.admissionData)

    useEffect(() => {
        if (admissionData && admissionData.address) {
            setAddress(prev => ({...prev, ...admissionData.address}))
        }
    }, [admissionData]);

    const change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value ? makeLabel(e.target.value) : "";
        setAddress(prev => ({...prev, [e.target.name]: value.trim()}))
    }

    return (
        <StepFormLayout title={"Address"} step={'address'} proppedData={address}>
            <div data-aos={'fade-in'} className={'grid md:grid-cols-2 gap-2'}>
                {Object.keys(address).filter(k => k !== "id").map(key => {
                    if (key === 'zipCode' || key === 'poBox')
                        return <NumberInput
                            key={key}
                            name={key}
                            label={makeLabel(key)}
                            required
                            placeholder={key=== 'zipCode' ? 'Zip Code e.g 40200' : 'PO Box e.g 55'}
                            value={address[key as keyof typeof address] ?? ""}
                            onChange={val => setAddress(prev => ({...prev, [key]: val}))}
                        />
                    return <TextInput
                        key={key}
                        name={key}
                        required
                        label={makeLabel(key)}
                        placeholder={makeLabel(key)}
                        value={address[key as keyof typeof address] ?? ""}
                        onChange={change}
                    />
                })}
            </div>
        </StepFormLayout>
    )
}

