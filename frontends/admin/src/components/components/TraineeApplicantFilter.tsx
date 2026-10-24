import useAcademicStore from "@/stores/useAcademicStore";
import useAdmissionStore from "@/stores/useAdmissionStore";
import {ActionIcon, type ComboboxData, Select, TextInput} from "@mantine/core";
import {BiCalendar, BiSearch} from "react-icons/bi";
import {FaCheck, FaGraduationCap} from "react-icons/fa";
import {HiBuildingOffice} from "react-icons/hi2";
import {useStore} from "zustand";
import type {FilterObj} from "@/hooks/useSearchEngine.ts";
import {RxCross2} from "react-icons/rx";
import {makeLabel} from "@/libs/utils.ts";
import {notifications} from "@mantine/notifications";
import {showSuccess} from "@/utils/notification.util.tsx";
import {useNavigate, type ValidateToPath} from "@tanstack/react-router";
import ExportApplicantsTrainees from "@/components/components/ExportApplicantsTrainees.tsx";


type FilterFieldTypeObj = {
    field: string;
    type: 'text';
} | {
    field: string;
    type: 'select';
    options: ComboboxData
}

interface props {
    isTrainee?: boolean
    filter: FilterObj;
    setFilter: (filter: FilterObj) => void;
    extraFields: FilterFieldTypeObj[];
    isActive: boolean;
    activate: (val: boolean) => void;
}

export default function TraineeApplicantFilter({isTrainee, filter, setFilter, extraFields, isActive, activate}: props) {
    const {departments, getCourses} = useStore(useAcademicStore)
    const {page} = useStore(useAdmissionStore)

    // todo: set conditional for trainees
    const url: ValidateToPath = isTrainee ? "/registry/trainees/view/list" : "/registry/admission/applications"

    const navigate = useNavigate();
    const {intakes} = useStore(useAdmissionStore)

    const handleActivateFilter = () => {
        if (isActive) {
            // clear filters
            setFilter({term: "", course: null, intake: null, department: null, newApplicant: null})
            activate(false)
            // return to the previous page
            return navigate({to: url, params: {page: page.toString()}})
        }
        // check at least there is one filter before sending the request
        if (Object.values(filter).filter(v => typeof v !== 'undefined' && v !== null).length < 1)
            return notifications.show(showSuccess("Please select at least one filter or enter text to search", "Notification!"))
        activate(true)
    }

    // const printApplicants = usePrintApplicants({list: []})
    return (
        <div className={" sticky top-[50px] z-[30] h-max grid gap-2 p-2 bg-white hover:drop-shadow-xl rounded-lg"}>
            <div className={'flex justify-between'}>
                <Select
                    placeholder={"Select intake period"}
                    data={[...intakes.values()].map(intake => ({label: intake.readable, value: intake.periodYearKey}))}
                    defaultValue={[...intakes.values()][0]?.periodYearKey}
                />
                <ExportApplicantsTrainees/>
            </div>
            <div className={"flex gap-2"}>
                <TextInput
                    leftSection={<BiSearch/>}
                    placeholder={"Search"}
                    value={filter.term}
                    onChange={({target: {value}}) => setFilter({...filter, term: value})}
                />
                <Select
                    className={'flex-1'}
                    searchable={true}
                    clearable={true}
                    placeholder={"Intake"}
                    value={filter.intake?.toString() ?? null}
                    onChange={(val) => setFilter({...filter, intake: val})}
                    leftSection={<BiCalendar/>}
                    data={
                        [...intakes.values()].map(intake => ({value: intake.periodYearKey, label: intake.readable}))}
                />
                <Select
                    className={'flex-1'}
                    leftSection={<HiBuildingOffice/>}
                    placeholder={"Department"}
                    clearable={true}
                    searchable={true}
                    value={filter.department?.toString() ?? null}
                    onChange={(val) => setFilter({...filter, department: val !== null ? parseInt(val) : val})}
                    data={Object.values(departments).map(
                        dep => ({value: dep?.id.toString() ?? "", label: dep?.name ?? "NOT_FOUND"}))}
                />
                <Select
                    className={'flex-1'}
                    placeholder={"Course"}
                    leftSection={<FaGraduationCap/>}
                    clearable={true}
                    searchable={true}
                    value={filter.course?.toString() ?? null}
                    onChange={val => setFilter({...filter, course: val !== null ? parseInt(val) : val})}
                    data={[...getCourses().values()]
                        .map(course => ({value: course.id.toString(), label: `Levl ${course.level} ~ ${course.name}`}))}
                />
                {extraFields.map(field => {
                    const holdVal = filter[field.field]
                    const valid = typeof holdVal === 'string' || typeof holdVal !== 'number'

                    return field.type === 'text' ? (
                        <TextInput
                            key={makeLabel(field.field)}
                            placeholder={field.field}
                            leftSection={<BiSearch/>}
                            value={typeof holdVal === "string" || typeof holdVal === 'number' ? holdVal : ""}
                            onChange={({target: {value}}) => setFilter({...filter, [field.field]: value})}
                        />
                    ) : (
                        <Select
                            key={field.field}
                            placeholder={field.field}
                            leftSection={<BiCalendar/>}
                            searchable={true}
                            clearable={true}
                            value={valid ? holdVal : null}
                            onChange={(val) => setFilter({...filter, [field.field]: val})}
                            data={field.options}
                        />
                    )
                })}
                <ActionIcon color={isActive ? 'accent.7' : ''} onClick={handleActivateFilter} size={'lg'}>
                    {isActive ? <RxCross2/> : <FaCheck/>}
                </ActionIcon>
            </div>
        </div>
    );
}
