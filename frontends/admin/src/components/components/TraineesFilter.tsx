import {Button, Select, TextInput, Title} from "@mantine/core";
import {useStore} from "zustand/react";
import useTraineeStore from "@/stores/useTraineeStore.ts";
import {useShallow} from "zustand/react/shallow";
import {BiCalendar, BiSearch} from "react-icons/bi";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import {HiBuildingOffice} from "react-icons/hi2";
import {FaGraduationCap} from "react-icons/fa";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";
import {MdCheck, MdClose} from "react-icons/md";


export default function TraineesFilter() {
    const {filter, setFilter} = useStore(useTraineeStore, useShallow(store => ({
        filter: store.filters,
        setFilter: store.setFilters
    })))
    const {departments, getCourses} = useStore(useAcademicStore)
    const {intakes} = useStore(useAdmissionStore)

    return (
        <div className={"bg-white pb-5 grid gap-2 p-2 border"}>
            <Title order={4}>Filter</Title>
            <div className={"flex justify-between gap-2"}>
                <TextInput
                    className={'flex-1'}
                    placeholder={"Search for trainee"}
                    leftSection={<BiSearch/>}
                    value={filter.term}
                    onChange={({target: {value}}) => setFilter({"term": value})}
                />
                <Select
                    className={'flex-1'}
                    leftSection={<HiBuildingOffice/>}
                    placeholder={"Department"}
                    clearable={true}
                    searchable={true}
                    value={filter.department?.toString()}
                    onChange={value => setFilter({"department": Number(value)})}
                    data={Object.keys(departments).map(key => ({
                        value: key,
                        label: departments[Number(key)]?.name ?? ""
                    }))}
                />
                <Select
                    className={'flex-1'}
                    placeholder={"Course"}
                    leftSection={<FaGraduationCap/>}
                    clearable={true}
                    searchable={true}
                    value={filter.course?.toString()}
                    onChange={value => setFilter({"course": Number(value)})}
                    data={[...getCourses().values()].map(course => ({
                        value: course.id.toString(),
                        label: `${course.name} - Level ${course.level}`
                    }))}
                />
                <Select
                    className={'flex-1'}
                    searchable={true}
                    clearable={true}
                    placeholder={"Intake"}
                    leftSection={<BiCalendar/>}
                    value={filter.intake?.toString()}
                    onChange={val => setFilter({"intake": Number(val)})}
                    data={[...intakes.values()].map(intake => (
                        {label: intake.readable, value: intake.id.toString()}
                    ))}
                />
                <Button
                    onClick={() => {
                        setFilter({set: !filter.set, ...(!filter.set ? {}:{"term": "", "department": null, "course": null, "intake": null})})
                    }}
                    leftSection={filter.set ? <MdClose/> : <MdCheck/>}
                >
                    {filter.set ? "Clear" : "Save"}
                </Button>
            </div>
        </div>
    )
}

