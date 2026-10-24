import * as React from "react";
import {useRef, useState} from "react";
import {BasicEducationEnum, GenderEnum, GradeEnum, TertiaryLevel, TraineeTypeEnum} from "@/libs/types/admission.types.ts";
import {Button, Fieldset, Image, Select, TextInput, Title} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import dayjs from "dayjs";
import {IoMdTrash} from "react-icons/io";
import {RxCross1} from "react-icons/rx";
import {isValidPhoneFormat, makeLabel} from "@/libs/utils.ts";
import {showErr, showSuccess} from "@/utils/notification.util.tsx"
import {useMutation} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import useTraineeStore from "@/stores/useTraineeStore.ts";
import {useStore} from "zustand/react";
import useAcademicStore from "@/stores/useAcademicStore.ts";
import {useCacheStore} from "@/stores/useCacheStore.ts";
import DeleteTraineeApplicantForm from "@/components/forms/DeleteTraineeApplicantForm.tsx";
import {Link} from "@tanstack/react-router";
import {CreateEnrollmentDTO, type CreateTraineeDTO, type TraineeObj} from "@/libs/types/trainee.types.ts";
import {BsPersonAdd} from "react-icons/bs";
import {FormError} from "@/libs/types/app.types.ts";
import useAdmissionStore from "@/stores/useAdmissionStore.ts";

interface props {
    trainee?: TraineeObj;
}

const defaultEnrollment = {
    course: 0,
    intake: null,
    studentType: null,
    status: null,
    yearOfStudy: 1
} satisfies CreateEnrollmentDTO

const defaultNextOfKin = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    relationship: ""
}

const defaultTraineeObject = {
    academicHistory: {
        highestEducationLevel: null,
        kcseIndexNumber: null,
        kcpeIndexNumber: "",
        primarySchool: null,
        highSchool: null,
        tertiarySchool: null,
        kcseGrade: null,
        tertiaryLevel: null
    },
    address: {
        poBox: null,
        zipCode: null,
        county: "",
        location: "",
        subLocation: "",
        village: ""
    },
    enrollments: [defaultEnrollment],
    birthday: null,
    email: "",
    firstName: "",
    gender: null,
    idNumber: "",
    // idType: null,
    birthCertNumber: null,
    lastName: "",
    middleName: "",
    nemisCode: "",
    newApplicant: false,
    nextOfKins: [],
    phone: "",
    pinNumber: "",
    status: undefined
}

