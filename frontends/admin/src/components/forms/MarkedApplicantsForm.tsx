import {MdCancel, MdCheck} from "react-icons/md";
import {Button, Text} from "@mantine/core";
import {IoMdTrash} from "react-icons/io";
import {useMutation} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";
import {useStore} from "zustand/react";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import DeleteTraineeApplicantForm from "@/components/forms/DeleteTraineeApplicantForm.tsx";
import {useContext, useState} from "react";
import {useSearch} from "@tanstack/react-router";
import {ApplicantDataContext} from "@/contexts/ApplicantDataContext.tsx";
import {useClickOutside} from "@mantine/hooks";

interface props {
    checkedSize: number;
    clearChecked: () => void;
    applicant_ids: Array<string>;
}

export default function MarkedApplicantsForm({checkedSize, clearChecked, applicant_ids}: props) {
    const {approveApplications, deleteApplicants} = useStore(useAdmissionStore)
    // const {page} = useParams({from: "/(app)/__layout/registry/__registry_layout/admission/applications/"})
    const {page} = useSearch({from: "/(app)/__layout/registry/__registry_layout/admission/applications/"})
    const {applicantQuery} = useContext(ApplicantDataContext)

    const approve = useMutation({
        mutationKey: ['approve-applicants'],
        mutationFn: () => approveApplications(applicant_ids),
        onSuccess: async result => {
            notifications.show(showSuccess(result.message));
            clearChecked();
            if (applicantQuery) await applicantQuery?.refetch()
        },
        onError: error => {
            notifications.show(showErr(error))
        }
    })

    const [openDeleteForm, setOpenDeleteForm] = useState(false);

    const delApplicants = useMutation({
        mutationKey: ['delete-applicants'],
        mutationFn: async () => await deleteApplicants(applicant_ids, Number(page)),
        onSuccess: async (result) => {
            notifications.show(showSuccess(result.message));
            clearChecked();
            if (applicantQuery) await applicantQuery?.refetch()
        },
        onError: error => {
            notifications.show(showErr(error))
        }
    })

    const clickOutside = useClickOutside(() => {
        clearChecked()
    })

    if (checkedSize < 1) return <></>
    return (
        <div
            ref={clickOutside}
            // data-aos={'zoom-in'}
            className={"w-max fixed max-w-full h-max z-40 bg-primary-800 drop-shadow-xl right-[50%] left-[50%] " +
                "-translate-x-1/2 ml-0 mr-0 bottom-20 grid gap-2 p-2 border border-solid transition-all " +
                "border-slate-200 rounded-lg"}
        >
            <DeleteTraineeApplicantForm
                applicantIds={applicant_ids}
                open={openDeleteForm}
                setOpen={() => setOpenDeleteForm(false)}
            />
            <span className={'flex text-white text-[22pt] gap-2 items-center'}><MdCancel/><Text
                className={'text-[14pt] font-bold'}>Selected</Text></span>
            <div className={"flex gap-2 justify-start items-center"}>
                <Button
                    loading={approve.isPending} disabled={approve.isPending || delApplicants.isPending}
                    onClick={() => approve.mutate()}
                    leftSection={<MdCheck/>}
                    color={'secondary'} variant={'filled'}
                >
                    Approve application{checkedSize > 1 ? 's' : ''}
                </Button>
                <Button
                    onClick={() => delApplicants.mutate()}
                    leftSection={<IoMdTrash/>} color={'accent'}
                    variant={'filled'}
                    loading={delApplicants.isPending}
                    disabled={delApplicants.isPending || approve.isPending}
                >
                    Delete application{checkedSize > 1 ? 's' : ''}
                </Button>
            </div>
        </div>
    )
}
