import api from "@/libs/api.ts";
import {downloadBlob} from "@/libs/utils.ts";

export default async function downloadAdmissionLetter (intake: string, applicantId: string) {
    const response = await api.trainees.get(`/admission/admission-letter/download/${applicantId}/${intake}`, {responseType: 'blob'})
    return downloadBlob(response.data, 'admission-letter.pdf')
}