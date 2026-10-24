import type {AxiosResponse} from "axios";
import type {ApiResponse} from "@/libs/types/app.types.ts";
import {type EnrollmentAPI, type UpdateEnrollmentDTO} from "@/schemas/enrollment.schema.ts";
import {createStore} from "zustand";
import apis from "@/libs/api";


interface EnrollmentStore {

    updateEnrollment(traineeId: string, enrollmentId: string | bigint, autoAdmissionNumber: boolean, data: UpdateEnrollmentDTO): Promise<AxiosResponse<ApiResponse<EnrollmentAPI>>>
}

const useEnrollmentStore = createStore<EnrollmentStore>()((_set, _get) => ({
    updateEnrollment: async (traineeId, enrollmentId, autoAdmissionNumber, data) => {
        return apis.trainees.post<ApiResponse<EnrollmentAPI>>(`/enrollment/update/${traineeId}/${enrollmentId}/${autoAdmissionNumber}`, data)
    }
}))

export default useEnrollmentStore;

