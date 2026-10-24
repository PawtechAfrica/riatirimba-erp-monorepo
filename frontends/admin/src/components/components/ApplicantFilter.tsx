import useApplicantsFilter from "@/hooks/useApplicantsFilter.ts";
import {type UseQueryResult} from "@tanstack/react-query";
import {useEffect} from "react";
import {useStore} from "zustand";
import {Button, Checkbox, MultiSelect} from "@mantine/core";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import {type ApplicantQueryFilter, type ApplicationObj} from "@/libs/types/admission.types.ts";
import {MdCancel} from "react-icons/md";
import type {PaginatedResponse} from "@/libs/types/app.types.ts";


interface props {
    filters: ApplicantQueryFilter
    // setFilters: React.Dispatch<React.SetStateAction<ApplicantQueryFilter>>,
    setFilters: (field: Partial<ApplicantQueryFilter>) => void,
    query: UseQueryResult<PaginatedResponse<ApplicationObj>, Error>
}

export default function ApplicantFilter({filters, setFilters}: props) {
    const {departments, getCourses, fetchDepartmentWithCourses} = useStore(useAcademicStore)
    const {isFiltersOn, resetFilter} = useStore(useApplicantsFilter)


    useEffect(() => {
        if (getCourses().size < 1 || Object.values(departments).length < 1) fetchDepartmentWithCourses()
    }, [getCourses().size, departments, fetchDepartmentWithCourses])

    return (
        <div className={'sticky top-[65px] py-2 bg-white z-10'}>
            <div className={"flex justify-between items-center"}>
                <span className={'font-bold'}>Filters</span>
                <Button onClick={() => {
                    resetFilter()
                }} hidden={!isFiltersOn} variant={'light'} color={'red'}
                        leftSection={<MdCancel/>}>Cancel</Button>
            </div>
            <div className={"flex flex-wrap gap-2 items-center"}>
                <MultiSelect
                    placeholder={"Course"}
                    clearable={true}
                    searchable={true}
                    value={filters.course?.map(cId => cId.toString())}
                    onChange={val => setFilters({...filters, course: val.map(v => Number(v))})}
                    data={[...getCourses().values()].map(course => ({
                        value: course.id.toString(),
                        label: `${course.name} - Level ${course.level}`
                    }))}
                    hidePickedOptions={true}
                />
                <MultiSelect
                    placeholder={"Department"}
                    clearable={true}
                    searchable={true}
                    value={filters.department?.map(dId => dId.toString())}
                    onChange={val => {
                        setFilters({...filters, department: val.map(v => Number(v))})
                    }}
                    data={Object.keys(departments).map(key => ({
                        value: departments[Number(key)]?.id.toString() ?? "",
                        label: departments[Number(key)]?.name ?? ""
                    }))}
                    hidePickedOptions={true}
                />
                <div className={'flex flex-1 gap-2  items-center'}>
                    <Checkbox
                        classNames={{label: 'w-max'}}
                        checked={filters.pending ?? false}
                        onChange={e => setFilters({pending: e.target.checked ? true : undefined})}
                        label={"Pending approval"}/>
                    <Checkbox
                        classNames={{label: 'w-max'}}
                        checked={filters.migrated ?? false}
                        onChange={e => setFilters({migrated: e.target.checked ? true : undefined})}
                        label={"Approved"}/>
                    <Checkbox
                        classNames={{label: 'w-max'}}
                        checked={filters.completed ?? false}
                        onChange={e => setFilters({completed: e.target.checked ? true : undefined})}
                        label={"Completed"}/>
                    <Checkbox
                        classNames={{label: 'w-max'}}
                        checked={filters.incomplete ?? false}
                        onChange={e => setFilters({incomplete: e.target.checked ? true : undefined})}
                        label={"Incomplete"}
                    />
                </div>
            </div>
        </div>
    )

}

