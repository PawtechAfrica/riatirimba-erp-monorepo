import {useNavigate, useParams} from "@tanstack/react-router";
import {useMutation} from "@tanstack/react-query";
import type {ApplicantData, FormSteps} from "@/libs/types.ts";
import apis from "@/libs/axios.ts";
import {notifications} from "@mantine/notifications";
import {getErr} from "@/libs/functions.ts";
import {useStore} from "zustand/react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import React, {useState} from "react";

interface props {
    formRef?: React.RefObject<HTMLFormElement | null>
    callback?: () => void
}

export default function useFormNavigation({formRef, callback}: props) {
    const {stage} = useParams({from: "/(app)/__layout/steps/$stage"})
    const navigate = useNavigate()
    const {admissionData, update} = useStore(useAdmissionDataStore)
    const [autosave, setAutosave] = useState<boolean>(false)

    const {mutate, isPending} = useMutation({
        mutationKey: ["update-data"],
        mutationFn: async ({proppedData, isFiles, step}: {
            proppedData: any,
            isFiles: boolean,
            step?: FormSteps,
        }): Promise<{
            status: number,
            message: string,
            data?: Partial<ApplicantData>,
            isFiles?: boolean,
        }> => {

            if (admissionData?.submitted)
                return {status: 304, message: ""}
            if (admissionData && admissionData.id) {
                // use the new route except for docs todo: harmonize this function
                let result
                if (step) {
                    result = await apis.admission.post(`/applicants/update/${step}/${admissionData.id}`, proppedData)
                } else {
                    result = await apis.admission.patch(`/admission/applicant/${admissionData.id}`, {...proppedData}, {
                        headers: {"Content-Type": isFiles ? "multipart/form-data" : 'application/json'}
                    })
                }
                return {...result.data, status: result.status, isFiles}
            }
            return {message: "No admission data found", status: 403}
        },
        onSuccess: (result) => {
            if (result.data)
                update(result.data)
            if (result.status !== 200)
                return
            if (!autosave)
                notifications.show({title: "Success!", message: result.message})
            setAutosave(false)
            if (callback) {
                callback()
            }
            if (result.isFiles && formRef && formRef.current) {
                formRef.current.reset()
            }
        },
        onError: (error) => {
            if (!autosave)
                notifications.show(getErr(error))
            setAutosave(false)
        }
    })

    const goBack = ({proppedData, isFiles}: { proppedData: any, isFiles: boolean, step?: FormSteps }) => {
        try {
            setAutosave(true)
            const currentStep = parseInt(stage);
            mutate({proppedData: proppedData, isFiles})
            if (currentStep > 1)
                navigate({to: "/steps/$stage", params: {stage: `${currentStep - 1}`}}).catch()
            else navigate({to: "/"}).catch()
        } catch (_e) {
        }
    }
    const goNext = ({proppedData, isFiles}: { proppedData: any, isFiles: boolean, step?: FormSteps }) => {
        try {
            setAutosave(true)
            const currentStep = parseInt(stage);
            mutate({proppedData: proppedData, isFiles})
            navigate({to: "/steps/$stage", params: {stage: `${currentStep + 1}`}}).catch()
        } catch (_e) {
        }
    }
    return {
        goBack,
        goNext,
        mutate,
        isPending,
    }
}

