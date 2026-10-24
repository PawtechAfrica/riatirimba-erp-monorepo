import type {ApplicationObj} from "@/libs/types/admission.types.ts";
import {Badge, Button, Checkbox, Indicator, Menu, Table} from "@mantine/core";
import {useStore} from "zustand/react";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import {BiChevronDown, BiChevronUp, BiLoaderAlt} from "react-icons/bi";
import {useContext, useState} from "react";
import {CgEye, CgSpinner} from "react-icons/cg";
import {MdCheck} from "react-icons/md";
import MarkedApplicantsForm from "@/components/forms/MarkedApplicantsForm.tsx";
import useAppMutations from "@/hooks/useAppMutations.ts";
import {useNavigate} from "@tanstack/react-router";
import {ApplicantDataContext} from "@/contexts/ApplicantDataContext.tsx";
import EmptyOrLoadingList from "@/components/screens/EmptyOrLoadingList.tsx";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import {BsDownload} from "react-icons/bs";
import downloadAdmissionLetter from "@/utils/downloadAdmissionLetter.ts";
import {useMutation} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import {showErr, showSuccess} from "@/utils/notification.util.tsx";


interface props {
    applicants: ApplicationObj[]
    pageSize: number
    page: number,
    loading?: boolean
    retry?: () => any;
}

