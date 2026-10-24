import {useMutation} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import {useStore} from "zustand/react";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";


interface props {
    refresh?: () => void;
}

export default function useAppMutations({refresh}: props) {
    const {approveApplications} = useStore(useAdmissionStore)

    const approveApplicant = useMutation({
        mutationKey: ['approve-applicants'],
        mutationFn: (applicant_ids: string[]) => approveApplications(applicant_ids),
        onSuccess: async result => {
            notifications.show(showSuccess(result.message));
            if (refresh) refresh()
        },
        onError: error => {
            notifications.show(showErr(error))
        }
    })

    return {approveApplicant}
}

