import {Button, Modal, Space, Text, Title} from "@mantine/core";
import {RiDeleteBin5Fill} from "react-icons/ri";
import {RxCross2} from "react-icons/rx";
import {useMutation} from "@tanstack/react-query";
import useTraineeStore from "@/stores/useTraineeStore.ts";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import {useStore} from "zustand/react";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";


type props = {
    traineeId: string;
    applicantIds?: string[];
    open: boolean;
    setOpen: (open: boolean) => void;
} | {
    traineeId?: string;
    applicantIds: string[];
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function DeleteTraineeApplicantForm({traineeId, applicantIds, open, setOpen}: props) {
    const {deleteTrainee} = useTraineeStore()
    const {deleteApplicants} = useStore(useAdmissionStore)
    const {mutate, isPending} = useMutation({
        mutationKey: ['delete-trainee-applicant'],
        mutationFn: async () => {
            if (!traineeId && !applicantIds)
                throw new Error("No trainee or applicant id provided")
            if (traineeId)
                return await deleteTrainee(traineeId)
            if (applicantIds)
                return await deleteApplicants(applicantIds)
        },
        onSuccess: (response) => {
            if (response)
                notifications.show(showSuccess(`${traineeId ? "Trainee" : "Applicant"} deleted successfully!`))
        },
        onError: (err) => {
            notifications.show(showErr(err))
        }
    })

    return (
        <Modal
            title={
                <span className={'flex items-center gap-2 text-accent-500'}>
                    <RiDeleteBin5Fill/>
                    <Title order={4}>{`Delete ${traineeId ? "trainee" : "applicant"}`}</Title>
                </span>
            }
            opened={open}
            onClose={() => setOpen(false)}
        >
            <Text>Are you sure you want to delete this {traineeId ? "trainee" : "applicant"}? This action <span
                className={'text-accent-700'}>may NOT be
                reversible</span>
            </Text>
            <Space h={10}/>
            <div className={'flex gap-2'}>
                <Button onClick={() => setOpen(false)} leftSection={<RxCross2/>}>Cancel</Button>
                <Button
                    disabled={isPending} onClick={() => mutate()} color={'accent'}>Yes, I want to delete this
                    trainee</Button>
            </div>
        </Modal>
    )
}