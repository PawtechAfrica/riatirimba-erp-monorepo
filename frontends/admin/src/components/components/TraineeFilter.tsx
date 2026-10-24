import {ActionIcon, Button, Flex, MultiSelect, Radio, RadioGroup} from "@mantine/core";
import {MdCancel} from "react-icons/md";
import {useStore} from "zustand";
import useTraineeFilter from "@/hooks/useTraineeFilter.ts";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import {GenderEnum} from "@/libs/types/admission.types.ts";
import {RxCross2} from "react-icons/rx";
import type {TraineeQueryFilter} from "@/libs/types/trainee.types.ts";


interface props {
    filters: TraineeQueryFilter
    setFilters: (field: Partial<TraineeQueryFilter>) => void,
}

export default function TraineeFilter({filters, setFilters}: props) {
    const {isFiltersOn, resetFilter} = useStore(useTraineeFilter)
    const {getCourses, departments} = useStore(useAcademicStore)

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
                <RadioGroup
                    className={"bg-slate-100 h-full p-2.5 rounded-md"}
                    value={filters.gender}
                    onChange={val => setFilters({gender: val as GenderEnum})}>
                    <Flex align={'center'} gap={"10px"}>
                        <Radio label={"Male"} value={GenderEnum.MALE}/>
                        <Radio label={"Female"} value={GenderEnum.FEMALE}/>
                        <ActionIcon hidden={!filters.gender}
                                    onClick={() => setFilters({gender: null})} color={'red'}
                                    variant={'light'}><RxCross2/></ActionIcon>
                    </Flex>
                </RadioGroup>
                <div className={'flex flex-1 gap-2  items-center'}>
                </div>
            </div>
        </div>
    )
}

