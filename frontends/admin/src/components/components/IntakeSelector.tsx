import {Select} from "@mantine/core";
import {HiBarsArrowDown} from "react-icons/hi2";
import {FaChevronDown} from "react-icons/fa";
import {type IntakeObj} from "@/libs/types/admission.types.ts";

interface IntakeSelectorProps {
    intakes: IntakeObj[];
    value: string | null;
    onChange: (value: string) => void;
    showAllOption?: boolean;
}

export default function IntakeSelector({
                                           intakes,
                                           value,
                                           onChange,
                                           showAllOption = false,
                                       }: IntakeSelectorProps) {
    const data = showAllOption
        ? [
            {label: "All intakes", value: "all"},
            ...intakes.map(intake => ({
                label: intake.readable || intake.periodYearKey,
                value: intake.periodYearKey,
            })),
        ]
        : intakes.map(intake => ({
            label: intake.readable,
            value: intake.periodYearKey,
        }));

    return (
        <Select
            variant={'filled'}
            className={'w-max'}
            classNames={{wrapper: "w-max min-w-[20px]", input: " text-xl font-bold text-primary-700"}}
            placeholder={"Select intake period"}
            data={data}
            value={value}
            onChange={(val) => {
                if (val) {
                    onChange(val);
                } else if (showAllOption) {
                    onChange("all");
                }
            }}
            style={{width: "auto !important"}}
            rightSection={<HiBarsArrowDown className={'text-md text-primary-700'}/>}
            leftSection={<FaChevronDown className={'text-md text-primary-700'}/>}
        />
    );
}
