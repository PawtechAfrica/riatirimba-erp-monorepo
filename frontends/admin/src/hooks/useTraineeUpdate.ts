import {useMutation} from "@tanstack/react-query";
import {CreateTraineeDTO} from "@/libs/types/trainee.types.ts";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import {useStore} from "zustand/react";
import useTraineeStore from "@/stores/useTraineeStore.ts";

/**
 * @param id - The id of the trainee to update
 * @param page - The page visited when viewing the trainee
 */
export default function useTraineeUpdate({id, page = 1}: { id: string, page?: number | 1 }) {
    const {updateTrainee} = useStore(useTraineeStore)
    // const {page} = useSearch({from: "/(app)/__layout/registry/__registry_layout/trainees/view/trainee/:id"})

    // const page =1
    return useMutation({
        mutationKey: ['update-trainee'],
        mutationFn: async (data: Partial<CreateTraineeDTO>) => {
            return await updateTrainee(data, page, id)
        },
        onSuccess: (res) => {
            notifications.show(showSuccess(res.message))
        },
        onError: (err) => {
            notifications.show(showErr(err))
        }
    })
}

