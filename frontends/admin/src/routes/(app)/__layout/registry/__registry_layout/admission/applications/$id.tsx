import {useEffect, useMemo, useRef, useState} from 'react';
import {
    ActionIcon,
    Avatar,
    Badge,
    Button,
    Fieldset,
    NumberInput,
    Select,
    Tabs,
    Text,
    TextInput,
    Title
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {notifications} from '@mantine/notifications';
import {DatePickerInput} from "@mantine/dates";
import {useMutation, useQuery} from '@tanstack/react-query';
import {createFileRoute, redirect} from '@tanstack/react-router';
import {useStore} from 'zustand';
import {MdCheck, MdCheckCircle} from 'react-icons/md';

// Types & Services
import {
    type AdmissionErrorObj,
    type ApplicantDocuments,
    BasicEducationEnum,
    GenderEnum,
    GradeEnum,
    IdTypeEnum,
    TertiaryLevel,
    TraineeTypeEnum,
    type UpdateApplicationObj
} from "@/libs/types/admission.types.ts";
import {getCourseYearsOfStudies} from '@/libs/utils.ts';
import {showErr, showSuccess} from "@/utils/notification.util.tsx"
import FilesService from "@/services/Files.service.ts";
import useAdmissionStore from '@/stores/useAdmissionStore';
import useAcademicStore from "@/stores/useAcademicStore.ts";
import {useCacheStore} from "@/stores/useCacheStore.ts";

// Layouts & Components
import TabbedPageLayout from "@/components/layouts/TabbedPage.layout.tsx";
import EditApplicantTableLayout from "@/components/layouts/EditApplicantTable.layout.tsx";
import ViewAndResolveErrors from "@/components/pages/applicants/ViewAndResolveErrors.tsx";
import ListSelectDataDocument from '@/components/components/ListSelectApplicantDocument';
import api from "@/libs/api.ts";
import {ExamBody} from "@/libs/types/app.types.ts";
import dayjs from "dayjs";
import {defaultNextOfKin} from "@/libs/static.values.ts";
import {BsTrash} from "react-icons/bs";
import {FaDownload} from "react-icons/fa6";
import downloadAdmissionLetter from "@/utils/downloadAdmissionLetter.ts";
import {CgSpinner} from "react-icons/cg";

export type FormSteps = 'profile' | 'address' | 'next-of-kin' | 'ac-history' | 'enrollment' | 'docs';

export const Route = createFileRoute(
    '/(app)/__layout/registry/__registry_layout/admission/applications/$id',
)({
    component: RouteComponent,
    validateSearch: ({page}) => ({page: Number(page)}),
    beforeLoad: ({search: {page}, params: {id}}) => {
        const pageIsNotNumber = Number.isNaN(page)
        if (!id) throw redirect({
            to: "/registry/admission/applications",
            search: {page: pageIsNotNumber ? 1 : page}
        })
        if (pageIsNotNumber) throw redirect({
            to: "/registry/admission/applications/$id",
            search: {page: 1},
            params: {id: id}
        })
    }
});

function RouteComponent() {
    // const {id, page} = Route.useParams();
    const pageLoad = useRef(0)
    const {id} = Route.useParams();
    const {page} = Route.useSearch()
    const {fetchApplicantById, applications, approveApplications, intakes} = useStore(useAdmissionStore);
    const {getCourses} = useStore(useAcademicStore);
    const {getItem, setItem} = useCacheStore();

    const [activeDocument, setActiveDocument] = useState<string | null>(null);

    const userInStore = useMemo(() => {
        return applications.get(id)?.data;
    }, [applications, id])

    // 1. Data Fetching
    const {data, isFetching, refetch} = useQuery({
        queryKey: ['fetch-applicant', id],
        initialData: userInStore,
        // placeholderData: userInStore,//getFromPageMapById(applications, id),
        queryFn: async () => {
            return await fetchApplicantById(id, Number(page))
        },
        enabled: !userInStore || pageLoad.current > 1,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        // set initial load account
        pageLoad.current++
    }, [])

    console.log('data', data)

    // 2. Form Initialization
    const form = useForm<UpdateApplicationObj>({
        initialValues: data,
        onValuesChange: (newVal) => {
            if (newVal.enrollments?.newApplicant !== null) {
                Object.assign(newVal, {
                    enrollments: {
                        ...(newVal.enrollments || {}),
                        newApplicant: (newVal?.enrollments?.newApplicant as unknown) === 'true'
                    }
                });
            }
        }
    });

    // 3. Mutation Logic (Must stay above early returns)
    const approve = useMutation({
        mutationKey: ['approve-applicant'],
        mutationFn: () => approveApplications([id], Number(page)),
        onSuccess: (res) => {
            notifications.show(showSuccess(res.message));
            refetch().catch();
        },
        onError: err => notifications.show(showErr(err))
    });

    const letter = useMutation({
        mutationFn: async () => {
            const intakeData = data?.enrollments?.intake
            const intake = typeof intakeData === 'object' ? intakeData?.periodYearKey : intakeData
            await downloadAdmissionLetter(intake!, data?.id!)
            // const response = await api.trainees.get(`/admission/admission-letter/download/${data?.enrollments?.intake}/${data?.id}`, {responseType: 'blob'})
            // downloadBlob(response.data, 'admission-letter.pdf')
        },
        mutationKey: ['admission-letter'],
        onSuccess: () => {
            // alert success
            notifications.show(showSuccess("Admission letter downloaded"))
        },
        onError: error => notifications.show(showErr(error))
    })

    const patch = useMutation({
        mutationKey: ['patch-applicant'],
        mutationFn: async (step: FormSteps) => {
            const values = form.getValues();
            const body = step === 'profile' ? values
                : step === 'address' ? values.address
                    : step === 'ac-history' ? values.academicHistory
                        : step === 'enrollment' ? values.enrollments
                            : step === 'docs' ? values.documents :
                                values.nextOfKins;

            return await api.admission.post(`/admission/admin-patch-applicant/${step}/${data?.id}`, body)
        },
        onSuccess: (res) => {
            notifications.show(showSuccess(res.data.message))
            refetch().catch();
        },
        onError: err => notifications.show(showErr(err))
    });

    // 4. Effects
    useEffect(() => {
        if (data) {
            form.setValues(data);
            // always ensure at least one next of kin
            if ((form.getValues().nextOfKins?.length || 0) < 1) {
                // add a default
                form.setFieldValue('nextOfKins', [defaultNextOfKin]);
            }
            form.resetDirty();
        }
    }, [data]);

    useEffect(() => {
        const fetchDocs = async () => {
            if (data?.documents) {
                for (const [_key, filename] of Object.entries(data.documents)) {
                    if (typeof filename === 'string' && !getItem(filename)) {
                        const url = await FilesService.getUrl(filename);
                        setItem(filename, url);
                    }
                }
            }
        };
        fetchDocs().catch();
    }, [data?.documents]);

    // 1. Memoize the formatted errors for Mantine
    const formattedErrors = useMemo(() => {
        if (!data?.admissionErrors?.errors) return {};

        const errorMap: Record<string, string> = {};
        data.admissionErrors.errors.forEach((err: AdmissionErrorObj) => {
            // Handle nested paths from class-validator (e.g., address.city)
            // class-validator typically provides the property name directly
            errorMap[err.property] = err.message;
        });
        return errorMap;
    }, [data?.admissionErrors?.errors]);

    // 2. Sync errors to the form when they change
    useEffect(() => {
        if (Object.keys(formattedErrors).length > 0) {
            form.setErrors(formattedErrors);
        }
    }, [formattedErrors]);

    const thisApplicantDocs: { key: string, file: string | null }[] = useMemo(() => {
        const docData = (data?.documents || {}) as ApplicantDocuments
        const results = []
        for (const key in docData) {
            const val = docData[key as keyof ApplicantDocuments]
            if (val === null || typeof val === "string") results.push({key, file: val})
        }
        return results
    }, [data?.documents])

    // 5. Early Returns (Now safe after hooks)
    // if (isFetching) return <EmptyOrLoadingList loading={isFetching} message={"Applicant not found!"}/>;

    if (!id || !data) return <div className="flex h-full items-center justify-center"><Text>Choose an application to
        view</Text>
    </div>;

    const errorList = data.admissionErrors?.errors || [];
    const tabs = [
        {label: "Details", path: 'applicant'},
        {label: `Errors ${errorList.length > 0 ? `(${errorList.length})` : ""}`, path: 'errors'}
    ];

    const deleteNextOfKin = async (index: number) => {
        const noks = form.getValues()?.nextOfKins
        if (!noks) return
        const target = noks[index]
        if (!target) return
        if (target.id) // exists in db
            await api.admission.delete(`/applicants/next-of-kin/${target.id}`)
                .then(() => {
                    form.removeListItem('nextOfKins', index)
                })
                .catch(err => notifications.show(showErr(err)))
        else form.removeListItem('nextOfKins', index)
    }

    return (
        <TabbedPageLayout tabs={tabs}>
            {/*{isFetching && <Overlay/>}*/}
            <div hidden={!isFetching}
                 className={"w-full h-[7px] left-0 animate-top-spinner rounded-full top-0 z-40 bg-accent-500 fixed"}/>
            <div
                hidden={!isFetching}
                className={"w-full h-[calc(100vh-70px)] flex top-[70px] max-w-[calc(100vw-250px)] bg-black/20 animate-pulse fixed z-[1]"}>
                <CgSpinner size={'32px'} color={'primary'}
                           className={'m-auto animate-spin [animation-duration:0.3s] left-0'}/>
            </div>
            <Tabs.Panel value='applicant' className='w-[98%] m-auto grid gap-2'>
                <div
                    className={'grid gap-2 p-3 bg-gradient-to-r from-primary-800 via-primary-700 to-primary-500 20% text-white mt-2 py-5 rounded-lg'}>
                    <Title order={3}>Quick status</Title>
                    <div className={'flex flex-wrap font-bold place-items-center gap-5'}>
                        <Avatar
                            color={'white'}
                            alt={'Applicant passport photo'}
                            name={data.firstName + " " + data.lastName}
                            className={'w-25 h-25 rounded-full'}
                            src={getItem(data.documents?.passportPhoto || "fallback")}
                        />
                        <div className={"flex-1 flex flex-wrap gap-2"}>
                            <span className={"flex bg-black/10 rounded-full p-1 px-4 gap-2 place-items-center"}>
                                <Text className={'font-bold'}>Completion: {data.completionStatus}%</Text>
                            </span>
                            <span className={'flex bg-black/10 rounded-full p-1 px-4 gap-2 place-items-center'}>
                                Submission: {data.submitted ?
                                <MdCheckCircle size={'18'} className={'text-accent-300'}/> :
                                <Badge color={'orange.2'} c={'black'} size={'xs'}>Waiting</Badge>}
                            </span>
                            <span className={'flex bg-black/10 rounded-full p-1 px-4 gap-2 place-items-center'}>
                                Approval: {data.pending ? <MdCheckCircle size={'18'} className={'text-primary-300'}/> :
                                <Badge color={'orange.2'} c={'black'} size={'xs'}>Waiting</Badge>}
                            </span>
                            <span className={'flex bg-black/10 rounded-full p-1 px-4 gap-2 place-items-center'}>
                                Student status: {data.migrated ?
                                <MdCheckCircle size={'18'} className={'text-secondary-300'}/> :
                                <Badge color={'orange.2'} c={'black'} size={'xs'}>Waiting</Badge>}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Profile (A) */}
                <EditApplicantTableLayout updateFn={patch} step={'profile'} legend="Profile (A)"
                                          titles={["First name", "Middle name", "Last name", "Email", "Phone"]}>
                    <TextInput placeholder="e.g. John" variant="unstyled" {...form.getInputProps('firstName')} />
                    <TextInput placeholder="e.g. Kiprono" variant="unstyled" {...form.getInputProps('middleName')} />
                    <TextInput placeholder="e.g. Doe" variant="unstyled" {...form.getInputProps('lastName')} />
                    <TextInput placeholder="john.doe@example.com" variant="unstyled" {...form.getInputProps('email')} />
                    <TextInput placeholder="+254 700 000 000" variant="unstyled" {...form.getInputProps('phone')} />
                </EditApplicantTableLayout>

                {/* Profile (B) */}
                <EditApplicantTableLayout
                    updateFn={patch}
                    step={'profile'}
                    legend="Profile (B)"
                    titles={["Id type", "Birth Cert No", "Id number", "Date of birth", "Gender"]}
                >
                    <Select
                        placeholder="Select ID Type" variant="unstyled"
                        data={[
                            {label: "Birth certificate", value: IdTypeEnum.BIRTH_CERTIFICATE},
                            {label: "National ID", value: IdTypeEnum.NATIONAL_ID}
                        ]}
                        {...form.getInputProps('idType')}
                    />
                    <TextInput
                        placeholder="Birth Cert Number"
                        variant="unstyled" {...form.getInputProps('birthCertNumber')}
                    />
                    {/* If the ID type is set to nationalId show ID number else show nationalId field */}
                    {form.getValues().idType === 'nationalId' && form.getValues().idNumber
                        ? <TextInput
                            placeholder="ID Number"
                            variant="unstyled" {...form.getInputProps('idNumber')}
                        />
                        : <TextInput
                            placeholder={""}
                            variant={'unstyled'} {...form.getInputProps('nationalId')}
                        />
                    }
                    <DatePickerInput placeholder="Pick date" variant="unstyled"
                                     maxDate={dayjs().toDate()} {...form.getInputProps('dateOfBirth')} />
                    <Select placeholder="Select Gender" variant="unstyled"
                            data={[{label: "Male", value: GenderEnum.MALE}, {
                                label: "Female",
                                value: GenderEnum.FEMALE
                            }]} {...form.getInputProps('gender')} />
                </EditApplicantTableLayout>

                {/* Address */}
                <EditApplicantTableLayout updateFn={patch} step={'address'} legend="Address"
                                          titles={["County", "Location", "Sub location", "Village", "ZIP code", "PO Box"]}>
                    <TextInput placeholder="e.g. Nairobi"
                               variant="unstyled" {...form.getInputProps('address.county')} />
                    <TextInput placeholder="e.g. Westlands"
                               variant="unstyled" {...form.getInputProps('address.location')} />
                    <TextInput placeholder="e.g. Parklands"
                               variant="unstyled" {...form.getInputProps('address.subLocation')} />
                    <TextInput placeholder="e.g. Village Market"
                               variant="unstyled" {...form.getInputProps('address.village')} />
                    <NumberInput placeholder="00100" variant="unstyled" {...form.getInputProps('address.zipCode')} />
                    <NumberInput placeholder="12345" variant="unstyled" {...form.getInputProps('address.poBox')} />
                </EditApplicantTableLayout>

                {/* Next of Kin */}
                <div className={"grid gap-2"}>
                    {(form.values.nextOfKins || [{}]).map((_, i) => (
                        <EditApplicantTableLayout
                            key={`nok-${i}`} updateFn={patch} step={'next-of-kin'}
                            legend={`Next of Kin (${i + 1})`}
                            titles={["First name", "Last name", "Phone", "Email", "Relationship", ((form.getValues().nextOfKins?.length || 0) > 1) ? "Delete" : ""]}
                        >
                            <TextInput placeholder="First Name"
                                       variant="unstyled" {...form.getInputProps(`nextOfKins.${i}.firstName`)} />
                            <TextInput placeholder="Last Name"
                                       variant="unstyled" {...form.getInputProps(`nextOfKins.${i}.lastName`)} />
                            <TextInput placeholder="+254 ..."
                                       variant="unstyled" {...form.getInputProps(`nextOfKins.${i}.phone`)} />
                            <TextInput placeholder="kin@email.com"
                                       variant="unstyled" {...form.getInputProps(`nextOfKins.${i}.email`)} />
                            <TextInput placeholder="e.g. Parent"
                                       variant="unstyled" {...form.getInputProps(`nextOfKins.${i}.relationship`)} />
                            {((form.getValues().nextOfKins?.length || 0) > 1) &&
                                <ActionIcon
                                    aos-animate={'fade-up'}
                                    onClick={async () => await deleteNextOfKin(i)}
                                    variant={'light'}
                                    color={'red.9'}>
                                    <BsTrash/>
                                </ActionIcon>}
                        </EditApplicantTableLayout>
                    ))}
                    {(form.getValues()?.nextOfKins?.length || 0) < 2 &&
                        <Button className={"w-max"} onClick={() => form.insertListItem('nextOfKins', defaultNextOfKin)}>Add
                            next of
                            kin</Button>}
                </div>

                {/* Academic History (A) */}
                <EditApplicantTableLayout updateFn={patch} step={'ac-history'} legend="Academic History (A)"
                                          titles={['Highest education level', 'Primary school', 'KCPE Index number/Year', 'High school']}>
                    <Select placeholder="Select level" variant="unstyled"
                            data={[BasicEducationEnum.PRIMARY_SCHOOL, BasicEducationEnum.HIGH_SCHOOL, BasicEducationEnum.TERTIARY]} {...form.getInputProps('academicHistory.highestEducationLevel')} />
                    <TextInput placeholder="Name of primary school"
                               variant="unstyled" {...form.getInputProps('academicHistory.primarySchool')} />
                    <TextInput placeholder="12345678/2020"
                               variant="unstyled" {...form.getInputProps('academicHistory.kcpeIndexNumber')} />
                    <TextInput placeholder="Name of high school"
                               variant="unstyled" {...form.getInputProps('academicHistory.highSchool')} />
                </EditApplicantTableLayout>

                {/* Academic History (B) */}
                <EditApplicantTableLayout updateFn={patch} step={'ac-history'} legend="Academic History (B)"
                                          titles={['KCSE Index number', 'KCSE Grade', 'Tertiary institution', 'Tertiary certificate']}>
                    <TextInput placeholder="123456789/2024"
                               variant="unstyled" {...form.getInputProps('academicHistory.kcseIndexNumber')} />
                    <Select placeholder="Grade" variant="unstyled"
                            data={Object.values(GradeEnum)} {...form.getInputProps('academicHistory.kcseGrade')} />
                    <TextInput placeholder="Name of college/uni"
                               variant="unstyled" {...form.getInputProps('academicHistory.tertiarySchool')} />
                    <Select
                        placeholder="Select level" variant="unstyled"
                        data={[
                            {label: "Certificate", value: TertiaryLevel.CERTIFICATE},
                            {label: "Diploma", value: TertiaryLevel.DIPLOMA},
                            {label: "Bachelor's degree", value: TertiaryLevel.DEGREE}
                        ]}
                        {...form.getInputProps('academicHistory.tertiaryLevel')} />
                </EditApplicantTableLayout>

                {/* Enrollment (A) */}
                <EditApplicantTableLayout
                    updateFn={patch}
                    step={'enrollment'}
                    legend="Enrollment (A)"
                    titles={['Is a new applicant', 'Intake', 'Course', 'Admission number']}
                >
                    <Select
                        placeholder="Applicant Type" variant="unstyled"
                        data={[{label: "New applicant", value: "true"}, {label: "Continuing", value: "false"}]}
                        key={form.key('enrollments.newApplicant')}
                        {...form.getInputProps('enrollments.newApplicant')}
                        value={form.getValues().enrollments?.newApplicant ? 'true' : 'false'}
                    />
                    <Select
                        placeholder="Select intake" variant="unstyled" data={[...intakes.values()].map(int => ({
                        label: int.readable,
                        value: int.periodYearKey
                    }))} {...form.getInputProps('enrollments.intake')} />
                    <Select placeholder="Select course" variant="unstyled" data={[...getCourses().values()].map(c => ({
                        label: `${c.name} (L-${c.level})`,
                        value: c.id.toString()
                    }))} {...form.getInputProps('enrollments.course')} />
                    <TextInput
                        placeholder="e.g. 2024/0001"
                        variant="unstyled"
                        {...form.getInputProps('enrollments.admissionNumber')}
                    />
                </EditApplicantTableLayout>

                {/* Enrollment (B) */}
                <EditApplicantTableLayout
                    updateFn={patch} step={'enrollment'} legend="Enrollment (B)"
                    titles={['Year of study', 'Sponsor', 'Examining body']}>
                    <Select
                        placeholder="Select year" variant="unstyled"
                        {...form.getInputProps('enrollments.yearOfStudy')}
                        value={form.values.enrollments?.yearOfStudy?.toString()}
                        data={getCourseYearsOfStudies(getCourses().get(form.values.enrollments?.course || 0)?.duration || 0)
                            .map(year => ({
                                label: `Year ${year}`,
                                value: year.toString()
                            }))}
                    />
                    <Select
                        placeholder="Select sponsor" variant="unstyled"
                        data={Object.values(TraineeTypeEnum)}
                        {...form.getInputProps('enrollments.studentType')} />
                    <Select
                        placeholder="Select body" variant="unstyled"
                        data={Object.values(ExamBody)}
                        {...form.getInputProps('enrollments.examiningBody')} />
                </EditApplicantTableLayout>

                {/* Documents Viewer */}
                <Fieldset legend="Documents" className='flex flex-wrap gap-5'>
                    <div className='min-w-[300px] flex lg:flex-col h-max gap-2'>
                        {thisApplicantDocs.map(val => {
                            return <ListSelectDataDocument
                                key={val.key}
                                title={val.key}
                                file={val.file}
                                active={activeDocument === val.file}
                                select={setActiveDocument}
                            />
                        })}
                    </div>
                    <div className="flex-1 min-w-[300px]">
                        <Title order={3}>File Viewer</Title>
                        <div className="flex aspect-video items-center border rounded">
                            {thisApplicantDocs.map((doc, i) => (
                                doc.file?.includes('.pdf')
                                    ? <embed
                                        key={i} hidden={doc.file !== activeDocument || !activeDocument}
                                        src={getItem(doc.file!) || ""}
                                        className={'w-full h-full'}
                                    /> :
                                    // : <>dsfjsklj</>
                                    <img
                                        key={i} hidden={doc.file !== activeDocument || !activeDocument}
                                        src={getItem(doc.file!) || ""}
                                        className={'w-full h-full object-contain'}
                                        alt={doc.key}
                                    />
                            ))}
                            {/*{activeDocument*/}
                            {/*    ? <embed src={getItem(activeDocument) || ""} className='w-full h-full'/>*/}
                            {/*    : <Text className='m-auto'>Select document to view</Text>}*/}
                        </div>
                    </div>
                </Fieldset>

                {/* Action Bar */}
                <div className='sticky bottom-0 z-10 bg-white p-4 shadow-md flex gap-2'>
                    <Button
                        onClick={() => approve.mutate()}
                        disabled={approve.isPending || !data.submitted || data.pending} loading={approve.isPending}
                        leftSection={<MdCheck/>}
                    >
                        {data.pending ? "Approved" : "Approve application"}
                    </Button>
                    <Button
                        onClick={() => letter.mutate()}
                        disabled={letter.isPending || !data.submitted || !data.pending || !data.migrated}
                        loading={letter.isPending}
                        leftSection={<FaDownload/>}
                    >
                        Download admission letter
                    </Button>
                    {form.isDirty() &&
                        <Button variant="outline" color="orange" onClick={() => form.reset()}>Reset Changes</Button>}
                </div>
            </Tabs.Panel>

            <Tabs.Panel value='errors'>
                {data.admissionErrors ?
                    <ViewAndResolveErrors refetch={refetch} errorList={data.admissionErrors} applicantId={data.id}/> :
                    <div className="bg-white p-5 text-center"><Text>All good here!</Text></div>}
            </Tabs.Panel>
        </TabbedPageLayout>
    );
}
