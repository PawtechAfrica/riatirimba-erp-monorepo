import StepFormLayout from "@/components/layout/StepFormLayout.tsx";
import {Select, TextInput} from "@mantine/core";
import {useEffect, useState} from "react";
import useAdmissionDataStore from "@/stores/useAdmissionDataStore.ts";
import {useStore} from "zustand/react";
import {type AcademicHistoryObj, BasicEducationEnum, TertiaryLevel} from "@/libs/types.ts";
import {makeLabel, validateIndexNumber} from "@/libs/functions.ts";
import {useForm} from "@mantine/form";


export default function Step4AcademicHistoryForm() {
    const [activeLevel, setActiveLevel] = useState<BasicEducationEnum>(BasicEducationEnum.PRIMARY_SCHOOL)

    const academic = useForm<Partial<AcademicHistoryObj>>({
        mode: 'controlled',
        initialValues: {
            kcpeIndexNumber: "",
            primarySchool: "",
            highSchool: "",
            kcseIndexNumber: "",
            kcseGrade: null,
            highestEducationLevel: null,
            tertiarySchool: "",
            tertiaryLevel: null,
        },
        validateInputOnBlur: true,
        validate: {
            'kcpeIndexNumber': val => val ? validateIndexNumber(val)[1] : "",
            'kcseIndexNumber': val => val ? validateIndexNumber(val)[1] : "",
        },
        onValuesChange: (values, prev) => {
            // if (values.highestEducationLevel && activeLevel !== values.highestEducationLevel)
            // setActiveLevel(values.highestEducationLevel)
            if (prev.highestEducationLevel !== values.highestEducationLevel)
                switch (values.highestEducationLevel) {
                    case "primary":
                        // clear high school and KCSE fields
                        academic.setValues({
                            ...academic.getValues(),
                            kcseGrade: null,
                            kcseIndexNumber: null,
                            highSchool: null,
                            tertiaryLevel: null,
                            tertiarySchool: null
                        })
                        break
                    case "secondary":
                        // clear Tertiary fields
                        academic.setValues({
                            ...academic.getValues(),
                            tertiaryLevel: null,
                            tertiarySchool: null,
                        })
                }
        }
    })
    academic.watch('highestEducationLevel', (val) => setActiveLevel(val.value || BasicEducationEnum.PRIMARY_SCHOOL))

    const admissionData = useStore(useAdmissionDataStore, store => store.admissionData);

    useEffect(() => {
        // populate locally
        if (admissionData && admissionData.academicHistory) {
            // setAcademic(prev => ({...prev, ...admissionData.academicHistory}))
            academic.initialize({...admissionData.academicHistory})
        }
    }, [admissionData?.academicHistory]);


    return (
        <StepFormLayout thisProps={{className: "grid md:grid-cols-3 gap-2", "data-aos": "fade-down"}}
                        proppedData={{...academic.getValues()}} step={"ac-history"} title={"Academic History"}>
            <Select
                required
                label={"Highest Education Level"}
                placeholder={"Highest Education Level"}
                {...academic.getInputProps('highestEducationLevel')}
                data={Object.keys(BasicEducationEnum).map(key => ({
                    label: makeLabel(key),
                    value: BasicEducationEnum[key as keyof typeof BasicEducationEnum],
                }))}
            />
            <TextInput
                required
                label="Primary School"
                placeholder="Enter primary school name"
                name="primarySchool"
                {...academic.getInputProps('primarySchool')}
            />
            <TextInput
                required
                label="KCPE Index Number/Year"
                placeholder={"E.G 40735253016/2022"}
                name="kcpeIndexNumber"
                {...academic.getInputProps('kcpeIndexNumber')}
            />
            {/*{academic.values.highestEducationLevel && (academic.values.highestEducationLevel != BasicEducationEnum.PRIMARY_SCHOOL) &&*/}
            {(activeLevel != BasicEducationEnum.PRIMARY_SCHOOL) &&
                <>
                    <TextInput
                        required
                        label="High School"
                        placeholder="Enter high school name"
                        name="highSchool"
                        {...academic.getInputProps('highSchool')}
                    />
                    <TextInput
                        required
                        label="KCSE Index Number/year"
                        placeholder="E.G 40735253016/2022"
                        name="kcseIndexNumber"
                        {...academic.getInputProps('kcseIndexNumber')}
                    />
                    <Select
                        required
                        label="KCSE Grade"
                        clearable={true}
                        name={'kcseGrade'}
                        placeholder="Select your KCSE grade"
                        data={["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E"]}
                        {...academic.getInputProps('kcseGrade')}
                    />
                </>
            }
            {/*{academic.values.highestEducationLevel === BasicEducationEnum.TERTIARY && <>*/}
            {activeLevel === BasicEducationEnum.TERTIARY && <>
                <TextInput
                    required
                    label={"Name of tertiary institution"}
                    name={'tertiarySchool'}
                    placeholder={"Enter name of institution"}
                    {...academic.getInputProps('tertiarySchool')}
                />
                <Select
                    required
                    label={"Certificate awarded"}
                    name={'tertiaryLevel'}
                    placeholder={"Select level of certificate"}
                    {...academic.getInputProps('tertiaryLevel')}
                    data={[
                        {label: "Certificate", value: TertiaryLevel.CERTIFICATE},
                        {label: "Diploma", value: TertiaryLevel.DIPLOMA},
                        {label: "Bachelors", value: TertiaryLevel.DEGREE},
                    ]}
                />
            </>}
        </StepFormLayout>
    )
}