export default function CreateTraineeForm({trainee}: props) {
    const [fields, setFields] = useState<CreateTraineeDTO>(defaultTraineeObject)
    const [errors, setErrors] = useState<Record<string, string>>({});
    const {createTrainee} = useTraineeStore()
    const intakes = useStore(useAdmissionStore, store => store.intakes)
    const courses = useStore(useAcademicStore, store => store.getCourses)
    const {getItem} = useCacheStore()
    const formRef = useRef<HTMLFormElement | null>(null)
    const change = (value: { [key: string]: any } | { [key: string]: { [key: string]: any } }) => {
        setFields(prev => ({...prev, ...value}))
    }

    const create = useMutation({
        mutationKey: ['edit-trainee'],
        mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            return await createTrainee(fields)
        },
        onSuccess: (result) => {
            notifications.show(showSuccess(result.message));
            // clear form
            setFields(defaultTraineeObject)
        },
        onError: error => {
            notifications.show(showErr(error))
            if (error instanceof FormError)
                error.validationErrors.forEach(err => setErrors(prev => ({...prev, [err.property]: err.message})))
        }
    })
    const [openDeleteForm, setOpenDeleteForm] = useState(false)

    const deleteNextOfKin = async (index: number) => {
        let nokList = [...fields.nextOfKins];
        // const nok = nokList[index];
        nokList = nokList.filter((_a, i) => i != index)
        setFields(prev => ({...prev, nextOfKins: nokList}))
    }

    return (
        <form ref={formRef} onSubmit={create.mutate} className={'py-5 grid gap-4'}>
            {trainee &&
                <DeleteTraineeApplicantForm
                    traineeId={trainee?.id ?? ""}
                    open={openDeleteForm}
                    setOpen={val => setOpenDeleteForm(val)}
                />}
            <div className={"flex gap-2 flex-wrap"}>
                {trainee &&
                    <div className={"w-[150px] h-[150px] "}>
                        <Image
                            src={getItem(trainee.documents?.find(doc => doc.documentKey === 'passportPhoto')?.url ?? "ui/missing_image.svg")}
                            className={'w-full h-full rounded-lg'}
                        />
                    </div>}
                <Fieldset className={'flex-1 grid md:grid-cols-4 gap-2'} legend={<Title order={5}>Personal</Title>}>
                    <TextInput
                        required
                        value={fields.firstName}
                        onChange={({target: {value}}) => change({firstName: value})}
                        name={'firstName'} label={"First Name"} placeholder={'First Name'}
                        error={errors['firstName']}
                    />
                    <TextInput
                        value={fields.middleName}
                        onChange={({target: {value}}) => change({middleName: value})}
                        name={'middleName'} label={"Middle Name"} placeholder={'Middle Name'}/>
                    <TextInput
                        required
                        value={fields.lastName}
                        onChange={({target: {value}}) => change({lastName: value})}
                        name={'lastName'} label={"Last Name"} placeholder={'Surname'}/>
                    <TextInput
                        required
                        value={fields.email}
                        name={'email'}
                        onChange={({target: {value}}) => change({email: value})}
                        label={"Email"} placeholder={'Email'}
                    />
                    <TextInput
                        required
                        value={fields.phone}
                        onChange={({target: {value}}) => change({phone: value})}
                        name={'phone'} label={"Phone"}
                        type={'tel'}
                        onBlur={() => {
                            if (fields.phone && !isValidPhoneFormat(fields.phone)) return setErrors(prev => ({
                                ...prev,
                                phone: "Invalid phone number. Start with country code like +254"
                            }))
                            setErrors(prev => ({...prev, phone: ""}))
                        }}
                        error={errors['phone'] ? "Invalid phone number. Start with country code like +254" : ""}
                        placeholder={'+2540000000'}
                    />
                    <TextInput
                        placeholder={'Birth certificate number'}
                        label={'Birth certificate number'}
                        value={fields.birthCertNumber || ""}
                        onChange={({target: {value}}) => change({birthCertNumber: value})}
                    />
                    {/*<Select*/}
                    {/*    required*/}
                    {/*    label={'ID type'}*/}
                    {/*    name={'idType'}*/}
                    {/*    value={fields.idType}*/}
                    {/*    onChange={(value) => change({idType: value})}*/}
                    {/*    data={[*/}
                    {/*        {label: "National ID", value: IdTypeEnum.NATIONAL_ID},*/}
                    {/*        {label: "Birth certificate", value: IdTypeEnum.BIRTH_CERTIFICATE}*/}
                    {/*    ]}*/}
                    {/*    placeholder={'ID type'}*/}
                    {/*/>*/}
                    <TextInput
                        required
                        name={'idNumber'}
                        value={fields.idNumber}
                        onChange={({target: {value}}) => change({idNumber: value})}
                        label={"ID/Birth cert Number"}
                        placeholder={'ID Birth cert number'}
                    />
                    <Select
                        required
                        name={'gender'}
                        value={fields.gender}
                        onChange={value => change({gender: value})}
                        placeholder={"Gender"}
                        label={'Gender'}
                        data={[
                            {label: "Male", value: GenderEnum.MALE},
                            {label: "Female", value: GenderEnum.FEMALE},
                        ]}
                    />
                    <DatePickerInput
                        required
                        label={'Date of Birth'}
                        placeholder={'Date of Birth'}
                        name={"birthday"}
                        value={fields.birthday}
                        onChange={value => change({birthday: value})}
                        maxDate={dayjs(dayjs().subtract(18, 'year')).toString()}
                    />
                    <TextInput
                        label={'Pin number'}
                        placeholder={'Pin number'}
                        name={'pinNumber'}
                        value={fields.pinNumber}
                        onChange={({target: {value}}) => change({pinNumber: value})}
                    />
                    <TextInput
                        label={'NEMIS Code'}
                        placeholder={'NEMIS Code'}
                        name={'nemisCode'}
                        value={fields.nemisCode ?? ""}
                        onChange={({target: {value}}) => change({nemisCode: value})}
                    />
                </Fieldset>
            </div>
            <Fieldset className={'grid md:grid-cols-4 gap-2'} legend={<Title order={5}>Address</Title>}>
                <TextInput
                    value={fields.address.county ?? ""}
                    onChange={({target: {value}}) => change({address: {...fields.address, county: value}})}
                    name={'county'} label={'County'} placeholder={'County'}
                />
                <TextInput
                    value={fields.address.location ?? ""}
                    onChange={({target: {value}}) => change({address: {...fields.address, location: value}})}
                    name={'location'} label={'Location'} placeholder={'Location'}/>
                <TextInput
                    value={fields.address.subLocation ?? ""}
                    onChange={({target: {value}}) => change({address: {...fields.address, subLocation: value}})}
                    name={'subLocation'} label={'Sub-location'} placeholder={'Sub-location'}
                />
                <TextInput
                    value={fields.address.village ?? ""}
                    onChange={({target: {value}}) => change({address: {...fields.address, village: value}})}
                    name={'village'} label={'Village'} placeholder={'Village'}
                />
            </Fieldset>
            <Fieldset className={'grid gap-2'} legend={<Title order={5}>Next of Kin</Title>}>
                {fields.nextOfKins.map((nok, i) => {
                        return <div className={"flex flex-wrap justify-between gap-2"} key={i}>
                            <TextInput
                                className={'flex-1 min-w-[200px]'}
                                value={nok.firstName}
                                onChange={({target: {value}}) => {
                                    const noks = [...fields.nextOfKins];
                                    if (noks[i])
                                        noks[i]['firstName'] = value
                                    change({nextOfKins: noks})
                                }}
                                name={'firstName'} label={"First Name"} placeholder={'First Name'}/>
                            <TextInput
                                className={'flex-1 min-w-[200px]'}
                                value={nok.lastName}
                                onChange={({target: {value}}) => {
                                    const noks = [...fields.nextOfKins];
                                    if (noks[i]) noks[i]['lastName'] = value
                                    change({nextOfKins: noks})
                                }}
                                name={'lastName'} label={"Last Name"} placeholder={'Last Name'}/>
                            <TextInput
                                className={'flex-1 min-w-[200px]'}
                                value={nok.phone}
                                onChange={({target: {value}}) => {
                                    const noks = [...fields.nextOfKins];
                                    if (noks[i]) noks[i]['phone'] = value
                                    change({nextOfKins: noks})
                                    if (errors['nextOfKin.phone']) setErrors(prev => ({
                                        ...prev, 'nextOfKin.phone': ""
                                    }))
                                }}
                                name={'phone'} label={"Phone"} placeholder={'+2540000000'}
                                error={errors['nextOfKin.phone'] ? "Invalid phone number. Start with country code like +254" : ""}
                                onBlur={() => {
                                    if (nok.phone && !isValidPhoneFormat(fields.nextOfKins[i]?.phone)) return setErrors(prev => ({
                                        ...prev,
                                        'nextOfKin.phone': "Invalid phone number. Start with country code like +254"
                                    }))
                                    setErrors(prev => ({...prev, 'nextOfKin.phone': ""}))
                                }}
                            />
                            <TextInput
                                className={'flex-1 min-w-[200px]'}
                                value={nok.relationship}
                                onChange={({target: {value}}) => {
                                    const noks = [...fields.nextOfKins];
                                    if (noks[i]) noks[i]['relationship'] = value
                                    change({nextOfKins: noks})
                                }}
                                name={'relationship'} label={"Relationship"} placeholder={'Relationship'}
                            />
                            <Button className={'mt-auto'} onClick={async () => await deleteNextOfKin(i)} color={'accent'}>
                                Delete
                            </Button>
                        </div>
                    }
                )}
                <Button
                    hidden={fields.nextOfKins.length >= 2}
                    onClick={() => {
                        if (fields.nextOfKins.length < 2) {
                            setFields(prev => ({...prev, nextOfKins: [...prev.nextOfKins, defaultNextOfKin]}))
                        }
                    }}
                    leftSection={<BsPersonAdd/>} className={'w-max'}>
                    Add next of kin
                </Button>
            </Fieldset>
            <Fieldset className={'grid md:grid-cols-4 gap-2'} legend={<Title order={5}>Academic history</Title>}>
                <Select
                    required
                    label={"Basic education level"}
                    placeholder={"Highest level of basic education"}
                    value={fields.academicHistory.highestEducationLevel}
                    onChange={val => change({academicHistory: {...fields.academicHistory, highestEducationLevel: val}})}
                    data={[
                        {label: "Primary School", value: BasicEducationEnum.PRIMARY_SCHOOL},
                        {label: "High School", value: BasicEducationEnum.HIGH_SCHOOL},
                        {label: "Tertiary", value: BasicEducationEnum.TERTIARY},
                    ]}
                    name={'highestEducationLevel'}
                    error={errors['highestEducationLevel']}
                />
                <TextInput
                    required
                    value={fields.academicHistory.primarySchool ?? ""}
                    onChange={({target: {value}}) => change({
                        academicHistory: {
                            ...fields.academicHistory,
                            primarySchool: value
                        }
                    })}
                    name={'primarySchool'} label={"Primary school"} placeholder={'Primary school'}
                />
                <TextInput
                    required
                    label={"KCPE Index number"}
                    placeholder={"KCPE Index number"}
                    value={fields.academicHistory.kcpeIndexNumber}
                    onChange={({target: {value}}) => change({
                        academicHistory: {
                            ...fields.academicHistory,
                            kcpeIndexNumber: value
                        }
                    })}
                />

                {fields.academicHistory.highestEducationLevel !== BasicEducationEnum.PRIMARY_SCHOOL &&
                    <>
                        <TextInput
                            required
                            value={fields.academicHistory.highSchool ?? ""}
                            onChange={({target: {value}}) => change({
                                academicHistory: {
                                    ...fields.academicHistory,
                                    highSchool: value
                                }
                            })}
                            name={'highSchool'} label={"High school"} placeholder={'High school'}/>
                        <TextInput
                            required
                            value={fields.academicHistory.kcseIndexNumber ?? ""}
                            onChange={({target: {value}}) => change({
                                academicHistory: {
                                    ...fields.academicHistory,
                                    kcseIndexNumber: value
                                }
                            })}
                            name={'kcseIndexNumber'} label={"KCSE Index number"}
                            placeholder={'KCSE Index number/year'}/>
                        <Select
                            required
                            label={'KCSE Grade'}
                            name={'kcseGrade'}
                            value={fields.academicHistory.kcseGrade ?? null}
                            onChange={val => change({academicHistory: {...fields.academicHistory, kcseGrade: val}})}
                            data={Object.values(GradeEnum)}
                            placeholder={'KCSE Grade'}
                        />
                        {fields.academicHistory.highestEducationLevel === BasicEducationEnum.TERTIARY &&
                            <>
                                <Select
                                    required
                                    label={'Tertiary certificate'}
                                    value={fields.academicHistory.tertiaryLevel}
                                    onChange={val => setFields(prev => ({
                                        ...prev,
                                        academicHistory: {...prev.academicHistory, tertiaryLevel: val as TertiaryLevel}
                                    }))}
                                    data={[{label: "Certificate", value: TertiaryLevel.CERTIFICATE}, {
                                        label: "Diploma",
                                        value: TertiaryLevel.DIPLOMA
                                    }, {label: "Degree", value: TertiaryLevel.DEGREE}]}
                                />
                                <TextInput
                                    required
                                    label={"Tertiary school"}
                                    placeholder={"Tertiary school"}
                                    className={'tertiarySchool'} onChange={(e) => change({
                                    ...fields.academicHistory,
                                    tertiarySchool: e.target.value
                                })}/>
                            </>
                        }
                    </>}
            </Fieldset>
            <Fieldset className={'grid'} legend={<Title order={5}>Enrollment</Title>}>
                {fields.enrollments?.map((enrollment, i) => (
                    <div className={"flex gap-2 flex-wrap"} key={i}>
                        <Select
                            required
                            value={enrollment.intake?.toString()}
                            onChange={value => {
                                const enroll = {...enrollment, intake: value}
                                const enrollments = [...fields.enrollments ?? []];
                                enrollments[i] = enroll
                                setFields(prev => ({...prev, enrollments}))
                            }}
                            nothingFoundMessage={"We couldn't find such an intake"}
                            data={[...intakes.values()].map(int => ({label: int.readable, value: int.periodYearKey}))}
                            className={'flex-1 min-w-max'} name={'intake'} placeholder={'Intake'} label={"Intake"}
                            searchable/>
                        <Select
                            value={enrollment.course?.toString()}
                            data={[...courses().values()].map(course => ({
                                label: `${course.name} (Level ${course.level})`,
                                value: course.id.toString()
                            }))}
                            onChange={value => {
                                const enroll = {...enrollment, course: value !== null ? Number(value) : value}
                                const enrollments = [...fields.enrollments ?? []];
                                enrollments[i] = enroll
                                setFields(prev => ({...prev, enrollments}))
                            }}
                            className={'flex-1 min-w-max'} name={'course'} placeholder={'Course'} label={"Course"}
                            searchable
                        />
                        <Select
                            value={enrollment.studentType}
                            onChange={value => {
                                const enroll = {...enrollment, studentType: value as TraineeTypeEnum | null}
                                const enrollments = [...fields.enrollments ?? []];
                                enrollments[i] = enroll
                                setFields(prev => ({...prev, enrollments}))
                            }}
                            data={Object.keys(TraineeTypeEnum).map((key) => ({
                                label: makeLabel(key),
                                value: TraineeTypeEnum[key as keyof typeof TraineeTypeEnum]
                            }))}
                            className={'flex-1 min-w-max'} name={'studentType'} placeholder={'Trainee type'}
                            label={"Trainee type"}
                        />
                    </div>
                ))}
            </Fieldset>
            <div className={'py-2 flex gap-2'}>
                <Button type={'submit'}>Submit</Button>
                <Link to={".."}>
                    <Button leftSection={<RxCross1/>} variant={'subtle'}>Cancel</Button>
                </Link>
                <Button
                    hidden={!trainee}
                    onClick={() => setOpenDeleteForm(true)}
                    leftSection={<IoMdTrash/>} variant={'light'} color={'accent'}
                >
                    Delete
                </Button>
            </div>
        </form>
    )
}

