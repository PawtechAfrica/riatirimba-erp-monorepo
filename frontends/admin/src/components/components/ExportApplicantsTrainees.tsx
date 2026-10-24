import {Button, Checkbox, Modal, MultiSelect, Select, TextInput, Title} from "@mantine/core";
import {useState} from "react";
import {FaPrint} from "react-icons/fa";
import {useLocation} from "@tanstack/react-router";
import type {ApplicantsRecordKeys} from "@/libs/types/app.types.ts";
import {GenderEnum} from "@/libs/types/admission.types.ts";
import {APPLICANT_RECORD_KEYS} from "@/libs/static.values.ts";
import {downloadBlob, getFilenameFromResponse, makeLabel} from "@/libs/utils.ts";
import {showErr} from "@/utils/notification.util.tsx"
import {useStore} from "zustand";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import api from "@/libs/api.ts";
import {notifications} from "@mantine/notifications";
import {useMutation} from "@tanstack/react-query";

interface props {
    listToExport?: string[]
}


export default function ExportApplicantsTrainees({listToExport}: props = {listToExport: []}) {
    const {pathname} = useLocation()
    const {intakes} = useStore(useAdmissionStore)
    const {getCourses} = useStore(useAcademicStore)

    const [opened, setOpened] = useState(false);
    const title = pathname.includes('admission') ? "Applicants" : "Trainees"

    const [request, setRequest] = useState<{
        fields: ApplicantsRecordKeys[]
        idList: string[]
        name: string,
        filters: {
            intakes: string[],
            courses: string[],
            newApplicant: "1" | "" | null,
            gender: GenderEnum | null,
            approved: '1' | '' | null
        }
    }>({
        fields: [...APPLICANT_RECORD_KEYS],
        idList: listToExport || [],
        name: "",
        filters: {
            intakes: [],
            courses: [],
            newApplicant: null,
            gender: null,
            approved: null
        }
    })
    const [filename, setFilename] = useState<string>("")

    async function fetchFile() {
        try {
            const response = await api.reporting.post(`/report/${title == "Applicants"}`,
                {...request, name: filename}, {
                    responseType: 'blob',
                    // params: {applicants: title === "Applicants"}
                })
            const getFilename = getFilenameFromResponse(response) || filename;
            downloadBlob(response.data, getFilename);
        } catch (err) {
            notifications.show(showErr(err as unknown as Error))
        }
    }

    const mutate = useMutation({
        mutationKey: ['export-applicants-to-excel'],
        mutationFn: fetchFile,
    })

    return (
        <>
            <Modal
                classNames={{body: 'grid gap-5 auto-rows-max'}}
                fullScreen={true}
                title={<Title order={3}>Export {title}</Title>}
                opened={opened}
                onClose={() => setOpened(false)}
            >
                {listToExport && listToExport.length > 0 && <span className={'text-red-700'}>
                    *{listToExport.length} {title.toLowerCase()} selected for export
                </span>}
                {/* set fields to print */}
                <div className={'grid gap-2'}>
                    <Title order={5}>Fields to export</Title>
                    <div
                        className={'grid auto-cols-min  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2'}>
                        {APPLICANT_RECORD_KEYS.map((field, i) =>
                            <Checkbox
                                checked={request.fields.includes(field)}
                                onChange={e => {
                                    if (e.target.checked) setRequest({...request, fields: [...request.fields, field]})
                                    else setRequest({...request, fields: request.fields.filter(f => f !== field)})
                                }}
                                key={i} value={field}
                                label={makeLabel(field)}/>)}
                    </div>
                </div>
                {/* Filter results */}
                <div>
                    <Title order={5}>Filters</Title>
                    <div className={'grid grid-cols-2 gap-2'}>
                        <Select
                            clearable={true}
                            label={"Approved applicants only"}
                            placeholder={"Select approved applicants or not-approved applicant"}
                            value={request.filters.approved}
                            onChange={val => setRequest({
                                ...request,
                                filters: {...request.filters, approved: val as "1" | "" | null}
                            })}
                            name={'approved'}
                            data={[
                                {label: "Approved applicants", value: "1"},
                                {label: "Non-approved applicants", value: ""}]}
                        />
                        <Select
                            clearable={true}
                            label={"Select new applicants or existing applicant"}
                            placeholder={"Select new applicants or existing applicant"}
                            value={request.filters.newApplicant}
                            onChange={val => setRequest({
                                ...request,
                                filters: {...request.filters, newApplicant: val as "1" | "" | null}
                            })}
                            name={'newApplicant'}
                            data={[
                                {label: "New applicants only", value: "1"},
                                {label: "Existing applicants only", value: ""}]}
                        />
                        <Select
                            clearable={true}
                            label={"Select gender"}
                            placeholder={"Select gender"}
                            value={request.filters.gender}
                            onChange={val => setRequest({
                                ...request,
                                filters: {...request.filters, gender: val as GenderEnum | null}
                            })}
                            name={'newApplicant'}
                            data={[
                                {label: "Male", value: GenderEnum.MALE},
                                {label: "Female", value: GenderEnum.FEMALE}]}
                        />

                        <MultiSelect
                            clearable={true}
                            searchable={true}
                            value={request.filters.intakes}
                            onChange={val => setRequest({...request, filters: {...request.filters, intakes: val}})}
                            label={"Intake periods"}
                            placeholder={"Select all needed intake periods"}
                            data={[...intakes.values()].map(intake => ({
                                label: intake.readable,
                                value: intake.periodYearKey
                            }))}
                        />
                        <MultiSelect
                            clearable={true}
                            searchable={true}
                            value={request.filters.courses}
                            onChange={val => setRequest({...request, filters: {...request.filters, courses: val}})}
                            label={"Courses"}
                            placeholder={"Select all needed courses"}
                            data={[...getCourses().values()].map(course => ({
                                label: `${course.name} - Level ${course.level}`,
                                value: course.id.toString()
                            }))}
                        />
                    </div>
                </div>
                <TextInput
                    label={"Report name"}
                    placeholder={"Report name"}
                    value={filename}
                    onChange={({target: {value}}) => setFilename(value)}
                />
                <Button loading={mutate.isPending} onClick={() => mutate.mutate()} leftSection={<FaPrint/>}>
                    Export to excel
                </Button>
            </Modal>
            <Button
                // disabled={printApplicants.isPending}
                onClick={() => setOpened(true)}
                leftSection={<FaPrint/>} size={'xs'} variant={'subtle'}
                color={'black'}
            >
                Export
            </Button>
        </>
    )
}