export default function ApplicantsTable({page, applicants, loading, pageSize, retry}: props) {
    const {getCourses} = useStore(useAcademicStore)
    const [open, setOpen] = useState<null | string>(null);
    const [checked, setChecked] = useState<Set<string>>(new Set())
    const {approveApplicant} = useAppMutations({
        refresh: retry ? retry : () => {
        }
    })
    const navigate = useNavigate()
    const {applicantQuery} = useContext(ApplicantDataContext)
    const {intakes} = useStore(useAdmissionStore)

    const downloadAdmLetterQuery = useMutation({
        mutationKey: ['download-admission-letter'],
        mutationFn: (data: {
            periodYearKey: string,
            applicantId: string
        }) => downloadAdmissionLetter(data.periodYearKey, data.applicantId),
        onSuccess: () => {
            notifications.show(
                showSuccess("The admission letter has been downloaded successfully", "Admission letter downloaded")
            )
        },
        onError: (error) => {
            notifications.show(showErr(error))
        },
        onSettled: () => {
            setOpen(null)
        }
    })

    return (
        <>
            <Table className={'h-max'} striped={true} stripedColor={'gray.1'}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>No.</Table.Th>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Phone</Table.Th>
                        <Table.Th>Level</Table.Th>
                        <Table.Th>Course</Table.Th>
                        <Table.Th>Intake</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Action</Table.Th>
                        <Table.Th>
                            <Checkbox
                                checked={applicants.length > 0 && checked.size === applicants.length}
                                onChange={() => checked.size === applicants.length
                                    ? setChecked(new Set())
                                    : setChecked(new Set(applicants.map(ap => ap.id)))}
                            />
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {applicants.map((applicant, i) => {
                        const course = applicant.enrollments && applicant.enrollments.course ? getCourses().get(applicant.enrollments.course) ?? applicant.enrollments.course : "Incomplete";

                        return (
                            <Table.Tr key={i}>
                                <Table.Td>
                                    {(page - 1) * pageSize + (i + 1)}
                                </Table.Td>
                                <Table.Td>{applicant.firstName + ' ' + applicant.lastName}</Table.Td>
                                <Table.Td>
                                    <a href={`tel:${applicant.phone}`}>
                                        {applicant.phone}
                                    </a>
                                </Table.Td>
                                {/*<Table.Td>{applicant.academicHistory.highestEducationLevel == 'secondary' ? applicant?.academicHistory?.kcseGrade ?? "Incomplete" : "Not-applicable"}</Table.Td>*/}
                                <Table.Td>{applicant.academicHistory?.highestEducationLevel ?? "----"}</Table.Td>
                                <Table.Td>{typeof course === 'object' ? `${course.name} (Lev ${course.level})` : course}</Table.Td>
                                <Table.Td className={'truncate'}>
                                    {/*todo: Check type checking*/}
                                    {typeof applicant.enrollments?.intake === 'object' ? applicant.enrollments.intake?.readable : intakes.get(applicant.enrollments?.intake!)?.readable}
                                </Table.Td>
                                <Table.Td>
                                    <Indicator
                                        size={16}
                                        inline
                                        color={(applicant.admissionErrors?.errors.length || 0) > 0 ? 'red.8' : 'transparent'}
                                        label={applicant.admissionErrors?.errors.length || ""}>
                                        <Badge
                                            classNames={{label: 'text-[8px]'}}
                                            color={
                                                applicant.migrated
                                                    ? "primary"
                                                    : applicant.pending
                                                        ? "secondary"
                                                        : applicant.completionStatus > 90 ? 'accent' : 'gray.3'
                                            }>
                                            {
                                                applicant.migrated
                                                    ? "Approved"
                                                    : applicant.pending
                                                        ? "Pending"
                                                        : applicant.completionStatus >= 100 ? "Complete" : `${applicant.completionStatus}%`
                                            }
                                        </Badge>
                                    </Indicator>
                                </Table.Td>
                                <Table.Td>
                                    <Menu
                                        opened={open === applicant.id}
                                        onClose={() => {
                                            setTimeout(() => {
                                                if (downloadAdmLetterQuery.isPending) return;
                                                setOpen(null)
                                            }, 1500)
                                        }}
                                        onOpen={() => setOpen(applicant.id)}>
                                        <Menu.Target>
                                            <Button variant={'light'}
                                                    rightSection={open === applicant.id ? <BiChevronUp/> :
                                                        <BiChevronDown/>}
                                                    size={'xs'}
                                            >
                                                Menu
                                            </Button>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item onClick={() => navigate({
                                                // to: "/registry/admission/applications/$page/$id",
                                                to: "/registry/admission/applications/$id",
                                                // params: {page: page.toString(), id: applicant.id}
                                                search: {page: page},
                                                params: {id: applicant.id}
                                            })} leftSection={<CgEye/>}>
                                                View applicant
                                            </Menu.Item>
                                            <Menu.Item
                                                disabled={applicant.migrated && applicant.pending}
                                                leftSection={approveApplicant.isPending ?
                                                    <BiLoaderAlt className={'animate-spin duration-300'}/> : <MdCheck/>}
                                                onClick={() => approveApplicant.mutate([applicant.id])}
                                            >
                                                Approve application
                                            </Menu.Item>
                                            <Menu.Item
                                                disabled={!applicant.migrated}
                                                leftSection={downloadAdmLetterQuery.isPending ? <CgSpinner/> :
                                                    <BsDownload/>}
                                                onClick={() => {
                                                    if (!applicant.enrollments?.intake) return;
                                                    const intake = applicant.enrollments.intake
                                                    return downloadAdmLetterQuery.mutate({
                                                        periodYearKey: typeof intake === 'object' ? intake.periodYearKey : intake,
                                                        applicantId: applicant.id
                                                    })
                                                }}
                                            >
                                                Admission letter
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Table.Td>
                                <Table.Td>
                                    <Checkbox
                                        // disabled={!applicant.submitted || applicant.migrated}
                                        checked={checked.has(applicant.id)}
                                        onChange={() => {
                                            if (checked.has(applicant.id)) {
                                                // remove it
                                                const newSet = new Set(checked)
                                                newSet.delete(applicant.id)
                                                setChecked(newSet)
                                            } else {
                                                const newSet = new Set(checked)
                                                newSet.add(applicant.id)
                                                setChecked(newSet)
                                            }
                                        }}
                                    />
                                </Table.Td>
                            </Table.Tr>)
                    })}
                </Table.Tbody>
            </Table>
            <MarkedApplicantsForm
                checkedSize={checked.size}
                applicant_ids={[...checked.values()]}
                clearChecked={() => setChecked(new Set())}
            />
            {applicants.length < 1 &&
                <EmptyOrLoadingList
                    loading={applicantQuery?.isPending || !!loading}
                    message={"No applicants found"}
                    retry={retry}
                />}
        </>
    )
}
