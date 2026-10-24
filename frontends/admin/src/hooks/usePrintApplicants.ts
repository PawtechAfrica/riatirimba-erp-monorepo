import type {ApplicationObj} from "@/libs/types/admission.types.ts";
import api from "@/libs/api.ts";
import {notifications} from "@mantine/notifications";
import {downloadBlob, getFilenameFromResponse} from "@/libs/utils.ts";
import {showErr} from "@/utils/notification.util.tsx"
import {useMutation} from "@tanstack/react-query";

// todo: make it print a list
export default function usePrintApplicants({}: { list?: ApplicationObj[] }) {

    async function fetchFile() {
        try {
            const response = await api.admission.get('/applicants/export-to-excel', {responseType: 'blob'})
            const filename = getFilenameFromResponse(response);
            downloadBlob(response.data, filename);
        } catch (err) {
            notifications.show(showErr(err as unknown as Error))
        }
    }

    return useMutation({
        mutationKey: ['export-applicants-to-excel'],
        mutationFn: fetchFile,
    })
}

