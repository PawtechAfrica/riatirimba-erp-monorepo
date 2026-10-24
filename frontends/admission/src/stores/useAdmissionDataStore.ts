import {createStore} from "zustand";
import type {ApplicantData} from "@/libs/types.ts";


interface AdmissionDataState {
    admissionData: Partial<ApplicantData> | null;
    update: (data: Partial<ApplicantData>) => void;
}

const useAdmissionDataStore = createStore<AdmissionDataState>()((set, _get) => ({
        admissionData: null,
        update: (data) => {
            set(prev => ({...prev, admissionData: {...prev.admissionData, ...data}}))
        },
    })
)

export default useAdmissionDataStore;

